export const config = {
  location: 'Gaza',
};

export const branding = {
  name: 'Gaza Care Hub',
  tagline: 'Emergency Medical Triage for Gaza',
  description: 'Humanitarian healthcare support system for emergency medical triage',
  colors: {
    primary: '#0d9488', // Teal - representing hope and healing
    secondary: '#059669', // Green - for stable patients
    critical: '#dc2626', // Red - for urgent medical attention
    warning: '#f59e0b', // Amber - for urgent cases
    background: '#ffffff',
    surface: '#f8fafc',
  },
  mission: 'Providing critical medical triage support for Gaza healthcare workers',
};

/**
 * Gaza Care Hub Design System Theme Configuration
 * 
 * This comprehensive theme configuration provides the foundation for the Gaza Care Hub
 * design system, including color palettes, typography scales, spacing systems, and
 * component design tokens.
 */
export const theme = {
  colors: {
    // Primary palette - Teal representing hope and healing
    primary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6', // Main primary
      600: '#0d9488', // Brand primary - Gaza Care Hub signature color
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    
    // Triage status colors - Medical standard color coding
    critical: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626', // Critical red - immediate attention required
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    urgent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Urgent amber - prompt attention needed
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    stable: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669', // Stable green - non-urgent care
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    
    // Neutral colors - Professional medical interface
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    
    // Semantic colors for consistent UI elements
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#64748b',
    },
  },
  
  // Typography scale - Optimized for medical information readability
  typography: {
    fontFamily: {
      sans: [
        'Inter',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        'sans-serif'
      ],
      mono: [
        'JetBrains Mono',
        'SF Mono',
        'Monaco',
        'Inconsolata',
        'Roboto Mono',
        'Consolas',
        'Liberation Mono',
        'Courier New',
        'monospace'
      ],
    },
    fontSize: {
      xs: '0.75rem',     // 12px - Small labels, captions
      sm: '0.875rem',    // 14px - Secondary text, form labels
      base: '1rem',      // 16px - Body text, default size
      lg: '1.125rem',    // 18px - Emphasized text
      xl: '1.25rem',     // 20px - Small headings
      '2xl': '1.5rem',   // 24px - Section headings
      '3xl': '1.875rem', // 30px - Page headings
      '4xl': '2.25rem',  // 36px - Large headings
      '5xl': '3rem',     // 48px - Display headings
      '6xl': '3.75rem',  // 60px - Hero headings
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  
  // Spacing system - Consistent spacing for layouts and components
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px - Minimum touch target size
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },
  
  // Border radius - Consistent rounded corners
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Shadows - Depth and elevation
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  
  // Transitions - Smooth animations
  transition: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
    all: 'all 250ms ease-in-out',
  },
  
  // Breakpoints - Responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index scale - Layering system
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
};

/**
 * Design Tokens - Consistent styling primitives for Gaza Care Hub components
 * 
 * These tokens provide a consistent foundation for component styling across
 * the application, ensuring visual coherence and maintainability.
 */
export const designTokens = {
  // Card component tokens
  card: {
    padding: {
      sm: theme.spacing[3],
      md: theme.spacing[4],
      lg: theme.spacing[6],
    },
    borderRadius: {
      sm: theme.borderRadius.md,
      md: theme.borderRadius.lg,
      lg: theme.borderRadius.xl,
    },
    shadow: {
      sm: theme.boxShadow.sm,
      md: theme.boxShadow.base,
      lg: theme.boxShadow.md,
    },
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
  },
  
  // Button component tokens
  button: {
    padding: {
      sm: `${theme.spacing[2]} ${theme.spacing[3]}`,
      md: `${theme.spacing[2.5]} ${theme.spacing[4]}`,
      lg: `${theme.spacing[3]} ${theme.spacing[6]}`,
    },
    borderRadius: theme.borderRadius.md,
    fontSize: {
      sm: theme.typography.fontSize.sm,
      md: theme.typography.fontSize.base,
      lg: theme.typography.fontSize.lg,
    },
    fontWeight: theme.typography.fontWeight.medium,
    transition: theme.transition.fast,
    minHeight: theme.spacing[11], // 44px - accessibility minimum touch target
    minWidth: theme.spacing[11],
  },
  
  // Input component tokens
  input: {
    padding: `${theme.spacing[2.5]} ${theme.spacing[3]}`,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    transition: theme.transition.fast,
    minHeight: theme.spacing[11], // 44px - accessibility minimum touch target
    backgroundColor: theme.colors.background,
    color: theme.colors.text.primary,
  },
  
  // Form component tokens
  form: {
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[1],
    },
    fieldset: {
      marginBottom: theme.spacing[4],
    },
    errorMessage: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.critical[600],
      marginTop: theme.spacing[1],
    },
  },
  
  // Navigation component tokens
  navigation: {
    height: theme.spacing[16], // 64px
    padding: `${theme.spacing[0]} ${theme.spacing[6]}`,
    backgroundColor: theme.colors.background,
    borderBottom: `1px solid ${theme.colors.border}`,
    boxShadow: theme.boxShadow.sm,
  },
  
  // Triage-specific design tokens
  triage: {
    critical: {
      color: theme.colors.critical[600],
      backgroundColor: theme.colors.critical[50],
      borderColor: theme.colors.critical[200],
      badgeColor: '#ffffff',
      badgeBackground: theme.colors.critical[600],
    },
    urgent: {
      color: theme.colors.urgent[700],
      backgroundColor: theme.colors.urgent[50],
      borderColor: theme.colors.urgent[200],
      badgeColor: '#ffffff',
      badgeBackground: theme.colors.urgent[500],
    },
    stable: {
      color: theme.colors.stable[700],
      backgroundColor: theme.colors.stable[50],
      borderColor: theme.colors.stable[200],
      badgeColor: '#ffffff',
      badgeBackground: theme.colors.stable[600],
    },
  },
  
  // Status indicator tokens
  status: {
    online: {
      color: theme.colors.stable[700],
      backgroundColor: theme.colors.stable[100],
      borderColor: theme.colors.stable[300],
    },
    offline: {
      color: theme.colors.critical[700],
      backgroundColor: theme.colors.critical[100],
      borderColor: theme.colors.critical[300],
    },
  },
  
  // Typography tokens for consistent text styling
  typography: {
    heading: {
      h1: {
        fontSize: theme.typography.fontSize['4xl'],
        fontWeight: theme.typography.fontWeight.bold,
        lineHeight: theme.typography.lineHeight.tight,
        color: theme.colors.text.primary,
      },
      h2: {
        fontSize: theme.typography.fontSize['3xl'],
        fontWeight: theme.typography.fontWeight.bold,
        lineHeight: theme.typography.lineHeight.tight,
        color: theme.colors.text.primary,
      },
      h3: {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: theme.typography.fontWeight.semibold,
        lineHeight: theme.typography.lineHeight.snug,
        color: theme.colors.text.primary,
      },
      h4: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.semibold,
        lineHeight: theme.typography.lineHeight.snug,
        color: theme.colors.text.primary,
      },
    },
    body: {
      large: {
        fontSize: theme.typography.fontSize.lg,
        lineHeight: theme.typography.lineHeight.relaxed,
        color: theme.colors.text.primary,
      },
      base: {
        fontSize: theme.typography.fontSize.base,
        lineHeight: theme.typography.lineHeight.normal,
        color: theme.colors.text.primary,
      },
      small: {
        fontSize: theme.typography.fontSize.sm,
        lineHeight: theme.typography.lineHeight.normal,
        color: theme.colors.text.secondary,
      },
    },
  },
  
  // Layout tokens
  layout: {
    container: {
      maxWidth: '1280px',
      padding: `${theme.spacing[0]} ${theme.spacing[4]}`,
      margin: '0 auto',
    },
    section: {
      padding: `${theme.spacing[12]} ${theme.spacing[0]}`,
    },
    grid: {
      gap: {
        sm: theme.spacing[4],
        md: theme.spacing[6],
        lg: theme.spacing[8],
      },
    },
  },
  
  // Animation tokens
  animation: {
    fadeIn: {
      opacity: '0',
      animation: 'fadeIn 0.3s ease-in-out forwards',
    },
    slideUp: {
      transform: 'translateY(10px)',
      opacity: '0',
      animation: 'slideUp 0.3s ease-out forwards',
    },
    pulse: {
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
  },
};