import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebase } from '../services/firebaseConfig';

export default function SettingsScreen({ navigation, user, onLogout }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Sign out from Firebase
              await firebase.auth().signOut();
              
              // Clear AsyncStorage
              await AsyncStorage.clear();
              
              // Call the logout handler from App.js
              if (onLogout) {
                onLogout();
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'Cache cleared successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          }
        }
      ]
    );
  };

  const languages = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Portuguese', 'Chinese', 'Japanese'];

  const showPrivacyInfo = () => {
    Alert.alert(
      'Privacy Settings',
      'Your privacy is important to us. You can manage:\n\n• Profile visibility\n• Data sharing preferences\n• Account security\n\nVisit your Profile to update these settings.',
      [
        { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') },
        { text: 'OK' }
      ]
    );
  };

  const showSecurityInfo = () => {
    Alert.alert(
      'Security Settings',
      'Keep your account secure:\n\n• Use a strong password\n• Enable two-factor authentication (coming soon)\n• Review login activity\n• Update recovery information\n\nVisit your Profile for security options.',
      [
        { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') },
        { text: 'OK' }
      ]
    );
  };

  const showGameControls = () => {
    Alert.alert(
      'Game Controls',
      'Game Control Options:\n\n• Auto-roll dice: Off\n• Show hints: On\n• Animation speed: Normal\n• Sound effects: ' + (soundEnabled ? 'On' : 'Off') + '\n• Vibration: ' + (vibrateEnabled ? 'On' : 'Off') + '\n\nThese settings are managed in the game screen.',
      [{ text: 'OK' }]
    );
  };

  const showTermsOfService = () => {
    setTermsModalVisible(true);
  };

  const showPrivacyPolicy = () => {
    setPrivacyModalVisible(true);
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, color = '#2196F3' }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || <Ionicons name="chevron-forward" size={20} color="#B0BEC5" />}
    </TouchableOpacity>
  );

  const SettingToggle = ({ icon, title, subtitle, value, onValueChange, color = '#2196F3' }) => (
    <View style={styles.settingItem}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: color + '80' }}
        thumbColor={value ? color : '#f4f3f4'}
      />
    </View>
  );

  return (
    <Screen>
      <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            <View style={styles.card}>
              <SettingItem
                icon="person-outline"
                title="Profile"
                subtitle="Edit your profile information"
                onPress={() => navigation.navigate('Profile')}
                color="#2196F3"
              />
              <Divider style={styles.divider} />
              <SettingItem
                icon="shield-checkmark-outline"
                title="Privacy"
                subtitle="Manage your privacy settings"
                onPress={showPrivacyInfo}
                color="#4CAF50"
              />
              <Divider style={styles.divider} />
              <SettingItem
                icon="lock-closed-outline"
                title="Security"
                subtitle="Password and security options"
                onPress={showSecurityInfo}
                color="#FF9800"
              />
            </View>
          </View>

          {/* Game Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GAME SETTINGS</Text>
            <View style={styles.card}>
              <SettingToggle
                icon="volume-high-outline"
                title="Sound Effects"
                subtitle="Game sound effects"
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                color="#2196F3"
              />
              <Divider style={styles.divider} />
              <SettingToggle
                icon="musical-notes-outline"
                title="Music"
                subtitle="Background music"
                value={musicEnabled}
                onValueChange={setMusicEnabled}
                color="#9C27B0"
              />
              <Divider style={styles.divider} />
              <SettingToggle
                icon="phone-portrait-outline"
                title="Vibration"
                subtitle="Haptic feedback"
                value={vibrateEnabled}
                onValueChange={setVibrateEnabled}
                color="#FF5722"
              />
              <Divider style={styles.divider} />
              <SettingItem
                icon="game-controller-outline"
                title="Game Controls"
                subtitle="Customize game controls"
                onPress={showGameControls}
                color="#4CAF50"
              />
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
            <View style={styles.card}>
              <SettingToggle
                icon="notifications-outline"
                title="Push Notifications"
                subtitle="Receive game updates"
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color="#FF9800"
              />
              <Divider style={styles.divider} />
              <SettingToggle
                icon="mail-outline"
                title="Email Notifications"
                subtitle="Receive email updates"
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                color="#2196F3"
              />
            </View>
          </View>

          {/* App Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>APP</Text>
            <View style={styles.card}>
              <SettingItem
                icon="language-outline"
                title="Language"
                subtitle={selectedLanguage}
                onPress={() => setLanguageModalVisible(true)}
                color="#2196F3"
              />
              <Divider style={styles.divider} />
              <SettingItem
                icon="download-outline"
                title="Download Settings"
                subtitle="Manage downloads and storage"
                onPress={() => Alert.alert(
                  'Download Settings',
                  'Download Options:\n\n• Auto-download updates: Enabled\n• Download over WiFi only: Enabled\n• Cache size: ~50 MB\n\nUse "Clear Cache" to free up space.',
                  [{ text: 'OK' }]
                )}
                color="#4CAF50"
              />
              <Divider style={styles.divider} />
              <SettingItem
                icon="trash-outline"
                title="Clear Cache"
                subtitle="Free up storage space"
                onPress={handleClearCache}
                color="#FF5722"
              />
            </View>
          </View>

          {/* Support & Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SUPPORT & INFO</Text>
            <View style={styles.card}>
              <SettingItem
                icon="help-circle-outline"
                title="Help & FAQ"
                subtitle="Get help and answers"
                onPress={() => navigation.navigate('Support')}
                color="#2196F3"
              />
              <Divider style={styles.divider} />
              <SettingItem
                icon="document-text-outline"
                title="Terms of Service"
                subtitle="Read our terms"
                onPress={showTermsOfService}
                color="#607D8B"
              />
              <Divider style={styles.divider} />
              <SettingItem
                icon="shield-outline"
                title="Privacy Policy"
                subtitle="Read our privacy policy"
                onPress={showPrivacyPolicy}
                color="#607D8B"
              />
              <Divider style={styles.divider} />
              <SettingItem
                icon="information-circle-outline"
                title="About"
                subtitle="Version 1.0.0"
                onPress={() => Alert.alert('About', 'Ludo Hub v1.0.0\nMade by Shera ❤️')}
                color="#9C27B0"
              />
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#F44336', '#D32F2F']} style={styles.logoutGradient}>
                <Ionicons name="log-out-outline" size={24} color="#FFF" />
                <Text style={styles.logoutText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Made by Shera */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Made by Shera <Text style={{ color: '#FF0000' }}>❤️</Text></Text>
            <Text style={styles.footerSubtext}>© 2025 Ludo Hub. All rights reserved.</Text>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Language Selection Modal */}
        <Modal
          visible={languageModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setLanguageModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Language</Text>
                <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#FFF" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.languageItem,
                      selectedLanguage === lang && styles.languageItemSelected
                    ]}
                    onPress={() => {
                      setSelectedLanguage(lang);
                      setLanguageModalVisible(false);
                      Alert.alert('Language Changed', `Language set to ${lang}`);
                    }}
                  >
                    <Text style={[
                      styles.languageText,
                      selectedLanguage === lang && styles.languageTextSelected
                    ]}>
                      {lang}
                    </Text>
                    {selectedLanguage === lang && (
                      <Ionicons name="checkmark" size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Terms of Service Modal */}
        <Modal
          visible={termsModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setTermsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Terms of Service</Text>
                <TouchableOpacity onPress={() => setTermsModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#FFF" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.modalText}>
                  <Text style={styles.modalSectionTitle}>1. Acceptance of Terms{'\n'}</Text>
                  By accessing and using Ludo Hub, you accept and agree to be bound by the terms and provision of this agreement.
                  {'\n\n'}
                  <Text style={styles.modalSectionTitle}>2. Use License{'\n'}</Text>
                  Permission is granted to temporarily use Ludo Hub for personal, non-commercial transitory viewing only.
                  {'\n\n'}
                  <Text style={styles.modalSectionTitle}>3. User Account{'\n'}</Text>
                  You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                  {'\n\n'}
                  <Text style={styles.modalSectionTitle}>4. Prohibited Uses{'\n'}</Text>
                  You may not use Ludo Hub in any way that causes damage or impairs the service. Unauthorized access, cheating, or exploitation of bugs is strictly prohibited.
                  {'\n\n'}
                  <Text style={styles.modalSectionTitle}>5. Payment Terms{'\n'}</Text>
                  All purchases are final. Refunds are subject to our refund policy. Coins and virtual currency have no real-world value.
                  {'\n\n'}
                  <Text style={styles.modalSectionTitle}>6. Disclaimer{'\n'}</Text>
                  The materials on Ludo Hub are provided on an 'as is' basis. We make no warranties, expressed or implied.
                  {'\n\n'}
                  <Text style={styles.modalSectionTitle}>7. Limitations{'\n'}</Text>
                  In no event shall Ludo Hub or its suppliers be liable for any damages arising out of the use or inability to use the service.
                  {'\n\n'}
                  Last updated: January 2025
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Privacy Policy Modal */}
        <Modal
          visible={privacyModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setPrivacyModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Privacy Policy</Text>
                <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#FFF" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.modalText}>
                  <Text style={styles.modalSectionTitle}>1. Information We Collect{'\n'}</Text>
                  We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
                  {'\n\n'}
                  <Text style={styles.modalSectionTitle}>2. How We Use Your Information{'\n'}</Text>
                  We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
                  {'\n\n'}
                  <Text style={styles.modalSectionTitle}>3. Information Sharing{'\n'}</Text>
                  We do not sell, trade, or rent your personal information to third parties. We may share information only as described in this policy.
                  {'\n\n'}
                  <Text style={styles.modalSectionTitle}>4. Data Security{'\n'}</Text>
                  We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
                  {'\n\n'}
                  <Text style={styles.modalSectionTitle}>5. Your Rights{'\n'}</Text>
                  You have the right to access, update, or delete your personal information. You can do this through your account settings.
                  {'\n\n'}
                  <Text style={styles.modalSectionTitle}>6. Cookies and Tracking{'\n'}</Text>
                  We use cookies and similar tracking technologies to track activity on our service and hold certain information.
                  {'\n\n'}
                  <Text style={styles.modalSectionTitle}>7. Children's Privacy{'\n'}</Text>
                  Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
                  {'\n\n'}
                  <Text style={styles.modalSectionTitle}>8. Changes to This Policy{'\n'}</Text>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
                  {'\n\n'}
                  Last updated: January 2025
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 72,
  },
  logoutButton: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  footerText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  footerSubtext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a4d8f',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalScroll: {
    padding: 20,
  },
  modalText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 22,
  },
  modalSectionTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  languageItemSelected: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  languageText: {
    color: '#FFF',
    fontSize: 16,
  },
  languageTextSelected: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
