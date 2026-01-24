# MMS Postgres Datenbankstruktur

**Erstellt am:** 2026-01-15  
**Zweck:** Übersicht für Grafana Dashboard-Entwicklung

---

## Inhaltsverzeichnis

- [Core Assets](#core-assets)
- [Work Management](#work-management)
- [Inventory](#inventory)
- [Locations](#locations)
- [People & Teams](#people--teams)
- [Monitoring](#monitoring)
- [Purchasing](#purchasing)
- [System](#system)
- [Checklists & Tasks](#checklists--tasks)
- [Workflows](#workflows)
- [Documents](#documents)
- [Other](#other)

---

## Core Assets

### Asset (`asset`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `customId` | VARCHAR(255) | ✓ |  |
| `archived` | BOOLEAN | ✓ | Archiviert? |
| `image` | VARCHAR(255) | ✓ |  |
| `location_id` | VARCHAR(255) | ✓ |  |
| `parentAsset_id` | VARCHAR(255) | ✓ |  |
| `area_id` | VARCHAR(255) | ✓ |  |
| `description_id` | VARCHAR(255) | ✓ | Beschreibung |
| `barCode_id` | VARCHAR(255) | ✓ |  |
| `category_id` | VARCHAR(255) | ✓ |  |
| `name_id` | VARCHAR(255) | ✓ | Name |
| `primaryUser_id` | VARCHAR(255) | ✗ |  |
| `acquisitionCost_id` | DOUBLE PRECISION | ✓ |  |
| `nfcId_id` | VARCHAR(255) | ✓ |  |
| `isDemo_id` | BOOLEAN | ✓ |  |
| `deprecation` | VARCHAR(255) | ✓ |  |
| `warrantyExpirationDate_id` | TIMESTAMP | ✓ |  |
| `inServiceDate_id` | TIMESTAMP | ✓ |  |
| `additionalInfos_id` | VARCHAR(255) | ✓ |  |
| `serialNumber_id` | VARCHAR(255) | ✓ |  |
| `model` | VARCHAR(255) | ✓ |  |
| `power` | VARCHAR(255) | ✓ |  |
| `manufacturer` | VARCHAR(255) | ✓ |  |
| `floorPlan` | VARCHAR(255) | ✓ |  |
| `positionX_id` | DOUBLE PRECISION | ✓ |  |
| `positionY_id` | DOUBLE PRECISION | ✓ |  |
| `dashboardUrl_id` | VARCHAR(255) | ✓ |  |
| `dashboardConfig` | VARCHAR(512) | ✓ |  |

### AssetCategory (`assetcategory`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |

### AssetDowntime (`assetdowntime`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `asset` | VARCHAR(255) | ✓ |  |
| `startsOn` | TIMESTAMP | ✓ |  |

### AssetHotspot (`asset_hotspot`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `asset` | VARCHAR(255) | ✓ |  |
| `locationImage_id` | VARCHAR(255) | ✗ |  |
| `xPosition_id` | DOUBLE PRECISION | ✗ |  |
| `x_position` | DOUBLE PRECISION | ✗ |  |
| `y_position` | VARCHAR(255) | ✗ |  |
| `createdAt` | TIMESTAMP | ✗ |  |
| `created_at` | TIMESTAMP | ✗ | Erstellungsdatum |

## Work Management

### PreventiveMaintenance (`preventivemaintenance`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `customId` | VARCHAR(255) | ✓ |  |
| `name` | VARCHAR(255) | ✓ | Name |
| `isDemo` | BOOLEAN | ✓ |  |

### Schedule (`schedule`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `disabled` | BOOLEAN | ✓ |  |
| `endsOn` | TIMESTAMP | ✗ |  |
| `dueDateDelay` | INTEGER | ✗ |  |
| `isDemo` | BOOLEAN | ✓ |  |
| `preventiveMaintenance` | VARCHAR(255) | ✓ |  |

### WorkOrder (`workorder`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `customId` | VARCHAR(255) | ✓ |  |
| `completedBy` | VARCHAR(255) | ✓ |  |
| `completedOn_id` | TIMESTAMP | ✓ |  |
| `signature` | VARCHAR(255) | ✓ |  |
| `archived` | BOOLEAN | ✓ | Archiviert? |
| `isDemo` | BOOLEAN | ✓ |  |
| `parentRequest` | VARCHAR(255) | ✓ |  |
| `feedback_id` | VARCHAR(255) | ✓ |  |
| `parentPreventiveMaintenance` | VARCHAR(255) | ✓ |  |
| `firstTimeToReact_id` | TIMESTAMP | ✓ |  |

### WorkOrderCategory (`workordercategory`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |

### WorkOrderConfiguration (`workorderconfiguration`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `companySettings` | VARCHAR(255) | ✓ |  |

### WorkOrderHistory (`workorderhistory`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `name` | VARCHAR(255) | ✓ | Name |
| `user` | VARCHAR(255) | ✗ |  |
| `workOrder_id` | VARCHAR(255) | ✗ |  |

## Inventory

### MultiParts (`multiparts`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `name` | VARCHAR(255) | ✓ | Name |

### Part (`part`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `name` | VARCHAR(255) | ✓ | Name |
| `cost` | DOUBLE PRECISION | ✗ | Kosten |
| `isDemo` | BOOLEAN | ✗ |  |
| `barcode` | VARCHAR(255) | ✓ |  |
| `description` | VARCHAR(255) | ✓ | Beschreibung |
| `category` | VARCHAR(255) | ✓ |  |
| `quantity_id` | DOUBLE PRECISION | ✓ | Menge |
| `area_id` | VARCHAR(255) | ✓ |  |
| `additionalInfos_id` | VARCHAR(255) | ✓ |  |
| `nonStock_id` | BOOLEAN | ✓ |  |
| `image` | VARCHAR(255) | ✓ |  |
| `unit` | VARCHAR(255) | ✓ |  |

**Beziehungen:**
- `minQuantity`: double

### PartCategory (`partcategory`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |

### PartConsumption (`partconsumption`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `quantity` | DOUBLE PRECISION | ✓ | Menge |
| `part` | VARCHAR(255) | ✗ |  |
| `workOrder_id` | VARCHAR(255) | ✗ |  |

### PartQuantity (`partquantity`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `quantity` | DOUBLE PRECISION | ✓ | Menge |
| `part` | VARCHAR(255) | ✗ |  |
| `purchaseOrder_id` | VARCHAR(255) | ✗ |  |
| `workOrder_id` | VARCHAR(255) | ✓ |  |
| `isDemo_id` | BOOLEAN | ✓ |  |

## Locations

### FloorPlan (`floorplan`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `name` | VARCHAR(255) | ✓ | Name |
| `image` | VARCHAR(255) | ✗ |  |
| `area_id` | BIGINT | ✗ |  |
| `imageWidth_id` | INTEGER | ✓ |  |
| `imageHeight_id` | INTEGER | ✓ |  |
| `display_order` | VARCHAR(255) | ✓ |  |

### Location (`location`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `customId` | VARCHAR(255) | ✓ |  |
| `name` | VARCHAR(255) | ✓ | Name |
| `address` | VARCHAR(255) | ✗ |  |
| `longitude` | DOUBLE PRECISION | ✗ |  |
| `latitude` | DOUBLE PRECISION | ✗ |  |
| `isDemo` | BOOLEAN | ✓ |  |
| `parentLocation` | VARCHAR(255) | ✓ |  |
| `image_id` | VARCHAR(255) | ✓ |  |

## People & Teams

### ContractorEmployee (`contractoremployee`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `vendor` | VARCHAR(255) | ✓ |  |
| `vendorId_id` | BIGINT | ✓ |  |
| `firstName` | VARCHAR(255) | ✓ |  |
| `lastName` | VARCHAR(255) | ✓ |  |
| `email` | VARCHAR(255) | ✓ |  |
| `phone` | VARCHAR(255) | ✓ |  |
| `position` | VARCHAR(255) | ✓ |  |
| `currentSafetyInstruction` | VARCHAR(255) | ✓ |  |
| `currentSafetyInstructionId_id` | BIGINT | ✓ |  |
| `createdBy` | VARCHAR(255) | ✓ |  |

### Customer (`customer`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `customerType` | VARCHAR(255) | ✓ |  |
| `description` | VARCHAR(255) | ✓ | Beschreibung |
| `rate` | BIGINT | ✓ |  |
| `billingName` | VARCHAR(255) | ✓ |  |
| `billingAddress` | VARCHAR(255) | ✓ |  |
| `billingAddress2` | VARCHAR(255) | ✓ |  |
| `billingCurrency` | VARCHAR(255) | ✓ |  |
| `isDemo_id` | BOOLEAN | ✓ |  |

### OwnUser (`ownuser`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `firstName` | VARCHAR(255) | ✓ |  |
| `lastName` | VARCHAR(255) | ✗ |  |
| `rate` | BIGINT | ✗ |  |
| `image` | VARCHAR(255) | ✗ |  |
| `email_id` | VARCHAR(255) | ✓ |  |
| `phone_id` | VARCHAR(255) | ✗ |  |
| `role_id` | VARCHAR(255) | ✗ |  |
| `jobTitle_id` | VARCHAR(255) | ✗ |  |
| `username_id` | VARCHAR(255) | ✗ |  |
| `password_id` | VARCHAR(255) | ✗ |  |
| `lastLogin` | TIMESTAMP | ✗ |  |
| `enabled` | BOOLEAN | ✗ |  |
| `company` | VARCHAR(255) | ✓ |  |
| `ownsCompany_id` | BOOLEAN | ✓ |  |
| `location_id` | VARCHAR(255) | ✓ |  |
| `ssoProvider_id` | VARCHAR(255) | ✓ |  |
| `ssoProviderId_id` | VARCHAR(255) | ✓ |  |
| `T_Asset_User_Associations` | VARCHAR(255) | ✓ |  |
| `T_Asset_User_Associations` | VARCHAR(255) | ✓ |  |
| `T_Asset_User_Associations` | VARCHAR(255) | ✓ |  |
| `T_Asset_User_Associations` | VARCHAR(255) | ✓ |  |
| `T_Asset_User_Associations` | VARCHAR(255) | ✓ |  |
| `T_Asset_User_Associations` | VARCHAR(255) | ✓ |  |
| `T_Asset_User_Associations` | VARCHAR(255) | ✓ |  |
| `T_Asset_User_Associations` | VARCHAR(255) | ✓ |  |

**Beziehungen:**
- `T_Asset_User_Associations`: SuperAccountRelation

### Role (`role`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `roleType` | VARCHAR(255) | ✓ |  |
| `paid` | BOOLEAN | ✗ |  |
| `name` | VARCHAR(255) | ✓ | Name |
| `description` | VARCHAR(255) | ✗ | Beschreibung |
| `externalId` | VARCHAR(255) | ✗ |  |
| `companySettings` | VARCHAR(255) | ✓ |  |

### Team (`team`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `name` | VARCHAR(255) | ✓ | Name |
| `description` | VARCHAR(255) | ✗ | Beschreibung |

### Vendor (`vendor`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `vendorType` | VARCHAR(255) | ✓ |  |
| `companyName` | VARCHAR(255) | ✓ |  |
| `description` | VARCHAR(255) | ✗ | Beschreibung |
| `rate` | BIGINT | ✗ |  |
| `isDemo` | BOOLEAN | ✗ |  |

## Monitoring

### Labor (`labor`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `assignedTo` | VARCHAR(255) | ✓ |  |
| `hourlyRate_id` | BIGINT | ✓ |  |
| `isDemo_id` | BOOLEAN | ✓ |  |
| `startedAt` | TIMESTAMP | ✓ |  |
| `timeCategory` | VARCHAR(255) | ✗ |  |
| `workOrder_id` | VARCHAR(255) | ✓ |  |

### Meter (`meter`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `name` | VARCHAR(255) | ✓ | Name |
| `unit` | VARCHAR(255) | ✗ |  |
| `updateFrequency` | INTEGER | ✗ |  |
| `meterCategory` | VARCHAR(255) | ✗ |  |
| `image_id` | VARCHAR(255) | ✓ |  |
| `isDemo_id` | BOOLEAN | ✓ |  |
| `location` | VARCHAR(255) | ✓ |  |
| `asset_id` | VARCHAR(255) | ✓ |  |

### Reading (`reading`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `value` | DOUBLE PRECISION | ✓ | Wert |
| `meter` | VARCHAR(255) | ✓ |  |

## Purchasing

### AdditionalCost (`additionalcost`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `description` | VARCHAR(255) | ✓ | Beschreibung |
| `assignedTo` | VARCHAR(255) | ✓ |  |
| `includeToTotalCost_id` | BOOLEAN | ✓ |  |
| `date_id` | TIMESTAMP | ✓ |  |
| `isDemo_id` | BOOLEAN | ✓ |  |
| `workOrder_id` | VARCHAR(255) | ✓ |  |

### PurchaseOrder (`purchaseorder`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `name` | VARCHAR(255) | ✓ | Name |
| `category` | VARCHAR(255) | ✗ |  |
| `shippingDueDate_id` | TIMESTAMP | ✓ |  |
| `shippingAdditionalDetail_id` | VARCHAR(255) | ✓ |  |
| `shippingShipToName_id` | VARCHAR(255) | ✓ |  |
| `shippingCompanyName_id` | VARCHAR(255) | ✓ |  |
| `shippingAddress` | VARCHAR(255) | ✓ |  |
| `shippingCity` | VARCHAR(255) | ✓ |  |
| `shippingState` | VARCHAR(255) | ✓ |  |
| `shippingZipCode` | VARCHAR(255) | ✓ |  |
| `shippingPhone` | VARCHAR(255) | ✓ |  |
| `shippingFax` | VARCHAR(255) | ✓ |  |
| `additionalInfoDate` | TIMESTAMP | ✓ |  |
| `additionalInfoRequisitionedName` | VARCHAR(255) | ✓ |  |
| `additionalInfoShippingOrderCategory` | VARCHAR(255) | ✓ |  |
| `additionalInfoTerm` | VARCHAR(255) | ✓ |  |
| `additionalInfoNotes` | VARCHAR(255) | ✓ |  |
| `vendor` | VARCHAR(255) | ✓ |  |
| `requesterInformation_id` | VARCHAR(255) | ✓ |  |

### PurchaseOrderCategory (`purchaseordercategory`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |

## System

### Company (`company`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `name` | VARCHAR(255) | ✓ | Name |
| `address` | VARCHAR(255) | ✓ |  |
| `phone` | VARCHAR(255) | ✓ |  |
| `website` | VARCHAR(255) | ✓ |  |
| `email` | VARCHAR(255) | ✓ |  |
| `employeesCount` | INTEGER | ✓ |  |
| `logo` | VARCHAR(255) | ✓ |  |
| `city_id` | VARCHAR(255) | ✓ |  |
| `state_id` | VARCHAR(255) | ✓ |  |
| `zipCode_id` | VARCHAR(255) | ✓ |  |
| `subscription_id` | VARCHAR(255) | ✓ |  |
| `demo_id` | BOOLEAN | ✓ |  |

### CompanySettings (`companysettings`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `company_id` | VARCHAR(255) | ✓ |  |
| `assetFieldsConfiguration_id` | VARCHAR(255) | ✓ |  |
| `alertingDashboardConfig` | VARCHAR(512) | ✓ |  |

**Beziehungen:**
- `alertingDashboardUrl`: String

### GeneralPreferences (`generalpreferences`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `currency` | VARCHAR(255) | ✓ |  |
| `timeZone_id` | VARCHAR(255) | ✓ |  |
| `autoAssignWorkOrders_id` | BOOLEAN | ✓ |  |
| `autoAssignRequests` | BOOLEAN | ✓ |  |
| `disableClosedWorkOrdersNotif` | BOOLEAN | ✓ |  |
| `simplifiedWorkOrder` | BOOLEAN | ✓ |  |
| `companySettings` | VARCHAR(255) | ✓ |  |

### Notification (`notification`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `message` | VARCHAR(255) | ✓ |  |
| `seen` | BOOLEAN | ✗ |  |
| `user` | VARCHAR(255) | ✗ |  |
| `notificationType_id` | VARCHAR(255) | ✓ |  |
| `resourceId_id` | BIGINT | ✓ |  |

### UiConfiguration (`uiconfiguration`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `companySettings` | VARCHAR(255) | ✓ |  |

## Checklists & Tasks

### Checklist (`checklist`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `companySettings` | VARCHAR(255) | ✗ |  |

**Beziehungen:**
- `name`: String
- `description`: String
- `category`: String

### Task (`task`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `taskBase` | VARCHAR(255) | ✓ |  |
| `notes_id` | VARCHAR(255) | ✗ |  |
| `value_id` | VARCHAR(255) | ✗ | Wert |
| `preventiveMaintenance_id` | VARCHAR(255) | ✓ |  |

**Beziehungen:**
- `workOrder`: WorkOrder

### TaskBase (`taskbase`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `label` | VARCHAR(255) | ✓ |  |
| `user` | VARCHAR(255) | ✓ |  |
| `asset_id` | VARCHAR(255) | ✓ |  |
| `meter_id` | VARCHAR(255) | ✓ |  |

### TaskOption (`taskoption`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `label` | VARCHAR(255) | ✓ |  |
| `taskBase` | VARCHAR(255) | ✓ |  |

## Workflows

### Workflow (`workflow`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `title` | VARCHAR(255) | ✓ |  |
| `mainCondition` | VARCHAR(255) | ✗ |  |

**Beziehungen:**
- `action`: WorkflowAction

### WorkflowAction (`workflowaction`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `workOrderAction` | VARCHAR(255) | ✓ |  |
| `requestAction` | VARCHAR(255) | ✓ |  |
| `purchaseOrderAction` | VARCHAR(255) | ✓ |  |
| `partAction` | VARCHAR(255) | ✓ |  |
| `taskAction` | VARCHAR(255) | ✓ |  |
| `priority` | VARCHAR(255) | ✓ | Priorität |
| `asset` | VARCHAR(255) | ✓ |  |
| `location_id` | VARCHAR(255) | ✓ |  |
| `user_id` | VARCHAR(255) | ✓ |  |
| `team_id` | VARCHAR(255) | ✓ |  |
| `workOrderCategory_id` | VARCHAR(255) | ✓ |  |
| `checklist_id` | VARCHAR(255) | ✓ |  |
| `vendor_id` | VARCHAR(255) | ✓ |  |
| `purchaseOrderCategory_id` | VARCHAR(255) | ✓ |  |
| `value_id` | VARCHAR(255) | ✓ | Wert |
| `assetStatus_id` | VARCHAR(255) | ✓ |  |
| `numberValue` | INTEGER | ✓ |  |

### WorkflowCondition (`workflowcondition`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `workOrderCondition` | VARCHAR(255) | ✓ |  |
| `requestCondition` | VARCHAR(255) | ✓ |  |
| `purchaseOrderCondition` | VARCHAR(255) | ✓ |  |
| `partCondition` | VARCHAR(255) | ✓ |  |
| `taskCondition` | VARCHAR(255) | ✓ |  |
| `priority` | VARCHAR(255) | ✓ | Priorität |
| `asset` | VARCHAR(255) | ✓ |  |
| `location_id` | VARCHAR(255) | ✓ |  |
| `user_id` | VARCHAR(255) | ✓ |  |
| `team_id` | VARCHAR(255) | ✓ |  |
| `vendor_id` | VARCHAR(255) | ✓ |  |
| `part_id` | VARCHAR(255) | ✓ |  |
| `workOrderCategory_id` | VARCHAR(255) | ✓ |  |
| `purchaseOrderCategory_id` | VARCHAR(255) | ✓ |  |
| `workOrderStatus_id` | VARCHAR(255) | ✓ |  |
| `purchaseOrderStatus_id` | VARCHAR(255) | ✓ |  |
| `createdTimeStart` | INTEGER | ✓ |  |
| `createdTimeEnd` | INTEGER | ✓ |  |
| `startDate` | TIMESTAMP | ✓ |  |
| `endDate` | TIMESTAMP | ✓ |  |
| `label` | VARCHAR(255) | ✓ |  |
| `value` | VARCHAR(255) | ✓ | Wert |
| `numberValue` | INTEGER | ✓ |  |

## Documents

### Document (`document`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `name` | VARCHAR(255) | ✓ | Name |
| `description` | VARCHAR(255) | ✗ | Beschreibung |
| `filePath` | TEXT | ✓ |  |
| `fileSize` | BIGINT | ✓ |  |
| `mimeType` | VARCHAR(500) | ✓ |  |
| `createdByUser` | VARCHAR(255) | ✓ |  |
| `parentDocument_id` | VARCHAR(255) | ✓ |  |
| `entityType` | VARCHAR(255) | ✗ |  |
| `entityId` | BIGINT | ✗ |  |

### DocumentPermission (`documentpermission`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `document` | VARCHAR(255) | ✓ |  |
| `user_id` | VARCHAR(255) | ✗ |  |
| `role_id` | VARCHAR(255) | ✓ |  |
| `permissionType_id` | VARCHAR(255) | ✓ |  |

### File (`file`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `name` | VARCHAR(255) | ✓ | Name |
| `path` | VARCHAR(255) | ✗ |  |
| `task` | VARCHAR(255) | ✓ |  |

## Other

### ContractorCalendarEntry (`contractorcalendarentry`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `vendor` | VARCHAR(255) | ✓ |  |
| `workOrder_id` | VARCHAR(255) | ✓ |  |
| `employee_id` | VARCHAR(255) | ✓ |  |
| `supervisor_id` | VARCHAR(255) | ✓ |  |
| `startTime_id` | TIMESTAMP | ✓ |  |
| `endTime_id` | TIMESTAMP | ✓ |  |
| `description_id` | VARCHAR(255) | ✓ | Beschreibung |
| `locationDetails_id` | VARCHAR(255) | ✓ |  |
| `status` | VARCHAR(255) | ✓ | Status |
| `createdBy` | VARCHAR(255) | ✓ |  |

### CostCategory (`costcategory`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |

### Currency (`currency`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `name` | VARCHAR(255) | ✓ | Name |
| `code` | VARCHAR(255) | ✗ |  |

### CustomField (`customfield`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `name` | VARCHAR(255) | ✓ | Name |
| `value` | VARCHAR(255) | ✗ | Wert |
| `vendor` | VARCHAR(255) | ✗ |  |

### CustomSequence (`customsequence`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `company` | VARCHAR(255) | ✓ |  |

### Deprecation (`deprecation`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `purchasePrice` | BIGINT | ✓ |  |
| `purchaseDate` | TIMESTAMP | ✓ |  |
| `residualValue` | VARCHAR(255) | ✓ |  |
| `usefulLIfe` | VARCHAR(255) | ✓ |  |
| `rate` | INTEGER | ✓ |  |
| `currentValue` | BIGINT | ✓ |  |

### FieldConfiguration (`fieldconfiguration`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `fieldName` | VARCHAR(255) | ✓ |  |
| `workOrderRequestConfiguration` | VARCHAR(255) | ✓ |  |
| `workOrderConfiguration_id` | VARCHAR(255) | ✓ |  |

### LocationImage (`location_image`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `name` | VARCHAR(255) | ✓ | Name |
| `description` | VARCHAR(255) | ✗ | Beschreibung |
| `file` | TEXT | ✓ |  |
| `location_id` | TEXT | ✓ |  |
| `createdAt_id` | TEXT | ✗ |  |
| `created_at` | TIMESTAMP | ✗ | Erstellungsdatum |
| `updated_at` | VARCHAR(255) | ✗ | Aktualisierungsdatum |
| `hotspots_id` | VARCHAR(255) | ✗ |  |

### MeterCategory (`metercategory`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |

### PushNotificationToken (`pushnotificationtoken`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `token` | VARCHAR(255) | ✓ |  |
| `user` | VARCHAR(255) | ✓ |  |

### Relation (`relation`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `parent` | VARCHAR(255) | ✗ |  |
| `child_id` | VARCHAR(255) | ✗ |  |

### Request (`request`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `customId` | VARCHAR(255) | ✓ |  |
| `cancelled` | BOOLEAN | ✓ |  |
| `cancellationReason` | VARCHAR(255) | ✓ |  |
| `isDemo` | BOOLEAN | ✓ |  |
| `audioDescription` | VARCHAR(255) | ✓ |  |
| `workOrder_id` | VARCHAR(255) | ✓ |  |

### SafetyInstruction (`safetyinstruction`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `location` | VARCHAR(255) | ✓ |  |
| `vendor_id` | VARCHAR(255) | ✓ |  |
| `title_id` | VARCHAR(255) | ✓ |  |
| `description_id` | VARCHAR(255) | ✓ | Beschreibung |
| `instructionDate_id` | TIMESTAMP | ✓ |  |
| `expirationDate` | TIMESTAMP | ✓ |  |
| `type` | VARCHAR(255) | ✓ |  |
| `instructionMaterialUrl` | VARCHAR(255) | ✓ |  |
| `instructionMaterialFileId` | VARCHAR(255) | ✓ |  |
| `instructor` | VARCHAR(255) | ✓ |  |
| `employee_id` | VARCHAR(255) | ✓ |  |
| `completed_id` | BOOLEAN | ✓ |  |
| `completionDate_id` | TIMESTAMP | ✓ |  |
| `signatureData` | VARCHAR(255) | ✓ |  |
| `signatureName` | VARCHAR(255) | ✓ |  |
| `createdBy` | VARCHAR(255) | ✓ |  |

### Subscription (`subscription`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `usersCount` | INTEGER | ✓ |  |
| `monthly` | BOOLEAN | ✗ |  |
| `cancelled` | BOOLEAN | ✗ |  |
| `activated` | BOOLEAN | ✗ |  |
| `fastSpringId` | VARCHAR(255) | ✓ |  |
| `subscriptionPlan` | VARCHAR(255) | ✓ |  |
| `startsOn_id` | TIMESTAMP | ✗ |  |
| `endsOn_id` | TIMESTAMP | ✗ |  |
| `downgradeNeeded_id` | BOOLEAN | ✓ |  |
| `upgradeNeeded_id` | BOOLEAN | ✓ |  |

### SubscriptionChangeRequest (`subscriptionchangerequest`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `code` | VARCHAR(255) | ✓ |  |
| `monthly` | BOOLEAN | ✗ |  |
| `usersCount` | INTEGER | ✗ |  |

### SubscriptionPlan (`subscriptionplan`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `name` | VARCHAR(255) | ✓ | Name |
| `monthlyCostPerUser` | DOUBLE PRECISION | ✗ |  |
| `yearlyCostPerUser` | DOUBLE PRECISION | ✗ |  |
| `code` | VARCHAR(255) | ✗ |  |

### SuperAccountRelation (`superaccountrelation`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `superUser` | VARCHAR(255) | ✓ |  |
| `childUser_id` | VARCHAR(255) | ✗ |  |

### TimeCategory (`timecategory`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |

### UserInvitation (`userinvitation`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `email` | VARCHAR(255) | ✓ |  |
| `role` | VARCHAR(255) | ✗ |  |

### UserSettings (`usersettings`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |

### VerificationToken (`verificationtoken`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `token` | VARCHAR(255) | ✓ |  |
| `payload` | VARCHAR(255) | ✓ |  |
| `user` | VARCHAR(255) | ✓ |  |
| `createdAt_id` | TIMESTAMP | ✓ |  |
| `expiryDate_id` | TIMESTAMP | ✓ |  |

### WorkOrderMeterTrigger (`workordermetertrigger`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `recurrent` | BOOLEAN | ✓ |  |
| `name` | VARCHAR(255) | ✓ | Name |
| `triggerCondition` | VARCHAR(255) | ✗ |  |
| `value` | INTEGER | ✗ | Wert |
| `waitBefore` | INTEGER | ✗ |  |
| `meter` | VARCHAR(255) | ✗ |  |

### WorkOrderRequestConfiguration (`workorderrequestconfiguration`)

| Spaltenname | Typ | Nullable | Beschreibung |
|-------------|-----|----------|-------------|
| `id` | BIGINT | ✓ | Eindeutige ID |
| `companySettings` | VARCHAR(255) | ✓ |  |

---

## Wichtige Tabellen für Grafana Dashboards

### Anlagenüberwachung

```sql
-- Assets mit Details
SELECT id, name, custom_id, status, location_id, dashboard_url 
FROM asset 
WHERE archived = false;

-- Asset Ausfallzeiten
SELECT asset_id, starts_on, ends_on, duration, downtime_reason 
FROM asset_downtime;

-- Wartungsaufträge
SELECT id, title, status, priority, due_date, asset_id, completed_on 
FROM work_order;

-- Zählerstände
SELECT m.id, m.name, r.value, r.reading_date, m.asset_id 
FROM meter m 
LEFT JOIN reading r ON r.meter_id = m.id;
```

### Kosten & Arbeit

```sql
-- Arbeitszeit pro Auftrag
SELECT work_order_id, SUM(duration) as total_hours, SUM(hourly_rate * duration) as cost 
FROM labor 
GROUP BY work_order_id;

-- Ersatzteilverbrauch
SELECT p.name, pc.quantity, pc.work_order_id, pc.created_at 
FROM part_consumption pc 
JOIN part p ON p.id = pc.part_id;
```

