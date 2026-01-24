# Konzept: Gefährdungsbeurteilung und Genehmigungsworkflow für WorkOrders

## Übersicht

Dieses Konzept beschreibt die Erweiterung des WorkOrder-Moduls um eine tätigkeitsbezogene Gefährdungsbeurteilung nach TRBS 1112 Anhang 2 sowie einen Genehmigungsworkflow durch Abteilungsleiter.

## 1. Anforderungen

### 1.1 Funktionale Anforderungen
- **Toggle-Button** in WorkOrder zur Aktivierung der Gefährdungsbeurteilung (analog zu "Unterschrift notwendig")
- **Gefährdungsbeurteilungsformular** nach TRBS 1112 Anhang 2
- **Genehmigungsworkflow** für WorkOrders mit Gefährdungsbeurteilung
- **Statusverfolgung** für den Genehmigungsprozess

### 1.2 TRBS 1112 Anhang 2 Anforderungen
Die Gefährdungsbeurteilung muss folgende Aspekte abdecken:
- Identifikation von Gefährdungen (mechanisch, elektrisch, thermisch, chemisch, etc.)
- Risikoeinschätzung (Eintrittswahrscheinlichkeit × Schadensausmaß)
- Festlegung von Schutzmaßnahmen
- Dokumentation und Freigabe

---

## 2. Datenmodell-Erweiterungen

### 2.1 WorkOrderBase Entity (Backend)

**Pfad:** `/api/src/main/java/com/grash/model/abstracts/WorkOrderBase.java`

**Neue Felder:**
```java
// Flag für Gefährdungsbeurteilung erforderlich
private boolean requiresRiskAssessment = false;
```

### 2.2 WorkOrder Entity (Backend)

**Pfad:** `/api/src/main/java/com/grash/model/WorkOrder.java`

**Neue Felder:**
```java
// Genehmigungsstatus für die WorkOrder
private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

// Abteilungsleiter, der genehmigen muss (optional, falls spezifischer Approver)
@ManyToOne(fetch = FetchType.LAZY)
@Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED, withModifiedFlag = true)
private OwnUser approver;

// Zeitpunkt der Genehmigung/Ablehnung
private Date approvalDate;

// Kommentar zur Genehmigung/Ablehnung
private String approvalComment;
```

**Neue Methoden:**
```java
@JsonIgnore
public boolean needsApproval() {
    return this.requiresRiskAssessment && 
           (this.approvalStatus == null || this.approvalStatus == ApprovalStatus.PENDING);
}

@JsonIgnore
public boolean canBeStarted() {
    return !this.requiresRiskAssessment || 
           this.approvalStatus == ApprovalStatus.APPROVED;
}
```

### 2.3 Neue Entity: RiskAssessment

**Pfad:** `/api/src/main/java/com/grash/model/RiskAssessment.java`

```java
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Audited
public class RiskAssessment extends CompanyAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    // Referenz zur WorkOrder
    @OneToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private WorkOrder workOrder;

    // Beschreibung der Tätigkeit
    @Column(length = 2000)
    @NotNull
    private String activityDescription;

    // JSON-Feld für strukturierte Gefährdungserfassung
    @Column(length = 10000)
    private String hazardsJson; // Strukturierte Daten als JSON

    // Gesamtrisikobewertung
    private RiskLevel overallRiskLevel;

    // Schutzmaßnahmen
    @Column(length = 5000)
    @NotNull
    private String protectiveMeasures;

    // Zusätzliche Hinweise
    @Column(length = 2000)
    private String additionalNotes;

    // Ersteller der Beurteilung
    @ManyToOne(fetch = FetchType.LAZY)
    private OwnUser assessedBy;

    // Datum der Beurteilung
    private Date assessedOn;

    // Status der Beurteilung
    private boolean completed = false;
}
```

### 2.4 Neue Entity: Hazard (Gefährdung)

**Pfad:** `/api/src/main/java/com/grash/model/Hazard.java`

```java
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hazard {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private RiskAssessment riskAssessment;

    // Art der Gefährdung
    @NotNull
    private HazardType type;

    // Beschreibung der spezifischen Gefährdung
    @Column(length = 1000)
    @NotNull
    private String description;

    // Wahrscheinlichkeit (1-5)
    @NotNull
    private Integer probability;

    // Schweregrad (1-5)
    @NotNull
    private Integer severity;

    // Berechnetes Risiko (probability × severity)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public Integer getRiskScore() {
        return probability * severity;
    }

    // Zugeordnetes Risikolevel
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public RiskLevel getRiskLevel() {
        int score = getRiskScore();
        if (score <= 4) return RiskLevel.LOW;
        if (score <= 9) return RiskLevel.MEDIUM;
        if (score <= 16) return RiskLevel.HIGH;
        return RiskLevel.CRITICAL;
    }

    // Geplante Schutzmaßnahmen für diese Gefährdung
    @Column(length = 1000)
    private String specificProtectiveMeasures;
}
```

### 2.5 Neue Enums

**Pfad:** `/api/src/main/java/com/grash/model/enums/HazardType.java`

```java
public enum HazardType {
    MECHANICAL,      // Mechanische Gefährdungen
    ELECTRICAL,      // Elektrische Gefährdungen
    THERMAL,         // Thermische Gefährdungen (Hitze/Kälte)
    CHEMICAL,        // Chemische Gefährdungen
    BIOLOGICAL,      // Biologische Gefährdungen
    ERGONOMIC,       // Ergonomische Gefährdungen
    PSYCHOSOCIAL,    // Psychische Gefährdungen
    FIRE_EXPLOSION,  // Brand- und Explosionsgefährdungen
    NOISE_VIBRATION, // Lärm und Vibration
    RADIATION,       // Strahlung
    FALL_STUMBLE,    // Sturz, Stolpern
    OTHER            // Sonstige
}
```

**Pfad:** `/api/src/main/java/com/grash/model/enums/RiskLevel.java`

```java
public enum RiskLevel {
    LOW,       // Geringes Risiko (1-4 Punkte)
    MEDIUM,    // Mittleres Risiko (5-9 Punkte)
    HIGH,      // Hohes Risiko (10-16 Punkte)
    CRITICAL   // Kritisches Risiko (17-25 Punkte)
}
```

---

## 3. Backend-Implementierung

### 3.1 DTOs

**WorkOrderPatchDTO** erweitern:
```java
// In /api/src/main/java/com/grash/dto/WorkOrderPatchDTO.java
private boolean requiresRiskAssessment;
```

**WorkOrderPostDTO** erweitern:
```java
// In /api/src/main/java/com/grash/dto/workOrder/WorkOrderPostDTO.java
private boolean requiresRiskAssessment;
private Long approverId; // Optional: spezifischer Approver
```

**Neue DTOs:**
- `RiskAssessmentPostDTO`
- `RiskAssessmentShowDTO`
- `RiskAssessmentPatchDTO`
- `HazardDTO`

### 3.2 Controller-Erweiterungen

**WorkOrderController** erweitern:

**Pfad:** `/api/src/main/java/com/grash/controller/WorkOrderController.java`

**Neue Endpoints:**

```java
// Genehmigung einer WorkOrder
@PostMapping("/{id}/approve")
@PreAuthorize("hasRole('ROLE_CLIENT')")
@ApiResponses(...)
public WorkOrderShowDTO approveWorkOrder(
    @PathVariable("id") Long id,
    @RequestParam(value = "approved") boolean approved,
    @RequestParam(value = "comment", required = false) String comment,
    HttpServletRequest req
) {
    OwnUser user = userService.whoami(req);
    Optional<WorkOrder> optionalWorkOrder = workOrderService.findById(id);

    if (optionalWorkOrder.isPresent()) {
        WorkOrder workOrder = optionalWorkOrder.get();
        
        // Prüfen, ob Benutzer Genehmigungsberechtigung hat
        if (!hasApprovalPermission(user, workOrder)) {
            throw new CustomException("Keine Berechtigung zur Genehmigung", HttpStatus.FORBIDDEN);
        }

        // Prüfen, ob Gefährdungsbeurteilung vorhanden
        if (workOrder.isRequiresRiskAssessment() && !hasCompletedRiskAssessment(workOrder)) {
            throw new CustomException("Gefährdungsbeurteilung muss erst abgeschlossen werden", 
                                    HttpStatus.NOT_ACCEPTABLE);
        }

        // Status setzen
        workOrder.setApprovalStatus(approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED);
        workOrder.setApprovalDate(new Date());
        workOrder.setApprovalComment(comment);
        
        WorkOrder savedWorkOrder = workOrderService.save(workOrder);
        
        // Benachrichtigungen versenden
        notifyWorkOrderApprovalStatus(savedWorkOrder, user);
        
        return workOrderMapper.toShowDto(savedWorkOrder);
    } else {
        throw new CustomException("WorkOrder nicht gefunden", HttpStatus.NOT_FOUND);
    }
}

// Gefährdungsbeurteilung abrufen
@GetMapping("/{id}/risk-assessment")
@PreAuthorize("hasRole('ROLE_CLIENT')")
public RiskAssessmentShowDTO getRiskAssessment(
    @PathVariable("id") Long id,
    HttpServletRequest req
) {
    // Implementation
}

// Status-Überprüfung vor Start
@GetMapping("/{id}/can-start")
@PreAuthorize("hasRole('ROLE_CLIENT')")
public Map<String, Object> canStartWorkOrder(
    @PathVariable("id") Long id,
    HttpServletRequest req
) {
    WorkOrder workOrder = workOrderService.findById(id)
        .orElseThrow(() -> new CustomException("WorkOrder nicht gefunden", HttpStatus.NOT_FOUND));
    
    Map<String, Object> result = new HashMap<>();
    result.put("canStart", workOrder.canBeStarted());
    result.put("needsApproval", workOrder.needsApproval());
    result.put("needsRiskAssessment", workOrder.isRequiresRiskAssessment() && 
                                      !hasCompletedRiskAssessment(workOrder));
    result.put("approvalStatus", workOrder.getApprovalStatus());
    
    return result;
}
```

**Neue Controller:**

**RiskAssessmentController:**
```java
@RestController
@RequestMapping("/api/risk-assessments")
@Api(tags = "riskAssessments")
public class RiskAssessmentController {
    
    @PostMapping("/work-order/{workOrderId}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public RiskAssessmentShowDTO createRiskAssessment(@PathVariable Long workOrderId, 
                                                      @RequestBody RiskAssessmentPostDTO dto,
                                                      HttpServletRequest req) {
        // Gefährdungsbeurteilung erstellen
    }
    
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public RiskAssessmentShowDTO updateRiskAssessment(@PathVariable Long id,
                                                      @RequestBody RiskAssessmentPatchDTO dto,
                                                      HttpServletRequest req) {
        // Gefährdungsbeurteilung aktualisieren
    }
    
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public RiskAssessmentShowDTO completeRiskAssessment(@PathVariable Long id,
                                                        HttpServletRequest req) {
        // Gefährdungsbeurteilung abschließen
    }
    
    @PostMapping("/{id}/hazards")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public HazardDTO addHazard(@PathVariable Long id,
                               @RequestBody HazardDTO hazardDto,
                               HttpServletRequest req) {
        // Gefährdung hinzufügen
    }
}
```

### 3.3 Service-Layer

**WorkOrderService** erweitern:
- `hasCompletedRiskAssessment(WorkOrder workOrder)`
- `canBeApprovedBy(WorkOrder workOrder, OwnUser user)`
- `notifyPendingApproval(WorkOrder workOrder)`

**Neue Services:**
- `RiskAssessmentService`
- `HazardService`

### 3.4 Repository-Layer

**Neue Repositories:**
- `RiskAssessmentRepository extends JpaRepository<RiskAssessment, Long>`
- `HazardRepository extends JpaRepository<Hazard, Long>`

**Wichtige Queries:**
```java
public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, Long> {
    Optional<RiskAssessment> findByWorkOrderId(Long workOrderId);
    List<RiskAssessment> findByAssessedBy(OwnUser user);
    List<RiskAssessment> findByCompletedFalse();
}

public interface HazardRepository extends JpaRepository<Hazard, Long> {
    List<Hazard> findByRiskAssessmentId(Long riskAssessmentId);
    List<Hazard> findByRiskAssessmentIdAndRiskLevelIn(Long riskAssessmentId, 
                                                       List<RiskLevel> riskLevels);
}
```

### 3.5 Berechtigungssystem

**Permission-Erweiterung:**

Option 1: Neue Permission für Genehmigungen:
```java
// In PermissionEntity enum
APPROVE_WORK_ORDERS
```

Option 2: Bestehende Permission nutzen:
- Nutzer mit `EDIT_OTHER_PERMISSIONS` für `WORK_ORDERS` können genehmigen
- Alternativ: Nur Nutzer mit bestimmten Rollen (z.B. "Abteilungsleiter")

**Implementierung in Role:**
```java
public boolean canApproveWorkOrders() {
    return this.editOtherPermissions.contains(PermissionEntity.WORK_ORDERS) ||
           this.name.toLowerCase().contains("leiter") || // Pragmatischer Ansatz
           this.code == RoleCode.DEPARTMENT_HEAD; // Falls solch ein Code definiert wird
}
```

---

## 4. Frontend-Implementierung

### 4.1 WorkOrder-Formular

**Pfad:** `/frontend/src/content/own/WorkOrders/index.tsx`

**Erweiterung im fields Array:**

```typescript
// Nach requiredSignature-Feld
{
  name: 'requiresRiskAssessment',
  type: 'switch',
  label: t('requires_risk_assessment'),
  helperText: t('risk_assessment_helper_text') // "Gefährdungsbeurteilung nach TRBS 1112 erforderlich"
}
```

**Erweiterung in formatValues:**

```typescript
newValues.requiresRiskAssessment = Array.isArray(newValues.requiresRiskAssessment)
  ? newValues?.requiresRiskAssessment.includes('on')
  : newValues.requiresRiskAssessment;
```

**Initialwert:**

```typescript
values={{
  requiredSignature: false,
  requiresRiskAssessment: false,
  // ... andere Felder
}}
```

### 4.2 WorkOrder Details

**Pfad:** `/frontend/src/content/own/WorkOrders/Details/WorkOrderDetails.tsx`

**Neue Status-Anzeige:**

Im Details-Tab eine neue Sektion hinzufügen:

```typescript
{workOrder.requiresRiskAssessment && (
  <>
    <Divider sx={{ my: 2 }} />
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          {t('risk_assessment')}
        </Typography>
      </Grid>
      
      {/* Status-Badge */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" gutterBottom>
          {t('approval_status')}
        </Typography>
        <ApprovalStatusBadge status={workOrder.approvalStatus} />
      </Grid>

      {/* Genehmiger */}
      {workOrder.approver && (
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            {t('approver')}
          </Typography>
          <Link href={getUserUrl(workOrder.approver.id)}>
            {getUserNameById(workOrder.approver.id)}
          </Link>
        </Grid>
      )}

      {/* Gefährdungsbeurteilung bearbeiten/anzeigen */}
      <Grid item xs={12}>
        <Button
          variant="outlined"
          startIcon={<AssignmentTwoToneIcon />}
          onClick={() => setOpenRiskAssessmentModal(true)}
          disabled={workOrder.approvalStatus === 'APPROVED'}
        >
          {riskAssessmentExists 
            ? t('view_risk_assessment') 
            : t('create_risk_assessment')}
        </Button>
      </Grid>

      {/* Genehmigungsbuttons für berechtigte Benutzer */}
      {canApprove && workOrder.approvalStatus === 'PENDING' && (
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckTwoToneIcon />}
              onClick={() => handleApprove(true)}
            >
              {t('approve')}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CloseTwoToneIcon />}
              onClick={() => setOpenRejectModal(true)}
            >
              {t('reject')}
            </Button>
          </Stack>
        </Grid>
      )}

      {/* Genehmigungskommentar anzeigen */}
      {workOrder.approvalComment && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            {t('approval_comment')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {workOrder.approvalComment}
          </Typography>
        </Grid>
      )}
    </Grid>
  </>
)}
```

**Status-Warnungen:**

```typescript
// Warnung wenn nicht genehmigt
{workOrder.requiresRiskAssessment && 
 workOrder.approvalStatus !== 'APPROVED' && 
 workOrder.status === 'IN_PROGRESS' && (
  <Alert severity="warning" sx={{ mb: 2 }}>
    {t('work_order_not_approved_warning')}
  </Alert>
)}

// Warnung wenn abgelehnt
{workOrder.approvalStatus === 'REJECTED' && (
  <Alert severity="error" sx={{ mb: 2 }}>
    {t('work_order_rejected')}
    {workOrder.approvalComment && `: ${workOrder.approvalComment}`}
  </Alert>
)}
```

**Status-Änderung blockieren:**

```typescript
const handleStatusChange = async (newStatus: Status) => {
  // Prüfen ob WO gestartet werden kann
  if (newStatus === Status.IN_PROGRESS && workOrder.requiresRiskAssessment) {
    const canStartResponse = await dispatch(canStartWorkOrder(workOrder.id));
    
    if (!canStartResponse.canStart) {
      if (canStartResponse.needsRiskAssessment) {
        showSnackBar(t('complete_risk_assessment_first'), 'error');
      } else if (canStartResponse.needsApproval) {
        showSnackBar(t('work_order_needs_approval'), 'error');
      }
      return;
    }
  }
  
  // Normaler Status-Änderungs-Flow
  setChangingStatus(true);
  await dispatch(changeWorkOrderStatus(workOrder.id, newStatus));
  setChangingStatus(false);
};
```

### 4.3 Neue Modal-Komponenten

#### 4.3.1 RiskAssessmentModal

**Pfad:** `/frontend/src/content/own/WorkOrders/Details/RiskAssessmentModal.tsx`

```typescript
interface RiskAssessmentModalProps {
  open: boolean;
  onClose: () => void;
  workOrderId: number;
  riskAssessment?: RiskAssessment; // Für Bearbeitung
}

export default function RiskAssessmentModal({
  open,
  onClose,
  workOrderId,
  riskAssessment
}: RiskAssessmentModalProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [hazards, setHazards] = useState<Hazard[]>(riskAssessment?.hazards || []);

  // Multi-Step Formular
  const steps = [
    t('activity_description'),
    t('hazard_identification'),
    t('protective_measures'),
    t('summary')
  ];

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <DialogTitle>
        <Typography variant="h3">
          {t('risk_assessment_trbs_1112')}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Tätigkeitsbeschreibung */}
        {currentStep === 0 && (
          <ActivityDescriptionStep />
        )}

        {/* Step 2: Gefährdungen identifizieren */}
        {currentStep === 1 && (
          <HazardIdentificationStep 
            hazards={hazards}
            onAddHazard={(hazard) => setHazards([...hazards, hazard])}
            onRemoveHazard={(index) => {
              const newHazards = [...hazards];
              newHazards.splice(index, 1);
              setHazards(newHazards);
            }}
            onUpdateHazard={(index, hazard) => {
              const newHazards = [...hazards];
              newHazards[index] = hazard;
              setHazards(newHazards);
            }}
          />
        )}

        {/* Step 3: Schutzmaßnahmen */}
        {currentStep === 2 && (
          <ProtectiveMeasuresStep hazards={hazards} />
        )}

        {/* Step 4: Zusammenfassung */}
        {currentStep === 3 && (
          <RiskAssessmentSummary hazards={hazards} />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {t('cancel')}
        </Button>
        {currentStep > 0 && (
          <Button onClick={() => setCurrentStep(currentStep - 1)}>
            {t('back')}
          </Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            {t('next')}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleComplete}
          >
            {t('complete_assessment')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
```

#### 4.3.2 HazardIdentificationStep

**Pfad:** `/frontend/src/content/own/WorkOrders/Details/RiskAssessment/HazardIdentificationStep.tsx`

```typescript
export default function HazardIdentificationStep({ 
  hazards, 
  onAddHazard, 
  onRemoveHazard,
  onUpdateHazard 
}) {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('identified_hazards')}
      </Typography>

      {/* Liste der identifizierten Gefährdungen */}
      <List>
        {hazards.map((hazard, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">
                    {t('hazard_type')}
                  </Typography>
                  <Chip 
                    label={t(`hazard_type_${hazard.type.toLowerCase()}`)} 
                    color="primary"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">
                    {t('description')}
                  </Typography>
                  <Typography variant="body2">
                    {hazard.description}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2">
                    {t('probability')}
                  </Typography>
                  <Rating value={hazard.probability} readOnly max={5} />
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2">
                    {t('severity')}
                  </Typography>
                  <Rating value={hazard.severity} readOnly max={5} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">
                    {t('risk_score')}
                  </Typography>
                  <RiskLevelBadge 
                    score={hazard.probability * hazard.severity}
                    level={hazard.riskLevel}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" spacing={1}>
                    <IconButton 
                      size="small"
                      onClick={() => {/* Edit */}}
                    >
                      <EditTwoToneIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      color="error"
                      onClick={() => onRemoveHazard(index)}
                    >
                      <DeleteTwoToneIcon />
                    </IconButton>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </List>

      {/* Button zum Hinzufügen neuer Gefährdungen */}
      <Button
        variant="outlined"
        startIcon={<AddTwoToneIcon />}
        onClick={() => setShowAddForm(true)}
        sx={{ mt: 2 }}
      >
        {t('add_hazard')}
      </Button>

      {/* Formular zum Hinzufügen */}
      <Dialog open={showAddForm} onClose={() => setShowAddForm(false)}>
        <DialogTitle>{t('add_hazard')}</DialogTitle>
        <DialogContent>
          <Form
            fields={[
              {
                name: 'type',
                type: 'select',
                label: t('hazard_type'),
                options: Object.values(HazardType).map(type => ({
                  label: t(`hazard_type_${type.toLowerCase()}`),
                  value: type
                }))
              },
              {
                name: 'description',
                type: 'text',
                label: t('description'),
                multiple: true
              },
              {
                name: 'probability',
                type: 'slider',
                label: t('probability'),
                min: 1,
                max: 5,
                marks: true
              },
              {
                name: 'severity',
                type: 'slider',
                label: t('severity'),
                min: 1,
                max: 5,
                marks: true
              },
              {
                name: 'specificProtectiveMeasures',
                type: 'text',
                label: t('protective_measures_for_this_hazard'),
                multiple: true
              }
            ]}
            validation={Yup.object().shape({
              type: Yup.string().required(),
              description: Yup.string().required(),
              probability: Yup.number().required().min(1).max(5),
              severity: Yup.number().required().min(1).max(5)
            })}
            submitText={t('add')}
            values={{
              probability: 3,
              severity: 3
            }}
            onSubmit={(values) => {
              onAddHazard(values);
              setShowAddForm(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
```

#### 4.3.3 ApprovalModal (für Ablehnung mit Kommentar)

**Pfad:** `/frontend/src/content/own/WorkOrders/Details/ApprovalModal.tsx`

```typescript
interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  workOrderId: number;
  approve: boolean;
  onApprove: (comment: string) => Promise<void>;
}

export default function ApprovalModal({
  open,
  onClose,
  workOrderId,
  approve,
  onApprove
}: ApprovalModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {approve ? t('approve_work_order') : t('reject_work_order')}
      </DialogTitle>
      <DialogContent>
        <Form
          fields={[
            {
              name: 'comment',
              type: 'text',
              label: t('comment'),
              placeholder: t('approval_comment_placeholder'),
              multiple: true,
              required: !approve // Bei Ablehnung Pflichtfeld
            }
          ]}
          validation={Yup.object().shape({
            comment: approve 
              ? Yup.string() 
              : Yup.string().required(t('rejection_comment_required'))
          })}
          submitText={approve ? t('approve') : t('reject')}
          values={{}}
          onSubmit={async (values) => {
            await onApprove(values.comment);
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### 4.4 Neue UI-Komponenten

#### ApprovalStatusBadge

**Pfad:** `/frontend/src/components/ApprovalStatusBadge.tsx`

```typescript
interface ApprovalStatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function ApprovalStatusBadge({ status }: ApprovalStatusBadgeProps) {
  const { t } = useTranslation();
  
  const getColor = () => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'APPROVED': return <CheckCircleTwoToneIcon />;
      case 'REJECTED': return <CancelTwoToneIcon />;
      case 'PENDING': return <HourglassEmptyTwoToneIcon />;
      default: return null;
    }
  };

  return (
    <Chip
      label={t(`approval_status_${status.toLowerCase()}`)}
      color={getColor()}
      icon={getIcon()}
    />
  );
}
```

#### RiskLevelBadge

**Pfad:** `/frontend/src/components/RiskLevelBadge.tsx`

```typescript
interface RiskLevelBadgeProps {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export default function RiskLevelBadge({ score, level }: RiskLevelBadgeProps) {
  const { t } = useTranslation();
  
  const getColor = () => {
    switch (level) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'CRITICAL': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Chip
        label={`${t(`risk_level_${level.toLowerCase()}`)} (${score})`}
        color={getColor()}
        size="small"
      />
      {level === 'CRITICAL' && (
        <Tooltip title={t('critical_risk_warning')}>
          <WarningTwoToneIcon color="error" />
        </Tooltip>
      )}
    </Box>
  );
}
```

### 4.5 Redux State Management

**Neue Slices:**

**riskAssessmentSlice.ts:**
```typescript
// /frontend/src/slices/riskAssessment.ts

interface RiskAssessmentState {
  riskAssessmentsByWorkOrder: Record<number, RiskAssessment>;
  loading: boolean;
  error: string | null;
}

export const createRiskAssessment = createAsyncThunk(
  'riskAssessment/create',
  async ({ workOrderId, data }: { workOrderId: number; data: RiskAssessmentPostDTO }) => {
    const response = await api.post(`/risk-assessments/work-order/${workOrderId}`, data);
    return response.data;
  }
);

export const getRiskAssessment = createAsyncThunk(
  'riskAssessment/get',
  async (workOrderId: number) => {
    const response = await api.get(`/work-orders/${workOrderId}/risk-assessment`);
    return response.data;
  }
);

export const completeRiskAssessment = createAsyncThunk(
  'riskAssessment/complete',
  async (id: number) => {
    const response = await api.post(`/risk-assessments/${id}/complete`);
    return response.data;
  }
);

// ... weitere Actions
```

**workOrderSlice.ts erweitern:**
```typescript
export const approveWorkOrder = createAsyncThunk(
  'workOrder/approve',
  async ({ 
    id, 
    approved, 
    comment 
  }: { 
    id: number; 
    approved: boolean; 
    comment?: string 
  }) => {
    const response = await api.post(
      `/work-orders/${id}/approve?approved=${approved}`,
      { comment }
    );
    return response.data;
  }
);

export const canStartWorkOrder = createAsyncThunk(
  'workOrder/canStart',
  async (id: number) => {
    const response = await api.get(`/work-orders/${id}/can-start`);
    return response.data;
  }
);
```

### 4.6 TypeScript Interfaces

**Neue Interfaces:**

```typescript
// /frontend/src/models/owns/riskAssessment.ts

export interface RiskAssessment {
  id: number;
  workOrder: WorkOrder;
  activityDescription: string;
  hazards: Hazard[];
  overallRiskLevel: RiskLevel;
  protectiveMeasures: string;
  additionalNotes?: string;
  assessedBy: OwnUser;
  assessedOn: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hazard {
  id: number;
  type: HazardType;
  description: string;
  probability: number; // 1-5
  severity: number; // 1-5
  riskScore: number; // probability × severity
  riskLevel: RiskLevel;
  specificProtectiveMeasures?: string;
}

export enum HazardType {
  MECHANICAL = 'MECHANICAL',
  ELECTRICAL = 'ELECTRICAL',
  THERMAL = 'THERMAL',
  CHEMICAL = 'CHEMICAL',
  BIOLOGICAL = 'BIOLOGICAL',
  ERGONOMIC = 'ERGONOMIC',
  PSYCHOSOCIAL = 'PSYCHOSOCIAL',
  FIRE_EXPLOSION = 'FIRE_EXPLOSION',
  NOISE_VIBRATION = 'NOISE_VIBRATION',
  RADIATION = 'RADIATION',
  FALL_STUMBLE = 'FALL_STUMBLE',
  OTHER = 'OTHER'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
```

**WorkOrder Interface erweitern:**

```typescript
// /frontend/src/models/owns/workOrder.ts

export default interface WorkOrder extends WorkOrderBase {
  // ... bestehende Felder
  requiresRiskAssessment: boolean;
  approvalStatus: ApprovalStatus;
  approver?: OwnUser;
  approvalDate?: Date;
  approvalComment?: string;
}
```

### 4.7 Übersetzungen

**i18n Keys hinzufügen:**

```json
// /frontend/public/locales/de/common.json
{
  "requires_risk_assessment": "Gefährdungsbeurteilung erforderlich",
  "risk_assessment_helper_text": "Gefährdungsbeurteilung nach TRBS 1112 erforderlich",
  "risk_assessment": "Gefährdungsbeurteilung",
  "risk_assessment_trbs_1112": "Gefährdungsbeurteilung nach TRBS 1112 Anhang 2",
  "approval_status": "Genehmigungsstatus",
  "approval_status_pending": "Ausstehend",
  "approval_status_approved": "Genehmigt",
  "approval_status_rejected": "Abgelehnt",
  "approver": "Genehmiger",
  "approve": "Genehmigen",
  "reject": "Ablehnen",
  "approve_work_order": "Arbeitsauftrag genehmigen",
  "reject_work_order": "Arbeitsauftrag ablehnen",
  "approval_comment": "Kommentar zur Genehmigung",
  "approval_comment_placeholder": "Optional: Begründung für die Entscheidung",
  "rejection_comment_required": "Begründung für die Ablehnung erforderlich",
  "work_order_not_approved_warning": "Diese WorkOrder wurde noch nicht genehmigt und sollte nicht gestartet werden.",
  "work_order_rejected": "Diese WorkOrder wurde abgelehnt",
  "work_order_needs_approval": "Diese WorkOrder benötigt eine Genehmigung vor dem Start",
  "complete_risk_assessment_first": "Bitte schließen Sie zuerst die Gefährdungsbeurteilung ab",
  "view_risk_assessment": "Gefährdungsbeurteilung anzeigen",
  "create_risk_assessment": "Gefährdungsbeurteilung erstellen",
  "complete_assessment": "Beurteilung abschließen",
  "activity_description": "Tätigkeitsbeschreibung",
  "hazard_identification": "Gefährdungsidentifikation",
  "protective_measures": "Schutzmaßnahmen",
  "summary": "Zusammenfassung",
  "identified_hazards": "Identifizierte Gefährdungen",
  "hazard_type": "Art der Gefährdung",
  "hazard_type_mechanical": "Mechanisch",
  "hazard_type_electrical": "Elektrisch",
  "hazard_type_thermal": "Thermisch",
  "hazard_type_chemical": "Chemisch",
  "hazard_type_biological": "Biologisch",
  "hazard_type_ergonomic": "Ergonomisch",
  "hazard_type_psychosocial": "Psychosozial",
  "hazard_type_fire_explosion": "Brand/Explosion",
  "hazard_type_noise_vibration": "Lärm/Vibration",
  "hazard_type_radiation": "Strahlung",
  "hazard_type_fall_stumble": "Sturz/Stolpern",
  "hazard_type_other": "Sonstige",
  "add_hazard": "Gefährdung hinzufügen",
  "probability": "Wahrscheinlichkeit",
  "severity": "Schweregrad",
  "risk_score": "Risikobewertung",
  "risk_level": "Risikolevel",
  "risk_level_low": "Gering",
  "risk_level_medium": "Mittel",
  "risk_level_high": "Hoch",
  "risk_level_critical": "Kritisch",
  "critical_risk_warning": "Kritisches Risiko! Besondere Vorsicht erforderlich.",
  "protective_measures_for_this_hazard": "Schutzmaßnahmen für diese Gefährdung"
}
```

---

## 5. Workflow und User Stories

### 5.1 User Story 1: WorkOrder mit Gefährdungsbeurteilung erstellen

**Als** Instandhaltungsplaner  
**möchte ich** bei der Erstellung einer WorkOrder festlegen können, ob eine Gefährdungsbeurteilung notwendig ist  
**damit** sichergestellt wird, dass kritische Arbeiten vor Ausführung bewertet werden.

**Acceptance Criteria:**
1. Toggle-Button "Gefährdungsbeurteilung erforderlich" im WorkOrder-Formular
2. Toggle-Status wird in der Datenbank gespeichert
3. WorkOrder zeigt im Detail-View den Status an

### 5.2 User Story 2: Gefährdungsbeurteilung durchführen

**Als** Techniker  
**möchte ich** eine Gefährdungsbeurteilung nach TRBS 1112 für eine WorkOrder durchführen  
**damit** alle Risiken dokumentiert und bewertet werden.

**Acceptance Criteria:**
1. Button "Gefährdungsbeurteilung erstellen" in WorkOrder Details
2. Multi-Step Formular mit:
   - Tätigkeitsbeschreibung
   - Gefährdungsidentifikation (mehrere Gefährdungen möglich)
   - Schutzmaßnahmen
   - Zusammenfassung
3. Automatische Risikoberechnung (Wahrscheinlichkeit × Schweregrad)
4. Speicherung in Datenbank
5. PDF-Export der Beurteilung

### 5.3 User Story 3: WorkOrder genehmigen

**Als** Abteilungsleiter  
**möchte ich** WorkOrders mit Gefährdungsbeurteilung vor der Ausführung genehmigen können  
**damit** sichergestellt ist, dass alle Risiken akzeptabel sind.

**Acceptance Criteria:**
1. Benachrichtigung über ausstehende Genehmigung
2. Anzeige der Gefährdungsbeurteilung in WorkOrder Details
3. Buttons "Genehmigen" und "Ablehnen" sichtbar für berechtigte Nutzer
4. Bei Ablehnung: Pflichtfeld für Begründung
5. Status-Änderung wird gespeichert und angezeigt
6. Benachrichtigung an Ersteller

### 5.4 User Story 4: WorkOrder starten mit Genehmigungspflicht

**Als** Techniker  
**möchte ich** beim Start einer WorkOrder automatisch geprüft werden, ob alle Voraussetzungen erfüllt sind  
**damit** ich keine nicht-genehmigten Arbeiten beginne.

**Acceptance Criteria:**
1. Bei Status-Änderung zu "IN_PROGRESS": Prüfung ob genehmigt
2. Fehlermeldung wenn nicht genehmigt: "Diese WorkOrder benötigt eine Genehmigung"
3. Fehlermeldung wenn Gefährdungsbeurteilung fehlt: "Bitte schließen Sie zuerst die Gefährdungsbeurteilung ab"
4. Nur bei erfüllten Voraussetzungen: Status-Änderung erlaubt

### 5.5 User Story 5: Übersicht ausstehender Genehmigungen

**Als** Abteilungsleiter  
**möchte ich** eine Übersicht aller WorkOrders, die auf meine Genehmigung warten  
**damit** ich diese zeitnah bearbeiten kann.

**Acceptance Criteria:**
1. Filter in WorkOrder-Liste: "Ausstehende Genehmigungen"
2. Badge mit Anzahl ausstehender Genehmigungen
3. Sortierung nach Dringlichkeit (Due Date)
4. Direkter Zugriff auf Gefährdungsbeurteilung aus Liste

---

## 6. Datenbankmigrationen

### 6.1 Migration 1: WorkOrderBase erweitern

```sql
-- Add requiresRiskAssessment to work_order_base
ALTER TABLE work_order ADD COLUMN requires_risk_assessment BOOLEAN DEFAULT FALSE;
```

### 6.2 Migration 2: WorkOrder erweitern

```sql
-- Add approval fields to work_order
ALTER TABLE work_order ADD COLUMN approval_status VARCHAR(20) DEFAULT 'PENDING';
ALTER TABLE work_order ADD COLUMN approver_id BIGINT;
ALTER TABLE work_order ADD COLUMN approval_date TIMESTAMP;
ALTER TABLE work_order ADD COLUMN approval_comment TEXT;

-- Add foreign key constraint
ALTER TABLE work_order 
ADD CONSTRAINT fk_work_order_approver 
FOREIGN KEY (approver_id) REFERENCES own_user(id);

-- Add index for approval queries
CREATE INDEX idx_work_order_approval_status ON work_order(approval_status);
```

### 6.3 Migration 3: RiskAssessment Tabelle

```sql
-- Create risk_assessment table
CREATE TABLE risk_assessment (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL UNIQUE,
    activity_description TEXT NOT NULL,
    hazards_json TEXT,
    overall_risk_level VARCHAR(20),
    protective_measures TEXT NOT NULL,
    additional_notes TEXT,
    assessed_by_id BIGINT,
    assessed_on TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    company_id BIGINT NOT NULL,
    
    CONSTRAINT fk_risk_assessment_work_order 
        FOREIGN KEY (work_order_id) REFERENCES work_order(id) ON DELETE CASCADE,
    CONSTRAINT fk_risk_assessment_assessed_by 
        FOREIGN KEY (assessed_by_id) REFERENCES own_user(id),
    CONSTRAINT fk_risk_assessment_company 
        FOREIGN KEY (company_id) REFERENCES company(id)
);

-- Indices
CREATE INDEX idx_risk_assessment_work_order ON risk_assessment(work_order_id);
CREATE INDEX idx_risk_assessment_assessed_by ON risk_assessment(assessed_by_id);
CREATE INDEX idx_risk_assessment_completed ON risk_assessment(completed);
CREATE INDEX idx_risk_assessment_company ON risk_assessment(company_id);
```

### 6.4 Migration 4: Hazard Tabelle

```sql
-- Create hazard table
CREATE TABLE hazard (
    id BIGSERIAL PRIMARY KEY,
    risk_assessment_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    probability INTEGER NOT NULL CHECK (probability BETWEEN 1 AND 5),
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
    specific_protective_measures TEXT,
    
    CONSTRAINT fk_hazard_risk_assessment 
        FOREIGN KEY (risk_assessment_id) REFERENCES risk_assessment(id) ON DELETE CASCADE
);

-- Indices
CREATE INDEX idx_hazard_risk_assessment ON hazard(risk_assessment_id);
CREATE INDEX idx_hazard_type ON hazard(type);
```

### 6.5 Migration 5: Audit-Tabellen (falls Hibernate Envers verwendet)

```sql
-- Audit tables für risk_assessment und hazard
-- Diese werden normalerweise automatisch von Hibernate Envers erstellt
-- Falls manuelle Erstellung nötig:

CREATE TABLE risk_assessment_aud (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    work_order_id BIGINT,
    activity_description TEXT,
    -- ... alle anderen Felder ...
    PRIMARY KEY (id, rev)
);

CREATE TABLE hazard_aud (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    -- ... alle Felder ...
    PRIMARY KEY (id, rev)
);
```

---

## 7. Berechtigungskonzept

### 7.1 Neue Permission (Optional)

Falls eine dedizierte Permission gewünscht ist:

```java
// In PermissionEntity Enum
APPROVE_WORK_ORDERS
```

### 7.2 Permission-Zuordnung

**Wer kann WorkOrders genehmigen?**

Option A: Basierend auf bestehenden Permissions
- Nutzer mit `editOtherPermissions.contains(WORK_ORDERS)`
- Vorteil: Keine neue Permission notwendig
- Nachteil: Alle mit Edit-Rechten können genehmigen

Option B: Neue dedizierte Permission
- Neue Permission `APPROVE_WORK_ORDERS`
- Kann granular zugewiesen werden
- Vorteil: Feinere Kontrolle
- Nachteil: Zusätzliche Komplexität

Option C: Rollen-basiert
- Nutzer mit Rolle "Abteilungsleiter" / "Teamleiter"
- Erfordert ggf. neue RoleCode-Einträge
- Vorteil: Organisatorisch klar
- Nachteil: Weniger flexibel

**Empfehlung:** Option B mit dedizierter Permission für maximale Flexibilität

### 7.3 Permission Checks im Code

```java
// In WorkOrderController
private boolean hasApprovalPermission(OwnUser user, WorkOrder workOrder) {
    // Option A: Edit Other Permission
    return user.getRole().getEditOtherPermissions().contains(PermissionEntity.WORK_ORDERS);
    
    // Option B: Dedizierte Permission
    // return user.getRole().getApprovalPermissions().contains(PermissionEntity.WORK_ORDERS);
    
    // Option C: Zusätzlich Team/Location Check
    // return hasApprovalPermission(user) && 
    //        (workOrder.getTeam() == null || workOrder.getTeam().equals(user.getTeam()));
}
```

---

## 8. Benachrichtigungssystem

### 8.1 Benachrichtigungstrigger

**Neue Gefährdungsbeurteilung erforderlich:**
- Trigger: WorkOrder mit `requiresRiskAssessment=true` erstellt
- Empfänger: Zugewiesene Techniker
- Inhalt: "Bitte erstellen Sie die Gefährdungsbeurteilung für WorkOrder #XYZ"

**Genehmigung ausstehend:**
- Trigger: Gefährdungsbeurteilung abgeschlossen
- Empfänger: Abteilungsleiter / Approver
- Inhalt: "WorkOrder #XYZ wartet auf Ihre Genehmigung"

**WorkOrder genehmigt:**
- Trigger: Genehmigung erteilt
- Empfänger: Ersteller + zugewiesene Techniker
- Inhalt: "WorkOrder #XYZ wurde genehmigt und kann gestartet werden"

**WorkOrder abgelehnt:**
- Trigger: Genehmigung verweigert
- Empfänger: Ersteller + zugewiesene Techniker
- Inhalt: "WorkOrder #XYZ wurde abgelehnt. Grund: [Kommentar]"

### 8.2 Implementierung

**Notification Service erweitern:**

```java
// In NotificationService
public void notifyRiskAssessmentRequired(WorkOrder workOrder) {
    Collection<OwnUser> users = workOrder.getUsers();
    users.forEach(user -> {
        createNotification(
            user,
            NotificationType.RISK_ASSESSMENT_REQUIRED,
            "Gefährdungsbeurteilung erforderlich für WO #" + workOrder.getId(),
            "/work-orders/" + workOrder.getId()
        );
    });
}

public void notifyPendingApproval(WorkOrder workOrder) {
    List<OwnUser> approvers = getApproversForWorkOrder(workOrder);
    approvers.forEach(approver -> {
        createNotification(
            approver,
            NotificationType.WORK_ORDER_APPROVAL_PENDING,
            "WorkOrder #" + workOrder.getId() + " wartet auf Genehmigung",
            "/work-orders/" + workOrder.getId()
        );
    });
}

public void notifyApprovalDecision(WorkOrder workOrder, boolean approved) {
    Collection<OwnUser> users = workOrder.getUsers();
    users.add(workOrder.getCreatedByUser()); // Falls nicht bereits enthalten
    
    NotificationType type = approved 
        ? NotificationType.WORK_ORDER_APPROVED 
        : NotificationType.WORK_ORDER_REJECTED;
    
    String message = approved
        ? "WorkOrder #" + workOrder.getId() + " wurde genehmigt"
        : "WorkOrder #" + workOrder.getId() + " wurde abgelehnt";
    
    users.forEach(user -> {
        createNotification(user, type, message, "/work-orders/" + workOrder.getId());
    });
}
```

**Email-Benachrichtigungen:**

Optional: Email-Versand bei kritischen Ereignissen (Genehmigung ausstehend, abgelehnt)

---

## 9. Reporting und Analytics

### 9.1 Neue Metriken

**Dashboard-Erweiterungen:**

1. **Anzahl ausstehender Genehmigungen**
   - Widget für Abteilungsleiter
   - Anzeige von WorkOrders im Status PENDING

2. **Durchschnittliche Genehmigungsdauer**
   - Zeit zwischen Erstellung der Gefährdungsbeurteilung und Genehmigung
   - Identifikation von Bottlenecks

3. **Häufigste Gefährdungstypen**
   - Statistik über identifizierte Gefährdungen
   - Hilft bei präventiven Maßnahmen

4. **Risikobewertung-Übersicht**
   - Verteilung von Low/Medium/High/Critical Risiken
   - Trend über Zeit

### 9.2 Berichte

**Gefährdungsbeurteilungs-Report:**
- PDF-Export der vollständigen Beurteilung
- Inklusive aller Gefährdungen, Bewertungen, Schutzmaßnahmen
- Unterschriftenfeld für Verantwortliche
- Entspricht TRBS 1112 Dokumentationsanforderungen

**Genehmigungshistorie:**
- Liste aller genehmigten/abgelehnten WorkOrders
- Filterbar nach Zeitraum, Approver, Status
- Export als Excel/CSV

---

## 10. Testing-Strategie

### 10.1 Backend Unit Tests

**Test-Coverage für:**

1. **WorkOrder Entity:**
   - `needsApproval()` Logik
   - `canBeStarted()` Logik

2. **RiskAssessment Entity:**
   - Berechnung des Gesamtrisikos
   - Validierung von Pflichtfeldern

3. **Hazard Entity:**
   - `getRiskScore()` Berechnung
   - `getRiskLevel()` Zuordnung

4. **WorkOrderService:**
   - Approval-Workflow
   - Permission Checks
   - Status-Überprüfungen

5. **RiskAssessmentService:**
   - Erstellung und Validierung
   - Verknüpfung mit WorkOrder

**Beispiel Test:**

```java
@Test
public void testWorkOrderNeedsApproval() {
    WorkOrder wo = new WorkOrder();
    wo.setRequiresRiskAssessment(true);
    wo.setApprovalStatus(ApprovalStatus.PENDING);
    
    assertTrue(wo.needsApproval());
    assertFalse(wo.canBeStarted());
    
    wo.setApprovalStatus(ApprovalStatus.APPROVED);
    assertFalse(wo.needsApproval());
    assertTrue(wo.canBeStarted());
}

@Test
public void testHazardRiskCalculation() {
    Hazard hazard = new Hazard();
    hazard.setProbability(4);
    hazard.setSeverity(5);
    
    assertEquals(20, hazard.getRiskScore());
    assertEquals(RiskLevel.CRITICAL, hazard.getRiskLevel());
}
```

### 10.2 Integration Tests

**Test-Szenarien:**

1. **Kompletter Workflow:**
   - WorkOrder mit requiresRiskAssessment erstellen
   - Gefährdungsbeurteilung durchführen
   - Genehmigung anfragen
   - Genehmigung erteilen
   - WorkOrder starten

2. **Ablehnungsworkflow:**
   - Genehmigung ablehnen
   - Prüfen, dass WorkOrder nicht gestartet werden kann
   - Erneute Genehmigung nach Anpassung

3. **Permission Tests:**
   - Nicht-berechtigter Nutzer versucht zu genehmigen
   - Unterschiedliche Rollen testen

### 10.3 Frontend Tests

**Component Tests:**

1. **RiskAssessmentModal:**
   - Alle Steps durchlaufen
   - Gefährdung hinzufügen/entfernen
   - Validierung

2. **ApprovalModal:**
   - Genehmigung mit/ohne Kommentar
   - Ablehnung mit Pflichtkommentar

3. **Status-Anzeigen:**
   - Korrekte Badge-Darstellung
   - Warnungen bei nicht genehmigten WOs

**E2E Tests:**
- Kompletter User-Flow von Erstellung bis Genehmigung
- Verschiedene Nutzer-Rollen simulieren

---

## 11. Sicherheitsaspekte

### 11.1 Zugriffskontrolle

**Kritische Punkte:**

1. **Genehmigung:**
   - Nur berechtigte Nutzer dürfen genehmigen
   - Keine Manipulation des Genehmigungsstatus ohne entsprechende Permission
   - Audit-Log aller Genehmigungen

2. **Gefährdungsbeurteilung:**
   - Nur zugewiesene Techniker dürfen erstellen/bearbeiten
   - Nach Genehmigung: Keine Änderung mehr möglich (oder nur mit erneuter Genehmigung)

3. **Status-Änderungen:**
   - Backend-Validierung, dass nur genehmigte WOs gestartet werden können
   - Frontend-Validierung ist nur UI-Feedback, nicht Sicherheitsmechanismus

### 11.2 Audit Trail

**Alle kritischen Aktionen loggen:**

```java
@Audited
public class RiskAssessment extends CompanyAudit {
    // Automatisches Auditing durch Hibernate Envers
}

// Zusätzlich explizites Logging bei Genehmigungen
@PostMapping("/{id}/approve")
public WorkOrderShowDTO approveWorkOrder(...) {
    // ... Genehmigungslogik ...
    
    auditService.log(
        AuditAction.WORK_ORDER_APPROVAL,
        user.getId(),
        workOrder.getId(),
        Map.of(
            "approved", approved,
            "comment", comment,
            "timestamp", new Date()
        )
    );
    
    // ...
}
```

### 11.3 Datenintegrität

**Constraints:**

1. **One-to-One Relation WorkOrder-RiskAssessment:**
   - Sicherstellen, dass nur eine Gefährdungsbeurteilung pro WorkOrder existiert
   - DB-Constraint: UNIQUE auf work_order_id

2. **Status-Konsistenz:**
   - Transaktionale Updates
   - Status-Übergänge validieren

3. **Pflichtfelder:**
   - Backend-Validierung aller @NotNull Felder
   - Zusätzlich Frontend-Validierung für UX

---

## 12. Performance-Überlegungen

### 12.1 Datenbankabfragen

**Optimierungen:**

1. **Eager/Lazy Loading:**
   - RiskAssessment mit Hazards: Use `@OneToMany(fetch = FetchType.LAZY)`
   - Nur bei Bedarf laden (in RiskAssessmentModal)

2. **Indizes:**
   - `approval_status` (für Filterung ausstehender Genehmigungen)
   - `requires_risk_assessment` (für Statistiken)
   - `work_order_id` in risk_assessment (für schnellen Lookup)

3. **N+1 Problem vermeiden:**
   - Join Fetches in Service-Queries verwenden
   ```java
   @Query("SELECT ra FROM RiskAssessment ra " +
          "LEFT JOIN FETCH ra.hazards " +
          "WHERE ra.workOrder.id = :workOrderId")
   Optional<RiskAssessment> findByWorkOrderIdWithHazards(@Param("workOrderId") Long workOrderId);
   ```

### 12.2 Frontend Performance

**Optimierungen:**

1. **Lazy Loading:**
   - Gefährdungsbeurteilung erst laden, wenn Modal geöffnet wird
   - Nicht bei jedem WorkOrder-Detail-Load

2. **Caching:**
   - Redux-State für bereits geladene RiskAssessments
   - Vermeidung redundanter API-Calls

3. **Pagination:**
   - Bei vielen Gefährdungen: Pagination in der Liste

---

## 13. Rollout-Plan

### 13.1 Phase 1: Backend Foundation (Woche 1-2)

**Aufgaben:**
1. Datenmodell implementieren (Entities, Enums)
2. Repositories erstellen
3. Services implementieren
4. DTOs und Mapper erstellen
5. Datenbankmigrationen durchführen
6. Unit Tests schreiben

**Deliverable:** Funktionsfähige Backend-APIs

### 13.2 Phase 2: Backend Business Logic (Woche 2-3)

**Aufgaben:**
1. Controller-Endpoints implementieren
2. Genehmigungsworkflow umsetzen
3. Permission-System integrieren
4. Benachrichtigungen implementieren
5. Integration Tests schreiben

**Deliverable:** Vollständige Backend-Funktionalität

### 13.3 Phase 3: Frontend Foundation (Woche 3-4)

**Aufgaben:**
1. Redux Slices erstellen
2. TypeScript Interfaces definieren
3. API-Calls implementieren
4. Basis-Komponenten erstellen (Badges, etc.)
5. Übersetzungen hinzufügen

**Deliverable:** Frontend-Infrastruktur

### 13.4 Phase 4: Frontend UI (Woche 4-5)

**Aufgaben:**
1. WorkOrder-Formular erweitern (Toggle)
2. WorkOrder Details erweitern (Status, Buttons)
3. RiskAssessmentModal implementieren
4. ApprovalModal implementieren
5. Status-Warnungen hinzufügen

**Deliverable:** Vollständige UI

### 13.5 Phase 5: Testing & Refinement (Woche 5-6)

**Aufgaben:**
1. E2E Tests durchführen
2. User Acceptance Testing (UAT)
3. Bug Fixes
4. Performance-Optimierung
5. Dokumentation finalisieren

**Deliverable:** Production-ready Feature

### 13.6 Phase 6: Deployment & Training (Woche 6-7)

**Aufgaben:**
1. Deployment in Staging
2. User-Training (Abteilungsleiter, Techniker)
3. Dokumentation für End-User
4. Go-Live in Production
5. Monitoring & Support

**Deliverable:** Live-System mit geschulten Nutzern

---

## 14. Risiken und Mitigationen

### 14.1 Technische Risiken

**Risiko 1: Datenbank-Migration schlägt fehl**
- Mitigation: Backup vor Migration, Rollback-Script vorbereiten
- Mitigation: Migration zuerst in Staging-Umgebung testen

**Risiko 2: Performance-Probleme bei vielen Gefährdungen**
- Mitigation: Pagination implementieren
- Mitigation: Indizes optimieren
- Mitigation: Last-Tests durchführen

**Risiko 3: Komplexität des Genehmigungsworkflows**
- Mitigation: Schrittweise Einführung (erst einfacher Workflow, dann Erweiterungen)
- Mitigation: Umfangreiches Testing

### 14.2 Organisatorische Risiken

**Risiko 1: User-Akzeptanz niedrig**
- Mitigation: Frühzeitiges Einbeziehen von Key-Usern
- Mitigation: Umfangreiches Training
- Mitigation: Dokumentation und Hilfestellungen

**Risiko 2: Unklare Verantwortlichkeiten für Genehmigungen**
- Mitigation: Klare Rollen und Permissions definieren
- Mitigation: Workflow-Dokumentation erstellen
- Mitigation: Eskalationspfade festlegen

**Risiko 3: Compliance-Anforderungen nicht vollständig erfüllt**
- Mitigation: Frühzeitige Abstimmung mit Arbeitssicherheit
- Mitigation: Review durch TRBS-Experten
- Mitigation: Regelmäßige Audits

### 14.3 Prozessuale Risiken

**Risiko 1: Genehmigungen verzögern kritische Arbeiten**
- Mitigation: SLA für Genehmigungen definieren (z.B. 24h)
- Mitigation: Eskalationsmechanismus bei Verzögerung
- Mitigation: Mobile Benachrichtigungen für Approver

**Risiko 2: Techniker umgehen System (manuell/offline)**
- Mitigation: Klare Prozess-Vorgaben und Schulung
- Mitigation: Regelmäßige Audits
- Mitigation: Reporting über nicht-compliant WorkOrders

---

## 15. Erweiterungsmöglichkeiten (Future Enhancements)

### 15.1 Kurzfristig (3-6 Monate)

1. **Vorlagen für Gefährdungsbeurteilungen:**
   - Asset-spezifische Templates
   - Häufig verwendete Gefährdungsszenarien als Vorlage

2. **Mobile App Unterstützung:**
   - Gefährdungsbeurteilung auf Tablet/Smartphone
   - Foto-Upload von Gefährdungssituation

3. **Erweiterte Benachrichtigungen:**
   - Push-Notifications
   - SMS für kritische Genehmigungen

4. **Dashboard für Approver:**
   - Dedizierte Ansicht für ausstehende Genehmigungen
   - Batch-Approval für mehrere WOs

### 15.2 Mittelfristig (6-12 Monate)

1. **Automatische Risikobewertung:**
   - KI-basierte Vorschläge für Gefährdungen basierend auf Asset/Tätigkeit
   - Historische Daten nutzen für Risiko-Prognose

2. **Mehrstufige Genehmigungen:**
   - Erst Teamleiter, dann Abteilungsleiter
   - Abhängig von Risikolevel

3. **Integration mit externen Systemen:**
   - Import von Gefährdungskatalogen
   - Export für behördliche Meldungen

4. **Erweiterte Analytics:**
   - Predictive Analytics für Risiko-Trends
   - Benchmarking zwischen Teams/Standorten

### 15.3 Langfristig (12+ Monate)

1. **Compliance-Modul:**
   - Automatische Prüfung auf Einhaltung von Vorschriften
   - Integration mit Audit-Management

2. **Schulungsverwaltung:**
   - Verknüpfung von Gefährdungen mit erforderlichen Qualifikationen
   - Automatische Prüfung, ob Techniker qualifiziert ist

3. **IoT-Integration:**
   - Sensordaten in Risikobewertung einbeziehen
   - Echtzeit-Warnung bei erhöhtem Risiko

---

## 16. Fazit und Empfehlungen

### 16.1 Zusammenfassung

Das vorgeschlagene Konzept erweitert das WorkOrder-Modul um eine vollständige Gefährdungsbeurteilungsfunktionalität nach TRBS 1112 Anhang 2 sowie einen Genehmigungsworkflow. Die Implementierung folgt den bestehenden Architekturmustern der Anwendung und minimiert strukturelle Änderungen.

**Kernelemente:**
- Toggle-Button für Gefährdungsbeurteilungspflicht (analog zu requiredSignature)
- Strukturierte Erfassung von Gefährdungen mit automatischer Risikobewertung
- Flexibles Genehmigungssystem basierend auf Permissions
- Multi-Step Formular für benutzerfreundliche Dateneingabe
- Vollständige Audit-Trail für Compliance

### 16.2 Vorteile der Lösung

1. **Compliance:** Erfüllt TRBS 1112 Anforderungen
2. **Integration:** Nahtlose Einbindung in bestehende Workflows
3. **Usability:** Intuitive Benutzeroberfläche
4. **Flexibilität:** Anpassbar an verschiedene Organisationsstrukturen
5. **Skalierbarkeit:** Performance-optimiert für große Datenmengen
6. **Sicherheit:** Umfassende Zugriffskontrolle und Auditing

### 16.3 Empfohlener Ansatz

**Phase 1 Start:** Backend-Implementierung
- Geringes Risiko
- Kann parallel zu bestehendem System entwickelt werden
- Frühzeitiges Testing möglich

**Phase 2:** Frontend-Integration
- Aufbauend auf stabiler Backend-Basis
- Iteratives UI-Testing mit Key-Usern

**Phase 3:** Pilotierung
- Start mit einer Abteilung/Team
- Feedback sammeln und iterieren
- Schrittweiser Rollout

### 16.4 Kritische Erfolgsfaktoren

1. **User-Involvement:** Frühzeitige Einbindung von Technikern und Abteilungsleitern
2. **Change Management:** Klare Kommunikation des Mehrwerts
3. **Training:** Umfassende Schulung aller Beteiligten
4. **Support:** Dedicated Support in der Einführungsphase
5. **Continuous Improvement:** Regelmäßiges Feedback einholen und System anpassen

---

## 17. Anlagen

### 17.1 Mockups / Wireframes

*(In einer realen Implementierung würden hier Mockups der UI eingefügt)*

- WorkOrder-Formular mit Toggle
- WorkOrder Details mit Genehmigungsstatus
- RiskAssessmentModal (alle Steps)
- ApprovalModal
- Dashboard für Approver

### 17.2 API-Dokumentation

**Neue Endpoints:**

```
POST   /api/work-orders/{id}/approve
GET    /api/work-orders/{id}/can-start
GET    /api/work-orders/{id}/risk-assessment

POST   /api/risk-assessments/work-order/{workOrderId}
GET    /api/risk-assessments/{id}
PATCH  /api/risk-assessments/{id}
POST   /api/risk-assessments/{id}/complete
DELETE /api/risk-assessments/{id}

POST   /api/risk-assessments/{id}/hazards
GET    /api/risk-assessments/{id}/hazards
PATCH  /api/hazards/{id}
DELETE /api/hazards/{id}
```

### 17.3 Datenbank-Schema

*(Siehe Abschnitt 6: Datenbankmigrationen für vollständiges Schema)*

**Neue Tabellen:**
- `risk_assessment`
- `hazard`
- `risk_assessment_aud` (Audit)
- `hazard_aud` (Audit)

**Erweiterte Tabellen:**
- `work_order` (+4 Felder)

### 17.4 Checkliste für Implementierung

- [ ] Backend Entities erstellt
- [ ] Backend DTOs und Mapper erstellt
- [ ] Backend Services implementiert
- [ ] Backend Controller implementiert
- [ ] Datenbankmigrationen durchgeführt
- [ ] Backend Unit Tests geschrieben (>80% Coverage)
- [ ] Backend Integration Tests geschrieben
- [ ] Frontend Redux Slices erstellt
- [ ] Frontend TypeScript Interfaces definiert
- [ ] Frontend Komponenten implementiert
- [ ] Frontend Tests geschrieben
- [ ] Übersetzungen hinzugefügt (DE/EN)
- [ ] API-Dokumentation aktualisiert
- [ ] User-Dokumentation erstellt
- [ ] Training-Material erstellt
- [ ] Staging-Deployment durchgeführt
- [ ] UAT durchgeführt und Feedback eingearbeitet
- [ ] Production-Deployment geplant
- [ ] Go-Live Communication vorbereitet
- [ ] Post-Launch Support sichergestellt

---

**Dokument-Version:** 1.0  
**Erstellungsdatum:** 2025  
**Status:** Draft - zur Diskussion und Refinement
