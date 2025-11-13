# 🎲 Ludo Game - Authoritative Server Architecture

Complete multiplayer Ludo game with **server-authoritative logic** using Firebase Cloud Functions (TypeScript) and React Native Expo client.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native Client                       │
│  (Expo) - JavaScript - UI Only - No Game Logic              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Firebase SDK v9
                         │ (httpsCallable + onSnapshot)
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Firebase Cloud Functions                        │
│  (TypeScript) - AUTHORITATIVE GAME LOGIC                    │
│  - RNG (crypto.randomInt)                                   │
│  - Move Validation                                          │
│  - State Mutations                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Firestore Transactions
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Firebase Firestore                          │
│  - Game State (authoritative)                               │
│  - Real-time Sync                                           │
│  - Security Rules (read-only for clients)                   │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Server Authority**: All game logic runs on Cloud Functions
2. **Client Display Only**: Client renders state, never modifies it
3. **Transactional Updates**: All state changes use Firestore transactions
4. **Authoritative RNG**: Dice rolls use `crypto.randomInt` on server
5. **Security**: Firestore rules prevent client writes to game state

---

## 📁 Project Structure

```
Ludo-main/
├── functions/                    # Cloud Functions (TypeScript)
│   ├── src/
│   │   ├── index.ts             # Callable functions (rollDice, playMove, etc.)
│   │   ├── gameEngine.ts        # Pure game logic functions
│   │   ├── types.ts             # TypeScript type definitions
│   │   └── utils.ts             # Utility functions
│   ├── tests/
│   │   └── gameEngine.test.ts   # Jest unit tests
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── client/                       # React Native Expo (JavaScript)
│   ├── src/
│   │   ├── firebaseConfig.js    # Firebase SDK v9 initialization
│   │   ├── hooks/
│   │   │   └── useGame.js       # Game state hook
│   │   └── utils/
│   │       ├── boardMap.js      # Position → pixel coordinates
│   │       └── animationHelpers.js  # Token animations
│   ├── package.json
│   └── app.json
│
├── firestore.rules               # Security rules
├── firebase.json                 # Firebase config
├── .firebaserc                   # Firebase project
└── README.md                     # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Expo CLI: `npm install -g expo-cli`
- Firebase project created at [console.firebase.google.com](https://console.firebase.google.com)

### 1. Clone and Install

```bash
# Install Cloud Functions dependencies
cd functions
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Firebase

#### A. Update `.firebaserc`

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

#### B. Update `client/src/firebaseConfig.js`

Replace the placeholder config with your Firebase project credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Get these values from Firebase Console → Project Settings → General → Your apps

### 3. Run Tests

```bash
cd functions
npm test
```

All tests should pass ✅

### 4. Start Firebase Emulators

```bash
# From project root
firebase emulators:start
```

This starts:
- Functions emulator on `localhost:5001`
- Firestore emulator on `localhost:8080`
- Auth emulator on `localhost:9099`
- Emulator UI on `localhost:4000`

### 5. Enable Emulators in Client

Edit `client/src/firebaseConfig.js`:

```javascript
const USE_EMULATORS = true; // Set to true
```

### 6. Run Expo Client

```bash
cd client
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code for physical device

---

## 🎮 Game Flow

### 1. Create Game

```javascript
import { useGame } from './src/hooks/useGame';

const { createGame } = useGame(null, userId);

const result = await createGame('Player Name', {
  starShortcuts: false
});

// result.gameId - use this to join
```

### 2. Join Game

```javascript
const { joinGame } = useGame(null, userId);

await joinGame(gameId, 'Player Name');
```

### 3. Start Game

```javascript
const { startGame } = useGame(gameId, userId);

await startGame(); // Host only
```

### 4. Play Turn

```javascript
const { game, isMyTurn, rollDice, playMove, availableMoves } = useGame(gameId, userId);

// Roll dice
if (isMyTurn && game.dice === 0) {
  const result = await rollDice();
  // result.dice - server-generated dice value
  // result.availableMoves - tokens that can move
}

// Move token
if (isMyTurn && availableMoves.length > 0) {
  const result = await playMove(tokenIndex);
  // result.captured - if opponent was captured
  // result.extraTurn - if player gets another turn
}
```

### 5. Real-time Updates

The `useGame` hook automatically subscribes to Firestore and updates when:
- Dice is rolled
- Token is moved
- Turn changes
- Player wins

---

## 🎯 Position System

### Position Encoding

```
-1          = Yard (starting area)
0-51        = Main circular track
100-105     = Red home stretch
110-115     = Green home stretch
120-125     = Yellow home stretch
130-135     = Blue home stretch
```

### Entry Points

```
Red:    0
Green:  13
Yellow: 26
Blue:   39
```

### Safe Squares

```
0, 8, 13, 21, 26, 34, 39, 47
```

Tokens cannot be captured on these squares.

### Star Squares (Optional Shortcuts)

```
1, 9, 14, 22, 27, 35, 40, 48
```

If `settings.starShortcuts` is enabled, landing on a star teleports to the next star.

---

## 🔧 Integration with Your UI

### Step 1: Map Positions to Pixels

Edit `client/src/utils/boardMap.js` to match your board layout:

```javascript
function getTrackCoordinates(position) {
  // Define the exact pixel coordinates for each of the 52 track positions
  // This MUST match your board's visual layout
  const trackPath = [
    { x: 100, y: 500 }, // Position 0 (red entry)
    { x: 100, y: 450 }, // Position 1
    // ... define all 52 positions
  ];
  
  return trackPath[position];
}
```

### Step 2: Render Tokens

```javascript
import { getAllTokenPositions } from './utils/boardMap';

function GameBoard({ game }) {
  const tokenPositions = getAllTokenPositions(game);
  
  return (
    <View>
      {tokenPositions.map((token) => (
        <Token
          key={`${token.playerId}-${token.tokenIndex}`}
          x={token.x}
          y={token.y}
          color={token.playerColor}
          selectable={isTokenSelectable(game, myPlayerId, token.tokenIndex)}
          onPress={() => playMove(token.tokenIndex)}
        />
      ))}
    </View>
  );
}
```

### Step 3: Animate Movements

```javascript
import { animateTokenMove } from './utils/animationHelpers';

useEffect(() => {
  if (prevPosition !== currentPosition) {
    const fromCoords = getPositionCoordinates(prevPosition, color);
    const toCoords = getPositionCoordinates(currentPosition, color);
    
    animateTokenMove(animatedPosition, fromCoords, toCoords, 500);
  }
}, [currentPosition]);
```

### Step 4: Handle Reconnect

```javascript
useEffect(() => {
  if (game) {
    // Sync local state with server state
    const serverPositions = getAllTokenPositions(game);
    
    serverPositions.forEach((token) => {
      // Animate from current position to server position
      animateReconnectSync(
        animatedPositions[token.tokenIndex],
        currentCoords,
        { x: token.x, y: token.y },
        300
      );
    });
  }
}, [game]);
```

---

## 🧪 Testing

### Run Unit Tests

```bash
cd functions
npm test
```

### Test Coverage

```bash
npm test -- --coverage
```

### Test Specific File

```bash
npm test -- gameEngine.test.ts
```

### Watch Mode

```bash
npm test -- --watch
```

---

## 🚢 Deployment

### 1. Deploy Cloud Functions

```bash
firebase deploy --only functions
```

### 2. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Everything

```bash
firebase deploy
```

### 4. Build Expo App

```bash
cd client
expo build:android
expo build:ios
```

---

## 🔒 Security

### Firestore Rules

The security rules ensure:
- ✅ Clients can only READ game state
- ✅ Clients CANNOT write to authoritative fields
- ✅ Only Cloud Functions can modify game state
- ✅ Players can only read games they're in

### Cloud Functions

All functions:
- ✅ Verify authentication (`context.auth`)
- ✅ Use Firestore transactions for atomicity
- ✅ Validate all inputs
- ✅ Return structured errors

### RNG Security

- ✅ Dice rolls use `crypto.randomInt` (cryptographically secure)
- ✅ RNG only happens on server
- ✅ Clients cannot influence dice values

---

## 🎯 Game Rules

### Basic Rules

1. Roll 6 to exit yard
2. Move token by dice value
3. Land on opponent → capture (they return to yard)
4. Safe squares prevent captures
5. Roll 6 → extra turn
6. Capture → extra turn
7. All 4 tokens home → win

### Home Stretch

- Tokens enter home stretch after completing main track
- Must roll exact number to reach final home position
- Overshooting is not allowed

### Star Shortcuts (Optional)

If enabled in game settings:
- Landing on star teleports to next star
- Provides strategic shortcuts

---

## 🐛 Troubleshooting

### Functions not deploying

```bash
# Check Node version
node --version  # Should be 18+

# Rebuild
cd functions
rm -rf node_modules lib
npm install
npm run build
```

### Emulators not starting

```bash
# Kill existing processes
lsof -ti:5001 | xargs kill
lsof -ti:8080 | xargs kill

# Restart
firebase emulators:start
```

### Client not connecting to emulators

1. Check `USE_EMULATORS = true` in `firebaseConfig.js`
2. Ensure emulators are running
3. Check emulator URLs match your machine's IP (for physical devices)

### Tests failing

```bash
# Clear Jest cache
cd functions
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules
npm install

# Run tests
npm test
```

---

## 📊 Performance & Scaling

### Current Implementation

- ✅ Firestore transactions prevent race conditions
- ✅ Single-region deployment
- ✅ Suitable for 100s of concurrent games

### For High Scale (1000s of games)

Uncomment Redis lock in `functions/src/index.ts`:

```typescript
// Optional: Redis-based distributed lock
const lockKey = `game:${gameId}:lock`;
const lock = await redisClient.set(lockKey, 'locked', 'NX', 'EX', 5);
if (!lock) {
  throw new functions.https.HttpsError('resource-exhausted', 'Game is locked');
}
```

Then:
1. Set up Redis (Cloud Memorystore)
2. Install `redis` package
3. Configure connection
4. Release lock in `finally` block

---

## 📝 Manual Edits Checklist

- [ ] Update `.firebaserc` with your project ID
- [ ] Update `client/src/firebaseConfig.js` with your Firebase config
- [ ] Adapt `client/src/utils/boardMap.js` to match your board layout
- [ ] Set `USE_EMULATORS = true` for local development
- [ ] Set `USE_EMULATORS = false` for production
- [ ] Run `npm test` in functions directory
- [ ] Test with emulators before deploying
- [ ] Deploy functions: `firebase deploy --only functions`
- [ ] Deploy rules: `firebase deploy --only firestore:rules`

---

## 🎉 You're Ready!

The system is complete and production-ready:

- ✅ Server-authoritative game logic
- ✅ Secure RNG on server
- ✅ Transactional state updates
- ✅ Real-time multiplayer sync
- ✅ Client display only
- ✅ Comprehensive tests
- ✅ Security rules
- ✅ Emulator support

**Start the emulators and begin playing!**

```bash
firebase emulators:start
```

Then in another terminal:

```bash
cd client
npm start
```

---

## 📚 Additional Resources

- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Jest Testing](https://jestjs.io/docs/getting-started)

---

**Built with ❤️ for secure, scalable multiplayer gaming**
