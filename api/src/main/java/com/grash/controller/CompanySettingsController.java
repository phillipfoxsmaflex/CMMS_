package com.grash.controller;

import com.grash.dto.DashboardConfigDTO;
import com.grash.exception.CustomException;
import com.grash.model.CompanySettings;
import com.grash.model.OwnUser;
import com.grash.service.CompanySettingsService;
import com.grash.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/company-settings")
@Api(tags = "companySettings")
@RequiredArgsConstructor
public class CompanySettingsController {

    private final CompanySettingsService companySettingsService;

    private final UserService userService;

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    @ApiResponses(value = {//
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "CompanySettings not found")})
    public CompanySettings getById(@ApiParam("id") @PathVariable("id") Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);

        Optional<CompanySettings> companySettingsOptional = companySettingsService.findById(id);
        if (companySettingsOptional.isPresent()) {
            return companySettingsService.findById(id).get();
        } else throw new CustomException("Not found", HttpStatus.NOT_FOUND);
    }

    @PostMapping("/{id}/alerting-dashboard")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiResponses(value = {//
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "CompanySettings not found")})
    public CompanySettings setAlertingDashboard(
            @ApiParam("id") @PathVariable("id") Long id,
            @Valid @RequestBody DashboardConfigDTO config,
            HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        Optional<CompanySettings> optionalSettings = companySettingsService.findById(id);
        if (optionalSettings.isPresent()) {
            CompanySettings settings = optionalSettings.get();
            if (settings.getCompany().getId().equals(user.getCompany().getId())) {
                return companySettingsService.setAlertingDashboard(id, config.getUrl(), config.getConfig());
            } else throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
        } else throw new CustomException("CompanySettings not found", HttpStatus.NOT_FOUND);
    }

    @GetMapping("/{id}/alerting-dashboard")
    @PreAuthorize("permitAll()")
    @ApiResponses(value = {//
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "CompanySettings not found")})
    public DashboardConfigDTO getAlertingDashboard(
            @ApiParam("id") @PathVariable("id") Long id,
            HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        Optional<CompanySettings> optionalSettings = companySettingsService.findById(id);
        if (optionalSettings.isPresent()) {
            CompanySettings settings = optionalSettings.get();
            if (settings.getCompany().getId().equals(user.getCompany().getId())) {
                Map<String, String> config = companySettingsService.getAlertingDashboard(id);
                return new DashboardConfigDTO(config.get("url"), config.get("config"));
            } else throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
        } else throw new CustomException("CompanySettings not found", HttpStatus.NOT_FOUND);
    }
}
