package com.grash.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.grash.utils.FingerprintGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class LicenseService {

    private final ObjectMapper objectMapper;
    @Value("${license-key:#{null}}")
    private String licenseKey;

    @Value("${license-fingerprint-required}")
    private boolean licenseFingerprintRequired;

    private final RestTemplate restTemplate = new RestTemplate();

    private boolean lastLicenseValidity = false;
    private long lastCheckedTime = 0; // in milliseconds
    private static final long TWELVE_HOUR_MILLIS = 12 * 60 * 60 * 1000;

    public synchronized boolean isLicenseValid() {
        // LICENSE CHECK DISABLED - Always return true for self-hosted usage
        // Original license validation code has been removed
        return true;
    }

    public boolean isSSOEnabled() {
        return isLicenseValid();
    }
}
