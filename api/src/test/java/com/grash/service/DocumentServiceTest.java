package com.grash.service;

import com.grash.dto.DocumentDTO;
import com.grash.factory.StorageServiceFactory;
import com.grash.model.Company;
import com.grash.model.Document;
import com.grash.repository.CompanyRepository;
import com.grash.repository.DocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private StorageServiceFactory storageServiceFactory;

    @Mock
    private UserService userService;

    @InjectMocks
    private DocumentService documentService;

    @Test
    void testGetAllDocuments() {
        // Create mock documents
        Document doc1 = new Document();
        doc1.setId(1L);
        doc1.setName("Location Document");
        doc1.setEntityType("LOCATION");
        doc1.setIsFolder(true);
        
        Company company = new Company();
        company.setId(1L);
        doc1.setCompany(company);
        
        Document doc2 = new Document();
        doc2.setId(2L);
        doc2.setName("Asset Document");
        doc2.setEntityType("ASSET");
        doc2.setIsFolder(false);
        doc2.setCompany(company);
        
        List<Document> mockDocuments = Arrays.asList(doc1, doc2);

        // Mock repository call
        when(documentRepository.findByParentDocumentIsNullAndIsActiveTrue()).thenReturn(mockDocuments);

        // Call service method
        List<DocumentDTO> result = documentService.getAllDocuments(1L);

        // Verify result
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Location Document", result.get(0).getName());
        assertEquals("Asset Document", result.get(1).getName());
    }

    @Test
    void testGetAllDocumentsEmpty() {
        // Mock empty repository result
        when(documentRepository.findByParentDocumentIsNullAndIsActiveTrue()).thenReturn(List.of());

        // Call service method
        List<DocumentDTO> result = documentService.getAllDocuments(1L);

        // Verify result
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testGetAllDocumentsDifferentCompany() {
        // Create mock documents from different companies
        Document doc1 = new Document();
        doc1.setId(1L);
        doc1.setName("Company 1 Document");
        
        Company company1 = new Company();
        company1.setId(1L);
        doc1.setCompany(company1);
        
        Document doc2 = new Document();
        doc2.setId(2L);
        doc2.setName("Company 2 Document");
        
        Company company2 = new Company();
        company2.setId(2L);
        doc2.setCompany(company2);
        
        List<Document> mockDocuments = Arrays.asList(doc1, doc2);

        // Mock repository call
        when(documentRepository.findByParentDocumentIsNullAndIsActiveTrue()).thenReturn(mockDocuments);

        // Call service method for company 1
        List<DocumentDTO> result = documentService.getAllDocuments(1L);

        // Verify result - should only return documents from company 1
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Company 1 Document", result.get(0).getName());
    }
}