import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { firebase } from '../services/firebaseAuth';

export default function PhoneAuthScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');

  // Step 1 — Send OTP
  const sendVerification = async () => {
    try {
      // For native apps, Firebase will handle recaptcha automatically
      const confirmationResult = await firebase.auth().signInWithPhoneNumber(phoneNumber);
      setVerificationId(confirmationResult.verificationId);
      Alert.alert('OTP Sent!', 'Please check your SMS for the verification code.');
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', error.message);
    }
  };

  // Step 2 — Verify OTP
  const confirmCode = async () => {
    try {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      await firebase.auth().signInWithCredential(credential);
      Alert.alert('Success', 'Phone number verified successfully!');
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Invalid Code', error.message);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f9f9f9',
      }}
    >
      <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 20 }}>
        Dice Wala Login
      </Text>

      <TextInput
        placeholder="+91 9876543210"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        onChangeText={setPhoneNumber}
        value={phoneNumber}
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#ccc',
          backgroundColor: '#fff',
          marginBottom: 10,
        }}
      />

      <TouchableOpacity
        onPress={sendVerification}
        style={{
          width: '100%',
          backgroundColor: '#007bff',
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>
          Send OTP
        </Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Enter OTP"
        keyboardType="number-pad"
        onChangeText={setVerificationCode}
        value={verificationCode}
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#ccc',
          backgroundColor: '#fff',
          marginBottom: 10,
        }}
      />

      <TouchableOpacity
        onPress={confirmCode}
        style={{
          width: '100%',
          backgroundColor: '#28a745',
          padding: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>
          Verify OTP
        </Text>
      </TouchableOpacity>
    </View>
  );
}
