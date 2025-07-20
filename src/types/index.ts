// Core TypeScript interfaces and types for the Offline Triage System

/**
 * Triage level classification for patients
 */
export type TriageLevel = 'Critical' | 'Urgent' | 'Stable';

/**
 * Patient treatment status options
 */
export type PatientStatus = 'Waiting' | 'In Treatment' | 'Treated' | 'Discharged' | 'Transferred';

/**
 * Handover note for shift changes
 */
export interface HandoverNote {
  id: string;                    // UUID for the handover note
  patientId: string;             // Reference to patient
  timestamp: number;             // When the handover note was created
  staffName: string;             // Name of staff member creating handover
  shiftType: 'outgoing' | 'incoming'; // Type of shift handover
  summary: string;               // Brief summary of patient status
  criticalUpdates: string[];     // Array of critical updates/changes
  keyObservations: string;       // Important observations for next shift
  actionItems: string[];         // Tasks for incoming staff
  priority: 'high' | 'medium' | 'low'; // Priority level for handover
}

/**
 * Patient status change tracking for handover
 */
export interface StatusChange {
  id: string;                    // UUID for the status change
  patientId: string;             // Reference to patient
  timestamp: number;             // When the change occurred
  changeType: 'status' | 'triage' | 'treatment' | 'notes' | 'vitals'; // Type of change
  previousValue: string;         // Previous value
  newValue: string;              // New value
  staffName?: string;            // Staff member who made the change
  isHighlighted: boolean;        // Whether this change should be highlighted in handover
}

/**
 * Patient data model
 */
export interface Patient {
  id: string;                    // UUID generated client-side
  name: string;                  // Patient full name
  age: number;                   // Patient age in years
  symptoms: string[];            // Array of selected symptoms
  condition: string;             // Additional condition notes
  triageLevel: TriageLevel;      // Assigned triage classification
  timestamp: number;             // Creation timestamp (Unix)
  status: PatientStatus;         // Current treatment status
  notes: string;                 // Treatment notes and updates
  lastUpdated: number;           // Last modification timestamp
  
  // Gaza hospital form structure fields
  patientId?: string;            // Patient ID number for lookup
  mainComplaint?: string;        // Chief complaint/presenting problem
  medicalHistory?: string;       // Patient's medical background
  examinationFindings?: string;  // Clinical observations and findings
  provisionalDiagnosis?: string; // Initial medical assessment
  treatmentPlan?: string;        // Planned medical interventions
  
  // Handover notes and status tracking
  handoverNotes?: HandoverNote[]; // Array of handover notes for this patient
  statusChanges?: StatusChange[]; // Array of status changes for tracking
}

/**
 * Triage classification rules for symptom-based assignment
 */
export interface TriageRules {
  critical: {
    symptoms: string[];          // Critical symptoms that require immediate attention
    conditionKeywords: string[]; // Keywords in condition notes indicating critical status
  };
  urgent: {
    symptoms: string[];          // Urgent symptoms requiring prompt attention
    conditionKeywords: string[]; // Keywords in condition notes indicating urgent status
  };
}

/**
 * Service interfaces for dependency injection and testing
 */

/**
 * Storage service interface for patient data persistence
 */
export interface StorageService {
  addPatient(patient: Omit<Patient, 'id' | 'timestamp'>): Promise<string>;
  getPatients(): Promise<Patient[]>;
  updatePatient(id: string, updates: Partial<Patient>): Promise<void>;
  deletePatient(id: string): Promise<void>;
}

/**
 * Triage logic service interface for automatic classification
 */
export interface TriageService {
  assignTriageLevel(symptoms: string[], condition: string): TriageLevel;
  getCriticalKeywords(): string[];
  getUrgentKeywords(): string[];
}

/**
 * Export service interface for data export functionality
 */
export interface ExportService {
  exportToCSV(): Promise<string>;
  exportToJSON(): Promise<string>;
  downloadFile(content: string, filename: string, mimeType: string): void;
}

/**
 * Error handling interface for consistent error management
 */
export interface ErrorHandler {
  logError(error: Error, context: string): void;
  showUserError(message: string, severity: 'info' | 'warning' | 'error'): void;
  recoverFromError(error: Error): boolean;
}

/**
 * Component prop interfaces
 */

export interface PatientFormProps {
  onPatientAdded?: () => void;
}

export interface TriageDashboardProps {
  refreshInterval?: number;
}

export interface TriageCardProps {
  patient: Patient;
  onClick?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
}

export interface ExportButtonProps {
  filename?: string;
}

export interface HandoverNotesProps {
  patient: Patient;
  onAddHandoverNote?: (note: Omit<HandoverNote, 'id' | 'timestamp' | 'patientId'>) => void;
  onUpdatePatient?: (updates: Partial<Patient>) => void;
}

export interface ShiftSummaryProps {
  patients: Patient[];
  shiftType: 'outgoing' | 'incoming';
  onCreateHandover?: (patientId: string, note: Omit<HandoverNote, 'id' | 'timestamp' | 'patientId'>) => void;
}

export interface HandoverDisplayProps {
  handoverNotes: HandoverNote[];
  statusChanges: StatusChange[];
  patientName: string;
}

/**
 * Predefined symptom options for the patient form
 */
export const SYMPTOM_OPTIONS = [
  // Critical symptoms
  'bleeding heavily',
  'unconscious',
  'fainting',
  'severe pain',
  'difficulty breathing',
  'chest pain',
  'severe burns',
  'head injury',
  
  // Urgent symptoms
  'fever',
  'vomiting',
  'moderate pain',
  'persistent cough',
  'diarrhea',
  'dizziness',
  'rash',
  'swelling',
  
  // Stable symptoms
  'mild cough',
  'minor cuts',
  'bruising',
  'mild headache',
  'fatigue',
  'sore throat',
  'runny nose',
  'minor aches'
] as const;

/**
 * Type for symptom options to ensure type safety
 */
export type SymptomOption = typeof SYMPTOM_OPTIONS[number];

/**
 * Triage level color mapping for UI consistency
 */
export const TRIAGE_COLORS = {
  Critical: {
    background: 'bg-red-100',
    border: 'border-red-500',
    text: 'text-red-900',
    badge: 'bg-red-500'
  },
  Urgent: {
    background: 'bg-yellow-100',
    border: 'border-yellow-500',
    text: 'text-yellow-900',
    badge: 'bg-yellow-500'
  },
  Stable: {
    background: 'bg-green-100',
    border: 'border-green-500',
    text: 'text-green-900',
    badge: 'bg-green-500'
  }
} as const;