# Konzept: Erweiterung des rollenbasierten Berechtigungssystems

## Inhaltsverzeichnis
1. [Übersicht](#übersicht)
2. [Analyse des aktuellen Systems](#analyse-des-aktuellen-systems)
3. [Probleme und Einschränkungen](#probleme-und-einschränkungen)
4. [Neues Berechtigungskonzept](#neues-berechtigungskonzept)
5. [Module und Berechtigungen](#module-und-berechtigungen)
6. [Berechtigungsmatrix](#berechtigungsmatrix)
7. [Technische Implementierung](#technische-implementierung)
8. [Migrationsstrategie](#migrationsstrategie)
9. [Best Practices](#best-practices)

---

## Übersicht

Dieses Dokument beschreibt das erweiterte rollenbasierte Berechtigungssystem (RBAC - Role-Based Access Control) für das CMMS. Das neue System ermöglicht eine granulare Kontrolle über Berechtigungen auf Modul- und Aktionsebene.

### Ziele der Erweiterung
- **Granularität**: Jedes Modul erhält separate Berechtigungen für Ansehen, Bearbeiten und Löschen
- **Konsistenz**: Alle Module folgen der gleichen Berechtigungsstruktur
- **Flexibilität**: Individuelle Anpassung von Rollen an spezifische Unternehmensanforderungen
- **Sicherheit**: Principle of Least Privilege - Nutzer erhalten nur minimal erforderliche Rechte
- **Erweiterbarkeit**: Einfaches Hinzufügen neuer Module und Berechtigungen

---

## Analyse des aktuellen Systems

### Aktuelle Berechtigungsstruktur

Das derzeitige System verwendet folgende Berechtigungstypen:

```typescript
type PermissionRoot =
  | 'createPermissions'      // Erstellen neuer Einträge
  | 'viewPermissions'        // Ansehen eigener Einträge
  | 'viewOtherPermissions'   // Ansehen fremder Einträge
  | 'editOtherPermissions'   // Bearbeiten fremder Einträge
  | 'deleteOtherPermissions' // Löschen fremder Einträge
```

### Aktuelle Module (PermissionEntity)

1. **PEOPLE_AND_TEAMS** - Personen und Teams
2. **CATEGORIES** - Kategorien
3. **WORK_ORDERS** - Arbeitsaufträge
4. **PREVENTIVE_MAINTENANCES** - Präventive Wartung
5. **ASSETS** - Anlagen
6. **PARTS_AND_MULTIPARTS** - Teile & Teilesätze
7. **PURCHASE_ORDERS** - Bestellungen
8. **METERS** - Zähler
9. **VENDORS_AND_CUSTOMERS** - Lieferanten & Auftragnehmer
10. **FILES** - Dateien *(veraltet, wird entfernt)*
11. **LOCATIONS** - Standorte
12. **SETTINGS** - Einstellungen
13. **REQUESTS** - Anfragen
14. **ANALYTICS** - Analysen
15. **DOCUMENTS** - Dokumentation
16. **FLOOR_PLANS** - Grundrisse

### Aktuelle Einschränkungen

| Berechtigung | Ausgeschlossen von |
|--------------|-------------------|
| **createPermissions** | PEOPLE_AND_TEAMS, CATEGORIES |
| **editOtherPermissions** | PEOPLE_AND_TEAMS, CATEGORIES |
| **viewPermissions** | SETTINGS |
| **deleteOtherPermissions** | Fast alle Module haben Einschränkungen |

---

## Probleme und Einschränkungen

### 1. **Inkonsistente Modulverfügbarkeit**
- Nicht alle Module sind in allen Berechtigungskategorien verfügbar
- Keine logische Begründung für viele Ausschlüsse
- Verwirrt Administratoren bei der Rollenkonfiguration

### 2. **Fehlende Module**
- **ASSET_HEALTH** (Anlagenüberwachung) - Wichtiges Modul für Condition Monitoring
- **DOCUMENTS** ist im Backend vorhanden, aber nicht vollständig integriert

### 3. **Veraltete Module**
- **FILES** existiert nicht mehr und sollte entfernt werden

### 4. **Komplexe Berechtigungslogik**
- Unterscheidung zwischen "own" und "other" ist verwirrend
- Nicht alle Module haben eine klare Eigentümerschaft
- "viewPermissions" vs "viewOtherPermissions" ist nicht intuitiv

### 5. **Fehlende Berechtigungen**
- Keine separate "EDIT" Berechtigung für eigene Einträge
- CREATE impliziert oft EDIT, was nicht immer gewünscht ist

### 6. **Mangelnde Granularität**
- Keine Möglichkeit, feinere Unterscheidungen zu treffen (z.B. "Entwurf erstellen" vs "Veröffentlichen")
- Keine Feldebenen-Berechtigungen

---

## Neues Berechtigungskonzept

### Grundprinzipien

1. **Einheitliche Struktur**: Alle Module folgen der gleichen Berechtigungsstruktur
2. **Vier Berechtigungstypen pro Modul**:
   - **VIEW** - Ansehen von Einträgen
   - **CREATE** - Erstellen neuer Einträge
   - **EDIT** - Bearbeiten bestehender Einträge
   - **DELETE** - Löschen von Einträgen

3. **Eigentümerschaft-basierte Erweiterung** (optional):
   - **VIEW_OWN** - Nur eigene Einträge ansehen
   - **VIEW_ALL** - Alle Einträge ansehen
   - **EDIT_OWN** - Nur eigene Einträge bearbeiten
   - **EDIT_ALL** - Alle Einträge bearbeiten
   - **DELETE_OWN** - Nur eigene Einträge löschen
   - **DELETE_ALL** - Alle Einträge löschen

### Neue Datenstruktur

```typescript
// Neue Berechtigungstypen
export enum PermissionAction {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE'
}

export enum PermissionScope {
  OWN = 'OWN',      // Nur eigene Einträge
  ALL = 'ALL'       // Alle Einträge
}

// Berechtigungsobjekt
export interface Permission {
  entity: PermissionEntity;
  action: PermissionAction;
  scope: PermissionScope;
}

// Vereinfachte Alternative (für Phase 1)
export interface RolePermissions {
  [key: PermissionEntity]: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  }
}
```

### Aktualisierte Module

```typescript
export enum PermissionEntity {
  // Verwaltung
  PEOPLE_AND_TEAMS = 'PEOPLE_AND_TEAMS',
  CATEGORIES = 'CATEGORIES',
  SETTINGS = 'SETTINGS',
  
  // Kernfunktionen
  WORK_ORDERS = 'WORK_ORDERS',
  PREVENTIVE_MAINTENANCES = 'PREVENTIVE_MAINTENANCES',
  REQUESTS = 'REQUESTS',
  
  // Assets & Standorte
  ASSETS = 'ASSETS',
  ASSET_HEALTH = 'ASSET_HEALTH',              // NEU: Anlagenüberwachung
  LOCATIONS = 'LOCATIONS',
  METERS = 'METERS',
  FLOOR_PLANS = 'FLOOR_PLANS',
  
  // Materialwirtschaft
  PARTS_AND_MULTIPARTS = 'PARTS_AND_MULTIPARTS',
  PURCHASE_ORDERS = 'PURCHASE_ORDERS',
  VENDORS_AND_CUSTOMERS = 'VENDORS_AND_CUSTOMERS',
  
  // Dokumente & Analysen
  DOCUMENTS = 'DOCUMENTS',                     // Dokumentation
  ANALYTICS = 'ANALYTICS',
  
  // Sonstige (deprecated)
  // FILES = 'FILES',                          // ENTFERNT
}
```

---

## Module und Berechtigungen

### Detaillierte Modulbeschreibungen

#### 1. **Personen & Teams** (PEOPLE_AND_TEAMS)
- **VIEW**: Benutzer und Teams ansehen
- **CREATE**: Neue Benutzer einladen, Teams erstellen
- **EDIT**: Benutzerprofile bearbeiten, Team-Zuweisungen ändern
- **DELETE**: Benutzer deaktivieren, Teams löschen

**Besonderheiten**: Sensibles Modul - sollte nur für Admins/HR verfügbar sein

#### 2. **Kategorien** (CATEGORIES)
- **VIEW**: Kategorien ansehen
- **CREATE**: Neue Kategorien erstellen
- **EDIT**: Kategorienamen und -beschreibungen bearbeiten
- **DELETE**: Ungenutzte Kategorien löschen

**Besonderheiten**: Beeinflusst die Struktur des gesamten Systems

#### 3. **Arbeitsaufträge** (WORK_ORDERS)
- **VIEW**: Arbeitsaufträge einsehen
- **CREATE**: Neue Arbeitsaufträge anlegen
- **EDIT**: Status, Beschreibung, Zuweisungen ändern
- **DELETE**: Arbeitsaufträge löschen (nur in bestimmten Status)

**Besonderheiten**: Kernfunktion - die meisten Nutzer benötigen VIEW und CREATE

#### 4. **Präventive Wartung** (PREVENTIVE_MAINTENANCES)
- **VIEW**: Wartungspläne einsehen
- **CREATE**: Neue Wartungspläne erstellen
- **EDIT**: Wartungsintervalle und -aufgaben anpassen
- **DELETE**: Wartungspläne deaktivieren/löschen

#### 5. **Anlagen** (ASSETS)
- **VIEW**: Anlagenstammdaten einsehen
- **CREATE**: Neue Anlagen registrieren
- **EDIT**: Anlagendaten aktualisieren
- **DELETE**: Anlagen aus dem System entfernen

#### 6. **Anlagenüberwachung** (ASSET_HEALTH) - **NEU**
- **VIEW**: Zustandsdaten und Messwerte einsehen
- **CREATE**: Neue Überwachungsparameter definieren
- **EDIT**: Schwellwerte und Alarme anpassen
- **DELETE**: Überwachungsparameter entfernen

**Besonderheiten**: Wichtig für Condition-Based Maintenance, Integration mit IoT-Sensoren

#### 7. **Standorte** (LOCATIONS)
- **VIEW**: Standorthierarchie einsehen
- **CREATE**: Neue Standorte anlegen
- **EDIT**: Standortinformationen aktualisieren
- **DELETE**: Leere Standorte entfernen

#### 8. **Zähler** (METERS)
- **VIEW**: Zählerstände einsehen
- **CREATE**: Neue Zähler registrieren
- **EDIT**: Zählerstände erfassen und korrigieren
- **DELETE**: Zähler entfernen

#### 9. **Grundrisse** (FLOOR_PLANS)
- **VIEW**: Grundrisse und Gebäudepläne ansehen
- **CREATE**: Neue Grundrisse hochladen
- **EDIT**: Grundrisse mit Markierungen versehen
- **DELETE**: Veraltete Grundrisse entfernen

#### 10. **Teile & Teilesätze** (PARTS_AND_MULTIPARTS)
- **VIEW**: Lagerverwaltung einsehen
- **CREATE**: Neue Teile und Kits anlegen
- **EDIT**: Bestandsmengen und Preise aktualisieren
- **DELETE**: Nicht mehr verwendete Teile entfernen

#### 11. **Bestellungen** (PURCHASE_ORDERS)
- **VIEW**: Bestellungen einsehen
- **CREATE**: Neue Bestellungen anlegen
- **EDIT**: Bestelldetails ändern (vor Genehmigung)
- **DELETE**: Entwürfe löschen

#### 12. **Lieferanten & Auftragnehmer** (VENDORS_AND_CUSTOMERS)
- **VIEW**: Lieferantendaten einsehen
- **CREATE**: Neue Lieferanten anlegen
- **EDIT**: Kontaktdaten aktualisieren
- **DELETE**: Inaktive Lieferanten entfernen

#### 13. **Dokumentation** (DOCUMENTS)
- **VIEW**: Dokumente lesen und herunterladen
- **CREATE**: Neue Dokumente hochladen
- **EDIT**: Dokument-Metadaten bearbeiten, Versionen aktualisieren
- **DELETE**: Veraltete Dokumente archivieren/löschen

**Besonderheiten**: Unterstützt Versionierung, Kategorisierung, Freigabe-Workflows

#### 14. **Anfragen** (REQUESTS)
- **VIEW**: Wartungsanfragen einsehen
- **CREATE**: Neue Anfragen einreichen
- **EDIT**: Anfragestatus aktualisieren
- **DELETE**: Entwürfe löschen

**Besonderheiten**: Oft für alle Mitarbeiter zugänglich (Self-Service)

#### 15. **Analysen** (ANALYTICS)
- **VIEW**: Dashboards und Reports ansehen
- **CREATE**: Benutzerdefinierte Reports erstellen
- **EDIT**: Eigene Reports bearbeiten
- **DELETE**: Eigene Reports löschen

**Besonderheiten**: Oft read-only für die meisten Nutzer

#### 16. **Einstellungen** (SETTINGS)
- **VIEW**: Systemkonfiguration einsehen
- **CREATE**: Neue Konfigurationen anlegen (z.B. Custom Fields)
- **EDIT**: Systemeinstellungen ändern
- **DELETE**: Konfigurationen entfernen

**Besonderheiten**: Höchst privilegiertes Modul - nur für System-Administratoren

---

## Berechtigungsmatrix

### Standard-Rollen mit empfohlenen Berechtigungen

| Modul | Admin | Wartungsleiter | Techniker | Beschränkter Techniker | Nur-Lesen | Anforderer |
|-------|-------|----------------|-----------|----------------------|-----------|------------|
| **PEOPLE_AND_TEAMS** | VCED | VE | V | V | V | - |
| **CATEGORIES** | VCED | VCE | V | V | V | - |
| **WORK_ORDERS** | VCED | VCED | VCED | VCE | V | V |
| **PREVENTIVE_MAINTENANCES** | VCED | VCED | VE | V | V | - |
| **REQUESTS** | VCED | VCED | VCED | VCE | V | VC |
| **ASSETS** | VCED | VCED | VCE | V | V | V |
| **ASSET_HEALTH** | VCED | VCED | VE | V | V | - |
| **LOCATIONS** | VCED | VCED | VCE | V | V | V |
| **METERS** | VCED | VCED | VCE | V | V | - |
| **FLOOR_PLANS** | VCED | VCE | V | V | V | V |
| **PARTS_AND_MULTIPARTS** | VCED | VCED | VCE | V | V | - |
| **PURCHASE_ORDERS** | VCED | VCED | VCE | V | V | - |
| **VENDORS_AND_CUSTOMERS** | VCED | VCE | V | V | V | - |
| **DOCUMENTS** | VCED | VCED | VCE | V | V | V |
| **ANALYTICS** | VCED | VCE | V | V | V | - |
| **SETTINGS** | VCED | V | - | - | - | - |

**Legende:**
- **V** = VIEW (Ansehen)
- **C** = CREATE (Erstellen)
- **E** = EDIT (Bearbeiten)
- **D** = DELETE (Löschen)
- **-** = Kein Zugriff

### Rollenbeschreibungen

#### 1. **Administrator**
- Vollzugriff auf alle Module
- Kann Rollen und Berechtigungen verwalten
- Zugriff auf Systemeinstellungen

#### 2. **Wartungsleiter** (Limited Admin)
- Vollzugriff auf operative Module
- Kann keine Systemeinstellungen ändern
- Kann Benutzer verwalten (eingeschränkt)

#### 3. **Techniker**
- Kann Arbeitsaufträge und Anfragen bearbeiten
- Lese- und Schreibzugriff auf Assets und Standorte
- Kann Teile verwenden und nachbestellen

#### 4. **Beschränkter Techniker** (Limited Technician)
- Kann Arbeitsaufträge ansehen und bearbeiten
- Kann keine Stammdaten ändern
- Kein Löschrecht

#### 5. **Nur-Lesen** (View Only)
- Kann alle relevanten Daten einsehen
- Keine Änderungsberechtigung
- Für Reporting und Audit-Zwecke

#### 6. **Anforderer** (Requester)
- Kann Wartungsanfragen erstellen
- Kann eigene Anfragen einsehen
- Minimale Berechtigungen für Self-Service

---

## Technische Implementierung

### Phase 1: Vereinfachtes System (Quick Win)

#### Backend-Änderungen

**1. Aktualisierung PermissionEntity.java**
```java
public enum PermissionEntity {
    PEOPLE_AND_TEAMS,
    CATEGORIES,
    WORK_ORDERS,
    PREVENTIVE_MAINTENANCES,
    REQUESTS,
    ASSETS,
    ASSET_HEALTH,              // NEU
    LOCATIONS,
    METERS,
    FLOOR_PLANS,
    PARTS_AND_MULTIPARTS,
    PURCHASE_ORDERS,
    VENDORS_AND_CUSTOMERS,
    DOCUMENTS,
    ANALYTICS,
    SETTINGS
    // FILES entfernt
}
```

**2. Aktualisierung Role.java**
```java
@Entity
public class Role {
    // ... bestehende Felder ...
    
    @ElementCollection(targetClass = PermissionEntity.class)
    private Set<PermissionEntity> viewPermissions = new HashSet<>();
    
    @ElementCollection(targetClass = PermissionEntity.class)
    private Set<PermissionEntity> createPermissions = new HashSet<>();
    
    @ElementCollection(targetClass = PermissionEntity.class)
    private Set<PermissionEntity> editPermissions = new HashSet<>();
    
    @ElementCollection(targetClass = PermissionEntity.class)
    private Set<PermissionEntity> deletePermissions = new HashSet<>();
    
    // viewOtherPermissions, editOtherPermissions, deleteOtherPermissions
    // können für Abwärtskompatibilität beibehalten werden
}
```

**3. Service-Layer Anpassungen**

```java
@Service
public class PermissionService {
    
    public boolean hasPermission(User user, PermissionEntity entity, PermissionAction action) {
        Role role = user.getRole();
        
        switch (action) {
            case VIEW:
                return role.getViewPermissions().contains(entity);
            case CREATE:
                return role.getCreatePermissions().contains(entity);
            case EDIT:
                return role.getEditPermissions().contains(entity);
            case DELETE:
                return role.getDeletePermissions().contains(entity);
            default:
                return false;
        }
    }
    
    public boolean canViewEntity(User user, PermissionEntity entity, Long entityId) {
        // Basis-Check
        if (!hasPermission(user, entity, PermissionAction.VIEW)) {
            return false;
        }
        
        // Weitere Logik für "own vs all" kann hier implementiert werden
        return true;
    }
}
```

#### Frontend-Änderungen

**1. Aktualisierung role.ts**
```typescript
export enum PermissionEntity {
  PEOPLE_AND_TEAMS = 'PEOPLE_AND_TEAMS',
  CATEGORIES = 'CATEGORIES',
  WORK_ORDERS = 'WORK_ORDERS',
  PREVENTIVE_MAINTENANCES = 'PREVENTIVE_MAINTENANCES',
  REQUESTS = 'REQUESTS',
  ASSETS = 'ASSETS',
  ASSET_HEALTH = 'ASSET_HEALTH',        // NEU
  LOCATIONS = 'LOCATIONS',
  METERS = 'METERS',
  FLOOR_PLANS = 'FLOOR_PLANS',
  PARTS_AND_MULTIPARTS = 'PARTS_AND_MULTIPARTS',
  PURCHASE_ORDERS = 'PURCHASE_ORDERS',
  VENDORS_AND_CUSTOMERS = 'VENDORS_AND_CUSTOMERS',
  DOCUMENTS = 'DOCUMENTS',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS'
  // FILES entfernt
}

export interface Role {
  id: number;
  name: string;
  code: RoleCode;
  description?: string;
  paid: boolean;
  
  // Neue vereinfachte Struktur
  viewPermissions: PermissionEntity[];
  createPermissions: PermissionEntity[];
  editPermissions: PermissionEntity[];
  deletePermissions: PermissionEntity[];
}
```

**2. Neue Rolle-Editor-Komponente**
```typescript
// RolePermissionEditor.tsx
interface PermissionMatrixProps {
  role: Role;
  onChange: (role: Role) => void;
}

export const PermissionMatrix: FC<PermissionMatrixProps> = ({ role, onChange }) => {
  const modules = Object.values(PermissionEntity);
  
  const togglePermission = (
    entity: PermissionEntity, 
    action: 'view' | 'create' | 'edit' | 'delete'
  ) => {
    const permissionKey = `${action}Permissions`;
    const currentPermissions = role[permissionKey];
    
    const newPermissions = currentPermissions.includes(entity)
      ? currentPermissions.filter(e => e !== entity)
      : [...currentPermissions, entity];
    
    onChange({
      ...role,
      [permissionKey]: newPermissions
    });
  };
  
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Modul</TableCell>
          <TableCell align="center">Ansehen</TableCell>
          <TableCell align="center">Erstellen</TableCell>
          <TableCell align="center">Bearbeiten</TableCell>
          <TableCell align="center">Löschen</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {modules.map(entity => (
          <TableRow key={entity}>
            <TableCell>{getModuleName(entity)}</TableCell>
            <TableCell align="center">
              <Checkbox
                checked={role.viewPermissions.includes(entity)}
                onChange={() => togglePermission(entity, 'view')}
              />
            </TableCell>
            <TableCell align="center">
              <Checkbox
                checked={role.createPermissions.includes(entity)}
                onChange={() => togglePermission(entity, 'create')}
              />
            </TableCell>
            <TableCell align="center">
              <Checkbox
                checked={role.editPermissions.includes(entity)}
                onChange={() => togglePermission(entity, 'edit')}
              />
            </TableCell>
            <TableCell align="center">
              <Checkbox
                checked={role.deletePermissions.includes(entity)}
                onChange={() => togglePermission(entity, 'delete')}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

**3. Utility-Funktionen aktualisieren**
```typescript
// utils/permissions.ts
export const hasPermission = (
  user: User,
  entity: PermissionEntity,
  action: 'view' | 'create' | 'edit' | 'delete'
): boolean => {
  const role = user.role;
  const permissionKey = `${action}Permissions`;
  return role[permissionKey]?.includes(entity) ?? false;
};

export const canView = (user: User, entity: PermissionEntity) => 
  hasPermission(user, entity, 'view');

export const canCreate = (user: User, entity: PermissionEntity) => 
  hasPermission(user, entity, 'create');

export const canEdit = (user: User, entity: PermissionEntity) => 
  hasPermission(user, entity, 'edit');

export const canDelete = (user: User, entity: PermissionEntity) => 
  hasPermission(user, entity, 'delete');
```

### Phase 2: Erweiterte Eigentümerschaft (Own vs All)

#### Backend-Erweiterungen

**1. Neue Permission-Klasse**
```java
@Embeddable
public class ModulePermission {
    private boolean viewOwn;
    private boolean viewAll;
    private boolean createOwn;
    private boolean createAll;
    private boolean editOwn;
    private boolean editAll;
    private boolean deleteOwn;
    private boolean deleteAll;
}

@Entity
public class Role {
    @ElementCollection
    @MapKeyEnumerated(EnumType.STRING)
    private Map<PermissionEntity, ModulePermission> permissions = new HashMap<>();
}
```

**2. Ownership-Check-Service**
```java
@Service
public class OwnershipService {
    
    public boolean isOwner(User user, Object entity) {
        if (entity instanceof OwnableEntity) {
            OwnableEntity ownable = (OwnableEntity) entity;
            return ownable.getCreatedBy().equals(user.getId()) ||
                   ownable.getAssignedUsers().contains(user);
        }
        return false;
    }
    
    public boolean canEdit(User user, Object entity, PermissionEntity permissionEntity) {
        ModulePermission permission = user.getRole()
            .getPermissions()
            .get(permissionEntity);
        
        if (permission == null) return false;
        
        boolean isOwner = isOwner(user, entity);
        
        return (isOwner && permission.isEditOwn()) || permission.isEditAll();
    }
}
```

### Phase 3: Feldebenen-Berechtigungen (Optional)

```java
@Entity
public class FieldPermission {
    @ManyToOne
    private Role role;
    
    @Enumerated(EnumType.STRING)
    private PermissionEntity entity;
    
    private String fieldName;
    
    private boolean canView;
    private boolean canEdit;
}
```

---

## Migrationsstrategie

### Datenbank-Migration

**Schritt 1: Neue Spalten hinzufügen**
```xml
<!-- Liquibase Changelog -->
<changeSet id="2024-XX-XX-add-new-permission-columns" author="system">
    <!-- Tabelle für viewPermissions bereits vorhanden -->
    
    <!-- Neue Tabellen für create, edit, delete -->
    <createTable tableName="role_create_permissions">
        <column name="role_id" type="bigint"/>
        <column name="create_permissions" type="varchar(255)"/>
    </createTable>
    
    <createTable tableName="role_edit_permissions">
        <column name="role_id" type="bigint"/>
        <column name="edit_permissions" type="varchar(255)"/>
    </createTable>
    
    <createTable tableName="role_delete_permissions">
        <column name="role_id" type="bigint"/>
        <column name="delete_permissions" type="varchar(255)"/>
    </createTable>
    
    <addForeignKeyConstraint 
        baseTableName="role_create_permissions"
        baseColumnNames="role_id"
        referencedTableName="role"
        referencedColumnNames="id"/>
        
    <addForeignKeyConstraint 
        baseTableName="role_edit_permissions"
        baseColumnNames="role_id"
        referencedTableName="role"
        referencedColumnNames="id"/>
        
    <addForeignKeyConstraint 
        baseTableName="role_delete_permissions"
        baseColumnNames="role_id"
        referencedTableName="role"
        referencedColumnNames="id"/>
</changeSet>
```

**Schritt 2: Daten migrieren**
```xml
<changeSet id="2024-XX-XX-migrate-permissions" author="system">
    <!-- createPermissions: Aus createPermissions übernehmen -->
    <sql>
        INSERT INTO role_create_permissions (role_id, create_permissions)
        SELECT role_id, create_permissions 
        FROM role_create_permissions_old
        WHERE create_permissions NOT IN ('PEOPLE_AND_TEAMS', 'CATEGORIES')
    </sql>
    
    <!-- editPermissions: Aus editOtherPermissions übernehmen -->
    <sql>
        INSERT INTO role_edit_permissions (role_id, edit_permissions)
        SELECT role_id, edit_other_permissions 
        FROM role_edit_other_permissions
    </sql>
    
    <!-- deletePermissions: Aus deleteOtherPermissions übernehmen -->
    <sql>
        INSERT INTO role_delete_permissions (role_id, delete_permissions)
        SELECT role_id, delete_other_permissions 
        FROM role_delete_other_permissions
    </sql>
    
    <!-- FILES entfernen -->
    <delete tableName="role_view_permissions">
        <where>view_permissions = 'FILES'</where>
    </delete>
    <delete tableName="role_create_permissions">
        <where>create_permissions = 'FILES'</where>
    </delete>
    <delete tableName="role_edit_permissions">
        <where>edit_permissions = 'FILES'</where>
    </delete>
    <delete tableName="role_delete_permissions">
        <where>delete_permissions = 'FILES'</where>
    </delete>
</changeSet>
```

**Schritt 3: ASSET_HEALTH hinzufügen**
```xml
<changeSet id="2024-XX-XX-add-asset-health-permissions" author="system">
    <sql>
        <!-- Für Admin-Rollen: Alle Berechtigungen -->
        INSERT INTO role_view_permissions (role_id, view_permissions)
        SELECT id, 'ASSET_HEALTH' FROM role WHERE code = 'ADMIN';
        
        INSERT INTO role_create_permissions (role_id, create_permissions)
        SELECT id, 'ASSET_HEALTH' FROM role WHERE code = 'ADMIN';
        
        INSERT INTO role_edit_permissions (role_id, edit_permissions)
        SELECT id, 'ASSET_HEALTH' FROM role WHERE code = 'ADMIN';
        
        INSERT INTO role_delete_permissions (role_id, delete_permissions)
        SELECT id, 'ASSET_HEALTH' FROM role WHERE code = 'ADMIN';
        
        <!-- Für Techniker: View und Edit -->
        INSERT INTO role_view_permissions (role_id, view_permissions)
        SELECT id, 'ASSET_HEALTH' FROM role WHERE code IN ('TECHNICIAN', 'LIMITED_ADMIN');
        
        INSERT INTO role_edit_permissions (role_id, edit_permissions)
        SELECT id, 'ASSET_HEALTH' FROM role WHERE code IN ('TECHNICIAN', 'LIMITED_ADMIN');
    </sql>
</changeSet>
```

**Schritt 4: Alte Spalten als deprecated markieren (nicht sofort löschen)**
```xml
<changeSet id="2024-XX-XX-deprecate-old-permissions" author="system">
    <!-- Alte Tabellen werden vorerst beibehalten für Rollback-Möglichkeit -->
    <!-- Erst nach erfolgreicher Migration und Testphase löschen -->
    <comment>
        Old permission tables (role_edit_other_permissions, role_delete_other_permissions)
        are kept for backward compatibility and rollback capability.
        Will be removed in version 3.0.0
    </comment>
</changeSet>
```

### Abwärtskompatibilität

**API-Wrapper für alte Clients**
```java
@RestController
@RequestMapping("/api/roles")
public class RoleController {
    
    @GetMapping("/{id}")
    public RoleDTO getRole(@PathVariable Long id, @RequestParam(required = false) String version) {
        Role role = roleService.findById(id);
        
        if ("v1".equals(version)) {
            return convertToLegacyFormat(role);
        }
        
        return convertToNewFormat(role);
    }
    
    private RoleDTO convertToLegacyFormat(Role role) {
        // Mapping von neuem auf altes Format für Abwärtskompatibilität
        RoleDTO dto = new RoleDTO();
        dto.setViewPermissions(role.getViewPermissions());
        dto.setCreatePermissions(role.getCreatePermissions());
        dto.setEditOtherPermissions(role.getEditPermissions()); // Mapping!
        dto.setDeleteOtherPermissions(role.getDeletePermissions()); // Mapping!
        return dto;
    }
}
```

### Rollout-Plan

1. **Woche 1-2: Backend-Vorbereitung**
   - Datenbank-Änderungen entwickeln
   - Migration-Scripts testen
   - Unit-Tests schreiben

2. **Woche 3: Backend-Deployment**
   - Migration auf Staging ausführen
   - Tests durchführen
   - Rollback-Plan validieren

3. **Woche 4-5: Frontend-Entwicklung**
   - Neue Permission-Matrix-Komponente
   - Bestehende Permission-Checks aktualisieren
   - UI/UX-Tests

4. **Woche 6: Integration & Testing**
   - End-to-End-Tests
   - User Acceptance Testing
   - Performance-Tests

5. **Woche 7: Produktion-Deployment**
   - Deployment außerhalb Geschäftszeiten
   - Monitoring aktiv
   - Rollback-Bereitschaft

6. **Woche 8+: Support & Optimierung**
   - User-Feedback sammeln
   - Feintuning
   - Dokumentation aktualisieren

---

## Best Practices

### 1. Principle of Least Privilege
- Nutzer erhalten nur minimal erforderliche Rechte
- Regelmäßige Review von Rollenberechtigungen
- Temporäre Rechte-Erhöhung statt permanente Admin-Rechte

### 2. Rollendesign
- **Beschreibende Namen**: "Wartungsleiter" statt "Rolle 2"
- **Klare Beschreibungen**: Dokumentieren, wofür die Rolle gedacht ist
- **Begrenzte Anzahl**: Maximal 10-15 Rollen pro Organisation
- **Keine Nutzer-spezifischen Rollen**: Rollen sollten für Gruppen gelten

### 3. Berechtigungs-Vererbung
```
Admin
  ├─ Wartungsleiter (erbt alle operativen Rechte)
  │   ├─ Techniker (erbt Work Order Rechte)
  │   │   └─ Beschränkter Techniker
  │   └─ Lagerverwalter
  └─ Berichtswesen
      └─ Nur-Lesen
```

### 4. Audit & Compliance
- Logging aller Berechtigungsänderungen
- Wer hat wann welche Berechtigung erhalten/verloren
- Regelmäßige Access Reviews (quartalsweise)

### 5. Testing
```typescript
describe('Permission System', () => {
  it('should prevent DELETE without permission', () => {
    const technician = createUser({ role: 'TECHNICIAN' });
    expect(canDelete(technician, PermissionEntity.SETTINGS)).toBe(false);
  });
  
  it('should allow VIEW for all modules to VIEW_ONLY role', () => {
    const viewer = createUser({ role: 'VIEW_ONLY' });
    Object.values(PermissionEntity).forEach(entity => {
      if (entity !== PermissionEntity.SETTINGS) {
        expect(canView(viewer, entity)).toBe(true);
      }
    });
  });
});
```

### 6. UI/UX Considerations
- **Verstecken vs. Deaktivieren**: Buttons für verbotene Aktionen ausblenden, nicht nur deaktivieren
- **Informative Fehlermeldungen**: "Sie benötigen die Berechtigung 'Bearbeiten' für Arbeitsaufträge"
- **Permission-Preview**: Admins können Rechte vor Zuweisung testen
- **Visual Indicators**: Icons oder Badges für sensible Aktionen

### 7. Performance
- Berechtigungen im User-Token cachen (JWT)
- Nicht bei jeder API-Anfrage DB-Lookup
- Frontend: Permission-Map im Redux/Context Store

```typescript
// Optimized permission check
const PermissionContext = createContext<PermissionMap>({});

export const usePermission = (entity: PermissionEntity, action: Action) => {
  const permissions = useContext(PermissionContext);
  return permissions[entity]?.[action] ?? false;
};
```

### 8. Dokumentation für Endnutzer
- **Permission-Guide**: Welche Rolle brauche ich für welche Aufgabe?
- **Screenshots**: Visual Guide für Admins zur Rollenkonfiguration
- **FAQ**: Häufige Fragen zu Berechtigungen
- **Onboarding**: Neue Admins durch Berechtigungssystem führen

---

## Zusammenfassung

### Hauptverbesserungen

1. ✅ **Konsistente Struktur**: Alle Module haben VIEW, CREATE, EDIT, DELETE
2. ✅ **Vollständigkeit**: ASSET_HEALTH und DOCUMENTS hinzugefügt, FILES entfernt
3. ✅ **Einfachheit**: Klarere Benennung und Struktur
4. ✅ **Flexibilität**: Granulare Kontrolle pro Modul und Aktion
5. ✅ **Skalierbarkeit**: Einfach neue Module hinzuzufügen
6. ✅ **Sicherheit**: Bessere Trennung von Berechtigungen

### Nächste Schritte

1. **Review & Genehmigung**: Stakeholder-Feedback einholen
2. **Prototyping**: UI-Mockup für neue Permission-Matrix erstellen
3. **Technische Spezifikation**: Detaillierte API-Specs schreiben
4. **Entwicklung starten**: Backend-Migration implementieren
5. **Testing**: Umfassende Testabdeckung sicherstellen
6. **Deployment**: Schrittweiser Rollout mit Monitoring
7. **Schulung**: Admins im neuen System schulen
8. **Dokumentation**: End-User-Dokumentation aktualisieren

### Metriken für Erfolg

- ⏱️ **Zeit für Rollenkonfiguration**: < 5 Minuten für Standard-Rollen
- 🎯 **Fehlerrate**: < 1% unbeabsichtigte Berechtigungsfehler
- 👥 **User Satisfaction**: > 4/5 Sterne von Admins
- 🐛 **Bug-Rate**: < 5 Permission-Bugs pro Quartal
- 📚 **Support-Anfragen**: -50% Anfragen zu Berechtigungen

---

**Dokumentversion**: 1.0  
**Erstellt am**: 2024  
**Autor**: CMMS Development Team  
**Status**: Konzept - Zur Review
