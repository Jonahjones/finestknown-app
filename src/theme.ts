// Design Token System - Single Source of Truth
// DO NOT use raw hex colors anywhere else in the codebase

export const colors = {
  bg: "#F7F6F3",              // app background
  surface: "#FFFFFF",          // cards, sheets
  text: {
    primary: "#0E1013",        // titles, prices
    secondary: "#6B7280",      // body, meta
    muted: "#9CA3AF"           // hints, captions
  },
  brand: "#C8A34A",            // primary CTA, links, accents
  brandDark: "#A9882F",        // pressed, hover
  success: "#178A50",          // in stock, confirmations
  danger: "#D33A2C",           // sale, destructive
  border: "#E7E5E4",           // dividers, outlines
  
  // Metal colors for live prices and icons
  metal: {
    gold: "#FFD700",
    silver: "#C0C0C0",
    platinum: "#E5E4E2",
    palladium: "#B4B4B4",
    copper: "#B87333",
    rhodium: "#A0A0A0"
  }
};

export const radii = { 
  sm: 8, 
  md: 12, 
  lg: 16, 
  xl: 20, 
  pill: 999 
};

export const shadow = {
  card: { 
    elevation: 2, 
    shadowColor: "#000", 
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 3 } 
  },
  sticky: { 
    elevation: 6, 
    shadowColor: "#000", 
    shadowOpacity: 0.12, 
    shadowRadius: 16, 
    shadowOffset: { width: 0, height: -6 } 
  }
};

export const type = {
  h1: { fontSize: 28, fontWeight: "700" as const, lineHeight: 36 },
  h2: { fontSize: 20, fontWeight: "700" as const, lineHeight: 28 },
  title: { fontSize: 16, fontWeight: "700" as const, lineHeight: 22 },
  body: { fontSize: 14, fontWeight: "500" as const, lineHeight: 20 },
  meta: { fontSize: 12, fontWeight: "500" as const, lineHeight: 16, color: colors.text.secondary }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
};

// Minimum touch target size for accessibility
export const touchTarget = {
  minWidth: 44,
  minHeight: 44
};

