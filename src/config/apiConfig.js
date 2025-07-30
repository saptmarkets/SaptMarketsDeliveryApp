// API Configuration for SaptMarkets Delivery App
import { CURRENT_CONFIG, API_ENDPOINTS } from './environment';

// ===============================================
// ENVIRONMENT CONFIGURATION
// ===============================================
// The configuration is now managed through the environment.js file
// This provides better environment management and security

// Export the current configuration
export const API_BASE_URL = CURRENT_CONFIG.API_BASE_URL;
export const SOCKET_URL = CURRENT_CONFIG.SOCKET_URL;
export const IMAGE_BASE_URL = CURRENT_CONFIG.IMAGE_BASE_URL;

// ===============================================
// ENVIRONMENT-SPECIFIC SETUP INSTRUCTIONS
// ===============================================

// For Android Emulator (default)
// Update app.json extra section:
// "EXPO_PUBLIC_API_BASE_URL": "http://10.0.2.2:5055"

// For Physical Android Device
// Update app.json extra section:
// "EXPO_PUBLIC_API_BASE_URL": "http://YOUR_COMPUTER_IP:5055"

// For iOS Simulator
// Update app.json extra section:
// "EXPO_PUBLIC_API_BASE_URL": "http://localhost:5055"

// For Render Backend (Current Setup)
// Update app.json extra section:
// "EXPO_PUBLIC_API_BASE_URL": "https://e-commerce-backend-l0s0.onrender.com/api"

// ===============================================
// 🚨 IMPORTANT: FOR PHYSICAL DEVICES
// ===============================================
// If you're testing on a physical device and getting connection errors:
// 1. Find your computer's IP address:
//    - Windows: Run 'ipconfig' in cmd, look for IPv4 Address
//    - Mac/Linux: Run 'ifconfig' in terminal, look for inet address
// 2. Update the EXPO_PUBLIC_API_BASE_URL in app.json
// 3. Make sure your phone and computer are on the same WiFi network
// 4. Restart the Expo development server

// ===============================================
// API ENDPOINTS FOR MOBILE DELIVERY APP
// ===============================================
export { API_ENDPOINTS };

// ===============================================
// TEST CREDENTIALS (For Development Only)
// ===============================================
// Driver Account:
// Email: driver@saptmarkets.com
// Password: password123

// ===============================================
// ENVIRONMENT VARIABLES USAGE
// ===============================================
// To change environment variables:
// 1. Update the values in app.json under "extra" section
// 2. Restart the Expo development server
// 3. Rebuild the app if needed

// Example for production:
// "EXPO_PUBLIC_API_BASE_URL": "https://api.saptmarkets.com",
// "EXPO_PUBLIC_ENV": "production" 
