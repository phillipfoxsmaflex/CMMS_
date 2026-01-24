import { Helmet } from 'react-helmet-async';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import { TitleContext } from '../../../contexts/TitleContext';
import { useDispatch, useSelector } from '../../../store';
import { getAssets } from '../../../slices/asset';
import { getLocations } from '../../../slices/location';
import { AssetDTO } from '../../../models/owns/asset';
import { default as LocationDTO } from '../../../models/owns/location';
import AssetDashboardCard from './AssetDashboardCard';
import LocationDashboardCard from './LocationDashboardCard';
import AlertingDashboard from './AlertingDashboard';
import api from '../../../utils/api';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import PermissionErrorMessage from '../components/PermissionErrorMessage';
import { SearchCriteria } from '../../../models/owns/page';

function AssetMonitoring() {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const { setTitle } = useContext(TitleContext);
  const { hasViewPermission } = useAuth();
  const dispatch = useDispatch();
  const { assets, loadingGet: loadingAssets } = useSelector((state) => state.assets);
const { locations, loadingGet: loadingLocations } = useSelector((state) => state.locations);
  const [alertingDashboardUrl, setAlertingDashboardUrl] = useState<string>('');
  const [loadingSettings, setLoadingSettings] = useState(true);
  const { companySettings } = useAuth();

  useEffect(() => {
    setTitle(t('asset_monitoring'));
  }, [t]);

  useEffect(() => {
    const criteria: SearchCriteria = {
      filterFields: [
        {
          field: 'archived',
          operation: 'eq',
          value: false
        }
      ],
      pageSize: 1000,
      pageNum: 0,
      direction: 'DESC'
    };
    dispatch(getAssets(criteria));
    dispatch(getLocations());
  }, [dispatch]);

  useEffect(() => {
    const fetchAlertingDashboard = async () => {
      if (companySettings?.id) {
        try {
          const response = await api.get<{ url: string; config: string }>(`/company-settings/${companySettings.id}/alerting-dashboard`);
          setAlertingDashboardUrl(response?.url || '');
        } catch (error) {
          console.error('Error fetching alerting dashboard:', error);
        } finally {
          setLoadingSettings(false);
        }
      }
    };
    fetchAlertingDashboard();
  }, [companySettings]);

  const assetsWithDashboards = assets.content.filter(
    (asset: AssetDTO) => asset.dashboardUrl && asset.dashboardUrl.trim() !== ''
  );

  const locationsWithDashboards = locations.filter(
    (location: LocationDTO) => location.dashboardUrl && location.dashboardUrl.trim() !== ''
  );

  // Debug logging
  console.log('Total assets:', assets.content.length);
  console.log('Assets with dashboards:', assetsWithDashboards.length);
  console.log('Assets with dashboard URLs:', assetsWithDashboards.map(a => ({ id: a.id, name: a.name, url: a.dashboardUrl })));

  console.log('Total locations:', locations.length);
  console.log('Locations with dashboards:', locationsWithDashboards.length);
  console.log('Locations with dashboard URLs:', locationsWithDashboards.map(l => ({ id: l.id, name: l.name, url: l.dashboardUrl })));

  if (!hasViewPermission(PermissionEntity.ASSETS)) {
    return <PermissionErrorMessage message={t('no_access_assets')} />;
  }

  if (loadingAssets || loadingLocations || loadingSettings) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('asset_monitoring')}</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Typography variant="h2" gutterBottom>
          {t('asset_monitoring')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {t('asset_monitoring_description')}
        </Typography>

        {alertingDashboardUrl && (
          <Card sx={{ mb: 4, mt: 3 }}>
            <CardContent>
              <Typography variant="h3" gutterBottom>
                {t('alerting_dashboard')}
              </Typography>
              <AlertingDashboard url={alertingDashboardUrl} />
            </CardContent>
          </Card>
        )}

        <Typography variant="h3" sx={{ mt: 4, mb: 3 }}>
          {t('asset_dashboards')}
        </Typography>

        {assetsWithDashboards.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary" align="center">
                {t('no_dashboard_configured')}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {assetsWithDashboards.map((asset: AssetDTO) => (
              <Grid item xs={12} md={6} lg={4} key={asset.id}>
                <AssetDashboardCard asset={asset} />
              </Grid>
            ))}
          </Grid>
        )}

        <Typography variant="h3" sx={{ mt: 4, mb: 3 }}>
          {t('location_dashboards')}
        </Typography>

        {locationsWithDashboards.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary" align="center">
                {t('no_dashboard_configured')}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {locationsWithDashboards.map((location: LocationDTO) => (
              <Grid item xs={12} md={6} lg={4} key={location.id}>
                <LocationDashboardCard location={location} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
}

export default AssetMonitoring;
