import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, G } from 'react-native-svg';

export default function CustomDice({ value = 1, size = 60 }) {
  const renderDots = () => {
    const dotSize = size * 0.15;
    const positions = {
      1: [[size / 2, size / 2]],
      2: [[size * 0.3, size * 0.3], [size * 0.7, size * 0.7]],
      3: [[size * 0.3, size * 0.3], [size / 2, size / 2], [size * 0.7, size * 0.7]],
      4: [[size * 0.3, size * 0.3], [size * 0.7, size * 0.3], [size * 0.3, size * 0.7], [size * 0.7, size * 0.7]],
      5: [[size * 0.3, size * 0.3], [size * 0.7, size * 0.3], [size / 2, size / 2], [size * 0.3, size * 0.7], [size * 0.7, size * 0.7]],
      6: [[size * 0.3, size * 0.3], [size * 0.7, size * 0.3], [size * 0.3, size / 2], [size * 0.7, size / 2], [size * 0.3, size * 0.7], [size * 0.7, size * 0.7]],
    };

    return positions[value].map((pos, index) => (
      <Circle
        key={index}
        cx={pos[0]}
        cy={pos[1]}
        r={dotSize}
        fill="#1F2937"
      />
    ));
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G>
          {/* Dice background */}
          <Rect
            x="0"
            y="0"
            width={size}
            height={size}
            rx={size * 0.15}
            fill="#FFFFFF"
            stroke="#E5E7EB"
            strokeWidth="2"
          />
          {/* Dots */}
          {renderDots()}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
