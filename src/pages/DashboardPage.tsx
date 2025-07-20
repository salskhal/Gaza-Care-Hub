import React from 'react';
import { TriageDashboard, ExportButton } from '../components';

/**
 * Dashboard Page Component
 * 
 * Main dashboard view showing the patient triage queue with enhanced Gaza Care Hub branding.
 * Displays the full TriageDashboard component with integrated export functionality.
 */
export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Dashboard Header - Minimal since TriageDashboard has its own enhanced header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="hidden sm:block">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Patient Queue Overview</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Real-time triage management system</p>
        </div>
        <div className="w-full sm:w-auto">
          <ExportButton />
        </div>
      </div>
      
      {/* Main Dashboard Component */}
      <TriageDashboard />
    </div>
  );
};

export default DashboardPage;