package com.grash.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ContractorAssignmentDTO {
    private Long id;
    private String name;
    private String type; // "VENDOR" or "CUSTOMER"
    
    public ContractorAssignmentDTO(Long id, String name, String type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }
}