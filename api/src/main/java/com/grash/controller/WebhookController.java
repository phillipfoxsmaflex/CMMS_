package com.grash.controller;

import com.grash.dto.GrafanaWebhookRequest;
import com.grash.dto.GrafanaWebhookResponse;
import com.grash.exception.CustomException;
import com.grash.service.GrafanaWebhookService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

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
            @Valid @RequestBody GrafanaWebhookRequest request) {
        
        try {
            GrafanaWebhookResponse response = grafanaWebhookService.processWebhook(apiKey, request);
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