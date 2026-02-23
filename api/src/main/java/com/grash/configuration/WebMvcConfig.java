package com.grash.configuration;

import com.grash.security.CurrentUserResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;


@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private static final long MAX_AGE_SECS = 3600;
    private final CurrentUserResolver currentUserResolver;
    @Value("${frontend.url}")
    private String frontendUrl;
    @Value("${api.host}")
    private String apiHost;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Build allowed origins from environment variables plus localhost for development
        List<String> allowedOriginsList = new java.util.ArrayList<>();
        
        // Add configured frontend URL
        if (frontendUrl != null && !frontendUrl.isEmpty()) {
            allowedOriginsList.add(frontendUrl);
        }
        
        // Add configured API host (remove /api suffix if present for CORS)
        if (apiHost != null && !apiHost.isEmpty()) {
            String corsOrigin = apiHost.endsWith("/api") 
                ? apiHost.substring(0, apiHost.length() - 4) 
                : apiHost;
            allowedOriginsList.add(corsOrigin);
        }
        
        // Add localhost URLs for development
        allowedOriginsList.add("http://localhost:3000");
        allowedOriginsList.add("http://localhost:8080");
        allowedOriginsList.add("http://localhost:12000");
        allowedOriginsList.add("http://localhost:12001");
        
        // Add local network IP for development
        allowedOriginsList.add("http://192.168.178.123:3000");
        allowedOriginsList.add("http://192.168.178.123:8080");
        
        String[] allowedOrigins = allowedOriginsList.toArray(new String[0]);
        
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("HEAD", "OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE")
                .allowCredentials(true)
                .maxAge(MAX_AGE_SECS);
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(currentUserResolver);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/")
                .addResourceLocations("file:/app/static/images/");
    }
}
