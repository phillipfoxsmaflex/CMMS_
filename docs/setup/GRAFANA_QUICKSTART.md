# Grafana Dashboard Quick Start Guide

**Ziel:** Erstes Asset Monitoring Dashboard in 15 Minuten erstellen

Automatische Dashboard-Provisioning mit 6 professionellen Maintenance-Management-Dashboards!

---

## Voraussetzungen

1. MMS Docker-Stack läuft (`docker-compose up -d`)
2. Grafana erreichbar: http://localhost:3001
3. InfluxDB erreichbar: http://localhost:8086
4. PostgreSQL Datenquelle in Grafana konfiguriert


---

## Schritt 1: PostgreSQL Datenquelle hinzufügen

**Option A: Manuell (für ältere Versionen)**

1. Öffne Grafana: http://localhost:3001
2. Login mit Admin-Credentials (aus `.env`)
3. Navigation: **Configuration** → **Data Sources** → **Add data source**
4. Wähle **PostgreSQL**

**Konfiguration:**
```
Name: MMS-PostgreSQL
Host: postgres:5432
Database: mms
User: [aus .env POSTGRES_USER]
Password: [aus .env POSTGRES_PWD]
SSL Mode: disable
```

5. Klick auf **Save & Test**

**Option B: Automatisch**

Die Datenquelle wird automatisch beim Start des Grafana-Containers konfiguriert!
- Konfigurationsdatei: `grafana/provisioning/datasources/postgres.yml`
- Environment Variablen: `${POSTGRES_USER}`, `${POSTGRES_PWD}`
- Keine manuelle Konfiguration nötig!

---

## Schritt 2: Automatische Dashboards nutzen 

**NEU:** Ihnen stehen sofort 6 professionelle Dashboards zur Verfügung!

### Verfügbare Dashboards:

1. **MMS Maintenance Performance Overview**
   - Executive Dashboard mit OEE, MTTR, MTBF, Kostenanalysen
   - Zielgruppe: Maintenance Manager & Site Management
   - KPIs: Gesamtanlageneffektivität, Reparaturzeiten, Kostenentwicklung

2. **MMS Asset Health & Reliability**
   - Technisches Dashboard für Asset-Performance
   - Zielgruppe: Maintenance Engineers & Reliability Teams
   - Analysen: Verfügbarkeit, Ausfallraten, MTBF pro Asset

3. **MMS Work Order Management**
   - Operatives Dashboard für Arbeitsaufträge
   - Zielgruppe: Maintenance Supervisors & Planners
   - Metriken: Statusverteilung, Prioritäten, SLA-Compliance

4. **MMS Cost & Resource Analysis**
   - Finanz-Dashboard für Kostenkontrolle
   - Zielgruppe: Maintenance Manager & Finance
   - Analysen: Arbeitskosten, Materialkosten, Budgetverfolgung

5. **MMS Preventive Maintenance Compliance**
   - Compliance-Dashboard für Wartungspläne
   - Zielgruppe: Maintenance Planners
   - Metriken: PM-Erfüllungsrate, überfällige Wartungen

6. **MMS Location-Based Performance**
   - Standort-Dashboard mit Hierarchie-Analyse
   - Zielgruppe: Site Management
   - Analysen: Performance pro Gebäude/Ebene/Raum

### Zugriff auf automatische Dashboards:

1. **Nach dem Start**: Alle Dashboards werden automatisch erstellt
2. **Navigation**: **Dashboards** → **Browse** → **MMS Dashboards** Ordner
3. **Filterung**: Jedes Dashboard hat dynamische Filter für:
   - Company ID (automatisch)
   - Standorte
   - Assets
   - Kategorien
   - Status/Prioritäten

### Technische Details:

- **Provisioning-Ordner**: `grafana/provisioning/dashboards/`
- **Konfigurationsdatei**: `default.yml` mit `foldersFromFilesStructure: true`
- **JSON-Dateien**: Professionell gestaltete Dashboards mit:
  - Optimierten SQL-Queries
  - Passenden Visualisierungen
  - Responsivem Layout
  - Zeitbereichs-Filtern

## Schritt 3: Erstes Dashboard erstellen 

### 2.1 Neues Dashboard

1. Navigation: **Create** → **Dashboard**
2. Klick auf **Add a new panel**

### 2.2 Panel 1: Asset Übersicht (Stat)

**Query:**
```sql
SELECT COUNT(*) as value
FROM asset
WHERE archived = false
  AND company_id = 1
```

**Visualisierung:**
- Typ: **Stat**
- Title: "Aktive Anlagen"
- Unit: none

### 2.3 Panel 2: Assets nach Status (Pie Chart)

**Query:**
```sql
SELECT 
  status as metric,
  COUNT(*) as value
FROM asset
WHERE archived = false
  AND company_id = 1
GROUP BY status
```

**Visualisierung:**
- Typ: **Pie Chart**
- Title: "Assets nach Status"
- Legend: Show

### 2.4 Panel 3: Downtime Trend (Time Series)

**Query:**
```sql
SELECT 
  DATE_TRUNC('day', starts_on) as time,
  a.name as metric,
  SUM(duration) / 3600.0 as value
FROM asset_downtime ad
JOIN asset a ON a.id = ad.asset_id
WHERE ad.starts_on >= $__timeFrom()
  AND ad.starts_on <= $__timeTo()
  AND a.company_id = 1
GROUP BY DATE_TRUNC('day', starts_on), a.name
ORDER BY time
```

**Visualisierung:**
- Typ: **Time series**
- Title: "Ausfallzeiten (Stunden/Tag)"
- Unit: hours (h)
- Y-Axis Label: "Stunden"

### 2.5 Panel 4: Offene Work Orders (Stat)

**Query:**
```sql
SELECT COUNT(*) as value
FROM work_order
WHERE status IN ('OPEN', 'IN_PROGRESS')
  AND company_id = 1
```

**Visualisierung:**
- Typ: **Stat**
- Title: "Offene Work Orders"
- Color: Yellow (#FFAA00)
- Thresholds: 
  - Green: 0
  - Yellow: 5
  - Red: 10

---

## Schritt 3: Dashboard Variables hinzufügen

### Variable 1: Company ID

1. Dashboard Settings (⚙️) → **Variables** → **Add variable**

**Konfiguration:**
```
Name: company_id
Label: Company
Type: Query
Data source: MMS-PostgreSQL
Query: SELECT id as __value, name as __text FROM company ORDER BY name
```

### Variable 2: Asset

**Konfiguration:**
```
Name: asset_id
Label: Asset
Type: Query
Data source: MMS-PostgreSQL
Query: SELECT id as __value, name as __text FROM asset WHERE company_id = $company_id AND archived = false ORDER BY name
Multi-value: ✓
Include All option: ✓
```

---

## Schritt 4: Queries mit Variables aktualisieren

Ersetze in allen Queries:
```sql
-- Vorher
WHERE company_id = 1

-- Nachher
WHERE company_id = $company_id
```

Für Asset-Filter:
```sql
-- Mit Asset-Variable
WHERE a.id IN ($asset_id)
  AND a.company_id = $company_id
```

---

## Schritt 5: Advanced Panels

### Panel 5: Top 10 Assets mit höchster Downtime

**Query:**
```sql
SELECT 
  a.name,
  SUM(ad.duration) / 3600.0 as "Downtime (h)",
  COUNT(ad.id) as "Vorfälle"
FROM asset a
LEFT JOIN asset_downtime ad ON ad.asset_id = a.id
  AND ad.starts_on >= NOW() - INTERVAL '30 days'
WHERE a.archived = false
  AND a.company_id = $company_id
GROUP BY a.id, a.name
ORDER BY "Downtime (h)" DESC
LIMIT 10
```

**Visualisierung:**
- Typ: **Table**
- Title: "Top 10 Assets - Downtime (30 Tage)"

### Panel 6: Work Order Completion Rate

**Query:**
```sql
SELECT 
  DATE_TRUNC('week', created_at) as time,
  'Completion Rate' as metric,
  (COUNT(*) FILTER (WHERE status = 'COMPLETE') * 100.0 / NULLIF(COUNT(*), 0)) as value
FROM work_order
WHERE created_at >= $__timeFrom()
  AND created_at <= $__timeTo()
  AND company_id = $company_id
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY time
```

**Visualisierung:**
- Typ: **Time series**
- Title: "Work Order Completion Rate"
- Unit: percent (0-100)
- Y-Axis: 0-100

### Panel 7: MTTR (Mean Time To Repair)

**Query:**
```sql
SELECT 
  a.name as metric,
  AVG(ad.duration / 3600.0) as value
FROM asset_downtime ad
JOIN asset a ON a.id = ad.asset_id
WHERE ad.starts_on >= NOW() - INTERVAL '30 days'
  AND a.company_id = $company_id
GROUP BY a.id, a.name
HAVING COUNT(ad.id) > 0
ORDER BY value DESC
LIMIT 10
```

**Visualisierung:**
- Typ: **Bar gauge**
- Title: "MTTR - Durchschnittliche Reparaturzeit"
- Unit: hours (h)
- Orientation: Horizontal

---

## Schritt 6: Layout organisieren

1. **Drag & Drop** Panels um sie zu positionieren
2. **Resize** Panels mit dem Handle in der rechten unteren Ecke

**Empfohlenes Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Aktive Anlagen │ Offene WOs │ Status Pie Chart    │
├─────────────────────────────────────────────────────┤
│  Downtime Trend (Full Width)                        │
├─────────────────────────────────────────────────────┤
│  Top 10 Downtime Table    │  MTTR Bar Gauge        │
├─────────────────────────────────────────────────────┤
│  Work Order Completion Rate (Full Width)            │
└─────────────────────────────────────────────────────┘
```

---

## Schritt 7: Dashboard speichern

1. Klick auf **Save dashboard** (💾)
2. Name: "Asset Monitoring Dashboard"
3. Ordner: "MMS Dashboards" (neu erstellen)
4. Tags: "assets", "monitoring"
5. **Save**

---

## Schritt 8: Dashboard-URL für MMS hinterlegen

1. Öffne das Dashboard in Grafana
2. Kopiere die URL (z.B. `http://localhost:3001/d/abc123/asset-monitoring-dashboard`)
3. In MMS:
   - **Als Admin**: Gehe zu **Einstellungen** → **Alerting Dashboard** → URL eintragen
   - **Pro Asset**: Gehe zu **Asset Details** → **Dashboard Settings** → URL eintragen

---

## Bonus: Alert konfigurieren

### Alert: Zu viele offene Work Orders

1. Panel bearbeiten (Offene Work Orders)
2. Tab: **Alert**
3. **Create Alert**

**Konfiguration:**
```
Name: High Open Work Orders
Evaluate every: 5m
For: 10m

Condition:
WHEN last() OF query(A, 5m, now) IS ABOVE 10

Notifications:
- Email
- Slack (wenn konfiguriert)
```

---

## Nützliche Shortcuts

| Shortcut | Aktion |
|----------|--------|
| `d k` | Kiosk Mode |
| `d s` | Dashboard Settings |
| `t z` | Zoom Out |
| `Shift + Click` | Panel in neuem Tab öffnen |
| `v` | View Mode (Panel entfernen) |
| `e` | Edit Mode (Panel bearbeiten) |

---

## Nächste Schritte

### Für neue Benutzer:
1. **Automatische Dashboards erkunden**: Alle 6 Dashboards durchgehen
2. **Filter ausprobieren**: Standort-, Asset- und Zeitfilter testen
3. **Favoriten setzen**: Häufig genutzte Dashboards mit ⭐ markieren
4. **Zeitbereich anpassen**: Oben rechts für historische Analysen

### Für fortgeschrittene Benutzer:
1. **InfluxDB Integration**: IoT-Sensordaten einbinden für Echtzeit-Monitoring
2. **Erweiterte Queries**: Window Functions, CTEs, komplexe Aggregationen
3. **Annotations**: Wartungsereignisse und Störungen markieren
4. **Playlists**: Mehrere Dashboards für Präsentationen rotieren
5. **Snapshots**: Dashboard-Zustände für Berichte teilen
6. **Alerts**: Benachrichtigungen für kritische Metriken einrichten

### Für Administratoren:
1. **Benutzerrollen**: Viewer/Editor/Admin Rechte verwalten
2. **Teams**: Dashboard-Zugriff für Abteilungen organisieren
3. **Backup**: Dashboard-JSONs versionieren (Git)
4. **Performance**: Langsame Queries optimieren (Indizes, Aggregation)
5. **Custom Plugins**: Spezialisierte Visualisierungen hinzufügen

---

## Template Dashboards (aktualisierte Struktur)

Alle Dashboards automatisch provisioniert!

### Aktuelle Struktur:
```
grafana/
├── provisioning/
│   ├── datasources/
│   │   ├── influxdb.yml      # InfluxDB Konfiguration
│   │   └── postgres.yml      # PostgreSQL Konfiguration (NEU!)
│   └── dashboards/
│       └── default.yml       # Dashboard-Provisioning
└── dashboards/              # Automatisch erstellte Dashboards
    ├── mms-maintenance-overview.json
    ├── mms-asset-health.json
    ├── mms-work-order-management.json
    ├── mms-cost-analysis.json
    ├── mms-preventive-maintenance.json
    └── mms-location-performance.json
```

### Dateien im Detail:

**Datenquellen (`provisioning/datasources/`):**
- `influxdb.yml`: InfluxDB 2.x Konfiguration mit Flux & SQL Support
- `postgres.yml`: PostgreSQL 16 Konfiguration mit SSL & TimescaleDB Option

**Dashboards (`provisioning/dashboards/`):**
- `default.yml`: Provisioning-Konfiguration mit automatischem Update
- `mms-*.json`: 6 professionelle Maintenance-Management-Dashboards

### Eigene Dashboards hinzufügen:

1. **Neues Dashboard erstellen**: In Grafana manuell erstellen
2. **Exportieren**: Dashboard Settings → **JSON Model** → Kopieren
3. **Speichern**: Als neue JSON-Datei in `grafana/provisioning/dashboards/`
4. **Container neu starten**: `docker-compose restart grafana`
5. **Fertig**: Dashboard wird automatisch geladen!

**Tipp:** Nutzen Sie die bestehenden Dashboards als Vorlage für eigene Analysen!

---

## Troubleshooting

### Query läuft nicht
- Prüfe Datenquelle: Data Source aktiv?
- Prüfe Syntax: SQL korrekt?
- Prüfe Daten: `SELECT COUNT(*) FROM asset`
- Prüfe Company ID: Variable korrekt gesetzt?

### Dashboard zeigt keine Daten
- Zeitbereich prüfen: Oben rechts ⏰
- Variables prüfen: Sind Werte ausgewählt?
- Query Inspector: Panel → More → Query Inspector

### Panel lädt langsam
- Query optimieren: Indizes nutzen
- Zeitbereich einschränken
- Aggregation erhöhen: `DATE_TRUNC('hour', ...)` → `DATE_TRUNC('day', ...)`

---

## Beispiel Dashboard-Export

Sie können Ihr Dashboard exportieren:
1. Dashboard Settings → **JSON Model**
2. Code kopieren
3. In Datei speichern: `asset-monitoring.json`
4. Ins Repository committen
5. Anderen Grafana-Instanzen bereitstellen

---

**Glückwunsch! Sie haben jetzt Zugang zu einem kompletten Maintenance-Management-Analytics-System! 🎉**

### Schnelleinstieg:
1. **Grafana öffnen**: http://localhost:3001
2. **Login**: Admin-Credentials aus `.env`
3. **Dashboards finden**: **Dashboards** → **Browse** → **MMS Dashboards**
4. **Loslegen**: Sofort mit den 6 professionellen Dashboards arbeiten!

### Dokumentation & Referenzen:
- `GRAFANA_DATENBANK_GUIDE.md` - SQL Query Sammlung & Best Practices
- `DB_SCHEMA_DIAGRAM.md` - Komplette Datenbankstruktur & Beziehungen
- `DATENBANK_STRUKTUR.md` - Detaillierte Tabellen- und Feldbeschreibungen

### Support & Hilfe:
- **Probleme mit Dashboards?** → `grafana/provisioning/dashboards/` prüfen
- **Datenquellen-Probleme?** → `grafana/provisioning/datasources/` prüfen
- **Query-Fehler?** → Query Inspector in Grafana nutzen
- **Performance-Issues?** → Zeitbereich einschränken oder Aggregation erhöhen

**Tipp:** Die automatischen Dashboards sind bereits optimiert für die MMS-Datenbankstruktur und bieten sofortigen Mehrwert für Maintenance-Manager, Site-Leiter und Instandhaltungsteams!
