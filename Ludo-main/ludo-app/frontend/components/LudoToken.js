import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { positionToBoardXY } from '../utils/ludoGameLogic';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 32, 400);
const TOKEN_SIZE = BOARD_SIZE / 18;

const PLAYER_COLORS = [
  '#EF4444', // Red
  '#2563EB', // Blue
  '#22C55E', // Green
  '#FBBF24', // Yellow
];

export default function LudoToken({
  position,
  playerIndex,
  tokenIndex,
  boardSize = BOARD_SIZE,
  onPress,
  selectable = false,
  isMyTurn = false,
  isSelected = false,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  const color = PLAYER_COLORS[playerIndex % 4];
  const size = TOKEN_SIZE;

  // Calculate position on board
  const getPosition = () => {
    const { x, y } = positionToBoardXY(position, playerIndex, tokenIndex);
    const cellSize = boardSize / 15;
    return {
      x: x * cellSize - size / 2,
      y: y * cellSize - size / 2,
    };
  };

  const pos = getPosition();

  // Animate position changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [position]);

  // Pulse animation when it's my turn and token is selectable
  useEffect(() => {
    if (isMyTurn && selectable) {
      const pulseAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnim.start();
      return () => pulseAnim.stop();
    } else {
      pulse.setValue(1);
    }
  }, [isMyTurn, selectable]);

  const tokenStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    borderWidth: isSelected ? 4 : 3,
    borderColor: isSelected ? '#FFD700' : '#FFF',
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const content = (
    <Animated.View
      style={[
        styles.token,
        tokenStyle,
        {
          left: pos.x,
          top: pos.y,
          transform: [
            { scale: Animated.multiply(scale, pulse) },
          ],
        },
      ]}
    >
      {/* Inner circle for depth */}
      <View
        style={[
          styles.innerCircle,
          {
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: size * 0.3,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          },
        ]}
      />
      {/* Token number indicator */}
      <View
        style={[
          styles.tokenNumber,
          {
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: size * 0.2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        {/* You can add token number here if needed */}
      </View>
    </Animated.View>
  );

  if (onPress && selectable) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.touchable}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  touchable: {
    position: 'absolute',
  },
  token: {
    position: 'absolute',
  },
  innerCircle: {
    position: 'absolute',
  },
  tokenNumber: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

