package com.grash.controller;

import com.grash.dto.SuccessResponse;
import com.grash.exception.CustomException;
import com.grash.model.OwnUser;
import com.grash.model.WebhookConfig;
import com.grash.model.enums.PermissionEntity;
import com.grash.service.UserService;
import com.grash.service.WebhookConfigService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/webhook-config")
@Api(tags = "webhook-config")
@RequiredArgsConstructor
public class WebhookConfigController {
    
    private final WebhookConfigService webhookConfigService;
    private final UserService userService;
    
    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiOperation(value = "Create webhook configuration", notes = "Create a new webhook configuration for the company")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Webhook config created successfully"),
            @ApiResponse(code = 400, message = "Bad request"),
            @ApiResponse(code = 401, message = "Unauthorized"),
            @ApiResponse(code = 403, message = "Forbidden"),
            @ApiResponse(code = 409, message = "Webhook config already exists")
    })
    public ResponseEntity<WebhookConfig> createWebhookConfig(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        
        if (!user.getRole().getViewPermissions().contains(PermissionEntity.SETTINGS)) {
            throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
        }
        
        WebhookConfig webhookConfig = webhookConfigService.createWebhookConfig(user.getCompany().getId());
        return ResponseEntity.ok(webhookConfig);
    }
    
    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiOperation(value = "Get webhook configuration", notes = "Get the webhook configuration for the company")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Webhook config retrieved successfully"),
            @ApiResponse(code = 401, message = "Unauthorized"),
            @ApiResponse(code = 403, message = "Forbidden"),
            @ApiResponse(code = 404, message = "Webhook config not found")
    })
    public ResponseEntity<WebhookConfig> getWebhookConfig(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        
        if (!user.getRole().getViewPermissions().contains(PermissionEntity.SETTINGS)) {
            throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
        }
        
        WebhookConfig webhookConfig = webhookConfigService.findByCompanyId(user.getCompany().getId())
                .orElseThrow(() -> new CustomException("Webhook config not found", HttpStatus.NOT_FOUND));
        
        return ResponseEntity.ok(webhookConfig);
    }
    
    @PostMapping("/regenerate")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiOperation(value = "Regenerate API key", notes = "Regenerate the API key for the webhook configuration")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "API key regenerated successfully"),
            @ApiResponse(code = 401, message = "Unauthorized"),
            @ApiResponse(code = 403, message = "Forbidden"),
            @ApiResponse(code = 404, message = "Webhook config not found")
    })
    public ResponseEntity<WebhookConfig> regenerateApiKey(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        
        if (!user.getRole().getViewPermissions().contains(PermissionEntity.SETTINGS)) {
            throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
        }
        
        WebhookConfig webhookConfig = webhookConfigService.regenerateApiKey(user.getCompany().getId());
        return ResponseEntity.ok(webhookConfig);
    }
    
    @PostMapping("/{enabled}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiOperation(value = "Toggle webhook enabled status", notes = "Enable or disable the webhook configuration")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Webhook status updated successfully"),
            @ApiResponse(code = 401, message = "Unauthorized"),
            @ApiResponse(code = 403, message = "Forbidden"),
            @ApiResponse(code = 404, message = "Webhook config not found")
    })
    public ResponseEntity<WebhookConfig> toggleEnabled(
            @PathVariable boolean enabled,
            HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        
        if (!user.getRole().getViewPermissions().contains(PermissionEntity.SETTINGS)) {
            throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
        }
        
        WebhookConfig webhookConfig = webhookConfigService.toggleEnabled(user.getCompany().getId(), enabled);
        return ResponseEntity.ok(webhookConfig);
    }
    
    @DeleteMapping("")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiOperation(value = "Delete webhook configuration", notes = "Delete the webhook configuration for the company")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Webhook config deleted successfully"),
            @ApiResponse(code = 401, message = "Unauthorized"),
            @ApiResponse(code = 403, message = "Forbidden"),
            @ApiResponse(code = 404, message = "Webhook config not found")
    })
    public ResponseEntity<SuccessResponse> deleteWebhookConfig(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        
        if (!user.getRole().getViewPermissions().contains(PermissionEntity.SETTINGS)) {
            throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
        }
        
        webhookConfigService.deleteWebhookConfig(user.getCompany().getId());
        return ResponseEntity.ok(new SuccessResponse(true, "Webhook config deleted successfully"));
    }
}