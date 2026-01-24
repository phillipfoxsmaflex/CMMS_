package com.grash.service;

import com.grash.dto.WorkflowPatchDTO;
import com.grash.dto.WorkflowPostDTO;
import com.grash.exception.CustomException;
import com.grash.mapper.WorkflowMapper;
import com.grash.dto.GrafanaAlert;
import com.grash.model.*;
import com.grash.model.enums.ApprovalStatus;
import com.grash.model.enums.Priority;
import com.grash.model.enums.RoleType;
import com.grash.model.enums.Status;
import com.grash.model.enums.workflow.WFMainCondition;
import com.grash.repository.WorkflowRepository;
import com.grash.utils.AuditComparator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowService {
    private final WorkflowRepository workflowRepository;
    private final WorkflowMapper workflowMapper;
    private final WorkOrderService workOrderService;
    private final RequestService requestService;
    private final AssetService assetService;
    private final PurchaseOrderService purchaseOrderService;
    private final WorkflowConditionService workflowConditionService;
    private final WorkflowActionService workflowActionService;

    public Workflow create(Workflow Workflow) {
        return workflowRepository.save(Workflow);
    }

    public Workflow createWorkflow(WorkflowPostDTO workflowReq, Company company) {
        System.out.println("DEBUG: createWorkflow called with title: " + workflowReq.getTitle());
        System.out.println("DEBUG: Alert conditions: " + (workflowReq.getSecondaryConditions() != null ? workflowReq.getSecondaryConditions().size() : 0));
        
        // Create and save action FIRST (before workflow)
        WorkflowAction action;
        if (workflowReq.getAction() != null) {
            action = WorkflowAction.builder()
                    .workOrderAction(workflowReq.getAction().getWorkOrderAction())
                    .requestAction(workflowReq.getAction().getRequestAction())
                    .purchaseOrderAction(workflowReq.getAction().getPurchaseOrderAction())
                    .partAction(workflowReq.getAction().getPartAction())
                    .taskAction(workflowReq.getAction().getTaskAction())
                    .priority(workflowReq.getAction().getPriority())
                    .asset(workflowReq.getAction().getAsset())
                    .location(workflowReq.getAction().getLocation())
                    .user(workflowReq.getAction().getUser())
                    .team(workflowReq.getAction().getTeam())
                    .workOrderCategory(workflowReq.getAction().getWorkOrderCategory())
                    .checklist(workflowReq.getAction().getChecklist())
                    .vendor(workflowReq.getAction().getVendor())
                    .purchaseOrderCategory(workflowReq.getAction().getPurchaseOrderCategory())
                    .value(workflowReq.getAction().getValue())
                    .assetStatus(workflowReq.getAction().getAssetStatus())
                    .numberValue(workflowReq.getAction().getNumberValue())
                    .build();
        } else {
            // Create a default action to satisfy @NotNull constraint
            action = WorkflowAction.builder().build();
        }
        
        // Save the action first
        WorkflowAction savedAction = workflowActionService.create(action);
        System.out.println("DEBUG: Saved action with ID: " + (savedAction != null ? savedAction.getId() : "NULL"));
        
        // Create and save conditions
        Collection<WorkflowCondition> savedConditions = null;
        if (workflowReq.getSecondaryConditions() != null && !workflowReq.getSecondaryConditions().isEmpty()) {
            List<WorkflowCondition> conditions = workflowReq.getSecondaryConditions().stream()
                    .map(conditionDto -> {
                        return WorkflowCondition.builder()
                                .alertName(conditionDto.getAlertName())
                                .severity(conditionDto.getSeverity())
                                .workOrderCondition(conditionDto.getWorkOrderCondition())
                                .requestCondition(conditionDto.getRequestCondition())
                                .purchaseOrderCondition(conditionDto.getPurchaseOrderCondition())
                                .partCondition(conditionDto.getPartCondition())
                                .taskCondition(conditionDto.getTaskCondition())
                                .priority(conditionDto.getPriority())
                                .asset(conditionDto.getAsset())
                                .location(conditionDto.getLocation())
                                .user(conditionDto.getUser())
                                .team(conditionDto.getTeam())
                                .vendor(conditionDto.getVendor())
                                .part(conditionDto.getPart())
                                .workOrderCategory(conditionDto.getWorkOrderCategory())
                                .purchaseOrderCategory(conditionDto.getPurchaseOrderCategory())
                                .workOrderStatus(conditionDto.getWorkOrderStatus())
                                .purchaseOrderStatus(conditionDto.getPurchaseOrderStatus())
                                .createdTimeStart(conditionDto.getCreatedTimeStart())
                                .createdTimeEnd(conditionDto.getCreatedTimeEnd())
                                .startDate(conditionDto.getStartDate())
                                .endDate(conditionDto.getEndDate())
                                .label(conditionDto.getLabel())
                                .value(conditionDto.getValue())
                                .numberValue(conditionDto.getNumberValue())
                                .build();
                    })
                    .collect(Collectors.toList());
            savedConditions = workflowConditionService.saveAll(conditions);
        }

        // Create workflow WITH the action already set
        Workflow workflow = Workflow.builder()
                .title(workflowReq.getTitle())
                .mainCondition(workflowReq.getMainCondition())
                .secondaryConditions(savedConditions != null ? savedConditions : new java.util.ArrayList<>())
                .action(savedAction)  // Set action BEFORE first save
                .enabled(true)
                .build();

        System.out.println("DEBUG: About to save workflow with action ID: " + (workflow.getAction() != null ? workflow.getAction().getId() : "NULL"));
        
        // Save workflow with action already set
        return workflowRepository.save(workflow);
    }

    public Workflow update(Long id, WorkflowPatchDTO workflowsPatchDTO) {
        if (workflowRepository.existsById(id)) {
            Workflow savedWorkflow = workflowRepository.findById(id).get();
            return workflowRepository.save(workflowMapper.updateWorkflow(savedWorkflow, workflowsPatchDTO));
        } else throw new CustomException("Not found", HttpStatus.NOT_FOUND);
    }

    public Collection<Workflow> getAll() {
        return workflowRepository.findAll();
    }

    public void delete(Long id) {
        workflowRepository.deleteById(id);
    }

    public Optional<Workflow> findById(Long id) {
        return workflowRepository.findById(id);
    }

    public Collection<Workflow> findByMainConditionAndCompany(WFMainCondition mainCondition, Long id) {
        return workflowRepository.findByMainConditionAndCompany_Id(mainCondition, id);
    }

    public Collection<Workflow> findByCompany(Long id) {
        return workflowRepository.findByCompany_Id(id);
    }

    public void runWorkOrder(Workflow workflow, WorkOrder workOrder) {
        if (workflow.getSecondaryConditions().stream().allMatch(workflowCondition -> workflowCondition.isMetForWorkOrder(workOrder))) {
            WorkflowAction action = workflow.getAction();
            switch (action.getWorkOrderAction()) {
                case ADD_CHECKLIST:
                    //TODO
                    return;
                case SEND_REMINDER_EMAIL:
                    //TODO
                    return;
                case ASSIGN_TEAM:
                    workOrder.setTeam(action.getTeam());
                    break;
                case ASSIGN_USER:
                    workOrder.setPrimaryUser(action.getUser());
                    break;
                case ASSIGN_ASSET:
                    workOrder.setAsset(action.getAsset());
                    break;
                case ASSIGN_CATEGORY:
                    workOrder.setCategory(action.getWorkOrderCategory());
                    break;
                case ASSIGN_LOCATION:
                    workOrder.setLocation(action.getLocation());
                    break;
                case ASSIGN_PRIORITY:
                    workOrder.setPriority(action.getPriority());
                    break;
                default:
                    break;
            }
            workOrderService.save(workOrder);
        }
    }

    public void runRequest(Workflow workflow, Request request) {
        if (workflow.getSecondaryConditions().stream().allMatch(workflowCondition -> workflowCondition.isMetForRequest(request))) {
            WorkflowAction action = workflow.getAction();
            switch (action.getRequestAction()) {
                case ADD_CHECKLIST:
                    //TODO
                    return;
                case SEND_REMINDER_EMAIL:
                    //TODO
                    return;
                case ASSIGN_TEAM:
                    request.setTeam(action.getTeam());
                    break;
                case ASSIGN_USER:
                    request.setPrimaryUser(action.getUser());
                    break;
                case ASSIGN_ASSET:
                    request.setAsset(action.getAsset());
                    break;
                case ASSIGN_CATEGORY:
                    request.setCategory(action.getWorkOrderCategory());
                    break;
                case ASSIGN_LOCATION:
                    request.setLocation(action.getLocation());
                    break;
                case ASSIGN_PRIORITY:
                    request.setPriority(action.getPriority());
                    break;
                default:
                    break;
            }
            requestService.save(request);
        }
    }

    public void runPurchaseOrder(Workflow workflow, PurchaseOrder purchaseOrder) {
        if (workflow.getSecondaryConditions().stream().allMatch(workflowCondition -> workflowCondition.isMetForPurchaseOrder(purchaseOrder))) {
            WorkflowAction action = workflow.getAction();
            switch (action.getPurchaseOrderAction()) {
                case APPROVE:
                    purchaseOrder.setStatus(ApprovalStatus.APPROVED);
                    break;
                case REJECT:
                    purchaseOrder.setStatus(ApprovalStatus.REJECTED);
                    break;
                case ASSIGN_VENDOR:
                    purchaseOrder.setVendor(action.getVendor());
                    break;
                case SEND_REMINDER_EMAIL:
//                    TODO
                    return;
                default:
                    break;
            }
            purchaseOrderService.save(purchaseOrder);
        }
    }

    public void runPart(Workflow workflow, Part part) {
        if (workflow.getSecondaryConditions().stream().allMatch(workflowCondition -> workflowCondition.isMetForPart(part))) {
            WorkflowAction action = workflow.getAction();
            switch (action.getPartAction()) {
                case CREATE_PURCHASE_ORDER:
                    //TODO
                    break;
                default:
                    break;
            }
        }
    }

    public void runTask(Workflow workflow, Task task) {
        if (workflow.getSecondaryConditions().stream().allMatch(workflowCondition -> workflowCondition.isMetForTask(task))) {
            WorkflowAction action = workflow.getAction();
            switch (action.getTaskAction()) {
                case CREATE_REQUEST:
                case CREATE_WORK_ORDER:
//                   TODO
                    break;
                case SET_ASSET_STATUS:
                    Asset asset = task.getWorkOrder().getAsset();
                    if (asset != null) {
                        asset.setStatus(action.getAssetStatus());
                        assetService.save(asset);
                    }
                    break;
                default:
                    break;
            }
        }
    }
    
    public void runWebhookWorkflow(Workflow workflow, GrafanaAlert alert, Company company) {
        System.out.println("DEBUG: runWebhookWorkflow called for workflow: " + workflow.getTitle());
        System.out.println("DEBUG: Checking if all conditions are met...");
        
        boolean allConditionsMet = workflow.getSecondaryConditions().stream().allMatch(workflowCondition -> {
            boolean met = workflowCondition.isMetForWebhook(alert);
            System.out.println("DEBUG: Condition met? " + met + " - alertName: " + workflowCondition.getAlertName() + ", severity: " + workflowCondition.getSeverity());
            return met;
        });
        
        System.out.println("DEBUG: All conditions met: " + allConditionsMet);
        
        if (allConditionsMet) {
            WorkflowAction action = workflow.getAction();
            System.out.println("DEBUG: Workflow action - taskAction: " + action.getTaskAction() + ", workOrderAction: " + action.getWorkOrderAction());
            
            // Handle TaskAction for webhook workflows
            if (action.getTaskAction() != null) {
                System.out.println("DEBUG: Executing taskAction: " + action.getTaskAction());
                switch (action.getTaskAction()) {
                    case CREATE_WORK_ORDER:
                        System.out.println("DEBUG: Creating work order from webhook");
                        createWorkOrderFromWebhook(alert, action, company);
                        break;
                    case CREATE_REQUEST:
                        createRequestFromWebhook(alert, action, company);
                        break;
                    case SET_ASSET_STATUS:
                        // Handle asset status update if needed
                        break;
                    default:
                        break;
                }
            }
            
            // Execute workflow action based on type
            if (action.getWorkOrderAction() != null) {
                switch (action.getWorkOrderAction()) {
                    case ASSIGN_PRIORITY:
                    case ASSIGN_ASSET:
                    case ASSIGN_LOCATION:
                    case ASSIGN_USER:
                    case ASSIGN_TEAM:
                    case ASSIGN_CATEGORY:
                    case ADD_CHECKLIST:
                    case SEND_REMINDER_EMAIL:
                        // Handle standard workflow actions
                        break;
                    default:
                        // Handle other actions if needed
                        break;
                }
            }
        }
    }
    
    private void createWorkOrderFromWebhook(GrafanaAlert alert, WorkflowAction action, Company company) {
        WorkOrder workOrder = new WorkOrder();
        workOrder.setCompany(company);
        workOrder.setTitle("Auto-created: " + alert.getAlertName());
        workOrder.setDescription("Created from Grafana alert: " + alert.getMessage());
        workOrder.setPriority(getPriorityFromAlert(alert));
        workOrder.setStatus(Status.OPEN);
        
        // Generate work order number
        workOrder.setCustomId(workOrderService.getWorkOrderNumber(company));
        
        // Set additional properties from action if available
        if (action.getAsset() != null) {
            workOrder.setAsset(action.getAsset());
        }
        if (action.getLocation() != null) {
            workOrder.setLocation(action.getLocation());
        }
        if (action.getTeam() != null) {
            workOrder.setTeam(action.getTeam());
        }
        if (action.getUser() != null) {
            workOrder.setPrimaryUser(action.getUser());
        }
        if (action.getWorkOrderCategory() != null) {
            workOrder.setCategory(action.getWorkOrderCategory());
        }
        
        workOrderService.save(workOrder);
    }
    
    private void createRequestFromWebhook(GrafanaAlert alert, WorkflowAction action, Company company) {
        Request request = new Request();
        request.setCompany(company);
        request.setTitle("Auto-created: " + alert.getAlertName());
        request.setDescription("Created from Grafana alert: " + alert.getMessage());
        request.setPriority(getPriorityFromAlert(alert));
        request.setStatus(Status.OPEN);
        
        // Set additional properties from action if available
        if (action.getAsset() != null) {
            request.setAsset(action.getAsset());
        }
        if (action.getLocation() != null) {
            request.setLocation(action.getLocation());
        }
        if (action.getTeam() != null) {
            request.setTeam(action.getTeam());
        }
        if (action.getUser() != null) {
            request.setPrimaryUser(action.getUser());
        }
        if (action.getWorkOrderCategory() != null) {
            request.setCategory(action.getWorkOrderCategory());
        }
        
        requestService.save(request);
    }
    
    private Priority getPriorityFromAlert(GrafanaAlert alert) {
        String priorityStr = alert.getCustomData() != null && alert.getCustomData().containsKey("priority") 
            ? alert.getCustomData().get("priority").toString()
            : "medium";
        
        return switch (priorityStr.toLowerCase()) {
            case "high" -> Priority.HIGH;
            case "low" -> Priority.LOW;
            default -> Priority.MEDIUM;
        };
    }

    public void disableWorkflows(Long companyId) {
        Collection<Workflow> workflows = findByCompany(companyId);
        if (workflows.size() > 0) {
            Workflow firstWorkflow = Collections.min(workflows, new AuditComparator());
            Collection<Workflow> workflowsToDisable = workflows.stream().filter(workflow -> !workflow.getId().equals(firstWorkflow.getId())).collect(Collectors.toList());
            workflowsToDisable.forEach(workflow -> workflow.setEnabled(false));
            workflowRepository.saveAll(workflowsToDisable);
        }
    }

    public void enableWorkflows(Long companyId) {
        Collection<Workflow> workflows = findByCompany(companyId);
        workflows.forEach(workflow -> workflow.setEnabled(true));
        workflowRepository.saveAll(workflows);
    }
}
