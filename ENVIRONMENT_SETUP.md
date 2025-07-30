# Environment Configuration Guide for SaptMarkets Delivery App

## 🚀 Overview

This guide explains how to configure environment variables for the SaptMarkets Delivery App using Expo's environment system.

## 📁 Environment Configuration Files

### 1. **Primary Configuration: `app.json`**
The main environment variables are set in the `extra` section of `app.json`:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_BASE_URL": "http://192.168.100.171:5055",
      "EXPO_PUBLIC_SOCKET_URL": "http://192.168.100.171:5055",
      "EXPO_PUBLIC_IMAGE_BASE_URL": "http://192.168.100.171:5055/uploads/",
      "EXPO_PUBLIC_ENV": "development",
      "EXPO_PUBLIC_API_TIMEOUT": "30000",
      "EXPO_PUBLIC_APP_NAME": "SaptMarkets Delivery",
      "EXPO_PUBLIC_APP_VERSION": "1.0.0",
      "EXPO_PUBLIC_ENABLE_LOCATION": "true",
      "EXPO_PUBLIC_ENABLE_CAMERA": "true",
      "EXPO_PUBLIC_ENABLE_NOTIFICATIONS": "true",
      "EXPO_PUBLIC_TEST_EMAIL": "driver@saptmarkets.com",
      "EXPO_PUBLIC_TEST_PASSWORD": "password123"
    }
  }
}
```

### 2. **Environment Logic: `src/config/environment.js`**
This file handles environment variable loading and provides fallbacks.

### 3. **API Configuration: `src/config/apiConfig.js`**
This file imports and exports the environment configuration.

## 🔧 Environment Variables

### **Backend Configuration**
| Variable | Description | Default Value |
|----------|-------------|---------------|
| `EXPO_PUBLIC_API_BASE_URL` | Backend API URL | `http://192.168.100.171:5055` |
| `EXPO_PUBLIC_SOCKET_URL` | WebSocket URL | `http://192.168.100.171:5055` |
| `EXPO_PUBLIC_IMAGE_BASE_URL` | Image uploads URL | `http://192.168.100.171:5055/uploads/` |

### **App Configuration**
| Variable | Description | Default Value |
|----------|-------------|---------------|
| `EXPO_PUBLIC_ENV` | Environment (dev/staging/prod) | `development` |
| `EXPO_PUBLIC_API_TIMEOUT` | API timeout in milliseconds | `30000` |
| `EXPO_PUBLIC_APP_NAME` | App display name | `SaptMarkets Delivery` |
| `EXPO_PUBLIC_APP_VERSION` | App version | `1.0.0` |

### **Feature Flags**
| Variable | Description | Default Value |
|----------|-------------|---------------|
| `EXPO_PUBLIC_ENABLE_LOCATION` | Enable location services | `true` |
| `EXPO_PUBLIC_ENABLE_CAMERA` | Enable camera features | `true` |
| `EXPO_PUBLIC_ENABLE_NOTIFICATIONS` | Enable push notifications | `true` |

### **Test Credentials (Development Only)**
| Variable | Description | Default Value |
|----------|-------------|---------------|
| `EXPO_PUBLIC_TEST_EMAIL` | Test driver email | `driver@saptmarkets.com` |
| `EXPO_PUBLIC_TEST_PASSWORD` | Test driver password | `password123` |

## 🛠️ Setup Instructions

### **Step 1: Configure for Your Environment**

#### **For Development (Local Backend)**
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_BASE_URL": "http://192.168.100.171:5055",
      "EXPO_PUBLIC_ENV": "development"
    }
  }
}
```

#### **For Android Emulator**
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_BASE_URL": "http://10.0.2.2:5055",
      "EXPO_PUBLIC_ENV": "development"
    }
  }
}
```

#### **For iOS Simulator**
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_BASE_URL": "http://localhost:5055",
      "EXPO_PUBLIC_ENV": "development"
    }
  }
}
```

#### **For Production**
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_BASE_URL": "https://api.saptmarkets.com",
      "EXPO_PUBLIC_SOCKET_URL": "https://api.saptmarkets.com",
      "EXPO_PUBLIC_IMAGE_BASE_URL": "https://api.saptmarkets.com/uploads/",
      "EXPO_PUBLIC_ENV": "production"
    }
  }
}
```

### **Step 2: Find Your Computer's IP Address**

#### **Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter.

#### **Mac/Linux:**
```bash
ifconfig
```
Look for "inet" address under your WiFi interface.

### **Step 3: Update Configuration**

1. **Edit `app.json`:**
   ```json
   {
     "expo": {
       "extra": {
         "EXPO_PUBLIC_API_BASE_URL": "http://YOUR_IP_ADDRESS:5055"
       }
     }
   }
   ```

2. **Restart Expo Development Server:**
   ```bash
   npm start
   # or
   expo start --clear
   ```

## 🔄 Environment-Specific Configurations

### **Development Environment**
- Uses local backend
- Debug logging enabled
- Test credentials available

### **Staging Environment**
- Uses staging backend
- Info logging
- Production-like settings

### **Production Environment**
- Uses production backend
- Error logging only
- All security features enabled

## 🚨 Troubleshooting

### **Common Issues**

1. **Connection Refused:**
   - Check if backend server is running
   - Verify IP address is correct
   - Ensure phone and computer are on same network

2. **Environment Variables Not Loading:**
   - Restart Expo development server
   - Clear Metro cache: `expo start --clear`
   - Rebuild app if needed

3. **Wrong Backend URL:**
   - Update `EXPO_PUBLIC_API_BASE_URL` in `app.json`
   - Restart development server
   - Test connection

### **Testing Environment Variables**

Add this to your component to debug:
```javascript
import { CURRENT_CONFIG } from '../config/environment';

console.log('Current Config:', CURRENT_CONFIG);
```

## 📱 Usage in Components

### **Importing Configuration**
```javascript
import { CURRENT_CONFIG, API_ENDPOINTS } from '../config/environment';

// Use configuration
const apiUrl = CURRENT_CONFIG.API_BASE_URL;
const loginEndpoint = API_ENDPOINTS.LOGIN;
```

### **Environment-Specific Logic**
```javascript
import { getCurrentConfig } from '../config/environment';

const config = getCurrentConfig();

if (config.ENV === 'development') {
  // Development-specific code
} else if (config.ENV === 'production') {
  // Production-specific code
}
```

## 🔐 Security Notes

1. **Never commit sensitive data** to version control
2. **Use different configurations** for different environments
3. **Test credentials** should only be used in development
4. **Production URLs** should use HTTPS

## 📋 Checklist

- [ ] Update `app.json` with correct backend URLs
- [ ] Test connection to backend
- [ ] Verify environment variables are loading
- [ ] Test on physical device
- [ ] Test on emulator/simulator
- [ ] Verify all features work with new configuration

---

**Happy Configuring! 🚛⚙️** 