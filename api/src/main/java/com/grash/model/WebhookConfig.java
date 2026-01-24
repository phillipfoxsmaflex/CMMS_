package com.grash.model;

import com.grash.model.abstracts.CompanyAudit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import java.util.UUID;

@Entity
@Table(name = "webhook_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebhookConfig extends CompanyAudit {
    
    @NotNull
    private String apiKey;
    
    @NotNull
    @Builder.Default
    private boolean enabled = true;
    
    public static WebhookConfig createForCompany(Company company) {
        WebhookConfig config = new WebhookConfig();
        config.setCompany(company);
        config.setApiKey(UUID.randomUUID().toString());
        config.setEnabled(true);
        return config;
    }
    
    public void regenerateApiKey() {
        this.apiKey = UUID.randomUUID().toString();
    }
}