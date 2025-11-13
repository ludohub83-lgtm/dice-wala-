import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, Animated } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function DailyRewardPopup({ visible, onClose, reward = 5 }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.gradient}>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons name="gift" size={80} color="#FFF" />
            </Animated.View>
            <Text style={styles.title}>Daily Reward! 🎉</Text>
            <Text style={styles.subtitle}>You've earned</Text>
            <View style={styles.rewardBox}>
              <Ionicons name="star" size={32} color="#FFD700" />
              <Text style={styles.rewardAmount}>{reward}</Text>
              <Text style={styles.rewardLabel}>Stars</Text>
            </View>
            <Text style={styles.message}>Come back in 24 hours for more stars!</Text>
            <Button
              mode="contained"
              onPress={onClose}
              style={styles.button}
              buttonColor="#FFF"
              textColor="#FF9800"
            >
              Claim Reward
            </Button>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
  },
  gradient: {
    padding: 32,
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginTop: 8,
  },
  rewardBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginVertical: 20,
    minWidth: 150,
  },
  rewardAmount: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  rewardLabel: {
    color: '#FFF',
    fontSize: 16,
  },
  message: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 4,
  },
});
