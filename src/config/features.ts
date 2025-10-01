// Feature flags configuration
export const FEATURES = {
  FLASH_SALE_ENABLED: process.env.EXPO_PUBLIC_FLASH_SALE_ENABLED !== 'false', // Default to true
} as const;

export type FeatureFlag = keyof typeof FEATURES;











