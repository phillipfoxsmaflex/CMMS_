package com.grash.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.grash.model.File;
import com.grash.model.OwnUser;
import com.grash.model.enums.Status;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
public class WorkOrderPatchDTO extends WorkOrderBasePatchDTO {
    private OwnUser completedBy;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC")
    private Date completedOn;
    private boolean archived;
}
