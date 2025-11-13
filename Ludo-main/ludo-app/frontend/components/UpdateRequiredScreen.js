import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AppLogo from './AppLogo';

export default function UpdateRequiredScreen({ currentVersion, minVersion }) {
  const handleUpdate = () => {
    // Open app store based on platform
    const storeUrl = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/ludo-king'
      : 'https://play.google.com/store/apps/details?id=com.ludoking.app';
    Linking.openURL(storeUrl);
  };

  return (
    <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
      <View style={styles.content}>
        <AppLogo size={120} animated={true} />
        
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-download" size={80} color="#2196F3" />
        </View>

        <Text style={styles.title}>Update Required</Text>
        <Text style={styles.subtitle}>
          A new version of Ludo Hub is available with exciting features and improvements!
        </Text>

        <View style={styles.versionBox}>
          <View style={styles.versionItem}>
            <Text style={styles.versionLabel}>Current Version</Text>
            <Text style={styles.versionValue}>{currentVersion}</Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#FFD700" />
          <View style={styles.versionItem}>
            <Text style={styles.versionLabel}>Required Version</Text>
            <Text style={styles.versionValue}>{minVersion}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.buttonGradient}>
            <Ionicons name="download" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Update Now</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Update to continue playing
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
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
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
  versionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 16,
    gap: 16,
    marginBottom: 30,
  },
  versionItem: {
    alignItems: 'center',
  },
  versionLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  versionValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  updateButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});
