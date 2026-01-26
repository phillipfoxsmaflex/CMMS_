# Implementierungs- und Testplan für Tätigkeitsbezogene Gefährdungsbeurteilung

## Übersicht

Dieses Dokument enthält eine detaillierte Implementierungs- und Testaufgabenliste für die Erweiterung des Work Order Moduls um die Funktion "Tätigkeitsbezogene Gefährdungsbeurteilung".

## Implementierungsaufgaben

### Phase 1: Backend-Implementierung 

#### 1. Datenbankmigration 
- [ ] SQL-Skript für neue Spalte `category` erstellen
- [ ] Migrationstest in Entwicklungsumgebung durchführen
- [ ] Datenbank-Index für Performance erstellen

#### 2. Enum und Entitätserweiterung 
- [ ] `TaskCategory` Enum in `com.grash.model.enums` erstellen
- [ ] `Task` Entität um `category` Feld erweitern
- [ ] Getter/Setter Methoden implementieren
- [ ] Default-Wert `STANDARD` konfigurieren
- [ ] JPA-Annotationen korrekt setzen

#### 3. Repository-Methoden 
- [ ] `TaskRepository` um neue Methoden erweitern:
  - `findByWorkOrderIdAndCategory(Long workOrderId, TaskCategory category)`
  - `findByPreventiveMaintenanceIdAndCategory(Long pmId, TaskCategory category)`
- [ ] Spring Data JPA Query Methods implementieren
- [ ] Repository-Tests erstellen

#### 4. Service-Methoden 
- [ ] `TaskService` um neue Methoden erweitern:
  - `findByWorkOrderAndCategory(Long workOrderId, TaskCategory category)`
  - `findByPreventiveMaintenanceAndCategory(Long pmId, TaskCategory category)`
- [ ] Business-Logik für Kategorie-Handling implementieren
- [ ] Transaktionsmanagement prüfen
- [ ] Service-Tests erstellen

#### 5. Controller-Endpunkte 
- [ ] `TaskController.getByWorkOrder()` um `category` Parameter erweitern
- [ ] Optional Parameter Handling implementieren
- [ ] Swagger-Dokumentation aktualisieren
- [ ] Controller-Tests erstellen
- [ ] Fehlerbehandlung für ungültige Kategorien

#### 6. API-Tests 
- [ ] Unit-Tests für neue Controller-Methoden
- [ ] Integrationstests für API-Endpunkte
- [ ] Performance-Tests für gefilterte Abfragen
- [ ] Fehlerfall-Tests (ungültige Parameter, nicht existierende Kategorien)
- [ ] Rückwärtskompatibilitätstests

### Phase 2: Frontend-Implementierung 

#### 1. Modell-Erweiterung 
- [ ] `TaskCategory` Type in `src/models/owns/tasks.ts` definieren
- [ ] `Task` Interface um `category` Feld erweitern
- [ ] TypeScript-Typen für API-Responses aktualisieren
- [ ] Mock-Daten für Tests erstellen

#### 2. Redux-Slice Anpassung 
- [ ] Neue Action `getTasksByWorkOrderAndCategory` erstellen
- [ ] Reducer für kategorisierte Aufgaben implementieren
- [ ] Selektoren für gefilterte Aufgaben erstellen
- [ ] Loading-States für kategorisierte Abfragen
- [ ] Fehlerbehandlung für API-Aufrufe

#### 3. Neue SafetyTasks-Komponente 
- [ ] `SafetyTasks.tsx` Komponente erstellen
- [ ] SecurityIcon Integration
- [ ] Styling mit rotem Akzent für Sicherheitsaufgaben
- [ ] PropTypes und TypeScript-Typen definieren
- [ ] Storybook-Stories für Komponente erstellen

#### 4. Integration in WorkOrderDetails 
- [ ] Import der neuen Komponente
- [ ] Aufgaben nach Kategorie filtern
- [ ] Bedingte Rendering-Logik implementieren
- [ ] UI-Trennung mit Dividern
- [ ] Responsives Layout prüfen

#### 5. Task-Erstellung anpassen 
- [ ] `SelectTasks` Komponente um Kategorie-Tabs erweitern
- [ ] Kategorie-Parameter in `onSelect` Handler integrieren
- [ ] Standard-Kategorie für neue Aufgaben setzen
- [ ] Checklist-Erstellung mit Kategorie-Unterstützung
- [ ] Validierung für Kategorie-Auswahl

#### 6. UI/UX Anpassungen 
- [ ] Icons für beide Kategorien konfigurieren
- [ ] Farbschema für Sicherheitsaufgaben (rot)
- [ ] Hover-Effekte und Interaktionen
- [ ] Mobile Responsivität prüfen
- [ ] Barrierefreiheit (ARIA-Labels, Kontraste)

#### 7. Internationalisierung 
- [ ] Neue Übersetzungseinträge in `de.json` hinzufügen
- [ ] Übersetzungseinträge in `en.json` hinzufügen
- [ ] Fallback-Übersetzungen prüfen
- [ ] Übersetzungstests durchführen

### Phase 3: Testing 

#### 1. Unit-Tests 
- [ ] Backend: Service- und Repository-Tests
- [ ] Frontend: Komponenten-Tests mit Jest
- [ ] Redux: Action- und Reducer-Tests
- [ ] Utility-Funktionen Tests
- [ ] Mock-Daten Validierung

#### 2. Integrationstests 
- [ ] API-Integrationstests (Backend-Frontend)
- [ ] Redux-Store Integration
- [ ] Datenfluss-Tests
- [ ] Fehlerbehandlungstests
- [ ] Loading-State Tests

#### 3. End-to-End Tests 
- [ ] Cypress-Tests für Benutzerfluss
- [ ] Task-Erstellung mit Kategorie
- [ ] Task-Bearbeitung und Kategorie-Änderung
- [ ] Filterung und Anzeige
- [ ] Mobile Tests

#### 4. Benutzerakzeptanztests 
- [ ] Testplan für UAT erstellen
- [ ] Testfälle dokumentieren
- [ ] Feedback-Mechanismus einrichten
- [ ] Bug-Tracking vorbereiten
- [ ] Testumgebung einrichten


### Phase 4: Deployment 

#### 1. Staging-Bereitstellung 
- [ ] Datenbankmigration in Staging durchführen
- [ ] Backend-Deployment in Staging
- [ ] Frontend-Deployment in Staging
- [ ] Konfiguration prüfen
- [ ] Smoke-Tests durchführen

#### 2. Produktivdaten-Migration
- [ ] Rollback-Plan bereithalten
- [ ] Datenkonsistenz prüfen

#### 3. Produktivsetzung 
- [ ] Blue-Green Deployment vorbereiten
- [ ] Feature-Flag für schrittweise Aktivierung
- [ ] Monitoring-Dashboard konfigurieren
- [ ] Alerting für Fehler einrichten
- [ ] Dokumentation aktualisieren

#### 4. Monitoring und Support 
- [ ] Error-Tracking (Sentry/Loggly) einrichten
- [ ] Performance-Monitoring konfigurieren
- [ ] Benutzerfeedback-Mechanismus
- [ ] Support-Dokumentation erstellen
- [ ] Hotfix-Prozess vorbereiten

## Testkomponenten

### Backend-Tests

#### Unit-Tests
```java
// TaskServiceTest.java
@Test
public void testFindByWorkOrderAndCategory() {
    // Mock Daten vorbereiten
    Task standardTask = new Task();
    standardTask.setCategory(TaskCategory.STANDARD);
    
    Task safetyTask = new Task();
    safetyTask.setCategory(TaskCategory.SAFETY);
    
    when(taskRepository.findByWorkOrderIdAndCategory(1L, TaskCategory.STANDARD))
        .thenReturn(Collections.singletonList(standardTask));
    
    // Test durchführen
    List<Task> result = taskService.findByWorkOrderAndCategory(1L, TaskCategory.STANDARD);
    
    // Assertions
    assertEquals(1, result.size());
    assertEquals(TaskCategory.STANDARD, result.get(0).getCategory());
}
```

#### Integrationstests
```java
// TaskControllerIntegrationTest.java
@Test
public void testGetByWorkOrderWithCategory() throws Exception {
    // Testdaten in Datenbank einfügen
    Task task = new Task();
    task.setCategory(TaskCategory.SAFETY);
    taskRepository.save(task);
    
    // API-Aufruf testen
    mockMvc.perform(get("/tasks/work-order/1?category=SAFETY")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].category").value("SAFETY"));
}
```

### Frontend-Tests

#### Komponenten-Tests
```typescript
// SafetyTasks.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import SafetyTasks from './SafetyTasks';

describe('SafetyTasks Component', () => {
  const mockTasks = [
    {
      id: 1,
      label: 'Sicherheitsaufgabe 1',
      category: 'SAFETY',
      notes: '',
      images: []
    }
  ];
  
  it('should render safety tasks with correct title', () => {
    render(
      <SafetyTasks 
        safetyTasks={mockTasks}
        workOrderId={1}
        handleZoomImage={jest.fn()}
        disabled={false}
      />
    );
    
    expect(screen.getByText('Tätigkeitsbezogene Gefährdungsbeurteilung')).toBeInTheDocument();
    expect(screen.getByText('Sicherheitsaufgabe 1')).toBeInTheDocument();
  });
});
```

#### Redux-Tests
```typescript
// taskSlice.test.ts
describe('task slice', () => {
  it('should handle getTasksByWorkOrderAndCategory', () => {
    const initialState = {
      tasksByWorkOrder: {},
      loadingTasks: {}
    };
    
    const action = {
      type: 'tasks/getTasksByWorkOrder',
      payload: {
        id: 1,
        tasks: [{ id: 1, category: 'SAFETY' }]
      }
    };
    
    const result = reducer(initialState, action);
    
    expect(result.tasksByWorkOrder[1]).toHaveLength(1);
    expect(result.tasksByWorkOrder[1][0].category).toBe('SAFETY');
  });
});
```

### End-to-End Tests

#### Cypress-Tests
```typescript
// workOrderDetails.cy.ts
describe('Work Order Details with Safety Tasks', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/app/work-orders/1');
  });
  
  it('should display both task sections', () => {
    cy.contains('Aufgaben').should('be.visible');
    cy.contains('Tätigkeitsbezogene Gefährdungsbeurteilung').should('be.visible');
  });
  
  it('should allow adding safety tasks', () => {
    cy.get('[data-testid="add-safety-task"]').click();
    cy.get('[data-testid="task-input"]').type('Neue Sicherheitsaufgabe');
    cy.get('[data-testid="save-task"]').click();
    cy.contains('Neue Sicherheitsaufgabe').should('be.visible');
  });
});
```

## Testdaten

### Backend Testdaten
```java
// TestDataFactory.java
public class TaskTestData {
    
    public static Task createStandardTask() {
        Task task = new Task();
        task.setId(1L);
        task.setCategory(TaskCategory.STANDARD);
        task.setValue("OPEN");
        task.setNotes("Standard Aufgabe");
        return task;
    }
    
    public static Task createSafetyTask() {
        Task task = new Task();
        task.setId(2L);
        task.setCategory(TaskCategory.SAFETY);
        task.setValue("OPEN");
        task.setNotes("Sicherheitsaufgabe");
        return task;
    }
    
    public static List<Task> createMixedTasks() {
        return Arrays.asList(createStandardTask(), createSafetyTask());
    }
}
```

### Frontend Testdaten
```typescript
// testData.ts
export const mockTasks: Task[] = [
  {
    id: 1,
    value: 'OPEN',
    notes: 'Standard Aufgabe',
    taskBase: {
      id: 1,
      label: 'Standard Aufgabe 1',
      taskType: 'SUBTASK'
    },
    images: [],
    category: 'STANDARD'
  },
  {
    id: 2,
    value: 'OPEN',
    notes: 'Sicherheitsaufgabe',
    taskBase: {
      id: 2,
      label: 'Sicherheitsaufgabe 1',
      taskType: 'SUBTASK'
    },
    images: [],
    category: 'SAFETY'
  }
];
```

## Testumgebungen

### Entwicklungsumgebung
- **Datenbank**: H2 In-Memory mit Testdaten
- **Backend**: Lokale Spring Boot Instanz
- **Frontend**: React Development Server
- **Tests**: Jest + React Testing Library

### Staging-Umgebung
- **Datenbank**: PostgreSQL mit Testdaten-Snapshot
- **Backend**: Docker-Container
- **Frontend**: NGINX mit Build-Artefakten
- **Tests**: Cypress End-to-End Tests

### Produktion
- **Datenbank**: PostgreSQL Cluster
- **Backend**: Kubernetes Pods
- **Frontend**: CDN-beschleunigte statische Dateien
- **Monitoring**: Prometheus + Grafana

## Risikomanagement

### Identifizierte Risiken

1. **Datenmigration**: Bestehende Aufgaben könnten falsche Kategorie erhalten
   - **Mitigation**: Default-Wert 'STANDARD', Migrationstests, Rollback-Plan

2. **Performance**: Zusätzliche Filterung könnte Abfragen verlangsamen
   - **Mitigation**: Datenbank-Index, Query-Optimierung, Caching

3. **Benutzerakzeptanz**: Neue UI könnte verwirrend sein
   - **Mitigation**: Klare visuelle Trennung, Benutzerdokumentation, Schulungen

4. **Datenkonsistenz**: Aufgaben könnten falscher Kategorie zugeordnet werden
   - **Mitigation**: Validierung, Transaktionsmanagement, Datenprüfungen

### Teststrategie

1. **Unit-Tests**: 100% Code-Coverage für neue Komponenten
2. **Integrationstests**: API- und Datenfluss-Tests
3. **E2E-Tests**: Kritische Benutzerpfade abdecken
4. **Performance-Tests**: Response-Zeiten unter 500ms
5. **Regressionstests**: Bestehende Funktionalität prüfen

### Qualitätskriterien

- **Code-Qualität**: SonarQube A-Rating
- **Testabdeckung**: 80% Gesamt, 100% für neue Komponenten
- **Performance**: API < 500ms, UI < 2s Ladezeit
- **Barrierefreiheit**: WCAG 2.1 AA Konformität
- **Sicherheit**: Keine neuen Sicherheitslücken

## Zeitplan

| Phase | Aufgaben | Geschätzter Aufwand | Startdatum | Enddatum |
|-------|----------|-------------------|------------|----------|
| 1 | Backend-Implementierung | 8-12h | [TT.MM.JJJJ] | [TT.MM.JJJJ] |
| 2 | Frontend-Implementierung | 12-16h | [TT.MM.JJJJ] | [TT.MM.JJJJ] |
| 3 | Testing | 4-8h | [TT.MM.JJJJ] | [TT.MM.JJJJ] |
| 4 | Deployment | 2-4h | [TT.MM.JJJJ] | [TT.MM.JJJJ] |

## Verantwortlichkeiten

| Rolle | Verantwortung |
|-------|--------------|
| Backend-Entwickler | Datenbank, API, Service-Implementierung |
| Frontend-Entwickler | UI-Komponenten, Redux, Internationalisierung |
| QA-Engineer | Testplanung, Testdurchführung, Bug-Tracking |
| DevOps | Deployment, Monitoring, CI/CD-Pipeline |
| Produktmanager | Anforderungen, Priorisierung, Stakeholder-Kommunikation |

## Erfolgskriterien

1. **Funktional**: Beide Aufgaben-Kategorien werden korrekt angezeigt und verwaltet
2. **Benutzerfreundlich**: Intuitive Bedienung ohne zusätzliche Schulung
3. **Performant**: Keine spürbare Verlangsamung der Anwendung
4. **Stabil**: Keine neuen kritischen Bugs in Produktion
5. **Wartbar**: Sauberer Code mit guter Dokumentation

## Dokumentation

- **Technische Dokumentation**: API-Spezifikation, Datenmodell
- **Benutzerdokumentation**: Handbuch-Erweiterung, FAQ
- **Support-Dokumentation**: Fehlerbehebung, bekannte Probleme
- **Architekturdokumentation**: Komponentendiagramm, Datenfluss

## Kontinuierliche Verbesserung

1. **Feedback-Schleife**: Benutzerfeedback sammeln und analysieren
2. **Performance-Monitoring**: Regelmäßige Überprüfung der Abfragezeiten
3. **Nutzungsanalysen**: Tracking der Feature-Nutzung
4. **Iterative Verbesserungen**: Basierend auf Feedback und Daten
5. **Dokumentation aktualisieren**: Bei Änderungen und Erweiterungen

## Anhang: Test-Checklisten

### Backend-Test-Checkliste
- [ ] Datenbankmigration erfolgreich
- [ ] Enum korrekt definiert
- [ ] Entität erweitert und validiert
- [ ] Repository-Methoden implementiert
- [ ] Service-Methoden getestet
- [ ] Controller-Endpunkte funktionieren
- [ ] API-Dokumentation aktualisiert
- [ ] Fehlerbehandlung implementiert
- [ ] Performance-Tests bestanden
- [ ] Sicherheitsprüfungen durchgeführt

### Frontend-Test-Checkliste
- [ ] TypeScript-Typen definiert
- [ ] Redux-Slice angepasst
- [ ] SafetyTasks-Komponente erstellt
- [ ] WorkOrderDetails integriert
- [ ] Task-Erstellung angepasst
- [ ] UI/UX-Anpassungen implementiert
- [ ] Internationalisierung funktioniert
- [ ] Responsives Design getestet
- [ ] Barrierefreiheit geprüft
- [ ] Browser-Kompatibilität getestet

### Integrationstest-Checkliste
- [ ] API-Integration funktioniert
- [ ] Datenfluss korrekt
- [ ] Fehlerbehandlung robust
- [ ] Loading-States angezeigt
- [ ] Caching implementiert
- [ ] Echtzeit-Updates funktionieren
- [ ] Offline-Funktionalität (falls zutreffend)
- [ ] Datenkonsistenz gewährleistet

### Deployment-Checkliste
- [ ] Staging-Umgebung getestet
- [ ] Produktivdaten gesichert
- [ ] Migration erfolgreich
- [ ] Rollback-Plan bereithalten
- [ ] Monitoring eingerichtet
- [ ] Alerting konfiguriert
- [ ] Dokumentation aktualisiert
- [ ] Benutzerkommunikation vorbereitet
- [ ] Support-Team informiert
- [ ] Erfolgskriterien überprüft

Dieses Dokument dient als umfassende Implementierungs- und Testanleitung für die neue Funktion und kann als Grundlage für die Entwicklung und Qualitätssicherung verwendet werden.