/**
 * Utility functions for game logic
 */

import { PlayerColor, ENTRY_INDEX, HOME_BASE, TRACK_LENGTH } from './types';

/**
 * Get color index (0=red, 1=green, 2=yellow, 3=blue)
 */
export function getColorIndex(color: PlayerColor): number {
  const colors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
  return colors.indexOf(color);
}

/**
 * Get entry index for a color
 */
export function entryIndexForColor(color: PlayerColor): number {
  return ENTRY_INDEX[color];
}

/**
 * Get home base position for a color
 */
export function homeBaseForColor(color: PlayerColor): number {
  return HOME_BASE[color];
}

/**
 * Convert position to steps from player's start
 * @param pos - Current position
 * @param color - Player color
 * @returns Steps from start, or -1 if in yard
 */
export function posToStepsFromStart(pos: number, color: PlayerColor): number {
  if (pos === -1) return -1;
  
  const homeBase = homeBaseForColor(color);
  
  // If in home stretch
  if (pos >= homeBase && pos < homeBase + 6) {
    return TRACK_LENGTH + (pos - homeBase);
  }
  
  // On main track
  const entryIndex = entryIndexForColor(color);
  if (pos >= entryIndex) {
    return pos - entryIndex;
  } else {
    return TRACK_LENGTH - entryIndex + pos;
  }
}

/**
 * Convert steps from start to position
 * @param steps - Steps from player's start
 * @param color - Player color
 * @returns Position on board
 */
export function stepsToPos(steps: number, color: PlayerColor): number {
  if (steps < 0) return -1;
  
  const entryIndex = entryIndexForColor(color);
  const homeBase = homeBaseForColor(color);
  
  // In home stretch
  if (steps >= TRACK_LENGTH) {
    const homeSteps = steps - TRACK_LENGTH;
    if (homeSteps >= 6) return -1; // overshoot
    return homeBase + homeSteps;
  }
  
  // On main track
  return (entryIndex + steps) % TRACK_LENGTH;
}

/**
 * Check if moving would overshoot home
 * @param currentPos - Current position
 * @param steps - Number of steps to move
 * @param color - Player color
 * @returns True if would overshoot
 */
export function isOvershootHome(currentPos: number, steps: number, color: PlayerColor): boolean {
  const currentSteps = posToStepsFromStart(currentPos, color);
  if (currentSteps === -1) return false;
  
  const newSteps = currentSteps + steps;
  const homeBase = homeBaseForColor(color);
  
  // Check if in home stretch and would overshoot
  if (currentPos >= homeBase && currentPos < homeBase + 6) {
    return newSteps > TRACK_LENGTH + 5; // 5 is last home position
  }
  
  // Check if would enter home stretch and overshoot
  if (newSteps > TRACK_LENGTH + 5) {
    return true;
  }
  
  return false;
}

/**
 * Generate a monotonic action ID
 */
export function generateActionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get the turn entry point position for a color (where tokens enter from yard)
 */
export function getTurnEntryPoint(color: PlayerColor): number {
  return entryIndexForColor(color);
}

/**
 * Get the home entry point (where tokens leave main track for home stretch)
 */
export function getHomeEntryPoint(color: PlayerColor): number {
  const entryIndex = entryIndexForColor(color);
  // Home entry is 51 steps from player's start
  return (entryIndex + 51) % TRACK_LENGTH;
}
