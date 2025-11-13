@echo off
REM Quick Setup Script for Ludo Game (Windows)
REM Run this after updating Firebase config

echo 🎲 Ludo Game - Quick Setup Script
echo ==================================
echo.

REM Check Node.js
echo Checking Node.js version...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+
    exit /b 1
)
echo ✅ Node.js found
echo.

REM Check npm
echo Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found
    exit /b 1
)
echo ✅ npm found
echo.

REM Install Functions dependencies
echo 📦 Installing Cloud Functions dependencies...
cd functions
call npm install
if errorlevel 1 (
    echo ❌ Failed to install functions dependencies
    exit /b 1
)
echo ✅ Functions dependencies installed
echo.

REM Build TypeScript
echo 🔨 Building TypeScript...
call npm run build
if errorlevel 1 (
    echo ❌ TypeScript build failed
    exit /b 1
)
echo ✅ TypeScript built successfully
echo.

REM Run tests
echo 🧪 Running tests...
call npm test
echo.

REM Install Client dependencies
echo 📦 Installing Client dependencies...
cd ..\client
call npm install
if errorlevel 1 (
    echo ❌ Failed to install client dependencies
    exit /b 1
)
echo ✅ Client dependencies installed
echo.

REM Back to root
cd ..

echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Update .firebaserc with your project ID
echo 2. Update client/src/firebaseConfig.js with your Firebase config
echo 3. Run: firebase emulators:start
echo 4. In another terminal, run: cd client ^&^& npm start
echo.
echo 📚 See SETUP_CHECKLIST.md for detailed instructions
echo.
echo 🎉 Happy gaming!
pause
