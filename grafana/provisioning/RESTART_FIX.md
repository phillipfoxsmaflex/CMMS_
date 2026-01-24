# Grafana Container Restart Problem - BEHOBEN

## Datum: 2024-01-19

## Problem
Der Grafana Container startete kontinuierlich neu mit folgendem Fehler:
```
Datasource provisioning error: datasource.yaml config is invalid. 
Only one datasource per organization can be marked as default
```

## Ursache
**Zwei Datasources** waren als `isDefault: true` konfiguriert:
- InfluxDB: `isDefault: true` (in influxdb.yml)
- PostgreSQL: `isDefault: true` (in postgres.yml)

Grafana erlaubt nur **EINE** default Datasource pro Organisation.

## Lösung
InfluxDB auf `isDefault: false` gesetzt in `/root/CMMS/grafana/provisioning/datasources/influxdb.yml`

Da alle MMS Dashboards PostgreSQL verwenden, ist PostgreSQL die richtige default Datasource.

## Geänderte Dateien

### influxdb.yml
```yaml
# VORHER:
  - name: InfluxDB
    isDefault: true

# NACHHER:
  - name: InfluxDB
    isDefault: false
```

### postgres.yml (unverändert - bereits korrekt)
```yaml
  - name: PostgreSQL
    isDefault: true  # ✓ Korrekt - einzige default Datasource
  
  - name: PostgreSQL-Timescale
    isDefault: false  # ✓ Korrekt
```

## Validierung

Nach dem Neustart:
```bash
docker compose restart grafana
```

### Erfolgreiche Logs:
```
logger=provisioning.datasources - inserting datasource: InfluxDB ✓
logger=provisioning.datasources - inserting datasource: InfluxDB-SQL ✓
logger=provisioning.datasources - inserting datasource: PostgreSQL ✓
logger=provisioning.datasources - inserting datasource: PostgreSQL-Timescale ✓
logger=provisioning.dashboard - finished to provision dashboards ✓
```

### Container Status:
```
STATUS: Up and Running
UPTIME: Stabil (kein Restart mehr)
PORT: 0.0.0.0:3001->3000/tcp
```

## Ergebnis

 **Grafana Container läuft stabil**
 **Alle 4 Datasources erfolgreich provisioniert**
 **Alle 6 Dashboards erfolgreich provisioniert**
 **PostgreSQL ist default Datasource**
 **Keine Restart-Loops mehr**

## Zugriff

- URL: http://localhost:3001 (oder über Proxy)
- Standard-Login: admin/admin

## Nächste Schritte

1. ✓ Grafana ist betriebsbereit
2. ✓ Dashboards sind verfügbar
3. ⚠️ Stelle sicher, dass Datenbanktabellen existieren
4. ⚠️ Teste Dashboard-Queries mit echten Daten

