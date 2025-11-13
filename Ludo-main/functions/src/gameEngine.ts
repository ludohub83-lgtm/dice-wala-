/**
 * Authoritative Ludo Game Engine
 * Pure functions for game logic - no side effects
 */

import {
  Game,
  MoveResult,
  MoveValidation,
  YARD_POSITION,
  TRACK_LENGTH,
  SAFE_SQUARES,
  STAR_SQUARES,
  STAR_SHORTCUTS,
  HOME_STRETCH_LENGTH,
} from './types';
import {
  posToStepsFromStart,
  stepsToPos,
  isOvershootHome,
  homeBaseForColor,
  getHomeEntryPoint,
  getTurnEntryPoint,
} from './utils';

/**
 * Check if a position is a safe square
 */
export function isSafeSquare(pos: number): boolean {
  return SAFE_SQUARES.includes(pos);
}

/**
 * Check if a position is a star square
 */
export function isStarSquare(pos: number): boolean {
  return STAR_SQUARES.includes(pos);
}

/**
 * Get star shortcut destination if applicable
 */
export function starShortcutDest(pos: number, starShortcutsEnabled: boolean): number | null {
  if (!starShortcutsEnabled) return null;
  return STAR_SHORTCUTS[pos] ?? null;
}

/**
 * Compute available moves for a player after dice roll
 * @param game - Current game state
 * @param playerId - Player ID
 * @param dice - Dice value (1-6)
 * @returns Array of token indices that can move
 */
export function computeAvailableMoves(game: Game, playerId: string, dice: number): number[] {
  const player = game.players.find(p => p.id === playerId);
  if (!player) return [];
  
  const tokens = game.tokens[playerId];
  if (!tokens) return [];
  
  const availableMoves: number[] = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // Skip if already home
    if (token.inHome) continue;
    
    // Token in yard - can only move on 6
    if (token.pos === YARD_POSITION) {
      if (dice === 6) {
        availableMoves.push(i);
      }
      continue;
    }
    
    // Check if move would overshoot home
    if (isOvershootHome(token.pos, dice, player.color)) {
      continue;
    }
    
    // Valid move
    availableMoves.push(i);
  }
  
  return availableMoves;
}

/**
 * Validate a move
 * @param game - Current game state
 * @param playerId - Player ID
 * @param tokenIndex - Token index (0-3)
 * @param dice - Dice value
 * @returns Validation result
 */
export function validateMove(
  game: Game,
  playerId: string,
  tokenIndex: number,
  dice: number
): MoveValidation {
  // Check if it's player's turn
  const currentPlayer = game.players[game.turnIndex];
  if (currentPlayer.id !== playerId) {
    return { valid: false, reason: 'Not your turn' };
  }
  
  // Check if dice has been rolled
  if (game.dice === 0) {
    return { valid: false, reason: 'Must roll dice first' };
  }
  
  // Check if dice matches
  if (game.dice !== dice) {
    return { valid: false, reason: 'Dice value mismatch' };
  }
  
  // Check token index
  const tokens = game.tokens[playerId];
  if (!tokens || tokenIndex < 0 || tokenIndex >= tokens.length) {
    return { valid: false, reason: 'Invalid token index' };
  }
  
  const token = tokens[tokenIndex];
  
  // Check if token is already home
  if (token.inHome) {
    return { valid: false, reason: 'Token already home' };
  }
  
  // Check if token in yard and dice is not 6
  if (token.pos === YARD_POSITION && dice !== 6) {
    return { valid: false, reason: 'Need 6 to exit yard' };
  }
  
  // Check if move is in available moves
  const availableMoves = game.availableMoves?.[playerId] || [];
  if (!availableMoves.includes(tokenIndex)) {
    return { valid: false, reason: 'Move not available' };
  }
  
  return { valid: true };
}

/**
 * Apply a move and return new game state
 * @param game - Current game state
 * @param playerId - Player ID
 * @param tokenIndex - Token index
 * @param dice - Dice value
 * @returns Move result with updated game state
 */
export function applyMove(
  game: Game,
  playerId: string,
  tokenIndex: number,
  dice: number
): MoveResult {
  const player = game.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found');
  }
  
  // Deep clone game state
  const newGame: Game = JSON.parse(JSON.stringify(game));
  const token = newGame.tokens[playerId][tokenIndex];
  
  let newPos: number;
  let captured: { playerId: string; tokenIndex: number } | undefined;
  let extraTurn = false;
  
  // Moving from yard
  if (token.pos === YARD_POSITION) {
    newPos = getTurnEntryPoint(player.color);
    extraTurn = true; // Rolling 6 gives extra turn
  } else {
    // Calculate new position
    const currentSteps = posToStepsFromStart(token.pos, player.color);
    const newSteps = currentSteps + dice;
    const homeBase = homeBaseForColor(player.color);
    const homeEntryPoint = getHomeEntryPoint(player.color);
    
    // Check if entering home stretch
    if (token.pos === homeEntryPoint || (token.pos >= homeBase && token.pos < homeBase + HOME_STRETCH_LENGTH)) {
      // In or entering home stretch
      if (newSteps >= TRACK_LENGTH) {
        const homeSteps = newSteps - TRACK_LENGTH;
        if (homeSteps === HOME_STRETCH_LENGTH - 1) {
          // Reached final home position
          newPos = homeBase + homeSteps;
          token.inHome = true;
        } else if (homeSteps < HOME_STRETCH_LENGTH) {
          newPos = homeBase + homeSteps;
        } else {
          throw new Error('Overshoot home');
        }
      } else {
        newPos = stepsToPos(newSteps, player.color);
      }
    } else {
      // On main track
      newPos = stepsToPos(newSteps, player.color);
      
      // Check for star shortcut
      if (game.settings.starShortcuts && isStarSquare(newPos)) {
        const shortcutDest = starShortcutDest(newPos, true);
        if (shortcutDest !== null) {
          newPos = shortcutDest;
        }
      }
    }
    
    // Extra turn on rolling 6
    if (dice === 6) {
      extraTurn = true;
    }
  }
  
  // Check for captures BEFORE updating position (only on main track, not in home stretch or safe squares)
  if (newPos < TRACK_LENGTH && !isSafeSquare(newPos)) {
    for (const [opponentId, opponentTokens] of Object.entries(newGame.tokens)) {
      if (opponentId === playerId) continue;
      
      for (let i = 0; i < opponentTokens.length; i++) {
        const opponentToken = opponentTokens[i];
        if (opponentToken.pos === newPos && !opponentToken.inHome) {
          // Capture!
          opponentToken.pos = YARD_POSITION;
          captured = { playerId: opponentId, tokenIndex: i };
          extraTurn = true; // Capturing gives extra turn
          break;
        }
      }
      
      if (captured) break;
    }
  }
  
  // Update token position
  token.pos = newPos;
  
  // Check if player won (all tokens home)
  const allHome = newGame.tokens[playerId].every(t => t.inHome);
  if (allHome && !newGame.winnerIds.includes(playerId)) {
    newGame.winnerIds.push(playerId);
  }
  
  // Clear dice and available moves
  newGame.dice = 0;
  newGame.availableMoves = null;
  
  // Advance turn if no extra turn
  if (!extraTurn) {
    newGame.turnIndex = advanceTurn(newGame);
  }
  
  return {
    game: newGame,
    captured,
    extraTurn,
  };
}

/**
 * Advance to next player's turn
 * Skips players who have won
 * @param game - Current game state
 * @returns New turn index
 */
export function advanceTurn(game: Game): number {
  let nextIndex = (game.turnIndex + 1) % game.players.length;
  let attempts = 0;
  
  // Skip players who have won
  while (game.winnerIds.includes(game.players[nextIndex].id) && attempts < game.players.length) {
    nextIndex = (nextIndex + 1) % game.players.length;
    attempts++;
  }
  
  return nextIndex;
}

/**
 * Check if game is over (all players except one have won)
 */
export function isGameOver(game: Game): boolean {
  return game.winnerIds.length >= game.players.length - 1;
}
