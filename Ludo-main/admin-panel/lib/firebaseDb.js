// Firebase Firestore service for Admin Panel
// This works on both client and server side
import { db } from './firebase';
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// ============= PAYMENTS =============
export const getPendingPayments = async () => {
  const paymentsRef = collection(db, 'payments');
  const q = query(paymentsRef, where('status', '==', 'pending'));
  const snapshot = await getDocs(q);
  
  const payments = [];
  snapshot.forEach((doc) => {
    payments.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return payments;
};

export const updatePaymentStatus = async (paymentId, status, adminNote = null) => {
  const paymentRef = doc(db, 'payments', paymentId);
  const updates = {
    status,
    updatedAt: serverTimestamp()
  };
  if (adminNote) updates.adminNote = adminNote;
  await updateDoc(paymentRef, updates);
};

// ============= PAYMENT REQUESTS =============
export const getPaymentRequests = async (status = 'Pending') => {
  const requestsRef = collection(db, 'paymentRequests');
  const q = query(requestsRef, where('status', '==', status));
  const snapshot = await getDocs(q);
  
  const requests = [];
  snapshot.forEach((doc) => {
    requests.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return requests;
};

export const updatePaymentRequestStatus = async (requestId, status, verified = false) => {
  const requestRef = doc(db, 'paymentRequests', requestId);
  await updateDoc(requestRef, {
    status,
    verified,
    verifiedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// ============= WITHDRAW REQUESTS =============
export const getPendingWithdrawRequests = async () => {
  const requestsRef = collection(db, 'withdrawRequests');
  const q = query(requestsRef, where('status', '==', 'pending'));
  const snapshot = await getDocs(q);
  
  const requests = [];
  snapshot.forEach((doc) => {
    requests.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return requests;
};

export const updateWithdrawRequestStatus = async (requestId, status, adminNote = null) => {
  const requestRef = doc(db, 'withdrawRequests', requestId);
  const updates = {
    status,
    updatedAt: serverTimestamp()
  };
  if (adminNote) updates.adminNote = adminNote;
  await updateDoc(requestRef, updates);
};

// ============= ADMIN SETTINGS =============
export const getAdminSettings = async () => {
  const settingsRef = doc(db, 'admin', 'settings');
  const snapshot = await getDoc(settingsRef);
  return snapshot.exists() ? snapshot.data() : {
    gameSettings: {},
    maintenanceMode: false,
    paymentQR: null
  };
};

export const updateAdminSettings = async (settings) => {
  const settingsRef = doc(db, 'admin', 'settings');
  await setDoc(settingsRef, {
    ...settings,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getPaymentQRCode = async () => {
  const settings = await getAdminSettings();
  return settings.paymentQR || null;
};

export const updatePaymentQRCode = async (qrData) => {
  const settings = await getAdminSettings();
  await updateAdminSettings({
    ...settings,
    paymentQR: qrData
  });
};

// ============= SEARCH USERS =============
export const searchUsers = async (queryText) => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  
  const results = [];
  const lowerQuery = queryText.toLowerCase();
  
  snapshot.forEach((doc) => {
    const user = doc.data();
    const phone = user.phone || '';
    const userId = doc.id;
    
    if (
      userId.toLowerCase().includes(lowerQuery) ||
      phone.includes(queryText)
    ) {
      results.push({
        id: userId,
        ...user
      });
    }
  });
  
  return results;
};

// ============= USER MANAGEMENT =============
export const getUser = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? { id: userId, ...snapshot.data() } : null;
};

export const updateUserCoins = async (userId, coins) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    coins,
    updatedAt: serverTimestamp()
  });
};

export const getUserCoins = async (userId) => {
  const user = await getUser(userId);
  return user?.coins || 0;
};

// ============= STATS =============
export const getAdminStats = async () => {
  try {
    const [pending, manualPending, withdraws] = await Promise.all([
      getPendingPayments().catch(() => []),
      getPaymentRequests('Pending').catch(() => []),
      getPendingWithdrawRequests().catch(() => []),
    ]);

    return {
      pendingPayments: pending?.length || 0,
      pendingManualPayments: manualPending?.length || 0,
      pendingWithdraws: withdraws?.length || 0,
      totalNotifications: (pending?.length || 0) + (manualPending?.length || 0) + (withdraws?.length || 0),
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return {
      pendingPayments: 0,
      pendingManualPayments: 0,
      pendingWithdraws: 0,
      totalNotifications: 0,
    };
  }
};
