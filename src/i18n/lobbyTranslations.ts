export type Language = 'nl' | 'en';

export interface GameMetadata {
  id: 'pacman' | 'space_invaders' | 'donkey_kong' | 'demon_attack' | 'repton' | 'eindeloos' | 'frogger' | 'chuckie_egg' | 'frak' | 'arcadians' | 'rocket_raid' | 'qbert' | 'outrun' | 'tetris' | 'kings_quest' | 'space_quest' | 'pong' | 'battle_chess' | 'mario' | 'super_mario' | 'wolfenstein' | 'doom' | 'duke' | 'half_life' | 'c64_pinball' | 'temple_run' | 'lemmings' | 'manic_miner' | 'monster_maze' | 'asteroids' | 'prince' | 'double_dragon' | 'snake' | 'zaxxon' | 'exile' | 'impossible_mission' | 'mario_land' | 'tetris_dmg' | 'dr_mario' | 'metroid_2' | 'kirby_dream_land' | 'mario_land_2' | 'zelda_links_awakening' | 'donkey_kong_94' | 'pokemon_red' | 'wario_land_2' | 'gba_sp' | 'ps1' | 'pokemon_emerald' | 'mario_advance' | 'zelda_minish' | 'crash_bandicoot' | 'ridge_racer' | 'spy_fox' | 'night_driver' | 'topografie_europa' | 'lode_runner' | 'arkanoid' | 'galaga' | 'sudoku' | 'battleship' | 'mastermind' | 'patience' | 'hearts' | 'freecell' | 'spider_solitaire' | 'klaverjassen' | 'blackjack' | 'bridge' | 'radarsoft_3d_ttt' | 'stratego' | 'kamertje_verhuren' | 'connect_four' | 'hangman';
  year: number;
  yearDisplay: string;
  yearIcon: string;
  system: 'bbc_micro' | 'arcade' | 'c64' | 'atari_2600' | 'ibm_pc' | 'mobile' | 'zx_spectrum' | 'zx81' | 'dos_pc' | 'gameboy' | 'gba_sp' | 'ps1' | 'apple_ii';
  systemName: { nl: string; en: string };
  genre: 'space' | 'maze' | 'platform' | 'simulation' | 'puzzle' | 'adventure' | 'runner' | 'horror' | 'cinematic_platform' | 'beat_em_up' | 'snake' | 'racing' | 'physics_sandbox' | 'rpg' | 'action';
  genreName: { nl: string; en: string };
  category?: 'arcade' | 'adventure' | 'c64' | 'mobile' | 'spectrum' | 'zx81' | 'handheld' | 'portable' | 'brain_logic' | 'card_games';
  categoryName?: { nl: string; en: string };
  title: string;
  subtitle: { nl: string; en: string };
  creator: string;
  cabinetTheme: {
    primaryColor: string;
    secondaryColor: string;
    neonColor: string;
    glowBorder: string;
    accentBg: string;
    textColor: string;
    marqueeBg: string;
  };
  summary: { nl: string; en: string };
  highlights: { nl: string[]; en: string[] };
  specs: {
    resolution: string;
    fps: string;
    soundChip: string;
    media: string;
  };
  coinPrice: string;
}

export const GAMES_METADATA: GameMetadata[] = [
  {
    id: 'space_invaders',
    year: 1978,
    yearDisplay: '1978',
    yearIcon: '👾',
    system: 'arcade',
    systemName: { nl: 'Speelhal Coin-Op', en: 'Arcade Coin-Op' },
    genre: 'space',
    genreName: { nl: 'Space Shooter', en: 'Space Shooter' },
    title: 'SPACE INVADERS',
    subtitle: { nl: 'De Geboorte van het Arcade Tijdperk', en: 'The Dawn of the Arcade Era' },
    creator: 'Taito • Tomohiro Nishikado',
    cabinetTheme: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      neonColor: '#34d399',
      glowBorder: 'rgba(16, 185, 129, 0.4)',
      accentBg: 'from-emerald-950 to-black',
      textColor: 'text-emerald-400',
      marqueeBg: 'bg-emerald-900/60'
    },
    summary: {
      nl: 'De oervader aller shooters. Verdedig de aarde tegen 55 gestaag dalende aliens, gebruik de 4 afbrokkelende bunkers en mik op de mystieke rode UFO voor 300 bonuspunten.',
      en: 'The legendary forefather of all shoot-’em-ups. Defend Earth against 55 descending invaders, take cover behind 4 destructible bunkers, and shoot the mysterious red mystery saucer for 300 bonus points.'
    },
    highlights: {
      nl: ['55 Aliens Formatie', 'Afbrokkelende Bunkers', 'Rode Mysterie UFO (300 ptn)', 'Versnellende Mars Beat'],
      en: ['55 Alien Formation', 'Destructible Bunkers', 'Red Mystery Saucer (300 pts)', 'Accelerating Marching Heartbeat']
    },
    specs: {
      resolution: '224 x 260 Monochrome CRT',
      fps: '60 FPS Hardware Scan',
      soundChip: 'Discrete Analog Sound Circuit',
      media: 'Taito 8080 PCB ROM'
    },
    coinPrice: '100 YEN / 25¢'
  },
  {
    id: 'pacman',
    year: 1980,
    yearDisplay: '1980',
    yearIcon: '🟡',
    system: 'arcade',
    systemName: { nl: 'Speelhal Coin-Op', en: 'Arcade Coin-Op' },
    genre: 'maze',
    genreName: { nl: 'Doolhof & Actie', en: 'Maze & Action' },
    title: 'PAC-MAN',
    subtitle: { nl: 'Het Wereldwijde Popcultuur Fenomeen', en: 'The Worldwide Pop Culture Phenomenon' },
    creator: 'Namco • Toru Iwatani',
    cabinetTheme: {
      primaryColor: '#eab308',
      secondaryColor: '#ca8a04',
      neonColor: '#facc15',
      glowBorder: 'rgba(234, 179, 8, 0.4)',
      accentBg: 'from-yellow-950 to-black',
      textColor: 'text-yellow-400',
      marqueeBg: 'bg-yellow-900/60'
    },
    summary: {
      nl: 'De bestverkochte arcadekast in de geschiedenis. Ren door het neonblauwe doolhof, eet alle 244 stippen, activeer de Power Pellets en jaag op Blinky, Pinky, Inky en Clyde met hun unieke AI-persoonlijkheden.',
      en: 'The highest-grossing arcade cabinet in history. Navigate the neon-blue maze, gobble all 244 dots, chomp Power Pellets, and turn the tables on Blinky, Pinky, Inky, and Clyde with their signature distinct AI algorithms.'
    },
    highlights: {
      nl: ['4 Unieke Geest AI Logica’s', 'Power Pellets & Blauwe Geesten', 'Fruit Bonussen (Kersen tot Sleutel)', 'Authentieke Waka-Waka Audio'],
      en: ['4 Distinct Ghost AI Algorithms', 'Power Pellets & Blue Vulnerable State', 'Fruit Bonuses (Cherry to Key)', 'Authentic Waka-Waka Synthesis']
    },
    specs: {
      resolution: '224 x 288 Raster Color',
      fps: '60.6 FPS Color Refresh',
      soundChip: 'Namco 3-Channel Waveform',
      media: 'Namco Pac-Man PCB'
    },
    coinPrice: '25¢ / 1 GULDEN'
  },
  {
    id: 'donkey_kong',
    year: 1981,
    yearDisplay: '1981',
    yearIcon: '🦍',
    system: 'arcade',
    systemName: { nl: 'Speelhal Coin-Op', en: 'Arcade Coin-Op' },
    genre: 'platform',
    genreName: { nl: 'Platform & Actie', en: 'Platform & Action' },
    title: 'DONKEY KONG',
    subtitle: { nl: 'De Geboorte van Mario & het Platform Genre', en: 'The Birth of Mario & Platforming' },
    creator: 'Nintendo • Shigeru Miyamoto & Gunpei Yokoi',
    cabinetTheme: {
      primaryColor: '#ef4444',
      secondaryColor: '#b91c1c',
      neonColor: '#f87171',
      glowBorder: 'rgba(239, 68, 68, 0.4)',
      accentBg: 'from-red-950 to-black',
      textColor: 'text-red-400',
      marqueeBg: 'bg-red-900/60'
    },
    summary: {
      nl: 'Het baanbrekende meesterwerk van Shigeru Miyamoto dat Nintendo wereldberoemd maakte. Speel alle 4 originele arcade levels: 25m (vaten), 50m (lopende banden), 75m (liften & veren) en 100m (klinknagels) om Pauline te redden!',
      en: 'Shigeru Miyamoto’s revolutionary masterpiece that put Nintendo on the map. Play all 4 authentic arcade stages: 25m (girders), 50m (conveyors), 75m (elevators & springs), and 100m (rivet removal) to rescue Pauline!'
    },
    highlights: {
      nl: ['Alle 4 Originele Niveaus (25m-100m)', 'Rollende & Vallende Vaten', 'Hamer Smash & Bonus Items', 'Donkey Kong Defeat & Romantisch Hartje'],
      en: ['All 4 Authentic Levels (25m-100m)', 'Rolling & Dropping Barrels', 'Hammer Smash & Bonus Items', 'Donkey Kong Defeat & Heart Reunion']
    },
    specs: {
      resolution: '224 x 256 Arcade Color',
      fps: '60 FPS Hardware Scan',
      soundChip: 'Discrete & DAC Synthesizer',
      media: 'Nintendo TKG4 PCB'
    },
    coinPrice: '25¢ / 1 GULDEN'
  },
  {
    id: 'arcadians',
    year: 1982,
    yearDisplay: '1982',
    yearIcon: '🚀',
    system: 'bbc_micro',
    systemName: { nl: 'BBC Micro & Acornsoft', en: 'BBC Micro & Acornsoft' },
    genre: 'space',
    genreName: { nl: 'Space Shooter', en: 'Space Shooter' },
    title: 'ARCADIANS',
    subtitle: { nl: '60 FPS Galaxian Sensatie in Machinecode', en: '60 FPS Machine Code Galaxian Sensation' },
    creator: 'Acornsoft • Nick Pelling',
    cabinetTheme: {
      primaryColor: '#06b6d4',
      secondaryColor: '#0891b2',
      neonColor: '#22d3ee',
      glowBorder: 'rgba(6, 182, 212, 0.4)',
      accentBg: 'from-cyan-950 to-black',
      textColor: 'text-cyan-400',
      marqueeBg: 'bg-cyan-900/60'
    },
    summary: {
      nl: 'Razendsnelle BBC Micro machinecode shooter. 46 ademende buitenaardse schepen voeren vloeiende Bezier-duikvluchten uit. Schiet het gele Flagship neer met twee Red Hornet escorts voor de ultieme 800-punten bonus!',
      en: 'Blisteringly fast 60 FPS BBC Micro assembly shooter. 46 breathing aliens perform swooping Bezier dives. Blast the yellow Flagship accompanied by two Red Hornet escorts to claim the legendary 800-point combo!'
    },
    highlights: {
      nl: ['60 FPS Vloeiende Snelheid', '46-Aliens Formatie', '800 Pts Escort Bonus', 'Alle 20+ Waves Direct Beschikbaar'],
      en: ['60 FPS High-Speed Engine', '46-Alien Breathing Formation', '800 Pts Escort Dive Combo', 'All 20+ Waves Instantly Playable']
    },
    specs: {
      resolution: 'Mode 2 BBC Micro 160 x 256',
      fps: '60 FPS Full Vertical Sync',
      soundChip: 'TI SN76489 4-Channel Sound',
      media: 'Acorn DFS 5.25" Floppy / Tape'
    },
    coinPrice: '10P / FREE PLAY'
  },
  {
    id: 'rocket_raid',
    year: 1982,
    yearDisplay: '1982',
    yearIcon: '🚀',
    system: 'bbc_micro',
    systemName: { nl: 'BBC Micro & Acornsoft', en: 'BBC Micro & Acornsoft' },
    genre: 'space',
    genreName: { nl: 'Side-Scrolling Shooter', en: 'Side-Scrolling Shooter' },
    title: 'ROCKET RAID',
    subtitle: { nl: 'De Iconische Acorn Scramble Sensatie', en: 'The Iconic Acorn Scramble Sensation' },
    creator: 'Acornsoft • Jonathan Griffiths',
    cabinetTheme: {
      primaryColor: '#ec4899',
      secondaryColor: '#db2777',
      neonColor: '#f472b6',
      glowBorder: 'rgba(236, 72, 153, 0.4)',
      accentBg: 'from-pink-950 to-black',
      textColor: 'text-pink-400',
      marqueeBg: 'bg-pink-900/60'
    },
    summary: {
      nl: 'De legendarische BBC Micro & Acorn Electron side-scrolling shooter van Jonathan Griffiths. Vlieg door 5 aaneengesloten fasen (Lunar Outpost, Cavern met Dansende Mijnen, Meteor Canyon, Skyscraper City en het Gele Doolhof), bewaak je brandstof en schakel tussen authentieke Acorn Grijs Monochroom en Mode 2 Kleur!',
      en: 'The legendary BBC Micro & Acorn Electron side-scrolling shooter by Jonathan Griffiths. Navigate through 5 continuous phases (Lunar Outpost, Cavern with Dancing Mines, Meteor Canyon, Skyscraper City, and Yellow Maze), manage fuel, and toggle between authentic Acorn Grey Monochrome and Mode 2 Color!'
    },
    highlights: {
      nl: ['5 Aaneengesloten Fasen', 'Dubbele Bewapening (Laser + Bom)', 'Brandstofmanagement (FUEL Depots)', 'Acorn Grijs Monochroom & Mode 2 Kleur'],
      en: ['5 Continuous Flight Phases', 'Twin Weaponry (Laser + Parabolic Bomb)', 'Fuel Depots Replenishment', 'Acorn Grey Monochrome & Mode 2 Color']
    },
    specs: {
      resolution: 'Mode 2 BBC Micro 320 x 240',
      fps: '60 FPS Acorn Raster Engine',
      soundChip: 'TI SN76489 / 6502 Sound Synth',
      media: 'Acorn DFS 5.25" Floppy / Cassette'
    },
    coinPrice: 'CASSETTE £6.50'
  },
  {
    id: 'qbert',
    year: 1983,
    yearDisplay: '1983',
    yearIcon: '🟠',
    system: 'bbc_micro',
    systemName: { nl: 'BBC Micro & Arcade', en: 'BBC Micro & Arcade' },
    genre: 'puzzle',
    genreName: { nl: 'Isometrische Puzzel & Actie', en: 'Isometric Puzzle & Action' },
    title: 'Q*BERT',
    subtitle: { nl: 'De Isometrische Kubus-Sensatie', en: 'The Isometric Cube Sensation' },
    creator: 'Superior Software / Gottlieb • Warren Davis',
    cabinetTheme: {
      primaryColor: '#f97316',
      secondaryColor: '#ea580c',
      neonColor: '#fb923c',
      glowBorder: 'rgba(249, 115, 22, 0.4)',
      accentBg: 'from-orange-950 to-black',
      textColor: 'text-orange-400',
      marqueeBg: 'bg-orange-900/60'
    },
    summary: {
      nl: 'De tijdloze BBC Micro en Arcade klassieker. Spring met Q*bert diagonaal over een 3D-piramide van 28 kubussen om ze van kleur te laten veranderen, ontwijk Coily de slang, gebruik de vliegende liftschijven en geniet van het legendarische @!#?@! spraakballonnetje!',
      en: 'The timeless BBC Micro and Arcade classic. Hop Q*bert diagonally across a 3D pyramid of 28 cubes to change their color, avoid Coily the snake, escape using flying lift discs, and enjoy the iconic @!#?@! curse balloon!'
    },
    highlights: {
      nl: ['28 Isometrische 3D-Kubussen', 'Diagonale Besturing (Numpad, QWAS & Touch)', 'Coily de Slang & Vliegende Liftschijven', 'Het Iconische @!#?@! Vloekballonnetje'],
      en: ['28 Isometric 3D Cubes', 'Diagonal Directional Controls (Numpad, QWAS & Touch)', 'Coily the Snake & Flying Escape Disks', 'The Iconic @!#?@! Swear Speech Balloon']
    },
    specs: {
      resolution: 'BBC Micro Mode 1 / Gottlieb 256 x 240',
      fps: '60 FPS Raster Video',
      soundChip: 'TI SN76489 Sound & Votrax SC-01 Synth',
      media: 'Superior Software Tape / DFS Disk'
    },
    coinPrice: 'CASSETTE £7.95'
  },
  {
    id: 'demon_attack',
    year: 1982,
    yearDisplay: '1982',
    yearIcon: '🦅',
    system: 'atari_2600',
    systemName: { nl: 'Atari 2600 / Imagic', en: 'Atari 2600 / Imagic' },
    genre: 'space',
    genreName: { nl: 'Space Shooter', en: 'Space Shooter' },
    title: 'DEMON ATTACK',
    subtitle: { nl: 'Het Grafische Meesterwerk van Krydos', en: 'The Visual Masterpiece of Planet Krydos' },
    creator: 'Imagic • Rob Fulop',
    cabinetTheme: {
      primaryColor: '#ef4444',
      secondaryColor: '#b91c1c',
      neonColor: '#f87171',
      glowBorder: 'rgba(239, 68, 68, 0.4)',
      accentBg: 'from-rose-950 to-black',
      textColor: 'text-rose-400',
      marqueeBg: 'bg-rose-900/60'
    },
    summary: {
      nl: 'Gevecht op de ijsplaneet Krydos. De gevleugelde demonen muteren, duiken met felle laserstralen en splitsen zich in latere golven in twee dodelijke mini-demonen.',
      en: 'Battle on the icy crust of planet Krydos. Winged demons mutate, dive with laser barrages, and split into twin deadly mini-demons in advanced combat waves.'
    },
    highlights: {
      nl: ['Spectaculaire Vleugel-Animaties', 'Splitsende Mini-Demonen', 'Verdedigings-Laserschild', 'Imagic Sci-Fi Geluidssynthese'],
      en: ['Fluid Wing Flap Animations', 'Splitting Twin Mini-Demons', 'Defensive Laser Shield', 'Imagic Sci-Fi Audio Synthesis']
    },
    specs: {
      resolution: '160 x 192 TIA Color',
      fps: '60 FPS NTSC / PAL',
      soundChip: 'Atari TIA Sound Synthesizer',
      media: '4KB ROM Cartridge'
    },
    coinPrice: 'CARTRIDGE / 25¢'
  },
  {
    id: 'frogger',
    year: 1982,
    yearDisplay: '1982',
    yearIcon: '🐸',
    system: 'arcade',
    systemName: { nl: 'Speelhal Coin-Op', en: 'Arcade Coin-Op' },
    genre: 'platform',
    genreName: { nl: 'Kruisen & Reflex', en: 'Crossing & Reflex' },
    title: 'FROGGER',
    subtitle: { nl: 'De Ultieme Race Naar Huis', en: 'The Ultimate Rush Home' },
    creator: 'Konami / Sega • Gremlin',
    cabinetTheme: {
      primaryColor: '#84cc16',
      secondaryColor: '#65a30d',
      neonColor: '#a3e635',
      glowBorder: 'rgba(132, 204, 22, 0.4)',
      accentBg: 'from-lime-950 to-black',
      textColor: 'text-lime-400',
      marqueeBg: 'bg-lime-900/60'
    },
    summary: {
      nl: 'Help 5 kikkers veilig naar hun leliebladeren. Steek eerst de razende 5-baans snelweg vol raceauto’s en vrachtwagens over en navigeer daarna over drijvende boomstammen, krokodillen en duikende schildpadden.',
      en: 'Guide 5 adventurous frogs safely to their lily pads. First cross the treacherous 5-lane highway of racing cars and trucks, then navigate drifting logs, snappy alligators, and submerging turtles.'
    },
    highlights: {
      nl: ['5-Baans Snelweg Verkeer', 'Drijvende Boomstammen & Schildpadden', 'Dameskikker & Vliegen Bonussen', 'Vrolijke Chiptune Melodieën'],
      en: ['5-Lane Highway Traffic', 'Drifting Logs & Diving Turtles', 'Lady Frog & Fly Bonuses', 'Iconic Upbeat Chiptune Melodies']
    },
    specs: {
      resolution: '224 x 256 Color Raster',
      fps: '60 FPS Arcade Monitor',
      soundChip: 'Dual AY-3-8910 Sound Generators',
      media: 'Konami Frogger PCB'
    },
    coinPrice: '25¢ / 1 GULDEN'
  },
  {
    id: 'zaxxon',
    year: 1982,
    yearDisplay: '1982',
    yearIcon: '🚀',
    system: 'arcade',
    systemName: { nl: 'Speelhal Coin-Op', en: 'Arcade Coin-Op' },
    genre: 'space',
    genreName: { nl: 'Isometrische 3D Shooter', en: 'Isometric 3D Shooter' },
    title: 'ZAXXON',
    subtitle: { nl: 'De Axonometrische 3D Revolutie met Vloerschaduw', en: 'The Axonometric 3D Revolution with Floor Shadows' },
    creator: 'Sega • Ikegami Tsushinki',
    cabinetTheme: {
      primaryColor: '#2563eb',
      secondaryColor: '#1d4ed8',
      neonColor: '#38bdf8',
      glowBorder: 'rgba(37, 99, 235, 0.4)',
      accentBg: 'from-blue-950 to-black',
      textColor: 'text-blue-400',
      marqueeBg: 'bg-blue-900/60'
    },
    summary: {
      nl: 'De allereerste isometrische arcade shooter ter wereld! Vlieg met je Z-21 straaljager door de asteroïdevesting, bepaal je hoogte aan de hand van je eigen vloerschaduw, vernietig brandstoftanks om niet stil te vallen en versla de reusachtige Zaxxon Robot.',
      en: 'The world\'s first isometric arcade shooter! Pilot your Z-21 fighter through the asteroid fortress, judge your altitude using your own floor shadow, blast yellow fuel tanks to prevent engine flameout, and defeat the giant Zaxxon Robot.'
    },
    highlights: {
      nl: ['Axonometrisch 3D-Perspectief', 'Hoogtebepaling via Vloerschaduw', 'Brandstofmanagement (FUEL Tanks)', 'Reusachtige Zaxxon Robot Boss'],
      en: ['Axonometric 3D Perspective', 'Altitude Judging via Floor Shadow', 'Fuel Management (FUEL Tanks)', 'Giant Zaxxon Robot Boss']
    },
    specs: {
      resolution: '256 x 224 Color Raster CRT',
      fps: '60 FPS Full Vertical Sync',
      soundChip: 'Custom Sega Discrete + SN76489',
      media: 'Sega Zaxxon Dual-PCB ROM'
    },
    coinPrice: '25¢ / 1 GULDEN'
  },
  {
    id: 'chuckie_egg',
    year: 1983,
    yearDisplay: '1983',
    yearIcon: '🥚',
    system: 'bbc_micro',
    systemName: { nl: 'BBC Micro & C64 / ZX', en: 'BBC Micro & C64 / ZX' },
    genre: 'platform',
    genreName: { nl: 'Platform & Ladders', en: 'Platform & Ladders' },
    title: 'CHUCKIE EGG',
    subtitle: { nl: 'Hen-House Harry’s Gouden Eieren Race', en: 'Hen-House Harry’s Golden Egg Chase' },
    creator: 'A&F Software • Nigel Alderton',
    cabinetTheme: {
      primaryColor: '#f97316',
      secondaryColor: '#ea580c',
      neonColor: '#fb923c',
      glowBorder: 'rgba(249, 115, 22, 0.4)',
      accentBg: 'from-amber-950 to-black',
      textColor: 'text-amber-400',
      marqueeBg: 'bg-amber-900/60'
    },
    summary: {
      nl: 'Klim als Hen-House Harry over ladders en platforms om alle 12 gouden eieren te verzamelen voor de klok afloopt. Ontwijk hongerige struisvogels en de reusachtige eendenkooi!',
      en: 'Scale ladders and leap across platforms as Hen-House Harry to harvest all 12 golden eggs before the countdown timer hits zero. Evade relentless ostriches and watch out for the giant duck cage!'
    },
    highlights: {
      nl: ['12 Gouden Eieren Verzamelen', 'Ladders & Platform Acrobatiek', 'Graanzakken Bonus Punten', 'Dodelijke Struisvogels & Reuzeneend'],
      en: ['12 Golden Eggs to Collect', 'Agile Ladder & Platform Acrobatics', 'Corn Seed Extra Bonus Points', 'Deadly Ostriches & Giant Caged Duck']
    },
    specs: {
      resolution: 'Mode 1 BBC Micro 320 x 256',
      fps: '50/60 FPS Timer Driven',
      soundChip: 'BBC Micro 4-Voice Sound',
      media: 'Cassette Tape / Floppy Disk'
    },
    coinPrice: 'CASSETTE £5.95'
  },
  {
    id: 'frak',
    year: 1984,
    yearDisplay: '1984',
    yearIcon: '🪓',
    system: 'bbc_micro',
    systemName: { nl: 'BBC Micro & Acorn Electron', en: 'BBC Micro & Acorn Electron' },
    genre: 'platform',
    genreName: { nl: 'Platform & Fysica', en: 'Platform & Physics' },
    title: 'FRAK!',
    subtitle: { nl: 'Trogg de Holbewoner & de Beruchte Val', en: 'Trogg the Caveman & the Notorious Fall' },
    creator: 'Aardvark Software • Nick Pelling',
    cabinetTheme: {
      primaryColor: '#ec4899',
      secondaryColor: '#db2777',
      neonColor: '#f472b6',
      glowBorder: 'rgba(236, 72, 153, 0.4)',
      accentBg: 'from-pink-950 to-black',
      textColor: 'text-pink-400',
      marqueeBg: 'bg-pink-900/60'
    },
    summary: {
      nl: 'De legendarische BBC Micro platformer met holbewoner Trogg. Geen standaard springen: gebruik je dodelijke Yo-Yo tegen Scrubblies en zwevende monsters, verzamel de F-R-A-K letters en overleef de beruchte val-fysica!',
      en: 'The infamous BBC Micro platformer featuring Trogg the caveman. No simple jump mechanics: swing your lethal yo-yo against Scrubblies and floating foes, hunt for the F-R-A-K letters, and survive ruthless fall physics!'
    },
    highlights: {
      nl: ['Dodelijke Yo-Yo Zwaaibeweging', 'F-R-A-K Letters Doolhof', 'Onverbiddelijke Valfysica', '180° Scherm Omkeer Modus'],
      en: ['Lethal Yo-Yo Weapon Mechanics', 'F-R-A-K Mystery Letter Maze', 'Brutal Strict Fall Physics', '180° Inverted Screen Flip Mode']
    },
    specs: {
      resolution: 'Mode 1 4-Color High Res',
      fps: '50 FPS BBC Video Gate Array',
      soundChip: 'TI SN76489 Sound Chip',
      media: 'Acorn Tape & DFS 40T/80T'
    },
    coinPrice: '10P / CASSETTE'
  },
  {
    id: 'repton',
    year: 1985,
    yearDisplay: '1985',
    yearIcon: '💎',
    system: 'bbc_micro',
    systemName: { nl: 'BBC Micro / Superior Software', en: 'BBC Micro / Superior Software' },
    genre: 'maze',
    genreName: { nl: 'Puzzel & Diamanten', en: 'Puzzle & Diamonds' },
    title: 'REPTON',
    subtitle: { nl: 'De Iconische BBC Micro Puzzelheld', en: 'The Iconic BBC Micro Puzzle Hero' },
    creator: 'Superior Software • Tim Tyler',
    cabinetTheme: {
      primaryColor: '#a855f7',
      secondaryColor: '#7e22ce',
      neonColor: '#c084fc',
      glowBorder: 'rgba(168, 85, 247, 0.4)',
      accentBg: 'from-purple-950 to-black',
      textColor: 'text-purple-400',
      marqueeBg: 'bg-purple-900/60'
    },
    summary: {
      nl: 'Graaf door ondergrondse gangen, vang vallende rotsblokken op, hak glinsterende diamanten uit de aarde en ontwijk monsters die uit brekende eieren kruipen.',
      en: 'Tunnel through subterranean caverns, dodge crushing boulders, excavate shimmering diamonds, and outsmart monsters hatching from cracking monster eggs.'
    },
    highlights: {
      nl: ['Vallende Rotsblok Fysica', 'Glanzende Diamanten Doelen', 'Monstereieren & Sleutels', 'Tientallen Uitdagende Grotten'],
      en: ['Falling Boulder Gravity Physics', 'Glistening Diamond Objectives', 'Monster Eggs & Vault Keys', 'Dozens of Intricate Caverns']
    },
    specs: {
      resolution: 'Mode 1 BBC Micro 320 x 256',
      fps: '50 FPS Smooth Scroll',
      soundChip: 'BBC Internal Sound Chip',
      media: 'Superior Software Cassette/Disk'
    },
    coinPrice: 'CASSETTE £7.95'
  },
  {
    id: 'exile',
    year: 1988,
    yearDisplay: '1988',
    yearIcon: '🚀',
    system: 'bbc_micro',
    systemName: { nl: 'BBC Micro & Superior Software', en: 'BBC Micro & Superior Software' },
    genre: 'physics_sandbox',
    genreName: { nl: 'Newtoniaanse Physics Sandbox', en: 'Newtonian Physics Sandbox' },
    title: 'EXILE',
    subtitle: { nl: 'Peter Irvin & Jeremy Smith • Triomf op Planeet Phoebus', en: 'Peter Irvin & Jeremy Smith • Triumph on Planet Phoebus' },
    creator: 'Superior Software • Peter Irvin & Jeremy Smith',
    cabinetTheme: {
      primaryColor: '#06b6d4',
      secondaryColor: '#0284c7',
      neonColor: '#38bdf8',
      glowBorder: 'rgba(6, 182, 212, 0.45)',
      accentBg: 'from-cyan-950 to-black',
      textColor: 'text-cyan-400',
      marqueeBg: 'bg-cyan-900/70'
    },
    summary: {
      nl: 'De ultieme technologische triomf op de BBC Micro! Bestuur Mike Finn met echte Newtoniaanse traagheid en straalaandrijving in een gigantische ondergrondse grotwereld op planeet Phoebus. Draag en gooi objecten met fysische zwaartekracht, doorwaad water met drijfvermogen, bedien magneetsloten en versla Triax!',
      en: 'The ultimate technological triumph on the BBC Micro! Pilot Mike Finn with genuine Newtonian inertia and jetpack thrust through a vast subterranean cave world on planet Phoebus. Lift and throw objects governed by gravity, navigate water with buoyancy, operate magnetic gates, and defeat Triax!'
    },
    highlights: {
      nl: [
        'Volledige 6502 Newtoniaanse zwaartekracht-, stuwkracht- en wrijving-simulatie',
        'Fysisch interactiesysteem: oppakken, dragen en wegslingeren van rotsen, energiecellen & teleporteerbaken',
        'Omgevingsfysica met drijfvermogen in waterbassins, windschachten en magmastromen',
        'Intelligente wezens waaronder Magpie eksters die spullen stelen en Triax beveiligingsdrones'
      ],
      en: [
        'Full 6502 Newtonian gravity, momentum, and atmospheric drag simulation',
        'Physics item manipulation: pickup, carry, and hurl boulders, power cells & teleport beacon',
        'Environmental fluid dynamics with buoyancy in water bodies, wind vents, and lava pits',
        'Autonomous procedural creature AI including thieving Magpie birds and Triax security drones'
      ]
    },
    specs: {
      resolution: 'BBC Micro Mode 5 High-Res (Scaled 640x480)',
      fps: '50/60 FPS 6502 Vector & Raster Engine',
      soundChip: 'Texas Instruments SN76489 4-Kanaals Audio',
      media: 'Superior Software 5.25" DFS Floppy / Cassette'
    },
    coinPrice: 'CASSETTE £9.95'
  },
  {
    id: 'eindeloos',
    year: 1985,
    yearDisplay: '1985',
    yearIcon: '🌌',
    system: 'c64',
    systemName: { nl: 'Commodore 64 • Nederlands', en: 'Commodore 64 • Dutch Classic' },
    genre: 'simulation',
    genreName: { nl: '3D Vluchtsimulator', en: '3D Wireframe Flight Sim' },
    category: 'c64',
    categoryName: { nl: 'Commodore 64 Klassiekers', en: 'Commodore 64 Classics' },
    title: 'EINDELOOS',
    subtitle: { nl: 'De Nederlandse 3D Wireframe Legende', en: 'The Dutch 3D Wireframe Classic' },
    creator: 'Venlo Soft • John Vanderaart',
    cabinetTheme: {
      primaryColor: '#6366f1',
      secondaryColor: '#4f46e5',
      neonColor: '#818cf8',
      glowBorder: 'rgba(99, 102, 241, 0.4)',
      accentBg: 'from-indigo-950 to-black',
      textColor: 'text-indigo-400',
      marqueeBg: 'bg-indigo-900/60'
    },
    summary: {
      nl: 'De iconische Nederlandse 3D wireframe helicopter-simulator voor de C64. Vlieg door nachtelijk vijandelijk gebied, vernietig gronddoelen, bewaak je brandstof en land op verborgen platforms.',
      en: 'The legendary Dutch 3D wireframe helicopter flight simulator for the Commodore 64. Navigate through hostile night territory, destroy enemy ground silos, monitor fuel, and land on hidden helipads.'
    },
    highlights: {
      nl: ['Vector Wireframe 3D Graphics', 'Helikopter Vluchtfysica & Pitch', 'Brandstof & Munitie Beheer', 'Nederlandse C64 Softwaregeschiedenis'],
      en: ['Vector Wireframe 3D Graphics', 'Helicopter Flight Physics & Pitch', 'Fuel & Ordnance Management', 'Pioneering Dutch C64 Software History']
    },
    specs: {
      resolution: '320 x 200 C64 High Res',
      fps: 'Realtime 3D Vector Rendering',
      soundChip: 'MOS 6581 SID Sound Synthesizer',
      media: 'Commodore 1541 5.25" Diskette'
    },
    coinPrice: 'FL. 24,95 / DISK'
  },
  {
    id: 'tetris',
    year: 1984,
    yearDisplay: '1984',
    yearIcon: '🧱',
    system: 'arcade',
    systemName: { nl: 'Elektronika 60 & Arcade', en: 'Elektronika 60 & Arcade' },
    genre: 'puzzle',
    genreName: { nl: 'Puzzel & Blokken', en: 'Puzzle & Falling Blocks' },
    title: 'TETRIS',
    subtitle: { nl: 'Het Legendarische Sovjet Puzzel Meesterwerk', en: 'The Legendary Soviet Puzzle Masterpiece' },
    creator: 'Alexey Pajitnov • Moscow Academy of Sciences',
    cabinetTheme: {
      primaryColor: '#ef4444',
      secondaryColor: '#b91c1c',
      neonColor: '#f87171',
      glowBorder: 'rgba(239, 68, 68, 0.4)',
      accentBg: 'from-red-950 to-black',
      textColor: 'text-red-400',
      marqueeBg: 'bg-red-900/60'
    },
    summary: {
      nl: 'Het meest verslavende puzzelspel ooit gemaakt. Roteer en positioneer de 7 klassieke tetrominoes, wis 4 lijnen tegelijk voor een spectaculaire TETRIS en geniet van de authentieke 8-bit Korobeiniki chiptune synthesizer.',
      en: 'The most addicting puzzle game ever created. Rotate and align the 7 classic falling tetrominoes, clear 4 lines simultaneously for a glorious TETRIS, and immerse yourself in the authentic 8-bit Korobeiniki chiptune synthesizer.'
    },
    highlights: {
      nl: ['7 Geometrische Tetrominoes', 'Officiële 7-Bag Randomizer', 'SRS Wall Kicks & Ghost Piece', 'Korobeiniki (Type-A) Chiptune Audio'],
      en: ['7 Geometric Tetrominoes', 'Official 7-Bag Randomizer', 'SRS Wall Kicks & Ghost Piece', 'Korobeiniki (Type-A) Chiptune Audio']
    },
    specs: {
      resolution: '10x20 Matrix Grid (480x640 Canvas)',
      fps: '60 FPS Ultra-Responsive',
      soundChip: '8-Bit Korobeiniki Synthesizer',
      media: 'Elektronika 60 & Arcade PCB'
    },
    coinPrice: '1 RUBLE / 25¢'
  },
  {
    id: 'kings_quest',
    year: 1984,
    yearDisplay: '1984',
    yearIcon: '👑',
    system: 'ibm_pc',
    systemName: { nl: 'IBM PC / PCjr & Tandy', en: 'IBM PC / PCjr & Tandy' },
    genre: 'adventure',
    genreName: { nl: 'Grafisch Avontuur', en: 'Graphic Adventure' },
    category: 'adventure',
    categoryName: { nl: 'Grafische Avonturen (Sierra)', en: 'Graphic Adventures (Sierra)' },
    title: "KING'S QUEST I",
    subtitle: { nl: 'Quest for the Crown • Roberta & Ken Williams', en: 'Quest for the Crown • Roberta & Ken Williams' },
    creator: 'Sierra On-Line • IBM PCjr Partnership',
    cabinetTheme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1d4ed8',
      neonColor: '#60a5fa',
      glowBorder: 'rgba(59, 130, 246, 0.4)',
      accentBg: 'from-blue-950 to-black',
      textColor: 'text-blue-400',
      marqueeBg: 'bg-blue-900/60'
    },
    summary: {
      nl: 'De baanbrekende oervader van grafische avonturenspellen. Wandel als Sir Graham vrij door het koninkrijk Daventry, type natuurlijke commando’s via het toetsenbord, ontrafel het kabouterraadsel IFNKOVHGROGH en vind de drie Verloren Schatten van Daventry.',
      en: 'The groundbreaking pioneer of graphic adventure gaming. Roam freely as Sir Graham through the Kingdom of Daventry, type natural commands, solve the enigmatic IFNKOVHGROGH gnome riddle, and retrieve the three Lost Treasures of Daventry.'
    },
    highlights: {
      nl: ['15 Interactieve Schermen in Daventry', 'Originele 16-Kleuren PCjr Grafische Modus', 'Interactieve Tekstparser & Puzzels', 'Drie Verloren Schatten van Koning Edward'],
      en: ['15 Interactive Daventry Rooms', 'Original 16-Color PCjr Graphics Mode', 'Interactive Text Parser & Riddles', 'Three Lost Treasures of King Edward']
    },
    specs: {
      resolution: '320 x 200 16-Kleur PCjr / EGA',
      fps: 'Realtime Sierra AGI Loop',
      soundChip: 'Texas Instruments SN76489 3-Voice',
      media: 'IBM 5.25" 360KB Diskette'
    },
    coinPrice: '$49.95 / IBM DISK'
  },
  {
    id: 'space_quest',
    year: 1986,
    yearDisplay: '1986',
    yearIcon: '🚀',
    system: 'ibm_pc',
    systemName: { nl: 'IBM PC / PCjr & Tandy', en: 'IBM PC / PCjr & Tandy' },
    genre: 'adventure',
    genreName: { nl: 'Sci-Fi Avontuur', en: 'Sci-Fi Adventure' },
    category: 'adventure',
    categoryName: { nl: 'Grafische Avonturen (Sierra)', en: 'Graphic Adventures (Sierra)' },
    title: 'SPACE QUEST: CHAPTER I',
    subtitle: { nl: 'The Sarien Encounter • Two Guys from Andromeda', en: 'The Sarien Encounter • Two Guys from Andromeda' },
    creator: 'Mark Crowe & Scott Murphy • Sierra On-Line',
    cabinetTheme: {
      primaryColor: '#a855f7',
      secondaryColor: '#7e22ce',
      neonColor: '#c084fc',
      glowBorder: 'rgba(168, 85, 247, 0.4)',
      accentBg: 'from-purple-950 to-black',
      textColor: 'text-purple-400',
      marqueeBg: 'bg-purple-900/60'
    },
    summary: {
      nl: 'Het hilarische sci-fi ruimte-avontuur van Sierra! Speel als Roger Wilco, een eenvoudige conciërge aan boord van het onderzoeksschip Arcada, en red het universum van de meedogenloze buitenaardse Sariens en de Star Generator.',
      en: 'Sierra’s hilarious sci-fi comedy adventure! Play as Roger Wilco, a lowly janitor aboard the scientific research vessel Arcada, and save the galaxy from the ruthless alien Sariens and the Star Generator.'
    },
    highlights: {
      nl: ['Roger Wilco Space Janitor Humor', '16-Kleur AGI Ruimteschip & Planeet Kerona', 'Sarien Battlecruiser Infiltratie', 'Zandskimmer Woestijn Race & Droids'],
      en: ['Roger Wilco Space Janitor Comedy', '16-Color AGI Starship & Planet Kerona', 'Sarien Battlecruiser Infiltration', 'Sandskimmer Desert Race & Droids']
    },
    specs: {
      resolution: '320 x 200 16-Kleur EGA / PCjr',
      fps: 'Sierra AGI Engine v2',
      soundChip: 'PC Speaker & 3-Voice Tandy',
      media: 'IBM 5.25" Diskette Drive A:'
    },
    coinPrice: '$49.95 / SIERRA DISK'
  },
  {
    id: 'pong',
    year: 1972,
    yearDisplay: '1972',
    yearIcon: '🏓',
    system: 'arcade',
    systemName: { nl: 'Atari Coin-Op (1972)', en: 'Atari Coin-Op (1972)' },
    genre: 'puzzle',
    genreName: { nl: 'Retro Sport / Arcade Oervader', en: 'Retro Sports / Genesis Arcade' },
    category: 'arcade',
    categoryName: { nl: 'Arcade Hal', en: 'Arcade Hall' },
    title: 'PONG',
    subtitle: { nl: 'De Moeder aller Videogames • Nolan Bushnell & Allan Alcorn', en: 'The Genesis of Video Games • Nolan Bushnell & Allan Alcorn' },
    creator: 'Atari • Allan Alcorn',
    cabinetTheme: {
      primaryColor: '#ffffff',
      secondaryColor: '#aaaaaa',
      neonColor: '#ffffff',
      glowBorder: 'rgba(255, 255, 255, 0.4)',
      accentBg: 'from-neutral-900 to-black',
      textColor: 'text-neutral-200',
      marqueeBg: 'bg-neutral-900/90'
    },
    summary: {
      nl: 'De oerknal van de videogamewereld. Bestuur je paddle, weersta de toenemende balsnelheid en versla de computer in oplopende moeilijkheidsgraden, of speel met twee spelers op één scherm!',
      en: 'The genesis of electronic gaming. Control your paddle, withstand escalating ball acceleration, and conquer the computer across rising difficulty tiers or local 2-player hotseat!'
    },
    highlights: {
      nl: ['Oplopende moeilijkheid: Beginner tot Atari Meester', 'Authentieke 1972 TTL-geluiden & Engelse paddle-effecten', 'Rally teller & CRT schermfilters (B&W, Amber, Groen, Neon)', '1 Speler vs AI of 2 Spelers lokaal'],
      en: ['Escalating difficulty: Novice to Atari Master', 'Authentic 1972 TTL audio & English paddle deflection', 'Rally counter & CRT filters (B&W, Amber, Green, Neon)', '1 Player vs AI or 2 Player local']
    },
    specs: {
      resolution: 'Discrete TTL Video Generator',
      fps: '60 FPS Synchroon',
      soundChip: 'Discrete TTL Frequency Divider (459Hz / 226Hz / 113Hz)',
      media: 'Andy Capp’s Tavern Coin-Op Arcade Behuizing'
    },
    coinPrice: '1 KWARTJE (25¢)'
  },
  {
    id: 'battle_chess',
    year: 1988,
    yearDisplay: '1988',
    yearIcon: '♟️',
    system: 'ibm_pc',
    systemName: { nl: 'MS-DOS EGA / Amiga (1988)', en: 'MS-DOS EGA / Amiga (1988)' },
    genre: 'puzzle',
    genreName: { nl: 'Geanimeerd Schaak / Strategie', en: 'Animated Chess / Strategy' },
    category: 'brain_logic',
    categoryName: { nl: 'Denksport, Bord- & Logica', en: 'Brain, Board & Logic' },
    title: 'BATTLE CHESS',
    subtitle: { nl: 'De Legendarische Geanimeerde Schaak Oorlog • Brian Fargo & Todd Camasta', en: 'The Legendary Animated Chess Battle • Brian Fargo & Todd Camasta' },
    creator: 'Interplay • Brian Fargo',
    cabinetTheme: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      neonColor: '#34d399',
      glowBorder: 'rgba(16, 185, 129, 0.5)',
      accentBg: 'from-emerald-950 to-black',
      textColor: 'text-emerald-300',
      marqueeBg: 'bg-emerald-950/90'
    },
    summary: {
      nl: 'De baanbrekende geanimeerde schaakklassieker van Interplay! Wanneer stukken elkaar slaan, barst een spectaculaire veldslag los: torens veranderen in stenen monsters, ridders zwaaien met slagzwaarden en koninginnen gebruiken magische bliksems.',
      en: 'Interplay’s groundbreaking animated chess masterpiece! When pieces capture one another, a theatrical combat sequence unfolds: rooks morph into stone golems, knights clash with broadswords, and queens unleash arcane lightning.'
    },
    highlights: {
      nl: ['Geanimeerde gevechtsarena voor elke stuk-tegen-stuk slag', 'Echte toernooi-schaakregels: rokade, en passant, pionpromotie', 'Instelbare AI: Schildknaap, Ridder en Tovenaar meester', 'Volledig 2-speler pass & play & EGA CRT filter'],
      en: ['Theatrical combat arena animation for every capture', 'Full official chess rules: castling, en passant, promotion', 'Adjustable AI engine: Novice, Knight, and Grandmaster', '2-Player local pass & play & authentic EGA CRT filter']
    },
    specs: {
      resolution: '320 x 200 16-Kleur EGA / 32-Kleur Amiga OCS',
      fps: 'Interplay Tactical Engine',
      soundChip: 'AdLib, Sound Blaster & Paula Synth',
      media: '2x 3.5" Floppy Disks / 720KB'
    },
    coinPrice: '$49.95 / INTERPLAY FLOPPY'
  },
  {
    id: 'mario',
    year: 1983,
    yearDisplay: '1983',
    yearIcon: '🍄',
    system: 'arcade',
    systemName: { nl: 'Nintendo Coin-Op (1983)', en: 'Nintendo Coin-Op (1983)' },
    genre: 'platform',
    genreName: { nl: 'Arcade Platformer / Riool Meesterwerk', en: 'Arcade Platformer / Sewer Masterpiece' },
    category: 'arcade',
    categoryName: { nl: 'Arcade Hal', en: 'Arcade Hall' },
    title: 'MARIO BROS.',
    subtitle: { nl: 'De Geboorte van de Loodgieter & Luigi • Shigeru Miyamoto & Gunpei Yokoi', en: 'The Birth of the Plumber & Luigi • Shigeru Miyamoto & Gunpei Yokoi' },
    creator: 'Nintendo • Shigeru Miyamoto',
    cabinetTheme: {
      primaryColor: '#ef4444',
      secondaryColor: '#3b82f6',
      neonColor: '#f87171',
      glowBorder: 'rgba(239, 68, 68, 0.5)',
      accentBg: 'from-red-950 to-black',
      textColor: 'text-red-400',
      marqueeBg: 'bg-red-950/90'
    },
    summary: {
      nl: 'De legendarische New York riool coin-op van Nintendo! Beuk van onderen tegen de vloeren om Shellcreepers, Sidesteppers en Fighter Flies omver te werpen, schop ze het scherm af en activeer het aardbevende POW-blok voor massale chaos.',
      en: 'Nintendo’s legendary New York sewer coin-op! Bump platforms from underneath to flip Shellcreepers, Sidesteppers, and Fighter Flies onto their backs, kick them off, and unleash the seismic POW block for total room clearance.'
    },
    highlights: {
      nl: ['Vloerbeuk-fysica: stoot platforms van onderen om vijanden te vloeren', 'Centraal POW-blok: 3 seismische aardschokken die de hele rioolbuis schudden', 'Wissel tussen Mario (1P) en Luigi (2P)', 'Shellcreepers, Sidestepper krabben, Fighter Flies, Slipice en vuurballen'],
      en: ['Floor-bump physics: headbutt platforms from below to knock enemies helpless', 'Central POW block: 3 seismic quakes clearing grounded pests', 'Switch between Mario (1P) and Luigi (2P)', 'Shellcreepers, Sidestepper crabs, Fighter Flies, Slipice and fireballs']
    },
    specs: {
      resolution: '256 x 224 @ 60 FPS Pixel Art',
      fps: '60 FPS Arcade Loop',
      soundChip: 'Discrete Nintendo PSG & DAC Synthesizer',
      media: 'Nintendo Upright Coin-Op Arcade Kast'
    },
    coinPrice: '1 KWARTJE (25¢)'
  },
  {
    id: 'super_mario',
    year: 1985,
    yearDisplay: '1985',
    yearIcon: '⭐',
    system: 'arcade',
    systemName: { nl: 'Nintendo Famicom / NES (1985)', en: 'Nintendo Famicom / NES (1985)' },
    genre: 'platform',
    genreName: { nl: 'Side-Scrolling Platform Meesterwerk', en: 'Side-Scrolling Platform Masterpiece' },
    category: 'arcade',
    categoryName: { nl: 'Arcade Hal', en: 'Arcade Hall' },
    title: 'SUPER MARIO BROS.',
    subtitle: { nl: 'De Redder van de Game-Industrie • Shigeru Miyamoto & Takashi Tezuka', en: 'The Savior of the Video Game Industry • Shigeru Miyamoto & Takashi Tezuka' },
    creator: 'Nintendo • Miyamoto & Tezuka',
    cabinetTheme: {
      primaryColor: '#ef4444',
      secondaryColor: '#eab308',
      neonColor: '#fca5a5',
      glowBorder: 'rgba(239, 68, 68, 0.6)',
      accentBg: 'from-red-950 via-amber-950 to-black',
      textColor: 'text-red-400',
      marqueeBg: 'bg-red-950/95'
    },
    summary: {
      nl: 'De legendarische 2D side-scroller die de videogame-industrie voorgoed transformeerde! Ren en spring door Wereld 1-1, breek stenen blokken, verzamel munten uit ?-blokken, groei uit tot Super Mario met de magische paddenstoel, stamp op Goombas en glijd van de vlaggenstok af bij het kasteel.',
      en: 'The legendary 2D side-scroller that forever transformed the video game industry! Run and jump through World 1-1, smash brick blocks, collect coins from ? blocks, grow into Super Mario with the magic mushroom, stomp Goombas, and slide down the flagpole into the castle.'
    },
    highlights: {
      nl: ['Volledige Wereld 1-1 side-scroller met vloeiende 60 FPS camera', '?-blokken, stuiterende munten en Super Mushrooms die Mario laten groeien', 'Goombas, Koopa Troopa schildpadden met trapbare schilden', 'Koji Kondo’s legendarische Overworld chiptune soundtrack'],
      en: ['Full World 1-1 horizontal side-scroller with smooth 60 FPS scrolling', '? blocks, bouncing coins, and growth-inducing Super Mushrooms', 'Goombas, Koopa Troopa turtles with kickable bouncing shells', 'Koji Kondo’s legendary Overworld chiptune soundtrack']
    },
    specs: {
      resolution: '256 x 240 @ 60 FPS NES Pixel Art',
      fps: '60 FPS Smooth Scroll',
      soundChip: 'Ricoh 2A03 5-Channel Synthesizer',
      media: 'Nintendo Entertainment System Cartridge'
    },
    coinPrice: '1 KWARTJE (25¢)'
  },
  {
    id: 'wolfenstein',
    year: 1992,
    yearDisplay: '1992',
    yearIcon: '🏰',
    system: 'ibm_pc',
    systemName: { nl: 'MS-DOS 3D (1992)', en: 'MS-DOS 3D (1992)' },
    genre: 'space',
    genreName: { nl: '3D First-Person Shooter', en: '3D First-Person Shooter' },
    category: 'arcade',
    categoryName: { nl: 'Arcade Hal', en: 'Arcade Hall' },
    title: 'WOLFENSTEIN 3D',
    subtitle: { nl: 'De Aartsvader van de 3D FPS • John Carmack & John Romero', en: 'The Grandfather of 3D FPS • John Carmack & John Romero' },
    creator: 'id Software • John Carmack',
    cabinetTheme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1d4ed8',
      neonColor: '#60a5fa',
      glowBorder: 'rgba(59, 130, 246, 0.5)',
      accentBg: 'from-blue-950 to-black',
      textColor: 'text-blue-400',
      marqueeBg: 'bg-blue-950/90'
    },
    summary: {
      nl: 'De revolutionaire 3D first-person shooter van id Software! Ontsnap als B.J. Blazkowicz uit Kasteel Hollehammer met Three.js hardware-versnelde 3D graphics, schuifdeuren, geheime gangen en nazi-bewakers.',
      en: 'id Software’s revolutionary 3D first-person shooter! Escape Castle Hollehammer as B.J. Blazkowicz rendered in Three.js hardware-accelerated 3D graphics with sliding doors, secret rooms, and guard patrols.'
    },
    highlights: {
      nl: ['Hardware-versnelde Three.js 3D WebGL render engine', 'Schuifdeuren en verborgen muren die je kunt induwen (push-walls)', 'Mes, Luger pistool en MP-40 machinegeweer met vuuranimaties', 'B.J. Blazkowicz geanimeerde statuskop en authentieke SoundBlaster geluiden'],
      en: ['Hardware-accelerated Three.js 3D WebGL render engine', 'Sliding doors and push-walls concealing secret treasure chambers', 'Knife, Luger pistol, and MP-40 submachine gun with muzzle flashes', 'B.J. Blazkowicz animated status face and authentic SoundBlaster audio']
    },
    specs: {
      resolution: '320 x 200 VGA 3D Raycasting Engine',
      fps: '60 FPS Hardware 3D Scan',
      soundChip: 'AdLib & Sound Blaster FM Synthesizer',
      media: '3.5" HD Floppy Disk 1.44MB'
    },
    coinPrice: 'SHAREWARE EPISODE 1'
  },
  {
    id: 'doom',
    year: 1993,
    yearDisplay: '1993',
    yearIcon: '💀',
    system: 'ibm_pc',
    systemName: { nl: 'MS-DOS 3D (1993)', en: 'MS-DOS 3D (1993)' },
    genre: 'space',
    genreName: { nl: '3D Sci-Fi Horror Shooter', en: '3D Sci-Fi Horror Shooter' },
    category: 'arcade',
    categoryName: { nl: 'Arcade Hal', en: 'Arcade Hall' },
    title: 'DOOM',
    subtitle: { nl: 'Knee-Deep in the Dead • id Software', en: 'Knee-Deep in the Dead • id Software' },
    creator: 'id Software • John Carmack & John Romero',
    cabinetTheme: {
      primaryColor: '#dc2626',
      secondaryColor: '#b91c1c',
      neonColor: '#f87171',
      glowBorder: 'rgba(220, 38, 38, 0.6)',
      accentBg: 'from-red-950 via-neutral-950 to-black',
      textColor: 'text-red-500',
      marqueeBg: 'bg-red-950/95'
    },
    summary: {
      nl: 'De ultieme first-person shooter die de gamegeschiedenis herschreef! Vecht als de iconische Space Marine op de door demonen overspoelde UAC basis op Phobos met Shotgun, Chaingun, Plasma Rifle, en de legendarische BFG 9000. Inclusief interactieve statusbalk, Doomguy gezichtsanimaties en "At Doom\'s Gate" soundtrack.',
      en: 'The definitive first-person shooter that redefined gaming history! Battle through the demon-infested UAC base on Phobos wielding the Shotgun, Chaingun, Plasma Rifle, and the mythical BFG 9000. Features interactive HUD status bar, animated Doomguy face, and "At Doom\'s Gate" soundtrack.'
    },
    highlights: {
      nl: ['Volledige 3D WebGL render engine met dynamische dieptenevel', 'Authentieke Shotgun, Chaingun, Raketwerper & BFG 9000', 'Zombiemannen, vuurwerpende Imps en bijtende Pinky demonen', 'Interactieve STBAR statusbalk met levend Doomguy gezicht & IDDQD god mode'],
      en: ['Full 3D WebGL render engine with atmospheric depth fog', 'Authentic Shotgun, Chaingun, Rocket Launcher & BFG 9000', 'Zombiemen, fireball-flinging Imps, and charging Pinky demons', 'Interactive STBAR HUD with living Doomguy face & IDDQD god mode']
    },
    specs: {
      resolution: '320 x 200 VGA Mode 13h 3D Engine',
      fps: '35 FPS Doom Engine Tick Rate',
      soundChip: 'General MIDI & Sound Blaster 16',
      media: '4x 3.5" HD Floppy Disks / Shareware BBS'
    },
    coinPrice: 'SHAREWARE EPISODE 1'
  },
  {
    id: 'duke',
    year: 1996,
    yearDisplay: '1996',
    yearIcon: '☢️',
    system: 'ibm_pc',
    systemName: { nl: 'MS-DOS Build Engine (1996)', en: 'MS-DOS Build Engine (1996)' },
    genre: 'space',
    genreName: { nl: '3D Sci-Fi / Action Shooter', en: '3D Sci-Fi / Action Shooter' },
    category: 'arcade',
    categoryName: { nl: 'Arcade Hal', en: 'Arcade Hall' },
    title: 'DUKE NUKEM 3D',
    subtitle: { nl: 'L.A. Meltdown & Hollywood Holocaust • 3D Realms', en: 'L.A. Meltdown & Hollywood Holocaust • 3D Realms' },
    creator: '3D Realms • Ken Silverman, George Broussard & Allen Blum',
    cabinetTheme: {
      primaryColor: '#f59e0b',
      secondaryColor: '#d97706',
      neonColor: '#fbbf24',
      glowBorder: 'rgba(245, 158, 11, 0.6)',
      accentBg: 'from-amber-950 via-neutral-950 to-black',
      textColor: 'text-amber-400',
      marqueeBg: 'bg-amber-950/95'
    },
    summary: {
      nl: 'De legendarische Build Engine FPS! Vecht door Hollywood Boulevard, bioscopen, stripclubs en riolen tegen buitenaardse Pig Cops en Troopers. Met interactieve frisdrankautomaten, werkende lichtschakelaars, spiegels, Mighty Foot trap, RPG en afstandbestuurbare Pipebombs!',
      en: 'The legendary Build Engine FPS! Battle through Hollywood Boulevard, cinema lobbies, and sewers against alien Pig Cops and Troopers. Features interactive soda vending machines, working light switches, mirrors, Mighty Foot kick, RPG, and remote detonated Pipebombs!'
    },
    highlights: {
      nl: [
        'Haarscherpe hoge resolutie 3D WebGL render engine met dynamische neonverlichting',
        'Interactieve omgeving: werkende Duke Cola automaten (+10 HP), lichtknoppen & spiegels',
        'Mighty Foot trap, Glock 19, Pump Action Shotgun, Ripper Chaingun, RPG & Pipebombs met ontsteker',
        'Iconische Duke stem quotes ("Damn, I’m good!", "Hail to the king, baby!") & Grabbag rock synth'
      ],
      en: [
        'High-resolution 3D WebGL render engine with real-time neon point lighting',
        'Interactive world: working Duke Cola machines (+10 HP), light switches & mirrors',
        'Mighty Foot kick, Glock 19, Pump Shotgun, Ripper Chaingun, RPG & remote Pipebombs',
        'Iconic Duke voice quotes ("Damn, I’m good!", "Hail to the king, baby!") & Grabbag rock synth'
      ]
    },
    specs: {
      resolution: 'High-Res 1080p 60 FPS WebGL Engine',
      fps: '60 FPS Hardware 3D Scan',
      soundChip: 'Sound Blaster AWE32 & Dynamic Voice Synthesizer',
      media: 'CD-ROM & Shareware 1.3d'
    },
    coinPrice: 'SHAREWARE E1L1'
  },
  {
    id: 'half_life',
    year: 1998,
    yearDisplay: '1998',
    yearIcon: 'λ',
    system: 'dos_pc',
    systemName: { nl: 'PC CD-ROM 3D (1998)', en: 'PC CD-ROM 3D (1998)' },
    genre: 'space',
    genreName: { nl: '3D Sci-Fi / FPS PC Klassieker', en: '3D Sci-Fi / FPS PC Classic' },
    category: 'arcade',
    categoryName: { nl: 'Arcade Hal', en: 'Arcade Hall' },
    title: 'HALF-LIFE',
    subtitle: { nl: 'Black Mesa Research Facility // Sector C • Valve', en: 'Black Mesa Research Facility // Sector C • Valve' },
    creator: 'Valve Software • Gabe Newell, Marc Laidlaw & Kelly Bailey',
    cabinetTheme: {
      primaryColor: '#ea580c',
      secondaryColor: '#c2410c',
      neonColor: '#fb923c',
      glowBorder: 'rgba(234, 88, 12, 0.7)',
      accentBg: 'from-orange-950 via-neutral-950 to-black',
      textColor: 'text-orange-400',
      marqueeBg: 'bg-orange-950/95'
    },
    summary: {
      nl: 'De revolutionaire 3D first-person shooter van Valve! Vecht als Dr. Gordon Freeman in het zwaarbeveiligde Black Mesa complex na het catastrofale Resonance Cascade incident. Met haarscherpe 1920x1280 WebGL graphics, de iconische rode koevoet, Glock, Shotgun, MP5 met granaatwerper, muurlaadstations voor het HEV Mark IV pak en Headcrabs!',
      en: 'Valve’s revolutionary 3D first-person shooter! Fight as Dr. Gordon Freeman inside the classified Black Mesa facility following the catastrophic Resonance Cascade disaster. Features high-res 1920x1280 WebGL graphics, the iconic red crowbar, Glock, Shotgun, MP5 grenade launcher, wall-mounted HEV chargers, and Headcrabs!'
    },
    highlights: {
      nl: [
        'Haarscherpe 1920x1280 Full HD WebGL 3D render engine met Pointer Lock PC muisbesturing',
        'Iconische rode koevoet (Crowbar) met metalen slagfysica & kisten stukslaan',
        'Glock 17, SPAS-12 Shotgun (met dubbelloops blast) & MP5 met 40mm granaatwerper',
        'Werkende First Aid Health Stations en HEV Suit Chargers aan de muur (+ HEV computerstem)'
      ],
      en: [
        'High-resolution 1920x1280 Full HD WebGL 3D render engine with Pointer Lock PC mouse look',
        'Iconic red crowbar with metal impact acoustics & crate destruction physics',
        'Glock 17, SPAS-12 Shotgun (with double barrel blast) & MP5 assault rifle with grenade launcher',
        'Working wall-mounted First Aid Health Stations and HEV Suit Chargers (+ HEV robotic voice)'
      ]
    },
    specs: {
      resolution: 'High-Res 1920x1280 Full HD 3D Engine',
      fps: '60 FPS Hardware 3D Scan',
      soundChip: 'DSP DirectSound & HEV Suit Voice Synthesizer',
      media: 'Sierra / Valve PC CD-ROM Jewel Case'
    },
    coinPrice: 'PC CD-ROM'
  },
  {
    id: 'c64_pinball',
    year: 1989,
    yearDisplay: '1989',
    yearIcon: '⚡',
    system: 'c64',
    systemName: { nl: 'Commodore 64 • 1989', en: 'Commodore 64 • 1989' },
    genre: 'simulation',
    genreName: { nl: '3D Flipperkast Simulatie', en: '3D Pinball Simulation' },
    category: 'c64',
    categoryName: { nl: 'Commodore 64 Klassiekers', en: 'Commodore 64 Classics' },
    title: '3D PINBALL POWER',
    subtitle: { nl: 'De Baanbrekende 3D Flipperkast • Stephen Walters & Mastertronic', en: 'The Groundbreaking 3D Pinball Sim • Stephen Walters & Mastertronic' },
    creator: 'Virgin Mastertronic • Stephen Walters',
    cabinetTheme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1d4ed8',
      neonColor: '#60a5fa',
      glowBorder: 'rgba(59, 130, 246, 0.6)',
      accentBg: 'from-blue-950 via-indigo-950 to-black',
      textColor: 'text-cyan-300',
      marqueeBg: 'bg-blue-950/95'
    },
    summary: {
      nl: 'De legendarische pseudo-3D pinball simulatie van de Commodore 64! Met perspectief-speelveld, snelle dubbele flippers, 3 pop bumpers, Tombstone drop targets voor 2X-5X multipliers, een Black Hole sinkhole en SID 6581 geluidssynthese.',
      en: 'The legendary pseudo-3D pinball simulation on the Commodore 64! Featuring angled perspective playfield, rapid twin flippers, 3 pop bumpers, Tombstone drop targets with 2X-5X multipliers, a Black Hole sinkhole, and MOS 6581 SID sound synthesis.'
    },
    highlights: {
      nl: ['Schuin 3D wireframe perspectief op 6510 assembly engine', '3 Pop Bumpers, Hairpin rollovers en Black Hole sinkhole', 'Tombstone drop targets met 2X tot 5X score multipliers', 'MOS 6581 SID synthesizer met mechanische flipperklakken en jingles'],
      en: ['Angled 3D wireframe perspective on 6510 assembly engine', '3 Pop Bumpers, Hairpin rollovers, and Black Hole sinkhole', 'Tombstone drop targets with 2X to 5X score multipliers', 'MOS 6581 SID synthesizer with mechanical flipper snaps and jingles']
    },
    specs: {
      resolution: '320 x 200 16-Color VIC-II Perspective',
      fps: '60 FPS Physics Engine',
      soundChip: 'MOS Technology 6581 SID Sound',
      media: 'Mastertronic 5.25" Floppy / Cassette'
    },
    coinPrice: '£1.99 CASSETTE'
  },
  {
    id: 'temple_run',
    year: 2011,
    yearDisplay: '2011',
    yearIcon: '🏃',
    system: 'mobile',
    systemName: { nl: 'iOS / Mobile 3D', en: 'iOS / Mobile 3D' },
    genre: 'runner',
    genreName: { nl: '3D Endless Runner / Actie', en: '3D Endless Runner / Action' },
    category: 'mobile',
    categoryName: { nl: 'Mobile & iOS Games', en: 'Mobile & iOS Games' },
    title: 'TEMPLE RUN 3D',
    subtitle: { nl: 'De Baanbrekende 3D Endless Runner • Imangi Studios', en: 'The Groundbreaking 3D Endless Runner • Imangi Studios' },
    creator: 'Imangi Studios • Keith Shepherd & Natalia Luckyanova',
    cabinetTheme: {
      primaryColor: '#f59e0b',
      secondaryColor: '#d97706',
      neonColor: '#fbbf24',
      glowBorder: 'rgba(245, 158, 11, 0.6)',
      accentBg: 'from-amber-950 via-neutral-950 to-black',
      textColor: 'text-amber-400',
      marqueeBg: 'bg-amber-950/95'
    },
    summary: {
      nl: 'De oervader van het mobiele 3D endless runner genre! Ontsnap als Guy Dangerous uit de eeuwenoude tempel met het Gouden Idool, spring over kloofgaten en boomstammen, glijd onder stenen bogen door, maak 90-graden bochten en blijf de brullende demonische apen voor.',
      en: 'The pioneer of the 3D mobile endless runner genre! Escape the ancient temple as Guy Dangerous clutching the cursed Golden Idol, leap across chasms and fallen logs, slide beneath low arches, take razor-sharp 90-degree turns, and outrun the evil demon monkeys.'
    },
    highlights: {
      nl: ['Volledige 3D WebGL render engine met dynamische belichting', '90-graden afslagen & 3-baans tempelnavigatie', 'Springen, glijden, kantelen (tilt) & obstakelreacties', 'Muntenmagneet, Turbo Boost, Schild & Reanimatie Idool'],
      en: ['Full 3D WebGL render engine with dynamic lighting', '90-degree turns & 3-lane temple navigation', 'Jumping, sliding, tilting & obstacle mechanics', 'Coin Magnet, Turbo Boost, Shield & Resurrection Idol']
    },
    specs: {
      resolution: 'Full 3D Hardware WebGL Canvas',
      fps: '60 FPS Ultra-Smooth 3D',
      soundChip: 'Synthesized Tribal Percussion & SoundFX',
      media: 'iOS App Store & Coin-Op Arcade Touch'
    },
    coinPrice: 'FREE TO PLAY / 1 COIN'
  },
  {
    id: 'lemmings',
    year: 1991,
    yearDisplay: '1991',
    yearIcon: '🐹',
    system: 'c64',
    systemName: { nl: 'Commodore 64 & Amiga', en: 'Commodore 64 & Amiga' },
    genre: 'puzzle',
    genreName: { nl: 'Puzzel & Realtime Fysica', en: 'Puzzle & Realtime Physics' },
    category: 'c64',
    categoryName: { nl: 'Commodore 64 Klassiekers', en: 'Commodore 64 Classics' },
    title: 'LEMMINGS',
    subtitle: { nl: 'De Baanbrekende Puzzelklassieker • DMA Design & Psygnosis', en: 'The Groundbreaking Puzzle Masterpiece • DMA Design & Psygnosis' },
    creator: 'DMA Design (David Jones & Mike Dailly) • Psygnosis',
    cabinetTheme: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      neonColor: '#34d399',
      glowBorder: 'rgba(16, 185, 129, 0.6)',
      accentBg: 'from-emerald-950 via-teal-950 to-black',
      textColor: 'text-emerald-400',
      marqueeBg: 'bg-emerald-950/95'
    },
    summary: {
      nl: 'De revolutionaire puzzelklassieker van DMA Design en Psygnosis! Begeleid een stoet eigenwijze groene wezentjes door vernietigbare levels, gebruik de 8 iconische vaardigheden (Climber, Floater, Bomber, Blocker, Builder, Basher, Miner, Digger) en geniet van Can-Can chiptunes en "Oh No!" explosies.',
      en: 'The revolutionary puzzle masterpiece from DMA Design and Psygnosis! Guide a parade of green-haired creatures across destructible terrain, assign the 8 iconic skills (Climber, Floater, Bomber, Blocker, Builder, Basher, Miner, Digger), and enjoy Can-Can chiptunes and "Oh No!" explosions.'
    },
    highlights: {
      nl: ['Volledig vernietigbaar terrein (graven, hakken, tunnels en trappen bouwen)', '8 Klassieke vaardigheden: Climber, Floater, Bomber, Blocker, Builder, Basher, Miner, Digger', 'Authentieke Can-Can & London Bridge chiptune soundtracks + "Oh No!" stemmen', 'Armageddon Nuke knop (☢️) en 6 legendarische levels (Just Dig!, We All Fall Down, e.a.)'],
      en: ['Full pixel-destructible terrain (digging, mining, bashing, brick building)', '8 Signature skills: Climber, Floater, Bomber, Blocker, Builder, Basher, Miner, Digger', 'Authentic Can-Can & London Bridge chiptunes + "Oh No!" voice synthesis', 'Armageddon Nuke button (☢️) and 6 legendary levels (Just Dig!, We All Fall Down, etc.)']
    },
    specs: {
      resolution: '800 x 320 Destructible Bitmask Viewport',
      fps: '60 FPS Physics Engine',
      soundChip: 'Amiga Paula & C64 SID Chiptune Synthesizer',
      media: 'Commodore 64 & Amiga Floppy Disk'
    },
    coinPrice: '1 KWARTJE (25¢)'
  },
  {
    id: 'manic_miner',
    year: 1983,
    yearDisplay: '1983',
    yearIcon: '⛏️',
    system: 'zx_spectrum',
    systemName: { nl: 'Sinclair ZX Spectrum 48K', en: 'Sinclair ZX Spectrum 48K' },
    genre: 'platform',
    genreName: { nl: 'Platform & Precisie Actie', en: 'Platform & Precision Action' },
    category: 'spectrum',
    categoryName: { nl: 'ZX Spectrum Klassiekers', en: 'ZX Spectrum Classics' },
    title: 'MANIC MINER',
    subtitle: { nl: 'De Britse Oer-Platformer • Matthew Smith', en: 'The British Pioneer Platformer • Matthew Smith' },
    creator: 'Matthew Smith • Bug-Byte & Software Projects',
    cabinetTheme: {
      primaryColor: '#eab308',
      secondaryColor: '#ca8a04',
      neonColor: '#facc15',
      glowBorder: 'rgba(234, 179, 8, 0.6)',
      accentBg: 'from-yellow-950 via-neutral-950 to-black',
      textColor: 'text-yellow-400',
      marqueeBg: 'bg-yellow-950/95'
    },
    summary: {
      nl: 'Dé ultieme ZX Spectrum klassieker! Leid Miner Willy door 20 gevaarlijke grotten, verzamel alle knipperende sleutels, ontwijk bewegende robots, wandelende wc-brillen (Eugene), mutant-telefoons en de reusachtige Monty Python voet voordat je zuurstof opraakt.',
      en: 'The definitive ZX Spectrum platform masterpiece! Guide Miner Willy through 20 perilous caverns, collect flashing key items, evade walking robots, floating toilet seats (Eugene), mutant phones, and the Monty Python 16-ton boot before your oxygen depletes.'
    },
    highlights: {
      nl: ['20 Authentieke grotten (Central Cavern, Eugene’s Lair, Kong Beast, e.a.)', '1-Bit CPU Beeper synth met "In the Hall of the Mountain King"', 'Vaste parabolische sprongfysica & afbrokkelende vloeren', 'Matthew Smith Trainer POKE 6031769 & tape loading border effect'],
      en: ['20 Authentic caverns (Central Cavern, Eugene’s Lair, Kong Beast, etc.)', '1-Bit CPU Beeper synth featuring "In the Hall of the Mountain King"', 'Fixed parabolic jump physics & crumbling floor platforms', 'Matthew Smith Trainer POKE 6031769 & Sinclair tape border effect']
    },
    specs: {
      resolution: '256 x 192 8-Color Attribute Display',
      fps: '50 FPS Z80 Hardware Loop',
      soundChip: 'Sinclair 1-Bit CPU Port Beeper Synth',
      media: 'Sinclair ZX Spectrum 48K Cassette Tape'
    },
    coinPrice: '£5.95 CASSETTE'
  },
  {
    id: 'monster_maze',
    year: 1981,
    yearDisplay: '1981',
    yearIcon: '🦖',
    system: 'zx81',
    systemName: {
      nl: 'Sinclair ZX81 16K',
      en: 'Sinclair ZX81 16K'
    },
    genre: 'horror',
    genreName: {
      nl: '3D Survival Horror',
      en: '3D Survival Horror'
    },
    category: 'spectrum',
    categoryName: {
      nl: 'Sinclair Computers',
      en: 'Sinclair Computers'
    },
    title: '3D Monster Maze',
    subtitle: {
      nl: 'De Eerste 3D Survival Horror ter Wereld • Malcolm Evans',
      en: 'The World’s First 3D Survival Horror • Malcolm Evans'
    },
    creator: 'Malcolm Evans / J.K. Greye Software (1981)',
    cabinetTheme: {
      primaryColor: '#10b981',
      secondaryColor: '#047857',
      neonColor: '#34d399',
      glowBorder: 'border-emerald-500/80',
      accentBg: 'bg-emerald-950/80',
      textColor: 'text-emerald-400',
      marqueeBg: 'from-emerald-900 via-neutral-900 to-black'
    },
    summary: {
      nl: 'Het allereerste 3D first-person survival horror spel in de geschiedenis! Ontsnap uit een 16×16 doolhof op een Sinclair ZX81 terwijl een angstaanjagende Tyrannosaurus Rex je opjaagt. "Rex lies in wait... Footsteps approaching... REX HAS SEEN YOU! RUN!!"',
      en: 'The very first 3D first-person survival horror game in history! Escape a 16×16 maze on a Sinclair ZX81 while a terrifying Tyrannosaurus Rex hunts you down. "Rex lies in wait... Footsteps approaching... REX HAS SEEN YOU! RUN!!"'
    },
    highlights: {
      nl: [
        'Allereerste 3D first-person survival horror (1981)',
        'Echte 3D raycasting met 64×48 semigrafische ZX81 karakters',
        'Psychologische doodsangst met de legendarische Rex status updates',
        'Ingebouwde radar minimap, POKEs en B&W / Groen / Amber CRT filters'
      ],
      en: [
        'World’s first 3D first-person survival horror game (1981)',
        'Real-time 3D raycasting using 64×48 ZX81 semigraphics',
        'Psychological dread with legendary Rex status messages',
        'Built-in radar minimap, POKEs and B&W / Green / Amber CRT filters'
      ]
    },
    specs: {
      resolution: '64 x 48 Semigraphic Character Display',
      fps: '6 FPS Z80 Machine Code Loop',
      soundChip: 'Monochrome Visual Tension Engine (Sinclair 1-Bit Audio)',
      media: 'Sinclair ZX81 16K RAM Pack Cassette'
    },
    coinPrice: '£4.95 CASSETTE'
  },
  {
    id: 'asteroids',
    year: 1979,
    yearDisplay: '1979',
    yearIcon: '🪨',
    system: 'arcade',
    systemName: {
      nl: 'Atari Vector Arcade (DVG)',
      en: 'Atari Vector Arcade (DVG)'
    },
    genre: 'space',
    genreName: {
      nl: 'Vector Space Shooter',
      en: 'Vector Space Shooter'
    },
    category: 'arcade',
    categoryName: {
      nl: 'Arcade Classics',
      en: 'Arcade Classics'
    },
    title: 'Asteroids',
    subtitle: {
      nl: 'De Legendarische Vector Klassieker • Lyle Rains & Ed Logg',
      en: 'The Legendary Vector Classic • Lyle Rains & Ed Logg'
    },
    creator: 'Lyle Rains & Ed Logg / Atari Inc. (1979)',
    cabinetTheme: {
      primaryColor: '#e6edf3',
      secondaryColor: '#38bdf8',
      neonColor: '#93c5fd',
      glowBorder: 'border-cyan-400/80',
      accentBg: 'bg-neutral-900/90',
      textColor: 'text-cyan-300',
      marqueeBg: 'from-neutral-950 via-neutral-900 to-black'
    },
    summary: {
      nl: 'De iconische Atari vector arcadegame uit 1979! Bestuur je ruimteschip met zuivere Newtoniaanse inertie, schiet gigantische rotsen aan gort tot gruis, ontwijk vliegende schotels en waag een hyperspace sprong in het oneindige heelal.',
      en: 'The iconic 1979 Atari vector arcade masterpiece! Pilot your spacecraft with pure Newtonian inertia, blast giant floating rocks into space dust, outshoot hostile flying saucers and engage emergency hyperspace warp.'
    },
    highlights: {
      nl: [
        'Atari QuadraScan DVG vectorweergave met fosfor nagloei',
        'Newtoniaanse natuurkunde: stuwkracht, traagheid en wrap-around',
        'Versnellende hartslag audio & twee typen vliegende schotels',
        'Ingebouwde Trainer: schilden, veilige hyperspace & slow-mo'
      ],
      en: [
        'Atari QuadraScan DVG vector CRT rendering with phosphor trails',
        'Newtonian space physics: thrust, inertia & toroidal wrap-around',
        'Accelerating heartbeat tension sound & dual flying saucers',
        'Built-in Trainer: shields, safe hyperspace & matrix slow-mo'
      ]
    },
    specs: {
      resolution: 'Vector XY QuadraScan Display (High-Def Stroke Beam)',
      fps: '60 FPS Direct Vector Beam Refresh',
      soundChip: 'Discrete Analog Sound Engine + OP-Amps',
      media: 'Atari Coin-Op Dedicated Arcade Upright Cabinet'
    },
    coinPrice: '1 QUARTER (25¢)'
  },
  {
    id: 'prince',
    year: 1990,
    yearDisplay: '1990',
    yearIcon: '🗡️',
    system: 'dos_pc',
    systemName: {
      nl: 'MS-DOS VGA / Amiga',
      en: 'MS-DOS VGA / Amiga'
    },
    genre: 'cinematic_platform',
    genreName: {
      nl: 'Cinematic Platformer',
      en: 'Cinematic Platformer'
    },
    category: 'adventure',
    categoryName: {
      nl: 'Sierra Quests & DOS',
      en: 'Sierra Quests & DOS'
    },
    title: 'Prince of Persia',
    subtitle: {
      nl: 'Jordan Mechner’s Rotoscoped Meesterwerk • Brøderbund',
      en: 'Jordan Mechner’s Rotoscoped Masterpiece • Brøderbund'
    },
    creator: 'Jordan Mechner / Brøderbund Software (1989-1990)',
    cabinetTheme: {
      primaryColor: '#f59e0b',
      secondaryColor: '#dc2626',
      neonColor: '#fbbf24',
      glowBorder: 'border-amber-500/80',
      accentBg: 'bg-neutral-900/90',
      textColor: 'text-amber-300',
      marqueeBg: 'from-amber-950 via-neutral-950 to-red-950'
    },
    summary: {
      nl: 'De revolutionaire cinematic platformer uit 1989/1990! Ontsnap uit de dodelijke kerkers van tiran Jaffar binnen 60 minuten. Volledig rotoscoped animaties, zwaardduels, vloerspikes, valpoorten en geheime elixers.',
      en: 'The revolutionary 1989/1990 cinematic platformer! Escape the deadly dungeons of Grand Vizier Jaffar within 60 minutes. Features fluid rotoscoped animation, sword combat, spike traps, iron gates, and secret potions.'
    },
    highlights: {
      nl: [
        'Vloeiende rotoscoped bewegingen: rennen, behoedzaam sluipen & richels grijpen',
        'Dynamische kerker-mechanica: flakkerende toortsen, valpoorten & spikes',
        'Zwaardgevechten met paleiswachten (aanvallen en pareren)',
        'Ingebouwde Trainer: oneindige tijd, god mode & start met zwaard'
      ],
      en: [
        'Fluid rotoscoped motion: sprinting, tiptoeing & ledge-hanging',
        'Dynamic dungeon mechanics: flickering torches, portcullises & spikes',
        'Intense sword dueling with palace guards (strike & parry)',
        'Built-in Trainer: infinite time, god mode & start with sword'
      ]
    },
    specs: {
      resolution: 'VGA 320x200 256 Colors (4:3 Native Aspect)',
      fps: '60 FPS Motion Interpolation',
      soundChip: 'Roland MT-32 & AdLib FM Chiptune Synthesis',
      media: '3.5" Floppy Disk / MS-DOS IBM Compatible'
    },
    coinPrice: '$34.95 DISK'
  },
  {
    id: 'double_dragon',
    year: 1987,
    yearDisplay: '1987',
    yearIcon: '🥊',
    system: 'arcade',
    systemName: { nl: 'Speelhal Coin-Op', en: 'Arcade Coin-Op' },
    genre: 'beat_em_up',
    genreName: { nl: 'Beat ’em Up', en: 'Beat ’em Up' },
    category: 'arcade',
    categoryName: { nl: 'Arcade Klassiekers', en: 'Arcade Classics' },
    title: 'DOUBLE DRAGON',
    subtitle: { nl: 'De Grondlegger van de Beat ’em Up', en: 'The Father of Side-Scrolling Brawlers' },
    creator: 'Technos Japan • Yoshihisa Kishimoto',
    cabinetTheme: {
      primaryColor: '#2563eb',
      secondaryColor: '#dc2626',
      neonColor: '#60a5fa',
      glowBorder: 'rgba(37, 99, 235, 0.4)',
      accentBg: 'from-blue-950 to-black',
      textColor: 'text-blue-400',
      marqueeBg: 'bg-blue-900/60'
    },
    summary: {
      nl: 'New York, 1987. Marian wordt ontvoerd door de meedogenloze Black Warriors bende. Vecht als Billy Lee door vervallen straten en fabrieken met stoten, trappen, vliegende trappen en de legendarische achterwaartse elleboogstoot!',
      en: 'New York, 1987. Marian is captured by the ruthless Black Warriors gang. Fight as martial artist Billy Lee through gritty slums and industrial plants using punches, kicks, jump kicks, and the legendary rear elbow smash!'
    },
    highlights: {
      nl: [
        'Vechtsysteem met stoten, trappen, uppercuts & de beruchte elleboogstoot',
        'Interactieve straatobjecten: pak houten vaten op en gooi ze naar boeven',
        'Vecht tegen Williams, Roper, Linda met haar zweep en de reusachtige Abobo',
        'Ingebouwde Trainer: God mode, One-Hit KO en missiekeuze'
      ],
      en: [
        'Versatile combat system: punches, kicks, uppercuts & the iconic elbow smash',
        'Interactive environment: lift barrels and shatter them across thugs',
        'Battle Williams, Roper, whip-wielding Linda, and giant boss Abobo',
        'Built-in Trainer: God mode, One-Hit KO, and stage warp'
      ]
    },
    specs: {
      resolution: 'Arcade 320x224 (4:3 Native Aspect)',
      fps: '60 FPS Hardware Sprites',
      soundChip: 'Yamaha YM2151 FM Synth & ADPCM Drums',
      media: 'Taito Dedicated Coin-Op Arcade PCB'
    },
    coinPrice: '25¢ COIN-OP'
  },
  {
    id: 'snake',
    year: 1997,
    yearDisplay: '1997',
    yearIcon: '📱',
    system: 'mobile',
    systemName: { nl: 'Nokia 6110 / 3310', en: 'Nokia 6110 / 3310' },
    genre: 'snake',
    genreName: { nl: 'Mobiele Klassieker', en: 'Mobile Classic' },
    category: 'mobile',
    categoryName: { nl: 'Mobiele Telefoon', en: 'Mobile Phone' },
    title: 'NOKIA SNAKE',
    subtitle: { nl: 'Het Legendarische 84x48 Monochroom Fenomeen', en: 'The Legendary 84x48 Monochrome Sensation' },
    creator: 'Taneli Armanto • Nokia Espoo',
    cabinetTheme: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      neonColor: '#34d399',
      glowBorder: 'rgba(16, 185, 129, 0.4)',
      accentBg: 'from-emerald-950 to-black',
      textColor: 'text-emerald-400',
      marqueeBg: 'bg-emerald-900/60'
    },
    summary: {
      nl: 'De game die mobiel gamen voor altijd veranderde! Speel de originele Snake op een interactieve Nokia telefoon met het kenmerkende groen-grijze 84x48 LCD-scherm, 2-4-6-8 toetsenbord en de authentieke piezo piepjes.',
      en: 'The game that launched the mobile gaming era! Experience authentic Snake on an interactive Nokia handset featuring the iconic 84x48 monochrome LCD screen, 2-4-6-8 keypad, and pure piezo buzzer sound effects.'
    },
    highlights: {
      nl: [
        'Volledig gesimuleerde Nokia telefoonbehuizing met klikbaar numeriek toetsenbord',
        'Authentiek groen/grijs 84×48 monochroom vloeibaar kristal LCD display',
        'Snelheidsniveaus 1-9, doolhoven (Box, Tunnel, Rails) en knipperende bonusinsecten',
        'Originele monophone piezo audio piepjes en de beroemde Nokia Ringtone'
      ],
      en: [
        'Fully simulated Nokia handset with clickable physical numeric keypad',
        'Authentic green-grey 84x48 monochrome LCD pixel grid',
        'Speed levels 1-9, labyrinths (Box, Tunnel, Rails), and flashing bonus bugs',
        'Original monophonic piezo buzzer beeps and the classic Nokia Tune'
      ]
    },
    specs: {
      resolution: 'LCD 84x48 Monochroom Liquid Crystal',
      fps: 'Variable Dynamic Dot Clock',
      soundChip: 'Internal Piezo Buzzer Monophonic',
      media: 'Nokia Series 20 ROM Firmware'
    },
    coinPrice: 'FREE / IN-BUILT'
  },
  {
    id: 'outrun',
    year: 1986,
    yearDisplay: '1986',
    yearIcon: '🌴',
    system: 'arcade',
    systemName: { nl: 'Sega Super Scaler Coin-Op', en: 'Sega Super Scaler Coin-Op' },
    genre: 'racing',
    genreName: { nl: 'Arcade Raceklassieker', en: 'Arcade Racing Classic' },
    category: 'arcade',
    categoryName: { nl: 'Arcade Hal Klassiekers', en: 'Arcade Hall Classics' },
    title: 'OUTRUN',
    subtitle: { nl: 'Yu Suzuki • De Ultieme Sega 1986 Road Trip', en: 'Yu Suzuki • The Ultimate Sega 1986 Road Trip' },
    creator: 'Sega Enterprises • Yu Suzuki • Hiroshi Kawaguchi',
    cabinetTheme: {
      primaryColor: '#ef4444',
      secondaryColor: '#b91c1c',
      neonColor: '#f59e0b',
      glowBorder: 'rgba(239, 68, 68, 0.45)',
      accentBg: 'from-red-950 to-black',
      textColor: 'text-red-400',
      marqueeBg: 'bg-red-900/70'
    },
    summary: {
      nl: 'De kroonprins van alle arcade racegames! Rij met 293 km/u in een rode Ferrari Testarossa Spider cabriolet over glooiende heuvels, tussen palmbomen en door bochten, kies je eigen route bij splitsingen en geniet van de legendarische autoradio.',
      en: 'The crown jewel of arcade driving games! Blast at 293 km/h in a red Ferrari Testarossa Spider convertible through rolling hills, past ocean palm trees, select branching highway forks, and crank up the legendary FM in-car radio.'
    },
    highlights: {
      nl: [
        'Volledige Pseudo-3D Super Scaler road engine met heuvels, dips en bochten op 60 FPS',
        'Iconische rode Ferrari Testarossa Spider met wapperende blonde haren van de passagier',
        'Drie legendarische FM-radiotracks: Magical Sound Shower, Passing Breeze & Splash Wave',
        'Interactief stuurwiel, metalen 2-traps LOW/HIGH schakelpook en pedalen'
      ],
      en: [
        'Full Pseudo-3D Super Scaler road engine with hills, crests, and curves at 60 FPS',
        'Iconic red Ferrari Testarossa Spider with flowing blonde passenger hair',
        'Three legendary FM radio tracks: Magical Sound Shower, Passing Breeze & Splash Wave',
        'Interactive steering wheel, 2-position LOW/HIGH metal gear shifter, and pedals'
      ]
    },
    specs: {
      resolution: 'Sega System 16 Super Scaler 320x224 (Scaled 640x440)',
      fps: '60 FPS Full-Rate Hardware Scan',
      soundChip: 'Yamaha YM2151 FM Sound Synthesizer',
      media: 'Dual Motorola 68000 Arcade PCB'
    },
    coinPrice: '1 COIN / FREE PLAY'
  },
  {
    id: 'impossible_mission',
    year: 1984,
    yearDisplay: '1984',
    yearIcon: '🕵️',
    system: 'c64',
    systemName: { nl: 'Commodore 64 & SID 6581', en: 'Commodore 64 & SID 6581' },
    genre: 'platform',
    genreName: { nl: 'Cinematic Stealth Platformer', en: 'Cinematic Stealth Platformer' },
    category: 'c64',
    categoryName: { nl: 'Commodore 64 Klassiekers', en: 'Commodore 64 Classics' },
    title: 'IMPOSSIBLE MISSION',
    subtitle: { nl: 'Epyx • Stay A While, Stay Forever!', en: 'Epyx • Stay A While, Stay Forever!' },
    creator: 'Epyx • Dennis Caswell',
    cabinetTheme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1d4ed8',
      neonColor: '#60a5fa',
      glowBorder: 'rgba(59, 130, 246, 0.45)',
      accentBg: 'from-blue-950 to-black',
      textColor: 'text-blue-400',
      marqueeBg: 'bg-blue-900/70'
    },
    summary: {
      nl: 'De ultieme Commodore 64 sensatie van Dennis Caswell en Epyx! Infiltreer het ondergrondse bunkercomplex van professor Elvin Atombender, maak gymnastieke salto\'s over dodelijke robots, doorzoek computers en terminals naar computerponskaarten en defuseer de kernraket binnen 6 uur!',
      en: 'The definitive Commodore 64 masterpiece by Dennis Caswell and Epyx! Infiltrate Professor Elvin Atombender\'s subterranean bunker, execute gymnastic somersaults over lethal patrol robots, search mainframes for punch-card puzzle pieces, and defuse the missile before the 6-hour clock expires!'
    },
    highlights: {
      nl: [
        'Legendarische gedigitaliseerde spraaksynthese ("Another visitor... Stay a while, stay forever!" & de valschreeuw)',
        'Gymnastieke 360-graden vliegende salto en realistische fysica-animatie op ruitjespapier ontworpen',
        '8 Subterrane sectoren met hydraulische liftschacht, patrouille- en laser-robots en de dodelijke plasma-orb',
        'Interactieve zakcomputer om 36 ponskaartstukken te roteren, spiegelen en robots tijdelijk te snoozen'
      ],
      en: [
        'Legendary digitized speech synthesis ("Another visitor... Stay a while, stay forever!" & the iconic scream)',
        'Gymnastic 360-degree running somersault jump and authentic kinematic weight designed on graph paper',
        '8 Subterranean sectors with hydraulic elevator shaft, patrol & laser-zapping robots, and the deadly plasma orb',
        'Interactive in-game Pocket Computer to rotate, flip and assemble 36 punch-card pieces and snooze room robots'
      ]
    },
    specs: {
      resolution: 'Commodore 64 VIC-II 320x200 (Scaled 640x360)',
      fps: '60 FPS Smooth Raster Animation',
      soundChip: 'MOS SID 6581 + Electronic Speech Systems (ESS)',
      media: 'Commodore 1541 5.25" Floppy Disk'
    },
    coinPrice: '1541 DISK FLOPPY'
  },
  {
    id: 'mario_land',
    year: 1989,
    yearDisplay: '1989',
    yearIcon: '🍄',
    system: 'gameboy',
    systemName: { nl: 'Nintendo Game Boy (DMG-01)', en: 'Nintendo Game Boy (DMG-01)' },
    genre: 'platform',
    genreName: { nl: 'Handheld Platformer', en: 'Handheld Platformer' },
    category: 'handheld',
    categoryName: { nl: 'Handheld & Game Boy', en: 'Handheld & Game Boy' },
    title: 'SUPER MARIO LAND',
    subtitle: { nl: 'Het Legendarische Game Boy Lanceerspel in Sarasaland', en: 'The Legendary Game Boy Launch Title in Sarasaland' },
    creator: 'Nintendo R&D1 • Gunpei Yokoi & Satoru Okada',
    cabinetTheme: {
      primaryColor: '#f59e0b',
      secondaryColor: '#d97706',
      neonColor: '#fbbf24',
      glowBorder: 'rgba(245, 158, 11, 0.45)',
      accentBg: 'from-amber-950 to-neutral-950',
      textColor: 'text-amber-400',
      marqueeBg: 'bg-amber-900/60'
    },
    summary: {
      nl: 'De iconische Game Boy debuuttitel met Mario in Sarasaland! Red Prinses Daisy van de ruimtetyran Tatanga, ontwijk vliegende sfinxen, stuiter met de Superball-powerup en verzamel levens in het Bonus Roulette spel.',
      en: 'The iconic Game Boy debut title featuring Mario in Sarasaland! Rescue Princess Daisy from alien invader Tatanga, dodge sphinxes, fire bouncy Superballs, and win bonus lives in the roulette mini-game.'
    },
    highlights: {
      nl: [
        'Vlaggenschip Game Boy launch game ontworpen door Gunpei Yokoi & Satoru Okada',
        'Unieke stuiterende Superball-fysica die munten pakt en vijanden uitschakelt',
        'Egypte & Birabuto Kingdom sfeer met sfinxen, piramides en bonusliften',
        'Vier authentieke LCD kleurpaletten (DMG Pea Soup, Pocket B&W, Light Indiglo, Super Game Boy)'
      ],
      en: [
        'Flagship Game Boy launch game directed by Gunpei Yokoi & Satoru Okada',
        'Unique bouncy 45° Superball physics that collects coins and blasts enemies',
        'Egyptian Birabuto Kingdom aesthetic with sphinxes, pyramids, and moving elevators',
        'Four authentic LCD color palettes (DMG Pea Soup, Pocket B&W, Light Indiglo, Super Game Boy)'
      ]
    },
    specs: {
      resolution: 'DMG-01 STN LCD 160×144 (4 Tinten Groen)',
      fps: '59.7 FPS Sharp LR35902 CPU (4.19 MHz)',
      soundChip: 'Game Boy APU 4-Channel Stereo Chiptune (Hirokazu Tanaka)',
      media: 'Game Boy ROM Cartridge (DMG-ML-USA)'
    },
    coinPrice: 'DMG-01 4× AA'
  },
  {
    id: 'tetris_dmg',
    year: 1989,
    yearDisplay: '1989',
    yearIcon: '🧩',
    system: 'gameboy',
    systemName: { nl: 'Nintendo Game Boy (DMG-01)', en: 'Nintendo Game Boy (DMG-01)' },
    genre: 'puzzle',
    genreName: { nl: 'Handheld Puzzelspel', en: 'Handheld Puzzle' },
    category: 'handheld',
    categoryName: { nl: 'Handheld & Game Boy', en: 'Handheld & Game Boy' },
    title: 'TETRIS (GAME BOY DMG)',
    subtitle: { nl: 'De Meest Verkochte Draagbare Puzzelhit Ooit', en: 'The Best-Selling Portable Puzzle Hit of All Time' },
    creator: 'Nintendo • Alexey Pajitnov & Hirokazu Tanaka',
    cabinetTheme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#2563eb',
      neonColor: '#60a5fa',
      glowBorder: 'rgba(59, 130, 246, 0.45)',
      accentBg: 'from-blue-950 to-neutral-950',
      textColor: 'text-blue-400',
      marqueeBg: 'bg-blue-900/60'
    },
    summary: {
      nl: 'Het ultieme fenomeen dat de Game Boy definieerde. Speel A-Type eindeloze marathon of B-Type 25-lijnen challenge met de wereldberoemde Korobeiniki chiptune muziek en verdien de raketlancering bij winst!',
      en: 'The defining global phenomenon of portable gaming. Play A-Type endless marathon or B-Type 25-lines challenge with the iconic Korobeiniki chiptune soundtrack and celebrate with the rocket launch!'
    },
    highlights: {
      nl: [
        '35+ Miljoen exemplaren verkocht wereldwijd gebundeld met de Game Boy DMG-01',
        'A-Type Endless Marathon & B-Type 25 Lines challenge spelmodi',
        'Volledige 8-bit Korobeiniki (Type A) & Troika (Type B) chiptune synthesizers',
        'Legendarische Russische Soyuz/Buran raketlancering animatie bij triomf'
      ],
      en: [
        'Over 35 million cartridges sold worldwide bundled with Game Boy DMG-01',
        'A-Type Endless Marathon & B-Type 25 Lines challenge modes',
        'Full 8-bit Korobeiniki (Type A) & Troika (Type B) chiptune synthesizers',
        'Legendary Russian Soyuz/Buran space shuttle rocket launch animation on triumph'
      ]
    },
    specs: {
      resolution: 'DMG-01 STN LCD 160×144 (10×20 Matrix)',
      fps: '59.7 FPS Sharp LR35902 CPU (4.19 MHz)',
      soundChip: 'Game Boy APU 4-Channel Stereo Chiptune (Hirokazu Tanaka)',
      media: 'Game Boy ROM Cartridge (DMG-TR-USA)'
    },
    coinPrice: 'DMG-01 4× AA'
  },
  {
    id: 'dr_mario',
    year: 1990,
    yearDisplay: '1990',
    yearIcon: '💊',
    system: 'gameboy',
    systemName: { nl: 'Nintendo Game Boy (DMG-01)', en: 'Nintendo Game Boy (DMG-01)' },
    genre: 'puzzle',
    genreName: { nl: 'Handheld Virus Puzzel', en: 'Handheld Virus Puzzle' },
    category: 'handheld',
    categoryName: { nl: 'Handheld & Game Boy', en: 'Handheld & Game Boy' },
    title: 'DR. MARIO',
    subtitle: { nl: 'Dood Virussen met Vitaminecapsules • Fever & Chill', en: 'Eradicate Viruses with Megavitamins • Fever & Chill' },
    creator: 'Nintendo R&D1 • Gunpei Yokoi & Hirokazu Tanaka',
    cabinetTheme: {
      primaryColor: '#ef4444',
      secondaryColor: '#b91c1c',
      neonColor: '#f87171',
      glowBorder: 'rgba(239, 68, 68, 0.45)',
      accentBg: 'from-red-950 to-neutral-950',
      textColor: 'text-red-400',
      marqueeBg: 'bg-red-900/60'
    },
    summary: {
      nl: 'Draai en stapel tweekleurige vitaminepillen in de geneesmiddelenfles om rode, gele en blauwe virussen uit te schakelen met 4-op-een-rij combinaties! Bevat de iconische "Fever" chiptune soundtrack.',
      en: 'Rotate and drop two-tone megavitamin capsules inside the medicine jar to eliminate viruses with 4-in-a-row color lines! Features the unforgettable "Fever" chiptune soundtrack.'
    },
    highlights: {
      nl: [
        'Verslavende 4-op-een-rij virusvernietiging gameplay ontworpen door Gunpei Yokoi',
        'Iconische "Fever" en "Chill" chiptune synthesizerthema’s gecomponeerd door Hirokazu Tanaka',
        'Kleur- en patroonpatronen geoptimaliseerd voor het originele 4-tinten groen LCD scherm',
        'Stijgende virusdichtheid en valsnelheid bij elk behaald infectieniveau'
      ],
      en: [
        'Addictive 4-in-a-row virus eradication puzzle design directed by Gunpei Yokoi',
        'Legendary "Fever" and "Chill" chiptune APU soundtracks by Hirokazu Tanaka',
        'Patterned shade markers optimized for the original 4-shade greenish LCD screen',
        'Increasing virus counts and drop velocity with every cleared medical tier'
      ]
    },
    specs: {
      resolution: 'DMG-01 STN LCD 160×144 (8×16 Bottle Grid)',
      fps: '59.7 FPS Sharp LR35902 CPU (4.19 MHz)',
      soundChip: 'Game Boy APU 4-Channel Stereo Chiptune (Hirokazu Tanaka)',
      media: 'Game Boy ROM Cartridge (DMG-VU-USA)'
    },
    coinPrice: 'DMG-01 4× AA'
  },
  {
    id: 'metroid_2',
    year: 1991,
    yearDisplay: '1991',
    yearIcon: '👽',
    system: 'gameboy',
    systemName: { nl: 'Nintendo Game Boy (DMG-01)', en: 'Nintendo Game Boy (DMG-01)' },
    genre: 'adventure',
    genreName: { nl: 'Sci-Fi Metroidvania', en: 'Sci-Fi Metroidvania' },
    category: 'handheld',
    categoryName: { nl: 'Handheld & Game Boy', en: 'Handheld & Game Boy' },
    title: 'METROID II: RETURN OF SAMUS',
    subtitle: { nl: 'De Uitroeiing van de Metroids op Planeet SR388', en: 'The Metroid Extermination on Planet SR388' },
    creator: 'Nintendo R&D1 • Makoto Kanoh & Ryoji Yoshitomi',
    cabinetTheme: {
      primaryColor: '#10b981',
      secondaryColor: '#047857',
      neonColor: '#34d399',
      glowBorder: 'rgba(16, 185, 129, 0.45)',
      accentBg: 'from-emerald-950 to-neutral-950',
      textColor: 'text-emerald-400',
      marqueeBg: 'bg-emerald-900/60'
    },
    summary: {
      nl: 'Infiltreer het mysterieuze grottensysteem van planeet SR388 als premiejager Samus Aran. Gebruik de Morph Ball, Spider Ball en raketten om de 39 geëvolueerde Alpha-, Gamma-, Zeta- en Omega-Metroids op te sporen en uit te schakelen!',
      en: 'Infiltrate the subterranean caverns of Planet SR388 as bounty hunter Samus Aran. Master Morph Ball, Spider Ball wall climbs, and missile arsenals to hunt down and exterminate the 39 evolving Metroid lifeforms!'
    },
    highlights: {
      nl: [
        'Eerste debuut van de Spider Ball, Space Jump en Plasma Beam in de Metroid franchise',
        'Atmosferische 8-bit ambient grotsoundtrack gecomponeerd door Ryoji Yoshitomi',
        'Metroid sensor teller die afloopt naarmate je de 39 buitenaardse wezens verslaat',
        'Grootse diepe doolhoven met dalende zuurniveaus na elke gesneuvelde Metroid'
      ],
      en: [
        'First appearance of the Spider Ball, Space Jump, and Plasma Beam in the Metroid series',
        'Atmospheric 8-bit subterranean ambient score composed by Ryoji Yoshitomi',
        'Metroid sensor radar counter tracking remaining targets down to the Queen Metroid',
        'Deep cavernous exploration with receding lava levels unlocking deeper subterranean biomes'
      ]
    },
    specs: {
      resolution: 'DMG-01 STN LCD 160×144 (Smooth Cavern Scrolling)',
      fps: '59.7 FPS Sharp LR35902 CPU (4.19 MHz)',
      soundChip: 'Game Boy APU 4-Channel Stereo Chiptune (Ryoji Yoshitomi)',
      media: 'Game Boy ROM Cartridge (DMG-ME-USA)'
    },
    coinPrice: 'DMG-01 4× AA'
  },
  {
    id: 'kirby_dream_land',
    year: 1992,
    yearDisplay: '1992',
    yearIcon: '⭐',
    system: 'gameboy',
    systemName: { nl: 'Nintendo Game Boy (DMG-01)', en: 'Nintendo Game Boy (DMG-01)' },
    genre: 'platform',
    genreName: { nl: 'Handheld Platformer', en: 'Handheld Platformer' },
    category: 'handheld',
    categoryName: { nl: 'Handheld & Game Boy', en: 'Handheld & Game Boy' },
    title: "KIRBY'S DREAM LAND",
    subtitle: { nl: 'Het Historische Debuut van de Roze Held van Dream Land', en: 'The Legendary Debut of Dream Land’s Inhaling Hero' },
    creator: 'HAL Laboratory • Masahiro Sakurai & Jun Ishikawa',
    cabinetTheme: {
      primaryColor: '#f472b6',
      secondaryColor: '#db2777',
      neonColor: '#fbcfe8',
      glowBorder: 'rgba(244, 114, 182, 0.45)',
      accentBg: 'from-pink-950 to-neutral-950',
      textColor: 'text-pink-400',
      marqueeBg: 'bg-pink-900/60'
    },
    summary: {
      nl: 'Het debuut van Masahiro Sakurai\'s geliefde roze held Kirby! Zuig vijanden en sterren op, zweef oneindig door de lucht door lucht in te slikken en herover het gestolen voedsel van Dream Land uit handen van King Dedede.',
      en: 'The world debut of Masahiro Sakurai’s beloved hero Kirby! Inhale foes and star blocks, float across the sky with infinite flutter jumps, and recover Dream Land’s stolen food from King Dedede.'
    },
    highlights: {
      nl: [
        'Baanbrekend inhaleer- en zweefmechanisme bedacht door een 19-jarige Masahiro Sakurai',
        'Wereldberoemde "Green Greens" en "Gourmet Race" chiptune melodieën van Jun Ishikawa',
        'Vier iconische werelden: Green Greens, Castle Lololo, Float Islands en Mt. Dedede',
        'De iconische vrolijke Kirby Victory Dance na elk voltooid level'
      ],
      en: [
        'Pioneering inhale, spit, and infinite flight mechanics designed by 19-year-old Masahiro Sakurai',
        'Evergreen "Green Greens" and boss melodies composed by Jun Ishikawa',
        'Four vibrant worlds: Green Greens, Castle Lololo, Float Islands, and Mt. Dedede',
        'Signature celebratory Kirby victory dance upon conquering each world stage'
      ]
    },
    specs: {
      resolution: 'DMG-01 STN LCD 160×144 (Character Sprite Multiplexing)',
      fps: '59.7 FPS Sharp LR35902 CPU (4.19 MHz)',
      soundChip: 'Game Boy APU 4-Channel Stereo Chiptune (Jun Ishikawa)',
      media: 'Game Boy ROM Cartridge (DMG-KY-USA)'
    },
    coinPrice: 'DMG-01 4× AA'
  },
  {
    id: 'mario_land_2',
    year: 1992,
    yearDisplay: '1992',
    yearIcon: '👑',
    system: 'gameboy',
    systemName: { nl: 'Nintendo Game Boy (DMG-01)', en: 'Nintendo Game Boy (DMG-01)' },
    genre: 'platform',
    genreName: { nl: 'Handheld Platformer', en: 'Handheld Platformer' },
    category: 'handheld',
    categoryName: { nl: 'Handheld & Game Boy', en: 'Handheld & Game Boy' },
    title: 'SUPER MARIO LAND 2: 6 GOLDEN COINS',
    subtitle: { nl: 'Herover Mario’s Kasteel van Nieuwkomer Wario', en: 'Reclaim Mario’s Castle from the Greedy Wario' },
    creator: 'Nintendo R&D1 • Hiroji Kiyotake & Kazumi Totaka',
    cabinetTheme: {
      primaryColor: '#eab308',
      secondaryColor: '#ca8a04',
      neonColor: '#facc15',
      glowBorder: 'rgba(234, 179, 8, 0.45)',
      accentBg: 'from-yellow-950 to-neutral-950',
      textColor: 'text-yellow-400',
      marqueeBg: 'bg-yellow-900/60'
    },
    summary: {
      nl: 'De reusachtige 4MB opvolger waarin Wario voor het eerst zijn opwachting maakt! Verzamel de 6 gouden munten verspreid over de Tree Zone, Space Zone, Macro Zone en Pumpkin Zone om Wario\'s kasteelpoorten te openen.',
      en: 'The expansive 4-megabit sequel introducing Wario to the Nintendo universe! Collect 6 Golden Coins across the Tree Zone, Space Zone, Macro Zone, and Pumpkin Zone to storm Wario’s occupied castle.'
    },
    highlights: {
      nl: [
        'Eerste historische verschijning van aartsrivaal Wario in de videogamegeschiedenis',
        'Introductie van de Konijnenoren wortel-powerup om sierlijk door levels te zweven',
        'Prachtige grote karaktersprites met vloeiende animaties ontworpen door Hiroji Kiyotake',
        'Memorabele soundtrack van Kazumi Totaka met het verborgen "Totaka’s Song"'
      ],
      en: [
        'First historic appearance of greedy rival Wario in Nintendo video game history',
        'Debut of the Bunny Ears Carrot power-up allowing Mario to flutter-glide over hazards',
        'Massive expressive character sprites and rich level tilesets by Hiroji Kiyotake',
        'Memorable soundtrack by Kazumi Totaka including the easter-egg "Totaka’s Song"'
      ]
    },
    specs: {
      resolution: 'DMG-01 STN LCD 160×144 (4-Megabit High-Density ROM)',
      fps: '59.7 FPS Sharp LR35902 CPU (4.19 MHz)',
      soundChip: 'Game Boy APU 4-Channel Stereo Chiptune (Kazumi Totaka)',
      media: 'Game Boy ROM Cartridge (DMG-MQ-USA)'
    },
    coinPrice: 'DMG-01 4× AA'
  },
  {
    id: 'zelda_links_awakening',
    year: 1993,
    yearDisplay: '1993',
    yearIcon: '🗡️',
    system: 'gameboy',
    systemName: { nl: 'Nintendo Game Boy (DMG-01)', en: 'Nintendo Game Boy (DMG-01)' },
    genre: 'adventure',
    genreName: { nl: 'Top-Down Action Adventure', en: 'Top-Down Action Adventure' },
    category: 'handheld',
    categoryName: { nl: 'Handheld & Game Boy', en: 'Handheld & Game Boy' },
    title: "THE LEGEND OF ZELDA: LINK'S AWAKENING",
    subtitle: { nl: 'Het Mysterie van Koholint Island en de Windvis', en: 'The Mystery of Koholint Island & the Wind Fish' },
    creator: 'Nintendo EAD • Takashi Tezuka & Koji Kondo',
    cabinetTheme: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      neonColor: '#6ee7b7',
      glowBorder: 'rgba(16, 185, 129, 0.45)',
      accentBg: 'from-emerald-950 to-neutral-950',
      textColor: 'text-emerald-400',
      marqueeBg: 'bg-emerald-900/60'
    },
    summary: {
      nl: 'Link spoelt aan op het mysterieuze Koholint Island. Verzamel de 8 Sirene-instrumenten, verken kerkers vol slimme puzzels met de Roc\'s Feather sprong en ontwaak de slapende Windvis op de bergtop.',
      en: 'Link shipwrecks onto the mysterious Koholint Island. Gather the 8 Instruments of the Sirens, navigate puzzle-packed dungeons with Roc’s Feather jumping, and awaken the Wind Fish asleep atop Mt. Tamaranch.'
    },
    highlights: {
      nl: [
        'Eerste Zelda avontuur waarin Link vrij kan springen met Roc\'s Feather',
        'Rijk en ontroerend verhaal geschreven door Yoshiaki Koizumi en Takashi Tezuka',
        '8 Instrumenten van de Sirenen en de legendarische "Ballad of the Wind Fish"',
        'Gastoptredens van Yoshi, Chain Chomp, Goomba’s en Wart'
      ],
      en: [
        'First Zelda title introducing true vertical jumping via Roc’s Feather item',
        'Rich, emotionally resonant narrative scripted by Yoshiaki Koizumi and Takashi Tezuka',
        '8 Sirens Instruments yielding the legendary "Ballad of the Wind Fish" melody',
        'Whimsical Nintendo crossover cameos including Yoshi dolls, Chain Chomps, and Goombas'
      ]
    },
    specs: {
      resolution: 'DMG-01 STN LCD 160×144 (Grid-Tile Overworld & Dungeons)',
      fps: '59.7 FPS Sharp LR35902 CPU (4.19 MHz)',
      soundChip: 'Game Boy APU 4-Channel Stereo Chiptune (Minako Hamano & Kozue Ishikawa)',
      media: 'Game Boy ROM Cartridge + Battery SRAM (DMG-ZL-USA)'
    },
    coinPrice: 'DMG-01 4× AA'
  },
  {
    id: 'donkey_kong_94',
    year: 1994,
    yearDisplay: '1994',
    yearIcon: '🔨',
    system: 'gameboy',
    systemName: { nl: 'Nintendo Game Boy (DMG-01)', en: 'Nintendo Game Boy (DMG-01)' },
    genre: 'puzzle',
    genreName: { nl: 'Platform Puzzel Meesterwerk', en: 'Platform Puzzle Masterpiece' },
    category: 'handheld',
    categoryName: { nl: 'Handheld & Game Boy', en: 'Handheld & Game Boy' },
    title: "DONKEY KONG '94",
    subtitle: { nl: '101 Ingenieuze Sleutelpuzzel Levels • Mario Acrobatiek', en: '101 Clever Key-Puzzle Levels • Mario Acrobatic Moves' },
    creator: 'Nintendo EAD • Shigeru Miyamoto & Takao Shimizu',
    cabinetTheme: {
      primaryColor: '#f97316',
      secondaryColor: '#c2410c',
      neonColor: '#fdba74',
      glowBorder: 'rgba(249, 115, 22, 0.45)',
      accentBg: 'from-orange-950 to-neutral-950',
      textColor: 'text-orange-400',
      marqueeBg: 'bg-orange-900/60'
    },
    summary: {
      nl: 'Wat begint als een getrouwe remake van de 4 arcade-schermen ontpopt zich tot een monumentale 101-levels tellende puzzelplatformer! Gebruik handstandsprongen, drievoudige salto\'s en sleutels om Pauline te bevrijden.',
      en: 'Beginning as a faithful 4-stage arcade tribute, this masterpiece blossoms into 101 ingenious puzzle-platforming stages! Master handstand backflips, key carrying, and bridge switches to rescue Pauline.'
    },
    highlights: {
      nl: [
        'Debuut van Mario’s moderne acrobatische bewegingen (handstand, salto, triple jump)',
        '101 Afwisselende levels verdeeld over Big City, Forest, Ship, Iceberg en Rocky Valley',
        'Vlaggenschip Super Game Boy showcase met unieke custom kaders en spraakeffecten',
        'Puzzels waarbij je sleutels op je hoofd balanceert en schakelaars activeert'
      ],
      en: [
        'Debut of Mario’s modern acrobatic repertoire (handstand walking, high backflips, side somersaults)',
        '101 Expansive stages spanning Big City, Forest, Ship, Iceberg, Desert, and Tower',
        'Flagship Super Game Boy launch showcase with rich borders and synthesized voice clips',
        'Complex puzzle mechanics carrying keys over conveyor belts and pressing timed switches'
      ]
    },
    specs: {
      resolution: 'DMG-01 STN LCD 160×144 (Super Game Boy Enhanced)',
      fps: '59.7 FPS Sharp LR35902 CPU (4.19 MHz)',
      soundChip: 'Game Boy APU 4-Channel Stereo Chiptune (Taisuke Araki)',
      media: 'Game Boy ROM Cartridge (DMG-KG-USA)'
    },
    coinPrice: 'DMG-01 4× AA'
  },
  {
    id: 'pokemon_red',
    year: 1996,
    yearDisplay: '1996',
    yearIcon: '⚡',
    system: 'gameboy',
    systemName: { nl: 'Nintendo Game Boy (DMG-01)', en: 'Nintendo Game Boy (DMG-01)' },
    genre: 'rpg',
    genreName: { nl: 'Klassieke Monster RPG', en: 'Classic Monster RPG' },
    category: 'handheld',
    categoryName: { nl: 'Handheld & Game Boy', en: 'Handheld & Game Boy' },
    title: 'POKÉMON RED & BLUE',
    subtitle: { nl: 'Gotta Catch ’Em All • Het Mondiale Fenomeen in Kanto', en: 'Gotta Catch ’Em All • The Global Phenomenon in Kanto' },
    creator: 'Game Freak • Satoshi Tajiri & Junichi Masuda',
    cabinetTheme: {
      primaryColor: '#dc2626',
      secondaryColor: '#991b1b',
      neonColor: '#f87171',
      glowBorder: 'rgba(220, 38, 38, 0.5)',
      accentBg: 'from-red-950 to-neutral-950',
      textColor: 'text-red-400',
      marqueeBg: 'bg-red-900/60'
    },
    summary: {
      nl: 'De game die de wereld veroverde! Kies je starter Charmander, Squirtle of Bulbasaur in Pallet Town, vang alle 151 Pokémon in Kanto, versla de 8 Gym Leaders en triomfeer tegen de Elite Four en je rivaal!',
      en: 'The title that sparked a worldwide phenomenon! Choose your Pallet Town starter Charmander, Squirtle, or Bulbasaur, capture all 151 Pokémon across Kanto, conquer 8 Gyms, and defeat the Elite Four!'
    },
    highlights: {
      nl: [
        'Het levenswerk van Satoshi Tajiri geïnspireerd op insecten vangen in zijn jeugd',
        '151 Unieke Pokémon monsters om te vangen, trainen, evolueren en verhandelen via Game Link kabel',
        'Onvergetelijke chiptune composities en gevechtsthema’s gecomponeerd door Junichi Masuda',
        'Turn-based gevechtssysteem met type-effectiviteit (Water, Vuur, Gras, Elektrisch, Psyschisch)'
      ],
      en: [
        'Satoshi Tajiri’s 6-year passion project inspired by childhood bug-catching adventures',
        '151 Iconic creatures to catch, train, evolve, and trade via the Game Link cable',
        'Unforgettable battle chiptunes and Pallet Town themes composed by Junichi Masuda',
        'Deep turn-based tactical combat with type matchups (Fire, Water, Grass, Electric, Psychic)'
      ]
    },
    specs: {
      resolution: 'DMG-01 STN LCD 160×144 (Tile-Engine + Monster Sprites)',
      fps: '59.7 FPS Sharp LR35902 CPU (4.19 MHz)',
      soundChip: 'Game Boy APU 4-Channel Stereo Chiptune (Junichi Masuda)',
      media: 'Game Boy ROM Cartridge + Battery Save SRAM (DMG-AP-USA)'
    },
    coinPrice: 'DMG-01 4× AA'
  },
  {
    id: 'wario_land_2',
    year: 1998,
    yearDisplay: '1998',
    yearIcon: '💰',
    system: 'gameboy',
    systemName: { nl: 'Nintendo Game Boy (DMG-01)', en: 'Nintendo Game Boy (DMG-01)' },
    genre: 'platform',
    genreName: { nl: 'Puzzel Actie Platformer', en: 'Puzzle Action Platformer' },
    category: 'handheld',
    categoryName: { nl: 'Handheld & Game Boy', en: 'Handheld & Game Boy' },
    title: 'WARIO LAND II',
    subtitle: { nl: 'De Onsterfelijke Anti-Held • Schoudertackle & Transformaties', en: 'The Immortal Anti-Hero • Shoulder Charge & Status Effects' },
    creator: 'Nintendo R&D1 • Takehiro Izushi & Kozue Ishikawa',
    cabinetTheme: {
      primaryColor: '#ca8a04',
      secondaryColor: '#854d0e',
      neonColor: '#fde047',
      glowBorder: 'rgba(202, 138, 4, 0.5)',
      accentBg: 'from-yellow-950 to-neutral-950',
      textColor: 'text-yellow-400',
      marqueeBg: 'bg-yellow-900/60'
    },
    summary: {
      nl: 'Kapitein Syrup en de Black Sugar Pirates hebben Wario\'s kasteelschat gestolen! In dit meesterwerk kan Wario niet doodgaan: vijandelijke aanvallen transformeren hem in Flaming Wario, Flat Wario, Fat Wario en Zombie Wario om geheime routes te ontgrendelen.',
      en: 'Captain Syrup and the Black Sugar Pirates have plundered Wario’s castle! In this genre-defying game, Wario is immortal: hazards transform him into Hot Wario, Flat Wario, Fat Wario, and Zombie Wario to solve puzzles.'
    },
    highlights: {
      nl: [
        'Revolutionair gameplay-concept: Wario kan niet sterven, maar muteert door gevaren',
        'Verander in Flaming Wario om blokken te verbranden, Flat Wario om door kieren te glijden of Fat Wario',
        'Vertakkende verhaallijnen en meerdere geheime eindes afhankelijk van de gekozen routes',
        'Krachtige schoudertackle om vijanden op te tillen, tegen muren te smijten en munten te oogsten'
      ],
      en: [
        'Revolutionary invulnerability mechanic where status ailments trigger puzzle-solving transformations',
        'Morph into Hot Wario to incinerate blocks, Flat Wario to glide through gaps, and Zombie Wario to drop floors',
        'Branching non-linear level paths and multiple secret narrative endings',
        'Heavyweight shoulder tackle allowing Wario to stun, carry, throw enemies, and smash treasure chests'
      ]
    },
    specs: {
      resolution: 'DMG-01 STN LCD 160×144 (8-Megabit Super ROM)',
      fps: '59.7 FPS Sharp LR35902 CPU (4.19 MHz)',
      soundChip: 'Game Boy APU 4-Channel Stereo Chiptune (Kozue Ishikawa)',
      media: 'Game Boy ROM Cartridge + Battery SRAM (DMG-AW-USA)'
    },
    coinPrice: 'DMG-01 4× AA'
  },
  {
    id: 'gba_sp',
    year: 2003,
    yearDisplay: '2003',
    yearIcon: '📱',
    system: 'gba_sp',
    systemName: { nl: 'Game Boy Advance SP (32-Bit)', en: 'Game Boy Advance SP (32-Bit)' },
    genre: 'rpg',
    genreName: { nl: 'Handheld 32-Bit Multi-Cartridge', en: 'Handheld 32-Bit Multi-Cartridge' },
    category: 'handheld',
    categoryName: { nl: 'Handheld & Game Boy', en: 'Handheld & Game Boy' },
    title: 'GAME BOY ADVANCE SP',
    subtitle: { nl: 'Inklapbare 32-Bit Console • Pokémon Emerald, Mario & Zelda', en: 'Clamshell 32-Bit Console • Pokémon Emerald, Mario & Zelda' },
    creator: 'Nintendo • Kenichiro Ashida & Satoru Iwata',
    cabinetTheme: {
      primaryColor: '#0284c7',
      secondaryColor: '#0369a1',
      neonColor: '#38bdf8',
      glowBorder: 'rgba(2, 132, 199, 0.5)',
      accentBg: 'from-sky-950 to-neutral-950',
      textColor: 'text-sky-400',
      marqueeBg: 'bg-sky-900/60'
    },
    summary: {
      nl: 'De revolutionaire opvouwbare 32-bit handheld van Nintendo! Inclusief werkend scharnier, AGS-001/101 backlight schakelaar, 6 metallic kleurvarianten en 3 legendarische cartridges: Pokémon Emerald, Super Mario Advance 4 en The Legend of Zelda: The Minish Cap.',
      en: 'Nintendo’s revolutionary foldable 32-bit handheld! Features an interactive clamshell hinge, AGS-001/101 backlight toggle, 6 metallic colorways, and 3 legendary playable cartridges: Pokémon Emerald, Super Mario Advance 4, and The Legend of Zelda: The Minish Cap.'
    },
    highlights: {
      nl: [
        'Volledig inklapbaar clamshell-ontwerp met realistische 3D scharnierhoek',
        '3 Speelbare GBA Cartridges: Pokémon Emerald, Super Mario Advance 4 en Zelda: The Minish Cap',
        'Schakelbare AGS-101 Backlit / AGS-001 Frontlit display & 6 behuizingskleuren',
        '32-bit DirectSound stereo audio-synthesizer met authentieke jingles en battle geluiden'
      ],
      en: [
        'Fully foldable clamshell design with realistic 3D hinge perspective',
        '3 Playable GBA Cartridges: Pokémon Emerald, Super Mario Advance 4, and Zelda: The Minish Cap',
        'Switchable AGS-101 Backlit / AGS-001 Frontlit display & 6 metallic shell colorways',
        '32-bit DirectSound stereo audio synthesizer with authentic jingles and battle sounds'
      ]
    },
    specs: {
      resolution: '240×160 TFT LCD (32.768 Kleuren)',
      fps: '59.7 FPS ARM7TDMI 32-bit RISC (16.78 MHz)',
      soundChip: 'DirectSound 6-Channel Stereo PCM + Dual Wave APU',
      media: 'GBA Multi-Cartridge System (AGB-ROM)'
    },
    coinPrice: 'Li-Ion Accu'
  },
  {
    id: 'ps1',
    year: 1994,
    yearDisplay: '1994',
    yearIcon: '💿',
    system: 'ps1',
    systemName: { nl: 'Sony PlayStation (PS1 32-Bit)', en: 'Sony PlayStation (PS1 32-Bit)' },
    genre: 'action',
    genreName: { nl: '3D CD-ROM Console', en: '3D CD-ROM Console' },
    category: 'portable',
    categoryName: { nl: 'Draagbare & Portable Players', en: 'Portable & Handheld Players' },
    title: 'SONY PLAYSTATION 1',
    subtitle: { nl: 'Iconische Grijze Console • Crash Bandicoot & Ridge Racer', en: 'Iconic Gray Console • Crash Bandicoot & Ridge Racer' },
    creator: 'Sony Computer Entertainment • Ken Kutaragi',
    cabinetTheme: {
      primaryColor: '#94a3b8',
      secondaryColor: '#64748b',
      neonColor: '#cbd5e1',
      glowBorder: 'rgba(148, 163, 184, 0.5)',
      accentBg: 'from-slate-900 to-neutral-950',
      textColor: 'text-slate-300',
      marqueeBg: 'bg-slate-900/80'
    },
    summary: {
      nl: 'De revolutionaire 32-bit CD-ROM console van Sony! Inclusief werkende CD-lade animatie, authentieke PS1 opstart-jingle, DualShock controller ondersteuning & 2 speelbare CD-ROM titels: Crash Bandicoot & Ridge Racer.',
      en: 'Sony’s revolutionary 32-bit CD-ROM console! Features opening CD lid animation, authentic PS1 boot chime, DualShock rumble support & 2 playable CD-ROM classics: Crash Bandicoot & Ridge Racer.'
    },
    highlights: {
      nl: [
        'Dedicated PS1 Speelkast met interactieve grijze behuizing & geopende CD-spil animatie',
        '2 Legendarische 3D Games: Crash Bandicoot (3D corridor platformer) & Ridge Racer (3D mountain circuit)',
        'Authentieke Sony PS1 opstart-jingle gesynthetiseerd via Web Audio API',
        'Volledige Xbox & DualShock gamepad ondersteuning met analoge knuppels'
      ],
      en: [
        'Dedicated PS1 Cabinet with interactive gray console & CD spindle spinning animation',
        '2 Legendary 3D Games: Crash Bandicoot (3D corridor platformer) & Ridge Racer (3D mountain circuit)',
        'Authentic Sony PS1 boot chime synthesized via Web Audio API',
        'Full Xbox & DualShock gamepad support with analog thumbsticks'
      ]
    },
    specs: {
      resolution: '320×240 High-Res 3D Textured Mesh (24-bit VRAM)',
      fps: '60 FPS MIPS R3000A 32-bit RISC (33.86 MHz)',
      soundChip: 'SPU 24-Channel CD-Quality Stereo Synthesizer',
      media: 'Double-Speed CD-ROM (650MB Black Disc)'
    },
    coinPrice: 'PS1 Memory Card'
  },
  {
    id: 'ridge_racer',
    year: 1994,
    yearDisplay: '1994',
    yearIcon: '🏎️',
    system: 'ps1',
    systemName: { nl: 'Sony PlayStation (PS1 32-Bit)', en: 'Sony PlayStation (PS1 32-Bit)' },
    genre: 'racing',
    genreName: { nl: '3D Arcade Racing Klassieker', en: '3D Arcade Racing Classic' },
    category: 'portable',
    categoryName: { nl: 'Draagbare & Portable Players', en: 'Portable & Handheld Players' },
    title: 'RIDGE RACER (PS1 3D)',
    subtitle: { nl: 'De Iconische PS1 Launch Drift-Racer in Mountain Cliff Circuit', en: 'The Iconic PS1 Launch Drift-Racer on Mountain Cliff Circuit' },
    creator: 'Namco • Kazunori Yamauchi & Shinji Hosoe',
    cabinetTheme: {
      primaryColor: '#ef4444',
      secondaryColor: '#dc2626',
      neonColor: '#f87171',
      glowBorder: 'rgba(239, 68, 68, 0.5)',
      accentBg: 'from-red-950 to-neutral-950',
      textColor: 'text-red-400',
      marqueeBg: 'bg-red-900/80'
    },
    summary: {
      nl: 'De legendarische launchgame die de kracht van 3D CD-ROM gaming op de PS1 bewees! Scheur door bergtunnels en langs stranden, voer haarscherpe drifts uit op hoge snelheid en luister naar de pompende Namco techno-soundtrack.',
      en: 'The legendary launch title showcasing 3D CD-ROM power on PS1! Drift through mountain tunnels and coastal curves accompanied by Namco’s high-energy techno soundtrack.'
    },
    highlights: {
      nl: [
        'Vlaggenschip PS1 launch game met 60 FPS 3D polygonale raceauto’s',
        'Inclusief F/A Racing rood/geel sportwagen en Ridge Racer Mountain Circuit',
        'Pompende Namco Ridge Racer CD techno soundtrack & meeslepende driftfysica',
        'Ondersteuning voor analoge stuurknuppels op de DualShock controller'
      ],
      en: [
        'Flagship PS1 launch title rendering 60 FPS 3D polygonal racing sports cars',
        'Includes F/A Racing red/yellow car on the iconic Ridge Racer Mountain Circuit',
        'Pumping Namco Ridge Racer CD techno score & responsive drifting mechanics',
        'Full DualShock analog thumbstick & vibration controller feedback'
      ]
    },
    specs: {
      resolution: '320×240 Textured 3D Mesh (24-bit Color)',
      fps: '60 FPS Smooth Drift Physics Engine',
      soundChip: 'Namco System 22 / PS1 SPU Stereo Audio',
      media: 'Double-Speed PS1 CD-ROM Disc'
    },
    coinPrice: 'PS1 Memory Card'
  },
  {
    id: 'crash_bandicoot',
    year: 1996,
    yearDisplay: '1996',
    yearIcon: '🦊',
    system: 'ps1',
    systemName: { nl: 'Sony PlayStation (PS1 32-Bit)', en: 'Sony PlayStation (PS1 32-Bit)' },
    genre: 'platform',
    genreName: { nl: '3D Corridor Platformer', en: '3D Corridor Platformer' },
    category: 'portable',
    categoryName: { nl: 'Draagbare & Portable Players', en: 'Portable & Handheld Players' },
    title: 'CRASH BANDICOOT (PS1 3D)',
    subtitle: { nl: 'Het Baanbrekende 3D Avontuur op N. Sanity Island', en: 'The Groundbreaking 3D Adventure on N. Sanity Island' },
    creator: 'Naughty Dog • Andy Gavin & Jason Rubin',
    cabinetTheme: {
      primaryColor: '#f97316',
      secondaryColor: '#ea580c',
      neonColor: '#fb923c',
      glowBorder: 'rgba(249, 115, 22, 0.5)',
      accentBg: 'from-orange-950 to-neutral-950',
      textColor: 'text-orange-400',
      marqueeBg: 'bg-orange-900/80'
    },
    summary: {
      nl: 'De iconische Sony PlayStation mascotte ontworpen door Naughty Dog! Rijd door het tropische junglepad op N. Sanity Island, voer de iconische spinaanval uit om Wumpa-vruchten te verzamelen en breek TNT kisten.',
      en: 'The iconic PlayStation mascot crafted by Naughty Dog! Sprint down N. Sanity Island jungle corridors, execute Crash’s signature spin attack, collect Wumpa fruit, and smash TNT crates.'
    },
    highlights: {
      nl: [
        'Genoemd door Andy Gavin en Jason Rubin als de "Sonic\'s Ass Game" voor zijn revolutionaire 3D diepteperspectief',
        'Spinaanval, sprong en Wumpa-vrucht verzamelsysteem met Aku Aku houten bescherrmasker',
        'Machtige trofeecounter, kistenbreker-animatie en eilandjungle omgeving',
        'Volledig speelbaar in 3D met DualShock analoge besturing'
      ],
      en: [
        'Nicknamed by Naughty Dog as "Sonic’s Ass Game" for pioneered 3D forward-viewing platforming',
        'Spin attacks, jump acrobatics, Wumpa fruit collection, and protective Aku Aku tiki masks',
        'Crate counter tracker, nitro hazards, and lush N. Sanity Island jungle biome',
        'Playable in full 3D with DualShock analog thumbsticks'
      ]
    },
    specs: {
      resolution: '320×240 High-Poly 3D Character Mesh',
      fps: '60 FPS Smooth Corridor Platformer Engine',
      soundChip: 'PS1 SPU 24-Channel Tropical Chiptune & Sound Effects',
      media: 'Double-Speed PS1 CD-ROM Disc'
    },
    coinPrice: 'PS1 Memory Card'
  },
  {
    id: 'mario_advance',
    year: 2003,
    yearDisplay: '2003',
    yearIcon: '🍄',
    system: 'gba_sp',
    systemName: { nl: 'Game Boy Advance SP (32-Bit)', en: 'Game Boy Advance SP (32-Bit)' },
    genre: 'platform',
    genreName: { nl: 'Handheld 32-Bit Platformer', en: 'Handheld 32-Bit Platformer' },
    category: 'handheld',
    categoryName: { nl: 'Handheld & Game Boy', en: 'Handheld & Game Boy' },
    title: 'SUPER MARIO ADVANCE 4',
    subtitle: { nl: 'Super Mario Bros 3 Remastered voor GBA SP', en: 'Super Mario Bros 3 Remastered for GBA SP' },
    creator: 'Nintendo R&D2 • Shigeru Miyamoto & Takashi Tezuka',
    cabinetTheme: {
      primaryColor: '#ef4444',
      secondaryColor: '#b91c1c',
      neonColor: '#f87171',
      glowBorder: 'rgba(239, 68, 68, 0.5)',
      accentBg: 'from-red-950 to-neutral-950',
      textColor: 'text-red-400',
      marqueeBg: 'bg-red-900/60'
    },
    summary: {
      nl: 'De definitieve 32-bit remaster van Super Mario Bros. 3! Inclusief Tanooki-vliegpak, kikkerspak, Koopaling luchtschepen, verrijkte stemmen en e-Reader bonuskaarten op het verlichte GBA SP scherm.',
      en: 'The definitive 32-bit enhancement of Super Mario Bros. 3! Complete with Super Leaf flying, Tanooki suits, Koopaling airships, crisp digitized voice samples, and e-Reader card extras.'
    },
    highlights: {
      nl: [
        'Volledige 32-bit bewerkte graphics van de NES & SNES klassieker Super Mario Bros. 3',
        'Tanooki Leaf vliegen, kikker-pak, hammer bros-pak en P-Meter vliegmeter',
        'Gedigitaliseerde stemgeluiden voor Mario en Luigi ingesproken door Charles Martinet',
        'Vlaggenschip 2003 lancering voor de Game Boy Advance SP'
      ],
      en: [
        'Complete 32-bit remastered visual overhaul of the All-Stars Super Mario Bros. 3 engine',
        'Tanooki suit flight meter, Frog Suit swimming, and Hammer Suit projectiles',
        'Digitized voice clips recorded by Charles Martinet for Mario & Luigi',
        'Flagship 2003 launch showcase for the Game Boy Advance SP'
      ]
    },
    specs: {
      resolution: '240×160 TFT LCD (32.768 Kleuren)',
      fps: '59.7 FPS ARM7TDMI 32-bit RISC Engine',
      soundChip: 'DirectSound 6-Channel Stereo PCM Audio',
      media: 'GBA Multi-Cartridge (AGB-AX4E-USA)'
    },
    coinPrice: 'Li-Ion Accu'
  },
  {
    id: 'pokemon_emerald',
    year: 2004,
    yearDisplay: '2004',
    yearIcon: '⚡',
    system: 'gba_sp',
    systemName: { nl: 'Game Boy Advance SP (32-Bit)', en: 'Game Boy Advance SP (32-Bit)' },
    genre: 'rpg',
    genreName: { nl: 'Handheld 32-Bit Monster RPG', en: 'Handheld 32-Bit Monster RPG' },
    category: 'handheld',
    categoryName: { nl: 'Handheld & Game Boy', en: 'Handheld & Game Boy' },
    title: 'POKÉMON EMERALD',
    subtitle: { nl: 'De Ultieme Hoenn Generatie III Hoofdklasse op GBA SP', en: 'The Definitive Hoenn Gen III Masterpiece on GBA SP' },
    creator: 'Game Freak • Shigeki Morimoto & Junichi Masuda',
    cabinetTheme: {
      primaryColor: '#10b981',
      secondaryColor: '#047857',
      neonColor: '#34d399',
      glowBorder: 'rgba(16, 185, 129, 0.5)',
      accentBg: 'from-emerald-950 to-neutral-950',
      textColor: 'text-emerald-400',
      marqueeBg: 'bg-emerald-900/60'
    },
    summary: {
      nl: 'Het kroonjuweel van de 32-bit Pokémon spellen! Verken de Hoenn regio, tem de legendarische draak Rayquaza om het gevecht tussen Kyogre en Groudon te sussen, en verover de Battle Frontier!',
      en: 'The crown jewel of 32-bit Pokémon adventures! Explore Hoenn, summon legendary Rayquaza to stop the clash between Kyogre and Groudon, and conquer the Battle Frontier!'
    },
    highlights: {
      nl: [
        'Geanimeerde 32-bit Pokémon battle-sprites en de legendarische Rayquaza Sootopolis cutscene',
        'Team Magma vs Team Aqua dubbele verhaallijn en de uitdagende Battle Frontier',
        'Kies Treecko, Torchic of Mudkip en vang alle Hoenn & Kanto legendes',
        'Prachtige stereo DirectSound blaas- en gevechtmuziek van Junichi Masuda'
      ],
      en: [
        'Animated 32-bit battle intro sprites & the climactic Rayquaza cutscene at Sootopolis City',
        'Simultaneous Team Magma & Team Aqua conflict plus the post-game Battle Frontier',
        'Select Treecko, Torchic or Mudkip and catch legendary Hoenn & Kanto Pokémon',
        'Rich DirectSound stereo trumpet tracks composed by Junichi Masuda'
      ]
    },
    specs: {
      resolution: '240×160 TFT LCD (Animated Battle Sprites)',
      fps: '59.7 FPS ARM7TDMI 32-bit RISC Engine',
      soundChip: 'DirectSound 6-Channel Stereo PCM Audio',
      media: 'GBA Multi-Cartridge + Clock SRAM (AGB-BPEE-USA)'
    },
    coinPrice: 'Li-Ion Accu'
  },
  {
    id: 'zelda_minish',
    year: 2004,
    yearDisplay: '2004',
    yearIcon: '🗡️',
    system: 'gba_sp',
    systemName: { nl: 'Game Boy Advance SP (32-Bit)', en: 'Game Boy Advance SP (32-Bit)' },
    genre: 'adventure',
    genreName: { nl: 'Top-Down 32-Bit Actie Avontuur', en: 'Top-Down 32-Bit Action Adventure' },
    category: 'handheld',
    categoryName: { nl: 'Handheld & Game Boy', en: 'Handheld & Game Boy' },
    title: 'THE LEGEND OF ZELDA: THE MINISH CAP',
    subtitle: { nl: 'Krimp tot het Picori-Formaat met Ezlo op GBA SP', en: 'Shrink to Picori Size with Ezlo on GBA SP' },
    creator: 'Capcom / Flagship • Hidemaro Fujibayashi & Keiji Inafune',
    cabinetTheme: {
      primaryColor: '#eab308',
      secondaryColor: '#ca8a04',
      neonColor: '#facc15',
      glowBorder: 'rgba(234, 179, 8, 0.5)',
      accentBg: 'from-yellow-950 to-neutral-950',
      textColor: 'text-yellow-400',
      marqueeBg: 'bg-yellow-900/60'
    },
    summary: {
      nl: 'Een visueel meesterwerk op de Game Boy Advance SP! Zet de pratende vogelhoed Ezlo op, krimp tot microscopisch Minish-formaat om grassprieten te transformeren in gigantische oerwouden, en smeed het Four Sword.',
      en: 'A pixel-art masterpiece on Game Boy Advance SP! Wear the magical talking cap Ezlo to shrink to microscopic Minish size, explore tiny secret worlds, and forge the legendary Four Sword.'
    },
    highlights: {
      nl: [
        'Baanbrekende krimpmechaniek die Hyrule in twee unieke dimensies laat verkennen',
        'Prachtige verzadigde 32-bit pixel-art ontwikkeld door Capcom & Flagship',
        'Kinstone fusiesysteem met inwoners van Hyrule om geheime schatten te onthullen',
        'Machtige kerkers met unieke items zoals de Gust Jar en Mole Gloves'
      ],
      en: [
        'Innovative size-shifting mechanic uncovering two distinct perspectives of Hyrule',
        'Gorgeous 32-bit pixel-art tilesets co-developed by Capcom and Flagship',
        'Kinstone fusion system with Hyrule citizens unlocking secrets across the world',
        'Inventive dungeons featuring the Gust Jar vacuum and Mole Gloves'
      ]
    },
    specs: {
      resolution: '240×160 TFT LCD (Rich Pixel Art & Parallax)',
      fps: '59.7 FPS ARM7TDMI 32-bit RISC Engine',
      soundChip: 'DirectSound 6-Channel Stereo PCM Audio',
      media: 'GBA Multi-Cartridge + Battery SRAM (AGB-BZME-USA)'
    },
    coinPrice: 'Li-Ion Accu'
  },
  {
    id: 'spy_fox',
    year: 1997,
    yearDisplay: '1997',
    yearIcon: '🦊',
    system: 'dos_pc',
    systemName: { nl: 'PC CD-ROM & SCUMM', en: 'PC CD-ROM & SCUMM' },
    genre: 'adventure',
    genreName: { nl: 'Point & Click Avontuur', en: 'Point & Click Adventure' },
    category: 'adventure',
    categoryName: { nl: 'Grafische Avonturen & SCUMM', en: 'Graphic Adventures & SCUMM' },
    title: 'SPY FOX in "Dry Cereal"',
    subtitle: { nl: 'Operatie Melkzuur • Humongous Entertainment • Ron Gilbert', en: 'Operation Dry Cereal • Humongous Entertainment • Ron Gilbert' },
    creator: 'Ron Gilbert & Humongous Entertainment',
    cabinetTheme: {
      primaryColor: '#0284c7',
      secondaryColor: '#0369a1',
      neonColor: '#38bdf8',
      glowBorder: 'rgba(56, 189, 248, 0.5)',
      accentBg: 'from-sky-950 via-slate-900 to-black',
      textColor: 'text-sky-400',
      marqueeBg: 'bg-sky-900/60'
    },
    summary: {
      nl: 'De ultieme humoristische point-and-click spionagedetective van Ron Gilbert (bedenker van Monkey Island en SCUMM). Infiltreer het Griekse eiland Acidophilus als de onberispelijk geklede Spy Fox, ontmasker William the Kid en red alle gekidnapte melkkoeien met ingenieuze spionage-gadgets!',
      en: 'The definitive witty point-and-click spy detective by Ron Gilbert (creator of Monkey Island and SCUMM). Infiltrate the Greek isle of Acidophilus as the dapper Spy Fox in his crisp white tuxedo, foil William the Kid\'s dairy conspiracy, and rescue the world\'s milk with high-tech spy gadgets!'
    },
    highlights: {
      nl: [
        'Geëvolueerde SCUMM-engine met klassieke werkwoorden: Kijk Naar, Pak Op, Praat Met & Gebruik',
        'Iconische spionage-gadgets: Spy Watch communicator, Laser-Tandenstoker en Spionagemunten',
        'Legendarische Nederlandse nasynchronisatie door stemacteur Jan Nonhof als Spy Fox',
        'Funky 70s geheime agenten jazz-synthesizer en levendige handgetekende VGA-animaties'
      ],
      en: [
        'Evolved SCUMM adventure engine with classic action verbs: Look At, Pick Up, Talk To & Use',
        'Iconic spy gadgetry: SPY Watch communicator, high-powered Laser Toothpick and SPY Coins',
        'Humorous voice acting, witty environmental commentary, and charming character portraits',
        'Funky 70s spy jazz soundtrack and vibrant hand-drawn VGA cartoon animation'
      ]
    },
    specs: {
      resolution: '320×200 256-Color VGA SCUMM Engine',
      fps: '60 FPS Ultra-Vloeiende Point & Click Interactie',
      soundChip: 'Procedural Web Audio Spy Jazz & Sound Effects',
      media: 'Windows 95/98 / DOS CD-ROM (Humongous)'
    },
    coinPrice: '1 Spy Coin'
  },
  {
    id: 'night_driver',
    year: 1980,
    yearDisplay: '1980 / 1983',
    yearIcon: '🏎️',
    system: 'apple_ii',
    systemName: { nl: 'Apple IIe Computer', en: 'Apple IIe Computer' },
    genre: 'racing',
    genreName: { nl: '3D Nachtracer', en: '3D Night Racing' },
    category: 'arcade',
    categoryName: { nl: 'Microcomputer & Klassiekers', en: 'Microcomputer & Classics' },
    title: 'NIGHT DRIVER',
    subtitle: { nl: 'De Legendarische First-Person 3D Nachtracer op de Apple II', en: 'The Legendary First-Person 3D Night Racer on Apple II' },
    creator: 'Bill Budge • Softape & California Pacific',
    cabinetTheme: {
      primaryColor: '#eab308',
      secondaryColor: '#ca8a04',
      neonColor: '#fde047',
      glowBorder: 'rgba(234, 179, 8, 0.5)',
      accentBg: 'from-amber-950 via-stone-900 to-black',
      textColor: 'text-amber-400',
      marqueeBg: 'bg-stone-800'
    },
    summary: {
      nl: 'De legendarische first-person nachtelijke racer geprogrammeerd door de beroemde Bill Budge voor de Apple II. Scheur in het holst van de nacht over kronkelende wegen gemarkeerd door felle witte reflectorpalen. Vanwege de wereldwijde rage rondom de tv-serie Knight Rider in 1982/1983 noemden spelers in Nederland en Europa dit spel steevast "Night Rider"!',
      en: 'The legendary first-person night driving game coded by famous Apple II engineer Bill Budge. Blast through the dark on twisting roads guided only by glowing roadside reflector pylons. When the TV show Knight Rider became an international sensation in 1982/1983, kids across Europe famously dubbed this beloved game "Night Rider"!'
    },
    highlights: {
      nl: [
        'Baanbrekende 60 FPS first-person 3D road physics geprogrammeerd in 6502 assembly',
        'Iconische motorkap-cockpit, handgeschakelde 4-versnellingsbak en nachtelijke tegenliggers',
        'Keuze tussen authentieke Apple Monitor II (P31 groen-fosfor) en Steve Wozniak\'s Hi-Res composite kleuren',
        'Volledig nagebouwde Apple II 1-bit luidspreker physics voor motorgeluiden, bandengegier en crash-effecten'
      ],
      en: [
        'Groundbreaking 60 FPS first-person pseudo-3D road physics in pure 6502 assembly',
        'Iconic muscle-car hood cockpit, 4-speed manual gearbox, and oncoming headlights to dodge',
        'Authentic toggle switch between Apple Monitor II (P31 green phosphor) and Hi-Res composite color',
        'Procedural Web Audio synthesis replicating Apple II 1-bit speaker toggles for engine buzz, tire screech, and crunching crashes'
      ]
    },
    specs: {
      resolution: '280×192 Apple II Hi-Res Graphics (Green / Color)',
      fps: '60.0 FPS Fixed 6502 Assembly Road Loop',
      soundChip: 'Apple II 1-Bit Speaker Toggle ($C030)',
      media: '5.25" Floppy Disk (Apple DOS 3.3)'
    },
    coinPrice: 'Apple IIe'
  },
  {
    id: 'topografie_europa',
    year: 1984,
    yearDisplay: '1984',
    yearIcon: '🚁',
    system: 'c64',
    systemName: { nl: 'Commodore 64', en: 'Commodore 64' },
    genre: 'simulation',
    genreName: { nl: 'Topografie Simulatie', en: 'Topography Simulation' },
    category: 'c64',
    categoryName: { nl: 'Commodore 64 & Amiga', en: 'Commodore 64 & Amiga' },
    title: 'TOPOGRAFIE EUROPA',
    subtitle: { nl: 'De Legendarische C64 Helikopter Topografie van Radarsoft', en: 'The Legendary C64 Helicopter Geography Classic by Radarsoft' },
    creator: 'Cees Kramer & Roel Kramer • Radarsoft',
    cabinetTheme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1d4ed8',
      neonColor: '#60a5fa',
      glowBorder: 'rgba(59, 130, 246, 0.5)',
      accentBg: 'from-blue-950 via-slate-900 to-black',
      textColor: 'text-blue-400',
      marqueeBg: 'bg-blue-900'
    },
    summary: {
      nl: 'De ultieme Nederlandse klassieker van Radarsoft (Cees Kramer & Roel Kramer) voor de Commodore 64! Stap in de helikopter op de heliport, stijg op en vlieg in vogelvlucht over de blinde kaart van Europa. Volg de instructies op je C64-scherm om steden, hoofdsteden, rivieren en gebergten te lokaliseren en land precies op het doelwit! Een generatie Nederlandse scholieren en C64-bezitters leerde hiermee aardrijkskunde.',
      en: 'The quintessential Dutch classic by Radarsoft (Cees Kramer & Roel Kramer) for the Commodore 64! Step into your helicopter on the heliport, take off, and fly high over the unlabeled map of Europe. Follow the C64 mission teleprompter to locate European capitals, major cities, rivers, and mountains, and land precisely on target! A generation of 80s kids learned European geography playing this masterpiece.'
    },
    highlights: {
      nl: [
        'Volledig natuurgetrouwe C64 VIC-II kaart van Europa met getekende kusten, landsgrenzen, bergketens en rivieren',
        'Vlieg met de helikopter, beheer je kerosinevoorraad en maak precisielandingen op steden of heliports',
        'Authentieke Commodore 64 SID 6581 sound-effecten voor wiekgeronk, opstijgen, landen en de klassieke Radarsoft overwinningsfanfare',
        'Vier spelmodi: Hoofdsteden van Europa, Belangrijke Havens & Steden, Rivieren & Natuur, en Vrije Vlucht Verkenning'
      ],
      en: [
        'Faithfully recreated C64 VIC-II European map with hand-drawn coastlines, borders, mountain peaks, and flowing rivers',
        'Pilot the helicopter, manage fuel consumption, and perform precision landings directly onto cities and heliports',
        'Authentic Commodore 64 SID 6581 procedural sound effects for blade chops, takeoffs, touchdowns, and the Radarsoft victory fanfare',
        'Four game modes: European Capitals, Major Ports & Cities, Rivers & Geography, and Free Flight Exploration'
      ]
    },
    specs: {
      resolution: '320×200 C64 VIC-II Hi-Res / Multicolor Display',
      fps: '50.0 / 60.0 FPS PAL/NTSC Flight Engine',
      soundChip: 'MOS Technology 6581 SID Sound Synthesizer',
      media: '5.25" Commodore 1541 Floppy Disk / Datassette'
    },
    coinPrice: 'C64 Tape'
  },
  {
    id: 'lode_runner',
    year: 1983,
    yearDisplay: '1983',
    yearIcon: '🏃',
    system: 'apple_ii',
    systemName: { nl: 'Apple IIe Computer', en: 'Apple IIe Computer' },
    genre: 'puzzle',
    genreName: { nl: 'Puzzel-Platformer', en: 'Puzzle-Platformer' },
    category: 'arcade',
    categoryName: { nl: 'Apple II Klassiekers', en: 'Apple II Classics' },
    title: 'LODE RUNNER',
    subtitle: {
      nl: 'De Baanbrekende Apple II Graaf- & Puzzel-Platformer van Doug Smith',
      en: 'Doug Smith’s Groundbreaking Apple II Digging & Puzzle Platformer'
    },
    creator: 'Doug Smith • Brøderbund Software',
    cabinetTheme: {
      primaryColor: '#22c55e',
      secondaryColor: '#15803d',
      neonColor: '#4ade80',
      glowBorder: 'rgba(34, 197, 94, 0.5)',
      accentBg: 'from-emerald-950 via-slate-900 to-black',
      textColor: 'text-emerald-400',
      marqueeBg: 'bg-emerald-900'
    },
    summary: {
      nl: 'Het meesterwerk van Doug Smith voor de Apple II uit 1983, uitgegeven door Brøderbund! Ren over platforms, klim langs ladders en slinger over stangen om al het goud van het Bungeling Rijk te stelen. Graaf tactische gaten links en rechts om monniken in de val te lokken, loop over hun hoofden heen en ontsnap via de geheime ladder. Een van de allereerste computerspellen met een ingebouwde level editor!',
      en: 'Doug Smith’s 1983 Apple II tour-de-force, published by Brøderbund! Sprint across platforms, scale ladders, and swing hand-over-hand across overhead bars to reclaim the stolen gold from the Bungeling Empire. Vaporize brick floors left and right to trap pursuing guards, walk across their heads, and climb the escape ladder. One of the first games in computer history featuring a built-in level editor!'
    },
    highlights: {
      nl: [
        'Volledig natuurgetrouwe Apple II Hi-Res 280×192 graphics met NTSC kleurmodi (Groen Phosphor, Amber en 6-Color)',
        'Graaf gaten links (Z) en rechts (C) in bakstenen vloeren met authentieke 1-bits Apple II speaker geluidssynthese',
        'Slimme Bungeling monniken die goud meedragen, in gaten vallen en verpletterd worden wanneer stenen regenereren',
        'Verschillende iconische puzzellevels en ondersteuning voor Gamepad, Touch controls en toetsenbord'
      ],
      en: [
        'Faithfully recreated Apple II Hi-Res 280×192 graphics with P31 Green Phosphor, Amber, and Apple 6-Color modes',
        'Tactical digging beams left (Z) and right (C) with authentic 1-bit Apple II speaker procedural sound effects',
        'Bungeling guards that carry gold chests, fall into dug traps, and get crushed as bricks regenerate',
        'Multiple iconic puzzle levels with full support for Gamepads, touch controls, and keyboards'
      ]
    },
    specs: {
      resolution: '280×192 Apple II Hi-Res Graphic Display',
      fps: '60.0 FPS Fixed 6502 Machine Loop',
      soundChip: 'Apple II 1-Bit Soft-Switch Speaker ($C030)',
      media: '5.25" Apple Disk II Floppy Disk (DOS 3.3)'
    },
    coinPrice: 'Apple Disk'
  },
  {
    id: 'arkanoid',
    year: 1986,
    yearDisplay: '1986',
    yearIcon: '🧱',
    system: 'arcade',
    systemName: { nl: 'Speelhal Coin-Op', en: 'Arcade Coin-Op' },
    genre: 'action',
    genreName: { nl: 'Bat & Ball / Brick Breaker', en: 'Bat & Ball / Brick Breaker' },
    category: 'arcade',
    categoryName: { nl: 'Arcade Hal Klassiekers', en: 'Arcade Hall Classics' },
    title: 'ARKANOID',
    subtitle: {
      nl: 'De Ultieme Taito Steen-Sloper & Steve Jobs/Wozniak Breakout Erfgenaam',
      en: 'The Ultimate Taito Brick Breaker & Steve Jobs/Wozniak Breakout Heir'
    },
    creator: 'Taito (1986) • Akira Fujita & Yasumasa Sasabe | Atari Breakout (1976) • Steve Wozniak & Steve Jobs',
    cabinetTheme: {
      primaryColor: '#06b6d4',
      secondaryColor: '#0891b2',
      neonColor: '#22d3ee',
      glowBorder: 'rgba(6, 182, 212, 0.5)',
      accentBg: 'from-cyan-950 via-slate-900 to-black',
      textColor: 'text-cyan-400',
      marqueeBg: 'bg-cyan-950'
    },
    summary: {
      nl: 'De koning aller bat-and-ball spellen! Bestuur het Vaus ruimteschip om de energiebal tegen kleurrijke muren van stenen te kaatsen. Vang de 7 legendarische power-up capsules (Laser, Expand, Catch, Slow, Disruption, Break en Player), vernietig dalende geometrische aliens en vecht je een weg naar de mysterieuze eindbaas DOH!',
      en: 'The undisputed king of the brick-breaking genre! Pilot the Vaus energy vessel to bounce cosmic spheres against layered walls of chromatic bricks. Snag all 7 iconic power-up capsules (Laser, Expand, Catch, Slow, Disruption, Break, Player), blast descending alien minions, and smash your way to the enigmatic final boss DOH!'
    },
    highlights: {
      nl: [
        'Vaus ruimteschip met dynamische bal-kaatshoeken en sublieme precisiebesturing',
        '7 Iconische Power-Up capsules: Laser kanonnen (L), Peddel vergroten (E), Sticky Catch (C), Vertraging (S), Multi-ball (D), Warp (B) en Extra Leven (P)',
        'Verschillende lagen met normale stenen, 2-hit zilveren blokken en onverwoestbaar goud',
        'Authentieke procedurale Web Audio effecten en volledige ondersteuning voor Xbox controller, muis/touch en toetsenbord'
      ],
      en: [
        'Vaus spacecraft featuring dynamic collision angle physics and razor-sharp steering',
        '7 Iconic Power-Up pills: Laser cannons (L), Expand width (E), Sticky catch (C), Slowdown (S), Multi-ball (D), Warp portal (B), and Extra life (P)',
        'Layered challenges with chromatic bricks, 2-hit silver blocks, and indestructible gold barriers',
        'Authentic procedural Web Audio synthesis with full support for Xbox gamepads, mouse drag, touch swipes, and keyboards'
      ]
    },
    specs: {
      resolution: '224×256 Arcade Raster CRT Layout',
      fps: '60.0 FPS Fixed Hardware Cycle',
      soundChip: 'General Instrument AY-3-8910 PSG Chip',
      media: 'Taito Arcade ROM Board'
    },
    coinPrice: '1 Coin / Play'
  },
  {
    id: 'galaga',
    year: 1981,
    yearDisplay: '1981',
    yearIcon: '🚀',
    system: 'arcade',
    systemName: { nl: 'Speelhal Coin-Op', en: 'Arcade Coin-Op' },
    genre: 'space',
    genreName: { nl: 'Fixed Shooter / Space Invader', en: 'Fixed Shooter / Space Invader' },
    category: 'arcade',
    categoryName: { nl: 'Arcade Hal Klassiekers', en: 'Arcade Hall Classics' },
    title: 'GALAGA',
    subtitle: {
      nl: 'De Onbetwiste Koning van de Duikvlucht-Shooters & Dual Fighter Tractor Beam',
      en: 'The Undisputed King of Dive-Bombing Space Shooters & Dual Fighter Tractor Beam'
    },
    creator: 'Namco (1981) • Shigeru Yokoyama & Nobuyuki Ohnogi',
    cabinetTheme: {
      primaryColor: '#ef4444',
      secondaryColor: '#3b82f6',
      neonColor: '#fbbf24',
      glowBorder: 'rgba(239, 68, 68, 0.5)',
      accentBg: 'from-blue-950 via-slate-900 to-black',
      textColor: 'text-red-400',
      marqueeBg: 'bg-red-950'
    },
    summary: {
      nl: 'Het revolutionaire vervolg op Galaxian en een van de meest geliefde arcade-shooters aller tijden! Bestuur de Fighter tegen zwermen insectoïde buitenaardse wezens (Zako-bijen, Goei-vlinders en Boss Galaga’s) die in adembenemende formaties en duikvluchten aanvallen. Laat je schip vrijwillig ontvoeren door de mysterieuze blauwe tractor beam van de Boss Galaga, bevrijd hem in de volgende aanvalsgolf en vecht door met de oppermachtige DUAL FIGHTER met dubbele vuurkracht!',
      en: 'The revolutionary follow-up to Galaxian and one of the greatest arcade space shooters in gaming history! Pilot the Fighter starship against swarms of insectoid aliens (Zako bees, Goei butterflies, and Commander Boss Galagas) attacking in graceful looping dive-bombs. Risk getting trapped by the Boss Galaga’s pulsating blue tractor beam to later rescue your captive ship and unlock the formidable DUAL FIGHTER with twin plasma cannons!'
    },
    highlights: {
      nl: [
        'Legendarische "Dual Fighter" modus: verdubbel je vuurkracht door je gevangen schip strategisch te bevrijden uit de tractor beam',
        'Vloeiende duikvluchten in formaties met Boss Galaga’s, Goei-vlinders en Zako-bijen',
        'Iconische Challenging Stages (elke 3 levels) met speciale formaties en "PERFECT 10,000 PTS" bonus',
        'Authentieke RGB-kleurenpaletten, sterrenhemel parallax en iconische procedurale chiptune fanfares'
      ],
      en: [
        'Legendary "Dual Fighter" mechanic: double your firepower by tactically rescuing your captured ship from the tractor beam',
        'Smooth looping dive-bomb attack curves with Boss Galagas, Goei butterflies, and Zako bees',
        'Iconic Challenging Stages (every 3 stages) featuring 40 trick-flying aliens and "PERFECT 10,000 PTS" bonuses',
        'Authentic RGB color palettes, scrolling starfield parallax, and iconic procedural chiptune audio fanfares'
      ]
    },
    specs: {
      resolution: '224×288 Vertical Raster CRT Display',
      fps: '60.6 FPS Z80 Arcade Loop',
      soundChip: 'Namco 3-Channel Custom WSG (Waveform Sound Generator)',
      media: 'Namco Galaga Arcade PCB Board'
    },
    coinPrice: '1 Coin / Play'
  },
  {
    id: 'sudoku',
    year: 1984,
    yearDisplay: '1984',
    yearIcon: '🔢',
    system: 'ibm_pc',
    systemName: { nl: 'MS-DOS & Nikoli (1984)', en: 'MS-DOS & Nikoli (1984)' },
    genre: 'puzzle',
    genreName: { nl: 'Denksport / Cijferlogica', en: 'Brain Sport / Number Logic' },
    category: 'brain_logic',
    categoryName: { nl: 'Denksport, Bord- & Logica', en: 'Brain, Board & Logic' },
    title: 'SUDOKU',
    subtitle: { nl: 'Het Wereldwijde Cijferlogica & Breintraining Meesterwerk', en: 'The Global Number Logic & Brain Training Masterpiece' },
    creator: 'Howard Garns (1979) • Maki Kaji (Nikoli, 1984)',
    cabinetTheme: {
      primaryColor: '#d97706',
      secondaryColor: '#b45309',
      neonColor: '#fbbf24',
      glowBorder: 'rgba(217, 119, 6, 0.6)',
      accentBg: 'from-amber-950 via-stone-900 to-black',
      textColor: 'text-amber-400',
      marqueeBg: 'bg-amber-950'
    },
    summary: {
      nl: 'De ultieme logische denkpuzzel ter wereld! Oorspronkelijk bedacht in 1979 door Howard Garns als "Number Place" en in 1984 door Maki Kaji (Nikoli) omgedoopt tot Sudoku. Vul het 9×9 raster zodanig in dat elke rij, kolom en elk 3×3 blok alle cijfers van 1 tot en met 9 precies éénmaal bevat. Gespeeld op een sfeervolle klassieke houten leestafel met krantenpapier, inclusief potloodnotities (pencil notes), 4 moeilijkheidsgraden, slimme hints en rustgevende chiptunes!',
      en: 'The world’s definitive number logic puzzle! Conceived in 1979 by Howard Garns as "Number Place" and famously christened Sudoku by Maki Kaji (Nikoli) in 1984. Complete the 9×9 grid so that every row, column, and 3×3 box contains the numbers 1 through 9 exactly once. Played across a charming rustic mahogany table with authentic newsprint paper, featuring candidate pencil notes, 4 difficulty levels, smart hints, and peaceful chiptune sounds!'
    },
    highlights: {
      nl: [
        'Echte wiskundige 9×9 backtracking puzzelgenerator met gegarandeerd één unieke oplossing',
        '4 moeilijkheidsgraden: Makkelijk, Gemiddeld, Moeilijk en Expert',
        'Klassiek Krantenpapier thema met potloodkandidaatnotities (Pencil Notes) en gum',
        'Slimme deductiehints, zetgeschiedenis (Undo) en keuze tussen Vrije Zen-modus of 3 Levens'
      ],
      en: [
        'Pure mathematical 9×9 backtracking puzzle generator with guaranteed unique solutions',
        '4 difficulty tiers: Easy, Medium, Hard, and Expert',
        'Classic Newsprint Paper theme with candidate pencil notes and tactile eraser',
        'Smart deductive hints, full move history (Undo), and choice between Zen Mode or 3 Strikes'
      ]
    },
    specs: {
      resolution: '9×9 Grid (81 Cells, 9 3×3 Sub-Grids)',
      fps: '60 FPS Tactile Desk Loop',
      soundChip: 'Web Audio Procedural Pencil Scratch & Chimes',
      media: 'The Daily Sudoku Newsprint & Dedicated LCD Handheld'
    },
    coinPrice: 'FREE PLAY'
  },
  {
    id: 'battleship',
    year: 1982,
    yearDisplay: '1982',
    yearIcon: '🚢',
    system: 'ibm_pc',
    systemName: { nl: 'Juegos & Co. (1982)', en: 'Juegos & Co. (1982)' },
    genre: 'puzzle',
    genreName: { nl: 'Logische Denksport / Zeeslag', en: 'Logic Brain Sport / Battleship' },
    category: 'brain_logic',
    categoryName: { nl: 'Denksport, Bord- & Logica', en: 'Brain, Board & Logic' },
    title: 'ZEESLAG SOLITAIRE',
    subtitle: { nl: 'De Iconische Wiskundige Vlootdeductie & Bimaru Puzzel', en: 'The Iconic Mathematical Fleet Deduction & Bimaru Puzzle' },
    creator: 'Jaime Poniachik (1982) • WPC World Championship',
    cabinetTheme: {
      primaryColor: '#0891b2',
      secondaryColor: '#0e7490',
      neonColor: '#22d3ee',
      glowBorder: 'rgba(8, 145, 178, 0.6)',
      accentBg: 'from-cyan-950 via-slate-900 to-black',
      textColor: 'text-cyan-400',
      marqueeBg: 'bg-cyan-950'
    },
    summary: {
      nl: 'De legendarische maritieme logische deductiepuzzel! In 1982 bedacht door de Argentijnse puzzelgrootmeester Jaime Poniachik als "Batalla Naval" en wereldwijd geliefd als Bimaru en Zeeslag Solitaire. Vind de geheime vloot (slagschip, kruisers, torpedobootjagers en onderzeeërs) met behulp van rij- en kolomtellingen. Schepen mogen elkaar NOOIT horizontaal, verticaal of diagonaal raken! Compleet met snelheidsbonus, strafpunten voor hints en fouten, en lokale topscores.',
      en: 'The legendary maritime logic puzzle! Created in 1982 by Argentine puzzle grandmaster Jaime Poniachik as "Batalla Naval" and cherished worldwide as Bimaru and Battleship Solitaire. Deduce the hidden fleet (battleship, cruisers, destroyers, submarines) using row and column vessel totals. Crucially, ships may NEVER touch horizontally, vertically, or diagonally! Complete with speed bonuses, penalty deductions, and local leaderboards.'
    },
    highlights: {
      nl: [
        'Wiskundige solitaire vlootgenerator met unieke deductieve scheepsposities',
        '3 speelniveaus: Makkelijk (8×8), Gemiddeld (8×8) en Expert Admiraal (10×10)',
        'Authentiek marineblauw zeekaart-thema met watergolven en gouden scheepsankers',
        'Strikte diagonale scheiding: geen twee scheepsdelen mogen elkaar ooit raken',
        'Volledig geïntegreerd scoresysteem met snelheidsbonus, hintaftrek en lokaal vlootlogboek'
      ],
      en: [
        'Pure mathematical solitaire fleet generator with deductive vessel coordinates',
        '3 difficulty modes: Easy (8×8), Medium (8×8), and Expert Admiral (10×10)',
        'Authentic nautical naval map theme with ocean waves and gilded ship anchors',
        'Strict diagonal isolation: no two ship cells may touch each other under any condition',
        'Full scoring engine with speed decay bonus, penalty deductions, and local hall of fame'
      ]
    },
    specs: {
      resolution: '8×8 / 10×10 Nautical Grid',
      fps: '60 FPS Naval Chart Loop',
      soundChip: 'Web Audio Water Splashes & Ship Sinking Fanfare',
      media: 'Bimaru Puzzle Book & Naval Chart Solitaire'
    },
    coinPrice: 'FREE PLAY'
  },
  {
    id: 'mastermind',
    year: 1971,
    yearDisplay: '1971',
    yearIcon: '🧠',
    system: 'ibm_pc',
    systemName: { nl: 'Invicta Games / Jumbo (1971)', en: 'Invicta Games / Jumbo (1971)' },
    genre: 'puzzle',
    genreName: { nl: 'Logische Codebreker / Mastermind', en: 'Logic Codebreaker / Mastermind' },
    category: 'brain_logic',
    categoryName: { nl: 'Denksport, Bord- & Logica', en: 'Brain, Board & Logic' },
    title: 'MASTERMIND',
    subtitle: { nl: 'De Legendarische Kleuren-Codekraker & Deductie Klassieker', en: 'The Iconic Color Codebreaker & Logic Deduction Classic' },
    creator: 'Mordecai Meirowitz (1970) • Invicta Plastics & Jumbo',
    cabinetTheme: {
      primaryColor: '#f59e0b',
      secondaryColor: '#d97706',
      neonColor: '#fbbf24',
      glowBorder: 'rgba(245, 158, 11, 0.6)',
      accentBg: 'from-amber-950 via-stone-900 to-black',
      textColor: 'text-amber-400',
      marqueeBg: 'bg-amber-950'
    },
    summary: {
      nl: 'De ultieme logische deductie- en codekrakerklassieker! In 1970 uitgevonden door Mordecai Meirowitz, uitgegeven door Invicta Plastics en in Nederland immens populair gemaakt door Jumbo. Kraak de geheime kleurencombinatie achter het schildje met behulp van tactische feedbackpinnetjes (zwart voor juiste kleur én plek, wit voor juiste kleur op verkeerde plek). Met klassieke 4-pions en Super Mastermind 5-pions modus, instelbare duplicaten, procedurele chiptunes en lokale Hall of Fame!',
      en: 'The definitive color codebreaker and deductive logic classic! Conceived in 1970 by Mordecai Meirowitz, manufactured by Invicta Plastics, and distributed across Europe by Jumbo. Crack the secret color sequence hidden behind the shield using feedback clue pins (black for exact position and color, white for right color on the wrong slot). Features both Classic 4-peg and Super Mastermind 5-peg modes, customizable duplicate rules, procedural chiptunes, and local Hall of Fame!'
    },
    highlights: {
      nl: [
        'Klassieke 4-Pions modus (6 kleuren, 10 beurten) en Deluxe Super Mastermind (5 pionnen, 8 kleuren, 12 beurten)',
        'Authentieke tactiele plastic vintage speelbord-uitstraling met verborgen schildkap en klikkende pinnen',
        'Zwarte en witte evaluatiepinnetjes met instant hoorbare chiptune-synthese voor supersnelle deductie',
        'Slimme deductiehints (-1000pt straf), carrièrestatistieken (winrate, streaks) en lokale topscores met recorddatums'
      ],
      en: [
        'Classic 4-Peg mode (6 colors, 10 turns) plus Deluxe Super Mastermind (5 pegs, 8 colors, 12 turns)',
        'Authentic tactile vintage plastic board aesthetic with sliding secret shield and snap sockets',
        'Black and white clue pins with immediate Web Audio chiptune feedback for rapid logic deduction',
        'Smart deductive hints (-1000pt penalty), career statistics (win rates, streaks), and local hall of fame with dates'
      ]
    },
    specs: {
      resolution: '4-Slot / 5-Slot Deduction Grid',
      fps: '60 FPS Tactile Desk Loop',
      soundChip: 'Web Audio Procedural Peg Clicks & Win Fanfare',
      media: 'Invicta Plastics Tabletop Board Game'
    },
    coinPrice: 'FREE PLAY'
  },
  {
    id: 'patience',
    year: 1990,
    yearDisplay: '1990',
    yearIcon: '🃏',
    system: 'dos_pc',
    systemName: { nl: 'PC Windows / DOS', en: 'PC Windows / DOS' },
    genre: 'puzzle',
    genreName: { nl: 'Kaartspel / Denksport', en: 'Card Game / Logic' },
    category: 'card_games',
    categoryName: { nl: 'PC Kaartspellen & Solitaire', en: 'PC Card Games & Solitaire' },
    title: 'PATIENCE (SOLITAIRE)',
    subtitle: { nl: 'Het Legendarische Windows 95 / 3.0 Kaartspel', en: 'The Legendary Windows 95 / 3.0 Card Game' },
    creator: 'Wes Cherry • Susan Kare • Microsoft',
    cabinetTheme: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      neonColor: '#34d399',
      glowBorder: 'rgba(16, 185, 129, 0.6)',
      accentBg: 'from-emerald-950 via-teal-900 to-black',
      textColor: 'text-emerald-400',
      marqueeBg: 'bg-emerald-950'
    },
    summary: {
      nl: 'Het meest gespeelde kaartspel in de geschiedenis van personal computing! In de zomer van 1989 geprogrammeerd door Microsoft-stagiair Wes Cherry, met iconische pixel-illustraties van Susan Kare (bekend van het strand met de palmboom en het spookkasteel). Meegeleverd vanaf Windows 3.0 (1990) en Windows 95 om de wereld spelenderwijs te leren slepen en neerzetten (drag-and-drop) met de muis. Inclusief 1-kaart, 2-kaarten (populaire Nederlandse keukentafel-huisregel) en 3-kaarten trekmodus, onbeperkt ongedaan maken, hints, automatische voltooiing en de legendarische stuiterende kaartenregen als overwinningsanimatie!',
      en: 'The most widely played card game in the history of personal computing! Programmed in summer 1989 by Microsoft intern Wes Cherry, with iconic pixel card artwork designed by Susan Kare (famous for the sunny palm tree beach and haunted castle card backs). Shipped natively in Windows 3.0 (1990) and Windows 95 to teach millions of users how to operate a computer mouse and drag-and-drop. Features Draw 1, Draw 2 (popular house rule), and Draw 3 modes, unlimited undo, smart hints, auto-complete, and the legendary bouncing card cascade victory animation!'
    },
    highlights: {
      nl: [
        'Klassieke Klondike Patience regels met 7 kolommen, 4 basisstapels, trek-1, trek-2 (huisregel) en trek-3',
        'Volledige ondersteuning voor zowel muis-slepen (drag-and-drop), snelklikken als dubbelklikken om direct op te ruimen',
        'Iconische Susan Kare kaartruggen (Strand met Palmboom, Spookkasteel, Hand met Azen, Robot, Smaragd Vilt)',
        'Authentieke Windows 95 stuiterende kaartenwaterval (bouncing cascade) bij winst met realistische zwaartekrachtfysica!'
      ],
      en: [
        'Classic Klondike Solitaire rules with 7 tableau columns, 4 suit foundations, Draw 1, Draw 2 (house rule), and Draw 3',
        'Seamless support for mouse drag-and-drop, fast clicking, and double-click / double-tap to quickly send cards to foundation',
        'Iconic Susan Kare card backs (Palm Tree Beach, Haunted Castle, Hand with Aces, Robot, Emerald Velvet)',
        'Authentic Windows 95 bouncing card cascade victory animation with realistic gravity physics!'
      ]
    },
    specs: {
      resolution: '52-Card Klondike Layout',
      fps: '60 FPS Tactile Card Loop',
      soundChip: 'Web Audio Card Flips, Foundation Chimes & Fanfare',
      media: 'Microsoft Windows 3.0 / 95 System App'
    },
    coinPrice: 'FREE PLAY'
  },
  {
    id: 'hearts',
    year: 1992,
    yearDisplay: '1992',
    yearIcon: '❤️',
    system: 'dos_pc',
    systemName: { nl: 'PC Windows / DOS', en: 'PC Windows / DOS' },
    genre: 'puzzle',
    genreName: { nl: 'Kaartspel / Strategie', en: 'Card Game / Strategy' },
    category: 'card_games',
    categoryName: { nl: 'PC Kaartspellen & Solitaire', en: 'PC Card Games & Solitaire' },
    title: 'HARTENJAGEN (HEARTS)',
    subtitle: { nl: 'The Microsoft Hearts Network (Windows 3.11 / 95)', en: 'The Microsoft Hearts Network (Windows 3.11 / 95)' },
    creator: 'Microsoft Corporation • Michele, Ben & Paul',
    cabinetTheme: {
      primaryColor: '#ef4444',
      secondaryColor: '#b91c1c',
      neonColor: '#f87171',
      glowBorder: 'rgba(239, 68, 68, 0.6)',
      accentBg: 'from-red-950 via-emerald-950 to-black',
      textColor: 'text-red-400',
      marqueeBg: 'bg-red-950'
    },
    summary: {
      nl: 'De ultieme multiplayer kantoorklassieker van Microsoft! Uitgebracht in het najaar van 1992 bij Windows for Workgroups 3.11 en later meegeleverd met Windows 95 om de kracht van kantoornetwerken (LAN) te tonen. Neem plaats aan de iconische groene vilttafel tegen de drie legendarische computergestuurde tegenspelers: Michele (West), Ben (Noord) en Paul (Oost). Geef strategisch 3 kaarten door (links, rechts, oversteken of niet), ontwijk strafpunten van de Harten (1 pt) en de gevreesde Schoppenvrouw (13 pt), of waag de ultieme gok: "De Maan Schieten" (Shoot the Moon)!',
      en: 'The ultimate multiplayer office classic by Microsoft! Shipped in autumn 1992 with Windows for Workgroups 3.11 and later bundled natively with Windows 95 to demonstrate local area networking. Sit down at the iconic green felt table against the three legendary AI opponents: Michele (West), Ben (North), and Paul (East). Pass 3 cards strategically (left, right, across, or hold), evade penalty points from Hearts (1 pt) and the feared Queen of Spades (13 pt), or pull off the daring triumph: "Shoot the Moon"!'
    },
    highlights: {
      nl: [
        'Volledige 4-speler slag-engine tegen de klassieke Windows 95 bots: Michele, Ben en Paul',
        'Vier doorgifte-fasen: naar links, naar rechts, oversteken en geen doorgifte',
        'Strikte spelregels: uitkomen met Klaveren 2 (♣2), bekennen, harten breken en Schoppenvrouw (♠Q)',
        'Legendarische "De Maan Schieten" (Shoot the Moon) triomf met triomfantelijke fanfare!'
      ],
      en: [
        'Full 4-player trick-taking engine against classic Windows 95 bots: Michele, Ben, and Paul',
        'Four passing phases: Pass Left, Pass Right, Pass Across, and Hold (No Pass)',
        'Strict rules: Must lead 2 of Clubs (♣2), follow suit, broken hearts mechanics, and Queen of Spades (♠Q)',
        'Legendary "Shoot the Moon" victory mechanic with orchestral brass fanfare!'
      ]
    },
    specs: {
      resolution: '4-Player Trick Arena Layout',
      fps: '60 FPS Tactile Card Loop',
      soundChip: 'Web Audio Queen of Spades Sting & Moon Fanfare',
      media: 'The Microsoft Hearts Network (Windows 3.11 / 95)'
    },
    coinPrice: 'FREE PLAY'
  },
  {
    id: 'freecell',
    year: 1991,
    yearDisplay: '1991',
    yearIcon: '🃏',
    system: 'dos_pc',
    systemName: { nl: 'PC Windows / DOS', en: 'PC Windows / DOS' },
    genre: 'puzzle',
    genreName: { nl: 'Kaartspel / Logica', en: 'Card Game / Logic' },
    category: 'card_games',
    categoryName: { nl: 'PC Kaartspellen & Solitaire', en: 'PC Card Games & Solitaire' },
    title: 'FREECELL',
    subtitle: { nl: 'Het Legendarische Wiskundige Windows Solitaire (1991)', en: 'The Legendary Mathematical Windows Solitaire (1991)' },
    creator: 'Paul Alan Schultz • Microsoft Corporation',
    cabinetTheme: {
      primaryColor: '#10b981',
      secondaryColor: '#047857',
      neonColor: '#34d399',
      glowBorder: 'rgba(16, 185, 129, 0.6)',
      accentBg: 'from-emerald-950 via-slate-900 to-black',
      textColor: 'text-emerald-400',
      marqueeBg: 'bg-emerald-950'
    },
    summary: {
      nl: 'Het beroemdste wiskundige solitaire-kaartspel ter wereld! Ontwikkeld in 1991 door Paul Alan Schultz en meegeleverd met het Microsoft Entertainment Pack en Windows 95. In tegenstelling tot Patience liggen bij FreeCell alle 52 kaarten direct open op tafel verdeeld over 8 kolommen. Gebruik de 4 vrije parkeervakken (Free Cells) om kaarten tijdelijk te parkeren en bouw alle 4 basisstapels op van Aas t/m Koning. Inclusief de authentieke historische Microsoft spelnummers #1 t/m #32.000, inclusief de legendarische onoplosbare uitdaging #11982!',
      en: 'The world\'s most famous mathematical solitaire game! Created in 1991 by Paul Alan Schultz and bundled with the Microsoft Entertainment Pack and Windows 95. Unlike Klondike, all 52 cards are dealt face up across 8 columns. Use the 4 temporary storage cells to manoeuvre cards and build foundations from Ace to King. Features authentic Microsoft game deals #1 to #32,000, including the legendary unsolvable deal #11982!'
    },
    highlights: {
      nl: [
        'Authentieke Microsoft PRNG-generator voor alle historische spelnummers #1 t/m #32.000',
        '4 Vrije Parkeervakken (Free Cells) voor strategische kaartmanoeuvres',
        'Inclusief de beroemde onoplosbare uitdaging Spel #11982',
        'Automatisch afmaken, slimme hints, stap terug en uitgebreide statistieken'
      ],
      en: [
        'Authentic Microsoft PRNG deck generator for all historic game numbers #1 to #32,000',
        '4 Free Cells for tactical card maneuvers',
        'Includes the famous unsolvable challenge Deal #11982',
        'Auto-complete, smart hints, undo moves, and detailed win-rate statistics'
      ]
    },
    specs: {
      resolution: '8 Cascade Columns + 4 Free Cells',
      fps: '60 FPS Tactile Card Drag & Tap',
      soundChip: 'Web Audio Card FX & Win Fanfare',
      media: 'Microsoft Entertainment Pack / Windows 95'
    },
    coinPrice: 'FREE PLAY'
  },
  {
    id: 'spider_solitaire',
    year: 1998,
    yearDisplay: '1998',
    yearIcon: '🕷️',
    system: 'ibm_pc',
    systemName: { nl: 'Windows 98 Plus! & XP', en: 'Windows 98 Plus! & XP' },
    genre: 'puzzle',
    genreName: { nl: 'Kaartspel / Solitaire', en: 'Card Game / Solitaire' },
    category: 'card_games',
    categoryName: { nl: 'PC Kaartspellen & Solitaire', en: 'PC Card Games & Solitaire' },
    title: 'SPIDER SOLITAIRE',
    subtitle: { nl: 'De Koning der Geduldspellen met 104 Kaarten & 10 Kolommen', en: 'The King of Patience with 104 Cards & 10 Columns' },
    creator: 'Microsoft • John A. Blackall (Plus! 98 / Windows XP)',
    cabinetTheme: {
      primaryColor: '#0ea5e9',
      secondaryColor: '#0284c7',
      neonColor: '#38bdf8',
      glowBorder: 'rgba(14, 165, 233, 0.6)',
      accentBg: 'from-sky-950 via-slate-900 to-black',
      textColor: 'text-sky-400',
      marqueeBg: 'bg-sky-950'
    },
    summary: {
      nl: 'Het meest verslavende solitaire-kaartspel ooit gemaakt voor de pc! Gelanceerd in het Microsoft Plus! 98 pakket en ongekend populair geworden in Windows XP. Met 2 volledige kaartspellen (104 kaarten) en 10 kolommen op het tableau moet je complete reeksen van Koning tot en met Aas in dezelfde kleur verzamelen om ze weg te spelen. Speelbaar op 3 niveaus: 1 kleur (schoppen - ontspannend), 2 kleuren (schoppen & harten - tactisch) of 4 kleuren (expert hersenkraker). Inclusief onbeperkt ongedaan maken, tactische hints en high score tracking.',
      en: 'The most addictive solitaire game ever crafted for Windows! First bundled with Microsoft Plus! 98 and popularized globally in Windows XP. Using 2 full decks (104 cards) across 10 tableau columns, assemble descending runs from King down to Ace of the same suit to clear them. Features 3 distinct skill levels: 1 Suit (Spades - relaxing), 2 Suits (tactical challenge), or 4 Suits (expert mastery). Complete with unlimited undo, strategic hints, and local record tracking.'
    },
    highlights: {
      nl: [
        '3 Speelniveaus: 1 Kleur (Eenvoudig), 2 Kleuren (Gemiddeld) & 4 Kleuren (Grootmeester)',
        '10 Kolommen tableau met 104 kaarten en 5 reserve-deals uit de voorraadstapel',
        'Stap terug (Undo), slimme hint-assistentie en automatische kaartverplaatsing',
        'Volledige statistieken: winstpercentage, minste zetten, toptijden en records'
      ],
      en: [
        '3 Difficulty tiers: 1 Suit (Casual), 2 Suits (Medium), and 4 Suits (Grandmaster)',
        '10 Tableau cascades holding 104 cards with 5 reserve stock deals',
        'Undo support, intelligent hints, and responsive tap-to-move interactions',
        'Complete statistics: win percentage, least moves, best times, and high scores'
      ]
    },
    specs: {
      resolution: '10 Tableau Columns (104 Cards / 2 Decks)',
      fps: '60 FPS Smooth Card Physics',
      soundChip: 'Procedural Web Audio Dealing & Fanfares',
      media: 'Microsoft Plus! 98 / Windows XP'
    },
    coinPrice: 'FREE PLAY'
  },
  {
    id: 'klaverjassen',
    year: 1985,
    yearDisplay: 'Klassiek / 1985',
    yearIcon: '♣️',
    system: 'dos_pc',
    systemName: { nl: 'Nederlands Café Klassieker / MS-DOS', en: 'Dutch Café Classic / MS-DOS' },
    genre: 'puzzle',
    genreName: { nl: 'Troef- & Slagenspel', en: 'Trick-Taking Partnership' },
    category: 'card_games',
    categoryName: { nl: 'PC Kaartspellen & Solitaire', en: 'PC Card Games & Solitaire' },
    title: 'KLAVERJASSEN',
    subtitle: { nl: 'Amsterdams & Rotterdams met Troefkeuze, Roem en Slimme AI-Maat', en: 'Amsterdam & Rotterdam rules with Trumps, Melds and Smart AI Partner' },
    creator: 'Nederlandse Traditie (1890) • Digitale Recreatie',
    cabinetTheme: {
      primaryColor: '#f59e0b',
      secondaryColor: '#d97706',
      neonColor: '#fbbf24',
      glowBorder: 'rgba(245, 158, 11, 0.6)',
      accentBg: 'from-amber-950 via-slate-900 to-black',
      textColor: 'text-amber-400',
      marqueeBg: 'bg-amber-950'
    },
    summary: {
      nl: 'Hét nationale kaartspel van Nederland, digitaal tot leven gebracht aan een gezellige virtuele cafétafel! Speel samen met je partner Henk tegen het tegenspeler-duo Ingrid & Jan. Ondersteunt zowel het Amsterdamse systeem (niet verplicht overtroeven als je maat de slag heeft) als het Rotterdamse systeem (altijd verplicht overtroeven). Bied op de troefkleur of pas door, verzamel roem (driekaart 20, vierkaart 50, stuk 20) en behaal meer dan de helft van de 162 punten om te voorkomen dat je nat gaat!',
      en: 'The quintessential Dutch trick-taking card game, brought to life on a cozy digital pub table! Play in partnership with teammate Henk against rivals Ingrid & Jan. Fully supports both the Amsterdam variant (no undertrumping needed when partner leads) and Rotterdam variant (strict overtrumping mandatory). Choose the trump suit, score bonus melds (sequences, four-of-a-kind, Stuk), and conquer the 162-point threshold!'
    },
    highlights: {
      nl: [
        'Volledige ondersteuning voor zowel Amsterdams als Rotterdams speelsysteem',
        'Automatische herkenning en puntentelling van Roem (20, 50, 100, Stuk 20)',
        'Slimme AI-maat die seint, meeloopt en troeven aftelt',
        'Boompje van 16 bomen (of snelle ronde van 4) met boeteberekening bij nat gaan'
      ],
      en: [
        'Comprehensive support for both Amsterdam and Rotterdam rule variations',
        'Automatic detection and tallying of Meld points (20, 50, 100, Stuk 20)',
        'Smart AI partner with signalling heuristics, suit-counting, and trump management',
        '16-round tree (Boompje) or quick 4-round match with wet/nat penalties'
      ]
    },
    specs: {
      resolution: '4-Player Table (32 Dutch Piquet Cards)',
      fps: '60 FPS Tactile Slag & Roem Animations',
      soundChip: 'Procedural Pub Audio & Victory Chimes',
      media: 'Dutch Card Tradition / MS-DOS Re-engineering'
    },
    coinPrice: 'FREE PLAY'
  },
  {
    id: 'blackjack',
    year: 1962,
    yearDisplay: '1962 / Vegas',
    yearIcon: '♠️',
    system: 'ibm_pc',
    systemName: { nl: 'Casino Tafel / PC Solitaire', en: 'Casino Felt Table / PC Solitaire' },
    genre: 'puzzle',
    genreName: { nl: 'Casino Kaartspel / 21', en: 'Casino Card Game / 21' },
    category: 'card_games',
    categoryName: { nl: 'PC Kaartspellen & Solitaire', en: 'PC Card Games & Solitaire' },
    title: 'BLACKJACK / 21',
    subtitle: { nl: 'De Koning van Las Vegas met Splitsen, Dubbelen, Verzekering & Basisstrategie', en: 'The King of Las Vegas with Split, Double Down, Insurance & Basic Strategy' },
    creator: 'Edward O. Thorp & Vegas Casino Traditie (1931/1962)',
    cabinetTheme: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      neonColor: '#34d399',
      glowBorder: 'rgba(16, 185, 129, 0.6)',
      accentBg: 'from-emerald-950 via-slate-900 to-black',
      textColor: 'text-emerald-400',
      marqueeBg: 'bg-emerald-950'
    },
    summary: {
      nl: 'De onbetwiste koning van de casinotafel! Neem plaats aan de met groen vilt beklede blackjacktafel en neem het op tegen de bank (de dealer). Het doel: behaal met je kaarten een puntentotaal zo dicht mogelijk bij de 21 zonder erboven te gaan. Bied met authentieke fiches (€5 tot €1.000), vraag een extra kaart (Hit), pas op tijd (Stand), verdubbel je inzet (Double Down) bij een sterke 10 of 11, of splits gelijke kaarten in twee afzonderlijke handen. Natuurlijke Blackjack (Aas + 10-kaart) betaalt 3:2 uit! Inclusief wiskundig verantwoorde basisstrategie-tabel, verzekering en statistieken.',
      en: 'The undisputed king of the casino tables! Take your seat at the rich green felt blackjack table and go head-to-head against the house dealer. Your goal: get your card total as close to 21 as possible without exceeding it. Place authentic casino chips ($5 to $1,000), hit for extra cards, stand when strong, double down on 10 or 11, or split matching pairs into two independent hands. Natural Blackjack pays 3:2! Complete with mathematical basic strategy guide, insurance offers, and bankroll tracking.'
    },
    highlights: {
      nl: [
        'Volledige Las Vegas Strip regels: Dealer past verplicht op 17, Blackjack betaalt 3:2',
        'Splitsen (Split) van paren en Verdubbelen (Double Down) bij gunstige startkaarten',
        'Verzekering (Insurance) tegen dealer Azen en overzichtelijke Soft/Hard handtelling',
        'Uitgebreide wiskundige basisstrategie-tabel en bankroll tracking in de Hall of Fame'
      ],
      en: [
        'Authentic Vegas Strip rules: Dealer stands on 17, Natural Blackjack pays 3:2',
        'Split pairs into two hands & Double Down on favorable starting totals',
        'Insurance against dealer Aces with automatic Soft/Hard Ace counting',
        'Complete mathematical basic strategy table and Hall of Fame bankroll tracker'
      ]
    },
    specs: {
      resolution: 'Vegas 6-Deck Shoe (312 Cards / Cut Card)',
      fps: '60 FPS Tactile Card & Chip Animations',
      soundChip: 'Procedural Web Audio Chips, Flips & Fanfares',
      media: 'Casino Table Classic / PC Re-engineering'
    },
    coinPrice: 'FREE PLAY'
  },
  {
    id: 'bridge',
    year: 1925,
    yearDisplay: '1925 / Club',
    yearIcon: '♠️',
    system: 'ibm_pc',
    systemName: { nl: 'Bridge Club Tafel / PC Denksport', en: 'Bridge Club Felt Table / PC Mind Sport' },
    genre: 'puzzle',
    genreName: { nl: 'Denksport / Kaartspel', en: 'Mind Sport / Card Game' },
    category: 'card_games',
    categoryName: { nl: 'PC Kaartspellen & Solitaire', en: 'PC Card Games & Solitaire' },
    title: 'CONTRACT BRIDGE',
    subtitle: { nl: 'De Koning der Denksporten met Biedbox, 5-Kaart Hoog, Honneurpunten & Dummy Afspelen', en: 'The King of Mind Sports with Bidding Box, 5-Card Majors, HCP & Dummy Play' },
    creator: 'Harold Vanderbilt (1925) & Nederlandse Bridge Bond (NBB)',
    cabinetTheme: {
      primaryColor: '#f59e0b',
      secondaryColor: '#d97706',
      neonColor: '#fbbf24',
      glowBorder: 'rgba(245, 158, 11, 0.6)',
      accentBg: 'from-amber-950 via-slate-900 to-black',
      textColor: 'text-amber-400',
      marqueeBg: 'bg-amber-950'
    },
    summary: {
      nl: 'De absolute koning der denksporten! Neem plaats aan de met klassiek groen laken beklede bridgetafel en speel samen met je partner Henk (Noord) tegen het tegenstanders-duo Ingrid & Jan (Oost en West). Bepaal via de officiële Biedbox (1♣ t/m 7SA, Pas, Doublet en Redoublet) welk paar het contract wint volgens het 5-kaart hoog biedsysteem. Na de openingsuitkomst legt de Dummy (de Blinde) alle 13 kaarten open op tafel, waarna de Leider zowel de eigen hand als de Dummy bestuurt. Bevat automatische Honneurpunten-telling (A=4, K=3, Q=2, J=1), officiële duplicate bridge puntentelling, manchebonussen en een meesterstand!',
      en: 'The undisputed king of mind sports! Take your seat at the classic green felt bridge table and team up with partner Henk (North) against rivals Ingrid & Jan (East and West). Use the official Bidding Box (1♣ through 7NT, Pass, Double, and Redouble) to contest the auction using Standard 5-Card Majors. Following the opening lead, the Dummy spreads all 13 cards face-up for declarer to masterfully pilot. Features automated High Card Points evaluation (A=4, K=3, Q=2, J=1), official Duplicate Bridge scoring, game & slam bonuses, and Hall of Fame tracking!'
    },
    highlights: {
      nl: [
        'Volledig biedsysteem met 5-kaart hoog, 1SA (15-17 HCP) opening en officiële Biedbox',
        'Leider- en Dummy-mechaniek: bestuur zowel je eigen kaarten als de opengelegde dummy',
        'Officiële Duplicate Bridge puntentelling: Deelscores, Manches (+300/+500) en Slems',
        'Honneurpunten-indicator (HCP) en Meesterstand met historisch eerbetoon aan vaders'
      ],
      en: [
        'Complete bidding box auction with 5-card majors, 1NT (15-17 HCP), doubles & redoubles',
        'Declarer and Dummy play: pilot both your hand and the exposed dummy cards',
        'Official Duplicate Bridge scoring: Partscores, Game bonuses (+300/+500), and Slams',
        'High Card Point (HCP) evaluator and Hall of Fame honoring master bridge players'
      ]
    },
    specs: {
      resolution: '4-Player Table (52 Cards / Bidding Box)',
      fps: '60 FPS Tactile Card & Dummy Animations',
      soundChip: 'Procedural Felt Snaps, Clicks & Fanfares',
      media: 'Mind Sport Classic / Computer Bridge Re-engineering'
    },
    coinPrice: 'FREE PLAY'
  },
  {
    id: 'radarsoft_3d_ttt',
    year: 1984,
    yearDisplay: '1984',
    yearIcon: '🎲',
    system: 'c64',
    systemName: { nl: 'Commodore 64', en: 'Commodore 64' },
    genre: 'puzzle',
    genreName: { nl: '3D Denksport & Logica', en: '3D Mind Sport & Logic' },
    category: 'c64',
    categoryName: { nl: 'Commodore 64 Klassiekers', en: 'Commodore 64 Classics' },
    title: '3D TIC TAC TOE',
    subtitle: { 
      nl: 'Radarsoft’s debuutspel: 4×4×4 Qubic kubus met 76 winlijnen', 
      en: 'Radarsoft’s debut title: 4×4×4 Qubic cube with 76 winning lines' 
    },
    creator: 'Radarsoft (Cees Kramer & John Vanderaart)',
    cabinetTheme: {
      primaryColor: '#0284c7',
      secondaryColor: '#38bdf8',
      neonColor: '#00e5ff',
      glowBorder: 'border-cyan-500/50',
      accentBg: 'bg-cyan-950/70',
      textColor: 'text-cyan-300',
      marqueeBg: 'from-blue-950 via-cyan-950 to-slate-950'
    },
    summary: {
      nl: 'In het voorjaar van 1984 lanceerde het gloednieuwe Utrechtse softwarehuis Radarsoft (Cees Kramer & "Dr. John" Vanderaart) hun allereerste commerciële C64-release: 3D Tic Tac Toe! Geen simpel 3×3 spelletje, maar een volwaardige 4×4×4 Qubic kubus met 64 posities en maar liefst 76 verschillende winlijnen (48 axiaal, 24 vlak-diagonaal en 4 ruimtelijk 3D). Met authentieke C64 SID chiptune-audio, vrije 3D-rotatie, 4-lagige tactische weergave en een slimme AI op 3 niveaus.',
      en: 'In spring 1984, newly formed Dutch software powerhouse Radarsoft (Cees Kramer & "Dr. John" Vanderaart) published their inaugural commercial C64 title: 3D Tic Tac Toe! Rather than a trivial 3×3 grid, this is full 4×4×4 Qubic spanning 64 coordinates and 76 unique winning vectors (48 axial, 24 planar diagonal, and 4 space diagonals). Features authentic C64 SID chiptune synthesis, interactive 3D cube orbiting, 4-layer tactical boards, and 3-level AI.'
    },
    highlights: {
      nl: [
        'Volledige 4×4×4 Qubic kubus met realtime 3D-rotatie, zoom en camerahoeken',
        '76 geverifieerde winlijnen (48 axiaal, 24 vlakdiagonalen, 4 ruimtelijke hoofddiagonalen)',
        '4-laags tactisch overzicht (L1 t/m L4) met directe interactie en coördinaten',
        'Slimme C64 AI op 3 niveaus: Novice, Dr. John (Vorkheuristiek) en Grandmaster',
        'Volledige Commodore 64 SID 6581 sound-synthese en CRT phosphor scanlines'
      ],
      en: [
        'Complete 4×4×4 Qubic cube with real-time 3D orbit rotation, zoom, and preset angles',
        '76 mathematically verified winning lines (48 axial, 24 planar, 4 space diagonals)',
        '4-layer tactical board matrix (L1 to L4) with instant interactive move placement',
        'Intelligent C64 AI with 3 tiers: Novice, Dr. John (Fork heuristic), and Grandmaster',
        'Full MOS 6581 SID chiptune sound synthesis and authentic CRT phosphor scanlines'
      ]
    },
    specs: {
      resolution: '4×4×4 Qubic Cube (64 Positions / 4 Levels)',
      fps: '60 FPS 3D Orbit & CRT Raster',
      soundChip: 'MOS 6581 SID Procedural Synthesis',
      media: '1984 Radarsoft Debut C64 Cassette/Disk'
    },
    coinPrice: 'FREE PLAY'
  },
  {
    id: 'stratego',
    year: 1958,
    yearDisplay: '1958',
    yearIcon: '⚔️',
    system: 'ibm_pc',
    systemName: { nl: 'Bordspel & PC', en: 'Board Game & PC' },
    genre: 'puzzle',
    genreName: { nl: 'Tactische Oorlogsstrategie', en: 'Tactical Warfare & Bluff' },
    category: 'brain_logic',
    categoryName: { nl: 'Denksport, Bord- & Logica', en: 'Brain, Board & Logic' },
    title: 'STRATEGO',
    subtitle: { 
      nl: 'Nederlands meesterwerk van tactiek, bluf en Fog of War', 
      en: 'Dutch masterpiece of military tactics, bluff, and Fog of War' 
    },
    creator: 'Jacques Johan Mogendorff / Hausemann & Hötte (Jumbo)',
    cabinetTheme: {
      primaryColor: '#b45309',
      secondaryColor: '#f59e0b',
      neonColor: '#fbbf24',
      glowBorder: 'border-amber-500/50',
      accentBg: 'bg-amber-950/70',
      textColor: 'text-amber-300',
      marqueeBg: 'from-amber-950 via-red-950 to-slate-950'
    },
    summary: {
      nl: 'In 1947 bedacht de Nederlander Jacques Johan Mogendorff Stratego, waarna de befaamde Amsterdamse uitgever Jumbo (Hausemann & Hötte) het in 1958 perfectioneerde met de iconische houten torentjes en het slagveld met de twee meren. Voer het bevel over 40 pionnen (Maarschalk, Spion, Mineuren, Verkenners, Bommen en Vlag) in een duel van geheugen, bluf en Fog of War!',
      en: 'Invented in 1947 by Dutch creator Jacques Johan Mogendorff and perfected in 1958 by iconic Amsterdam publisher Jumbo, Stratego is the world-famous board game of military deception. Command an army of 40 pieces (Marshal, Spy, Miners, Scouts, Bombs, and Flag) on a 10×10 battlefield with central lakes under complete Fog of War!'
    },
    highlights: {
      nl: [
        'Volledig 10×10 Jumbo slagveld met de twee iconische meren en reliëf torentjes',
        'Volledige Fog of War: vijandelijke pionnen blijven geheim tot de strijd ontbrandt',
        'Alle klassieke regels: Spion verslaat Maarschalk, Mineur ontmantelt Bom, Verkenners snelle sprint',
        '5 Tactische opstellingspresets (Gebalanceerd, Fortress, Bluf, Mineuren Blitz) plus vrije opstelling',
        'Slimme tactische AI die niet spiekt en redeneert op basis van verkenningsinformatie'
      ],
      en: [
        'Authentic 10×10 Jumbo battlefield with dual central lakes and embossed wooden pieces',
        'True Fog of War: enemy ranks remain shrouded in secrecy until engaged in combat',
        'All official rules: Spy takes Marshal on attack, Miner defuses Bombs, Scouts long-range sprint',
        '5 Tactical setup formations (Balanced, Fortress, Bluff, Miner Blitz) plus custom piece swapping',
        'Intelligent Fog-of-War compliant AI that deduces your army purely from scouting intel'
      ]
    },
    specs: {
      resolution: '10×10 Vintage Board (80 Combat Pieces / 2 Lakes)',
      fps: '60 FPS Tactile Piece Animations',
      soundChip: 'Procedural Drum Rolls, Sword Clashes & Bugle Fanfares',
      media: '1947/1958 Jumbo Tabletop & Mind Sport Classic'
    },
    coinPrice: 'FREE PLAY'
  },
  {
    id: 'kamertje_verhuren',
    year: 1895,
    yearDisplay: '1895 / Schrift',
    yearIcon: '📐',
    system: 'dos_pc',
    systemName: { nl: 'Ruitjespapier & Balpen', en: 'Graph Paper & Pen' },
    genre: 'puzzle',
    genreName: { nl: 'Denksport & Wiskunde', en: 'Logic & Mathematics' },
    category: 'brain_logic',
    categoryName: { nl: 'Denksport, Bord- & Logica', en: 'Brain, Board & Logic' },
    title: 'KAMERTJE VERHUREN',
    subtitle: { 
      nl: 'De legendarische ruitjespapier klassieker met balpen & kettingreacties', 
      en: 'The iconic graph paper dots-and-boxes school classic with pen & chain combos' 
    },
    creator: 'Édouard Lucas (1895) / Ruitjesschrift Traditie',
    cabinetTheme: {
      primaryColor: '#d97706',
      secondaryColor: '#f59e0b',
      neonColor: '#2563eb',
      glowBorder: 'border-amber-500/50',
      accentBg: 'bg-amber-950/70',
      textColor: 'text-amber-300',
      marqueeBg: 'from-amber-950 via-slate-900 to-blue-950'
    },
    summary: {
      nl: 'Kamertje Verhuren (internationaal bekend als Dots and Boxes of La Pipopipette) is de ultieme schoolbanken-klassieker, getekend met balpen op geruit wiskundepapier. Spelers trekken om de beurt een lijntje tussen twee stippen; wie het vierde lijntje van een vierkantje voltooit, claimt het kamertje, scoort een punt en mag direct NOG een beurt doen. Wat begint als een onschuldig spelletje ontaardt in diepgaande combinatorische wiskunde met gigantische kettingreacties en de befaamde dubbele-weggeefzet!',
      en: 'Kamertje Verhuren (internationally known as Dots and Boxes or La Pipopipette) is the quintessential school notebook classic drawn with ballpoint pens on graph paper. Conceived in 1895 by French mathematician Édouard Lucas, players take turns connecting adjacent dots; closing the fourth side of a square claims the box, scores a point, and grants an immediate extra turn, opening thrilling chain reactions and combinatorial strategy!'
    },
    highlights: {
      nl: [
        'Authentieke ruitjespapier & collegeblok esthetiek met blauwe en rode balpen-inkt',
        '3×3 t/m 6×6 rasters met realistische krasgeluiden en kettingreactie-combos',
        'Intelligente AI (Klasgenoot, Wiskundedocent & Édouard Lucas met de Dubbele-Weggeefzet)',
        'Volledige wiskundige speltheorie-gids (John Conway Nimstring analyse & schoolherinneringen)',
        'Pass & Play voor 2 spelers én solo tegen de computer'
      ],
      en: [
        'Authentic graph paper notebook aesthetic with royal blue and crimson ballpoint ink',
        '3×3 to 6×6 grid sizes with tactile pen scratch audio and chain combo streaks',
        '3-tier AI (Schoolmate, Math Teacher & Édouard Lucas with Double-Cross sacrifice logic)',
        'Complete combinatorial game theory dossier (John Conway Nimstring & classroom nostalgia)',
        '2-Player Pass & Play mode and solo challenge vs computer'
      ]
    },
    specs: {
      resolution: 'Geruit Wiskundeschrift (3×3 t/m 6×6 Rasters)',
      fps: '60 FPS Vloeiende Balpen-Inkt Animaties',
      soundChip: 'Procedurale Bic Balpen-Krasjes & Ketting-Chimes',
      media: 'Édouard Lucas (1895) / Ruitjespapier Klassieker'
    },
    coinPrice: 'FREE PLAY'
  },
  {
    id: 'connect_four',
    year: 1974,
    yearDisplay: '1974',
    yearIcon: '🟡',
    system: 'arcade',
    systemName: { nl: 'MB Klassieker', en: 'Milton Bradley Classic' },
    genre: 'puzzle',
    genreName: { nl: 'Brein & Strategie', en: 'Brain & Strategy' },
    category: 'brain_logic',
    categoryName: { nl: 'Bordspellen & Logica', en: 'Board & Logic' },
    title: 'VIER OP EEN RIJ',
    subtitle: { nl: 'Het Legendarische Kunststof Speelraam', en: 'The Legendary Vertical Drop Game' },
    creator: 'Milton Bradley (MB) • Howard Wexler & Ned Strongin',
    cabinetTheme: {
      primaryColor: '#2563eb',
      secondaryColor: '#1d4ed8',
      neonColor: '#60a5fa',
      glowBorder: 'rgba(37, 99, 235, 0.4)',
      accentBg: 'from-blue-950 via-slate-900 to-black',
      textColor: 'text-blue-400',
      marqueeBg: 'bg-blue-900/60'
    },
    summary: {
      nl: 'Het iconische verticale blauwe speelraam uit 1974! Laat je rode fiches vallen, blokkeer de C64 AI en maak als eerste 4 op een rij horizontaal, verticaal of diagonaal.',
      en: 'The iconic 1974 vertical blue plastic drop grid! Drop your red tokens, outsmart the C64 AI and connect 4 in a row horizontally, vertically or diagonally.'
    },
    highlights: {
      nl: [
        'Authentiek blauw plastic speelraam met rode en gele fiches',
        'Iconische gele schuifbalk onderaan om alle fiches te laten vallen',
        'Slimme C64 AI met Minimax Alpha-Beta Pruning (3 niveaus)'
      ],
      en: [
        'Authentic blue plastic drop grid with red and yellow tokens',
        'Iconic bottom slider release lever to drop tokens with rattle sounds',
        'Smart C64 AI with Minimax Alpha-Beta Pruning engine'
      ]
    },
    specs: {
      resolution: '7×6 Vertical Grid (42 Holes)',
      fps: '60.0 FPS Fixed Physics Loop',
      soundChip: 'PSG Web Audio Chip Generator',
      media: 'Milton Bradley 1974 Cabinet'
    },
    coinPrice: '1 Coin / Play'
  },
  {
    id: 'hangman',
    year: 1894,
    yearDisplay: '1894',
    yearIcon: '✍️',
    system: 'apple_ii',
    systemName: { nl: 'Collegeblok Ruitjespapier', en: 'Grid Math Notepad' },
    genre: 'puzzle',
    genreName: { nl: 'Woordpuzzel & Taalkunde', en: 'Word Puzzle & Vocabulary' },
    category: 'brain_logic',
    categoryName: { nl: 'Bordspellen & Logica', en: 'Board & Logic' },
    title: 'GALGJE OP RUITJESPAPIER',
    subtitle: { nl: 'Klassiek Ruitjesschrift Woordraadspel', en: 'Classic Paper & Pencil Word Guessing Game' },
    creator: 'Traditioneel Papier- & Pen Spel • Woordenboek Edities',
    cabinetTheme: {
      primaryColor: '#0284c7',
      secondaryColor: '#0369a1',
      neonColor: '#38bdf8',
      glowBorder: 'rgba(2, 132, 199, 0.4)',
      accentBg: 'from-sky-950 via-slate-900 to-black',
      textColor: 'text-sky-400',
      marqueeBg: 'bg-sky-900/60'
    },
    summary: {
      nl: 'Het geliefde klaslokaal spel op geruit wiskundepapier! Raad letters in de uitgebreide Nederlandse en Engelse woordenschat met 4 moeilijkheidsgraden, hints en balpen krasgeluiden.',
      en: 'The beloved classroom paper-and-pencil game on grid paper! Guess letters across massive Dutch and English dictionaries with 4 difficulty tiers, category hints, and ballpoint ink animations.'
    },
    highlights: {
      nl: [
        'Uitgebreide Nederlandse & Engelse woordenschat (4 moeilijkheidsgraden)',
        'Authentieke balpen inkt tekenanimaties van de galg op ruitjespapier',
        'Handige categorie hints en 2-speler Paspas & Speel modus'
      ],
      en: [
        'Massive bilingual dictionary in Dutch & English across 4 difficulty levels',
        'Authentic hand-drawn ballpoint ink hangman animations on graph paper',
        'Category hint reveal system and 2-player custom word creator'
      ]
    },
    specs: {
      resolution: 'Geruit Wiskundeschrift (Collegeblok Layout)',
      fps: '60 FPS Vloeiende Inkt-Animate Loops',
      soundChip: 'Procedurale Balpen Kras & Papier Web Audio API',
      media: 'Traditioneel Papier & Potlood Spel (1894)'
    },
    coinPrice: '1 Coin / Play'
  }
];

export const LOBBY_TRANSLATIONS = {
  nl: {
    badge: 'RETRO ARCADE VAULT',
    activeGamesBadge: '72 SPEELBARE TITELS • FREE PLAY',
    headerSub: '',
    mainTitle: 'De Ultieme Retro Speelhal',
    mainDesc: 'Stap binnen in de gouden eeuw van videogames en klassieke denksporten (1895 – 2011). Speel 72 iconische meesterwerken, waaronder Kamertje Verhuren (het legendarische ruitjespapier & balpen-spel met kettingreacties & dubbele-weggeefzet), Stratego (1947/1958 Jumbo klassieker met 40 pionnen & Fog of War), Radarsoft 3D Tic Tac Toe (1984 C64 debuut met 4×4×4 Qubic & 76 winlijnen), Contract Bridge (met Biedbox, 5-Kaart Hoog & Dummy-spel), Blackjack / 21, Klaverjassen (Amsterdams & Rotterdams), Spider Solitaire (1, 2 & 4 kleuren), FreeCell (#1-32.000), Hartenjagen (Win95 Hearts), Patience (Solitaire), Mastermind, Zeeslag Solitaire, Sudoku, Galaga, Arkanoid, complete 10-game Game Boy bibliotheek, Apple II klassiekers, Spy Fox en pc-avonturen in authentieke resolutie, 60 FPS snelheid en originele chiptune-synthese.',
    
    // Views
    views: {
      floor: 'Speelhal Vloer (3D)',
      cards: 'Kasten Showcase',
      timeline: 'Tijdlijn 1972-2011'
    },
    viewsDesc: {
      floor: 'Wandel door de verlichte neon speelhal en bekijk de arcadekasten op de vloer.',
      cards: 'Gedetailleerde kasten met historische dossiers, simulaties en toprecords.',
      timeline: 'Chronologische tijdreis door de evolutie van arcade- en computertechnologie.'
    },

    // Filters
    filterLabel: 'Sorteer & Filter:',
    allCategories: 'Alle Categorieën',
    categoryCardGames: 'PC Kaartspellen & Solitaire',
    categoryArcade: 'Arcade Hal Klassiekers',
    categoryBrainLogic: 'Denksport, Bord- & Logica',
    categoryHandheld: 'Handheld & Game Boy',
    categoryAdventure: 'Grafische Avonturen (Sierra)',
    categoryC64: 'Commodore 64 Klassiekers',
    categorySpectrum: 'ZX Spectrum Klassiekers',
    categoryMobile: 'Mobile & iOS Games',
    allYears: 'Alle Jaartallen',
    allSystems: 'Alle Systemen',
    allGenres: 'Alle Genres',
    searchPlaceholder: 'Zoek op spelnaam, jaartal, ontwikkelaar of trefwoord...',
    randomGame: 'Willekeurige Kast',
    foundCount: 'kasten gevonden',

    // Cabinet card items
    playNow: 'SPEEL NU',
    insertCoin: 'INSERT COIN & PLAY',
    viewDossier: 'Dossier',
    topScore: 'RECORD',
    specsHeader: 'Hardware Specificaties',
    highlightsHeader: 'Kast Kenmerken',
    yearTag: 'JAAR',
    systemTag: 'SYSTEEM',
    genreTag: 'GENRE',
    categoryTag: 'CATEGORIE',

    // Ambient sound
    soundOn: 'Arcade Geluid Aan',
    soundOff: 'Arcade Geluid Stil',

    // Quick bar
    quickLaunch: 'Direct naar kast:',

    // Timeline section
    timelineEraTitle: 'Chronologische Tijdlijn van de Speelhal (1972 - 2011)',
    timelineEraDesc: 'Van de eerste discrete schakelingen in Pong tot baanbrekende 8-bit handhelds en 3D pc-engines.',

    // Upcoming votes
    upcomingTitle: 'Volgende Kasten in Ontwikkeling',
    upcomingDesc: 'Stem op welke klassieker als volgende aan onze speelhal moet worden toegevoegd!',
    voteBtn: 'Breng Stem Uit',
    votedThankYou: 'Bedankt voor je stem op',

    // Footer
    footerText: 'Retro Arcade Vault • Volledig responsief voor desktop, tablet en mobiele touchbediening.',
    leaderboardBtn: 'Globale Records'
  },
  en: {
    badge: 'RETRO ARCADE VAULT',
    activeGamesBadge: '71 PLAYABLE TITLES • FREE PLAY',
    headerSub: '',
    mainTitle: 'The Ultimate Retro Arcade Hall',
    mainDesc: 'Step into the golden age of video games and classic mind sports (1925 – 2011). Play 71 iconic masterpieces including Stratego (1947/1958 Jumbo classic with 40 pieces & Fog of War), Radarsoft 3D Tic Tac Toe (1984 C64 debut with 4×4×4 Qubic & 76 winning lines), Contract Bridge (with Bidding Box, 5-Card Majors & Dummy Play), Blackjack / 21, Klaverjassen (Amsterdam & Rotterdam rules), Spider Solitaire (1, 2 & 4 suits), FreeCell (#1-32,000), Hearts (The Microsoft Hearts Network), Patience (Solitaire), Mastermind, Battleship Solitaire, Sudoku, Galaga, Arkanoid, full 10-game Game Boy library, Apple II classics, Spy Fox and graphic adventures in authentic resolution, 60 FPS performance, and original synthesized chiptune audio.',

    // Views
    views: {
      floor: 'Arcade Floor (3D)',
      cards: 'Cabinet Showcase',
      timeline: 'Timeline 1972-2011'
    },
    viewsDesc: {
      floor: 'Stroll across the glowing neon arcade floor and inspect cabinets standing in line.',
      cards: 'Detailed cabinet showcases featuring rich history, simulations, and records.',
      timeline: 'Chronological voyage exploring the milestone evolution of arcade & home computers.'
    },

    // Filters
    filterLabel: 'Sort & Filter:',
    allCategories: 'All Categories',
    categoryCardGames: 'PC Card & Solitaire Games',
    categoryArcade: 'Arcade Hall Classics',
    categoryBrainLogic: 'Brain, Board & Logic Games',
    categoryHandheld: 'Handheld & Game Boy',
    categoryAdventure: 'Graphic Adventures (Sierra)',
    categoryC64: 'Commodore 64 Classics',
    categorySpectrum: 'ZX Spectrum Classics',
    categoryMobile: 'Mobile & iOS Games',
    allYears: 'All Years',
    allSystems: 'All Systems',
    allGenres: 'All Genres',
    searchPlaceholder: 'Search by title, year, creator, or keyword...',
    randomGame: 'Random Cabinet',
    foundCount: 'cabinets found',

    // Cabinet card items
    playNow: 'PLAY NOW',
    insertCoin: 'INSERT COIN & PLAY',
    viewDossier: 'Dossier',
    topScore: 'RECORD',
    specsHeader: 'Hardware Specifications',
    highlightsHeader: 'Cabinet Highlights',
    yearTag: 'YEAR',
    systemTag: 'SYSTEM',
    genreTag: 'GENRE',
    categoryTag: 'CATEGORY',

    // Ambient sound
    soundOn: 'Arcade Audio On',
    soundOff: 'Arcade Audio Mute',

    // Quick bar
    quickLaunch: 'Jump to Cabinet:',

    // Timeline section
    timelineEraTitle: 'Chronological Arcade Timeline (1972 - 2011)',
    timelineEraDesc: 'From the first discrete logic gates in Pong to pioneering 8-bit handhelds and 3D PC engines.',

    // Upcoming votes
    upcomingTitle: 'Next Cabinets in Development',
    upcomingDesc: 'Vote for the next retro classic to be added to our Arcade Hall collection!',
    voteBtn: 'Cast Your Vote',
    votedThankYou: 'Thanks for your vote on',

    // Footer
    footerText: 'Retro Arcade Vault • Fully responsive for desktop, tablet, and mobile touch controls.',
    leaderboardBtn: 'Global Leaderboards'
  }
};
