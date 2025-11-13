// Game difficulty controller - applies difficulty settings from admin panel
import { getGameDifficulty } from './appConfig';

// Difficulty multipliers and settings
const DIFFICULTY_SETTINGS = {
  easy: {
    name: 'Easy',
    diceRollBonus: 0.1, // Slight bonus to rolling 6
    opponentMoveDelay: 2000, // 2 seconds
    captureChance: 0.3, // Lower chance of being captured
    winBonus: 1.0, // Normal rewards
  },
  normal: {
    name: 'Normal',
    diceRollBonus: 0,
    opponentMoveDelay: 1500, // 1.5 seconds
    captureChance: 0.5, // Normal capture chance
    winBonus: 1.0, // Normal rewards
  },
  hard: {
    name: 'Hard',
    diceRollBonus: -0.1, // Slight penalty
    opponentMoveDelay: 1000, // 1 second
    captureChance: 0.7, // Higher chance of being captured
    winBonus: 1.2, // 20% bonus rewards
  },
  expert: {
    name: 'Expert',
    diceRollBonus: -0.15, // More penalty
    opponentMoveDelay: 500, // 0.5 seconds
    captureChance: 0.9, // Very high capture chance
    winBonus: 1.5, // 50% bonus rewards
  },
};

let currentDifficulty = 'normal';

/**
 * Initialize and get current difficulty
 */
export async function initializeDifficulty() {
  try {
    currentDifficulty = await getGameDifficulty();
    return currentDifficulty;
  } catch (error) {
    console.error('Error initializing difficulty:', error);
    return 'normal';
  }
}

/**
 * Get current difficulty settings
 */
export function getDifficultySettings() {
  return DIFFICULTY_SETTINGS[currentDifficulty] || DIFFICULTY_SETTINGS.normal;
}

/**
 * Get difficulty name
 */
export function getDifficultyName() {
  return getDifficultySettings().name;
}

/**
 * Apply dice roll modifier (for AI opponents in future)
 */
export function applyDiceRollModifier(baseRoll) {
  const settings = getDifficultySettings();
  // This would affect AI dice rolls, not player rolls
  // For now, return base roll for players
  return baseRoll;
}

/**
 * Get opponent move delay (for AI opponents)
 */
export function getOpponentMoveDelay() {
  return getDifficultySettings().opponentMoveDelay;
}

/**
 * Get capture chance multiplier
 */
export function getCaptureChance() {
  return getDifficultySettings().captureChance;
}

/**
 * Get win bonus multiplier
 */
export function getWinBonus() {
  return getDifficultySettings().winBonus;
}

/**
 * Update difficulty (called when admin changes it)
 */
export function updateDifficulty(newDifficulty) {
  if (DIFFICULTY_SETTINGS[newDifficulty]) {
    currentDifficulty = newDifficulty;
  }
}

export default {
  initializeDifficulty,
  getDifficultySettings,
  getDifficultyName,
  applyDiceRollModifier,
  getOpponentMoveDelay,
  getCaptureChance,
  getWinBonus,
  updateDifficulty,
};

