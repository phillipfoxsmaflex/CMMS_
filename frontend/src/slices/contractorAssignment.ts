import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from 'src/store';
import { ContractorAssignmentDTO } from '../models/owns/contractorAssignment';
import api from '../utils/api';
import { revertAll } from 'src/utils/redux';

const basePath = 'contractor-assignments';

interface ContractorAssignmentState {
  contractorAssignments: ContractorAssignmentDTO[];
  loadingGet: boolean;
}

const initialState: ContractorAssignmentState = {
  contractorAssignments: [],
  loadingGet: false
};

const slice = createSlice({
  name: 'contractorAssignments',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    getContractorAssignments(
      state: ContractorAssignmentState,
      action: PayloadAction<{ contractorAssignments: ContractorAssignmentDTO[] }>
    ) {
      const { contractorAssignments } = action.payload;
      state.contractorAssignments = contractorAssignments;
    },
    setLoadingGet(
      state: ContractorAssignmentState,
      action: PayloadAction<{ loading: boolean }>
    ) {
      const { loading } = action.payload;
      state.loadingGet = loading;
    }
  }
});

export const reducer = slice.reducer;

export const getContractorAssignments = (): AppThunk => async (dispatch) => {
  try {
    dispatch(slice.actions.setLoadingGet({ loading: true }));
    const contractorAssignments = await api.get<ContractorAssignmentDTO[]>(`${basePath}/mini`);
    dispatch(slice.actions.getContractorAssignments({ contractorAssignments }));
  } finally {
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  }
};

export default slice;