export enum BasicPermission {
  CREATE_EDIT_PEOPLE_AND_TEAMS = 'CREATE_EDIT_PEOPLE_AND_TEAMS',
  CREATE_EDIT_CATEGORIES = 'CREATE_EDIT_CATEGORIES',
  DELETE_WORK_ORDERS = 'DELETE_WORK_ORDERS',
  DELETE_LOCATIONS = 'DELETE_LOCATIONS',
  DELETE_PREVENTIVE_MAINTENANCE_TRIGGERS = 'DELETE_PREVENTIVE_MAINTENANCE_TRIGGERS',
  DELETE_ASSETS = 'DELETE_ASSETS',
  DELETE_PARTS_AND_MULTI_PARTS = 'DELETE_PARTS_AND_MULTI_PARTS',
  DELETE_PURCHASE_ORDERS = 'DELETE_PURCHASE_ORDERS',
  DELETE_METERS = 'DELETE_METERS',
  DELETE_VENDORS_AND_CUSTOMERS = 'DELETE_VENDORS_AND_CUSTOMERS',
  DELETE_CATEGORIES = 'DELETE_CATEGORIES',
  DELETE_FILES = 'DELETE_FILES',
  DELETE_PEOPLE_AND_TEAMS = 'DELETE_PEOPLE_AND_TEAMS',
  ACCESS_SETTINGS = 'ACCESS_SETTINGS'
}

export enum PermissionEntity {
  // Verwaltung
  PEOPLE_AND_TEAMS = 'PEOPLE_AND_TEAMS',
  CATEGORIES = 'CATEGORIES',
  CATEGORIES_WEB = 'CATEGORIES_WEB',
  SETTINGS = 'SETTINGS',
  
  // Kernfunktionen
  WORK_ORDERS = 'WORK_ORDERS',
  PREVENTIVE_MAINTENANCES = 'PREVENTIVE_MAINTENANCES',
  REQUESTS = 'REQUESTS',
  
  // Assets & Standorte
  ASSETS = 'ASSETS',
  ASSET_HEALTH = 'ASSET_HEALTH',
  LOCATIONS = 'LOCATIONS',
  METERS = 'METERS',
  FLOOR_PLANS = 'FLOOR_PLANS',
  
  // Materialwirtschaft
  PARTS_AND_MULTIPARTS = 'PARTS_AND_MULTIPARTS',
  PURCHASE_ORDERS = 'PURCHASE_ORDERS',
  VENDORS_AND_CUSTOMERS = 'VENDORS_AND_CUSTOMERS',
  
  // Dokumente & Analysen
  DOCUMENTS = 'DOCUMENTS',
  ANALYTICS = 'ANALYTICS'
}
export type PermissionRoot =
  | 'viewPermissions'
  | 'createPermissions'
  | 'editPermissions'
  | 'deletePermissions'
  // Legacy (deprecated)
  | 'viewOtherPermissions'
  | 'editOtherPermissions'
  | 'deleteOtherPermissions';

export type RoleCode =
  | 'ADMIN'
  | 'LIMITED_ADMIN'
  | 'TECHNICIAN'
  | 'LIMITED_TECHNICIAN'
  | 'VIEW_ONLY'
  | 'REQUESTER'
  | 'USER_CREATED';

export interface Role {
  id: number;
  name: string;
  users: number;
  externalId?: string;
  description?: string;
  paid: boolean;
  code: RoleCode;
  
  // New simplified permission structure
  viewPermissions: PermissionEntity[];
  createPermissions: PermissionEntity[];
  editPermissions: PermissionEntity[];
  deletePermissions: PermissionEntity[];
  
  // Legacy fields (deprecated - kept for backward compatibility)
  viewOtherPermissions?: PermissionEntity[];
  editOtherPermissions?: PermissionEntity[];
  deleteOtherPermissions?: PermissionEntity[];
}
