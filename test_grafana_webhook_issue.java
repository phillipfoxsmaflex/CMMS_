import com.grash.controller.WebhookController;
import com.grash.dto.GrafanaWebhookResponse;
import com.grash.service.GrafanaWebhookService;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

public class TestGrafanaWebhookIssue {
    
    public static void main(String[] args) {
        // Create a mock service
        GrafanaWebhookService mockService = new GrafanaWebhookService() {
            @Override
            public GrafanaWebhookResponse processWebhook(String apiKey, Object request) {
                System.out.println("Service called with API key: " + apiKey);
                System.out.println("Request type: " + request.getClass().getName());
                return GrafanaWebhookResponse.success("Test successful");
            }
        };
        
        // Create the controller with mock service
        WebhookController controller = new WebhookController(mockService);
        
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
        
        System.out.println("Testing Grafana webhook format:");
        System.out.println(grafanaWebhook);
        
        try {
            ResponseEntity<GrafanaWebhookResponse> response = controller.handleGrafanaWebhook(
                "b9b0fd9-0ede-4d00-a753-7bc2f4bddb37", 
                grafanaWebhook
            );
            
            System.out.println("Response status: " + response.getStatusCode());
            System.out.println("Response body: " + response.getBody());
        } catch (Exception e) {
            System.out.println("Error occurred: " + e.getMessage());
            e.printStackTrace();
        }
    }
}