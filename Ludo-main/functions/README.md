# 🎮 Ludo Game - Cloud Functions

## ⚡ Quick Start

### Seeing errors in your IDE?

**Run this command:**

```bash
npm install
```

That's it! All errors will disappear.

---

## 📦 What's Here

This folder contains the **server-side game logic** for the Ludo multiplayer game.

### Files:
- `src/index.ts` - 5 Cloud Functions (createGame, joinGame, startGame, rollDice, playMove)
- `src/gameEngine.ts` - Pure game logic
- `src/types.ts` - TypeScript type definitions
- `src/utils.ts` - Utility functions
- `tests/gameEngine.test.ts` - Unit tests

---

## 🚀 Commands

### Install dependencies:
```bash
npm install
```

### Build TypeScript:
```bash
npm run build
```

### Run tests:
```bash
npm test
```

### Start emulators:
```bash
npm run serve
```

### Deploy to Firebase:
```bash
npm run deploy
```

---

## 🐛 Troubleshooting

### "Cannot find module 'firebase-functions'"

**Solution**: Run `npm install`

### "Cannot find name 'describe'"

**Solution**: Run `npm install`

### Tests failing

**Solution**: 
```bash
npm cache clean --force
npm install
npm test
```

---

## 📚 Documentation

See the main project documentation in the root folder:
- `../FIX_ERRORS_NOW.md` - Fix IDE errors
- `../README.md` - Main documentation
- `../SETUP_CHECKLIST.md` - Setup guide

---

## ✅ Verification

After `npm install`, verify everything works:

```bash
# Build TypeScript
npm run build

# Run tests
npm test
```

Both should complete without errors.

---

## 🎯 What These Functions Do

### createGame
Creates a new game room with initial state

### joinGame
Adds a player to an existing game room

### startGame
Starts the game (host only)

### rollDice
Rolls dice with server-side RNG (authoritative)

### playMove
Validates and applies token movement (authoritative)

---

## 🔒 Security

All game logic is **server-authoritative**:
- ✅ Dice rolls on server (crypto.randomInt)
- ✅ Moves validated on server
- ✅ State stored on server
- ✅ No client-side cheating possible

---

## 🎉 Ready to Use

After `npm install`:
- ✅ TypeScript compiles
- ✅ Tests pass
- ✅ Ready to deploy

**Start with**: `npm install`
