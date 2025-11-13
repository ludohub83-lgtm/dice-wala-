/**
 * Unit tests for game engine
 */

import {
  computeAvailableMoves,
  validateMove,
  applyMove,
  isSafeSquare,
  advanceTurn,
} from '../src/gameEngine';
import { Game, Player, Token, YARD_POSITION } from '../src/types';

// Helper to create a test game
function createTestGame(playerCount: number = 2): Game {
  const colors: ('red' | 'green' | 'yellow' | 'blue')[] = ['red', 'green', 'yellow', 'blue'];
  const players: Player[] = [];
  const tokens: { [key: string]: Token[] } = {};

  for (let i = 0; i < playerCount; i++) {
    const player: Player = {
      id: `player${i + 1}`,
      displayName: `Player ${i + 1}`,
      color: colors[i],
      order: i,
      joinedAt: Date.now(),
    };
    players.push(player);
    tokens[player.id] = [
      { pos: YARD_POSITION, inHome: false },
      { pos: YARD_POSITION, inHome: false },
      { pos: YARD_POSITION, inHome: false },
      { pos: YARD_POSITION, inHome: false },
    ];
  }

  return {
    gameId: 'test-game',
    players,
    tokens,
    turnIndex: 0,
    dice: 0,
    diceRolledAt: null,
    availableMoves: null,
    lastActionId: 'test-action',
    started: true,
    createdAt: Date.now(),
    winnerIds: [],
    settings: {
      starShortcuts: false,
    },
  };
}

describe('Game Engine', () => {
  describe('computeAvailableMoves', () => {
    test('should allow exit from yard on dice 6', () => {
      const game = createTestGame(2);
      const moves = computeAvailableMoves(game, 'player1', 6);
      
      // All 4 tokens in yard can move
      expect(moves).toEqual([0, 1, 2, 3]);
    });

    test('should not allow exit from yard on dice < 6', () => {
      const game = createTestGame(2);
      const moves = computeAvailableMoves(game, 'player1', 3);
      
      // No tokens can move
      expect(moves).toEqual([]);
    });

    test('should allow move for token on track', () => {
      const game = createTestGame(2);
      game.tokens['player1'][0].pos = 5; // Token on track
      
      const moves = computeAvailableMoves(game, 'player1', 3);
      
      // Token 0 can move
      expect(moves).toContain(0);
    });

    test('should not allow move that overshoots home', () => {
      const game = createTestGame(2);
      // Red home stretch is 100-105
      game.tokens['player1'][0].pos = 104; // Near end of home stretch
      
      const moves = computeAvailableMoves(game, 'player1', 3);
      
      // Would overshoot (104 + 3 = 107 > 105)
      expect(moves).not.toContain(0);
    });

    test('should not include tokens already home', () => {
      const game = createTestGame(2);
      game.tokens['player1'][0].inHome = true;
      
      const moves = computeAvailableMoves(game, 'player1', 6);
      
      // Token 0 is home, so only 1, 2, 3 can move
      expect(moves).toEqual([1, 2, 3]);
    });
  });

  describe('validateMove', () => {
    test('should reject move when not player turn', () => {
      const game = createTestGame(2);
      game.dice = 6;
      game.availableMoves = { player1: [0, 1, 2, 3] };
      
      const validation = validateMove(game, 'player2', 0, 6);
      
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('Not your turn');
    });

    test('should reject move when dice not rolled', () => {
      const game = createTestGame(2);
      game.dice = 0;
      
      const validation = validateMove(game, 'player1', 0, 6);
      
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('Must roll dice first');
    });

    test('should reject move for token already home', () => {
      const game = createTestGame(2);
      game.dice = 6;
      game.tokens['player1'][0].inHome = true;
      game.availableMoves = { player1: [1, 2, 3] };
      
      const validation = validateMove(game, 'player1', 0, 6);
      
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('Token already home');
    });

    test('should accept valid move', () => {
      const game = createTestGame(2);
      game.dice = 6;
      game.availableMoves = { player1: [0, 1, 2, 3] };
      
      const validation = validateMove(game, 'player1', 0, 6);
      
      expect(validation.valid).toBe(true);
    });
  });

  describe('applyMove', () => {
    test('should move token from yard to entry point on dice 6', () => {
      const game = createTestGame(2);
      game.dice = 6;
      game.availableMoves = { player1: [0, 1, 2, 3] };
      
      const result = applyMove(game, 'player1', 0, 6);
      
      // Red entry point is 0
      expect(result.game.tokens['player1'][0].pos).toBe(0);
      expect(result.extraTurn).toBe(true); // Rolling 6 gives extra turn
    });

    test('should move token on track', () => {
      const game = createTestGame(2);
      game.dice = 3;
      game.tokens['player1'][0].pos = 5;
      game.availableMoves = { player1: [0] };
      
      const result = applyMove(game, 'player1', 0, 3);
      
      expect(result.game.tokens['player1'][0].pos).toBe(8);
    });

    test('should capture opponent token', () => {
      const game = createTestGame(2);
      game.dice = 3;
      game.tokens['player1'][0].pos = 4;
      game.tokens['player2'][0].pos = 7; // Opponent at destination (7 is NOT a safe square)
      game.availableMoves = { player1: [0] };
      
      const result = applyMove(game, 'player1', 0, 3);
      
      // Player1 token moved to 7
      expect(result.game.tokens['player1'][0].pos).toBe(7);
      
      // Player2 token captured and sent to yard
      expect(result.game.tokens['player2'][0].pos).toBe(YARD_POSITION);
      
      // Capture info returned
      expect(result.captured).toEqual({
        playerId: 'player2',
        tokenIndex: 0,
      });
      
      // Capture gives extra turn
      expect(result.extraTurn).toBe(true);
    });

    test('should not capture on safe square', () => {
      const game = createTestGame(2);
      game.dice = 3;
      game.tokens['player1'][0].pos = 5;
      game.tokens['player2'][0].pos = 8; // Safe square
      game.availableMoves = { player1: [0] };
      
      // Make position 8 a safe square for this test
      const result = applyMove(game, 'player1', 0, 3);
      
      // If 8 is safe, opponent should not be captured
      if (isSafeSquare(8)) {
        expect(result.game.tokens['player2'][0].pos).toBe(8);
        expect(result.captured).toBeUndefined();
      }
    });

    test('should give extra turn on rolling 6', () => {
      const game = createTestGame(2);
      game.dice = 6;
      game.tokens['player1'][0].pos = 5;
      game.availableMoves = { player1: [0] };
      
      const result = applyMove(game, 'player1', 0, 6);
      
      expect(result.extraTurn).toBe(true);
      expect(result.game.turnIndex).toBe(0); // Still player1's turn
    });

    test('should advance turn when no extra turn', () => {
      const game = createTestGame(2);
      game.dice = 3;
      game.tokens['player1'][0].pos = 5;
      game.availableMoves = { player1: [0] };
      
      const result = applyMove(game, 'player1', 0, 3);
      
      expect(result.extraTurn).toBe(false);
      expect(result.game.turnIndex).toBe(1); // Player2's turn
    });

    test('should mark token as home when reaching final position', () => {
      const game = createTestGame(2);
      game.dice = 1;
      game.tokens['player1'][0].pos = 104; // One step from home
      game.availableMoves = { player1: [0] };
      
      const result = applyMove(game, 'player1', 0, 1);
      
      expect(result.game.tokens['player1'][0].pos).toBe(105);
      expect(result.game.tokens['player1'][0].inHome).toBe(true);
    });

    test('should add player to winners when all tokens home', () => {
      const game = createTestGame(2);
      game.dice = 1;
      
      // 3 tokens already home
      game.tokens['player1'][0].inHome = true;
      game.tokens['player1'][1].inHome = true;
      game.tokens['player1'][2].inHome = true;
      
      // Last token one step from home
      game.tokens['player1'][3].pos = 104;
      game.availableMoves = { player1: [3] };
      
      const result = applyMove(game, 'player1', 3, 1);
      
      expect(result.game.tokens['player1'][3].inHome).toBe(true);
      expect(result.game.winnerIds).toContain('player1');
    });
  });

  describe('advanceTurn', () => {
    test('should advance to next player', () => {
      const game = createTestGame(3);
      game.turnIndex = 0;
      
      const nextIndex = advanceTurn(game);
      
      expect(nextIndex).toBe(1);
    });

    test('should wrap around to first player', () => {
      const game = createTestGame(3);
      game.turnIndex = 2;
      
      const nextIndex = advanceTurn(game);
      
      expect(nextIndex).toBe(0);
    });

    test('should skip players who have won', () => {
      const game = createTestGame(3);
      game.turnIndex = 0;
      game.winnerIds = ['player2']; // Player2 has won
      
      const nextIndex = advanceTurn(game);
      
      expect(nextIndex).toBe(2); // Skip player2, go to player3
    });
  });

  describe('isSafeSquare', () => {
    test('should identify safe squares', () => {
      expect(isSafeSquare(0)).toBe(true);
      expect(isSafeSquare(8)).toBe(true);
      expect(isSafeSquare(13)).toBe(true);
      expect(isSafeSquare(21)).toBe(true);
      expect(isSafeSquare(26)).toBe(true);
      expect(isSafeSquare(34)).toBe(true);
      expect(isSafeSquare(39)).toBe(true);
      expect(isSafeSquare(47)).toBe(true);
    });

    test('should identify non-safe squares', () => {
      expect(isSafeSquare(1)).toBe(false);
      expect(isSafeSquare(10)).toBe(false);
      expect(isSafeSquare(25)).toBe(false);
    });
  });
});
