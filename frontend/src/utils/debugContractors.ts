// Debug utility for Contractor/Vendor issues
// Add this temporarily to ContractorEmployeeForm to debug

export const debugContractorState = (state: any) => {
  console.group('🔍 CONTRACTOR DEBUG INFO');
  
  console.log('📦 Vendors State:');
  console.log('  - vendors.vendors.content:', state.vendors?.vendors?.content?.length || 0, 'items');
  console.log('  - vendors.vendorsMini:', state.vendors?.vendorsMini?.length || 0, 'items');
  console.log('  - vendors.loadingGet:', state.vendors?.loadingGet);
  
  console.log('\n📋 Full Vendors:', state.vendors?.vendors?.content);
  console.log('📋 Mini Vendors:', state.vendors?.vendorsMini);
  
  console.log('\n🔍 Vendor Types:');
  state.vendors?.vendors?.content?.forEach((v: any) => {
    console.log(`  - ${v.companyName}: "${v.vendorType || '(empty)'}"`);
  });
  
  console.log('\n👥 Employees State:');
  console.log('  - contractorEmployees.content:', state.contractorEmployees?.contractorEmployees?.content?.length || 0);
  console.log('  - loadingGet:', state.contractorEmployees?.loadingGet);
  
  console.groupEnd();
};

export const debugNetworkRequests = () => {
  console.group('🌐 NETWORK DEBUG');
  console.log('Checking for API calls...');
  console.log('Look in Network tab for:');
  console.log('  - /api/vendors/mini');
  console.log('  - /api/vendors/search');
  console.log('  - /api/contractor-employees');
  console.groupEnd();
};
