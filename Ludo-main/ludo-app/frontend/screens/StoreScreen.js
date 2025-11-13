import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import BannerCarousel from '../components/BannerCarousel';
import AnimatedCard from '../components/AnimatedCard';

export default function StoreScreen({ navigation }) {
  const banners = [
    {
      title: 'Mega Sale! 🎉',
      subtitle: 'Get 50% extra coins on all packages',
      icon: 'gift',
      colors: ['#F44336', '#D32F2F'],
    },
    {
      title: 'New Dice Themes! 🎲',
      subtitle: 'Unlock exclusive dice designs',
      icon: 'dice',
      colors: ['#9C27B0', '#7B1FA2'],
    },
    {
      title: 'Refer & Earn! 🎁',
      subtitle: 'Invite friends and earn 200 stars',
      icon: 'people',
      colors: ['#4CAF50', '#388E3C'],
    },
  ];

  const coinPackages = [
    { id: 1, coins: 50, price: '₹50', bonus: '0%', color: ['#607D8B', '#455A64'] },
    { id: 2, coins: 100, price: '₹100', bonus: '0%', color: ['#2196F3', '#1976D2'] },
    { id: 3, coins: 250, price: '₹250', bonus: '10%', color: ['#4CAF50', '#388E3C'] },
    { id: 4, coins: 500, price: '₹500', bonus: '20%', color: ['#FF9800', '#F57C00'] },
    { id: 5, coins: 1000, price: '₹1000', bonus: '30%', color: ['#E91E63', '#C2185B'] },
    { id: 6, coins: 2500, price: '₹2500', bonus: '50%', color: ['#9C27B0', '#7B1FA2'] },
  ];

  const diceThemes = [
    { id: 1, name: 'Golden Dice', price: 200, emoji: '🟡', color: ['#FFD700', '#FFA500'], description: 'Luxury gold finish', popular: true },
    { id: 2, name: 'Diamond Dice', price: 250, emoji: '💎', color: ['#00BCD4', '#0097A7'], description: 'Sparkling diamonds' },
    { id: 3, name: 'Fire Dice', price: 200, emoji: '🔥', color: ['#FF5722', '#E64A19'], description: 'Blazing hot rolls' },
    { id: 4, name: 'Ice Dice', price: 200, emoji: '❄️', color: ['#2196F3', '#1565C0'], description: 'Cool & frosty' },
    { id: 5, name: 'Rainbow Dice', price: 250, emoji: '🌈', color: ['#9C27B0', '#E91E63'], description: 'Colorful magic' },
    { id: 6, name: 'Neon Dice', price: 220, emoji: '⚡', color: ['#00E676', '#00C853'], description: 'Electric glow' },
  ];

  const items = [
    { id: 1, name: 'Lucky Dice', price: 5, icon: 'dice', color: ['#FF9800', '#F57C00'], description: 'Choose any number 1-6' },
    { id: 2, name: 'Shield', price: 50, icon: 'shield', color: ['#2196F3', '#1976D2'], description: 'Protect from capture' },
  ];

  return (
    <Screen>
      <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>🛍️ Store</Text>
            <TouchableOpacity>
              <Ionicons name="notifications" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Banner Carousel */}
          <BannerCarousel banners={banners} />

          {/* Coin Packages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coin Packages</Text>
            <View style={styles.packagesGrid}>
              {coinPackages.map((pkg, index) => (
                <AnimatedCard
                  key={pkg.id}
                  colors={pkg.color}
                  onPress={() => navigation.navigate('ManualPayment', { 
                    package: pkg,
                    isStarPackage: true 
                  })}
                  style={styles.packageCard}
                  delay={index * 50}
                >
                  <View style={styles.packageContent}>
                    {pkg.bonus !== '0%' && (
                      <View style={styles.bonusBadge}>
                        <Text style={styles.bonusText}>+{pkg.bonus}</Text>
                      </View>
                    )}
                    <Text style={styles.coinAmount}>{pkg.coins.toLocaleString()}</Text>
                    <Text style={styles.coinLabel}>Stars</Text>
                    <View style={styles.priceTag}>
                      <Text style={styles.priceText}>{pkg.price}</Text>
                    </View>
                    {pkg.bonus !== '0%' && (
                      <View style={styles.bestValue}>
                        <Text style={styles.bestValueText}>🔥 Best Value</Text>
                      </View>
                    )}
                  </View>
                </AnimatedCard>
              ))}
            </View>
          </View>

          {/* Dice Themes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎲 Dice Themes</Text>
            <View style={styles.itemsGrid}>
              {diceThemes.map((theme) => (
                <TouchableOpacity key={theme.id} style={styles.itemCard}>
                  <LinearGradient colors={theme.color} style={styles.itemGradient}>
                    <View style={styles.dicePreview}>
                      <Text style={styles.diceEmoji}>{theme.emoji}</Text>
                    </View>
                    <Text style={styles.itemName}>{theme.name}</Text>
                    <Text style={styles.itemDescription}>{theme.description}</Text>
                    <View style={styles.itemPrice}>
                      <Text style={styles.itemPriceText}>₹{theme.price}</Text>
                    </View>
                    {theme.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>POPULAR</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Power-ups & Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Power-ups & Items</Text>
            <View style={styles.itemsGrid}>
              {items.map((item) => (
                <TouchableOpacity key={item.id} style={styles.itemCard}>
                  <LinearGradient colors={item.color} style={styles.itemGradient}>
                    <Ionicons name={item.icon} size={40} color="#FFF" />
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                    <View style={styles.itemPrice}>
                      <Text style={styles.itemPriceText}>₹{item.price}</Text>
                    </View>
                    <Text style={styles.usageLimit}>1 per game</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Special Offers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <TouchableOpacity style={styles.offerCard}>
              <LinearGradient colors={['#F44336', '#D32F2F']} style={styles.offerGradient}>
                <View style={styles.offerBadge}>
                  <Text style={styles.offerBadgeText}>LIMITED</Text>
                </View>
                <Text style={styles.offerTitle}>Mega Deal!</Text>
                <Text style={styles.offerSubtitle}>Daily Stars Subscription</Text>
                <View style={styles.offerFeatures}>
                  <View style={styles.featureRow}>
                    <Ionicons name="calendar" size={20} color="#FFD700" />
                    <Text style={styles.featureText}>Claim 50 Stars Daily</Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Ionicons name="infinite" size={20} color="#FFD700" />
                    <Text style={styles.featureText}>Unlimited Duration</Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Ionicons name="gift" size={20} color="#FFD700" />
                    <Text style={styles.featureText}>Total: 1,500 Stars/Month</Text>
                  </View>
                </View>
                <View style={styles.offerPrice}>
                  <Text style={styles.offerNewPrice}>₹1,000</Text>
                  <Text style={styles.offerPriceLabel}>One-time Payment</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
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
    padding: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  packageCard: {
    width: '47%',
    minHeight: 160,
  },
  packageContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    position: 'relative',
    paddingVertical: 8,
  },
  bonusBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 10,
  },
  bonusText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  coinAmount: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  coinLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  priceTag: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  priceText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bestValue: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  bestValueText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  itemGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  itemPrice: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 8,
  },
  itemPriceText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  usageLimit: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic',
  },
  offerCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
  },
  offerGradient: {
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  offerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  offerBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  offerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  offerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginTop: 8,
  },
  offerPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  offerOldPrice: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    textDecorationLine: 'line-through',
  },
  offerFeatures: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginVertical: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: '#FFF',
    fontSize: 16,
    flex: 1,
  },
  offerNewPrice: {
    color: '#FFD700',
    fontSize: 36,
    fontWeight: 'bold',
  },
  offerPriceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
});

// Additional styles for dice themes
const diceThemeStyles = StyleSheet.create({
  dicePreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  diceEmoji: {
    fontSize: 36,
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  usageLimit: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

// Merge styles
Object.assign(styles, diceThemeStyles);
