/**
 * Game Sounds Utility
 * Sound effects management for game events
 */

// Note: Install expo-av for sound support
// npm install expo-av

// Uncomment when you have audio files
/*
import { Audio } from 'expo-av';

let soundsEnabled = true;
const sounds = {};

// Sound file paths (add your audio files to assets/sounds/)
const SOUND_FILES = {
  diceRoll: require('../assets/sounds/dice-roll.mp3'),
  tokenMove: require('../assets/sounds/token-move.mp3'),
  capture: require('../assets/sounds/capture.mp3'),
  win: require('../assets/sounds/win.mp3'),
  turnStart: require('../assets/sounds/turn-start.mp3'),
  invalidMove: require('../assets/sounds/invalid.mp3'),
};

// Initialize sounds
export async function initializeSounds() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Preload sounds
    for (const [key, file] of Object.entries(SOUND_FILES)) {
      const { sound } = await Audio.Sound.createAsync(file);
      sounds[key] = sound;
    }
  } catch (error) {
    console.error('Error initializing sounds:', error);
  }
}

// Play sound
async function playSound(soundName) {
  if (!soundsEnabled || !sounds[soundName]) return;
  
  try {
    await sounds[soundName].replayAsync();
  } catch (error) {
    console.error(`Error playing sound ${soundName}:`, error);
  }
}

// Sound functions
export const playDiceRoll = () => playSound('diceRoll');
export const playTokenMove = () => playSound('tokenMove');
export const playCapture = () => playSound('capture');
export const playWin = () => playSound('win');
export const playTurnStart = () => playSound('turnStart');
export const playInvalidMove = () => playSound('invalidMove');

// Toggle sounds
export function toggleSounds(enabled) {
  soundsEnabled = enabled;
}

// Cleanup
export async function cleanupSounds() {
  for (const sound of Object.values(sounds)) {
    await sound.unloadAsync();
  }
}
*/

// Placeholder implementation (no audio files required)
export function initializeSounds() {
  console.log('Sound system initialized (placeholder)');
  return Promise.resolve();
}

export function playDiceRoll() {
  console.log('🎲 Dice roll sound');
}

export function playTokenMove() {
  console.log('🎯 Token move sound');
}

export function playCapture() {
  console.log('💥 Capture sound');
}

export function playWin() {
  console.log('🎉 Win sound');
}

export function playTurnStart() {
  console.log('⏰ Turn start sound');
}

export function playInvalidMove() {
  console.log('❌ Invalid move sound');
}

export function toggleSounds(enabled) {
  console.log(`Sounds ${enabled ? 'enabled' : 'disabled'}`);
}

export function cleanupSounds() {
  console.log('Sounds cleaned up');
  return Promise.resolve();
}

// Vibration support (works without audio files)
import { Vibration, Platform } from 'react-native';

export function vibrateOnDiceRoll() {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Vibration.vibrate(100);
  }
}

export function vibrateOnCapture() {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Vibration.vibrate([0, 100, 50, 100]);
  }
}

export function vibrateOnWin() {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Vibration.vibrate([0, 200, 100, 200, 100, 200]);
  }
}

export default {
  initializeSounds,
  playDiceRoll,
  playTokenMove,
  playCapture,
  playWin,
  playTurnStart,
  playInvalidMove,
  toggleSounds,
  cleanupSounds,
  vibrateOnDiceRoll,
  vibrateOnCapture,
  vibrateOnWin,
};
