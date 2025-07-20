import React, { useState } from "react";
import { exportService } from "../services/export";
import type { ExportButtonProps } from "../types";

/**
 * ExportButton component for downloading patient data as CSV files
 * Provides user feedback during export process and handles errors gracefully
 */
export const ExportButton: React.FC<ExportButtonProps> = ({ 
  filename 
}) => {
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  /**
   * Handle CSV export with user feedback
   */
  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    setExportStatus({ type: null, message: '' });

    try {
      // Generate CSV content
      const csvContent = await exportService.exportToCSV();
      
      // Check if there's data to export
      if (csvContent === "No patient data available for export") {
        setExportStatus({
          type: 'error',
          message: 'No patient data available for export'
        });
        return;
      }

      // Generate timestamped filename
      const exportFilename = filename || 
        exportService.generateTimestampedFilename("triage-export", "csv");

      // Download the file
      exportService.downloadFile(csvContent, exportFilename, "text/csv");

      // Show success feedback
      setExportStatus({
        type: 'success',
        message: `Export completed successfully! Downloaded as ${exportFilename}`
      });

    } catch (error) {
      console.error("Export failed:", error);
      setExportStatus({
        type: 'error',
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsExportingCSV(false);
      
      // Clear status message after 5 seconds
      setTimeout(() => {
        setExportStatus({ type: null, message: '' });
      }, 5000);
    }
  };

  /**
   * Handle JSON export (bonus functionality)
   */
  const handleExportJSON = async () => {
    setIsExportingJSON(true);
    setExportStatus({ type: null, message: '' });

    try {
      // Generate JSON content
      const jsonContent = await exportService.exportToJSON();
      
      // Generate timestamped filename
      const exportFilename = exportService.generateTimestampedFilename("triage-export", "json");

      // Download the file
      exportService.downloadFile(jsonContent, exportFilename, "application/json");

      // Show success feedback
      setExportStatus({
        type: 'success',
        message: `JSON export completed! Downloaded as ${exportFilename}`
      });

    } catch (error) {
      console.error("JSON export failed:", error);
      setExportStatus({
        type: 'error',
        message: `JSON export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsExportingJSON(false);
      
      // Clear status message after 5 seconds
      setTimeout(() => {
        setExportStatus({ type: null, message: '' });
      }, 5000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExportCSV}
          disabled={isExportingCSV || isExportingJSON}
          className={`
            flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium
            min-h-[44px] min-w-[44px] transition-all duration-200
            ${isExportingCSV || isExportingJSON
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
          aria-label="Export patient data as CSV file"
        >
          {isExportingCSV ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <span>Export CSV</span>
            </>
          )}
        </button>

        <button
          onClick={handleExportJSON}
          disabled={isExportingCSV || isExportingJSON}
          className={`
            flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium
            min-h-[44px] min-w-[44px] transition-all duration-200
            ${isExportingCSV || isExportingJSON
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
            }
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          `}
          aria-label="Export patient data as JSON file"
        >
          {isExportingJSON ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                />
              </svg>
              <span>Export JSON</span>
            </>
          )}
        </button>
      </div>

      {/* Status Message */}
      {exportStatus.type && (
        <div 
          className={`
            p-4 rounded-lg border-l-4 transition-all duration-300
            ${exportStatus.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : 'bg-red-50 border-red-400 text-red-800'
            }
          `}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {exportStatus.type === 'success' ? (
                <svg 
                  className="w-5 h-5 text-green-400" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                    clipRule="evenodd" 
                  />
                </svg>
              ) : (
                <svg 
                  className="w-5 h-5 text-red-400" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                {exportStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Export Statistics (Optional Enhancement) */}
      <ExportStats />
    </div>
  );
};

/**
 * Component to display export statistics
 */
const ExportStats: React.FC = () => {
  const [stats, setStats] = useState<{
    totalPatients: number;
    criticalCount: number;
    urgentCount: number;
    stableCount: number;
  } | null>(null);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const exportStats = await exportService.getExportStats();
        setStats(exportStats);
      } catch (error) {
        console.error("Failed to load export stats:", error);
      }
    };

    loadStats();
  }, []);

  if (!stats || stats.totalPatients === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Export Summary</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.totalPatients}</div>
          <div className="text-gray-600">Total Patients</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.criticalCount}</div>
          <div className="text-gray-600">Critical</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.urgentCount}</div>
          <div className="text-gray-600">Urgent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.stableCount}</div>
          <div className="text-gray-600">Stable</div>
        </div>
      </div>
    </div>
  );
};