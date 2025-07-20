/**
 * Gaza Care Hub Design System Utilities
 * 
 * This module provides utilities for working with the Gaza Care Hub design system,
 * including theme colors, spacing, typography, and component styling helpers.
 */

import { theme, designTokens } from '../config';

// Type definitions for design system
export type TriageLevel = 'critical' | 'urgent' | 'stable';
export type ColorScale = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Get triage-specific styling based on triage level
 */
export const getTriageStyles = (level: TriageLevel) => {
  return designTokens.triage[level];
};

/**
 * Get CSS custom property value for Gaza Care Hub colors
 */
export const getCSSVariable = (property: string): string => {
  return `var(--gaza-${property})`;
};

/**
 * Get color value from theme
 */
export const getColor = (colorName: keyof typeof theme.colors, scale?: ColorScale): string => {
  const colorGroup = theme.colors[colorName];
  
  if (typeof colorGroup === 'string') {
    return colorGroup;
  }
  
  if (typeof colorGroup === 'object' && colorGroup !== null && scale) {
    const colorObj = colorGroup as Record<number, string>;
    return colorObj[scale] || colorObj[500] || '#000000';
  }
  
  if (typeof colorGroup === 'object' && colorGroup !== null) {
    const colorObj = colorGroup as Record<number, string>;
    return colorObj[500] || '#000000';
  }
  
  return '#000000';
};

/**
 * Get spacing value from theme
 */
export const getSpacing = (size: keyof typeof theme.spacing): string => {
  return theme.spacing[size];
};

/**
 * Get typography styles
 */
export const getTypography = (size: keyof typeof theme.typography.fontSize) => {
  return {
    fontSize: theme.typography.fontSize[size],
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    lineHeight: theme.typography.lineHeight.normal,
  };
};

/**
 * Generate triage card class names based on level
 */
export const getTriageCardClasses = (level: TriageLevel): string => {
  const baseClasses = 'triage-card';
  const levelClass = `triage-card-${level}`;
  return `${baseClasses} ${levelClass}`;
};

/**
 * Generate triage badge class names based on level
 */
export const getTriageBadgeClasses = (level: TriageLevel): string => {
  const baseClasses = 'triage-badge';
  const levelClass = `triage-badge-${level}`;
  return `${baseClasses} ${levelClass}`;
};

/**
 * Generate button class names based on variant and size
 */
export const getButtonClasses = (
  variant: 'primary' | 'secondary' = 'primary',
  size: ButtonSize = 'md'
): string => {
  const baseClass = variant === 'primary' ? 'gaza-btn-primary' : 'gaza-btn-secondary';
  const sizeClass = size !== 'md' ? `gaza-btn-${size}` : '';
  return `${baseClass} ${sizeClass}`.trim();
};

/**
 * Generate form input class names
 */
export const getFormInputClasses = (hasError: boolean = false): string => {
  const baseClass = 'gaza-form-input';
  const errorClass = hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : '';
  return `${baseClass} ${errorClass}`.trim();
};

/**
 * Get responsive breakpoint values
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Media query helpers
 */
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
} as const;

/**
 * Accessibility helpers
 */
export const a11y = {
  // Minimum touch target size (44px x 44px)
  minTouchTarget: '44px',
  
  // Focus ring styles
  focusRing: {
    outline: 'none',
    boxShadow: `0 0 0 2px ${getCSSVariable('primary-200')}`,
  },
  
  // High contrast mode detection
  isHighContrast: () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-contrast: high)').matches;
    }
    return false;
  },
  
  // Reduced motion detection
  prefersReducedMotion: () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  },
} as const;

/**
 * Animation utilities that respect user preferences
 */
export const animations = {
  // Get transition duration based on user preferences
  getTransition: (speed: 'fast' | 'normal' | 'slow' = 'normal'): string => {
    if (a11y.prefersReducedMotion()) {
      return 'none';
    }
    return theme.transition[speed];
  },
  
  // Safe transform that respects reduced motion
  safeTransform: (transform: string): string => {
    if (a11y.prefersReducedMotion()) {
      return 'none';
    }
    return transform;
  },
} as const;

/**
 * Component style generators
 */
export const componentStyles = {
  // Generate card styles
  card: (elevated: boolean = false) => ({
    padding: designTokens.card.padding,
    borderRadius: designTokens.card.borderRadius,
    border: designTokens.card.border,
    boxShadow: elevated ? theme.boxShadow.md : designTokens.card.shadow,
    backgroundColor: getCSSVariable('surface'),
  }),
  
  // Generate input styles
  input: (hasError: boolean = false) => ({
    ...designTokens.input,
    borderColor: hasError ? getCSSVariable('critical-500') : getCSSVariable('border'),
    '&:focus': {
      borderColor: getCSSVariable('primary-600'),
      boxShadow: `0 0 0 2px ${getCSSVariable('primary-200')}`,
    },
  }),
  
  // Generate button styles
  button: (variant: 'primary' | 'secondary' = 'primary', size: ButtonSize = 'md') => {
    const baseStyles = {
      ...designTokens.button,
      padding: designTokens.button.padding[size],
      fontSize: designTokens.button.fontSize[size],
    };
    
    if (variant === 'primary') {
      return {
        ...baseStyles,
        backgroundColor: getCSSVariable('primary-600'),
        color: 'white',
        '&:hover': {
          backgroundColor: getCSSVariable('primary-700'),
        },
      };
    }
    
    return {
      ...baseStyles,
      backgroundColor: getCSSVariable('background'),
      color: getCSSVariable('text-primary'),
      border: `1px solid ${getCSSVariable('border')}`,
      '&:hover': {
        backgroundColor: getCSSVariable('gray-50'),
      },
    };
  },
} as const;