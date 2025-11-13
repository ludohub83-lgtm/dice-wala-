// services/api.js
import { firebase, firestore } from './firebaseConfig';

/* ---------------- WALLET FUNCTIONS ---------------- */
export async function getWallet(userId) {
  try {
    const doc = await firestore.collection('users').doc(userId).get();
    if (!doc.exists) throw new Error('Wallet not found');
    return { coins: doc.data().coins || 0 };
  } catch (error) {
    console.error('getWallet error:', error);
    throw error;
  }
}

/* ---------------- DAILY REWARD STATUS ---------------- */
export async function getDailyRewardStatus(userId) {
  try {
    const doc = await firestore.collection('dailyRewards').doc(userId).get();
    if (!doc.exists) {
      return { claimed: false, lastClaim: null };
    }
    return doc.data();
  } catch (error) {
    console.error('getDailyRewardStatus error:', error);
    throw error;
  }
}

/* ---------------- PAYMENT QR CODE ---------------- */
export async function getPaymentQRCode() {
  try {
    const doc = await firestore.collection('admin').doc('paymentQR').get();
    if (!doc.exists) {
      console.warn('No QR code found — using default');
      return { upiId: 'vishesh@upi', qrImageUrl: null };
    }
    return doc.data();
  } catch (error) {
    console.error('getPaymentQRCode error:', error);
    throw error;
  }
}

/* ---------------- UPLOAD PAYMENT ---------------- */
// --- UPLOAD PAYMENT (fixed & safe) ---
export async function uploadPayment({ userId, uri, transactionId, notes, amount }) {
  if (!userId) throw new Error('Missing userId');
  if (!uri) throw new Error('Screenshot URI is missing');
  if (!transactionId) throw new Error('Transaction ID is missing');

  try {
    // Check if user is authenticated
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated. Please sign in again.');
    }

    console.log('Starting payment upload...');
    
    // Convert local file to blob and upload to Firebase Storage
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Failed to read image file');
    }
    
    const blob = await response.blob();
    
    // Check file size (limit to 10MB)
    if (blob.size > 10 * 1024 * 1024) {
      throw new Error('Image size too large. Please use an image under 10MB.');
    }
    
    const filename = `payments/${userId}_${transactionId}_${Date.now()}.jpg`;
    console.log('Uploading to:', filename);

    const storageRef = firebase.storage().ref().child(filename);
    
    // Upload with metadata
    const uploadTask = await storageRef.put(blob, {
      contentType: 'image/jpeg',
      customMetadata: {
        userId: userId,
        transactionId: transactionId
      }
    });
    
    console.log('Upload complete, getting download URL...');
    const downloadURL = await storageRef.getDownloadURL();
    console.log('Download URL obtained:', downloadURL);

    // Save metadata in Firestore
    const paymentData = {
      userId,
      imageUrl: downloadURL,
      transactionId,
      notes: notes || '',
      amount: amount || 0,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    // Add package info if it's a star package purchase
    if (arguments[0].isStarPackage && arguments[0].packageInfo) {
      paymentData.isStarPackage = true;
      paymentData.packageInfo = arguments[0].packageInfo;
    }

    await firebase.firestore().collection('payments').add(paymentData);

    console.log('✅ Payment uploaded successfully');
    return { success: true };
  } catch (error) {
    console.error('uploadPayment error:', error.code, error.message);
    
    // Provide more specific error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error('Permission denied. Please check Firebase Storage rules or sign in again.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload was canceled');
    } else if (error.code === 'storage/unknown') {
      throw new Error('An unknown error occurred. Please check your internet connection and try again.');
    } else if (error.code === 'storage/quota-exceeded') {
      throw new Error('Storage quota exceeded. Please contact support.');
    }
    
    throw new Error(error.message || 'Upload failed. Please try again.');
  }
}


/* ---------------- CREATE SUPPORT TICKET ---------------- */
export async function createTicket({ userId, subject, message }) {
  try {
    await firestore.collection('supportTickets').add({
      userId,
      subject,
      message,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('createTicket error:', error);
    throw error;
  }
}

/* ---------------- WITHDRAW REQUEST ---------------- */
export async function requestWithdraw({ userId, amount, payoutInfo }) {
  if (!userId) throw new Error('Missing userId');
  if (!amount || amount < 20) throw new Error('Minimum withdrawal amount is 20 coins');
  if (!payoutInfo || !payoutInfo.upi) throw new Error('UPI ID is required');

  try {
    // Check user balance
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) throw new Error('User not found');
    
    const userData = userDoc.data();
    const currentBalance = userData.coins || 0;
    
    if (currentBalance < amount) {
      throw new Error(`Insufficient balance. You have ${currentBalance} coins.`);
    }

    // Create withdrawal request
    await firestore.collection('withdrawals').add({
      userId,
      amount,
      upiId: payoutInfo.upi,
      status: 'pending',
      createdAt: new Date().toISOString(),
      processedAt: null,
    });

    console.log('✅ Withdrawal request created successfully');
    return { success: true, message: 'Withdrawal request submitted successfully' };
  } catch (error) {
    console.error('requestWithdraw error:', error);
    throw new Error(error.message || 'Failed to submit withdrawal request');
  }
}

/* ---------------- TOURNAMENT FUNCTIONS ---------------- */
export async function getActiveTournament() {
  try {
    const snap = await firestore.collection('tournaments').limit(1).get();
    const doc = snap.docs[0];
    return { tournament: doc ? { id: doc.id, ...doc.data() } : null };
  } catch (error) {
    console.error('getActiveTournament error:', error);
    throw error;
  }
}

export async function getTournamentStatus(userId) {
  try {
    const snap = await firestore
      .collection('tournaments')
      .where('participants', 'array-contains', userId)
      .limit(1)
      .get();
    if (snap.empty) return { inTournament: false };
    return { inTournament: true, position: 1, waitingPlayers: 0 };
  } catch (error) {
    console.error('getTournamentStatus error:', error);
    throw error;
  }
}

export async function joinTournament(userId, username) {
  try {
    await firestore.collection('tournaments').add({
      userId,
      username,
      joinedAt: new Date().toISOString(),
    });
    return { message: 'Joined tournament successfully', match: null };
  } catch (error) {
    console.error('joinTournament error:', error);
    throw error;
  }
}

export async function leaveTournament(userId) {
  // Placeholder — safe fallback
  return true;
}

/* ---------------- ROOM MANAGEMENT ---------------- */
export async function createRoom({ userId, seats = 4, fee = 20 }) {
  try {
    const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await firestore.collection('rooms').doc(roomId).set({
      roomId,
      createdBy: userId,
      seats,
      fee,
      players: [],
      status: 'waiting',
      createdAt: new Date().toISOString(),
    });

    return { roomId, success: true };
  } catch (error) {
    console.error('createRoom error:', error);
    throw error;
  }
}

export async function joinRoom({ userId, roomId, fee }) {
  try {
    const roomDoc = await firestore.collection('rooms').doc(roomId).get();
    
    if (!roomDoc.exists) {
      throw new Error('Room not found');
    }

    const room = roomDoc.data();
    
    if (room.players && room.players.length >= room.seats) {
      throw new Error('Room is full');
    }

    // Check user balance
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) throw new Error('User not found');
    
    const userData = userDoc.data();
    const currentBalance = userData.coins || 0;
    
    if (currentBalance < fee) {
      throw new Error(`Insufficient balance. You need ${fee} coins.`);
    }

    // Add player to room
    await firestore.collection('rooms').doc(roomId).update({
      players: firebase.firestore.FieldValue.arrayUnion({ userId, joinedAt: new Date().toISOString() })
    });

    // Deduct fee from user balance
    await firestore.collection('users').doc(userId).update({
      coins: firebase.firestore.FieldValue.increment(-fee)
    });

    return { success: true, roomId };
  } catch (error) {
    console.error('joinRoom error:', error);
    throw error;
  }
}

/* ---------------- GAME HISTORY ---------------- */
export async function postHistory({ userId, roomId, fee, winner, won, ts }) {
  try {
    await firestore.collection('gameHistory').add({
      userId,
      roomId,
      fee,
      winner,
      won,
      timestamp: ts || Date.now(),
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('postHistory error:', error);
    throw error;
  }
}

/* ---------------- INVENTORY & DICE ---------------- */
export async function getEquippedDice(userId) {
  try {
    const doc = await firestore.collection('users').doc(userId).get();
    if (!doc.exists) return 'default';
    
    const userData = doc.data();
    return userData.equippedDice || 'default';
  } catch (error) {
    console.error('getEquippedDice error:', error);
    return 'default';
  }
}

export async function listOwnedDice(userId) {
  try {
    const doc = await firestore.collection('users').doc(userId).get();
    if (!doc.exists) return ['default'];
    
    const userData = doc.data();
    return userData.ownedDice || ['default'];
  } catch (error) {
    console.error('listOwnedDice error:', error);
    return ['default'];
  }
}

export async function buyDice({ userId, key, price }) {
  if (!userId) throw new Error('Missing userId');
  if (!key) throw new Error('Missing dice key');
  if (!price || price < 0) throw new Error('Invalid price');

  try {
    // Get user data
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) throw new Error('User not found');
    
    const userData = userDoc.data();
    const currentBalance = userData.coins || 0;
    const ownedDice = userData.ownedDice || ['default'];

    // Check if already owned
    if (ownedDice.includes(key)) {
      throw new Error('You already own this dice theme');
    }

    // Check balance
    if (currentBalance < price) {
      throw new Error(`Insufficient balance. You need ${price} stars but have ${currentBalance} stars.`);
    }

    // Deduct coins and add dice to owned list
    const newBalance = currentBalance - price;
    const newOwnedDice = [...ownedDice, key];

    await firestore.collection('users').doc(userId).update({
      coins: newBalance,
      ownedDice: newOwnedDice,
      updatedAt: new Date().toISOString(),
    });

    // Log purchase transaction
    await firestore.collection('diceTransactions').add({
      userId,
      diceKey: key,
      price,
      purchasedAt: new Date().toISOString(),
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
    });

    console.log('✅ Dice purchased successfully');
    return { success: true, balance: newBalance, ownedDice: newOwnedDice };
  } catch (error) {
    console.error('buyDice error:', error);
    throw new Error(error.message || 'Failed to purchase dice');
  }
}

export async function equipDice({ userId, key }) {
  if (!userId) throw new Error('Missing userId');
  if (!key) throw new Error('Missing dice key');

  try {
    // Get user data
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) throw new Error('User not found');
    
    const userData = userDoc.data();
    const ownedDice = userData.ownedDice || ['default'];

    // Check if user owns this dice
    if (!ownedDice.includes(key)) {
      throw new Error('You do not own this dice theme');
    }

    // Equip the dice
    await firestore.collection('users').doc(userId).update({
      equippedDice: key,
      updatedAt: new Date().toISOString(),
    });

    console.log('✅ Dice equipped successfully');
    return { success: true, equippedDice: key };
  } catch (error) {
    console.error('equipDice error:', error);
    throw new Error(error.message || 'Failed to equip dice');
  }
}

/* ---------------- ADMIN PAYMENT MANAGEMENT ---------------- */
export async function fetchPendingPayments() {
  try {
    const snapshot = await firestore
      .collection('payments')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      screenshot_url: doc.data().imageUrl,
      user_id: doc.data().userId,
      transaction_id: doc.data().transactionId,
      created_at: doc.data().createdAt,
    }));
  } catch (error) {
    console.error('fetchPendingPayments error:', error);
    return [];
  }
}

export async function fetchPaymentRequests(status = 'Pending') {
  try {
    const snapshot = await firestore
      .collection('payments')
      .where('status', '==', status.toLowerCase())
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      screenshot_url: doc.data().imageUrl,
      user_id: doc.data().userId,
      transaction_id: doc.data().transactionId,
      created_at: doc.data().createdAt,
    }));
  } catch (error) {
    console.error('fetchPaymentRequests error:', error);
    return [];
  }
}

export async function approvePayment(paymentId) {
  if (!paymentId) throw new Error('Missing payment ID');

  try {
    // Get payment data
    const paymentDoc = await firestore.collection('payments').doc(paymentId).get();
    if (!paymentDoc.exists) throw new Error('Payment not found');

    const payment = paymentDoc.data();
    const userId = payment.userId;
    const amount = payment.amount || 0;
    const packageInfo = payment.packageInfo;

    // Calculate coins to add (with bonus if star package)
    let coinsToAdd = amount;
    if (payment.isStarPackage && packageInfo) {
      coinsToAdd = packageInfo.coins;
      // Add bonus if applicable
      if (packageInfo.bonus && packageInfo.bonus !== '0%') {
        const bonusPercent = parseInt(packageInfo.bonus) / 100;
        coinsToAdd = Math.floor(coinsToAdd * (1 + bonusPercent));
      }
    }

    // Get user and update coins
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) throw new Error('User not found');

    const currentCoins = userDoc.data().coins || 0;
    const newCoins = currentCoins + coinsToAdd;

    // Update user coins
    await firestore.collection('users').doc(userId).update({
      coins: newCoins,
      updatedAt: new Date().toISOString(),
    });

    // Update payment status
    await firestore.collection('payments').doc(paymentId).update({
      status: 'approved',
      approvedAt: new Date().toISOString(),
      coinsAdded: coinsToAdd,
    });

    console.log(`✅ Payment approved: ${coinsToAdd} coins added to user ${userId}`);
    return { success: true, coinsAdded: coinsToAdd, newBalance: newCoins };
  } catch (error) {
    console.error('approvePayment error:', error);
    throw new Error(error.message || 'Failed to approve payment');
  }
}

export async function rejectPayment(paymentId, markAsFake = false) {
  if (!paymentId) throw new Error('Missing payment ID');

  try {
    await firestore.collection('payments').doc(paymentId).update({
      status: markAsFake ? 'fake' : 'rejected',
      rejectedAt: new Date().toISOString(),
      markedAsFake: markAsFake,
    });

    console.log(`✅ Payment ${markAsFake ? 'marked as fake' : 'rejected'}`);
    return { success: true };
  } catch (error) {
    console.error('rejectPayment error:', error);
    throw new Error(error.message || 'Failed to reject payment');
  }
}

export async function verifyPaymentRequest(paymentId, verified) {
  if (!paymentId) throw new Error('Missing payment ID');

  try {
    if (verified) {
      // If verified as true, approve the payment
      return await approvePayment(paymentId);
    } else {
      // If marked as fake, reject it
      return await rejectPayment(paymentId, true);
    }
  } catch (error) {
    console.error('verifyPaymentRequest error:', error);
    throw new Error(error.message || 'Failed to verify payment');
  }
}

/* ---------------- ADMIN WITHDRAWAL MANAGEMENT ---------------- */
export async function fetchPendingWithdrawals() {
  try {
    const snapshot = await firestore
      .collection('withdrawals')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      user_id: doc.data().userId,
      payout_info: { upi: doc.data().upiId },
      created_at: doc.data().createdAt,
    }));
  } catch (error) {
    console.error('fetchPendingWithdrawals error:', error);
    return [];
  }
}

export async function approveWithdrawal(withdrawalId) {
  if (!withdrawalId) throw new Error('Missing withdrawal ID');

  try {
    await firestore.collection('withdrawals').doc(withdrawalId).update({
      status: 'approved',
      approvedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    });

    console.log('✅ Withdrawal approved');
    return { success: true };
  } catch (error) {
    console.error('approveWithdrawal error:', error);
    throw new Error(error.message || 'Failed to approve withdrawal');
  }
}

export async function rejectWithdrawal(withdrawalId) {
  if (!withdrawalId) throw new Error('Missing withdrawal ID');

  try {
    // Get withdrawal data
    const withdrawalDoc = await firestore.collection('withdrawals').doc(withdrawalId).get();
    if (!withdrawalDoc.exists) throw new Error('Withdrawal not found');

    const withdrawal = withdrawalDoc.data();
    const userId = withdrawal.userId;
    const amount = withdrawal.amount || 0;

    // Refund coins to user
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const currentCoins = userDoc.data().coins || 0;
      await firestore.collection('users').doc(userId).update({
        coins: currentCoins + amount,
        updatedAt: new Date().toISOString(),
      });
    }

    // Update withdrawal status
    await firestore.collection('withdrawals').doc(withdrawalId).update({
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      coinsRefunded: amount,
    });

    console.log('✅ Withdrawal rejected and coins refunded');
    return { success: true };
  } catch (error) {
    console.error('rejectWithdrawal error:', error);
    throw new Error(error.message || 'Failed to reject withdrawal');
  }
}

/* ---------------- APP CONFIG ---------------- */
export async function getAppConfig() {
  try {
    const doc = await firestore.collection('admin').doc('appConfig').get();
    const gameControlsDoc = await firestore.collection('admin').doc('gameControls').get();
    
    let gameControls = null;
    if (gameControlsDoc.exists) {
      gameControls = gameControlsDoc.data();
    }
    
    if (doc.exists) {
      const data = doc.data();
      return {
        ai_difficulty: data.ai_difficulty || 'normal',
        entry_fee_coin: data.entry_fee_coin || 20,
        daily_bonus_coin: data.daily_bonus_coin || 100,
        bot_fill_ratio: data.bot_fill_ratio || 0,
        game_difficulty: data.game_difficulty || data.ai_difficulty || 'normal',
        gameControls: gameControls,
      };
    }
    return {
      ai_difficulty: 'normal',
      entry_fee_coin: 20,
      daily_bonus_coin: 100,
      bot_fill_ratio: 0,
      game_difficulty: 'normal',
      gameControls: gameControls,
    };
  } catch (error) {
    console.error('getAppConfig error:', error);
    return {
      ai_difficulty: 'normal',
      entry_fee_coin: 20,
      daily_bonus_coin: 100,
      bot_fill_ratio: 0,
      game_difficulty: 'normal',
      gameControls: null,
    };
  }
}

/* ---------------- API OBJECT FOR BACKWARD COMPATIBILITY ---------------- */
export const api = {
  get: async (endpoint) => {
    if (endpoint === '/withdraw/pending') {
      const withdrawals = await fetchPendingWithdrawals();
      return { data: withdrawals };
    }
    throw new Error('Endpoint not implemented');
  },
  post: async (endpoint, data) => {
    if (endpoint.startsWith('/withdraw/approve/')) {
      const id = endpoint.split('/').pop();
      return await approveWithdrawal(id);
    }
    if (endpoint.startsWith('/withdraw/reject/')) {
      const id = endpoint.split('/').pop();
      return await rejectWithdrawal(id);
    }
    throw new Error('Endpoint not implemented');
  },
};


/* ---------------- EVENTS ---------------- */
export async function getEvents() {
  try {
    const snapshot = await firestore.collection('events')
      .where('active', '==', true)
      .orderBy('startDate', 'desc')
      .limit(10)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('getEvents error:', error);
    return [];
  }
}
