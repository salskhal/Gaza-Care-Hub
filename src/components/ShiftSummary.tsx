import React, { useState, useMemo } from 'react';
import { Users, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import type { ShiftSummaryProps, Patient } from '../types';
import { theme, designTokens } from '../config';

/**
 * ShiftSummary component for outgoing staff to create comprehensive handover summaries
 * Displays patient overview and allows creation of shift handover notes
 */
export const ShiftSummary: React.FC<ShiftSummaryProps> = ({ 
  patients, 
  shiftType, 
  onCreateHandover 
}) => {
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());
  const [isCreatingBulkHandover, setIsCreatingBulkHandover] = useState(false);
  const [bulkHandoverData, setBulkHandoverData] = useState({
    staffName: '',
    generalNotes: '',
    shiftHighlights: '',
  });

  /**
   * Get shift statistics
   */
  const shiftStats = useMemo(() => {
    const totalPatients = patients.length;
    const criticalCount = patients.filter(p => p.triageLevel === 'Critical').length;
    const urgentCount = patients.filter(p => p.triageLevel === 'Urgent').length;
    const stableCount = patients.filter(p => p.triageLevel === 'Stable').length;
    
    const statusCounts = {
      waiting: patients.filter(p => (p.status || 'Waiting') === 'Waiting').length,
      inTreatment: patients.filter(p => (p.status || 'Waiting') === 'In Treatment').length,
      treated: patients.filter(p => (p.status || 'Waiting') === 'Treated').length,
      discharged: patients.filter(p => (p.status || 'Waiting') === 'Discharged').length,
      transferred: patients.filter(p => (p.status || 'Waiting') === 'Transferred').length,
    };

    // Get patients with recent changes (last 4 hours)
    const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
    const patientsWithRecentChanges = patients.filter(p => 
      p.statusChanges && p.statusChanges.some(change => 
        change.timestamp > fourHoursAgo && change.isHighlighted
      )
    );

    return {
      totalPatients,
      criticalCount,
      urgentCount,
      stableCount,
      statusCounts,
      patientsWithRecentChanges: patientsWithRecentChanges.length,
    };
  }, [patients]);

  /**
   * Get patients that need attention
   */
  const getPatientsNeedingAttention = (): Patient[] => {
    return patients.filter(patient => {
      // Critical patients always need attention
      if (patient.triageLevel === 'Critical') return true;
      
      // Patients with recent status changes
      const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
      const hasRecentChanges = patient.statusChanges?.some(change => 
        change.timestamp > fourHoursAgo && change.isHighlighted
      );
      
      // Patients waiting for long time (more than 2 hours)
      const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
      const waitingTooLong = patient.timestamp < twoHoursAgo && 
        (patient.status === 'Waiting' || !patient.status);
      
      return hasRecentChanges || waitingTooLong;
    }).sort((a, b) => {
      // Sort by triage priority first
      const triagePriority = { 'Critical': 1, 'Urgent': 2, 'Stable': 3 };
      const priorityDiff = triagePriority[a.triageLevel] - triagePriority[b.triageLevel];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by timestamp (oldest first)
      return a.timestamp - b.timestamp;
    });
  };

  /**
   * Format time duration
   */
  const formatDuration = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  /**
   * Handle patient selection for bulk handover
   */
  const togglePatientSelection = (patientId: string) => {
    setSelectedPatients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patientId)) {
        newSet.delete(patientId);
      } else {
        newSet.add(patientId);
      }
      return newSet;
    });
  };

  /**
   * Handle creating individual handover note
   */
  const handleCreateIndividualHandover = (patient: Patient) => {
    if (onCreateHandover) {
      onCreateHandover(patient.id, {
        staffName: bulkHandoverData.staffName || 'Staff Member',
        shiftType,
        summary: `Handover for ${patient.name} - ${patient.triageLevel} priority`,
        criticalUpdates: patient.triageLevel === 'Critical' ? 
          [`Critical patient requiring immediate attention`] : [],
        keyObservations: patient.condition || 'No specific observations',
        actionItems: [(patient.status || 'Waiting') === 'Waiting' ? 
          'Continue monitoring and assessment' : 
          `Follow up on ${patient.status?.toLowerCase()} status`],
        priority: patient.triageLevel === 'Critical' ? 'high' : 
                 patient.triageLevel === 'Urgent' ? 'medium' : 'low',
      });
    }
  };

  /**
   * Handle bulk handover creation
   */
  const handleBulkHandover = () => {
    if (!bulkHandoverData.staffName.trim()) return;
    
    selectedPatients.forEach(patientId => {
      const patient = patients.find(p => p.id === patientId);
      if (patient && onCreateHandover) {
        onCreateHandover(patientId, {
          staffName: bulkHandoverData.staffName,
          shiftType,
          summary: `${shiftType === 'outgoing' ? 'End of shift' : 'Start of shift'} handover for ${patient.name}`,
          criticalUpdates: patient.triageLevel === 'Critical' ? 
            [`Critical patient - ${patient.condition || 'requires immediate attention'}`] : [],
          keyObservations: bulkHandoverData.generalNotes || patient.condition || 'Standard care',
          actionItems: [
            patient.triageLevel === 'Critical' ? 'Monitor closely' : 'Continue routine care',
            ...(bulkHandoverData.shiftHighlights ? [bulkHandoverData.shiftHighlights] : [])
          ],
          priority: patient.triageLevel === 'Critical' ? 'high' : 
                   patient.triageLevel === 'Urgent' ? 'medium' : 'low',
        });
      }
    });
    
    // Reset form
    setSelectedPatients(new Set());
    setBulkHandoverData({ staffName: '', generalNotes: '', shiftHighlights: '' });
    setIsCreatingBulkHandover(false);
  };

  const patientsNeedingAttention = getPatientsNeedingAttention();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 
            className="text-2xl font-bold"
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
            }}
          >
            {shiftType === 'outgoing' ? 'End of Shift Summary' : 'Start of Shift Overview'}
          </h2>
          <p 
            className="text-sm mt-1"
            style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            {shiftType === 'outgoing' 
              ? 'Create handover notes for incoming staff' 
              : 'Review patient status and priorities'}
          </p>
        </div>
        
        <div className="text-right">
          <div 
            className="text-lg font-semibold"
            style={{ color: theme.colors.text.primary }}
          >
            {new Date().toLocaleTimeString()}
          </div>
          <div 
            className="text-sm"
            style={{ color: theme.colors.text.secondary }}
          >
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Shift Statistics */}
      <div 
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: theme.colors.primary[50],
          borderColor: theme.colors.primary[200],
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <h3 
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{
            color: theme.colors.primary[800],
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
          }}
        >
          <TrendingUp className="h-5 w-5" />
          Shift Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: theme.colors.text.primary }}
            >
              {shiftStats.totalPatients}
            </div>
            <div 
              className="text-sm"
              style={{ color: theme.colors.text.secondary }}
            >
              Total Patients
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: theme.colors.critical[600] }}
            >
              {shiftStats.criticalCount}
            </div>
            <div 
              className="text-sm"
              style={{ color: theme.colors.text.secondary }}
            >
              Critical
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: theme.colors.urgent[600] }}
            >
              {shiftStats.urgentCount}
            </div>
            <div 
              className="text-sm"
              style={{ color: theme.colors.text.secondary }}
            >
              Urgent
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: theme.colors.stable[600] }}
            >
              {shiftStats.stableCount}
            </div>
            <div 
              className="text-sm"
              style={{ color: theme.colors.text.secondary }}
            >
              Stable
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t" style={{ borderColor: theme.colors.primary[200] }}>
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
              {shiftStats.statusCounts.waiting}
            </div>
            <div className="text-xs" style={{ color: theme.colors.text.secondary }}>
              Waiting
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
              {shiftStats.statusCounts.inTreatment}
            </div>
            <div className="text-xs" style={{ color: theme.colors.text.secondary }}>
              In Treatment
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
              {shiftStats.statusCounts.treated}
            </div>
            <div className="text-xs" style={{ color: theme.colors.text.secondary }}>
              Treated
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
              {shiftStats.statusCounts.discharged}
            </div>
            <div className="text-xs" style={{ color: theme.colors.text.secondary }}>
              Discharged
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
              {shiftStats.statusCounts.transferred}
            </div>
            <div className="text-xs" style={{ color: theme.colors.text.secondary }}>
              Transferred
            </div>
          </div>
        </div>
      </div>

      {/* Patients Needing Attention */}
      {patientsNeedingAttention.length > 0 && (
        <div 
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: theme.colors.urgent[50],
            borderColor: theme.colors.urgent[200],
            borderRadius: theme.borderRadius.lg,
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4 flex items-center gap-2"
            style={{
              color: theme.colors.urgent[800],
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
            }}
          >
            <AlertTriangle className="h-5 w-5" />
            Patients Requiring Attention ({patientsNeedingAttention.length})
          </h3>
          
          <div className="space-y-3">
            {patientsNeedingAttention.slice(0, 5).map((patient) => (
              <div 
                key={patient.id}
                className="flex items-center justify-between p-3 rounded border"
                style={{
                  backgroundColor: 'white',
                  borderColor: theme.colors.gray[200],
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      patient.triageLevel === 'Critical' ? 'bg-red-500' :
                      patient.triageLevel === 'Urgent' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                  />
                  <div>
                    <div 
                      className="font-medium"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {patient.name}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {patient.triageLevel} • {patient.status || 'Waiting'} • {formatDuration(patient.timestamp)}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleCreateIndividualHandover(patient)}
                  className="px-3 py-1 text-sm rounded border transition-colors"
                  style={{
                    backgroundColor: theme.colors.primary[600],
                    color: 'white',
                    borderColor: theme.colors.primary[600],
                  }}
                >
                  Create Handover
                </button>
              </div>
            ))}
            
            {patientsNeedingAttention.length > 5 && (
              <div 
                className="text-center text-sm pt-2"
                style={{ color: theme.colors.text.secondary }}
              >
                +{patientsNeedingAttention.length - 5} more patients requiring attention
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Handover Creation */}
      {shiftType === 'outgoing' && (
        <div 
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'white',
            borderColor: theme.colors.gray[200],
            borderRadius: theme.borderRadius.lg,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 
              className="text-lg font-semibold flex items-center gap-2"
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
              }}
            >
              <FileText className="h-5 w-5" />
              Bulk Handover Creation
            </h3>
            
            <button
              onClick={() => setIsCreatingBulkHandover(!isCreatingBulkHandover)}
              className="px-4 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: isCreatingBulkHandover ? theme.colors.primary[600] : 'white',
                color: isCreatingBulkHandover ? 'white' : theme.colors.primary[600],
                borderColor: theme.colors.primary[600],
              }}
            >
              {isCreatingBulkHandover ? 'Cancel' : 'Create Bulk Handover'}
            </button>
          </div>

          {isCreatingBulkHandover && (
            <div className="space-y-4">
              {/* Staff Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: designTokens.form.label.color,
                      fontSize: designTokens.form.label.fontSize,
                      fontWeight: designTokens.form.label.fontWeight,
                    }}
                  >
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={bulkHandoverData.staffName}
                    onChange={(e) => setBulkHandoverData(prev => ({ ...prev, staffName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    style={{
                      minHeight: designTokens.input.minHeight,
                      fontSize: designTokens.input.fontSize,
                      borderRadius: designTokens.input.borderRadius,
                    }}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: designTokens.form.label.color,
                      fontSize: designTokens.form.label.fontSize,
                      fontWeight: designTokens.form.label.fontWeight,
                    }}
                  >
                    Selected Patients
                  </label>
                  <div 
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    style={{
                      minHeight: designTokens.input.minHeight,
                      fontSize: designTokens.input.fontSize,
                      borderRadius: designTokens.input.borderRadius,
                    }}
                  >
                    {selectedPatients.size} patient{selectedPatients.size !== 1 ? 's' : ''} selected
                  </div>
                </div>
              </div>

              {/* General Notes */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{
                    color: designTokens.form.label.color,
                    fontSize: designTokens.form.label.fontSize,
                    fontWeight: designTokens.form.label.fontWeight,
                  }}
                >
                  General Shift Notes
                </label>
                <textarea
                  value={bulkHandoverData.generalNotes}
                  onChange={(e) => setBulkHandoverData(prev => ({ ...prev, generalNotes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-vertical"
                  style={{
                    fontSize: designTokens.input.fontSize,
                    borderRadius: designTokens.input.borderRadius,
                  }}
                  rows={3}
                  placeholder="General observations and notes for the shift..."
                />
              </div>

              {/* Shift Highlights */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{
                    color: designTokens.form.label.color,
                    fontSize: designTokens.form.label.fontSize,
                    fontWeight: designTokens.form.label.fontWeight,
                  }}
                >
                  Shift Highlights
                </label>
                <textarea
                  value={bulkHandoverData.shiftHighlights}
                  onChange={(e) => setBulkHandoverData(prev => ({ ...prev, shiftHighlights: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-vertical"
                  style={{
                    fontSize: designTokens.input.fontSize,
                    borderRadius: designTokens.input.borderRadius,
                  }}
                  rows={2}
                  placeholder="Key highlights or important events during the shift..."
                />
              </div>

              {/* Patient Selection */}
              <div>
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{
                    color: designTokens.form.label.color,
                    fontSize: designTokens.form.label.fontSize,
                    fontWeight: designTokens.form.label.fontWeight,
                  }}
                >
                  Select Patients for Handover
                </label>
                
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {patients.map((patient) => (
                    <label 
                      key={patient.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPatients.has(patient.id)}
                        onChange={() => togglePatientSelection(patient.id)}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-2 h-2 rounded-full ${
                              patient.triageLevel === 'Critical' ? 'bg-red-500' :
                              patient.triageLevel === 'Urgent' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          />
                          <span 
                            className="font-medium"
                            style={{ color: theme.colors.text.primary }}
                          >
                            {patient.name}
                          </span>
                          <span 
                            className="text-sm px-2 py-1 rounded"
                            style={{
                              backgroundColor: theme.colors.gray[100],
                              color: theme.colors.gray[700],
                            }}
                          >
                            {patient.triageLevel}
                          </span>
                        </div>
                        <div 
                          className="text-sm mt-1"
                          style={{ color: theme.colors.text.secondary }}
                        >
                          {patient.status || 'Waiting'} • {formatDuration(patient.timestamp)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBulkHandover}
                  disabled={selectedPatients.size === 0 || !bulkHandoverData.staffName.trim()}
                  className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: theme.colors.primary[600],
                    color: 'white',
                    fontSize: designTokens.button.fontSize.md,
                    fontWeight: designTokens.button.fontWeight,
                    borderRadius: designTokens.button.borderRadius,
                    minHeight: designTokens.button.minHeight,
                  }}
                >
                  Create Handover Notes ({selectedPatients.size})
                </button>
                
                <button
                  onClick={() => setIsCreatingBulkHandover(false)}
                  className="px-6 py-3 rounded-lg font-medium border transition-all duration-200"
                  style={{
                    backgroundColor: 'white',
                    color: theme.colors.text.secondary,
                    borderColor: theme.colors.gray[300],
                    fontSize: designTokens.button.fontSize.md,
                    fontWeight: designTokens.button.fontWeight,
                    borderRadius: designTokens.button.borderRadius,
                    minHeight: designTokens.button.minHeight,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Patients Overview */}
      <div 
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'white',
          borderColor: theme.colors.gray[200],
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <h3 
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
          }}
        >
          <Users className="h-5 w-5" />
          All Patients ({patients.length})
        </h3>
        
        {patients.length === 0 ? (
          <div 
            className="text-center py-8"
            style={{ color: theme.colors.text.secondary }}
          >
            No patients in the system
          </div>
        ) : (
          <div className="space-y-2">
            {patients.map((patient) => (
              <div 
                key={patient.id}
                className="flex items-center justify-between p-3 rounded border hover:bg-gray-50"
                style={{ borderColor: theme.colors.gray[200] }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      patient.triageLevel === 'Critical' ? 'bg-red-500' :
                      patient.triageLevel === 'Urgent' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                  />
                  <div>
                    <div 
                      className="font-medium"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {patient.name} ({patient.age}y)
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {patient.triageLevel} • {patient.status || 'Waiting'} • {formatDuration(patient.timestamp)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {patient.handoverNotes && patient.handoverNotes.length > 0 && (
                    <span 
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: theme.colors.stable[100],
                        color: theme.colors.stable[700],
                      }}
                    >
                      {patient.handoverNotes.length} note{patient.handoverNotes.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  
                  {shiftType === 'outgoing' && (
                    <button
                      onClick={() => handleCreateIndividualHandover(patient)}
                      className="px-3 py-1 text-sm rounded border transition-colors"
                      style={{
                        backgroundColor: 'white',
                        color: theme.colors.primary[600],
                        borderColor: theme.colors.primary[600],
                      }}
                    >
                      Add Note
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftSummary;