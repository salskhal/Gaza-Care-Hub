import type { Patient, ExportService } from "../types";
import { storageService } from "./storage";

/**
 * Export service implementation for generating CSV and JSON exports
 * Provides data export functionality for sharing patient information
 */
export class PatientExportService implements ExportService {
  /**
   * Export all patient data to CSV format
   * @returns Promise resolving to CSV string content
   */
  async exportToCSV(): Promise<string> {
    try {
      const patients = await storageService.getPatients();
      
      if (patients.length === 0) {
        return "No patient data available for export";
      }

      // CSV headers matching requirements (4.2)
      const headers = [
        "Patient ID",
        "Name", 
        "Age",
        "Symptoms",
        "Condition",
        "Triage Level",
        "Timestamp"
      ];

      // Create CSV rows
      const csvRows = [
        headers.join(","), // Header row
        ...patients.map(patient => this.patientToCSVRow(patient))
      ];

      return csvRows.join("\n");
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      throw new Error(
        `Failed to export CSV: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Export all patient data to JSON format
   * @returns Promise resolving to JSON string content
   */
  async exportToJSON(): Promise<string> {
    try {
      const patients = await storageService.getPatients();
      
      // Create export object with metadata
      const exportData = {
        exportTimestamp: new Date().toISOString(),
        patientCount: patients.length,
        patients: patients.map(patient => ({
          ...patient,
          timestamp: this.formatTimestamp(patient.timestamp)
        }))
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Error exporting to JSON:", error);
      throw new Error(
        `Failed to export JSON: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Download a file with the given content
   * @param content File content as string
   * @param filename Name of the file to download
   * @param mimeType MIME type of the file
   */
  downloadFile(content: string, filename: string, mimeType: string): void {
    try {
      // Create blob with the content
      const blob = new Blob([content], { type: mimeType });
      
      // Create download URL
      const url = URL.createObjectURL(blob);
      
      // Create temporary anchor element for download
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = "none";
      
      // Trigger download
      document.body.appendChild(anchor);
      anchor.click();
      
      // Cleanup
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      throw new Error(
        `Failed to download file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Convert a patient record to a CSV row
   * @param patient Patient data to convert
   * @returns CSV row string
   */
  private patientToCSVRow(patient: Patient): string {
    // Format symptoms with semicolon separation as per requirement 4.5
    const symptomsFormatted = patient.symptoms.join(";");
    
    // Format timestamp as per requirement 4.5
    const timestampFormatted = this.formatTimestamp(patient.timestamp);
    
    // Escape CSV values that contain commas, quotes, or newlines
    const csvValues = [
      this.escapeCSVValue(patient.id),
      this.escapeCSVValue(patient.name),
      patient.age.toString(),
      this.escapeCSVValue(symptomsFormatted),
      this.escapeCSVValue(patient.condition),
      this.escapeCSVValue(patient.triageLevel),
      this.escapeCSVValue(timestampFormatted)
    ];

    return csvValues.join(",");
  }

  /**
   * Escape a value for CSV format
   * @param value Value to escape
   * @returns Escaped CSV value
   */
  private escapeCSVValue(value: string): string {
    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Format timestamp for export
   * @param timestamp Unix timestamp
   * @returns Formatted timestamp string
   */
  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    
    // Format as ISO string for consistency and readability
    // Example: "2024-01-15T14:30:45.123Z"
    return date.toISOString();
  }

  /**
   * Generate timestamped filename for exports
   * @param prefix Filename prefix (e.g., "triage-export")
   * @param extension File extension (e.g., "csv", "json")
   * @returns Timestamped filename
   */
  generateTimestampedFilename(prefix: string, extension: string): string {
    const now = new Date();
    
    // Format: YYYY-MM-DD_HH-MM-SS
    const timestamp = now.toISOString()
      .replace(/:/g, "-")
      .replace(/\./g, "-")
      .slice(0, 19); // Remove milliseconds and timezone
    
    return `${prefix}_${timestamp}.${extension}`;
  }

  /**
   * Get export statistics
   * @returns Promise resolving to export statistics
   */
  async getExportStats(): Promise<{
    totalPatients: number;
    criticalCount: number;
    urgentCount: number;
    stableCount: number;
  }> {
    try {
      const patients = await storageService.getPatients();
      
      return {
        totalPatients: patients.length,
        criticalCount: patients.filter(p => p.triageLevel === "Critical").length,
        urgentCount: patients.filter(p => p.triageLevel === "Urgent").length,
        stableCount: patients.filter(p => p.triageLevel === "Stable").length
      };
    } catch (error) {
      console.error("Error getting export stats:", error);
      throw new Error(
        `Failed to get export stats: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

// Export singleton instance for use throughout the application
export const exportService = new PatientExportService();