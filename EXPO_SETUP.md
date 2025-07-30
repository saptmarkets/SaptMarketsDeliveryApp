# SaptMarkets Delivery App - Expo Setup Guide

## 🚀 Overview

This guide will help you set up the SaptMarkets Delivery App for Expo development and deployment.

## 📋 Prerequisites

- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g @expo/cli`
- EAS CLI installed: `npm install -g eas-cli`
- Expo Go app installed on your device for testing

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Expo Project

1. **Login to Expo:**
   ```bash
   expo login
   ```

2. **Create/Configure EAS Project:**
   ```bash
   eas build:configure
   ```

3. **Update app.json:**
   - Replace `"your-expo-project-id"` with your actual Expo project ID
   - Update the `owner` field to your Expo username

### 3. Local Development

#### Start Development Server
```bash
npm start
# or
expo start
```

#### Run on Device
- Scan QR code with Expo Go app
- Or run: `expo start --tunnel` for remote access

#### Run on Simulator
```bash
# iOS
npm run ios
# Android
npm run android
```

### 4. Building the App

#### Development Build
```bash
eas build --profile development --platform all
```

#### Preview Build
```bash
eas build --profile preview --platform all
```

#### Production Build
```bash
eas build --profile production --platform all
```

### 5. Submitting to App Stores

#### Android (Google Play Store)
```bash
eas submit --platform android
```

#### iOS (App Store)
```bash
eas submit --platform ios
```

## 🔧 Configuration Files

### app.json
- App metadata and configuration
- Permissions and plugins
- Platform-specific settings

### eas.json
- Build profiles (development, preview, production)
- Platform-specific build settings
- Submit configuration

### package.json
- Dependencies and scripts
- Expo SDK 50 configuration
- Build and submit scripts

## 📱 Features

### Core Features
- ✅ Driver authentication
- ✅ Order management
- ✅ Delivery tracking
- ✅ Product checklist
- ✅ Earnings tracking
- ✅ Profile management

### Technical Features
- ✅ Expo SDK 50
- ✅ React Navigation
- ✅ AsyncStorage for data persistence
- ✅ Camera integration
- ✅ Location services
- ✅ Vector icons

## 🚨 Troubleshooting

### Common Issues

1. **Metro bundler issues:**
   ```bash
   npx expo start --clear
   ```

2. **Build failures:**
   ```bash
   eas build --clear-cache
   ```

3. **Dependency issues:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Development Tips

1. **Use Expo Go for rapid development**
2. **Use development builds for native features**
3. **Test on physical devices for best results**
4. **Monitor EAS build logs for issues**

## 📦 Deployment Checklist

- [ ] Update app.json with correct project ID
- [ ] Configure EAS build profiles
- [ ] Set up app store credentials
- [ ] Test on physical devices
- [ ] Create production build
- [ ] Submit to app stores

## 🔗 Useful Commands

```bash
# Start development
npm start

# Build for development
eas build --profile development

# Build for production
eas build --profile production

# Submit to stores
eas submit

# View build status
eas build:list

# Update app
eas update
```

## 📞 Support

For issues or questions:
1. Check Expo documentation
2. Review EAS build logs
3. Test on different devices
4. Verify configuration files

---

**Happy Coding! 🚛📱** 