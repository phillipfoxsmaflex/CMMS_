# MMS Datenbank-Guide für Grafana Dashboards

**Erstellt:** 2026-01-15  
**Zweck:** Praktischer Leitfaden für die Erstellung von Grafana-Dashboards

---

## 📋 Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [Wichtige Tabellen](#wichtige-tabellen)
3. [Beziehungen](#beziehungen)
4. [Nützliche Queries für Grafana](#nützliche-queries-für-grafana)
5. [Dashboard-Beispiele](#dashboard-beispiele)
6. [Time-Series Queries](#time-series-queries)
7. [Tipps & Tricks](#tipps--tricks)

---

## Übersicht

Die MMS-Datenbank verwendet PostgreSQL. Alle Tabellen haben folgende gemeinsame Felder (von `CompanyAudit`):
- `id` (BIGINT) - Primärschlüssel
- `created_at` (TIMESTAMP) - Erstellungsdatum
- `updated_at` (TIMESTAMP) - Letzte Aktualisierung
- `created_by` (BIGINT) - User-ID des Erstellers
- `company_id` (BIGINT) - Firma (für Multi-Tenant)

---

## Wichtige Tabellen

### 1. **asset** - Anlagen

Die zentrale Tabelle für alle Anlagen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | BIGINT | Eindeutige Anlagen-ID |
| name | VARCHAR(255) | **Anlagenname** |
| custom_id | VARCHAR(255) | Benutzerdefinierte ID |
| status | VARCHAR(50) | Status (OPERATIONAL, DOWN, STANDBY, etc.) |
| archived | BOOLEAN | Archiviert? |
| description | TEXT | Beschreibung |
| area | VARCHAR(255) | Bereich |
| bar_code | VARCHAR(255) | Barcode |
| nfc_id | VARCHAR(255) | NFC-ID |
| serial_number | VARCHAR(255) | Seriennummer |
| model | VARCHAR(255) | Modell |
| manufacturer | VARCHAR(255) | Hersteller |
| power | VARCHAR(255) | Leistung |
| acquisition_cost | DOUBLE PRECISION | Anschaffungskosten |
| warranty_expiration_date | TIMESTAMP | Garantieablauf |
| in_service_date | TIMESTAMP | Inbetriebnahme |
| additional_infos | TEXT | Zusatzinfos |
| **dashboard_url** | VARCHAR(512) | **Grafana Dashboard URL** |
| **dashboard_config** | TEXT | Dashboard-Konfiguration |
| location_id | BIGINT | → location.id |
| category_id | BIGINT | → asset_category.id |
| parent_asset_id | BIGINT | → asset.id (Hierarchie) |
| primary_user_id | BIGINT | → own_user.id |
| deprecation_id | BIGINT | → deprecation.id |
| floor_plan_id | BIGINT | → floor_plan.id |
| position_x | DOUBLE PRECISION | X-Position auf Grundriss |
| position_y | DOUBLE PRECISION | Y-Position auf Grundriss |
| company_id | BIGINT | → company.id |

**Asset Status Werte:**
- `OPERATIONAL` - Betriebsbereit
- `DOWN` - Ausgefallen
- `STANDBY` - Bereitschaft
- `MODERNIZATION` - Modernisierung
- `INSPECTION_SCHEDULED` - Inspektion geplant
- `COMMISSIONING` - Inbetriebnahme
- `EMERGENCY_SHUTDOWN` - Notabschaltung

---

### 2. **work_order** - Arbeitsaufträge

Wartungsaufträge und Reparaturen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | BIGINT | Auftragsnummer |
| title | VARCHAR(255) | **Auftragsbezeichnung** |
| description | TEXT | Beschreibung |
| status | VARCHAR(50) | Status (OPEN, IN_PROGRESS, ON_HOLD, COMPLETE) |
| priority | VARCHAR(50) | Priorität (NONE, LOW, MEDIUM, HIGH) |
| due_date | TIMESTAMP | **Fälligkeitsdatum** |
| completed_on | TIMESTAMP | **Abschlussdatum** |
| estimated_duration | INTEGER | Geschätzte Dauer (Minuten) |
| archive | BOOLEAN | Archiviert? |
| feedback | TEXT | Rückmeldung |
| asset_id | BIGINT | → asset.id |
| location_id | BIGINT | → location.id |
| primary_user_id | BIGINT | → own_user.id |
| category_id | BIGINT | → work_order_category.id |
| parent_request_id | BIGINT | → request.id |
| company_id | BIGINT | → company.id |

**Work Order Status:**
- `OPEN` - Offen
- `IN_PROGRESS` - In Bearbeitung
- `ON_HOLD` - Wartend
- `COMPLETE` - Abgeschlossen

**Priority Levels:**
- `NONE` - Keine
- `LOW` - Niedrig
- `MEDIUM` - Mittel
- `HIGH` - Hoch

---

### 3. **asset_downtime** - Ausfallzeiten

Dokumentiert Anlagenausfälle und deren Dauer.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | BIGINT | ID |
| starts_on | TIMESTAMP | **Ausfallbeginn** |
| ends_on | TIMESTAMP | **Ausfallende** |
| duration | BIGINT | **Dauer (Sekunden)** |
| downtime_reason | TEXT | Ausfallgrund |
| asset_id | BIGINT | → asset.id |
| company_id | BIGINT | → company.id |

---

### 4. **meter** - Zähler/Messgeräte

Zähler für Assets (z.B. Betriebsstunden, Kilometer, etc.).

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | BIGINT | ID |
| name | VARCHAR(255) | **Zählername** |
| unit | VARCHAR(50) | Einheit (hours, km, cycles) |
| update_frequency | INTEGER | Update-Frequenz (Tage) |
| asset_id | BIGINT | → asset.id |
| category_id | BIGINT | → meter_category.id |
| company_id | BIGINT | → company.id |

---

### 5. **reading** - Zählerstände

Ablesungen von Zählern (Time-Series Daten!).

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | BIGINT | ID |
| value | DOUBLE PRECISION | **Ablesewert** |
| reading_date | TIMESTAMP | **Ablesedatum** |
| meter_id | BIGINT | → meter.id |
| user_id | BIGINT | → own_user.id |
| company_id | BIGINT | → company.id |

⚡ **Perfekt für Time-Series Visualisierungen in Grafana!**

---

### 6. **labor** - Arbeitszeit

Erfasste Arbeitszeiten für Work Orders.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | BIGINT | ID |
| duration | DOUBLE PRECISION | **Dauer (Stunden)** |
| started_on | TIMESTAMP | Beginn |
| includes_other_costs | BOOLEAN | Enthält Zusatzkosten? |
| hourly_rate | DOUBLE PRECISION | **Stundensatz** |
| logged_at | TIMESTAMP | Erfasst am |
| work_order_id | BIGINT | → work_order.id |
| assignee_id | BIGINT | → own_user.id |
| time_category_id | BIGINT | → time_category.id |
| company_id | BIGINT | → company.id |

---

### 7. **part_consumption** - Ersatzteilverbrauch

Verwendete Ersatzteile pro Work Order.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | BIGINT | ID |
| quantity | INTEGER | **Menge** |
| part_id | BIGINT | → part.id |
| work_order_id | BIGINT | → work_order.id |
| company_id | BIGINT | → company.id |

---

### 8. **part** - Ersatzteile

Lagerbestand von Ersatzteilen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | BIGINT | ID |
| name | VARCHAR(255) | **Teilename** |
| cost | DOUBLE PRECISION | **Stückpreis** |
| quantity | INTEGER | **Lagerbestand** |
| min_quantity | INTEGER | Mindestbestand |
| area | VARCHAR(255) | Lagerbereich |
| barcode | VARCHAR(255) | Barcode |
| description | TEXT | Beschreibung |
| category_id | BIGINT | → part_category.id |
| company_id | BIGINT | → company.id |

---

### 9. **preventive_maintenance** - Vorbeugende Wartung

Geplante Wartungspläne.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | BIGINT | ID |
| name | VARCHAR(255) | **Wartungsplanname** |
| category_id | BIGINT | → work_order_category.id |
| primary_user_id | BIGINT | → own_user.id |
| company_id | BIGINT | → company.id |

---

### 10. **location** - Standorte

Organisationsstruktur für Anlagen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | BIGINT | ID |
| name | VARCHAR(255) | **Standortname** |
| address | VARCHAR(500) | Adresse |
| longitude | DOUBLE PRECISION | GPS Längengrad |
| latitude | DOUBLE PRECISION | GPS Breitengrad |
| parent_location_id | BIGINT | → location.id (Hierarchie) |
| company_id | BIGINT | → company.id |

---

### 11. **company_settings** - Firmeneinstellungen

Globale Einstellungen inkl. Alerting Dashboard.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | BIGINT | ID |
| **alerting_dashboard_url** | VARCHAR(512) | **Globale Alerting Dashboard URL** |
| **alerting_dashboard_config** | TEXT | Dashboard-Konfiguration |
| company_id | BIGINT | → company.id |

---

## Beziehungen

### Asset-Hierarchie
```
company
  └── location (hierarchisch)
       └── asset (hierarchisch)
            ├── work_order (1:n)
            ├── asset_downtime (1:n)
            ├── meter (1:n)
            │    └── reading (1:n)
            └── preventive_maintenance (n:m)
```

### Work Order Flow
```
asset → work_order → labor (1:n)
                  → part_consumption (1:n) → part
                  → additional_cost (1:n)
```

### Wichtige Many-to-Many Beziehungen

**T_Asset_User_Associations**
- Verbindet: asset ↔ own_user (assignedTo)
- Felder: `id_asset`, `id_user`

**T_Asset_Team_Associations**
- Verbindet: asset ↔ team
- Felder: `id_asset`, `id_team`

**T_Asset_Part_Associations**
- Verbindet: asset ↔ part
- Felder: `id_asset`, `id_part`

---

## Nützliche Queries für Grafana

### 1. Asset Übersicht

```sql
-- Anzahl Assets nach Status
SELECT 
  status,
  COUNT(*) as count
FROM asset
WHERE archived = false
  AND company_id = $company_id
GROUP BY status
ORDER BY count DESC;
```

```sql
-- Assets mit aktiven Work Orders
SELECT 
  a.name as asset_name,
  COUNT(wo.id) as open_work_orders,
  MAX(wo.priority) as highest_priority
FROM asset a
LEFT JOIN work_order wo ON wo.asset_id = a.id 
  AND wo.status IN ('OPEN', 'IN_PROGRESS')
WHERE a.archived = false
  AND a.company_id = $company_id
GROUP BY a.id, a.name
HAVING COUNT(wo.id) > 0
ORDER BY open_work_orders DESC;
```

---

### 2. Ausfallzeiten (Downtime) Analyse

```sql
-- Gesamte Ausfallzeit pro Asset (letzte 30 Tage)
SELECT 
  a.name as asset_name,
  a.custom_id,
  SUM(ad.duration) / 3600.0 as total_downtime_hours,
  COUNT(ad.id) as downtime_events,
  AVG(ad.duration) / 3600.0 as avg_downtime_hours
FROM asset a
LEFT JOIN asset_downtime ad ON ad.asset_id = a.id
  AND ad.starts_on >= NOW() - INTERVAL '30 days'
WHERE a.archived = false
  AND a.company_id = $company_id
GROUP BY a.id, a.name, a.custom_id
ORDER BY total_downtime_hours DESC
LIMIT 10;
```

```sql
-- Downtime Trend (Time Series)
SELECT 
  DATE_TRUNC('day', starts_on) as time,
  a.name as metric,
  SUM(duration) / 3600.0 as downtime_hours
FROM asset_downtime ad
JOIN asset a ON a.id = ad.asset_id
WHERE ad.starts_on >= $__timeFrom()
  AND ad.starts_on <= $__timeTo()
  AND a.company_id = $company_id
GROUP BY DATE_TRUNC('day', starts_on), a.name
ORDER BY time;
```

---

### 3. Work Order Metriken

```sql
-- Work Order Completion Rate
SELECT 
  DATE_TRUNC('week', created_at) as time,
  COUNT(*) FILTER (WHERE status = 'COMPLETE') * 100.0 / NULLIF(COUNT(*), 0) as completion_rate,
  COUNT(*) as total_work_orders,
  COUNT(*) FILTER (WHERE status = 'COMPLETE') as completed
FROM work_order
WHERE created_at >= $__timeFrom()
  AND created_at <= $__timeTo()
  AND company_id = $company_id
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY time;
```

```sql
-- Überfällige Work Orders
SELECT 
  a.name as asset_name,
  wo.title,
  wo.priority,
  wo.due_date,
  (NOW() - wo.due_date) as overdue_duration,
  u.first_name || ' ' || u.last_name as assigned_to
FROM work_order wo
JOIN asset a ON a.id = wo.asset_id
LEFT JOIN own_user u ON u.id = wo.primary_user_id
WHERE wo.status IN ('OPEN', 'IN_PROGRESS')
  AND wo.due_date < NOW()
  AND wo.company_id = $company_id
ORDER BY wo.due_date ASC;
```

```sql
-- Work Orders nach Priorität (Time Series)
SELECT 
  DATE_TRUNC('day', created_at) as time,
  priority,
  COUNT(*) as count
FROM work_order
WHERE created_at >= $__timeFrom()
  AND created_at <= $__timeTo()
  AND company_id = $company_id
GROUP BY DATE_TRUNC('day', created_at), priority
ORDER BY time;
```

---

### 4. Zählerstände (Meter Readings)

```sql
-- Zählerstand Verlauf (Time Series)
SELECT 
  r.reading_date as time,
  m.name as metric,
  r.value,
  m.unit
FROM reading r
JOIN meter m ON m.id = r.meter_id
WHERE r.reading_date >= $__timeFrom()
  AND r.reading_date <= $__timeTo()
  AND m.asset_id = $asset_id
ORDER BY r.reading_date;
```

```sql
-- Zählerstand-Änderungsrate
SELECT 
  r.reading_date as time,
  m.name as metric,
  r.value - LAG(r.value) OVER (PARTITION BY m.id ORDER BY r.reading_date) as rate_of_change
FROM reading r
JOIN meter m ON m.id = r.meter_id
WHERE r.reading_date >= $__timeFrom()
  AND r.reading_date <= $__timeTo()
  AND m.company_id = $company_id
ORDER BY r.reading_date;
```

---

### 5. Kosten-Analyse

```sql
-- Wartungskosten pro Asset
SELECT 
  a.name as asset_name,
  SUM(l.duration * l.hourly_rate) as labor_cost,
  SUM(pc.quantity * p.cost) as parts_cost,
  SUM(l.duration * l.hourly_rate) + SUM(pc.quantity * p.cost) as total_cost
FROM asset a
LEFT JOIN work_order wo ON wo.asset_id = a.id
LEFT JOIN labor l ON l.work_order_id = wo.id
LEFT JOIN part_consumption pc ON pc.work_order_id = wo.id
LEFT JOIN part p ON p.id = pc.part_id
WHERE a.archived = false
  AND wo.created_at >= $__timeFrom()
  AND wo.created_at <= $__timeTo()
  AND a.company_id = $company_id
GROUP BY a.id, a.name
ORDER BY total_cost DESC;
```

```sql
-- Kosten-Trend (Time Series)
SELECT 
  DATE_TRUNC('month', wo.created_at) as time,
  'Labor' as category,
  SUM(l.duration * l.hourly_rate) as cost
FROM work_order wo
JOIN labor l ON l.work_order_id = wo.id
WHERE wo.created_at >= $__timeFrom()
  AND wo.created_at <= $__timeTo()
  AND wo.company_id = $company_id
GROUP BY DATE_TRUNC('month', wo.created_at)

UNION ALL

SELECT 
  DATE_TRUNC('month', wo.created_at) as time,
  'Parts' as category,
  SUM(pc.quantity * p.cost) as cost
FROM work_order wo
JOIN part_consumption pc ON pc.work_order_id = wo.id
JOIN part p ON p.id = pc.part_id
WHERE wo.created_at >= $__timeFrom()
  AND wo.created_at <= $__timeTo()
  AND wo.company_id = $company_id
GROUP BY DATE_TRUNC('month', wo.created_at)

ORDER BY time;
```

---

### 6. Arbeitszeit-Analyse

```sql
-- Arbeitszeit pro Techniker
SELECT 
  u.first_name || ' ' || u.last_name as technician,
  SUM(l.duration) as total_hours,
  COUNT(DISTINCT l.work_order_id) as work_orders_completed,
  AVG(l.duration) as avg_hours_per_order
FROM labor l
JOIN own_user u ON u.id = l.assignee_id
WHERE l.logged_at >= $__timeFrom()
  AND l.logged_at <= $__timeTo()
  AND l.company_id = $company_id
GROUP BY u.id, u.first_name, u.last_name
ORDER BY total_hours DESC;
```

---

### 7. Ersatzteil-Verbrauch

```sql
-- Top verbrauchte Ersatzteile
SELECT 
  p.name as part_name,
  SUM(pc.quantity) as total_consumed,
  p.quantity as current_stock,
  p.min_quantity as min_stock,
  CASE 
    WHEN p.quantity < p.min_quantity THEN 'LOW STOCK'
    ELSE 'OK'
  END as stock_status
FROM part_consumption pc
JOIN part p ON p.id = pc.part_id
WHERE pc.created_at >= $__timeFrom()
  AND pc.created_at <= $__timeTo()
  AND p.company_id = $company_id
GROUP BY p.id, p.name, p.quantity, p.min_quantity
ORDER BY total_consumed DESC
LIMIT 20;
```

---

### 8. MTBF & MTTR (Mean Time Between Failures / Mean Time To Repair)

```sql
-- MTBF Berechnung
WITH failure_intervals AS (
  SELECT 
    asset_id,
    starts_on,
    LAG(ends_on) OVER (PARTITION BY asset_id ORDER BY starts_on) as previous_end
  FROM asset_downtime
  WHERE company_id = $company_id
)
SELECT 
  a.name as asset_name,
  AVG(EXTRACT(EPOCH FROM (fi.starts_on - fi.previous_end)) / 3600.0) as mtbf_hours
FROM failure_intervals fi
JOIN asset a ON a.id = fi.asset_id
WHERE fi.previous_end IS NOT NULL
GROUP BY a.id, a.name
HAVING COUNT(*) > 1
ORDER BY mtbf_hours DESC;
```

```sql
-- MTTR Berechnung
SELECT 
  a.name as asset_name,
  AVG(ad.duration / 3600.0) as mttr_hours,
  COUNT(ad.id) as failure_count
FROM asset_downtime ad
JOIN asset a ON a.id = ad.asset_id
WHERE ad.starts_on >= $__timeFrom()
  AND ad.starts_on <= $__timeTo()
  AND a.company_id = $company_id
GROUP BY a.id, a.name
ORDER BY mttr_hours DESC;
```

---

## Dashboard-Beispiele

### 1. Asset Health Dashboard

**Panels:**
1. **Stat Panel** - Anzahl Assets nach Status (Pie Chart)
2. **Time Series** - Downtime Trend letzte 30 Tage
3. **Table** - Top 10 Assets mit höchster Downtime
4. **Gauge** - Durchschnittliche Verfügbarkeit (Uptime %)
5. **Bar Chart** - Assets nach Standort

**Variables:**
- `$company_id` - Company Filter
- `$location_id` - Location Filter
- `$asset_category` - Asset Category Filter

---

### 2. Work Order Dashboard

**Panels:**
1. **Stat Panel** - Offene Work Orders (Count)
2. **Stat Panel** - Überfällige Work Orders (Count mit Alarmfarbe)
3. **Time Series** - Work Order Erstellung vs. Abschluss
4. **Table** - Überfällige Work Orders mit Details
5. **Bar Chart** - Work Orders nach Priorität
6. **Heatmap** - Work Order Dichte über Zeit

---

### 3. Cost Analysis Dashboard

**Panels:**
1. **Time Series** - Kosten-Trend (Labor vs. Parts)
2. **Pie Chart** - Kostenverteilung (Labor/Parts/Other)
3. **Table** - Teuerste Assets (Total Cost)
4. **Bar Chart** - Kosten nach Kategorie
5. **Stat Panel** - Total Maintenance Cost

---

### 4. Meter Reading Dashboard

**Panels:**
1. **Time Series** - Zählerstände über Zeit (Multi-Line)
2. **Stat Panel** - Aktueller Zählerstand
3. **Gauge** - Zählerstand-Fortschritt
4. **Table** - Letzte Ablesungen

---

## Time-Series Queries

### Grafana Time Range Variables

Nutzen Sie Grafanas eingebaute Variablen für Time-Range Queries:

- `$__timeFrom()` - Start der ausgewählten Zeitspanne
- `$__timeTo()` - Ende der ausgewählten Zeitspanne
- `$__interval` - Auto-Interval für Aggregation

**Beispiel:**
```sql
SELECT 
  DATE_TRUNC('$__interval', created_at) as time,
  COUNT(*) as count
FROM work_order
WHERE created_at >= $__timeFrom()
  AND created_at <= $__timeTo()
GROUP BY time
ORDER BY time;
```

---

## Tipps & Tricks

### 1. Performance-Optimierung

**Indizes benutzen:**
```sql
-- Nutzen Sie WHERE Clauses auf indizierten Spalten
WHERE company_id = $company_id  -- Immer filtern!
  AND created_at >= $__timeFrom()  -- Zeitfilter
```

**Aggregation:**
```sql
-- Bei großen Datenmengen aggregieren
DATE_TRUNC('hour', timestamp_column)  -- Statt einzelne Datenpunkte
```

---

### 2. Multi-Tenancy

**Immer company_id filtern:**
```sql
WHERE company_id = $company_id
```

Dies ist kritisch für die Datenisolation zwischen Firmen!

---

### 3. Null-Handling

```sql
-- Sichere Null-Behandlung
COALESCE(column_name, 0)
NULLIF(divisor, 0)  -- Verhindert Division durch Null
```

---

### 4. Variables in Grafana

**Dashboard Variables definieren:**
- `$company_id` - Query: `SELECT id as __value, name as __text FROM company`
- `$asset_id` - Query: `SELECT id as __value, name as __text FROM asset WHERE company_id = $company_id`
- `$location_id` - Query: `SELECT id as __value, name as __text FROM location WHERE company_id = $company_id`

---

### 5. Alerts konfigurieren

**Beispiel Alert Query:**
```sql
-- Alert wenn mehr als 5 überfällige Work Orders
SELECT COUNT(*) as value
FROM work_order
WHERE status IN ('OPEN', 'IN_PROGRESS')
  AND due_date < NOW()
  AND company_id = $company_id
```

**Alert Condition:** `WHEN count() OF query(A, 5m, now) IS ABOVE 5`

---

### 6. InfluxDB Integration

Für externe Sensordaten können Sie InfluxDB nutzen und mit Postgres-Daten kombinieren:

**Grafana Mixed Data Source Dashboard:**
- PostgreSQL: Asset-Stammdaten, Work Orders
- InfluxDB: Sensor-Zeitreihen (Temperatur, Vibration, etc.)

**Join über Asset ID:**
```
InfluxDB Tag: asset_id = PostgreSQL: asset.id
```

---

## Zusätzliche Ressourcen

### Useful Links
- [Grafana Postgres Datasource](https://grafana.com/docs/grafana/latest/datasources/postgres/)
- [Grafana Time Series](https://grafana.com/docs/grafana/latest/panels/visualizations/time-series/)
- [PostgreSQL Date/Time Functions](https://www.postgresql.org/docs/current/functions-datetime.html)

### SQL Window Functions
Für fortgeschrittene Analysen:
- `LAG()` / `LEAD()` - Vorherige/Nächste Zeile
- `ROW_NUMBER()` - Zeilennummern
- `RANK()` - Ranking mit Lücken
- `DENSE_RANK()` - Ranking ohne Lücken

---

## Troubleshooting

### Query läuft langsam
1. Prüfen Sie Indizes auf gefilterten Spalten
2. Verwenden Sie EXPLAIN ANALYZE
3. Aggregieren Sie mehr (größere Intervalle)
4. Limitieren Sie das Zeitfenster

### Keine Daten
1. Prüfen Sie `company_id` Filter
2. Prüfen Sie Zeitbereich `$__timeFrom()` / `$__timeTo()`
3. Prüfen Sie ob Daten in der Tabelle existieren
4. Prüfen Sie JOIN Bedingungen

### Falsches Datumsformat
```sql
-- Konvertierung für Grafana Time Series
timestamp_column AT TIME ZONE 'UTC'
```

---

**Viel Erfolg beim Erstellen Ihrer Grafana Dashboards! 🚀📊**
