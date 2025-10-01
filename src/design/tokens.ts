// Luxury Design Tokens for Finest Known

export const colors = {
  // New design system tokens
  bg: '#F7F6F3',
  surface: '#FFFFFF',
  brand: '#C8A34A',
  text: {
    primary: '#0E1013',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
  },
  success: '#178A50',
  danger: '#D33A2C',
  
  // Core palette (legacy support)
  navy: '#0B1B2B',
  midnight: '#0E2033', 
  ivory: '#F8F7F4',
  platinum: '#E6E8EC',
  silver: '#C9D1D9',
  gold: '#C8A34A', // Updated to match brand
  
  // Enhanced card colors for better contrast
  cardBackground: '#FFFFFF',
  cardBorder: '#D1D5DB',
  cardBorderHover: '#9CA3AF',
  
  // Status colors (legacy)
  info: '#3B82F6',
  warning: '#F59E0B',
  
  // Text hierarchy (legacy flat structure)
  textPrimary: '#0E1013',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Legacy support
  white: '#FFFFFF',
  black: '#000000',
  background: '#F7F6F3', // Updated to match bg
  slate: '#6B7280',
  charcoal: '#0E1013', // Updated to match text.primary
  red: '#D33A2C', // Updated to match danger
};

export const typography = {
  display: { size: 28, lineHeight: 34, weight: '700' as const },
  title: { size: 22, lineHeight: 28, weight: '700' as const },
  heading: { size: 18, lineHeight: 24, weight: '600' as const },
  body: { size: 15, lineHeight: 22, weight: '500' as const, fontWeight: '500' as const },
  caption: { size: 13, lineHeight: 18, weight: '500' as const, fontWeight: '500' as const },
  
  // Legacy support
  sizes: {
    xs: 12,
    sm: 13,
    base: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    '2xl': 22,
    '3xl': 28,
    '4xl': 32,
  },
  weights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  // Legacy styles
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  
  // Legacy support
  sm: 8,
  md: 12,
  lg: 16,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const shadows = {
  // New design system shadows
  card: {
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    shadowOpacity: 0.08,
    shadowColor: '#000000',
    elevation: 3,
  },
  sticky: {
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
    shadowOpacity: 0.15,
    shadowColor: '#000000',
    elevation: 8,
  },
  
  // Legacy elevation system
  e1: {
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.10,
    shadowColor: '#000000',
    elevation: 3,
  },
  e2: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 0.12,
    shadowColor: '#000000',
    elevation: 6,
  },
  e3: {
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 32,
    shadowOpacity: 0.16,
    shadowColor: '#000000',
    elevation: 12,
  },
  
  // Legacy support
  sm: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};

export const motion = {
  fast: 180,
  sheet: 220,
  pressScale: 0.98,
};

// Legacy exports for backward compatibility
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const layout = {
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
};