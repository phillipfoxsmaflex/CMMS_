package com.grash.service;

import com.grash.model.Role;
import com.grash.model.OwnUser;
import com.grash.model.enums.PermissionEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PermissionService {

    /**
     * Check if a user has VIEW permission for a specific entity
     */
    public boolean canView(OwnUser user, PermissionEntity entity) {
        if (user == null || user.getRole() == null) {
            return false;
        }
        return user.getRole().getViewPermissions().contains(entity);
    }

    /**
     * Check if a user has CREATE permission for a specific entity
     */
    public boolean canCreate(OwnUser user, PermissionEntity entity) {
        if (user == null || user.getRole() == null) {
            return false;
        }
        return user.getRole().getCreatePermissions().contains(entity);
    }

    /**
     * Check if a user has EDIT permission for a specific entity
     */
    public boolean canEdit(OwnUser user, PermissionEntity entity) {
        if (user == null || user.getRole() == null) {
            return false;
        }
        Role role = user.getRole();
        
        // Check new permission structure first
        if (role.getEditPermissions() != null && !role.getEditPermissions().isEmpty()) {
            return role.getEditPermissions().contains(entity);
        }
        
        // Fallback to legacy permission for backward compatibility
        return role.getEditOtherPermissions().contains(entity);
    }

    /**
     * Check if a user has DELETE permission for a specific entity
     */
    public boolean canDelete(OwnUser user, PermissionEntity entity) {
        if (user == null || user.getRole() == null) {
            return false;
        }
        Role role = user.getRole();
        
        // Check new permission structure first
        if (role.getDeletePermissions() != null && !role.getDeletePermissions().isEmpty()) {
            return role.getDeletePermissions().contains(entity);
        }
        
        // Fallback to legacy permission for backward compatibility
        return role.getDeleteOtherPermissions().contains(entity);
    }

    /**
     * Check if a user has a specific permission type for an entity
     */
    public boolean hasPermission(OwnUser user, PermissionEntity entity, PermissionAction action) {
        switch (action) {
            case VIEW:
                return canView(user, entity);
            case CREATE:
                return canCreate(user, entity);
            case EDIT:
                return canEdit(user, entity);
            case DELETE:
                return canDelete(user, entity);
            default:
                return false;
        }
    }

    /**
     * Permission action types
     */
    public enum PermissionAction {
        VIEW,
        CREATE,
        EDIT,
        DELETE
    }
}
