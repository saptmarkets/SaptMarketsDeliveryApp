# APK Build and Installation Guide for SaptMarkets Delivery App

## 🚀 Overview

This guide explains how to build an APK from the Expo delivery app and install it on Android devices.

## 📱 APK Build Process

### **Prerequisites:**

1. **EAS CLI installed:**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Expo account logged in:**
   ```bash
   eas login
   ```

3. **EAS project configured:**
   ```bash
   eas build:configure
   ```

### **Step 1: Build APK**

#### **Option A: Build APK for Testing (Recommended)**
```bash
# Build APK for testing
eas build --platform android --profile preview
```

#### **Option B: Build APK for Production**
```bash
# Build APK for production
eas build --platform android --profile production
```

### **Step 2: Download APK**

1. **Wait for build to complete** (usually 10-15 minutes)
2. **Download the APK** from the EAS dashboard or via email
3. **APK will be named:** `SaptMarketsDeliveryApp-preview.apk` or `SaptMarketsDeliveryApp-production.apk`

## 📲 Installation on Android Devices

### **Step 1: Enable Unknown Sources**

1. **Go to Settings** → **Security** (or **Privacy**)
2. **Enable "Unknown Sources"** or **"Install unknown apps"**
3. **Allow installation from file managers**

### **Step 2: Install APK**

1. **Copy APK to device** (via USB, email, or cloud storage)
2. **Open file manager** and locate the APK
3. **Tap the APK file** to install
4. **Follow installation prompts**
5. **Open the app** from your app drawer

## 🔧 Configuration for Different Scenarios

### **For Testing on Physical Devices:**

The current configuration in `app.json` is already set for production backend:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_BASE_URL": "https://e-commerce-backend-l0s0.onrender.com/api",
      "EXPO_PUBLIC_SOCKET_URL": "https://e-commerce-backend-l0s0.onrender.com",
      "EXPO_PUBLIC_IMAGE_BASE_URL": "https://e-commerce-backend-l0s0.onrender.com/uploads/"
    }
  }
}
```

### **For Local Testing (if needed):**

If you want to test with a local backend, update `app.json`:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_BASE_URL": "http://YOUR_LOCAL_IP:5055/api",
      "EXPO_PUBLIC_SOCKET_URL": "http://YOUR_LOCAL_IP:5055",
      "EXPO_PUBLIC_IMAGE_BASE_URL": "http://YOUR_LOCAL_IP:5055/uploads/"
    }
  }
}
```

## ✅ **Will It Work?**

### **✅ YES, it will work because:**

1. **Backend is on Render** - Publicly accessible HTTPS URL
2. **No local dependencies** - All APIs are cloud-hosted
3. **Proper environment configuration** - Set up for production backend
4. **Expo handles permissions** - Camera, location, notifications configured

### **🔧 What You Need:**

1. **Internet connection** on the Android device
2. **Backend running** on Render (already configured)
3. **Proper permissions** (handled by Expo)

## 🚨 **Important Considerations**

### **1. Backend Availability**
- ✅ Your backend is on Render (publicly accessible)
- ✅ HTTPS URLs work on all devices
- ✅ No local network requirements

### **2. Permissions**
The app requires these permissions (handled by Expo):
- 📍 **Location** - For delivery tracking
- 📷 **Camera** - For order photos
- 📱 **Notifications** - For order updates
- 🌐 **Internet** - For API calls

### **3. Device Compatibility**
- ✅ **Android 5.0+** (API level 21+)
- ✅ **Most modern Android devices**
- ✅ **Tablets and phones**

## 🛠️ **Build Commands**

### **Quick Build (Development):**
```bash
# Build APK for testing
eas build --platform android --profile preview --local
```

### **Production Build:**
```bash
# Build APK for production
eas build --platform android --profile production
```

### **Build with Custom Configuration:**
```bash
# Build with specific environment
eas build --platform android --profile production --non-interactive
```

## 📋 **Installation Checklist**

### **Before Building:**
- [ ] EAS CLI installed
- [ ] Expo account logged in
- [ ] Backend URLs configured correctly
- [ ] All dependencies installed

### **After Building:**
- [ ] APK downloaded successfully
- [ ] APK transferred to Android device
- [ ] Unknown sources enabled on device
- [ ] APK installed successfully
- [ ] App opens without crashes
- [ ] Can connect to backend APIs
- [ ] All features working (login, orders, etc.)

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **APK won't install:**
   - Enable "Unknown Sources" in device settings
   - Check if APK is corrupted (re-download)

2. **App crashes on startup:**
   - Check internet connection
   - Verify backend is running on Render
   - Check console logs for errors

3. **Can't connect to backend:**
   - Verify backend URL in `app.json`
   - Check if Render service is active
   - Test API endpoints manually

4. **Permissions not working:**
   - Grant permissions manually in device settings
   - Check if permissions are enabled in app settings

## 📱 **Testing the Installation**

### **Test Steps:**

1. **Install APK** on Android device
2. **Open the app**
3. **Test login** with driver credentials
4. **Check if orders load**
5. **Test camera functionality**
6. **Test location services**
7. **Verify notifications work**

### **Expected Behavior:**
- ✅ App opens without errors
- ✅ Login screen appears
- ✅ Can log in with test credentials
- ✅ Orders list loads
- ✅ Camera and location work
- ✅ Backend API calls succeed

## 🎯 **Summary**

**YES, the APK will work on any Android device** because:

1. ✅ **Backend is cloud-hosted** (Render)
2. ✅ **HTTPS URLs** work everywhere
3. ✅ **No local dependencies**
4. ✅ **Proper environment configuration**
5. ✅ **Expo handles all permissions**

**Just build the APK and install it!** 🚛📱

---

**Ready to build? Run:**
```bash
eas build --platform android --profile preview
``` 