/**
 * useGameLogic Hook
 * Manages game state and provides methods for game actions
 * Real-time sync with Firebase
 */

import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToGame,
  rollDiceInGame,
  moveTokenInGame,
} from '../gameLogic/FirebaseGameService';

export function useGameLogic(gameId, playerId) {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [moving, setMoving] = useState(false);

  // Subscribe to game updates
  useEffect(() => {
    if (!gameId) return;

    setLoading(true);
    
    const unsubscribe = subscribeToGame(gameId, (result) => {
      if (result.success) {
        setGameState(result.gameState);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gameId]);

  // Check if it's current player's turn
  const isMyTurn = useCallback(() => {
    if (!gameState || !playerId) return false;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    return currentPlayer.id === playerId;
  }, [gameState, playerId]);

  // Get current player data
  const getCurrentPlayer = useCallback(() => {
    if (!gameState || !playerId) return null;
    return gameState.players.find(p => p.id === playerId);
  }, [gameState, playerId]);

  // Roll dice
  const rollDice = useCallback(async () => {
    if (!gameId || !playerId || !isMyTurn() || !gameState?.canRollDice) {
      return { success: false, error: 'Cannot roll dice now' };
    }

    setRolling(true);
    
    try {
      const result = await rollDiceInGame(gameId, playerId);
      return result;
    } catch (error) {
      console.error('Roll dice error:', error);
      return { success: false, error: error.message };
    } finally {
      setRolling(false);
    }
  }, [gameId, playerId, gameState, isMyTurn]);

  // Move token
  const playMove = useCallback(async (tokenIndex) => {
    if (!gameId || !playerId || !isMyTurn()) {
      return { success: false, error: 'Cannot move now' };
    }

    if (!gameState?.validMoves?.includes(tokenIndex)) {
      return { success: false, error: 'Invalid move' };
    }

    setMoving(true);
    
    try {
      const result = await moveTokenInGame(gameId, playerId, tokenIndex);
      return result;
    } catch (error) {
      console.error('Move token error:', error);
      return { success: false, error: error.message };
    } finally {
      setMoving(false);
    }
  }, [gameId, playerId, gameState, isMyTurn]);

  // Get valid moves for current player
  const getMyValidMoves = useCallback(() => {
    if (!gameState || !isMyTurn()) return [];
    return gameState.validMoves || [];
  }, [gameState, isMyTurn]);

  // Get my player index
  const getMyPlayerIndex = useCallback(() => {
    if (!gameState || !playerId) return -1;
    return gameState.players.findIndex(p => p.id === playerId);
  }, [gameState, playerId]);

  return {
    gameState,
    loading,
    error,
    rolling,
    moving,
    isMyTurn: isMyTurn(),
    currentPlayer: getCurrentPlayer(),
    myPlayerIndex: getMyPlayerIndex(),
    validMoves: getMyValidMoves(),
    rollDice,
    playMove,
  };
}
