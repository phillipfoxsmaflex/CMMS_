package com.grash.repository;

import com.grash.model.WebhookConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WebhookConfigRepository extends JpaRepository<WebhookConfig, Long> {
    
    Optional<WebhookConfig> findByCompanyId(Long companyId);
    
    Optional<WebhookConfig> findByApiKey(String apiKey);
    
    boolean existsByCompanyId(Long companyId);
}