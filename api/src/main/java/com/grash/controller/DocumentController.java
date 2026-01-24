package com.grash.controller;

import com.grash.dto.DocumentDTO;
import com.grash.dto.DocumentPatchDTO;
import com.grash.dto.SuccessResponse;
import com.grash.exception.CustomException;
import com.grash.model.OwnUser;
import com.grash.model.enums.PermissionEntity;
import com.grash.model.enums.RoleType;
import com.grash.service.DocumentService;
import com.grash.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/documents")
@Api(tags = "document")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {
    
    private final DocumentService documentService;
    private final UserService userService;
    
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("permitAll()")
    @ApiResponses(value = {
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 201, message = "Document created successfully")})
    public ResponseEntity<DocumentDTO> createDocument(
            @RequestPart("document") @Valid DocumentPatchDTO request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            HttpServletRequest req
    ) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getCreatePermissions().contains(PermissionEntity.DOCUMENTS)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
        }
        DocumentDTO created = documentService.createDocument(request, file, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/tree/{entityType}/{entityId}")
    @PreAuthorize("permitAll()")
    @ApiResponses(value = {
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 200, message = "Document tree retrieved successfully")})
    public ResponseEntity<List<DocumentDTO>> getDocumentTree(
            @ApiParam("entityType") @PathVariable String entityType,
            @ApiParam("entityId") @PathVariable Long entityId,
            HttpServletRequest req
    ) {
        log.info("[DEBUG] DocumentController.getDocumentTree called: entityType={}, entityId={}", entityType, entityId);
        OwnUser user = userService.whoami(req);
        log.info("[DEBUG] User authenticated: userId={}, companyId={}", user.getId(), user.getCompany().getId());
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getViewPermissions().contains(PermissionEntity.DOCUMENTS)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
        }
        List<DocumentDTO> tree = documentService.getDocumentTree(entityType, entityId, user.getCompany().getId());
        log.info("[DEBUG] Returning {} documents to client", tree.size());
        return ResponseEntity.ok(tree);
    }
    
    @GetMapping("/all")
    @PreAuthorize("permitAll()")
    @ApiResponses(value = {
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 200, message = "All documents retrieved successfully")})
    public ResponseEntity<List<DocumentDTO>> getAllDocuments(HttpServletRequest req) {
        log.info("[DEBUG] DocumentController.getAllDocuments called");
        OwnUser user = userService.whoami(req);
        log.info("[DEBUG] User authenticated: userId={}, companyId={}", user.getId(), user.getCompany().getId());
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getViewPermissions().contains(PermissionEntity.DOCUMENTS)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
        }
        List<DocumentDTO> allDocuments = documentService.getAllDocuments(user.getCompany().getId());
        log.info("[DEBUG] Returning {} total documents to client", allDocuments.size());
        return ResponseEntity.ok(allDocuments);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    @ApiResponses(value = {
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "Document not found")})
    public ResponseEntity<DocumentDTO> getDocument(
            @ApiParam("id") @PathVariable Long id,
            HttpServletRequest req
    ) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getViewPermissions().contains(PermissionEntity.DOCUMENTS)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
        }
        DocumentDTO document = documentService.getDocumentById(id, user.getCompany().getId());
        return ResponseEntity.ok(document);
    }
    
    @PatchMapping("/{id}")
    @PreAuthorize("permitAll()")
    @ApiResponses(value = {
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "Document not found")})
    public ResponseEntity<DocumentDTO> updateDocument(
            @ApiParam("id") @PathVariable Long id,
            @RequestBody @Valid DocumentPatchDTO request,
            HttpServletRequest req
    ) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getEditOtherPermissions().contains(PermissionEntity.DOCUMENTS)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
        }
        DocumentDTO updated = documentService.updateDocument(id, request, user.getCompany().getId());
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/download/{id}")
    @PreAuthorize("permitAll()")
    @ApiResponses(value = {
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "Document not found")})
    public ResponseEntity<byte[]> downloadDocument(
            @ApiParam("id") @PathVariable Long id,
            HttpServletRequest req
    ) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getViewPermissions().contains(PermissionEntity.DOCUMENTS)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
        }
        
        // Get document info first to retrieve mimeType and filename
        DocumentDTO document = documentService.getDocumentById(id, user.getCompany().getId());
        byte[] fileData = documentService.downloadDocument(id, user.getCompany().getId());
        
        HttpHeaders headers = new HttpHeaders();
        
        // Set correct content type based on document's mimeType
        if (document.getMimeType() != null && !document.getMimeType().isEmpty()) {
            headers.setContentType(MediaType.parseMediaType(document.getMimeType()));
        } else {
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        }
        
        // Set correct filename
        String filename = document.getName();
        headers.setContentDispositionFormData("attachment", filename);
        
        return new ResponseEntity<>(fileData, headers, HttpStatus.OK);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("permitAll()")
    @ApiResponses(value = {
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "Document not found")})
    public ResponseEntity<SuccessResponse> deleteDocument(
            @ApiParam("id") @PathVariable Long id,
            HttpServletRequest req
    ) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getDeleteOtherPermissions().contains(PermissionEntity.DOCUMENTS)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
        }
        documentService.deleteDocument(id, user.getCompany().getId());
        return ResponseEntity.ok(new SuccessResponse(true, "Document deleted successfully"));
    }
    
    @GetMapping("/preview/{id}")
    @PreAuthorize("permitAll()")
    @ApiResponses(value = {
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "Document not found")})
    public ResponseEntity<byte[]> previewDocument(
            @ApiParam("id") @PathVariable Long id,
            HttpServletRequest req
    ) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getViewPermissions().contains(PermissionEntity.DOCUMENTS)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
        }
        
        // Get document info first to retrieve mimeType
        DocumentDTO document = documentService.getDocumentById(id, user.getCompany().getId());
        
        // Only allow preview for image files
        if (document.getMimeType() == null || !document.getMimeType().startsWith("image/")) {
            throw new CustomException("Preview only available for images", HttpStatus.BAD_REQUEST);
        }
        
        byte[] fileData = documentService.downloadDocument(id, user.getCompany().getId());
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(document.getMimeType()));
        headers.setCacheControl("max-age=3600"); // Cache for 1 hour
        
        return new ResponseEntity<>(fileData, headers, HttpStatus.OK);
    }
    
    @PostMapping("/download-batch")
    @PreAuthorize("permitAll()")
    @ApiResponses(value = {
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "Document not found")})
    public ResponseEntity<byte[]> downloadBatch(
            @RequestBody List<Long> documentIds,
            HttpServletRequest req
    ) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getViewPermissions().contains(PermissionEntity.DOCUMENTS)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
        }
        
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ZipOutputStream zos = new ZipOutputStream(baos);
            
            for (Long documentId : documentIds) {
                try {
                    DocumentDTO document = documentService.getDocumentById(documentId, user.getCompany().getId());
                    
                    // Skip folders
                    if (document.getIsFolder()) {
                        continue;
                    }
                    
                    byte[] fileData = documentService.downloadDocument(documentId, user.getCompany().getId());
                    
                    // Add file to ZIP
                    ZipEntry zipEntry = new ZipEntry(document.getName());
                    zos.putNextEntry(zipEntry);
                    zos.write(fileData);
                    zos.closeEntry();
                } catch (Exception e) {
                    log.error("Error adding document {} to ZIP", documentId, e);
                    // Continue with other files
                }
            }
            
            zos.close();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/zip"));
            headers.setContentDispositionFormData("attachment", "documents.zip");
            
            return new ResponseEntity<>(baos.toByteArray(), headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error creating ZIP file", e);
            throw new CustomException("Error creating ZIP file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
