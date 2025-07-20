import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart, Users } from 'lucide-react';
import { PatientForm } from '../components';
import { branding } from '../config';

/**
 * Add Patient Page Component
 * 
 * Dedicated page for adding new patients to the Gaza Care Hub triage system.
 * Features enhanced branding and improved form layout with Gaza-themed messaging.
 */
export const AddPatientPage: React.FC = () => {
  const navigate = useNavigate();

  const handlePatientAdded = () => {
    navigate('/');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Enhanced Page Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3">
                  <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    Register New Patient
                  </h1>
                  <p className="text-teal-100 text-sm sm:text-lg font-medium mt-1">
                    {branding.name} - Patient Intake
                  </p>
                </div>
              </div>
              <p className="text-teal-100 text-sm sm:text-base lg:text-lg max-w-2xl">
                Add a new patient to the emergency triage system. All information will be securely stored and immediately available to medical staff.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white mx-auto mb-2" />
                <div className="text-white font-semibold text-sm sm:text-base">Emergency Care</div>
                <div className="text-teal-100 text-xs sm:text-sm">Gaza Healthcare Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gray-50/50 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700 font-medium">Secure Patient Registration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 font-medium">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Form Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Patient Information</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Please provide accurate patient information for proper triage assessment. 
            All fields marked with an asterisk (*) are required for emergency processing.
          </p>
        </div>
        
        <div className="p-4 sm:p-6 lg:p-8">
          <PatientForm onPatientAdded={handlePatientAdded} />
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl sm:rounded-2xl border border-teal-200 p-4 sm:p-6 lg:p-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="bg-teal-100 rounded-full p-2 sm:p-3 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-teal-900 mb-2">
            {branding.mission}
          </h3>
          <p className="text-teal-800 text-xs sm:text-sm leading-relaxed">
            This system helps medical professionals prioritize patient care based on the severity of conditions. 
            Accurate information ensures patients receive appropriate and timely medical attention.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddPatientPage;