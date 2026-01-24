import { Vendor, VendorMiniDTO } from '../models/owns/vendor';
import { RootState } from '../store';
import { getVendors, getVendorsMini } from './vendor';
import { SearchCriteria } from '../models/owns/page';

// Selector to get ALL vendors (simplified - no filtering)
export const selectContractorVendors = (state: RootState): VendorMiniDTO[] => {
  // First, try to use vendorsMini (loaded by loadContractorVendors)
  const vendorsMini = state.vendors.vendorsMini || [];
  
  // Also check the paginated vendors
  const vendorsPage = state.vendors.vendors;
  const allVendors = vendorsPage?.content || [];
  
  console.log('[Contractor Selector] Mini vendors loaded:', vendorsMini.length);
  console.log('[Contractor Selector] Full vendors loaded:', allVendors.length);
  
  // SIMPLIFIED: Just return ALL vendors, no filtering!
  // This allows both Lieferanten AND Auftragnehmer to be selected
  
  if (vendorsMini.length > 0) {
    console.log('[Contractor Selector] Showing ALL mini vendors (no filtering)');
    return vendorsMini;
  }
  
  if (allVendors.length > 0) {
    console.log('[Contractor Selector] Showing ALL paginated vendors (no filtering)');
    return allVendors.map(vendor => ({ 
      id: vendor.id, 
      companyName: vendor.companyName 
    }));
  }
  
  console.warn('[Contractor Selector] No vendors available!');
  return [];
};

// Action to load vendors and filter for contractors
export const loadContractorVendors = (): any => async (dispatch: any) => {
  try {
    console.log('[Contractor] Loading contractor vendors...');
    
    // Load BOTH mini vendors (all vendors, no pagination) AND full vendors (with type info)
    // Mini vendors give us ALL vendors
    await dispatch(getVendorsMini());
    console.log('[Contractor] Mini vendors loaded');
    
    // Full vendor data gives us vendorType information for filtering
    const criteria: SearchCriteria = {
      pageNum: 0,
      pageSize: 1000, // Increased to get all vendors
      sortField: 'id',
      direction: 'ASC',
      filterFields: []
    };
    
    await dispatch(getVendors(criteria));
    console.log('[Contractor] Full vendors loaded successfully');
  } catch (error) {
    console.error('[Contractor] Failed to load contractor vendors:', error);
  }
};

