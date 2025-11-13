import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { Card, Text, Avatar, IconButton, Chip, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AnimatedCard from '../components/AnimatedCard';
import FloatingButton from '../components/FloatingButton';
import ProfileCard from '../components/ProfileCard';
import AppLogo from '../components/AppLogo';
import ParticleEffect from '../components/ParticleEffect';
import PullToRefresh from '../components/PullToRefresh';
import AnimatedPlayerCount from '../components/AnimatedPlayerCount';
import { useResponsive } from '../components/ResponsiveContainer';
import { getWallet } from '../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation, user }) {
  const [coins, setCoins] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [playersOnline, setPlayersOnline] = useState(1234); // Dynamic player count
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const { moderateScale, isSmallDevice, isTablet } = useResponsive();

  // Dynamic player count that changes every 3-5 seconds
  useEffect(() => {
    const updatePlayerCount = () => {
      setPlayersOnline(prev => {
        // Random change between -15 to +25 players
        const change = Math.floor(Math.random() * 40) - 15;
        const newCount = prev + change;
        // Keep between 800 and 2500
        return Math.max(800, Math.min(2500, newCount));
      });
    };

    // Update every 3-5 seconds randomly
    const getRandomInterval = () => Math.floor(Math.random() * 2000) + 3000;
    
    let timeoutId;
    const scheduleNextUpdate = () => {
      timeoutId = setTimeout(() => {
        updatePlayerCount();
        scheduleNextUpdate();
      }, getRandomInterval());
    };
    
    scheduleNextUpdate();
    
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadWallet = async () => {
    try {
      if (user?.id) {
        const w = await getWallet(user.id);
        setCoins(w?.coins || 0);
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  useEffect(() => {
    loadWallet();
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWallet();
    setRefreshing(false);
  };

  return (
    <Screen>
      <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
        <ParticleEffect count={isTablet ? 30 : 20} />
        <PullToRefresh onRefresh={handleRefresh}>
          <View style={{ minHeight: '100%' }}>
          {/* Profile Card */}
          <ProfileCard
            user={user}
            coins={coins}
            level={1}
            onPress={() => navigation.navigate('Wallet')}
            onSettingsPress={() => navigation.navigate('Settings')}
          />

          {/* Main Game Modes */}
          <View style={styles.mainSection}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={styles.sectionTitle}>🎮 PLAY LUDO 🎮</Text>
            </Animated.View>
            
            {/* Online Multiplayer */}
            <AnimatedCard
              colors={['#2196F3', '#1976D2']}
              onPress={() => navigation.navigate('Lobby')}
              style={styles.mainGameCard}
              delay={0}
            >
              <View style={styles.gameCardContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="globe-outline" size={40} color="#FFF" />
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                </View>
                <View style={styles.gameCardText}>
                  <Text style={styles.gameCardTitle}>Online Multiplayer</Text>
                  <Text style={styles.gameCardSubtitle}>🌍 Play with players worldwide</Text>
                  <View style={styles.playerCount}>
                    <Ionicons name="people" size={14} color="#FFD700" />
                    <AnimatedPlayerCount count={playersOnline} style={styles.playerCountText} />
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FFF" />
              </View>
            </AnimatedCard>

            {/* Play with Friends */}
            <AnimatedCard
              colors={['#4CAF50', '#388E3C']}
              onPress={() => navigation.navigate('Lobby')}
              style={styles.mainGameCard}
              delay={100}
            >
              <View style={styles.gameCardContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="people-outline" size={40} color="#FFF" />
                </View>
                <View style={styles.gameCardText}>
                  <Text style={styles.gameCardTitle}>Play with Friends</Text>
                  <Text style={styles.gameCardSubtitle}>👥 Create private room</Text>
                  <View style={styles.playerCount}>
                    <Ionicons name="lock-closed" size={14} color="#FFD700" />
                    <Text style={styles.playerCountText}>Private matches</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FFF" />
              </View>
            </AnimatedCard>

            {/* Local Mode */}
            <AnimatedCard
              colors={['#FF9800', '#F57C00']}
              onPress={() => navigation.navigate('Lobby', { mode: 'local' })}
              style={styles.mainGameCard}
              delay={200}
            >
              <View style={styles.gameCardContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="phone-portrait-outline" size={40} color="#FFF" />
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>FREE</Text>
                  </View>
                </View>
                <View style={styles.gameCardText}>
                  <Text style={styles.gameCardTitle}>Local Mode</Text>
                  <Text style={styles.gameCardSubtitle}>📱 Play on same device</Text>
                  <View style={styles.playerCount}>
                    <Ionicons name="home" size={14} color="#FFD700" />
                    <Text style={styles.playerCountText}>No betting • Offline</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FFF" />
              </View>
            </AnimatedCard>

            {/* Computer Mode */}
            <AnimatedCard
              colors={['#9C27B0', '#7B1FA2']}
              onPress={() => navigation.navigate('Lobby', { mode: 'computer' })}
              style={styles.mainGameCard}
              delay={300}
            >
              <View style={styles.gameCardContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="desktop-outline" size={40} color="#FFF" />
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>FREE</Text>
                  </View>
                </View>
                <View style={styles.gameCardText}>
                  <Text style={styles.gameCardTitle}>VS Computer</Text>
                  <Text style={styles.gameCardSubtitle}>🤖 Play against AI</Text>
                  <View style={styles.playerCount}>
                    <Ionicons name="trophy" size={14} color="#FFD700" />
                    <Text style={styles.playerCountText}>No betting • Practice</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FFF" />
              </View>
            </AnimatedCard>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <AnimatedCard
              colors={['#E91E63', '#C2185B']}
              onPress={() => navigation.navigate('Event')}
              style={styles.quickActionCard}
              delay={400}
            >
              <View style={styles.quickActionContent}>
                <Ionicons name="trophy" size={32} color="#FFD700" />
                <Text style={styles.quickActionText}>Events</Text>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              </View>
            </AnimatedCard>

            <AnimatedCard
              colors={['#00BCD4', '#0097A7']}
              onPress={() => navigation.navigate('Store')}
              style={styles.quickActionCard}
              delay={450}
            >
              <View style={styles.quickActionContent}>
                <Ionicons name="cart" size={32} color="#FFD700" />
                <Text style={styles.quickActionText}>Store</Text>
                <View style={styles.hotBadge}>
                  <Text style={styles.hotBadgeText}>🔥 HOT</Text>
                </View>
              </View>
            </AnimatedCard>

            <AnimatedCard
              colors={['#FF5722', '#E64A19']}
              onPress={() => navigation.navigate('Inventory')}
              style={styles.quickActionCard}
              delay={500}
            >
              <View style={styles.quickActionContent}>
                <Ionicons name="briefcase" size={32} color="#FFD700" />
                <Text style={styles.quickActionText}>Inventory</Text>
              </View>
            </AnimatedCard>

            <AnimatedCard
              colors={['#673AB7', '#512DA8']}
              onPress={() => navigation.navigate('Social')}
              style={styles.quickActionCard}
              delay={550}
            >
              <View style={styles.quickActionContent}>
                <Ionicons name="chatbubbles" size={32} color="#FFD700" />
                <Text style={styles.quickActionText}>Social</Text>
              </View>
            </AnimatedCard>
          </View>

          {/* Wallet Actions */}
          <View style={styles.walletSection}>
            <Text style={styles.sectionTitle}>WALLET</Text>
            <View style={styles.walletActions}>
              <TouchableOpacity style={styles.walletButton} onPress={() => navigation.navigate('UploadPayment')}>
                <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.walletButtonGradient}>
                  <Ionicons name="add-circle" size={24} color="#FFF" />
                  <Text style={styles.walletButtonText}>Add Coins</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.walletButton} onPress={() => navigation.navigate('Withdraw')}>
                <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.walletButtonGradient}>
                  <Ionicons name="cash" size={24} color="#FFF" />
                  <Text style={styles.walletButtonText}>Withdraw</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Support */}
          <TouchableOpacity style={styles.supportButton} onPress={() => navigation.navigate('Support')}>
            <LinearGradient colors={['#607D8B', '#455A64']} style={styles.supportGradient}>
              <Ionicons name="headset" size={24} color="#FFF" />
              <Text style={styles.supportText}>Customer Support</Text>
            </LinearGradient>
          </TouchableOpacity>

          {user?.isAdmin && (
            <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('Admin')}>
              <LinearGradient colors={['#F44336', '#D32F2F']} style={styles.adminGradient}>
                <Ionicons name="shield" size={24} color="#FFF" />
                <Text style={styles.adminText}>Admin Panel</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={{ height: 20 }} />
          </View>
        </PullToRefresh>

        {/* Floating Action Button - Refer & Earn */}
        <FloatingButton
          icon="people"
          colors={['#4CAF50', '#388E3C']}
          onPress={() => navigation.navigate('Social')}
          label="Refer & Earn 200⭐"
        />

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
            <Ionicons name="home" size={28} color="#2196F3" />
            <Text style={[styles.navText, { color: '#2196F3' }]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Support')}>
            <Ionicons name="headset" size={28} color="#FFF" />
            <Text style={styles.navText}>Support</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  mainSection: {
    padding: width < 375 ? 12 : 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  mainGameCard: {
    marginBottom: 12,
  },
  gameCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    position: 'relative',
  },
  liveBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  liveText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  freeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  freeBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  gameCardText: {
    flex: 1,
  },
  gameCardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameCardSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 2,
  },
  playerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  playerCountText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: width < 375 ? 12 : 16,
    gap: width < 375 ? 8 : 12,
  },
  quickActionCard: {
    width: '47%',
  },
  quickActionContent: {
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  quickActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  hotBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  hotBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  walletSection: {
    padding: 16,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 12,
  },
  walletButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  walletButtonGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  walletButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportButton: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  supportGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  supportText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adminButton: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  adminGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adminText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 20,
    minWidth: 80,
  },
  navText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
});
