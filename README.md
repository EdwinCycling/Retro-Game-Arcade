# 🕹️ Classic Retro Arcade & Historic Computer Vault

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.1-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.186-black.svg?style=flat-square&logo=three.js)](https://threejs.org/)
[![Web Audio API](https://img.shields.io/badge/Audio-Chiptune_Synthesizers-orange.svg?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

An interactive, browser-native **Retro Arcade & Historic Computer Museum** featuring **35 fully playable classic games** spanning 1972 through 2011. Built from scratch with zero external game ROM dependencies using pure TypeScript, React 19, Canvas 2D, Three.js WebGL, and real-time Web Audio API sound synthesizers.

---

## 🌟 Key Features

- **🏛️ 3 Interactive Museum Views**:
  - **3D Arcade Floor View**: Walk through a neon-lit arcade hall in first-person 3D (`Three.js`), inspect physical cabinets, and step up to any machine to play.
  - **Grid Cards View**: Filterable by genre, release year, hardware platform (Arcade, BBC Micro, Commodore 64, ZX Spectrum, NES, PC/MS-DOS, PS1, Mobile), and keyword search.
  - **Chronological Timeline**: Follow the evolution of gaming history from 1972 (Pong) to 2011 (Temple Run 3D).

- **🎮 Hardware Controller & Multi-Input Support**:
  - **Standard Keyboard & Retro Controls**: Arrow keys, WASD, Space, Z/X/C, and classic text adventure command parsers.
  - **Xbox & PlayStation Controllers (Gamepad API)**: Real-time button mapping, D-Pad, analog sticks, and triggers with on-screen visual controller telemetry.
  - **Mobile Gyroscope Tilt Steering**: Physical phone tilt controls using the browser `DeviceOrientationEvent` with zero-point calibration and deadzone filtering.
  - **Touch & Swipe Gestures**: Smooth canvas swipe gestures (Pac-Man, Frogger, Temple Run, Q*bert) and thumb-friendly on-screen D-Pads and action buttons.
  - **Haptic Feedback**: Crisp tactile vibrations on supported mobile devices.

- **🔊 Real-Time Chiptune Sound Synthesizers**:
  - Pure procedural audio via the **Web Audio API** — no pre-recorded MP3 bloat!
  - Emulated sound chips: **Commodore 64 SID 6581** (ADSR filter sweeps), **Texas Instruments SN76489** (attenuation noise/tones), **General Instrument AY-3-8910**, **IBM PC Speaker** (1-bit square waves), and **Yamaha YM2151 FM Synthesis** (OutRun radio stations *Passing Breeze*, *Magical Sound Shower*, and *Splash Wave*).
  - Background arcade hall ambiance generator with crowds, coin drops, and attract-mode chatter.

- **📺 Authentic CRT & Screen Shaders**:
  - Real-time phosphor scanlines, subtle barrel curvature, and retro color palettes:
    - **BBC Micro Mode 5 & Mode 7** (Teletext)
    - **Commodore 64 VIC-II 16-Color Palette**
    - **IBM PC CGA (Cyan/Magenta/White) & EGA 16-Color**
    - **Sinclair ZX Spectrum 8-Color Color Clash (Attr Cells)**
    - **Atari Vector Display Generator (DVG)**
    - **Nokia 6110 84x48 Monochrome Green LCD**

- **🌐 Dual-Language Support**:
  - Seamless toggle between **English** (Default) and **Nederlands** (Dutch).
  - Detailed historical dossiers, creator trivia, and hardware specs for each game.

---

## 🤖 Built with Artificial Intelligence (AI-Engineered)

This entire retro vault — including all **35 clean-room game engines**, sub-stepped physics pipelines, procedural Web Audio chip synthesizers, CRT shaders, and the 3D WebGL arcade hall — was conceptualized, structured, and **coded in collaboration with modern AI models (Google AI Studio / Gemini)**.

It serves as an educational and technical exploration of how modern generative AI coding tools can reconstruct computer gaming history in pure, browser-native web standards (TypeScript, Canvas 2D, Three.js, and Web Audio API) with **zero external ROM dependencies**.

---

## 🕹️ Game Implementation Status & Maturity Levels

Because all 35 games are custom-engineered from scratch with AI assistance, **the depth and fidelity vary naturally across titles**:

### 🟢 Tier 1: Highly Detailed & Multi-Level Re-creations
These titles feature deep, faithful game loops, accurate physics, sound synthesis, multi-stage progression, and full high-score saving:
- **Pac-Man (1980)**: Authentic 4-ghost AI state machines (Blinky chaser/Cruise Elroy, Pinky ambusher, Inky vector flanker, Clyde coward), scatter/chase/frightened cycles, fruit bonuses, eating animations, and high scores.
- **OutRun (1986)**: Pseudo-3D road projection with curve scaling and undulating hills, Ferrari Testarossa Spider, traffic AI, manual Low/High gear shifting up to 293 km/h, and real-time FM radio tracks (*Passing Breeze*, *Magical Sound Shower*, *Splash Wave*).
- **Space Invaders (1978)**: 55-alien marching army with dynamic speed acceleration, destructible bunker erosion, flying mystery saucers, and gyroscope tilt aiming.
- **Exile (1988)**: Peter Irvin & Jeremy Smith's legendary Newtonian gravitational physics sandbox on planet Phoebus, directional jetpack thruster, momentum, particle blaster, equipment teleporter, and gravity-defying boulder lifting.
- **Asteroids (1979)**: Authentic Atari vector DVG cathode-ray wireframe aesthetics, true Newtonian inertia, screen wrap-around, hyperspace jump, and splitting rock physics.
- **Repton (1985)**: Full physics for falling rocks and cascades, earth digging, diamonds, cages & keys, time bombs, and all 12 original level passwords (A through L).
- **Tetris (1984)**: All 7 official tetrominoes, Super Rotation System (SRS) wall kicks, ghost piece guide, accelerating drop gravity, and line clearing.
- **King's Quest I & Space Quest I (1984/1986)**: Rich AGI text-parser adventure games supporting both English and Dutch natural language commands, room navigation, inventory items, puzzles, and save/load slots.
- **Double Dragon, C64 Pinball Power, Frogger, Chuckie Egg, Eindeloos, Q\*bert, Zaxxon, 3D Monster Maze**: Rich mechanics, sub-step physics, and authentic hardware palettes.

### 🟡 Tier 2: Core Gameplay / Prototype & Stylized Tributes
Some titles are currently in a more **basic, stylized, or prototype phase**. While fully playable, they focus on capturing the core gameplay loop and historic feel rather than achieving 100% visual parity or the extensive content scale of the original multi-megabyte commercial releases:
- **3D Shooters (Wolfenstein 3D, DOOM, Duke Nukem 3D, Half-Life)**: Rebuilt with modern WebGL and raycasting engines. They provide fast-paced 3D shooting, iconic weapons, and retro enemies, but feature streamlined single-mission labyrinth layouts rather than the massive multi-episode commercial campaigns.
- **Super Mario Bros. & Prince of Persia**: Capture the iconic physics, running jumps, and level hazards in a streamlined showcase format, with graphical styling adapted for lightweight browser rendering.
- **Continuous Improvement**: As an open, educational AI-driven project, these implementations continue to be expanded, refined, and polished over time.

---

## 🎮 Controller & Hardware Support: PC Xbox & Mobile

The arcade vault features comprehensive, universal controller support across both desktop computers and mobile devices:

### 💻 PC / Desktop with Xbox Controller
- **Plug & Play Xbox Support**: Connect any official **Xbox Series X/S, Xbox One, or Xbox 360 controller** (via USB cable or Bluetooth). It is instantly recognized through the browser HTML5 Gamepad API without needing any external software or drivers.
- **PlayStation & Generic Controllers**: Also fully supports PS5 DualSense, PS4 DualShock, 8BitDo, and standard PC USB gamepads.
- **Control Layout**:
  - **Left Analog Stick & D-Pad**: 8-way character and vehicle steering.
  - **Button A (Xbox) / Cross (PS)**: Primary Action (Jump, Fire, Throw, Accelerator).
  - **Button B (Xbox) / Circle (PS)**: Secondary Action (Kick, Brake, Gear Shift, Back).
  - **Triggers (RT / LT)**: Gas & Brakes in OutRun; primary/secondary fire in FPS games.
  - **Live Visual Telemetry**: Click the **🎮 Xbox** button in the header to open the interactive controller dashboard, where every button press and stick tilt lights up in real time.

### 📱 Mobile & Tablet Optimization (iOS & Android)
- **Gyroscope Tilt Motion Steering**:
  - In supported games (Pac-Man, Space Invaders, Demon Attack, OutRun, Temple Run, C64 Pinball), tap the **Tilt & Touch** button to enable phone tilt steering.
  - Steer your ship or car simply by tilting your phone left or right, with built-in deadzone filtering to ignore normal hand tremors.
  - Includes a one-tap **Calibrate** button to set your comfortable resting angle as the neutral center.
  - In *3D Pinball Power*, a physical bump or nudge to the phone triggers the classic pinball nudge tilt!
- **Touchscreen Swipe Gestures**:
  - Swipe directly across the game canvas in any direction to turn immediately in *Pac-Man*, *Frogger*, *Q\*bert*, and *Temple Run 3D*.
- **On-Screen Virtual Arcade Controls**:
  - Ergonomic virtual D-Pads and large tactile action buttons appear automatically on touchscreens.
- **Haptic Vibration**:
  - Provides subtle tactile vibrations on supported mobile devices when taking turns, firing lasers, or eating dots.

---

## 🕹️ Complete Catalog of 35 Playable Games

| # | Game | Year | Original Creator / Publisher | Hardware Platform | Engine & Mechanics |
|---|------|------|------------------------------|-------------------|-------------------|
| 1 | **Pong** | 1972 | Allan Alcorn / Atari | Arcade Discrete TTL | Ball-paddle deflection physics, scanlines |
| 2 | **Space Invaders** | 1978 | Tomohiro Nishikado / Taito | Intel 8080 Arcade | 55-alien marching grid, mystery UFO, shields, gyro tilt |
| 3 | **Asteroids** | 1979 | Lyle Rains, Ed Logg / Atari | Atari Vector (DVG) | Pure vector wireframe physics, wrap-around, inertia |
| 4 | **Pac-Man** | 1980 | Toru Iwatani / Namco | Z80 Arcade | Authentic Ghost AI personalities (Blinky, Pinky, Inky, Clyde) |
| 5 | **Donkey Kong** | 1981 | Shigeru Miyamoto / Nintendo | Z80 Arcade | Rolling barrels, ladders, hammer powerup, rivets |
| 6 | **Frogger** | 1981 | Konami / Sega | Z80 Arcade | Traffic timing, floating logs/turtles, river diving |
| 7 | **3D Monster Maze** | 1981 | Malcolm Evans / J.K. Greye | Sinclair ZX81 (16KB) | 3D raycasted pseudo-perspective maze, T-Rex AI tracker |
| 8 | **Arcadians** | 1982 | Orlando / Acornsoft | BBC Micro (6502) | Mode 1 sprite diving formations, chiptune sound |
| 9 | **Rocket Raid** | 1982 | Jonathan Griffiths / Acornsoft | BBC Micro & Electron | Multi-section horizontal scroller with fuel management |
| 10 | **Q*bert** | 1982 | Warren Davis, Jeff Lee / Gottlieb | Arcade Discrete Sound | Isometric 3D pyramid, color-stepping cubes, Coily AI |
| 11 | **Demon Attack** | 1982 | Rob Fulop / Imagic | Atari 2600 & TI-99/4A | Splitting bird demons, laser base steering, gyro tilt |
| 12 | **Zaxxon** | 1982 | Ikegami Tsushinki / Sega | Z80 Arcade | First true isometric 3D scrolling shooter, altitude shadows |
| 13 | **Chuckie Egg** | 1983 | Nigel Alderton / A&F Software | ZX Spectrum & BBC Micro | 8-floor egg collection, ostriches, elevators, countdown |
| 14 | **Mario Bros.** | 1983 | Shigeru Miyamoto / Nintendo | Z80 Arcade | Pipe floor bumping, Shellcreepers, Sidesteppers, Slipice |
| 15 | **Manic Miner** | 1983 | Matthew Smith / Bug-Byte | ZX Spectrum (48K) | 20 cavern rooms, pixel-precise jumping, oxygen gauge |
| 16 | **FRAK!** | 1984 | Orlando / Aardvark Software | BBC Micro (6502) | Troglodyte platformer with yoyo weapon & "Frak!" sound |
| 17 | **Tetris** | 1984 | Alexey Pajitnov / D. Pavlovsky | Electronika 60 | 7 tetrominoes, Super Rotation System (SRS), line clearing |
| 18 | **King's Quest I** | 1984 | Roberta Williams / Sierra On-Line | IBM PC / PCjr (AGI) | Two-word natural English/Dutch parser, inventory, quests |
| 19 | **Repton** | 1985 | Tim Tyler / Superior Software | BBC Micro & Electron | Boulders gravity physics, diamonds, keys, time bombs |
| 20 | **Eindeloos** | 1985 | Radarsoft | Commodore 64 & MSX | Full 360-degree helicopter radar scouting over dunes |
| 21 | **Super Mario Bros.** | 1985 | Shigeru Miyamoto / Nintendo | Nintendo NES (Famicom) | World 1-1 to 1-4, Mushroom, Fire Flower, Goombas, Koopas |
| 22 | **Space Quest I** | 1986 | Two Guys from Andromeda / Sierra | IBM PC MS-DOS (EGA) | Roger Wilco Janitor adventure, full text parser & puzzles |
| 23 | **OutRun** | 1986 | Yu Suzuki / Sega | Sega OutRun (Super Scaler) | Pseudo-3D road curves & hills, Ferrari Testarossa, FM Radio |
| 24 | **Double Dragon** | 1987 | Yoshihisa Kishimoto / Technos | Arcade 6809 | 2.5D street brawler, punches, kicks, jump kicks, elbows |
| 25 | **Battle Chess** | 1988 | Interplay / Brian Fargo | Amiga 500 / MS-DOS | Full legal chess engine with animated character duel deaths |
| 26 | **Exile** | 1988 | Peter Irvin, Jeremy Smith / Superior | BBC Micro Mode 5 | Newtonian physics sandbox on Planet Phoebus, thrusters |
| 27 | **Prince of Persia** | 1989 | Jordan Mechner / Brøderbund | Apple II / MS-DOS | Rotoscoped smooth skeletal jumping, sword dueling, spikes |
| 28 | **3D Pinball Power** | 1989 | Mastertronic | Commodore 64 | Multi-angle table physics, bumpers, spinners, tilt/nudge |
| 29 | **Lemmings** | 1991 | DMA Design / Psygnosis | Amiga 500 & C64 | Destructible voxel terrain, diggers, blockers, bombers |
| 30 | **Wolfenstein 3D** | 1992 | John Carmack, John Romero / id | MS-DOS (VGA 320x200) | DDA Raycasting 3D engine, SS guards, secret pushwalls |
| 31 | **DOOM** | 1993 | id Software | MS-DOS (Mode 13h) | High-speed 3D raycasting, Imps, Shotgun, Chaingun, E1M1 |
| 32 | **Duke Nukem 3D** | 1996 | 3D Realms / Ken Silverman | MS-DOS Build Engine | High-res WebGL 3D shooter, kick attack, pistol, Pigcops |
| 33 | **Nokia Snake** | 1997 | Taneli Armanto / Nokia | Nokia 6110 Phone | 84x48 monochrome LCD display, 9 speed levels, high scores |
| 34 | **Half-Life** | 1998 | Gabe Newell, Marc Laidlaw / Valve | PC Windows (GoldSrc) | Black Mesa 3D WebGL engine, Crowbar, MP5, Headcrabs, HEV |
| 35 | **Temple Run 3D** | 2011 | Keith Shepherd, Natalia Luckyanova | iOS & Android | Full 3D WebGL runner, 90-deg turns, coin magnets, tilt |

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/classic-retro-arcade.git
   cd classic-retro-arcade
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   The application will start at `http://localhost:3000/`.

4. **Build for production**:
   ```bash
   npm run build
   ```
   Compiles assets to the `dist/` directory with full optimization.

5. **Preview production build locally**:
   ```bash
   npm run preview
   ```

6. **Run TypeScript type checks & linting**:
   ```bash
   npm run lint
   ```

---

## 🛠️ Tech Stack & Architecture

- **UI Framework**: [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/)
- **Language**: [TypeScript 5.8](https://www.typescriptlang.org/) (Strict mode enabled)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom retro neon design tokens
- **3D Graphics & Floor View**: [Three.js r186](https://threejs.org/)
- **Audio Synthesis**: Native Browser [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (OscillatorNode, BiquadFilterNode, WaveShaperNode, ConvolverNode)
- **Hardware Integration**: [HTML5 Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) & [DeviceOrientationEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent) (Gyroscope)
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)

---

## 📂 Project Structure

```
classic-retro-arcade/
├── docs/                        # In-depth technical & game documentation
│   ├── ARCHITECTURE.md          # Internal engine & audio architectures
│   ├── CONTROLS.md              # Complete keyboard, gamepad & tilt guide
│   └── GAMES_CATALOG.md         # Detailed dossiers for all 35 games
├── public/                      # Static assets & icons
├── src/
│   ├── components/              # React UI components & arcade cabinets
│   │   ├── ArcadeFloorView.tsx  # Interactive 3D Three.js arcade hall
│   │   ├── ArcadeLobby.tsx      # Main hub with search, filters & cards
│   │   ├── ArcadeTimelineView.tsx # Chronological evolution timeline
│   │   ├── GamepadGuideModal.tsx # Interactive Xbox controller mapping
│   │   ├── TiltTouchGuideModal.tsx # Mobile Gyro & Touch instructions
│   │   ├── ProjectInfoModal.tsx # In-app project architecture dossier
│   │   └── *Cabinet.tsx         # 35 individual game cabinets
│   ├── game/                    # Core physics & game engines
│   │   ├── pacmanEngine.ts      # Ghost AI & maze collision logic
│   │   ├── exilePhysics.ts      # Newtonian gravitational physics
│   │   ├── outrunEngine.ts      # Pseudo-3D road scaling & hills
│   │   ├── c64PinballEngine.ts  # Multi-substep ball & bumper physics
│   │   ├── highScores.ts        # LocalStorage high-score tables
│   │   └── ...                  # 35 standalone game engines
│   ├── i18n/                    # Localization dictionaries
│   │   └── lobbyTranslations.ts # English & Dutch metadata & specs
│   ├── utils/                   # Audio synthesis & input controllers
│   │   ├── arcadeHallAudio.ts   # Ambient arcade sounds & chiptunes
│   │   ├── gamepadManager.ts    # Gamepad API subscriber loop
│   │   ├── tiltController.ts    # Mobile gyroscope filter & calibration
│   │   └── haptics.ts           # Vibration feedback integration
│   ├── types.ts                 # Shared global TypeScript definitions
│   ├── App.tsx                  # Root component & view router
│   ├── main.tsx                 # Entrypoint
│   └── index.css                # Tailwind CSS v4 setup
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📜 Documentation Links

- [📐 Engine Architecture & Technical Deep-Dive](docs/ARCHITECTURE.md)
- [🎮 Complete Controls, Gamepad & Mobile Tilt Guide](docs/CONTROLS.md)
- [📚 Historic Dossiers & Trivia for all 35 Games](docs/GAMES_CATALOG.md)

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!
Feel free to open an issue or submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingArcadeFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingArcadeFeature'`)
4. Push to the Branch (`git push origin feature/AmazingArcadeFeature`)
5. Open a Pull Request

---

## ⚖️ License & Legal Notice

Distributed under the **MIT License**. See `LICENSE` for more information.

## Legal & Intellectual Property Notice

Retro Game Arcade is an independent, non-commercial educational and historical project created as a tribute to the evolution of video games and computer-game engineering.

The software implementations in this project have been independently created for this project. No original commercial game ROMs or executable binaries are distributed.

Names of historical video games, companies, systems, characters and other trademarks may be referenced for identification, historical commentary and educational context. These names and trademarks remain the property of their respective rights holders.

This project is not affiliated with, sponsored by, approved by, or endorsed by Nintendo, Atari, Namco, Sega, Taito, id Software, Valve, Konami, Sierra, Electronic Arts, or any other referenced rights holder.

The project is provided free of charge and is not monetised. Its purpose is to document, demonstrate and celebrate significant developments in video-game design and engineering.

Copyrights, trademarks and other intellectual-property rights relating to the original commercial games remain with their respective owners.

If you are a rights holder and believe that material in this project infringes your rights, please contact the project maintainer so that the relevant material can be reviewed and, where appropriate, modified or removed.

For inquiries or takedown requests, please open an issue or contact: `edwin@editsolutions.nl`

### Privacy & Cookies
This project operates with **zero tracking cookies**, zero advertisements, and zero third-party telemetry. All preferences (language, audio settings, high scores) are stored strictly on-device via browser `localStorage`. See [LEGAL.md](LEGAL.md) for our complete privacy policy.


