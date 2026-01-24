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
import { AssetDTO } from '../../../models/owns/asset';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';

interface AssetDashboardCardProps {
  asset: AssetDTO;
}

function AssetDashboardCard({ asset }: AssetDashboardCardProps) {
  const { t }: { t: any } = useTranslation();
  const navigate = useNavigate();

  const handleOpenExternal = () => {
    if (asset.dashboardUrl) {
      window.open(asset.dashboardUrl, '_blank');
    }
  };

  const handleCardClick = () => {
    navigate(`/app/assets/${asset.id}`);
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
        title={asset.name}
        subheader={`ID: ${asset.id}`}
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
        {asset.dashboardUrl ? (
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
              src={asset.dashboardUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title={`Dashboard for ${asset.name}`}
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

export default AssetDashboardCard;
