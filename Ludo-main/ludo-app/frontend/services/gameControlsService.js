// Game Controls Service - Integrates admin controls with game logic
import { firebase, firestore } from './firebaseConfig';

// Default game controls
const DEFAULT_CONTROLS = {
  diceRollSpeed: 1000,
  tokenMoveSpeed: 500,
  autoSkipTurn: true,
  turnTimeLimit: 30,
  enableSafeSpots: true,
  enableCapture: true,
  winBonus: 1.0,
  maxPlayers: 4,
};

let cachedControls = null;
let lastFetch = 0;
const CACHE_DURATION = 60000; // 1 minute

/**
 * Get game controls from Firebase with caching
 */
export async function getGameControls() {
  const now = Date.now();
  
  // Return cached if still valid
  if (cachedControls && (now - lastFetch) < CACHE_DURATION) {
    return cachedControls;
  }
  
  try {
    const doc = await firestore.collection('admin').doc('gameControls').get();
    
    if (doc.exists) {
      cachedControls = { ...DEFAULT_CONTROLS, ...doc.data() };
    } else {
      cachedControls = DEFAULT_CONTROLS;
    }
    
    lastFetch = now;
    return cachedControls;
  } catch (error) {
    console.error('Failed to fetch game controls:', error);
    return cachedControls || DEFAULT_CONTROLS;
  }
}

/**
 * Update game controls (admin only)
 */
export async function updateGameControls(controls) {
  try {
    await firestore.collection('admin').doc('gameControls').set({
      ...controls,
      updatedAt: new Date().toISOString(),
    });
    
    // Clear cache
    cachedControls = null;
    lastFetch = 0;
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update game controls:', error);
    throw error;
  }
}

/**
 * Listen to game controls changes in real-time
 */
export function subscribeToGameControls(callback) {
  const unsubscribe = firestore
    .collection('admin')
    .doc('gameControls')
    .onSnapshot(
      (doc) => {
        if (doc.exists) {
          const controls = { ...DEFAULT_CONTROLS, ...doc.data() };
          cachedControls = controls;
          lastFetch = Date.now();
          callback(controls);
        } else {
          callback(DEFAULT_CONTROLS);
        }
      },
      (error) => {
        console.error('Game controls subscription error:', error);
        callback(cachedControls || DEFAULT_CONTROLS);
      }
    );
  
  return unsubscribe;
}

/**
 * Apply game controls to game logic
 */
export function applyGameControls(gameState, controls) {
  if (!controls) return gameState;
  
  return {
    ...gameState,
    turnTimeLimit: controls.turnTimeLimit,
    autoSkipTurn: controls.autoSkipTurn,
    enableSafeSpots: controls.enableSafeSpots,
    enableCapture: controls.enableCapture,
    maxPlayers: controls.maxPlayers,
  };
}

/**
 * Calculate win amount with bonus
 */
export function calculateWinAmount(baseAmount, controls) {
  if (!controls) return baseAmount;
  return Math.floor(baseAmount * (controls.winBonus || 1.0));
}

/**
 * Get animation speeds
 */
export function getAnimationSpeeds(controls) {
  if (!controls) {
    return {
      diceRoll: DEFAULT_CONTROLS.diceRollSpeed,
      tokenMove: DEFAULT_CONTROLS.tokenMoveSpeed,
    };
  }
  
  return {
    diceRoll: controls.diceRollSpeed || DEFAULT_CONTROLS.diceRollSpeed,
    tokenMove: controls.tokenMoveSpeed || DEFAULT_CONTROLS.tokenMoveSpeed,
  };
}

export default {
  getGameControls,
  updateGameControls,
  subscribeToGameControls,
  applyGameControls,
  calculateWinAmount,
  getAnimationSpeeds,
};
