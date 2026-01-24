package com.grash.dto;

import com.grash.model.enums.InstructionType;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
public class SafetyInstructionCreateDTO {
    @NotNull
    private String title;
    
    private String description;
    
    private String instructionDate;
    
    private String expirationDate;
    
    @NotNull
    private InstructionType type;
    
    private String instructionMaterialUrl;
    private String instructionMaterialFileId;
    
    private Long locationId;
    private Long vendorId;
    private Long instructorId;
    private Long employeeId;
    
    private Boolean completed;
    
    private String completionDate;
    
    private String signatureData;
    private String signatureName;
}