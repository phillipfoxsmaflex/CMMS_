import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../../store';
import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Divider, Grid, Switch, TextField, Typography, Alert, Snackbar, IconButton, Tooltip } from '@mui/material';
import { ContentCopy, Refresh, Delete, Settings, Visibility, VisibilityOff, Code } from '@mui/icons-material';
import { getWebhookConfig, createWebhookConfig, regenerateApiKey, toggleWebhookEnabled, deleteWebhookConfig } from '../../../slices/webhook';
import { RootState } from '../../../store';

const WebhookConfigPage = () => {
  const dispatch = useDispatch();
  const { config, loading, error } = useSelector((state: RootState) => state.webhook);
  const [showApiKey, setShowApiKey] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [showConfiguration, setShowConfiguration] = useState(false);

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

  const handleCopyToClipboard = (text: string, itemName: string) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage(`${itemName} copied to clipboard`);
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  const handleSaveConfiguration = async () => {
    try {
      // The configuration is already saved when toggling enabled status or regenerating API key
      // This is just to provide feedback that changes are saved
      setSnackbarMessage('Configuration saved successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      setSnackbarMessage('Failed to save configuration');
      setSnackbarSeverity('error');
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
                        variant="contained"
                        color="primary"
                        startIcon={<Code />}
                        onClick={() => setShowConfiguration(!showConfiguration)}
                        disabled={loading}
                      >
                        {showConfiguration ? 'Hide Configuration' : 'Show Configuration'}
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<Settings />}
                        onClick={handleSaveConfiguration}
                        disabled={loading}
                      >
                        Save Configuration
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
                
                {showConfiguration && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>
                      Grafana Webhook Configuration Template
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Copy the following configuration to set up Grafana webhook integration:
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Webhook URL
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={`${window.location.origin}/api/webhooks/grafana`}
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <IconButton 
                                onClick={() => handleCopyToClipboard(`${window.location.origin}/api/webhooks/grafana`, 'Webhook URL')}
                                size="small"
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            )
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        API Key
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={config.apiKey}
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <IconButton 
                                onClick={() => handleCopyToClipboard(config.apiKey, 'API Key')}
                                size="small"
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            )
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Headers
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={`{'X-API-Key': '${config.apiKey}', 'Content-Type': 'application/json'}`}
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <IconButton 
                                onClick={() => handleCopyToClipboard(`{'X-API-Key': '${config.apiKey}', 'Content-Type': 'application/json'}`, 'Headers')}
                                size="small"
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            )
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Example Payload
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          multiline
                          minRows={4}
                          value={JSON.stringify({
                            alertId: 'sample-alert-123',
                            alertName: 'SampleAlert',
                            status: 'firing',
                            severity: 'critical',
                            message: 'Alert triggered for SampleAlert',
                            customData: {
                              workflowId: 'workflow-123',
                              priority: 'high'
                            }
                          }, null, 2)}
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <IconButton 
                                onClick={() => handleCopyToClipboard(JSON.stringify({
                                  alertId: 'sample-alert-123',
                                  alertName: 'SampleAlert',
                                  status: 'firing',
                                  severity: 'critical',
                                  message: 'Alert triggered for SampleAlert',
                                  customData: {
                                    workflowId: 'workflow-123',
                                    priority: 'high'
                                  }
                                }, null, 2), 'Example Payload')}
                                size="small"
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            )
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        cURL Command
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={`curl -X POST '${window.location.origin}/api/webhooks/grafana' \\\n  -H 'X-API-Key: ${config.apiKey}' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"\\n    \"alertId\": \"sample-alert-123\",\\n    \"alertName\": \"SampleAlert\",\\n    \"status\": \"firing\",\\n    \"severity\": \"critical\",\\n    \"message\": \"Alert triggered for SampleAlert\",\\n    \"customData\": {\\\"workflowId\": \"workflow-123\", \\\"priority\": \"high\"}\\n  }'`}
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <IconButton 
                                onClick={() => {
                                  const curlCommand = `curl -X POST '${window.location.origin}/api/webhooks/grafana' \\\n  -H 'X-API-Key: ${config.apiKey}' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"\\n    \"alertId\": \"sample-alert-123\",\\n    \"alertName\": \"SampleAlert\",\\n    \"status\": \"firing\",\\n    \"severity\": \"critical\",\\n    \"message\": \"Alert triggered for SampleAlert\",\\n    \"customData\": {\\\"workflowId\": \"workflow-123\", \\\"priority\": \"high\"}\\n  }'`;
                                  handleCopyToClipboard(curlCommand, 'cURL Command');
                                }}
                                size="small"
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            )
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Grafana Setup Instructions
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="body2" paragraph>
                          1. In Grafana, go to Alerting → Contact points
                        </Typography>
                        <Typography variant="body2" paragraph>
                          2. Click "Add contact point" and select "Webhook"
                        </Typography>
                        <Typography variant="body2" paragraph>
                          3. Paste the Webhook URL above
                        </Typography>
                        <Typography variant="body2" paragraph>
                          4. Add the headers shown above
                        </Typography>
                        <Typography variant="body2" paragraph>
                          5. Use the example payload as a template for your alerts
                        </Typography>
                        <Typography variant="body2" paragraph>
                          6. Test the connection using the cURL command
                        </Typography>
                        <Typography variant="body2" paragraph>
                          7. Save the contact point and use it in your alert rules
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
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
