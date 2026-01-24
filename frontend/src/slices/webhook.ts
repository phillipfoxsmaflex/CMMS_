import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from 'src/store';
import api from '../utils/api';
import { revertAll } from 'src/utils/redux';

// Define the WebhookConfig interface
interface WebhookConfig {
  id: number;
  companyId: number;
  apiKey: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WebhookState {
  config: WebhookConfig | null;
  loading: boolean;
  error: string | null;
}

const initialState: WebhookState = {
  config: null,
  loading: false,
  error: null
};

const slice = createSlice({
  name: 'webhook',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    setWebhookConfig(
      state: WebhookState,
      action: PayloadAction<{ config: WebhookConfig }>
    ) {
      const { config } = action.payload;
      state.config = config;
      state.error = null;
    },
    setLoading(
      state: WebhookState,
      action: PayloadAction<{ loading: boolean }>
    ) {
      const { loading } = action.payload;
      state.loading = loading;
    },
    setError(
      state: WebhookState,
      action: PayloadAction<{ error: string }>
    ) {
      const { error } = action.payload;
      state.error = error;
      state.loading = false;
    },
    clearError(state: WebhookState) {
      state.error = null;
    }
  }
});

// Export the reducer
export const reducer = slice.reducer;

// Export action creators for webhook configuration management

/**
 * Get the current webhook configuration for the company
 * @returns {AppThunk} Redux thunk action
 */
export const getWebhookConfig = (): AppThunk => async (dispatch) => {
  try {
    dispatch(slice.actions.setLoading({ loading: true }));
    dispatch(slice.actions.clearError());
    
    const config = await api.get<WebhookConfig>('/webhook-config');
    dispatch(slice.actions.setWebhookConfig({ config }));
    dispatch(slice.actions.setLoading({ loading: false }));
    
    return config;
  } catch (error) {
    dispatch(slice.actions.setError({ error: 'Failed to fetch webhook configuration' }));
    throw error;
  }
};

/**
 * Create a new webhook configuration for the company
 * @returns {AppThunk} Redux thunk action
 */
export const createWebhookConfig = (): AppThunk => async (dispatch) => {
  try {
    dispatch(slice.actions.setLoading({ loading: true }));
    dispatch(slice.actions.clearError());
    
    const config = await api.post<WebhookConfig>('/webhook-config', {});
    dispatch(slice.actions.setWebhookConfig({ config }));
    dispatch(slice.actions.setLoading({ loading: false }));
    
    return config;
  } catch (error) {
    dispatch(slice.actions.setError({ error: 'Failed to create webhook configuration' }));
    throw error;
  }
};

/**
 * Regenerate the API key for the webhook configuration
 * @returns {AppThunk} Redux thunk action
 */
export const regenerateApiKey = (): AppThunk => async (dispatch) => {
  try {
    dispatch(slice.actions.setLoading({ loading: true }));
    dispatch(slice.actions.clearError());
    
    const config = await api.post<WebhookConfig>('/webhook-config/regenerate', {});
    dispatch(slice.actions.setWebhookConfig({ config }));
    dispatch(slice.actions.setLoading({ loading: false }));
    
    return config;
  } catch (error) {
    dispatch(slice.actions.setError({ error: 'Failed to regenerate API key' }));
    throw error;
  }
};

/**
 * Toggle the enabled status of the webhook configuration
 * @param {boolean} enabled - The new enabled status
 * @returns {AppThunk} Redux thunk action
 */
export const toggleWebhookEnabled = (enabled: boolean): AppThunk => async (dispatch) => {
  try {
    dispatch(slice.actions.setLoading({ loading: true }));
    dispatch(slice.actions.clearError());
    
    const config = await api.post<WebhookConfig>(`/webhook-config/${enabled}`, {});
    dispatch(slice.actions.setWebhookConfig({ config }));
    dispatch(slice.actions.setLoading({ loading: false }));
    
    return config;
  } catch (error) {
    dispatch(slice.actions.setError({ error: `Failed to ${enabled ? 'enable' : 'disable'} webhook` }));
    throw error;
  }
};

/**
 * Delete the webhook configuration
 * @returns {AppThunk} Redux thunk action
 */
export const deleteWebhookConfig = (): AppThunk => async (dispatch) => {
  try {
    dispatch(slice.actions.setLoading({ loading: true }));
    dispatch(slice.actions.clearError());
    
    await api.deletes<{ success: boolean }>('/webhook-config');
    dispatch(slice.actions.setWebhookConfig({ config: null }));
    dispatch(slice.actions.setLoading({ loading: false }));
    
    return true;
  } catch (error) {
    dispatch(slice.actions.setError({ error: 'Failed to delete webhook configuration' }));
    throw error;
  }
};

// Export the slice actions for direct use if needed
export const { setWebhookConfig, setLoading, setError, clearError } = slice.actions;

// Export the slice for use in the store
export default slice;
