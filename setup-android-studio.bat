@echo off
echo ====================================================
echo 🚀 Android Studio Setup for SaptMarkets Delivery App
echo ====================================================
echo.

echo 📋 Step 1: Checking Prerequisites
echo ====================================================

echo 🔍 Checking Java installation...
java -version 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Java not found. Please install JDK 17 or higher
    echo Download from: https://adoptium.net/
    pause
    exit /b 1
) else (
    echo ✅ Java is installed
)

echo.
echo 🔍 Checking Android SDK...
if exist "C:\Users\Asad\AppData\Local\Android\Sdk" (
    echo ✅ Android SDK found at: C:\Users\Asad\AppData\Local\Android\Sdk
) else (
    echo ❌ Android SDK not found
    echo Please install Android Studio and Android SDK
    pause
    exit /b 1
)

echo.
echo 🔍 Checking Node.js...
node --version 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
)

echo.
echo 📋 Step 2: Verifying Project Structure
echo ====================================================

echo 🔍 Checking Android project files...
if exist "android\build.gradle" (
    echo ✅ Android build.gradle found
) else (
    echo ❌ Android build.gradle not found
    pause
    exit /b 1
)

if exist "android\app\build.gradle" (
    echo ✅ App build.gradle found
) else (
    echo ❌ App build.gradle not found
    pause
    exit /b 1
)

if exist "android\local.properties" (
    echo ✅ local.properties found
) else (
    echo ❌ local.properties not found
    pause
    exit /b 1
)

echo.
echo 📋 Step 3: Cleaning and Preparing Build
echo ====================================================

echo 🧹 Cleaning previous builds...
cd android
call gradlew clean
cd ..

echo.
echo 📋 Step 4: Installing Dependencies
echo ====================================================

echo 📦 Installing npm dependencies...
npm install

echo.
echo 📋 Step 5: Setting up Metro
echo ====================================================

echo 🔧 Setting up Metro bundler...
echo Starting Metro bundler (will run in background)...
start "Metro Bundler" cmd /c "npx react-native start --reset-cache && pause"

echo ⏳ Waiting for Metro to initialize...
timeout /t 5

echo.
echo ====================================================
echo ✅ Setup Complete!
echo ====================================================
echo.
echo 📱 Next Steps:
echo 1. Open Android Studio
echo 2. Open the project: SaptMarketsDeliveryApp\android
echo 3. Wait for Gradle sync to complete
echo 4. Connect your Android device or start an emulator
echo 5. Click the Run button (green play button)
echo.
echo 🔧 Alternative: Run from command line
echo npx react-native run-android
echo.
echo 📊 Project Details:
echo - Package: com.saptmarketsdeliveryapp
echo - Min SDK: 24 (Android 7.0)
echo - Target SDK: 35 (Android 15.0)
echo - Metro: http://localhost:8081
echo - Backend: http://localhost:5055
echo.

echo 🆘 If you encounter issues:
echo 1. Check Android Studio logs
echo 2. Verify SDK components are installed
echo 3. Ensure device/emulator is connected
echo 4. Check Metro bundler is running
echo.

pause 