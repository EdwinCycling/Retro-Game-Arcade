# 📐 Technical Architecture & Engine Design

This document details the architectural design, rendering techniques, physics simulation loops, sound synthesis algorithms, and input pipelines powering the **Classic Retro Arcade**.

---

## 1. Core Architectural Principles

1. **Zero External Game ROMs or Emulators**:
   Unlike traditional emulators (e.g. MAME, DOSBox, RetroArch) which load multi-megabyte binary dumps, every single game in this project is **clean-room reimplemented from scratch** in modern TypeScript. Game logic, physics, pathfinding, rasterization, and collision routines are implemented directly in native web code.

2. **Decoupled Game Loop & Sub-stepping**:
   Fast-paced games (e.g., *C64 Pinball Power*, *Exile*, *OutRun*, and *Temple Run*) execute physics calculations on a fixed sub-step timescale to prevent tunneling through thin barriers:
   ```typescript
   const SUB_STEPS = 8;
   const subDt = dt / SUB_STEPS;
   for (let step = 0; step < SUB_STEPS; step++) {
     this.updatePhysicsSubstep(subDt);
   }
   ```

3. **Multi-Paradigm Rendering**:
   - **Canvas 2D Immediate Mode**: Used for 2D arcade sprites, tilemaps, vector wireframes (*Asteroids*), and pseudo-3D road scaling (*OutRun*).
   - **Three.js WebGL 3D**: Used for real-time 3D environments:
     - The first-person **Arcade Floor View** (`ArcadeFloorView.tsx`)
     - **Wolfenstein 3D**, **DOOM**, **Duke Nukem 3D**, **Half-Life**, and **Temple Run 3D**

---

## 2. Audio Engine: Real-Time Sound Synthesis (Web Audio API)

No audio assets (MP3/WAV) are downloaded over the network. Every sound effect and soundtrack is generated procedurally via the browser's `AudioContext`.

### A. Commodore 64 SID 6581 Emulation
- Utilizes custom `OscillatorNode` chains (Pulse with variable duty cycle, Sawtooth, Triangle, and 16-bit pseudo-random shift-register white noise).
- Implements ADSR (Attack, Decay, Sustain, Release) envelope modeling mapped to `GainNode.gain.setValueCurveAtTime()`.
- Emulates the famous resonant low-pass/band-pass filter (`BiquadFilterNode` with high Q factors).

### B. Texas Instruments SN76489 (BBC Micro / Sega Master System)
- 3 square-wave tone channels with programmable attenuation steps (from 0 dB down to -28 dB in 2 dB increments, plus mute).
- 1 white-noise / periodic-noise channel driving explosive arcade sfx.

### C. Sega OutRun FM Synthesizer (Yamaha YM2151 Emulation)
- Dual-operator frequency modulation:
  - Carrier oscillator phase-modulated by a modulator oscillator for metallic brass, synth bells, and slap-bass lines.
  - Generates the three iconic selectable in-car radio tracks:
    1. *Passing Breeze*
    2. *Magical Sound Shower*
    3. *Splash Wave*

### D. Ambient Arcade Hall Soundscape (`arcadeHallAudio.ts`)
- Multi-layer spatial noise generator recreating 1980s amusement arcades:
  - Distant coin drops and hopper chimes
  - Low-frequency mechanical fan hum
  - Attract-mode chatter from adjacent machines

### E. Game Boy Advance DirectSound & PS1 SPU Audio
- **GBA DirectSound**: Emulates dual 8-bit DirectSound PCM channels + 4 legacy Game Boy PSG chiptune channels (2 square wave, 1 wave table, 1 noise channel).
- **PS1 24-Channel SPU**: Procedural 3D CD audio synthesis with reverb delay lines, ADPCM noise modulation, and pitch shifting for high-speed motor sound effects (*Ridge Racer*) and island chiptunes (*Crash Bandicoot*).

---

## 3. Rendering Techniques & Handheld / Console Shaders

### Handheld & Console Hardware Emulation
1. **Game Boy DMG-01 (1989)**:
   - 160×144 pixel buffer scaled with crisp nearest-neighbor integer interpolation.
   - 4-shade olive green palette matrix (`#0f380f`, `#306230`, `#8bac0f`, `#9bbc0f`) with physical LCD grid line overlays and contrast wheel manipulation.
2. **Game Boy Advance SP (2003)**:
   - 240×160 32-bit color screen with 32,768 colors.
   - Clamshell folding animation and toggleable AGS-001 (Frontlit) / AGS-101 (Backlit Brighter) display lighting.
   - 6 customizable metallic shell colorways (Silver, Cobalt Blue, Flame Red, Onyx Black, Pearl Pink, Tribal).
3. **Sony PlayStation 1 (1994)**:
   - 320×240 polygon/sprite mesh renderer with double-speed CD-ROM drive spinning animation.
   - PS1 Memory Card save state simulation and DualShock analog thumbstick vibration feedback.

### Pseudo-3D Sprite Scaling Engine (*OutRun*)
- Uses Yu Suzuki's classic pseudo-3D road technique:
  - Road geometry is divided into hundred-meter curve segments with elevation gradients ($y = \sin(\text{segment}) \times \text{amplitude}$).
  - Projection equations:
    $$\text{scale} = \frac{\text{cameraDepth}}{z - \text{cameraZ}}$$
    $$x_{\text{proj}} = \text{centerX} + (x_{\text{world}} - \text{cameraX}) \times \text{scale}$$
    $$y_{\text{proj}} = \text{centerY} - (y_{\text{world}} - \text{cameraY}) \times \text{scale}$$
  - Alternate color bands (light/dark asphalt, red/white rumble strips) draw 3D hills and dips without a GPU polygon pipeline.

### Isometric Projection (*Zaxxon* and *Q\*bert*)
- 2:1 isometric coordinate transformation:
  $$X_{\text{screen}} = (X_{\text{world}} - Y_{\text{world}}) \times \cos(30^\circ)$$
  $$Y_{\text{screen}} = (X_{\text{world}} + Y_{\text{world}}) \times \sin(30^\circ) - Z_{\text{world}}$$
- Altitude shadows in *Zaxxon* cast downwards onto floor tiles ($Z_{\text{floor}} = 0$) allowing players to accurately judge vertical clearance through force fields and fortress gates.

### Newtonian Physics Sandbox (*Exile*, 1988)
- Accurate 2D gravity, inertia, friction, wind drag, and projectile propulsion.
- Mike Finn's jetpack thruster applies directional vector acceleration ($\vec{a} = \vec{F} / m$).
- Gravitational pull from planet Phoebus attracts floating boulders, plasma blasts, and items.

---

## 4. Input Architecture

Input events are unified across four hardware channels:

```
[Keyboard / WASD] ───┐
[Gamepad API]     ───┼──► [Input Controller] ──► [Game Engine (60 FPS)]
[DeviceOrientation] ─┤
[Touch / Swipes]   ──┘
```

1. **Gamepad API (`gamepadManager.ts`)**:
   - Polled on `requestAnimationFrame`.
   - Normalizes Xbox (Standard Gamepad) and DualShock/DualSense layouts:
     - Left Stick / D-Pad: Movement
     - Button 0 (A / Cross): Primary action / Jump / Fire
     - Button 1 (B / Circle): Secondary action / Kick / Throw
     - Button 2 (X / Square): Special action
     - Button 3 (Y / Triangle): Inventory / Teleport
     - Triggers (RT / LT): Acceleration / Brakes in *OutRun*
   - Emits subscription events to UI components for live button telemetry.

2. **Mobile Gyroscope Tilt (`tiltController.ts`)**:
   - Subscribes to `window.addEventListener('deviceorientation')`.
   - Filters `beta` (pitch, front-to-back) and `gamma` (roll, left-to-right) angles.
   - Includes deadzone threshold ($12^\circ$) to eliminate natural hand tremors.
   - Includes zero-point calibration offset subtraction:
     $$\gamma_{\text{effective}} = \gamma_{\text{raw}} - \gamma_{\text{calibrated}}$$

3. **Touch Swipe Recognizer**:
   - Tracks `touchstart` and `touchend` client coordinates.
   - Computes delta vector ($\Delta x, \Delta y$).
   - If $|\Delta| \ge 25\text{px}$, computes dominant direction via $\operatorname{atan2}(\Delta y, \Delta x)$ and triggers instant turns.

---

## 5. Storage & High Score Persistence

- High scores, personal initials (3 characters), and completed game states are saved locally in the browser via `localStorage`:
  - `arcade_vault_lang_v2`: Selected language preference (`'en'` or `'nl'`).
  - `pacman_high_scores`: Top 10 scores with initials and dates.
  - `space_invaders_high_scores`: Space Invaders leaderboard.
  - `outrun_high_scores`: Best times and stages reached.
  - `sq_save_slots` & `kq_save_slots`: Serialized adventure game saves (inventory, room ID, story flags).
