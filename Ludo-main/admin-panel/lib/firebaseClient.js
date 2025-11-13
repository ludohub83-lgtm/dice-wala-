// Firebase client-side only initialization
// Use this ONLY in client-side components ('use client') that need Auth or Storage
// For server-side or API routes, use firebase.js instead (which only exports Firestore)

import { getApps } from 'firebase/app';
import app from './firebase'; // Reuse the same app instance
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Ensure we're on client side
if (typeof window === 'undefined') {
  throw new Error('firebaseClient.js can only be used on client side. Use firebase.js for server-side.');
}

// Get services using the shared app instance
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;

