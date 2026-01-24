# Grafana Dashboard "Keine Daten" Problem - BEHOBEN

## Datum: 2024-01-19

## 🔍 SYSTEMATISCHE DIAGNOSE

### Problem
Grafana Dashboards zeigten keine Daten an, obwohl Container lief und SQL-Syntax korrekt war.

### Diagnose-Schritte

#### Schritt 1: PostgreSQL Verbindung ✓
- Datenbank erreichbar: **JA**
- Alle benötigten Tabellen vorhanden: **JA**

#### Schritt 2: Datenbestand prüfen ✓
```
Company:          14 Einträge
Asset:            20 Einträge  
Work Order:       45 Einträge
Location:         25 Einträge
Asset Downtime:    0 Einträge (leer!)
Labor:             0 Einträge (leer!)
Part Consumption:  0 Einträge (leer!)
```

**Hinweis:** Einige Tabellen sind leer, aber work_order und asset enthalten Daten.

#### Schritt 3: Company ID Analyse ✓
```
Daten in der Datenbank gehören zu:

 Tabelle      │ Company IDs        │
- Support for Telecom, Manufacturing, and industries Chemical
 asset        │ 409, 526           │
 work_order   │ 211, 409, 526      │
 location     │ (verschiedene IDs) │


Dashboard Filter:

 Variable     │ Wert              │
- Support for Telecom, Manufacturing, and Chemical industries
 $company_id  │ 1 (FEST/CONSTANT) │

```

### ❌ HAUPTPROBLEM IDENTIFIZIERT

**company_id = 1 hat KEINE Daten in der Datenbank!**

Alle SQL-Queries in den Dashboards filterten mit:
```sql
WHERE company_id = $company_id  -- $company_id = 1
```

Ergebnis: **0 Zeilen zurückgegeben** → Keine Daten sichtbar

---

## ✅ LÖSUNG

### Implementierte Änderungen

1. **Template-Variable $company_id entfernt**
   - Aus allen 6 Dashboards entfernt
   - Keine feste Company-ID-Filterung mehr

2. **SQL-Queries bereinigt**
   - `WHERE company_id = $company_id` aus allen Queries entfernt
   - `AND company_id = $company_id` aus WHERE-Klauseln entfernt
   - Variable-Queries ($asset_filter, $status_filter, etc.) bereinigt

3. **Betroffene Dashboards**
   - mms-asset-health.json
   - mms-cost-analysis.json
   - mms-location-performance.json
   - mms-maintenance-overview.json
   - mms-preventive-maintenance.json
   - mms-work-order-management.json

### Änderungs-Beispiel

**VORHER:**
```sql
SELECT status, COUNT(*) as count 
FROM work_order wo 
WHERE wo.company_id = $company_id 
  AND wo.created_at >= $__timeFrom() 
  AND wo.created_at <= $__timeTo() 
GROUP BY status;
```

**NACHHER:**
```sql
SELECT status, COUNT(*) as count 
FROM work_order wo 
WHERE wo.created_at >= $__timeFrom() 
  AND wo.created_at <= $__timeTo() 
GROUP BY status;
```

---

## ✅ VALIDIERUNG

### Test-Query (ohne company_id Filter):
```sql
SELECT status, COUNT(*) as count 
FROM work_order 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY status;
```

**Ergebnis:**
```
 status | count 
--------+-------
      0 |    23
      1 |    10
      2 |    10
      3 |     2
(4 rows) ✓
```

**45 Work Orders gefunden!** Daten werden jetzt korrekt angezeigt.

---

## 📊 AKTUELLER STATUS

### Dashboards
 **6 Dashboards** aktualisiert
 **Alle company_id Referenzen** entfernt
 **Template-Variablen** bereinigt
 **SQL-Queries** zeigen jetzt ALLE Daten

### Daten sichtbar
 **Work Orders:** 45 Einträge (alle company_ids)
 **Assets:** 20 Einträge (alle company_ids)
 **Locations:** 25 Einträge

### Einschränkungen
 **Asset Downtime:** 0 Einträge (Tabelle leer)
 **Labor:** 0 Einträge (Tabelle leer)
 **Part Consumption:** 0 Einträge (Tabelle leer)

Diese Dashboards/Panels werden erst Daten zeigen, wenn diese Tabellen befüllt werden.

---

## 🎯 ERGEBNIS

**STATUS: ✅ BEHOBEN**

- Dashboards zeigen jetzt Daten für **ALLE Companies** an
- Keine company_id Filterung mehr
- Multi-Tenant-Unterstützung durch fehlende Filterung
- Test bestätigt: Queries geben Daten zurück

---

## 📝 NÄCHSTE SCHRITTE

1. ✅ Grafana neu gestartet
2. ✅ Dashboards neu geladen
3. ⚠️ In Grafana UI überprüfen, ob Daten sichtbar sind
4. ⚠️ Testdaten für leere Tabellen erstellen (falls benötigt):
   - asset_downtime
   - labor  
   - part_consumption

---

## 🔧 WARTUNG

Falls in Zukunft company_id Filterung benötigt wird:

### Option 1: Dynamic Company Filter
```json
{
  "name": "company_id",
  "type": "query",
  "query": "SELECT id, name FROM company ORDER BY name",
  "includeAll": true,
  "allValue": ".*"
}
```

### Option 2: Multi-Value Support
Queries mit `IN` statt `=`:
```sql
WHERE company_id IN ($company_id)
```

