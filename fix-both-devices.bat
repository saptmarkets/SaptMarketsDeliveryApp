@echo off
echo 🔧 Complete Fix for Both Emulator and Physical Device
echo.

echo ⏹️  Stopping all Metro processes...
taskkill /f /im node.exe 2>nul

echo 📱 Setting up device connections...
adb reverse tcp:8081 tcp:8081

echo ⚡ Starting Metro bundler...
start "Metro Bundler" cmd /c "npx react-native start --reset-cache --host 0.0.0.0 --port 8081"

echo ⏳ Waiting for Metro to start...
timeout /t 5

echo 🔄 Reloading both devices...
adb shell input keyevent 82
timeout /t 2
adb shell am broadcast -a "com.facebook.react.bridge.RELOAD"

echo.
echo ✅ Fix completed! 
echo.
echo Metro bundler is running in separate window
echo Both devices should reload automatically
echo.
echo If manual reload needed:
echo - Physical device: Shake phone, tap "Reload"
echo - Emulator: Press Ctrl+M, select "Reload"
echo.
pause 