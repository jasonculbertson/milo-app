// Milo Design System - Airbnb-inspired theme
// Based on UI_STYLE_GUIDE.md

export const colors = {
  // Brand
  primary: '#FF5A5F',
  primaryDark: '#E04449',
  primaryLight: '#FF787C',
  
  // Neutrals
  gray50: '#F7F7F7',
  gray100: '#EBEBEB',
  gray200: '#DDDDDD',
  gray300: '#B0B0B0',
  gray600: '#717171',
  gray800: '#222222',
  
  // Semantic
  success: '#00A699',
  warning: '#FC642D',
  error: '#C13515',
  info: '#008489',
  
  // Backgrounds
  white: '#FFFFFF',
  offWhite: '#F7F7F7',
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

