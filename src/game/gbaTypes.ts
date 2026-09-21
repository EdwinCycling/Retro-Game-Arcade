/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Game Boy Advance SP (AGS-001 / AGS-101) Types & Configuration
 */

export type GbaCartridgeId = 'pokemon_emerald' | 'mario_advance' | 'zelda_minish' | 'metroid_fusion' | 'mario_kart_gba';

export type GbaShellColor = 'cobalt_blue' | 'onyx_black' | 'platinum_silver' | 'flame_red' | 'pearl_blue' | 'nes_classic';

export type GbaScreenMode = 'ags101_bright' | 'ags001_frontlit' | 'crt_scanline' | 'pixel_grid';

export interface GbaCartridgeInfo {
  id: GbaCartridgeId;
  title: string;
  subtitle: string;
  year: number;
  code: string;
  labelColor: string;
  accentColor: string;
  cartridgeColor: string; // e.g. emerald green, red, gold/grey
  icon: string;
  genre: string;
  developer: string;
  publisher: string;
  summary: { nl: string; en: string };
}

export const GBA_CARTRIDGES: Record<GbaCartridgeId, GbaCartridgeInfo> = {
  pokemon_emerald: {
    id: 'pokemon_emerald',
    title: 'Pokémon Emerald Edition',
    subtitle: 'Hoenn RPG Avontuur & Turn-based Battles',
    year: 2004,
    code: 'AGB-BPEE-USA',
    labelColor: '#059669',
    accentColor: '#10b981',
    cartridgeColor: '#047857', // Translucent Emerald Green
    icon: '⚡',
    genre: 'Handheld RPG / Monster Battler',
    developer: 'Game Freak',
    publisher: 'Nintendo / The Pokémon Company',
    summary: {
      nl: 'Kies je starter (Treecko, Torchic, Mudkip of Pikachu), verken de route door hoog gras, vecht tegen wilde Pokémon in tactische beurtelingse duels en vang ze met Pokéballs!',
      en: 'Choose your starter (Treecko, Torchic, Mudkip or Pikachu), explore route tall grass, engage in tactical turn-based wild battles, and catch them all with Poké Balls!'
    }
  },
  mario_advance: {
    id: 'mario_advance',
    title: 'Super Mario Advance 4',
    subtitle: 'Super Mario Bros. 3 & Super World 32-bit Platformer',
    year: 2003,
    code: 'AGB-AX4E-USA',
    labelColor: '#dc2626',
    accentColor: '#ef4444',
    cartridgeColor: '#374151', // Classic GBA Grey
    icon: '🍄',
    genre: '32-Bit Handheld Platformer',
    developer: 'Nintendo R&D2',
    publisher: 'Nintendo',
    summary: {
      nl: 'Klassieke 32-bit Mario platformactie met levendige GBA kleuren, vliegende Raccoon Mario, Super Mushrooms, Fire Flowers, munten verzamelen en Charles Martinet stemmen!',
      en: 'Classic 32-bit Mario platforming with vivid GBA colors, flying Raccoon Mario, Super Mushrooms, Fire Flowers, coin collecting and Charles Martinet voice clips!'
    }
  },
  zelda_minish: {
    id: 'zelda_minish',
    title: 'The Legend of Zelda: The Minish Cap',
    subtitle: 'Hyrule Action-Adventure & Sword Combat',
    year: 2004,
    code: 'AGB-BZME-USA',
    labelColor: '#d97706',
    accentColor: '#f59e0b',
    cartridgeColor: '#374151', // Classic GBA Grey
    icon: '🗡️',
    genre: 'Top-Down Action-Adventure',
    developer: 'Capcom (Flagship) / Nintendo',
    publisher: 'Nintendo',
    summary: {
      nl: 'Trek eropuit met Link in Hyrule! Hak door het gras met je zwaard, ontwijk vijanden met koprollen, verzamel Rupees & Hearts, ontsteek bommen en open schatkisten.',
      en: 'Set out with Link across Hyrule! Slash grass with your sword, dodge enemies with rolls, collect Rupees & Hearts, ignite bombs, and open grand treasure chests.'
    }
  },
  metroid_fusion: {
    id: 'metroid_fusion',
    title: 'Metroid Fusion',
    subtitle: 'Biometal Sci-Fi Action & X-Parasite Hunt',
    year: 2002,
    code: 'AGB-AMT-USA',
    labelColor: '#7c3aed',
    accentColor: '#8b5cf6',
    cartridgeColor: '#374151',
    icon: '🚀',
    genre: '32-Bit Sci-Fi Platformer',
    developer: 'Nintendo R&D1',
    publisher: 'Nintendo',
    summary: {
      nl: 'Samus Aran in de Fusion Suit! Gebruik de Wave Beam, Missiles en Morph Ball om de ruimtestatie BSL te zuiveren van dodelijke X-parasieten.',
      en: 'Samus Aran equipped with Fusion Suit! Use Wave Beam, Missiles, and Morph Ball to clear space station BSL of lethal X-Parasites.'
    }
  },
  mario_kart_gba: {
    id: 'mario_kart_gba',
    title: 'Mario Kart: Super Circuit',
    subtitle: '32-Bit Mode7 High-Speed Handheld Racing',
    year: 2001,
    code: 'AGB-AMK-USA',
    labelColor: '#0284c7',
    accentColor: '#38bdf8',
    cartridgeColor: '#374151',
    icon: '🏎️',
    genre: 'Handheld Mode7 Racing',
    developer: 'Intelligent Systems / Nintendo',
    publisher: 'Nintendo',
    summary: {
      nl: 'Diverteer over de kartbanen met Mario, Luigi, Bowser en Peach! Gebruik bananenschillen, schilden, paddenstoelen en drifts in vloeiende 60 FPS Mode7 actie.',
      en: 'Drift across racing circuits with Mario, Luigi, Bowser, and Peach! Deploy banana peels, shells, mushrooms, and drifts in smooth 60 FPS Mode7 action.'
    }
  }
};

export const GBA_SHELL_COLORS: Record<GbaShellColor, { name: string; hex: string; border: string; accent: string }> = {
  cobalt_blue: {
    name: 'Cobalt Blue',
    hex: '#1e3a8a',
    border: '#172554',
    accent: '#3b82f6'
  },
  onyx_black: {
    name: 'Onyx Black',
    hex: '#1f2937',
    border: '#111827',
    accent: '#6b7280'
  },
  platinum_silver: {
    name: 'Platinum Silver',
    hex: '#9ca3af',
    border: '#6b7280',
    accent: '#e5e7eb'
  },
  flame_red: {
    name: 'Flame Red',
    hex: '#991b1b',
    border: '#7f1d1d',
    accent: '#ef4444'
  },
  pearl_blue: {
    name: 'Pearl Blue (AGS-101)',
    hex: '#0284c7',
    border: '#0369a1',
    accent: '#38bdf8'
  },
  nes_classic: {
    name: 'NES Classic Edition',
    hex: '#d1d5db',
    border: '#9ca3af',
    accent: '#b91c1c'
  }
};
