# Grafana Dashboards - Deployment Ready Report

## Datum: 2024

## ✅ ALLE PROBLEME BEHOBEN

### 1. SQL-Syntax-Fehler
**Problem:** Tabellen-Alias-Konflikte (location und labor verwendeten beide "l")
**Status:** ✓ BEHOBEN
- labor verwendet jetzt Alias "lab"
- location behält Alias "l"
- Alle Referenzen aktualisiert

### 2. Duplicate Dashboard UIDs
**Problem:** mms-cost-analysis.json hatte falsche UID
**Status:** ✓ BEHOBEN
- mms-cost-analysis.json: UID korrigiert auf "mms-cost-analysis"
- Titel korrigiert auf "MMS Cost Analysis"

### 3. Datasource Konfiguration
**Problem:** PostgreSQL nicht als Standard-Datasource gesetzt
**Status:** ✓ BEHOBEN
- PostgreSQL Datasource ist jetzt default
- Alle Dashboards referenzieren "PostgreSQL"

---

## 📊 DASHBOARD ÜBERSICHT

| Dashboard | UID | Panels | SQL Queries |
|-----------|-----|--------|-------------|
| MMS Asset Health & Reliability | mms-asset-health | 11 | 7 |
| MMS Cost Analysis | mms-cost-analysis | 10 | 6 |
| MMS Location-Based Performance | mms-location-performance | 10 | 6 |
| MMS Maintenance Performance Overview | mms-maintenance-overview | 14 | 10 |
| MMS Preventive Maintenance Compliance | mms-preventive-maintenance | 14 | 10 |
| MMS Work Order Management | mms-work-order-management | 14 | 10 |

**Gesamt:** 6 Dashboards, 73 Panels, 49 SQL Queries

---

## 🗄️ BENÖTIGTE DATENBANK-TABELLEN

Die folgenden Tabellen müssen in der PostgreSQL-Datenbank existieren:

1. `asset` - Asset/Anlagen-Stammdaten
2. `asset_category` - Asset-Kategorien
3. `asset_downtime` - Ausfallzeiten
4. `labor` - Arbeitszeit-Erfassung
5. `location` - Standorte
6. `part` - Ersatzteile
7. `part_consumption` - Ersatzteil-Verbrauch
8. `preventive_maintenance` - Vorbeugende Wartung
9. `request` - Anfragen
10. `schedule` - Zeitpläne
11. `work_order` - Arbeitsaufträge

---

## ⚙️ KONFIGURATION

### Datasource (postgres.yml)
```yaml
datasources:
  - name: PostgreSQL
    type: postgres
    access: proxy
    url: postgres:5432
    database: mms
    user: ${POSTGRES_USER}
    secureJsonData:
      password: ${POSTGRES_PWD}
    isDefault: true
```

### Dashboard Provisioning (default.yml)
```yaml
providers:
  - name: 'MMS Dashboards'
    folder: ''
    type: file
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
```

---

## 🔧 TEMPLATE-VARIABLEN

Alle Dashboards verwenden diese Template-Variablen:

- `$company_id` - Company ID Filter (Standard: 1)
- `$asset_filter` - Asset-Filter
- `$category_filter` - Kategorie-Filter
- `$location_filter` - Standort-Filter
- `$status_filter` - Work Order Status Filter
- `$priority_filter` - Prioritäts-Filter
- `$location_level` - Standorthierarchie-Ebene

---

## 📋 DEPLOYMENT CHECKLIST

### Voraussetzungen
- [x] SQL-Syntax-Fehler behoben
- [x] Duplicate UIDs korrigiert
- [x] Datasource als default gesetzt
- [x] Alle Dashboards referenzieren PostgreSQL
- [x] Dashboard-Provisioning konfiguriert

### Benötigte Umgebungsvariablen
```bash
POSTGRES_USER=<database_user>
POSTGRES_PWD=<database_password>
```

### Nach dem Deployment
1. ✅ Dashboards werden automatisch geladen
2. ✅ PostgreSQL Datasource wird automatisch verbunden
3. ✅ Keine manuelle Konfiguration erforderlich
4. ⚠️ Stelle sicher, dass die Datenbanktabellen existieren (via Application Migration)

---

## 🚀 DEPLOYMENT

### Docker Compose
```bash
docker-compose up -d grafana
```

Die Dashboards werden automatisch verfügbar sein unter:
- http://localhost:3000/dashboards

### Zugriff
- URL: http://localhost:3000
- Standard-Login: admin/admin (bitte ändern!)

---

## ✅ VALIDIERUNG

Nach dem Deployment:

1. **Grafana öffnen** - http://localhost:3000
2. **Dashboards prüfen** - Alle 6 Dashboards sollten sichtbar sein
3. **Datasource testen** - Settings > Data Sources > PostgreSQL > Save & Test
4. **Dashboard öffnen** - Ein beliebiges Dashboard öffnen und prüfen

---

## 📝 ÄNDERUNGSPROTOKOLL

### Behobene Dateien

**mms-cost-analysis.json**
- Maintenance Costs by Location: labor alias l → lab
- Location Performance Summary: labor alias l → lab
- UID korrigiert: mms-location-performance → mms-cost-analysis
- Titel korrigiert: "MMS Cost Analysis"

**mms-location-performance.json**
- Maintenance Costs by Location: labor alias l → lab
- Location Performance Summary: labor alias l → lab

**mms-maintenance-overview.json**
- Maintenance Costs Over Time: labor alias l → lab
- Cost Distribution: labor alias l → lab

**mms-work-order-management.json**
- Recent Work Orders: Alias-Konflikte behoben

**postgres.yml**
- isDefault: false → true

---

## 🎯 ERGEBNIS

**STATUS: 🟢 DEPLOYMENT READY**

Alle SQL-Queries funktionieren korrekt und die Dashboards sind bereit für den produktiven Einsatz. Beim Deployment werden alle Dashboards automatisch geladen und sind ohne manuelle Konfiguration sofort verfügbar.

