# 🕹️ Classic Retro Arcade, Handheld & Console Vault

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.1-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.186-black.svg?style=flat-square&logo=three.js)](https://threejs.org/)
[![Web Audio API](https://img.shields.io/badge/Audio-Chiptune_Synthesizers-orange.svg?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

An interactive, browser-native **Retro Arcade, Handheld & Computer Museum** featuring **53 fully playable classic games and consoles** spanning 1972 through 2011. Includes arcade cabinets, microcomputers, the **1989 Nintendo Game Boy (DMG-01)**, the **2003 Game Boy Advance SP (32-Bit)**, and the **1994 Sony PlayStation 1 (PS1 32-Bit)**. Built from scratch with zero external game ROM dependencies using pure TypeScript, React 19, Canvas 2D, Three.js WebGL, and real-time Web Audio API sound synthesizers.

---

## 🌟 Key Features

- **🏛️ 3 Interactive Museum Views**:
  - **3D Arcade Floor View**: Walk through a neon-lit arcade hall in first-person 3D (`Three.js`), inspect physical cabinets and consoles, and step up to any machine to play.
  - **Grid Cards View**: Filterable by genre, release year, hardware platform (Arcade, BBC Micro, Commodore 64, ZX Spectrum, NES, PC/MS-DOS, Game Boy, Game Boy Advance SP, Sony PlayStation 1, Mobile), and keyword search.
  - **Chronological Timeline**: Follow the evolution of gaming history from 1972 (Pong) to 2011 (Temple Run 3D) with direct playable dossiers and "Speel Direct" launch shortcuts.

- **🎮 Hardware Controller & Multi-Input Support**:
  - **Standard Keyboard & Retro Controls**: Arrow keys, WASD, Space, Z/X/C, and classic text adventure command parsers.
  - **Xbox & PlayStation Controllers (Gamepad API)**: Real-time button mapping, D-Pad, analog sticks, and triggers with on-screen visual controller telemetry.
  - **Mobile Gyroscope Tilt Steering**: Physical phone tilt controls using the browser `DeviceOrientationEvent` with zero-point calibration and deadzone filtering.
  - **Touch & Swipe Gestures**: Smooth canvas swipe gestures (Pac-Man, Frogger, Temple Run, Q*bert) and thumb-friendly on-screen D-Pads and action buttons.
  - **Haptic Feedback**: Crisp tactile vibrations on supported mobile devices.

- **🔊 Real-Time Chiptune & CD Audio Sound Synthesizers**:
  - Pure procedural audio via the **Web Audio API** — no pre-recorded MP3 bloat!
  - Emulated sound hardware: **Commodore 64 SID 6581** (ADSR filter sweeps), **Texas Instruments SN76489**, **GBA DirectSound 6-Channel Stereo**, **PS1 SPU 24-Channel Audio**, **IBM PC Speaker** (1-bit square waves), and **Yamaha YM2151 FM Synthesis** (OutRun radio stations *Passing Breeze*, *Magical Sound Shower*, and *Splash Wave*).
  - Background arcade hall ambiance generator with crowds, coin drops, and attract-mode chatter.

- **📺 Authentic CRT, LCD & Screen Shaders**:
  - Real-time phosphor scanlines, subtle barrel curvature, and retro screen hardware palettes:
    - **Game Boy DMG 4-Shade Olive Green Dot-Matrix LCD**
    - **Game Boy Advance SP Frontlit / Backlit TFT Screen**
    - **Sony PlayStation 1 Double-Speed CD-ROM 32-Bit Framebuffer**
    - **BBC Micro Mode 5 & Mode 7** (Teletext)
    - **Commodore 64 VIC-II 16-Color Palette**
    - **IBM PC CGA & EGA 16-Color**
    - **Sinclair ZX Spectrum 8-Color Color Clash**
    - **Atari Vector Display Generator (DVG)**
    - **Nokia 6110 84x48 Monochrome Green LCD**

- **🌐 Dual-Language Support**:
  - Seamless toggle between **English** (Default) and **Nederlands** (Dutch).
  - Detailed historical dossiers, creator trivia, hardware specs, and "Speel Direct" launch buttons for all games and consoles.

---

## 🎓 Educational Research Mission & Non-Commercial Preservation Policy

> [!NOTE]
> **Strictly an Educational & Academic Computer History Research Project**
> 
> This repository is developed **strictly for educational, academic, and historical preservation research**. Its goal is to demonstrate how early video game physics, pseudo-3D graphics algorithms, and hardware audio synthesizers can be re-engineered cleanly using modern open web standards (TypeScript, Canvas 2D, Three.js WebGL, and Web Audio API).
>
> - **NOT Intended to Hijack, Compete, or Monetize**: This project does **NOT** attempt to hijack, replace, bypass, or commercialize original intellectual property, trade secrets, or commercial titles.
> - **Zero Commercial Asset Distribution**: No proprietary binary ROM dumps (`.nes`, `.gb`, `.gba`, `.iso`), commercial audio recordings (`.mp3`), or original artwork files are hosted, packaged, or distributed.
> - **Support Official Creators & Rights Holders**: We strongly encourage all visitors and gaming enthusiasts to support the original creators, publishers, and current rights holders by purchasing official commercial remasters, digital re-releases, console collections, and official merchandise.

---

## 🤖 Built with Artificial Intelligence & GitHub Testing Notice

This entire retro vault — including all **53 clean-room game and console engines**, sub-stepped physics pipelines, procedural Web Audio synthesizers, CRT/LCD shaders, and the 3D WebGL arcade hall — was conceptualized, structured, and **coded in collaboration with modern AI models (Google AI Studio / Gemini)**.

### 🧪 GitHub Community Testing & AI Instructions Notice

> [!IMPORTANT]
> **Many games and console engines are in active evolution and require testing!**
> Because all 53 games are re-engineered from scratch in native TypeScript without original ROM binaries:
> 1. **Testing Needed**: Several titles (especially newer console additions like PlayStation 1 3D games, Game Boy Advance SP titles, and 3D FPS engines) need community testing across different browsers, mobile devices, and gamepads.
> 2. **Reporting Issues**: If you encounter a bug, audio glitch, input collision issue, or graphical anomaly, please open a GitHub Issue with reproduction steps.
> 3. **Additional AI Instructions (`AGENTS.md` & `GEMINI.md`)**: When contributing code or using AI coding assistants (such as Google AI Studio, Gemini, or Claude) to expand games, consult `AGENTS.md` and `GEMINI.md` at the project root. These files contain system instructions and guidelines for game physics, input handling, and clean-room coding standards.

---

## 🕹️ Game Implementation Status & Maturity Levels

Because all titles are custom-engineered from scratch with AI assistance, **the depth and fidelity vary naturally across titles**:

### 🟢 Tier 1: Highly Detailed & Multi-Level Re-creations
These titles feature deep, faithful game loops, accurate physics, sound synthesis, multi-stage progression, and full high-score saving:
- **Pac-Man (1980)**: Authentic 4-ghost AI state machines (Blinky chaser/Cruise Elroy, Pinky ambusher, Inky vector flanker, Clyde coward), scatter/chase/frightened cycles, fruit bonuses, and high scores.
- **Game Boy DMG Collection (1989–1998)**: *Super Mario Land*, *Tetris DMG*, *Dr. Mario*, *Metroid II*, *Kirby's Dream Land*, *Super Mario Land 2*, *Zelda: Link's Awakening*, *Donkey Kong '94*, *Pokémon Red & Blue*, and *Wario Land II*.
- **OutRun (1986)**: Pseudo-3D road projection with curve scaling and undulating hills, Ferrari Testarossa Spider, traffic AI, manual gear shifting, and real-time FM radio tracks.
- **Space Invaders (1978)**: 55-alien marching army with dynamic speed acceleration, destructible bunker erosion, flying mystery saucers, and gyroscope tilt aiming.
- **Exile (1988)**: Newtonian gravitational physics sandbox on planet Phoebus, directional jetpack thruster, momentum, particle blaster, equipment teleporter, and gravity-defying boulder lifting.
- **Asteroids (1979)**: Authentic Atari vector DVG cathode-ray wireframe aesthetics, true Newtonian inertia, screen wrap-around, hyperspace jump, and splitting rock physics.
- **Repton (1985)**: Full physics for falling rocks, earth digging, diamonds, cages & keys, time bombs, and all 12 level passwords.
- **Tetris (1984)**: All 7 official tetrominoes, Super Rotation System (SRS) wall kicks, ghost piece guide, and line clearing.
- **King's Quest I & Space Quest I (1984/1986)**: Rich AGI text-parser adventure games supporting both English and Dutch natural language commands.

### 🟡 Tier 2: Core Gameplay / Prototype & Stylized Tributes (Needs Further Testing)
Titles in this tier are fully playable showcases capturing the core mechanics and feel:
- **PlayStation 1 (1994 - Crash Bandicoot 3D & Ridge Racer 3D)**: Rebuilt with WebGL 3D meshes, 60 FPS drift/platforming physics, CD audio, and DualShock gamepad mapping.
- **Game Boy Advance SP (2003 - Pokémon Emerald, Super Mario Advance 4, Zelda: The Minish Cap)**: Featuring 32-bit ARM RISC color graphics, DirectSound chiptunes, and foldable clamshell console UI.
- **3D Shooters (Wolfenstein 3D, DOOM, Duke Nukem 3D, Half-Life)**: Fast-paced 3D raycasting/WebGL shooters with iconic weapons, retro enemies, and mission layouts.

---

## 🎮 Controller & Hardware Support: PC Xbox & Mobile

- **PC / Xbox & PS4/PS5 Controllers**: Instant plug-and-play via the HTML5 Gamepad API with live visual controller telemetry dashboard (**🎮 Xbox** button in header).
- **Mobile Gyroscope Motion Steering**: Tilt your smartphone left/right/forward to steer in *Pac-Man*, *OutRun*, *Space Invaders*, *Temple Run 3D*, and *3D Pinball Power*.
- **Touch Gestures & D-Pad**: Touchscreen swipe controls and ergonomic virtual retro D-Pads with haptic vibration feedback.

---

## 🕹️ Complete Catalog of Games & Consoles

| # | Game / Console | Year | Original Creator / Publisher | Hardware Platform | Key Mechanics & Features |
|---|----------------|------|------------------------------|-------------------|--------------------------|
| 1 | **Pong** | 1972 | Allan Alcorn / Atari | Arcade Discrete TTL | Vector deflection, scanlines, paddle physics |
| 2 | **Space Invaders** | 1978 | Tomohiro Nishikado / Taito | Intel 8080 Arcade | 55-alien marching grid, mystery UFO, gyro tilt |
| 3 | **Asteroids** | 1979 | Lyle Rains, Ed Logg / Atari | Atari Vector (DVG) | Pure vector wireframe physics, wrap-around |
| 4 | **Pac-Man** | 1980 | Toru Iwatani / Namco | Z80 Arcade | Authentic Ghost AI personalities (Blinky, Pinky, Inky, Clyde) |
| 5 | **Donkey Kong** | 1981 | Shigeru Miyamoto / Nintendo | Z80 Arcade | Rolling barrels, ladders, hammer powerup |
| 6 | **Frogger** | 1981 | Konami / Sega | Z80 Arcade | Traffic timing, floating logs/turtles, river diving |
| 7 | **3D Monster Maze** | 1981 | Malcolm Evans / J.K. Greye | Sinclair ZX81 (16KB) | 3D raycasted maze, T-Rex AI tracker |
| 8 | **Arcadians** | 1982 | Orlando / Acornsoft | BBC Micro (6502) | Mode 1 sprite diving formations, chiptune sound |
| 9 | **Rocket Raid** | 1982 | Jonathan Griffiths / Acornsoft | BBC Micro & Electron | Horizontal cave scroller with fuel management |
| 10 | **Q*bert** | 1982 | Warren Davis, Jeff Lee / Gottlieb | Arcade Discrete Sound | Isometric 3D pyramid, Coily AI, cursing speech `@!#?@!` |
| 11 | **Demon Attack** | 1982 | Rob Fulop / Imagic | Atari 2600 & TI-99/4A | Splitting bird demons, laser base steering, gyro tilt |
| 12 | **Zaxxon** | 1982 | Ikegami Tsushinki / Sega | Z80 Arcade | First isometric 3D scrolling shooter, altitude shadows |
| 13 | **Chuckie Egg** | 1983 | Nigel Alderton / A&F Software | ZX Spectrum & BBC Micro | 8-floor egg collection, elevators, giant duck timer |
| 14 | **Mario Bros.** | 1983 | Shigeru Miyamoto / Nintendo | Z80 Arcade | Sewer pipe bumping, Shellcreepers, POW block |
| 15 | **Manic Miner** | 1983 | Matthew Smith / Bug-Byte | ZX Spectrum (48K) | 20 cavern rooms, pixel-precise jumping, oxygen gauge |
| 16 | **FRAK!** | 1984 | Orlando / Aardvark Software | BBC Micro (6502) | Troglodyte platformer with yoyo weapon |
| 17 | **Tetris** | 1984 | Alexey Pajitnov / D. Pavlovsky | Electronika 60 | 7 tetrominoes, Super Rotation System (SRS) |
| 18 | **King's Quest I** | 1984 | Roberta Williams / Sierra On-Line | IBM PC / PCjr (AGI) | Natural English/Dutch text parser, inventory, quests |
| 19 | **Repton** | 1985 | Tim Tyler / Superior Software | BBC Micro & Electron | Falling rock physics, diamonds, keys, time bombs |
| 20 | **Eindeloos** | 1985 | Radarsoft | Commodore 64 & MSX | 360-degree helicopter radar scouting over dunes |
| 21 | **Super Mario Bros.** | 1985 | Shigeru Miyamoto / Nintendo | Nintendo NES (Famicom) | World 1-1 to 1-4, Mushroom, Fire Flower, Goombas |
| 22 | **Space Quest I** | 1986 | Two Guys from Andromeda / Sierra | IBM PC MS-DOS (EGA) | Roger Wilco Janitor adventure, full text parser |
| 23 | **OutRun** | 1986 | Yu Suzuki / Sega | Sega OutRun (Super Scaler) | Pseudo-3D road curves & hills, Testarossa, FM Radio |
| 24 | **Double Dragon** | 1987 | Yoshihisa Kishimoto / Technos | Arcade 6809 | 2.5D street brawler, punches, kicks, back elbows |
| 25 | **Battle Chess** | 1988 | Interplay / Brian Fargo | Amiga 500 / MS-DOS | Full legal chess engine with animated character duel deaths |
| 26 | **Exile** | 1988 | Peter Irvin, Jeremy Smith / Superior | BBC Micro Mode 5 | Newtonian physics sandbox on Planet Phoebus, thrusters |
| 27 | **Prince of Persia** | 1989 | Jordan Mechner / Brøderbund | Apple II / MS-DOS | Rotoscoped smooth skeletal jumping, sword dueling |
| 28 | **3D Pinball Power** | 1989 | Mastertronic | Commodore 64 | Multi-angle table physics, bumpers, spinners, tilt/nudge |
| 29 | **Game Boy (DMG-01)** | 1989 | Gunpei Yokoi / Nintendo | Game Boy Handheld | 4-shade olive LCD screen, physical cartridge slot, 10 games |
| 30 | **Super Mario Land** | 1989 | Satoru Okada / Nintendo | Game Boy DMG | Sarasaland, Birabuto, Tatanga spaceship, Sky Pop |
| 31 | **Tetris DMG** | 1989 | Gunpei Yokoi / Nintendo | Game Boy DMG | Korobeiniki chiptune audio, A/B/POWER modes |
| 32 | **Dr. Mario** | 1990 | Gunpei Yokoi / Nintendo | Game Boy DMG | Virus puzzle eradication with vitamin capsules |
| 33 | **Lemmings** | 1991 | DMA Design / Psygnosis | Amiga 500 & C64 | Destructible voxel terrain, diggers, blockers, bombers |
| 34 | **Metroid II** | 1991 | Hiroyuki Kimura / Nintendo | Game Boy DMG | 39 Metroid evolutions on planet SR388 |
| 35 | **Wolfenstein 3D** | 1992 | John Carmack, John Romero / id | MS-DOS (VGA 320x200) | DDA Raycasting 3D engine, SS guards, secret pushwalls |
| 36 | **Kirby's Dream Land** | 1992 | Masahiro Sakurai / HAL | Game Boy DMG | Inhale & float physics, King Dedede |
| 37 | **Super Mario Land 2** | 1992 | Hiroji Kiyotake / Nintendo | Game Boy DMG | 6 Golden Coins & debut of Wario |
| 38 | **DOOM** | 1993 | id Software | MS-DOS (Mode 13h) | High-speed 3D raycasting, Imps, Shotgun, Chaingun |
| 39 | **Zelda: Link's Awakening** | 1993 | Takashi Tezuka / Nintendo | Game Boy DMG | Koholint Island mystery, Wind Fish, dungeons |
| 40 | **Donkey Kong '94** | 1994 | Shigeru Miyamoto / Nintendo | Game Boy DMG | 101 puzzle levels, backflips, key carrying |
| 41 | **PlayStation 1 (PS1)** | 1994 | Ken Kutaragi / Sony | PS1 32-Bit CD-ROM | Double-speed CD-ROM drive, DualShock controller, Memory Card |
| 42 | **Ridge Racer 3D** | 1994 | Kazunori Yamauchi / Namco | PS1 32-Bit | 60 FPS 3D drift racing, F/A sports car, Namco techno CD |
| 43 | **Crash Bandicoot 3D** | 1996 | Andy Gavin, Jason Rubin / Naughty Dog | PS1 32-Bit | 3D corridor platforming, spin attacks, Aku Aku masks |
| 44 | **Duke Nukem 3D** | 1996 | 3D Realms / Ken Silverman | MS-DOS Build Engine | High-res WebGL 3D shooter, kick attack, pistol, Pigcops |
| 45 | **Pokémon Red & Blue** | 1996 | Satoshi Tajiri / Game Freak | Game Boy DMG | 151 Monster RPG, turn-based battles, Kanto region |
| 46 | **Nokia Snake** | 1997 | Taneli Armanto / Nokia | Nokia 6110 Phone | 84x48 monochrome LCD display, 9 speed levels |
| 47 | **Half-Life** | 1998 | Gabe Newell, Marc Laidlaw / Valve | PC Windows (GoldSrc) | Black Mesa 3D WebGL engine, Crowbar, MP5, Headcrabs |
| 48 | **Wario Land II** | 1998 | Takehiro Izushi / Nintendo | Game Boy DMG | Immortal anti-hero puzzle platformer |
| 49 | **Game Boy Advance SP** | 2003 | Nintendo R&D2 / Nintendo | GBA SP 32-Bit | Foldable clamshell, AGS-101 lit screen, 6 metallic colors |
| 50 | **Super Mario Advance 4** | 2003 | Shigeru Miyamoto / Nintendo | GBA SP 32-Bit | 32-bit Super Mario Bros 3 remaster, Tanooki suit |
| 51 | **Pokémon Emerald** | 2004 | Junichi Masuda / Game Freak | GBA SP 32-Bit | Animated 32-bit battle sprites, Rayquaza, Battle Frontier |
| 52 | **Zelda: The Minish Cap** | 2004 | Capcom / Flagship / Nintendo | GBA SP 32-Bit | Shrink to Minish size, Ezlo hat, Four Sword quest |
| 53 | **Temple Run 3D** | 2011 | Keith Shepherd / Imangi | iOS & Android | Full 3D WebGL runner, 90-deg turns, coin magnets |

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
- **Audio Synthesis**: Native Browser [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- **Hardware Integration**: [HTML5 Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) & [DeviceOrientationEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent) (Gyroscope)
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)

---

## 📂 Project Structure

```
classic-retro-arcade/
├── AGENTS.md                    # System instructions for AI assistants & contributors
├── GEMINI.md                    # Gemini AI developer guidelines & game prompt standards
├── docs/                        # In-depth technical & game documentation
│   ├── ARCHITECTURE.md          # Internal engine, audio & shader architectures
│   ├── CONTROLS.md              # Complete keyboard, gamepad & tilt guide
│   └── GAMES_CATALOG.md         # Detailed dossiers for all games & consoles
├── public/                      # Static assets & icons
├── src/
│   ├── components/              # React UI components & arcade cabinets
│   │   ├── ArcadeFloorView.tsx  # Interactive 3D Three.js arcade hall
│   │   ├── ArcadeLobby.tsx      # Main hub with search, filters & cards
│   │   ├── ArcadeTimelineView.tsx # Chronological evolution timeline
│   │   ├── GameBoyCabinet.tsx   # 1989 Game Boy DMG cabinet engine
│   │   ├── GbaSpCabinet.tsx     # 2003 Game Boy Advance SP cabinet
│   │   ├── Ps1Cabinet.tsx       # 1994 Sony PlayStation 1 cabinet
│   │   ├── GamepadGuideModal.tsx # Interactive Xbox controller mapping
│   │   └── *Cabinet.tsx         # Standalone game cabinets
│   ├── game/                    # Core physics & game engines
│   ├── i18n/                    # Localization dictionaries
│   │   └── lobbyTranslations.ts # English & Dutch metadata & specs
│   ├── utils/                   # Audio synthesis & input controllers
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

## 🌐 Official Original Publishers & Rights Holders Directory

To encourage visitors to explore, support, and purchase the official commercial releases, remasters, and original titles created by these legendary hardware and software pioneers, direct links to official publisher sites are listed below:

| Original Company / Rights Holder | Associated Games & Hardware Platforms | Official Websites & Storefronts |
|-----------------------------------|---------------------------------------|---------------------------------|
| **Nintendo Co., Ltd.** | *Donkey Kong*, *Mario Bros.*, *Super Mario Bros.*, *Game Boy (DMG-01)*, *Super Mario Land*, *Tetris DMG*, *Dr. Mario*, *Metroid II*, *Kirby's Dream Land*, *Super Mario Land 2*, *Zelda: Link's Awakening*, *Donkey Kong '94*, *Wario Land II*, *Game Boy Advance SP*, *Super Mario Advance 4*, *Zelda: The Minish Cap* | [Nintendo Official Site](https://www.nintendo.com) • [Nintendo Store](https://store.nintendo.com) |
| **Bandai Namco Entertainment** | *Pac-Man*, *Ridge Racer 3D* | [Bandai Namco Official Portal](https://www.bandainamcoent.com) • [Pac-Man Official](https://pacman.com) |
| **Sega Corporation** | *OutRun*, *Zaxxon*, *Frogger* | [Sega Official Website](https://www.sega.com) • [Sega Shop](https://shop.sega.com) |
| **Sony Interactive Entertainment** | *PlayStation 1 (PS1)* | [PlayStation Official Site](https://www.playstation.com) • [PlayStation Store](https://store.playstation.com) |
| **Game Freak Inc.** | *Pokémon Red & Blue*, *Pokémon Emerald* | [Pokémon Official Website](https://www.pokemon.com) • [Game Freak](https://www.gamefreak.co.jp) |
| **Capcom Co., Ltd.** | *The Legend of Zelda: The Minish Cap* | [Capcom Official Website](https://www.capcom.com) |
| **Naughty Dog / Sony** | *Crash Bandicoot 3D* | [Naughty Dog Official](https://www.naughtydog.com) • [Crash Bandicoot Portal](https://www.crashbandicoot.com) |
| **Taito Corporation / Square Enix** | *Space Invaders* | [Taito Official Portal](https://www.taito.co.jp/en) • [Square Enix Store](https://www.square-enix.com) |
| **id Software / Bethesda / Microsoft** | *Wolfenstein 3D*, *DOOM* | [id Software Official](https://www.idsoftware.com) • [Bethesda.net](https://bethesda.net) |
| **Valve Corporation** | *Half-Life* | [Valve Software](https://www.valvesoftware.com) • [Half-Life on Steam](https://store.steampowered.com/app/70/HalfLife/) |
| **Atari Interactive** | *Pong*, *Asteroids* | [Atari Official Portal](https://atari.com) |
| **Activision Blizzard / Sierra On-Line** | *King's Quest I*, *Space Quest I*, *Demon Attack* | [Activision Official](https://www.activision.com) • [Blizzard Entertainment](https://www.blizzard.com) |
| **3D Realms / Apogee** | *Duke Nukem 3D* | [3D Realms Official Portal](https://3drealms.com) |
| **Technos Japan / Arc System Works** | *Double Dragon* | [Arc System Works](https://www.arcsystemworks.jp/en/) |
| **Imangi Studios** | *Temple Run 3D* | [Imangi Studios Official](https://imangistudios.com) |
| **Historical Computer Museums & Archives** | BBC Micro, Commodore 64, ZX Spectrum, ZX81 | [Internet Archive Software Library](https://archive.org/details/softwarelibrary) • [Center for Computing History](https://www.computinghistory.org.uk) |

---

## 📜 Documentation Links

- [📐 Engine Architecture & Technical Deep-Dive](docs/ARCHITECTURE.md)
- [🎮 Complete Controls, Gamepad & Mobile Tilt Guide](docs/CONTROLS.md)
- [📚 Historic Dossiers & Trivia for all Games & Consoles](docs/GAMES_CATALOG.md)
- [🤖 AI Assistant & Contributor Guidelines](AGENTS.md)

---

## 🤝 Contributing

Contributions, bug reports, and testing feedback are warmly welcome!
If you find a game that needs physics tuning, audio adjustments, or bug fixes:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/GameEngineImprovement`)
3. Commit your Changes (`git commit -m 'Improve PS1 drift mechanics'`)
4. Push to the Branch (`git push origin feature/GameEngineImprovement`)
5. Open a Pull Request

---

## ⚖️ License & Legal Notice

Distributed under the **MIT License**. See `LICENSE` for more information.

### Legal & Intellectual Property Notice

Retro Game Arcade is an independent, non-commercial educational and historical project created as a tribute to the evolution of video games, handhelds, consoles, and computer engineering.

No original commercial game ROMs or executable binaries are distributed. All software engines are clean-room reimplemented in TypeScript. Names of historical video games, companies, systems, characters, and trademarks remain the property of their respective rights holders.

For inquiries or takedown requests, please open an issue or contact: `edwin@editsolutions.nl`

### Privacy & Cookies
This project operates with **zero tracking cookies**, zero advertisements, and zero third-party telemetry. All preferences (language, audio settings, high scores) are stored strictly on-device via browser `localStorage`. See [LEGAL.md](LEGAL.md) for our complete privacy policy.


