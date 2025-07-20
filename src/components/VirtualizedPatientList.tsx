import React, { useState, useRef, useMemo } from 'react';
import type { Patient } from '../types';
import { TriageCard } from './TriageCard';
import { usePerformanceMonitoring } from '../lib/performance';
import { branding, theme } from '../config';

interface VirtualizedPatientListProps {
  patients: Patient[];
  onPatientClick?: (patient: Patient) => void;
  onPatientEdit?: (patient: Patient) => void;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  isLoading?: boolean;
  emptyStateMessage?: string;
}

/**
 * VirtualizedPatientList component for efficient rendering of large patient lists
 * Only renders visible items to improve performance on low-spec devices
 */
export const VirtualizedPatientList: React.FC<VirtualizedPatientListProps> = ({
  patients,
  onPatientClick,
  onPatientEdit,
  itemHeight = 200, // Estimated height of each TriageCard
  containerHeight = 600, // Max height of the scrollable container
  overscan = 3, // Number of items to render outside visible area
  isLoading = false,
  emptyStateMessage
}) => {
  const { measureRender, isLowSpecDevice } = usePerformanceMonitoring();
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Adjust overscan for low-spec devices
  const adjustedOverscan = isLowSpecDevice() ? Math.max(1, overscan - 1) : overscan;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      patients.length - 1
    );

    const startIndex = Math.max(0, visibleStart - adjustedOverscan);
    const endIndex = Math.min(patients.length - 1, visibleEnd + adjustedOverscan);

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, patients.length, adjustedOverscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return patients.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [patients, visibleRange]);

  // Loading state component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="animate-pulse mb-4">
        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Loading Patient Queue
      </h3>
      <p className="text-gray-600 max-w-md">
        Retrieving patient information for {branding.name}...
      </p>
      <div className="mt-4 flex space-x-1">
        <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );

  // Empty state component with Gaza-themed messaging
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        No Patients in Queue
      </h3>
      <p className="text-gray-600 max-w-md mb-4">
        {emptyStateMessage || `The patient queue is currently empty. ${branding.name} is ready to receive and triage new patients when they arrive.`}
      </p>
      <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3 max-w-sm">
        <p className="font-medium mb-1">Ready to help when needed</p>
        <p>Healthcare workers can add new patients using the "Add Patient" button above.</p>
      </div>
    </div>
  );

  // Handle scroll with performance monitoring
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    measureRender('patient-list-scroll', () => {
      setScrollTop(e.currentTarget.scrollTop);
    });
  };

  // Calculate scroll progress for indicator
  const scrollProgress = useMemo(() => {
    if (patients.length <= 10) return 0;
    const totalHeight = patients.length * itemHeight;
    const maxScroll = totalHeight - containerHeight;
    return maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
  }, [scrollTop, patients.length, itemHeight, containerHeight]);

  // Handle loading state
  if (isLoading) {
    return (
      <div 
        className="bg-white rounded-xl border border-gray-200 shadow-sm"
        style={{ minHeight: containerHeight }}
      >
        <LoadingState />
      </div>
    );
  }

  // Handle empty state
  if (patients.length === 0) {
    return (
      <div 
        className="bg-white rounded-xl border border-gray-200 shadow-sm"
        style={{ minHeight: containerHeight }}
      >
        <EmptyState />
      </div>
    );
  }

  // If patient list is small, render normally without virtualization
  if (patients.length <= 10) {
    return (
      <div className="space-y-4" role="list" aria-label="Patient queue ordered by triage priority">
        {patients.map((patient, index) => (
          <div 
            key={patient.id} 
            role="listitem"
            className={`transform transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus-within:scale-[1.02] focus-within:shadow-md animate-fade-in-up ${
              index < 5 ? `animate-stagger-${index + 1}` : ''
            }`}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both',
            }}
          >
            <TriageCard
              patient={patient}
              onClick={onPatientClick}
              onEdit={onPatientEdit}
            />
          </div>
        ))}
      </div>
    );
  }

  // Calculate total height and offset
  const totalHeight = patients.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return (
    <div className="relative">
      {/* Scroll progress indicator */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-3 sm:px-4 py-2 mb-3 sm:mb-4 rounded-t-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-gray-600 mb-2">
          <span className="font-medium">
            Patient Queue ({patients.length} total)
          </span>
          <span className="text-xs sm:text-sm">
            Showing {visibleRange.startIndex + 1}-{Math.min(visibleRange.endIndex + 1, patients.length)} of {patients.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-teal-500 to-teal-600 h-1 sm:h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.max(5, scrollProgress)}%` }}
          />
        </div>
      </div>

      {/* Main scrollable container */}
      <div
        ref={containerRef}
        className="virtualized-patient-list relative overflow-auto bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        style={{ 
          height: Math.min(containerHeight, totalHeight),
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.colors.primary[300]} ${theme.colors.gray[100]}`,
        }}
        onScroll={handleScroll}
        role="list"
        aria-label="Patient queue ordered by triage priority"
        aria-rowcount={patients.length}
      >
        {/* Custom scrollbar styling applied via CSS */}
        <style>{`
          .virtualized-patient-list::-webkit-scrollbar {
            width: 8px;
          }
          .virtualized-patient-list::-webkit-scrollbar-track {
            background: ${theme.colors.gray[100]};
            border-radius: 4px;
          }
          .virtualized-patient-list::-webkit-scrollbar-thumb {
            background: ${theme.colors.primary[300]};
            border-radius: 4px;
            transition: background-color 0.2s ease;
          }
          .virtualized-patient-list::-webkit-scrollbar-thumb:hover {
            background: ${theme.colors.primary[400]};
          }
        `}</style>

        {/* Total height spacer */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Visible items container */}
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {visibleItems.map((patient, index) => {
              const actualIndex = visibleRange.startIndex + index;
              return (
                <div
                  key={patient.id}
                  role="listitem"
                  aria-rowindex={actualIndex + 1}
                  style={{
                    height: itemHeight,
                    marginBottom: theme.spacing[3],
                  }}
                  className="px-2 sm:px-4 transform transition-all duration-200 hover:scale-[1.01] focus-within:scale-[1.01] group"
                >
                  <div className="relative">
                    {/* Subtle hover background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-50/0 via-teal-50/30 to-teal-50/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
                    
                    <TriageCard
                      patient={patient}
                      onClick={onPatientClick}
                      onEdit={onPatientEdit}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll indicators */}
        {scrollTop > 50 && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200 opacity-75 hover:opacity-100 transition-opacity duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </div>
        )}

        {scrollProgress < 95 && patients.length > 10 && (
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200 opacity-75 hover:opacity-100 transition-opacity duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* Accessibility announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Showing patients {visibleRange.startIndex + 1} to {Math.min(visibleRange.endIndex + 1, patients.length)} of {patients.length} in the queue
      </div>
    </div>
  );
};

export default VirtualizedPatientList;