import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import { TitleContext } from '../../../../contexts/TitleContext';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import api from '../../../../utils/api';
import useAuth from '../../../../hooks/useAuth';

function AlertingDashboardSettings() {
  const { t }: { t: any } = useTranslation();
  const { setTitle } = useContext(TitleContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { companySettings } = useAuth();
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(t('alerting_dashboard_settings'));
  }, [t]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (companySettings?.id) {
        try {
          const response = await api.get<{ url: string; config: string }>(`/company-settings/${companySettings.id}/alerting-dashboard`);
          setDashboardUrl(response?.url || '');
        } catch (error) {
          console.error('Error fetching alerting dashboard settings:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSettings();
  }, [companySettings]);

  const handleSave = async () => {
    if (!companySettings?.id) return;
    
    setSaving(true);
    try {
      await api.post(`/company-settings/${companySettings.id}/alerting-dashboard`, {
        url: dashboardUrl,
        config: null
      });
      showSnackBar(t('alerting_dashboard_settings_saved'), 'success');
    } catch (error) {
      console.error('Error saving alerting dashboard settings:', error);
      showSnackBar(t('error_saving_alerting_dashboard_settings'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
        <title>{t('alerting_dashboard_settings')}</title>
      </Helmet>

      <Box p={3}>
        <Typography variant="h2" gutterBottom>
          {t('alerting_dashboard_settings')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {t('alerting_dashboard_url_help')}
        </Typography>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              label={t('alerting_dashboard_url')}
              value={dashboardUrl}
              onChange={(e) => setDashboardUrl(e.target.value)}
              placeholder="https://grafana.example.com/d/alerting"
              sx={{ mb: 2 }}
              helperText={t('alerting_dashboard_url_help')}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : t('save_settings')}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

export default AlertingDashboardSettings;
