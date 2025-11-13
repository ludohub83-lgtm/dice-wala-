import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Animated, Easing, Dimensions, Platform, Alert, Image } from 'react-native';
import { Text, Card, useTheme, ActivityIndicator, Chip, Portal, Dialog, TextInput, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { api, fetchPendingPayments, fetchPaymentRequests } from '../services/api';
import { firebase } from '../services/firebaseConfig';
import Screen from '../components/Screen';

const { width } = Dimensions.get('window');
const isMobile = width < 768;
const COLUMNS = isMobile ? 2 : 3;

// Gradient colors for buttons
const GRADIENT_COLORS = {
  scanner: ['#667eea', '#764ba2'],
  pending: ['#f093fb', '#f5576c'],
  verified: ['#4facfe', '#00f2fe'],
  fake: ['#fa709a', '#fee140'],
  withdraw: ['#30cfd0', '#330867'],
  search: ['#a8edea', '#fed6e3'],
  notifications: ['#ff9a9e', '#fecfef'],
  chat: ['#ffecd2', '#fcb69f'],
  history: ['#ffc3a0', '#ffafbd'],
  settings: ['#c2e9fb', '#a1c4fd'],
  reports: ['#d299c2', '#fef9d7'],
  whatsapp: ['#25D366', '#128C7E'],
};

// Admin menu items with icons (using emoji for React Native compatibility)
const ADMIN_MENU_ITEMS = [
  { id: 'gameControls', label: 'Game Controls', icon: '🎮', gradient: ['#667eea', '#764ba2'], route: '/admin/game-controls' },
  { id: 'scanner', label: 'Change Scanner', icon: '🧾', gradient: GRADIENT_COLORS.scanner, route: '/admin/scanner' },
  { id: 'pending', label: 'Pending Payments', icon: '💰', gradient: GRADIENT_COLORS.pending, route: '/admin/pending-payments', badge: true },
  { id: 'verified', label: 'Verified Payments', icon: '🪙', gradient: GRADIENT_COLORS.verified, route: '/admin/verified-payments' },
  { id: 'fake', label: 'Fake Payments', icon: '❌', gradient: GRADIENT_COLORS.fake, route: '/admin/fake-payments' },
  { id: 'withdraw', label: 'Withdraw Requests', icon: '💸', gradient: GRADIENT_COLORS.withdraw, route: '/admin/withdraws' },
  { id: 'search', label: 'Search User', icon: '👤', gradient: GRADIENT_COLORS.search, route: '/admin/search' },
  { id: 'notifications', label: 'Notifications', icon: '🔔', gradient: GRADIENT_COLORS.notifications, route: '/admin/notifications', badge: true },
  { id: 'chat', label: 'User Chat Support', icon: '💬', gradient: GRADIENT_COLORS.chat, route: '/admin/chat' },
  { id: 'history', label: 'Payment History', icon: '📂', gradient: GRADIENT_COLORS.history, route: '/admin/history' },
  { id: 'settings', label: 'Settings', icon: '⚙️', gradient: GRADIENT_COLORS.settings, route: '/admin/settings' },
  { id: 'reports', label: 'Reports & Analytics', icon: '📊', gradient: GRADIENT_COLORS.reports, route: '/admin/reports' },
  { id: 'whatsapp', label: 'Whatsapp / Contact', icon: '📱', gradient: GRADIENT_COLORS.whatsapp, route: '/admin/whatsapp' },
];

// Gradient Button Component with animations
const GradientButton = ({ item, onPress, badgeCount, index }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in animation on mount
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 50,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Pulse animation for items with badges
    if (item.badge && badgeCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [badgeCount]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
    opacity: opacityAnim,
  };

  // Create gradient effect using multiple views with opacity
  const [color1, color2] = item.gradient;

  return (
    <Animated.View style={[{ marginBottom: 16 }, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          borderRadius: 24,
          overflow: 'hidden',
          shadowColor: color1,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {/* Gradient Background */}
        <View
          style={{
            backgroundColor: color1,
            padding: 20,
            minHeight: 120,
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Gradient overlay effect */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60%',
              height: '100%',
              backgroundColor: color2,
              opacity: 0.6,
              borderTopLeftRadius: 100,
              borderBottomLeftRadius: 100,
            }}
          />
          
          {/* Content */}
          <View style={{ zIndex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 32 }}>{item.icon}</Text>
              {item.badge && badgeCount > 0 && (
                <Chip
                  mode="flat"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    height: 24,
                  }}
                  textStyle={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}
                >
                  {badgeCount}
                </Chip>
              )}
            </View>
            <Text
              style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '700',
                textShadowColor: 'rgba(0,0,0,0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              {item.label}
            </Text>
          </View>

          {/* Glassmorphism overlay */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 24,
              ...(Platform.OS === 'web' && {
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }),
            }}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function AdminDashboard({ navigation, user, onNavigateToDetails }) {
  const theme = useTheme();
  const [stats, setStats] = useState({
    pendingPayments: 0,
    pendingManualPayments: 0,
    pendingWithdraws: 0,
    notifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchDialog, setSearchDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [qrDialog, setQrDialog] = useState(false);
  const [qrUpiId, setQrUpiId] = useState('');
  const [qrImage, setQrImage] = useState(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [gameControlsDialog, setGameControlsDialog] = useState(false);
  const [gameControls, setGameControls] = useState({
    diceRollSpeed: 1000,
    tokenMoveSpeed: 500,
    autoSkipTurn: true,
    turnTimeLimit: 30,
    enableSafeSpots: true,
    enableCapture: true,
    winBonus: 1.0,
    maxPlayers: 4,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [pending, manualPending, withdraws] = await Promise.all([
        fetchPendingPayments().catch(() => []),
        fetchPaymentRequests('Pending').catch(() => []),
        api.get('/withdraw/pending').catch(() => ({ data: [] })),
      ]);

      setStats({
        pendingPayments: pending?.length || 0,
        pendingManualPayments: manualPending?.length || 0,
        pendingWithdraws: withdraws?.data?.length || 0,
        notifications: (pending?.length || 0) + (manualPending?.length || 0) + (withdraws?.data?.length || 0),
      });
    } catch (e) {
      console.error('Failed to load stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadGameControls = async () => {
    try {
      const db = firebase.firestore();
      const doc = await db.collection('admin').doc('gameControls').get();
      if (doc.exists) {
        setGameControls({ ...gameControls, ...doc.data() });
      }
    } catch (error) {
      console.error('Failed to load game controls:', error);
    }
  };

  const saveGameControls = async () => {
    try {
      const db = firebase.firestore();
      await db.collection('admin').doc('gameControls').set({
        ...gameControls,
        updatedAt: new Date().toISOString(),
        updatedBy: user.id,
      });
      Alert.alert('Success', 'Game controls updated successfully!');
      setGameControlsDialog(false);
    } catch (error) {
      console.error('Save game controls error:', error);
      Alert.alert('Error', 'Failed to save game controls. Please try again.');
    }
  };

  const handleMenuPress = (item) => {
    // Navigate to specific admin screens
    switch (item.id) {
      case 'gameControls':
        loadGameControls();
        setGameControlsDialog(true);
        break;
      case 'pending':
        if (onNavigateToDetails) {
          onNavigateToDetails('payments');
        } else if (navigation) {
          navigation.navigate('Admin', { showDetails: true, tab: 'payments' });
        }
        break;
      case 'verified':
        if (navigation) {
          navigation.navigate('Admin', { showDetails: true, tab: 'verified' });
        }
        break;
      case 'fake':
        if (navigation) {
          navigation.navigate('Admin', { showDetails: true, tab: 'fake' });
        }
        break;
      case 'withdraw':
        if (onNavigateToDetails) {
          onNavigateToDetails('withdraws');
        } else if (navigation) {
          navigation.navigate('Admin', { showDetails: true, tab: 'withdraws' });
        }
        break;
      case 'search':
        setSearchDialog(true);
        break;
      case 'notifications':
        Alert.alert('Notifications', `You have ${stats.notifications} pending notifications`);
        break;
      case 'chat':
        Alert.alert('Chat Support', 'Chat support feature coming soon');
        break;
      case 'history':
        Alert.alert('Payment History', 'Payment history feature coming soon');
        break;
      case 'settings':
        Alert.alert('Settings', 'Settings feature coming soon');
        break;
      case 'reports':
        Alert.alert('Reports & Analytics', 'Reports feature coming soon');
        break;
      case 'scanner':
        loadCurrentQrData();
        setQrDialog(true);
        break;
      case 'whatsapp':
        // Open WhatsApp or contact support
        Alert.alert('Contact Support', 'WhatsApp: +1234567890\n\nUpdate this with your contact number');
        break;
      default:
        // For now, show the existing AdminScreen with tabs
        if (navigation) {
          navigation.navigate('Admin', { showDetails: true });
        }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      // Search user API call (implement based on your backend)
      const response = await api.get(`/admin/search-user?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data || []);
    } catch (e) {
      console.error('Search failed:', e);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const loadCurrentQrData = async () => {
    try {
      const db = firebase.firestore();
      const doc = await db.collection('admin').doc('paymentQR').get();
      if (doc.exists) {
        const data = doc.data();
        setQrUpiId(data.upiId || '');
        setQrImage(data.qrImageUrl || null);
      }
    } catch (error) {
      console.error('Failed to load QR data:', error);
    }
  };

  const pickQrImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant gallery permission to upload QR code');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || result.cancelled) return;

      const selectedUri = result.assets?.[0]?.uri || result.uri;
      if (selectedUri) {
        setQrImage(selectedUri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const saveQrCode = async () => {
    if (!qrUpiId.trim()) {
      Alert.alert('Error', 'Please enter UPI ID');
      return;
    }

    try {
      setUploadingQr(true);
      let qrImageUrl = qrImage;

      // If a new image was selected (local URI), upload it
      if (qrImage && !qrImage.startsWith('http')) {
        const response = await fetch(qrImage);
        const blob = await response.blob();

        // Check file size (limit to 5MB)
        if (blob.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'Image size too large. Please use an image under 5MB.');
          return;
        }

        const filename = `admin/qr-code_${Date.now()}.jpg`;
        const storageRef = firebase.storage().ref().child(filename);

        await storageRef.put(blob, { contentType: 'image/jpeg' });
        qrImageUrl = await storageRef.getDownloadURL();
      }

      // Save to Firestore
      const db = firebase.firestore();
      await db.collection('admin').doc('paymentQR').set({
        upiId: qrUpiId.trim(),
        qrImageUrl: qrImageUrl || null,
        updatedAt: new Date().toISOString(),
        updatedBy: user.id,
      });

      Alert.alert('Success', 'QR code updated successfully!');
      setQrDialog(false);
    } catch (error) {
      console.error('Save QR error:', error);
      Alert.alert('Error', 'Failed to save QR code. Please try again.');
    } finally {
      setUploadingQr(false);
    }
  };

  const getBadgeCount = (item) => {
    switch (item.id) {
      case 'pending':
        return stats.pendingPayments + stats.pendingManualPayments;
      case 'withdraw':
        return stats.pendingWithdraws;
      case 'notifications':
        return stats.notifications;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 12 }}>Loading dashboard...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Card
          mode="elevated"
          style={{
            marginBottom: 24,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.95)',
            ...(Platform.OS === 'web' && {
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }),
          }}
        >
          <Card.Content style={{ padding: 20 }}>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Admin Dashboard
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Manage payments, users, and system settings
            </Text>
          </Card.Content>
        </Card>

        {/* Stats Cards */}
        <View
          style={{
            flexDirection: isMobile ? 'column' : 'row',
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            { label: 'Pending Payments', value: stats.pendingPayments + stats.pendingManualPayments, color: '#f5576c' },
            { label: 'Withdraw Requests', value: stats.pendingWithdraws, color: '#30cfd0' },
            { label: 'Total Notifications', value: stats.notifications, color: '#667eea' },
          ].map((stat, idx) => (
            <Card
              key={idx}
              mode="elevated"
              style={{
                flex: 1,
                borderRadius: 16,
                backgroundColor: stat.color,
                minHeight: 100,
              }}
            >
              <Card.Content style={{ padding: 16 }}>
                <Text style={{ color: '#fff', fontSize: 12, opacity: 0.9, marginBottom: 4 }}>
                  {stat.label}
                </Text>
                <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>
                  {stat.value}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Admin Menu Grid */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -8,
          }}
        >
          {ADMIN_MENU_ITEMS.map((item, index) => (
            <View
              key={item.id}
              style={{
                width: `${100 / COLUMNS}%`,
                paddingHorizontal: 8,
              }}
            >
              <GradientButton
                item={item}
                onPress={() => handleMenuPress(item)}
                badgeCount={getBadgeCount(item)}
                index={index}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Search Dialog */}
      <Portal>
        <Dialog visible={searchDialog} onDismiss={() => setSearchDialog(false)}>
          <Dialog.Title>Search User</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Search by email, username, or ID"
              value={searchQuery}
              onChangeText={setSearchQuery}
              mode="outlined"
              style={{ marginBottom: 12 }}
            />
            {searching && <ActivityIndicator style={{ marginVertical: 8 }} />}
            {searchResults.length > 0 && (
              <ScrollView style={{ maxHeight: 200 }}>
                {searchResults.map((result, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{
                      padding: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.outline,
                    }}
                  >
                    <Text variant="bodyMedium">{result.email || result.id}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Coins: {result.coins || 0}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSearchDialog(false)}>Cancel</Button>
            <Button onPress={handleSearch} mode="contained">
              Search
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog visible={qrDialog} onDismiss={() => setQrDialog(false)} style={{ maxWidth: 500 }}>
          <Dialog.Title>Change Scanner / QR Code</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="UPI ID"
              value={qrUpiId}
              onChangeText={setQrUpiId}
              mode="outlined"
              style={{ marginBottom: 16 }}
              placeholder="example@upi"
            />

            <Text variant="bodyMedium" style={{ marginBottom: 8, fontWeight: 'bold' }}>
              QR Code Image
            </Text>

            {qrImage ? (
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Image
                  source={{ uri: qrImage }}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 12,
                    marginBottom: 12,
                    backgroundColor: theme.colors.surfaceVariant,
                  }}
                  resizeMode="contain"
                />
                <Button
                  mode="outlined"
                  icon="close"
                  onPress={() => setQrImage(null)}
                  textColor={theme.colors.error}
                >
                  Remove Image
                </Button>
              </View>
            ) : (
              <Button
                mode="contained"
                icon="image"
                onPress={pickQrImage}
                style={{ marginBottom: 16 }}
              >
                Pick QR Code from Gallery
              </Button>
            )}

            {uploadingQr && (
              <View style={{ alignItems: 'center', marginVertical: 12 }}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 8 }}>Uploading...</Text>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setQrDialog(false)} disabled={uploadingQr}>
              Cancel
            </Button>
            <Button
              onPress={saveQrCode}
              mode="contained"
              loading={uploadingQr}
              disabled={uploadingQr}
              buttonColor="#4CAF50"
            >
              Save Changes
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Game Controls Dialog */}
        <Dialog visible={gameControlsDialog} onDismiss={() => setGameControlsDialog(false)} style={{ maxWidth: 600 }}>
          <Dialog.Title>🎮 Game Controls</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 500 }}>
              <Text variant="titleSmall" style={{ marginBottom: 12, fontWeight: 'bold' }}>
                Game Speed Settings
              </Text>
              
              <TextInput
                label="Dice Roll Speed (ms)"
                value={String(gameControls.diceRollSpeed)}
                onChangeText={(val) => setGameControls({ ...gameControls, diceRollSpeed: parseInt(val) || 1000 })}
                mode="outlined"
                keyboardType="numeric"
                style={{ marginBottom: 12 }}
              />

              <TextInput
                label="Token Move Speed (ms)"
                value={String(gameControls.tokenMoveSpeed)}
                onChangeText={(val) => setGameControls({ ...gameControls, tokenMoveSpeed: parseInt(val) || 500 })}
                mode="outlined"
                keyboardType="numeric"
                style={{ marginBottom: 12 }}
              />

              <TextInput
                label="Turn Time Limit (seconds)"
                value={String(gameControls.turnTimeLimit)}
                onChangeText={(val) => setGameControls({ ...gameControls, turnTimeLimit: parseInt(val) || 30 })}
                mode="outlined"
                keyboardType="numeric"
                style={{ marginBottom: 16 }}
              />

              <Text variant="titleSmall" style={{ marginBottom: 12, fontWeight: 'bold' }}>
                Game Rules
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text>Auto Skip Turn (No Valid Moves)</Text>
                <Button
                  mode={gameControls.autoSkipTurn ? 'contained' : 'outlined'}
                  onPress={() => setGameControls({ ...gameControls, autoSkipTurn: !gameControls.autoSkipTurn })}
                  compact
                >
                  {gameControls.autoSkipTurn ? 'ON' : 'OFF'}
                </Button>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text>Enable Safe Spots</Text>
                <Button
                  mode={gameControls.enableSafeSpots ? 'contained' : 'outlined'}
                  onPress={() => setGameControls({ ...gameControls, enableSafeSpots: !gameControls.enableSafeSpots })}
                  compact
                >
                  {gameControls.enableSafeSpots ? 'ON' : 'OFF'}
                </Button>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text>Enable Token Capture</Text>
                <Button
                  mode={gameControls.enableCapture ? 'contained' : 'outlined'}
                  onPress={() => setGameControls({ ...gameControls, enableCapture: !gameControls.enableCapture })}
                  compact
                >
                  {gameControls.enableCapture ? 'ON' : 'OFF'}
                </Button>
              </View>

              <Text variant="titleSmall" style={{ marginBottom: 12, fontWeight: 'bold' }}>
                Rewards & Players
              </Text>

              <TextInput
                label="Win Bonus Multiplier"
                value={String(gameControls.winBonus)}
                onChangeText={(val) => setGameControls({ ...gameControls, winBonus: parseFloat(val) || 1.0 })}
                mode="outlined"
                keyboardType="decimal-pad"
                style={{ marginBottom: 12 }}
                helperText="1.0 = normal, 1.5 = 50% bonus, 2.0 = double"
              />

              <TextInput
                label="Maximum Players Per Game"
                value={String(gameControls.maxPlayers)}
                onChangeText={(val) => setGameControls({ ...gameControls, maxPlayers: parseInt(val) || 4 })}
                mode="outlined"
                keyboardType="numeric"
                style={{ marginBottom: 12 }}
                helperText="2, 3, or 4 players"
              />

              <View style={{ 
                backgroundColor: theme.colors.primaryContainer, 
                padding: 12, 
                borderRadius: 8,
                marginTop: 8 
              }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
                  ℹ️ These settings will apply to all new games. Active games will continue with their current settings.
                </Text>
              </View>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setGameControlsDialog(false)}>
              Cancel
            </Button>
            <Button
              onPress={saveGameControls}
              mode="contained"
              buttonColor="#4CAF50"
            >
              Save Controls
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

