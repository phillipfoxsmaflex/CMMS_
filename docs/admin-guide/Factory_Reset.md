# 🏭 Werkseinstellungen & Systemrücksetzung - Administrationshandbuch

## 📋 Inhaltsverzeichnis

- [Einführung](#-einführung)
- [Vorbereitung](#-vorbereitung)
- [Datenbank-Rücksetzung](#-datenbank-rücksetzung)
- [Systemkonfiguration zurücksetzen](#-systemkonfiguration-zurücksetzen)
- [Selektive Rücksetzung](#-selektive-rücksetzung)
- [Datenbereinigung](#-datenbereinigung)
- [Neukonfiguration](#-neukonfiguration)
- [Best Practices](#-best-practices)
- [Fehlerbehebung](#-fehlerbehebung)

---

## 🎯 Einführung

Dieses Handbuch beschreibt die Verfahren zur Rücksetzung des MMS-Systems auf Werkseinstellungen. Eine Systemrücksetzung kann in verschiedenen Szenarien erforderlich sein:

### Anwendungsfälle

- **Testumgebung**: System für neue Tests vorbereiten
- **Datenbereinigung**: Veraltete oder fehlerhafte Daten entfernen
- **Systemmigration**: Vorbereitung für Migration
- **Sicherheitsvorfall**: System nach Kompromittierung bereinigen
- **Demo-System**: System für Demonstrationszwecke zurücksetzen

### Rücksetzungstypen

| Typ | Beschreibung | Auswirkungen |
|-----|--------------|--------------|
| **Vollständig** | Komplette Systemrücksetzung | Alle Daten verloren |
| **Datenbank** | Nur Datenbank zurücksetzen | Benutzerdaten verloren |
| **Konfiguration** | Nur Konfiguration zurücksetzen | Einstellungen verloren |
| **Selektiv** | Spezifische Daten bereinigen | Teilweise Daten verloren |

---

## ⚠️ Vorbereitung

### Checkliste vor der Rücksetzung

1. **Backup durchführen**:
   - [ ] Datenbank-Backup
   - [ ] Konfigurations-Backup
   - [ ] Benutzerdaten exportieren
   - [ ] Dokumente sichern

2. **Systemstatus prüfen**:
   - [ ] Aktive Benutzer informieren
   - [ ] Geplante Wartungen prüfen
   - [ ] Systemlast analysieren
   - [ ] Abhängigkeiten prüfen

3. **Rücksetzungsplan erstellen**:
   - [ ] Rücksetzungstyp festlegen
   - [ ] Zeitfenster planen
   - [ ] Verantwortliche benennen
   - [ ] Rollback-Plan erstellen

### Warnungen

```
⚠️ WICHTIG: Eine Systemrücksetzung löscht unwiderruflich Daten!

- Alle Benutzerdaten werden gelöscht
- Alle Konfigurationen werden zurückgesetzt
- Alle Arbeitsaufträge werden entfernt
- Alle Anlageninformationen werden gelöscht
- Alle Berichte und Analysen werden entfernt

📌 EMPFOHLEN: Führen Sie immer ein vollständiges Backup durch!
```

---

## 🗃️ Datenbank-Rücksetzung

### Vollständige Datenbank-Rücksetzung

1. **Navigation**: Server-Konsole

2. **System stoppen**:
   ```bash
   docker-compose down
   ```

3. **Datenbank-Container löschen**:
   ```bash
   docker rm -f mms-postgres-1
   docker volume rm mms_postgres-data
   ```

4. **Datenbank-Verzeichnis bereinigen**:
   ```bash
   rm -rf /var/lib/docker/volumes/mms_postgres-data/
   ```

5. **System neu starten**:
   ```bash
   docker-compose up -d
   ```

### Datenbank mit Standarddaten neu initialisieren

1. **Navigation**: Server-Konsole

2. **Datenbank-Container starten**:
   ```bash
   docker-compose up -d postgres
   ```

3. **Standarddaten importieren**:
   ```bash
   # Warten bis Datenbank bereit ist
   sleep 30
   
   # Standarddaten importieren
   docker exec -i mms-postgres-1 psql -U postgres -d mms_db < /opt/mms/setup/demo_data.sql
   ```

4. **System neu starten**:
   ```bash
   docker-compose restart
   ```

---

## ⚙️ Systemkonfiguration zurücksetzen

### Konfigurationsdateien zurücksetzen

1. **Navigation**: Server-Konsole

2. **Konfigurationsverzeichnis sichern**:
   ```bash
   cp -r /opt/mms/config/ /opt/mms/config_backup_$(date +%Y%m%d)/
   ```

3. **Standardkonfiguration wiederherstellen**:
   ```bash
   # Standardkonfiguration kopieren
   cp -r /opt/mms/config.default/* /opt/mms/config/
   
   # Berechtigungen setzen
   chown -R mms_user:mms_group /opt/mms/config/
   chmod -R 750 /opt/mms/config/
   ```

4. **Dienste neu starten**:
   ```bash
   docker-compose restart
   ```

### Umgebungsvariablen zurücksetzen

1. **Navigation**: Projektverzeichnis

2. **Umgebungsdatei sichern**:
   ```bash
   cp .env .env_backup_$(date +%Y%m%d)
   ```

3. **Standardumgebung wiederherstellen**:
   ```bash
   cp .env.example .env
   
   # Anpassungen vornehmen
   nano .env
   ```

4. **System neu starten**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

## 🎯 Selektive Rücksetzung

### Benutzerdaten zurücksetzen

1. **Navigation**: Datenbank-Konsole

2. **Benutzertabellen bereinigen**:
   ```sql
   -- Alle Benutzer löschen (außer Admin)
   DELETE FROM own_user WHERE id != 1;
   
   -- Benutzerrollen zurücksetzen
   UPDATE own_user SET role = 'USER' WHERE id != 1;
   
   -- Sessions löschen
   DELETE FROM user_session;
   ```

### Arbeitsaufträge zurücksetzen

1. **Navigation**: Datenbank-Konsole

2. **Arbeitsaufträge bereinigen**:
   ```sql
   -- Alle Arbeitsaufträge löschen
   DELETE FROM work_order;
   
   -- Arbeitsauftragshistorie löschen
   DELETE FROM work_order_history;
   
   -- Zuweisungen zurücksetzen
   DELETE FROM work_order_assignment;
   ```

### Anlagen zurücksetzen

1. **Navigation**: Datenbank-Konsole

2. **Anlagendaten bereinigen**:
   ```sql
   -- Alle Anlagen löschen
   DELETE FROM asset;
   
   -- Anlagendokumentation löschen
   DELETE FROM asset_document;
   
   -- Wartungsverlauf löschen
   DELETE FROM asset_maintenance_history;
   ```

---

## 🧹 Datenbereinigung

### Veraltete Daten bereinigen

1. **Navigation**: Datenbank-Konsole

2. **Bereinigungsskript**:
   ```sql
   -- Archivierte Arbeitsaufträge löschen (älter als 1 Jahr)
   DELETE FROM work_order 
   WHERE archived = true 
   AND completed_on < NOW() - INTERVAL '1 year';
   
   -- Veraltete Benutzer löschen (inaktiv seit 6 Monaten)
   DELETE FROM own_user 
   WHERE last_login < NOW() - INTERVAL '6 months'
   AND id != 1;
   
   -- Gelöschte Anlagen bereinigen
   DELETE FROM asset 
   WHERE deleted = true;
   
   -- Vacuum und Analyze
   VACUUM ANALYZE;
   ```

### Systemoptimierung

1. **Navigation**: Server-Konsole

2. **Optimierungsskript**:
   ```bash
   # Docker-System bereinigen
   docker system prune -a -f
   
   # Unnötige Images entfernen
   docker image prune -a -f
   
   # Volumes bereinigen
   docker volume prune -f
   
   # Systemneustart
   reboot
   ```

---

## 🆕 Neukonfiguration

### System nach Rücksetzung einrichten

1. **Navigation**: Web-Oberfläche

2. **Grundkonfiguration**:
   - **Firmenname**: Ihr Firmenname
   - **Logo**: Firmenlogo hochladen
   - **Standardsprache**: Deutsch
   - **Zeitzone**: Europa/Berlin

3. **Benutzer einrichten**:
   - **Administrator**: admin@mms.com
   - **Standardbenutzer**: user@mms.com
   - **Gastbenutzer**: guest@mms.com

4. **Standorte anlegen**:
   - **Hauptstandort**: Firmenhauptsitz
   - **Gebäude**: Produktionshalle
   - **Etagen**: Ebene 1, Ebene 2
   - **Räume**: Raum 101, Raum 102

5. **Grunddaten importieren**:
   - **Anlagen**: CSV-Import
   - **Teilekatalog**: CSV-Import
   - **Lieferanten**: CSV-Import

---

## 🎯 Best Practices

### Rücksetzungsstrategie

- **Regelmäßige Backups**: Vor jeder Rücksetzung
- **Testumgebung**: Rücksetzung zuerst testen
- **Dokumentation**: Alle Schritte dokumentieren
- **Kommunikation**: Betroffene informieren
- **Zeitplanung**: Außerhalb der Geschäftszeiten

### Datensicherheit

- **Backup-Verifikation**: Backup-Integrität prüfen
- **Zugriffskontrolle**: Beschränkter Zugriff
- **Protokollierung**: Alle Aktionen protokollieren
- **Verschlüsselung**: Sensible Daten schützen
- **Compliance**: Vorschriften einhalten

### Systemoptimierung

- **Regelmäßige Wartung**: Datenbankoptimierung
- **Monitoring**: Systemperformance überwachen
- **Skalierung**: Ressourcen anpassen
- **Updates**: Regelmäßige Systemupdates
- **Sicherheit**: Sicherheitsupdates

---

## 🔧 Fehlerbehebung

### Häufige Probleme

#### Rücksetzung fehlgeschlagen

**Ursache**: Berechtigungen, Datenbankprobleme, Speicherplatz

**Lösung**:
1. Berechtigungen prüfen: `ls -la /opt/mms/`
2. Datenbankstatus prüfen: `docker ps | grep postgres`
3. Speicherplatz prüfen: `df -h`
4. Logs prüfen: `docker logs mms-postgres-1`

#### System startet nicht nach Rücksetzung

**Ursache**: Konfigurationsfehler, Datenbankprobleme

**Lösung**:
1. Konfiguration prüfen: `cat /opt/mms/config/application.yml`
2. Datenbankverbindung testen: `psql -U postgres -d mms_db`
3. Container-Logs prüfen: `docker-compose logs`
4. System neu starten: `docker-compose restart`

#### Daten nicht vollständig gelöscht

**Ursache**: Unvollständige Rücksetzung, Berechtigungen

**Lösung**:
1. Manuelle Prüfung: `SELECT COUNT(*) FROM asset;`
2. Berechtigungen prüfen: `docker exec -it mms-postgres-1 psql -U postgres`
3. Manuelle Bereinigung: `DELETE FROM asset;`
4. Systemneustart: `docker-compose restart`

### Support kontaktieren

1. **Navigation**: **Hilfe** → **Support**

2. **Support-Ticket erstellen**:
   - Problem beschreiben
   - Rücksetzungsprotokoll anhängen
   - Systeminformationen bereithalten
   - Backup-Informationen angeben

3. **Priorität festlegen**:
   - Niedrig: Allgemeine Fragen
   - Mittel: Rücksetzungsprobleme
   - Hoch: Datenverlust
   - Kritisch: Systemausfall

---

**Vielen Dank für die Nutzung dieses Administrationshandbuchs!** 🎉

Für weitere Fragen oder Unterstützung wenden Sie sich bitte an unser Support-Team.

<div align="center">
  <p>Mit ❤️ vom MMS-Team erstellt</p>
  <p>⭐ Bewerten Sie dieses Handbuch, wenn es Ihnen geholfen hat!</p>
</div>