import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { Patient, TriageLevel, PatientStatus, HandoverNote } from '../types';
import { triageService } from '../services/triage';
import { theme, designTokens } from '../config';
import { HandoverNotes } from './HandoverNotes';
import { storageService } from '../services/storage';

interface PatientEditModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPatient: Partial<Patient>) => Promise<void>;
}

const SYMPTOM_OPTIONS = [
  'fever',
  'cough',
  'headache',
  'nausea',
  'vomiting',
  'diarrhea',
  'abdominal pain',
  'chest pain',
  'shortness of breath',
  'dizziness',
  'fainting',
  'bleeding heavily',
  'unconscious',
  'severe pain',
  'mild cough',
  'fatigue'
];

const TRIAGE_LEVELS: TriageLevel[] = ['Critical', 'Urgent', 'Stable'];
const PATIENT_STATUSES: PatientStatus[] = ['Waiting', 'In Treatment', 'Treated', 'Discharged', 'Transferred'];

export function PatientEditModal({ patient, isOpen, onClose, onSave }: PatientEditModalProps) {
  const [activeTab, setActiveTab] = useState<'patient-info' | 'handover-notes'>('patient-info');
  const [formData, setFormData] = useState({
    name: patient.name,
    age: patient.age,
    symptoms: patient.symptoms,
    condition: patient.condition,
    triageLevel: patient.triageLevel,
    status: patient.status || 'Waiting',
    notes: patient.notes || '',
    // Gaza hospital form fields
    patientId: patient.patientId || '',
    mainComplaint: patient.mainComplaint || '',
    medicalHistory: patient.medicalHistory || '',
    examinationFindings: patient.examinationFindings || '',
    provisionalDiagnosis: patient.provisionalDiagnosis || '',
    treatmentPlan: patient.treatmentPlan || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Patient>(patient);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: patient.name,
        age: patient.age,
        symptoms: patient.symptoms,
        condition: patient.condition,
        triageLevel: patient.triageLevel,
        status: patient.status || 'Waiting',
        notes: patient.notes || '',
        // Gaza hospital form fields
        patientId: patient.patientId || '',
        mainComplaint: patient.mainComplaint || '',
        medicalHistory: patient.medicalHistory || '',
        examinationFindings: patient.examinationFindings || '',
        provisionalDiagnosis: patient.provisionalDiagnosis || '',
        treatmentPlan: patient.treatmentPlan || '',
      });
      setCurrentPatient(patient);
      setActiveTab('patient-info');
      setError(null);
    }
  }, [patient, isOpen]);

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      symptoms: checked
        ? [...prev.symptoms, symptom]
        : prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const handleAutoTriageUpdate = () => {
    const newTriageLevel = triageService.assignTriageLevel(formData.symptoms, formData.condition);
    setFormData(prev => ({
      ...prev,
      triageLevel: newTriageLevel
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSave({
        name: formData.name,
        age: formData.age,
        symptoms: formData.symptoms,
        condition: formData.condition,
        triageLevel: formData.triageLevel,
        status: formData.status,
        notes: formData.notes,
        // Gaza hospital form fields
        patientId: formData.patientId || undefined,
        mainComplaint: formData.mainComplaint || undefined,
        medicalHistory: formData.medicalHistory || undefined,
        examinationFindings: formData.examinationFindings || undefined,
        provisionalDiagnosis: formData.provisionalDiagnosis || undefined,
        treatmentPlan: formData.treatmentPlan || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patient');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle adding a handover note
   */
  const handleAddHandoverNote = async (note: Omit<HandoverNote, 'id' | 'timestamp' | 'patientId'>) => {
    try {
      await storageService.addHandoverNote(currentPatient.id, note);
      
      // Refresh patient data to show the new handover note
      const updatedPatients = await storageService.getPatients();
      const updatedPatient = updatedPatients.find(p => p.id === currentPatient.id);
      
      if (updatedPatient) {
        setCurrentPatient(updatedPatient);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add handover note');
    }
  };

  /**
   * Handle updating patient from handover notes component
   */
  const handleUpdatePatientFromHandover = async (updates: Partial<Patient>) => {
    try {
      await onSave(updates);
      
      // Refresh patient data
      const updatedPatients = await storageService.getPatients();
      const updatedPatient = updatedPatients.find(p => p.id === currentPatient.id);
      
      if (updatedPatient) {
        setCurrentPatient(updatedPatient);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patient');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: theme.zIndex.modal,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          maxWidth: '48rem', // 768px - larger for better mobile experience
          boxShadow: designTokens.card.shadow.lg,
          borderRadius: designTokens.card.borderRadius.lg,
        }}
      >
        {/* Header Section */}
        <div 
          className="flex items-center justify-between px-8 py-6 border-b"
          style={{
            backgroundColor: theme.colors.primary[50],
            borderColor: theme.colors.border,
          }}
        >
          <div>
            <h2 
              className="text-2xl font-bold mb-1"
              style={{
                color: theme.colors.primary[800],
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
              }}
            >
              Edit Patient Information
            </h2>
            <p 
              className="text-sm"
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              Update patient details and treatment status
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            style={{
              minHeight: designTokens.button.minHeight,
              minWidth: designTokens.button.minHeight,
            }}
            aria-label="Close modal"
          >
            <X 
              className="h-6 w-6"
              style={{ color: theme.colors.text.secondary }}
            />
          </button>
        </div>

        {/* Tab Navigation */}
        <div 
          className="border-b"
          style={{
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex px-8">
            <button
              type="button"
              onClick={() => setActiveTab('patient-info')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'patient-info'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Patient Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('handover-notes')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'handover-notes'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Handover Notes
              {currentPatient.handoverNotes && currentPatient.handoverNotes.length > 0 && (
                <span 
                  className="ml-2 px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: theme.colors.primary[100],
                    color: theme.colors.primary[700],
                  }}
                >
                  {currentPatient.handoverNotes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'patient-info' ? (
          <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div 
              className="mb-6 p-4 rounded-lg border flex items-center gap-3"
              style={{
                backgroundColor: theme.colors.critical[50],
                borderColor: theme.colors.critical[200],
                borderRadius: theme.borderRadius.lg,
              }}
            >
              <AlertCircle 
                className="h-5 w-5 flex-shrink-0"
                style={{ color: theme.colors.critical[600] }}
              />
              <span 
                className="text-sm font-medium"
                style={{ color: theme.colors.critical[700] }}
              >
                {error}
              </span>
            </div>
          )}

          {/* Basic Information Section */}
          <div className="mb-8">
            <h3 
              className="text-lg font-semibold mb-4 pb-2 border-b"
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                borderColor: theme.colors.border,
              }}
            >
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label 
                  htmlFor="edit-patient-id" 
                  className="block font-medium mb-2"
                  style={{
                    fontSize: designTokens.form.label.fontSize,
                    fontWeight: designTokens.form.label.fontWeight,
                    color: designTokens.form.label.color,
                  }}
                >
                  Patient ID
                </label>
                <input
                  type="text"
                  id="edit-patient-id"
                  value={formData.patientId}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200"
                  style={{
                    minHeight: designTokens.input.minHeight,
                    fontSize: designTokens.input.fontSize,
                    borderRadius: designTokens.input.borderRadius,
                    transition: designTokens.input.transition,
                  }}
                  placeholder="Patient ID (optional)"
                />
              </div>

              <div>
                <label 
                  htmlFor="edit-name" 
                  className="block font-medium mb-2"
                  style={{
                    fontSize: designTokens.form.label.fontSize,
                    fontWeight: designTokens.form.label.fontWeight,
                    color: designTokens.form.label.color,
                  }}
                >
                  Patient Name *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200"
                  style={{
                    minHeight: designTokens.input.minHeight,
                    fontSize: designTokens.input.fontSize,
                    borderRadius: designTokens.input.borderRadius,
                    transition: designTokens.input.transition,
                  }}
                  required
                />
              </div>

              <div>
                <label 
                  htmlFor="edit-age" 
                  className="block font-medium mb-2"
                  style={{
                    fontSize: designTokens.form.label.fontSize,
                    fontWeight: designTokens.form.label.fontWeight,
                    color: designTokens.form.label.color,
                  }}
                >
                  Age *
                </label>
                <input
                  type="number"
                  id="edit-age"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200"
                  style={{
                    minHeight: designTokens.input.minHeight,
                    fontSize: designTokens.input.fontSize,
                    borderRadius: designTokens.input.borderRadius,
                    transition: designTokens.input.transition,
                  }}
                  min="0"
                  max="150"
                  required
                />
              </div>
            </div>
          </div>

          {/* Symptoms Section */}
          <div className="mb-8">
            <h3 
              className="text-lg font-semibold mb-4 pb-2 border-b"
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                borderColor: theme.colors.border,
              }}
            >
              Symptoms Assessment
            </h3>
            <p 
              className="text-sm mb-4"
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              Select all symptoms that apply to the patient's current condition
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SYMPTOM_OPTIONS.map((symptom) => (
                <label 
                  key={symptom} 
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    formData.symptoms.includes(symptom)
                      ? 'border-teal-500 bg-teal-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  style={{
                    minHeight: '56px', // Larger touch target for mobile
                    borderRadius: theme.borderRadius.lg,
                    transition: theme.transition.fast,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.symptoms.includes(symptom)}
                    onChange={(e) => handleSymptomChange(symptom, e.target.checked)}
                    className="h-5 w-5 rounded border-2 border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-2 focus:ring-offset-1"
                    style={{
                      accentColor: theme.colors.primary[600],
                    }}
                  />
                  <span 
                    className="text-sm font-medium capitalize select-none"
                    style={{
                      color: formData.symptoms.includes(symptom) 
                        ? theme.colors.primary[700] 
                        : theme.colors.text.primary,
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                    }}
                  >
                    {symptom}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Main Complaint Section */}
          <div className="mb-8">
            <h3 
              className="text-lg font-semibold mb-4 pb-2 border-b"
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                borderColor: theme.colors.border,
              }}
            >
              Main Complaint
            </h3>
            
            <div>
              <label 
                htmlFor="edit-main-complaint" 
                className="block font-medium mb-2"
                style={{
                  fontSize: designTokens.form.label.fontSize,
                  fontWeight: designTokens.form.label.fontWeight,
                  color: designTokens.form.label.color,
                }}
              >
                Chief Complaint / Presenting Problem
              </label>
              <p 
                className="text-sm mb-2"
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                Describe the main reason for the patient's visit
              </p>
              <textarea
                id="edit-main-complaint"
                value={formData.mainComplaint}
                onChange={(e) => setFormData(prev => ({ ...prev, mainComplaint: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200 resize-vertical"
                style={{
                  fontSize: designTokens.input.fontSize,
                  borderRadius: designTokens.input.borderRadius,
                  transition: designTokens.input.transition,
                }}
                rows={3}
                placeholder="e.g., 'Severe chest pain for 2 hours'..."
              />
            </div>
          </div>

          {/* Medical History Section */}
          <div className="mb-8">
            <h3 
              className="text-lg font-semibold mb-4 pb-2 border-b"
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                borderColor: theme.colors.border,
              }}
            >
              Medical History
            </h3>
            
            <div>
              <label 
                htmlFor="edit-medical-history" 
                className="block font-medium mb-2"
                style={{
                  fontSize: designTokens.form.label.fontSize,
                  fontWeight: designTokens.form.label.fontWeight,
                  color: designTokens.form.label.color,
                }}
              >
                Patient Medical Background
              </label>
              <p 
                className="text-sm mb-2"
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                Include previous conditions, surgeries, medications, allergies
              </p>
              <textarea
                id="edit-medical-history"
                value={formData.medicalHistory}
                onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200 resize-vertical"
                style={{
                  fontSize: designTokens.input.fontSize,
                  borderRadius: designTokens.input.borderRadius,
                  transition: designTokens.input.transition,
                }}
                rows={3}
                placeholder="e.g., 'Diabetes Type 2, Previous heart surgery, Allergic to penicillin'..."
              />
            </div>
          </div>

          {/* Examination Findings Section */}
          <div className="mb-8">
            <h3 
              className="text-lg font-semibold mb-4 pb-2 border-b"
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                borderColor: theme.colors.border,
              }}
            >
              Examination Findings
            </h3>
            
            <div>
              <label 
                htmlFor="edit-examination-findings" 
                className="block font-medium mb-2"
                style={{
                  fontSize: designTokens.form.label.fontSize,
                  fontWeight: designTokens.form.label.fontWeight,
                  color: designTokens.form.label.color,
                }}
              >
                Clinical Observations
              </label>
              <p 
                className="text-sm mb-2"
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                Record vital signs, physical examination findings
              </p>
              <textarea
                id="edit-examination-findings"
                value={formData.examinationFindings}
                onChange={(e) => setFormData(prev => ({ ...prev, examinationFindings: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200 resize-vertical"
                style={{
                  fontSize: designTokens.input.fontSize,
                  borderRadius: designTokens.input.borderRadius,
                  transition: designTokens.input.transition,
                }}
                rows={3}
                placeholder="e.g., 'BP: 140/90, HR: 95, Temp: 38.2°C, Chest clear'..."
              />
            </div>
          </div>

          {/* Provisional Diagnosis Section */}
          <div className="mb-8">
            <h3 
              className="text-lg font-semibold mb-4 pb-2 border-b"
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                borderColor: theme.colors.border,
              }}
            >
              Provisional Diagnosis
            </h3>
            
            <div>
              <label 
                htmlFor="edit-provisional-diagnosis" 
                className="block font-medium mb-2"
                style={{
                  fontSize: designTokens.form.label.fontSize,
                  fontWeight: designTokens.form.label.fontWeight,
                  color: designTokens.form.label.color,
                }}
              >
                Initial Medical Assessment
              </label>
              <p 
                className="text-sm mb-2"
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                Provide initial diagnosis or differential diagnoses
              </p>
              <textarea
                id="edit-provisional-diagnosis"
                value={formData.provisionalDiagnosis}
                onChange={(e) => setFormData(prev => ({ ...prev, provisionalDiagnosis: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200 resize-vertical"
                style={{
                  fontSize: designTokens.input.fontSize,
                  borderRadius: designTokens.input.borderRadius,
                  transition: designTokens.input.transition,
                }}
                rows={2}
                placeholder="e.g., 'Acute myocardial infarction (suspected)'..."
              />
            </div>
          </div>

          {/* Treatment Plan Section */}
          <div className="mb-8">
            <h3 
              className="text-lg font-semibold mb-4 pb-2 border-b"
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                borderColor: theme.colors.border,
              }}
            >
              Treatment Plan
            </h3>
            
            <div>
              <label 
                htmlFor="edit-treatment-plan" 
                className="block font-medium mb-2"
                style={{
                  fontSize: designTokens.form.label.fontSize,
                  fontWeight: designTokens.form.label.fontWeight,
                  color: designTokens.form.label.color,
                }}
              >
                Medical Intervention Planning
              </label>
              <p 
                className="text-sm mb-2"
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                Outline treatment, medications, procedures, follow-up care
              </p>
              <textarea
                id="edit-treatment-plan"
                value={formData.treatmentPlan}
                onChange={(e) => setFormData(prev => ({ ...prev, treatmentPlan: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200 resize-vertical"
                style={{
                  fontSize: designTokens.input.fontSize,
                  borderRadius: designTokens.input.borderRadius,
                  transition: designTokens.input.transition,
                }}
                rows={3}
                placeholder="e.g., 'IV fluids, Oxygen therapy, ECG monitoring'..."
              />
            </div>
          </div>

          {/* Additional Notes Section */}
          <div className="mb-8">
            <h3 
              className="text-lg font-semibold mb-4 pb-2 border-b"
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                borderColor: theme.colors.border,
              }}
            >
              Additional Notes
            </h3>
            
            <div>
              <label 
                htmlFor="edit-condition" 
                className="block font-medium mb-2"
                style={{
                  fontSize: designTokens.form.label.fontSize,
                  fontWeight: designTokens.form.label.fontWeight,
                  color: designTokens.form.label.color,
                }}
              >
                General Notes & Observations
              </label>
              <p 
                className="text-sm mb-2"
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                Any additional information or general observations
              </p>
              <textarea
                id="edit-condition"
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200 resize-vertical"
                style={{
                  fontSize: designTokens.input.fontSize,
                  borderRadius: designTokens.input.borderRadius,
                  transition: designTokens.input.transition,
                }}
                rows={3}
                placeholder="Enter any additional notes or observations..."
              />
            </div>
          </div>

          {/* Triage and Status Section */}
          <div className="mb-8">
            <h3 
              className="text-lg font-semibold mb-4 pb-2 border-b"
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                borderColor: theme.colors.border,
              }}
            >
              Triage & Treatment Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label 
                  htmlFor="edit-triage" 
                  className="block font-medium mb-2"
                  style={{
                    fontSize: designTokens.form.label.fontSize,
                    fontWeight: designTokens.form.label.fontWeight,
                    color: designTokens.form.label.color,
                  }}
                >
                  Triage Level
                </label>
                <div className="flex gap-2">
                  <select
                    id="edit-triage"
                    value={formData.triageLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, triageLevel: e.target.value as TriageLevel }))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200"
                    style={{
                      minHeight: designTokens.input.minHeight,
                      fontSize: designTokens.input.fontSize,
                      borderRadius: designTokens.input.borderRadius,
                      transition: designTokens.input.transition,
                    }}
                  >
                    {TRIAGE_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAutoTriageUpdate}
                    className="px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    style={{
                      minHeight: designTokens.input.minHeight,
                      fontSize: designTokens.button.fontSize.sm,
                      fontWeight: designTokens.button.fontWeight,
                      borderRadius: designTokens.button.borderRadius,
                      transition: designTokens.button.transition,
                      color: theme.colors.text.secondary,
                      backgroundColor: theme.colors.gray[50],
                      borderColor: theme.colors.gray[300],
                    }}
                    title="Auto-assign triage level based on symptoms"
                  >
                    Auto
                  </button>
                </div>
              </div>

              <div>
                <label 
                  htmlFor="edit-status" 
                  className="block font-medium mb-2"
                  style={{
                    fontSize: designTokens.form.label.fontSize,
                    fontWeight: designTokens.form.label.fontWeight,
                    color: designTokens.form.label.color,
                  }}
                >
                  Treatment Status
                </label>
                <select
                  id="edit-status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PatientStatus }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200"
                  style={{
                    minHeight: designTokens.input.minHeight,
                    fontSize: designTokens.input.fontSize,
                    borderRadius: designTokens.input.borderRadius,
                    transition: designTokens.input.transition,
                  }}
                >
                  {PATIENT_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Treatment Notes Section */}
          <div className="mb-8">
            <h3 
              className="text-lg font-semibold mb-4 pb-2 border-b"
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                borderColor: theme.colors.border,
              }}
            >
              Treatment Notes
            </h3>
            
            <div>
              <label 
                htmlFor="edit-notes" 
                className="block font-medium mb-2"
                style={{
                  fontSize: designTokens.form.label.fontSize,
                  fontWeight: designTokens.form.label.fontWeight,
                  color: designTokens.form.label.color,
                }}
              >
                Notes & Observations
              </label>
              <p 
                className="text-sm mb-2"
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                Add treatment notes, observations, updates, or any relevant medical information
              </p>
              <textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200 resize-vertical"
                style={{
                  fontSize: designTokens.input.fontSize,
                  borderRadius: designTokens.input.borderRadius,
                  transition: designTokens.input.transition,
                }}
                rows={5}
                placeholder="Add treatment notes, observations, updates, or any relevant medical information..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div 
            className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t"
            style={{
              borderColor: theme.colors.border,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                minHeight: designTokens.button.minHeight,
                minWidth: designTokens.button.minWidth,
                fontSize: designTokens.button.fontSize.md,
                fontWeight: designTokens.button.fontWeight,
                borderRadius: designTokens.button.borderRadius,
                transition: designTokens.button.transition,
                color: theme.colors.text.secondary,
                backgroundColor: theme.colors.gray[100],
                borderColor: theme.colors.gray[300],
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = theme.colors.gray[200];
                  e.currentTarget.style.borderColor = theme.colors.gray[400];
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = theme.colors.gray[100];
                  e.currentTarget.style.borderColor = theme.colors.gray[300];
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-8 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              style={{
                minHeight: designTokens.button.minHeight,
                fontSize: designTokens.button.fontSize.md,
                fontWeight: designTokens.button.fontWeight,
                borderRadius: designTokens.button.borderRadius,
                transition: designTokens.button.transition,
                backgroundColor: theme.colors.primary[600],
                boxShadow: designTokens.card.shadow.sm,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = theme.colors.primary[700];
                  e.currentTarget.style.boxShadow = designTokens.card.shadow.md;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = theme.colors.primary[600];
                  e.currentTarget.style.boxShadow = designTokens.card.shadow.sm;
                }
              }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
        ) : (
          <div className="p-8">
            <HandoverNotes
              patient={currentPatient}
              onAddHandoverNote={handleAddHandoverNote}
              onUpdatePatient={handleUpdatePatientFromHandover}
            />
          </div>
        )}
      </div>
    </div>
  );
}