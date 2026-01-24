# 📚 MMS Dokumentationsindex

## 📋 Inhaltsverzeichnis

- [Einführung](#-einführung)
- [Dokumentationsstruktur](#-dokumentationsstruktur)
- [Benutzerdokumentation](#-benutzerdokumentation)
- [Moduldokumentation](#-moduldokumentation)
- [Administrationsdokumentation](#-administrationsdokumentation)
- [Entwicklerdokumentation](#-entwicklerdokumentation)
- [API-Dokumentation](#-api-dokumentation)
- [Einrichtungsanleitungen](#-einrichtungsanleitungen)
- [Fehlerbehebung](#-fehlerbehebung)
- [Häufig gestellte Fragen](#-häufig-gestellte-fragen)

---

## 🎯 Einführung

Willkommen in der **MMS Dokumentationsbibliothek**! Dieser Index bietet Ihnen einen umfassenden Überblick über alle verfügbaren Dokumentationsressourcen und hilft Ihnen, schnell die benötigten Informationen zu finden.

### Zielgruppe

Diese Dokumentation richtet sich an:
- **Anwender**: Techniker, Wartungspersonal, Manager
- **Administratoren**: Systemadministratoren, IT-Personal
- **Entwickler**: Softwareentwickler, Integratoren
- **Entscheider**: Geschäftsführung, Projektverantwortliche

### Dokumentationsphilosophie

Unsere Dokumentation folgt diesen Prinzipien:
- **Vollständigkeit**: Alle Funktionen und Module sind dokumentiert
- **Aktualität**: Regelmäßige Updates mit neuen Features
- **Benutzerfreundlichkeit**: Klare Struktur und einfache Navigation
- **Mehrsprachigkeit**: Primär auf Deutsch, mit englischen Referenzen
- **Praktischer Nutzen**: Fokus auf Anwendbarkeit

---

## 🗂️ Dokumentationsstruktur

```
docs/
├── BENUTZERHANDBUCH.md              # Hauptbenutzerhandbuch
├── DOKUMENTATIONSINDEX.md           # Dieser Index
├── admin-guide/                     # Administrationshandbücher
│   ├── Backup.md                    # Datensicherung
│   ├── Factory_Reset.md             # Werkseinstellungen
│   ├── Change_Ports.md              # Portkonfiguration
│   └── Run_SQL_command.md           # SQL-Befehle
├── api-reference/                   # API-Dokumentation
├── developer-guide/                 # Entwicklerhandbücher
│   ├── DB_SCHEMA_DIAGRAM.md        # Datenbankstruktur
│   └── Add_translation.md          # Übersetzungen
├── modules/                         # Moduldokumentation
│   ├── ANLAGENVERWALTUNG.md        # Anlagenverwaltung
│   ├── ARBEITSAUFTRAGSMANAGEMENT.md # Arbeitsauftragsmanagement
│   ├── PRAEVENTIVE_WARTUNG.md      # Präventive Wartung
│   └── ...                          # Weitere Module
├── setup/                           # Einrichtungshandbücher
│   ├── GRAFANA_QUICKSTART.md       # Grafana Schnellstart
│   └── REVERSE_PROXY_README.md      # Reverse Proxy
├── troubleshooting/                 # Fehlerbehebung
└── user-guide/                      # Benutzerhandbücher
    ├── DATENBANK_STRUKTUR.md        # Datenbankstruktur
    └── GRAFANA_DATENBANK_GUIDE.md   # Grafana Datenbankguide
```

---

## 👥 Benutzerdokumentation

### Hauptdokumente

- **[BENUTZERHANDBUCH.md](BENUTZERHANDBUCH.md)**
  - Umfassendes Benutzerhandbuch mit allen Funktionen
  - Schritt-für-Schritt Anleitungen
  - Best Practices und Tipps
  - Fehlerbehebung

### Moduldokumentation

- **[ANLAGENVERWALTUNG.md](modules/ANLAGENVERWALTUNG.md)**
  - Anlagenstammdaten
  - Hierarchische Struktur
  - Dokumentenmanagement
  - Wartungsverfolgung
  - Ausfallzeitenmanagement
  - QR-Code Integration

- **[ARBEITSAUFTRAGSMANAGEMENT.md](modules/ARBEITSAUFTRAGSMANAGEMENT.md)**
  - Arbeitsauftragserstellung
  - Statusverfolgung
  - Zeiterfassung
  - Teileverbrauch
  - Dokumentation
  - Automatisierung

- **[PRAEVENTIVE_WARTUNG.md](modules/PRAEVENTIVE_WARTUNG.md)**
  - Wartungsplanung
  - Compliance-Überwachung
  - Kalenderansicht
  - Automatisierte Arbeitsaufträge
  - Berichte und Analysen

### Benutzerhandbücher

- **[DATENBANK_STRUKTUR.md](user-guide/DATENBANK_STRUKTUR.md)**
  - Detaillierte Datenbankstruktur
  - Tabellen und Beziehungen
  - Feldbeschreibungen
  - SQL-Referenz

- **[GRAFANA_DATENBANK_GUIDE.md](user-guide/GRAFANA_DATENBANK_GUIDE.md)**
  - Praktischer Leitfaden für Grafana
  - Nützliche Queries
  - Dashboard-Beispiele
  - Time-Series Analysen
  - Tipps und Tricks

---

## ⚙️ Administrationsdokumentation

### Systemverwaltung

- **[Backup.md](admin-guide/Backup.md)**
  - Datensicherungsstrategien
  - Backup-Verfahren
  - Wiederherstellung
  - Automatisierung

- **[Factory_Reset.md](admin-guide/Factory_Reset.md)**
  - Werkseinstellungen
  - Systemrücksetzung
  - Datenbereingung
  - Neukonfiguration

### Systemkonfiguration

- **[Change_Ports.md](admin-guide/Change_Ports.md)**
  - Portkonfiguration
  - Netzwerkeinstellungen
  - Firewall-Regeln
  - Sicherheit

- **[Run_SQL_command.md](admin-guide/Run_SQL_command.md)**
  - SQL-Befehlsausführung
  - Datenbankverwaltung
  - Abfragen
  - Optimierung

---

## 👨‍💻 Entwicklerdokumentation

### Architektur & Design

- **[DB_SCHEMA_DIAGRAM.md](developer-guide/DB_SCHEMA_DIAGRAM.md)**
  - Datenbankdiagramme
  - Entity-Relationship-Modell
  - Tabellenbeziehungen
  - Indexstrategien

### Entwicklung

- **[Add_translation.md](developer-guide/Add_translation.md)**
  - Übersetzungsprozess
  - Sprachdateien
  - Internationalisierung
  - Lokalisierung

### API-Dokumentation

- **API-Referenz** (in Entwicklung)
  - REST-API Endpunkte
  - Authentifizierung
  - Request/Response Beispiele
  - Fehlercodes

---

## 🔌 Einrichtungsanleitungen

### Systemeinrichtung

- **[GRAFANA_QUICKSTART.md](setup/GRAFANA_QUICKSTART.md)**
  - Grafana Installation
  - Datenquellenkonfiguration
  - Dashboard-Provisioning
  - Automatische Dashboards
  - Benutzerdefinierte Dashboards

- **[REVERSE_PROXY_README.md](setup/REVERSE_PROXY_README.md)**
  - Reverse Proxy Konfiguration
  - Nginx-Einrichtung
  - SSL-Zertifikate
  - Sicherheit
  - Performance-Optimierung

---

## 🔧 Fehlerbehebung

### Häufige Probleme

- **Anmeldung fehlgeschlagen**: Berechtigungen prüfen
- **Arbeitsaufträge werden nicht angezeigt**: Filter zurücksetzen
- **E-Mail-Benachrichtigungen funktionieren nicht**: SMTP-Konfiguration prüfen
- **Datenbankverbindungsfehler**: PostgreSQL-Status prüfen
- **Liquibase-Sperrfehler**: Datenbankmigration prüfen

### Dokumentierte Lösungen

- **[Backup.md](admin-guide/Backup.md)**: Datenwiederherstellung
- **[Factory_Reset.md](admin-guide/Factory_Reset.md)**: Systemrücksetzung
- **[Run_SQL_command.md](admin-guide/Run_SQL_command.md)**: Datenbankreparatur
- **[GRAFANA_QUICKSTART.md](setup/GRAFANA_QUICKSTART.md)**: Dashboard-Probleme

---

## ❓ Häufig gestellte Fragen

### Allgemeine Fragen

**Wie erstelle ich einen neuen Benutzer?**
- Navigation: Benutzerverwaltung → Neuer Benutzer
- Benutzerdaten eingeben
- Rolle zuweisen
- Speichern

**Wie ändere ich mein Passwort?**
- Navigation: Profil → Sicherheit
- Aktuelles Passwort eingeben
- Neues Passwort festlegen
- Bestätigen

**Wie erstelle ich einen Arbeitsauftrag?**
- Navigation: Arbeitsaufträge → Neuer Auftrag
- Grunddaten eingeben
- Anlage zuweisen
- Priorität und Frist festlegen
- Speichern

### Technische Fragen

**Wie richte ich Grafana ein?**
- Siehe [GRAFANA_QUICKSTART.md](setup/GRAFANA_QUICKSTART.md)

**Wie ändere ich die Ports?**
- Siehe [Change_Ports.md](admin-guide/Change_Ports.md)

**Wie führe ich ein Backup durch?**
- Siehe [Backup.md](admin-guide/Backup.md)

### Modulspezifische Fragen

**Wie verwalte ich Anlagen?**
- Siehe [ANLAGENVERWALTUNG.md](modules/ANLAGENVERWALTUNG.md)

**Wie erstelle ich Wartungspläne?**
- Siehe [PRAEVENTIVE_WARTUNG.md](modules/PRAEVENTIVE_WARTUNG.md)

**Wie erfasse ich Arbeitszeiten?**
- Siehe [ARBEITSAUFTRAGSMANAGEMENT.md](modules/ARBEITSAUFTRAGSMANAGEMENT.md)

---

## 📚 Weitere Ressourcen

### Externe Dokumentation

- **Spring Boot Dokumentation**: https://spring.io/projects/spring-boot
- **React Dokumentation**: https://reactjs.org/docs/getting-started.html
- **PostgreSQL Dokumentation**: https://www.postgresql.org/docs/
- **Grafana Dokumentation**: https://grafana.com/docs/
- **Docker Dokumentation**: https://docs.docker.com/

### Community & Support

- **GitHub Repository**: https://github.com/your-repo/mms
- **Issue Tracker**: Für Fehlerberichte und Funktionsanfragen
- **Discussions**: Für Fragen und Erfahrungsaustausch
- **Kommerzieller Support**: Für Enterprise-Kunden

### Schulungen & Zertifizierungen

- **Online-Tutorials**: Videoanleitungen
- **Webinare**: Regelmäßige Schulungssessions
- **Dokumentation**: Umfassende Anleitungen
- **Zertifizierungen**: Offizielle MMS-Zertifizierungen

---

## 🎓 Dokumentationsrichtlinien

### Beitrag zur Dokumentation

Wir begrüßen Beiträge zur Dokumentation! So können Sie helfen:

1. **Forken**: Repository forken
2. **Änderungen**: Dokumentation verbessern
3. **Pull Request**: Änderungen einreichen
4. **Review**: Community-Review abwarten

### Dokumentationsstandards

- **Sprache**: Primär Deutsch, technische Begriffe Englisch
- **Format**: Markdown (.md)
- **Struktur**: Klare Überschriften und Abschnitte
- **Beispiele**: Praktische Beispiele und Screenshots
- **Aktualität**: Regelmäßige Updates

### Dokumentationsvorlagen

```markdown
# 📋 [Modulname] - Modulhandbuch

## 📋 Inhaltsverzeichnis

- [Überblick](#-überblick)
- [Funktionen](#-funktionen)
- [Schritt-für-Schritt Anleitungen](#-schritt-für-schritt-anleitungen)
- [Best Practices](#-best-practices)
- [Fehlerbehebung](#-fehlerbehebung)

## 🎯 Überblick

[Beschreibung des Moduls]

## ⚡ Funktionen

[Liste der Funktionen]

## ➕ [Funktion] erstellen

### Schritt-für-Schritt Anleitung

1. **Navigation**: [Pfad]
2. **Daten eingeben**: [Felder]
3. **Speichern**: [Aktion]

## 🎯 Best Practices

[Empfehlungen]

## 🔧 Fehlerbehebung

[Häufige Probleme und Lösungen]
```

---

**Vielen Dank für die Nutzung der MMS Dokumentation!** 🎉

Für weitere Fragen oder Unterstützung wenden Sie sich bitte an unser Support-Team oder tragen Sie zur Verbesserung der Dokumentation bei.

<div align="center">
  <p>Mit ❤️ vom MMS-Team erstellt</p>
  <p>⭐ Bewerten Sie diese Dokumentation, wenn sie Ihnen geholfen hat!</p>
</div>