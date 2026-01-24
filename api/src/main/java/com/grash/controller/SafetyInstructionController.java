package com.grash.controller;

import com.grash.advancedsearch.SearchCriteria;
import com.grash.dto.SafetyInstructionCreateDTO;
import com.grash.dto.SafetyInstructionPatchDTO;
import com.grash.dto.SafetyInstructionPatchRequestDTO;
import com.grash.dto.SuccessResponse;
import com.grash.exception.CustomException;
import com.grash.model.OwnUser;
import com.grash.model.SafetyInstruction;
import com.grash.model.enums.PermissionEntity;
import com.grash.model.enums.RoleType;
import com.grash.service.SafetyInstructionService;
import com.grash.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.Optional;

@RestController
@RequestMapping("/safety-instructions")
@Api(tags = "safety-instruction")
@RequiredArgsConstructor
public class SafetyInstructionController {

    private final SafetyInstructionService safetyInstructionService;
    private final UserService userService;

    @PostMapping("/search")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Page<SafetyInstruction>> search(@RequestBody SearchCriteria searchCriteria, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (user.getRole().getViewPermissions().contains(PermissionEntity.VENDORS_AND_CUSTOMERS)) {
                // Filter by vendor instead of company for safety instructions
                searchCriteria.filterCreatedBy(user);
            } else throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(safetyInstructionService.findBySearchCriteria(searchCriteria));
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    @ApiResponses(value = {//
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "Safety instruction not found")})
    public SafetyInstruction getById(@ApiParam("id") @PathVariable("id") Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        Optional<SafetyInstruction> optionalInstruction = safetyInstructionService.findById(id);
        if (optionalInstruction.isPresent()) {
            SafetyInstruction savedInstruction = optionalInstruction.get();
            if (user.getRole().getViewPermissions().contains(PermissionEntity.VENDORS_AND_CUSTOMERS)) {
                return savedInstruction;
            } else throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
        } else throw new CustomException("Not found", HttpStatus.NOT_FOUND);
    }

    @GetMapping("/vendor/{vendorId}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiResponses(value = {//
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "Vendor not found")})
    public Collection<SafetyInstruction> getByVendor(@ApiParam("vendorId") @PathVariable("vendorId") Long vendorId, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getViewPermissions().contains(PermissionEntity.VENDORS_AND_CUSTOMERS)) {
            return safetyInstructionService.findByVendor(vendorId);
        } else throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiResponses(value = {//
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "Employee not found")})
    public Collection<SafetyInstruction> getByEmployee(@ApiParam("employeeId") @PathVariable("employeeId") Long employeeId, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getViewPermissions().contains(PermissionEntity.VENDORS_AND_CUSTOMERS)) {
            return safetyInstructionService.findByEmployee(employeeId);
        } else throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
    }

    @GetMapping("/expired")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiResponses(value = {//
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied")})
    public Collection<SafetyInstruction> getExpiredInstructions(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getViewPermissions().contains(PermissionEntity.VENDORS_AND_CUSTOMERS)) {
            return safetyInstructionService.findExpiredInstructions();
        } else throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiResponses(value = {//
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 400, message = "Invalid request data")})
    public SafetyInstruction create(@ApiParam("SafetyInstruction") @Valid @RequestBody SafetyInstructionCreateDTO safetyInstructionReq, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getCreatePermissions().contains(PermissionEntity.VENDORS_AND_CUSTOMERS)) {
            try {
                return safetyInstructionService.createFromDTO(safetyInstructionReq, user.getId());
            } catch (CustomException e) {
                throw e; // Re-throw custom exceptions
            } catch (Exception e) {
                throw new CustomException("Failed to create safety instruction: " + e.getMessage(), HttpStatus.BAD_REQUEST);
            }
        } else throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiResponses(value = {//
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "Safety instruction not found")})
    public SafetyInstruction patch(@ApiParam("SafetyInstruction") @Valid @RequestBody SafetyInstructionPatchRequestDTO safetyInstructionRequest,
                                  @ApiParam("id") @PathVariable("id") Long id,
                                  HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        Optional<SafetyInstruction> optionalInstruction = safetyInstructionService.findById(id);

        if (optionalInstruction.isPresent()) {
            SafetyInstruction savedInstruction = optionalInstruction.get();
            if (user.getRole().getEditOtherPermissions().contains(PermissionEntity.VENDORS_AND_CUSTOMERS) || savedInstruction.getCreatedBy().equals(user.getId())) {
                // Convert request DTO to service DTO with proper date parsing
                SafetyInstructionPatchDTO safetyInstruction = convertToPatchDTO(safetyInstructionRequest);
                return safetyInstructionService.update(id, safetyInstruction);
            } else throw new CustomException("Forbidden", HttpStatus.FORBIDDEN);
        } else throw new CustomException("Safety instruction not found", HttpStatus.NOT_FOUND);
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiResponses(value = {//
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "Safety instruction not found")})
    public SafetyInstruction completeInstruction(@ApiParam("id") @PathVariable("id") Long id,
                                                @RequestParam String signatureData,
                                                @RequestParam String signatureName,
                                                HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        Optional<SafetyInstruction> optionalInstruction = safetyInstructionService.findById(id);

        if (optionalInstruction.isPresent()) {
            SafetyInstruction savedInstruction = optionalInstruction.get();
            if (user.getRole().getEditOtherPermissions().contains(PermissionEntity.VENDORS_AND_CUSTOMERS) || savedInstruction.getCreatedBy().equals(user.getId())) {
                return safetyInstructionService.completeInstruction(id, signatureData, signatureName, user.getId());
            } else throw new CustomException("Forbidden", HttpStatus.FORBIDDEN);
        } else throw new CustomException("Safety instruction not found", HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiResponses(value = {//
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "Safety instruction not found")})
    public ResponseEntity<SuccessResponse> delete(@ApiParam("id") @PathVariable("id") Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);

        Optional<SafetyInstruction> optionalInstruction = safetyInstructionService.findById(id);
        if (optionalInstruction.isPresent()) {
            SafetyInstruction savedInstruction = optionalInstruction.get();
            if (user.getId().equals(savedInstruction.getCreatedBy()) ||
                    user.getRole().getDeleteOtherPermissions().contains(PermissionEntity.VENDORS_AND_CUSTOMERS)) {
                safetyInstructionService.delete(id);
                return new ResponseEntity<>(new SuccessResponse(true, "Deleted successfully"),
                        HttpStatus.OK);
            } else throw new CustomException("Forbidden", HttpStatus.FORBIDDEN);
        } else throw new CustomException("Safety instruction not found", HttpStatus.NOT_FOUND);
    }

    @GetMapping("/employee/{employeeId}/valid")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiResponses(value = {//
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied")})
    public boolean isEmployeeInstructionValid(@ApiParam("employeeId") @PathVariable("employeeId") Long employeeId, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getViewPermissions().contains(PermissionEntity.VENDORS_AND_CUSTOMERS)) {
            return safetyInstructionService.isEmployeeInstructionValid(employeeId);
        } else throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
    }

    /**
     * Convert SafetyInstructionPatchRequestDTO to SafetyInstructionPatchDTO with proper date parsing
     */
    private SafetyInstructionPatchDTO convertToPatchDTO(SafetyInstructionPatchRequestDTO requestDTO) {
        SafetyInstructionPatchDTO patchDTO = new SafetyInstructionPatchDTO();
        
        // Copy simple fields
        patchDTO.setTitle(requestDTO.getTitle());
        patchDTO.setDescription(requestDTO.getDescription());
        patchDTO.setType(requestDTO.getType());
        patchDTO.setInstructionMaterialUrl(requestDTO.getInstructionMaterialUrl());
        patchDTO.setInstructionMaterialFileId(requestDTO.getInstructionMaterialFileId());
        patchDTO.setLocationId(requestDTO.getLocationId());
        patchDTO.setVendorId(requestDTO.getVendorId());
        patchDTO.setInstructorId(requestDTO.getInstructorId());
        patchDTO.setEmployeeId(requestDTO.getEmployeeId());
        
        // Parse dates from ISO strings
        if (requestDTO.getInstructionDate() != null && !requestDTO.getInstructionDate().isEmpty()) {
            try {
                patchDTO.setInstructionDate(parseDateFlexibly(requestDTO.getInstructionDate()));
            } catch (Exception e) {
                throw new CustomException("Invalid instructionDate format. Expected ISO format like: 2023-12-25T14:30:00.000Z", HttpStatus.BAD_REQUEST);
            }
        }
        
        if (requestDTO.getExpirationDate() != null && !requestDTO.getExpirationDate().isEmpty()) {
            try {
                patchDTO.setExpirationDate(parseDateFlexibly(requestDTO.getExpirationDate()));
            } catch (Exception e) {
                throw new CustomException("Invalid expirationDate format. Expected ISO format like: 2023-12-25T14:30:00.000Z", HttpStatus.BAD_REQUEST);
            }
        }
        
        return patchDTO;
    }

    /**
     * Helper method to parse dates in various ISO formats
     * Handles both "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'" and "yyyy-MM-dd'T'HH:mm:ss.SSSZ" formats
     */
    private LocalDateTime parseDateFlexibly(String dateString) {
        try {
            // Try the strict format first: yyyy-MM-dd'T'HH:mm:ss.SSS'Z'
            DateTimeFormatter strictFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
            try {
                return LocalDateTime.parse(dateString, strictFormatter);
            } catch (Exception e) {
                // If strict format fails, try parsing as ZonedDateTime and convert to LocalDateTime
                return ZonedDateTime.parse(dateString).withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
            }
        } catch (Exception e) {
            throw new CustomException("Invalid date format: " + dateString + ". Expected ISO format like: 2023-12-25T14:30:00.000Z", HttpStatus.BAD_REQUEST);
        }
    }
}