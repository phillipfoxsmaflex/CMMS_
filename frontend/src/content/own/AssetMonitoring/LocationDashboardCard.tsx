import {
  Card,
  CardContent,
  CardHeader,
  Box,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { default as LocationDTO } from '../../../models/owns/location';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';

interface LocationDashboardCardProps {
  location: LocationDTO;
}

function LocationDashboardCard({ location }: LocationDashboardCardProps) {
  const { t }: { t: any } = useTranslation();
  const navigate = useNavigate();

  const handleOpenExternal = () => {
    if (location.dashboardUrl) {
      window.open(location.dashboardUrl, '_blank');
    }
  };

  const handleCardClick = () => {
    navigate(`/app/locations/${location.id}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: 4
        }
      }}
    >
      <CardHeader
        title={location.name}
        subheader={`ID: ${location.id}`}
        action={
          <Tooltip title={t('view_dashboard')}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleOpenExternal();
              }}
              size="small"
            >
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
        }
        onClick={handleCardClick}
        sx={{
          pb: 1
        }}
      />
      <CardContent
        sx={{
          flexGrow: 1,
          pt: 0,
          '&:last-child': { pb: 2 }
        }}
      >
        {location.dashboardUrl ? (
          <Box
            sx={{
              width: '100%',
              height: 300,
              position: 'relative',
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: 'background.default'
            }}
          >
            <iframe
              src={location.dashboardUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title={`Dashboard for ${location.name}`}
            />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" align="center">
            {t('no_dashboard_configured')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default LocationDashboardCard;