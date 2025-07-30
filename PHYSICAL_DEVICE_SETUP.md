# 📱 Physical Android Device Setup Guide

## 🚨 Issue: Login works on emulator but fails on physical device

This is a common networking issue when switching from Android emulator to physical device.

## ✅ **Solution Applied**

I've updated your app configuration to use your computer's IP address (`192.168.0.120`) instead of the emulator-only address (`10.0.2.2`).

### **Changes Made:**

1. **API Service Updated** (`src/services/api.ts`)
   - Now uses `192.168.0.120:5055` for Android devices
   - Added connection testing functionality
   - Better error handling and logging

2. **Config Updated** (`src/config/apiConfig.js`)
   - Dynamic IP configuration
   - Support for both emulator and physical devices

3. **Login Screen Enhanced**
   - Added connection status indicator
   - Real-time connection testing
   - Better error messages

## 🚀 **How to Test**

### **Method 1: Use the Fix Script**
```bash
# Run this script (double-click the .bat file)
./fix-android-connection.bat
```

### **Method 2: Manual Steps**
```bash
# 1. Stop any running Metro bundler
Ctrl+C in Metro terminal

# 2. Clean and rebuild
cd SaptMarketsDeliveryApp
npx react-native start --reset-cache
# In another terminal:
npx react-native run-android
```

## 🔧 **Troubleshooting Checklist**

### **1. Check Network Connection**
- [ ] Both phone and computer are on the same WiFi network
- [ ] Phone has internet access
- [ ] Computer's IP is still `192.168.0.120` (run `ipconfig` to verify)

### **2. Check Backend Server**
- [ ] Backend server is running on port 5055
- [ ] Visit `http://192.168.0.120:5055` in your browser
- [ ] Should show "API is running!"

### **3. Check Windows Firewall**
```powershell
# Allow port 5055 through Windows Firewall
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=5055
```

### **4. Check USB Debugging**
```bash
# Check if device is connected
adb devices

# Should show your device like:
# List of devices attached
# ABC123DEF456    device
```

### **5. Check App Connection Status**
- Open the app on your phone
- Look for the connection status indicator at the top
- Tap it to test connection
- Should show "🟢 Connected" if working

## 🐛 **Common Issues & Solutions**

### **Issue: "Network Error" or "Connection Refused"**
**Solution:**
```bash
# Check if backend is running
curl http://192.168.0.120:5055
# or visit in browser: http://192.168.0.120:5055
```

### **Issue: "Timeout" errors**
**Solution:**
- Increase timeout in api.ts (already set to 15 seconds)
- Check WiFi signal strength
- Try using USB tethering

### **Issue: App shows old IP addresses**
**Solution:**
```bash
# Force rebuild the app
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### **Issue: Different computer IP**
If your computer's IP changes, update these files:
1. `src/services/api.ts` - line with `COMPUTER_IP = '192.168.0.120'`
2. `src/config/apiConfig.js` - COMPUTER_IP value

## 📊 **Testing the Connection**

### **1. Browser Test**
Visit: `http://192.168.0.120:5055`
Should show: "API is running!"

### **2. API Test**
Visit: `http://192.168.0.120:5055/api/delivery-personnel/profile`
Should show: JSON error (expected - means API is responding)

### **3. App Test**
1. Open the delivery app
2. Check connection status (top of login screen)
3. Tap connection status to test
4. Try logging in with: `driver@saptmarkets.com` / `driver123`

## 🔍 **Debug Information**

The app now logs detailed information in the console:

```
🌐 API Base URL: http://192.168.0.120:5055/api
📤 API Request: POST /delivery-personnel/login
📥 API Response: 200 /delivery-personnel/login
```

Or if there are errors:
```
❌ API Error: {
  url: '/delivery-personnel/login',
  method: 'post',
  status: 500,
  message: 'Connection refused'
}
```

## 📞 **Need Help?**

If you're still having issues:

1. **Check the connection status** in the app
2. **Send me the error logs** from the React Native console
3. **Verify your computer's IP** with `ipconfig`
4. **Test the backend** by visiting `http://192.168.0.120:5055` in browser

The app should now work on your physical Android device! 🎉 