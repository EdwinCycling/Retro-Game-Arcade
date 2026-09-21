/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sony PlayStation 1 (PS1 / 1994) Types & Data Structures
 */

export type Ps1DiscId = 
  | 'crash_bandicoot'
  | 'ridge_racer'
  | 'tekken_3'
  | 'wipeout'
  | 'metal_gear_solid';

export interface Ps1DiscInfo {
  id: Ps1DiscId;
  title: string;
  subtitle: string;
  year: number;
  code: string;
  genre: string;
  developer: string;
  publisher: string;
  cdLabelColor: string;
  accentColor: string;
  discArtworkIcon: string;
  summary: {
    nl: string;
    en: string;
  };
  features: {
    nl: string[];
    en: string[];
  };
}

export const PS1_DISCS: Record<Ps1DiscId, Ps1DiscInfo> = {
  crash_bandicoot: {
    id: 'crash_bandicoot',
    title: 'Crash Bandicoot',
    subtitle: 'N. Sanity Island 3D Platforming Landmark',
    year: 1996,
    code: 'SCUS-94900',
    genre: '3D Action Platformer',
    developer: 'Naughty Dog (Andy Gavin & Jason Rubin)',
    publisher: 'Sony Computer Entertainment',
    cdLabelColor: '#f97316',
    accentColor: '#fb923c',
    discArtworkIcon: '🦊',
    summary: {
      nl: 'De iconische Sony PS1 mascotte! Ren, spring en spin door de 3D jungles van N. Sanity Island. Sloop houten kisten, verzamel Wumpa Fruits en versla Dr. Neo Cortex!',
      en: 'The legendary Sony PS1 mascot! Run, jump, and spin through 3D jungles on N. Sanity Island. Smash wooden crates, collect Wumpa Fruits, and defeat Dr. Neo Cortex!'
    },
    features: {
      nl: [
        '3D corridor platforming met draai-aanvallen en kisten breken',
        'Wumpa Fruits verzamelen (100 Wumpa Fruits = 1 Extra Leven)',
        'Aku Aku masker bescherming tegen TNT, Nitro en vijanden',
        'Vloeiende 60 FPS 32-bit 3D weergave met authentieke PS1 sfeer'
      ],
      en: [
        '3D corridor platforming with signature spin attacks and crate smashing',
        'Wumpa Fruit collection (100 Wumpas = 1 Extra Life)',
        'Aku Aku mask invincibility and hit protection against TNT/Nitro',
        'Smooth 60 FPS 32-bit 3D rendering with authentic PS1 retro atmosphere'
      ]
    }
  },
  ridge_racer: {
    id: 'ridge_racer',
    title: 'Ridge Racer',
    subtitle: 'High-Speed 32-Bit Arcade Racing',
    year: 1994,
    code: 'SLUS-00001',
    genre: '3D Arcade Racing',
    developer: 'Namco (Yozo Sakagami)',
    publisher: 'Namco / Sony',
    cdLabelColor: '#0284c7',
    accentColor: '#38bdf8',
    discArtworkIcon: '🏎️',
    summary: {
      nl: 'Het historische PS1 lanceringsspel! Drift op hoge snelheid door de bergen op de tonen van de opzwepende Namco techno soundtrack.',
      en: 'The historic PS1 launch title! Drift at high speeds through mountain circuits accompanied by Namco’s iconic techno soundtrack.'
    },
    features: {
      nl: [
        'High-speed 3D driften op het klassieke Ridge Racer Circuit',
        'Namco System 22 arcade ervaring getrouw overgezet naar de PS1',
        'Keuze uit 4 sportwagens waaronder de F/A Racing & Yellow Solvalou'
      ],
      en: [
        'High-speed 3D drifting on the classic Ridge Racer Ridge City Circuit',
        'Namco System 22 arcade experience faithfully ported to PS1 hardware',
        'Choice of 4 sports cars including F/A Racing & Yellow Solvalou'
      ]
    }
  },
  tekken_3: {
    id: 'tekken_3',
    title: 'Tekken 3',
    subtitle: 'The King of Iron Fist Tournament',
    year: 1998,
    code: 'SLUS-00638',
    genre: '3D Fighting Game',
    developer: 'Namco (Katsuhiro Harada)',
    publisher: 'Namco',
    cdLabelColor: '#dc2626',
    accentColor: '#ef4444',
    discArtworkIcon: '🥊',
    summary: {
      nl: 'Het absolute hoogtepunt van 3D vechtgames op de PS1! Vecht met Jin Kazama, Paul Phoenix, Eddy Gordo en Yoshimitsu in zinderende 60 FPS duels.',
      en: 'The pinnacle 3D fighting game on PS1! Battle with Jin Kazama, Paul Phoenix, Eddy Gordo, and Yoshimitsu in thrilling 60 FPS matches.'
    },
    features: {
      nl: [
        'Uniek zijwaarts stappen (Sidestepping) in een 3D arena',
        'Vloeiende martial arts animaties en combo-ketens'
      ],
      en: [
        'Pioneering 3D arena sidestepping mechanics',
        'Fluid martial arts animations and high-damage combo chains'
      ]
    }
  },
  wipeout: {
    id: 'wipeout',
    title: 'WipEout',
    subtitle: 'Anti-Gravity Futurist Racing 2052',
    year: 1995,
    code: 'SCUS-94301',
    genre: 'Futuristic AG Racer',
    developer: 'Psygnosis (Nick Burcombe)',
    publisher: 'Psygnosis / Sony',
    cdLabelColor: '#8b5cf6',
    accentColor: '#a855f7',
    discArtworkIcon: '🛸',
    summary: {
      nl: 'Sjees met anti-zwaartekracht schepen op duizelingwekkende snelheden door futuristische steden met een elektronische soundtrack!',
      en: 'Pilot anti-gravity craft at blistering speeds through futuristic metropolis tracks set to a pounding electronic soundtrack!'
    },
    features: {
      nl: [
        'Anti-zwaartekracht zweefschepen met schild & raket-powerups',
        'Futuristisch The Designers Republic visueel ontwerp'
      ],
      en: [
        'Anti-gravity hovercraft physics with shield & missile weapon pickups',
        'Futuristic graphic design styled by The Designers Republic'
      ]
    }
  },
  metal_gear_solid: {
    id: 'metal_gear_solid',
    title: 'Metal Gear Solid',
    subtitle: 'Tactical Espionage Action in Shadow Moses',
    year: 1998,
    code: 'SLUS-00594',
    genre: 'Stealth Action',
    developer: 'Konami (Hideo Kojima)',
    publisher: 'Konami',
    cdLabelColor: '#10b981',
    accentColor: '#34d399',
    discArtworkIcon: '🐍',
    summary: {
      nl: 'Infiltreer het besneeuwde Shadow Moses als Solid Snake. Gebruik radar, kartonnen dozen, verdovingsgeweren en sluiptactieken om FOXHOUND te stoppen.',
      en: 'Infiltrate snow-bound Shadow Moses as Solid Snake. Use radar, cardboard boxes, tranquilizers, and stealth tactics to thwart FOXHOUND.'
    },
    features: {
      nl: [
        'Cinematografische stealth-gameplay met iconische verhaallijn',
        'Radar detectie en vijandelijke gezichtsvelden'
      ],
      en: [
        'Cinematic stealth action with gripping storytelling',
        'Soliton Radar detection and enemy vision cones'
      ]
    }
  }
};
