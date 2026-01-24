import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch, RootState } from 'src/store';
import {
  getSafetyInstructions,
  deleteSafetyInstruction,
  getSafetyInstructionsByVendor
} from 'src/slices/safetyInstruction';
import { getContractorEmployees } from 'src/slices/contractorEmployee';
import { getLocations } from 'src/slices/location';
import { getVendors } from 'src/slices/vendor';
import { SafetyInstruction } from 'src/models/owns/safetyInstruction';
import { ContractorEmployee } from 'src/models/owns/contractorEmployee';
import Location from 'src/models/owns/location';
import { Vendor } from 'src/models/owns/vendor';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TablePagination,
  CircularProgress,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { SearchCriteria } from 'src/models/owns/page';

const SafetyInstructionListDebug: React.FC<{ vendorId?: number }> = ({ vendorId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { safetyInstructions, loadingGet } = useSelector((state: RootState) => state.safetyInstructions);
  const { contractorEmployees } = useSelector((state: RootState) => state.contractorEmployees);
  const { locations } = useSelector((state: RootState) => state.locations);
  const { vendors } = useSelector((state: RootState) => state.vendors);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    console.log('Loading related data...');
    
    const employeeCriteria: SearchCriteria = {
      pageNum: 0,
      pageSize: 1000,
      sortField: 'firstName',
      direction: 'ASC',
      filterFields: []
    };
    
    const vendorCriteria: SearchCriteria = {
      pageNum: 0,
      pageSize: 1000,
      sortField: 'companyName',
      direction: 'ASC',
      filterFields: []
    };
    
    dispatch(getContractorEmployees(employeeCriteria));
    dispatch(getLocations());
    dispatch(getVendors(vendorCriteria));
  }, [dispatch]);

  useEffect(() => {
    if (vendorId) {
      dispatch(getSafetyInstructionsByVendor(vendorId));
    } else {
      const criteria: SearchCriteria = {
        pageNum: page,
        pageSize: rowsPerPage,
        sortField: 'createdAt',
        direction: 'DESC',
        filterFields: []
      };
      dispatch(getSafetyInstructions(criteria));
    }
  }, [dispatch, page, rowsPerPage, vendorId]);

  // Debug: Log the loaded data
  useEffect(() => {
    console.log('=== DEBUG: Safety Instruction List Data ===');
    console.log('Safety Instructions:', safetyInstructions);
    console.log('Contractor Employees:', contractorEmployees);
    console.log('Locations:', locations);
    console.log('Vendors:', vendors);
    
    // Test the helper functions with the known data
    if (safetyInstructions?.content?.length > 0) {
      const firstInstruction = safetyInstructions.content[0];
      console.log('Testing helper functions with first instruction:', firstInstruction);
      console.log('Employee name for ID', firstInstruction.employeeId, ':', getEmployeeName(firstInstruction.employeeId));
      console.log('Location name for ID', firstInstruction.locationId, ':', getLocationName(firstInstruction.locationId));
      console.log('Vendor name for ID', firstInstruction.vendorId, ':', getVendorName(firstInstruction.vendorId));
    }
  }, [safetyInstructions, contractorEmployees, locations, vendors]);

  const getEmployeeName = (employeeId: number) => {
    if (!employeeId || employeeId === 0) return 'Unbekannt';
    try {
      console.log(`getEmployeeName: Looking for employee ID ${employeeId}`);
      console.log('Available employees:', contractorEmployees);
      
      // Handle different data structures
      let employeesArray = [];
      if (contractorEmployees?.content) {
        employeesArray = contractorEmployees.content;
      } else if (Array.isArray(contractorEmployees)) {
        employeesArray = contractorEmployees;
      }
      
      const employee = employeesArray.find(emp => emp.id === employeeId);
      console.log(`Found employee ${employeeId}:`, employee);
      
      if (employee) {
        const name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
        return name || 'Unbekannt';
      }
      return 'Unbekannt';
    } catch (error) {
      console.error('Error getting employee name:', error);
      return 'Fehler';
    }
  };

  const getLocationName = (locationId: number) => {
    if (!locationId || locationId === 0) return 'Unbekannt';
    try {
      console.log(`getLocationName: Looking for location ID ${locationId}`);
      console.log('Available locations:', locations);
      
      const location = locations?.find(loc => loc.id === locationId);
      console.log(`Found location ${locationId}:`, location);
      
      return location ? location.name : 'Unbekannt';
    } catch (error) {
      console.error('Error getting location name:', error);
      return 'Fehler';
    }
  };

  const getVendorName = (vendorId: number | null | undefined) => {
    if (!vendorId || vendorId === 0) return 'Kein Auftragnehmer';
    try {
      console.log(`getVendorName: Looking for vendor ID ${vendorId}`);
      console.log('Available vendors:', vendors);
      
      // Handle different data structures
      let vendorsArray = [];
      if (vendors?.content) {
        vendorsArray = vendors.content;
      } else if (Array.isArray(vendors)) {
        vendorsArray = vendors;
      }
      
      const vendor = vendorsArray.find(v => v.id === vendorId);
      console.log(`Found vendor ${vendorId}:`, vendor);
      
      return vendor ? vendor.companyName : 'Unbekannt';
    } catch (error) {
      console.error('Error getting vendor name:', error);
      return 'Fehler';
    }
  };

  const getEmployeeVendor = (employeeId: number) => {
    if (!employeeId || employeeId === 0) return 'Unbekannt';
    try {
      const employee = contractorEmployees?.content?.find(emp => emp.id === employeeId);
      console.log(`Looking for employee vendor ${employeeId}:`, employee);
      if (!employee) return 'Unbekannt';
      
      if (employee.vendorId) {
        return getVendorName(employee.vendorId);
      } else if (employee.customerId) {
        return 'Kunde';
      } else {
        return 'Kein Auftragnehmer/Kunde';
      }
    } catch (error) {
      console.error('Error getting employee vendor:', error);
      return 'Fehler';
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Sicherheitsunterweisung löschen möchten?')) {
      dispatch(deleteSafetyInstruction(id));
    }
  };

  const handleEdit = (id: number) => {
    try {
      navigate(`/app/safety-instructions/${id}/edit`);
    } catch (error) {
      console.error('Error navigating to edit:', error);
    }
  };

  const handleAdd = () => {
    navigate('/app/safety-instructions/create');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: de });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (completed: boolean, expirationDate: string) => {
    if (!completed) return 'warning';
    
    const expiration = new Date(expirationDate);
    const now = new Date();
    const diffDays = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'error';
    if (diffDays < 30) return 'warning';
    return 'success';
  };

  const getStatusText = (completed: boolean, expirationDate: string) => {
    if (!completed) return 'Nicht abgeschlossen';
    
    const expiration = new Date(expirationDate);
    const now = new Date();
    const diffDays = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Abgelaufen';
    if (diffDays < 30) return `Läuft ab in ${diffDays} Tagen`;
    return 'Aktiv';
  };

  return (
    <Card>
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
        <Typography variant="h3">Sicherheitsunterweisungen</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Neue Unterweisung
        </Button>
      </Box>
      
      {loadingGet ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titel</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Mitarbeiter</TableCell>
                  <TableCell>Auftragnehmer/Lieferant</TableCell>
                  <TableCell>Standort</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Gültig bis</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {safetyInstructions.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Keine Sicherheitsunterweisungen gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  safetyInstructions.content.map((instruction: SafetyInstruction) => (
                    <TableRow key={instruction.id}>
                      <TableCell>{instruction.title}</TableCell>
                      <TableCell>{instruction.type}</TableCell>
                      <TableCell>{getEmployeeName(instruction.employeeId)}</TableCell>
                      <TableCell>{getEmployeeVendor(instruction.employeeId)}</TableCell>
                      <TableCell>{getLocationName(instruction.locationId)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(instruction.completed, instruction.expirationDate)}
                          color={getStatusColor(instruction.completed, instruction.expirationDate)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(instruction.expirationDate)}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(instruction.id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(instruction.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={safetyInstructions.totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Zeilen pro Seite:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
          />
        </>
      )}
    </Card>
  );
};

export default SafetyInstructionListDebug;