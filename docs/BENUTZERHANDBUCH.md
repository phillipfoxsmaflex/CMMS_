# 📚 MMS Benutzerhandbuch

## 📋 Inhaltsverzeichnis

- [Einführung](#-einführung)
- [Systemanforderungen](#-systemanforderungen)
- [Installation](#-installation)
- [Erste Schritte](#-erste-schritte)
- [Modulübersicht](#-modulübersicht)
- [Benutzerverwaltung](#-benutzerverwaltung)
- [Anlagenverwaltung](#-anlagenverwaltung)
- [Arbeitsauftragsmanagement](#-arbeitsauftragsmanagement)
- [Präventive Wartung](#-präventive-wartung)
- [Inventar & Teileverwaltung](#-inventar--teileverwaltung)
- [Standortverwaltung](#-standortverwaltung)
- [Berichte & Analysen](#-berichte--analysen)
- [Grafana Dashboards](#-grafana-dashboards)
- [Einstellungen & Konfiguration](#-einstellungen--konfiguration)
- [Fehlerbehebung](#-fehlerbehebung)
- [Häufig gestellte Fragen](#-häufig-gestellte-fragen)

---

## 🎯 Einführung

Willkommen beim **MMS Wartungsmanagement-System**! Dieses Benutzerhandbuch bietet Ihnen eine umfassende Anleitung zur Nutzung aller Funktionen und Module des Systems.

### Zielgruppe

Dieses Handbuch richtet sich an:
- **Anwender** - Techniker, Wartungspersonal
- **Manager** - Wartungsleiter, Betriebsleiter
- **Administratoren** - Systemadministratoren, IT-Personal
- **Entscheider** - Geschäftsführung, Projektverantwortliche

### Systemübersicht

MMS ist ein modulares Wartungsmanagement-System mit folgenden Hauptkomponenten:

```
┌─────────────────────────────────────────────────────────────┐
│                        MMS Systemarchitektur                 │
├─────────────────────────────────────────────────────────────┤
│  Web-Oberfläche  │  Mobile App  │  API-Schnittstelle         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Kernmodule & Funktionen                 │
├─────────────────────────────────────────────────────────────┤
│  • Anlagenverwaltung      • Arbeitsaufträge                  │
│  • Präventive Wartung    • Inventar & Teile                 │
│  • Standortverwaltung    • Berichte & Analysen              │
│  • Benutzerverwaltung    • Grafana Dashboards               │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Systemanforderungen

### Serveranforderungen

- **Betriebssystem**: Linux (Ubuntu 20.04+ empfohlen)
- **CPU**: 4+ Kerne
- **RAM**: 8+ GB
- **Festplatte**: 100+ GB SSD
- **Docker**: Version 20.10+
- **Docker Compose**: Version 1.29+

### Clientanforderungen

- **Web-Browser**: Chrome, Firefox, Edge (aktuelle Versionen)
- **Mobile**: iOS 14+ oder Android 10+
- **Bildschirmauflösung**: 1280x720 Minimum

### Netzwerkanforderungen

- **Ports**: 80, 443, 8080, 3001, 5432, 8086
- **Internetverbindung** für Updates und E-Mail-Benachrichtigungen

---

## 🛠️ Installation

### Docker-Installation (empfohlen)

1. **Repository klonen**:
   ```bash
   git clone https://github.com/your-repo/mms.git
   cd mms
   ```

2. **Umgebungsvariablen konfigurieren**:
   ```bash
   cp .env.example .env
   nano .env  # Anpassen der Konfiguration
   ```

3. **System starten**:
   ```bash
   docker-compose up -d
   ```

4. **Zugriff auf das System**:
   - Web-Oberfläche: `http://localhost:8080`
   - Grafana: `http://localhost:3001`
   - API: `http://localhost:12001`

### Manuelle Installation

Für Entwickler oder spezielle Anforderungen:

1. **Backend (API)**:
   ```bash
   cd api
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

2. **Frontend (Web)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Mobile App**:
   ```bash
   cd mobile
   npm install
   npm run ios  # oder npm run android
   ```

---

## 🚀 Erste Schritte

### Anmeldung

1. **Erstanmeldung**:
   - URL: `http://localhost:8080/login`
   - Benutzername: `admin@mms.com`
   - Passwort: `admin123` (bitte sofort ändern!)

2. **Passwort ändern**:
   - Navigation: **Profil** → **Sicherheit** → **Passwort ändern**

### Systemkonfiguration

1. **Firmendaten einrichten**:
   - Navigation: **Einstellungen** → **Firmenprofile**
   - Firmenname, Logo, Adresse hinterlegen

2. **Benutzer einrichten**:
   - Navigation: **Benutzerverwaltung** → **Neuer Benutzer**
   - Rollen und Berechtigungen zuweisen

3. **Standorte anlegen**:
   - Navigation: **Standortverwaltung** → **Neuer Standort**
   - Hierarchie: Gebäude → Ebene → Raum

---

## 📦 Modulübersicht

### 1. Benutzerverwaltung

**Funktionen**:
- Benutzer anlegen, bearbeiten, löschen
- Rollen und Berechtigungen verwalten
- Teams und Abteilungen organisieren
- Externe Dienstleister verwalten
- Aktivitätsprotokolle einsehen

**Rollen**:
- **Administrator**: Volle Zugriffsrechte
- **Manager**: Wartungsmanagement, Berichte
- **Techniker**: Arbeitsaufträge bearbeiten
- **Betrachter**: Nur Lesezugriff
- **Externer Dienstleister**: Eingeschränkter Zugriff

### 2. Anlagenverwaltung

**Funktionen**:
- Anlagenstammdaten verwalten
- Hierarchische Anlagenstruktur
- Technische Dokumentation hinterlegen
- QR-Codes für mobile Identifikation
- Wartungsverlauf und -kosten
- Ausfallzeiten dokumentieren
- Zählerstände erfassen

**Anlagentypen**:
- Maschinen
- Fahrzeuge
- Gebäudeinfrastruktur
- IT-Equipment
- Werkzeuge

### 3. Arbeitsauftragsmanagement

**Funktionen**:
- Arbeitsaufträge erstellen und zuweisen
- Prioritäten und Fristen verwalten
- Statusverfolgung (Offen, In Bearbeitung, Abgeschlossen)
- Zeiterfassung und Kostenverfolgung
- Dokumentation und Rückmeldung
- Arbeitsauftragsvorlagen
- Automatisierte Arbeitsaufträge

**Arbeitsauftragsstatus**:
- **Offen**: Neu erstellt, noch nicht begonnen
- **In Bearbeitung**: Aktuell bearbeitet
- **Wartend**: Auf Teile oder Genehmigung wartend
- **Abgeschlossen**: Fertig gestellt
- **Storniert**: Abgebrochen

### 4. Präventive Wartung

**Funktionen**:
- Wartungspläne erstellen
- Wiederkehrende Wartungsintervalle
- Automatische Arbeitsauftragserstellung
- Compliance-Überwachung
- Wartungshistorie
- Kalenderansicht

**Wartungsintervalle**:
- Täglich
- Wöchentlich
- Monatlich
- Quartalsweise
- Jährlich
- Benutzerdefiniert

### 5. Inventar & Teileverwaltung

**Funktionen**:
- Teilekatalog verwalten
- Lagerbestände überwachen
- Mindestbestandsalarme
- Teileverbrauch dokumentieren
- Bestellungen verwalten
- Lieferanten verwalten
- Mehrlager-Unterstützung

**Teilekategorien**:
- Ersatzteile
- Verbrauchsmaterialien
- Werkzeuge
- Schutzausrüstung

### 6. Standortverwaltung

**Funktionen**:
- Standortstruktur verwalten
- Gebäudepläne hinterlegen
- Anlagen zu Standorten zuweisen
- Standortbasierte Arbeitsaufträge
- GPS-Koordinaten
- Hierarchische Organisation

**Standorttypen**:
- Gebäude
- Etagen
- Räume
- Außenbereiche
- Virtuelle Standorte

### 7. Berichte & Analysen

**Funktionen**:
- Standardberichte
- Benutzerdefinierte Berichte
- Exportfunktionen (PDF, Excel, CSV)
- Echtzeit-Dashboards
- Historische Datenanalyse
- KPI-Überwachung

**Berichtstypen**:
- Arbeitsauftragsstatistiken
- Anlagenverfügbarkeit
- Wartungskosten
- Inventarberichte
- Produktivitätsanalysen

### 8. Grafana Dashboards

**Funktionen**:
- Echtzeit-Anlagenüberwachung
- Historische Datenanalyse
- Benutzerdefinierte Visualisierungen
- Alarmierung und Benachrichtigungen
- Multi-Datenquellen-Integration

**Dashboard-Typen**:
- Anlagen-Gesundheitsüberwachung
- Arbeitsauftragsmanagement
- Kostenanalyse
- Präventive Wartung
- Standortperformance

---

## 👥 Benutzerverwaltung

### Benutzer anlegen

1. **Navigation**: **Benutzerverwaltung** → **Neuer Benutzer**
2. **Benutzerdaten eingeben**:
   - Vorname, Nachname
   - E-Mail-Adresse
   - Telefonnummer
   - Rolle auswählen
3. **Zugangsdaten festlegen**:
   - Benutzername
   - Temporäres Passwort
4. **Speichern**

### Rollen verwalten

1. **Navigation**: **Einstellungen** → **Rollen**
2. **Neue Rolle erstellen**:
   - Rollenname
   - Berechtigungen auswählen
3. **Bestehende Rolle bearbeiten**:
   - Berechtigungen anpassen
   - Benutzer zuweisen

### Teams organisieren

1. **Navigation**: **Benutzerverwaltung** → **Teams**
2. **Neues Team erstellen**:
   - Teamname
   - Teamleiter auswählen
   - Mitglieder hinzufügen
3. **Teamrechte verwalten**:
   - Standortzugriff
   - Anlagenzugriff
   - Arbeitsauftragsrechte

---

## ⚙️ Anlagenverwaltung

### Anlage anlegen

1. **Navigation**: **Anlagen** → **Neue Anlage**
2. **Grunddaten eingeben**:
   - Anlagename
   - Anlagentyp
   - Hersteller, Modell, Seriennummer
   - Standort zuweisen
3. **Technische Daten**:
   - Leistung, Spannung
   - Anschaffungskosten
   - Garantieinformationen
4. **Dokumentation**:
   - Handbücher hochladen
   - Wartungsanleitungen
   - Zertifikate
5. **QR-Code generieren** für mobile Identifikation

### Anlagenhierarchie

1. **Navigation**: **Anlagen** → **Hierarchie**
2. **Struktur aufbauen**:
   - Hauptanlagen
   - Unteranlagen
   - Komponenten
3. **Beziehungen definieren**:
   - Eltern-Kind-Beziehungen
   - Abhängigkeiten

### Wartungsverlauf

1. **Navigation**: **Anlagen** → **Wartungsverlauf**
2. **Filter anwenden**:
   - Zeitraum
   - Wartungstyp
   - Status
3. **Details einsehen**:
   - Durchgeführte Arbeiten
   - Verwendete Teile
   - Arbeitszeiten
   - Kosten

---

## 📋 Arbeitsauftragsmanagement

### Arbeitsauftrag erstellen

1. **Navigation**: **Arbeitsaufträge** → **Neuer Auftrag**
2. **Grunddaten eingeben**:
   - Titel und Beschreibung
   - Anlage zuweisen
   - Priorität festlegen
   - Frist setzen
3. **Details festlegen**:
   - Arbeitsauftragskategorie
   - Verantwortlicher Techniker
   - Geschätzte Dauer
4. **Ressourcen planen**:
   - Benötigte Teile
   - Benötigte Werkzeuge
   - Externe Dienstleister

### Arbeitsauftrag bearbeiten

1. **Navigation**: **Arbeitsaufträge** → **Offene Aufträge**
2. **Auftrag auswählen**
3. **Status aktualisieren**:
   - In Bearbeitung
   - Wartend
   - Abgeschlossen
4. **Arbeitszeiten erfassen**:
   - Beginn und Ende
   - Pausen
   - Arbeitsbeschreibung
5. **Teileverbrauch dokumentieren**:
   - Verwendete Teile
   - Mengen
   - Lagerbestand aktualisieren

### Arbeitsauftrag abschließen

1. **Navigation**: **Arbeitsaufträge** → **In Bearbeitung**
2. **Auftrag auswählen**
3. **Abschlussdaten eingeben**:
   - Tatsächlich benötigte Zeit
   - Durchgeführte Arbeiten
   - Verwendete Materialien
   - Kosten
4. **Qualitätskontrolle**:
   - Arbeitsergebnis prüfen
   - Kundenfeedback
5. **Abschließen und archivieren**

---

## 🔄 Präventive Wartung

### Wartungsplan erstellen

1. **Navigation**: **Präventive Wartung** → **Neuer Plan**
2. **Grunddaten eingeben**:
   - Planname
   - Beschreibung
   - Anlage zuweisen
3. **Wartungsintervalle festlegen**:
   - Intervalltyp (täglich, wöchentlich, monatlich)
   - Startdatum
   - Enddatum (optional)
4. **Arbeitsauftragsvorlage**:
   - Standardaufgaben
   - Benötigte Teile
   - Geschätzte Dauer

### Wartungsplan verwalten

1. **Navigation**: **Präventive Wartung** → **Pläne**
2. **Filter anwenden**:
   - Aktive Pläne
   - Inaktive Pläne
   - Überfällige Wartungen
3. **Plan bearbeiten**:
   - Intervalle anpassen
   - Zugewiesene Anlagen ändern
   - Vorlagen aktualisieren

### Compliance-Überwachung

1. **Navigation**: **Präventive Wartung** → **Compliance**
2. **Berichte einsehen**:
   - Erfüllungsrate
   - Überfällige Wartungen
   - Historische Trends
3. **Alarme einrichten**:
   - E-Mail-Benachrichtigungen
   - Dashboard-Warnungen
   - Mobile Push-Benachrichtigungen

---

## 📦 Inventar & Teileverwaltung

### Teilekatalog verwalten

1. **Navigation**: **Inventar** → **Teilekatalog**
2. **Neues Teil anlegen**:
   - Teilename
   - Teilenummer
   - Kategorie
   - Hersteller
3. **Technische Daten**:
   - Maße, Gewicht
   - Material
   - Kompatibilität

### Lagerbestände verwalten

1. **Navigation**: **Inventar** → **Lagerbestände**
2. **Bestandsänderungen**:
   - Wareneingang
   - Warenausgang
   - Inventur
3. **Mindestbestandsalarme**:
   - Warnungen einrichten
   - Bestellvorschläge
   - Automatische Bestellungen

### Bestellungen verwalten

1. **Navigation**: **Inventar** → **Bestellungen**
2. **Neue Bestellung erstellen**:
   - Lieferant auswählen
   - Teile hinzufügen
   - Mengen festlegen
3. **Bestellprozess**:
   - Genehmigungsworkflow
   - Lieferverfolgung
   - Wareneingang

---

## 📍 Standortverwaltung

### Standortstruktur aufbauen

1. **Navigation**: **Standorte** → **Struktur**
2. **Hierarchie erstellen**:
   - Hauptstandort
   - Gebäude
   - Etagen
   - Räume
3. **Standortdaten**:
   - Adresse
   - GPS-Koordinaten
   - Kontaktinformationen

### Gebäudepläne verwalten

1. **Navigation**: **Standorte** → **Gebäudepläne**
2. **Plan hochladen**:
   - Grundrissdatei
   - Maßstab festlegen
   - Hotspots definieren
3. **Anlagen zuweisen**:
   - Position auf Plan
   - Raumzuordnung
   - Etagenplanung

### Standortbasierte Analysen

1. **Navigation**: **Standorte** → **Analysen**
2. **Berichte einsehen**:
   - Anlagenverteilung
   - Wartungsaktivitäten
   - Kosten pro Standort
3. **Optimierung**:
   - Raumauslastung
   - Wartungsrouten
   - Ressourcenplanung

---

## 📊 Berichte & Analysen

### Standardberichte

1. **Navigation**: **Berichte** → **Standardberichte**
2. **Berichtstyp auswählen**:
   - Arbeitsauftragsstatistiken
   - Anlagenverfügbarkeit
   - Wartungskosten
   - Inventarberichte
3. **Parameter festlegen**:
   - Zeitrahmen
   - Filterkriterien
   - Exportformat

### Benutzerdefinierte Berichte

1. **Navigation**: **Berichte** → **Benutzerdefiniert**
2. **Bericht erstellen**:
   - Datenquellen auswählen
   - Felder definieren
   - Filter festlegen
3. **Visualisierung**:
   - Diagramme
   - Tabellen
   - Grafiken

### Exportfunktionen

1. **Navigation**: **Berichte** → **Export**
2. **Format auswählen**:
   - PDF (für Druck)
   - Excel (für weitere Analyse)
   - CSV (für Import)
   - JSON (für API-Integration)
3. **Export durchführen**:
   - Dateiname festlegen
   - Speicherort wählen
   - Export starten

---

## 📈 Grafana Dashboards

### Dashboard-Zugriff

1. **Navigation**: **Analysen** → **Grafana Dashboards**
2. **Anmeldung**:
   - URL: `http://localhost:3001`
   - Benutzername/Passwort aus `.env`
3. **Dashboard auswählen**:
   - MMS Maintenance Performance Overview
   - MMS Asset Health & Reliability
   - MMS Work Order Management
   - MMS Cost & Resource Analysis
   - MMS Preventive Maintenance Compliance
   - MMS Location-Based Performance

### Dashboard-Konfiguration

1. **Navigation**: **Dashboard** → **Einstellungen**
2. **Variablen festlegen**:
   - Company ID
   - Standort
   - Anlage
   - Zeitrahmen
3. **Panels anpassen**:
   - Visualisierungstyp
   - Farben
   - Achsenbeschriftungen

### Alerts einrichten

1. **Navigation**: **Dashboard** → **Alerts**
2. **Neuen Alert erstellen**:
   - Bedingung festlegen
   - Schwellenwert definieren
   - Benachrichtigungsmethode wählen
3. **Alert verwalten**:
   - Testen
   - Aktivieren/Deaktivieren
   - Historische Alarme einsehen

---

## ⚙️ Einstellungen & Konfiguration

### Systemeinstellungen

1. **Navigation**: **Einstellungen** → **System**
2. **Grundkonfiguration**:
   - Firmenname
   - Logo
   - Standardsprache
3. **Sicherheit**:
   - Passwortrichtlinien
   - Sitzungszeitlimits
   - Zwei-Faktor-Authentifizierung

### E-Mail-Konfiguration

1. **Navigation**: **Einstellungen** → **E-Mail**
2. **SMTP-Einstellungen**:
   - Serveradresse
   - Port
   - Benutzername/Passwort
3. **Benachrichtigungen**:
   - E-Mail-Vorlagen
   - Empfängerlisten
   - Häufigkeit

### API-Integration

1. **Navigation**: **Einstellungen** → **API**
2. **API-Zugriff**:
   - API-Schlüssel verwalten
   - Zugriffsrechte festlegen
   - Rate Limiting
3. **Webhooks**:
   - Endpunkte konfigurieren
   - Ereignistypen auswählen
   - Testen

---

## 🔧 Fehlerbehebung

### Häufige Probleme

#### Anmeldung fehlgeschlagen

**Ursache**: Falsche Anmeldeinformationen oder deaktivierter Benutzer

**Lösung**:
1. Passwort zurücksetzen
2. Benutzerstatus prüfen
3. Browser-Cache leeren

#### Arbeitsaufträge werden nicht angezeigt

**Ursache**: Filtereinstellungen oder Berechtigungsprobleme

**Lösung**:
1. Filter zurücksetzen
2. Berechtigungen prüfen
3. Cache aktualisieren

#### E-Mail-Benachrichtigungen funktionieren nicht

**Ursache**: Falsche SMTP-Konfiguration oder Firewall

**Lösung**:
1. SMTP-Einstellungen prüfen
2. Firewall-Regeln überprüfen
3. Test-E-Mail senden

### Support kontaktieren

1. **Navigation**: **Hilfe** → **Support**
2. **Support-Ticket erstellen**:
   - Problem beschreiben
   - Screenshots anhängen
   - Log-Dateien bereithalten
3. **Priorität festlegen**:
   - Niedrig
   - Mittel
   - Hoch
   - Kritisch

---

## ❓ Häufig gestellte Fragen

### Wie erstelle ich einen neuen Benutzer?

1. Navigation: **Benutzerverwaltung** → **Neuer Benutzer**
2. Benutzerdaten eingeben
3. Rolle zuweisen
4. Speichern

### Wie ändere ich mein Passwort?

1. Navigation: **Profil** → **Sicherheit**
2. Aktuelles Passwort eingeben
3. Neues Passwort festlegen
4. Bestätigen

### Wie erstelle ich einen Arbeitsauftrag?

1. Navigation: **Arbeitsaufträge** → **Neuer Auftrag**
2. Grunddaten eingeben
3. Anlage zuweisen
4. Priorität und Frist festlegen
5. Speichern

### Wie sehe ich den Wartungsverlauf einer Anlage?

1. Navigation: **Anlagen** → **Anlagenliste**
2. Anlage auswählen
3. Tab **Wartungsverlauf**
4. Filter anwenden

### Wie richte ich präventive Wartung ein?

1. Navigation: **Präventive Wartung** → **Neuer Plan**
2. Anlage auswählen
3. Intervall festlegen
4. Arbeitsauftragsvorlage erstellen
5. Speichern

### Wie verwalte ich den Lagerbestand?

1. Navigation: **Inventar** → **Lagerbestände**
2. Teil auswählen
3. Bestandsänderung erfassen
4. Speichern

### Wie erstelle ich einen Bericht?

1. Navigation: **Berichte** → **Neuer Bericht**
2. Berichtstyp auswählen
3. Parameter festlegen
4. Generieren und Exportieren

### Wie integriere ich Grafana Dashboards?

1. Navigation: **Analysen** → **Grafana**
2. Dashboard auswählen
3. URL kopieren
4. In MMS einbetten

---

## 📚 Weitere Ressourcen

### Dokumentation

- [API-Referenz](docs/api-reference/)
- [Entwicklerhandbuch](docs/developer-guide/)
- [Administrationshandbuch](docs/admin-guide/)
- [Moduldokumentation](docs/modules/)

### Support

- **GitHub Issues**: Für Fehlerberichte und Funktionsanfragen
- **Community-Forum**: Für Diskussionen und Erfahrungsaustausch
- **Kommerzieller Support**: Für Enterprise-Kunden

### Schulungen

- **Online-Tutorials**: Videoanleitungen
- **Webinare**: Regelmäßige Schulungssessions
- **Dokumentation**: Umfassende Anleitungen

---

**Vielen Dank, dass Sie MMS verwenden!** 🎉

Für weitere Fragen oder Unterstützung wenden Sie sich bitte an unser Support-Team.

<div align="center">
  <p>Mit ❤️ vom MMS-Team erstellt</p>
  <p>⭐ Bewerten Sie dieses Handbuch, wenn es Ihnen geholfen hat!</p>
</div>