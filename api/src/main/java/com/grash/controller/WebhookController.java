package com.grash.controller;

import com.grash.dto.GrafanaWebhookRequest;
import com.grash.dto.GrafanaWebhookResponse;
import com.grash.dto.GrafanaNativeWebhookRequest;
import com.grash.exception.CustomException;
import com.grash.service.GrafanaWebhookService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/webhooks")
@Api(tags = "webhook")
@RequiredArgsConstructor
public class WebhookController {
    
    private final GrafanaWebhookService grafanaWebhookService;
    
    @PostMapping("/grafana")
    @ApiOperation(value = "Receive Grafana webhook alerts", notes = "Endpoint to receive and process alerts from Grafana")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Webhook processed successfully"),
            @ApiResponse(code = 400, message = "Invalid request format"),
            @ApiResponse(code = 401, message = "Unauthorized - Invalid API key"),
            @ApiResponse(code = 429, message = "Too many requests - Rate limit exceeded"),
            @ApiResponse(code = 500, message = "Internal server error")
    })
    public ResponseEntity<GrafanaWebhookResponse> handleGrafanaWebhook(
            @RequestHeader(name = "X-API-Key", required = false) String apiKey,
            @RequestBody Map<String, Object> requestMap) {
        
        try {
            // Validate API key first
            if (apiKey == null || apiKey.isEmpty()) {
                throw new CustomException("API key is required", HttpStatus.UNAUTHORIZED);
            }
            
            ObjectMapper objectMapper = new ObjectMapper();
            GrafanaWebhookRequest standardRequest;
            
            // Try to parse as Grafana native format first
            if (requestMap.containsKey("body") && requestMap.containsKey("headers")) {
                // This looks like Grafana native format
                try {
                    GrafanaNativeWebhookRequest nativeRequest = objectMapper.convertValue(requestMap, GrafanaNativeWebhookRequest.class);
                    standardRequest = nativeRequest.toStandardFormat();
                } catch (Exception e) {
                    throw new CustomException("Invalid Grafana native webhook format: " + e.getMessage(), HttpStatus.BAD_REQUEST);
                }
            } else {
                // Try to parse as standard CMMS format
                try {
                    standardRequest = objectMapper.convertValue(requestMap, GrafanaWebhookRequest.class);
                } catch (Exception e) {
                    throw new CustomException("Invalid CMMS webhook format: " + e.getMessage(), HttpStatus.BAD_REQUEST);
                }
            }
            
            // Validate required fields in the standard request
            if (standardRequest.getAlertId() == null || standardRequest.getAlertId().isEmpty()) {
                throw new CustomException("alertId is required", HttpStatus.BAD_REQUEST);
            }
            if (standardRequest.getAlertName() == null || standardRequest.getAlertName().isEmpty()) {
                throw new CustomException("alertName is required", HttpStatus.BAD_REQUEST);
            }
            if (standardRequest.getStatus() == null || standardRequest.getStatus().isEmpty()) {
                throw new CustomException("status is required", HttpStatus.BAD_REQUEST);
            }
            if (standardRequest.getSeverity() == null || standardRequest.getSeverity().isEmpty()) {
                throw new CustomException("severity is required", HttpStatus.BAD_REQUEST);
            }
            
            GrafanaWebhookResponse response = grafanaWebhookService.processWebhook(apiKey, standardRequest);
            return ResponseEntity.ok(response);
        } catch (CustomException e) {
            GrafanaWebhookResponse errorResponse = GrafanaWebhookResponse.error(e.getMessage());
            return ResponseEntity.status(e.getHttpStatus()).body(errorResponse);
        } catch (Exception e) {
            GrafanaWebhookResponse errorResponse = GrafanaWebhookResponse.error("Internal server error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }


}