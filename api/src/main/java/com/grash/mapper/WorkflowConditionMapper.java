package com.grash.mapper;

import com.grash.dto.WorkflowConditionPatchDTO;
import com.grash.dto.WorkflowConditionPostDTO;
import com.grash.model.WorkflowCondition;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface WorkflowConditionMapper {
    @Mappings({
        @Mapping(source = "dto.alertName", target = "alertName"),
        @Mapping(source = "dto.severity", target = "severity")
    })
    WorkflowCondition updateWorkflowCondition(@MappingTarget WorkflowCondition entity, WorkflowConditionPatchDTO dto);

    @Mappings({})
    WorkflowConditionPatchDTO toPatchDto(WorkflowCondition model);

    @Mappings({
        @Mapping(source = "dto.alertName", target = "alertName"),
        @Mapping(source = "dto.severity", target = "severity")
    })
    WorkflowCondition toModel(WorkflowConditionPostDTO dto);
}
