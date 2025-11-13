import React, { useRef, useState, useEffect } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const THEME_COLORS = {
  default: { bg: '#2563eb', glow: '#2563eb' },
  halloween: { bg: '#7c2d12', glow: '#fb923c' },
  football: { bg: '#14532d', glow: '#22c55e' },
  newyear: { bg: '#1e3a8a', glow: '#38bdf8' },
  tricolour: { bg: '#0f766e', glow: '#22d3ee' },
  heart: { bg: '#9d174d', glow: '#f472b6' },
  colors: { bg: '#6b21a8', glow: '#a78bfa' },
  summer: { bg: '#b45309', glow: '#f59e0b' },
  sixer: { bg: '#991b1b', glow: '#ef4444' },
  cricket: { bg: '#052e16', glow: '#16a34a' },
  diya: { bg: '#78350f', glow: '#f59e0b' },
  pumpkin: { bg: '#9a3412', glow: '#fb923c' },
};

// Dice face patterns (dots)
const DICE_PATTERNS = {
  1: [[0.5, 0.5]],
  2: [[0.3, 0.3], [0.7, 0.7]],
  3: [[0.3, 0.3], [0.5, 0.5], [0.7, 0.7]],
  4: [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]],
  5: [[0.3, 0.3], [0.7, 0.3], [0.5, 0.5], [0.3, 0.7], [0.7, 0.7]],
  6: [[0.3, 0.25], [0.3, 0.5], [0.3, 0.75], [0.7, 0.25], [0.7, 0.5], [0.7, 0.75]],
};

export default function Dice({ onRoll, enabled = true, themeKey = 'default', lastRoll = null }) {
  const [value, setValue] = useState(lastRoll || 1);
  const spin = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (lastRoll !== null && lastRoll !== value) {
      setValue(lastRoll);
      // Animate new value
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [lastRoll]);

  const roll = () => {
    if (!enabled) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    
    // Animate rolling
    const rollAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(spin, {
          toValue: 1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(spin, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 6 }
    );

    rollAnim.start(() => {
      const next = Math.floor(Math.random() * 6) + 1;
      spin.setValue(0);
      setValue(next);
      onRoll?.(next);
      
      // Success animation
      Animated.parallel([
        Animated.sequence([
          Animated.timing(bounce, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(bounce, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(glow, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]),
      ]).start();
      
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    });
  };

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const theme = THEME_COLORS[themeKey] || THEME_COLORS.default;
  const boxBg = enabled ? theme.bg : '#94a3b8';
  const shadowCol = enabled ? theme.glow : '#64748b';
  const patterns = DICE_PATTERNS[value] || DICE_PATTERNS[1];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.diceContainer,
          {
            transform: [{ rotate }, { scale: bounce }],
            shadowColor: shadowCol,
            shadowOpacity: enabled ? 0.5 : 0.2,
          },
        ]}
      >
        <LinearGradient
          colors={enabled ? [boxBg, theme.glow] : ['#94a3b8', '#64748b']}
          style={styles.diceFace}
        >
          {/* Dice dots */}
          {patterns.map(([x, y], idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  left: `${x * 100}%`,
                  top: `${y * 100}%`,
                  marginLeft: -4,
                  marginTop: -4,
                },
              ]}
            />
          ))}
        </LinearGradient>
        {/* Glow effect */}
        {enabled && (
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: glowOpacity,
                backgroundColor: shadowCol,
              },
            ]}
          />
        )}
      </Animated.View>
      <View style={{ height: 12 }} />
      <Button
        mode="contained"
        onPress={roll}
        disabled={!enabled}
        buttonColor={enabled ? '#22c55e' : '#94a3b8'}
        textColor="#fff"
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {enabled ? '🎲 Roll Dice' : '⏳ Wait...'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  diceContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 12,
    overflow: 'hidden',
  },
  diceFace: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  glow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 20,
    top: '-10%',
    left: '-10%',
  },
  button: {
    borderRadius: 12,
    minWidth: 140,
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
