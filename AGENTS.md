# 🤖 AI Assistant & GitHub Contributor Guidelines (AGENTS.md)

Welcome to the **Classic Retro Arcade, Handheld & Console Vault** repository! This document contains instructions and standards for developers, contributors, and AI Coding Assistants (Google AI Studio, Gemini, Claude, ChatGPT, Cursor, etc.) working on this codebase.

---

## 🎯 Project Overview & Philosophy

1. **Zero External ROMs or Binary Emulators**:
   Every game, console, and handheld in this repository is **clean-room reimplemented from scratch in pure TypeScript**. We do not load multi-megabyte binary dumps, `.bin`, `.nes`, `.gb`, `.gba`, or `.iso` files.
2. **Native Web Technologies**:
   - **UI**: React 19 + Tailwind CSS v4 + Motion
   - **2D Graphics**: Canvas 2D API with nearest-neighbor integer scaling
   - **3D Environments & Shooters**: Three.js WebGL r186
   - **Audio**: Web Audio API (OscillatorNode, BiquadFilterNode, DirectSound, SPU)
   - **Input**: Gamepad API, DeviceOrientationEvent (Gyroscope), Touch Swipes
3. **Dual Language First**:
   All metadata, game descriptions, controls, and UI text MUST support both **Dutch (`nl`)** and **English (`en`)**.

---

## 🧪 Testing & Community Feedback (GitHub Notice)

> [!IMPORTANT]
> **Many games are AI-engineered clean-room recreations and require active testing!**
> - Because all 40+ games are built natively in TypeScript without original commercial code, physics loops, AI behavior, and sound synthesis are continuously refined.
> - **When adding or modifying a game engine**: Always test game loop stability, 60 FPS performance, mobile touch controls, and Xbox/PlayStation controller bindings.
> - **When reporting or fixing bugs**: Mention the specific cabinet file (`src/components/`) or game engine script (`src/game/`).

---

## 🛠️ How to Add or Extend a Game/Console

Follow these steps when adding a new title or console to the vault:

### Step 1: Add Game Metadata (`src/i18n/lobbyTranslations.ts`)
Add the game ID to the `GameMetadata['id']` union type and insert its bilingual metadata object in `GAMES_METADATA`:
```typescript
{
  id: 'my_new_game',
  year: 1995,
  yearDisplay: '1995',
  yearIcon: '🎮',
  system: 'ps1', // 'arcade' | 'c64' | 'bbc_micro' | 'gameboy' | 'gba_sp' | 'ps1' | 'msdos'
  systemName: { nl: '...', en: '...' },
  genre: 'platform',
  genreName: { nl: '...', en: '...' },
  category: 'portable',
  title: 'MY NEW GAME (3D)',
  subtitle: { nl: '...', en: '...' },
  creator: 'Developer Name',
  cabinetTheme: { ... },
  summary: { nl: '...', en: '...' },
  highlights: { nl: [...], en: [...] },
  specs: { ... },
  coinPrice: '1 Coin / Card'
}
```

### Step 2: Create or Update Cabinet Component (`src/components/`)
- For Game Boy games, use/extend `GameBoyCabinet.tsx` or `GameBoyHistoryModal.tsx`.
- For Game Boy Advance SP games, use/extend `GbaSpCabinet.tsx` or `GbaHistoryModal.tsx`.
- For PlayStation 1 games, use/extend `Ps1Cabinet.tsx` or `Ps1HistoryModal.tsx`.
- For standalone arcade/PC games, create `MyNewGameCabinet.tsx`.

### Step 3: Register Active Screen (`src/App.tsx` & `src/components/ArcadeLobby.tsx`)
- Add the game ID to `activeScreen` state in `App.tsx` and render the cabinet component.
- Add launcher handler and default high score in `ArcadeLobby.tsx`.

### Step 4: Documentation Update
Always update `README.md`, `docs/GAMES_CATALOG.md`, `docs/ARCHITECTURE.md`, and `docs/CONTROLS.md` when adding new titles or hardware platforms.

---

## 🤖 AI Prompting Instructions for Game Engine Enhancements

When asking AI models (such as Gemini in AI Studio) to build or improve a game engine in this repository, use the following structured prompt template:

```
Context: Clean-room TypeScript game engine in `src/game/` or `src/components/`.
Task: Refine physics and game loop for [GAME_NAME].
Requirements:
1. Pure TypeScript and Canvas 2D / Three.js — zero external ROMs or assets.
2. Maintain fixed 60 FPS requestAnimationFrame update loop with sub-stepping.
3. Integrate browser Web Audio API for sound effects (no MP3 files).
4. Support WASD/Arrows, Gamepad API (Xbox/PS4/PS5), and Touch/Gyro.
5. Provide bilingual Dutch and English labels.
```

---

## ⚙️ Development Environment & Verification

Before opening a PR or completing an AI session, verify that the application compiles cleanly:

```bash
npm run lint    # Runs TypeScript type check
npm run build   # Verifies production Vite build
```
Ensure the development server runs smoothly on port 3000 (`http://localhost:3000/`).
