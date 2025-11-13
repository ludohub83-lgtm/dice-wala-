# Dice Wala Logo Update Script
# This script will resize and place your logo in all required locations

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Dice Wala Logo Update Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if the logo file exists
$logoPath = Read-Host "Enter the full path to your Dice Wala logo image (e.g., C:\Users\asus\Downloads\dice-wala-logo.png)"

if (-not (Test-Path $logoPath)) {
    Write-Host "Error: Logo file not found at: $logoPath" -ForegroundColor Red
    Write-Host "Please save the logo image first and try again." -ForegroundColor Yellow
    pause
    exit
}

Write-Host "Logo found!" -ForegroundColor Green
Write-Host ""

# Check if Python is installed (for image resizing)
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python detected: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python not found. Installing required tools..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please install Python from: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "Or use the online tool: https://www.appicon.co/" -ForegroundColor Yellow
    pause
    exit
}

# Install Pillow if not already installed
Write-Host "Installing/Checking Pillow (Python image library)..." -ForegroundColor Yellow
pip install Pillow --quiet 2>&1 | Out-Null

# Create Python script for resizing
$pythonScript = @"
from PIL import Image
import sys

def resize_image(input_path, output_path, size):
    try:
        img = Image.open(input_path)
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Resize with high-quality resampling
        img_resized = img.resize(size, Image.Resampling.LANCZOS)
        img_resized.save(output_path, 'PNG')
        print(f'Created: {output_path}')
        return True
    except Exception as e:
        print(f'Error: {e}')
        return False

def create_splash(input_path, output_path):
    try:
        # Create splash screen with brown background
        splash = Image.new('RGB', (1284, 2778), color='#8B4513')
        
        # Open and resize logo
        logo = Image.open(input_path)
        if logo.mode != 'RGBA':
            logo = logo.convert('RGBA')
        
        # Resize logo to fit nicely (about 40% of width)
        logo_width = int(1284 * 0.4)
        aspect_ratio = logo.height / logo.width
        logo_height = int(logo_width * aspect_ratio)
        logo_resized = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
        
        # Calculate position to center the logo
        x = (1284 - logo_width) // 2
        y = (2778 - logo_height) // 2
        
        # Paste logo onto splash (with alpha channel for transparency)
        splash.paste(logo_resized, (x, y), logo_resized)
        splash.save(output_path, 'PNG')
        print(f'Created: {output_path}')
        return True
    except Exception as e:
        print(f'Error creating splash: {e}')
        return False

if __name__ == '__main__':
    input_path = sys.argv[1]
    assets_dir = sys.argv[2]
    
    print('Resizing images...')
    
    # Create icon (1024x1024)
    resize_image(input_path, f'{assets_dir}/icon.png', (1024, 1024))
    
    # Create adaptive icon (1024x1024)
    resize_image(input_path, f'{assets_dir}/adaptive-icon.png', (1024, 1024))
    
    # Create favicon (48x48)
    resize_image(input_path, f'{assets_dir}/favicon.png', (48, 48))
    
    # Create splash screen
    create_splash(input_path, f'{assets_dir}/splash.png')
    
    print('All images created successfully!')
"@

# Save Python script
$pythonScriptPath = "$PSScriptRoot\resize_logo.py"
$pythonScript | Out-File -FilePath $pythonScriptPath -Encoding UTF8

# Get assets directory
$assetsDir = "$PSScriptRoot\assets"

# Run Python script
Write-Host ""
Write-Host "Resizing and creating logo files..." -ForegroundColor Yellow
python $pythonScriptPath $logoPath $assetsDir

# Clean up Python script
Remove-Item $pythonScriptPath -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Logo Update Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the images in the assets/ folder" -ForegroundColor White
Write-Host "2. Run: git add assets/" -ForegroundColor White
Write-Host "3. Run: git commit -m 'Add Dice Wala logo'" -ForegroundColor White
Write-Host "4. Run: eas build --profile preview --platform android" -ForegroundColor White
Write-Host ""
pause
