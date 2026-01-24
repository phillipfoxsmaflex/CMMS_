package com.grash.utils;


import com.grash.exception.CustomException;
import com.grash.model.Company;
import com.grash.model.OwnUser;
import com.grash.model.Role;
import com.grash.model.enums.Language;
import com.grash.model.enums.PermissionEntity;
import com.grash.model.enums.RoleCode;
import com.grash.model.enums.RoleType;
import com.grash.model.abstracts.WorkOrderBase;
import com.grash.dto.imports.WorkOrderImportDTO;
import com.grash.model.enums.Priority;
import com.grash.model.WorkOrderCategory;
import com.grash.model.Location;
import com.grash.model.Team;
import com.grash.model.Asset;
import com.grash.service.LocationService;
import com.grash.service.TeamService;
import com.grash.service.UserService;
import com.grash.service.AssetService;
import com.grash.service.WorkOrderCategoryService;
import com.grash.security.CustomUserDetail;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

public class Helper {

    public String generateString() {
        return UUID.randomUUID().toString();
    }

    public HttpHeaders getPagingHeaders(Page<?> page, int size, String name) {
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("Content-Range", name + (page.getNumber() - 1) * size + "-" + page.getNumber() * size +
                "/" + page.getTotalElements());
        responseHeaders.set("Access-Control-Expose-Headers", "Content-Range");
        return responseHeaders;
    }

    /**
     * Get a diff between two dates
     *
     * @param date1    the oldest date
     * @param date2    the newest date
     * @param timeUnit the unit in which you want the diff
     * @return the diff value, in the provided unit
     */
    public static long getDateDiff(Date date1, Date date2, TimeUnit timeUnit) {
        long diffInMillies = date2.getTime() - date1.getTime();
        return timeUnit.convert(diffInMillies, TimeUnit.MILLISECONDS);
    }

    public static boolean isValidEmailAddress(String email) {
        boolean result = true;
        try {
            InternetAddress emailAddr = new InternetAddress(email);
            emailAddr.validate();
        } catch (AddressException ex) {
            result = false;
        }
        return result;
    }

    public static Date incrementDays(Date date, int days) {
        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.add(Calendar.DATE, days);
        return c.getTime();
    }

    public static Date getNextOccurrence(Date date, int days) {
        if (days == 0)
            throw new CustomException("getNextOccurence should not have 0 as parameter",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        Date result = date;
        Date now = new Date();

        while (!result.after(now)) {
            result = incrementDays(result, days);
        }

        return result;
    }

    public static Date localDateToDate(LocalDate localDate) {
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    public static Date localDateTimeToDate(LocalDateTime localDateTime) {
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }

    public static LocalDate dateToLocalDate(Date date) {
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    }

    public static Date addSeconds(Date date, int seconds) {
        return new Date(date.getTime() + seconds * 1000);
    }

    public static Locale getLocale(OwnUser user) {
        return getLocale(user.getCompany());
    }

    public static Locale getLocale(Company company) {
        Language language = company.getCompanySettings().getGeneralPreferences().getLanguage();
        switch (language) {
            case FR:
                return Locale.FRANCE;
            case TR:
                return new Locale("tr", "TR");
            case ES:
                return new Locale("es", "ES");
            case PT_BR:
                return new Locale("pt", "BR");
            case PT:
                return new Locale("pt", "BR");
            case PL:
                return new Locale("pl", "PL");
            case DE:
                return new Locale("de", "DE");
            case AR:
                return new Locale("ar", "AR");
            case IT:
                return new Locale("it", "IT");
            case SV:
                return new Locale("sv", "SE");
            case RU:
                return new Locale("ru", "RU");
            case HU:
                return new Locale("hu", "HU");
            case NL:
                return new Locale("nl", "NL");
            case ZH_CN:
                return new Locale("zh", "CN");
            case ZH:
                return new Locale("zh", "CN");
            default:
                return Locale.getDefault();
        }
    }

    public static Date getDateFromJsString(String string) {
        DateFormat jsfmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        try {
            return jsfmt.parse(string);
        } catch (Exception exception) {
            return null;
        }
    }

    public static Date getDateFromExcelDate(Double excelDate) {
        if (excelDate == null) {
            return null;
        }
        try {
            //https://stackoverflow.com/questions/66985321/date-is-appearing-in-number-format-while-upload-import-excel-sheet-in-angular
            return new Date(Math.round((excelDate - 25569) * 24 * 60 * 60 * 1000));
        } catch (Exception exception) {
            return null;
        }
    }

    public static boolean isSameDay(Date date1, Date date2) {
        SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMdd");
        return fmt.format(date1).equals(fmt.format(date2));
    }

    public static String enumerate(Collection<String> strings) {
        StringBuilder stringBuilder = new StringBuilder();
        int size = strings.size();
        int index = 0;
        for (String string : strings) {
            stringBuilder.append(string);
            if (index < size - 1) {
                stringBuilder.append(",");
            }
        }
        return stringBuilder.toString();
    }

    public static boolean getBooleanFromString(String string) {
        List<String> trues = Arrays.asList("true", "Yes", "Oui", "Evet");
        return trues.stream().anyMatch(value -> value.equalsIgnoreCase(string));
    }

    public static String getStringFromBoolean(boolean bool, MessageSource messageSource, Locale locale) {
        return messageSource.getMessage(bool ? "Yes" : "No", null, locale);
    }

    public static boolean isNumeric(String str) {
        try {
            Double.parseDouble(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    public static <T> ResponseEntity<T> withCache(T entity) {
        CacheControl cacheControl = CacheControl.maxAge(30, TimeUnit.MINUTES).cachePublic();
        return ResponseEntity.ok()
                .cacheControl(cacheControl).body(entity);
    }

    public static Date minusDays(Date date, int days) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.add(Calendar.DAY_OF_MONTH, -days);

        // Get the resulting date after subtracting days
        return calendar.getTime();
    }

    public static List<Role> getDefaultRoles() {
        List<PermissionEntity> allEntities = Arrays.asList(PermissionEntity.values());
        
        // ADMIN - Full access to all modules
        return Arrays.asList(
                Role.builder()
                        .roleType(RoleType.ROLE_CLIENT)
                        .code(RoleCode.ADMIN)
                        .name("Administrator")
                        .paid(true)
                        .viewPermissions(new HashSet<>(allEntities))
                        .createPermissions(new HashSet<>(allEntities))
                        .editPermissions(new HashSet<>(allEntities))
                        .deletePermissions(new HashSet<>(allEntities))
                        // Legacy fields for backward compatibility
                        .editOtherPermissions(new HashSet<>(allEntities))
                        .deleteOtherPermissions(new HashSet<>(allEntities))
                        .viewOtherPermissions(new HashSet<>(allEntities))
                        .build(),
                
                // LIMITED_ADMIN - Full operational access except user management and system settings
                Role.builder()
                        .roleType(RoleType.ROLE_CLIENT)
                        .code(RoleCode.LIMITED_ADMIN)
                        .name("Limited Administrator")
                        .paid(true)
                        .viewPermissions(new HashSet<>(allEntities.stream()
                                .filter(e -> e != PermissionEntity.SETTINGS)
                                .collect(Collectors.toList())))
                        .createPermissions(new HashSet<>(Arrays.asList(
                                PermissionEntity.WORK_ORDERS,
                                PermissionEntity.PREVENTIVE_MAINTENANCES,
                                PermissionEntity.REQUESTS,
                                PermissionEntity.ASSETS,
                                PermissionEntity.ASSET_HEALTH,
                                PermissionEntity.LOCATIONS,
                                PermissionEntity.METERS,
                                PermissionEntity.FLOOR_PLANS,
                                PermissionEntity.PARTS_AND_MULTIPARTS,
                                PermissionEntity.PURCHASE_ORDERS,
                                PermissionEntity.VENDORS_AND_CUSTOMERS,
                                PermissionEntity.DOCUMENTS,
                                PermissionEntity.ANALYTICS
                        )))
                        .editPermissions(new HashSet<>(allEntities.stream()
                                .filter(e -> e != PermissionEntity.PEOPLE_AND_TEAMS && e != PermissionEntity.SETTINGS)
                                .collect(Collectors.toList())))
                        .deletePermissions(new HashSet<>(Arrays.asList(
                                PermissionEntity.WORK_ORDERS,
                                PermissionEntity.PREVENTIVE_MAINTENANCES,
                                PermissionEntity.REQUESTS,
                                PermissionEntity.ASSETS,
                                PermissionEntity.ASSET_HEALTH,
                                PermissionEntity.LOCATIONS,
                                PermissionEntity.METERS,
                                PermissionEntity.FLOOR_PLANS,
                                PermissionEntity.PARTS_AND_MULTIPARTS,
                                PermissionEntity.PURCHASE_ORDERS,
                                PermissionEntity.VENDORS_AND_CUSTOMERS,
                                PermissionEntity.DOCUMENTS,
                                PermissionEntity.ANALYTICS
                        )))
                        // Legacy fields
                        .editOtherPermissions(new HashSet<>(allEntities.stream()
                                .filter(e -> e != PermissionEntity.PEOPLE_AND_TEAMS)
                                .collect(Collectors.toList())))
                        .deleteOtherPermissions(new HashSet<>())
                        .viewOtherPermissions(new HashSet<>(allEntities))
                        .build(),
                
                // TECHNICIAN - Can work with work orders, assets, and related entities
                Role.builder()
                        .roleType(RoleType.ROLE_CLIENT)
                        .code(RoleCode.TECHNICIAN)
                        .name("Technician")
                        .paid(true)
                        .viewPermissions(new HashSet<>(Arrays.asList(
                                PermissionEntity.PEOPLE_AND_TEAMS,
                                PermissionEntity.CATEGORIES,
                                PermissionEntity.WORK_ORDERS,
                                PermissionEntity.PREVENTIVE_MAINTENANCES,
                                PermissionEntity.REQUESTS,
                                PermissionEntity.ASSETS,
                                PermissionEntity.ASSET_HEALTH,
                                PermissionEntity.LOCATIONS,
                                PermissionEntity.METERS,
                                PermissionEntity.FLOOR_PLANS,
                                PermissionEntity.PARTS_AND_MULTIPARTS,
                                PermissionEntity.PURCHASE_ORDERS,
                                PermissionEntity.VENDORS_AND_CUSTOMERS,
                                PermissionEntity.DOCUMENTS,
                                PermissionEntity.ANALYTICS
                        )))
                        .createPermissions(new HashSet<>(Arrays.asList(
                                PermissionEntity.WORK_ORDERS,
                                PermissionEntity.REQUESTS,
                                PermissionEntity.ASSETS,
                                PermissionEntity.LOCATIONS,
                                PermissionEntity.DOCUMENTS
                        )))
                        .editPermissions(new HashSet<>(Arrays.asList(
                                PermissionEntity.WORK_ORDERS,
                                PermissionEntity.PREVENTIVE_MAINTENANCES,
                                PermissionEntity.REQUESTS,
                                PermissionEntity.ASSETS,
                                PermissionEntity.ASSET_HEALTH,
                                PermissionEntity.LOCATIONS,
                                PermissionEntity.METERS,
                                PermissionEntity.PARTS_AND_MULTIPARTS,
                                PermissionEntity.PURCHASE_ORDERS,
                                PermissionEntity.DOCUMENTS
                        )))
                        .deletePermissions(new HashSet<>(Arrays.asList(
                                PermissionEntity.WORK_ORDERS,
                                PermissionEntity.REQUESTS,
                                PermissionEntity.DOCUMENTS
                        )))
                        // Legacy fields
                        .editOtherPermissions(new HashSet<>())
                        .deleteOtherPermissions(new HashSet<>())
                        .viewOtherPermissions(new HashSet<>(Arrays.asList(
                                PermissionEntity.WORK_ORDERS,
                                PermissionEntity.PARTS_AND_MULTIPARTS,
                                PermissionEntity.LOCATIONS,
                                PermissionEntity.ASSETS)))
                        .build(),
                
                // LIMITED_TECHNICIAN - Can view and edit work orders but limited creation/deletion
                Role.builder()
                        .roleType(RoleType.ROLE_CLIENT)
                        .code(RoleCode.LIMITED_TECHNICIAN)
                        .name("Limited Technician")
                        .paid(true)
                        .viewPermissions(new HashSet<>(Arrays.asList(
                                PermissionEntity.PEOPLE_AND_TEAMS,
                                PermissionEntity.CATEGORIES,
                                PermissionEntity.WORK_ORDERS,
                                PermissionEntity.PREVENTIVE_MAINTENANCES,
                                PermissionEntity.REQUESTS,
                                PermissionEntity.ASSETS,
                                PermissionEntity.ASSET_HEALTH,
                                PermissionEntity.LOCATIONS,
                                PermissionEntity.METERS,
                                PermissionEntity.FLOOR_PLANS,
                                PermissionEntity.PARTS_AND_MULTIPARTS,
                                PermissionEntity.DOCUMENTS,
                                PermissionEntity.ANALYTICS
                        )))
                        .createPermissions(new HashSet<>(Arrays.asList(
                                PermissionEntity.WORK_ORDERS,
                                PermissionEntity.REQUESTS
                        )))
                        .editPermissions(new HashSet<>(Arrays.asList(
                                PermissionEntity.WORK_ORDERS,
                                PermissionEntity.REQUESTS
                        )))
                        .deletePermissions(new HashSet<>())
                        // Legacy fields
                        .editOtherPermissions(new HashSet<>())
                        .deleteOtherPermissions(new HashSet<>())
                        .viewOtherPermissions(new HashSet<>(Arrays.asList(
                                PermissionEntity.ASSETS,
                                PermissionEntity.PARTS_AND_MULTIPARTS,
                                PermissionEntity.LOCATIONS)))
                        .build(),
                
                // VIEW_ONLY - Read-only access to all modules except settings
                Role.builder()
                        .roleType(RoleType.ROLE_CLIENT)
                        .code(RoleCode.VIEW_ONLY)
                        .name("View Only")
                        .paid(false)
                        .viewPermissions(new HashSet<>(allEntities.stream()
                                .filter(e -> e != PermissionEntity.SETTINGS)
                                .collect(Collectors.toList())))
                        .createPermissions(new HashSet<>())
                        .editPermissions(new HashSet<>())
                        .deletePermissions(new HashSet<>())
                        // Legacy fields
                        .editOtherPermissions(new HashSet<>())
                        .deleteOtherPermissions(new HashSet<>())
                        .viewOtherPermissions(new HashSet<>(allEntities))
                        .build(),
                
                // REQUESTER - Self-service role for creating requests
                Role.builder()
                        .roleType(RoleType.ROLE_CLIENT)
                        .code(RoleCode.REQUESTER)
                        .name("Requester")
                        .paid(false)
                        .viewPermissions(new HashSet<>(Arrays.asList(
                                PermissionEntity.WORK_ORDERS,
                                PermissionEntity.REQUESTS,
                                PermissionEntity.ASSETS,
                                PermissionEntity.LOCATIONS,
                                PermissionEntity.FLOOR_PLANS,
                                PermissionEntity.DOCUMENTS,
                                PermissionEntity.CATEGORIES
                        )))
                        .createPermissions(new HashSet<>(Arrays.asList(
                                PermissionEntity.REQUESTS
                        )))
                        .editPermissions(new HashSet<>())
                        .deletePermissions(new HashSet<>())
                        // Legacy fields
                        .editOtherPermissions(new HashSet<>())
                        .deleteOtherPermissions(new HashSet<>())
                        .viewOtherPermissions(new HashSet<>())
                        .build()
        );
    }

    public static boolean isLocalhost(String urlString) {
        try {
            URL url = new URL(urlString);
            String host = url.getHost();

            // Check for common localhost values
            if ("localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host) || "::1".equals(host)) {
                return true;
            }

            // Resolve hostname to IP address and check if it's a local address
            InetAddress address = InetAddress.getByName(host);
            return address.isLoopbackAddress();

        } catch (MalformedURLException | UnknownHostException e) {
            // Use logger instead of printStackTrace to avoid potential response contamination
            // e.printStackTrace();
        }
        return false;
    }

    public static void populateWorkOrderBaseFromImportDTO(
            WorkOrderBase workOrderBase,
            WorkOrderImportDTO dto,
            Company company,
            LocationService locationService,
            TeamService teamService,
            UserService userService,
            AssetService assetService,
            WorkOrderCategoryService workOrderCategoryService
    ) {
        Long companyId = company.getId();
        Long companySettingsId = company.getCompanySettings().getId();

        workOrderBase.setTitle(dto.getTitle());
        workOrderBase.setDescription(dto.getDescription());
        workOrderBase.setPriority(Priority.getPriorityFromString(dto.getPriority()));
        workOrderBase.setEstimatedDuration(dto.getEstimatedDuration());

        Optional<WorkOrderCategory> optionalWorkOrderCategory =
                workOrderCategoryService.findByNameIgnoreCaseAndCompanySettings(dto.getCategory(), companySettingsId);
        optionalWorkOrderCategory.ifPresent(workOrderBase::setCategory);

        Optional<Location> optionalLocation = locationService.findByNameIgnoreCaseAndCompany(dto.getLocationName(),
                companyId).stream().findFirst();
        optionalLocation.ifPresent(workOrderBase::setLocation);

        Optional<Team> optionalTeam = teamService.findByNameIgnoreCaseAndCompany(dto.getTeamName(), companyId);
        optionalTeam.ifPresent(workOrderBase::setTeam);

        Optional<OwnUser> optionalPrimaryUser = userService.findByEmailAndCompany(dto.getPrimaryUserEmail(), companyId);
        optionalPrimaryUser.ifPresent(workOrderBase::setPrimaryUser);

        List<OwnUser> assignedTo = new ArrayList<>();
        dto.getAssignedToEmails().forEach(email -> {
            Optional<OwnUser> optionalUser1 = userService.findByEmailAndCompany(email, companyId);
            optionalUser1.ifPresent(assignedTo::add);
        });
        workOrderBase.setAssignedTo(assignedTo);

        Optional<Asset> optionalAsset =
                assetService.findByNameIgnoreCaseAndCompany(dto.getAssetName(), companyId).stream().findFirst();
        optionalAsset.ifPresent(workOrderBase::setAsset);
    }

    public static void setCurrentUser(OwnUser user) {
        CustomUserDetail customUserDetail =
                CustomUserDetail.builder().user(user).build();
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                customUserDetail,
                null,
                customUserDetail.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

}
