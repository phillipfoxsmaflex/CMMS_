# Grafana Webhook Trigger - Technische Dokumentation

## Übersicht

Diese Dokumentation beschreibt die technische Implementierung des Grafana Webhook Triggers für das CMMS-System. Die Integration ermöglicht es Grafana, Workflows in der CMMS-Anwendung basierend auf Echtzeit-Metriken und Alerts auszulösen.

## API-Spezifikation

### Webhook-Endpoint

**URL**: `POST /api/webhooks/grafana`

**Beschreibung**: Empfängt und verarbeitet Alerts von Grafana

**Authentifizierung**: API-Key (Header-basiert)

**Content-Type**: `application/json`

### Request-Format

#### Standard CMMS Format (Recommended)

```json
{
  "alertId": "string",
  "alertName": "string",
  "status": "firing|resolved",
  "severity": "critical|warning|info",
  "dashboardId": "string (optional)",
  "panelId": "string (optional)",
  "ruleUrl": "string (optional)",
  "evaluationTime": "ISO8601 timestamp (optional)",
  "values": {
    "string": "number (optional)"
  },
  "message": "string (optional)",
  "customData": {
    "workflowId": "string (optional)",
    "priority": "high|medium|low (optional)",
    "additionalInfo": "object (optional)"
  }
}
```

#### Grafana Native Format (Fully Supported)

The endpoint fully supports the native Grafana webhook format without requiring any complex mapping or translation:

```json
{
  "headers": {
    "host": "string",
    "user-agent": "Grafana",
    "content-length": "number",
    "content-type": "application/json",
    "x-api-key": "your-api-key-here",
    "accept-encoding": "gzip",
    "connection": "close"
  },
  "params": {},
  "query": {},
  "body": {
    "alertId": "string",
    "alertName": "string",
    "status": "firing|resolved",
    "severity": "critical|warning|info",
    "message": "string (optional)",
    "customData": {
      "firingCount": "number (optional)",
      "resolvedCount": "number (optional)",
      "receiver": "string (optional)",
      "externalURL": "string (optional)",
      "priority": "high|medium|low (optional)",
      "workflowId": "string (optional)",
      "any": "additional data (optional)"
    }
  },
  "webhookUrl": "string (optional)",
  "executionMode": "production|test (optional)"
}
```

**Important Notes**:
- The Grafana native format is **fully supported** and requires **no complex mapping or translation**
- All required fields (`alertId`, `alertName`, `status`, `severity`) must be present in the `body` object
- The `customData` from Grafana is automatically mapped to CMMS format:
  - `priority` and `workflowId` are extracted if present
  - All other custom data is preserved in `additionalInfo`
- The `x-api-key` from headers is used for authentication (not the one in the body)

### Request-Parameter

| Parameter | Typ | Pflicht | Beschreibung |
|-----------|-----|---------|-------------|
| `alertId` | string | Ja | Eindeutige ID des Alerts |
| `alertName` | string | Ja | Name des Alerts (wird für Workflow-Matching verwendet) |
| `status` | string | Ja | Status des Alerts (`firing` oder `resolved`) |
| `severity` | string | Ja | Schweregrad (`critical`, `warning`, oder `info`) |
| `dashboardId` | string | Nein | ID des Grafana-Dashboards |
| `panelId` | string | Nein | ID des Grafana-Panels |
| `ruleUrl` | string | Nein | URL der Alert-Regel in Grafana |
| `evaluationTime` | string | Nein | Zeitstempel der Alert-Auswertung (ISO8601) |
| `values` | object | Nein | Metrik-Werte, die den Alert ausgelöst haben |
| `message` | string | Nein | Detaillierte Alert-Nachricht |
| `customData` | object | Nein | Benutzerdefinierte Daten |
| `customData.workflowId` | string | Nein | Spezifische Workflow-ID für das Matching |
| `customData.priority` | string | Nein | Priorität für erstellte WorkOrders/Requests |
| `customData.additionalInfo` | object | Nein | Zusätzliche benutzerdefinierte Informationen |

### Response-Format

```json
{
  "success": "boolean",
  "message": "string",
  "timestamp": "ISO8601 timestamp"
}
```

### Response-Parameter

| Parameter | Typ | Beschreibung |
|-----------|-----|-------------|
| `success` | boolean | Gibt an, ob die Verarbeitung erfolgreich war |
| `message` | string | Statusnachricht oder Fehlermeldung |
| `timestamp` | string | Zeitstempel der Verarbeitung (ISO8601) |

### Header

**Pflichtheader:**
- `X-API-Key`: API-Key für die Authentifizierung
- `Content-Type`: `application/json`

## Authentifizierung

### API-Key Authentifizierung

Die Webhook-API verwendet API-Key Authentifizierung mit dem Header `X-API-Key`.

**Beispiel:**
```
X-API-Key: 123e4567-e89b-12d3-a456-426614174000
```

### API-Key Management

API-Keys werden unternehmensspezifisch verwaltet und können über die API-Key Management Endpoints verwaltet werden.

## API-Key Management Endpoints

### API-Key erstellen

**URL**: `POST /webhook-config`

**Beschreibung**: Erstellt eine neue Webhook-Konfiguration für das Unternehmen

**Authentifizierung**: JWT (Benutzer muss SETTINGS-Berechtigung haben)

**Response**:
```json
{
  "id": 1,
  "companyId": 123,
  "apiKey": "123e4567-e89b-12d3-a456-426614174000",
  "enabled": true,
  "createdAt": "2024-02-01T12:00:00Z",
  "updatedAt": "2024-02-01T12:00:00Z"
}
```

### API-Key abrufen

**URL**: `GET /webhook-config`

**Beschreibung**: Ruft die Webhook-Konfiguration für das Unternehmen ab

**Authentifizierung**: JWT (Benutzer muss SETTINGS-Berechtigung haben)

**Response**:
```json
{
  "id": 1,
  "companyId": 123,
  "apiKey": "123e4567-e89b-12d3-a456-426614174000",
  "enabled": true,
  "createdAt": "2024-02-01T12:00:00Z",
  "updatedAt": "2024-02-01T12:00:00Z"
}
```

### API-Key rotieren

**URL**: `POST /webhook-config/regenerate`

**Beschreibung**: Generiert einen neuen API-Key und deaktiviert den alten

**Authentifizierung**: JWT (Benutzer muss SETTINGS-Berechtigung haben)

**Response**:
```json
{
  "id": 1,
  "companyId": 123,
  "apiKey": "876f5432-d10c-4e2f-b39a-765432109876",
  "enabled": true,
  "createdAt": "2024-02-01T12:00:00Z",
  "updatedAt": "2024-02-01T12:30:00Z"
}
```

### API-Key aktivieren/deaktivieren

**URL**: `POST /webhook-config/{enabled}`

**Beschreibung**: Aktiviert oder deaktiviert die Webhook-Konfiguration

**Parameter**:
- `enabled`: boolean (true zum Aktivieren, false zum Deaktivieren)

**Authentifizierung**: JWT (Benutzer muss SETTINGS-Berechtigung haben)

**Response**:
```json
{
  "id": 1,
  "companyId": 123,
  "apiKey": "123e4567-e89b-12d3-a456-426614174000",
  "enabled": false,
  "createdAt": "2024-02-01T12:00:00Z",
  "updatedAt": "2024-02-01T12:45:00Z"
}
```

### API-Key löschen

**URL**: `DELETE /webhook-config`

**Beschreibung**: Löscht die Webhook-Konfiguration für das Unternehmen

**Authentifizierung**: JWT (Benutzer muss SETTINGS-Berechtigung haben)

**Response**:
```json
{
  "success": true,
  "message": "Webhook config deleted successfully"
}
```

## Workflow-Integration

### Workflow-Matching

Die Webhook-Integration sucht nach Workflows mit:
- `mainCondition = WEBHOOK`
- Übereinstimmendem `alertName` in den sekundären Bedingungen
- Übereinstimmendem `severity` in den sekundären Bedingungen

### Workflow-Aktionen

Unterstützte Workflow-Aktionen für Webhook-Trigger:

1. **CREATE_WORK_ORDER**: Erstellt einen neuen WorkOrder
   - Titel: `Auto-created: {alertName}`
   - Beschreibung: `Created from Grafana alert: {message}`
   - Priorität: Aus `customData.priority` oder Standard `MEDIUM`

2. **CREATE_REQUEST**: Erstellt eine neue Request
   - Titel: `Auto-created: {alertName}`
   - Beschreibung: `Created from Grafana alert: {message}`
   - Priorität: Aus `customData.priority` oder Standard `MEDIUM`

### Prioritäts-Mapping

| Grafana Priority | CMMS Priority |
|-----------------|---------------|
| `high` | `HIGH` |
| `medium` | `MEDIUM` |
| `low` | `LOW` |
| (nicht angegeben) | `MEDIUM` |

## Fehlerbehandlung

### Fehlercodes

| HTTP Status | Fehlercode | Beschreibung |
|-------------|------------|-------------|
| 400 | BAD_REQUEST | Ungültiges Request-Format oder fehlende Pflichtfelder |
| 401 | UNAUTHORIZED | Ungültiger oder fehlender API-Key |
| 403 | FORBIDDEN | Webhook ist deaktiviert oder Zugriff verweigert |
| 429 | TOO_MANY_REQUESTS | Rate Limit überschritten (10 Anfragen/Minute) |
| 500 | INTERNAL_SERVER_ERROR | Interner Serverfehler |

### Fehlerbenachrichtigungen

Bei Fehlern während der Webhook-Verarbeitung werden E-Mail-Benachrichtigungen an alle Administratoren des Unternehmens gesendet.

## Rate Limiting

- **Limit**: 10 Anfragen pro Minute pro API-Key
- **Algorithmus**: Bucket4j Token Bucket
- **Response**: HTTP 429 mit Fehlerdetails

## Sicherheit

### Request-Validierung

- JSON-Schema-Validierung
- Größenbeschränkung: Maximal 1MB Payload
- Content-Type Prüfung: Nur `application/json` erlaubt
- API-Key Validierung: Unternehmensspezifische Validierung

### CORS-Konfiguration

Der Webhook-Endpoint ist für alle Ursprünge zugänglich (CORS freigegeben).

## Datenbank-Schema

### webhook_config Tabelle

```sql
CREATE TABLE webhook_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE
);
```

### Indexes

- `idx_webhook_config_company`: Index auf `company_id`
- `idx_webhook_config_api_key`: Index auf `api_key`
- `idx_webhook_config_enabled`: Index auf `enabled`

## Beispiel-Implementierung

### Grafana Webhook Konfiguration

```yaml
# Grafana Alert Rule Beispiel
apiVersion: 1
groups:
  - name: cmms_alerts
    interval: 60s
    rules:
      - alert: HighTemperatureAlert
        expr: temperature > 80
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Hohe Temperatur erkannt"
          description: "Temperatur ist über 80°C gestiegen"
          workflowId: "temp_alert_workflow"
          priority: "high"
```

### Webhook URL Konfiguration in Grafana

```
URL: https://ihre-cmms-domain.de/api/webhooks/grafana
Method: POST
Headers:
  X-API-Key: Ihr_API_Key_Hier
  Content-Type: application/json
```

## Setup-Anleitung

### 1. API-Key generieren

```bash
# API-Key für Unternehmen generieren
POST /webhook-config
Authorization: Bearer Ihr_JWT_Token
```

### 2. Webhook in Grafana konfigurieren

1. Navigieren Sie zu "Alerting" → "Contact points"
2. Klicken Sie auf "New contact point"
3. Wählen Sie "Webhook" als Typ
4. Geben Sie die CMMS Webhook URL ein: `https://ihre-domain.de/api/webhooks/grafana`
5. Fügen Sie den Header `X-API-Key: Ihr_API_Key` hinzu
6. Speichern Sie die Konfiguration

### 3. Alert-Regel erstellen

1. Navigieren Sie zu "Alerting" → "Alert rules"
2. Klicken Sie auf "New alert rule"
3. Wählen Sie die gewünschte Metrik und Bedingung
4. Konfigurieren Sie die Alert-Eigenschaften
5. Wählen Sie den erstellten Webhook-Kontaktpunkt als Empfänger
6. Speichern Sie die Alert-Regel

### 4. Workflow in CMMS konfigurieren

1. Navigieren Sie zu "Workflows"
2. Klicken Sie auf "Neuer Workflow"
3. Wählen Sie "Webhook" als Trigger-Typ
4. Konfigurieren Sie die Alert-Filter (alertName und severity)
5. Wählen Sie die gewünschte Aktion (WorkOrder oder Request erstellen)
6. Speichern Sie den Workflow

## Best Practices

### 1. API-Key Sicherheit

- Rotieren Sie API-Keys regelmäßig
- Deaktivieren Sie nicht verwendete API-Keys
- Verwenden Sie unterschiedliche API-Keys für verschiedene Umgebungen

### 2. Alert-Konfiguration

- Verwenden Sie spezifische Alert-Namen für einfaches Workflow-Matching
- Nutzen Sie die `customData.priority` für Prioritätssteuerung
- Fügen Sie detaillierte Nachrichten in das `message`-Feld ein

### 3. Workflow-Design

- Erstellen Sie spezifische Workflows für verschiedene Alert-Typen
- Nutzen Sie die Severity-Filterung für unterschiedliche Eskalationsstufen
- Testen Sie Workflows mit manuellen Alerts

### 4. Fehlerbehandlung

- Überwachen Sie Fehlerbenachrichtigungen
- Testen Sie die Rate-Limiting-Funktionalität
- Validieren Sie Alert-Payloads vor dem Senden

### 5. Grafana Webhook Troubleshooting

#### Common 400 Error Causes

1. **Missing Required Fields**: Ensure all required fields (`alertId`, `alertName`, `status`, `severity`) are present in the `body` object
2. **Invalid Format**: The webhook must have the correct structure with `headers`, `params`, `query`, and `body` objects
3. **Empty Values**: Required fields cannot be empty strings or null

#### Common 401 Error Causes

1. **Missing API Key**: The `X-API-Key` header is required
2. **Invalid API Key**: The API key doesn't exist or is incorrect
3. **Disabled Webhook**: The webhook configuration is disabled for the company

#### Common 429 Error Causes

1. **Rate Limit Exceeded**: More than 10 requests per minute per API key
2. **Solution**: Wait and retry, or request a rate limit increase

#### Testing Your Webhook

Use this cURL command to test your webhook:

```bash
curl -X POST "http://localhost:5678/webhooks/grafana" \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "headers": {
      "content-type": "application/json",
      "x-api-key": "your-api-key-here"
    },
    "params": {},
    "query": {},
    "body": {
      "alertId": "test-123",
      "alertName": "TestAlert",
      "status": "firing",
      "severity": "critical",
      "message": "Test alert message",
      "customData": {
        "firingCount": 1,
        "receiver": "test-receiver"
      }
    },
    "webhookUrl": "http://localhost:5678/webhooks/grafana",
    "executionMode": "test"
  }'
```

#### Debugging Tips

1. **Check Server Logs**: Look for detailed error messages
2. **Validate JSON**: Use a JSON validator to ensure your payload is valid
3. **Test with Minimal Payload**: Start with just the required fields and add optional ones gradually
4. **Check API Key**: Verify the API key exists and is enabled in the CMMS system

## Fehlerbehebung

### Häufige Probleme

1. **401 Unauthorized**: Ungültiger API-Key
   - Lösung: API-Key überprüfen und ggf. neu generieren

2. **429 Too Many Requests**: Rate Limit überschritten
   - Lösung: Anfragen reduzieren oder Rate Limit erhöhen

3. **Kein Workflow gefunden**: Kein passender Workflow
   - Lösung: Workflow-Konfiguration überprüfen (alertName und severity)

4. **500 Internal Server Error**: Serverfehler
   - Lösung: Server-Logs überprüfen und Fehlerdetails analysieren

### Debugging

- Aktivieren Sie detailliertes Logging für Webhook-Anfragen
- Überprüfen Sie die Datenbank auf Webhook-Konfigurationen
- Testen Sie mit manuellen CURL-Anfragen

## Support

Bei Fragen oder Problemen mit der Webhook-Integration:

1. Überprüfen Sie die Server-Logs
2. Konsultieren Sie die technische Dokumentation
3. Wenden Sie sich an den CMMS-Support mit:
   - Fehlerdetails
   - Request/Response-Beispiele
   - Zeitstempel der Fehler

Diese Dokumentation wird regelmäßig aktualisiert. Letzte Aktualisierung: 01.02.2026