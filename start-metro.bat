@echo off
echo 🚀 Starting Metro Bundler for Both Emulator and Physical Device
echo.

echo ⏹️  Stopping any existing Metro processes...
taskkill /f /im node.exe 2>nul

echo 🔧 Setting up port forwarding for physical device...
adb reverse tcp:8081 tcp:8081

echo ⚡ Starting Metro bundler on all interfaces...
echo Metro will be available at:
echo - For Emulator: localhost:8081
echo - For Physical Device: via USB forwarding
echo.

start "Metro Bundler" cmd /c "npx react-native start --host 0.0.0.0 --port 8081 && pause"

echo ✅ Metro bundler started in new window!
echo.
echo Now on your devices:
echo 1. Shake phone OR press Ctrl+M in emulator
echo 2. Tap "Reload" 
echo.
pause 