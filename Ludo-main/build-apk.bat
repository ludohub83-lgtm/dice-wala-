@echo off
echo ========================================
echo Ludo Game APK Builder
echo ========================================
echo.

cd ludo-app\frontend

echo Step 1: Installing EAS CLI...
call npm install -g eas-cli

echo.
echo Step 2: Building APK...
echo You will need to login to your Expo account
echo.

call npx eas-cli build --profile preview --platform android

echo.
echo ========================================
echo Build complete!
echo Check the Expo dashboard for your APK download link
echo ========================================
pause
