import React from 'react';
import { Box, Card, CardContent, CardHeader, Divider, List, ListItem, ListItemIcon, ListItemText, Stepper, Step, StepLabel, StepContent, Typography, Link, Paper } from '@mui/material';
import { CheckCircle, Code, Settings, Webhook, Api, Description, Science, Security } from '@mui/icons-material';

const steps = [
  {
    label: 'Setup Webhook Configuration',
    description: 'Create a webhook configuration and generate an API key',
    icon: <Settings />,
    details: [
      'Navigate to Webhook Configuration page',
      'Click "Setup Webhook Configuration"',
      'Copy the generated API key',
      'Enable the webhook'
    ]
  },
  {
    label: 'Configure Grafana',
    description: 'Set up the webhook in your Grafana instance',
    icon: <Webhook />,
    details: [
      'Go to Grafana Alerting → Contact Points',
      'Click "New contact point"',
      'Select "Webhook" as the type',
      'Enter the CMMS webhook URL',
      'Add X-API-Key header with your API key'
    ]
  },
  {
    label: 'Create Alert Rules',
    description: 'Define alert rules that trigger the webhook',
    icon: <Api />,
    details: [
      'Go to Grafana Alerting → Alert Rules',
      'Click "New alert rule"',
      'Configure your alert conditions',
      'Select the webhook contact point',
      'Save the alert rule'
    ]
  },
  {
    label: 'Setup CMMS Workflows',
    description: 'Configure workflows to handle the alerts',
    icon: <Description />,
    details: [
      'Go to CMMS Workflows',
      'Create a new workflow',
      'Select "Webhook" as trigger type',
      'Configure alert name and severity filters',
      'Define the workflow actions'
    ]
  },
  {
    label: 'Test the Integration',
    description: 'Verify that the integration works correctly',
    icon: <Science />,
    details: [
      'Trigger a test alert in Grafana',
      'Check CMMS for created work orders/requests',
      'Verify email notifications',
      'Check logs for any errors'
    ]
  }
];

const WebhookIntegrationGuide = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Webhook Integration Guide
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardHeader title="Overview" />
        <CardContent>
          <Typography paragraph>
            This guide will help you set up the Grafana Webhook Trigger integration in your CMMS system.
            The integration allows Grafana alerts to automatically trigger workflows in CMMS, enabling
            automated maintenance processes based on real-time monitoring data.
          </Typography>
          <Typography paragraph>
            <strong>Benefits:</strong>
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Automate maintenance workflows based on real-time alerts" /></ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Reduce response time to critical issues" /></ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Improve operational efficiency" /></ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Enhance system reliability" /></ListItem>
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardHeader title="Prerequisites" />
        <CardContent>
          <Typography paragraph>
            Before you begin, ensure you have:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Security /></ListItemIcon>
              <ListItemText primary="Admin access to your CMMS system" /></ListItem>
            <ListItem>
              <ListItemIcon><Security /></ListItemIcon>
              <ListItemText primary="Admin access to your Grafana instance" /></ListItem>
            <ListItem>
              <ListItemIcon><Webhook /></ListItemIcon>
              <ListItemText primary="Grafana version 8.0 or higher" /></ListItem>
            <ListItem>
              <ListItemIcon><Code /></ListItemIcon>
              <ListItemText primary="Network connectivity between Grafana and CMMS" /></ListItem>
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Step-by-Step Setup" />
        <CardContent>
          <Stepper orientation="vertical" activeStep={-1}>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel
                  icon={step.icon}
                >
                  <Typography variant="subtitle1">{step.label}</Typography>
                  <Typography variant="caption">{step.description}</Typography>
                </StepLabel>
                <StepContent>
                  <Paper sx={{ p: 2, mt: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Detailed Steps:
                    </Typography>
                    <List dense>
                      {step.details.map((detail, detailIndex) => (
                        <ListItem key={detailIndex}>
                          <ListItemIcon>
                            <Box width={24} />
                          </ListItemIcon>
                          <ListItemText primary={detail} /></ListItem>
                      ))}
                    </List>
                  </Paper>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardHeader title="Troubleshooting" />
        <CardContent>
          <Typography paragraph>
            If you encounter issues:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="401 Unauthorized: Check your API key and ensure it's correctly configured" /></ListItem>
            <ListItem>
              <ListItemText primary="429 Too Many Requests: Reduce the frequency of alerts or increase rate limits" /></ListItem>
            <ListItem>
              <ListItemText primary="No workflow triggered: Verify alert name and severity match your workflow configuration" /></ListItem>
            <ListItem>
              <ListItemText primary="Check CMMS logs for detailed error information" /></ListItem>
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardHeader title="Best Practices" />
        <CardContent>
          <Typography paragraph>
            Follow these best practices for optimal integration:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Use specific alert names for easy workflow matching" /></ListItem>
            <ListItem>
              <ListItemText primary="Test your configuration before deploying to production" /></ListItem>
            <ListItem>
              <ListItemText primary="Monitor webhook performance and error rates" /></ListItem>
            <ListItem>
              <ListItemText primary="Rotate API keys regularly for security" /></ListItem>
            <ListItem>
              <ListItemText primary="Use different severity levels for different escalation paths" /></ListItem>
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardHeader title="API Reference" />
        <CardContent>
          <Typography paragraph>
            Webhook Endpoint: <code>POST /api/webhooks/grafana</code>
          </Typography>
          <Typography paragraph>
            Headers:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="X-API-Key: Your_API_Key_Here" /></ListItem>
            <ListItem>
              <ListItemText primary="Content-Type: application/json" /></ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            Example Payload:
          </Typography>
          <Paper sx={{ p: 2, fontFamily: 'monospace', backgroundColor: '#f5f5f5' }}>
            {`{
  "alertId": "alert-123",
  "alertName": "HighTemperatureAlert",
  "status": "firing",
  "severity": "critical",
  "message": "Temperature exceeded threshold",
  "customData": {
    "priority": "high"
  }
}`}
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WebhookIntegrationGuide;
