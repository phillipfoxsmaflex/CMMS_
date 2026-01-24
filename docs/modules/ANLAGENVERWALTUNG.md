# 📋 Anlagenverwaltung - Modulhandbuch

## 📋 Inhaltsverzeichnis

- [Überblick](#-überblick)
- [Funktionen](#-funktionen)
- [Anlage anlegen](#-anlage-anlegen)
- [Anlagenhierarchie](#-anlagenhierarchie)
- [Anlagendetails](#-anlagendetails)
- [Wartungsverlauf](#-wartungsverlauf)
- [Dokumentation](#-dokumentation)
- [QR-Code Integration](#-qr-code-integration)
- [Ausfallzeiten verwalten](#-ausfallzeiten-verwalten)
- [Zählerstände erfassen](#-zählerstände-erfassen)
- [Berichte & Analysen](#-berichte--analysen)
- [Best Practices](#-best-practices)
- [Fehlerbehebung](#-fehlerbehebung)

---

## 🎯 Überblick

Das Anlagenverwaltung-Modul ist das Herzstück von MMS und ermöglicht die umfassende Verwaltung aller Anlagen, Maschinen und Geräte in Ihrem Unternehmen.

### Zielsetzung

- **Zentralisierte Datenhaltung**: Alle Anlagendaten an einem Ort
- **Effiziente Wartung**: Optimierte Wartungsplanung und -durchführung
- **Kostenkontrolle**: Transparente Kostennachverfolgung
- **Compliance**: Einhaltung von Vorschriften und Normen
- **Dokumentation**: Vollständige Historie und Nachweise

### Modularchitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    Anlagenverwaltung                        │
├─────────────────────────────────────────────────────────────┤
│  • Stammdaten          • Hierarchie                         │
│  • Dokumentation       • Wartungsverlauf                    │
│  • Ausfallzeiten       • Zählerstände                      │
│  • QR-Code Integration • Berichte & Analysen                │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Funktionen

### Stammdatenverwaltung

- **Grunddaten**: Name, Typ, Hersteller, Modell, Seriennummer
- **Technische Daten**: Leistung, Spannung, Maße, Gewicht
- **Finanzielle Daten**: Anschaffungskosten, Restwert, Abschreibung
- **Betriebliche Daten**: Inbetriebnahme, Garantie, Standort
- **Status**: Betriebsbereit, Ausgefallen, Wartung, etc.

### Hierarchische Struktur

- **Eltern-Kind-Beziehungen**: Hauptanlagen mit Unterkomponenten
- **Mehrebenen-Hierarchie**: System → Anlage → Komponente → Teil
- **Abhängigkeiten**: Visualisierung von Abhängigkeiten zwischen Anlagen
- **Gruppierung**: Nach Standort, Typ, Verantwortung

### Dokumentenmanagement

- **Handbücher**: Bedienungsanleitungen, Wartungsanleitungen
- **Zertifikate**: Sicherheitszertifikate, Prüfprotokolle
- **Technische Zeichnungen**: Schaltpläne, Baupläne
- **Garantieunterlagen**: Garantiebedingungen, Rechnungen
- **Fotos & Videos**: Visuelle Dokumentation

### Wartungsverfolgung

- **Vollständiger Verlauf**: Alle Wartungsaktivitäten
- **Arbeitsaufträge**: Verknüpfung mit Arbeitsaufträgen
- **Teileverbrauch**: Dokumentation verwendeter Teile
- **Arbeitszeiten**: Erfasste Arbeitszeiten
- **Kosten**: Wartungskosten pro Anlage

### Ausfallzeitenmanagement

- **Ausfalldokumentation**: Beginn, Ende, Dauer
- **Ausfallgründe**: Kategorisierung von Ausfallursachen
- **MTBF/MTTR**: Berechnung von Zuverlässigkeitskennzahlen
- **Verfügbarkeit**: Berechnung der Anlagenverfügbarkeit
- **Ausfallkosten**: Dokumentation der Ausfallkosten

### Zählerstandsmanagement

- **Zählerdefinition**: Betriebsstunden, Kilometer, Zyklen
- **Ablesungen**: Regelmäßige Erfassung von Zählerständen
- **Trends**: Historische Entwicklung
- **Warnungen**: Schwellenwertüberwachung
- **Integration**: Verknüpfung mit Wartungsplänen

### QR-Code Integration

- **Mobile Identifikation**: Schnelle Anlagenidentifikation
- **Datenzugriff**: Sofortiger Zugriff auf Anlagendaten
- **Arbeitsaufträge**: Schnelle Erstellung von Arbeitsaufträgen
- **Dokumentation**: Einfache Dokumentation vor Ort
- **Offline-Modus**: Daten erfassen ohne Internet

---

## ➕ Anlage anlegen

### Schritt-für-Schritt Anleitung

1. **Navigation**: **Anlagen** → **Neue Anlage**

2. **Grunddaten eingeben**:
   - **Anlagename**: Klare Bezeichnung (z.B. "Hauptpumpe Halle 1")
   - **Anlagentyp**: Auswahl aus Katalog (Pumpe, Motor, etc.)
   - **Hersteller**: Herstellerinformation
   - **Modell**: Modellbezeichnung
   - **Seriennummer**: Eindeutige Identifikationsnummer
   - **Inventarnummer**: Interne Nummer

3. **Technische Daten**:
   - **Leistung**: 5.5 kW
   - **Spannung**: 400V
   - **Drehzahl**: 1450 U/min
   - **Gewicht**: 250 kg
   - **Abmessungen**: 1200x800x600 mm

4. **Betriebliche Daten**:
   - **Inbetriebnahme**: 15.03.2020
   - **Garantieende**: 14.03.2025
   - **Standort**: Halle 1, Bereich A
   - **Verantwortlicher**: Max Mustermann
   - **Kostenzentrum**: Produktion

5. **Finanzielle Daten**:
   - **Anschaffungskosten**: 12.500 €
   - **Restwert**: 2.500 €
   - **Nutzungsdauer**: 10 Jahre
   - **Abschreibungsmethode**: Linear

6. **Status & Klassifizierung**:
   - **Status**: Betriebsbereit
   - **Kritikalität**: Hoch
   - **Kategorie**: Produktionsanlage
   - **Priorität**: 1 (höchste Priorität)

7. **Dokumentation hochladen**:
   - Bedienungsanleitung (PDF)
   - Sicherheitsdatenblatt (PDF)
   - Technische Zeichnung (DWG)
   - Garantiebescheinigung (PDF)

8. **QR-Code generieren**:
   - Automatische Generierung
   - Druckoption
   - Mobile Testfunktion

9. **Speichern & Freigeben**:
   - Speichern
   - Freigabe für andere Benutzer
   - Benachrichtigung senden

### Best Practices für Anlagendaten

- **Konsistente Namenskonvention**: z.B. "[Standort]-[Typ]-[Nummer]"
- **Vollständige Daten**: Alle verfügbaren Felder ausfüllen
- **Aktualität**: Regelmäßige Datenpflege
- **Dokumentation**: Alle relevanten Unterlagen hinterlegen
- **Kategorisierung**: Klare Einordnung in Hierarchie

---

## 📊 Anlagenhierarchie

### Hierarchie aufbauen

1. **Navigation**: **Anlagen** → **Hierarchie**

2. **Hauptanlage erstellen**:
   - Übergeordnete Anlage (z.B. "Produktionslinie 1")
   - Allgemeine Daten
   - Verantwortlicher

3. **Unteranlagen hinzufügen**:
   - Komponenten (z.B. "Hauptmotor")
   - Baugruppen (z.B. "Steuerung")
   - Einzelteile (z.B. "Lager")

4. **Beziehungen definieren**:
   - Eltern-Kind-Verknüpfungen
   - Abhängigkeiten
   - Schnittstellen

### Visualisierung

- **Baumansicht**: Hierarchische Darstellung
- **Netzwerkansicht**: Abhängigkeiten visualisieren
- **Standortansicht**: Räumliche Anordnung
- **3D-Ansicht**: Für komplexe Anlagen (optional)

### Vorteile der Hierarchie

- **Bessere Übersicht**: Klare Struktur
- **Effiziente Wartung**: Gezielte Maßnahmen
- **Kostenanalyse**: Detaillierte Kostenzuordnung
- **Risikomanagement**: Kritikalitätsanalyse

---

## 📋 Anlagendetails

### Detailansicht

1. **Navigation**: **Anlagen** → **Anlagenliste** → **Anlage auswählen**

2. **Übersicht**:
   - Stammdaten
   - Aktueller Status
   - Letzte Wartung
   - Nächste Wartung
   - Ausfallstatistik

3. **Technische Daten**:
   - Spezifikationen
   - Leistungsdaten
   - Betriebsparameter

4. **Dokumentation**:
   - Handbücher
   - Zertifikate
   - Zeichnungen
   - Fotos

5. **Wartungsinformationen**:
   - Letzte Wartungen
   - Geplante Wartungen
   - Wartungskosten
   - Arbeitsaufträge

6. **Ausfallzeiten**:
   - Ausfallhistorie
   - Verfügbarkeit
   - MTBF/MTTR
   - Ausfallkosten

7. **Zählerstände**:
   - Aktuelle Zähler
   - Historische Werte
   - Trends
   - Warnungen

8. **Kosten**:
   - Anschaffungskosten
   - Wartungskosten
   - Betriebskosten
   - Gesamtkosten

---

## 🔧 Wartungsverlauf

### Verlauf einsehen

1. **Navigation**: **Anlagen** → **Anlage auswählen** → **Wartungsverlauf**

2. **Filter anwenden**:
   - Zeitraum
   - Wartungstyp
   - Status
   - Verantwortlicher

3. **Details einsehen**:
   - Arbeitsauftragsnummer
   - Beschreibung
   - Datum und Dauer
   - Durchgeführte Arbeiten
   - Verwendete Teile
   - Arbeitszeiten
   - Kosten
   - Dokumentation

### Wartungsstatistiken

- **Anzahl Wartungen**: Gesamtzahl
- **Durchschnittliche Dauer**: Stunden pro Wartung
- **Kosten pro Wartung**: € pro Wartung
- **Häufigste Probleme**: Problemkategorien
- **Verfügbarkeit**: % Verfügbarkeit

---

## 📁 Dokumentation

### Dokumentenmanagement

1. **Navigation**: **Anlagen** → **Anlage auswählen** → **Dokumentation**

2. **Dokumente hochladen**:
   - Datei auswählen
   - Kategorisierung
   - Versionierung
   - Freigabe

3. **Dokumente verwalten**:
   - Versionen
   - Zugriffsrechte
   - Ablaufdaten
   - Benachrichtigungen

4. **Dokumentensuche**:
   - Volltextsuche
   - Filter
   - Kategorien

### Dokumententypen

- **Technische Dokumentation**: Handbücher, Zeichnungen
- **Sicherheitsdokumente**: Zertifikate, Prüfprotokolle
- **Finanzielle Dokumente**: Rechnungen, Garantien
- **Betriebliche Dokumente**: Arbeitsanweisungen, Checklisten
- **Multimedia**: Fotos, Videos, 3D-Modelle

---

## 📱 QR-Code Integration

### QR-Code generieren

1. **Navigation**: **Anlagen** → **Anlage auswählen** → **QR-Code**

2. **QR-Code erstellen**:
   - Automatische Generierung
   - Anpassung (Farbe, Größe)
   - Testfunktion

3. **QR-Code drucken**:
   - Etikettenformat
   - Druckoptionen
   - Batch-Druck

### Mobile Nutzung

1. **App öffnen**: MMS Mobile App

2. **QR-Code scannen**:
   - Kamera aktivieren
   - Code scannen
   - Daten abrufen

3. **Funktionen vor Ort**:
   - Anlagendaten einsehen
   - Arbeitsauftrag erstellen
   - Wartung dokumentieren
   - Ausfall melden
   - Zählerstand erfassen
   - Offline-Daten erfassen

### Vorteile

- **Schnelle Identifikation**: Keine manuelle Suche
- **Datenzugriff**: Sofortige Informationen
- **Effizienz**: Zeitersparnis
- **Genauigkeit**: Reduzierte Fehler
- **Mobile Dokumentation**: Vor-Ort-Erfassung

---

## ⏱️ Ausfallzeiten verwalten

### Ausfall dokumentieren

1. **Navigation**: **Anlagen** → **Anlage auswählen** → **Ausfallzeiten** → **Neuer Ausfall**

2. **Ausfalldaten eingeben**:
   - **Ausfallbeginn**: Datum und Uhrzeit
   - **Ausfallende**: Datum und Uhrzeit
   - **Ausfalldauer**: Automatische Berechnung
   - **Ausfallgrund**: Auswahl aus Katalog
   - **Beschreibung**: Detaillierte Beschreibung
   - **Verantwortlicher**: Zuständiger Techniker
   - **Maßnahmen**: Durchgeführte Reparaturen

3. **Kosten erfassen**:
   - **Arbeitskosten**: Technikerstunden
   - **Materialkosten**: Ersatzteile
   - **Produktionsausfall**: Opportunitätskosten
   - **Gesamtkosten**: Summe aller Kosten

4. **Dokumentation**:
   - Fotos
   - Reparaturprotokolle
   - Ersatzteillisten
   - Arbeitszeiten

### Ausfallanalyse

1. **Navigation**: **Anlagen** → **Anlage auswählen** → **Ausfallzeiten** → **Analyse**

2. **Kennzahlen**:
   - **MTBF** (Mean Time Between Failures)
   - **MTTR** (Mean Time To Repair)
   - **Verfügbarkeit** (%)
   - **Ausfallhäufigkeit** (Anzahl/Jahr)
   - **Durchschnittliche Ausfalldauer**

3. **Trends**:
   - Historische Entwicklung
   - Saisonale Muster
   - Lebenszyklusanalyse

4. **Ursachenanalyse**:
   - Häufigste Ausfallgründe
   - Kritische Komponenten
   - Verbesserungspotenziale

---

## 📊 Zählerstände erfassen

### Zähler definieren

1. **Navigation**: **Anlagen** → **Anlage auswählen** → **Zählerstände** → **Neuer Zähler**

2. **Zählerdaten eingeben**:
   - **Zählername**: Betriebsstunden, Kilometer, etc.
   - **Einheit**: Stunden, km, Zyklen
   - **Startwert**: Anfangswert
   - **Maximalwert**: Optional
   - **Warnschwelle**: Schwellenwert für Warnung
   - **Update-Frequenz**: Manuell/Automatisch

### Zählerstände erfassen

1. **Navigation**: **Anlagen** → **Anlage auswählen** → **Zählerstände** → **Neue Ablesung**

2. **Ablesung eingeben**:
   - **Datum/Uhrzeit**: Ablesedatum
   - **Wert**: Aktueller Zählerstand
   - **Benutzer**: Erfasser
   - **Bemerkungen**: Optional

3. **Automatische Erfassung**:
   - IoT-Integration
   - Sensoren
   - API-Schnittstelle

### Zählerstandsanalyse

1. **Navigation**: **Anlagen** → **Anlage auswählen** → **Zählerstände** → **Analyse**

2. **Visualisierung**:
   - **Zeitreihen**: Historische Entwicklung
   - **Trends**: Langfristige Muster
   - **Vergleiche**: Soll/Ist-Vergleich
   - **Warnungen**: Schwellenwertüberschreitungen

3. **Integration**:
   - **Wartungspläne**: Zählerbasierte Wartung
   - **Arbeitsaufträge**: Automatische Erstellung
   - **Berichte**: Zählerstandsberichte

---

## 📈 Berichte & Analysen

### Standardberichte

1. **Navigation**: **Anlagen** → **Berichte**

2. **Berichtstypen**:
   - **Anlagenübersicht**: Alle Anlagen mit Status
   - **Wartungshistorie**: Alle Wartungsaktivitäten
   - **Ausfallstatistik**: Ausfallzeiten und Kosten
   - **Kostenanalyse**: Wartungskosten pro Anlage
   - **Verfügbarkeitsbericht**: Verfügbarkeitskennzahlen

3. **Parameter**:
   - Zeitraum
   - Anlagenfilter
   - Exportformat (PDF, Excel, CSV)

### Benutzerdefinierte Berichte

1. **Navigation**: **Anlagen** → **Berichte** → **Benutzerdefiniert**

2. **Bericht erstellen**:
   - Felder auswählen
   - Filter definieren
   - Sortierung festlegen
   - Visualisierung wählen

3. **Speichern & Exportieren**:
   - Bericht speichern
   - Exportformat wählen
   - Geplanten Export einrichten

### Grafana Integration

1. **Navigation**: **Anlagen** → **Analysen** → **Grafana**

2. **Dashboard auswählen**:
   - **Asset Health & Reliability**: Verfügbarkeit, MTBF, MTTR
   - **Maintenance Performance**: Wartungseffizienz
   - **Cost Analysis**: Kostenentwicklung
   - **Downtime Analysis**: Ausfallzeitenanalyse

3. **Anpassung**:
   - Filter setzen
   - Zeitraum wählen
   - Visualisierung anpassen

---

## 🎯 Best Practices

### Datenqualität

- **Vollständigkeit**: Alle Felder ausfüllen
- **Aktualität**: Regelmäßige Datenpflege
- **Konsistenz**: Einheitliche Namenskonventionen
- **Genauigkeit**: Korrekte technische Daten
- **Dokumentation**: Vollständige Unterlagen

### Wartungsstrategie

- **Präventive Wartung**: Regelmäßige Inspektionen
- **Zustandsbasierte Wartung**: Sensoren und Zähler
- **Reaktive Wartung**: Schnelle Reaktion auf Ausfälle
- **Predictive Maintenance**: Vorhersage von Ausfällen
- **Optimierung**: Kontinuierliche Verbesserung

### Kostenmanagement

- **Kostentransparenz**: Detaillierte Kostenerfassung
- **Budgetplanung**: Langfristige Planung
- **Kostenanalyse**: Identifikation von Einsparpotenzialen
- **Investitionsplanung**: Lebenszykluskosten
- **Benchmarking**: Vergleich mit Branchenstandards

### Compliance

- **Dokumentation**: Vollständige Nachweise
- **Prüfprotokolle**: Regelmäßige Prüfungen
- **Sicherheit**: Einhaltung von Sicherheitsvorschriften
- **Umwelt**: Umweltauflagen
- **Normen**: ISO, DIN, etc.

---

## 🔧 Fehlerbehebung

### Häufige Probleme

#### Anlage wird nicht angezeigt

**Ursache**: Filtereinstellungen oder Berechtigungen

**Lösung**:
1. Filter zurücksetzen
2. Berechtigungen prüfen
3. Cache aktualisieren

#### QR-Code funktioniert nicht

**Ursache**: Beschädigter Code oder falsche Zuordnung

**Lösung**:
1. QR-Code neu generieren
2. Zuordnung prüfen
3. Mobile App aktualisieren

#### Ausfallzeiten werden nicht berechnet

**Ursache**: Falsche Zeitangaben oder Berechtigungen

**Lösung**:
1. Zeitangaben prüfen
2. Berechtigungen überprüfen
3. Systemzeit synchronisieren

#### Zählerstände werden nicht aktualisiert

**Ursache**: Manuelle Eingabe fehlt oder Sensorproblem

**Lösung**:
1. Manuelle Eingabe prüfen
2. Sensorverbindung testen
3. API-Integration überprüfen

### Support kontaktieren

1. **Navigation**: **Hilfe** → **Support**

2. **Support-Ticket erstellen**:
   - Problem beschreiben
   - Screenshots anhängen
   - Log-Dateien bereithalten
   - Anlagendaten angeben

3. **Priorität festlegen**:
   - Niedrig: Allgemeine Fragen
   - Mittel: Funktionsprobleme
   - Hoch: Kritische Fehler
   - Kritisch: Systemausfall

---

**Vielen Dank für die Nutzung des Anlagenverwaltung-Moduls!** 🎉

Für weitere Fragen oder Unterstützung wenden Sie sich bitte an unser Support-Team oder konsultieren Sie die [umfassende Dokumentation](BENUTZERHANDBUCH.md).

<div align="center">
  <p>Mit ❤️ vom MMS-Team erstellt</p>
  <p>⭐ Bewerten Sie dieses Modulhandbuch, wenn es Ihnen geholfen hat!</p>
</div>