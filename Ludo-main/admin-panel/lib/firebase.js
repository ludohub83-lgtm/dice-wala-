// Firebase configuration for Admin Panel
// This file works for both server-side (API routes) and client-side
// IMPORTANT: Auth and Storage are NOT initialized here to avoid server-side errors
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDulXEWo-GqP2JUpIC63AFkYMP4u7geg6U",
  authDomain: "ludo-hub-game.firebaseapp.com",
  projectId: "ludo-hub-game",
  storageBucket: "ludo-hub-game.firebasestorage.app",
  messagingSenderId: "603173942127",
  appId: "1:603173942127:web:f781bfd1966af199fb6e9a",
  measurementId: "G-LL6JZG01GH"
};

// Initialize Firebase app (works on both server and client)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore (works on both server and client)
// This is the only service that should be used on server-side
export const db = getFirestore(app);

// DO NOT initialize Auth or Storage here to avoid "component auth has not been registered" error
// If you need Auth or Storage, use firebaseClient.js for client-side only components
export const auth = null;
export const storage = null;

export default app;

