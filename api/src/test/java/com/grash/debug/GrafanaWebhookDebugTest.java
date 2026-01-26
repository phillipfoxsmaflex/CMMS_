package com.grash.debug;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grash.dto.GrafanaNativeWebhookRequest;
import com.grash.dto.GrafanaWebhookRequest;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

class GrafanaWebhookDebugTest {

    @Test
    void debugGrafanaWebhookConversion() {
        // Create the exact Grafana webhook format from the issue
        Map<String, Object> grafanaWebhook = new HashMap<>();
        
        // Headers
        Map<String, String> headers = new HashMap<>();
        headers.put("host", "192.168.178.200:5678");
        headers.put("user-agent", "Grafana");
        headers.put("content-length", "285");
        headers.put("content-type", "application/json");
        headers.put("x-api-key", "b9b0fd9-0ede-4d00-a753-7bc2f4bddb37");
        headers.put("accept-encoding", "gzip");
        headers.put("connection", "close");
        
        // Body
        Map<String, Object> body = new HashMap<>();
        body.put("alertId", "326ea703b01f6100");
        body.put("alertName", "Test");
        body.put("status", "firing");
        body.put("severity", "critical");
        body.put("message", "Notification test");
        
        Map<String, Object> customData = new HashMap<>();
        customData.put("firingCount", 1);
        customData.put("resolvedCount", 0);
        customData.put("receiver", "test");
        customData.put("externalURL", "http://localhost:3000/grafana/");
        body.put("customData", customData);
        
        // Full request
        grafanaWebhook.put("headers", headers);
        grafanaWebhook.put("params", new HashMap<>());
        grafanaWebhook.put("query", new HashMap<>());
        grafanaWebhook.put("body", body);
        grafanaWebhook.put("webhookUrl", "http://localhost:5678/webhook/8a20a8d8-210a-4cef-b260-b125994eb5dd");
        grafanaWebhook.put("executionMode", "production");
        
        System.out.println("Original Grafana webhook:");
        System.out.println(grafanaWebhook);
        
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            
            // Try to convert to GrafanaNativeWebhookRequest
            GrafanaNativeWebhookRequest nativeRequest = objectMapper.convertValue(grafanaWebhook, GrafanaNativeWebhookRequest.class);
            
            System.out.println("\nConverted to GrafanaNativeWebhookRequest:");
            System.out.println("Headers: " + nativeRequest.getHeaders());
            System.out.println("Body: " + nativeRequest.getBody());
            
            // Convert to standard format
            GrafanaWebhookRequest standardRequest = nativeRequest.toStandardFormat();
            
            System.out.println("\nConverted to standard format:");
            System.out.println("Alert ID: " + standardRequest.getAlertId());
            System.out.println("Alert Name: " + standardRequest.getAlertName());
            System.out.println("Status: " + standardRequest.getStatus());
            System.out.println("Severity: " + standardRequest.getSeverity());
            System.out.println("Message: " + standardRequest.getMessage());
            System.out.println("Custom Data: " + standardRequest.getCustomData());
            
        } catch (Exception e) {
            System.out.println("Error during conversion: " + e.getMessage());
            e.printStackTrace();
        }
    }
}