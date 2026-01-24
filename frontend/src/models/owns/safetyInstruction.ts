import { Audit } from './audit';

import Location from './location';
import { Vendor } from './vendor';
import { OwnUser } from '../user';
import { ContractorEmployee } from './contractorEmployee';

export interface SafetyInstruction extends Audit {
  id: number;
  title: string;
  description: string;
  instructionDate: string;
  expirationDate: string;
  type: 'VIDEO' | 'DOCUMENT' | 'LINK';
  instructionMaterialUrl: string;
  instructionMaterialFileId: string;
  location?: Location | null;
  vendor?: Vendor | null;
  instructor?: OwnUser | null;
  employee?: ContractorEmployee | null;
  completed: boolean;
  completionDate: string;
  signatureData: string;
  signatureName: string;
  // Keep ID fields for form compatibility
  locationId?: number;
  vendorId?: number | null;
  instructorId?: number;
  employeeId?: number;
}

export interface SafetyInstructionMiniDTO {
  id: number;
  title: string;
  completed: boolean;
  expirationDate: string;
}

export const safetyInstructions: SafetyInstruction[] = [
  {
    id: 1,
    title: 'Sicherheitsunterweisung für Standort A',
    description: 'Grundlegende Sicherheitsvorschriften',
    instructionDate: '2023-01-15T09:00:00',
    expirationDate: '2024-01-15T09:00:00',
    type: 'DOCUMENT',
    instructionMaterialUrl: 'https://example.com/safety.pdf',
    instructionMaterialFileId: 'file123',
    locationId: 1,
    vendorId: 1,
    instructorId: 1,
    employeeId: 1,
    completed: true,
    completionDate: '2023-01-15T10:30:00',
    signatureData: 'base64signature',
    signatureName: 'Max Mustermann',
    createdBy: 1,
    updatedBy: 1,
    createdAt: '2023-01-10T08:00:00',
    updatedAt: '2023-01-15T10:30:00'
  }
];