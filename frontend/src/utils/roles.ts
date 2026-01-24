import { PermissionEntity, PermissionRoot } from '../models/owns/role';

const allPermissionEntities = Object.values(PermissionEntity);

/**
 * New simplified permission system - All modules are available for all permission types
 * No more arbitrary exclusions. Admins can configure permissions granularly.
 */
export const defaultPermissions: Record<PermissionRoot, PermissionEntity[]> = {
  // All modules can be viewed
  viewPermissions: allPermissionEntities,
  
  // All modules support creation
  createPermissions: allPermissionEntities,
  
  // All modules can be edited
  editPermissions: allPermissionEntities,
  
  // All modules can be deleted
  deletePermissions: allPermissionEntities,
  
  // Legacy fields (kept for backward compatibility)
  viewOtherPermissions: allPermissionEntities,
  editOtherPermissions: allPermissionEntities,
  deleteOtherPermissions: allPermissionEntities
};

/**
 * Get human-readable name for a permission entity
 */
export const getModuleName = (entity: PermissionEntity): string => {
  const names: Record<PermissionEntity, string> = {
    [PermissionEntity.PEOPLE_AND_TEAMS]: 'Personen & Teams',
    [PermissionEntity.CATEGORIES]: 'Kategorien',
    [PermissionEntity.CATEGORIES_WEB]: 'Kategorien (Web)',
    [PermissionEntity.SETTINGS]: 'Einstellungen',
    [PermissionEntity.WORK_ORDERS]: 'Arbeitsaufträge',
    [PermissionEntity.PREVENTIVE_MAINTENANCES]: 'Präventive Wartung',
    [PermissionEntity.REQUESTS]: 'Anfragen',
    [PermissionEntity.ASSETS]: 'Anlagen',
    [PermissionEntity.ASSET_HEALTH]: 'Anlagenüberwachung',
    [PermissionEntity.LOCATIONS]: 'Standorte',
    [PermissionEntity.METERS]: 'Zähler',
    [PermissionEntity.FLOOR_PLANS]: 'Grundrisse',
    [PermissionEntity.PARTS_AND_MULTIPARTS]: 'Teile & Teilesätze',
    [PermissionEntity.PURCHASE_ORDERS]: 'Bestellungen',
    [PermissionEntity.VENDORS_AND_CUSTOMERS]: 'Lieferanten & Auftragnehmer',
    [PermissionEntity.DOCUMENTS]: 'Dokumentation',
    [PermissionEntity.ANALYTICS]: 'Analysen'
  };
  return names[entity] || entity;
};
