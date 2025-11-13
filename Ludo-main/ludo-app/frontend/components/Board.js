import React from 'react';
import { View, Platform, Dimensions, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Polygon, Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Board() {
  // Responsive board size
  const maxSize = Math.min(width - 32, 400);
  const size = Platform.OS === 'web' ? Math.min(320, maxSize) : maxSize;
  const cell = size / 15;
  const safeCells = new Set(['2,2','2,12','12,2','12,12']);
  const playerColors = ['#ef4444', '#2563eb', '#22c55e', '#fbbf24'];
  const cells = [];
  for (let y=0;y<15;y++){
    for (let x=0;x<15;x++){
      const key = `${x},${y}`;
      const isSafe = safeCells.has(key);
      cells.push(
        <Rect key={key} x={x*cell} y={y*cell} width={cell} height={cell} fill={'#fff'} stroke="#cbd5e1" strokeWidth="0.5" />
      );
    }
  }
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF', '#F5F5F5']}
        style={[styles.boardContainer, { width: size + 20, height: size + 20 }]}
      >
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            <SvgGradient id="redGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FF6B6B" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#EF4444" stopOpacity="0.3" />
            </SvgGradient>
            <SvgGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#60A5FA" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#2563EB" stopOpacity="0.3" />
            </SvgGradient>
            <SvgGradient id="greenGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#4ADE80" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#22C55E" stopOpacity="0.3" />
            </SvgGradient>
            <SvgGradient id="yellowGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FCD34D" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#FBBF24" stopOpacity="0.3" />
            </SvgGradient>
          </Defs>

          {/* Player home areas with gradients */}
          <Rect x={0} y={0} width={cell * 6} height={cell * 6} fill="url(#redGrad)" stroke={playerColors[0]} strokeWidth="3" rx="8" />
          <Rect x={cell * 9} y={0} width={cell * 6} height={cell * 6} fill="url(#blueGrad)" stroke={playerColors[1]} strokeWidth="3" rx="8" />
          <Rect x={0} y={cell * 9} width={cell * 6} height={cell * 6} fill="url(#greenGrad)" stroke={playerColors[2]} strokeWidth="3" rx="8" />
          <Rect x={cell * 9} y={cell * 9} width={cell * 6} height={cell * 6} fill="url(#yellowGrad)" stroke={playerColors[3]} strokeWidth="3" rx="8" />

          {/* Grid cells */}
          {cells}

          {/* Center finish area with enhanced design */}
          <Circle cx={size / 2} cy={size / 2} r={cell * 2} fill="#FFD700" opacity="0.2" />
          <Circle cx={size / 2} cy={size / 2} r={cell * 1.5} fill="#FFD700" opacity="0.4" />
          <Circle cx={size / 2} cy={size / 2} r={cell} fill="#FFD700" stroke="#F59E0B" strokeWidth="3" />

          {/* Safe spots with stars */}
          {[
            { x: 2, y: 2, color: playerColors[0] },
            { x: 12, y: 2, color: playerColors[1] },
            { x: 2, y: 12, color: playerColors[2] },
            { x: 12, y: 12, color: playerColors[3] },
          ].map((s, idx) => {
            const cx = s.x * cell + cell / 2;
            const cy = s.y * cell + cell / 2;
            const r = cell * 0.4;
            const r2 = r * 0.5;
            const points = [
              [cx, cy - r],
              [cx + r2, cy - r2],
              [cx + r, cy],
              [cx + r2, cy + r2],
              [cx, cy + r],
              [cx - r2, cy + r2],
              [cx - r, cy],
              [cx - r2, cy - r2],
            ]
              .map((p) => p.join(','))
              .join(' ');
            return (
              <Polygon
                key={`star-${idx}`}
                points={points}
                fill={s.color}
                opacity="0.9"
                stroke="#FFF"
                strokeWidth="2"
              />
            );
          })}

          {/* Player home circles with enhanced design */}
          {[
            { x: cell * 2, y: cell * 2, color: playerColors[0] },
            { x: size - cell * 2, y: cell * 2, color: playerColors[1] },
            { x: cell * 2, y: size - cell * 2, color: playerColors[2] },
            { x: size - cell * 2, y: size - cell * 2, color: playerColors[3] },
          ].map((home, idx) => {
            return (
              <React.Fragment key={`home-${idx}`}>
                <Circle cx={home.x} cy={home.y} r={cell * 1.8} fill={home.color} opacity="0.2" />
                <Circle cx={home.x} cy={home.y} r={cell * 1.5} fill={home.color} opacity="0.6" stroke="#FFF" strokeWidth="2" />
                <Circle cx={home.x} cy={home.y} r={cell * 0.3} fill="#FFF" opacity="0.8" />
              </React.Fragment>
            );
          })}

          {/* Path indicators (arrows) */}
          {[
            { x: cell * 7, y: cell * 1, rotation: 90, color: playerColors[0] },
            { x: cell * 13, y: cell * 7, rotation: 180, color: playerColors[1] },
            { x: cell * 7, y: cell * 13, rotation: 270, color: playerColors[2] },
            { x: cell * 1, y: cell * 7, rotation: 0, color: playerColors[3] },
          ].map((arrow, idx) => (
            <Path
              key={`arrow-${idx}`}
              d={`M ${arrow.x} ${arrow.y} L ${arrow.x + cell * 0.3} ${arrow.y + cell * 0.5} L ${arrow.x - cell * 0.3} ${arrow.y + cell * 0.5} Z`}
              fill={arrow.color}
              opacity="0.7"
              transform={`rotate(${arrow.rotation} ${arrow.x} ${arrow.y})`}
            />
          ))}
        </Svg>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  boardContainer: {
    borderRadius: 20,
    padding: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    borderRadius: 12,
  },
});
