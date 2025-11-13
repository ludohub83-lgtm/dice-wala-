import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Svg, { 
  Rect, Circle, Polygon, Path, Defs, LinearGradient as SvgGradient, 
  Stop, G, Text as SvgText 
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Ludo board path mapping: position 0-57 to board coordinates
const TRACK_LENGTH = 57;
const BOARD_SIZE = Math.min(width - 32, 400);
const CELL_SIZE = BOARD_SIZE / 15;

// Player colors matching Ludo King style
const PLAYER_COLORS = [
  '#EF4444', // Red
  '#2563EB', // Blue  
  '#22C55E', // Green
  '#FBBF24', // Yellow
];

// Safe cells (star positions)
const SAFE_CELLS = [
  { x: 2, y: 2 },   // Top-left safe
  { x: 12, y: 2 },  // Top-right safe
  { x: 2, y: 12 },  // Bottom-left safe
  { x: 12, y: 12 }, // Bottom-right safe
];

// This function is now in ludoGameLogic.js - keeping for backward compatibility
export { positionToBoardXY as positionToXY } from '../utils/ludoGameLogic';

export default function LudoBoard({ children, size = BOARD_SIZE }) {
  const cell = size / 15;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF8E1', '#FFF3C4']}
        style={[styles.boardContainer, { width: size + 20, height: size + 20 }]}
      >
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            {/* Gradients for player home areas */}
            {PLAYER_COLORS.map((color, idx) => (
              <SvgGradient key={`grad-${idx}`} id={`grad${idx}`} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity="0.4" />
                <Stop offset="1" stopColor={color} stopOpacity="0.2" />
              </SvgGradient>
            ))}
          </Defs>

          {/* Background grid */}
          {Array.from({ length: 15 }).map((_, y) =>
            Array.from({ length: 15 }).map((_, x) => (
              <Rect
                key={`cell-${x}-${y}`}
                x={x * cell}
                y={y * cell}
                width={cell}
                height={cell}
                fill="#FFF"
                stroke="#E5E7EB"
                strokeWidth="0.5"
              />
            ))
          )}

          {/* Player home areas (colored corners) */}
          <Rect
            x={0}
            y={0}
            width={cell * 6}
            height={cell * 6}
            fill="url(#grad0)"
            stroke={PLAYER_COLORS[0]}
            strokeWidth="3"
            rx="8"
          />
          <Rect
            x={cell * 9}
            y={0}
            width={cell * 6}
            height={cell * 6}
            fill="url(#grad1)"
            stroke={PLAYER_COLORS[1]}
            strokeWidth="3"
            rx="8"
          />
          <Rect
            x={0}
            y={cell * 9}
            width={cell * 6}
            height={cell * 6}
            fill="url(#grad2)"
            stroke={PLAYER_COLORS[2]}
            strokeWidth="3"
            rx="8"
          />
          <Rect
            x={cell * 9}
            y={cell * 9}
            width={cell * 6}
            height={cell * 6}
            fill="url(#grad3)"
            stroke={PLAYER_COLORS[3]}
            strokeWidth="3"
            rx="8"
          />

          {/* Home base circles */}
          {[
            { x: cell * 2.5, y: cell * 2.5, color: PLAYER_COLORS[0] },
            { x: size - cell * 2.5, y: cell * 2.5, color: PLAYER_COLORS[1] },
            { x: cell * 2.5, y: size - cell * 2.5, color: PLAYER_COLORS[2] },
            { x: size - cell * 2.5, y: size - cell * 2.5, color: PLAYER_COLORS[3] },
          ].map((home, idx) => (
            <React.Fragment key={`home-${idx}`}>
              <Circle
                cx={home.x}
                cy={home.y}
                r={cell * 1.8}
                fill={home.color}
                opacity="0.3"
              />
              <Circle
                cx={home.x}
                cy={home.y}
                r={cell * 1.5}
                fill={home.color}
                opacity="0.5"
                stroke="#FFF"
                strokeWidth="2"
              />
            </React.Fragment>
          ))}

          {/* Main track paths (colored lanes) */}
          {/* Red path (top) */}
          {Array.from({ length: 6 }).map((_, i) => (
            <Rect
              key={`red-path-${i}`}
              x={(1 + i) * cell}
              y={6 * cell}
              width={cell}
              height={cell}
              fill={PLAYER_COLORS[0]}
              opacity="0.3"
            />
          ))}
          {/* Blue path (right) */}
          {Array.from({ length: 6 }).map((_, i) => (
            <Rect
              key={`blue-path-${i}`}
              x={8 * cell}
              y={(1 + i) * cell}
              width={cell}
              height={cell}
              fill={PLAYER_COLORS[1]}
              opacity="0.3"
            />
          ))}
          {/* Green path (bottom) */}
          {Array.from({ length: 6 }).map((_, i) => (
            <Rect
              key={`green-path-${i}`}
              x={(13 - i) * cell}
              y={8 * cell}
              width={cell}
              height={cell}
              fill={PLAYER_COLORS[2]}
              opacity="0.3"
            />
          ))}
          {/* Yellow path (left) */}
          {Array.from({ length: 6 }).map((_, i) => (
            <Rect
              key={`yellow-path-${i}`}
              x={6 * cell}
              y={(13 - i) * cell}
              width={cell}
              height={cell}
              fill={PLAYER_COLORS[3]}
              opacity="0.3"
            />
          ))}

          {/* Safe spots (stars) */}
          {SAFE_CELLS.map((safe, idx) => {
            const cx = safe.x * cell + cell / 2;
            const cy = safe.y * cell + cell / 2;
            const r = cell * 0.35;
            const points = Array.from({ length: 8 }, (_, i) => {
              const angle = (i * Math.PI) / 4;
              const radius = i % 2 === 0 ? r : r * 0.5;
              return [
                cx + radius * Math.cos(angle),
                cy + radius * Math.sin(angle),
              ].join(',');
            }).join(' ');
            return (
              <Polygon
                key={`safe-${idx}`}
                points={points}
                fill="#10B981"
                opacity="0.8"
                stroke="#FFF"
                strokeWidth="2"
              />
            );
          })}

          {/* Center finish area */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={cell * 2.5}
            fill="#FFD700"
            opacity="0.3"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={cell * 2}
            fill="#FFD700"
            opacity="0.5"
            stroke="#F59E0B"
            strokeWidth="3"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={cell * 1.5}
            fill="#FFD700"
            stroke="#F59E0B"
            strokeWidth="2"
          />

          {/* Direction arrows on paths */}
          {[
            { x: cell * 4, y: cell * 6.5, rotation: 0, color: PLAYER_COLORS[0] },
            { x: cell * 8.5, y: cell * 4, rotation: 90, color: PLAYER_COLORS[1] },
            { x: cell * 11, y: cell * 8.5, rotation: 180, color: PLAYER_COLORS[2] },
            { x: cell * 6.5, y: cell * 11, rotation: 270, color: PLAYER_COLORS[3] },
          ].map((arrow, idx) => (
            <G
              key={`arrow-${idx}`}
              transform={`translate(${arrow.x}, ${arrow.y}) rotate(${arrow.rotation})`}
            >
              <Path
                d={`M 0 -${cell * 0.3} L ${cell * 0.2} ${cell * 0.1} L -${cell * 0.2} ${cell * 0.1} Z`}
                fill={arrow.color}
                opacity="0.8"
              />
            </G>
          ))}
        </Svg>
      </LinearGradient>
      {/* Children (tokens/pieces) */}
      {children}
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

