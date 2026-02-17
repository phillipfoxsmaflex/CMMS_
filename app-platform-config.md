# DigitalOcean App Platform Konfiguration für CMMS

Dieses Dokument beschreibt die spezifische Konfiguration für die DigitalOcean App Platform.

## Vorbereitung

### 1. Neue Branch erstellen
```bash
git checkout -b app-platform
git push origin app-platform
```

### 2. App Platform App erstellen

1. Gehen Sie zu [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Klicken Sie auf "Create App"
3. Wählen Sie "GitHub" und verbinden Sie Ihr Repository
4. Wählen Sie die Branch `app-platform`
5. DigitalOcean erkennt automatisch die `.do/app.yaml` Datei

## Konfiguration in App Platform

### Umgebungsvariablen

Sie müssen folgende Umgebungsvariablen in der App Platform konfigurieren:

#### App-Level Variablen:
- `APP_URL`: `https://your-app-name.ondigitalocean.app`
- `JWT_SECRET`: Generieren Sie einen sicheren Schlüssel (z.B. `openssl rand -hex 32`)
- `GOOGLE_KEY`: (Optional) Ihr Google API Key
- `GOOGLE_TRACKING_ID`: (Optional) Ihre Google Analytics ID
- `MUI_X_LICENSE`: (Optional) Ihre MUI X Lizenz

#### MinIO Variablen:
- `MINIO_ACCESS_KEY`: Ihr MinIO Access Key
- `MINIO_SECRET_KEY`: Ihr MinIO Secret Key (sicher generieren!)
- `MINIO_BUCKET`: `mms-bucket`

#### Grafana Variablen:
- `ADMIN_USER`: `admin`
- `ADMIN_PASSWORD`: Ein sicheres Admin-Passwort

### Datenbanken

Die App Platform erstellt automatisch:
1. **PostgreSQL Datenbank** (Version 16)
2. **InfluxDB Datenbank** (Version 2)

Die Verbindungsinformationen werden automatisch als Umgebungsvariablen verfügbar gemacht.

## Deployment Prozess

### Automatisches Deployment
- Jeder Push zur `app-platform` Branch löst ein automatisches Deployment aus
- Die App Platform baut die Docker-Images neu
- Die Pre-Deploy Jobs werden ausgeführt (MinIO und Grafana Setup)
- Die Services werden nacheinander gestartet

### Manuelles Deployment
1. Gehen Sie zu Ihrer App in der DigitalOcean Console
2. Klicken Sie auf "Deployments"
3. Klicken Sie auf "Deploy"
4. Wählen Sie die `app-platform` Branch

## Skalierung

### Standard Skalierung (kostengünstig):
- **API**: 1 Instance (basic-xxs, 512MB RAM, 1 vCPU)
- **Frontend**: 1 Instance (basic-xxs, 512MB RAM, 1 vCPU)
- **MinIO**: 1 Instance (basic-xs, 1GB RAM, 1 vCPU)
- **Grafana**: 1 Instance (basic-xxs, 512MB RAM, 1 vCPU)

### Empfohlene Skalierung für Produktion:
- **API**: 2 Instances (basic-xs, 1GB RAM, 1 vCPU)
- **Frontend**: 2 Instances (basic-xs, 1GB RAM, 1 vCPU)
- **MinIO**: 1 Instance (basic-s, 2GB RAM, 2 vCPU)
- **Grafana**: 1 Instance (basic-xxs, 512MB RAM, 1 vCPU)

## Kosten

### Geschätzte monatliche Kosten (Standard Skalierung):
- **Services**: ~$15/Monat
- **PostgreSQL Datenbank**: ~$15/Monat
- **InfluxDB Datenbank**: ~$15/Monat
- **Gesamt**: ~$45/Monat

### Geschätzte monatliche Kosten (Produktions-Skalierung):
- **Services**: ~$60/Monat
- **PostgreSQL Datenbank**: ~$15/Monat
- **InfluxDB Datenbank**: ~$15/Monat
- **Gesamt**: ~$90/Monat

## Monitoring und Logging

### Integriertes Monitoring
Die App Platform bietet integriertes Monitoring für:
- CPU Auslastung
- Speichernutzung
- Request Rates
- Response Times
- Fehlerraten

### Logging
- Alle Logs sind in der App Platform Console verfügbar
- Sie können Logs für jeden Service separat anzeigen
- Logs werden für 7 Tage gespeichert

## Backups

### Automatische Backups
- **PostgreSQL**: Tägliche automatische Backups, 7 Tage Aufbewahrung
- **InfluxDB**: Tägliche automatische Backups, 7 Tage Aufbewahrung

### Manuelle Backups
1. Gehen Sie zu Ihrer App in der DigitalOcean Console
2. Wählen Sie die Datenbank
3. Klicken Sie auf "Backups"
4. Klicken Sie auf "Create Backup"

## Fehlerbehebung

### Häufige Probleme

1. **Datenbankverbindung fehlgeschlagen**:
   - Überprüfen Sie die Umgebungsvariablen
   - Stellen Sie sicher, dass die Datenbank bereit ist
   - Testen Sie die Verbindung mit `psql`

2. **MinIO nicht erreichbar**:
   - Überprüfen Sie die MinIO Logs
   - Stellen Sie sicher, dass der Bucket erstellt wurde
   - Testen Sie mit `mc` Client

3. **Grafana zeigt keine Daten**:
   - Überprüfen Sie die Datenquellen in Grafana
   - Testen Sie die Verbindung zu InfluxDB und PostgreSQL
   - Überprüfen Sie die Pre-Deploy Job Logs

## Custom Domain

### Eigene Domain einrichten
1. Gehen Sie zu Ihrer App in der DigitalOcean Console
2. Klicken Sie auf "Settings"
3. Klicken Sie auf "Domains"
4. Fügen Sie Ihre Domain hinzu (z.B. `cmms.yourdomain.com`)
5. Erstellen Sie einen CNAME-Eintrag in Ihrem DNS:
   ```
   cmms.yourdomain.com CNAME your-app-name.ondigitalocean.app
   ```

### TLS Zertifikate
- DigitalOcean stellt automatisch Let's Encrypt Zertifikate aus
- Zertifikate werden automatisch erneuert
- Sie können auch eigene Zertifikate hochladen

## CI/CD Integration

### Automatisches Deployment bei GitHub Push
Die Konfiguration ist bereits in der `.do/app.yaml` enthalten:
```yaml
github:
  branch: app-platform
  deploy_on_push: true
```

### Manuelles Triggering
Sie können auch manuell deployen:
```bash
# Setzen Sie die App ID in den Umgebungsvariablen
export DO_APP_ID="your-app-id"

# Manuelles Deployment triggerndoctl apps create-deployment $DO_APP_ID --force-rebuild
```

## Migration von Kubernetes zu App Platform

Falls Sie von Kubernetes migrieren:
1. Erstellen Sie die neue App Platform App
2. Testen Sie gründlich
3. Aktualisieren Sie Ihre DNS-Einträge
4. Deaktivieren Sie die alte Kubernetes-Installation

## Vorteile der App Platform

✅ **Einfache Einrichtung**: Keine komplexe Kubernetes Konfiguration
✅ **Automatische Skalierung**: Einfache Anpassung der Ressourcen
✅ **Integrierte Datenbanken**: Keine separate Verwaltung nötig
✅ **Automatische Backups**: Daten sind sicher
✅ **Kostentransparenz**: Klare Preisstruktur
✅ **Automatisches TLS**: Sichere Verbindungen ohne Aufwand
✅ **Integriertes Monitoring**: Keine zusätzliche Setup nötig

## Support

Bei Problemen mit der App Platform:
- DigitalOcean Support: https://cloud.digitalocean.com/support
- Dokumentation: https://docs.digitalocean.com/products/app-platform/
- Community: https://www.digitalocean.com/community/

## Nächste Schritte

1. ✅ Branch `app-platform` erstellen und pushen
2. ✅ App in DigitalOcean App Platform erstellen
3. ✅ Umgebungsvariablen konfigurieren
4. ✅ Deployment starten
5. ✅ Anwendung testen
6. ✅ Custom Domain einrichten (optional)
7. ✅ Skalierung anpassen (optional)