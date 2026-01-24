package com.grash.service;

import com.grash.model.CompanySettings;
import com.grash.model.OwnUser;
import com.grash.model.enums.RoleType;
import com.grash.repository.CompanySettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CompanySettingsService {
    private final CompanySettingsRepository companySettingsRepository;

    public CompanySettings create(CompanySettings CompanySettings) {
        return companySettingsRepository.save(CompanySettings);
    }

    public CompanySettings update(CompanySettings CompanySettings) {
        return companySettingsRepository.save(CompanySettings);
    }

    public Page<CompanySettings> getAll(Pageable paging) {
        return companySettingsRepository.findAll(paging);
    }

    public void delete(Long id) {
        companySettingsRepository.deleteById(id);
    }

    public Optional<CompanySettings> findById(Long id) {
        return companySettingsRepository.findById(id);
    }

    @Transactional
    public CompanySettings setAlertingDashboard(Long companySettingsId, String url, String config) {
        Optional<CompanySettings> optionalSettings = findById(companySettingsId);
        if (optionalSettings.isPresent()) {
            CompanySettings settings = optionalSettings.get();
            settings.setAlertingDashboardUrl(url);
            settings.setAlertingDashboardConfig(config);
            return companySettingsRepository.save(settings);
        }
        throw new EntityNotFoundException("CompanySettings not found with id: " + companySettingsId);
    }

    public Map<String, String> getAlertingDashboard(Long companySettingsId) {
        Optional<CompanySettings> optionalSettings = findById(companySettingsId);
        if (optionalSettings.isPresent()) {
            CompanySettings settings = optionalSettings.get();
            Map<String, String> config = new HashMap<>();
            config.put("url", settings.getAlertingDashboardUrl());
            config.put("config", settings.getAlertingDashboardConfig());
            return config;
        }
        throw new EntityNotFoundException("CompanySettings not found with id: " + companySettingsId);
    }
}
