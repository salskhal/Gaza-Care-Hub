/**
 * Accessibility utilities for the Offline Triage System
 * Provides consistent accessibility features and helpers
 */

/**
 * Generate unique IDs for form elements and ARIA relationships
 */
export const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Announce messages to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Set focus to element with optional delay
   */
  setFocus: (element: HTMLElement | null, delay: number = 0): void => {
    if (!element) return;
    
    if (delay > 0) {
      setTimeout(() => element.focus(), delay);
    } else {
      element.focus();
    }
  },

  /**
   * Get first focusable element within container
   */
  getFirstFocusable: (container: HTMLElement): HTMLElement | null => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    return focusableElements[0] as HTMLElement || null;
  },

  /**
   * Trap focus within container (for modals, etc.)
   */
  trapFocus: (container: HTMLElement): (() => void) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }
};

/**
 * Keyboard navigation helpers
 */
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation for lists
   */
  handleArrowKeys: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (newIndex: number) => void
  ): void => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    onIndexChange(newIndex);
    items[newIndex]?.focus();
  },

  /**
   * Handle Enter and Space key activation
   */
  handleActivation: (event: KeyboardEvent, callback: () => void): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }
};

/**
 * ARIA helpers
 */
export const aria = {
  /**
   * Set ARIA expanded state
   */
  setExpanded: (element: HTMLElement, expanded: boolean): void => {
    element.setAttribute('aria-expanded', expanded.toString());
  },

  /**
   * Set ARIA selected state
   */
  setSelected: (element: HTMLElement, selected: boolean): void => {
    element.setAttribute('aria-selected', selected.toString());
  },

  /**
   * Set ARIA pressed state for toggle buttons
   */
  setPressed: (element: HTMLElement, pressed: boolean): void => {
    element.setAttribute('aria-pressed', pressed.toString());
  },

  /**
   * Set ARIA describedby relationship
   */
  setDescribedBy: (element: HTMLElement, describedById: string): void => {
    const existing = element.getAttribute('aria-describedby');
    const ids = existing ? `${existing} ${describedById}` : describedById;
    element.setAttribute('aria-describedby', ids);
  }
};

/**
 * Color contrast utilities
 */
export const colorContrast = {
  /**
   * Check if color combination meets WCAG AA standards
   * This is a simplified check - for production, use a proper color contrast library
   */
  meetsWCAGAA: (foreground: string, background: string): boolean => {
    // This is a placeholder - implement actual contrast ratio calculation
    // For now, return true for our predefined color combinations
    const safeCombinations = [
      { fg: 'text-red-900', bg: 'bg-red-100' },
      { fg: 'text-yellow-900', bg: 'bg-yellow-100' },
      { fg: 'text-green-900', bg: 'bg-green-100' },
      { fg: 'text-gray-900', bg: 'bg-white' },
      { fg: 'text-white', bg: 'bg-blue-600' },
      { fg: 'text-white', bg: 'bg-red-500' },
      { fg: 'text-white', bg: 'bg-yellow-500' },
      { fg: 'text-white', bg: 'bg-green-500' }
    ];

    return safeCombinations.some(combo => 
      foreground.includes(combo.fg) && background.includes(combo.bg)
    );
  }
};

/**
 * Touch target utilities
 */
export const touchTargets = {
  /**
   * Minimum touch target size (44x44px as per WCAG guidelines)
   */
  MIN_SIZE: 44,

  /**
   * Check if element meets minimum touch target size
   */
  meetsMinimumSize: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return rect.width >= touchTargets.MIN_SIZE && rect.height >= touchTargets.MIN_SIZE;
  },

  /**
   * Get CSS classes for minimum touch target
   */
  getMinSizeClasses: (): string => {
    return 'min-h-[44px] min-w-[44px]';
  }
};

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Create screen reader only text
   */
  createSROnlyText: (text: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = text;
    return span;
  },

  /**
   * Format triage level for screen readers
   */
  formatTriageLevel: (level: string, count?: number): string => {
    const priority = level === 'Critical' ? 'highest' : 
                    level === 'Urgent' ? 'medium' : 'lowest';
    const countText = count !== undefined ? ` with ${count} patients` : '';
    return `${level} priority level, ${priority} urgency${countText}`;
  },

  /**
   * Format patient information for screen readers
   */
  formatPatientInfo: (patient: {
    name: string;
    age: number;
    triageLevel: string;
    symptoms: string[];
    condition?: string;
  }): string => {
    const symptomsText = patient.symptoms.length > 0 
      ? ` Symptoms: ${patient.symptoms.join(', ')}.`
      : ' No symptoms recorded.';
    
    const conditionText = patient.condition 
      ? ` Condition notes: ${patient.condition}.`
      : '';

    return `Patient ${patient.name}, age ${patient.age}, ${screenReader.formatTriageLevel(patient.triageLevel)}.${symptomsText}${conditionText}`;
  }
};

/**
 * Form accessibility helpers
 */
export const formAccessibility = {
  /**
   * Associate label with form control
   */
  associateLabel: (labelId: string, controlId: string): void => {
    const label = document.getElementById(labelId);
    const control = document.getElementById(controlId);
    
    if (label && control) {
      label.setAttribute('for', controlId);
      control.setAttribute('aria-labelledby', labelId);
    }
  },

  /**
   * Add error message to form control
   */
  addErrorMessage: (controlId: string, errorId: string, errorMessage: string): void => {
    const control = document.getElementById(controlId);
    const errorElement = document.getElementById(errorId);
    
    if (control && errorElement) {
      control.setAttribute('aria-describedby', errorId);
      control.setAttribute('aria-invalid', 'true');
      errorElement.textContent = errorMessage;
      errorElement.setAttribute('role', 'alert');
    }
  },

  /**
   * Clear error message from form control
   */
  clearErrorMessage: (controlId: string, errorId: string): void => {
    const control = document.getElementById(controlId);
    const errorElement = document.getElementById(errorId);
    
    if (control) {
      control.removeAttribute('aria-describedby');
      control.setAttribute('aria-invalid', 'false');
    }
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.removeAttribute('role');
    }
  }
};