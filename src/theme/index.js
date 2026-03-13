// Minimal black & white design system — matching the "joint" design language
export const colors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#767676',
  grayMid: '#AFAFAF',
  grayLight: '#F5F5F5',
  grayBorder: '#E0E0E0',
  liked: '#FF3B30',
  tabActiveBg: '#EFEFEF',
};

// Categories — minimal style (label + icon for filters)
export const categories = {
  museum: { label: 'Museum', icon: 'business-outline' },
  cafe: { label: 'Café', icon: 'cafe-outline' },
  park: { label: 'Park', icon: 'leaf-outline' },
  concert: { label: 'Concert', icon: 'musical-notes-outline' },
  theater: { label: 'Theater', icon: 'ticket-outline' },
  food: { label: 'Food', icon: 'restaurant-outline' },
  art: { label: 'Art', icon: 'color-palette-outline' },
  festival: { label: 'Festival', icon: 'sparkles-outline' },
  sports: { label: 'Sports', icon: 'bicycle-outline' },
  cinema: { label: 'Cinema', icon: 'film-outline' },
  other: { label: 'Other', icon: 'ellipsis-horizontal-outline' },
};

// Curated poster background colors — editorial, muted/rich tones
export const posterColors = [
  '#A8BFCC', // muted sky blue
  '#1A1F35', // deep navy
  '#2D4A3E', // forest green
  '#C5B8A8', // warm sand
  '#3D2B4A', // deep plum
  '#8B3A3A', // dark burgundy
  '#1C3A4A', // midnight teal
  '#4A3728', // dark espresso
  '#3A4A2B', // olive dark
  '#5C4A6B', // dusty violet
];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Clean editorial typography — LINE Seed JP
export const typography = {
  appName: { fontSize: 20, fontFamily: 'LINESeedJP-ExtraBold', fontStyle: 'italic', letterSpacing: -0.8 },
  h1: { fontSize: 24, fontFamily: 'LINESeedJP-Bold', lineHeight: 30, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontFamily: 'LINESeedJP-Bold', lineHeight: 26, letterSpacing: -0.3 },
  h3: { fontSize: 16, fontFamily: 'LINESeedJP-Bold', lineHeight: 22 },
  body: { fontSize: 15, fontFamily: 'LINESeedJP-Regular', lineHeight: 22 },
  bodySmall: { fontSize: 13, fontFamily: 'LINESeedJP-Regular', lineHeight: 18 },
  caption: { fontSize: 12, fontFamily: 'LINESeedJP-Regular', lineHeight: 16 },
  label: { fontSize: 12, fontFamily: 'LINESeedJP-Bold', letterSpacing: 0.1 },
  chip: { fontSize: 13, fontFamily: 'LINESeedJP-Regular' },
  button: { fontSize: 15, fontFamily: 'LINESeedJP-Bold' },
};

export const shadow = {
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
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
};
