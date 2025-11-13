import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function GameModeCard({ title, subtitle, icon, colors, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <LinearGradient colors={colors} style={styles.gradient}>
        <Ionicons name={icon} size={40} color="#FFF" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    marginBottom: 12,
  },
  gradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
});
