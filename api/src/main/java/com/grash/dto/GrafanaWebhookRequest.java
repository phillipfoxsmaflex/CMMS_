package com.grash.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrafanaWebhookRequest {
    
    @NotBlank
    private String alertId;
    
    @NotBlank
    private String alertName;
    
    @NotBlank
    private String status; // firing|resolved
    
    @NotBlank
    private String severity; // critical|warning|info
    
    private String dashboardId;
    private String panelId;
    private String ruleUrl;
    private String evaluationTime; // ISO8601 timestamp
    private Map<String, Object> values;
    private String message;
    
    private CustomData customData;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomData {
        private String workflowId;
        private String priority; // high|medium|low
        private Map<String, Object> additionalInfo;
    }
}