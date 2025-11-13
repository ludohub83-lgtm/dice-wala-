// services/firebaseConfig.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage'; // Add storage support

// ✅ Correct Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDulXEWo-GqP2JUpIC63AFkYMP4u7geg6U",
  authDomain: "ludo-hub-game.firebaseapp.com",
  projectId: "ludo-hub-game",
  storageBucket: "ludo-hub-game.appspot.com", // Use correct storage bucket
  messagingSenderId: "603173942127",
  appId: "1:603173942127:web:f781bfd1966af199fb6e9a",
  measurementId: "G-LL6JZG01GH"
};

// ✅ Initialize once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage(); // Initialize storage

// 🔹 Optional helper — gets Firebase Auth token (useful for API auth headers)
async function getIdToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken(/* forceRefresh */ true);
}

export { firebase, auth, firestore, storage, getIdToken, firebaseConfig };
export default firebase;
