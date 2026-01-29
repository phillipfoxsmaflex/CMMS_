import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  useTheme,
  Alert,
  AlertTitle,
  ListItemIcon,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Chip
} from '@mui/material';
import { useDispatch, useSelector } from 'src/store';
import { WorkOrderBaseMiniDTO, WorkOrderBase } from 'src/models/owns/workOrderBase';
import { getWorkOrdersMini, getWorkOrders } from 'src/slices/workOrder';
import { Priority } from 'src/models/owns/workOrder';
import PriorityWrapper from '../../components/PriorityWrapper';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';

const WorkOrderDragList = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { workOrders, loadingGet } = useSelector((state) => state.workOrders);

  const [isLoading, setIsLoading] = React.useState(true);
  const [showAll, setShowAll] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [selectedAsset, setSelectedAsset] = React.useState('all');
  const [selectedWorker, setSelectedWorker] = React.useState('all');
  const [selectedContractor, setSelectedContractor] = React.useState('all');

  React.useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setIsLoading(true);
        // Fetch work orders that don't have estimatedStartDate or have default date (unplanned work orders)
        // Default date is 01.01.1970 which has timestamp 0
        const defaultDate = new Date('1970-01-01T00:00:00Z').toISOString();
        
        await dispatch(getWorkOrders({
          filterFields: [
            {
              field: 'archived',
              operation: 'eq',
              value: false
            }
          ],
          // We'll filter the results client-side to handle the default date case
          pageSize: 50,
          pageNum: 0
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkOrders();
  }, [dispatch]);

  // Refresh the list when work orders are updated (e.g., after drag-and-drop)
  React.useEffect(() => {
    // This will trigger a re-render when workOrders change
  }, [workOrders.content]);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'HIGH':
        return theme.colors.error.main;
      case 'MEDIUM':
        return theme.colors.warning.main;
      case 'LOW':
        return theme.colors.info.main;
      case 'NONE':
        return theme.colors.primary.main;
      default:
        return theme.colors.primary.main;
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    dispatch(getWorkOrders({
      filterFields: [
        {
          field: 'archived',
          operation: 'eq',
          value: false
        }
      ],
      pageSize: 50,
      pageNum: 0
    })).finally(() => setIsLoading(false));
  };

  const handleToggleShowAll = () => {
    setShowAll(!showAll);
  };

  // Filter work orders to show only unplanned ones (no dueDate or default date)
  const unplannedWorkOrders = workOrders.content.filter(workOrder => {
    // Check if dueDate is null, undefined, empty, or the default date 01.01.1970
    if (!workOrder.dueDate) {
      console.log(`Work order ${workOrder.id} has no dueDate - included in drag list`);
      return true;
    }
    
    try {
      const dueDate = new Date(workOrder.dueDate);
      const defaultDate = new Date('1970-01-01T00:00:00Z');
      
      // Consider as unplanned if it's the default date
      if (dueDate.getTime() === defaultDate.getTime()) {
        console.log(`Work order ${workOrder.id} has default date 01.01.1970 - included in drag list`);
        return true;
      } else {
        console.log(`Work order ${workOrder.id} has valid dueDate ${workOrder.dueDate} - excluded from drag list`);
        return false;
      }
    } catch (error) {
      // If date parsing fails, consider it as unplanned
      console.warn('Failed to parse dueDate:', workOrder.dueDate);
      return true;
    }
  });

  console.log(`Total work orders: ${workOrders.content.length}, Unplanned: ${unplannedWorkOrders.length}`);

  // Filter work orders based on search and filter criteria
  const filteredWorkOrders = unplannedWorkOrders
    .filter(workOrder => {
      // Apply search text filter
      const searchLower = searchText.toLowerCase();
      const matchesSearch = (
        workOrder.title.toLowerCase().includes(searchLower) ||
        (workOrder.description && workOrder.description.toLowerCase().includes(searchLower)) ||
        (workOrder.asset && workOrder.asset.name && workOrder.asset.name.toLowerCase().includes(searchLower)) ||
        (workOrder.asset && workOrder.asset.customId && workOrder.asset.customId.toLowerCase().includes(searchLower)) ||
        (workOrder.primaryUser && `${workOrder.primaryUser.firstName} ${workOrder.primaryUser.lastName}`.toLowerCase().includes(searchLower)) ||
        (workOrder.assignedTo && workOrder.assignedTo.some(user => 
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
        )) ||
        (workOrder.assignedToEmployee && `${workOrder.assignedToEmployee.firstName} ${workOrder.assignedToEmployee.lastName}`.toLowerCase().includes(searchLower))
      );

      // Apply asset filter
      const matchesAsset = selectedAsset === 'all' || 
        (workOrder.asset && workOrder.asset.id.toString() === selectedAsset);

      // Apply worker filter
      const matchesWorker = selectedWorker === 'all' || 
        (workOrder.primaryUser && workOrder.primaryUser.id.toString() === selectedWorker) ||
        (workOrder.assignedTo && workOrder.assignedTo.some(user => user.id.toString() === selectedWorker));

      // Apply contractor filter
      const matchesContractor = selectedContractor === 'all' || 
        (workOrder.assignedToEmployee && workOrder.assignedToEmployee.id.toString() === selectedContractor);

      return matchesSearch && matchesAsset && matchesWorker && matchesContractor;
    })
    .slice(0, showAll ? unplannedWorkOrders.length : 10);

  // Helper functions to get unique filter options
  const getUniqueAssets = () => {
    const assets = unplannedWorkOrders
      .filter(wo => wo.asset)
      .map(wo => wo.asset);
    return Array.from(new Map(assets.map(asset => [asset.id, asset])).values());
  };

  const getUniqueWorkers = () => {
    const workers = [];
    unplannedWorkOrders.forEach(wo => {
      if (wo.primaryUser) workers.push(wo.primaryUser);
      if (wo.assignedTo) workers.push(...wo.assignedTo);
    });
    return Array.from(new Map(workers.map(worker => [worker.id, worker])).values());
  };

  const getUniqueContractors = () => {
    const contractors = unplannedWorkOrders
      .filter(wo => wo.assignedToEmployee)
      .map(wo => wo.assignedToEmployee);
    return Array.from(new Map(contractors.map(contractor => [contractor.id, contractor])).values());
  };

  if (isLoading) {
    return (
      <Card sx={{ p: 2, mb: 2, height: '100%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" gutterBottom>
            {t('available_work_orders')}
          </Typography>
          <IconButton onClick={handleRefresh} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
        </Box>
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={24} />
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {t('loading_work_orders')}
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 2, mb: 2, height: '100%', overflow: 'auto' }} data-work-order-list>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" gutterBottom>
          {t('available_work_orders')}
        </Typography>
        <IconButton onClick={handleRefresh} disabled={isLoading}>
          <RefreshIcon />
        </IconButton>
      </Box>
      
      {unplannedWorkOrders.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>{t('no_available_work_orders')}</AlertTitle>
          {t('all_work_orders_scheduled')}
        </Alert>
      ) : (
        <>
          {/* Filter Section */}
          <Box mb={2}>
            <Grid container spacing={2} alignItems="center">
              {/* Search Field */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder={t('search_work_orders')}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon color="action" sx={{ mr: 1 }} />
                    )
                  }}
                />
              </Grid>

              {/* Asset Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('filter_by_asset')}</InputLabel>
                  <Select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    label={t('filter_by_asset')}
                  >
                    <MenuItem value="all">{t('all_assets')}</MenuItem>
                    {getUniqueAssets().map(asset => (
                      <MenuItem key={asset.id} value={asset.id.toString()}>
                        {asset.name} {asset.customId && `(${asset.customId})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Worker Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('filter_by_worker')}</InputLabel>
                  <Select
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    label={t('filter_by_worker')}
                  >
                    <MenuItem value="all">{t('all_workers')}</MenuItem>
                    {getUniqueWorkers().map(worker => (
                      <MenuItem key={worker.id} value={worker.id.toString()}>
                        {worker.firstName} {worker.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Contractor Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('filter_by_contractor')}</InputLabel>
                  <Select
                    value={selectedContractor}
                    onChange={(e) => setSelectedContractor(e.target.value)}
                    label={t('filter_by_contractor')}
                  >
                    <MenuItem value="all">{t('all_contractors')}</MenuItem>
                    {getUniqueContractors().map(contractor => (
                      <MenuItem key={contractor.id} value={contractor.id.toString()}>
                        {contractor.firstName} {contractor.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Filter Chips */}
              {(searchText || selectedAsset !== 'all' || selectedWorker !== 'all' || selectedContractor !== 'all') && (
                <Grid item xs={12}>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {searchText && (
                      <Chip
                        label={`${t('filter_search')}: "${searchText}"`}
                        onDelete={() => setSearchText('')}
                        size="small"
                      />
                    )}
                    {selectedAsset !== 'all' && (
                      <Chip
                        label={`${t('filter_asset')}: ${getUniqueAssets().find(a => a.id.toString() === selectedAsset)?.name || ''}`}
                        onDelete={() => setSelectedAsset('all')}
                        size="small"
                      />
                    )}
                    {selectedWorker !== 'all' && (
                      <Chip
                        label={`${t('filter_worker')}: ${getUniqueWorkers().find(w => w.id.toString() === selectedWorker)?.firstName || ''} ${getUniqueWorkers().find(w => w.id.toString() === selectedWorker)?.lastName || ''}`}
                        onDelete={() => setSelectedWorker('all')}
                        size="small"
                      />
                    )}
                    {selectedContractor !== 'all' && (
                      <Chip
                        label={`${t('filter_contractor')}: ${getUniqueContractors().find(c => c.id.toString() === selectedContractor)?.firstName || ''} ${getUniqueContractors().find(c => c.id.toString() === selectedContractor)?.lastName || ''}`}
                        onDelete={() => setSelectedContractor('all')}
                        size="small"
                      />
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
          
          <List dense>
            {filteredWorkOrders.map((workOrder, index) => (
              <React.Fragment key={workOrder.id}>
                <ListItem
                  data-work-order-id={workOrder.id}
                  sx={{
                    cursor: 'grab',
                    '&:hover': {
                      backgroundColor: theme.colors.alpha.black[5]
                    },
                    '&:active': {
                      cursor: 'grabbing'
                    },
                    borderLeft: `4px solid ${getPriorityColor(workOrder.priority)}`,
                    mb: 0.5,
                    borderRadius: '4px'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <DragIndicatorIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={workOrder.title}
                    secondary={
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        <Box display="flex" alignItems="center">
                          <PriorityWrapper priority={workOrder.priority} />
                          <Typography variant="body2" color="text.secondary" ml={1}>
                            {t('due_date')}: {new Date(workOrder.dueDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        
                        {/* Asset information */}
                        {workOrder.asset && workOrder.asset.name && (
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              🏭 {workOrder.asset.name}
                              {workOrder.asset.customId && ` (${workOrder.asset.customId})`}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Primary worker information */}
                        {workOrder.primaryUser && (
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              👤 {workOrder.primaryUser.firstName} {workOrder.primaryUser.lastName}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Additional workers information */}
                        {workOrder.assignedTo && workOrder.assignedTo.length > 0 && (
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              👥 {workOrder.assignedTo
                                .map(user => `${user.firstName} ${user.lastName}`)
                                .join(', ')}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Contractor information */}
                        {workOrder.assignedToEmployee && (
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              🔧 {workOrder.assignedToEmployee.firstName} {workOrder.assignedToEmployee.lastName}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < filteredWorkOrders.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
          
          {unplannedWorkOrders.length > 10 && (
            <Box mt={2} textAlign="center">
              <Tooltip title={showAll ? t('show_less') : t('show_more')}>
                <IconButton onClick={handleToggleShowAll} size="small">
                  {showAll ? t('show_less') : `${t('show_more')} (${unplannedWorkOrders.length - 10}+)`}
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </>
      )}
    </Card>
  );
};

export default WorkOrderDragList;