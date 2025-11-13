/**
 * Type definitions for Ludo game
 * Authoritative game state stored in Firestore
 */

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export interface Player {
  id: string;
  displayName: string;
  color: PlayerColor;
  order: number;
  joinedAt: number; // timestamp
}

export interface Token {
  pos: number; // -1=yard, 0-51=track, 100-105=red home, 110-115=green, 120-125=yellow, 130-135=blue
  inHome: boolean; // true when token reaches final home position
}

export interface GameSettings {
  starShortcuts: boolean; // enable star teleport shortcuts
}

export interface Game {
  gameId: string;
  players: Player[];
  tokens: { [playerId: string]: Token[] }; // 4 tokens per player
  turnIndex: number; // current player's turn (index into players array)
  dice: number; // last rolled value, 0 when waiting for roll
  diceRolledAt: number | null; // timestamp of last dice roll
  availableMoves: { [playerId: string]: number[] } | null; // token indices that can move
  lastActionId: string; // monotonic ID for replay protection
  started: boolean;
  createdAt: number;
  winnerIds: string[]; // players who have won (all 4 tokens home)
  settings: GameSettings;
}

export interface MoveResult {
  game: Game;
  captured?: {
    playerId: string;
    tokenIndex: number;
  };
  extraTurn?: boolean; // true if player gets another turn (rolled 6 or captured)
}

export interface MoveValidation {
  valid: boolean;
  reason?: string;
}

// Position encoding constants
export const YARD_POSITION = -1;
export const TRACK_LENGTH = 52;

// Home stretch base positions (color-specific)
export const HOME_BASE = {
  red: 100,
  green: 110,
  yellow: 120,
  blue: 130,
};

export const HOME_STRETCH_LENGTH = 6;

// Entry points to main track for each color
export const ENTRY_INDEX = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Safe squares where tokens cannot be captured
export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

// Star squares (for shortcuts if enabled)
export const STAR_SQUARES = [1, 9, 14, 22, 27, 35, 40, 48];

// Star shortcut destinations (if settings.starShortcuts enabled)
export const STAR_SHORTCUTS: { [key: number]: number } = {
  1: 14,   // red star to green entry
  9: 22,   // between red and green
  14: 27,  // green star to yellow entry
  22: 35,  // between green and yellow
  27: 40,  // yellow star to blue entry
  35: 48,  // between yellow and blue
  40: 1,   // blue star to red entry
  48: 9,   // between blue and red
};
