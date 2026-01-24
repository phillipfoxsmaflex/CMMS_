import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { editRole } from '../../../../slices/role';
import { PermissionEntity, Role } from '../../../../models/owns/role';
import { useTranslation } from 'react-i18next';
import { useContext, useState, useEffect } from 'react';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import { useDispatch } from '../../../../store';
import { useBrand } from '../../../../hooks/useBrand';
import { PermissionMatrix } from './PermissionMatrix';

interface EditRoleProps {
  role: Role;
  formatValues: (values, defaultPermissions: boolean) => any;
  open: boolean;
  onClose: () => void;
}
function EditRole({ role, open, onClose, formatValues }: EditRoleProps) {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const brandConfig = useBrand();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  
  // State for new permission matrix
  const [matrixViewPermissions, setMatrixViewPermissions] = useState<PermissionEntity[]>([]);
  const [matrixCreatePermissions, setMatrixCreatePermissions] = useState<PermissionEntity[]>([]);
  const [matrixEditPermissions, setMatrixEditPermissions] = useState<PermissionEntity[]>([]);
  const [matrixDeletePermissions, setMatrixDeletePermissions] = useState<PermissionEntity[]>([]);
  
  // Load permissions when dialog opens
  useEffect(() => {
    if (role && open) {
      setMatrixViewPermissions(role.viewPermissions || role.viewOtherPermissions || []);
      setMatrixCreatePermissions(role.createPermissions || []);
      setMatrixEditPermissions(role.editPermissions || role.editOtherPermissions || []);
      setMatrixDeletePermissions(role.deletePermissions || role.deleteOtherPermissions || []);
    }
  }, [role, open]);
  
  const handleMatrixPermissionChange = (
    permissionType: 'view' | 'create' | 'edit' | 'delete',
    entity: PermissionEntity,
    checked: boolean
  ) => {
    const updatePermissions = (
      current: PermissionEntity[],
      setter: (perms: PermissionEntity[]) => void
    ) => {
      if (checked) {
        if (!current.includes(entity)) {
          setter([...current, entity]);
        }
      } else {
        setter(current.filter((e) => e !== entity));
      }
    };

    switch (permissionType) {
      case 'view':
        updatePermissions(matrixViewPermissions, setMatrixViewPermissions);
        break;
      case 'create':
        updatePermissions(matrixCreatePermissions, setMatrixCreatePermissions);
        break;
      case 'edit':
        updatePermissions(matrixEditPermissions, setMatrixEditPermissions);
        break;
      case 'delete':
        updatePermissions(matrixDeletePermissions, setMatrixDeletePermissions);
        break;
    }
  };
  
  const onEditSuccess = () => {
    onClose();
    showSnackBar(t('changes_saved_success'), 'success');
  };
  const onEditFailure = (err) => showSnackBar(t('role_edit_failure'), 'error');

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          p: 3
        }}
      >
        <Typography variant="h4" gutterBottom>
          {t('edit_role')}
        </Typography>
        <Typography variant="subtitle2">
          {t('edit_role_description')}
        </Typography>
      </DialogTitle>
      <Formik
        initialValues={{
          ...role,
          createPeopleTeams: role?.createPermissions.includes(
            PermissionEntity.PEOPLE_AND_TEAMS
          ),
          createCategories: role?.createPermissions.includes(
            PermissionEntity.CATEGORIES
          ),
          deleteWorkOrders: role?.deleteOtherPermissions.includes(
            PermissionEntity.WORK_ORDERS
          ),
          deletePreventiveMaintenanceTrigger:
            role?.deleteOtherPermissions.includes(
              PermissionEntity.PREVENTIVE_MAINTENANCES
            ),
          deleteLocations: role?.deleteOtherPermissions.includes(
            PermissionEntity.LOCATIONS
          ),
          editFloorPlans: role?.editOtherPermissions.includes(
            PermissionEntity.FLOOR_PLANS
          ),
          deleteFloorPlans: role?.deleteOtherPermissions.includes(
            PermissionEntity.FLOOR_PLANS
          ),
          deleteAssets: role?.deleteOtherPermissions.includes(
            PermissionEntity.ASSETS
          ),
          deletePartsAndSets: role?.deleteOtherPermissions.includes(
            PermissionEntity.PARTS_AND_MULTIPARTS
          ),
          deletePurchaseOrders: role?.deleteOtherPermissions.includes(
            PermissionEntity.PURCHASE_ORDERS
          ),
          deleteMeters: role?.deleteOtherPermissions.includes(
            PermissionEntity.METERS
          ),
          deleteVendorsCustomers: role?.deleteOtherPermissions.includes(
            PermissionEntity.VENDORS_AND_CUSTOMERS
          ),
          deleteCategories: role?.deleteOtherPermissions.includes(
            PermissionEntity.CATEGORIES
          ),
          deleteFiles: role?.deleteOtherPermissions.includes(
            PermissionEntity.DOCUMENTS
          ),
          deletePeopleTeams: role?.deleteOtherPermissions.includes(
            PermissionEntity.PEOPLE_AND_TEAMS
          ),
          accessSettings: role?.viewPermissions.includes(
            PermissionEntity.SETTINGS
          ),
          submit: null
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().max(255).required(t('required_name')),
          description: Yup.string().max(255).nullable(),
          externalId: Yup.string().max(255).nullable()
        })}
        onSubmit={async (
          _values,
          { resetForm, setErrors, setStatus, setSubmitting }
        ) => {
          const formattedValues = formatValues({ ...role, ..._values }, false);
          
          // IMPORTANT: Override with new permission structure from matrix
          // This ensures matrix values take precedence over old checkbox values
          formattedValues.viewPermissions = [...matrixViewPermissions];
          formattedValues.createPermissions = [...matrixCreatePermissions];
          formattedValues.editPermissions = [...matrixEditPermissions];
          formattedValues.deletePermissions = [...matrixDeletePermissions];
          
          // Keep legacy fields for backward compatibility
          formattedValues.viewOtherPermissions = [...matrixViewPermissions];
          formattedValues.editOtherPermissions = [...matrixEditPermissions];
          formattedValues.deleteOtherPermissions = [...matrixDeletePermissions];
          
          console.log('Saving role with permissions:', {
            viewPermissions: formattedValues.viewPermissions,
            createPermissions: formattedValues.createPermissions,
            editPermissions: formattedValues.editPermissions,
            deletePermissions: formattedValues.deletePermissions
          });
          
          setSubmitting(true);
          return dispatch(editRole(role.id, formattedValues))
            .then(onEditSuccess)
            .catch(onEditFailure)
            .finally(() => setSubmitting(false));
        }}
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          touched,
          values
        }) => (
          <form onSubmit={handleSubmit}>
            <DialogContent
              dividers
              sx={{
                p: 3
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        error={Boolean(touched.name && errors.name)}
                        fullWidth
                        helperText={touched.name && errors.name}
                        label={t('name')}
                        name="name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.name}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        error={Boolean(
                          touched.description && errors.description
                        )}
                        fullWidth
                        helperText={touched.description && errors.description}
                        label={t('description')}
                        name="description"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.description}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        error={Boolean(touched.externalId && errors.externalId)}
                        fullWidth
                        helperText={touched.externalId && errors.externalId}
                        label={t('external_id')}
                        name="externalId"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.externalId}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 4 }} />
              
              <Box sx={{ px: 3, pb: 3 }}>
                <PermissionMatrix
                  viewPermissions={matrixViewPermissions}
                  createPermissions={matrixCreatePermissions}
                  editPermissions={matrixEditPermissions}
                  deletePermissions={matrixDeletePermissions}
                  onPermissionChange={handleMatrixPermissionChange}
                  disabled={isSubmitting}
                />
              </Box>
            </DialogContent>
            <DialogActions
              sx={{
                p: 3
              }}
            >
              <Button color="secondary" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                startIcon={
                  isSubmitting ? <CircularProgress size="1rem" /> : null
                }
                disabled={Boolean(errors.submit) || isSubmitting}
                variant="contained"
              >
                {t('save')}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
}
export default EditRole;
