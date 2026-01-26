package com.grash.controller;

import com.grash.dto.GrafanaWebhookResponse;
import com.grash.exception.CustomException;
import com.grash.service.GrafanaWebhookService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GrafanaWebhookExactFormatTest {

    @Mock
    private GrafanaWebhookService grafanaWebhookService;

    @InjectMocks
    private WebhookController webhookController;

    @Test
    void testExactGrafanaWebhookFormatFromIssue() {
        // Create the EXACT Grafana webhook format from the user's issue
        Map<String, Object> grafanaWebhook = new HashMap<>();
        
        // Headers exactly as provided
        Map<String, String> headers = new HashMap<>();
        headers.put("host", "192.168.178.200:5678");
        headers.put("user-agent", "Grafana");
        headers.put("content-length", "285");
        headers.put("content-type", "application/json");
        headers.put("x-api-key", "b9b0fd9-0ede-4d00-a753-7bc2f4bddb37");
        headers.put("accept-encoding", "gzip");
        headers.put("connection", "close");
        
        // Body exactly as provided
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
        
        // Full request exactly as provided
        grafanaWebhook.put("headers", headers);
        grafanaWebhook.put("params", new HashMap<>());
        grafanaWebhook.put("query", new HashMap<>());
        grafanaWebhook.put("body", body);
        grafanaWebhook.put("webhookUrl", "http://localhost:5678/webhook/8a20a8d8-210a-4cef-b260-b125994eb5dd");
        grafanaWebhook.put("executionMode", "production");
        
        // Mock successful response
        GrafanaWebhookResponse expectedResponse = GrafanaWebhookResponse.success("Workflow executed successfully");
        when(grafanaWebhookService.processWebhook(anyString(), any())).thenReturn(expectedResponse);

        // Test the controller with the exact format
        ResponseEntity<GrafanaWebhookResponse> response = webhookController.handleGrafanaWebhook(
            "b9b0fd9-0ede-4d00-a753-7bc2f4bddb37", 
            grafanaWebhook
        );

        // Verify the response
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Workflow executed successfully", response.getBody().getMessage());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void testGrafanaWebhookFormatWithMissingRequiredFields() {
        // Create a Grafana webhook with missing required fields
        Map<String, Object> grafanaWebhook = new HashMap<>();
        
        // Headers
        Map<String, String> headers = new HashMap<>();
        headers.put("content-type", "application/json");
        
        // Body with missing required fields
        Map<String, Object> body = new HashMap<>();
        body.put("alertName", "Test");
        // Missing alertId, status, severity
        
        // Full request
        grafanaWebhook.put("headers", headers);
        grafanaWebhook.put("body", body);

        // Test the controller - should return 400 BAD_REQUEST
        ResponseEntity<GrafanaWebhookResponse> response = webhookController.handleGrafanaWebhook(
            "valid-api-key", 
            grafanaWebhook
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertTrue(response.getBody().getMessage().contains("is required"));
    }

    @Test
    void testGrafanaWebhookFormatWithInvalidStructure() {
        // Create an invalid Grafana webhook structure
        Map<String, Object> invalidWebhook = new HashMap<>();
        invalidWebhook.put("invalidField", "invalidValue");
        invalidWebhook.put("anotherField", 123);

        // Test the controller - should return 400 BAD_REQUEST
        ResponseEntity<GrafanaWebhookResponse> response = webhookController.handleGrafanaWebhook(
            "valid-api-key", 
            invalidWebhook
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertTrue(response.getBody().getMessage().contains("Invalid CMMS webhook format"));
    }
}