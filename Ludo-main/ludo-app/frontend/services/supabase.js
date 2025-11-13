// Supabase client replaced with Firebase
// This file is kept for compatibility but redirects to Firebase
// All functionality has been migrated to Firebase services

// Import Firebase equivalents
import * as firebaseDb from './firebaseDb';
import { auth } from './firebase';

// Mock supabase object for compatibility
// Note: This is a minimal compatibility layer
// For new code, use firebaseDb and firebaseAuth services directly
export const supabase = {
  auth: {
    // Minimal auth compatibility
    signInWithOtp: async () => {
      throw new Error('Use Firebase Auth instead. Import from firebaseAuth service.');
    },
    verifyOtp: async () => {
      throw new Error('Use Firebase Auth instead. Import from firebaseAuth service.');
    },
    getSession: async () => {
      return { data: { session: auth.currentUser ? { user: auth.currentUser } : null } };
    }
  },
  from: () => {
    throw new Error('Use Firebase Realtime Database instead. Import from firebaseDb service.');
  },
  rpc: () => {
    throw new Error('Use Firebase Realtime Database instead. Import from firebaseDb service.');
  }
};

// Export Firebase equivalents for migration
export { firebaseDb as db, auth };
