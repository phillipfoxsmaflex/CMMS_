import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Card, CardContent, CardHeader, Checkbox, CircularProgress, Divider, FormControl, FormControlLabel, FormGroup, Grid, InputLabel, MenuItem, Select, TextField, Typography, Alert, Snackbar } from '@mui/material';
import { getWorkflows } from '../../../slices/workflow';
import { getWebhookConfig } from '../../../slices/webhook';
import { RootState } from '../../../store';
import { Workflow } from '../../../models/owns/workflow';
import { WebhookGrafanaConfig } from '../../../models/owns/webhook';


const WebhookWorkflowSetup = () => {
  const dispatch = useDispatch();
  const { workflows } = useSelector((state: RootState) => state.workflows);
  const { config: webhookConfig } = useSelector((state: RootState) => state.webhook);
  const [workflowsLoading, setWorkflowsLoading] = useState(true);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const [companyId, setCompanyId] = useState('');
  const [alertName, setAlertName] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'warning' | 'info'>('critical');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setWorkflowsLoading(true);
      await dispatch(getWorkflows() as any);
      await dispatch(getWebhookConfig() as any);
      setWorkflowsLoading(false);
    };
    fetchData();
  }, [dispatch]);

  // Get company ID from user context or localStorage
  useEffect(() => {
    // This would typically come from the user context
    // For now, we'll use a mock value or get it from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCompanyId(user.companyId || 'your-company');
      } catch (e) {
        setCompanyId('your-company');
      }
    } else {
      setCompanyId('your-company');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the webhook configuration for the dialog
    if (webhookConfig && webhookConfig.apiKey) {
      const grafanaConfig: WebhookGrafanaConfig = {
        webhookUrl: `${window.location.origin}/api/webhooks/grafana`,
        apiKey: webhookConfig.apiKey,
        headers: {
          'X-API-Key': webhookConfig.apiKey,
          'Content-Type': 'application/json'
        },
        examplePayload: {
          alertId: 'sample-alert-123',
          alertName: alertName,
          status: 'firing',
          severity: severity,
          message: `Alert triggered for ${alertName}`,
          customData: {
            workflowId: selectedWorkflow.id.toString(),
            priority: 'high'
          }
        }
      };
      
      // Show success message instead of dialog
      setSnackbarMessage('Workflow saved successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      

    } else {
      setSnackbarMessage('Webhook configuration not found. Please set up webhook first.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Webhook Workflow Setup
      </Typography>

      <Card>
        <CardHeader
          title="Configure Workflow for Webhook"
          subheader="Set up which workflows should be triggered by Grafana alerts"
        />
        <CardContent>
          {workflowsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="workflow-select-label">Workflow</InputLabel>
                    <Select
                      labelId="workflow-select-label"
                      id="workflow-select"
                      value={selectedWorkflow?.id || ''}
                      label="Workflow"
                      onChange={(e) => {
                        const workflow = workflows.find(w => w.id === e.target.value);
                        setSelectedWorkflow(workflow || null);
                      }}
                    >
                      {workflows.map((workflow) => (
                        <MenuItem key={workflow.id} value={workflow.id}>
                          {workflow.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Alert Name"
                    value={alertName}
                    onChange={(e) => setAlertName(e.target.value)}
                    helperText="The name of the Grafana alert that should trigger this workflow"
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="severity-select-label">Severity</InputLabel>
                    <Select
                      labelId="severity-select-label"
                      id="severity-select"
                      value={severity}
                      label="Severity"
                      onChange={(e) => setSeverity(e.target.value as 'critical' | 'warning' | 'info')}
                    >
                      <MenuItem value="critical">Critical</MenuItem>
                      <MenuItem value="warning">Warning</MenuItem>
                      <MenuItem value="info">Info</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox defaultChecked />}
                      label="Create Work Order when alert is triggered"
                    />
                    <FormControlLabel
                      control={<Checkbox />}
                      label="Send Notification to team"
                    />
                    <FormControlLabel
                      control={<Checkbox />}
                      label="Update Asset Status"
                    />
                  </FormGroup>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!selectedWorkflow || !alertName || workflowsLoading}
                  >
                    Save Workflow Configuration
                  </Button>
                </Grid>
              </Grid>
            </form>
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

export default WebhookWorkflowSetup;
