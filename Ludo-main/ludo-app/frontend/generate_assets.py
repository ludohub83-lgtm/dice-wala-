#!/usr/bin/env python3
"""
Generate placeholder assets for Ludo Hub app
Requires: pip install pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("ERROR: Pillow library not found!")
    print("Install it with: pip install pillow")
    exit(1)

def create_icon(size, filename):
    """Create a colorful Ludo-themed icon"""
    img = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw Ludo board-inspired design
    colors = ['#ef4444', '#2563eb', '#22c55e', '#fbbf24']  # Red, Blue, Green, Yellow
    
    # Draw four colored quadrants
    half = size // 2
    draw.rectangle([0, 0, half, half], fill=colors[0])  # Red
    draw.rectangle([half, 0, size, half], fill=colors[1])  # Blue
    draw.rectangle([0, half, half, size], fill=colors[2])  # Green
    draw.rectangle([half, half, size, size], fill=colors[3])  # Yellow
    
    # Draw center circle
    center = size // 2
    radius = size // 4
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                 fill='white', outline='#1a4d8f', width=size//50)
    
    # Try to add text
    try:
        font_size = size // 8
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        text = "LUDO\nHUB"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        text_x = (size - text_width) // 2
        text_y = (size - text_height) // 2
        
        # Draw text with outline
        for adj_x in [-2, 0, 2]:
            for adj_y in [-2, 0, 2]:
                draw.text((text_x + adj_x, text_y + adj_y), text, 
                         fill='#1a4d8f', font=font, align='center')
        draw.text((text_x, text_y), text, fill='white', font=font, align='center')
    except Exception as e:
        print(f"Note: Could not add text to icon: {e}")
    
    img.save(filename, 'PNG')
    print(f"✓ Created {filename} ({size}x{size})")

def create_splash(width, height, filename):
    """Create a splash screen"""
    img = Image.new('RGB', (width, height), color='#1a4d8f')
    draw = ImageDraw.Draw(img)
    
    # Draw center logo area
    center_x = width // 2
    center_y = height // 2
    logo_size = min(width, height) // 3
    
    # Draw Ludo board-inspired logo
    colors = ['#ef4444', '#2563eb', '#22c55e', '#fbbf24']
    half = logo_size // 2
    
    # Four colored quadrants
    draw.rectangle([center_x - half, center_y - half, center_x, center_y], fill=colors[0])
    draw.rectangle([center_x, center_y - half, center_x + half, center_y], fill=colors[1])
    draw.rectangle([center_x - half, center_y, center_x, center_y + half], fill=colors[2])
    draw.rectangle([center_x, center_y, center_x + half, center_y + half], fill=colors[3])
    
    # Center circle
    radius = logo_size // 4
    draw.ellipse([center_x - radius, center_y - radius, center_x + radius, center_y + radius],
                 fill='white', outline='#FFD700', width=8)
    
    # Add text below logo
    try:
        font_size = logo_size // 6
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        text = "LUDO HUB"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_x = (width - text_width) // 2
        text_y = center_y + half + logo_size // 8
        
        draw.text((text_x, text_y), text, fill='white', font=font)
    except Exception as e:
        print(f"Note: Could not add text to splash: {e}")
    
    img.save(filename, 'PNG')
    print(f"✓ Created {filename} ({width}x{height})")

def main():
    # Create assets directory if it doesn't exist
    assets_dir = 'assets'
    if not os.path.exists(assets_dir):
        os.makedirs(assets_dir)
        print(f"Created {assets_dir} directory")
    
    print("\nGenerating Ludo Hub assets...")
    print("=" * 50)
    
    # Generate icons
    create_icon(1024, os.path.join(assets_dir, 'icon.png'))
    create_icon(1024, os.path.join(assets_dir, 'adaptive-icon.png'))
    create_icon(192, os.path.join(assets_dir, 'favicon.png'))
    
    # Generate splash screen
    create_splash(1284, 2778, os.path.join(assets_dir, 'splash.png'))
    
    print("=" * 50)
    print("\n✓ All assets generated successfully!")
    print(f"\nAssets location: {os.path.abspath(assets_dir)}")
    print("\nYou can now build your APK!")

if __name__ == '__main__':
    main()
