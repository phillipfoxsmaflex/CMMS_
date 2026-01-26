package com.grash.service;

import com.grash.dto.GrafanaNativeWebhookRequest;
import com.grash.dto.GrafanaWebhookRequest;
import org.junit.jupiter.api.Test;
import java.util.HashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class GrafanaNativeWebhookRequestTest {

    @Test
    void testConversionFromGrafanaNativeFormat() {
        // Create a Grafana native format request
        GrafanaNativeWebhookRequest.GrafanaAlertBody alertBody = new GrafanaNativeWebhookRequest.GrafanaAlertBody();
        alertBody.setAlertId("test-123");
        alertBody.setAlertName("TestAlert");
        alertBody.setStatus("firing");
        alertBody.setSeverity("critical");
        alertBody.setMessage("Test alert message");
        
        // Set customData like Grafana would send it
        Map<String, Object> customData = new HashMap<>();
        customData.put("firingCount", 1);
        customData.put("resolvedCount", 0);
        customData.put("receiver", "test-receiver");
        customData.put("externalURL", "http://localhost:3000/grafana/");
        alertBody.setCustomData(customData);
        
        // Create the full native request
        GrafanaNativeWebhookRequest nativeRequest = new GrafanaNativeWebhookRequest();
        nativeRequest.setBody(alertBody);
        nativeRequest.setHeaders(new HashMap<>());
        nativeRequest.setParams(new HashMap<>());
        nativeRequest.setQuery(new HashMap<>());
        
        // Convert to standard format
        GrafanaWebhookRequest standardRequest = nativeRequest.toStandardFormat();
        
        // Verify the conversion
        assertNotNull(standardRequest);
        assertEquals("test-123", standardRequest.getAlertId());
        assertEquals("TestAlert", standardRequest.getAlertName());
        assertEquals("firing", standardRequest.getStatus());
        assertEquals("critical", standardRequest.getSeverity());
        assertEquals("Test alert message", standardRequest.getMessage());
        
        // Verify custom data conversion
        assertNotNull(standardRequest.getCustomData());
        assertEquals("medium", standardRequest.getCustomData().getPriority()); // default priority
        assertNull(standardRequest.getCustomData().getWorkflowId()); // not provided
        assertNotNull(standardRequest.getCustomData().getAdditionalInfo());
        assertEquals(4, standardRequest.getCustomData().getAdditionalInfo().size());
        assertEquals(1, standardRequest.getCustomData().getAdditionalInfo().get("firingCount"));
        assertEquals(0, standardRequest.getCustomData().getAdditionalInfo().get("resolvedCount"));
        assertEquals("test-receiver", standardRequest.getCustomData().getAdditionalInfo().get("receiver"));
        assertEquals("http://localhost:3000/grafana/", standardRequest.getCustomData().getAdditionalInfo().get("externalURL"));
    }
    
    @Test
    void testConversionWithPriorityAndWorkflowId() {
        // Create a Grafana native format request with priority and workflowId
        GrafanaNativeWebhookRequest.GrafanaAlertBody alertBody = new GrafanaNativeWebhookRequest.GrafanaAlertBody();
        alertBody.setAlertId("test-456");
        alertBody.setAlertName("HighPriorityAlert");
        alertBody.setStatus("firing");
        alertBody.setSeverity("warning");
        
        // Set customData with priority and workflowId
        Map<String, Object> customData = new HashMap<>();
        customData.put("priority", "high");
        customData.put("workflowId", "workflow-123");
        customData.put("additionalInfo", "some extra data");
        alertBody.setCustomData(customData);
        
        // Create the full native request
        GrafanaNativeWebhookRequest nativeRequest = new GrafanaNativeWebhookRequest();
        nativeRequest.setBody(alertBody);
        
        // Convert to standard format
        GrafanaWebhookRequest standardRequest = nativeRequest.toStandardFormat();
        
        // Verify priority and workflowId extraction
        assertNotNull(standardRequest.getCustomData());
        assertEquals("high", standardRequest.getCustomData().getPriority());
        assertEquals("workflow-123", standardRequest.getCustomData().getWorkflowId());
        assertNotNull(standardRequest.getCustomData().getAdditionalInfo());
    }
    
    @Test
    void testConversionWithNullCustomData() {
        // Create a Grafana native format request without customData
        GrafanaNativeWebhookRequest.GrafanaAlertBody alertBody = new GrafanaNativeWebhookRequest.GrafanaAlertBody();
        alertBody.setAlertId("test-789");
        alertBody.setAlertName("SimpleAlert");
        alertBody.setStatus("resolved");
        alertBody.setSeverity("info");
        
        // Create the full native request without customData
        GrafanaNativeWebhookRequest nativeRequest = new GrafanaNativeWebhookRequest();
        nativeRequest.setBody(alertBody);
        
        // Convert to standard format
        GrafanaWebhookRequest standardRequest = nativeRequest.toStandardFormat();
        
        // Verify null customData handling
        assertNull(standardRequest.getCustomData());
    }
}