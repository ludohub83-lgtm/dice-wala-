import { firebase } from './firebaseConfig';

const USERS_COLLECTION = 'users';
const MATCHES_COLLECTION = 'matches';

// Initialize user stats
export const initializeUserStats = async (userId, userData = {}) => {
  try {
    const db = firebase.firestore();
    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    
    const doc = await userRef.get();
    
    if (!doc.exists) {
      await userRef.set({
        userId,
        email: userData.email || '',
        displayName: userData.displayName || 'Player',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        stats: {
          totalMatches: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
          totalCoinsWon: 0,
          totalCoinsLost: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
        lastActive: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing user stats:', error);
    return false;
  }
};

// Update user stats after match
export const updateUserStats = async (userId, matchResult) => {
  try {
    const db = firebase.firestore();
    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    
    const doc = await userRef.get();
    const currentStats = doc.data()?.stats || {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      totalCoinsWon: 0,
      totalCoinsLost: 0,
      currentStreak: 0,
      bestStreak: 0,
    };

    const newStats = { ...currentStats };
    newStats.totalMatches += 1;

    if (matchResult.won) {
      newStats.wins += 1;
      newStats.totalCoinsWon += matchResult.coinsWon || 0;
      newStats.currentStreak += 1;
      newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
    } else if (matchResult.draw) {
      newStats.draws += 1;
      newStats.currentStreak = 0;
    } else {
      newStats.losses += 1;
      newStats.totalCoinsLost += matchResult.coinsLost || 0;
      newStats.currentStreak = 0;
    }

    newStats.winRate = newStats.totalMatches > 0 
      ? Math.round((newStats.wins / newStats.totalMatches) * 100) 
      : 0;

    await userRef.update({
      stats: newStats,
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    });

    return newStats;
  } catch (error) {
    console.error('Error updating user stats:', error);
    return null;
  }
};

// Record match in Firebase
export const recordMatch = async (matchData) => {
  try {
    const db = firebase.firestore();
    await db.collection(MATCHES_COLLECTION).add({
      ...matchData,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: Date.now(),
    });
    
    return true;
  } catch (error) {
    console.error('Error recording match:', error);
    return false;
  }
};

// Get user stats
export const getUserStats = async (userId) => {
  try {
    const db = firebase.firestore();
    const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
    
    if (doc.exists) {
      return doc.data();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
};

// Get all users (for admin)
export const getAllUsers = async () => {
  try {
    const db = firebase.firestore();
    const snapshot = await db.collection(USERS_COLLECTION)
      .orderBy('stats.totalMatches', 'desc')
      .limit(100)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Get user matches history
export const getUserMatches = async (userId, limit = 20) => {
  try {
    const db = firebase.firestore();
    const snapshot = await db.collection(MATCHES_COLLECTION)
      .where('players', 'array-contains', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting user matches:', error);
    return [];
  }
};

// Get total stats (for admin dashboard)
export const getTotalStats = async () => {
  try {
    const db = firebase.firestore();
    
    // Get total users
    const usersSnapshot = await db.collection(USERS_COLLECTION).get();
    const totalUsers = usersSnapshot.size;
    
    // Get total matches
    const matchesSnapshot = await db.collection(MATCHES_COLLECTION).get();
    const totalMatches = matchesSnapshot.size;
    
    // Calculate total coins in circulation
    let totalCoins = 0;
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      totalCoins += data.coins || 0;
    });
    
    return {
      totalUsers,
      totalMatches,
      totalCoins,
      activeUsers: usersSnapshot.docs.filter(doc => {
        const lastActive = doc.data().lastActive?.toDate();
        if (!lastActive) return false;
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return lastActive > dayAgo;
      }).length,
    };
  } catch (error) {
    console.error('Error getting total stats:', error);
    return {
      totalUsers: 0,
      totalMatches: 0,
      totalCoins: 0,
      activeUsers: 0,
    };
  }
};
