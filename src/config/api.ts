// API Configuration for Precious Metals Pricing
// Add your API keys here or set them as environment variables

export const API_CONFIG = {
  // MetalsAPI Configuration
  METALS_API: {
    key: process.env.EXPO_PUBLIC_METALS_API_KEY || 'YOUR_METALS_API_KEY_HERE',
    baseUrl: 'https://metals-api.com/api/latest',
    freeTierLimit: 100, // requests per month
    updateInterval: 30000, // 30 seconds (to respect rate limits)
  },
  
  // Alpha Vantage Configuration (Alternative)
  ALPHA_VANTAGE: {
    key: process.env.EXPO_PUBLIC_ALPHA_VANTAGE_KEY || 'NHHVSQ13AZ385ZM2',
    baseUrl: 'https://www.alphavantage.co/query',
    freeTierLimit: 500, // requests per day
    updateInterval: 60000, // 1 minute
  },
};

// Check if API keys are configured
export const isMetalsAPIConfigured = () => {
  return API_CONFIG.METALS_API.key !== 'YOUR_METALS_API_KEY_HERE';
};

export const isAlphaVantageConfigured = () => {
  return API_CONFIG.ALPHA_VANTAGE.key !== 'YOUR_ALPHA_VANTAGE_KEY_HERE';
};

// Get the best available API configuration
export const getBestAPIConfig = () => {
  if (isMetalsAPIConfigured()) {
    return {
      provider: 'metalsapi',
      config: API_CONFIG.METALS_API,
    };
  } else if (isAlphaVantageConfigured()) {
    return {
      provider: 'alphavantage',
      config: API_CONFIG.ALPHA_VANTAGE,
    };
  } else {
    return {
      provider: 'fallback',
      config: null,
    };
  }
};
