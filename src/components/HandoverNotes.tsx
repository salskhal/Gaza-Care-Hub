import React, { useState } from 'react';
import { Plus, Clock, User, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import type { HandoverNotesProps, StatusChange } from '../types';
import { theme, designTokens } from '../config';

/**
 * HandoverNotes component for managing shift change communications
 * Displays existing handover notes and allows creation of new ones
 */
export const HandoverNotes: React.FC<HandoverNotesProps> = ({ 
  patient, 
  onAddHandoverNote
}) => {
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNote, setNewNote] = useState<{
    staffName: string;
    shiftType: 'outgoing' | 'incoming';
    summary: string;
    criticalUpdates: string[];
    keyObservations: string;
    actionItems: string[];
    priority: 'high' | 'medium' | 'low';
  }>({
    staffName: '',
    shiftType: 'outgoing',
    summary: '',
    criticalUpdates: [''],
    keyObservations: '',
    actionItems: [''],
    priority: 'medium',
  });

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  /**
   * Get priority colors for visual indication
   */
  const getPriorityColors = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          badge: 'bg-red-100 text-red-800'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'low':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          badge: 'bg-green-100 text-green-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  /**
   * Handle adding a new critical update field
   */
  const addCriticalUpdate = () => {
    setNewNote(prev => ({
      ...prev,
      criticalUpdates: [...prev.criticalUpdates, '']
    }));
  };

  /**
   * Handle updating a critical update field
   */
  const updateCriticalUpdate = (index: number, value: string) => {
    setNewNote(prev => ({
      ...prev,
      criticalUpdates: prev.criticalUpdates.map((update, i) => 
        i === index ? value : update
      )
    }));
  };

  /**
   * Handle removing a critical update field
   */
  const removeCriticalUpdate = (index: number) => {
    setNewNote(prev => ({
      ...prev,
      criticalUpdates: prev.criticalUpdates.filter((_, i) => i !== index)
    }));
  };

  /**
   * Handle adding a new action item field
   */
  const addActionItem = () => {
    setNewNote(prev => ({
      ...prev,
      actionItems: [...prev.actionItems, '']
    }));
  };

  /**
   * Handle updating an action item field
   */
  const updateActionItem = (index: number, value: string) => {
    setNewNote(prev => ({
      ...prev,
      actionItems: prev.actionItems.map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  /**
   * Handle removing an action item field
   */
  const removeActionItem = (index: number) => {
    setNewNote(prev => ({
      ...prev,
      actionItems: prev.actionItems.filter((_, i) => i !== index)
    }));
  };

  /**
   * Handle submitting the new handover note
   */
  const handleSubmitNote = () => {
    if (!newNote.staffName.trim() || !newNote.summary.trim()) {
      return;
    }

    const filteredNote = {
      ...newNote,
      criticalUpdates: newNote.criticalUpdates.filter(update => update.trim() !== ''),
      actionItems: newNote.actionItems.filter(item => item.trim() !== ''),
    };

    if (onAddHandoverNote) {
      onAddHandoverNote(filteredNote);
    }

    // Reset form
    setNewNote({
      staffName: '',
      shiftType: 'outgoing',
      summary: '',
      criticalUpdates: [''],
      keyObservations: '',
      actionItems: [''],
      priority: 'medium',
    });
    setIsCreatingNote(false);
  };

  /**
   * Get recent status changes for display
   */
  const getRecentStatusChanges = (): StatusChange[] => {
    if (!patient.statusChanges) return [];
    
    // Get changes from last 24 hours
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    return patient.statusChanges
      .filter(change => change.timestamp > twentyFourHoursAgo)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5); // Show last 5 changes
  };

  const recentChanges = getRecentStatusChanges();
  const handoverNotes = patient.handoverNotes || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 
            className="text-lg font-semibold"
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
            }}
          >
            Handover Notes
          </h3>
          <p 
            className="text-sm mt-1"
            style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            Shift change communications for {patient.name}
          </p>
        </div>
        
        <button
          onClick={() => setIsCreatingNote(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1"
          style={{
            backgroundColor: theme.colors.primary[600],
            color: 'white',
            fontSize: designTokens.button.fontSize.sm,
            fontWeight: designTokens.button.fontWeight,
            borderRadius: designTokens.button.borderRadius,
            minHeight: designTokens.button.minHeight,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primary[700];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primary[600];
          }}
        >
          <Plus className="h-4 w-4" />
          Add Handover Note
        </button>
      </div>

      {/* Recent Status Changes */}
      {recentChanges.length > 0 && (
        <div 
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.primary[50],
            borderColor: theme.colors.primary[200],
            borderRadius: theme.borderRadius.lg,
          }}
        >
          <h4 
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{
              color: theme.colors.primary[800],
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.semibold,
            }}
          >
            <Clock className="h-4 w-4" />
            Recent Status Changes (Last 24 Hours)
          </h4>
          
          <div className="space-y-2">
            {recentChanges.map((change) => (
              <div 
                key={change.id}
                className={`flex items-center justify-between p-2 rounded border ${
                  change.isHighlighted ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="text-xs font-medium px-2 py-1 rounded"
                    style={{
                      backgroundColor: theme.colors.gray[100],
                      color: theme.colors.gray[700],
                    }}
                  >
                    {change.changeType.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: theme.colors.text.secondary }}>
                      {change.previousValue}
                    </span>
                    <ArrowRight className="h-3 w-3" style={{ color: theme.colors.text.secondary }} />
                    <span style={{ color: theme.colors.text.primary, fontWeight: 500 }}>
                      {change.newValue}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs" style={{ color: theme.colors.text.secondary }}>
                  {formatTimestamp(change.timestamp)}
                  {change.staffName && ` • ${change.staffName}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Handover Notes */}
      {handoverNotes.length > 0 && (
        <div className="space-y-4">
          <h4 
            className="text-md font-semibold"
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
            }}
          >
            Previous Handover Notes
          </h4>
          
          {handoverNotes
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((note) => {
              const priorityColors = getPriorityColors(note.priority);
              
              return (
                <div 
                  key={note.id}
                  className={`p-4 rounded-lg border-2 ${priorityColors.bg} ${priorityColors.border}`}
                >
                  {/* Note Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" style={{ color: priorityColors.text }} />
                        <span 
                          className="font-semibold"
                          style={{ color: priorityColors.text }}
                        >
                          {note.staffName}
                        </span>
                      </div>
                      
                      <span 
                        className={`px-2 py-1 rounded text-xs font-medium ${priorityColors.badge}`}
                      >
                        {note.shiftType.toUpperCase()} SHIFT
                      </span>
                      
                      <span 
                        className={`px-2 py-1 rounded text-xs font-medium ${priorityColors.badge}`}
                      >
                        {note.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    
                    <span 
                      className="text-sm"
                      style={{ color: priorityColors.text }}
                    >
                      {formatTimestamp(note.timestamp)}
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="mb-3">
                    <h5 
                      className="text-sm font-semibold mb-1"
                      style={{ color: priorityColors.text }}
                    >
                      Summary
                    </h5>
                    <p 
                      className="text-sm"
                      style={{ color: priorityColors.text }}
                    >
                      {note.summary}
                    </p>
                  </div>

                  {/* Critical Updates */}
                  {note.criticalUpdates.length > 0 && (
                    <div className="mb-3">
                      <h5 
                        className="text-sm font-semibold mb-2 flex items-center gap-1"
                        style={{ color: priorityColors.text }}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Critical Updates
                      </h5>
                      <ul className="space-y-1">
                        {note.criticalUpdates.map((update, index) => (
                          <li 
                            key={index}
                            className="text-sm flex items-start gap-2"
                            style={{ color: priorityColors.text }}
                          >
                            <span className="text-red-500 font-bold">•</span>
                            {update}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Observations */}
                  {note.keyObservations && (
                    <div className="mb-3">
                      <h5 
                        className="text-sm font-semibold mb-1"
                        style={{ color: priorityColors.text }}
                      >
                        Key Observations
                      </h5>
                      <p 
                        className="text-sm"
                        style={{ color: priorityColors.text }}
                      >
                        {note.keyObservations}
                      </p>
                    </div>
                  )}

                  {/* Action Items */}
                  {note.actionItems.length > 0 && (
                    <div>
                      <h5 
                        className="text-sm font-semibold mb-2 flex items-center gap-1"
                        style={{ color: priorityColors.text }}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Action Items for Next Shift
                      </h5>
                      <ul className="space-y-1">
                        {note.actionItems.map((item, index) => (
                          <li 
                            key={index}
                            className="text-sm flex items-start gap-2"
                            style={{ color: priorityColors.text }}
                          >
                            <span className="text-blue-500 font-bold">→</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Create New Handover Note Form */}
      {isCreatingNote && (
        <div 
          className="p-6 rounded-lg border-2"
          style={{
            backgroundColor: 'white',
            borderColor: theme.colors.primary[200],
            borderRadius: theme.borderRadius.lg,
            boxShadow: designTokens.card.shadow.md,
          }}
        >
          <h4 
            className="text-lg font-semibold mb-4"
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
            }}
          >
            Create Handover Note
          </h4>

          <div className="space-y-4">
            {/* Staff Name and Shift Type */}
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
                  Staff Name *
                </label>
                <input
                  type="text"
                  value={newNote.staffName}
                  onChange={(e) => setNewNote(prev => ({ ...prev, staffName: e.target.value }))}
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
                  Shift Type
                </label>
                <select
                  value={newNote.shiftType}
                  onChange={(e) => setNewNote(prev => ({ ...prev, shiftType: e.target.value as 'outgoing' | 'incoming' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  style={{
                    minHeight: designTokens.input.minHeight,
                    fontSize: designTokens.input.fontSize,
                    borderRadius: designTokens.input.borderRadius,
                  }}
                >
                  <option value="outgoing">Outgoing Shift</option>
                  <option value="incoming">Incoming Shift</option>
                </select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{
                  color: designTokens.form.label.color,
                  fontSize: designTokens.form.label.fontSize,
                  fontWeight: designTokens.form.label.fontWeight,
                }}
              >
                Priority Level
              </label>
              <select
                value={newNote.priority}
                onChange={(e) => setNewNote(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                style={{
                  minHeight: designTokens.input.minHeight,
                  fontSize: designTokens.input.fontSize,
                  borderRadius: designTokens.input.borderRadius,
                }}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {/* Summary */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{
                  color: designTokens.form.label.color,
                  fontSize: designTokens.form.label.fontSize,
                  fontWeight: designTokens.form.label.fontWeight,
                }}
              >
                Patient Summary *
              </label>
              <textarea
                value={newNote.summary}
                onChange={(e) => setNewNote(prev => ({ ...prev, summary: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-vertical"
                style={{
                  fontSize: designTokens.input.fontSize,
                  borderRadius: designTokens.input.borderRadius,
                }}
                rows={3}
                placeholder="Brief summary of patient's current status and condition..."
                required
              />
            </div>

            {/* Critical Updates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label 
                  className="block text-sm font-medium"
                  style={{
                    color: designTokens.form.label.color,
                    fontSize: designTokens.form.label.fontSize,
                    fontWeight: designTokens.form.label.fontWeight,
                  }}
                >
                  Critical Updates
                </label>
                <button
                  type="button"
                  onClick={addCriticalUpdate}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  + Add Update
                </button>
              </div>
              
              <div className="space-y-2">
                {newNote.criticalUpdates.map((update, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={update}
                      onChange={(e) => updateCriticalUpdate(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      style={{
                        minHeight: designTokens.input.minHeight,
                        fontSize: designTokens.input.fontSize,
                        borderRadius: designTokens.input.borderRadius,
                      }}
                      placeholder="Critical update or change..."
                    />
                    {newNote.criticalUpdates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCriticalUpdate(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Observations */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{
                  color: designTokens.form.label.color,
                  fontSize: designTokens.form.label.fontSize,
                  fontWeight: designTokens.form.label.fontWeight,
                }}
              >
                Key Observations
              </label>
              <textarea
                value={newNote.keyObservations}
                onChange={(e) => setNewNote(prev => ({ ...prev, keyObservations: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-vertical"
                style={{
                  fontSize: designTokens.input.fontSize,
                  borderRadius: designTokens.input.borderRadius,
                }}
                rows={2}
                placeholder="Important observations for the next shift..."
              />
            </div>

            {/* Action Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label 
                  className="block text-sm font-medium"
                  style={{
                    color: designTokens.form.label.color,
                    fontSize: designTokens.form.label.fontSize,
                    fontWeight: designTokens.form.label.fontWeight,
                  }}
                >
                  Action Items for Next Shift
                </label>
                <button
                  type="button"
                  onClick={addActionItem}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  + Add Action
                </button>
              </div>
              
              <div className="space-y-2">
                {newNote.actionItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateActionItem(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      style={{
                        minHeight: designTokens.input.minHeight,
                        fontSize: designTokens.input.fontSize,
                        borderRadius: designTokens.input.borderRadius,
                      }}
                      placeholder="Action item for incoming staff..."
                    />
                    {newNote.actionItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeActionItem(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleSubmitNote}
                disabled={!newNote.staffName.trim() || !newNote.summary.trim()}
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
                Create Handover Note
              </button>
              
              <button
                type="button"
                onClick={() => setIsCreatingNote(false)}
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
        </div>
      )}

      {/* Empty State */}
      {handoverNotes.length === 0 && !isCreatingNote && (
        <div 
          className="text-center py-8 px-4 rounded-lg border-2 border-dashed"
          style={{
            borderColor: theme.colors.gray[300],
            backgroundColor: theme.colors.gray[50],
          }}
        >
          <User 
            className="h-12 w-12 mx-auto mb-4"
            style={{ color: theme.colors.gray[400] }}
          />
          <h4 
            className="text-lg font-medium mb-2"
            style={{ color: theme.colors.text.primary }}
          >
            No Handover Notes Yet
          </h4>
          <p 
            className="text-sm mb-4"
            style={{ color: theme.colors.text.secondary }}
          >
            Create the first handover note to start tracking shift communications for this patient.
          </p>
          <button
            onClick={() => setIsCreatingNote(true)}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
            style={{
              backgroundColor: theme.colors.primary[600],
              color: 'white',
              fontSize: designTokens.button.fontSize.sm,
              fontWeight: designTokens.button.fontWeight,
              borderRadius: designTokens.button.borderRadius,
            }}
          >
            Create First Handover Note
          </button>
        </div>
      )}
    </div>
  );
};

export default HandoverNotes;