/**
 * Firebase Cloud Functions for Ludo Game
 * Authoritative server-side game logic
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { randomInt } from 'crypto';
import { Game, Player, Token, YARD_POSITION } from './types';
import {
  computeAvailableMoves,
  validateMove,
  applyMove,
} from './gameEngine';
import { generateActionId } from './utils';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

interface CreateGameData {
  playerName: string;
  settings?: {
    starShortcuts?: boolean;
  };
}

interface JoinGameData {
  gameId: string;
  playerName: string;
}

interface StartGameData {
  gameId: string;
}

interface RollDiceData {
  gameId: string;
}

interface PlayMoveData {
  gameId: string;
  tokenIndex: number;
}

/**
 * Create a new game
 * Callable function
 */
export const createGame = functions.https.onCall(async (data: CreateGameData, context: functions.https.CallableContext) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { playerName, settings } = data;

  if (!playerName || typeof playerName !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'playerName is required');
  }

  const gameId = db.collection('games').doc().id;
  const now = Date.now();

  const player: Player = {
    id: context.auth.uid,
    displayName: playerName,
    color: 'red', // First player gets red
    order: 0,
    joinedAt: now,
  };

  // Initialize 4 tokens in yard for the player
  const tokens: Token[] = [
    { pos: YARD_POSITION, inHome: false },
    { pos: YARD_POSITION, inHome: false },
    { pos: YARD_POSITION, inHome: false },
    { pos: YARD_POSITION, inHome: false },
  ];

  const game: Game = {
    gameId,
    players: [player],
    tokens: {
      [player.id]: tokens,
    },
    turnIndex: 0,
    dice: 0,
    diceRolledAt: null,
    availableMoves: null,
    lastActionId: generateActionId(),
    started: false,
    createdAt: now,
    winnerIds: [],
    settings: {
      starShortcuts: settings?.starShortcuts ?? false,
    },
  };

  await db.collection('games').doc(gameId).set(game);

  return { success: true, gameId, game };
});

/**
 * Join an existing game
 * Callable function
 */
export const joinGame = functions.https.onCall(async (data: JoinGameData, context: functions.https.CallableContext) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { gameId, playerName } = data;

  if (!gameId || !playerName) {
    throw new functions.https.HttpsError('invalid-argument', 'gameId and playerName are required');
  }

  const gameRef = db.collection('games').doc(gameId);

  try {
    const result = await db.runTransaction(async (transaction: admin.firestore.Transaction) => {
      const gameDoc = await transaction.get(gameRef);

      if (!gameDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Game not found');
      }

      const game = gameDoc.data() as Game;

      if (game.started) {
        throw new functions.https.HttpsError('failed-precondition', 'Game already started');
      }

      if (game.players.length >= 4) {
        throw new functions.https.HttpsError('failed-precondition', 'Game is full');
      }

      if (game.players.some(p => p.id === context.auth!.uid)) {
        throw new functions.https.HttpsError('already-exists', 'Already in game');
      }

      const colors: ('red' | 'green' | 'yellow' | 'blue')[] = ['red', 'green', 'yellow', 'blue'];
      const usedColors = game.players.map(p => p.color);
      const availableColor = colors.find(c => !usedColors.includes(c))!;

      const newPlayer: Player = {
        id: context.auth!.uid,
        displayName: playerName,
        color: availableColor,
        order: game.players.length,
        joinedAt: Date.now(),
      };

      // Initialize tokens for new player
      const tokens: Token[] = [
        { pos: YARD_POSITION, inHome: false },
        { pos: YARD_POSITION, inHome: false },
        { pos: YARD_POSITION, inHome: false },
        { pos: YARD_POSITION, inHome: false },
      ];

      game.players.push(newPlayer);
      game.tokens[newPlayer.id] = tokens;
      game.lastActionId = generateActionId();

      transaction.update(gameRef, {
        players: game.players,
        tokens: game.tokens,
        lastActionId: game.lastActionId,
      });

      return { success: true, game };
    });

    return result;
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Start the game
 * Callable function
 */
export const startGame = functions.https.onCall(async (data: StartGameData, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { gameId } = data;

  if (!gameId) {
    throw new functions.https.HttpsError('invalid-argument', 'gameId is required');
  }

  const gameRef = db.collection('games').doc(gameId);

  try {
    const result = await db.runTransaction(async (transaction: admin.firestore.Transaction) => {
      const gameDoc = await transaction.get(gameRef);

      if (!gameDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Game not found');
      }

      const game = gameDoc.data() as Game;

      if (game.started) {
        throw new functions.https.HttpsError('failed-precondition', 'Game already started');
      }

      if (game.players.length < 2) {
        throw new functions.https.HttpsError('failed-precondition', 'Need at least 2 players');
      }

      // Only host (first player) can start
      if (game.players[0].id !== context.auth!.uid) {
        throw new functions.https.HttpsError('permission-denied', 'Only host can start game');
      }

      game.started = true;
      game.lastActionId = generateActionId();

      transaction.update(gameRef, {
        started: true,
        lastActionId: game.lastActionId,
      });

      return { success: true, game };
    });

    return result;
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Roll dice
 * Callable function - AUTHORITATIVE RNG
 */
export const rollDice = functions.https.onCall(async (data: RollDiceData, context: functions.https.CallableContext) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { gameId } = data;

  if (!gameId) {
    throw new functions.https.HttpsError('invalid-argument', 'gameId is required');
  }

  const gameRef = db.collection('games').doc(gameId);

  // Optional: Redis-based distributed lock for high-scale scenarios
  // const lockKey = `game:${gameId}:lock`;
  // const lock = await redisClient.set(lockKey, 'locked', 'NX', 'EX', 5);
  // if (!lock) {
  //   throw new functions.https.HttpsError('resource-exhausted', 'Game is locked');
  // }

  try {
    const result = await db.runTransaction(async (transaction: admin.firestore.Transaction) => {
      const gameDoc = await transaction.get(gameRef);

      if (!gameDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Game not found');
      }

      const game = gameDoc.data() as Game;

      if (!game.started) {
        throw new functions.https.HttpsError('failed-precondition', 'Game not started');
      }

      // Check if it's player's turn
      const currentPlayer = game.players[game.turnIndex];
      if (currentPlayer.id !== context.auth!.uid) {
        throw new functions.https.HttpsError('permission-denied', 'Not your turn');
      }

      // Check if dice already rolled
      if (game.dice !== 0) {
        throw new functions.https.HttpsError('failed-precondition', 'Dice already rolled, make a move');
      }

      // AUTHORITATIVE RNG - only server generates dice value
      const diceValue = randomInt(1, 7); // 1-6 inclusive
      const now = Date.now();

      // Compute available moves
      const availableMoves = computeAvailableMoves(game, currentPlayer.id, diceValue);

      // Update game state
      game.dice = diceValue;
      game.diceRolledAt = now;
      game.availableMoves = { [currentPlayer.id]: availableMoves };
      game.lastActionId = generateActionId();

      // If no available moves, advance turn automatically
      if (availableMoves.length === 0) {
        game.dice = 0;
        game.availableMoves = null;
        game.turnIndex = (game.turnIndex + 1) % game.players.length;
        
        // Skip players who have won
        let attempts = 0;
        while (game.winnerIds.includes(game.players[game.turnIndex].id) && attempts < game.players.length) {
          game.turnIndex = (game.turnIndex + 1) % game.players.length;
          attempts++;
        }
      }

      transaction.update(gameRef, {
        dice: game.dice,
        diceRolledAt: game.diceRolledAt,
        availableMoves: game.availableMoves,
        lastActionId: game.lastActionId,
        turnIndex: game.turnIndex,
      });

      return {
        success: true,
        dice: diceValue,
        availableMoves,
        turnAdvanced: availableMoves.length === 0,
      };
    });

    return result;
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', error.message);
  } finally {
    // Release lock if using Redis
    // await redisClient.del(lockKey);
  }
});

/**
 * Play a move
 * Callable function - AUTHORITATIVE VALIDATION
 */
export const playMove = functions.https.onCall(async (data: PlayMoveData, context: functions.https.CallableContext) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { gameId, tokenIndex } = data;

  if (!gameId || tokenIndex === undefined) {
    throw new functions.https.HttpsError('invalid-argument', 'gameId and tokenIndex are required');
  }

  const gameRef = db.collection('games').doc(gameId);

  try {
    const result = await db.runTransaction(async (transaction: admin.firestore.Transaction) => {
      const gameDoc = await transaction.get(gameRef);

      if (!gameDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Game not found');
      }

      const game = gameDoc.data() as Game;

      if (!game.started) {
        throw new functions.https.HttpsError('failed-precondition', 'Game not started');
      }

      const playerId = context.auth!.uid;

      // Validate move
      const validation = validateMove(game, playerId, tokenIndex, game.dice);
      if (!validation.valid) {
        throw new functions.https.HttpsError('invalid-argument', validation.reason || 'Invalid move');
      }

      // Apply move
      const moveResult = applyMove(game, playerId, tokenIndex, game.dice);
      moveResult.game.lastActionId = generateActionId();

      // Update Firestore
      transaction.update(gameRef, {
        tokens: moveResult.game.tokens,
        dice: moveResult.game.dice,
        availableMoves: moveResult.game.availableMoves,
        turnIndex: moveResult.game.turnIndex,
        winnerIds: moveResult.game.winnerIds,
        lastActionId: moveResult.game.lastActionId,
      });

      return {
        success: true,
        captured: moveResult.captured,
        extraTurn: moveResult.extraTurn,
        winnerIds: moveResult.game.winnerIds,
      };
    });

    return result;
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', error.message);
  }
});
