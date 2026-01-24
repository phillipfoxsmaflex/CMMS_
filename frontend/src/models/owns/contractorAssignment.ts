export interface ContractorAssignmentDTO {
  id: number;
  name: string;
  type: string; // "VENDOR" or "CUSTOMER"
}

export const contractorAssignments: ContractorAssignmentDTO[] = [
  {
    id: 1,
    name: "Sample Vendor",
    type: "VENDOR"
  },
  {
    id: 2,
    name: "Sample Customer",
    type: "CUSTOMER"
  }
];