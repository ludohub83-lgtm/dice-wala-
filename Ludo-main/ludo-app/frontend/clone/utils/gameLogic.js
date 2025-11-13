// Minimal Ludo-like logic (simplified path and rules) for prototype

export const TRACK_LENGTH = 56; // loop length
export const HOME_STEPS = 6; // home stretch length
// very rough safe cells along the perimeter path (prototype)
export const SAFE_CELLS = new Set([0, 14, 28, 42]);

export function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

export function initialState(players = 2, tokensPerPlayer = 2) {
  return {
    current: 0,
    players,
    tokensPerPlayer,
    tokens: Array.from({ length: players }, (_, p) =>
      Array.from({ length: tokensPerPlayer }, () => ({ pos: -1, finished: false }))
    ),
  };
}

export function canEnterFromHome(roll) {
  return roll === 6;
}

export function moveToken(state, p, t, roll) {
  const next = clone(state);
  const tok = next.tokens[p][t];
  if (tok.finished) return next; // cannot move

  if (tok.pos === -1) {
    if (!canEnterFromHome(roll)) return next;
    tok.pos = ENTRY[p]; // enter at player entry
  } else {
    // step-by-step movement to support home entry and stretch
    let steps = roll;
    let pos = tok.pos;
    while (steps > 0) {
      if (pos < TRACK_LENGTH) {
        // at home entry for player and next step goes to home stretch
        if (pos === HOME_ENTRY[p]) {
          pos = TRACK_LENGTH; // first home index
        } else {
          pos = (pos + 1) % TRACK_LENGTH;
        }
      } else {
        // in home stretch [TRACK_LENGTH .. TRACK_LENGTH+HOME_STEPS]
        if (pos < TRACK_LENGTH + HOME_STEPS) {
          pos += 1;
        } else {
          // already at final home, cannot move further
          // invalid move beyond home; keep position
          pos = tok.pos; // revert
          steps = 0;
          break;
        }
      }
      steps -= 1;
    }

    // exact finish rule: if move overshoots beyond final home, invalidate move
    if (tok.pos >= TRACK_LENGTH && tok.pos + roll > TRACK_LENGTH + HOME_STEPS) {
      // no move (overshoot)
      return next;
    }

    tok.pos = pos;
    if (tok.pos === TRACK_LENGTH + HOME_STEPS) {
      tok.finished = true;
    }
  }

  // capture logic: if landed on opponent (same cell), send them home unless safe cell
  if (!tok.finished && tok.pos >= 0 && tok.pos < TRACK_LENGTH && !SAFE_CELLS.has(tok.pos)) {
    for (let op = 0; op < next.players; op++) {
      if (op === p) continue;
      for (let tt = 0; tt < next.tokensPerPlayer; tt++) {
        const ot = next.tokens[op][tt];
        if (!ot.finished && ot.pos === tok.pos) {
          ot.pos = -1; // send home
        }
      }
    }
  }

  // change turn unless rolled a 6 and not finished
  if (!(roll === 6 && !tok.finished)) {
    next.current = (next.current + 1) % next.players;
  }
  return next;
}

export function playerWon(state, p) {
  return state.tokens[p].every((t) => t.finished);
}

export function anyMovesAvailable(state, p, roll) {
  const row = state.tokens[p];
  return row.some((tok) => !tok.finished && canMove(state, p, tok, roll));
}

// Return indices of tokens that can move for player p with given roll
export function movableTokens(state, p, roll) {
  const res = [];
  const row = state.tokens[p];
  for (let i = 0; i < row.length; i++) {
    const tok = row[i];
    if (tok.finished) continue;
    if (canMove(state, p, tok, roll)) res.push(i);
  }
  return res;
}

function canMove(state, p, tok, roll) {
  if (tok.finished) return false;
  if (tok.pos === -1) return canEnterFromHome(roll);
  // simulate move without mutating
  if (tok.pos >= TRACK_LENGTH) {
    // in home stretch, exact finish required
    return tok.pos + roll <= TRACK_LENGTH + HOME_STEPS;
  }
  // loop movement always possible; home entry handled during stepping
  return true;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Map linear path index to board coordinate (very rough for prototype)
// Returns {x,y} in [0,1] relative to board. Supports simple per-player rotation.
export function indexToXY(idx, playerIndex = 0) {
  if (idx < 0) {
    // home corners per player: 0=top-left, 1=top-right, 2=bottom-right, 3=bottom-left
    const homes = [
      { x: 0.14, y: 0.14 },
      { x: 0.86, y: 0.14 },
      { x: 0.86, y: 0.86 },
      { x: 0.14, y: 0.86 },
    ];
    return homes[playerIndex % 4];
  }
  // home stretch visual path: draw inward towards center along player's side
  if (idx >= TRACK_LENGTH) {
    const step = Math.min(idx - TRACK_LENGTH, HOME_STEPS);
    // param 0..HOME_STEPS -> 0..1
    const v = step / HOME_STEPS;
    const inward = [
      // from top edge to center
      { x: 0.5, y: 0.12 + 0.32 * v },
      // from right edge to center
      { x: 0.88 - 0.32 * v, y: 0.5 },
      // from bottom edge to center
      { x: 0.5, y: 0.88 - 0.32 * v },
      // from left edge to center
      { x: 0.12 + 0.32 * v, y: 0.5 },
    ];
    return inward[playerIndex % 4];
  }
  const n = TRACK_LENGTH;
  const u = Math.min(idx, n) / n; // 0..1
  // perimeter path: top -> right -> bottom -> left
  if (u < 0.25) {
    const v = u / 0.25; // 0..1 along top
    return rotate({ x: 0.08 + 0.84 * v, y: 0.06 }, playerIndex);
  } else if (u < 0.5) {
    const v = (u - 0.25) / 0.25; // right
    return rotate({ x: 0.92, y: 0.06 + 0.84 * v }, playerIndex);
  } else if (u < 0.75) {
    const v = (u - 0.5) / 0.25; // bottom
    return rotate({ x: 0.92 - 0.84 * v, y: 0.92 }, playerIndex);
  } else {
    const v = (u - 0.75) / 0.25; // left
    return rotate({ x: 0.06, y: 0.92 - 0.84 * v }, playerIndex);
  }
}

function rotate(pt, times) {
  // rotate around center (0.5, 0.5) by 90deg * times
  const t = ((times % 4) + 4) % 4;
  let { x, y } = pt;
  for (let i = 0; i < t; i++) {
    const dx = x - 0.5;
    const dy = y - 0.5;
    // 90deg rotation: (dx,dy) -> (dy, -dx)
    const rx = dy;
    const ry = -dx;
    x = rx + 0.5;
    y = ry + 0.5;
  }
  return { x, y };
}
