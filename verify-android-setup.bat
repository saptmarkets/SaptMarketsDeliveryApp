@echo off
echo ====================================================
echo 🔍 Android Studio Setup Verification
echo ====================================================
echo.

echo 📋 Step 1: Checking Android Project Configuration
echo ====================================================

echo 🔍 Verifying build.gradle configuration...
findstr "compileSdkVersion = 35" android\build.gradle >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ compileSdkVersion = 35
) else (
    echo ❌ compileSdkVersion not set to 35
)

findstr "targetSdkVersion = 35" android\build.gradle >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ targetSdkVersion = 35
) else (
    echo ❌ targetSdkVersion not set to 35
)

findstr "minSdkVersion = 24" android\build.gradle >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ minSdkVersion = 24
) else (
    echo ❌ minSdkVersion not set to 24
)

echo.
echo 📋 Step 2: Checking Dependencies
echo ====================================================

echo 🔍 Checking if node_modules exists...
if exist "node_modules" (
    echo ✅ node_modules found
) else (
    echo ❌ node_modules not found - run 'npm install'
)

echo 🔍 Checking if babel packages are installed...
findstr "@babel/plugin-transform-runtime" package.json >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ @babel/plugin-transform-runtime installed
) else (
    echo ❌ @babel/plugin-transform-runtime missing
)

findstr "regenerator-runtime" package.json >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ regenerator-runtime installed
) else (
    echo ❌ regenerator-runtime missing
)

echo.
echo 📋 Step 3: Checking Android SDK
echo ====================================================

echo 🔍 Checking Android SDK path...
findstr "sdk.dir=C:/Users/Asad/AppData/Local/Android/Sdk" android\local.properties >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Android SDK path configured correctly
) else (
    echo ❌ Android SDK path not configured correctly
)

echo.
echo 📋 Step 4: Checking Metro Configuration
echo ====================================================

echo 🔍 Checking metro.config.js...
if exist "metro.config.js" (
    echo ✅ metro.config.js found
) else (
    echo ❌ metro.config.js missing
)

echo 🔍 Checking babel.config.js...
if exist "babel.config.js" (
    echo ✅ babel.config.js found
    findstr "@babel/plugin-transform-runtime" babel.config.js >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ babel plugin configured correctly
    ) else (
        echo ❌ babel plugin not configured
    )
) else (
    echo ❌ babel.config.js missing
)

echo.
echo 📋 Step 5: Testing Build Process
echo ====================================================

echo 🔧 Testing Gradle build...
cd android
call gradlew assembleDebug --no-daemon
if %ERRORLEVEL% EQU 0 (
    echo ✅ Gradle build successful
) else (
    echo ❌ Gradle build failed
)
cd ..

echo.
echo ====================================================
echo 📊 Verification Summary
echo ====================================================
echo.
echo 🎯 Ready for Android Studio:
echo 1. Open Android Studio
echo 2. Open project: SaptMarketsDeliveryApp\android
echo 3. Wait for Gradle sync
echo 4. Connect device/emulator
echo 5. Click Run button
echo.
echo 🚀 Quick Start Commands:
echo - Start Metro: npx react-native start
echo - Run Android: npx react-native run-android
echo - Clean Build: cd android && gradlew clean && cd ..
echo.

echo 📞 If verification failed:
echo 1. Run setup-android-studio.bat first
echo 2. Check Android Studio SDK Manager
echo 3. Verify Java JDK installation
echo 4. Ensure all dependencies are installed
echo.

pause 