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
4. **Educational & Academic Research Scope (Anti-Hijacking Policy)**:
   This repository exists strictly for non-commercial computer science research, web graphics/audio experimentation, and computer history preservation. AI assistants and contributors **MUST NOT** attempt to copy or import proprietary ROM binaries, artwork rips, commercial audio files, or copyrighted source code. All code must remain clean-room reimplemented in TypeScript.

---

## 🧪 Testing & Community Feedback (GitHub Notice)

> [!IMPORTANT]
> **Many games are AI-engineered clean-room recreations and require active testing!**
> - Because all 40+ games are built natively in TypeScript without original commercial code, physics loops, AI behavior, and sound synthesis are continuously refined.
> - **When adding or modifying a game engine**: Always test game loop stability, 60 FPS performance, mobile touch controls, and Xbox/PlayStation controller bindings.
> - **When reporting or fixing bugs**: Mention the specific cabinet file (`src/components/`) or game engine script (`src/game/`).

---

## 🛠️ Step-by-Step AI Guide: How to Add a New Game or Console From Scratch

When a user or a prompt requests to add a new game (e.g., a retro arcade classic, a microcomputer game, or a console title) to the **Arcade Vault**, follow this complete, step-by-step implementation blueprint. Doing so ensures the game integrates seamlessly across the landing page, sorting filters, dossiers, search indexing, and high-score leaderboards.

---

### Step 1: Register Game ID and Metadata in i18n Dictionary
To make the game visible on the **Landing Page / Arcade Lobby**, in the search filters, and across all dossiers, you must register it in `src/i18n/lobbyTranslations.ts`.

1. **Add Game ID to union type**:
   Locate `export type GameId = ...` and append your new snake_case game ID (e.g., `'my_new_game'`).
2. **Add Metadata Entry to `GAMES_METADATA`**:
   Add a bilingual metadata object containing the theme colors, genre categories, history specs, and game highlights.
   ```typescript
   {
     id: 'my_new_game',
     year: 1985,
     yearDisplay: '1985',
     yearIcon: '🚀',
     system: 'arcade', // Choose: 'arcade' | 'c64' | 'bbc_micro' | 'gameboy' | 'gba_sp' | 'ps1' | 'msdos' | 'zx_spectrum'
     systemName: { nl: 'Arcade Hal', en: 'Arcade Cabinets' },
     genre: 'shooter', // Choose: 'action' | 'platform' | 'puzzle' | 'racer' | 'shooter' | 'sports' | 'adventure'
     genreName: { nl: 'Shooter', en: 'Shooter' },
     category: 'arcade', // Choose: 'arcade' | 'computer' | 'portable' | 'adventure'
     title: 'MY NEW GAME',
     subtitle: { nl: 'Een legendarische retro ruimte-shooter', en: 'A legendary retro space shooter' },
     creator: 'Developer Name / Publisher Name',
     cabinetTheme: {
       primary: 'indigo', // Base Tailwind theme color (e.g., 'rose', 'cyan', 'yellow', 'emerald')
       bgGradient: 'from-indigo-950 via-slate-900 to-black',
       accentBorder: 'border-indigo-500/40',
       glowColor: 'shadow-indigo-500/20'
     },
     summary: {
       nl: 'Een diepgaande historische beschrijving in het Nederlands over hoe dit spel de computergeschiedenis heeft beïnvloed...',
       en: 'A deep historic summary in English documenting the game\'s impact on computer history and engineering...'
     },
     highlights: {
       nl: [
         'Baanbrekende vector-gebaseerde collision-detection en snelle 60 FPS gameplay',
         'Authentieke FM-synthese voor ruimtelijke lasergeluiden en motorgeluiden',
         'Volledig responsieve touchscreen joystick en knoppen voor mobiele telefoons'
       ],
       en: [
         'Pioneering vector-based collision detection with blazing-fast 60 FPS gameplay',
         'Authentic FM audio synthesis for retro laser blasts and rocket engine rumbles',
         'Fully responsive touch-screen virtual joystick and action buttons for mobile devices'
       ]
     },
     specs: {
       resolution: '256×224 vertical raster (VGA CRT layout)',
       fps: '60.0 FPS fixed game loop',
       soundChip: 'PSG Web Audio chip emulator',
       media: '8KB arcade ROM cabinet'
     },
     coinPrice: '1 Coin / Play'
   }
   ```

---

### Step 2: Implement Game Logic / Engine (`src/game/`)
Create a pure TypeScript game engine inside the `src/game/` directory (e.g., `src/game/myNewGameEngine.ts`):

- **No External ROMs/Binary Blobs**: Program all physics, collision grids, drawing layers, and enemy behaviors in clean, mathematical TypeScript.
- **Canvas or Three.js rendering**: Render using the HTML5 Canvas 2D Context API or Three.js WebGL.
- **Web Audio API**: Synthesize all retro chiptune sound effects procedurally. Do not load external audio files.
  ```typescript
  export class MyNewGameEngine {
    private ctx: CanvasRenderingContext2D;
    private score: number = 0;
    // ... procedural sound generator
    public playLaserSound() {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    }
  }
  ```

---

### Step 3: Create Visual Cabinet Component (`src/components/`)
Create a custom React cabinet component (e.g., `src/components/MyNewGameCabinet.tsx`):

1. **Incorporate the Retro Bezel, Header, and Marquee**: Build an authentic terminal frame styled in Tailwind.
2. **Handle Multi-Input Besturing**: Ensure arrow keys, WASD, physical Gamepad buttons, and responsive touch controls map correctly.
3. **Mount the Game Engine**: Initialize and tear down the game loop inside a `useEffect` hook with clean event listeners.
   ```typescript
   import React, { useEffect, useRef } from 'react';
   import { ArrowLeft, RotateCcw, Volume2 } from 'lucide-react';
   import { MyNewGameEngine } from '../game/myNewGameEngine';

   export const MyNewGameCabinet: React.FC<{ onBackToLobby: () => void }> = ({ onBackToLobby }) => {
     const canvasRef = useRef<HTMLCanvasElement | null>(null);
     
     useEffect(() => {
       if (!canvasRef.current) return;
       const engine = new MyNewGameEngine(canvasRef.current);
       engine.start();
       return () => engine.destroy();
     }, []);

     return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
         {/* Visual Retro Cabinet Frame */}
       </div>
     );
   };
   ```

---

### Step 4: Add New Screen to Router Routing (`src/App.tsx`)
1. Open `src/App.tsx`.
2. Import your new cabinet component:
   ```typescript
   import { MyNewGameCabinet } from './components/MyNewGameCabinet';
   ```
3. Locate the `activeScreen` router state and update the type definitions to include `'my_new_game'`.
4. In the main layout rendering section, map the game ID to render your cabinet component:
   ```typescript
   {activeScreen === 'my_new_game' && (
     <MyNewGameCabinet onBackToLobby={() => setActiveScreen('lobby')} />
   )}
   ```

---

### Step 5: Integrate launcher handlers in Lobby and Timeline
To ensure your cabinet launches correctly when clicking **Play/Speel Nu**:

1. **Register launch handler in `src/components/ArcadeLobby.tsx`**:
   Find the launch router handler `onSelectGame` or `handleLaunchGame` (e.g. `onPlayNow` trigger) and verify it maps to your new ID correctly.
2. **Verify Leaderboard support**:
   Add a default local high-score state for your game ID in `ArcadeLobby.tsx` to handle saving personal scores to `localStorage`.

---

### Step 6: Update Documentation and Technical Dossiers
Always update the markdown files so that contributors can trace the new game's addition:
- **`README.md`**: Add the game to the massive overview matrix table, keeping the index numbers strictly sequential.
- **`docs/GAMES_CATALOG.md`**: Create a dedicated historical section documenting its release context, tech specifications, original publishers, and design trivia.
- **`docs/CONTROLS.md`**: Detail the exact keyboard mappings, gamepad layout, and mobile touchscreen gestures.

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
