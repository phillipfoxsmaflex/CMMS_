import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import { AssetDTO } from '../../../models/owns/asset';
import api from '../../../utils/api';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';

interface AssetDashboardSettingsProps {
  asset: AssetDTO;
  onUpdate?: () => void;
}

function AssetDashboardSettings({ asset, onUpdate }: AssetDashboardSettingsProps) {
  const { t }: { t: any } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Guard clause for undefined asset
  if (!asset) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="body2" color="error">
            {t('asset_not_found')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    if (asset?.dashboardUrl) {
      setDashboardUrl(asset.dashboardUrl);
    }
  }, [asset]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post(`/assets/${asset?.id}/dashboard`, {
        url: dashboardUrl,
        config: null
      });
      showSnackBar(t('dashboard_config_saved'), 'success');
      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error saving dashboard config:', error);
      showSnackBar(t('error_saving_dashboard_config'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          {t('dashboard_settings')}
        </Typography>

        {isEditing ? (
          <Box>
            <TextField
              fullWidth
              label={t('dashboard_url')}
              value={dashboardUrl}
              onChange={(e) => setDashboardUrl(e.target.value)}
              placeholder="https://grafana.example.com/d/dashboard-id"
              sx={{ mb: 2 }}
              helperText={t('dashboard_url_help')}
            />

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={loading}
              >
                {t('save_dashboard_settings')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                  setDashboardUrl(asset?.dashboardUrl || '');
                }}
                disabled={loading}
              >
                {t('cancel')}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            {dashboardUrl ? (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('dashboard_url')}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, wordBreak: 'break-all' }}>
                  {dashboardUrl}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('no_dashboard_configured')}
              </Typography>
            )}
            <Button variant="contained" onClick={() => setIsEditing(true)}>
              {t('edit_dashboard_settings')}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default AssetDashboardSettings;
