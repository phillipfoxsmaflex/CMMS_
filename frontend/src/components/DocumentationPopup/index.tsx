import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SupportTwoToneIcon from '@mui/icons-material/SupportTwoTone';

const DocumentationDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '90vw',
    maxWidth: '1200px',
    height: '90vh',
    maxHeight: '800px',
    [theme.breakpoints.down('sm')]: {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      margin: 0,
      borderRadius: 0
    }
  }
}));

const DocumentationHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper
}));

const DocumentationContent = styled(Box)(({ theme }) => ({
  height: 'calc(100% - 64px)',
  overflow: 'hidden',
  display: 'flex'
}));

const DocumentationIframe = styled('iframe')({
  width: '100%',
  height: '100%',
  border: 'none',
  overflow: 'hidden'
});

interface DocumentationPopupProps {
  open: boolean;
  onClose: () => void;
}

const DocumentationPopup: React.FC<DocumentationPopupProps> = ({ open, onClose }) => {
  const [iframeKey, setIframeKey] = useState(Date.now());
  
  // Refresh iframe when popup opens to ensure latest content
  useEffect(() => {
    if (open) {
      setIframeKey(Date.now());
    }
  }, [open]);

  return (
    <DocumentationDialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DocumentationHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <SupportTwoToneIcon color="primary" fontSize="large" />
          <Typography variant="h4" component="h2">
            MMS Dokumentation
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DocumentationHeader>
      <DocumentationContent>
        <DocumentationIframe
          key={iframeKey}
          src="/docs/index.html"
          title="MMS Documentation"
          allowFullScreen
        />
      </DocumentationContent>
    </DocumentationDialog>
  );
};

export default DocumentationPopup;