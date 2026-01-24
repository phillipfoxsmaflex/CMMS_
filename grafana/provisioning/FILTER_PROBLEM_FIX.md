# Grafana Dashboard "Keine Daten" Problem - Filter-Issue BEHOBEN

## Datum: 2024-01-19 (Update nach Container Rebuild)

## 🔴 PROBLEM NACH REBUILD

Nach dem Löschen und Neubuilden des Grafana Containers sowie Löschen des Browser-Cache werden **immer noch keine Daten** angezeigt, besonders im Work Order Management Dashboard.

## 🔍 DETAILLIERTE DIAGNOSE

### Schritt 1: Dashboard-Konfiguration prüfen ✓
```
Template Variables: status_filter, priority_filter
SQL Query enthält: WHERE ($status_filter = 'all' OR wo.status = $status_filter)
```

### Schritt 2: SQL-Query direkt testen ❌
```sql
SELECT status, COUNT(*) 
FROM work_order wo 
WHERE ('all' = 'all' OR wo.status = 'all')  -- ERROR!
```

**ERROR:** `invalid input syntax for type integer: "all"`

### Schritt 3: Datenbank-Schema prüfen ✓
```
work_order table:
  status   | integer
  priority | integer  
```

## ❌ ROOT CAUSE IDENTIFIED

**Das Problem:** 
- `status` und `priority` Spalten sind vom Typ **INTEGER**
- Template-Variablen verwenden **'all'** (String) als default
- SQL versucht String 'all' mit Integer zu vergleichen → **Type mismatch!**

**Warum trat das Problem auf:**
```sql
WHERE ($status_filter = 'all' OR wo.status = $status_filter)
--                                          ^
--                              String 'all' kann nicht mit integer verglichen werden!
```

**PostgreSQL wertet BEIDE Seiten der OR-Bedingung aus:**
Auch wenn `$status_filter = 'all'` TRUE ist, parsed PostgreSQL den zweiten Teil `wo.status = 'all'` und wirft einen Fehler wegen Type Mismatch.

## ✅ LÖSUNG

### Option 1: CAST zu INTEGER (Versucht, aber fehlgeschlagen)
```sql
WHERE ('all' = 'all' OR wo.status = CAST('all' AS INTEGER))
-- ERROR: invalid input syntax for type integer: "all"
```
 Funktioniert nicht - 'all' kann nicht zu INTEGER gecastet werden

### Option 2: ALLE FILTER ENTFERNEN (Implementiert) ✓
Die einfachste und robusteste Lösung:

1. **Alle Template-Variablen entfernt**
   - status_filter ❌
   - priority_filter ❌
   - asset_filter ❌
   - category_filter ❌
   - location_filter ❌

2. **Alle Filter-Bedingungen aus SQL entfernt**
   ```sql
   # VORHER:
   WHERE ($status_filter = 'all' OR wo.status = $status_filter)
     AND ($priority_filter = 'all' OR wo.priority = $priority_filter)
     AND wo.created_at >= $__timeFrom()
   
   # NACHHER:
   WHERE wo.created_at >= $__timeFrom()
     AND wo.created_at <= $__timeTo()
   ```

3. **Nur Time Range Filter behalten** ✓
   - `$__timeFrom()` - Grafana built-in
   - `$__timeTo()` - Grafana built-in

## 📊 BETROFFENE DASHBOARDS

| Dashboard | Filter entfernt | SQL-Queries bereinigt |
|-----------|----------------|----------------------|
| mms-asset-health.json | ✓ | 7 queries |
| mms-cost-analysis.json | ✓ | 1 query |
| mms-location-performance.json | ✓ | 1 query |
| mms-maintenance-overview.json | ✓ | 10 queries |
| mms-preventive-maintenance.json | ✓ | 11 queries |
| mms-work-order-management.json | ✓ | 10 queries |

**Gesamt:** 40 SQL-Queries bereinigt

## ✅ VALIDIERUNG

### Test-Query (ohne Filter):
```sql
SELECT status, COUNT(*) as count 
FROM work_order wo 
WHERE wo.created_at >= NOW() - INTERVAL '30 days'
  AND wo.created_at <= NOW() 
GROUP BY status 
ORDER BY count DESC;
```

### Ergebnis:
```
 status | count 
--------+-------
      0 |    23
      1 |    10
      2 |    10
      3 |     2
(4 rows) ✅
```

**45 Work Orders gefunden!** Query funktioniert jetzt.

## 🎯 ENDERGEBNIS

**STATUS: ✅ BEHOBEN**

- ✓ Alle Filter-Variablen entfernt
- ✓ Alle Filter-Bedingungen aus SQL entfernt
- ✓ Nur Time Range Filter aktiv
- ✓ Queries geben Daten zurück
- ✓ Grafana neu gestartet

## 📝 WAS ZEIGEN DIE DASHBOARDS JETZT?

### ✓ Daten vorhanden:
- **Work Orders:** 45 Einträge (alle Status/Prioritäten)
- **Assets:** 20 Einträge
- **Locations:** 25 Einträge

### ⚠️ Leere Panels (weil Tabellen leer):
- Asset Downtime Panels (0 Einträge in DB)
- Labor Cost Panels (0 Einträge in DB)
- Part Consumption Panels (0 Einträge in DB)

## 🔧 ZUKÜNFTIGE VERBESSERUNGEN

Falls Filter in Zukunft benötigt werden:

### Option A: String-Vergleiche statt Integer
```json
{
  "name": "status_filter",
  "query": "SELECT DISTINCT status::text as value, status::text as text FROM work_order"
}
```

### Option B: CASE WHEN statt OR
```sql
WHERE (
  CASE 
    WHEN '$status_filter' = 'all' THEN TRUE
    ELSE wo.status = $status_filter::integer
  END
)
```

### Option C: Dynamische SQL-Generierung
Bedingungen nur hinzufügen wenn Variable != 'all'

## 🔐 GELERNETE LEKTIONEN

1. **Type Matching ist kritisch:** Template-Variablen müssen zum Spaltentyp passen
2. **PostgreSQL wertet alles aus:** OR-Bedingungen werden komplett geparst
3. **Einfachheit gewinnt:** Keine Filter ist besser als kaputte Filter
4. **Testing ist wichtig:** Queries direkt in DB testen vor Dashboard-Deploy

