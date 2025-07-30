import Constants from 'expo-constants';

// ===============================================
// ENVIRONMENT CONFIGURATION
// ===============================================

// Get environment variables from Expo Constants
const getEnvVar = (key, defaultValue = '') => {
  return Constants.expoConfig?.extra?.[key] || 
         process.env[key] || 
         defaultValue;
};

// Environment Configuration
export const ENV_CONFIG = {
  // Backend API URLs
  API_BASE_URL: getEnvVar('EXPO_PUBLIC_API_BASE_URL', 'https://e-commerce-backend-l0s0.onrender.com/api'),
  SOCKET_URL: getEnvVar('EXPO_PUBLIC_SOCKET_URL', 'https://e-commerce-backend-l0s0.onrender.com'),
  IMAGE_BASE_URL: getEnvVar('EXPO_PUBLIC_IMAGE_BASE_URL', 'https://e-commerce-backend-l0s0.onrender.com/uploads/'),
  
  // Environment
  ENV: getEnvVar('EXPO_PUBLIC_ENV', 'development'),
  
  // API Configuration
  API_TIMEOUT: parseInt(getEnvVar('EXPO_PUBLIC_API_TIMEOUT', '30000')),
  
  // App Configuration
  APP_NAME: getEnvVar('EXPO_PUBLIC_APP_NAME', 'SaptMarkets Delivery'),
  APP_VERSION: getEnvVar('EXPO_PUBLIC_APP_VERSION', '1.0.0'),
  
  // Feature Flags
  ENABLE_LOCATION: getEnvVar('EXPO_PUBLIC_ENABLE_LOCATION', 'true') === 'true',
  ENABLE_CAMERA: getEnvVar('EXPO_PUBLIC_ENABLE_CAMERA', 'true') === 'true',
  ENABLE_NOTIFICATIONS: getEnvVar('EXPO_PUBLIC_ENABLE_NOTIFICATIONS', 'true') === 'true',
  
  // Test Credentials (Development Only)
  TEST_EMAIL: getEnvVar('EXPO_PUBLIC_TEST_EMAIL', 'driver@saptmarkets.com'),
  TEST_PASSWORD: getEnvVar('EXPO_PUBLIC_TEST_PASSWORD', 'password123'),
};

// ===============================================
// ENVIRONMENT-SPECIFIC CONFIGURATIONS
// ===============================================

// Development Environment
export const DEV_CONFIG = {
  API_BASE_URL: 'https://e-commerce-backend-l0s0.onrender.com/api',
  SOCKET_URL: 'https://e-commerce-backend-l0s0.onrender.com',
  IMAGE_BASE_URL: 'https://e-commerce-backend-l0s0.onrender.com/uploads/',
  LOG_LEVEL: 'debug',
};

// Staging Environment
export const STAGING_CONFIG = {
  API_BASE_URL: 'https://staging-api.saptmarkets.com',
  SOCKET_URL: 'https://staging-api.saptmarkets.com',
  IMAGE_BASE_URL: 'https://staging-api.saptmarkets.com/uploads/',
  LOG_LEVEL: 'info',
};

// Production Environment
export const PROD_CONFIG = {
  API_BASE_URL: 'https://api.saptmarkets.com',
  SOCKET_URL: 'https://api.saptmarkets.com',
  IMAGE_BASE_URL: 'https://api.saptmarkets.com/uploads/',
  LOG_LEVEL: 'error',
};

// ===============================================
// GET CURRENT ENVIRONMENT CONFIG
// ===============================================

export const getCurrentConfig = () => {
  const env = ENV_CONFIG.ENV.toLowerCase();
  
  switch (env) {
    case 'production':
      return { ...PROD_CONFIG, ...ENV_CONFIG };
    case 'staging':
      return { ...STAGING_CONFIG, ...ENV_CONFIG };
    case 'development':
    default:
      return { ...DEV_CONFIG, ...ENV_CONFIG };
  }
};

// Export current configuration
export const CURRENT_CONFIG = getCurrentConfig();

// ===============================================
// API ENDPOINTS (Same as before)
// ===============================================

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/mobile-delivery/login',
  LOGOUT: '/api/mobile-delivery/logout',
  PROFILE: '/api/mobile-delivery/profile',

  // Shift Management
  CLOCK_IN: '/api/mobile-delivery/clock-in',
  CLOCK_OUT: '/api/mobile-delivery/clock-out',
  BREAK_IN: '/api/mobile-delivery/break-in',
  BREAK_OUT: '/api/mobile-delivery/break-out',
  
  // Orders
  GET_ORDERS: '/api/mobile-delivery/orders',
  GET_ORDER_DETAILS: '/api/mobile-delivery/orders',
  GET_ASSIGNED_ORDERS: '/api/mobile-delivery/orders',
  
  // Order Actions
  TOGGLE_PRODUCT: '/api/mobile-delivery/orders',
  MARK_OUT_FOR_DELIVERY: '/api/mobile-delivery/orders',
  COMPLETE_DELIVERY: '/api/mobile-delivery/orders',
  ACCEPT_ORDER: '/api/mobile-delivery/orders',
  
  // Billing
  GENERATE_BILL: '/api/mobile-delivery/orders',
  PRINT_BILL: '/api/mobile-delivery/orders',

  // Earnings
  GET_TODAY_EARNINGS: '/api/mobile-delivery/earnings/today',
  GET_COMPLETED_ORDERS: '/api/mobile-delivery/orders/completed',
  
  // Location
  UPDATE_LOCATION: '/api/mobile-delivery/location/update'
}; 