import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

export default function LuckySpinWheel({ onSpin, spinsLeft = 1 }) {
  const [spinning, setSpinning] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const prizes = [
    { label: '50', color: '#FF6B6B' },
    { label: '100', color: '#4ECDC4' },
    { label: '25', color: '#FFD93D' },
    { label: '200', color: '#95E1D3' },
    { label: '75', color: '#F38181' },
    { label: '500', color: '#AA96DA' },
    { label: '150', color: '#FCBAD3' },
    { label: '1000', color: '#A8E6CF' },
  ];

  const handleSpin = () => {
    if (spinning || spinsLeft === 0) return;

    setSpinning(true);
    const randomRotation = Math.floor(Math.random() * 360) + 1440; // At least 4 full rotations

    Animated.timing(rotateAnim, {
      toValue: randomRotation,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      const prizeIndex = Math.floor((randomRotation % 360) / 45);
      const prize = prizes[prizeIndex];
      onSpin?.(prize.label);
    });
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
        <Text style={styles.title}>🎰 Lucky Spin</Text>
        <Text style={styles.subtitle}>Spin daily for rewards!</Text>

        <View style={styles.wheelContainer}>
          <Animated.View style={[styles.wheel, { transform: [{ rotate }] }]}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
              {prizes.map((prize, index) => {
                const angle = (index * 45 * Math.PI) / 180;
                return (
                  <Path
                    key={index}
                    d={`M 100 100 L ${100 + 90 * Math.cos(angle)} ${100 + 90 * Math.sin(angle)} A 90 90 0 0 1 ${100 + 90 * Math.cos(angle + (45 * Math.PI) / 180)} ${100 + 90 * Math.sin(angle + (45 * Math.PI) / 180)} Z`}
                    fill={prize.color}
                    stroke="#FFF"
                    strokeWidth="2"
                  />
                );
              })}
              <Circle cx="100" cy="100" r="20" fill="#FFF" />
            </Svg>
          </Animated.View>

          {/* Pointer */}
          <View style={styles.pointer}>
            <Ionicons name="caret-down" size={40} color="#FFD700" />
          </View>
        </View>

        <View style={styles.spinsInfo}>
          <Ionicons name="ticket" size={20} color="#FFD700" />
          <Text style={styles.spinsText}>{spinsLeft} Spins Left Today</Text>
        </View>

        <TouchableOpacity
          style={[styles.spinButton, (spinning || spinsLeft === 0) && styles.spinButtonDisabled]}
          onPress={handleSpin}
          disabled={spinning || spinsLeft === 0}
        >
          <LinearGradient
            colors={spinning || spinsLeft === 0 ? ['#78909C', '#607D8B'] : ['#4CAF50', '#388E3C']}
            style={styles.spinGradient}
          >
            <Ionicons name={spinning ? 'hourglass' : 'play'} size={24} color="#FFF" />
            <Text style={styles.spinText}>
              {spinning ? 'Spinning...' : spinsLeft === 0 ? 'No Spins Left' : 'SPIN NOW'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
  },
  gradient: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 20,
  },
  wheelContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  wheel: {
    width: 200,
    height: 200,
  },
  pointer: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -20,
  },
  spinsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  spinsText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  spinButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  spinButtonDisabled: {
    opacity: 0.6,
  },
  spinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  spinText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
