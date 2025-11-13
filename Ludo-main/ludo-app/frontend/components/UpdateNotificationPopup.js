import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Linking, ScrollView, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function UpdateNotificationPopup({ visible, updateInfo, onDismiss, onUpdate }) {
  if (!updateInfo) return null;

  const handleUpdate = async () => {
    try {
      // For production apps, open store link
      const storeUrl = Platform.OS === 'ios'
        ? 'https://apps.apple.com/app/your-app-id' // Replace with your App Store URL
        : 'https://play.google.com/store/apps/details?id=com.ludohub.app';
      
      await Linking.openURL(storeUrl);
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to open store. Please update manually from the app store.');
    }
  };

  const handleLater = () => {
    if (updateInfo.isForced) {
      alert('This update is required to continue using the app.');
      return;
    }
    if (onDismiss) onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleLater}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.header}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="rocket" size={48} color="#FFF" />
            </View>
            <Text style={styles.headerTitle}>Update Available!</Text>
            <Text style={styles.version}>Version {updateInfo.version}</Text>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{updateInfo.title}</Text>
            <Text style={styles.message}>{updateInfo.message}</Text>

            {updateInfo.features && updateInfo.features.length > 0 && (
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>What's New:</Text>
                {updateInfo.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            )}

            {updateInfo.isForced && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={24} color="#FF9800" />
                <Text style={styles.warningText}>
                  This update is required to continue using the app.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.actions}>
            {!updateInfo.isForced && (
              <TouchableOpacity
                style={styles.laterButton}
                onPress={handleLater}
                activeOpacity={0.7}
              >
                <Text style={styles.laterText}>Later</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.updateButton, updateInfo.isForced && styles.updateButtonFull]}
              onPress={handleUpdate}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4CAF50', '#45A049']}
                style={styles.updateGradient}
              >
                <Ionicons name="download" size={20} color="#FFF" />
                <Text style={styles.updateText}>Update Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  version: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    maxHeight: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    gap: 10,
    marginTop: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  laterButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  updateButtonFull: {
    flex: 1,
  },
  updateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  updateText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
