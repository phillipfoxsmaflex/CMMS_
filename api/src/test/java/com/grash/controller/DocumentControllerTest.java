package com.grash.controller;

import com.grash.dto.DocumentDTO;
import com.grash.service.DocumentService;
import com.grash.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentControllerTest {

    @Mock
    private DocumentService documentService;

    @Mock
    private UserService userService;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private DocumentController documentController;

    @Test
    void testGetAllDocuments() {
        // Mock data
        DocumentDTO doc1 = new DocumentDTO();
        doc1.setId(1L);
        doc1.setName("Test Document 1");
        doc1.setEntityType("LOCATION");
        
        DocumentDTO doc2 = new DocumentDTO();
        doc2.setId(2L);
        doc2.setName("Test Document 2");
        doc2.setEntityType("ASSET");
        
        List<DocumentDTO> expectedDocuments = Arrays.asList(doc1, doc2);

        // Mock service call
        when(documentService.getAllDocuments(anyLong())).thenReturn(expectedDocuments);

        // Call controller method
        ResponseEntity<List<DocumentDTO>> response = documentController.getAllDocuments(request);

        // Verify response
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(2, response.getBody().size());
        assertEquals("Test Document 1", response.getBody().get(0).getName());
        assertEquals("Test Document 2", response.getBody().get(1).getName());
    }

    @Test
    void testGetAllDocumentsEmpty() {
        // Mock empty list
        when(documentService.getAllDocuments(anyLong())).thenReturn(List.of());

        // Call controller method
        ResponseEntity<List<DocumentDTO>> response = documentController.getAllDocuments(request);

        // Verify response
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(0, response.getBody().size());
    }
}