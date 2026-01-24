import { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { TreeView, TreeItem } from '@mui/lab';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useDispatch, useSelector } from '../../../store';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import {
  getDocumentTree,
  getAllDocuments,
  createDocument,
  deleteDocument as deleteDocumentAction,
  downloadDocument,
  downloadBatch,
  getPreviewUrl
} from '../../../slices/document';
import { Document } from '../../../models/owns/document';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';

interface DocumentManagerProps {
  entityType: 'LOCATION' | 'ASSET' | 'WORK_ORDER' | 'REQUEST' | 'ALL';
  entityId: number;
  showGlobalView?: boolean; // New property for global view
}

// Group documents by entityType and entityId
const groupDocumentsByEntityTypeAndId = (documents: Document[]) => {
  return documents.reduce((acc, doc) => {
    if (!doc.entityType || doc.entityId === null || doc.entityId === undefined) {
      return acc;
    }
    const key = `${doc.entityType}-${doc.entityId}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);
};

// Render a single document with its children (folders/files)
const renderDocumentNode = (
  doc: Document, 
  allDocuments: Document[], 
  t: any, 
  hasDeletePermission: any, 
  handleDownload: any, 
  handleDelete: any, 
  selectParent: any,
  selectedParentId: number | null,
  handleOpenInfo: any,
  isSelectionMode: boolean,
  selectedDocuments: Set<number>,
  toggleDocumentSelection: (id: number) => void
) => {
  const documentAudit = {
    id: doc.id,
    createdAt: doc.createdAt,
    createdBy: doc.createdById || 0,
    updatedAt: doc.updatedAt,
    updatedBy: doc.createdById || 0
  };
  
  // Find child documents (folder hierarchy)
  const children = allDocuments.filter(d => d.parentDocumentId === doc.id);
  const isSelected = selectedParentId === doc.id;
  
  return (
    <TreeItem
      key={`doc-${doc.id}`}
      nodeId={`doc-${doc.id}`}
      label={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1,
            bgcolor: isSelected ? 'action.selected' : 'transparent',
            borderRadius: 1,
            px: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isSelectionMode && !doc.isFolder && (
              <Checkbox
                size="small"
                checked={selectedDocuments.has(doc.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleDocumentSelection(doc.id);
                }}
                sx={{ mr: 0.5 }}
              />
            )}
            {doc.isFolder ? (
              <FolderIcon sx={{ mr: 1, color: isSelected ? 'primary.main' : 'primary.light' }} />
            ) : (
              <InsertDriveFileIcon sx={{ mr: 1, color: 'text.secondary' }} />
            )}
            <Typography variant="body2" fontWeight={isSelected ? 'bold' : 'normal'}>
              {doc.name}
            </Typography>
          </Box>
          <Box>
            {!doc.isFolder && !isSelectionMode && (
              <>
                <Tooltip title={t('info')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInfo(doc);
                    }}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('download')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(doc.id);
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {!isSelectionMode && hasDeletePermission(PermissionEntity.DOCUMENTS, documentAudit) && (
              <Tooltip title={t('delete')}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc.id);
                  }}
                >
                  <DeleteTwoToneIcon fontSize="small" color="error" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      }
      onClick={() => {
        if (doc.isFolder) {
          selectParent(doc.id, doc.name, 'FOLDER');
        }
      }}
    >
      {children.map(child => 
        renderDocumentNode(child, allDocuments, t, hasDeletePermission, handleDownload, handleDelete, selectParent, selectedParentId, handleOpenInfo, isSelectionMode, selectedDocuments, toggleDocumentSelection)
      )}
    </TreeItem>
  );
};

// New implementation: Build hierarchy from actual Location and Asset entities
const renderGlobalTree = (
  allDocuments: Document[], 
  locations: any[], 
  assets: any[], 
  t: any, 
  hasDeletePermission: any, 
  handleDownload: any, 
  handleDelete: any, 
  selectParent: any,
  selectedParentId: number | null,
  selectedParentType: string | null,
  handleOpenInfo: any,
  isSelectionMode: boolean,
  selectedDocuments: Set<number>,
  toggleDocumentSelection: (id: number) => void
) => {
  // Group documents by entityType-entityId
  const docsByEntity = groupDocumentsByEntityTypeAndId(allDocuments);
  
  // Render the tree: Locations → Assets → Documents
  return locations.map(location => {
    // Find assets that belong to this location
    const locationAssets = assets.filter(asset => asset.location?.id === location.id);
    
    // Find root documents for this location (no parent)
    const locationDocKey = `LOCATION-${location.id}`;
    const locationDocs = (docsByEntity[locationDocKey] || []).filter(doc => !doc.parentDocumentId);
    
    // Check if this location is selected (for creating docs directly under location)
    const isLocationSelected = selectedParentType === 'LOCATION' && selectedParentId === location.id;
    
    return (
      <TreeItem
        key={`location-${location.id}`}
        nodeId={`location-${location.id}`}
        label={
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: isLocationSelected ? 'action.selected' : 'transparent',
              borderRadius: 1,
              px: 1,
              py: 0.5
            }}
          >
            <FolderIcon sx={{ mr: 1, color: isLocationSelected ? 'warning.dark' : 'warning.main' }} />
            <Typography variant="body2" fontWeight={isLocationSelected ? 'bold' : 'medium'}>
              {location.name || `Location ${location.id}`}
            </Typography>
          </Box>
        }
        onClick={(e) => {
          e.stopPropagation();
          selectParent(location.id, location.name, 'LOCATION');
        }}
      >
        {/* Render location documents */}
        {locationDocs.map(doc => 
          renderDocumentNode(doc, allDocuments, t, hasDeletePermission, handleDownload, handleDelete, selectParent, selectedParentId, handleOpenInfo, isSelectionMode, selectedDocuments, toggleDocumentSelection)
        )}
        
        {/* Render assets under this location */}
        {locationAssets.map(asset => {
          const assetDocKey = `ASSET-${asset.id}`;
          const assetDocs = (docsByEntity[assetDocKey] || []).filter(doc => !doc.parentDocumentId);
          
          const isAssetSelected = selectedParentType === 'ASSET' && selectedParentId === asset.id;
          
          return (
            <TreeItem
              key={`asset-${asset.id}`}
              nodeId={`asset-${asset.id}`}
              label={
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    bgcolor: isAssetSelected ? 'action.selected' : 'transparent',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5
                  }}
                >
                  <FolderIcon sx={{ mr: 1, color: isAssetSelected ? 'info.dark' : 'info.main' }} />
                  <Typography variant="body2" fontWeight={isAssetSelected ? 'bold' : 'normal'}>
                    {asset.name || `Asset ${asset.id}`}
                  </Typography>
                </Box>
              }
              onClick={(e) => {
                e.stopPropagation();
                selectParent(asset.id, asset.name, 'ASSET');
              }}
            >
              {/* Render asset documents */}
              {assetDocs.map(doc => 
                renderDocumentNode(doc, allDocuments, t, hasDeletePermission, handleDownload, handleDelete, selectParent, selectedParentId, handleOpenInfo, isSelectionMode, selectedDocuments, toggleDocumentSelection)
              )}
            </TreeItem>
          );
        })}
      </TreeItem>
    );
  });
};

const DocumentManager = ({ entityType, entityId, showGlobalView = false }: DocumentManagerProps) => {
  const { t } = useTranslation();
  // Create a local reference to t for use in nested scopes
  const translate = t;
  const dispatch = useDispatch();
  const { hasCreatePermission, hasDeletePermission } = useAuth();
  const { getFormattedDate, getUserNameById } = useContext(CompanySettingsContext);
  
  const [openCreateFolder, setOpenCreateFolder] = useState(false);
  const [openUploadFile, setOpenUploadFile] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [selectedParentName, setSelectedParentName] = useState<string>('');
  const [selectedParentType, setSelectedParentType] = useState<'FOLDER' | 'LOCATION' | 'ASSET' | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  
  // New states for search, filter and info modal
  const [searchText, setSearchText] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('ALL');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Batch download states
  const [selectedDocuments, setSelectedDocuments] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  const { documentsByEntity, loadingGet } = useSelector((state) => state.documents);
  const { locations } = useSelector((state) => state.locations);
  const { assets } = useSelector((state) => state.assets);
  
  const key = showGlobalView ? 'ALL-0' : `${entityType}-${entityId}`;
  const documents = documentsByEntity[key] || [];

  useEffect(() => {
    if (showGlobalView) {
      dispatch(getAllDocuments());
    } else {
      dispatch(getDocumentTree(entityType, entityId));
    }
  }, [entityType, entityId, dispatch, showGlobalView]);

  // Helper function to get file type category from MIME type
  const getFileTypeCategory = (mimeType?: string): string => {
    if (!mimeType) return 'OTHER';
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.startsWith('application/vnd.') || mimeType.startsWith('application/msword')) return 'DOCUMENT';
    return 'OTHER';
  };
  
  // Helper function to check if document matches date filter
  const matchesDateFilter = (createdAt: string): boolean => {
    if (dateFilter === 'ALL') return true;
    
    const docDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - docDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (dateFilter) {
      case 'TODAY':
        return diffDays <= 1;
      case 'WEEK':
        return diffDays <= 7;
      case 'MONTH':
        return diffDays <= 30;
      default:
        return true;
    }
  };

  // Filter documents based on search text, entity type, file type, and date
  const filterDocuments = (docs: Document[]): Document[] => {
    // Only apply filters in global view
    if (!showGlobalView) {
      return docs;
    }
    
    return docs.filter(doc => {
      // Search filter
      const matchesSearch = !searchText || 
        doc.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchText.toLowerCase()));
      
      // Entity type filter
      const matchesEntityType = entityTypeFilter === 'ALL' || 
        (doc.entityType === entityTypeFilter);
      
      // File type filter (only for files, not folders)
      const matchesFileType = doc.isFolder || fileTypeFilter === 'ALL' || 
        getFileTypeCategory(doc.mimeType) === fileTypeFilter;
      
      // Date filter
      const matchesDate = matchesDateFilter(doc.createdAt);
      
      return matchesSearch && matchesEntityType && matchesFileType && matchesDate;
    }).map(doc => {
      // Recursively filter children if they exist
      if (doc.children && doc.children.length > 0) {
        return {
          ...doc,
          children: filterDocuments(doc.children)
        };
      }
      return doc;
    });
  };

  const filteredDocuments = filterDocuments(documents);

  // Helper function to select a parent for new documents/folders
  const selectParent = (id: number | null, name: string, type: 'FOLDER' | 'LOCATION' | 'ASSET') => {
    setSelectedParentId(id);
    setSelectedParentName(name);
    setSelectedParentType(type);
  };
  
  // Helper function to open document info modal
  const handleOpenInfo = (doc: Document) => {
    setSelectedDocument(doc);
    setOpenInfo(true);
  };
  
  // Helper function to get file thumbnail URL
  const getThumbnailUrl = (doc: Document): string | null => {
    const mimeType = doc.mimeType || '';
    if (mimeType.startsWith('image/')) {
      return getPreviewUrl(doc.id);
    }
    return null;
  };
  
  // Helper function to toggle document selection
  const toggleDocumentSelection = (docId: number) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(docId)) {
      newSelection.delete(docId);
    } else {
      newSelection.add(docId);
    }
    setSelectedDocuments(newSelection);
  };
  
  // Helper function to handle batch download
  const handleBatchDownload = async () => {
    if (selectedDocuments.size === 0) return;
    
    try {
      await downloadBatch(Array.from(selectedDocuments));
      setSelectedDocuments(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Error downloading batch:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    
    try {
      // Only use selectedParentId if it's a FOLDER, not a Location/Asset
      const parentId = selectedParentType === 'FOLDER' ? selectedParentId : null;
      
      await dispatch(
        createDocument(
          entityType,
          entityId,
          {
            name: folderName,
            parentDocumentId: parentId,
            isFolder: true
          }
        )
      );
      
      // Refresh document list after creation
      if (showGlobalView) {
        await dispatch(getAllDocuments());
      } else {
        await dispatch(getDocumentTree(entityType, entityId));
      }
      
      setFolderName('');
      setSelectedParentId(null);
      setSelectedParentName('');
      setSelectedParentType(null);
      setOpenCreateFolder(false);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleUploadFile = async () => {
    if (!fileName.trim() || !selectedFile) return;
    
    try {
      // Only use selectedParentId if it's a FOLDER, not a Location/Asset
      const parentId = selectedParentType === 'FOLDER' ? selectedParentId : null;
      
      await dispatch(
        createDocument(
          entityType,
          entityId,
          {
            name: fileName,
            description: fileDescription,
            parentDocumentId: parentId,
            isFolder: false
          },
          selectedFile
        )
      );
      
      // Refresh document list after upload
      if (showGlobalView) {
        await dispatch(getAllDocuments());
      } else {
        await dispatch(getDocumentTree(entityType, entityId));
      }
      
      setFileName('');
      setFileDescription('');
      setSelectedFile(null);
      setSelectedParentId(null);
      setSelectedParentName('');
      setSelectedParentType(null);
      setOpenUploadFile(false);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('confirm_delete_document'))) {
      try {
        await dispatch(deleteDocumentAction(id, entityType, entityId));
        
        // Refresh document list after deletion
        if (showGlobalView) {
          await dispatch(getAllDocuments());
        } else {
          await dispatch(getDocumentTree(entityType, entityId));
        }
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleDownload = async (id: number) => {
    try {
      await downloadDocument(id);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleNodeToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const renderTree = (nodes: Document[], showGlobalViewParam?: boolean) => {
    const currentShowGlobalView = showGlobalViewParam !== undefined ? showGlobalViewParam : showGlobalView;
    
    if (currentShowGlobalView) {
      // Global view: Group by Location → Asset → Part hierarchy
      return renderGlobalTree(
        nodes, 
        locations || [], 
        assets?.content || [], 
        t, 
        hasDeletePermission, 
        handleDownload, 
        handleDelete, 
        selectParent,
        selectedParentId,
        selectedParentType,
        handleOpenInfo,
        isSelectionMode,
        selectedDocuments,
        toggleDocumentSelection
      );
    }
    return nodes.map((node) => {
      // Create Audit object for permission checks
      const documentAudit = {
        id: node.id,
        createdAt: node.createdAt,
        createdBy: node.createdById || 0,
        updatedAt: node.updatedAt,
        updatedBy: node.createdById || 0
      };
      
      return (
        <TreeItem
          key={node.id}
          nodeId={String(node.id)}
          label={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isSelectionMode && !node.isFolder && (
                  <Checkbox
                    size="small"
                    checked={selectedDocuments.has(node.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleDocumentSelection(node.id);
                    }}
                    sx={{ mr: 0.5 }}
                  />
                )}
                {node.isFolder ? (
                  <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                ) : (
                  <InsertDriveFileIcon sx={{ mr: 1, color: 'text.secondary' }} />
                )}
                <Typography variant="body2">{node.name}</Typography>
              </Box>
              <Box>
                {!node.isFolder && !isSelectionMode && (
                  <>
                    <Tooltip title={t('info')}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInfo(node);
                        }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('download')}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(node.id);
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                {!isSelectionMode && hasDeletePermission(PermissionEntity.DOCUMENTS, documentAudit) && (
                <Tooltip title={t('delete')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(node.id);
                    }}
                  >
                    <DeleteTwoToneIcon fontSize="small" color="error" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        }
        onClick={() => {
          if (node.isFolder) {
            setSelectedParentId(node.id);
          }
        }}
      >
        {node.children && node.children.length > 0
          ? renderTree(node.children, currentShowGlobalView)
          : null}
      </TreeItem>
      );
    });
  };

  if (loadingGet) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 4 }}>
      <Card sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Typography variant="h6">{t('documents')}</Typography>
          {hasCreatePermission(PermissionEntity.DOCUMENTS) && (
            <Box>
              <Button
                startIcon={<CreateNewFolderIcon />}
                onClick={() => setOpenCreateFolder(true)}
                sx={{ mr: 1 }}
              >
                {t('new_folder')}
              </Button>
              <Button
                startIcon={<UploadFileIcon />}
                variant="contained"
                onClick={() => setOpenUploadFile(true)}
              >
                {t('upload_file')}
              </Button>
            </Box>
          )}
        </Box>
        
        {/* Search and Filter Section */}
        {showGlobalView && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('search_documents')}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('filter_by_type')}</InputLabel>
                  <Select
                    value={entityTypeFilter}
                    label={t('filter_by_type')}
                    onChange={(e) => setEntityTypeFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">{t('all')}</MenuItem>
                    <MenuItem value="LOCATION">{t('locations')}</MenuItem>
                    <MenuItem value="ASSET">{t('assets')}</MenuItem>
                    <MenuItem value="WORK_ORDER">{t('work_orders')}</MenuItem>
                    <MenuItem value="REQUEST">{t('requests')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('filter_by_file_type')}</InputLabel>
                  <Select
                    value={fileTypeFilter}
                    label={t('filter_by_file_type')}
                    onChange={(e) => setFileTypeFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">{t('all')}</MenuItem>
                    <MenuItem value="IMAGE">{t('images')}</MenuItem>
                    <MenuItem value="PDF">{t('pdfs')}</MenuItem>
                    <MenuItem value="DOCUMENT">{t('documents_files')}</MenuItem>
                    <MenuItem value="OTHER">{t('other_files')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('filter_by_date')}</InputLabel>
                  <Select
                    value={dateFilter}
                    label={t('filter_by_date')}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">{t('all')}</MenuItem>
                    <MenuItem value="TODAY">{t('today')}</MenuItem>
                    <MenuItem value="WEEK">{t('this_week')}</MenuItem>
                    <MenuItem value="MONTH">{t('this_month')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {/* Batch Download Actions */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {!isSelectionMode ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setIsSelectionMode(true)}
                >
                  {t('select_documents')}
                </Button>
              ) : (
                <>
                  <Chip
                    label={t('documents_selected').replace('{count}', String(selectedDocuments.size))}
                    color="primary"
                    onDelete={() => {
                      setSelectedDocuments(new Set());
                      setIsSelectionMode(false);
                    }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    disabled={selectedDocuments.size === 0}
                    onClick={handleBatchDownload}
                    startIcon={<DownloadIcon />}
                  >
                    {t('download_selected')}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedDocuments(new Set());
                      setIsSelectionMode(false);
                    }}
                  >
                    {t('cancel_selection')}
                  </Button>
                </>
              )}
            </Box>
          </>
        )}

        {filteredDocuments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            {documents.length === 0 ? t('no_documents_yet') : t('no_matching_documents')}
          </Typography>
        ) : (
          <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            expanded={expanded}
            onNodeToggle={handleNodeToggle}
          >
            {renderTree(filteredDocuments, showGlobalView)}
          </TreeView>
        )}
      </Card>

      {/* Create Folder Dialog */}
      <Dialog
        open={openCreateFolder}
        onClose={() => setOpenCreateFolder(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('create_new_folder')}</DialogTitle>
        <DialogContent>
          {selectedParentName && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {t('parent_folder')}:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {selectedParentName}
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            label={t('folder_name')}
            fullWidth
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateFolder(false)}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleCreateFolder}
            variant="contained"
            disabled={!folderName.trim()}
          >
            {t('create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload File Dialog */}
      <Dialog
        open={openUploadFile}
        onClose={() => setOpenUploadFile(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('upload_file')}</DialogTitle>
        <DialogContent>
          {selectedParentName && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {t('parent_folder')}:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {selectedParentName}
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            label={t('file_name')}
            fullWidth
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('description')}
            fullWidth
            multiline
            rows={3}
            value={fileDescription}
            onChange={(e) => setFileDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="outlined" component="label" fullWidth>
            {selectedFile ? selectedFile.name : t('choose_file')}
            <input
              type="file"
              hidden
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                  if (!fileName) {
                    setFileName(e.target.files[0].name);
                  }
                }
              }}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadFile(false)}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleUploadFile}
            variant="contained"
            disabled={!fileName.trim() || !selectedFile}
          >
            {t('upload')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Info Dialog */}
      <Dialog
        open={openInfo}
        onClose={() => setOpenInfo(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InsertDriveFileIcon sx={{ mr: 1, color: 'primary.main' }} />
            {selectedDocument?.name || t('document_info')}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Grid container spacing={3}>
              {/* Thumbnail Preview */}
              {getThumbnailUrl(selectedDocument) && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      width: '100%',
                      maxHeight: 300,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: 'grey.100',
                      borderRadius: 2,
                      overflow: 'hidden',
                      p: 2
                    }}
                  >
                    <img
                      src={getThumbnailUrl(selectedDocument)!}
                      alt={selectedDocument.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '280px',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                </Grid>
              )}

              {/* Document Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  {t('name')}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedDocument.name}
                </Typography>
              </Grid>

              {selectedDocument.mimeType && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    {t('file_type')}
                  </Typography>
                  <Typography variant="body1">
                    {selectedDocument.mimeType}
                  </Typography>
                </Grid>
              )}

              {selectedDocument.description && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    {t('description')}
                  </Typography>
                  <Typography variant="body1">
                    {selectedDocument.description}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  {t('uploaded_by')}
                </Typography>
                <Typography variant="body1">
                  {getUserNameById(selectedDocument.createdById || 0)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  {t('uploaded_at')}
                </Typography>
                <Typography variant="body1">
                  {getFormattedDate(selectedDocument.createdAt)}
                </Typography>
              </Grid>

              {selectedDocument.entityType && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    {t('linked_to')}
                  </Typography>
                  <Chip 
                    label={t(selectedDocument.entityType.toLowerCase() + 's')} 
                    size="small" 
                    color="primary"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInfo(false)}>
            {t('close')}
          </Button>
          {selectedDocument && !selectedDocument.isFolder && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {
                handleDownload(selectedDocument.id);
                setOpenInfo(false);
              }}
            >
              {t('download')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentManager;
