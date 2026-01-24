package com.grash.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrafanaWebhookResponse {
    
    private boolean success;
    private String message;
    private String timestamp;
    
    public static GrafanaWebhookResponse success(String message) {
        return GrafanaWebhookResponse.builder()
                .success(true)
                .message(message)
                .timestamp(Instant.now().toString())
                .build();
    }
    
    public static GrafanaWebhookResponse error(String message) {
        return GrafanaWebhookResponse.builder()
                .success(false)
                .message(message)
                .timestamp(Instant.now().toString())
                .build();
    }
}