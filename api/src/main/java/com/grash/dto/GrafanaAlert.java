package com.grash.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrafanaAlert {
    
    private String alertId;
    private String alertName;
    private String status;
    private String severity;
    private String dashboardId;
    private String panelId;
    private String ruleUrl;
    private String evaluationTime;
    private Map<String, Object> values;
    private String message;
    private Map<String, Object> customData;
    
    public static GrafanaAlert fromRequest(GrafanaWebhookRequest request) {
        return GrafanaAlert.builder()
                .alertId(request.getAlertId())
                .alertName(request.getAlertName())
                .status(request.getStatus())
                .severity(request.getSeverity())
                .dashboardId(request.getDashboardId())
                .panelId(request.getPanelId())
                .ruleUrl(request.getRuleUrl())
                .evaluationTime(request.getEvaluationTime())
                .values(request.getValues())
                .message(request.getMessage())
                .customData(request.getCustomData() != null ? 
                    Map.of(
                        "workflowId", request.getCustomData().getWorkflowId(),
                        "priority", request.getCustomData().getPriority(),
                        "additionalInfo", request.getCustomData().getAdditionalInfo()
                    ) : Map.of()
                )
                .build();
    }
}