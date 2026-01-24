import {
  Box,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { PermissionEntity } from '../../../../models/owns/role';
import { getModuleName } from '../../../../utils/roles';

interface PermissionMatrixProps {
  viewPermissions: PermissionEntity[];
  createPermissions: PermissionEntity[];
  editPermissions: PermissionEntity[];
  deletePermissions: PermissionEntity[];
  onPermissionChange: (
    permissionType: 'view' | 'create' | 'edit' | 'delete',
    entity: PermissionEntity,
    checked: boolean
  ) => void;
  disabled?: boolean;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  viewPermissions,
  createPermissions,
  editPermissions,
  deletePermissions,
  onPermissionChange,
  disabled = false
}) => {
  // Get all available modules
  const allModules = Object.values(PermissionEntity);
  
  const isChecked = (
    permissionType: 'view' | 'create' | 'edit' | 'delete',
    entity: PermissionEntity
  ): boolean => {
    const currentPermissions = {
      view: viewPermissions,
      create: createPermissions,
      edit: editPermissions,
      delete: deletePermissions
    }[permissionType];
    
    return currentPermissions.includes(entity);
  };
  
  const handleCheckboxChange = (
    permissionType: 'view' | 'create' | 'edit' | 'delete',
    entity: PermissionEntity
  ) => {
    const currentlyChecked = isChecked(permissionType, entity);
    onPermissionChange(permissionType, entity, !currentlyChecked);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        {disabled ? 'Berechtigungsmatrix' : 'Berechtigungsmatrix (NEU)'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {disabled 
          ? 'Übersicht über alle Berechtigungen dieser Rolle für jedes Modul.'
          : 'Legen Sie fest, welche Aktionen diese Rolle für jedes Modul ausführen darf.'
        }
      </Typography>
      
      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="bold">
                  Modul
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2" fontWeight="bold">
                  Ansehen
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2" fontWeight="bold">
                  Erstellen
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2" fontWeight="bold">
                  Bearbeiten
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2" fontWeight="bold">
                  Löschen
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allModules.map((entity) => {
              const moduleName = getModuleName(entity);
              
              return (
                <TableRow key={entity} hover>
                  <TableCell>
                    <Typography variant="body2">{moduleName}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={isChecked('view', entity)}
                      onChange={() => handleCheckboxChange('view', entity)}
                      disabled={disabled}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={isChecked('create', entity)}
                      onChange={() => handleCheckboxChange('create', entity)}
                      disabled={disabled}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={isChecked('edit', entity)}
                      onChange={() => handleCheckboxChange('edit', entity)}
                      disabled={disabled}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={isChecked('delete', entity)}
                      onChange={() => handleCheckboxChange('delete', entity)}
                      disabled={disabled}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {!disabled && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            💡 <strong>Hinweis:</strong> Diese neue Berechtigungsmatrix zeigt alle {allModules.length} Module. Die alten Checkboxen oben bleiben vorerst bestehen.
          </Typography>
        </Box>
      )}
    </Box>
  );
};
