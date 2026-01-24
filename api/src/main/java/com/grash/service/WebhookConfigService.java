package com.grash.service;

import com.grash.exception.CustomException;
import com.grash.model.Company;
import com.grash.model.WebhookConfig;
import com.grash.repository.WebhookConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WebhookConfigService {
    
    private final WebhookConfigRepository webhookConfigRepository;
    private final CompanyService companyService;
    
    public WebhookConfig createWebhookConfig(Long companyId) {
        Company company = companyService.findById(companyId)
                .orElseThrow(() -> new CustomException("Company not found", HttpStatus.NOT_FOUND));
        
        if (webhookConfigRepository.existsByCompanyId(companyId)) {
            throw new CustomException("Webhook config already exists for this company", HttpStatus.CONFLICT);
        }
        
        WebhookConfig webhookConfig = WebhookConfig.createForCompany(company);
        return webhookConfigRepository.save(webhookConfig);
    }
    
    public Optional<WebhookConfig> findByCompanyId(Long companyId) {
        return webhookConfigRepository.findByCompanyId(companyId);
    }
    
    public Optional<WebhookConfig> findByApiKey(String apiKey) {
        return webhookConfigRepository.findByApiKey(apiKey);
    }
    
    public WebhookConfig regenerateApiKey(Long companyId) {
        WebhookConfig webhookConfig = findByCompanyId(companyId)
                .orElseThrow(() -> new CustomException("Webhook config not found", HttpStatus.NOT_FOUND));
        
        webhookConfig.regenerateApiKey();
        return webhookConfigRepository.save(webhookConfig);
    }
    
    public WebhookConfig toggleEnabled(Long companyId, boolean enabled) {
        WebhookConfig webhookConfig = findByCompanyId(companyId)
                .orElseThrow(() -> new CustomException("Webhook config not found", HttpStatus.NOT_FOUND));
        
        webhookConfig.setEnabled(enabled);
        return webhookConfigRepository.save(webhookConfig);
    }
    
    public void deleteWebhookConfig(Long companyId) {
        WebhookConfig webhookConfig = findByCompanyId(companyId)
                .orElseThrow(() -> new CustomException("Webhook config not found", HttpStatus.NOT_FOUND));
        
        webhookConfigRepository.delete(webhookConfig);
    }
    
    public boolean validateApiKey(String apiKey) {
        return findByApiKey(apiKey).isPresent();
    }
    
    public WebhookConfig getByApiKey(String apiKey) {
        return findByApiKey(apiKey)
                .orElseThrow(() -> new CustomException("Invalid API key", HttpStatus.UNAUTHORIZED));
    }
}