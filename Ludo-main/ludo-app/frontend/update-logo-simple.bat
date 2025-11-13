@echo off
echo ========================================
echo   Dice Wala Logo Update Helper
echo ========================================
echo.
echo This script will help you update the logo.
echo.
echo STEP 1: Save your logo
echo ------------------------
echo 1. Right-click the Dice Wala logo image in the chat
echo 2. Save it to your Downloads folder as "dice-wala-logo.png"
echo.
echo STEP 2: Use online tool to resize
echo ----------------------------------
echo 1. Go to: https://www.appicon.co/
echo 2. Upload your saved logo
echo 3. Download the generated icons
echo 4. Extract the ZIP file
echo.
echo STEP 3: Copy files to assets folder
echo ------------------------------------
echo Copy these files to: %~dp0assets\
echo    - icon.png (1024x1024)
echo    - adaptive-icon.png (1024x1024)
echo    - favicon.png (48x48)
echo    - splash.png (create manually or use existing)
echo.
echo STEP 4: Commit and rebuild
echo ---------------------------
echo After copying files, run:
echo    git add assets/
echo    git commit -m "Add Dice Wala logo"
echo    eas build --profile preview --platform android
echo.
echo ========================================
echo.
echo Press any key to open the online tool...
pause >nul
start https://www.appicon.co/
echo.
echo Press any key to open assets folder...
pause >nul
start %~dp0assets
echo.
echo Done! Follow the steps above to complete the logo update.
pause
