@echo off
echo ====================================================
echo 🔧 Fixing @babel/runtime/regenerator Issue
echo ====================================================
echo.

echo 📋 Step 1: Stopping any running processes
echo ====================================================
taskkill /f /im node.exe 2>nul
echo.

echo 📋 Step 2: Cleaning npm cache and node_modules
echo ====================================================
echo 🧹 Cleaning npm cache...
npm cache clean --force
echo.

echo 🧹 Removing node_modules...
rmdir /s /q node_modules 2>nul
echo.

echo 🧹 Removing package-lock.json...
del package-lock.json 2>nul
echo.

echo 📋 Step 3: Installing dependencies with correct versions
echo ====================================================
echo 📦 Installing dependencies...
npm install
echo.

echo 📦 Installing specific babel runtime packages...
npm install @babel/runtime@^7.25.0 --save-dev
npm install @babel/plugin-transform-runtime@^7.25.0 --save-dev
npm install regenerator-runtime@^0.14.1 --save-dev
echo.

echo 📋 Step 4: Updating babel configuration
echo ====================================================
echo 🔧 Updating babel.config.js...
echo module.exports = {> babel.config.js
echo   presets: ['module:@react-native/babel-preset'],>> babel.config.js
echo   plugins: [>> babel.config.js
echo     ['@babel/plugin-transform-runtime', {>> babel.config.js
echo       regenerator: true,>> babel.config.js
echo       helpers: true,>> babel.config.js
echo       useESModules: false>> babel.config.js
echo     }]>> babel.config.js
echo   ],>> babel.config.js
echo };>> babel.config.js
echo.

echo 📋 Step 5: Cleaning React Native cache
echo ====================================================
echo 🧹 Cleaning React Native cache...
npx react-native start --reset-cache & timeout /t 3 & taskkill /f /im node.exe 2>nul
echo.

echo 📋 Step 6: Cleaning Android build
echo ====================================================
echo 🧹 Cleaning Android build cache...
cd android
call gradlew clean
cd ..
echo.

echo 📋 Step 7: Setting up port forwarding
echo ====================================================
echo 🔧 Setting up ADB port forwarding...
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5055 tcp:5055
echo.

echo ====================================================
echo ✅ Babel Runtime Fix Complete!
echo ====================================================
echo.
echo 📱 Next steps:
echo 1. Start Metro bundler: npx react-native start
echo 2. In a new terminal, run: npx react-native run-android
echo 3. The @babel/runtime/regenerator error should be resolved
echo.
echo 🆘 If you still see the error:
echo 1. Make sure your Android emulator is running
echo 2. Try restarting the Metro bundler
echo 3. Check that all dependencies are properly installed
echo.

pause 