import React, { useState, useMemo } from 'react';
import { Clock, User, AlertTriangle, CheckCircle, ArrowRight, Filter, Eye, EyeOff } from 'lucide-react';
import type { HandoverDisplayProps, HandoverNote } from '../types';
import { theme, designTokens } from '../config';

/**
 * HandoverDisplay component for incoming staff to view handover information
 * Displays handover notes and status changes with filtering and highlighting
 */
export const HandoverDisplay: React.FC<HandoverDisplayProps> = ({ 
  handoverNotes, 
  statusChanges, 
  patientName 
}) => {
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [shiftTypeFilter, setShiftTypeFilter] = useState<'all' | 'outgoing' | 'incoming'>('all');
  const [showStatusChanges, setShowStatusChanges] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
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
          badge: 'bg-red-100 text-red-800',
          accent: 'bg-red-500'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800',
          accent: 'bg-yellow-500'
        };
      case 'low':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          badge: 'bg-green-100 text-green-800',
          accent: 'bg-green-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          badge: 'bg-gray-100 text-gray-800',
          accent: 'bg-gray-500'
        };
    }
  };

  /**
   * Filter handover notes based on selected filters
   */
  const filteredHandoverNotes = useMemo(() => {
    let filtered = [...handoverNotes];

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(note => note.priority === priorityFilter);
    }

    if (shiftTypeFilter !== 'all') {
      filtered = filtered.filter(note => note.shiftType === shiftTypeFilter);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [handoverNotes, priorityFilter, shiftTypeFilter]);

  /**
   * Get recent status changes (last 24 hours)
   */
  const recentStatusChanges = useMemo(() => {
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    return statusChanges
      .filter(change => change.timestamp > twentyFourHoursAgo)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10); // Show last 10 changes
  }, [statusChanges]);

  /**
   * Get critical updates from all handover notes
   */
  const criticalUpdates = useMemo(() => {
    const updates: Array<{ note: HandoverNote; update: string }> = [];
    
    filteredHandoverNotes.forEach(note => {
      note.criticalUpdates.forEach(update => {
        updates.push({ note, update });
      });
    });
    
    return updates.slice(0, 5); // Show top 5 critical updates
  }, [filteredHandoverNotes]);

  /**
   * Toggle expanded state for a note
   */
  const toggleNoteExpansion = (noteId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  /**
   * Get summary statistics
   */
  const summaryStats = useMemo(() => {
    const totalNotes = handoverNotes.length;
    const highPriorityNotes = handoverNotes.filter(note => note.priority === 'high').length;
    const recentNotes = handoverNotes.filter(note => 
      Date.now() - note.timestamp < (8 * 60 * 60 * 1000) // Last 8 hours
    ).length;
    const totalCriticalUpdates = handoverNotes.reduce((sum, note) => 
      sum + note.criticalUpdates.length, 0
    );

    return {
      totalNotes,
      highPriorityNotes,
      recentNotes,
      totalCriticalUpdates,
    };
  }, [handoverNotes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 
            className="text-xl font-bold"
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
            }}
          >
            Handover Information
          </h3>
          <p 
            className="text-sm mt-1"
            style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            Shift communications for {patientName}
          </p>
        </div>
        
        <div className="text-right">
          <div 
            className="text-sm font-medium"
            style={{ color: theme.colors.text.primary }}
          >
            Last Updated
          </div>
          <div 
            className="text-sm"
            style={{ color: theme.colors.text.secondary }}
          >
            {handoverNotes.length > 0 ? formatTimestamp(Math.max(...handoverNotes.map(n => n.timestamp))) : 'No updates'}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div 
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: theme.colors.primary[50],
          borderColor: theme.colors.primary[200],
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: theme.colors.text.primary }}
            >
              {summaryStats.totalNotes}
            </div>
            <div 
              className="text-sm"
              style={{ color: theme.colors.text.secondary }}
            >
              Total Notes
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: theme.colors.critical[600] }}
            >
              {summaryStats.highPriorityNotes}
            </div>
            <div 
              className="text-sm"
              style={{ color: theme.colors.text.secondary }}
            >
              High Priority
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: theme.colors.primary[600] }}
            >
              {summaryStats.recentNotes}
            </div>
            <div 
              className="text-sm"
              style={{ color: theme.colors.text.secondary }}
            >
              Recent (8h)
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: theme.colors.urgent[600] }}
            >
              {summaryStats.totalCriticalUpdates}
            </div>
            <div 
              className="text-sm"
              style={{ color: theme.colors.text.secondary }}
            >
              Critical Updates
            </div>
          </div>
        </div>
      </div>

      {/* Critical Updates Highlight */}
      {criticalUpdates.length > 0 && (
        <div 
          className="p-4 rounded-lg border-2"
          style={{
            backgroundColor: theme.colors.critical[50],
            borderColor: theme.colors.critical[200],
            borderRadius: theme.borderRadius.lg,
          }}
        >
          <h4 
            className="text-lg font-semibold mb-3 flex items-center gap-2"
            style={{
              color: theme.colors.critical[800],
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
            }}
          >
            <AlertTriangle className="h-5 w-5" />
            Critical Updates Requiring Attention
          </h4>
          
          <div className="space-y-2">
            {criticalUpdates.map(({ note, update }, index) => (
              <div 
                key={`${note.id}-${index}`}
                className="flex items-start gap-3 p-3 rounded border"
                style={{
                  backgroundColor: 'white',
                  borderColor: theme.colors.critical[200],
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: theme.colors.critical[500] }}
                />
                <div className="flex-1">
                  <div 
                    className="font-medium"
                    style={{ color: theme.colors.critical[800] }}
                  >
                    {update}
                  </div>
                  <div 
                    className="text-sm mt-1"
                    style={{ color: theme.colors.critical[600] }}
                  >
                    From {note.staffName} • {formatTimestamp(note.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div 
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: 'white',
          borderColor: theme.colors.gray[200],
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 
            className="text-md font-semibold flex items-center gap-2"
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
            }}
          >
            <Filter className="h-4 w-4" />
            Filter Handover Notes
          </h4>
          
          <button
            onClick={() => setShowStatusChanges(!showStatusChanges)}
            className="flex items-center gap-2 px-3 py-1 text-sm rounded border transition-colors"
            style={{
              backgroundColor: showStatusChanges ? theme.colors.primary[600] : 'white',
              color: showStatusChanges ? 'white' : theme.colors.primary[600],
              borderColor: theme.colors.primary[600],
            }}
          >
            {showStatusChanges ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            Status Changes
          </button>
        </div>
        
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
              Priority Level
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              style={{
                minHeight: designTokens.input.minHeight,
                fontSize: designTokens.input.fontSize,
                borderRadius: designTokens.input.borderRadius,
              }}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
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
              value={shiftTypeFilter}
              onChange={(e) => setShiftTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              style={{
                minHeight: designTokens.input.minHeight,
                fontSize: designTokens.input.fontSize,
                borderRadius: designTokens.input.borderRadius,
              }}
            >
              <option value="all">All Shifts</option>
              <option value="outgoing">Outgoing Shift</option>
              <option value="incoming">Incoming Shift</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recent Status Changes */}
      {showStatusChanges && recentStatusChanges.length > 0 && (
        <div 
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.primary[50],
            borderColor: theme.colors.primary[200],
            borderRadius: theme.borderRadius.lg,
          }}
        >
          <h4 
            className="text-md font-semibold mb-3 flex items-center gap-2"
            style={{
              color: theme.colors.primary[800],
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
            }}
          >
            <Clock className="h-4 w-4" />
            Recent Status Changes (Last 24 Hours)
          </h4>
          
          <div className="space-y-2">
            {recentStatusChanges.map((change) => (
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

      {/* Handover Notes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 
            className="text-lg font-semibold"
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
            }}
          >
            Handover Notes ({filteredHandoverNotes.length})
          </h4>
          
          {filteredHandoverNotes.length !== handoverNotes.length && (
            <span 
              className="text-sm px-2 py-1 rounded"
              style={{
                backgroundColor: theme.colors.primary[100],
                color: theme.colors.primary[700],
              }}
            >
              Filtered from {handoverNotes.length} total
            </span>
          )}
        </div>
        
        {filteredHandoverNotes.length === 0 ? (
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
            <h5 
              className="text-lg font-medium mb-2"
              style={{ color: theme.colors.text.primary }}
            >
              No Handover Notes Found
            </h5>
            <p 
              className="text-sm"
              style={{ color: theme.colors.text.secondary }}
            >
              {handoverNotes.length === 0 
                ? 'No handover notes have been created for this patient yet.'
                : 'No handover notes match the current filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHandoverNotes.map((note) => {
              const priorityColors = getPriorityColors(note.priority);
              const isExpanded = expandedNotes.has(note.id);
              
              return (
                <div 
                  key={note.id}
                  className={`rounded-lg border-2 ${priorityColors.bg} ${priorityColors.border}`}
                >
                  {/* Note Header */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleNoteExpansion(note.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className={`w-1 h-8 rounded-full ${priorityColors.accent}`}
                        />
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
                          {note.shiftType.toUpperCase()}
                        </span>
                        
                        <span 
                          className={`px-2 py-1 rounded text-xs font-medium ${priorityColors.badge}`}
                        >
                          {note.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span 
                          className="text-sm"
                          style={{ color: priorityColors.text }}
                        >
                          {formatTimestamp(note.timestamp)}
                        </span>
                        
                        <div 
                          className="transform transition-transform"
                          style={{ 
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            color: priorityColors.text 
                          }}
                        >
                          ▶
                        </div>
                      </div>
                    </div>

                    {/* Summary (always visible) */}
                    <div className="mt-3 ml-7">
                      <p 
                        className="text-sm font-medium"
                        style={{ color: priorityColors.text }}
                      >
                        {note.summary}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 ml-7 space-y-4">
                      {/* Critical Updates */}
                      {note.criticalUpdates.length > 0 && (
                        <div>
                          <h6 
                            className="text-sm font-semibold mb-2 flex items-center gap-1"
                            style={{ color: priorityColors.text }}
                          >
                            <AlertTriangle className="h-4 w-4" />
                            Critical Updates
                          </h6>
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
                        <div>
                          <h6 
                            className="text-sm font-semibold mb-1"
                            style={{ color: priorityColors.text }}
                          >
                            Key Observations
                          </h6>
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
                          <h6 
                            className="text-sm font-semibold mb-2 flex items-center gap-1"
                            style={{ color: priorityColors.text }}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Action Items
                          </h6>
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
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HandoverDisplay;