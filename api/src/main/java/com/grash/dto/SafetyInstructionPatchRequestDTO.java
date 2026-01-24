package com.grash.dto;

import com.grash.model.enums.InstructionType;
import lombok.Data;

@Data
public class SafetyInstructionPatchRequestDTO {
    private String title;
    private String description;
    private String instructionDate; // Accept ISO string format
    private String expirationDate; // Accept ISO string format
    private InstructionType type;
    private String instructionMaterialUrl;
    private String instructionMaterialFileId;
    private Long locationId;
    private Long vendorId;
    private Long instructorId;
    private Long employeeId;
}