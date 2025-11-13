import React from 'react';
import { View, Image } from 'react-native';
import { SAFE_CELLS, indexToXY, ENTRY, HOME_ENTRY, TRACK_LENGTH, HOME_STEPS } from '../utils/gameLogic';

// Very simple placeholder Ludo board: 15x15 grid with colored home areas
export default function Board({ size = 320, children }) {
  const cell = Math.floor(size / 15);
  const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b'];
  return (
    <View style={{ width: size, height: size, alignSelf: 'center', backgroundColor: '#e5e7eb', borderWidth: 2, borderColor: '#111827', overflow:'hidden' }}>
      {/* board background image */}
      <Image source={require('../assets/ludoboardfinal.png')} style={{ position:'absolute', left:0, top:0, width:size, height:size }} resizeMode="cover" />
      {/* corners underlay (fallback coloring still present beneath tokens if image fails) */}
      <View style={{ position:'absolute', left:0, top:0, width: cell*6, height: cell*6, backgroundColor:'#ef4444', opacity:0.0 }} />
      <View style={{ position:'absolute', right:0, top:0, width: cell*6, height: cell*6, backgroundColor:'#22c55e', opacity:0.0 }} />
      <View style={{ position:'absolute', left:0, bottom:0, width: cell*6, height: cell*6, backgroundColor:'#3b82f6', opacity:0.0 }} />
      <View style={{ position:'absolute', right:0, bottom:0, width: cell*6, height: cell*6, backgroundColor:'#f59e0b', opacity:0.0 }} />
      {/* safe cell markers (approximate) */}
      {Array.from(SAFE_CELLS).map((idx) => {
        const { x, y } = indexToXY(idx, 0);
        const r = Math.max(10, Math.floor(size / 24));
        return (
          <View
            key={`safe-${idx}`}
            style={{
              position: 'absolute',
              left: x * size - r / 2,
              top: y * size - r / 2,
              width: r,
              height: r,
              borderRadius: r / 2,
              borderWidth: 2,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16,185,129,0.15)'
            }}
          />
        );
      })}
      {/* per-player entry and home-entry markers */}
      {ENTRY.map((idx, p) => {
        const { x, y } = indexToXY(idx, p);
        const r = Math.max(12, Math.floor(size / 22));
        return (
          <View key={`entry-${p}`} style={{ position:'absolute', left:x*size - r/2, top:y*size - r/2, width:r, height:r, borderRadius:r/2, backgroundColor:COLORS[p], opacity:0.5, borderWidth:2, borderColor:'#111827' }} />
        );
      })}
      {HOME_ENTRY.map((idx, p) => {
        const { x, y } = indexToXY(idx, p);
        const r = Math.max(12, Math.floor(size / 24));
        return (
          <View key={`home-entry-${p}`} style={{ position:'absolute', left:x*size - r/2, top:y*size - r/2, width:r, height:r, borderRadius:r/2, borderWidth:2, borderColor:COLORS[p], backgroundColor:'rgba(255,255,255,0.6)' }} />
        );
      })}
      {/* full home-stretch markers per player */}
      {Array.from({ length: 4 }).map((_, p) => {
        return (
          <React.Fragment key={`hs-${p}`}>
            {Array.from({ length: HOME_STEPS }).map((_, step) => {
              const { x, y } = indexToXY(TRACK_LENGTH + step + 1, p);
              const r = Math.max(10, Math.floor(size / 26));
              return (
                <View key={`hs-${p}-${step}`} style={{ position:'absolute', left:x*size - r/2, top:y*size - r/2, width:r, height:r, borderRadius:4, backgroundColor:`${COLORS[p]}33`, borderWidth:1, borderColor:COLORS[p] }} />
              );
            })}
          </React.Fragment>
        );
      })}
      {/* children (tokens, overlays) */}
      {children}
    </View>
  );
}
