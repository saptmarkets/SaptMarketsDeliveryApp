@echo off
echo 🚀 Quick Android Fix - SaptMarkets Delivery App
echo.

echo ⏹️  Step 1: Stop all processes
taskkill /f /im node.exe 2>nul
taskkill /f /im java.exe 2>nul

echo ⚡ Step 2: Setup port forwarding
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5055 tcp:5055

echo 🧹 Step 3: Clean cache
npx react-native start --reset-cache & timeout /t 2 & taskkill /f /im node.exe 2>nul

echo 📱 Step 4: Start Metro bundler
start "Metro" cmd /c "npx react-native start && pause"

echo ⏳ Waiting for Metro...
timeout /t 5

echo 🔨 Step 5: Build and run Android
npx react-native run-android

echo.
echo ✅ Done! Check your Android emulator for the app.
echo If it doesn't work, try the full diagnostic script: fix-android-issues.bat
pause 