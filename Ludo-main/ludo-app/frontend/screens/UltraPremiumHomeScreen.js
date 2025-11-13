import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../components/AnimatedBackground';
import HolographicCard from '../components/HolographicCard';
import MagneticButton from '../components/MagneticButton';
import LiquidButton from '../components/LiquidButton';
import AnimatedCounter from '../components/AnimatedCounter';
import StatsCircle from '../components/StatsCircle';
import NeonText from '../components/NeonText';
import PulsingCoinIcon from '../components/PulsingCoinIcon';
import FloatingActionMenu from '../components/FloatingActionMenu';
import WinStreakBanner from '../components/WinStreakBanner';
import TournamentBanner from '../components/TournamentBanner';
import DailyMissionsCard from '../components/DailyMissionsCard';
import LeaderboardCard from '../components/LeaderboardCard';
import LuckySpinWheel from '../components/LuckySpinWheel';
import BoosterCard from '../components/BoosterCard';
import ReferralCard from '../components/ReferralCard';
import ParticleEffect from '../components/ParticleEffect';

const { width } = Dimensions.get('window');

export default function UltraPremiumHomeScreen({ navigation, user }) {
  const [coins, setCoins] = useState(15420);
  const [gems, setGems] = useState(350);
  const [winStreak, setWinStreak] = useState(7);
  const scrollY = useRef(new Animated.Value(0)).current;

  const userStats = {
    gamesPlayed: 128,
    gamesWon: 89,
    winRate: 69,
    totalEarnings: 15420,
  };

  const floatingActions = [
    {
      icon: '🎁',
      label: 'Daily Reward',
      colors: ['#FF6B6B', '#FF8E53'],
      onPress: () => navigation.navigate('Event'),
    },
    {
      icon: '🎯',
      label: 'Missions',
      colors: ['#4ECDC4', '#44A08D'],
      onPress: () => navigation.navigate('Event'),
    },
    {
      icon: '🏆',
      label: 'Tournament',
      colors: ['#FFD93D', '#FFA500'],
      onPress: () => navigation.navigate('Event'),
    },
    {
      icon: '🎰',
      label: 'Lucky Spin',
      colors: ['#A8E6CF', '#3DDC84'],
      onPress: () => navigation.navigate('Event'),
    },
  ];

  return (
    <View style={styles.container}>
      <AnimatedBackground colors={['#0f0c29', '#302b63', '#24243e']}>
        <ParticleEffect />
        
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <NeonText color="#00ffff" size={32} animated>
                ⚡ LUDO HUB ⚡
              </NeonText>
            </View>

            {/* Coins Display */}
            <View style={styles.coinsContainer}>
              <HolographicCard style={styles.coinCard}>
                <View style={styles.coinContent}>
                  <PulsingCoinIcon size={50} />
                  <View style={styles.coinInfo}>
                    <AnimatedCounter
                      value={coins}
                      prefix="₹"
                      colors={['#FFD700', '#FFA500']}
                      size={24}
                      showGlow={false}
                    />
                    <Text style={styles.coinLabel}>Total Coins</Text>
                  </View>
                </View>
              </HolographicCard>

              <HolographicCard style={styles.gemCard}>
                <View style={styles.coinContent}>
                  <Text style={styles.gemIcon}>💎</Text>
                  <View style={styles.coinInfo}>
                    <AnimatedCounter
                      value={gems}
                      colors={['#9d00ff', '#ff0080']}
                      size={24}
                      showGlow={false}
                    />
                    <Text style={styles.coinLabel}>Gems</Text>
                  </View>
                </View>
              </HolographicCard>
            </View>
          </View>

          {/* Win Streak */}
          {winStreak > 0 && (
            <WinStreakBanner streak={winStreak} style={styles.section} />
          )}

          {/* Stats Circles */}
          <HolographicCard style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Your Stats</Text>
            <View style={styles.statsRow}>
              <StatsCircle
                percentage={userStats.winRate}
                value={`${userStats.winRate}%`}
                label="Win Rate"
                colors={['#00d2ff', '#3a7bd5']}
                icon={<Text style={styles.statIcon}>🏆</Text>}
              />
              <StatsCircle
                percentage={(userStats.gamesWon / userStats.gamesPlayed) * 100}
                value={userStats.gamesWon}
                label="Wins"
                colors={['#f093fb', '#f5576c']}
                icon={<Text style={styles.statIcon}>⭐</Text>}
              />
            </View>
          </HolographicCard>

          {/* Tournament Banner */}
          <TournamentBanner navigation={navigation} style={styles.section} />

          {/* Play Section */}
          <HolographicCard style={styles.section}>
            <NeonText color="#ff0080" size={28} style={styles.playTitle}>
              🎮 PLAY NOW
            </NeonText>

            <View style={styles.gameModesGrid}>
              <MagneticButton
                title="Online"
                icon={<Ionicons name="globe" size={24} color="#fff" />}
                colors={['#FF6B6B', '#FF8E53']}
                onPress={() => navigation.navigate('Lobby', { mode: 'online' })}
                style={styles.gameModeButton}
              />

              <LiquidButton
                title="Friends"
                icon={<Ionicons name="people" size={24} color="#fff" />}
                colors={['#4ECDC4', '#44A08D']}
                onPress={() => navigation.navigate('Lobby', { mode: 'friends' })}
                style={styles.gameModeButton}
              />

              <MagneticButton
                title="Local"
                icon={<Ionicons name="phone-portrait" size={24} color="#fff" />}
                colors={['#FFD93D', '#FFA500']}
                onPress={() => navigation.navigate('Lobby', { mode: 'local' })}
                style={styles.gameModeButton}
              />

              <LiquidButton
                title="Computer"
                icon={<Ionicons name="desktop" size={24} color="#fff" />}
                colors={['#A8E6CF', '#3DDC84']}
                onPress={() => navigation.navigate('Lobby', { mode: 'computer' })}
                style={styles.gameModeButton}
              />
            </View>
          </HolographicCard>

          {/* Daily Missions */}
          <DailyMissionsCard navigation={navigation} style={styles.section} />

          {/* Boosters */}
          <BoosterCard navigation={navigation} style={styles.section} />

          {/* Lucky Spin */}
          <LuckySpinWheel navigation={navigation} style={styles.section} />

          {/* Leaderboard */}
          <LeaderboardCard navigation={navigation} style={styles.section} />

          {/* Referral */}
          <ReferralCard navigation={navigation} style={styles.section} />

          {/* Quick Actions */}
          <HolographicCard style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <MagneticButton
                title="Store"
                icon={<Ionicons name="cart" size={20} color="#fff" />}
                colors={['#667eea', '#764ba2']}
                onPress={() => navigation.navigate('Store')}
                style={styles.quickActionBtn}
              />
              <LiquidButton
                title="Inventory"
                icon={<Ionicons name="cube" size={20} color="#fff" />}
                colors={['#f093fb', '#f5576c']}
                onPress={() => navigation.navigate('Inventory')}
                style={styles.quickActionBtn}
              />
            </View>
            <View style={styles.quickActionsGrid}>
              <MagneticButton
                title="Social"
                icon={<Ionicons name="chatbubbles" size={20} color="#fff" />}
                colors={['#4facfe', '#00f2fe']}
                onPress={() => navigation.navigate('Social')}
                style={styles.quickActionBtn}
              />
              <LiquidButton
                title="Events"
                icon={<Ionicons name="trophy" size={20} color="#fff" />}
                colors={['#43e97b', '#38f9d7']}
                onPress={() => navigation.navigate('Event')}
                style={styles.quickActionBtn}
              />
            </View>
          </HolographicCard>

          <View style={styles.bottomPadding} />
        </Animated.ScrollView>

        {/* Floating Action Menu */}
        <FloatingActionMenu
          actions={floatingActions}
          mainIcon="+"
          mainColors={['#ff0080', '#ff8c00']}
          position="bottom-right"
        />
      </AnimatedBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 50,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    alignItems: 'center',
    marginBottom: 20,
  },
  coinsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coinCard: {
    flex: 1,
    marginRight: 8,
  },
  gemCard: {
    flex: 1,
    marginLeft: 8,
  },
  coinContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinInfo: {
    marginLeft: 12,
  },
  coinLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  gemIcon: {
    fontSize: 40,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  statIcon: {
    fontSize: 24,
  },
  playTitle: {
    marginBottom: 20,
  },
  gameModesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gameModeButton: {
    width: '48%',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickActionBtn: {
    flex: 1,
    marginHorizontal: 6,
  },
  bottomPadding: {
    height: 100,
  },
});
