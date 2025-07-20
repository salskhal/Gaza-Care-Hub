import React from 'react';
import { Edit3, Clock, User } from 'lucide-react';
import type { TriageCardProps } from '../types';
import { designTokens } from '../config';

/**
 * TriageCard component displays individual patient information with color-coded triage levels
 * Implements accessibility features and proper contrast for emergency use
 */
export const TriageCard: React.FC<TriageCardProps> = ({ patient, onClick, onEdit }) => {
  const triageColors = designTokens.triage[patient.triageLevel.toLowerCase() as keyof typeof designTokens.triage];
  
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
   * Get priority number for screen readers
   */
  const getPriorityLevel = (triageLevel: string): number => {
    switch (triageLevel) {
      case 'Critical': return 1;
      case 'Urgent': return 2;
      case 'Stable': return 3;
      default: return 3;
    }
  };

  /**
   * Get enhanced status colors for patient status badge with better visual indicators
   */
  const getStatusColors = (status: string): { bg: string; text: string; border: string; icon?: string } => {
    switch (status) {
      case 'Waiting':
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-300',
          icon: '⏳'
        };
      case 'In Treatment':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-300',
          icon: '🏥'
        };
      case 'Treated':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-800',
          border: 'border-emerald-300',
          icon: '✅'
        };
      case 'Discharged':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          border: 'border-purple-300',
          icon: '🏠'
        };
      case 'Transferred':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          border: 'border-orange-300',
          icon: '🚑'
        };
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-300',
          icon: '⏳'
        };
    }
  };

  /**
   * Handle card click/interaction
   */
  const handleCardClick = () => {
    if (onClick) {
      onClick(patient);
    }
  };

  /**
   * Handle keyboard interaction for accessibility
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  const statusColors = getStatusColors(patient.status || 'Waiting');

  return (
    <div
      className={`
        relative overflow-hidden
        border-2 rounded-xl p-4 sm:p-5 
        gaza-card-premium gaza-smooth-entrance
        ${onClick ? 'cursor-pointer min-h-[44px] gaza-hover-lift' : ''}
        group
      `}
      style={{
        backgroundColor: triageColors.backgroundColor,
        borderColor: triageColors.borderColor,
        color: triageColors.color,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',
      }}
      onClick={onClick ? handleCardClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : 'article'}
      aria-label={`Patient ${patient.name}, ${patient.triageLevel} priority level ${getPriorityLevel(patient.triageLevel)}, age ${patient.age} years`}
      aria-describedby={`patient-${patient.id}-details`}
    >
      {/* Enhanced visual depth with subtle gradient overlay */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${triageColors.borderColor} 0%, transparent 50%)`
        }}
      />
      {/* Enhanced header with improved typography hierarchy */}
      <div className="relative flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0 pr-3 sm:pr-4">
          <h3 
            className="text-lg sm:text-xl font-bold truncate mb-1 leading-tight" 
            title={patient.name}
            style={{ color: triageColors.color }}
          >
            {patient.name}
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm">
            <p className="font-medium opacity-75">
              Age: <span className="font-semibold">{patient.age}</span> years
            </p>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-current opacity-40"></div>
            <p className="font-medium opacity-75">
              ID: <span className="font-mono text-xs">{patient.id.slice(-8)}</span>
            </p>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex flex-col items-end gap-2 sm:gap-3">
          {/* Enhanced triage badge with better visual hierarchy */}
          <div className="flex flex-col items-end gap-1.5 sm:gap-2">
            <span
              className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm border-2 border-white/20"
              style={{
                backgroundColor: triageColors.badgeBackground,
                color: triageColors.badgeColor,
              }}
              aria-label={`Triage level: ${patient.triageLevel}, Priority ${getPriorityLevel(patient.triageLevel)}`}
            >
              {patient.triageLevel}
            </span>
            
            {/* Enhanced patient status badge with icon */}
            <span
              className={`
                inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold
                ${statusColors.bg} ${statusColors.text} border ${statusColors.border}
                shadow-sm
              `}
            >
              <span className="text-xs" role="img" aria-hidden="true">
                {statusColors.icon}
              </span>
              <span className="hidden sm:inline">{patient.status || 'Waiting'}</span>
              <span className="sm:hidden">{(patient.status || 'Waiting').split(' ')[0]}</span>
            </span>
          </div>
          
          {/* Enhanced edit button */}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(patient);
              }}
              className="p-2 sm:p-2.5 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              style={{
                color: triageColors.color,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${triageColors.borderColor}`;
              }}
              aria-label={`Edit patient ${patient.name}`}
              title="Edit patient information"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Enhanced symptoms section with better visual hierarchy */}
      <div className="mb-3 sm:mb-4">
        <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center opacity-90">
          <svg 
            className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          Symptoms
        </h4>
        
        {patient.symptoms.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {patient.symptoms.slice(0, 4).map((symptom, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium border shadow-sm backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderColor: triageColors.borderColor,
                  color: triageColors.color,
                }}
                title={symptom}
              >
                {symptom}
              </span>
            ))}
            {patient.symptoms.length > 4 && (
              <span
                className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium border shadow-sm backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  borderColor: triageColors.borderColor,
                  color: triageColors.color,
                }}
                title={`${patient.symptoms.length - 4} more symptoms`}
              >
                +{patient.symptoms.length - 4} more
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs sm:text-sm opacity-60 italic bg-white/30 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-white/20">
            No symptoms recorded
          </p>
        )}
      </div>

      {/* Enhanced condition section */}
      {patient.condition && (
        <div className="mb-3 sm:mb-4">
          <h4 className="text-xs sm:text-sm font-semibold mb-2 flex items-center opacity-90">
            <svg 
              className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            Condition Notes
          </h4>
          <div 
            className="text-xs sm:text-sm p-2 sm:p-3 rounded-lg border shadow-sm backdrop-blur-sm line-clamp-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderColor: triageColors.borderColor,
              color: triageColors.color,
            }}
          >
            {patient.condition}
          </div>
        </div>
      )}

      {/* Enhanced treatment notes section */}
      {patient.notes && (
        <div className="mb-3 sm:mb-4">
          <h4 className="text-xs sm:text-sm font-semibold mb-2 flex items-center opacity-90">
            <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" aria-hidden="true" />
            Treatment Notes
          </h4>
          <div 
            className="text-xs sm:text-sm p-2 sm:p-3 rounded-lg border shadow-sm backdrop-blur-sm line-clamp-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderColor: triageColors.borderColor,
              color: triageColors.color,
            }}
          >
            {patient.notes}
          </div>
        </div>
      )}

      {/* Enhanced footer with better visual hierarchy */}
      <div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs pt-2 sm:pt-3 mt-1 border-t gap-1.5 sm:gap-0"
        style={{
          borderColor: `${triageColors.borderColor}40`,
          opacity: 0.8,
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center font-medium">
            <Clock className="w-3 h-3 mr-1.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">Added: {formatTimestamp(patient.timestamp)}</span>
          </div>
          {patient.lastUpdated && patient.lastUpdated !== patient.timestamp && (
            <div className="flex items-center font-medium">
              <Clock className="w-3 h-3 mr-1.5 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">Updated: {formatTimestamp(patient.lastUpdated)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Screen reader only content for additional context */}
      <div id={`patient-${patient.id}-details`} className="sr-only">
        Patient {patient.name} has {patient.triageLevel.toLowerCase()} priority triage level.
        {patient.symptoms.length > 0 && ` Symptoms include: ${patient.symptoms.join(', ')}.`}
        {patient.condition && ` Additional condition notes: ${patient.condition}.`}
        Added to queue on {formatTimestamp(patient.timestamp)}.
      </div>
    </div>
  );
};

export default TriageCard;