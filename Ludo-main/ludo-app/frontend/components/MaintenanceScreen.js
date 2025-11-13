import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AppLogo from './AppLogo';

export default function MaintenanceScreen() {
  return (
    <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
      <View style={styles.content}>
        <AppLogo size={120} animated={true} />
        
        <View style={styles.iconContainer}>
          <Ionicons name="construct" size={80} color="#FFD700" />
        </View>

        <Text style={styles.title}>Under Maintenance</Text>
        <Text style={styles.subtitle}>
          We're currently performing scheduled maintenance to improve your experience.
        </Text>

        <View style={styles.infoBox}>
          <Ionicons name="time" size={24} color="#4CAF50" />
          <Text style={styles.infoText}>
            We'll be back shortly. Thank you for your patience!
          </Text>
        </View>

        <Text style={styles.footer}>
          Please check back in a few minutes
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginVertical: 30,
    padding: 20,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  title: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  infoText: {
    color: '#4CAF50',
    fontSize: 14,
    flex: 1,
  },
  footer: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
});
