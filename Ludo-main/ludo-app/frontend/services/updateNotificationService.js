import { firebase } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UPDATES_COLLECTION = 'appUpdates';
const LAST_CHECK_KEY = '@lastUpdateCheck';

// Check for app updates
export const checkForUpdates = async () => {
  try {
    const db = firebase.firestore();
    const snapshot = await db
      .collection(UPDATES_COLLECTION)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const latestUpdate = snapshot.docs[0].data();
    const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);
    
    // Check if this is a new update
    if (!lastCheck || latestUpdate.timestamp > parseInt(lastCheck)) {
      return {
        id: snapshot.docs[0].id,
        ...latestUpdate,
      };
    }

    return null;
  } catch (error) {
    console.error('Error checking for updates:', error);
    return null;
  }
};

// Mark update as seen
export const markUpdateAsSeen = async (updateId) => {
  try {
    await AsyncStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
    await AsyncStorage.setItem(`@update_seen_${updateId}`, 'true');
  } catch (error) {
    console.error('Error marking update as seen:', error);
  }
};

// Subscribe to update notifications
export const subscribeToUpdates = (callback) => {
  try {
    const db = firebase.firestore();
    const unsubscribe = db
      .collection(UPDATES_COLLECTION)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          const update = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data(),
          };
          callback(update);
        }
      });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to updates:', error);
    return () => {};
  }
};

// Admin: Push update notification to all users
export const pushUpdateNotification = async (updateData) => {
  try {
    const db = firebase.firestore();
    await db.collection(UPDATES_COLLECTION).add({
      ...updateData,
      timestamp: Date.now(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error pushing update notification:', error);
    throw error;
  }
};

// Get all updates
export const getAllUpdates = async () => {
  try {
    const db = firebase.firestore();
    const snapshot = await db
      .collection(UPDATES_COLLECTION)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting updates:', error);
    return [];
  }
};
