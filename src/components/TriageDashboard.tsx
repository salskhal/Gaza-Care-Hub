import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, X, Heart, Users, Clock, Activity } from 'lucide-react';
import type { Patient, TriageDashboardProps, TriageLevel, PatientStatus } from '../types';
import { storageService } from '../services/storage';
import { VirtualizedPatientList } from './VirtualizedPatientList';
import { PatientEditModal } from './PatientEditModal';
import { usePerformanceMonitoring, throttle } from '../lib/performance';
import { branding } from '../config';

/**
 * TriageDashboard component displays a prioritized patient queue with auto-refresh
 * Sorts patients by triage level priority and provides real-time updates
 * Optimized for low-spec devices with performance monitoring and efficient rendering
 */
export const TriageDashboard: React.FC<TriageDashboardProps> = ({ 
  refreshInterval = 5000 // Default 5 second refresh interval
}) => {
  const { isLowSpecDevice } = usePerformanceMonitoring();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // New state for filtering and editing
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'All'>('All');
  const [triageFilter, setTriageFilter] = useState<TriageLevel | 'All'>('All');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Adjust refresh interval for low-spec devices
  const adjustedRefreshInterval = useMemo(() => {
    return isLowSpecDevice() ? Math.max(refreshInterval * 2, 10000) : refreshInterval;
  }, [refreshInterval, isLowSpecDevice]);

  // Sort patients by triage level priority
  const sortPatientsByPriority = useCallback((patients: Patient[]): Patient[] => {
    const triagePriority = {
      'Critical': 1,
      'Urgent': 2,
      'Stable': 3
    };

    return [...patients].sort((a, b) => {
      const priorityDiff = triagePriority[a.triageLevel] - triagePriority[b.triageLevel];
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp - a.timestamp;
    });
  }, []);

  // Load patients from storage
  const loadPatients = useCallback(async () => {
    try {
      setError(null);
      const allPatients = await storageService.getPatients();
      const sortedPatients = sortPatientsByPriority(allPatients);
      setPatients(sortedPatients);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [sortPatientsByPriority]);

  // Initial load
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Throttled refresh
  const throttledLoadPatients = useMemo(
    () => throttle(loadPatients, 1000),
    [loadPatients]
  );

  // Auto-refresh
  useEffect(() => {
    if (adjustedRefreshInterval <= 0) return;
    const intervalId = setInterval(throttledLoadPatients, adjustedRefreshInterval);
    return () => clearInterval(intervalId);
  }, [throttledLoadPatients, adjustedRefreshInterval]);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    setLoading(true);
    loadPatients();
  }, [loadPatients]);

  // Get count of patients by triage level
  const getTriageCount = useCallback((triageLevel: Patient['triageLevel']) => {
    return patients.filter(patient => patient.triageLevel === triageLevel).length;
  }, [patients]);

  // Filter patients based on search and filters
  const filteredPatients = useMemo(() => {
    let filtered = patients;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchLower) ||
        patient.condition.toLowerCase().includes(searchLower) ||
        (patient.notes && patient.notes.toLowerCase().includes(searchLower)) ||
        patient.symptoms.some(symptom => symptom.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(patient => (patient.status || 'Waiting') === statusFilter);
    }

    // Apply triage filter
    if (triageFilter !== 'All') {
      filtered = filtered.filter(patient => patient.triageLevel === triageFilter);
    }

    return filtered;
  }, [patients, searchTerm, statusFilter, triageFilter]);

  // Handle patient edit
  const handleEditPatient = useCallback(async (updatedData: Partial<Patient>) => {
    if (!editingPatient) return;

    try {
      await storageService.updatePatient(editingPatient.id, updatedData);
      await loadPatients(); // Refresh the list
      setEditingPatient(null);
    } catch (err) {
      console.error('Error updating patient:', err);
      setError(err instanceof Error ? err.message : 'Failed to update patient');
    }
  }, [editingPatient, loadPatients]);

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 animate-fade-in">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative mb-6 animate-scale-in">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600 mx-auto shadow-lg"></div>
            <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-teal-600 gaza-heartbeat" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in-up">{branding.name}</h2>
          <p className="text-gray-600 text-lg mb-4 animate-slide-up">Loading patient queue...</p>
          <p className="text-sm text-gray-500 italic animate-fade-in">{branding.mission}</p>
          
          {/* Enhanced loading dots */}
          <div className="flex justify-center space-x-1 mt-6 animate-fade-in">
            <div className="w-2 h-2 bg-teal-600 rounded-full gaza-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-teal-600 rounded-full gaza-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-teal-600 rounded-full gaza-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
      <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
        {/* Enhanced Header with Gaza Care Hub Branding */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Hero Section with Branding */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3">
                    <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h1 id="dashboard-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                      {branding.name}
                    </h1>
                    <p className="text-teal-100 text-base sm:text-lg font-medium mt-1">
                      {branding.tagline}
                    </p>
                  </div>
                </div>
                <p className="text-teal-100 text-sm sm:text-base lg:text-lg max-w-2xl">
                  {branding.mission}
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-2 mt-4">
                  <Activity className="h-4 w-4 text-teal-200" />
                  <p className="text-sm text-teal-200" aria-live="polite">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="inline-flex items-center px-4 sm:px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-teal-600 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] transition-all duration-200 border border-white/20 text-sm sm:text-base w-full sm:w-auto"
                  aria-label="Refresh patient queue"
                >
                  <svg 
                    className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${loading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                  </svg>
                  <span className="hidden sm:inline">Refresh Queue</span>
                  <span className="sm:hidden">Refresh</span>
                </button>
                
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <div className="text-xl sm:text-2xl font-bold text-white">{patients.length}</div>
                  <div className="text-xs sm:text-sm text-teal-100">Total Patients</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Triage Statistics Cards */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gray-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6" role="region" aria-labelledby="triage-stats-title">
              <h2 id="triage-stats-title" className="sr-only">Triage Level Statistics</h2>
              
              {/* Critical Patients Card */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1" role="group" aria-labelledby="critical-stats">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full mr-2 sm:mr-3 animate-pulse" aria-hidden="true"></div>
                    <span id="critical-stats" className="text-base sm:text-lg font-bold text-red-900">Critical</span>
                  </div>
                  <div className="bg-red-500 rounded-full p-1.5 sm:p-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl sm:text-4xl font-black text-red-900 mb-1" aria-label={`${getTriageCount('Critical')} critical patients`}>
                      {getTriageCount('Critical')}
                    </p>
                    <p className="text-xs sm:text-sm text-red-700 font-medium">Immediate attention</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-red-600 font-semibold bg-red-200 px-2 py-1 rounded-full">
                      HIGH PRIORITY
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Urgent Patients Card */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1" role="group" aria-labelledby="urgent-stats">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-500 rounded-full mr-2 sm:mr-3" aria-hidden="true"></div>
                    <span id="urgent-stats" className="text-base sm:text-lg font-bold text-amber-900">Urgent</span>
                  </div>
                  <div className="bg-amber-500 rounded-full p-1.5 sm:p-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl sm:text-4xl font-black text-amber-900 mb-1" aria-label={`${getTriageCount('Urgent')} urgent patients`}>
                      {getTriageCount('Urgent')}
                    </p>
                    <p className="text-xs sm:text-sm text-amber-700 font-medium">Prompt care needed</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-amber-700 font-semibold bg-amber-200 px-2 py-1 rounded-full">
                      MODERATE
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stable Patients Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1" role="group" aria-labelledby="stable-stats">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full mr-2 sm:mr-3" aria-hidden="true"></div>
                    <span id="stable-stats" className="text-base sm:text-lg font-bold text-emerald-900">Stable</span>
                  </div>
                  <div className="bg-emerald-500 rounded-full p-1.5 sm:p-2">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl sm:text-4xl font-black text-emerald-900 mb-1" aria-label={`${getTriageCount('Stable')} stable patients`}>
                      {getTriageCount('Stable')}
                    </p>
                    <p className="text-xs sm:text-sm text-emerald-700 font-medium">Routine care</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-emerald-700 font-semibold bg-emerald-200 px-2 py-1 rounded-full">
                      STABLE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Controls */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Patient Search & Filters</h2>
            <p className="text-sm sm:text-base text-gray-600">Find and filter patients in the triage queue</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
            {/* Enhanced Search Input */}
            <div className="flex-1">
              <label htmlFor="patient-search" className="block text-sm font-semibold text-gray-700 mb-2">
                Search Patients
              </label>
              <div className="relative group">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5 group-focus-within:text-teal-500 transition-colors" />
                <input
                  id="patient-search"
                  type="text"
                  placeholder="Search by name, condition, symptoms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm sm:text-base placeholder-gray-400 bg-gray-50 focus:bg-white min-h-[48px]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Enhanced Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 transition-all duration-200 font-semibold min-h-[48px] w-full sm:w-auto sm:min-w-[140px] ${
                  showFilters 
                    ? 'bg-teal-50 border-teal-300 text-teal-700 shadow-md' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                }`}
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Filters</span>
                {(statusFilter !== 'All' || triageFilter !== 'All') && (
                  <span className="bg-teal-500 text-white text-xs rounded-full px-2.5 py-1 min-w-[24px] h-6 flex items-center justify-center font-bold shadow-sm">
                    {(statusFilter !== 'All' ? 1 : 0) + (triageFilter !== 'All' ? 1 : 0)}
                  </span>
                )}
              </button>
              
              {/* Quick Stats */}
              <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[48px]">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {filteredPatients.length} of {patients.length}
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Filter Options */}
          {showFilters && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-gray-100 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Status Filter */}
                <div className="space-y-3">
                  <label htmlFor="status-filter" className="block text-sm font-bold text-gray-700">
                    Filter by Patient Status
                  </label>
                  <div className="relative">
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as PatientStatus | 'All')}
                      className="w-full px-3 sm:px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm sm:text-base bg-gray-50 focus:bg-white appearance-none cursor-pointer min-h-[48px]"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Waiting">⏳ Waiting</option>
                      <option value="In Treatment">🏥 In Treatment</option>
                      <option value="Treated">✅ Treated</option>
                      <option value="Discharged">🏠 Discharged</option>
                      <option value="Transferred">🚑 Transferred</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Triage Filter */}
                <div className="space-y-3">
                  <label htmlFor="triage-filter" className="block text-sm font-bold text-gray-700">
                    Filter by Triage Priority
                  </label>
                  <div className="relative">
                    <select
                      id="triage-filter"
                      value={triageFilter}
                      onChange={(e) => setTriageFilter(e.target.value as TriageLevel | 'All')}
                      className="w-full px-3 sm:px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm sm:text-base bg-gray-50 focus:bg-white appearance-none cursor-pointer min-h-[48px]"
                    >
                      <option value="All">All Triage Levels</option>
                      <option value="Critical">🔴 Critical</option>
                      <option value="Urgent">🟡 Urgent</option>
                      <option value="Stable">🟢 Stable</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(statusFilter !== 'All' || triageFilter !== 'All') && (
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-teal-50 rounded-xl border border-teal-200">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-medium text-teal-800">
                      Active filters applied
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setStatusFilter('All');
                      setTriageFilter('All');
                    }}
                    className="text-sm text-teal-700 hover:text-teal-900 font-semibold bg-white px-4 py-2 rounded-lg border border-teal-200 hover:border-teal-300 transition-colors min-h-[44px] w-full sm:w-auto"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Results Summary */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-teal-100 rounded-full p-2 flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    {filteredPatients.length} Patient{filteredPatients.length !== 1 ? 's' : ''} Found
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {filteredPatients.length !== patients.length && `of ${patients.length} total patients`}
                    {searchTerm && ` matching "${searchTerm}"`}
                    {statusFilter !== 'All' && ` • Status: ${statusFilter}`}
                    {triageFilter !== 'All' && ` • Priority: ${triageFilter}`}
                  </p>
                </div>
              </div>
              
              {filteredPatients.length > 0 && (
                <div className="text-center sm:text-right">
                  <div className="text-xs sm:text-sm text-gray-500">Queue Status</div>
                  <div className="text-sm sm:text-lg font-semibold text-teal-600">
                    {getTriageCount('Critical') > 0 ? 'Critical Cases Present' : 
                     getTriageCount('Urgent') > 0 ? 'Urgent Cases Present' : 
                     'Stable Queue'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl shadow-lg p-6 animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="bg-red-500 rounded-full p-2 flex-shrink-0 animate-scale-in">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-2 animate-slide-in-left">System Error</h3>
                <p className="text-base text-red-800 mb-4 animate-fade-in">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3 animate-slide-up">
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105 min-h-[44px] shadow-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center justify-center px-4 py-2 bg-white text-red-700 border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105 min-h-[44px] shadow-sm"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            </div>
            
            {/* Medical system notice */}
            <div className="mt-4 p-3 bg-white/50 rounded-lg border border-red-200 animate-fade-in">
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800">
                    <strong>Medical System Notice:</strong> This error may affect patient care operations. 
                    All patient data remains secure and accessible offline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Patient Queue Display */}
        {patients.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 animate-fade-in-up" role="status" aria-live="polite">
            <div className="max-w-md mx-auto">
              <div className="bg-teal-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center animate-scale-in gaza-float">
                <Users className="w-12 h-12 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 animate-fade-in-up">No Patients in Queue</h3>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed animate-slide-up">
                The {branding.name} triage system is ready to receive patients. 
                New patient registrations will appear here automatically.
              </p>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-800 animate-fade-in">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-teal-600 animate-pulse" />
                  <p className="font-medium">System Status: Active & Monitoring</p>
                </div>
                <p className="mt-1">{branding.mission}</p>
              </div>
            </div>
          </div>
        ) : (
          <section className="space-y-6" aria-labelledby="patient-queue-title">
            <div className="flex items-center justify-between">
              <h2 id="patient-queue-title" className="text-2xl font-bold text-gray-900">
                Patient Queue
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Activity className="h-4 w-4" />
                <span>Live Updates Active</span>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <VirtualizedPatientList
                patients={filteredPatients}
                onPatientClick={(patient) => {
                  console.log('Patient card clicked:', patient.name);
                }}
                onPatientEdit={(patient) => {
                  setEditingPatient(patient);
                }}
              />
            </div>
          </section>
        )}

        {/* Patient Edit Modal */}
        {editingPatient && (
          <PatientEditModal
            patient={editingPatient}
            isOpen={true}
            onClose={() => setEditingPatient(null)}
            onSave={handleEditPatient}
          />
        )}
      </div>
    </div>
  );
};

export default TriageDashboard;
