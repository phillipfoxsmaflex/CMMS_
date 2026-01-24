import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Card, CardContent, CardHeader, Checkbox, CircularProgress, Divider, FormControl, FormControlLabel, FormGroup, Grid, InputLabel, MenuItem, Select, TextField, Typography, Alert, Snackbar } from '@mui/material';
import { getWorkflows } from '../../../slices/workflow';
import { RootState } from '../../../store';
import { Workflow } from '../../../models/owns/workflow';

const WebhookWorkflowSetup = () => {
  const dispatch = useDispatch();
  const { workflows } = useSelector((state: RootState) => state.workflows);
  const [workflowsLoading, setWorkflowsLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [alertName, setAlertName] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'warning' | 'info'>('critical');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const fetchData = async () => {
      setWorkflowsLoading(true);
      await dispatch(getWorkflows() as any);
      setWorkflowsLoading(false);
    };
    fetchData();
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hier würde die Workflow-Konfiguration gespeichert werden
    setSnackbarMessage('Workflow configuration saved successfully');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
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
