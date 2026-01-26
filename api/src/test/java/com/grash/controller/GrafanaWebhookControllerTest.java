package com.grash.controller;

import com.grash.dto.GrafanaWebhookRequest;
import com.grash.dto.GrafanaWebhookResponse;
import com.grash.exception.CustomException;
import com.grash.service.GrafanaWebhookService;
import org.junit.jupiter.api.BeforeEach;
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
class GrafanaWebhookControllerTest {

    @Mock
    private GrafanaWebhookService grafanaWebhookService;

    @InjectMocks
    private WebhookController webhookController;

    private GrafanaWebhookRequest request;
    private Map<String, Object> requestMap;

    @BeforeEach
    void setUp() {
        request = new GrafanaWebhookRequest();
        request.setAlertId("alert-123");
        request.setAlertName("TestAlert");
        request.setStatus("firing");
        request.setSeverity("critical");
        request.setMessage("Test alert message");
        
        // Create map version for new controller signature
        requestMap = new HashMap<>();
        requestMap.put("alertId", "alert-123");
        requestMap.put("alertName", "TestAlert");
        requestMap.put("status", "firing");
        requestMap.put("severity", "critical");
        requestMap.put("message", "Test alert message");
    }

    @Test
    void testHandleGrafanaWebhook_Success() {
        // Mock successful response
        GrafanaWebhookResponse expectedResponse = GrafanaWebhookResponse.success("Workflow executed successfully");
        when(grafanaWebhookService.processWebhook(anyString(), any(GrafanaWebhookRequest.class)))
                .thenReturn(expectedResponse);

        ResponseEntity<GrafanaWebhookResponse> response = webhookController.handleGrafanaWebhook("valid-api-key", requestMap);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Workflow executed successfully", response.getBody().getMessage());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void testHandleGrafanaWebhook_InvalidApiKey() {
        // Mock unauthorized exception
        when(grafanaWebhookService.processWebhook(anyString(), any(GrafanaWebhookRequest.class)))
                .thenThrow(new CustomException("Invalid API key", HttpStatus.UNAUTHORIZED));

        ResponseEntity<GrafanaWebhookResponse> response = webhookController.handleGrafanaWebhook("invalid-api-key", requestMap);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Invalid API key", response.getBody().getMessage());
    }

    @Test
    void testHandleGrafanaWebhook_MissingApiKey() {
        // Test missing API key - validation happens before service call
        ResponseEntity<GrafanaWebhookResponse> response = webhookController.handleGrafanaWebhook(null, requestMap);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("API key is required", response.getBody().getMessage());
    }

    @Test
    void testHandleGrafanaWebhook_RateLimitExceeded() {
        // Mock rate limit exception
        when(grafanaWebhookService.processWebhook(anyString(), any(GrafanaWebhookRequest.class)))
                .thenThrow(new CustomException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS));

        ResponseEntity<GrafanaWebhookResponse> response = webhookController.handleGrafanaWebhook("api-key", requestMap);

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Rate limit exceeded", response.getBody().getMessage());
    }

    @Test
    void testHandleGrafanaWebhook_InternalServerError() {
        // Mock internal server error
        when(grafanaWebhookService.processWebhook(anyString(), any(GrafanaWebhookRequest.class)))
                .thenThrow(new CustomException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR));

        ResponseEntity<GrafanaWebhookResponse> response = webhookController.handleGrafanaWebhook("api-key", requestMap);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Internal server error", response.getBody().getMessage());
    }

    @Test
    void testHandleGrafanaWebhook_GenericException() {
        // Mock generic exception
        when(grafanaWebhookService.processWebhook(anyString(), any(GrafanaWebhookRequest.class)))
                .thenThrow(new RuntimeException("Unexpected error"));

        ResponseEntity<GrafanaWebhookResponse> response = webhookController.handleGrafanaWebhook("api-key", requestMap);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertTrue(response.getBody().getMessage().contains("Internal server error"));
    }

    @Test
    void testHandleGrafanaWebhook_NoMatchingWorkflow() {
        // Mock response for no matching workflow
        GrafanaWebhookResponse expectedResponse = GrafanaWebhookResponse.success("No matching workflow found for this alert");
        when(grafanaWebhookService.processWebhook(anyString(), any(GrafanaWebhookRequest.class)))
                .thenReturn(expectedResponse);

        ResponseEntity<GrafanaWebhookResponse> response = webhookController.handleGrafanaWebhook("valid-api-key", requestMap);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("No matching workflow found for this alert", response.getBody().getMessage());
    }

    @Test
    void testHandleGrafanaWebhook_WebhookDisabled() {
        // Mock forbidden exception for disabled webhook
        when(grafanaWebhookService.processWebhook(anyString(), any(GrafanaWebhookRequest.class)))
                .thenThrow(new CustomException("Webhook is disabled for this company", HttpStatus.FORBIDDEN));

        ResponseEntity<GrafanaWebhookResponse> response = webhookController.handleGrafanaWebhook("api-key", requestMap);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Webhook is disabled for this company", response.getBody().getMessage());
    }
}