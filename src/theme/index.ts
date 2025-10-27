// Milo Design System - Calm & Senior-Friendly Theme
// Based on DESIGN_SPEC.md - Warm, trustworthy, accessible

export const colors = {
  // Brand - Calm Blue (from DESIGN_SPEC.md)
  primary: '#6B8AFF',        // Main brand color - trustworthy, calming
  primaryDark: '#5B7AEF',    // Darker variant for contrast
  primaryLight: '#E0E9FF',   // Light tint for backgrounds
  primary50: '#F0F4FF',      // Lightest tint
  primary600: '#5B7AEF',
  primary700: '#4B6ADF',
  
  // Accent - Soft Gold (for positive confirmations)
  accent: '#FFD67B',         // Main accent color
  accentLight: '#FFF9E6',    // Light tint
  accent50: '#FFF9E6',
  accent600: '#FFC75B',
  
  // Neutrals - High contrast for readability (WCAG AAA)
  gray50: '#F6F6F6',         // Light grey background
  gray100: '#EEEEEE',
  gray200: '#D0D0D0',        // Medium grey
  gray300: '#D0D0D0',
  gray500: '#888888',
  gray600: '#717171',
  gray700: '#444444',        // Dark grey for text
  gray800: '#222222',
  gray900: '#222222',
  background: '#F6F6F6',
  
  // Semantic - Gentle, non-clinical colors
  success: '#69C181',        // Green for "I'm OK"
  successLight: '#E8F5EC',
  warning: '#FFB84D',        // Soft orange for warnings
  warningLight: '#FFF3E6',
  error: '#FF6A6A',          // Gentle red for alerts
  errorLight: '#FFE8E6',
  info: '#6B8AFF',           // Uses primary blue
  infoLight: '#F0F4FF',
  
  // Backgrounds
  white: '#FFFFFF',
  offWhite: '#F6F6F6',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 24,
  circle: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    color: colors.gray800,
  },
  h2: {
    fontSize: 26,
    fontWeight: '600' as const,
    lineHeight: 32,
    color: colors.gray800,
  },
  h3: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: colors.gray800,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: colors.gray600,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
    color: colors.gray600,
  },
  button: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.gray300,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
};

export type Theme = typeof theme;

