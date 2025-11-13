#!/bin/bash

# Quick Setup Script for Ludo Game
# Run this after updating Firebase config

echo "🎲 Ludo Game - Quick Setup Script"
echo "=================================="
echo ""

# Check Node.js
echo "Checking Node.js version..."
node --version || { echo "❌ Node.js not found. Please install Node.js 18+"; exit 1; }
echo "✅ Node.js found"
echo ""

# Check npm
echo "Checking npm..."
npm --version || { echo "❌ npm not found"; exit 1; }
echo "✅ npm found"
echo ""

# Install Functions dependencies
echo "📦 Installing Cloud Functions dependencies..."
cd functions
npm install || { echo "❌ Failed to install functions dependencies"; exit 1; }
echo "✅ Functions dependencies installed"
echo ""

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build || { echo "❌ TypeScript build failed"; exit 1; }
echo "✅ TypeScript built successfully"
echo ""

# Run tests
echo "🧪 Running tests..."
npm test || { echo "⚠️  Some tests failed. Check the output above."; }
echo ""

# Install Client dependencies
echo "📦 Installing Client dependencies..."
cd ../client
npm install || { echo "❌ Failed to install client dependencies"; exit 1; }
echo "✅ Client dependencies installed"
echo ""

# Back to root
cd ..

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .firebaserc with your project ID"
echo "2. Update client/src/firebaseConfig.js with your Firebase config"
echo "3. Run: firebase emulators:start"
echo "4. In another terminal, run: cd client && npm start"
echo ""
echo "📚 See SETUP_CHECKLIST.md for detailed instructions"
echo ""
echo "🎉 Happy gaming!"
