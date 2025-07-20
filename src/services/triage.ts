import type  { TriageLevel, TriageService } from '../types';

/**
 * Triage classification service for automatic patient triage level assignment
 * Based on symptom keywords and condition notes analysis
 */
export class TriageClassificationService implements TriageService {
  // Critical symptoms that require immediate attention
  private readonly criticalSymptoms = [
    'bleeding heavily',
    'unconscious',
    'fainting',
    'severe pain',
    'difficulty breathing',
    'chest pain',
    'severe burns',
    'head injury',
    'cardiac arrest',
    'stroke symptoms',
    'severe allergic reaction',
    'major trauma'
  ];

  // Urgent symptoms that require prompt attention
  private readonly urgentSymptoms = [
    'fever',
    'vomiting',
    'moderate pain',
    'persistent cough',
    'diarrhea',
    'dizziness',
    'rash',
    'swelling',
    'dehydration',
    'infection signs',
    'breathing issues',
    'abdominal pain'
  ];

  // Critical keywords in condition notes
  private readonly criticalConditionKeywords = [
    'critical',
    'emergency',
    'life-threatening',
    'severe',
    'urgent care needed',
    'immediate attention',
    'trauma',
    'cardiac',
    'respiratory failure',
    'shock',
    'hemorrhage',
    'fracture'
  ];

  // Urgent keywords in condition notes
  private readonly urgentConditionKeywords = [
    'urgent',
    'priority',
    'needs attention',
    'concerning',
    'worsening',
    'moderate',
    'infection',
    'pain management',
    'follow-up needed',
    'monitoring required'
  ];

  /**
   * Assigns triage level based on symptoms and condition notes
   * @param symptoms Array of patient symptoms
   * @param condition Additional condition notes
   * @returns TriageLevel classification
   */
  assignTriageLevel(symptoms: string[], condition: string): TriageLevel {
    const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());
    const normalizedCondition = condition.toLowerCase().trim();

    // Check for critical symptoms
    const hasCriticalSymptoms = this.criticalSymptoms.some(criticalSymptom =>
      normalizedSymptoms.some(symptom => 
        symptom.includes(criticalSymptom.toLowerCase()) ||
        criticalSymptom.toLowerCase().includes(symptom)
      )
    );

    // Check for critical keywords in condition notes
    const hasCriticalCondition = this.criticalConditionKeywords.some(keyword =>
      normalizedCondition.includes(keyword.toLowerCase())
    );

    // If either critical symptoms or critical condition keywords are found, assign Critical
    if (hasCriticalSymptoms || hasCriticalCondition) {
      return 'Critical';
    }

    // Check for urgent symptoms
    const hasUrgentSymptoms = this.urgentSymptoms.some(urgentSymptom =>
      normalizedSymptoms.some(symptom => 
        symptom.includes(urgentSymptom.toLowerCase()) ||
        urgentSymptom.toLowerCase().includes(symptom)
      )
    );

    // Check for urgent keywords in condition notes
    const hasUrgentCondition = this.urgentConditionKeywords.some(keyword =>
      normalizedCondition.includes(keyword.toLowerCase())
    );

    // If either urgent symptoms or urgent condition keywords are found, assign Urgent
    if (hasUrgentSymptoms || hasUrgentCondition) {
      return 'Urgent';
    }

    // Default to Stable if no critical or urgent indicators are found
    return 'Stable';
  }

  /**
   * Returns array of critical symptom keywords
   * @returns Array of critical symptoms
   */
  getCriticalKeywords(): string[] {
    return [...this.criticalSymptoms];
  }

  /**
   * Returns array of urgent symptom keywords
   * @returns Array of urgent symptoms
   */
  getUrgentKeywords(): string[] {
    return [...this.urgentSymptoms];
  }

  /**
   * Returns array of critical condition keywords
   * @returns Array of critical condition keywords
   */
  getCriticalConditionKeywords(): string[] {
    return [...this.criticalConditionKeywords];
  }

  /**
   * Returns array of urgent condition keywords
   * @returns Array of urgent condition keywords
   */
  getUrgentConditionKeywords(): string[] {
    return [...this.urgentConditionKeywords];
  }
}

// Export singleton instance for use throughout the application
export const triageService = new TriageClassificationService();