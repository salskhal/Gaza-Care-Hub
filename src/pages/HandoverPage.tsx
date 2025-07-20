import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Clock, RefreshCw } from 'lucide-react';
import { ShiftSummary, HandoverDisplay } from '../components';
import { storageService } from '../services/storage';
import type { Patient, HandoverNote } from '../types';
import { theme, branding } from '../config';

/**
 * HandoverPage component for managing shift handovers
 * Provides interface for both outgoing and incoming staff
 */
export const HandoverPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'outgoing' | 'incoming' | 'view'>('outgoing');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  /**
   * Load patients from storage
   */
  const loadPatients = async () => {
    try {
      setError(null);
      const allPatients = await storageService.getPatients();
      setPatients(allPatients);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle creating handover note
   */
  const handleCreateHandover = async (
    patientId: string, 
    note: Omit<HandoverNote, 'id' | 'timestamp' | 'patientId'>
  ) => {
    try {
      await storageService.addHandoverNote(patientId, note);
      await loadPatients(); // Refresh data
    } catch (err) {
      console.error('Error creating handover note:', err);
      setError(err instanceof Error ? err.message : 'Failed to create handover note');
    }
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = () => {
    setLoading(true);
    loadPatients();
  };

  // Initial load
  useEffect(() => {
    loadPatients();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(loadPatients, 30000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600 mx-auto"></div>
            <Clock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-teal-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Handover System</h2>
          <p className="text-gray-600 text-lg mb-4">Preparing shift handover interface...</p>
          <p className="text-sm text-gray-500 italic">{branding.mission}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => window.history.back()}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="h-5 w-5 text-white" />
                  </button>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Shift Handover System
                    </h1>
                    <p className="text-teal-100 text-base sm:text-lg font-medium mt-1">
                      {branding.name} - Seamless Care Transitions
                    </p>
                  </div>
                </div>
                <p className="text-teal-100 text-sm sm:text-base max-w-2xl">
                  Manage shift communications, create handover notes, and ensure continuity of care 
                  for all patients in the triage system.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg shadow-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-white/20"
                  aria-label="Refresh handover data"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{patients.length}</div>
                  <div className="text-sm text-teal-100">Total Patients</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex px-6 sm:px-8">
              <button
                onClick={() => setActiveTab('outgoing')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'outgoing'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Outgoing Shift
              </button>
              <button
                onClick={() => setActiveTab('incoming')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'incoming'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Incoming Shift
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'view'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                View Handovers
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="px-6 sm:px-8 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span style={{ color: theme.colors.text.secondary }}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
                {error && (
                  <span style={{ color: theme.colors.critical[600] }}>
                    Error: {error}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span style={{ color: theme.colors.text.secondary }}>
                    {patients.filter(p => p.triageLevel === 'Critical').length} Critical
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span style={{ color: theme.colors.text.secondary }}>
                    {patients.filter(p => p.triageLevel === 'Urgent').length} Urgent
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span style={{ color: theme.colors.text.secondary }}>
                    {patients.filter(p => p.triageLevel === 'Stable').length} Stable
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl shadow-lg p-6">
            <div className="flex items-start gap-4">
              <div className="bg-red-500 rounded-full p-2 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-2">System Error</h3>
                <p className="text-base text-red-800 mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            {activeTab === 'outgoing' && (
              <ShiftSummary
                patients={patients}
                shiftType="outgoing"
                onCreateHandover={handleCreateHandover}
              />
            )}

            {activeTab === 'incoming' && (
              <ShiftSummary
                patients={patients}
                shiftType="incoming"
                onCreateHandover={handleCreateHandover}
              />
            )}

            {activeTab === 'view' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 
                    className="text-xl font-bold"
                    style={{
                      color: theme.colors.text.primary,
                      fontSize: theme.typography.fontSize.xl,
                      fontWeight: theme.typography.fontWeight.bold,
                    }}
                  >
                    Patient Handover Overview
                  </h3>
                  
                  <div className="text-sm" style={{ color: theme.colors.text.secondary }}>
                    Select a patient to view their handover notes
                  </div>
                </div>

                {/* Patient Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patients
                    .filter(patient => patient.handoverNotes && patient.handoverNotes.length > 0)
                    .map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                          selectedPatient?.id === patient.id
                            ? 'border-teal-500 bg-teal-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${
                              patient.triageLevel === 'Critical' ? 'bg-red-500' :
                              patient.triageLevel === 'Urgent' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          />
                          <span 
                            className="font-semibold"
                            style={{ color: theme.colors.text.primary }}
                          >
                            {patient.name}
                          </span>
                        </div>
                        
                        <div 
                          className="text-sm mb-2"
                          style={{ color: theme.colors.text.secondary }}
                        >
                          {patient.triageLevel} • {patient.status || 'Waiting'}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" style={{ color: theme.colors.primary[600] }} />
                          <span 
                            className="text-sm font-medium"
                            style={{ color: theme.colors.primary[600] }}
                          >
                            {patient.handoverNotes?.length || 0} handover note{(patient.handoverNotes?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>

                {/* No patients with handover notes */}
                {patients.filter(p => p.handoverNotes && p.handoverNotes.length > 0).length === 0 && (
                  <div 
                    className="text-center py-12 px-4 rounded-lg border-2 border-dashed"
                    style={{
                      borderColor: theme.colors.gray[300],
                      backgroundColor: theme.colors.gray[50],
                    }}
                  >
                    <Users 
                      className="h-16 w-16 mx-auto mb-4"
                      style={{ color: theme.colors.gray[400] }}
                    />
                    <h4 
                      className="text-xl font-medium mb-2"
                      style={{ color: theme.colors.text.primary }}
                    >
                      No Handover Notes Yet
                    </h4>
                    <p 
                      className="text-base mb-6"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Create handover notes using the "Outgoing Shift" tab to start tracking 
                      shift communications for patients.
                    </p>
                    <button
                      onClick={() => setActiveTab('outgoing')}
                      className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
                      style={{
                        backgroundColor: theme.colors.primary[600],
                        color: 'white',
                      }}
                    >
                      Create First Handover
                    </button>
                  </div>
                )}

                {/* Selected Patient Handover Display */}
                {selectedPatient && selectedPatient.handoverNotes && selectedPatient.handoverNotes.length > 0 && (
                  <div className="mt-8">
                    <HandoverDisplay
                      handoverNotes={selectedPatient.handoverNotes}
                      statusChanges={selectedPatient.statusChanges || []}
                      patientName={selectedPatient.name}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandoverPage;