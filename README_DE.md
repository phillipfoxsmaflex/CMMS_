# 🚀 MMS - Wartungsmanagement-System

## 📋 Inhaltsverzeichnis

- [Überblick](#-überblick)
- [Funktionen](#-funktionen)
- [Architektur](#-architektur)
- [Installation](#-installation)
- [Konfiguration](#-konfiguration)
- [Nutzung](#-nutzung)
- [Entwicklung](#-entwicklung)
- [API-Dokumentation](#-api-dokumentation)
- [Mitwirken](#-mitwirken)
- [Fehlerbehebung](#-fehlerbehebung)
- [Lizenz](#-lizenz)
- [Support](#-support)

---

## 🎯 Überblick

**MMS** ist ein umfassendes, selbstgehostetes Wartungsmanagement-System (MMS), das entwickelt wurde, um Wartungsvorgänge zu vereinfachen und zu automatisieren.

### 🌟 Warum MMS?

- ✅ **Selbstgehostet** - Volle Kontrolle über Ihre Daten und Infrastruktur
- ✅ **Open Source** - Transparent, anpassbar und community-getrieben
- ✅ **Docker-basiert** - Einfache Bereitstellung und Skalierbarkeit
- ✅ **Modular** - Flexible Anpassung an Ihre Anforderungen
- ✅ **Mehrsprachig** - Unterstützung für mehrere Sprachen

---

## ⚡ Funktionen

### 📝 Arbeitsaufträge & Wartung

- **Arbeitsauftragsverwaltung** - Erstellen, zuweisen, verfolgen und abschließen von Arbeitsaufträgen
- **Zeiterfassung** - Verfolgung von Arbeitsstunden und Kosten pro Arbeitsauftrag
- **Prioritätenmanagement** - Festlegen und Verwalten von Arbeitsauftragsprioritäten
- **Arbeitsauftragsverlauf** - Vollständige Prüfprotokollierung und Verlaufsverfolgung
- **Automatisierte Arbeitsaufträge** - Erstellen von Arbeitsaufträgen basierend auf Triggern
- **Präventive Wartung** - Planung wiederkehrender Wartungsaufgaben
- **Arbeitsauftragsvorlagen** - Standardisierung häufiger Wartungsprozeduren

### 📊 Analysen & Berichte

- **Arbeitsauftragsanalysen** - Compliance, Abschlussraten und Leistungsmetriken
- **Kostenanalyse** - Verfolgung von Wartungskosten und Budgetzuweisung
- **Ausrüstungsausfallzeiten** - Überwachung der Anlagenverfügbarkeit und Zuverlässigkeit
- **Arbeitszeiterfassung** - Analyse der Technikerproduktivität und Arbeitsbelastung
- **Kostentrends** - Historische Kostenanalyse und Prognose
- **Benutzerdefinierte Berichte** - Export von Daten in mehreren Formaten (PDF, Excel, CSV)
- **Dashboard** - Echtzeit-KPIs und Metrikenvisualisierung

### ⚙️ Anlagen- & Geräteverwaltung

- **Anlagenregister** - Vollständiges Anlageninventar mit detaillierten Spezifikationen
- **Anlagenhierarchie** - Organisation von Anlagen nach Standort, Abteilung oder Kategorie
- **Ausfallzeitverfolgung** - Überwachung der Geräteverfügbarkeit und MTBF/MTTR
- **Wartungsverlauf** - Vollständiger Serviceverlauf pro Anlage
- **Wartungskosten** - Verfolgung der Kosten pro Anlage über die Zeit
- **Anlagendokumentation** - Anhängen von Handbüchern, Garantien und Spezifikationen
- **QR-Code-Integration** - Mobile Anlagenidentifikation

### 📈 Anlagenüberwachung & Dashboards

- **Echtzeit-Überwachung** - Integrierte Grafana-Dashboards für Live-Anlagenüberwachung
- **InfluxDB-Integration** - Zeitreihendatenspeicherung für Sensordaten und Metriken
- **Anlagenspezifische Dashboards** - Konfiguration individueller Überwachungsdashboards pro Anlage
- **Globaler Alarmierungsdashboard** - Zentralisierte Ansicht aller Alarme und kritischen Ereignisse
- **Eingebettete Visualisierung** - Dashboards direkt in MMS-Oberfläche eingebettet
- **Externe Datenquellen** - Verbindung von IoT-Sensoren und Überwachungssystemen mit InfluxDB
- **Benutzerdefinierte Metriken** - Definition und Verfolgung benutzerspezifischer KPIs für Ihre Anlagen
- **Alarmmanagement** - Visuelle Darstellung von Systemalarmen und Anomalien

### 📦 Inventar- & Teileverwaltung

- **Teileinventar** - Verfolgung von Ersatzteilen und Verbrauchsmaterialien
- **Lagerbestandsalarme** - Benachrichtigungen bei niedrigem Lagerbestand und Bestellpunkten
- **Mehrstandort-Unterstützung** - Inventarverwaltung über mehrere Lager hinweg
- **Teileverbrauchsverfolgung** - Verknüpfung des Teileverbrauchs mit Arbeitsaufträgen
- **Bestellungen** - Erstellen und Verwalten von Bestellungen
- **Lieferantenverwaltung** - Verfolgung von Lieferanten und Lieferanteninformationen
- **Genehmigungsworkflows** - Mehrstufiger Bestellgenehmigungsprozess

### 👥 Team- & Benutzerverwaltung

- **Rollenbasierte Zugriffssteuerung** - Anpassbare Benutzerrollen und Berechtigungen
- **Teamberechtigungen** - Organisation von Benutzern in Teams und Abteilungen
- **Externe Dienstleister** - Verwaltung externer Auftragnehmer und Lieferanten
- **Benutzeraktivitätsverfolgung** - Prüfprotokolle und Aktivitätsüberwachung
- **Multi-Tenancy** - Unterstützung für mehrere Organisationen

### 🔄 Workflow & Automatisierung

- **Workflow-Engine** - Definition benutzerspezifischer Workflows mit Automatisierungslogik
- **Triggerbasierte Aktionen** - Automatisierung von Aufgaben basierend auf Bedingungen
- **E-Mail-Benachrichtigungen** - Automatisierte Warnungen und Erinnerungen
- **Benutzerdefinierte Felder** - Erweiterung der Funktionalität mit benutzerdefinierten Datenfeldern
- **API-Integration** - REST-API für Integrationen von Drittanbietern
- **Webhooks** - Echtzeit-Ereignisbenachrichtigungen

### 📍 Standortverwaltung

- **Standorthierarchie** - Organisation von Anlagen nach Standort und Unterstandort
- **Gebäudeplan-Integration** - Visuelle Standortzuordnung
- **Mehrstandort-Unterstützung** - Verwaltung mehrerer Einrichtungen oder Standorte
- **Standortbasierte Zuweisung** - Zuweisung von Arbeitsaufträgen nach Standort

### 📑 Anforderungsmanagement

- **Serviceanforderungen** - Ermöglichen von Benutzern, Wartungsanforderungen zu übermitteln
- **Anforderungsgenehmigung** - Genehmigungsworkflow für Wartungsanforderungen
- **Anforderungsverfolgung** - Verfolgung des Anforderungsstatus von der Übermittlung bis zum Abschluss

---

## 🏗️ Architektur

MMS folgt einer modernen Mikroservice-Architektur mit klarer Trennung der Verantwortlichkeiten:

```
┌─────────────────────────────────────────────────────────────┐
│                        Client-Schicht                        │
├─────────────────────────────────────────────────────────────┤
│  Web-Frontend (React)
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API-Gateway / Backend                    │
├─────────────────────────────────────────────────────────────┤
│              Spring Boot REST API (Java 17)                  │
│  • Authentifizierung & Autorisierung (JWT)                  │
│  • Geschäftslogik & Services                                 │
│  • Datenvalidierung & Mapping                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
    ┌───────────────┐  ┌──────────┐  ┌──────────┐
    │   PostgreSQL  │  │  MinIO   │  │  SMTP    │
    │   Datenbank    │  │  Storage │  │  Server  │
    └───────────────┘  └──────────┘  └──────────┘
```

### Technologiestack

#### Backend (API)
- **Framework**: Spring Boot 2.6.7
- **Sprache**: Java 17
- **Datenbank**: PostgreSQL 16
- **ORM**: Spring Data JPA + Hibernate
- **Sicherheit**: Spring Security + JWT
- **Datenbankmigration**: Liquibase 4.22.0
- **Dokumentation**: Swagger/OpenAPI
- **Objektspeicher**: MinIO / Google Cloud Storage
- **E-Mail**: Spring Mail mit SMTP

#### Frontend (Web)
- **Framework**: React 18
- **Sprache**: TypeScript
- **Stil**: Material-UI
- **Zustandsmanagement**: Redux Toolkit
- **Routing**: React Router
- **Internationalisierung**: i18next
- **Formulare**: Formik + Yup
- **Tabellen**: Material-UI Data Grid

#### Mobile App
- **Framework**: React Native
- **Navigation**: React Navigation
- **Zustandsmanagement**: Redux
- **Plattformen**: iOS & Android

---

## 🛠️ Entwicklung

### Einrichtung der Entwicklungsumgebung

#### Backend (API)

1. **Voraussetzungen**:
   - Java 17 JDK
   - Maven 3.8+
   - PostgreSQL 16

2. **Klonen und Einrichtung**:
   ```bash
   cd api
   ./mvnw clean install
   ```

3. **Lokal ausführen**:
   ```bash
   ./mvnw spring-boot:run
   ```

4. **Tests ausführen**:
   ```bash
   ./mvnw test
   ```

#### Frontend (Web)

1. **Voraussetzungen**:
   - Node.js 18+
   - npm oder yarn

2. **Abhängigkeiten installieren**:
   ```bash
   cd frontend
   npm install
   ```

3. **Entwicklungsserver starten**:
   ```bash
   npm run dev
   ```

4. **Für Produktion erstellen**:
   ```bash
   npm run build
   ```

### Projektstruktur

```
MMS/
├── api/                      # Backend Spring Boot Anwendung
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/        # Java-Quellcode
│   │   │   └── resources/   # Konfigurationsdateien
│   │   └── test/            # Unit-Tests
│   ├── Dockerfile
│   └── pom.xml              # Maven-Konfiguration
├── frontend/                # React Webanwendung
│   ├── src/
│   │   ├── components/      # React-Komponenten
│   │   ├── content/         # Seiteninhalte
│   │   ├── hooks/           # Benutzerdefinierte React-Hooks
│   │   ├── slices/          # Redux-Slices
│   │   └── models/          # TypeScript-Modelle
│   ├── Dockerfile
│   └── package.json
├── docs/                    # Dokumentation
│   ├── admin-guide/         # Administrationshandbuch
│   ├── api-reference/       # API-Referenz
│   ├── developer-guide/     # Entwicklerhandbuch
│   ├── modules/             # Moduldokumentation
│   ├── setup/               # Einrichtungshandbücher
│   ├── troubleshooting/     # Fehlerbehebung
│   └── user-guide/          # Benutzerhandbuch
├── scripts/                # Dienstprogrammskripte
├── docker-compose.yml      # Docker Compose Konfiguration
├── .env.example           # Umgebungsvariablen-Vorlage
└── README_DE.md           # Diese Datei
```

### Datenbankmigrationen

MMS verwendet Liquibase für Datenbankmigrationen:

```bash
cd api
./mvnw liquibase:update
```

---

## 📚 API-Dokumentation

### REST-API-Endpunkte

Das Backend stellt eine RESTful-API mit den folgenden Hauptendpunkten bereit:

- **Authentifizierung**: `/api/auth/*`
- **Benutzer**: `/api/users/*`
- **Arbeitsaufträge**: `/api/work-orders/*`
- **Anlagen**: `/api/assets/*`
- **Standorte**: `/api/locations/*`
- **Inventar**: `/api/parts/*`
- **Präventive Wartung**: `/api/preventive-maintenances/*`
- **Berichte**: `/api/analytics/*`

### Swagger-Dokumentation

Interaktive API-Dokumentation ist verfügbar unter:
```
http://localhost:12001/swagger-ui.html
```

### Authentifizierung

Die API verwendet JWT (JSON Web Tokens) für die Authentifizierung:

1. **Registrieren/Anmelden**, um ein JWT-Token zu erhalten
2. **Token in den Autorisierungsheader einfügen**:
   ```
   Authorization: Bearer <Ihr-JWT-Token>
   ```

Beispiel:
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
     http://localhost:12001/api/work-orders
```

---

## 🤝 Mitwirken

Wir begrüßen Beiträge aus der Community! So können Sie helfen:

### Möglichkeiten zur Mitwirkung

- 🐛 **Fehler melden** - Öffnen Sie ein Issue mit Beschreibung des Fehlers
- 💡 **Funktionen vorschlagen** - Teilen Sie Ihre Ideen für Verbesserungen
- 📝 **Dokumentation verbessern** - Helfen Sie, die Dokumentation zu verbessern
- 🔧 **Code einreichen** - Fehler beheben oder Funktionen implementieren
- 🌍 **Übersetzungen** - Helfen Sie, die App in andere Sprachen zu übersetzen

### Richtlinien für Beiträge

1. **Repository forken**
2. **Feature-Branch erstellen** (`git checkout -b feature/tolle-funktion`)
3. **Änderungen vornehmen** und commiten (`git commit -m 'Füge tolle Funktion hinzu'`)
4. **In Ihren Branch pushen** (`git push origin feature/tolle-funktion`)
5. **Pull Request öffnen**

Für detaillierte Richtlinien siehe:
- [API-Mitwirkungsrichtlinien](api/CONTRIBUTING.md)
- [Frontend-Mitwirkungsrichtlinien](frontend/CONTRIBUTING.md)

### Übersetzungen hinzufügen

Um eine neue Sprachübersetzung hinzuzufügen:
1. Siehe [Übersetzungsrichtlinien](docs/developer-guide/Add%20translation.md)
2. Kopieren Sie eine bestehende Sprachdatei
3. Übersetzen Sie alle Zeichenketten
4. Reichen Sie einen Pull Request ein

---

## 🔧 Fehlerbehebung

### Häufige Probleme

#### Docker-Container startet nicht

**Problem**: Container können nicht gestartet werden oder stürzen sofort ab

**Lösung**:
```bash
# Logs prüfen
docker-compose logs

# Container neu starten
docker-compose down
docker-compose up -d
```

#### Datenbankverbindungsfehler

**Problem**: Backend kann keine Verbindung zu PostgreSQL herstellen

**Lösung**:
1. Überprüfen Sie, ob PostgreSQL läuft: `docker ps`
2. Überprüfen Sie die Anmeldeinformationen in der `.env`-Datei
3. Stellen Sie sicher, dass Ports nicht belegt sind: `netstat -an | grep 5432`

#### Frontend kann Backend nicht erreichen

**Problem**: API-Aufrufe schlagen mit CORS- oder Netzwerkfehlern fehl

**Lösung**:
1. Überprüfen Sie `PUBLIC_API_URL` in `.env` entspricht der Backend-URL
2. Überprüfen Sie, ob das Backend läuft: `curl http://localhost:12001/api/health`
3. Stellen Sie sicher, dass beide dasselbe Protokoll verwenden (http/https)

#### Liquibase-Sperrfehler

**Problem**: Datenbankmigration schlägt mit Sperrfehler fehl

**Lösung**: Siehe [Liquibase-Sperrfehler beheben](docs/troubleshooting/Fix%20Liquibase%20lock.md)

#### E-Mail-Benachrichtigungen funktionieren nicht

**Problem**: System sendet keine E-Mails

**Lösung**:
1. Überprüfen Sie die SMTP-Konfiguration in `.env`
2. Überprüfen Sie `ENABLE_EMAIL_NOTIFICATIONS=true`
3. Testen Sie SMTP-Anmeldeinformationen
4. Überprüfen Sie Firewall/Sicherheitsgruppenregeln für SMTP-Port

### Erweiterte Fehlerbehebung

#### Datenbank-Backup und -Wiederherstellung

Siehe [Backup-Anleitung](docs/admin-guide/Backup.md) für detaillierte Anweisungen.

#### Werkseinstellungen

Um das System auf den Standardzustand zurückzusetzen:
Siehe [Werkseinstellungen-Anleitung](docs/admin-guide/Factory%20Reset.md)

#### SQL-Befehle ausführen

Siehe [SQL-Befehls-Anleitung](docs/admin-guide/Run%20SQL%20command.md)

#### Ports ändern

Siehe [Ports ändern-Anleitung](docs/admin-guide/Change%20Ports.md)

---

## 📄 Lizenz

Dieses Projekt ist lizenziert unter der **GNU General Public License v3.0** (GPL-3.0).

Das bedeutet, Sie sind frei:
- ✅ Die Software für jeden Zweck zu verwenden
- ✅ Die Software zu ändern, um sie Ihren Bedürfnissen anzupassen
- ✅ Die Software mit Ihren Freunden und Nachbarn zu teilen
- ✅ Die Änderungen, die Sie vornehmen, zu teilen

Unter den folgenden Bedingungen:
- ⚠️ Alle Änderungen müssen ebenfalls unter GPL-3.0 als Open Source veröffentlicht werden
- ⚠️ Sie müssen die ursprüngliche Lizenz und den Urheberrechtshinweis einschließen
- ⚠️ Sie müssen bedeutende Änderungen an der Software angeben

Für weitere Informationen siehe die [LICENSE](LICENSE)-Datei.

---

## 💬 Support

### Hilfe erhalten

- 📖 **Dokumentation**: Überprüfen Sie den [docs](docs/)-Ordner
- 🐛 **Fehler melden**: Öffnen Sie ein Issue auf GitHub
- 💡 **Funktionsanfragen**: Öffnen Sie ein Issue mit dem Enhancement-Label
- 📧 **E-Mail**: Kontaktieren Sie die Betreuer

### Community

- ⭐ **Star dieses Repository**, um Ihre Unterstützung zu zeigen!
- 👥 **Nehmen Sie an Diskussionen** in GitHub Issues teil
- 🔄 **Teilen Sie Ihre Anwendungsfälle** mit der Community

### Kommerzieller Support

Für Enterprise-Support, individuelle Entwicklung oder Beratungsdienstleistungen kontaktieren Sie bitte die Projektbetreuer.

---

## 🙏 Danksagungen

MMS wird mit Open-Source-Technologien entwickelt und ist dank der Beiträge der Community möglich.

Besonderer Dank gilt:
- Dem Spring Framework Team
- Den React- und React Native-Communities
- Dem Material-UI-Team
- Grafana
- Atlas CMMS
- Allen Mitwirkenden und Nutzern

---

<div align="center">
  <p>Mit ❤️ vom MMS-Team erstellt</p>
  <p>⭐ Star dieses Repo, wenn Sie es nützlich finden!</p>
</div>