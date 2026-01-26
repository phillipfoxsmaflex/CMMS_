import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, TextField, IconButton, Tooltip, Divider } from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';
import { WebhookGrafanaConfig } from '../../models/owns/webhook';

interface WebhookConfigurationDialogProps {
  open: boolean;
  onClose: () => void;
  config: WebhookGrafanaConfig;
  companyId: string;
}

const WebhookConfigurationDialog: React.FC<WebhookConfigurationDialogProps> = ({ 
  open, 
  onClose, 
  config, 
  companyId 
}) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getFullWebhookUrl = () => {
    // Construct the full webhook URL based on the environment
    // In production, this would be the actual domain
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/webhooks/grafana`;
  };
  
  const getCurlCommand = () => {
    return `curl -X POST ${getFullWebhookUrl()}\
` +
           `  -H "X-API-Key: ${config.apiKey}"\\n` +
           `  -H "Content-Type: application/json"\\n` +
           `  -d '${JSON.stringify(config.examplePayload, null, 2)}'`;
  };
  
  const getGrafanaConfiguration = () => {
    return {
      name: `CMMS Webhook - Company ${companyId}`,
      type: "webhook",
      url: getFullWebhookUrl(),
      headers: config.headers,
      alertConfig: {
        alertName: config.examplePayload.alertName,
        severity: config.examplePayload.severity
      }
    };
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          🎉 Webhook Configuration Ready!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Your webhook is configured and ready to use with Grafana
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box mt={2} mb={3}>
          <Typography variant="h6" gutterBottom>
            📋 Configuration Details
          </Typography>
          
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Webhook URL
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                fullWidth
                variant="outlined"
                value={getFullWebhookUrl()}
                size="small"
                InputProps={{ readOnly: true }}
              />
              <Tooltip title={copied ? "Copied!" : "Copy URL"}>
                <IconButton onClick={() => handleCopy(getFullWebhookUrl())} color="primary">
                  {copied ? <Check /> : <ContentCopy />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              API Key
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                fullWidth
                variant="outlined"
                value={config.apiKey}
                size="small"
                type="password"
                InputProps={{ readOnly: true }}
              />
              <Tooltip title={copied ? "Copied!" : "Copy API Key"}>
                <IconButton onClick={() => handleCopy(config.apiKey)} color="primary">
                  {copied ? <Check /> : <ContentCopy />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Required Headers
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                fullWidth
                variant="outlined"
                value={JSON.stringify(config.headers, null, 2)}
                size="small"
                multiline
                rows={3}
                InputProps={{ readOnly: true }}
              />
              <Tooltip title={copied ? "Copied!" : "Copy Headers"}>
                <IconButton onClick={() => handleCopy(JSON.stringify(config.headers, null, 2))} color="primary">
                  {copied ? <Check /> : <ContentCopy />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Example Payload
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                fullWidth
                variant="outlined"
                value={JSON.stringify(config.examplePayload, null, 2)}
                size="small"
                multiline
                rows={6}
                InputProps={{ readOnly: true, style: { fontFamily: 'monospace', fontSize: '0.875rem' } }}
              />
              <Tooltip title={copied ? "Copied!" : "Copy Payload"}>
                <IconButton onClick={() => handleCopy(JSON.stringify(config.examplePayload, null, 2))} color="primary">
                  {copied ? <Check /> : <ContentCopy />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              cURL Command (for testing)
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                fullWidth
                variant="outlined"
                value={getCurlCommand()}
                size="small"
                multiline
                rows={6}
                InputProps={{ readOnly: true, style: { fontFamily: 'monospace', fontSize: '0.875rem' } }}
              />
              <Tooltip title={copied ? "Copied!" : "Copy cURL Command"}>
                <IconButton onClick={() => handleCopy(getCurlCommand())} color="primary">
                  {copied ? <Check /> : <ContentCopy />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box>
            <Typography variant="h6" gutterBottom>
              📖 Grafana Setup Instructions
            </Typography>
            <Typography variant="body2" paragraph>
              1. Go to Grafana → Alerting → Contact Points
            </Typography>
            <Typography variant="body2" paragraph>
              2. Click "New contact point" and select "Webhook"
            </Typography>
            <Typography variant="body2" paragraph>
              3. Paste the Webhook URL and add the X-API-Key header
            </Typography>
            <Typography variant="body2" paragraph>
              4. Use this configuration in your alert rules
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WebhookConfigurationDialog;