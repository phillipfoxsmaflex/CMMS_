import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../../store';
import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Divider, Grid, Switch, TextField, Typography, Alert, Snackbar, IconButton, Tooltip } from '@mui/material';
import { ContentCopy, Refresh, Delete, Settings, Visibility, VisibilityOff } from '@mui/icons-material';
import { getWebhookConfig, createWebhookConfig, regenerateApiKey, toggleWebhookEnabled, deleteWebhookConfig } from '../../../slices/webhook';
import { RootState } from '../../../store';

const WebhookConfigPage = () => {
  const dispatch = useDispatch();
  const { config, loading, error } = useSelector((state: RootState) => state.webhook);
  const [showApiKey, setShowApiKey] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    dispatch(getWebhookConfig());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  }, [error]);

  const handleCreateConfig = async () => {
    try {
      await dispatch(createWebhookConfig());
      setSnackbarMessage('Webhook configuration created successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleRegenerateApiKey = async () => {
    try {
      await dispatch(regenerateApiKey());
      setSnackbarMessage('API key regenerated successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    try {
      await dispatch(toggleWebhookEnabled(enabled));
      setSnackbarMessage(`Webhook ${enabled ? 'enabled' : 'disabled'} successfully`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleDeleteConfig = async () => {
    try {
      await dispatch(deleteWebhookConfig());
      setSnackbarMessage('Webhook configuration deleted successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleCopyApiKey = () => {
    if (config?.apiKey) {
      navigator.clipboard.writeText(config.apiKey);
      setSnackbarMessage('API key copied to clipboard');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Grafana Webhook Configuration
      </Typography>

      <Card>
        <CardHeader
          title="Webhook Settings"
          subheader="Configure Grafana webhook integration"
        />
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {!config ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Settings />}
                    onClick={handleCreateConfig}
                    disabled={loading}
                  >
                    Setup Webhook Configuration
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      API Key
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={showApiKey ? config.apiKey : '••••••••••••••••••••••••••••••••'}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <IconButton onClick={handleCopyApiKey} size="small">
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          )
                        }}
                      />
                      <Tooltip title={showApiKey ? "Hide API Key" : "Show API Key"}>
                        <IconButton onClick={() => setShowApiKey(!showApiKey)}>
                          {showApiKey ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Status
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Switch
                        checked={config.enabled}
                        onChange={(e) => handleToggleEnabled(e.target.checked)}
                        color="primary"
                      />
                      <Typography>
                        {config.enabled ? 'Enabled' : 'Disabled'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Created
                    </Typography>
                    <Typography>
                      {new Date(config.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Last Updated
                    </Typography>
                    <Typography>
                      {new Date(config.updatedAt).toLocaleString()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Refresh />}
                        onClick={handleRegenerateApiKey}
                        disabled={loading}
                      >
                        Regenerate API Key
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={handleDeleteConfig}
                        disabled={loading}
                      >
                        Delete Configuration
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={() => setOpenSnackbar(false)}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WebhookConfigPage;
