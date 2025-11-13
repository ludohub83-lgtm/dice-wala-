/**
 * Dice Roller Component
 * Animated dice with roll functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

export default function DiceRoller({ value, onRoll, disabled, isMyTurn }) {
  const [isRolling, setIsRolling] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (value !== null) {
      // Animate when dice value changes
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.3,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        rotateAnim.setValue(0);
        setIsRolling(false);
      });
    }
  }, [value]);

  const handleRoll = async () => {
    if (disabled || isRolling || !isMyTurn) return;
    
    setIsRolling(true);
    
    // Start rolling animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ).start();

    await onRoll();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getDiceDots = (num) => {
    const dotPositions = {
      1: [[1, 1]],
      2: [[0, 0], [2, 2]],
      3: [[0, 0], [1, 1], [2, 2]],
      4: [[0, 0], [0, 2], [2, 0], [2, 2]],
      5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
      6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
    };

    return dotPositions[num] || [];
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleRoll}
        disabled={disabled || isRolling || !isMyTurn}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.dice,
            {
              transform: [{ rotate: spin }, { scale: scaleAnim }],
              opacity: disabled || !isMyTurn ? 0.5 : 1,
            },
          ]}
        >
          {value ? (
            <View style={styles.diceGrid}>
              {[0, 1, 2].map((row) => (
                <View key={row} style={styles.diceRow}>
                  {[0, 1, 2].map((col) => {
                    const hasDot = getDiceDots(value).some(
                      ([r, c]) => r === row && c === col
                    );
                    return (
                      <View key={col} style={styles.dotContainer}>
                        {hasDot && <View style={styles.dot} />}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.rollText}>ROLL</Text>
          )}
        </Animated.View>
      </TouchableOpacity>
      
      {isMyTurn && !disabled && (
        <Text style={styles.promptText}>Tap to roll!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dice: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#333',
  },
  diceGrid: {
    width: '100%',
    height: '100%',
    padding: 10,
  },
  diceRow: {
    flex: 1,
    flexDirection: 'row',
  },
  dotContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  rollText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  promptText: {
    marginTop: 10,
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
