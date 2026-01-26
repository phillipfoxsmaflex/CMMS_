# Konzept zur Erweiterung des Work Order Moduls für Tätigkeitsbezogene Gefährdungsbeurteilung

## Zielsetzung

Erweiterung des Work Order Moduls um eine zweite Aufgaben/Checklisten-Sektion mit dem Titel "Tätigkeitsbezogene Gefährdungsbeurteilung" zur besseren Trennung von regulären Aufgaben und sicherheitsrelevanten Aufgaben.

## Aktuelle Situation

- Aktuell gibt es nur eine Aufgaben-Sektion mit dem Titel "Aufgaben"
- Alle Aufgaben und Checklisten werden unter diesem einen Header angezeigt
- Keine Möglichkeit zur kategorialen Trennung von Aufgaben

## Anforderungen

1. **Zweite Aufgaben-Sektion**: Ein neuer Bereich mit dem Titel "Tätigkeitsbezogene Gefährdungsbeurteilung"
2. **Gleiche Funktionalität**: Die neue Sektion soll die gleiche Funktionalität wie die bestehende Aufgaben-Sektion bieten:
   - Aufgaben hinzufügen/entfernen
   - Checklisten hinzufügen/entfernen
   - Notizen und Bilder zu Aufgaben
   - Aufgabenstatus verwalten
3. **Visuelle Trennung**: Klare visuelle Trennung zwischen den beiden Sektionen
4. **Datenmodell**: Trennung der Daten, damit die Aufgaben den richtigen Sektionen zugeordnet werden können

## Technische Umsetzung

### 1. Datenmodell-Erweiterung

#### Backend (Java/Spring Boot)

**Task-Entität Erweiterung:**
```java
// Neue Enum für Task-Kategorie
public enum TaskCategory {
    STANDARD,        // Aktuelle Aufgaben
    SAFETY           // Tätigkeitsbezogene Gefährdungsbeurteilung
}

// Erweiterung der Task-Entität
@Entity
public class Task {
    // ... bestehende Felder ...
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, default = "STANDARD")
    private TaskCategory category = TaskCategory.STANDARD;
    
    // Getter und Setter
}
```

**API-Erweiterung:**
- Neue Endpunkte oder Parameter für die Filterung nach Kategorie
- `GET /api/tasks?workOrderId={id}&category={category}`
- `POST /api/tasks` mit category-Parameter
- `PATCH /api/tasks/{id}` mit category-Parameter

#### Frontend (TypeScript/React)

**Task-Modell Erweiterung:**
```typescript
// src/models/owns/tasks.ts
export type TaskCategory = 'STANDARD' | 'SAFETY';

export interface Task {
    id: number;
    value?: string | number;
    notes: string;
    taskBase: TaskBase;
    images: File[];
    category?: TaskCategory; // Neu
}
```

### 2. Backend-Implementierung

**TaskController.java:**
```java
@GetMapping("/work-order/{workOrderId}")
public List<TaskShowDTO> getTasksByWorkOrder(@PathVariable Long workOrderId, 
                                           @RequestParam(required = false) TaskCategory category) {
    if (category != null) {
        return taskService.getTasksByWorkOrderAndCategory(workOrderId, category);
    }
    return taskService.getTasksByWorkOrder(workOrderId);
}
```

**TaskService.java:**
```java
public List<TaskShowDTO> getTasksByWorkOrderAndCategory(Long workOrderId, TaskCategory category) {
    return taskRepository.findByWorkOrderIdAndCategory(workOrderId, category)
            .stream()
            .map(taskMapper::toShowDTO)
            .collect(Collectors.toList());
}
```

### 3. Frontend-Implementierung

**Neue Komponente: SafetyTasks.tsx**
```typescript
// src/content/own/WorkOrders/Details/SafetyTasks.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent, Divider } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import Tasks from './Tasks';

interface SafetyTasksProps {
  safetyTasks: Task[];
  workOrderId: number;
  handleZoomImage: (images: string[], image: string) => void;
  disabled: boolean;
}

export default function SafetyTasks({ safetyTasks, workOrderId, handleZoomImage, disabled }: SafetyTasksProps) {
  const { t } = useTranslation();
  
  return (
    <Card>
      <CardHeader 
        title={t('safety_task_assessment')} 
        avatar={<SecurityIcon color="error" />} 
      />
      <Divider />
      <CardContent>
        <Tasks
          tasksProps={safetyTasks}
          workOrderId={workOrderId}
          handleZoomImage={handleZoomImage}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}
```

**Anpassung WorkOrderDetails.tsx:**
```typescript
// Import der neuen Komponente
import SafetyTasks from './SafetyTasks';

// In der Render-Methode
{!!standardTasks.length && (
  <Box>
    <Divider sx={{ mt: 2 }} />
    <Tasks
      tasksProps={standardTasks}
      workOrderId={workOrder?.id}
      handleZoomImage={setImageState}
      disabled={!hasEditPermission(PermissionEntity.WORK_ORDERS, workOrder)}
    />
  </Box>
)}

{!!safetyTasks.length && (
  <Box>
    <Divider sx={{ mt: 2 }} />
    <SafetyTasks
      safetyTasks={safetyTasks}
      workOrderId={workOrder?.id}
      handleZoomImage={setImageState}
      disabled={!hasEditPermission(PermissionEntity.WORK_ORDERS, workOrder)}
    />
  </Box>
)}
```

### 4. Datenfluss und API-Integration

**Datenaufteilung in Redux:**
```typescript
// In WorkOrderDetails.tsx
const [standardTasks, setStandardTasks] = useState<Task[]>([]);
const [safetyTasks, setSafetyTasks] = useState<Task[]>([]);

useEffect(() => {
  // Standard Aufgaben laden
  dispatch(getTasksByWorkOrder(workOrder.id, 'STANDARD'))
    .then((tasks) => setStandardTasks(tasks));
  
  // Sicherheitsaufgaben laden
  dispatch(getTasksByWorkOrder(workOrder.id, 'SAFETY'))
    .then((tasks) => setSafetyTasks(tasks));
}, [workOrder.id]);
```

**Redux Slice Anpassung:**
```typescript
// src/slices/task.ts
export const getTasksByWorkOrder = (workOrderId: number, category?: TaskCategory) => {
  return async (dispatch: Dispatch) => {
    try {
      const response = await api.get(`/tasks/work-order/${workOrderId}`, {
        params: category ? { category } : {}
      });
      return response.data;
    } catch (error) {
      handleError(dispatch, error);
      throw error;
    }
  };
};
```

### 5. UI/UX Überlegungen

**Visuelle Unterschiede:**
- **Standard Aufgaben**: Blaues Icon (TaskAltTwoToneIcon)
- **Sicherheitsaufgaben**: Rotes Icon (SecurityIcon) mit Warnfarbe
- **Trennung**: Klare Divider zwischen den Sektionen
- **Labels**: Deutsche Übersetzungen für beide Sektionen

**Benutzerfreundlichkeit:**
- Gleiche Bedienung wie bestehende Aufgaben
- Keine zusätzliche Komplexität für Benutzer
- Klare visuelle Hierarchie

### 6. Internationalisierung

**Neue Übersetzungseinträge:**
```json
// src/i18n/translations/de.json
{
  "safety_task_assessment": "Tätigkeitsbezogene Gefährdungsbeurteilung",
  "standard_tasks": "Aufgaben",
  "safety_tasks": "Sicherheitsaufgaben"
}

// src/i18n/translations/en.json
{
  "safety_task_assessment": "Activity-based Risk Assessment",
  "standard_tasks": "Tasks",
  "safety_tasks": "Safety Tasks"
}
```

### 7. Datenbankmigration

**SQL Migration:**
```sql
ALTER TABLE task ADD COLUMN category VARCHAR(20) NOT NULL DEFAULT 'STANDARD';

-- Index für bessere Performance
CREATE INDEX idx_task_category ON task(category);
```

### 8. Validierung und Fehlerbehandlung

**Frontend-Validierung:**
- Sicherstellen, dass beide Sektionen unabhängig validiert werden
- Getrennte Fehlerbehandlung für Standard- und Sicherheitsaufgaben

**Backend-Validierung:**
- Validierung der Kategorie bei Erstellung/Bearbeitung
- Standardwert 'STANDARD' für bestehende Aufgaben

## Implementierungsplan

### Phase 1: Backend-Implementierung
1. Datenbankmigration für neue Spalte
2. Enum und Entitätserweiterung
3. Repository-Methoden
4. Service-Methoden
5. Controller-Endpunkte
6. API-Tests

### Phase 2: Frontend-Implementierung
1. Modell-Erweiterung
2. Redux-Slice Anpassung
3. Neue SafetyTasks-Komponente
4. Integration in WorkOrderDetails
5. UI/UX Anpassungen
6. Internationalisierung

### Phase 3: Testing
1. Unit-Tests für neue Komponenten
2. Integrationstests
3. End-to-End Tests
4. Benutzerakzeptanztests

### Phase 4: Deployment
1. Staging-Umgebung
2. Produktivsetzung
3. Monitoring
4. Benutzerfeedback

## Risiken und Herausforderungen

1. **Datenmigration**: Bestehende Aufgaben müssen korrekt migriert werden
2. **Performance**: Zusätzliche API-Aufrufe könnten Performance beeinflussen
3. **Benutzerakzeptanz**: Neue Funktionalität muss intuitiv sein
4. **Datenkonsistenz**: Trennung der Aufgaben muss konsistent sein

## Vorteile

1. **Bessere Organisation**: Klare Trennung von Aufgabenarten
2. **Sicherheitsfokus**: Hervorhebung von sicherheitsrelevanten Aufgaben
3. **Compliance**: Unterstützung von Arbeitssicherheitsstandards
4. **Flexibilität**: Erweiterbar für weitere Kategorien
5. **Benutzerfreundlichkeit**: Keine zusätzliche Komplexität

## Abhängigkeiten

- Keine externen Abhängigkeiten
- Nutzung bestehender Komponenten und Patterns
- Kompatibel mit aktuellem Tech-Stack

## Offene Fragen

1. Soll es eine separate Berechtigung für Sicherheitsaufgaben geben?
Antwort: nein
2. Soll die Fertigstellung von Sicherheitsaufgaben obligatorisch sein?
Antwort: nein
3. Benötigen wir spezielle Berichte für Sicherheitsaufgaben?
Antwort: nein
4. Soll es eine separate Historie für Sicherheitsaufgaben geben?
Antwort: nein

## Nächste Schritte

1. **Konzeptdiskussion**: Diskussion des Konzepts mit dem Team
2. **Anforderungsklärung**: Klärung offener Fragen
3. **Priorisierung**: Priorisierung der Implementierung
4. **Technische Spezifikation**: Erstellung detaillierter technischer Spezifikationen
5. **Implementierungsbeginn**: Start mit Backend-Implementierung
6. **Iterative Entwicklung**: Schrittweise Implementierung mit Feedbackschleifen

## Technische Details für Entwickler

### API-Endpunkte
- `GET /api/tasks/work-order/{id}` - Alle Aufgaben
- `GET /api/tasks/work-order/{id}?category=STANDARD` - Standard-Aufgaben
- `GET /api/tasks/work-order/{id}?category=SAFETY` - Sicherheitsaufgaben
- `PATCH /api/tasks/work-order/{id}` - Aufgaben aktualisieren (mit Kategorie)

### Datenbank
- **Tabelle**: `task`
- **Neue Spalte**: `category VARCHAR(20) NOT NULL DEFAULT 'STANDARD'`
- **Index**: `idx_task_category` für Performance

### Frontend-Komponenten
- **Neu**: `SafetyTasks.tsx`
- **Angepasst**: `WorkOrderDetails.tsx`, `Tasks.tsx`, `SelectTasks/index.tsx`
- **Modelle**: `Task` Interface, `TaskCategory` Type

### Rückwärtskompatibilität
- Bestehende Aufgaben erhalten automatisch Kategorie 'STANDARD'
- Bestehende API-Aufrufe funktionieren weiterhin
- Bestehende UI-Komponenten bleiben funktionstüchtig
- Keine Breaking Changes für bestehende Funktionalität
