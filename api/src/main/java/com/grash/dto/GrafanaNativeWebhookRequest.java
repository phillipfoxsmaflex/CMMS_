package com.grash.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrafanaNativeWebhookRequest {
    
    @NotNull
    private Map<String, String> headers;
    
    private Map<String, String> params;
    private Map<String, String> query;
    
    @NotNull
    private GrafanaAlertBody body;
    
    private String webhookUrl;
    private String executionMode;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GrafanaAlertBody {
        private String alertId;
        private String alertName;
        private String status; // firing|resolved
        private String severity; // critical|warning|info
        private String message;
        private Map<String, Object> customData;
        private String dashboardId;
        private String panelId;
        private String ruleUrl;
        private String evaluationTime;
        private Map<String, Object> values;
    }
    
    public GrafanaWebhookRequest toStandardFormat() {
        GrafanaAlertBody alertBody = this.getBody();
        
        // Validate required fields
        if (alertBody.getAlertId() == null || alertBody.getAlertId().isEmpty()) {
            throw new IllegalArgumentException("alertId is required in Grafana webhook body");
        }
        if (alertBody.getAlertName() == null || alertBody.getAlertName().isEmpty()) {
            throw new IllegalArgumentException("alertName is required in Grafana webhook body");
        }
        if (alertBody.getStatus() == null || alertBody.getStatus().isEmpty()) {
            throw new IllegalArgumentException("status is required in Grafana webhook body");
        }
        if (alertBody.getSeverity() == null || alertBody.getSeverity().isEmpty()) {
            throw new IllegalArgumentException("severity is required in Grafana webhook body");
        }
        
        return GrafanaWebhookRequest.builder()
                .alertId(alertBody.getAlertId())
                .alertName(alertBody.getAlertName())
                .status(alertBody.getStatus())
                .severity(alertBody.getSeverity())
                .message(alertBody.getMessage())
                .dashboardId(alertBody.getDashboardId())
                .panelId(alertBody.getPanelId())
                .ruleUrl(alertBody.getRuleUrl())
                .evaluationTime(alertBody.getEvaluationTime())
                .values(alertBody.getValues())
                .customData(convertCustomData(alertBody.getCustomData()))
                .build();
    }
    
    private GrafanaWebhookRequest.CustomData convertCustomData(Map<String, Object> grafanaCustomData) {
        if (grafanaCustomData == null) {
            return null;
        }
        
        // Extract priority from grafana customData if available, otherwise use default
        String priority = "medium";
        if (grafanaCustomData.containsKey("priority")) {
            priority = grafanaCustomData.get("priority").toString();
        }
        
        // Extract workflowId from grafana customData if available
        String workflowId = grafanaCustomData.containsKey("workflowId") 
            ? grafanaCustomData.get("workflowId").toString()
            : null;
        
        // Put all grafana customData into additionalInfo
        Map<String, Object> additionalInfo = grafanaCustomData;
        
        return GrafanaWebhookRequest.CustomData.builder()
                .workflowId(workflowId)
                .priority(priority)
                .additionalInfo(additionalInfo)
                .build();
    }
}