package com.grash.controller;

import com.grash.dto.ContractorAssignmentDTO;
import com.grash.exception.CustomException;
import com.grash.mapper.CustomerMapper;
import com.grash.mapper.VendorMapper;
import com.grash.model.Customer;
import com.grash.model.OwnUser;
import com.grash.model.Vendor;
import com.grash.model.enums.PermissionEntity;
import com.grash.model.enums.RoleType;
import com.grash.service.CustomerService;
import com.grash.service.UserService;
import com.grash.service.VendorService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/contractor-assignments")
@Api(tags = "contractor-assignment")
@RequiredArgsConstructor
public class ContractorAssignmentController {

    private final VendorService vendorService;
    private final CustomerService customerService;
    private final UserService userService;
    private final VendorMapper vendorMapper;
    private final CustomerMapper customerMapper;

    @GetMapping("/mini")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    @ApiResponses(value = {
            @ApiResponse(code = 500, message = "Something went wrong"),
            @ApiResponse(code = 403, message = "Access denied"),
            @ApiResponse(code = 404, message = "No assignments found")})
    public Collection<ContractorAssignmentDTO> getMini(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        
        // Check permissions
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getViewPermissions().contains(PermissionEntity.VENDORS_AND_CUSTOMERS)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
        }
        
        // Get vendors
        Collection<Vendor> vendors = vendorService.findByCompany(user.getCompany().getId());
        List<ContractorAssignmentDTO> vendorDTOs = vendors.stream()
                .map(vendor -> new ContractorAssignmentDTO(
                        vendor.getId(),
                        vendor.getCompanyName(),
                        "VENDOR"
                ))
                .collect(Collectors.toList());
        
        // Get customers
        Collection<Customer> customers = customerService.findByCompany(user.getCompany().getId());
        List<ContractorAssignmentDTO> customerDTOs = customers.stream()
                .map(customer -> new ContractorAssignmentDTO(
                        customer.getId(),
                        customer.getName(),
                        "CUSTOMER"
                ))
                .collect(Collectors.toList());
        
        // Combine both lists
        List<ContractorAssignmentDTO> combined = new ArrayList<>();
        combined.addAll(vendorDTOs);
        combined.addAll(customerDTOs);
        
        return combined;
    }
}