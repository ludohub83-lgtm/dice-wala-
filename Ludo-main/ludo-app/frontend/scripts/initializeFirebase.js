/**
 * Firebase Initialization Script
 * Run this once to set up initial admin documents
 * 
 * Usage: node scripts/initializeFirebase.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // You need to download this from Firebase Console

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'ludo-hub-game.appspot.com'
});

const db = admin.firestore();

async function initializeAdminDocuments() {
  console.log('🚀 Initializing Firebase Admin Documents...\n');

  try {
    // 1. Initialize Game Controls
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

    // 2. Initialize Payment QR (placeholder)
    console.log('📝 Creating admin/paymentQR...');
    await db.collection('admin').doc('paymentQR').set({
      upiId: 'your-upi-id@upi',
      qrImageUrl: null,
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Payment QR created\n');

    // 3. Initialize App Config
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

    // 4. Create indexes info document
    console.log('📝 Creating admin/indexes...');
    await db.collection('admin').doc('indexes').set({
      info: 'Required Firestore indexes',
      indexes: [
        {
          collection: 'payments',
          fields: ['status', 'createdAt'],
          order: 'desc'
        },
        {
          collection: 'paymentRequests',
          fields: ['status', 'createdAt'],
          order: 'desc'
        },
        {
          collection: 'withdrawRequests',
          fields: ['status', 'createdAt'],
          order: 'desc'
        },
        {
          collection: 'gameHistory',
          fields: ['userId', 'timestamp'],
          order: 'desc'
        }
      ],
      note: 'Create these indexes in Firebase Console if queries fail',
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Indexes info created\n');

    console.log('🎉 Firebase initialization complete!\n');
    console.log('Next steps:');
    console.log('1. Update admin/paymentQR with your actual UPI ID');
    console.log('2. Upload QR code image via Admin Panel');
    console.log('3. Create admin user in Firebase Authentication');
    console.log('4. Set up Firestore security rules');
    console.log('5. Test the application\n');

  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run initialization
initializeAdminDocuments();
