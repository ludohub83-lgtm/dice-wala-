// Supabase client replaced with Firebase
// This file is kept for compatibility but redirects to Firebase
import { db } from './firebase';

// Export Firebase equivalents for compatibility
// Note: auth is not exported here to avoid server-side initialization errors
export const supabase = {
  // Mock supabase object for compatibility
  // All functionality has been migrated to Firebase
};

export { db };
