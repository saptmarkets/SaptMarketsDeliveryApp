# 🚀 Android Studio Setup Guide for SaptMarkets Delivery App

## 📋 Prerequisites

1. **Android Studio** (Latest version)
2. **Java Development Kit (JDK)** - Version 17 or higher
3. **Android SDK** - API Level 35 (Android 15)
4. **Node.js** - Version 18 or higher (already installed)

## 🔧 Step-by-Step Setup

### 1. Open Project in Android Studio

1. **Launch Android Studio**
2. **Open Existing Project**
   - Click "Open an Existing Project"
   - Navigate to: `C:\Users\Asad\Desktop\projects\e commerce\SaptMarketsDeliveryApp\android`
   - Select the `android` folder and click "OK"

### 2. Configure Android SDK

1. **Open SDK Manager**
   - Go to `File` → `Settings` → `Appearance & Behavior` → `System Settings` → `Android SDK`

2. **Install Required SDK Components**
   - **SDK Platforms:**
     - ✅ Android 15.0 (API 35) - Target SDK
     - ✅ Android 7.0 (API 24) - Minimum SDK
   
   - **SDK Tools:**
     - ✅ Android SDK Build-Tools 35.0.0
     - ✅ Android SDK Platform-Tools
     - ✅ Android SDK Tools
     - ✅ NDK (Side by side) - Version 27.1.12297006
     - ✅ CMake
     - ✅ Android SDK Command-line Tools

### 3. Configure Project Settings

1. **Sync Project with Gradle Files**
   - Click the "Sync Now" button when prompted
   - Or go to `File` → `Sync Project with Gradle Files`

2. **Verify Build Configuration**
   - Open `android/app/build.gradle`
   - Ensure these settings are correct:
     ```gradle
     compileSdkVersion = 35
     targetSdkVersion = 35
     minSdkVersion = 24
     ```

### 4. Configure Local Properties

The `local.properties` file should already be configured with your SDK path:
```properties
sdk.dir=C:/Users/Asad/AppData/Local/Android/Sdk
```

### 5. Build Configuration

1. **Clean and Rebuild**
   - Go to `Build` → `Clean Project`
   - Then `Build` → `Rebuild Project`

2. **Check for Errors**
   - Open the "Build" tab at the bottom
   - Resolve any dependency or configuration issues

## 🚀 Running the App

### Option 1: From Android Studio
1. **Connect Device/Emulator**
   - Connect your Android device via USB (with USB Debugging enabled)
   - Or start an Android Emulator

2. **Run the App**
   - Click the green "Run" button (▶️)
   - Select your target device
   - The app will build and install automatically

### Option 2: From Command Line
```bash
# Start Metro bundler
npx react-native start

# In another terminal, run Android
npx react-native run-android
```

## 🔧 Troubleshooting

### Common Issues and Solutions

1. **Gradle Sync Failed**
   ```bash
   # Clean Gradle cache
   cd android
   ./gradlew clean
   cd ..
   ```

2. **SDK Not Found**
   - Verify `local.properties` has correct SDK path
   - Check Android Studio SDK Manager

3. **Build Tools Version Mismatch**
   - Update Build Tools in SDK Manager
   - Ensure version matches `build.gradle`

4. **NDK Issues**
   - Install NDK version 27.1.12297006
   - Or comment out NDK in `build.gradle` temporarily

5. **Vector Icons Not Loading**
   - The project already includes vector icons configuration
   - Ensure fonts are properly linked

## 📱 App Configuration

### Current App Settings
- **Package Name**: `com.saptmarketsdeliveryapp`
- **App Name**: SaptMarkets Delivery App
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 35 (Android 15.0)
- **Permissions**: Internet access enabled

### Network Configuration
- Cleartext traffic enabled for development
- Network security config included
- Backend connection to `localhost:5055`

## 🎯 Next Steps

1. **Test the Build**
   - Run the app on a device/emulator
   - Verify the app launches without errors

2. **Connect to Backend**
   - Ensure your backend server is running on port 5055
   - Test login functionality

3. **Development Workflow**
   - Use Android Studio for native Android development
   - Use VS Code/Cursor for React Native code
   - Metro bundler handles JavaScript changes

## 📞 Support

If you encounter issues:
1. Check the Android Studio logs
2. Verify all SDK components are installed
3. Ensure Gradle sync completes successfully
4. Check that your device/emulator is properly connected

## 🎉 Success Indicators

✅ Project opens without errors in Android Studio  
✅ Gradle sync completes successfully  
✅ App builds and installs on device/emulator  
✅ Metro bundler connects properly  
✅ App launches and shows the login screen 