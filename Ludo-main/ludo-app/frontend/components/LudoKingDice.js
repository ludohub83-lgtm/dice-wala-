import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const DICE_FACES = {
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
};

export default function LudoKingDice({ 
  value, 
  onRoll, 
  enabled = true, 
  rolling = false,
  playerColor = '#2196F3'
}) {
  const [isRolling, setIsRolling] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || 1);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value) {
      setCurrentValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (rolling || isRolling) {
      startRollingAnimation();
    }
  }, [rolling, isRolling]);

  const startRollingAnimation = () => {
    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Random face changes
    const interval = setInterval(() => {
      setCurrentValue(Math.floor(Math.random() * 6) + 1);
    }, 50);

    // Stop after 1 second
    setTimeout(() => {
      clearInterval(interval);
      rotateAnim.setValue(0);
      setIsRolling(false);
    }, 1000);
  };

  const handlePress = () => {
    if (!enabled || isRolling || rolling) return;

    setIsRolling(true);

    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Shake animation
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    if (onRoll) {
      onRoll();
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderDots = () => {
    const dots = DICE_FACES[currentValue] || DICE_FACES[1];
    
    return dots.map((pos, index) => (
      <View
        key={index}
        style={[
          styles.dot,
          {
            left: `${pos[0] * 100}%`,
            top: `${pos[1] * 100}%`,
          },
        ]}
      />
    ));
  };

  return (
    <View style={styles.container}>
      {enabled && !isRolling && !rolling && (
        <View style={styles.tapHint}>
          <Ionicons name="hand-left" size={20} color={playerColor} />
          <Text style={[styles.tapText, { color: playerColor }]}>Tap to Roll</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handlePress}
        disabled={!enabled || isRolling || rolling}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <Animated.View
          style={[
            styles.dice,
            {
              backgroundColor: enabled ? '#FFF' : '#E0E0E0',
              borderColor: playerColor,
              transform: [
                { rotate },
                { scale: scaleAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          {renderDots()}
        </Animated.View>
      </TouchableOpacity>

      {(isRolling || rolling) && (
        <View style={styles.rollingIndicator}>
          <Text style={styles.rollingText}>Rolling...</Text>
        </View>
      )}

      {value && !isRolling && !rolling && (
        <View style={[styles.valueDisplay, { backgroundColor: playerColor }]}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tapText: {
    fontSize: 14,
    fontWeight: '600',
  },
  touchable: {
    padding: 10,
  },
  dice: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 4,
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#333',
    marginLeft: -7,
    marginTop: -7,
  },
  rollingIndicator: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    borderRadius: 12,
  },
  rollingText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: 'bold',
  },
  valueDisplay: {
    marginTop: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  valueText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
