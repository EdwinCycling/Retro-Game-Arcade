/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Game Boy Advance SP High Scores & Game Save Persistence
 */

export interface GbaScoreEntry {
  id: string;
  name: string;
  score: number;
  subInfo: string;
  date: string;
}

const POKEMON_STORAGE_KEY = 'gba_sp_pokemon_scores';
const MARIO_ADVANCE_STORAGE_KEY = 'gba_sp_mario_scores';
const ZELDA_MINISH_STORAGE_KEY = 'gba_sp_zelda_scores';

const DEFAULT_POKEMON_SCORES: GbaScoreEntry[] = [
  { id: '1', name: 'RED', score: 3500, subInfo: 'Hoenn Champion (Lv.54)', date: '2004-09-16' },
  { id: '2', name: 'MAY', score: 2800, subInfo: 'Gym Badge x8', date: '2004-09-15' },
  { id: '3', name: 'BRN', score: 2100, subInfo: 'Pokedex 48 Vangsten', date: '2004-09-14' },
  { id: '4', name: 'WLY', score: 1400, subInfo: 'Victory Road', date: '2004-09-10' },
  { id: '5', name: 'ASH', score: 950, subInfo: 'Petalburg Gym', date: '2004-09-08' }
];

const DEFAULT_MARIO_SCORES: GbaScoreEntry[] = [
  { id: '1', name: 'MAR', score: 128400, subInfo: 'World 8 Clear ★', date: '2003-10-21' },
  { id: '2', name: 'LUI', score: 95600, subInfo: 'World 6 Koopa', date: '2003-10-18' },
  { id: '3', name: 'PCH', score: 72300, subInfo: 'World 4 Giant', date: '2003-10-14' },
  { id: '4', name: 'YSH', score: 48900, subInfo: 'World 3 Sea', date: '2003-10-11' },
  { id: '5', name: 'TOA', score: 26500, subInfo: 'World 2 Desert', date: '2003-10-09' }
];

const DEFAULT_ZELDA_SCORES: GbaScoreEntry[] = [
  { id: '1', name: 'LNK', score: 999, subInfo: 'Four Sword Restored', date: '2004-11-04' },
  { id: '2', name: 'ZEL', score: 750, subInfo: 'Temple of Droplets', date: '2004-11-02' },
  { id: '3', name: 'EZL', score: 500, subInfo: 'Castor Wilds Clear', date: '2004-10-29' },
  { id: '4', name: 'TIN', score: 320, subInfo: 'Deepwood Shrine', date: '2004-10-26' },
  { id: '5', name: 'GND', score: 180, subInfo: 'Hyrule Castle Courtyard', date: '2004-10-20' }
];

export function getPokemonScores(): GbaScoreEntry[] {
  try {
    const raw = localStorage.getItem(POKEMON_STORAGE_KEY);
    if (!raw) return DEFAULT_POKEMON_SCORES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_POKEMON_SCORES;
  }
}

export function savePokemonScore(name: string, score: number, subInfo: string): GbaScoreEntry[] {
  try {
    const current = getPokemonScores();
    const updated = [...current, {
      id: Date.now().toString(),
      name: name.slice(0, 4).toUpperCase(),
      score,
      subInfo,
      date: new Date().toISOString().split('T')[0]
    }].sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem(POKEMON_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_POKEMON_SCORES;
  }
}

export function getMarioAdvanceScores(): GbaScoreEntry[] {
  try {
    const raw = localStorage.getItem(MARIO_ADVANCE_STORAGE_KEY);
    if (!raw) return DEFAULT_MARIO_SCORES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MARIO_SCORES;
  }
}

export function saveMarioAdvanceScore(name: string, score: number, subInfo: string): GbaScoreEntry[] {
  try {
    const current = getMarioAdvanceScores();
    const updated = [...current, {
      id: Date.now().toString(),
      name: name.slice(0, 4).toUpperCase(),
      score,
      subInfo,
      date: new Date().toISOString().split('T')[0]
    }].sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem(MARIO_ADVANCE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_MARIO_SCORES;
  }
}

export function getZeldaScores(): GbaScoreEntry[] {
  try {
    const raw = localStorage.getItem(ZELDA_MINISH_STORAGE_KEY);
    if (!raw) return DEFAULT_ZELDA_SCORES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ZELDA_SCORES;
  }
}

export function saveZeldaScore(name: string, score: number, subInfo: string): GbaScoreEntry[] {
  try {
    const current = getZeldaScores();
    const updated = [...current, {
      id: Date.now().toString(),
      name: name.slice(0, 4).toUpperCase(),
      score,
      subInfo,
      date: new Date().toISOString().split('T')[0]
    }].sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem(ZELDA_MINISH_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_ZELDA_SCORES;
  }
}
