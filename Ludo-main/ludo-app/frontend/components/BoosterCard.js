import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function BoosterCard({ boosters = [], onUse }) {
  const boosterTypes = [
    { id: 'shield', name: 'Shield', icon: 'shield', color: ['#2196F3', '#1976D2'], description: 'Protect from capture' },
    { id: 'double', name: 'Double', icon: 'flash', color: ['#FF9800', '#F57C00'], description: 'Roll dice twice' },
    { id: 'lucky', name: 'Lucky', icon: 'star', color: ['#4CAF50', '#388E3C'], description: 'Higher chance of 6' },
    { id: 'swap', name: 'Swap', icon: 'swap-horizontal', color: ['#9C27B0', '#7B1FA2'], description: 'Swap positions' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flash" size={24} color="#FFD700" />
        <Text style={styles.title}>Power-ups</Text>
      </View>

      <View style={styles.boostersGrid}>
        {boosterTypes.map((booster) => {
          const count = boosters.find(b => b.id === booster.id)?.count || 0;
          
          return (
            <TouchableOpacity
              key={booster.id}
              style={styles.boosterCard}
              onPress={() => count > 0 && onUse?.(booster.id)}
              disabled={count === 0}
            >
              <LinearGradient
                colors={count > 0 ? booster.color : ['#78909C', '#607D8B']}
                style={styles.boosterGradient}
              >
                <Ionicons name={booster.icon} size={32} color="#FFF" />
                <Text style={styles.boosterName}>{booster.name}</Text>
                <Text style={styles.boosterDesc}>{booster.description}</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>x{count}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  boostersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  boosterCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  boosterGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  boosterName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  boosterDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    textAlign: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
