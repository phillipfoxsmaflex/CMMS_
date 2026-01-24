import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface AlertingDashboardProps {
  url: string;
}

function AlertingDashboard({ url }: AlertingDashboardProps) {
  const { t }: { t: any } = useTranslation();

  if (!url || url.trim() === '') {
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        {t('no_dashboard_configured')}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: 500,
        position: 'relative',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.default'
      }}
    >
      <iframe
        src={url}
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        title="Alerting Dashboard"
      />
    </Box>
  );
}

export default AlertingDashboard;
