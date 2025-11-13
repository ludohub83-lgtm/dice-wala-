/**
 * Firebase Game Service
 * Handles all Firebase operations for multiplayer Ludo game
 */

import { firebase, firestore } from '../services/firebaseConfig';
import { initializeGame, processDiceRoll, moveToken } from './LudoGameCore';

const GAMES_COLLECTION = 'ludoGames';
const ROOMS_COLLECTION = 'gameRooms';

/**
 * Create a new game room
 */
export async function createGameRoom(hostPlayer, maxPlayers = 4, betAmount = 0) {
  try {
    const roomData = {
      hostId: hostPlayer.id,
      hostName: hostPlayer.name,
      maxPlayers,
      betAmount,
      players: [hostPlayer],
      status: 'waiting', // waiting, playing, finished
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      gameId: null,
    };

    const roomRef = await firestore.collection(ROOMS_COLLECTION).add(roomData);
    
    return {
      success: true,
      roomId: roomRef.id,
      room: { id: roomRef.id, ...roomData },
    };
  } catch (error) {
    console.error('Error creating game room:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Join an existing game room
 */
export async function joinGameRoom(roomId, player) {
  try {
    const roomRef = firestore.collection(ROOMS_COLLECTION).doc(roomId);
    
    return await firestore.runTransaction(async (transaction) => {
      const roomDoc = await transaction.get(roomRef);
      
      if (!roomDoc.exists) {
        throw new Error('Room not found');
      }

      const roomData = roomDoc.data();
      
      if (roomData.status !== 'waiting') {
        throw new Error('Game already started');
      }

      if (roomData.players.length >= roomData.maxPlayers) {
        throw new Error('Room is full');
      }

      if (roomData.players.some(p => p.id === player.id)) {
        throw new Error('Already in room');
      }

      const updatedPlayers = [...roomData.players, player];
      transaction.update(roomRef, { players: updatedPlayers });

      return { success: true, players: updatedPlayers };
    });
  } catch (error) {
    console.error('Error joining game room:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Start the game
 */
export async function startGame(roomId) {
  try {
    const roomRef = firestore.collection(ROOMS_COLLECTION).doc(roomId);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      throw new Error('Room not found');
    }

    const roomData = roomDoc.data();

    if (roomData.players.length < 2) {
      throw new Error('Need at least 2 players');
    }

    // Initialize game state
    const gameState = initializeGame(roomData.players);
    
    // Create game document
    const gameRef = await firestore.collection(GAMES_COLLECTION).add({
      ...gameState,
      roomId,
      betAmount: roomData.betAmount,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Update room status
    await roomRef.update({
      status: 'playing',
      gameId: gameRef.id,
    });

    return {
      success: true,
      gameId: gameRef.id,
      gameState,
    };
  } catch (error) {
    console.error('Error starting game:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to game updates
 */
export function subscribeToGame(gameId, callback) {
  const unsubscribe = firestore
    .collection(GAMES_COLLECTION)
    .doc(gameId)
    .onSnapshot(
      (doc) => {
        if (doc.exists) {
          callback({ success: true, gameState: { id: doc.id, ...doc.data() } });
        } else {
          callback({ success: false, error: 'Game not found' });
        }
      },
      (error) => {
        console.error('Error subscribing to game:', error);
        callback({ success: false, error: error.message });
      }
    );

  return unsubscribe;
}

/**
 * Subscribe to room updates
 */
export function subscribeToRoom(roomId, callback) {
  const unsubscribe = firestore
    .collection(ROOMS_COLLECTION)
    .doc(roomId)
    .onSnapshot(
      (doc) => {
        if (doc.exists) {
          callback({ success: true, room: { id: doc.id, ...doc.data() } });
        } else {
          callback({ success: false, error: 'Room not found' });
        }
      },
      (error) => {
        console.error('Error subscribing to room:', error);
        callback({ success: false, error: error.message });
      }
    );

  return unsubscribe;
}

/**
 * Roll dice
 */
export async function rollDiceInGame(gameId, playerId) {
  try {
    const gameRef = firestore.collection(GAMES_COLLECTION).doc(gameId);

    return await firestore.runTransaction(async (transaction) => {
      const gameDoc = await transaction.get(gameRef);
      
      if (!gameDoc.exists) {
        throw new Error('Game not found');
      }

      const gameState = gameDoc.data();
      
      // Validate it's player's turn
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentPlayer.id !== playerId) {
        throw new Error('Not your turn');
      }

      if (!gameState.canRollDice) {
        throw new Error('Cannot roll dice now');
      }

      if (gameState.gameOver) {
        throw new Error('Game is over');
      }

      // Process dice roll
      const newGameState = processDiceRoll(gameState);
      
      transaction.update(gameRef, newGameState);

      return {
        success: true,
        diceValue: newGameState.diceValue,
        validMoves: newGameState.validMoves,
        gameState: newGameState,
      };
    });
  } catch (error) {
    console.error('Error rolling dice:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Move token
 */
export async function moveTokenInGame(gameId, playerId, tokenIndex) {
  try {
    const gameRef = firestore.collection(GAMES_COLLECTION).doc(gameId);

    return await firestore.runTransaction(async (transaction) => {
      const gameDoc = await transaction.get(gameRef);
      
      if (!gameDoc.exists) {
        throw new Error('Game not found');
      }

      const gameState = gameDoc.data();
      
      // Validate it's player's turn
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentPlayer.id !== playerId) {
        throw new Error('Not your turn');
      }

      if (gameState.canRollDice) {
        throw new Error('Roll dice first');
      }

      if (!gameState.validMoves.includes(tokenIndex)) {
        throw new Error('Invalid move');
      }

      // Move token
      const result = moveToken(gameState, tokenIndex);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      transaction.update(gameRef, result.gameState);

      return {
        success: true,
        captured: result.captured,
        hasWon: result.hasWon,
        gameState: result.gameState,
      };
    });
  } catch (error) {
    console.error('Error moving token:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get available rooms
 */
export async function getAvailableRooms() {
  try {
    const snapshot = await firestore
      .collection(ROOMS_COLLECTION)
      .where('status', '==', 'waiting')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const rooms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, rooms };
  } catch (error) {
    console.error('Error getting rooms:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Leave game room
 */
export async function leaveGameRoom(roomId, playerId) {
  try {
    const roomRef = firestore.collection(ROOMS_COLLECTION).doc(roomId);
    
    return await firestore.runTransaction(async (transaction) => {
      const roomDoc = await transaction.get(roomRef);
      
      if (!roomDoc.exists) {
        throw new Error('Room not found');
      }

      const roomData = roomDoc.data();
      const updatedPlayers = roomData.players.filter(p => p.id !== playerId);

      if (updatedPlayers.length === 0) {
        // Delete room if empty
        transaction.delete(roomRef);
      } else {
        transaction.update(roomRef, { players: updatedPlayers });
      }

      return { success: true };
    });
  } catch (error) {
    console.error('Error leaving room:', error);
    return { success: false, error: error.message };
  }
}

/**
 * End game and save results
 */
export async function endGame(gameId, winnerId) {
  try {
    const gameRef = firestore.collection(GAMES_COLLECTION).doc(gameId);
    const gameDoc = await gameRef.get();

    if (!gameDoc.exists) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data();

    await gameRef.update({
      gameOver: true,
      winner: winnerId,
      endedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Update room status
    if (gameData.roomId) {
      await firestore.collection(ROOMS_COLLECTION).doc(gameData.roomId).update({
        status: 'finished',
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error ending game:', error);
    return { success: false, error: error.message };
  }
}
