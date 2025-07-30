// API Configuration for SaptMarkets Delivery App

// ===============================================
// ENVIRONMENT CONFIGURATION
// ===============================================
// Uncomment the appropriate line based on your testing setup:

// For Android Emulator (default)
// export const API_BASE_URL = 'http://10.0.2.2:5055';  // Removed /api since it's included in endpoints

// For Physical Android Device (replace with your computer's IP)
export const API_BASE_URL = 'http://192.168.100.171:5055';

// For iOS Simulator
// export const API_BASE_URL = 'http://localhost:5055';

// ===============================================
// 🚨 IMPORTANT: FOR PHYSICAL DEVICES
// ===============================================
// If you're testing on a physical device and getting connection errors:
// 1. Find your computer's IP address:
//    - Windows: Run 'ipconfig' in cmd, look for IPv4 Address
//    - Mac/Linux: Run 'ifconfig' in terminal, look for inet address
// 2. Replace 192.168.1.100 above with your actual IP
// 3. Make sure your phone and computer are on the same WiFi network
// 4. Uncomment the physical device line and comment out the emulator line

// ===============================================
// SOCKET & IMAGE URLS
// ===============================================
export const SOCKET_URL = 'http://192.168.100.171:5055';
export const IMAGE_BASE_URL = 'http://192.168.100.171:5055/uploads/';

// ===============================================
// API ENDPOINTS FOR MOBILE DELIVERY APP
// ===============================================
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/mobile-delivery/login',  // Updated to match backend
  LOGOUT: '/api/mobile-delivery/logout',
  PROFILE: '/api/mobile-delivery/profile',

  // Shift Management
  CLOCK_IN: '/api/mobile-delivery/clock-in',
  CLOCK_OUT: '/api/mobile-delivery/clock-out',
  BREAK_IN: '/api/mobile-delivery/break-in',
  BREAK_OUT: '/api/mobile-delivery/break-out',
  
  // Orders
  GET_ORDERS: '/api/mobile-delivery/orders',
  GET_ORDER_DETAILS: '/api/mobile-delivery/orders', // Appends /:id
  GET_ASSIGNED_ORDERS: '/api/mobile-delivery/orders', // Uses same endpoint but filters on client side
  
  // Order Actions - FIXED ENDPOINTS
  TOGGLE_PRODUCT: '/api/mobile-delivery/orders', // Will append /:orderId/toggle-product
  MARK_OUT_FOR_DELIVERY: '/api/mobile-delivery/orders', // Will append /:orderId/out-for-delivery
  COMPLETE_DELIVERY: '/api/mobile-delivery/orders', // Will append /:orderId/complete
  ACCEPT_ORDER: '/api/mobile-delivery/orders', // Will append /:orderId/accept
  
  // Billing
  GENERATE_BILL: '/api/mobile-delivery/orders', // Will append /:orderId/bill
  PRINT_BILL: '/api/mobile-delivery/orders', // Will append /:orderId/print-bill

  // Earnings
  GET_TODAY_EARNINGS: '/api/mobile-delivery/earnings/today',
  GET_COMPLETED_ORDERS: '/api/mobile-delivery/orders/completed',
  
  // Location
  UPDATE_LOCATION: '/api/mobile-delivery/location/update'
}; 

// ===============================================
// TEST CREDENTIALS (For Development Only)
// ===============================================
// Driver Account:
// Email: driver@saptmarkets.com
// Password: password123 
