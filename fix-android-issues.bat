@echo off
echo ====================================================
echo 🔧 Android Delivery App Diagnostic and Fix Script
echo ====================================================
echo.

echo 📋 Step 1: Checking System Status
echo ====================================================

echo 🔍 Checking ADB devices...
adb devices
echo.

echo 🔍 Checking running processes...
echo Metro bundler processes:
tasklist /fi "imagename eq node.exe" 2>nul | findstr node.exe
echo.
echo Java/Gradle processes:
tasklist /fi "imagename eq java.exe" 2>nul | findstr java.exe
echo.

echo 📋 Step 2: Cleaning Up Processes
echo ====================================================

echo 🧹 Stopping Metro bundler...
taskkill /f /im node.exe 2>nul
echo.

echo 🧹 Stopping Gradle daemon...
call gradlew --stop 2>nul
echo.

echo 📋 Step 3: Checking Backend Connection
echo ====================================================

echo 🌐 Testing backend connection (should show API running)...
curl -s http://localhost:5055 || echo ❌ Backend not responding on localhost:5055
echo.

echo 🌐 Testing emulator connection (10.0.2.2:5055)...
curl -s http://10.0.2.2:5055 2>nul || echo ⚠️  Cannot test 10.0.2.2 from host (normal)
echo.

echo 📋 Step 4: Android Build Cleanup
echo ====================================================

echo 🧹 Cleaning React Native cache...
npx react-native start --reset-cache & timeout /t 3 & taskkill /f /im node.exe 2>nul
echo.

echo 🧹 Cleaning Android build cache...
cd android
call gradlew clean
cd ..
echo.

echo 🧹 Cleaning npm cache...
npm start --reset-cache --verbose 2>nul & timeout /t 2 & taskkill /f /im node.exe 2>nul
echo.

echo 📋 Step 5: Setting up Port Forwarding
echo ====================================================

echo 🔧 Setting up ADB port forwarding...
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5055 tcp:5055
echo Port forwarding setup complete
echo.

echo 📋 Step 6: Starting Services
echo ====================================================

echo ⚡ Starting Metro bundler...
start "Metro Bundler" cmd /c "npx react-native start --port 8081 --host 0.0.0.0 && pause"

echo ⏳ Waiting for Metro to initialize...
timeout /t 8

echo 📱 Building and installing Android app...
echo This may take a few minutes...
echo.

npx react-native run-android --verbose

echo.
echo ====================================================
echo 🎯 Diagnostic Complete!
echo ====================================================
echo.

if %ERRORLEVEL% EQU 0 (
    echo ✅ SUCCESS: App should be running on your Android device!
    echo.
    echo 📱 Next steps:
    echo 1. Check your Android emulator for the SaptMarkets app
    echo 2. Try logging in with: driver@saptmarkets.com / driver123
    echo 3. If login fails, check the Metro bundler window for errors
) else (
    echo ❌ BUILD FAILED: There was an issue with the Android build
    echo.
    echo 🔍 Troubleshooting steps:
    echo 1. Check the error messages above
    echo 2. Make sure Android emulator is running
    echo 3. Try running: adb devices (should show emulator-5554)
    echo 4. Make sure Java/Android SDK is properly installed
    echo 5. Try running the commands manually:
    echo    - npx react-native start
    echo    - npx react-native run-android (in a new terminal)
)

echo.
echo 📊 Current Status:
echo - Backend: http://localhost:5055 (should be running)
echo - Metro: http://localhost:8081 (check Metro window)
echo - Android: emulator-5554 (check with 'adb devices')
echo.

echo 🆘 If you still have issues:
echo 1. Make sure your backend server is running on port 5055
echo 2. Check Windows Firewall isn't blocking ports 5055 or 8081
echo 3. Try restarting the Android emulator
echo 4. Check Android Studio for any SDK issues
echo.

pause 