import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, Pressable, Image, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { rollDice } from '../utils/gameLogic';

export default function Dice({ onRolled, rollValue, spinKey, size = 64 }) {
  const [value, setValue] = useState(1);
  const spin = useRef(new Animated.Value(0)).current;

  const onPress = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    const next = rollDice();
    Animated.timing(spin, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
      spin.setValue(0);
      setValue(next);
      onRolled?.(next);
    });
  };

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // External synced spin
  useEffect(() => {
    if (!spinKey || !rollValue) return;
    Animated.timing(spin, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
      spin.setValue(0);
      setValue(rollValue);
    });
  }, [spinKey, rollValue]);

  const faces = {
    1: require('../assets/dice1.png'),
    2: require('../assets/dice2.png'),
    3: require('../assets/dice3.png'),
    4: require('../assets/dice4.png'),
    5: require('../assets/dice5.png'),
    6: require('../assets/dice6.png'),
  };

  return (
    <Pressable onPress={onPress} style={{ alignItems:'center' }}>
      <Animated.View style={{ transform:[{ rotate }], width:size, height:size, borderRadius:Math.max(8, size*0.18), overflow:'hidden' }}>
        <Image source={faces[value] || faces[1]} style={{ width:size, height:size }} resizeMode="contain" />
      </Animated.View>
      <View style={{ height:8 }} />
      <Text style={{ color:'#111827', fontWeight:'600' }}>ROLL</Text>
    </Pressable>
  );
}
