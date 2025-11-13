// Simple, transparent AI heuristics for Ludo
// Difficulty influences lookahead and risk preference; RNG is unchanged.

import { movableTokens, moveToken, anyMovesAvailable } from './gameLogic';

// difficulty: 'easy' | 'normal' | 'hard' | 'expert'
export function chooseMove(state, currentPlayer, dice, difficulty = 'normal') {
  // List legal tokens for current player
  const legal = movableTokens(state, currentPlayer, dice);
  if (!legal || legal.length === 0) return null;

  // Score each candidate by heuristic
  const scored = legal.map((tokenIndex) => {
    const next = moveToken(state, currentPlayer, tokenIndex, dice, { simulate: true });
    const s = scoreStateTransition(state, next, currentPlayer, tokenIndex, dice, difficulty);
    return { tokenIndex, score: s };
  });

  // Pick highest score; on ties, prefer lowest index for determinism
  scored.sort((a, b) => b.score - a.score || a.tokenIndex - b.tokenIndex);
  return scored[0].tokenIndex;
}

function scoreStateTransition(prev, next, player, tokenIndex, dice, difficulty) {
  // Basic signals
  const weights = getWeights(difficulty);
  let score = 0;

  // Capture bonus: if any opponent token got captured in the transition
  if (next.capturedFlash && next.capturedFlash.player !== undefined) {
    score += weights.capture;
  }

  // Safe cell bonus: landing on safe cell (implementation-specific flag)
  if (next.lastMove && next.lastMove.landedOnSafe) {
    score += weights.safe;
  }

  // Entering board on 6
  if (prev.lastRoll === 6 && prev.tokens[player][tokenIndex] === 'HOME' && typeof next.tokens[player][tokenIndex] === 'number') {
    score += weights.enter;
  }

  // Progress toward finish: prefer moves that increase path index
  const p0 = normalizePos(prev.tokens[player][tokenIndex]);
  const p1 = normalizePos(next.tokens[player][tokenIndex]);
  if (p1 > p0) score += weights.progress * (p1 - p0);

  // Near-finish incentive
  if (isNearFinish(next, player, tokenIndex)) score += weights.nearFinish;

  // Risk penalty: avoid squares commonly captured (very rough heuristic)
  if (isRiskySquare(next, player, tokenIndex)) score -= weights.risk;

  return score;
}

function getWeights(difficulty) {
  switch (difficulty) {
    case 'easy':
      return { capture: 6, safe: 4, enter: 5, progress: 0.6, nearFinish: 3, risk: 3 };
    case 'hard':
      return { capture: 12, safe: 6, enter: 7, progress: 1.2, nearFinish: 6, risk: 3 };
    case 'expert':
      return { capture: 16, safe: 8, enter: 8, progress: 1.6, nearFinish: 8, risk: 2 };
    case 'normal':
    default:
      return { capture: 10, safe: 5, enter: 6, progress: 1.0, nearFinish: 5, risk: 3 };
  }
}

function normalizePos(p) {
  if (p === 'HOME') return 0;
  if (p === 'GOAL') return 1000;
  if (typeof p === 'number') return p;
  return 0;
}

function isNearFinish(state, player, tokenIndex) {
  const p = state.tokens?.[player]?.[tokenIndex];
  if (typeof p !== 'number') return false;
  // Treat deeper home stretch indexes as near finish
  return p >= (state.homeStretchStartIndex || 44);
}

function isRiskySquare(state, player, tokenIndex) {
  // Placeholder: treat non-safe, crowded squares as risky
  const lm = state.lastMove;
  if (!lm) return false;
  if (lm.player === player && lm.tokenIndex === tokenIndex) {
    return !!lm.landedOnRisky;
  }
  return false;
}
