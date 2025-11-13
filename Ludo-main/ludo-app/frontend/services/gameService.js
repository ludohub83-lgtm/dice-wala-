// Game service using Firebase Realtime Database (replaces Socket.io)
import * as db from './firebaseDb';
import { updateGameState, subscribeToGameState, getGameState } from './firebaseDb';

// Import proper Ludo game logic
import {
  getNextPosition,
  isValidMove,
  isSafeCell,
  canCapture,
  getValidMoves,
  TRACK_LENGTH,
  HOME_STRETCH_LENGTH,
  TOTAL_PATH,
} from '../utils/ludoGameLogic';

// Game engine with proper Ludo rules
class GameEngine {
  constructor(roomId, players) {
    this.roomId = roomId;
    this.players = players.slice(0, 4);
    this.turn = 0;
    this.lastRoll = null;
    this.tokens = {};
    this.winners = [];
    this.players.forEach(p => {
      this.tokens[p] = [-1, -1, -1, -1]; // All pieces start at home (-1)
    });
  }

  currentPlayer() {
    return this.players[this.turn];
  }

  roll(userId) {
    if (userId !== this.currentPlayer()) return null;
    const v = Math.floor(Math.random() * 6) + 1;
    this.lastRoll = v;
    return v;
  }

  validMovesFor(userId) {
    if (this.lastRoll === null) return [];
    const t = this.tokens[userId] || [];
    return getValidMoves(t, this.lastRoll, this.players.indexOf(userId));
  }

  canMove(userId) {
    if (this.lastRoll === null) return false;
    const t = this.tokens[userId] || [];
    return getValidMoves(t, this.lastRoll, this.players.indexOf(userId)).length > 0;
  }

  move(userId, tokenIndex) {
    if (userId !== this.currentPlayer()) return { ok: false, error: 'Not your turn' };
    if (this.lastRoll === null) return { ok: false, error: 'Roll dice first' };
    
    const v = this.lastRoll;
    const arr = this.tokens[userId];
    if (!arr || tokenIndex < 0 || tokenIndex > 3) return { ok: false, error: 'Invalid token' };
    
    const playerIndex = this.players.indexOf(userId);
    const currentPos = arr[tokenIndex];
    
    // Validate move
    if (!isValidMove(currentPos, v, playerIndex)) {
      return { ok: false, error: 'Invalid move' };
    }
    
    // Calculate new position
    const newPos = getNextPosition(currentPos, v, playerIndex);
    
    // Check if move is valid (not overshooting in home stretch)
    if (newPos === currentPos && currentPos >= TRACK_LENGTH) {
      return { ok: false, error: 'Cannot overshoot home stretch' };
    }
    
    // Check for captures
    const captured = [];
    if (canCapture(newPos, playerIndex)) {
      // Check all other players' tokens
      this.players.forEach((opponentId, oppIndex) => {
        if (opponentId === userId) return;
        const oppTokens = this.tokens[opponentId] || [];
        oppTokens.forEach((oppPos, oppTokenIdx) => {
          if (oppPos === newPos && oppPos >= 0 && oppPos < TRACK_LENGTH) {
            // Capture! Send opponent piece home
            oppTokens[oppTokenIdx] = -1;
            captured.push({ player: opponentId, token: oppTokenIdx });
          }
        });
      });
    }
    
    // Move the piece
    arr[tokenIndex] = newPos;
    
    // Check if piece finished (reached end of home stretch)
    const finished = newPos === TRACK_LENGTH + HOME_STRETCH_LENGTH; // 51 + 6 = 57
    
    // Check if player won (all 4 pieces finished)
    const allFinished = arr.every(p => p === TRACK_LENGTH + HOME_STRETCH_LENGTH);
    if (allFinished && !this.winners.includes(userId)) {
      this.winners.push(userId);
    }
    
    // Extra turn if rolled 6 and piece didn't finish
    const extraTurn = v === 6 && !finished;
    
    // Advance turn if no extra turn
    if (!extraTurn) {
      this.turn = (this.turn + 1) % this.players.length;
      this.lastRoll = null; // Reset roll for next player
    }
    
    return { 
      ok: true, 
      extra: extraTurn,
      captured,
      finished,
      newPosition: newPos
    };
  }

  state() {
    return {
      roomId: this.roomId,
      players: this.players,
      turn: this.turn,
      lastRoll: this.lastRoll,
      tokens: this.tokens,
      winners: this.winners,
      validMoves: { [this.currentPlayer()]: this.validMovesFor(this.currentPlayer()) }
    };
  }

  fromState(state) {
    this.roomId = state.roomId;
    this.players = state.players;
    this.turn = state.turn;
    this.lastRoll = state.lastRoll;
    this.tokens = state.tokens;
    this.winners = state.winners;
  }
}

// Game service instance
let gameEngine = null;
let gameStateSubscription = null;
let currentRoomId = null;

// Initialize game connection
export const connectToGame = (roomId, userId, onStateUpdate) => {
  currentRoomId = roomId;
  
  // Subscribe to game state changes
  gameStateSubscription = subscribeToGameState(roomId, (state) => {
    if (state) {
      if (!gameEngine) {
        gameEngine = new GameEngine(roomId, state.players);
      }
      gameEngine.fromState(state);
      if (onStateUpdate) {
        onStateUpdate(gameEngine.state());
      }
    }
  });
  
  // Initialize game state if it doesn't exist
  getGameState(roomId).then((state) => {
    if (!state) {
      // Get room info to initialize game
      db.getRoom(roomId).then((room) => {
        if (room && room.players) {
          const players = room.players.map(p => p.userId);
          gameEngine = new GameEngine(roomId, players);
          updateGameState(roomId, gameEngine.state());
        }
      });
    } else {
      gameEngine = new GameEngine(roomId, state.players);
      gameEngine.fromState(state);
      if (onStateUpdate) {
        onStateUpdate(gameEngine.state());
      }
    }
  });
  
  return () => {
    if (gameStateSubscription) {
      gameStateSubscription();
      gameStateSubscription = null;
    }
    gameEngine = null;
    currentRoomId = null;
  };
};

// Request roll
export const requestRoll = async (roomId, userId) => {
  if (!gameEngine || gameEngine.roomId !== roomId) {
    // Load game state
    const state = await getGameState(roomId);
    if (state) {
      gameEngine = new GameEngine(roomId, state.players);
      gameEngine.fromState(state);
    } else {
      throw new Error('Game not found');
    }
  }
  
  const rollResult = gameEngine.roll(userId);
  if (rollResult !== null) {
    await updateGameState(roomId, gameEngine.state());
    return rollResult;
  }
  return null;
};

// Make move
export const makeMove = async (roomId, userId, token) => {
  if (!gameEngine || gameEngine.roomId !== roomId) {
    // Load game state
    const state = await getGameState(roomId);
    if (state) {
      gameEngine = new GameEngine(roomId, state.players);
      gameEngine.fromState(state);
    } else {
      throw new Error('Game not found');
    }
  }
  
  const moveResult = gameEngine.move(userId, token);
  if (moveResult.ok) {
    await updateGameState(roomId, gameEngine.state());
    
    // Check for winner
    if (gameEngine.winners.length > 0) {
      // Notify winner (this will be handled by the subscription)
      return { ...moveResult, winner: gameEngine.winners[gameEngine.winners.length - 1] };
    }
  }
  
  return moveResult;
};

// Get current state
export const getState = (roomId) => {
  if (gameEngine && gameEngine.roomId === roomId) {
    return gameEngine.state();
  }
  return null;
};

// Disconnect from game
export const disconnectFromGame = () => {
  if (gameStateSubscription) {
    gameStateSubscription();
    gameStateSubscription = null;
  }
  gameEngine = null;
  currentRoomId = null;
};

// Player win notification
export const notifyPlayerWin = async (roomId, userId) => {
  // Update game state with winner
  const state = await getGameState(roomId);
  if (state) {
    if (!state.winners) state.winners = [];
    if (!state.winners.includes(userId)) {
      state.winners.push(userId);
      await updateGameState(roomId, state);
    }
  }
};

// Identify user (for user-specific rooms)
export const identifyUser = (userId) => {
  // In Firebase, we don't need to explicitly identify
  // The user is already authenticated
  return Promise.resolve();
};

