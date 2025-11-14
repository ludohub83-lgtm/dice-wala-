// screens/LoginScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Card,
  TextInput,
  Button,
  Text,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebase, firebaseConfig, sendOTP, verifyOTP } from '../services/firebaseAuth';
import AppLogo from '../components/AppLogo';
import ParticleEffect from '../components/ParticleEffect';

export default function LoginScreen({ onLogin }) {
  const theme = useTheme();
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'otp', 'create'
  const [loading, setLoading] = useState(false);

  // Common inputs
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
    checkPersistentLogin();
  }, []);

  const checkPersistentLogin = async () => {
    const saved = await AsyncStorage.getItem('user');
    if (saved) onLogin(JSON.parse(saved));
  };

  // 🔐 Login by username/password
  const handleLogin = async () => {
    if (!username || !password) return Alert.alert('Missing', 'Enter both fields');
    setLoading(true);
    try {
      const usersRef = firebase.firestore().collection('users');
      const snapshot = await usersRef.where('username', '==', username).get();
      if (snapshot.empty) return Alert.alert('Error', 'User not found');

      let userDoc = null;
      snapshot.forEach((doc) => (userDoc = { id: doc.id, ...doc.data() }));

      if (userDoc.password !== password)
        return Alert.alert('Error', 'Incorrect password');

      await AsyncStorage.setItem('user', JSON.stringify(userDoc));
      onLogin(userDoc);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 📱 OTP sending
  const handleSendOtp = async () => {
    if (!phone) return Alert.alert('Error', 'Enter phone number');
    setLoading(true);
    try {
      const formatted = phone.startsWith('+91') ? phone : '+91' + phone;
      const result = await sendOTP(formatted, null);
      setVerificationId(result.verificationId);
      setMode('otp');
      Alert.alert('OTP Sent', 'Check your phone for verification code');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ OTP verification
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) return Alert.alert('Invalid', 'Enter 6-digit OTP');
    setLoading(true);
    try {
      const result = await verifyOTP(verificationId, otp);
      const phoneNumber = result.user.phoneNumber;

      const ref = firebase.firestore().collection('users');
      const existing = await ref.where('phone', '==', phoneNumber).get();
      if (!existing.empty) {
        Alert.alert('Already Registered', 'Phone exists. Please login.');
        setMode('login');
        return;
      }
      setPhone(phoneNumber);
      setMode('create');
      Alert.alert('Verified', 'Phone verified, continue to create account');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🧾 Create account
  const handleCreateAccount = async () => {
    if (!username || !password || !email)
      return Alert.alert('Error', 'All fields required');

    setLoading(true);
    try {
      const ref = firebase.firestore().collection('users');
      const taken = await ref.where('username', '==', username).get();
      if (!taken.empty) return Alert.alert('Username Taken', 'Choose another');

      const newUser = {
        username,
        password,
        email,
        phone,
        coins: 0,
        createdAt: new Date().toISOString(),
      };
      const doc = await ref.add(newUser);
      const stored = { id: doc.id, ...newUser };
      await AsyncStorage.setItem('user', JSON.stringify(stored));
      onLogin(stored);
      Alert.alert('Success', 'Account created successfully');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🌈 UI Layout
  return (
    <LinearGradient
      colors={['#1a4d8f', '#0d2847', '#1a4d8f']}
      style={styles.container}
    >
      <ParticleEffect count={12} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}
          >
            <AppLogo size={110} animated />
            <Text style={styles.title}>LUDO HUB</Text>
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Welcome Back! Continue Playing'
                : 'Join Ludo Hub - Win Big!'}
            </Text>
          </Animated.View>

          <Card style={styles.card}>
            <Card.Content>
              {mode === 'login' && (
                <>
                  <TextInput
                    label="Username"
                    mode="outlined"
                    value={username}
                    onChangeText={setUsername}
                    left={<TextInput.Icon icon="account" />}
                    style={styles.input}
                  />
                  <TextInput
                    label="Password"
                    mode="outlined"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    left={<TextInput.Icon icon="lock" />}
                    style={styles.input}
                  />
                  <Button
                    mode="contained"
                    icon="login"
                    onPress={handleLogin}
                    loading={loading}
                    style={styles.button}
                  >
                    Login
                  </Button>
                  <TouchableOpacity onPress={() => setMode('signup')}>
                    <Text style={styles.link}>
                      New user?{' '}
                      <Text style={styles.linkHighlight}>Signup here</Text>
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {mode === 'signup' && (
                <>
                  <TextInput
                    label="Phone Number"
                    mode="outlined"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    left={<TextInput.Icon icon="phone" />}
                    style={styles.input}
                    placeholder="+919876543210"
                  />
                  <Button
                    mode="contained"
                    icon="send"
                    onPress={handleSendOtp}
                    loading={loading}
                    style={styles.button}
                  >
                    Send OTP
                  </Button>
                  <Button
                    mode="text"
                    textColor={theme.colors.primary}
                    onPress={() => setMode('login')}
                  >
                    ← Back to Login
                  </Button>
                </>
              )}

              {mode === 'otp' && (
                <>
                  <TextInput
                    label="Enter OTP"
                    mode="outlined"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    left={<TextInput.Icon icon="shield-key-outline" />}
                    style={styles.input}
                  />
                  <Button
                    mode="contained"
                    icon="check"
                    onPress={handleVerifyOtp}
                    loading={loading}
                    style={styles.button}
                  >
                    Verify OTP
                  </Button>
                </>
              )}

              {mode === 'create' && (
                <>
                  <TextInput
                    label="Create Username"
                    mode="outlined"
                    value={username}
                    onChangeText={setUsername}
                    left={<TextInput.Icon icon="account" />}
                    style={styles.input}
                  />
                  <TextInput
                    label="Create Password"
                    mode="outlined"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    left={<TextInput.Icon icon="lock" />}
                    style={styles.input}
                  />
                  <TextInput
                    label="Email Address"
                    mode="outlined"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    left={<TextInput.Icon icon="email" />}
                    style={styles.input}
                  />
                  <Button
                    mode="contained"
                    icon="account-plus"
                    onPress={handleCreateAccount}
                    loading={loading}
                    style={styles.button}
                  >
                    Create Account
                  </Button>
                </>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator animating color="#FFF" size="large" />
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 32, color: '#FFF', fontWeight: 'bold', marginTop: 10 },
  subtitle: {
    color: '#FFD700',
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 8,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  input: { marginBottom: 12 },
  button: {
    borderRadius: 12,
    marginTop: 10,
    paddingVertical: 5,
  },
  link: { textAlign: 'center', marginTop: 16, color: '#000' },
  linkHighlight: { color: '#1a4d8f', fontWeight: 'bold' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
