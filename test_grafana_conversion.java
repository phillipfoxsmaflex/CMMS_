import com.grash.dto.GrafanaNativeWebhookRequest;
import com.grash.dto.GrafanaWebhookRequest;
import java.util.Map;
import java.util.HashMap;

public class TestGrafanaConversion {
    public static void main(String[] args) {
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
        System.out.println("Conversion successful!");
        System.out.println("Alert ID: " + standardRequest.getAlertId());
        System.out.println("Alert Name: " + standardRequest.getAlertName());
        System.out.println("Status: " + standardRequest.getStatus());
        System.out.println("Severity: " + standardRequest.getSeverity());
        System.out.println("Message: " + standardRequest.getMessage());
        
        if (standardRequest.getCustomData() != null) {
            System.out.println("Custom Data Priority: " + standardRequest.getCustomData().getPriority());
            System.out.println("Custom Data Workflow ID: " + standardRequest.getCustomData().getWorkflowId());
            System.out.println("Custom Data Additional Info: " + standardRequest.getCustomData().getAdditionalInfo());
        }
    }
}