// Local game service for offline/local/computer modes
import { initialState, moveToken, rollDice, playerWon, movableTokens } from '../clone/utils/gameLogic';

// Local game engine for offline play
class LocalGameEngine {
  constructor(players = 2, mode = 'local') {
    this.mode = mode; // 'local', 'computer'
    this.state = initialState(players, 2); // 2 tokens per player
    this.players = players;
    this.isBotGame = mode === 'computer';
  }

  roll() {
    const roll = rollDice();
    return roll;
  }

  makeMove(tokenIndex, roll) {
    const currentPlayer = this.state.current;
    const validMoves = movableTokens(this.state, currentPlayer, roll);
    
    if (!validMoves.includes(tokenIndex)) {
      return { ok: false, error: 'Invalid move' };
    }

    this.state = moveToken(this.state, currentPlayer, tokenIndex, roll);
    
    // Check for winner
    if (playerWon(this.state, currentPlayer)) {
      return { ok: true, winner: currentPlayer, finished: true };
    }

    return { ok: true, extra: roll === 6 };
  }

  getState() {
    return this.state;
  }

  // Bot move logic (for computer mode)
  makeBotMove(roll) {
    const validMoves = movableTokens(this.state, this.state.current, roll);
    if (validMoves.length === 0) return null;
    
    // Simple bot: prefer finishing pieces, then prefer capturing, then random
    let bestMove = validMoves[0];
    
    for (const move of validMoves) {
      // Check if this move finishes a piece
      const testState = JSON.parse(JSON.stringify(this.state));
      const testResult = moveToken(testState, this.state.current, move, roll);
      if (testResult.tokens[this.state.current][move].finished) {
        bestMove = move;
        break;
      }
    }
    
    return this.makeMove(bestMove, roll);
  }
}

export default LocalGameEngine;

