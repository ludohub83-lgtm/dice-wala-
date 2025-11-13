// Custom entry point to suppress Expo update errors
import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

// Suppress all Expo update related errors
LogBox.ignoreAllLogs(true); // This will suppress all logs temporarily

// More specific suppression
LogBox.ignoreLogs([
  'Uncaught Error',
  'java.io.IOException',
  'Failed to download',
  'remote update',
  'expo-updates',
  'IOException',
]);

// Suppress console errors globally
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const errorString = args.join(' ');
  if (
    errorString.includes('IOException') ||
    errorString.includes('Failed to download') ||
    errorString.includes('remote update') ||
    errorString.includes('expo-updates')
  ) {
    return; // Suppress
  }
  originalError(...args);
};

console.warn = (...args) => {
  const warnString = args.join(' ');
  if (
    warnString.includes('IOException') ||
    warnString.includes('Failed to download') ||
    warnString.includes('remote update')
  ) {
    return; // Suppress
  }
  originalWarn(...args);
};

// Global unhandled promise rejection handler
const originalHandler = global.Promise.prototype.catch;
global.Promise.prototype.catch = function (onRejected) {
  return originalHandler.call(this, (error) => {
    if (
      error &&
      error.message &&
      (error.message.includes('IOException') ||
       error.message.includes('Failed to download') ||
       error.message.includes('remote update'))
    ) {
      console.log('Suppressed update error');
      return;
    }
    if (onRejected) {
      return onRejected(error);
    }
    throw error;
  });
};

import App from './App';

// Register the main component
registerRootComponent(App);
