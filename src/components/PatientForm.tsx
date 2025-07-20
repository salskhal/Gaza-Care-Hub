import React, { useState, useCallback, useMemo } from 'react';
import type { PatientFormProps } from '../types';
import { SYMPTOM_OPTIONS } from '../types';
import { triageService } from '../services/triage';
import { storageService } from '../services/storage';
import { usePerformanceMonitoring, debounce } from '../lib/performance';
import { theme, designTokens } from '../config';

/**
 * PatientForm component for collecting patient information following Gaza hospital form structure
 * Features comprehensive medical form sections, validation, automatic triage assignment
 * Optimized for low-spec devices with performance monitoring and debouncing
 */
export const PatientForm: React.FC<PatientFormProps> = ({ onPatientAdded }) => {
  // Performance monitoring hook
  const { measureFormInteraction } = usePerformanceMonitoring();

  // Form state - Personal Details
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [patientId, setPatientId] = useState('');
  
  // Form state - Medical Information
  const [mainComplaint, setMainComplaint] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [medicalHistory, setMedicalHistory] = useState('');
  const [examinationFindings, setExaminationFindings] = useState('');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [condition, setCondition] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientLookupResult, setPatientLookupResult] = useState<string>('');
  
  // Validation state
  const [errors, setErrors] = useState<{
    name?: string;
    age?: string;
    patientId?: string;
    mainComplaint?: string;
    symptoms?: string;
  }>({});

  /**
   * Simulates patient ID lookup (for demonstration purposes)
   */
  const handlePatientIdLookup = useCallback((id: string) => {
    if (id.trim().length >= 3) {
      // Simulate lookup delay
      setTimeout(() => {
        if (id.includes('123')) {
          setPatientLookupResult('✓ Patient found in system - Previous visits: 2');
        } else {
          setPatientLookupResult('ℹ New patient - No previous records found');
        }
      }, 500);
    } else {
      setPatientLookupResult('');
    }
  }, []);

  /**
   * Validates form fields and returns validation errors
   */
  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Validate name (required)
    if (!name.trim()) {
      newErrors.name = 'Patient name is required';
    }

    // Validate age (required, must be a positive number)
    const ageNum = parseInt(age);
    if (!age.trim()) {
      newErrors.age = 'Patient age is required';
    } else if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      newErrors.age = 'Please enter a valid age (0-150)';
    }

    // Validate patient ID format (optional but if provided, should be valid)
    if (patientId.trim() && patientId.trim().length < 3) {
      newErrors.patientId = 'Patient ID must be at least 3 characters';
    }

    // Validate main complaint (required)
    if (!mainComplaint.trim()) {
      newErrors.mainComplaint = 'Main complaint is required';
    }

    // Validate symptoms (at least one symptom required)
    if (selectedSymptoms.length === 0) {
      newErrors.symptoms = 'Please select at least one symptom';
    }

    return newErrors;
  };

  /**
   * Debounced validation to reduce excessive validation calls on low-spec devices
   */
  const debouncedValidation = useMemo(
    () => debounce((field: string, value: string) => {
      const newErrors = { ...errors };
      
      switch (field) {
        case 'name':
          if (!value.trim()) {
            newErrors.name = 'Patient name is required';
          } else {
            delete newErrors.name;
          }
          break;
        case 'age':
          { const ageNum = parseInt(value);
          if (!value.trim()) {
            newErrors.age = 'Patient age is required';
          } else if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
            newErrors.age = 'Please enter a valid age (0-150)';
          } else {
            delete newErrors.age;
          }
          break; }
        case 'patientId':
          if (value.trim() && value.trim().length < 3) {
            newErrors.patientId = 'Patient ID must be at least 3 characters';
          } else {
            delete newErrors.patientId;
          }
          break;
        case 'mainComplaint':
          if (!value.trim()) {
            newErrors.mainComplaint = 'Main complaint is required';
          } else {
            delete newErrors.mainComplaint;
          }
          break;
      }
      
      setErrors(newErrors);
    }, 300),
    [errors]
  );

  /**
   * Debounced patient ID lookup
   */
  const debouncedPatientLookup = useMemo(
    () => debounce((id: string) => {
      handlePatientIdLookup(id);
    }, 800),
    [handlePatientIdLookup]
  );

  /**
   * Optimized symptom change handler with performance monitoring
   */
  const handleSymptomChange = useCallback((symptom: string, checked: boolean) => {
    measureFormInteraction('symptom-selection', () => {
      if (checked) {
        setSelectedSymptoms(prev => [...prev, symptom]);
      } else {
        setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
      }
      
      // Clear symptoms error when user selects a symptom
      if (checked && errors.symptoms) {
        setErrors(prev => ({ ...prev, symptoms: undefined }));
      }
    });
  }, [errors.symptoms, measureFormInteraction]);

  /**
   * Clears all form fields and errors
   */
  const clearForm = () => {
    setName('');
    setAge('');
    setPatientId('');
    setMainComplaint('');
    setSelectedSymptoms([]);
    setMedicalHistory('');
    setExaminationFindings('');
    setProvisionalDiagnosis('');
    setTreatmentPlan('');
    setCondition('');
    setPatientLookupResult('');
    setErrors({});
  };

  /**
   * Handles form submission with performance monitoring
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await measureFormInteraction('patient-form-submission', async () => {
      // Validate form
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);
      
      try {
        // Assign triage level using the triage service
        const triageLevel = triageService.assignTriageLevel(selectedSymptoms, condition);
        
        // Add patient to storage with Gaza hospital form data
        await storageService.addPatient({
          name: name.trim(),
          age: parseInt(age),
          symptoms: selectedSymptoms,
          condition: condition.trim(),
          triageLevel,
          status: 'Waiting',
          notes: '',
          lastUpdated: Date.now(),
          // Gaza hospital form fields
          patientId: patientId.trim() || undefined,
          mainComplaint: mainComplaint.trim(),
          medicalHistory: medicalHistory.trim() || undefined,
          examinationFindings: examinationFindings.trim() || undefined,
          provisionalDiagnosis: provisionalDiagnosis.trim() || undefined,
          treatmentPlan: treatmentPlan.trim() || undefined,
        });

        // Clear form after successful submission
        clearForm();
        
        // Notify parent component
        onPatientAdded?.();
        
      } catch (error) {
        console.error('Error adding patient:', error);
        // You could add error state here for user feedback
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto overflow-hidden animate-fade-in-up"
      style={{
        boxShadow: designTokens.card.shadow.lg,
        borderRadius: designTokens.card.borderRadius.lg,
      }}
    >
      {/* Header Section */}
      <div 
        className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b animate-slide-down"
        style={{
          backgroundColor: theme.colors.primary[50],
          borderColor: theme.colors.border,
        }}
      >
        <h2 
          className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2" 
          id="patient-form-title"
          style={{
            color: theme.colors.primary[800],
            fontWeight: theme.typography.fontWeight.bold,
          }}
        >
          Gaza Hospital Emergency Department Form
        </h2>
        <p 
          className="text-xs sm:text-sm"
          style={{
            color: theme.colors.text.secondary,
          }}
        >
          Complete patient information following Gaza hospital emergency department protocol
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8" aria-labelledby="patient-form-title" noValidate>
        {/* Personal Details Section */}
        <div className="mb-6 sm:mb-8">
          <h3 
            className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 pb-2 border-b flex items-center gap-2"
            style={{
              color: theme.colors.text.primary,
              fontWeight: theme.typography.fontWeight.semibold,
              borderColor: theme.colors.border,
            }}
          >
            <span className="text-blue-600">👤</span>
            Personal Details
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Patient ID Field */}
            <div>
              <label 
                htmlFor="patient-id" 
                className="block font-medium mb-2"
                style={{
                  fontSize: designTokens.form.label.fontSize,
                  fontWeight: designTokens.form.label.fontWeight,
                  color: designTokens.form.label.color,
                  marginBottom: designTokens.form.label.marginBottom,
                }}
              >
                Patient ID
              </label>
              <input
                id="patient-id"
                type="text"
                value={patientId}
                onChange={(e) => {
                  setPatientId(e.target.value);
                  debouncedValidation('patientId', e.target.value);
                  debouncedPatientLookup(e.target.value);
                }}
                className={`w-full px-3 sm:px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 text-sm sm:text-base ${
                  errors.patientId 
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400'
                }`}
                style={{
                  minHeight: designTokens.input.minHeight,
                  borderRadius: designTokens.input.borderRadius,
                  transition: designTokens.input.transition,
                }}
                placeholder="Enter patient ID (optional)"
                aria-describedby={errors.patientId ? 'patient-id-error' : undefined}
              />
              {errors.patientId && (
                <p 
                  id="patient-id-error" 
                  className="mt-2 text-sm flex items-center gap-1" 
                  role="alert"
                  style={{
                    color: designTokens.form.errorMessage.color,
                    fontSize: designTokens.form.errorMessage.fontSize,
                    marginTop: designTokens.form.errorMessage.marginTop,
                  }}
                >
                  <span className="text-red-500">⚠</span>
                  {errors.patientId}
                </p>
              )}
              {patientLookupResult && (
                <p 
                  className="mt-2 text-sm flex items-center gap-1" 
                  style={{
                    color: patientLookupResult.includes('✓') ? theme.colors.stable[600] : theme.colors.primary[600],
                    fontSize: designTokens.form.errorMessage.fontSize,
                    marginTop: designTokens.form.errorMessage.marginTop,
                  }}
                >
                  {patientLookupResult}
                </p>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label 
                htmlFor="patient-name" 
                className="block font-medium mb-2"
                style={{
                  fontSize: designTokens.form.label.fontSize,
                  fontWeight: designTokens.form.label.fontWeight,
                  color: designTokens.form.label.color,
                  marginBottom: designTokens.form.label.marginBottom,
                }}
              >
                Patient Name *
              </label>
              <input
                id="patient-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  debouncedValidation('name', e.target.value);
                }}
                className={`w-full px-3 sm:px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 text-sm sm:text-base ${
                  errors.name 
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400'
                }`}
                style={{
                  minHeight: designTokens.input.minHeight,
                  borderRadius: designTokens.input.borderRadius,
                  transition: designTokens.input.transition,
                }}
                placeholder="Enter patient's full name"
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p 
                  id="name-error" 
                  className="mt-2 text-sm flex items-center gap-1" 
                  role="alert"
                  style={{
                    color: designTokens.form.errorMessage.color,
                    fontSize: designTokens.form.errorMessage.fontSize,
                    marginTop: designTokens.form.errorMessage.marginTop,
                  }}
                >
                  <span className="text-red-500">⚠</span>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Age Field */}
            <div>
              <label 
                htmlFor="patient-age" 
                className="block font-medium mb-2"
                style={{
                  fontSize: designTokens.form.label.fontSize,
                  fontWeight: designTokens.form.label.fontWeight,
                  color: designTokens.form.label.color,
                  marginBottom: designTokens.form.label.marginBottom,
                }}
              >
                Patient Age *
              </label>
              <input
                id="patient-age"
                type="number"
                min="0"
                max="150"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  debouncedValidation('age', e.target.value);
                }}
                className={`w-full px-3 sm:px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 text-sm sm:text-base ${
                  errors.age 
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400'
                }`}
                style={{
                  minHeight: designTokens.input.minHeight,
                  borderRadius: designTokens.input.borderRadius,
                  transition: designTokens.input.transition,
                }}
                placeholder="Enter patient's age"
                aria-describedby={errors.age ? 'age-error' : undefined}
              />
              {errors.age && (
                <p 
                  id="age-error" 
                  className="mt-2 text-sm flex items-center gap-1" 
                  role="alert"
                  style={{
                    color: designTokens.form.errorMessage.color,
                    fontSize: designTokens.form.errorMessage.fontSize,
                    marginTop: designTokens.form.errorMessage.marginTop,
                  }}
                >
                  <span className="text-red-500">⚠</span>
                  {errors.age}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Complaint Section */}
        <div className="mb-6 sm:mb-8">
          <h3 
            className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 pb-2 border-b flex items-center gap-2"
            style={{
              color: theme.colors.text.primary,
              fontWeight: theme.typography.fontWeight.semibold,
              borderColor: theme.colors.border,
            }}
          >
            <span className="text-red-600">🩺</span>
            Main Complaint
          </h3>
          
          <div>
            <label 
              htmlFor="main-complaint" 
              className="block font-medium mb-2"
              style={{
                fontSize: designTokens.form.label.fontSize,
                fontWeight: designTokens.form.label.fontWeight,
                color: designTokens.form.label.color,
                marginBottom: designTokens.form.label.marginBottom,
              }}
            >
              Chief Complaint / Presenting Problem *
            </label>
            <p 
              className="text-sm mb-2"
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              Describe the main reason for the patient's visit in their own words
            </p>
            <textarea
              id="main-complaint"
              value={mainComplaint}
              onChange={(e) => {
                setMainComplaint(e.target.value);
                debouncedValidation('mainComplaint', e.target.value);
              }}
              rows={3}
              className={`w-full px-3 sm:px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 resize-vertical text-sm sm:text-base ${
                errors.mainComplaint 
                  ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                  : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400'
              }`}
              style={{
                borderRadius: designTokens.input.borderRadius,
                transition: designTokens.input.transition,
              }}
              placeholder="e.g., 'Severe chest pain for 2 hours', 'Difficulty breathing since morning'..."
              aria-describedby={errors.mainComplaint ? 'main-complaint-error' : undefined}
            />
            {errors.mainComplaint && (
              <p 
                id="main-complaint-error" 
                className="mt-2 text-sm flex items-center gap-1" 
                role="alert"
                style={{
                  color: designTokens.form.errorMessage.color,
                  fontSize: designTokens.form.errorMessage.fontSize,
                  marginTop: designTokens.form.errorMessage.marginTop,
                }}
              >
                <span className="text-red-500">⚠</span>
                {errors.mainComplaint}
              </p>
            )}
          </div>
        </div>

        {/* Symptoms Assessment Section */}
        <div className="mb-6 sm:mb-8">
          <fieldset>
            <legend 
              id="symptoms-legend" 
              className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 pb-2 border-b w-full flex items-center gap-2"
              style={{
                color: theme.colors.text.primary,
                fontWeight: theme.typography.fontWeight.semibold,
                borderColor: theme.colors.border,
              }}
            >
              <span className="text-orange-600">📋</span>
              Symptoms Assessment *
            </legend>
            <p 
              className="text-xs sm:text-sm mb-3 sm:mb-4"
              style={{
                color: theme.colors.text.secondary,
              }}
            >
              Select all symptoms that apply to the patient's current condition
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3" aria-labelledby="symptoms-legend">
              {SYMPTOM_OPTIONS.map((symptom, index) => (
                <label
                  key={symptom}
                  className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedSymptoms.includes(symptom)
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
                    id={`symptom-${index}`}
                    checked={selectedSymptoms.includes(symptom)}
                    onChange={(e) => handleSymptomChange(symptom, e.target.checked)}
                    className="h-5 w-5 rounded border-2 border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-2 focus:ring-offset-1"
                    style={{
                      accentColor: theme.colors.primary[600],
                    }}
                    aria-describedby={errors.symptoms ? 'symptoms-error' : undefined}
                  />
                  <span 
                    className="text-xs sm:text-sm font-medium select-none capitalize"
                    style={{
                      color: selectedSymptoms.includes(symptom) 
                        ? theme.colors.primary[700] 
                        : theme.colors.text.primary,
                      fontWeight: theme.typography.fontWeight.medium,
                    }}
                  >
                    {symptom}
                  </span>
                </label>
              ))}
            </div>
            {errors.symptoms && (
              <p 
                id="symptoms-error" 
                className="mt-3 text-sm flex items-center gap-1" 
                role="alert"
                style={{
                  color: designTokens.form.errorMessage.color,
                  fontSize: designTokens.form.errorMessage.fontSize,
                }}
              >
                <span className="text-red-500">⚠</span>
                {errors.symptoms}
              </p>
            )}
          </fieldset>
        </div>

        {/* Medical History Section */}
        <div className="mb-8">
          <h3 
            className="text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2"
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              borderColor: theme.colors.border,
            }}
          >
            <span className="text-purple-600">📚</span>
            Medical History
          </h3>
          
          <div>
            <label 
              htmlFor="medical-history" 
              className="block font-medium mb-2"
              style={{
                fontSize: designTokens.form.label.fontSize,
                fontWeight: designTokens.form.label.fontWeight,
                color: designTokens.form.label.color,
                marginBottom: designTokens.form.label.marginBottom,
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
              Include previous medical conditions, surgeries, medications, allergies, and family history
            </p>
            <textarea
              id="medical-history"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200 resize-vertical"
              style={{
                fontSize: designTokens.input.fontSize,
                borderRadius: designTokens.input.borderRadius,
                transition: designTokens.input.transition,
              }}
              placeholder="e.g., 'Diabetes Type 2 (10 years), Previous heart surgery (2019), Allergic to penicillin'..."
            />
          </div>
        </div>

        {/* Examination Findings Section */}
        <div className="mb-8">
          <h3 
            className="text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2"
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              borderColor: theme.colors.border,
            }}
          >
            <span className="text-green-600">🔍</span>
            Examination Findings
          </h3>
          
          <div>
            <label 
              htmlFor="examination-findings" 
              className="block font-medium mb-2"
              style={{
                fontSize: designTokens.form.label.fontSize,
                fontWeight: designTokens.form.label.fontWeight,
                color: designTokens.form.label.color,
                marginBottom: designTokens.form.label.marginBottom,
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
              Record vital signs, physical examination findings, and clinical observations
            </p>
            <textarea
              id="examination-findings"
              value={examinationFindings}
              onChange={(e) => setExaminationFindings(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200 resize-vertical"
              style={{
                fontSize: designTokens.input.fontSize,
                borderRadius: designTokens.input.borderRadius,
                transition: designTokens.input.transition,
              }}
              placeholder="e.g., 'BP: 140/90, HR: 95, Temp: 38.2°C, Chest clear, Abdomen soft, No neurological deficits'..."
            />
          </div>
        </div>

        {/* Provisional Diagnosis Section */}
        <div className="mb-8">
          <h3 
            className="text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2"
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              borderColor: theme.colors.border,
            }}
          >
            <span className="text-indigo-600">🎯</span>
            Provisional Diagnosis
          </h3>
          
          <div>
            <label 
              htmlFor="provisional-diagnosis" 
              className="block font-medium mb-2"
              style={{
                fontSize: designTokens.form.label.fontSize,
                fontWeight: designTokens.form.label.fontWeight,
                color: designTokens.form.label.color,
                marginBottom: designTokens.form.label.marginBottom,
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
              Provide initial diagnosis or differential diagnoses based on current findings
            </p>
            <textarea
              id="provisional-diagnosis"
              value={provisionalDiagnosis}
              onChange={(e) => setProvisionalDiagnosis(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200 resize-vertical"
              style={{
                fontSize: designTokens.input.fontSize,
                borderRadius: designTokens.input.borderRadius,
                transition: designTokens.input.transition,
              }}
              placeholder="e.g., 'Acute myocardial infarction (suspected)', 'Pneumonia vs. bronchitis', 'Gastroenteritis'..."
            />
          </div>
        </div>

        {/* Treatment Plan Section */}
        <div className="mb-8">
          <h3 
            className="text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2"
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              borderColor: theme.colors.border,
            }}
          >
            <span className="text-teal-600">💊</span>
            Treatment Plan
          </h3>
          
          <div>
            <label 
              htmlFor="treatment-plan" 
              className="block font-medium mb-2"
              style={{
                fontSize: designTokens.form.label.fontSize,
                fontWeight: designTokens.form.label.fontWeight,
                color: designTokens.form.label.color,
                marginBottom: designTokens.form.label.marginBottom,
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
              Outline immediate treatment, medications, procedures, and follow-up care
            </p>
            <textarea
              id="treatment-plan"
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200 resize-vertical"
              style={{
                fontSize: designTokens.input.fontSize,
                borderRadius: designTokens.input.borderRadius,
                transition: designTokens.input.transition,
              }}
              placeholder="e.g., 'IV fluids, Oxygen therapy, ECG monitoring, Aspirin 300mg, Transfer to cardiology'..."
            />
          </div>
        </div>

        {/* Additional Notes Section */}
        <div className="mb-8">
          <h3 
            className="text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2"
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              borderColor: theme.colors.border,
            }}
          >
            <span className="text-gray-600">📝</span>
            Additional Notes
          </h3>
          
          <div>
            <label 
              htmlFor="patient-condition" 
              className="block font-medium mb-2"
              style={{
                fontSize: designTokens.form.label.fontSize,
                fontWeight: designTokens.form.label.fontWeight,
                color: designTokens.form.label.color,
                marginBottom: designTokens.form.label.marginBottom,
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
              Any additional information, special considerations, or general observations
            </p>
            <textarea
              id="patient-condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-all duration-200 resize-vertical"
              style={{
                fontSize: designTokens.input.fontSize,
                borderRadius: designTokens.input.borderRadius,
                transition: designTokens.input.transition,
              }}
              placeholder="Enter any additional notes, special considerations, or observations..."
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
            onClick={clearForm}
            disabled={isSubmitting}
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
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = theme.colors.gray[200];
                e.currentTarget.style.borderColor = theme.colors.gray[400];
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = theme.colors.gray[100];
                e.currentTarget.style.borderColor = theme.colors.gray[300];
              }
            }}
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
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
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = theme.colors.primary[700];
                e.currentTarget.style.boxShadow = designTokens.card.shadow.md;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = theme.colors.primary[600];
                e.currentTarget.style.boxShadow = designTokens.card.shadow.sm;
              }
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Registering Patient...
              </span>
            ) : (
              'Register Patient'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};