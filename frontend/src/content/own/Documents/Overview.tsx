import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DocumentManager from '../components/DocumentManager';
import { useDispatch } from '../../../store';
import { getAllDocuments } from '../../../slices/document';
import { getLocations } from '../../../slices/location';
import { getAssets } from '../../../slices/asset';

const DocumentsOverview = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Fetch all documents, locations, and assets when component mounts
    dispatch(getAllDocuments());
    dispatch(getLocations());
    // Get all assets with empty search criteria
    dispatch(getAssets({ filterFields: [] }));
  }, [dispatch]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>
        {t('all_documents')}
      </Typography>
      
      {/* Reuse the existing DocumentManager component with global view */}
      <DocumentManager 
        entityType="ALL"
        entityId={0} // Special case for all documents
        showGlobalView={true}
      />
    </Box>
  );
};

export default DocumentsOverview;