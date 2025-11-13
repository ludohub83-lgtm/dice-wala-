// Service to fetch app configuration from admin panel
import { firestore } from './firebaseConfig';

// Cache for app config
let cachedConfig = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Get app configuration from Firebase (set by admin panel)
 */
export async function getAppConfig() {
  try {
    // Use cache if recent
    const now = Date.now();
    if (cachedConfig && (now - lastFetchTime) < CACHE_DURATION) {
      return cachedConfig;
    }

    // Fetch from Firebase admin collection
    const doc = await firestore.collection('admin').doc('appConfig').get();
    
    if (doc.exists) {
      const data = doc.data();
      cachedConfig = {
        ai_difficulty: data.ai_difficulty || 'normal',
        entry_fee_coin: data.entry_fee_coin || 20,
        daily_bonus_coin: data.daily_bonus_coin || 100,
        bot_fill_ratio: data.bot_fill_ratio || 0,
        game_difficulty: data.game_difficulty || 'normal', // Overall game difficulty
        ...data,
      };
    } else {
      // Default config
      cachedConfig = {
        ai_difficulty: 'normal',
        entry_fee_coin: 20,
        daily_bonus_coin: 100,
        bot_fill_ratio: 0,
        game_difficulty: 'normal',
      };
    }
    
    lastFetchTime = now;
    return cachedConfig;
  } catch (error) {
    console.error('Error fetching app config:', error);
    // Return default config on error
    return {
      ai_difficulty: 'normal',
      entry_fee_coin: 20,
      daily_bonus_coin: 100,
      bot_fill_ratio: 0,
      game_difficulty: 'normal',
    };
  }
}

/**
 * Get AI difficulty setting
 */
export async function getAIDifficulty() {
  const config = await getAppConfig();
  return config.ai_difficulty || 'normal';
}

/**
 * Get game difficulty setting
 */
export async function getGameDifficulty() {
  const config = await getAppConfig();
  return config.game_difficulty || config.ai_difficulty || 'normal';
}

/**
 * Clear cache (useful after admin updates config)
 */
export function clearAppConfigCache() {
  cachedConfig = null;
  lastFetchTime = 0;
}

/**
 * Subscribe to app config changes
 */
export function subscribeToAppConfig(callback) {
  return firestore.collection('admin').doc('appConfig').onSnapshot(
    (doc) => {
      if (doc.exists) {
        const data = doc.data();
        cachedConfig = {
          ai_difficulty: data.ai_difficulty || 'normal',
          entry_fee_coin: data.entry_fee_coin || 20,
          daily_bonus_coin: data.daily_bonus_coin || 100,
          bot_fill_ratio: data.bot_fill_ratio || 0,
          game_difficulty: data.game_difficulty || 'normal',
          ...data,
        };
        lastFetchTime = Date.now();
        if (callback) callback(cachedConfig);
      }
    },
    (error) => {
      console.error('Error subscribing to app config:', error);
    }
  );
}

export default {
  getAppConfig,
  getAIDifficulty,
  getGameDifficulty,
  clearAppConfigCache,
  subscribeToAppConfig,
};

