# 💾 Backup & Wiederherstellung - Administrationshandbuch

## 📋 Inhaltsverzeichnis

- [Einführung](#-einführung)
- [Backup-Strategien](#-backup-strategien)
- [Manuelles Backup](#-manuelles-backup)
- [Automatisiertes Backup](#-automatisiertes-backup)
- [Datenbank-Backup](#-datenbank-backup)
- [Dateisystem-Backup](#-dateisystem-backup)
- [Wiederherstellung](#-wiederherstellung)
- [Backup-Überprüfung](#-backup-überprüfung)
- [Best Practices](#-best-practices)
- [Fehlerbehebung](#-fehlerbehebung)

---

## 🎯 Einführung

Dieses Handbuch beschreibt die Backup- und Wiederherstellungsverfahren für das MMS-System. Regelmäßige Backups sind essenziell für die Datensicherheit und Business Continuity.

### Zielsetzung

- **Datensicherheit**: Schutz vor Datenverlust
- **Business Continuity**: Schnelle Wiederherstellung
- **Compliance**: Einhaltung von Vorschriften
- **Disaster Recovery**: Vorbereitung auf Notfälle

### Backup-Typen

| Typ | Beschreibung | Häufigkeit |
|-----|--------------|------------|
| **Vollbackup** | Komplette Datensicherung | Wöchentlich |
| **Inkrementell** | Nur geänderte Daten | Täglich |
| **Differenziell** | Änderungen seit letztem Vollbackup | Täglich |
| **Datenbank** | PostgreSQL-Datenbank | Stündlich |
| **Konfiguration** | Systemkonfiguration | Bei Änderungen |

---

## 🗂️ Backup-Strategien

### 3-2-1 Backup-Regel

1. **3 Kopien**: Mindestens 3 Kopien der Daten
2. **2 Medien**: Auf mindestens 2 verschiedenen Medientypen
3. **1 Offsite**: Mindestens 1 Kopie extern/Cloud

### Empfohlene Strategie

```
┌─────────────────────────────────────────────────────────────┐
│                    MMS Backup-Strategie                      │
├─────────────────────────────────────────────────────────────┤
│  • Täglich: Inkrementelles Backup (Datenbank + Dateien)     │
│  • Wöchentlich: Vollbackup (Komplett)                        │
│  • Monatlich: Langzeitarchiv (Cloud/Offsite)                 │
│  • Vor Updates: Konfigurationsbackup                         │
│  • Vor Migration: Vollbackup + Test                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 👨‍💻 Manuelles Backup

### Datenbank-Backup

1. **Navigation**: Server-Konsole

2. **Backup durchführen**:
   ```bash
   # Docker-Container identifizieren
   docker ps | grep postgres
   
   # Backup in Container durchführen
   docker exec -t mms-postgres-1 pg_dump -U mms_user -d mms_db > mms_backup_$(date +%Y%m%d_%H%M%S).sql
   
   # Backup komprimieren
   gzip mms_backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Backup speichern**:
   ```bash
   # In Backup-Verzeichnis verschieben
   mv mms_backup_*.sql.gz /backup/mms/db/
   
   # Berechtigungen setzen
   chmod 600 /backup/mms/db/mms_backup_*.sql.gz
   ```

### Dateisystem-Backup

1. **Navigation**: Server-Konsole

2. **Wichtige Verzeichnisse**:
   ```bash
   # MMS-Konfiguration
   /opt/mms/config/
   
   # Uploads und Dokumente
   /opt/mms/uploads/
   
   # Grafana Dashboards
   /opt/mms/grafana/provisioning/
   ```

3. **Backup durchführen**:
   ```bash
   # Tar-Archiv erstellen
   tar -czvf mms_files_$(date +%Y%m%d_%H%M%S).tar.gz \
     /opt/mms/config/ \
     /opt/mms/uploads/ \
     /opt/mms/grafana/provisioning/
   
   # In Backup-Verzeichnis verschieben
   mv mms_files_*.tar.gz /backup/mms/files/
   ```

---

## 🤖 Automatisiertes Backup

### Backup-Skript

1. **Skript erstellen**:
   ```bash
   nano /usr/local/bin/mms_backup.sh
   ```

2. **Skript-Inhalt**:
   ```bash
   #!/bin/bash
   
   # Konfiguration
   BACKUP_DIR="/backup/mms"
   DB_USER="mms_user"
   DB_NAME="mms_db"
   DATE=$(date +%Y%m%d_%H%M%S)
   
   # Verzeichnisse erstellen
   mkdir -p ${BACKUP_DIR}/db
   mkdir -p ${BACKUP_DIR}/files
   
   # Datenbank-Backup
   echo "Starting database backup..."
   docker exec -t mms-postgres-1 pg_dump -U ${DB_USER} -d ${DB_NAME} > ${BACKUP_DIR}/db/mms_backup_${DATE}.sql
   gzip ${BACKUP_DIR}/db/mms_backup_${DATE}.sql
   
   # Dateisystem-Backup
   echo "Starting file system backup..."
   tar -czvf ${BACKUP_DIR}/files/mms_files_${DATE}.tar.gz \
     /opt/mms/config/ \
     /opt/mms/uploads/ \
     /opt/mms/grafana/provisioning/
   
   # Berechtigungen
   chmod 600 ${BACKUP_DIR}/db/mms_backup_${DATE}.sql.gz
   chmod 600 ${BACKUP_DIR}/files/mms_files_${DATE}.tar.gz
   
   # Alte Backups bereinigen (älter als 30 Tage)
   echo "Cleaning up old backups..."
   find ${BACKUP_DIR} -type f -mtime +30 -delete
   
   echo "Backup completed successfully!"
   ```

3. **Skript ausführbar machen**:
   ```bash
   chmod +x /usr/local/bin/mms_backup.sh
   ```

### Cron-Job einrichten

1. **Crontab bearbeiten**:
   ```bash
   crontab -e
   ```

2. **Backup-Jobs hinzufügen**:
   ```cron
   # Täglich um 2:00 Uhr - Inkrementelles Backup
   0 2 * * * /usr/local/bin/mms_backup.sh
   
   # Wöchentlich sonntags um 3:00 Uhr - Vollbackup
   0 3 * * 0 /usr/local/bin/mms_backup_full.sh
   
   # Monatlich am 1. um 4:00 Uhr - Cloud-Backup
   0 4 1 * * /usr/local/bin/mms_backup_cloud.sh
   ```

---

## 🗃️ Datenbank-Backup

### PostgreSQL-spezifische Backups

1. **Logisches Backup**:
   ```bash
   pg_dump -U mms_user -d mms_db -F c -f mms_backup_$(date +%Y%m%d).dump
   ```

2. **Physisches Backup**:
   ```bash
   pg_basebackup -D /backup/mms/pgsql_base -U mms_user -P
   ```

3. **Point-in-Time Recovery**:
   ```bash
   # WAL-Archivierung aktivieren
   # In postgresql.conf:
   wal_level = replica
   archive_mode = on
   archive_command = 'test ! -f /backup/mms/wal/%f && cp %p /backup/mms/wal/%f'
   ```

---

## 📁 Dateisystem-Backup

### Wichtige Dateien & Verzeichnisse

| Verzeichnis | Beschreibung | Backup-Priorität |
|-------------|--------------|------------------|
| `/opt/mms/config/` | Systemkonfiguration | Hoch |
| `/opt/mms/uploads/` | Benutzeruploads | Hoch |
| `/opt/mms/grafana/provisioning/` | Grafana-Konfiguration | Mittel |
| `/opt/mms/api/` | API-Quellcode | Niedrig |
| `/opt/mms/frontend/` | Frontend-Quellcode | Niedrig |

### Backup-Tools

- **rsync**: Für inkrementelle Backups
- **tar**: Für komplette Archive
- **duplicity**: Für verschlüsselte Backups
- **borg**: Für dedizierte Backups

---

## 🔄 Wiederherstellung

### Datenbank-Wiederherstellung

1. **Navigation**: Server-Konsole

2. **Datenbank stoppen**:
   ```bash
   docker stop mms-postgres-1
   ```

3. **Backup wiederherstellen**:
   ```bash
   # Neue Datenbank erstellen
   createdb -U postgres mms_db_restore
   
   # Backup einlesen
   psql -U postgres -d mms_db_restore < /backup/mms/db/mms_backup_20231201.sql
   
   # Datenbank umbenennen
   dropdb -U postgres mms_db
   alter database mms_db_restore rename to mms_db
   ```

4. **Datenbank starten**:
   ```bash
   docker start mms-postgres-1
   ```

### Dateisystem-Wiederherstellung

1. **Navigation**: Server-Konsole

2. **Backup extrahieren**:
   ```bash
   tar -xzvf /backup/mms/files/mms_files_20231201.tar.gz -C /
   ```

3. **Berechtigungen setzen**:
   ```bash
   chown -R mms_user:mms_group /opt/mms/
   chmod -R 750 /opt/mms/config/
   chmod -R 750 /opt/mms/uploads/
   ```

4. **Dienste neu starten**:
   ```bash
   docker-compose restart
   ```

---

## 🔍 Backup-Überprüfung

### Integritätstests

1. **Datenbank-Test**:
   ```bash
   # Testdatenbank erstellen
   createdb -U postgres mms_test
   
   # Backup einlesen
   psql -U postgres -d mms_test < /backup/mms/db/mms_backup_20231201.sql
   
   # Tabellen prüfen
   psql -U postgres -d mms_test -c "\dt"
   
   # Daten prüfen
   psql -U postgres -d mms_test -c "SELECT COUNT(*) FROM asset;"
   
   # Testdatenbank löschen
   dropdb -U postgres mms_test
   ```

2. **Datei-Test**:
   ```bash
   # Archiv testen
   tar -tzf /backup/mms/files/mms_files_20231201.tar.gz
   
   # Dateien prüfen
   tar -xzvf /backup/mms/files/mms_files_20231201.tar.gz --to-command="ls -la"
   ```

### Automatisierte Tests

1. **Skript erstellen**:
   ```bash
   nano /usr/local/bin/mms_backup_test.sh
   ```

2. **Skript-Inhalt**:
   ```bash
   #!/bin/bash
   
   # Test Konfiguration
   TEST_DIR="/tmp/mms_backup_test"
   LATEST_DB=$(ls -t /backup/mms/db/mms_backup_*.sql.gz | head -1)
   LATEST_FILES=$(ls -t /backup/mms/files/mms_files_*.tar.gz | head -1)
   
   # Verzeichnis erstellen
   mkdir -p ${TEST_DIR}
   
   # Datenbank-Test
   echo "Testing database backup..."
   createdb -U postgres mms_test
   gunzip -c ${LATEST_DB} | psql -U postgres -d mms_test
   
   # Tabellen prüfen
   TABLE_COUNT=$(psql -U postgres -d mms_test -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
   if [ "$TABLE_COUNT" -gt "0" ]; then
     echo "✅ Database backup test passed"
   else
     echo "❌ Database backup test failed"
     exit 1
   fi
   
   # Datei-Test
   echo "Testing file backup..."
   tar -tzf ${LATEST_FILES} > /dev/null
   if [ $? -eq 0 ]; then
     echo "✅ File backup test passed"
   else
     echo "❌ File backup test failed"
     exit 1
   fi
   
   # Aufräumen
   dropdb -U postgres mms_test
   rm -rf ${TEST_DIR}
   
   echo "All backup tests passed successfully!"
   ```

3. **Skript ausführbar machen**:
   ```bash
   chmod +x /usr/local/bin/mms_backup_test.sh
   ```

---

## 🎯 Best Practices

### Backup-Strategie

- **Regelmäßigkeit**: Tägliche Backups
- **Vielfalt**: Mehrere Backup-Typen
- **Redundanz**: Mehrere Speicherorte
- **Test**: Regelmäßige Wiederherstellungstests
- **Dokumentation**: Backup-Prozeduren dokumentieren

### Sicherheit

- **Verschlüsselung**: Backups verschlüsseln
- **Zugriffskontrolle**: Beschränkter Zugriff
- **Netzwerk**: Sichere Übertragung
- **Speicherorte**: Physische Sicherheit
- **Protokollierung**: Backup-Logs

### Monitoring

- **Überwachung**: Backup-Jobs monitoren
- **Benachrichtigungen**: Bei Fehlern alarmieren
- **Protokolle**: Backup-Logs analysieren
- **Kapazität**: Speicherplatz überwachen
- **Performance**: Backup-Zeiten optimieren

---

## 🔧 Fehlerbehebung

### Häufige Probleme

#### Backup fehlgeschlagen

**Ursache**: Speicherplatz, Berechtigungen, Datenbankprobleme

**Lösung**:
1. Speicherplatz prüfen: `df -h`
2. Berechtigungen prüfen: `ls -la /backup/mms/`
3. Datenbankstatus prüfen: `docker ps | grep postgres`
4. Logs prüfen: `tail -f /var/log/mms/backup.log`

#### Wiederherstellung fehlgeschlagen

**Ursache**: Korruptes Backup, Versioninkompatibilität

**Lösung**:
1. Backup-Integrität prüfen
2. Datenbankversion prüfen
3. Testwiederherstellung durchführen
4. Alternative Backup-Quelle nutzen

#### Backup zu langsam

**Ursache**: Große Datenmenge, Netzwerkprobleme

**Lösung**:
1. Inkrementelle Backups nutzen
2. Kompression optimieren
3. Netzwerkverbindung prüfen
4. Backup-Zeitfenster anpassen

### Support kontaktieren

1. **Navigation**: **Hilfe** → **Support**

2. **Support-Ticket erstellen**:
   - Problem beschreiben
   - Backup-Logs anhängen
   - Systeminformationen bereithalten
   - Backup-Konfiguration angeben

3. **Priorität festlegen**:
   - Niedrig: Allgemeine Fragen
   - Mittel: Backup-Probleme
   - Hoch: Wiederherstellungsprobleme
   - Kritisch: Datenverlust

---

**Vielen Dank für die Nutzung dieses Administrationshandbuchs!** 🎉

Für weitere Fragen oder Unterstützung wenden Sie sich bitte an unser Support-Team.

<div align="center">
  <p>Mit ❤️ vom MMS-Team erstellt</p>
  <p>⭐ Bewerten Sie dieses Handbuch, wenn es Ihnen geholfen hat!</p>
</div>