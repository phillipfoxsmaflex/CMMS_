package com.grash.service;

import com.grash.dto.GrafanaAlert;
import com.grash.dto.GrafanaWebhookRequest;
import com.grash.dto.GrafanaWebhookResponse;
import com.grash.exception.CustomException;
import com.grash.model.Company;
import com.grash.model.WebhookConfig;
import com.grash.model.Workflow;
import com.grash.model.OwnUser;
import com.grash.model.enums.RoleType;
import com.grash.model.enums.workflow.WFMainCondition;
import com.grash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GrafanaWebhookService {
    
    private final WebhookConfigService webhookConfigService;
    private final WorkflowService workflowService;
    private final EmailService2 emailService;
    private final RateLimiterService rateLimiterService;
    private final UserRepository userRepository;
    
    public GrafanaWebhookResponse processWebhook(String apiKey, GrafanaWebhookRequest request) {
        // Validate API key
        if (apiKey == null || apiKey.isEmpty()) {
            throw new CustomException("API key is required", HttpStatus.UNAUTHORIZED);
        }
        
        // Check rate limiting
        String rateLimitKey = "webhook:" + apiKey;
        if (!rateLimiterService.resolveBucket(rateLimitKey).tryConsume(1)) {
            throw new CustomException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
        }
        
        // Validate API key
        WebhookConfig webhookConfig = webhookConfigService.getByApiKey(apiKey);
        
        if (!webhookConfig.isEnabled()) {
            throw new CustomException("Webhook is disabled for this company", HttpStatus.FORBIDDEN);
        }
        
        // Convert request to alert
        GrafanaAlert alert = GrafanaAlert.fromRequest(request);
        
        // Find matching workflows
        Company company = webhookConfig.getCompany();
        Collection<Workflow> matchingWorkflows = workflowService.findByMainConditionAndCompany(WFMainCondition.WEBHOOK, company.getId());
        
        System.out.println("DEBUG: Found " + matchingWorkflows.size() + " WEBHOOK workflows");
        System.out.println("DEBUG: Alert name: '" + alert.getAlertName() + "', severity: '" + alert.getSeverity() + "'");
        
        for (Workflow wf : matchingWorkflows) {
            System.out.println("DEBUG: Workflow " + wf.getId() + " - " + wf.getTitle());
            System.out.println("DEBUG: Has " + (wf.getSecondaryConditions() != null ? wf.getSecondaryConditions().size() : 0) + " conditions");
            if (wf.getSecondaryConditions() != null) {
                for (var cond : wf.getSecondaryConditions()) {
                    System.out.println("DEBUG:   Condition - alertName: '" + cond.getAlertName() + "', severity: '" + cond.getSeverity() + "'");
                }
            }
        }
        
        // Filter by alert name and severity
        // A workflow matches if ALL its conditions are satisfied:
        // - If a condition has alertName, it must match
        // - If a condition has severity, it must match
        Optional<Workflow> workflowToExecute = matchingWorkflows.stream()
                .filter(workflow -> workflow.getSecondaryConditions().stream()
                        .allMatch(condition -> {
                            boolean alertNameMatch = true;
                            boolean severityMatch = true;
                            
                            // Check alert name if condition specifies it
                            if (condition.getAlertName() != null && !condition.getAlertName().isEmpty()) {
                                alertNameMatch = condition.getAlertName().equals(alert.getAlertName());
                            }
                            
                            // Check severity if condition specifies it
                            if (condition.getSeverity() != null && !condition.getSeverity().isEmpty()) {
                                severityMatch = condition.getSeverity().equalsIgnoreCase(alert.getSeverity());
                            }
                            
                            return alertNameMatch && severityMatch;
                        })
                )
                .findFirst();
        
        // Execute workflow if found
        if (workflowToExecute.isPresent()) {
            try {
                workflowService.runWebhookWorkflow(workflowToExecute.get(), alert, company);
                return GrafanaWebhookResponse.success("Workflow executed successfully");
            } catch (Exception e) {
                sendErrorNotification(company, alert, e);
                throw new CustomException("Failed to execute workflow: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            return GrafanaWebhookResponse.success("No matching workflow found for this alert");
        }
    }
    
    private void sendErrorNotification(Company company, GrafanaAlert alert, Exception exception) {
        String subject = "Webhook Processing Error: " + alert.getAlertName();
        String message = String.format("""
            Dear Administrator,
            
            An error occurred while processing a Grafana webhook alert:
            
            Alert: %s
            Severity: %s
            Status: %s
            Company: %s
            
            Error: %s
            
            Please check the system logs for more details.
            
            Best regards,
            CMMS System
            """, 
            alert.getAlertName(), 
            alert.getSeverity(),
            alert.getStatus(),
            company.getName(),
            exception.getMessage()
        );
        
        // Send to company admins
        userRepository.findByCompany_Id(company.getId()).stream()
                .filter(user -> user.getRole().getRoleType().equals(RoleType.ROLE_ADMIN))
                .forEach(admin -> {
                    emailService.sendEmail(admin.getEmail(), subject, message);
                });
    }
}