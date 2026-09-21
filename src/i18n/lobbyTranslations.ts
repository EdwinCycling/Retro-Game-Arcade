export type Language = 'nl' | 'en';

export interface GameMetadata {
  id: 'pacman' | 'space_invaders' | 'donkey_kong' | 'demon_attack' | 'repton' | 'eindeloos' | 'frogger' | 'chuckie_egg' | 'frak' | 'arcadians' | 'rocket_raid' | 'qbert' | 'outrun' | 'tetris' | 'kings_quest' | 'space_quest' | 'pong' | 'battle_chess' | 'mario' | 'super_mario' | 'wolfenstein' | 'doom' | 'duke' | 'half_life' | 'c64_pinball' | 'temple_run' | 'lemmings' | 'manic_miner' | 'monster_maze' | 'asteroids' | 'prince' | 'double_dragon' | 'snake' | 'zaxxon' | 'exile';
  year: number;
  yearDisplay: string;
  yearIcon: string;
  system: 'bbc_micro' | 'arcade' | 'c64' | 'atari_2600' | 'ibm_pc' | 'mobile' | 'zx_spectrum' | 'zx81' | 'dos_pc';
  systemName: { nl: string; en: string };
  genre: 'space' | 'maze' | 'platform' | 'simulation' | 'puzzle' | 'adventure' | 'runner' | 'horror' | 'cinematic_platform' | 'beat_em_up' | 'snake' | 'racing' | 'physics_sandbox';
  genreName: { nl: string; en: string };
  category?: 'arcade' | 'adventure' | 'c64' | 'mobile' | 'spectrum' | 'zx81';
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
    category: 'arcade',
    categoryName: { nl: 'Arcade Hal', en: 'Arcade Hall' },
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
  }
];

export const LOBBY_TRANSLATIONS = {
  nl: {
    badge: 'RETRO ARCADE VAULT',
    activeGamesBadge: '35 KLASSIEKERS ACTIEF • FREE PLAY',
    headerSub: 'Gouden Tijdperk Retro Speelhal & PC Klassiekers • Atari Vector, Sinclair ZX81 & Spectrum, BBC Micro, C64, IBM PC, Amiga, Namco & iOS 3D',
    mainTitle: 'De Ultieme Retro Speelhal',
    mainDesc: 'Stap binnen in de gouden eeuw van videogames (1972 – 2011). Speel 35 iconische arcademeesterwerken, vector klassiekers, 3D games en grafische avonturen in authentieke resolutie, 60 FPS snelheid en originele geluidssynthese.',
    
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
    categoryArcade: 'Arcade Hal Klassiekers',
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
    timelineEraTitle: 'Chronologische Tijdlijn van de Speelhal (1978 - 1985)',
    timelineEraDesc: 'Van de eerste 8-bit discrete geluidscircuits in Japan tot baanbrekende 3D-fysica op Britse homecomputers.',

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
    activeGamesBadge: '35 CLASSICS IN VAULT • FREE PLAY',
    headerSub: 'Golden Era Retro Arcade Collection & PC Classics • Atari Vector, Sinclair ZX81 & Spectrum, BBC Micro, C64, IBM PC, Amiga, Namco & iOS 3D',
    mainTitle: 'The Ultimate Retro Arcade Hall',
    mainDesc: 'Step into the golden age of video games (1972 – 2011). Play 35 iconic arcade masterpieces, vector classics, 3D games and graphic adventures in authentic resolution, 60 FPS performance, and original synthesized chiptune audio.',

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
    categoryArcade: 'Arcade Hall Classics',
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
    timelineEraTitle: 'Chronological Arcade Timeline (1978 - 1985)',
    timelineEraDesc: 'From the first Japanese 8-bit discrete audio chips to pioneering 3D Newtonian physics on British microcomputers.',

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
