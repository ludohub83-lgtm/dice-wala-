// services/firebaseDb.js
import { firebase } from './firebaseAuth';

const db = firebase.firestore();

export const createUser = async (userId, data) => {
  await db.collection('users').doc(userId).set(data, { merge: true });
};

export const getUser = async (userId) => {
  const doc = await db.collection('users').doc(userId).get();
  return doc.exists ? doc.data() : null;
};

// Game state management
export const getGameState = async (roomId) => {
  try {
    const doc = await db.collection('gameStates').doc(roomId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('getGameState error:', error);
    return null;
  }
};

export const updateGameState = async (roomId, state) => {
  try {
    await db.collection('gameStates').doc(roomId).set(state, { merge: true });
  } catch (error) {
    console.error('updateGameState error:', error);
    throw error;
  }
};

export const subscribeToGameState = (roomId, callback) => {
  try {
    const unsubscribe = db.collection('gameStates').doc(roomId).onSnapshot(
      (doc) => {
        if (doc.exists) {
          callback(doc.data());
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('subscribeToGameState error:', error);
        callback(null);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error('subscribeToGameState setup error:', error);
    return () => {};
  }
};

// Room management
export const getRoom = async (roomId) => {
  try {
    const doc = await db.collection('rooms').doc(roomId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('getRoom error:', error);
    return null;
  }
};
