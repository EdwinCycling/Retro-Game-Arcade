/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * High scores & Saved games manager for King's Quest I (1984, Sierra On-Line / IBM PC)
 */

import { SavedGame } from './kingsQuestTypes';

export type { SavedGame };

export interface KingsQuestHighScore {
  initials: string;
  score: number;
  date: string;
  rankTitle: string;
}

const STORAGE_KEY = 'retro_arcade_kings_quest_scores';
const SAVES_KEY = 'retro_arcade_kings_quest_saves';

const DEFAULT_SCORES: KingsQuestHighScore[] = [
  { initials: 'RBW', score: 158, date: '1984-05-10', rankTitle: 'King of Daventry' }, // Roberta Williams
  { initials: 'KNW', score: 155, date: '1984-06-15', rankTitle: 'Crown Prince' }, // Ken Williams
  { initials: 'GRH', score: 148, date: '1984-08-01', rankTitle: 'Royal Champion' }, // Sir Graham
  { initials: 'IFN', score: 132, date: '1984-09-12', rankTitle: 'Master Knight' }, // Ifnkovhgrogh
  { initials: 'EDW', score: 110, date: '2025-01-20', rankTitle: 'Noble Adventurer' }
];

export function getKingsQuestHighScores(): KingsQuestHighScore[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_SCORES;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveKingsQuestHighScore(initials: string, score: number): KingsQuestHighScore[] {
  try {
    const current = getKingsQuestHighScores();
    const cleanInitials = (initials.trim().toUpperCase().slice(0, 3) || 'GRH');
    let rankTitle = 'Brave Adventurer';
    if (score >= 150) rankTitle = 'King of Daventry';
    else if (score >= 120) rankTitle = 'Royal Champion';
    else if (score >= 80) rankTitle = 'Master Knight';
    else if (score >= 40) rankTitle = 'Courageous Squire';

    const newEntry: KingsQuestHighScore = {
      initials: cleanInitials,
      score,
      date: new Date().toISOString().split('T')[0],
      rankTitle
    };

    const updated = [...current, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function listSavedGames(): (SavedGame | null)[] {
  try {
    const data = localStorage.getItem(SAVES_KEY);
    if (!data) return [null, null, null];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [null, null, null];
  } catch {
    return [null, null, null];
  }
}

export function saveGameSlot(slot: number, game: SavedGame): boolean {
  try {
    const slots = listSavedGames();
    slots[slot] = game;
    localStorage.setItem(SAVES_KEY, JSON.stringify(slots));
    return true;
  } catch {
    return false;
  }
}

export function loadGameSlot(slot: number): SavedGame | null {
  try {
    const slots = listSavedGames();
    return slots[slot] || null;
  } catch {
    return null;
  }
}
