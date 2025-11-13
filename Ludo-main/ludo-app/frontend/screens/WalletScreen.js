import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getSocket } from '../services/socket';
import Screen from '../components/Screen';
import { getWallet } from '../services/api';
import DailyBonusCard from '../components/DailyBonusCard';

const LOW_BALANCE_THRESHOLD = 500; // Show warning if coins < 500

export default function WalletScreen({ user, navigation }) {
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadWallet = async () => {
      try {
        setLoading(true);
        const data = await getWallet(user.id);
        if (isMounted) setCoins(data?.coins ?? 0);
      } catch (error) {
        console.error('Failed to load wallet:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Initial fetch
    loadWallet();

    // Socket setup
    const s = getSocket();

    if (s && s.connected) {
      s.emit('identify', { userId: user.id });
    } else if (s) {
      s.on('connect', () => {
        s.emit('identify', { userId: user.id });
        loadWallet(); // Reload on reconnect
      });
    }

    const onUpdate = (data) => {
      if (data.userId === user.id && typeof data.coins === 'number') {
        setCoins(data.coins);
      }
    };

    s.on('wallet_update', onUpdate);

    return () => {
      isMounted = false;
      if (s) {
        s.off('wallet_update', onUpdate);
        s.off('connect');
      }
    };
  }, [user.id]);

  const isLowBalance = coins < LOW_BALANCE_THRESHOLD;

  return (
    <Screen>
      <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={{ color: '#FFF', marginTop: 12 }}>Loading wallet...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Main Balance Card */}
            <View style={styles.balanceCardContainer}>
              <LinearGradient
                colors={isLowBalance ? ['#F44336', '#D32F2F'] : ['#4CAF50', '#388E3C']}
                style={styles.balanceCard}
              >
                <View style={styles.balanceHeader}>
                  <Ionicons name="wallet" size={32} color="#FFF" />
                  <Text style={styles.balanceTitle}>Your Wallet</Text>
                </View>

                <View style={styles.balanceAmount}>
                  <Ionicons name="star" size={40} color="#FFD700" />
                  <Text style={styles.coinsText}>{coins.toLocaleString()}</Text>
                </View>

                <Text style={styles.balanceSubtitle}>Stars Available</Text>

                {isLowBalance && (
                  <View style={styles.warningBadge}>
                    <Ionicons name="warning" size={16} color="#FFF" />
                    <Text style={styles.warningText}>Low Balance!</Text>
                  </View>
                )}
              </LinearGradient>
            </View>

            {/* Daily Bonus Card */}
            <DailyBonusCard />

            {/* Insufficient Balance Warning */}
            {isLowBalance && (
              <View style={styles.warningCard}>
                <Card style={styles.warningCardInner}>
                  <Card.Content>
                    <View style={styles.warningContent}>
                      <Ionicons name="alert-circle" size={48} color="#FF9800" />
                      <Text style={styles.warningTitle}>Insufficient Balance</Text>
                      <Text style={styles.warningDescription}>
                        You need more stars to play games. Add stars now to continue playing!
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </View>
            )}

            {/* Add Stars Button */}
            <View style={styles.addStarsContainer}>
              <TouchableOpacity
                style={styles.addStarsButton}
                onPress={() => navigation.navigate('ManualPayment')}
              >
                <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.addStarsGradient}>
                  <Ionicons name="add-circle" size={32} color="#FFF" />
                  <View style={styles.addStarsTextContainer}>
                    <Text style={styles.addStarsText}>Add Stars</Text>
                    <Text style={styles.addStarsSubtext}>
                      {isLowBalance ? 'Top up your balance now!' : 'Buy more stars to play'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Quick Info Cards */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Quick Info</Text>

              <Card style={styles.infoCard}>
                <Card.Content>
                  <View style={styles.infoRow}>
                    <Ionicons name="information-circle" size={24} color="#2196F3" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoCardTitle}>1₹ = 1 Star</Text>
                      <Text style={styles.infoCardText}>Each rupee equals one star in your wallet</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.infoCard}>
                <Card.Content>
                  <View style={styles.infoRow}>
                    <Ionicons name="game-controller" size={24} color="#4CAF50" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoCardTitle}>Play & Win</Text>
                      <Text style={styles.infoCardText}>Use stars to join games and win more!</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.infoCard}>
                <Card.Content>
                  <View style={styles.infoRow}>
                    <Ionicons name="shield-checkmark" size={24} color="#FF9800" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoCardTitle}>Safe & Secure</Text>
                      <Text style={styles.infoCardText}>All transactions are verified and secure</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </View>

            {/* Other Options */}
            <View style={styles.optionsSection}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => navigation.navigate('Transactions')} // ✅ Fixed navigation loop
              >
                <LinearGradient colors={['#263238', '#37474F']} style={styles.optionGradient}>
                  <Ionicons name="receipt" size={24} color="#FFF" />
                  <Text style={styles.optionText}>Transaction History</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => navigation.navigate('Withdraw')}
              >
                <LinearGradient colors={['#263238', '#37474F']} style={styles.optionGradient}>
                  <Ionicons name="cash" size={24} color="#FFF" />
                  <Text style={styles.optionText}>Withdraw Stars</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  balanceCardContainer: { marginBottom: 16 },
  balanceCard: { padding: 32, borderRadius: 20, alignItems: 'center', elevation: 8 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  balanceTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  balanceAmount: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  coinsText: { color: '#FFF', fontSize: 56, fontWeight: 'bold' },
  balanceSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 8 },
  warningBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 20, marginTop: 12,
  },
  warningText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  warningCard: { marginBottom: 16 },
  warningCardInner: { backgroundColor: '#263238' },
  warningContent: { alignItems: 'center', paddingVertical: 16 },
  warningTitle: { color: '#FF9800', fontSize: 20, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  warningDescription: { color: '#B0BEC5', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  addStarsContainer: { marginBottom: 24 },
  addStarsButton: { borderRadius: 16, overflow: 'hidden', elevation: 8 },
  addStarsGradient: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  addStarsTextContainer: { flex: 1 },
  addStarsText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  addStarsSubtext: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4 },
  infoSection: { marginBottom: 16 },
  infoTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  infoCard: { backgroundColor: '#263238', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  infoTextContainer: { flex: 1 },
  infoCardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  infoCardText: { color: '#B0BEC5', fontSize: 14, lineHeight: 18 },
  optionsSection: { gap: 12 },
  optionButton: { borderRadius: 12, overflow: 'hidden', elevation: 4 },
  optionGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  optionText: { color: '#FFF', fontSize: 16, fontWeight: '600', flex: 1 },
});
