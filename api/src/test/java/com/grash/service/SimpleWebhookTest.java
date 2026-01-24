package com.grash.service;

import com.grash.dto.GrafanaAlert;
import com.grash.model.*;
import com.grash.model.enums.workflow.TaskAction;
import com.grash.model.enums.workflow.WFMainCondition;
import com.grash.repository.WorkOrderRepository;
import com.grash.repository.RequestRepository;
import com.grash.repository.WorkflowRepository;
import com.grash.mapper.WorkflowMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.ArgumentCaptor;

import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SimpleWebhookTest {

    @Mock
    private WorkOrderRepository workOrderRepository;

    @Mock
    private RequestRepository requestRepository;

    @Mock
    private WorkOrderService workOrderService;

    @Mock
    private RequestService requestService;

    @Mock
    private AssetService assetService;

    @Mock
    private PurchaseOrderService purchaseOrderService;

    @Mock
    private WorkflowMapper workflowMapper;

    @Mock
    private WorkflowRepository workflowRepository;

    @InjectMocks
    private WorkflowService workflowService;

    private Company company;
    private Workflow workflow;
    private WorkflowAction workflowAction;
    private GrafanaAlert alert;

    @BeforeEach
    void setUp() {
        company = new Company();
        company.setId(1L);
        company.setName("Test Company");

        workflow = new Workflow();
        workflow.setId(1L);
        workflow.setTitle("Test Workflow");
        workflow.setMainCondition(WFMainCondition.WEBHOOK);
        workflow.setEnabled(true);
        workflow.setCompany(company);

        workflowAction = new WorkflowAction();
        workflowAction.setId(1L);
        workflowAction.setTaskAction(TaskAction.CREATE_WORK_ORDER);

        workflow.setAction(workflowAction);

        alert = new GrafanaAlert();
        alert.setAlertId("alert-123");
        alert.setAlertName("TestAlert");
        alert.setStatus("firing");
        alert.setSeverity("critical");
        alert.setMessage("Test alert message");
        alert.setCustomData(Map.of(
            "priority", "high",
            "workflowId", "test-workflow"
        ));

        // Setup workflow conditions
        WorkflowCondition condition = new WorkflowCondition();
        condition.setAlertName("TestAlert");
        condition.setSeverity("critical");
        workflow.setSecondaryConditions(Collections.singletonList(condition));
    }

    @Test
    void testConditionMatching() {
        // Test that the condition matches
        WorkflowCondition condition = workflow.getSecondaryConditions().iterator().next();
        boolean isMet = condition.isMetForWebhook(alert);
        
        assertTrue(isMet, "Workflow condition should match the alert");
    }

    @Test
    void testWorkflowExecution() {
        // Mock repositories
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> {
            WorkOrder workOrder = invocation.getArgument(0);
            workOrder.setId(1L);
            return workOrder;
        });
        
        // Mock workOrderService save method to actually call the repository
        doAnswer(invocation -> {
            WorkOrder workOrder = invocation.getArgument(0);
            workOrderRepository.save(workOrder);
            return null;
        }).when(workOrderService).save(any(WorkOrder.class));



        // Execute workflow
        workflowService.runWebhookWorkflow(workflow, alert, company);

        // Verify workOrderService.save was called
        verify(workOrderService, times(1)).save(any(WorkOrder.class));
        
        // Verify work order was created
        verify(workOrderRepository, times(1)).save(any(WorkOrder.class));
    }
}