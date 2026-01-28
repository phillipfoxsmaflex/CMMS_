package com.grash.service;

import com.grash.model.Task;
import com.grash.model.enums.TaskCategory;
import com.grash.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private WorkOrderService workOrderService;

    @Mock
    private CompanyService companyService;

    @Mock
    private FileService fileService;

    @Mock
    private TaskMapper taskMapper;

    @InjectMocks
    private TaskService taskService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindSafetyTasksByWorkOrder() {
        // Setup
        Long workOrderId = 1L;
        
        Task safetyTask1 = new Task();
        safetyTask1.setId(1L);
        safetyTask1.setCategory(TaskCategory.SAFETY);
        
        Task safetyTask2 = new Task();
        safetyTask2.setId(2L);
        safetyTask2.setCategory(TaskCategory.SAFETY);
        
        List<Task> expectedTasks = Arrays.asList(safetyTask1, safetyTask2);
        
        when(taskRepository.findByWorkOrder_IdAndCategoryOrderByCreatedAtAsc(workOrderId, TaskCategory.SAFETY))
                .thenReturn(expectedTasks);

        // Execute
        List<Task> result = taskService.findSafetyTasksByWorkOrder(workOrderId);

        // Verify
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(TaskCategory.SAFETY, result.get(0).getCategory());
        assertEquals(TaskCategory.SAFETY, result.get(1).getCategory());
    }

    @Test
    void testFindSafetyTasksByWorkOrder_Empty() {
        // Setup
        Long workOrderId = 1L;
        
        when(taskRepository.findByWorkOrder_IdAndCategoryOrderByCreatedAtAsc(workOrderId, TaskCategory.SAFETY))
                .thenReturn(Arrays.asList());

        // Execute
        List<Task> result = taskService.findSafetyTasksByWorkOrder(workOrderId);

        // Verify
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}