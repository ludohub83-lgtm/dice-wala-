// services/firebaseAuth.js

import { Platform } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';   // ← Add this line
import 'firebase/compat/storage'; 
import Constants from 'expo-constants';

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDulXEWo-GqP2JUpIC63AFkYMP4u7geg6U",
  authDomain: "ludo-hub-game.firebaseapp.com",
  projectId: "ludo-hub-game",
  storageBucket: "ludo-hub-game.appspot.com",
  messagingSenderId: "603173942127",
  appId: "1:603173942127:web:f781bfd1966af199fb6e9a",
  measurementId: "G-LL6JZG01GH"
};

// ✅ Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase, firebaseConfig };

// ✅ Format phone number
export const formatPhoneNumber = (number) => {
  let n = number.trim();
  if (!n.startsWith('+91')) {
    if (n.startsWith('0')) n = n.substring(1);
    n = '+91' + n;
  }
  return n;
};

// ✅ Check validity
export const isValidPhoneNumber = (number) => /^\+91\d{10}$/.test(number);

// ✅ Web recaptcha (only for web build)
export const initializeRecaptcha = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const containerId = 'recaptcha-container';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }
  }
};

// ✅ Send OTP
export const sendOTP = async (phoneNumber, recaptchaVerifierRef = null) => {
  try {
    if (Platform.OS === 'web') {
      // For web
      const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
      });
      const confirmationResult = await firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier);
      return { verificationId: confirmationResult.verificationId };
    } else {
      // For native apps (Android/iOS), Firebase handles recaptcha automatically
      const confirmationResult = await firebase.auth().signInWithPhoneNumber(phoneNumber);
      return { verificationId: confirmationResult.verificationId };
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    throw error;
  }
};

// ✅ Verify OTP
export const verifyOTP = async (verificationId, otpCode) => {
  try {
    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, otpCode);
    const result = await firebase.auth().signInWithCredential(credential);
    return result;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};
