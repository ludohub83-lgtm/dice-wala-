/**
 * Quick Setup Script for Existing Firebase Project
 * 
 * This script initializes the required Firestore documents for the
 * Ludo King board system with admin panel integration.
 * 
 * Prerequisites:
 * - Firebase project already exists
 * - Firebase credentials in services/firebaseConfig.js
 * - User is authenticated as admin
 * 
 * Usage:
 * 1. Make sure you're in the frontend directory
 * 2. Run: node scripts/quickSetup.js
 */

// Import Firebase (using the existing config)
const path = require('path');
const configPath = path.join(__dirname, '../services/firebaseConfig.js');

console.log('🚀 Ludo King Board System - Quick Setup\n');
console.log('This script will initialize Firestore documents for:');
console.log('  - Game Controls');
console.log('  - Payment QR');
console.log('  - App Config\n');

console.log('⚠️  IMPORTANT: This script requires firebase-admin package.\n');
console.log('To use this script:');
console.log('1. Install firebase-admin: npm install firebase-admin --save-dev');
console.log('2. Download service account key from Firebase Console');
console.log('3. Save it as scripts/serviceAccountKey.json');
console.log('4. Run: node scripts/quickSetup.js\n');

console.log('OR use the MANUAL SETUP method:');
console.log('1. Open Firebase Console');
console.log('2. Go to Firestore Database');
console.log('3. Follow instructions in SETUP_CHECKLIST.txt\n');

console.log('📋 See SETUP_CHECKLIST.txt for detailed manual setup instructions.\n');

// Check if firebase-admin is installed
try {
  require.resolve('firebase-admin');
  console.log('✅ firebase-admin is installed\n');
  
  // Check if service account key exists
  const fs = require('fs');
  const keyPath = path.join(__dirname, 'serviceAccountKey.json');
  
  if (!fs.existsSync(keyPath)) {
    console.log('❌ Service account key not found!');
    console.log('   Download it from Firebase Console → Project Settings → Service Accounts');
    console.log('   Save as: scripts/serviceAccountKey.json\n');
    process.exit(1);
  }
  
  console.log('✅ Service account key found\n');
  console.log('🔄 Initializing Firebase Admin...\n');
  
  const admin = require('firebase-admin');
  const serviceAccount = require('./serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  const db = admin.firestore();
  
  async function setupFirestore() {
    try {
      console.log('📝 Creating admin/gameControls...');
      await db.collection('admin').doc('gameControls').set({
        diceRollSpeed: 1000,
        tokenMoveSpeed: 500,
        autoSkipTurn: true,
        turnTimeLimit: 30,
        enableSafeSpots: true,
        enableCapture: true,
        winBonus: 1.0,
        maxPlayers: 4,
        updatedAt: new Date().toISOString(),
        updatedBy: 'system'
      });
      console.log('✅ Game controls created\n');
      
      console.log('📝 Creating admin/paymentQR...');
      await db.collection('admin').doc('paymentQR').set({
        upiId: 'your-upi-id@upi',
        qrImageUrl: null,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Payment QR created\n');
      
      console.log('📝 Creating admin/appConfig...');
      await db.collection('admin').doc('appConfig').set({
        ai_difficulty: 'normal',
        entry_fee_coin: 20,
        daily_bonus_coin: 100,
        bot_fill_ratio: 0,
        game_difficulty: 'normal',
        updatedAt: new Date().toISOString()
      });
      console.log('✅ App config created\n');
      
      console.log('🎉 Setup complete!\n');
      console.log('Next steps:');
      console.log('1. Create admin user in Firebase Authentication');
      console.log('2. Add user to admins collection (see SETUP_CHECKLIST.txt)');
      console.log('3. Deploy firestore.rules to Firebase Console');
      console.log('4. Test the application\n');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during setup:', error);
      process.exit(1);
    }
  }
  
  setupFirestore();
  
} catch (e) {
  console.log('⚠️  firebase-admin not installed\n');
  console.log('Install it with: npm install firebase-admin --save-dev\n');
  console.log('OR follow the manual setup in SETUP_CHECKLIST.txt\n');
  process.exit(1);
}
