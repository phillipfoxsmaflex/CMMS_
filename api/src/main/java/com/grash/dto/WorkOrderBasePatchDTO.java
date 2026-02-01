package com.grash.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.grash.model.*;
import com.grash.model.enums.Priority;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
public class WorkOrderBasePatchDTO {

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC")
    private Date dueDate;
    private Priority priority = Priority.NONE;
    private double estimatedDuration;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC")
    private Date estimatedStartDate;
    private String description;
    private String title;
    private boolean requiredSignature;

    private File image;

    private WorkOrderCategory category;

    private Location location;

    private Team team;

    private OwnUser primaryUser;

    private List<OwnUser> assignedTo;

    private List<Customer> customers;

    private List<File> files;

    private Asset asset;
}
