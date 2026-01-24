# MMS Datenbank Schema - Entity Relationship Diagramm

## Hauptentitäten und Beziehungen (Visuell)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            COMPANY (Multi-Tenant)                        │
│  id, name, phone, address                                                │
└────────────────────────┬────────────────────────────────────────────────┘
                         │ 1:n
         ┌───────────────┼───────────────┬───────────────────┐
         │               │               │                   │
         ▼               ▼               ▼                   ▼
    ┌─────────┐    ┌──────────┐   ┌──────────┐      ┌────────────┐
    │ COMPANY │    │ LOCATION │   │ OWN_USER │      │   TEAM     │
    │SETTINGS │    │          │   │          │      │            │
    └────┬────┘    └─────┬────┘   └────┬─────┘      └──────┬─────┘
         │               │ 1:n         │                    │
         │               │             │                    │
         │         ┌─────▼─────────────▼────────────────────▼────┐
         │         │                 ASSET                        │
         │         │  - id, name, custom_id                       │
         │         │  - status, model, manufacturer               │
         │         │  - dashboard_url ★                           │
         │         │  - location_id, category_id                  │
         │         │  - parent_asset_id (hierarchisch)            │
         │         └────┬────────────┬────────────────┬───────────┘
         │              │ 1:n        │ 1:n           │ 1:n
         │              │            │               │
         │         ┌────▼────┐  ┌───▼────────┐  ┌───▼─────────┐
         │         │  METER  │  │ WORK_ORDER │  │   ASSET     │
         │         └────┬────┘  └─────┬──────┘  │  DOWNTIME   │
         │              │ 1:n         │         └─────────────┘
         │              │             │ 1:n
         │         ┌────▼────┐   ┌────▼──────┐
         │         │ READING │   │   LABOR   │
         │         │★Time    │   └───────────┘
         │         │ Series  │
         │         └─────────┘   ┌───────────────┐
         │                       │ PART          │
         │                       │ CONSUMPTION   │
         │                       └───────┬───────┘
         │                               │ n:1
         │                          ┌────▼────┐
         │                          │  PART   │
         │                          └─────────┘
         │
         └─► alerting_dashboard_url ★
              (Globales Alerting Dashboard)


★ = Neu für Anlagenüberwachungsmodul
```

---

## Detaillierte Beziehungen

### Asset Zentrum
```
                    ┌────────────────────┐
                    │       ASSET        │
                    │                    │
                    │  Foreign Keys:     │
                    │  - location_id     │
                    │  - category_id     │
                    │  - parent_asset_id │
                    │  - primary_user_id │
                    │  - floor_plan_id   │
                    │  - deprecation_id  │
                    └──────────┬─────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
         ┌──────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
         │ Many-to-Many│ │ One-to-  │ │ One-to-Many│
         │ Associations│ │   Many   │ │ Children   │
         └──────┬──────┘ └────┬─────┘ └─────┬──────┘
                │             │              │
    ┌───────────┼─────────┐   │    ┌─────────┼────────────┐
    │           │         │   │    │         │            │
    ▼           ▼         ▼   ▼    ▼         ▼            ▼
  Users       Teams    Parts  Work Work   Meters    Preventive
                              Orders Orders          Maintenance
                                    Downtimes
```

### Work Order Workflow
```
┌───────────┐         ┌──────────────┐
│  REQUEST  │────────>│ WORK_ORDER   │
│ (Optional)│         │              │
└───────────┘         │ - title      │
                      │ - status     │
      ┌───────────────│ - priority   │
      │               │ - due_date   │
      │               └───────┬──────┘
      │                       │
      │         ┌─────────────┼─────────────┐
      │         │             │             │
      ▼         ▼             ▼             ▼
┌──────────┐ ┌───────┐ ┌──────────┐ ┌───────────┐
│  ASSET   │ │ LABOR │ │   PART   │ │ADDITIONAL │
│          │ │       │ │CONSUMPTION│ │   COST    │
└──────────┘ └───────┘ └──────────┘ └───────────┘
                           │
                           ▼
                      ┌────────┐
                      │  PART  │
                      └────────┘
```

### Zeitreihen-Daten (Time Series)
```
┌──────────────────────────────────────┐
│     Time Series für Grafana:         │
├──────────────────────────────────────┤
│                                      │
│  1. READING (Zählerstände)          │
│     • value                          │
│     • reading_date ← timestamp       │
│     • meter_id                       │
│                                      │
│  2. ASSET_DOWNTIME (Ausfallzeiten)  │
│     • starts_on ← timestamp          │
│     • ends_on                        │
│     • duration                       │
│     • asset_id                       │
│                                      │
│  3. WORK_ORDER (Aufträge)           │
│     • created_at ← timestamp         │
│     • completed_on                   │
│     • due_date                       │
│     • status changes over time       │
│                                      │
│  4. LABOR (Arbeitszeiten)           │
│     • logged_at ← timestamp          │
│     • started_on                     │
│     • duration                       │
│                                      │
└──────────────────────────────────────┘
```

---

## Join-Tabellen (Many-to-Many)

### Asset Associations

1. **T_Asset_User_Associations**
   - `id_asset` → asset.id
   - `id_user` → own_user.id
   - Zweck: Zugewiesene Benutzer

2. **T_Asset_Team_Associations**
   - `id_asset` → asset.id
   - `id_team` → team.id
   - Zweck: Zugewiesene Teams

3. **T_Asset_Vendor_Associations**
   - `id_asset` → asset.id
   - `id_vendor` → vendor.id
   - Zweck: Lieferanten/Dienstleister

4. **T_Asset_Customer_Associations**
   - `id_asset` → asset.id
   - `id_customer` → customer.id
   - Zweck: Kunden-Zuordnung

5. **T_Asset_Part_Associations**
   - `id_asset` → asset.id
   - `id_part` → part.id
   - Zweck: Zugeordnete Ersatzteile

6. **T_Asset_File_Associations**
   - `id_asset` → asset.id
   - `id_file` → file.id
   - Zweck: Dokumente/Bilder

---

## Hierarchische Strukturen

### 1. Location Hierarchie
```
Company
  └─ Location (Standort)
      ├─ Location (Gebäude)
      │   └─ Location (Etage)
      │       └─ Location (Raum)
      └─ Location (Lager)
```

**SQL:** `SELECT * FROM location WHERE parent_location_id = ?`

### 2. Asset Hierarchie
```
Asset (Produktionslinie)
  ├─ Asset (Maschine A)
  │   ├─ Asset (Motor)
  │   └─ Asset (Steuerung)
  └─ Asset (Maschine B)
```

**SQL:** `SELECT * FROM asset WHERE parent_asset_id = ?`

---

## Wichtige Foreign Keys

### Asset Tabelle
```sql
asset.location_id          → location.id
asset.category_id          → asset_category.id
asset.parent_asset_id      → asset.id
asset.primary_user_id      → own_user.id
asset.deprecation_id       → deprecation.id
asset.floor_plan_id        → floor_plan.id
asset.company_id           → company.id
```

### Work Order Tabelle
```sql
work_order.asset_id           → asset.id
work_order.location_id        → location.id
work_order.primary_user_id    → own_user.id
work_order.category_id        → work_order_category.id
work_order.parent_request_id  → request.id
work_order.company_id         → company.id
```

### Labor Tabelle
```sql
labor.work_order_id       → work_order.id
labor.assignee_id         → own_user.id
labor.time_category_id    → time_category.id
labor.company_id          → company.id
```

### Meter & Reading
```sql
meter.asset_id        → asset.id
meter.category_id     → meter_category.id
meter.company_id      → company.id

reading.meter_id      → meter.id
reading.user_id       → own_user.id
reading.company_id    → company.id
```

---

## Datenfluss: Anlagenüberwachung

### Workflow für Grafana Dashboard Integration

```
1. KONFIGURATION
   ┌─────────────────────────┐
   │ company_settings        │
   │ alerting_dashboard_url  │ ← Admin konfiguriert
   └─────────────────────────┘
   
   ┌─────────────────────────┐
   │ asset                   │
   │ dashboard_url           │ ← Pro Asset konfiguriert
   └─────────────────────────┘

2. DATENQUELLEN
   ┌─────────────────────────┐
   │ External Sensors        │
   │ (IoT Devices)           │
   └────────┬────────────────┘
            │
            ▼
   ┌─────────────────────────┐
   │ InfluxDB                │
   │ - Temperature           │
   │ - Vibration             │
   │ - Pressure              │
   │ - Custom Metrics        │
   └────────┬────────────────┘
            │
            │ (Time Series Data)
            │
            ▼
   ┌─────────────────────────┐
   │ Grafana Dashboard       │
   │ - Real-time Charts      │
   │ - Alerts                │
   │ - Thresholds            │
   └────────┬────────────────┘
            │
            │ (Dashboard URL)
            │
            ▼
   ┌─────────────────────────┐
   │ MMS Application         │
   │ - Asset Monitoring Page │
   │ - Embedded Dashboards   │
   └─────────────────────────┘

3. VERKNÜPFUNG
   asset.id (PostgreSQL) = asset_id (InfluxDB Tag)
```

---

## Query Pattern: Multi-Tenant

**WICHTIG:** Alle Queries müssen `company_id` filtern!

```sql
-- ✅ RICHTIG
SELECT * FROM asset 
WHERE company_id = $company_id;

-- ❌ FALSCH (Security Risk!)
SELECT * FROM asset;
```

### Beispiel: Asset mit Work Orders
```sql
SELECT 
  a.*,
  COUNT(wo.id) as work_order_count
FROM asset a
LEFT JOIN work_order wo 
  ON wo.asset_id = a.id 
  AND wo.company_id = $company_id  -- ← Wichtig!
WHERE a.company_id = $company_id   -- ← Wichtig!
GROUP BY a.id;
```

---

## Performance-Indizes

### Wichtige Indizes für Grafana Queries

**Asset:**
- `idx_asset_company` auf `company_id`
- `idx_asset_location` auf `location_id`
- `idx_asset_status` auf `status`
- `idx_asset_archived` auf `archived`

**Work Order:**
- `idx_wo_company` auf `company_id`
- `idx_wo_asset` auf `asset_id`
- `idx_wo_status` auf `status`
- `idx_wo_created_at` auf `created_at`
- `idx_wo_due_date` auf `due_date`

**Reading (Time Series):**
- `idx_reading_meter` auf `meter_id`
- `idx_reading_date` auf `reading_date`
- Compound: `idx_reading_meter_date` auf `(meter_id, reading_date DESC)`

**Asset Downtime:**
- `idx_downtime_asset` auf `asset_id`
- `idx_downtime_starts` auf `starts_on`
- Compound: `idx_downtime_asset_date` auf `(asset_id, starts_on DESC)`

---

## Zusammenfassung für Grafana

### Top 5 Tabellen für Dashboards

1. **asset** - Stammdaten aller Anlagen
2. **work_order** - Wartungsaufträge und Reparaturen
3. **asset_downtime** - Ausfallzeiten (Time Series)
4. **reading** - Zählerstände (Time Series)
5. **labor** - Arbeitszeiten und Kosten

### Typische Dashboard-Queries

1. **Asset Health**: `asset` + `asset_downtime`
2. **Work Order KPIs**: `work_order` + `asset` + `labor`
3. **Costs**: `labor` + `part_consumption` + `part`
4. **Meter Readings**: `reading` + `meter` + `asset`
5. **Maintenance Schedule**: `preventive_maintenance` + `work_order`

---

## Cheat Sheet: SQL Aggregationen

```sql
-- Anzahl
COUNT(*)
COUNT(DISTINCT column)

-- Summen
SUM(duration)
SUM(cost * quantity)

-- Durchschnitt
AVG(duration)

-- Min/Max
MIN(created_at)
MAX(completed_on)

-- Gruppierung
GROUP BY asset_id, DATE_TRUNC('day', created_at)

-- Time-Fenster
WHERE created_at >= NOW() - INTERVAL '30 days'
WHERE created_at >= $__timeFrom() AND created_at <= $__timeTo()

-- Aggregations-Level
DATE_TRUNC('hour', timestamp_col)   -- Stündlich
DATE_TRUNC('day', timestamp_col)    -- Täglich
DATE_TRUNC('week', timestamp_col)   -- Wöchentlich
DATE_TRUNC('month', timestamp_col)  -- Monatlich
```

---

**Diese Dokumentation wurde erstellt für optimale Grafana-Dashboard-Entwicklung! 📊**
