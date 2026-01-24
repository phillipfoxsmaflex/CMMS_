import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch, RootState } from 'src/store';
import { 
  addSafetyInstruction, 
  editSafetyInstruction, 
  getSingleSafetyInstruction,
  clearSingleSafetyInstruction
} from 'src/slices/safetyInstruction';
import { getContractorEmployeesByVendor, getContractorEmployees } from 'src/slices/contractorEmployee';
import { getLocations } from 'src/slices/location';
import { getUsers } from 'src/slices/user';
import { SafetyInstruction } from 'src/models/owns/safetyInstruction';
import { ContractorEmployee } from 'src/models/owns/contractorEmployee';
import Location from 'src/models/owns/location';
import { OwnUser } from 'src/models/user';
import { SearchCriteria } from 'src/models/owns/page';
import {
  Card,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
  Autocomplete
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate, useParams } from 'react-router-dom';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SafetyInstructionDocumentUpload from './SafetyInstructionDocumentUpload';
import SignaturePad from './SignaturePad';

const SafetyInstructionForm: React.FC<{ vendorId?: number }> = ({ vendorId }) => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { singleSafetyInstruction, loadingGet } = useSelector((state: RootState) => state.safetyInstructions);
  const { contractorEmployees } = useSelector((state: RootState) => state.contractorEmployees);
  const { locations } = useSelector((state: RootState) => state.locations);
  const { users } = useSelector((state: RootState) => state.users);
  
  const [formData, setFormData] = useState<SafetyInstruction>({
    id: 0,
    title: '',
    description: '',
    instructionDate: new Date().toISOString(),
    expirationDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 12 months from now
    type: 'DOCUMENT',
    instructionMaterialUrl: '',
    instructionMaterialFileId: '',
    locationId: 0,
    vendorId: vendorId || null,  // Use null if vendorId not provided
    instructorId: 0,
    employeeId: 0,
    completed: false,
    completionDate: '',
    signatureData: '',
    signatureName: '',
    createdBy: 0,
    updatedBy: 0,
    createdAt: '',
    updatedAt: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Load contractor employees
    if (vendorId) {
      // If vendorId provided, load only employees for this vendor
      dispatch(getContractorEmployeesByVendor(vendorId));
    } else {
      // If no vendorId, load ALL contractor employees
      const employeeCriteria: SearchCriteria = {
        pageNum: 0,
        pageSize: 1000,
        sortField: 'firstName',
        direction: 'ASC',
        filterFields: []
      };
      dispatch(getContractorEmployees(employeeCriteria));
    }
    
    // Load locations for dropdown
    dispatch(getLocations());
    
    // Load users for instructor dropdown
    const userCriteria: SearchCriteria = {
      pageNum: 0,
      pageSize: 1000,
      sortField: 'firstName',
      direction: 'ASC',
      filterFields: []
    };
    dispatch(getUsers(userCriteria));
    
    if (id) {
      dispatch(getSingleSafetyInstruction(parseInt(id)));
    }
    
    return () => {
      if (id) {
        dispatch(clearSingleSafetyInstruction());
      }
    };
  }, [dispatch, vendorId, id]);

  useEffect(() => {
    if (singleSafetyInstruction && id) {
      console.log('=== DEBUG: Edit Form Data Loading ===');
      console.log('Raw safety instruction data:', singleSafetyInstruction);
      
      try {
        // Extract IDs from relationship objects for dropdowns
        // Handle both cases: backend returns full objects OR just IDs
        const formattedData = {
          ...singleSafetyInstruction,
          locationId: singleSafetyInstruction.location?.id || singleSafetyInstruction.locationId || 0,
          vendorId: singleSafetyInstruction.vendor?.id || singleSafetyInstruction.vendorId || null,
          instructorId: singleSafetyInstruction.instructor?.id || singleSafetyInstruction.instructorId || 0,
          employeeId: singleSafetyInstruction.employee?.id || singleSafetyInstruction.employeeId || 0
        };
        
        console.log('Formatted safety instruction data:', formattedData);
        setFormData(formattedData);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error formatting safety instruction data:', error);
        setDataLoaded(true); // Set to true even on error to prevent infinite loading
      }
    } else if (id) {
      console.log('=== DEBUG: Waiting for singleSafetyInstruction ===');
      console.log('Current singleSafetyInstruction:', singleSafetyInstruction);
      console.log('Current loadingGet:', loadingGet);
    }
  }, [singleSafetyInstruction, id, loadingGet]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
    setErrors(prev => ({ ...prev, [name as string]: '' }));
  };

  const handleDateChange = (name: string, date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: date.toISOString() }));
      
      // Auto-calculate expiration date if instruction date changes
      if (name === 'instructionDate') {
        const newExpirationDate = new Date(date.getTime() + 12 * 30 * 24 * 60 * 60 * 1000);
        setFormData(prev => ({ ...prev, expirationDate: newExpirationDate.toISOString() }));
      }
    }
  };

  const handleDocumentUpload = (fileId: string, fileUrl: string) => {
    setFormData(prev => ({ 
      ...prev, 
      instructionMaterialFileId: fileId, 
      instructionMaterialUrl: fileUrl
    }));
  };

  const handleSignatureSave = (signatureData: string, signatureName: string) => {
    setFormData(prev => ({ 
      ...prev, 
      signatureData: signatureData,
      signatureName: signatureName,
      completed: true
    }));
    setSignatureDialogOpen(false);
  };

  const handleOpenSignatureDialog = () => {
    setSignatureDialogOpen(true);
  };

  const handleCloseSignatureDialog = () => {
    setSignatureDialogOpen(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Titel ist erforderlich';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Beschreibung ist erforderlich';
    }
    
    if (!formData.employeeId) {
      newErrors.employeeId = 'Mitarbeiter ist erforderlich';
    }
    
    if (!formData.locationId) {
      newErrors.locationId = 'Standort ist erforderlich';
    }
    
    if (!formData.instructorId) {
      newErrors.instructorId = 'Durchführender ist erforderlich';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatInstructionData = (data) => {
    // Convert the form data to the format expected by the backend
    const formattedData = {
      title: data.title,
      description: data.description,
      instructionDate: data.instructionDate,
      expirationDate: data.expirationDate,
      type: data.type,
      instructionMaterialUrl: data.instructionMaterialUrl,
      instructionMaterialFileId: data.instructionMaterialFileId,
      locationId: data.locationId,
      vendorId: data.vendorId,
      instructorId: data.instructorId,
      employeeId: data.employeeId,
      completed: data.completed,
      completionDate: data.completionDate,
      signatureData: data.signatureData,
      signatureName: data.signatureName
    };
    
    // Remove null/undefined/empty values to avoid sending unnecessary data
    Object.keys(formattedData).forEach(key => {
      if (formattedData[key] === null || formattedData[key] === undefined || formattedData[key] === '' || formattedData[key] === 0) {
        delete formattedData[key];
      }
    });
    
    return formattedData;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const instructionData = formatInstructionData({
      ...formData,
      vendorId: vendorId || formData.vendorId
    });
    
    // Format dates to ISO string format expected by backend
    const formatDateForBackend = (date: any) => {
      if (!date) return null;
      // If it's already a string in the correct format, return as-is
      if (typeof date === 'string' && date.includes('T') && date.includes('Z')) {
        return date;
      }
      // Convert Date object to ISO string format
      const dateObj = new Date(date);
      return dateObj.toISOString();
    };

    const patchData = {
      title: formData.title,
      description: formData.description,
      instructionDate: formatDateForBackend(formData.instructionDate),
      expirationDate: formatDateForBackend(formData.expirationDate),
      type: formData.type,
      instructionMaterialUrl: formData.instructionMaterialUrl,
      instructionMaterialFileId: formData.instructionMaterialFileId,
      locationId: formData.locationId || null,
      vendorId: vendorId || formData.vendorId || null,
      instructorId: formData.instructorId || null,
      employeeId: formData.employeeId || null
    };
    
    // Remove null/undefined values to avoid sending unnecessary data that might cause SQL errors
    Object.keys(patchData).forEach(key => {
      if (patchData[key] === null || patchData[key] === undefined || patchData[key] === '') {
        delete patchData[key];
      }
    });
    
    if (id) {
      // Update existing instruction - use PATCH with SafetyInstructionPatchDTO format
      dispatch(editSafetyInstruction(parseInt(id), patchData))
        .then(() => {
          setIsSubmitting(false);
          // Navigate back to list
          if (vendorId) {
            navigate(`/vendors/${vendorId}/safety-instructions`);
          } else {
            navigate('/app/safety-instructions');
          }
        })
        .catch((error: any) => {
          setIsSubmitting(false);
          setErrors({ submit: 'Fehler beim Speichern der Unterweisung: ' + error.message });
        });
    } else {
      // Create new instruction - use the same format as patch but include all fields
      const createData = {
        ...patchData,
        completed: formData.completed || false,
        completionDate: formatDateForBackend(formData.completionDate),
        signatureData: formData.signatureData || '',
        signatureName: formData.signatureName || ''
      };
      
      // Remove null/undefined values for create operation too
      Object.keys(createData).forEach(key => {
        if (createData[key] === null || createData[key] === undefined || createData[key] === '') {
          delete createData[key];
        }
      });
      dispatch(addSafetyInstruction(createData))
        .then(() => {
          setIsSubmitting(false);
          // Navigate back to list
          if (vendorId) {
            navigate(`/vendors/${vendorId}/safety-instructions`);
          } else {
            navigate('/app/safety-instructions');
          }
        })
        .catch((error: any) => {
          setIsSubmitting(false);
          setErrors({ submit: 'Fehler beim Erstellen der Unterweisung: ' + error.message });
        });
    }
  };

  if (loadingGet && id) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Show loading state if we're waiting for data to load
  if (loadingGet && id && !dataLoaded) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" ml={2}>Sicherheitsunterweisung wird geladen...</Typography>
      </Box>
    );
  }

  // Show error if data failed to load
  if (id && dataLoaded && !singleSafetyInstruction) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Alert severity="error">
          Fehler beim Laden der Sicherheitsunterweisung. Bitte versuchen Sie es später erneut.
        </Alert>
      </Box>
    );
  }

  return (
    <Card>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h2">
            {id ? 'Sicherheitsunterweisung bearbeiten' : 'Neue Sicherheitsunterweisung'}
          </Typography>
        </Box>
        
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box mb={3}>
                <Typography variant="h4" gutterBottom>
                  Grundinformationen
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TextField
                  fullWidth
                  label="Titel"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  margin="normal"
                  required
                />
                
                <TextField
                  fullWidth
                  label="Beschreibung"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  margin="normal"
                  multiline
                  rows={4}
                  required
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Typ</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleSelectChange}
                    label="Typ"
                  >
                    <MenuItem value="DOCUMENT">Dokument</MenuItem>
                    <MenuItem value="VIDEO">Video</MenuItem>
                    <MenuItem value="LINK">Externer Link</MenuItem>
                  </Select>
                </FormControl>
                
                {formData.type === 'LINK' && (
                  <TextField
                    fullWidth
                    label="URL"
                    name="instructionMaterialUrl"
                    value={formData.instructionMaterialUrl}
                    onChange={handleChange}
                    margin="normal"
                    placeholder="https://example.com/safety-material"
                  />
                )}
                
                {(formData.type === 'DOCUMENT' || formData.type === 'VIDEO') && (
                  <Box mt={2}>
                    <SafetyInstructionDocumentUpload
                      onDocumentUpload={handleDocumentUpload}
                      existingDocument={formData.instructionMaterialFileId ? {
                        id: formData.instructionMaterialFileId,
                        url: formData.instructionMaterialUrl,
                        name: formData.instructionMaterialUrl ? formData.instructionMaterialUrl.split('/').pop() || 'Unterweisungsmaterial' : 'Unterweisungsmaterial'
                      } : undefined}
                    />
                  </Box>
                )}
              </Box>
              
              <Box mb={3}>
                <Typography variant="h4" gutterBottom>
                  Zeitliche Informationen
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                  <DateTimePicker
                    label="Unterweisungsdatum"
                    value={new Date(formData.instructionDate)}
                    onChange={(date) => handleDateChange('instructionDate', date as Date | null)}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                  />
                  
                  <DateTimePicker
                    label="Ablaufdatum"
                    value={new Date(formData.expirationDate)}
                    onChange={(date) => handleDateChange('expirationDate', date as Date | null)}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                    minDateTime={new Date(formData.instructionDate)}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box mb={3}>
                <Typography variant="h4" gutterBottom>
                  Zuweisungen
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControl fullWidth margin="normal" error={!!errors.employeeId}>
                  <InputLabel>Mitarbeiter</InputLabel>
                  <Select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleSelectChange}
                    label="Mitarbeiter"
                    required
                  >
                    <MenuItem value="">Mitarbeiter auswählen</MenuItem>
                    {contractorEmployees.content.length > 0 ? (
                      contractorEmployees.content.map((employee: ContractorEmployee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        Keine Mitarbeiter verfügbar
                      </MenuItem>
                    )}
                  </Select>
                  {errors.employeeId && <Typography color="error" variant="caption">{errors.employeeId}</Typography>}
                  {contractorEmployees.content.length === 0 && (
                    <Typography color="warning" variant="caption" style={{ display: 'block', marginTop: '4px' }}>
                      Bitte legen Sie zuerst Mitarbeiter für diesen Auftragnehmer an.
                    </Typography>
                  )}
                </FormControl>
                
                <FormControl fullWidth margin="normal" error={!!errors.locationId}>
                  <InputLabel>Standort</InputLabel>
                  <Select
                    name="locationId"
                    value={formData.locationId}
                    onChange={handleSelectChange}
                    label="Standort"
                    required
                  >
                    <MenuItem value="">Standort auswählen</MenuItem>
                    {(locations || []).map((location: Location) => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.locationId && <Typography color="error" variant="caption">{errors.locationId}</Typography>}
                  {(!locations || locations.length === 0) && (
                    <Typography color="warning" variant="caption" style={{ display: 'block', marginTop: '4px' }}>
                      Keine Standorte verfügbar. Bitte legen Sie zuerst Standorte an.
                    </Typography>
                  )}
                </FormControl>
                
                <FormControl fullWidth margin="normal" error={!!errors.instructorId}>
                  <InputLabel>Durchführender</InputLabel>
                  <Select
                    name="instructorId"
                    value={formData.instructorId}
                    onChange={handleSelectChange}
                    label="Durchführender"
                    required
                  >
                    <MenuItem value="">Durchführenden auswählen</MenuItem>
                    {(users?.content || []).map((user: OwnUser) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.instructorId && <Typography color="error" variant="caption">{errors.instructorId}</Typography>}
                  {(!users?.content || users.content.length === 0) && (
                    <Typography color="warning" variant="caption" style={{ display: 'block', marginTop: '4px' }}>
                      Keine Benutzer verfügbar. Bitte legen Sie zuerst Benutzer an.
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Signature Section */}
          {formData.completed ? (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Unterschrift
              </Typography>
              <Typography variant="body1">
                Unterzeichnet von: {formData.signatureName || 'Noch nicht unterzeichnet'}
              </Typography>
              {formData.signatureData && (
                <Box mt={2}>
                  <img src={formData.signatureData} alt="Unterschrift" style={{ maxWidth: '600px', height: 'auto', border: '1px solid #ddd' }} />
                </Box>
              )}
            </Box>
          ) : (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Unterschrift
              </Typography>
              <Typography variant="body1" gutterBottom>
                Diese Sicherheitsunterweisung muss vom Mitarbeiter elektronisch unterzeichnet werden.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenSignatureDialog}
                startIcon={<SaveIcon />}
              >
                Jetzt unterzeichnen
              </Button>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Box display="flex" justifyContent="space-between">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => vendorId ? navigate(`/vendors/${vendorId}/safety-instructions`) : navigate('/app/safety-instructions')}
            >
              Zurück
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={20} /> : (id ? 'Speichern' : 'Erstellen')}
            </Button>
          </Box>
        </form>
        
        {/* Signature Dialog */}
        <SignaturePad
          open={signatureDialogOpen}
          onClose={handleCloseSignatureDialog}
          onSignatureSave={handleSignatureSave}
        />
      </Box>
    </Card>
  );
};

export default SafetyInstructionForm;