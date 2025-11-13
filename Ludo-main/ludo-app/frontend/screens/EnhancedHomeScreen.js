import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../components/AnimatedBackground';
import PremiumGradientCard from '../components/PremiumGradientCard';
import GlowingButton from '../components/GlowingButton';
import NeonText from '../components/NeonText';
import PulsingCoinIcon from '../components/PulsingCoinIcon';
// import GlassCard from '../components/GlassCard';
import FloatingActionMenu from '../components/FloatingActionMenu';
import ProfileCard from '../components/ProfileCard';
import DailyMissionsCard from '../components/DailyMissionsCard';
import TournamentBanner from '../components/TournamentBanner';
import LeaderboardCard from '../components/LeaderboardCard';
import QuickStatsCard from '../components/QuickStatsCard';
import WinStreakBanner from '../components/WinStreakBanner';
import LuckySpinWheel from '../components/LuckySpinWheel';
import ReferralCard from '../components/ReferralCard';
import BoosterCard from '../components/BoosterCard';
import BannerCarousel from '../components/BannerCarousel';
import ParticleEffect from '../components/ParticleEffect';
import { getWallet } from '../services/api';

const { width } = Dimensions.get('window');

export default function EnhancedHomeScreen({ navigation, user }) {
  const [coins, setCoins] = useState(5420);
  const [gems, setGems] = useState(150);
  const [winStreak, setWinStreak] = useState(5);

  const userStats = {
    gamesPlayed: 45,
    gamesWon: 28,
    winRate: 62,
    totalEarnings: 5420,
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
    <AnimatedBackground colors={['#667eea', '#764ba2', '#f093fb']}>
      <ParticleEffect />
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Coins */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <NeonText color="#fff" size={28} animated>
              LUDO HUB
            </NeonText>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.coinButton}
              onPress={() => navigation.navigate('Wallet')}
            >
              <PulsingCoinIcon size={40} />
              <View style={styles.coinInfo}>
                <Text style={styles.coinValue}>{coins.toLocaleString()}</Text>
                <Text style={styles.coinLabel}>Coins</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileSection}>
          <ProfileCard
            name={user?.name || 'Player'}
            level={user?.level || 12}
            avatar={user?.avatar}
            coins={coins}
            gems={gems}
            onPress={() => navigation.navigate('Profile')}
          />
        </View>

        {/* Win Streak Banner */}
        {winStreak > 0 && (
          <WinStreakBanner streak={winStreak} style={styles.section} />
        )}

        {/* Banner Carousel */}
        <BannerCarousel style={styles.section} />

        {/* Tournament Banner */}
        <TournamentBanner navigation={navigation} style={styles.section} />

        {/* Quick Stats */}
        <QuickStatsCard stats={userStats} style={styles.section} />

        {/* Play Ludo - Main Action */}
        <PremiumGradientCard 
          colors={['#FF6B6B', '#FFD93D', '#6BCF7F']}
          style={styles.section}
        >
          <View style={styles.playSection}>
            <NeonText color="#FF6B6B" size={32}>
              🎮 PLAY LUDO
            </NeonText>
            
            <View style={styles.gameModes}>
              <GlowingButton
                title="Online"
                icon={<Ionicons name="globe" size={20} color="#fff" />}
                colors={['#FF6B6B', '#FF8E53']}
                glowColor="#FF6B6B"
                onPress={() => navigation.navigate('Lobby', { mode: 'online' })}
                style={styles.modeButton}
                size="large"
              />
              
              <GlowingButton
                title="Friends"
                icon={<Ionicons name="people" size={20} color="#fff" />}
                colors={['#4ECDC4', '#44A08D']}
                glowColor="#4ECDC4"
                onPress={() => navigation.navigate('Lobby', { mode: 'friends' })}
                style={styles.modeButton}
                size="large"
              />
            </View>

            <View style={styles.gameModes}>
              <GlowingButton
                title="Local"
                icon={<Ionicons name="phone-portrait" size={20} color="#fff" />}
                colors={['#FFD93D', '#FFA500']}
                glowColor="#FFD93D"
                onPress={() => navigation.navigate('Lobby', { mode: 'local' })}
                style={styles.modeButton}
                size="large"
              />
              
              <GlowingButton
                title="Computer"
                icon={<Ionicons name="desktop" size={20} color="#fff" />}
                colors={['#A8E6CF', '#3DDC84']}
                glowColor="#A8E6CF"
                onPress={() => navigation.navigate('Lobby', { mode: 'computer' })}
                style={styles.modeButton}
                size="large"
              />
            </View>
          </View>
        </PremiumGradientCard>

        {/* Daily Missions */}
        <DailyMissionsCard navigation={navigation} style={styles.section} />

        {/* Boosters */}
        <BoosterCard navigation={navigation} style={styles.section} />

        {/* Lucky Spin Wheel */}
        <LuckySpinWheel navigation={navigation} style={styles.section} />

        {/* Leaderboard */}
        <LeaderboardCard navigation={navigation} style={styles.section} />

        {/* Referral Card */}
        <ReferralCard navigation={navigation} style={styles.section} />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <GlowingButton
            title="Store"
            icon={<Ionicons name="cart" size={20} color="#fff" />}
            colors={['#667eea', '#764ba2']}
            onPress={() => navigation.navigate('Store')}
            style={styles.quickActionButton}
          />
          
          <GlowingButton
            title="Inventory"
            icon={<Ionicons name="cube" size={20} color="#fff" />}
            colors={['#f093fb', '#f5576c']}
            onPress={() => navigation.navigate('Inventory')}
            style={styles.quickActionButton}
          />
        </View>

        <View style={styles.quickActions}>
          <GlowingButton
            title="Social"
            icon={<Ionicons name="chatbubbles" size={20} color="#fff" />}
            colors={['#4facfe', '#00f2fe']}
            onPress={() => navigation.navigate('Social')}
            style={styles.quickActionButton}
          />
          
          <GlowingButton
            title="Events"
            icon={<Ionicons name="trophy" size={20} color="#fff" />}
            colors={['#43e97b', '#38f9d7']}
            onPress={() => navigation.navigate('Event')}
            style={styles.quickActionButton}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Action Menu */}
      <FloatingActionMenu
        actions={floatingActions}
        mainIcon="+"
        mainColors={['#FF6B6B', '#FF8E53']}
        position="bottom-right"
      />
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  coinInfo: {
    marginLeft: 8,
  },
  coinValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  coinLabel: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.8,
  },
  profileSection: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  playSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  gameModes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  modeButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  bottomPadding: {
    height: 100,
  },
});
