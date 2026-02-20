export const colors = {
  // Brand
  primary: '#FF5F2E',
  primaryDark: '#E04420',
  primaryLight: '#FF8A65',
  primaryBg: '#FFF3EF',

  // UI
  secondary: '#1A1A2E',
  accent: '#FFD166',

  // Backgrounds
  background: '#F8F7F4',
  card: '#FFFFFF',
  surface: '#F3F2EF',

  // Text
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // States
  success: '#10B981',
  successBg: '#ECFDF5',
  going: '#10B981',
  goingBg: '#ECFDF5',
  error: '#EF4444',

  // Map
  mapPin: '#FF5F2E',

  // Overlay
  overlay: 'rgba(0,0,0,0.5)',
  shadow: '#000000',
};

export const categories = {
  museum: { label: 'Museum', emoji: '🏛️', color: '#8B5CF6', bg: '#EDE9FE' },
  cafe: { label: 'Café', emoji: '☕', color: '#F59E0B', bg: '#FFFBEB' },
  park: { label: 'Park', emoji: '🌳', color: '#10B981', bg: '#ECFDF5' },
  concert: { label: 'Concert', emoji: '🎵', color: '#EF4444', bg: '#FEF2F2' },
  theater: { label: 'Theater', emoji: '🎭', color: '#6366F1', bg: '#EEF2FF' },
  food: { label: 'Food', emoji: '🍕', color: '#F97316', bg: '#FFF7ED' },
  art: { label: 'Art', emoji: '🎨', color: '#EC4899', bg: '#FDF2F8' },
  festival: { label: 'Festival', emoji: '🎪', color: '#14B8A6', bg: '#F0FDFA' },
  sports: { label: 'Sports', emoji: '🏋️', color: '#3B82F6', bg: '#EFF6FF' },
  cinema: { label: 'Cinema', emoji: '🎬', color: '#7C3AED', bg: '#F5F3FF' },
  other: { label: 'Other', emoji: '📍', color: '#6B7280', bg: '#F9FAFB' },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 30 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  button: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};
