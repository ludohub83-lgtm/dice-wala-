// Firebase-based API service for Admin Panel
import * as db from './firebaseDb';
import { db as firestoreDb } from './firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Ensure Firebase is initialized
if (!firestoreDb) {
  console.error('Firestore database not initialized');
}

// ============= PAYMENTS =============
export const fetchPendingPayments = async () => {
  return await db.getPendingPayments();
};

export const approvePayment = async (id) => {
  // Get payment details
  const paymentRef = doc(firestoreDb, 'payments', id);
  const snapshot = await getDoc(paymentRef);
  if (!snapshot.exists()) throw new Error('Payment not found');
  
  const payment = snapshot.data();
  
  // Update payment status
  await db.updatePaymentStatus(id, 'approved');
  
  // Add coins to user if amount > 0
  if (payment.amount > 0) {
    const currentCoins = await db.getUserCoins(payment.userId);
    const newCoins = currentCoins + payment.amount;
    await db.updateUserCoins(payment.userId, newCoins);
    
    // Create transaction
    const transactionsRef = collection(firestoreDb, 'transactions');
    await addDoc(transactionsRef, {
      userId: payment.userId,
      type: 'deposit',
      amount: payment.amount,
      meta: { reason: 'payment_approval', paymentId: id },
      createdAt: serverTimestamp()
    });
  }
  
  return { success: true };
};

export const rejectPayment = async (id, markAsFake = false) => {
  await db.updatePaymentStatus(id, markAsFake ? 'fake' : 'rejected');
  return { success: true };
};

// ============= PAYMENT REQUESTS =============
export const fetchPaymentRequests = async (status = 'Pending') => {
  return await db.getPaymentRequests(status);
};

export const verifyPaymentRequest = async (id, verified) => {
  // Get request details
  const requestRef = doc(firestoreDb, 'paymentRequests', id);
  const snapshot = await getDoc(requestRef);
  if (!snapshot.exists()) throw new Error('Payment request not found');
  
  const request = snapshot.data();
  
  const status = verified ? 'Approved' : 'Fake';
  await db.updatePaymentRequestStatus(id, status, verified);
  
  // If approved, add coins to user
  if (verified && request.amount > 0) {
    const currentCoins = await db.getUserCoins(request.userId);
    const newCoins = currentCoins + request.amount;
    await db.updateUserCoins(request.userId, newCoins);
    
    // Create transaction
    const transactionsRef = collection(firestoreDb, 'transactions');
    await addDoc(transactionsRef, {
      userId: request.userId,
      type: 'deposit',
      amount: request.amount,
      meta: { reason: 'payment_request_approval', requestId: id },
      createdAt: serverTimestamp()
    });
  }
  
  return { success: true };
};

// ============= WITHDRAW =============
export const fetchPendingWithdraws = async () => {
  return await db.getPendingWithdrawRequests();
};

export const approveWithdraw = async (id) => {
  await db.updateWithdrawRequestStatus(id, 'approved');
  return { success: true };
};

export const rejectWithdraw = async (id) => {
  // Get request details
  const requestRef = doc(firestoreDb, 'withdrawRequests', id);
  const snapshot = await getDoc(requestRef);
  if (!snapshot.exists()) throw new Error('Withdraw request not found');
  
  const request = snapshot.data();
  
  // Refund coins
  const currentCoins = await db.getUserCoins(request.userId);
  const newCoins = currentCoins + request.amount;
  await db.updateUserCoins(request.userId, newCoins);
  
  // Create transaction
  const transactionsRef = collection(firestoreDb, 'transactions');
  await addDoc(transactionsRef, {
    userId: request.userId,
    type: 'deposit',
    amount: request.amount,
    meta: { reason: 'withdraw_rejection_refund', requestId: id },
    createdAt: serverTimestamp()
  });
  
  await db.updateWithdrawRequestStatus(id, 'rejected');
  return { success: true };
};

// ============= QR CODE =============
export const getPaymentQRCode = async () => {
  return await db.getPaymentQRCode();
};

export const updatePaymentQRCode = async ({ upiId, qrImageUrl }) => {
  await db.updatePaymentQRCode({ upiId, qrImageUrl });
  return { success: true };
};

// ============= USER SEARCH =============
export const searchUser = async (query) => {
  return await db.searchUsers(query);
};

// ============= GAME SETTINGS =============
export const getGameSettings = async () => {
  const settings = await db.getAdminSettings();
  return settings.gameSettings || {};
};

export const updateGameSettings = async (settings) => {
  const adminSettings = await db.getAdminSettings();
  await db.updateAdminSettings({
    ...adminSettings,
    gameSettings: settings
  });
  return { success: true };
};

export const toggleGameMaintenance = async (enabled) => {
  const adminSettings = await db.getAdminSettings();
  await db.updateAdminSettings({
    ...adminSettings,
    maintenanceMode: enabled
  });
  return { success: true };
};

// ============= STATS =============
export const getAdminStats = async () => {
  return await db.getAdminStats();
};

export default {
  fetchPendingPayments,
  approvePayment,
  rejectPayment,
  fetchPaymentRequests,
  verifyPaymentRequest,
  fetchPendingWithdraws,
  approveWithdraw,
  rejectWithdraw,
  getPaymentQRCode,
  updatePaymentQRCode,
  searchUser,
  getGameSettings,
  updateGameSettings,
  toggleGameMaintenance,
  getAdminStats
};
