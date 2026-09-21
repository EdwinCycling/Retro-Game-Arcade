/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nintendo Game Boy (DMG-01 / 1989) Engine & Emulation Types
 */

export type GameBoyPaletteMode = 'dmg' | 'pocket' | 'light' | 'sgb';

export interface GameBoyPalette {
  id: GameBoyPaletteMode;
  name: string;
  colors: [string, string, string, string]; // [Lightest (0), Light (1), Dark (2), Darkest (3)]
  bgTint: string;
  bezelTint: string;
}

export const GAME_BOY_PALETTES: Record<GameBoyPaletteMode, GameBoyPalette> = {
  dmg: {
    id: 'dmg',
    name: 'DMG-01 Pea Soup (1989)',
    colors: ['#9bbc0f', '#8bac0f', '#306230', '#0f380f'],
    bgTint: '#8bac0f',
    bezelTint: '#7c9c0f'
  },
  pocket: {
    id: 'pocket',
    name: 'Game Boy Pocket B&W (1996)',
    colors: ['#c4cfa1', '#8b956d', '#4d533c', '#1f1f1f'],
    bgTint: '#b0bb8e',
    bezelTint: '#9ba579'
  },
  light: {
    id: 'light',
    name: 'Game Boy Light Indiglo (1998)',
    colors: ['#00ffcc', '#00b894', '#006266', '#002b2b'],
    bgTint: '#00ccaa',
    bezelTint: '#008b77'
  },
  sgb: {
    id: 'sgb',
    name: 'Super Game Boy Custom (1994)',
    colors: ['#f8e8b8', '#e09040', '#902040', '#201040'],
    bgTint: '#f0d8a0',
    bezelTint: '#b06030'
  }
};

export type GameBoyCartridgeId = 
  | 'mario_land' 
  | 'tetris_dmg' 
  | 'dr_mario'
  | 'dr_mario_gb' 
  | 'metroid_2'
  | 'metroid2_gb' 
  | 'kirby_dream_land'
  | 'kirby_gb' 
  | 'mario_land_2' 
  | 'zelda_links_awakening'
  | 'zelda_la_gb' 
  | 'donkey_kong_94' 
  | 'pokemon_red'
  | 'pokemon_red_gb' 
  | 'wario_land_2';

export interface GameBoyCartridgeInfo {
  id: GameBoyCartridgeId;
  title: string;
  year: number;
  developer: string;
  publisher: string;
  genre: string;
  code: string;
  icon: string;
  description: { nl: string; en: string };
  coverGradient: string;
  accentColor: string;
}

export const GAME_BOY_CARTRIDGES: Record<string, GameBoyCartridgeInfo> = {
  mario_land: {
    id: 'mario_land',
    title: 'Super Mario Land',
    year: 1989,
    developer: 'Nintendo R&D1 (Gunpei Yokoi & Satoru Okada)',
    publisher: 'Nintendo',
    genre: 'Platformer',
    code: 'DMG-ML-USA',
    icon: '🍄',
    description: {
      nl: 'Het legendarische lanceerspel voor de Game Boy in het koninkrijk Sarasaland met Daisy, Tatanga, Superball Mario en Egyptische sfinxen.',
      en: 'The legendary launch title for the Game Boy in Sarasaland with Daisy, Tatanga, Superball Mario, and Egyptian pyramids.'
    },
    coverGradient: 'from-amber-600 via-red-600 to-yellow-500',
    accentColor: '#f59e0b'
  },
  tetris_dmg: {
    id: 'tetris_dmg',
    title: 'Tetris (DMG Edition)',
    year: 1989,
    developer: 'Nintendo / Alexey Pajitnov / Bullet-Proof Software',
    publisher: 'Nintendo',
    genre: 'Puzzle',
    code: 'DMG-TR-USA',
    icon: '🧩',
    description: {
      nl: 'Het meest verkochte draagbare puzzelspel ooit. Inclusief A-Type marathon, B-Type challenge, Korobeiniki chiptune en de iconische raketlancering.',
      en: 'The best-selling portable puzzle game of all time. Features A-Type marathon, B-Type challenge, Korobeiniki chiptune, and the rocket launch.'
    },
    coverGradient: 'from-blue-600 via-indigo-700 to-purple-800',
    accentColor: '#3b82f6'
  },
  dr_mario: {
    id: 'dr_mario',
    title: 'Dr. Mario',
    year: 1990,
    developer: 'Nintendo R&D1 (Gunpei Yokoi & Takahiro Harada)',
    publisher: 'Nintendo',
    genre: 'Puzzle',
    code: 'DMG-VU-USA',
    icon: '💊',
    description: {
      nl: 'Draai en stapel 2-kleurige megavitamines om vervelende virussen in een reageerbuis te vernietigen op de meeslepende "Fever" chiptunemelodie.',
      en: 'Rotate and align 2-color megavitamin capsules to eradicate viruses in a beaker, accompanied by the infectious "Fever" chiptune.'
    },
    coverGradient: 'from-yellow-500 via-red-500 to-blue-600',
    accentColor: '#eab308'
  },
  metroid_2: {
    id: 'metroid_2',
    title: 'Metroid II: Return of Samus',
    year: 1991,
    developer: 'Nintendo R&D1 (Makoto Kano & Yoshio Sakamoto)',
    publisher: 'Nintendo',
    genre: 'Action-Adventure',
    code: 'DMG-ME-USA',
    icon: '🚀',
    description: {
      nl: 'Dring door in de diepe grotten van planeet SR388 als premiejager Samus Aran met de Morph Ball, Spider Ball en Arm Cannon om 39 Metroids op te sporen.',
      en: 'Infiltrate the depths of planet SR388 as bounty hunter Samus Aran with Morph Ball, Spider Ball, and Arm Cannon to hunt 39 Metroids.'
    },
    coverGradient: 'from-emerald-600 via-teal-700 to-neutral-900',
    accentColor: '#10b981'
  },
  kirby_dream_land: {
    id: 'kirby_dream_land',
    title: "Kirby's Dream Land",
    year: 1992,
    developer: 'HAL Laboratory (Masahiro Sakurai)',
    publisher: 'Nintendo',
    genre: 'Platformer',
    code: 'DMG-KY-USA',
    icon: '⭐',
    description: {
      nl: 'Het debuut van Kirby! Zuig vijanden en sterren op, blaas jezelf op om over obstakels te zweven en versla King Dedede om het gestolen voedsel van Dream Land te redden.',
      en: 'The legendary debut of Kirby! Inhale enemies, puff up to float through the skies, spit stars, and defeat King Dedede to restore Dream Land.'
    },
    coverGradient: 'from-pink-500 via-rose-500 to-amber-400',
    accentColor: '#ec4899'
  },
  mario_land_2: {
    id: 'mario_land_2',
    title: 'Super Mario Land 2: 6 Golden Coins',
    year: 1992,
    developer: 'Nintendo R&D1 (Hiroji Kiyotake & Takehiko Hosokawa)',
    publisher: 'Nintendo',
    genre: 'Platformer',
    code: 'DMG-MQ-USA',
    icon: '👑',
    description: {
      nl: 'Verken 6 unieke thematische zones om de gouden munten te veroveren, gebruik de konijnenoren (wortel) om te zweven en herover Mario\'s kasteel van Wario.',
      en: 'Explore 6 themed zones to claim the golden coins, use the Bunny Ears carrot power-up to glide, and reclaim Mario\'s castle from Wario.'
    },
    coverGradient: 'from-orange-500 via-amber-600 to-red-600',
    accentColor: '#f97316'
  },
  zelda_links_awakening: {
    id: 'zelda_links_awakening',
    title: "The Legend of Zelda: Link's Awakening",
    year: 1993,
    developer: 'Nintendo EAD (Takashi Tezuka & Yoshiaki Koizumi)',
    publisher: 'Nintendo',
    genre: 'Action-Adventure RPG',
    code: 'DMG-ZL-USA',
    icon: '🗡️',
    description: {
      nl: 'Gestrand op het mysterieuze eiland Koholint. Verzamel de 8 Instrumenten van de Sirenes met je zwaard, schild en Roc\'s Feather om de Windvis te wekken.',
      en: 'Stranded on mysterious Koholint Island. Collect the 8 Instruments of the Sirens with your sword, shield, and Roc\'s Feather to awaken the Wind Fish.'
    },
    coverGradient: 'from-emerald-700 via-green-800 to-amber-700',
    accentColor: '#059669'
  },
  donkey_kong_94: {
    id: 'donkey_kong_94',
    title: "Donkey Kong '94",
    year: 1994,
    developer: 'Nintendo EAD & Pax Softnica (Shigeru Miyamoto)',
    publisher: 'Nintendo',
    genre: 'Puzzle-Platformer',
    code: 'DMG-QD-USA',
    icon: '🦍',
    description: {
      nl: 'Meesterlijke evolutie van de arcadeklassieker met 101 puzzellevels! Gebruik salto\'s, handstanden, sleutels en hamers om Pauline te redden uit de klauwen van DK.',
      en: 'Masterful expansion of the arcade classic with 101 puzzle stages! Perform backflips, handstands, carry keys, and wield hammers to rescue Pauline.'
    },
    coverGradient: 'from-red-600 via-amber-700 to-yellow-600',
    accentColor: '#dc2626'
  },
  pokemon_red: {
    id: 'pokemon_red',
    title: 'Pokémon Red & Blue',
    year: 1996,
    developer: 'Game Freak (Satoshi Tajiri & Ken Sugimori)',
    publisher: 'Nintendo',
    genre: 'Monster RPG',
    code: 'DMG-APAE-USA',
    icon: '⚡',
    description: {
      nl: 'Het wereldwijde fenomeen begon hier! Kies je starter in Pallet Town, verken Kanto, train Pokémon in het hoge gras en vecht in epische beurtelingse duels.',
      en: 'The worldwide phenomenon began here! Pick your starter in Pallet Town, explore Kanto, train Pokémon in tall grass, and engage in turn-based battles.'
    },
    coverGradient: 'from-red-600 via-rose-700 to-blue-600',
    accentColor: '#ef4444'
  },
  wario_land_2: {
    id: 'wario_land_2',
    title: 'Wario Land II',
    year: 1998,
    developer: 'Nintendo R&D1 (Takehiko Hosokawa & Hiroji Kiyotake)',
    publisher: 'Nintendo',
    genre: 'Action-Puzzle',
    code: 'DMG-AW2E-USA',
    icon: '💰',
    description: {
      nl: 'Wario is onverwoestbaar! Gebruik hilarische gedaanteverwisselingen (Vlammen-Wario, Plat-Wario, Dikke-Wario) en schouderstoten om Captain Syrup\'s schatten terug te stelen.',
      en: 'Wario is immortal! Leverage hilarious status conditions (Flaming, Flat, Fat Wario) and shoulder bashes to reclaim his stolen treasure from Captain Syrup.'
    },
    coverGradient: 'from-yellow-500 via-purple-700 to-neutral-900',
    accentColor: '#a855f7'
  }
};
