import React, { useMemo, useRef, useEffect } from 'react';
import { View, Pressable, Animated, Image } from 'react-native';
import { indexToXY } from '../utils/gameLogic';

export default function Token({ pos, color = '#111827', boardSize = 320, offset = 0, onPress, selectable = false, playerIndex = 0, imageSource, stackCount = 1, isTurn = false, shakeKey = 0 }) {
  const size = Math.max(14, Math.floor(boardSize / 18));
  const jitter = (offset % 2) * (size * 0.4);
  const dx = (offset < 2 ? 1 : -1) * jitter;
  const dy = (offset % 2 === 0 ? 1 : -1) * jitter;

  // Compute target pixel coordinates for the token center
  const target = useMemo(() => {
    const { x, y } = indexToXY(pos, playerIndex);
    return { left: x * boardSize - size / 2 + dx, top: y * boardSize - size / 2 + dy };
  }, [pos, playerIndex, boardSize, size, dx, dy]);

  const leftVal = useRef(new Animated.Value(target.left)).current;
  const topVal = useRef(new Animated.Value(target.top)).current;
  const scaleVal = useRef(new Animated.Value(1)).current;
  const pulseVal = useRef(new Animated.Value(0)).current; // 0..1 for pulsing ring when it's your turn
  const shakeVal = useRef(new Animated.Value(0)).current; // -1..1

  // Animate when target changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(leftVal, { toValue: target.left, duration: 300, useNativeDriver: false }),
      Animated.timing(topVal, { toValue: target.top, duration: 300, useNativeDriver: false }),
      Animated.sequence([
        Animated.timing(scaleVal, { toValue: 1.12, duration: 120, useNativeDriver: true }),
        Animated.timing(scaleVal, { toValue: 1.0, duration: 160, useNativeDriver: true }),
      ]),
    ]).start();
  }, [target.left, target.top]);

  // Turn pulse loop
  useEffect(() => {
    let loop;
    if (isTurn) {
      pulseVal.setValue(0);
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseVal, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseVal, { toValue: 0, duration: 900, useNativeDriver: true }),
        ])
      );
      loop.start();
    } else {
      pulseVal.stopAnimation();
      pulseVal.setValue(0);
    }
    return () => {
      try { loop && loop.stop(); } catch {}
    };
  }, [isTurn]);

  // Shake on demand when shakeKey changes
  useEffect(() => {
    if (!shakeKey) return;
    shakeVal.setValue(0);
    Animated.sequence([
      Animated.timing(shakeVal, { toValue: 1, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeVal, { toValue: -1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeVal, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeVal, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeKey]);

  return (
    <Animated.View style={{ position: 'absolute', left: leftVal, top: topVal, transform:[{ scale: scaleVal }, { translateX: Animated.multiply(shakeVal, 3) }] }}>
      {/* Pulsing ring when it's your turn */}
      {isTurn && (
        <Animated.View
          pointerEvents="none"
          style={{
            position:'absolute',
            left: -6,
            top: -6,
            width: (Math.max(14, Math.floor(boardSize / 18))) + 12,
            height: (Math.max(14, Math.floor(boardSize / 18))) + 12,
            borderRadius: (Math.max(14, Math.floor(boardSize / 18))) / 2 + 6,
            borderWidth: 2,
            borderColor: color,
            opacity: pulseVal.interpolate({ inputRange:[0,1], outputRange:[0.2, 0.65] }),
            transform: [{ scale: pulseVal.interpolate({ inputRange:[0,1], outputRange:[1, 1.15] }) }],
          }}
        />
      )}
      <Pressable onPress={onPress} disabled={!onPress}>
        {imageSource ? (
          <View style={{ width: size, height: size, borderRadius: size/2, overflow:'hidden', borderWidth: selectable ? 3 : 2, borderColor: selectable ? '#fde047' : '#000' }}>
            <Image source={imageSource} style={{ width: size, height: size }} resizeMode="contain" />
          </View>
        ) : (
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              borderWidth: selectable ? 3 : 2,
              borderColor: selectable ? '#fde047' : '#000',
            }}
          />
        )}
        {/* Selectable glow */}
        {selectable && (
          <View style={{ position:'absolute', left:-4, top:-4, right:-4, bottom:-4, borderRadius: size/2 + 4, borderWidth:2, borderColor:'#fde04755' }} pointerEvents="none" />
        )}
        {stackCount > 1 && (
          <View style={{ position:'absolute', right:-4, top:-4, minWidth:16, height:16, paddingHorizontal:3, borderRadius:8, backgroundColor:'#111827', alignItems:'center', justifyContent:'center' }}>
            <Animated.Text style={{ color:'#fff', fontSize:10, fontWeight:'700' }}>{stackCount}</Animated.Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
