package com.grash.service;

import com.grash.dto.GrafanaAlert;
import com.grash.mapper.WorkflowMapper;
import com.grash.model.*;
import com.grash.model.enums.Priority;
import com.grash.model.enums.Status;
import com.grash.model.enums.workflow.WFMainCondition;
import com.grash.model.enums.workflow.TaskAction;
import com.grash.repository.WorkOrderRepository;
import com.grash.repository.RequestRepository;
import com.grash.repository.WorkflowRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkflowWebhookIntegrationTest {

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
    void testRunWebhookWorkflow_CreateWorkOrder() {
        // Mock repositories
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> {
            WorkOrder workOrder = invocation.getArgument(0);
            workOrder.setId(1L);
            return workOrder;
        });

        // Mock service to call repository
        doAnswer(invocation -> {
            WorkOrder workOrder = invocation.getArgument(0);
            return workOrderRepository.save(workOrder);
        }).when(workOrderService).save(any(WorkOrder.class));

        // Execute workflow
        workflowService.runWebhookWorkflow(workflow, alert, company);

        // Verify work order was created
        verify(workOrderRepository, times(1)).save(any(WorkOrder.class));
        verify(requestRepository, never()).save(any(Request.class));
    }

    @Test
    void testRunWebhookWorkflow_CreateRequest() {
        // Change workflow action to create request
        workflowAction.setTaskAction(com.grash.model.enums.workflow.TaskAction.CREATE_REQUEST);
        workflowAction.setWorkOrderAction(null);

        // Mock repositories
        when(requestRepository.save(any(Request.class))).thenAnswer(invocation -> {
            Request request = invocation.getArgument(0);
            request.setId(1L);
            return request;
        });

        // Execute workflow
        workflowService.runWebhookWorkflow(workflow, alert, company);

        // Verify request was created
        verify(requestRepository, times(1)).save(any(Request.class));
        verify(workOrderRepository, never()).save(any(WorkOrder.class));
    }

    @Test
    void testRunWebhookWorkflow_WorkOrderProperties() {
        // Mock repositories
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> {
            WorkOrder workOrder = invocation.getArgument(0);
            workOrder.setId(1L);
            return workOrder;
        });

        // Execute workflow
        workflowService.runWebhookWorkflow(workflow, alert, company);

        // Verify work order properties
        verify(workOrderRepository, times(1)).save(argThat(workOrder ->
            workOrder.getCompany().equals(company) &&
            workOrder.getTitle().equals("Auto-created: TestAlert") &&
            workOrder.getDescription().equals("Created from Grafana alert: Test alert message") &&
            workOrder.getPriority() == Priority.HIGH &&
            workOrder.getStatus() == Status.OPEN
        ));
    }

    @Test
    void testRunWebhookWorkflow_RequestProperties() {
        // Change workflow action to create request
        workflowAction.setTaskAction(com.grash.model.enums.workflow.TaskAction.CREATE_REQUEST);
        workflowAction.setWorkOrderAction(null);

        // Mock repositories
        when(requestRepository.save(any(Request.class))).thenAnswer(invocation -> {
            Request request = invocation.getArgument(0);
            request.setId(1L);
            return request;
        });

        // Execute workflow
        workflowService.runWebhookWorkflow(workflow, alert, company);

        // Verify request properties
        verify(requestRepository, times(1)).save(argThat(request ->
            request.getCompany().equals(company) &&
            request.getTitle().equals("Auto-created: TestAlert") &&
            request.getDescription().equals("Created from Grafana alert: Test alert message") &&
            request.getPriority() == Priority.HIGH &&
            request.getStatus() == Status.OPEN
        ));
    }

    @Test
    void testRunWebhookWorkflow_MediumPriority() {
        // Change alert priority to medium
        alert.setCustomData(Map.of("priority", "medium"));

        // Mock repositories
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> {
            WorkOrder workOrder = invocation.getArgument(0);
            workOrder.setId(1L);
            return workOrder;
        });

        // Execute workflow
        workflowService.runWebhookWorkflow(workflow, alert, company);

        // Verify medium priority
        verify(workOrderRepository, times(1)).save(argThat(workOrder ->
            workOrder.getPriority() == Priority.MEDIUM
        ));
    }

    @Test
    void testRunWebhookWorkflow_LowPriority() {
        // Change alert priority to low
        alert.setCustomData(Map.of("priority", "low"));

        // Mock repositories
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> {
            WorkOrder workOrder = invocation.getArgument(0);
            workOrder.setId(1L);
            return workOrder;
        });

        // Execute workflow
        workflowService.runWebhookWorkflow(workflow, alert, company);

        // Verify low priority
        verify(workOrderRepository, times(1)).save(argThat(workOrder ->
            workOrder.getPriority() == Priority.LOW
        ));
    }

    @Test
    void testRunWebhookWorkflow_DefaultPriority() {
        // Remove priority from alert
        alert.setCustomData(Map.of("workflowId", "test-workflow"));

        // Mock repositories
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> {
            WorkOrder workOrder = invocation.getArgument(0);
            workOrder.setId(1L);
            return workOrder;
        });

        // Execute workflow
        workflowService.runWebhookWorkflow(workflow, alert, company);

        // Verify default medium priority
        verify(workOrderRepository, times(1)).save(argThat(workOrder ->
            workOrder.getPriority() == Priority.MEDIUM
        ));
    }

    @Test
    void testRunWebhookWorkflow_NoMatchingCondition() {
        // Change alert name to not match condition
        alert.setAlertName("DifferentAlert");

        // Execute workflow
        workflowService.runWebhookWorkflow(workflow, alert, company);

        // Verify no work order or request was created
        verify(workOrderRepository, never()).save(any(WorkOrder.class));
        verify(requestRepository, never()).save(any(Request.class));
    }

    @Test
    void testRunWebhookWorkflow_DisabledWorkflow() {
        // Disable workflow
        workflow.setEnabled(false);

        // Execute workflow
        workflowService.runWebhookWorkflow(workflow, alert, company);

        // Verify no work order or request was created
        verify(workOrderRepository, never()).save(any(WorkOrder.class));
        verify(requestRepository, never()).save(any(Request.class));
    }

    // Note: getPriorityFromAlert is private, so we test it indirectly through the workflow execution
    // The priority tests are covered by the workflow execution tests above
}