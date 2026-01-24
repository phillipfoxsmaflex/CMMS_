package com.grash.service;

import com.grash.advancedsearch.SearchCriteria;
import com.grash.advancedsearch.SpecificationBuilder;
import com.grash.dto.SafetyInstructionCreateDTO;
import com.grash.dto.SafetyInstructionPatchDTO;
import com.grash.exception.CustomException;
import com.grash.mapper.SafetyInstructionMapper;
import com.grash.model.ContractorEmployee;
import com.grash.model.Location;
import com.grash.model.OwnUser;
import com.grash.model.SafetyInstruction;
import com.grash.model.Vendor;
import com.grash.repository.SafetyInstructionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SafetyInstructionService {
    private final SafetyInstructionRepository safetyInstructionRepository;
    private final VendorService vendorService;
    private final ContractorEmployeeService contractorEmployeeService;
    private final SafetyInstructionMapper safetyInstructionMapper;
    private final UserService userService;

    public SafetyInstruction create(SafetyInstruction safetyInstruction) {
        // Set standard expiration date (12 months from instruction date)
        if (safetyInstruction.getInstructionDate() != null && safetyInstruction.getExpirationDate() == null) {
            safetyInstruction.setExpirationDate(safetyInstruction.getInstructionDate().plusMonths(12));
        }
        
        return safetyInstructionRepository.save(safetyInstruction);
    }

    public SafetyInstruction createFromDTO(SafetyInstructionCreateDTO dto, Long userId) {
        SafetyInstruction instruction = new SafetyInstruction();
        
        // Copy basic fields
        instruction.setTitle(dto.getTitle());
        instruction.setDescription(dto.getDescription());
        
        // Parse dates from strings - handle both ISO formats
        try {
            if (dto.getInstructionDate() != null) {
                instruction.setInstructionDate(parseDateFlexibly(dto.getInstructionDate()));
            }
            if (dto.getExpirationDate() != null) {
                instruction.setExpirationDate(parseDateFlexibly(dto.getExpirationDate()));
            }
            if (dto.getCompletionDate() != null) {
                instruction.setCompletionDate(parseDateFlexibly(dto.getCompletionDate()));
            }
        } catch (Exception e) {
            throw new CustomException("Invalid date format. Expected ISO format like: 2023-12-25T14:30:00.000Z", HttpStatus.BAD_REQUEST);
        }
        
        instruction.setType(dto.getType());
        instruction.setInstructionMaterialUrl(dto.getInstructionMaterialUrl());
        instruction.setInstructionMaterialFileId(dto.getInstructionMaterialFileId());
        instruction.setCompleted(dto.getCompleted() != null ? dto.getCompleted() : false);
        instruction.setSignatureData(dto.getSignatureData());
        instruction.setSignatureName(dto.getSignatureName());
        
        // Set relationships if IDs are provided
        if (dto.getLocationId() != null) {
            Location location = new Location();
            location.setId(dto.getLocationId());
            instruction.setLocation(location);
        }
        
        if (dto.getVendorId() != null && dto.getVendorId() > 0) {
            Vendor vendor = vendorService.findById(dto.getVendorId())
                    .orElseThrow(() -> new CustomException("Vendor not found", HttpStatus.NOT_FOUND));
            instruction.setVendor(vendor);
        }
        
        if (dto.getInstructorId() != null) {
            OwnUser instructor = userService.findById(dto.getInstructorId())
                    .orElseThrow(() -> new CustomException("Instructor not found", HttpStatus.NOT_FOUND));
            instruction.setInstructor(instructor);
        }
        
        if (dto.getEmployeeId() != null) {
            ContractorEmployee employee = contractorEmployeeService.findById(dto.getEmployeeId())
                    .orElseThrow(() -> new CustomException("Employee not found", HttpStatus.NOT_FOUND));
            instruction.setEmployee(employee);
        }
        
        // Set created by user
        OwnUser createdBy = userService.findById(userId)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        instruction.setCreatedBy(createdBy);
        
        // Set standard expiration date if not provided
        if (instruction.getInstructionDate() != null && instruction.getExpirationDate() == null) {
            instruction.setExpirationDate(instruction.getInstructionDate().plusMonths(12));
        }
        
        // Validate required fields before saving
        validateSafetyInstruction(instruction);
        
        try {
            // Ensure audit fields are set properly
            if (instruction.getCreatedAt() == null) {
                instruction.setCreatedAt(new Date());
            }
            if (instruction.getUpdatedAt() == null) {
                instruction.setUpdatedAt(new Date());
            }
            
            SafetyInstruction savedInstruction = safetyInstructionRepository.save(instruction);
            
            // Automatically set this as the employee's current safety instruction
            if (dto.getEmployeeId() != null) {
                ContractorEmployee employee = contractorEmployeeService.findById(dto.getEmployeeId())
                        .orElseThrow(() -> new CustomException("Employee not found", HttpStatus.NOT_FOUND));
                
                // Only update if this is a more recent instruction or the employee has no current instruction
                if (employee.getCurrentSafetyInstruction() == null || 
                    savedInstruction.getInstructionDate().isAfter(employee.getCurrentSafetyInstruction().getInstructionDate())) {
                    employee.setCurrentSafetyInstruction(savedInstruction);
                    contractorEmployeeService.update(employee.getId(), employee);
                }
            }
            
            return savedInstruction;
        } catch (Exception e) {
            throw new CustomException("Failed to save safety instruction: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Validate safety instruction before saving to database
     */
    private void validateSafetyInstruction(SafetyInstruction instruction) {
        if (instruction.getTitle() == null || instruction.getTitle().trim().isEmpty()) {
            throw new CustomException("Title is required", HttpStatus.BAD_REQUEST);
        }
        
        if (instruction.getType() == null) {
            throw new CustomException("Instruction type is required", HttpStatus.BAD_REQUEST);
        }
        
        // Check if instruction date is valid (not in the future)
        if (instruction.getInstructionDate() != null && instruction.getInstructionDate().isAfter(LocalDateTime.now().plusDays(1))) {
            throw new CustomException("Instruction date cannot be more than 1 day in the future", HttpStatus.BAD_REQUEST);
        }
        
        // Check if expiration date is after instruction date
        if (instruction.getInstructionDate() != null && instruction.getExpirationDate() != null && 
            instruction.getExpirationDate().isBefore(instruction.getInstructionDate())) {
            throw new CustomException("Expiration date must be after instruction date", HttpStatus.BAD_REQUEST);
        }
        
        // Validate relationships - ensure they have valid IDs if set
        if (instruction.getLocation() != null && instruction.getLocation().getId() == null) {
            throw new CustomException("Location ID is required if location is set", HttpStatus.BAD_REQUEST);
        }
        
        if (instruction.getVendor() != null && instruction.getVendor().getId() == null) {
            throw new CustomException("Vendor ID is required if vendor is set", HttpStatus.BAD_REQUEST);
        }
        
        if (instruction.getInstructor() != null && instruction.getInstructor().getId() == null) {
            throw new CustomException("Instructor ID is required if instructor is set", HttpStatus.BAD_REQUEST);
        }
        
        if (instruction.getEmployee() != null && instruction.getEmployee().getId() == null) {
            throw new CustomException("Employee ID is required if employee is set", HttpStatus.BAD_REQUEST);
        }
        
        if (instruction.getCreatedBy() == null || instruction.getCreatedBy().getId() == null) {
            throw new CustomException("Created by user is required", HttpStatus.BAD_REQUEST);
        }
    }

    public SafetyInstruction update(Long id, SafetyInstructionPatchDTO safetyInstruction) {
        if (safetyInstructionRepository.existsById(id)) {
            SafetyInstruction savedInstruction = safetyInstructionRepository.findById(id).get();
            

            SafetyInstruction updatedInstruction = safetyInstructionRepository.save(safetyInstructionMapper.updateSafetyInstruction(savedInstruction, safetyInstruction));
            
            // If this instruction is being marked as completed, update the employee's current instruction
            if (updatedInstruction.isCompleted() && updatedInstruction.getEmployee() != null) {
                ContractorEmployee employee = updatedInstruction.getEmployee();
                
                // Only update if this is a more recent instruction or the employee has no current instruction
                if (employee.getCurrentSafetyInstruction() == null || 
                    updatedInstruction.getInstructionDate().isAfter(employee.getCurrentSafetyInstruction().getInstructionDate())) {
                    employee.setCurrentSafetyInstruction(updatedInstruction);
                    contractorEmployeeService.update(employee.getId(), employee);
                }
            }
            
            return updatedInstruction;
        } else throw new CustomException("Not found", HttpStatus.NOT_FOUND);
    }

    public Collection<SafetyInstruction> getAll() {
        return safetyInstructionRepository.findAll();
    }

    public void delete(Long id) {
        // First, find all employees that have this safety instruction as their current one
        List<ContractorEmployee> employeesWithThisInstruction = contractorEmployeeService.findByCurrentSafetyInstructionId(id);
        
        // Clear the reference from all employees before deleting
        for (ContractorEmployee employee : employeesWithThisInstruction) {
            employee.setCurrentSafetyInstruction(null);
            contractorEmployeeService.update(employee.getId(), employee);
        }
        
        // Now safe to delete the safety instruction
        safetyInstructionRepository.deleteById(id);
    }
    
    // Helper method to find employees by current safety instruction ID
    public List<ContractorEmployee> findEmployeesByCurrentSafetyInstructionId(Long safetyInstructionId) {
        return contractorEmployeeService.findByCurrentSafetyInstructionId(safetyInstructionId);
    }

    public Optional<SafetyInstruction> findById(Long id) {
        return safetyInstructionRepository.findById(id);
    }

    public Collection<SafetyInstruction> findByVendor(Long vendorId) {
        return safetyInstructionRepository.findByVendor_Id(vendorId);
    }

    public Collection<SafetyInstruction> findByEmployee(Long employeeId) {
        return safetyInstructionRepository.findByEmployee_Id(employeeId);
    }

    public Collection<SafetyInstruction> findExpiredInstructions() {
        return safetyInstructionRepository.findByExpirationDateBeforeAndCompletedTrue(LocalDateTime.now());
    }

    public Page<SafetyInstruction> findBySearchCriteria(SearchCriteria searchCriteria) {
        SpecificationBuilder<SafetyInstruction> builder = new SpecificationBuilder<>();
        searchCriteria.getFilterFields().forEach(builder::with);
        Pageable page = PageRequest.of(searchCriteria.getPageNum(), searchCriteria.getPageSize(),
                searchCriteria.getDirection(), searchCriteria.getSortField());
        return safetyInstructionRepository.findAll(builder.build(), page);
    }

    public SafetyInstruction completeInstruction(Long id, String signatureData, String signatureName, Long userId) {
        Optional<SafetyInstruction> optionalInstruction = safetyInstructionRepository.findById(id);
        if (optionalInstruction.isPresent()) {
            SafetyInstruction instruction = optionalInstruction.get();
            instruction.setCompleted(true);
            instruction.setCompletionDate(LocalDateTime.now());
            instruction.setSignatureData(signatureData);
            instruction.setSignatureName(signatureName);
            
            // Update employee's current safety instruction
            if (instruction.getEmployee() != null) {
                ContractorEmployee employee = instruction.getEmployee();
                employee.setCurrentSafetyInstruction(instruction);
                contractorEmployeeService.update(employee.getId(), employee);
            }
            
            return safetyInstructionRepository.save(instruction);
        } else throw new CustomException("Safety instruction not found", HttpStatus.NOT_FOUND);
    }

    public boolean isEmployeeInstructionValid(Long employeeId) {
        Optional<ContractorEmployee> optionalEmployee = contractorEmployeeService.findById(employeeId);
        if (optionalEmployee.isPresent()) {
            ContractorEmployee employee = optionalEmployee.get();
            SafetyInstruction currentInstruction = employee.getCurrentSafetyInstruction();
            
            if (currentInstruction == null) {
                return false; // No instruction
            }
            
            return currentInstruction.isCompleted() && 
                   currentInstruction.getExpirationDate().isAfter(LocalDateTime.now());
        }
        return false;
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