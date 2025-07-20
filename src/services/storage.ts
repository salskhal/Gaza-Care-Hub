import Dexie, { type Table } from "dexie";
import type { Patient, StorageService, HandoverNote, StatusChange } from "../types";

/**
 * IndexedDB database class using Dexie for patient data storage
 */
export class TriageDatabase extends Dexie {
  patients!: Table<Patient>;

  constructor() {
    super("TriageDatabase");

    // Define database schema
    this.version(1).stores({
      patients: "id, name, age, symptoms, condition, triageLevel, timestamp",
    });
  }
}

/**
 * Storage service implementation using IndexedDB via Dexie
 * Provides offline-first data persistence for patient records
 */
export class IndexedDBStorageService implements StorageService {
  private db: TriageDatabase;

  constructor() {
    this.db = new TriageDatabase();
  }

  /**
   * Add a new patient to the database
   * @param patient Patient data without id and timestamp (auto-generated)
   * @returns Promise resolving to the generated patient ID
   */
  async addPatient(
    patient: Omit<Patient, "id" | "timestamp">
  ): Promise<string> {
    try {
      const id = crypto.randomUUID();
      const timestamp = Date.now();

      const fullPatient: Patient = {
        ...patient,
        id,
        timestamp,
        status: 'Waiting',
        notes: '',
        lastUpdated: timestamp,
      };

      await this.db.patients.add(fullPatient);
      return id;
    } catch (error) {
      console.error("Error adding patient:", error);
      throw new Error(
        `Failed to add patient: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Retrieve all patients from the database, sorted by timestamp (newest first)
   * @returns Promise resolving to array of all patients
   */
  async getPatients(): Promise<Patient[]> {
    try {
      const patients = await this.db.patients
        .orderBy("timestamp")
        .reverse()
        .toArray();

      return patients;
    } catch (error) {
      console.error("Error retrieving patients:", error);
      throw new Error(
        `Failed to retrieve patients: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update an existing patient record
   * @param id Patient ID to update
   * @param updates Partial patient data to update
   */
  async updatePatient(id: string, updates: Partial<Patient>): Promise<void> {
    try {
      const existingPatient = await this.db.patients.get(id);

      if (!existingPatient) {
        throw new Error(`Patient with ID ${id} not found`);
      }

      // Prevent updating id and timestamp by excluding them from updates
      const { id: _ignoredId, timestamp: _ignoredTimestamp, ...allowedUpdates } = updates;

      // Track status changes for handover notes
      const statusChanges = await this.trackStatusChanges(existingPatient, allowedUpdates);

      // Add lastUpdated timestamp and status changes
      const updatesWithTimestamp = {
        ...allowedUpdates,
        lastUpdated: Date.now(),
        statusChanges: statusChanges,
      };

      await this.db.patients.update(id, updatesWithTimestamp);
    } catch (error) {
      console.error("Error updating patient:", error);
      throw new Error(
        `Failed to update patient: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Track status changes for handover notes
   * @param existingPatient Current patient data
   * @param updates Updates being applied
   * @returns Updated status changes array
   */
  private async trackStatusChanges(
    existingPatient: Patient, 
    updates: Partial<Patient>
  ): Promise<StatusChange[]> {
    const existingChanges = existingPatient.statusChanges || [];
    const newChanges: StatusChange[] = [];
    const timestamp = Date.now();

    // Track status changes
    if (updates.status && updates.status !== existingPatient.status) {
      newChanges.push({
        id: crypto.randomUUID(),
        patientId: existingPatient.id,
        timestamp,
        changeType: 'status',
        previousValue: existingPatient.status || 'Unknown',
        newValue: updates.status,
        isHighlighted: true, // Status changes are always highlighted
      });
    }

    // Track triage level changes
    if (updates.triageLevel && updates.triageLevel !== existingPatient.triageLevel) {
      newChanges.push({
        id: crypto.randomUUID(),
        patientId: existingPatient.id,
        timestamp,
        changeType: 'triage',
        previousValue: existingPatient.triageLevel,
        newValue: updates.triageLevel,
        isHighlighted: true, // Triage changes are always highlighted
      });
    }

    // Track treatment notes changes
    if (updates.notes && updates.notes !== existingPatient.notes) {
      newChanges.push({
        id: crypto.randomUUID(),
        patientId: existingPatient.id,
        timestamp,
        changeType: 'notes',
        previousValue: existingPatient.notes || 'No notes',
        newValue: updates.notes,
        isHighlighted: false,
      });
    }

    // Track treatment plan changes
    if (updates.treatmentPlan && updates.treatmentPlan !== existingPatient.treatmentPlan) {
      newChanges.push({
        id: crypto.randomUUID(),
        patientId: existingPatient.id,
        timestamp,
        changeType: 'treatment',
        previousValue: existingPatient.treatmentPlan || 'No treatment plan',
        newValue: updates.treatmentPlan,
        isHighlighted: true, // Treatment plan changes are highlighted
      });
    }

    // Combine existing and new changes, keeping only last 50 changes
    const allChanges = [...existingChanges, ...newChanges]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);

    return allChanges;
  }

  /**
   * Add a handover note to a patient
   * @param patientId Patient ID
   * @param handoverNote Handover note data
   */
  async addHandoverNote(
    patientId: string, 
    handoverNote: Omit<HandoverNote, 'id' | 'timestamp' | 'patientId'>
  ): Promise<void> {
    try {
      const existingPatient = await this.db.patients.get(patientId);

      if (!existingPatient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      const newHandoverNote: HandoverNote = {
        ...handoverNote,
        id: crypto.randomUUID(),
        patientId,
        timestamp: Date.now(),
      };

      const existingNotes = existingPatient.handoverNotes || [];
      const updatedNotes = [newHandoverNote, ...existingNotes].slice(0, 20); // Keep last 20 notes

      await this.db.patients.update(patientId, {
        handoverNotes: updatedNotes,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error("Error adding handover note:", error);
      throw new Error(
        `Failed to add handover note: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete a patient record from the database
   * @param id Patient ID to delete
   */
  async deletePatient(id: string): Promise<void> {
    try {
      await this.db.patients.delete(id);
      
      // Verify the patient was deleted by checking if it still exists
      const existingPatient = await this.db.patients.get(id);
      if (existingPatient) {
        throw new Error(`Patient with ID ${id} could not be deleted`);
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
      throw new Error(
        `Failed to delete patient: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get patients filtered by triage level
   * @param triageLevel Triage level to filter by
   * @returns Promise resolving to filtered patients
   */
  async getPatientsByTriageLevel(
    triageLevel: Patient["triageLevel"]
  ): Promise<Patient[]> {
    try {
      const patients = await this.db.patients
        .where("triageLevel")
        .equals(triageLevel)
        .sortBy("timestamp");

      return patients.reverse(); // Newest first
    } catch (error) {
      console.error("Error retrieving patients by triage level:", error);
      throw new Error(
        `Failed to retrieve patients by triage level: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get patients filtered by status
   * @param status Patient status to filter by
   * @returns Promise resolving to filtered patients
   */
  async getPatientsByStatus(
    status: Patient["status"]
  ): Promise<Patient[]> {
    try {
      const patients = await this.db.patients
        .where("status")
        .equals(status)
        .sortBy("timestamp");

      return patients.reverse(); // Newest first
    } catch (error) {
      console.error("Error retrieving patients by status:", error);
      throw new Error(
        `Failed to retrieve patients by status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Search patients by name
   * @param searchTerm Search term to match against patient names
   * @returns Promise resolving to matching patients
   */
  async searchPatients(searchTerm: string): Promise<Patient[]> {
    try {
      const allPatients = await this.getPatients();
      const searchLower = searchTerm.toLowerCase();
      
      return allPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchLower) ||
        patient.condition.toLowerCase().includes(searchLower) ||
        patient.notes.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error("Error searching patients:", error);
      throw new Error(
        `Failed to search patients: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get total count of patients in the database
   * @returns Promise resolving to patient count
   */
  async getPatientCount(): Promise<number> {
    try {
      return await this.db.patients.count();
    } catch (error) {
      console.error("Error getting patient count:", error);
      throw new Error(
        `Failed to get patient count: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Clear all patient data from the database
   * @returns Promise resolving when all data is cleared
   */
  async clearAllPatients(): Promise<void> {
    try {
      await this.db.patients.clear();
    } catch (error) {
      console.error("Error clearing patients:", error);
      throw new Error(
        `Failed to clear patients: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    try {
      await this.db.close();
    } catch (error) {
      console.error("Error closing database:", error);
      throw new Error(
        `Failed to close database: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

// Export a singleton instance for use throughout the application
export const storageService = new IndexedDBStorageService();
