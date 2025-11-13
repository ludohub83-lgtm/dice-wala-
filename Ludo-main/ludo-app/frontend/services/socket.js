// Socket.io replacement using Firebase Realtime Database
// This file is kept for compatibility but redirects to gameService
import * as gameService from './gameService';

export const getSocket = () => {
  // Return a mock socket object for compatibility
  return {
    emit: (event, data) => {
      // Handle socket events using Firebase
      if (event === 'identify') {
        gameService.identifyUser(data.userId);
      } else if (event === 'player_join') {
        // Handled by game service
      } else if (event === 'request_roll') {
        gameService.requestRoll(data.roomId, data.userId);
      } else if (event === 'make_move') {
        gameService.makeMove(data.roomId, data.userId, data.token);
      } else if (event === 'player_win') {
        gameService.notifyPlayerWin(data.roomId, data.userId);
      } else if (event === 'get_state') {
        // State is automatically synced via subscription
      }
    },
    on: (event, callback) => {
      // Events are handled via Firebase subscriptions in gameService
    },
    off: (event, callback) => {
      // Cleanup is handled via Firebase subscriptions
    }
  };
};
