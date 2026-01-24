package com.grash.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.grash.model.abstracts.DateAudit;
import com.grash.model.enums.InstructionType;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class SafetyInstruction extends DateAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    @ManyToOne
    @JsonIgnoreProperties({"company", "workers", "safetyInstructions", "assets", "parts"})
    private Location location; // Standortspezifische Unterweisung
    
    @ManyToOne
    @JsonIgnoreProperties({"employees", "safetyInstructions", "calendarEntries", "assets", "locations", "parts"})
    private Vendor vendor; // Zugehöriger Auftragnehmer
    
    @Column(length = 500)
    private String title;
    
    @Column(length = 2000)
    private String description;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime instructionDate;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime expirationDate; // Standard: 12 Monate ab Unterweisungsdatum
    
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private InstructionType type; // VIDEO, DOCUMENT, LINK
    
    @Column(length = 1000)
    private String instructionMaterialUrl; // URL zu Dokument/Video
    
    @Column(length = 255)
    private String instructionMaterialFileId; // Referenz auf hochgeladenes File
    
    @ManyToOne
    @JsonIgnoreProperties({"role", "company", "teams", "password", "workers"})
    private OwnUser instructor; // Durchführender
    
    @ManyToOne
    @JsonIgnoreProperties({"vendor", "customer", "currentSafetyInstruction", "createdBy", "updatedBy"})
    private ContractorEmployee employee; // Unterwiesener Mitarbeiter
    
    private boolean completed;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime completionDate;
    
    @Column(length = 10000)
    private String signatureData; // Elektronische Signatur
    
    @Column(length = 255)
    private String signatureName; // Name des Unterzeichners
    
    @ManyToOne
    @JsonIgnoreProperties({"role", "company", "teams", "password", "workers"})
    private OwnUser createdBy; // User who created this instruction
    
    // Transient fields for JSON serialization (computed dynamically, not persisted in DB)
    @Transient
    public Long getLocationId() {
        return location != null ? location.getId() : null;
    }
    
    @Transient
    public Long getVendorId() {
        return vendor != null ? vendor.getId() : null;
    }
    
    @Transient
    public Long getInstructorId() {
        return instructor != null ? instructor.getId() : null;
    }
    
    @Transient
    public Long getEmployeeId() {
        return employee != null ? employee.getId() : null;
    }
}