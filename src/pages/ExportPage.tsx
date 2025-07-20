import React, { useState, useEffect } from 'react';
import { FileDown, Download, Share2, Database, Clock, Users, Activity } from 'lucide-react';
import { ExportButton } from '../components';
import { storageService } from '../services/storage';
import { branding } from '../config';
import type { Patient } from '../types';

/**
 * Export Page Component
 * 
 * Dedicated page for exporting patient data with enhanced functionality and Gaza Care Hub branding.
 * Provides comprehensive data export options and system statistics.
 */
export const ExportPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Load patients for statistics
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const allPatients = await storageService.getPatients();
        setPatients(allPatients);
      } catch (error) {
        console.error('Error loading patients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  // Get statistics
  const getTriageCount = (triageLevel: Patient['triageLevel']) => {
    return patients.filter(patient => patient.triageLevel === triageLevel).length;
  };



  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Page Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 sm:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <FileDown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    Export Patient Data
                  </h1>
                  <p className="text-teal-100 text-lg font-medium mt-1">
                    {branding.name} - Data Management
                  </p>
                </div>
              </div>
              <p className="text-teal-100 text-base sm:text-lg max-w-2xl">
                Export comprehensive patient data for sharing with medical teams, creating backups, or generating reports for healthcare coordination.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <Database className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-white font-semibold">{patients.length}</div>
                <div className="text-teal-100 text-sm">Total Records</div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Status */}
        <div className="px-6 sm:px-8 py-4 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-gray-700 font-medium">Export System Ready</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Ready for export</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Patients */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-teal-100 rounded-full p-3">
              <Users className="h-6 w-6 text-teal-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{patients.length}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Patients</h3>
          <p className="text-gray-600 text-sm">All registered patients</p>
        </div>

        {/* Critical Cases */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-red-900">{getTriageCount('Critical')}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Critical Cases</h3>
          <p className="text-gray-600 text-sm">Immediate attention required</p>
        </div>

        {/* Urgent Cases */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-100 rounded-full p-3">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-2xl font-bold text-amber-900">{getTriageCount('Urgent')}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Urgent Cases</h3>
          <p className="text-gray-600 text-sm">Prompt care needed</p>
        </div>

        {/* Stable Cases */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-900">{getTriageCount('Stable')}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Stable Cases</h3>
          <p className="text-gray-600 text-sm">Routine care patients</p>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Export Options</h2>
          <p className="text-gray-600">
            Choose from various export formats to share patient data with medical teams or create system backups.
          </p>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Primary Export */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-teal-100 rounded-full p-2">
                    <Download className="h-5 w-5 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-teal-900">CSV Export</h3>
                </div>
                <p className="text-teal-800 text-sm mb-6 leading-relaxed">
                  Export all patient data in CSV format for use with spreadsheet applications, 
                  medical databases, or sharing with other healthcare systems.
                </p>
                <div className="space-y-4">
                  <ExportButton />
                  <div className="text-xs text-teal-700 bg-teal-100 rounded-lg p-3">
                    <strong>Includes:</strong> Patient details, triage levels, symptoms, conditions, 
                    timestamps, and current status information.
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Export Options */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gray-100 rounded-full p-2">
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Additional Formats</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Additional export formats and sharing options will be available in future updates 
                  to support various medical system integrations.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">JSON Export</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">PDF Reports</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">HL7 FHIR</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Privacy Notice */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 rounded-full p-3 flex-shrink-0">
            <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">Data Privacy & Security</h3>
            <p className="text-amber-800 text-sm leading-relaxed mb-4">
              All exported data contains sensitive medical information. Please ensure compliance with 
              local healthcare privacy regulations and secure handling of patient data.
            </p>
            <ul className="text-amber-800 text-sm space-y-1">
              <li>• Store exported files securely and limit access to authorized personnel</li>
              <li>• Use encrypted communication channels when sharing patient data</li>
              <li>• Follow your organization's data retention and disposal policies</li>
              <li>• Ensure compliance with applicable healthcare privacy laws</li>
            </ul>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{branding.name}</h3>
          <p className="text-gray-600 text-sm">{branding.mission}</p>
          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-200 border-t-teal-600"></div>
              <span className="text-sm text-gray-500">Loading system data...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportPage;