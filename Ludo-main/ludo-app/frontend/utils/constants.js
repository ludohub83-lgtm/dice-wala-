// App Constants
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'Ludo Hub';

// API Endpoints
export const API_ENDPOINTS = {
  GAME_SETTINGS: '/api/admin/game-settings',
  MAINTENANCE_STATUS: '/api/admin/maintenance-status',
  WALLET: '/wallet',
  PAYMENTS: '/payments',
  WITHDRAWALS: '/withdrawals',
  GAME_HISTORY: '/history',
};

// Game Constants
export const GAME_MODES = {
  ONLINE: 'online',
  FRIENDS: 'friends',
  LOCAL: 'local',
  COMPUTER: 'computer',
};

export const PLAYER_COUNTS = [2, 3, 4];

export const BET_AMOUNTS = [50, 100, 250, 500, 1000, 2500, 5000, 10000];

// Colors
export const COLORS = {
  PRIMARY: '#2196F3',
  SECONDARY: '#4CAF50',
  WARNING: '#FF9800',
  DANGER: '#F44336',
  SUCCESS: '#4CAF50',
  INFO: '#2196F3',
  GOLD: '#FFD700',
  DARK_BLUE: '#1a4d8f',
  LIGHT_BLUE: '#60A5FA',
};

// Player Colors
export const PLAYER_COLORS = {
  RED: '#FF6B6B',
  BLUE: '#2196F3',
  GREEN: '#4CAF50',
  YELLOW: '#FFD700',
};

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  COUNTDOWN: 3500,
};

// Storage Keys
export const STORAGE_KEYS = {
  USER: '@user',
  TOKEN: '@token',
  SETTINGS: '@settings',
  THEME: '@theme',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  SERVER: 'Server error. Please try again later.',
  AUTH: 'Authentication failed. Please login again.',
  INSUFFICIENT_BALANCE: 'Insufficient balance. Please add coins.',
  GAME_NOT_FOUND: 'Game not found.',
  INVALID_OTP: 'Invalid OTP. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  PAYMENT: 'Payment successful!',
  WITHDRAWAL: 'Withdrawal request submitted!',
  GAME_CREATED: 'Game created successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
};

// Dice Themes
export const DICE_THEMES = [
  { key: 'default', name: 'Default', price: 0 },
  { key: 'halloween', name: 'Halloween', price: 249 },
  { key: 'football', name: 'Football', price: 249 },
  { key: 'newyear', name: 'New Year', price: 249 },
  { key: 'tricolour', name: 'Tri-colour', price: 249 },
  { key: 'heart', name: 'Heart', price: 249 },
  { key: 'colors', name: 'Colors', price: 249 },
  { key: 'summer', name: 'Summer', price: 249 },
  { key: 'sixer', name: 'Sixer', price: 249 },
  { key: 'cricket', name: 'Cricket King', price: 249 },
  { key: 'diya', name: 'Diya', price: 249 },
  { key: 'pumpkin', name: 'Pumpkin', price: 75 },
];

// Achievements
export const ACHIEVEMENTS = [
  { id: 1, title: 'First Win', description: 'Win your first game', reward: 100, icon: 'trophy' },
  { id: 2, title: 'Winning Streak', description: 'Win 5 games in a row', reward: 500, icon: 'flame' },
  { id: 3, title: 'High Roller', description: 'Win a game with 1000+ bet', reward: 1000, icon: 'cash' },
  { id: 4, title: 'Social Butterfly', description: 'Play with 10 different players', reward: 250, icon: 'people' },
  { id: 5, title: 'Lucky Six', description: 'Roll a six 100 times', reward: 300, icon: 'dice' },
];

// Daily Missions
export const DAILY_MISSIONS = [
  { id: 1, title: 'Play 3 Games', target: 3, reward: 50, icon: 'game-controller' },
  { id: 2, title: 'Win 1 Game', target: 1, reward: 100, icon: 'trophy' },
  { id: 3, title: 'Roll a Six', target: 5, reward: 25, icon: 'dice' },
  { id: 4, title: 'Invite a Friend', target: 1, reward: 200, icon: 'person-add' },
  { id: 5, title: 'Add Coins', target: 1, reward: 50, icon: 'cash' },
];

export default {
  APP_VERSION,
  APP_NAME,
  API_ENDPOINTS,
  GAME_MODES,
  PLAYER_COUNTS,
  BET_AMOUNTS,
  COLORS,
  PLAYER_COLORS,
  ANIMATION_DURATION,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DICE_THEMES,
  ACHIEVEMENTS,
  DAILY_MISSIONS,
};
