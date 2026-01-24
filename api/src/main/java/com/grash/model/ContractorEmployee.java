package com.grash.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.grash.model.abstracts.DateAudit;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Data
@NoArgsConstructor
public class ContractorEmployee extends DateAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    @ManyToOne
    @JsonIgnoreProperties({"employees", "safetyInstructions", "calendarEntries", "assets", "locations", "parts"})
    private Vendor vendor;
    
    @ManyToOne
    @JsonIgnoreProperties({"assets", "locations", "parts"})
    private Customer customer;
    
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String position;
    
    // Referenz auf aktuelle gültige Unterweisung
    @ManyToOne
    @JsonIgnoreProperties({"vendor", "employee", "location", "instructor", "createdBy", "updatedBy"})
    private SafetyInstruction currentSafetyInstruction;
    
    @ManyToOne
    @JsonIgnoreProperties({"role", "company", "teams", "password", "workers"})
    private OwnUser createdBy; // User who created this employee
    
    // Transient getters for JSON serialization (computed dynamically, not persisted in DB)
    @Transient
    public Long getVendorId() {
        return vendor != null ? vendor.getId() : null;
    }
    
    @Transient
    public Long getCustomerId() {
        return customer != null ? customer.getId() : null;
    }
    
    @Transient
    public Long getCurrentSafetyInstructionId() {
        return currentSafetyInstruction != null ? currentSafetyInstruction.getId() : null;
    }
}