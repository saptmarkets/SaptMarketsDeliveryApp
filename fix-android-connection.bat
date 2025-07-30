@echo off
echo 🚀 Fixing Android Connection for Physical Device
echo.
echo Current computer IP: 192.168.0.120
echo Backend server should be running on: http://192.168.0.120:5055
echo.

echo ⏹️  Stopping Metro bundler...
taskkill /f /im node.exe 2>nul

echo 🧹 Cleaning cache...
call npx react-native start --reset-cache --port 8083 & timeout /t 3 & taskkill /f /im node.exe

echo 🔧 Cleaning build...
cd android
call gradlew clean
cd ..

echo ⚡ Starting Metro bundler...
start "Metro" cmd /c "npx react-native start --port 8083"

echo ⏳ Waiting for Metro to start...
timeout /t 5

echo 📱 Building and running on Android device...
call npx react-native run-android --port 8083

echo.
echo ✅ App should now be running on your physical device!
echo.
echo If you still have issues:
echo 1. Make sure backend server is running on port 5055
echo 2. Make sure your phone and computer are on the same WiFi network
echo 3. Check Windows Firewall allows port 5055
echo 4. Try running: adb devices (to check USB connection)
echo.
pause 