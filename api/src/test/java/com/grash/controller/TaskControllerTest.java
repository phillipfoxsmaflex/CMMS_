package com.grash.controller;

import com.grash.dto.TaskBaseDTO;
import com.grash.dto.TaskShowDTO;
import com.grash.model.Company;
import com.grash.model.OwnUser;
import com.grash.model.Task;
import com.grash.model.TaskBase;
import com.grash.model.WorkOrder;
import com.grash.model.enums.TaskCategory;
import com.grash.model.enums.TaskType;
import com.grash.service.TaskService;
import com.grash.service.UserService;
import com.grash.service.WorkOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Collection;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

class TaskControllerTest {

    @Mock
    private TaskService taskService;

    @Mock
    private UserService userService;

    @Mock
    private WorkOrderService workOrderService;

    @InjectMocks
    private TaskController taskController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetSafetyTasksByWorkOrder() {
        // Setup
        Long workOrderId = 1L;
        HttpServletRequest request = null;
        
        TaskBase taskBase = new TaskBase();
        taskBase.setId(1L);
        taskBase.setLabel("Safety Task 1");
        taskBase.setTaskType(TaskType.SUBTASK);

        Task safetyTask = new Task();
        safetyTask.setId(1L);
        safetyTask.setTaskBase(taskBase);
        safetyTask.setCategory(TaskCategory.SAFETY);

        when(workOrderService.findById(workOrderId)).thenReturn(Optional.of(new WorkOrder()));
        when(taskService.findSafetyTasksByWorkOrder(workOrderId)).thenReturn(Arrays.asList(safetyTask));

        // Execute
        Collection<TaskShowDTO> result = taskController.getSafetyTasksByWorkOrder(workOrderId, request);

        // Verify
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testGetSafetyTasksByWorkOrder_NotFound() {
        // Setup
        Long workOrderId = 1L;
        HttpServletRequest request = null;
        
        when(workOrderService.findById(workOrderId)).thenReturn(Optional.empty());

        // Execute & Verify
        assertThrows(RuntimeException.class, () -> {
            taskController.getSafetyTasksByWorkOrder(workOrderId, request);
        });
    }

    @Test
    void testCreateSafetyTask() {
        // Setup
        Long workOrderId = 1L;
        TaskBaseDTO taskBaseDTO = new TaskBaseDTO();
        taskBaseDTO.setLabel("New Safety Task");
        taskBaseDTO.setTaskType(TaskType.SUBTASK);
        
        HttpServletRequest request = null;
        OwnUser user = new OwnUser();
        Company company = new Company();
        user.setCompany(company);

        WorkOrder workOrder = new WorkOrder();
        workOrder.setId(workOrderId);

        when(userService.whoami(request)).thenReturn(user);
        when(workOrderService.findById(workOrderId)).thenReturn(Optional.of(workOrder));
        when(workOrder.canBeEditedBy(user)).thenReturn(true);

        // Execute
        Collection<TaskShowDTO> result = taskController.createByWorkOrder(Arrays.asList(taskBaseDTO), workOrderId, request);

        // Verify
        assertNotNull(result);
    }
}