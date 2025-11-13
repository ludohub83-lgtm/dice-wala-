// firebaseConfig.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDulXEWo-GqP2JUpIC63AFkYMP4u7geg6U",
  authDomain: "ludo-hub-game.firebaseapp.com",
  projectId: "ludo-hub-game",
  storageBucket: "ludo-hub-game.appspot.com",
  messagingSenderId: "603173942127",
  appId: "1:603173942127:web:f781bfd1966af199fb6e9a",
  measurementId: "G-LL6JZG01GH"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
