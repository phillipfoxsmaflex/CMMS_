import { getAllDocuments } from './document';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from './document';
import api from '../utils/api';

// Mock the API
jest.mock('../utils/api');

describe('document slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        documents: reducer
      }
    });
  });

  describe('getAllDocuments', () => {
    it('should fetch all documents and update store', async () => {
      // Mock API response
      const mockDocuments = [
        {
          id: 1,
          name: 'Test Document 1',
          entityType: 'LOCATION',
          entityId: 1,
          isFolder: true,
          children: []
        },
        {
          id: 2,
          name: 'Test Document 2',
          entityType: 'ASSET',
          entityId: 101,
          isFolder: false,
          children: []
        }
      ];

      // Mock the API call
      (api.get as jest.Mock).mockResolvedValue(mockDocuments);

      // Dispatch the action
      await store.dispatch(getAllDocuments());

      // Get the state
      const state = store.getState();

      // Verify the documents were stored with the correct key
      expect(state.documents.documentsByEntity['ALL-0']).toEqual(mockDocuments);
      expect(state.documents.loadingGet).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      const mockError = new Error('Network error');
      (api.get as jest.Mock).mockRejectedValue(mockError);

      // Spy on console.error to verify error logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Dispatch the action
      await store.dispatch(getAllDocuments());

      // Get the state
      const state = store.getState();

      // Verify error handling
      expect(state.documents.loadingGet).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching all documents'),
        mockError
      );

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });
});