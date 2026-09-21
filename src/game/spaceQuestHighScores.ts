/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Space Quest I: The Sarien Encounter (1986, Sierra On-Line)
 * Hall of Fame High Scores & 3.5" Diskette Save Slots
 */

import { SQRoomId, SQItemId, RogerState } from './spaceQuestTypes';

export interface SQHighScore {
  id: string;
  initials: string;
  score: number;
  date: string;
}

export interface SQSavedGame {
  slotId: number;
  timestamp: string;
  room: SQRoomId;
  score: number;
  inventory: SQItemId[];
  roger: RogerState;
  milestones: Record<string, boolean>;
  roomItems: Record<SQRoomId, SQItemId[]>;
}

const SQ_SCORES_KEY = 'spacequest_highscores_v1';
const SQ_SAVES_KEY = 'spacequest_saveslots_v1';

export function getSpaceQuestHighScores(): SQHighScore[] {
  try {
    const raw = localStorage.getItem(SQ_SCORES_KEY);
    if (!raw) {
      return [
        { id: '1', initials: 'WIL', score: 185, date: '1986-10-18' },
        { id: '2', initials: 'SLH', score: 140, date: '1986-10-22' },
        { id: '3', initials: 'MCR', score: 115, date: '1986-11-04' },
        { id: '4', initials: 'SMU', score: 90, date: '1986-11-15' },
        { id: '5', initials: 'JER', score: 65, date: '1986-12-01' }
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSpaceQuestHighScore(initials: string, score: number): SQHighScore[] {
  const list = getSpaceQuestHighScores();
  const entry: SQHighScore = {
    id: String(Date.now()),
    initials: initials.slice(0, 3).toUpperCase(),
    score,
    date: new Date().toISOString().split('T')[0]
  };
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  const trimmed = list.slice(0, 10);
  try {
    localStorage.setItem(SQ_SCORES_KEY, JSON.stringify(trimmed));
  } catch {}
  return trimmed;
}

export function listSQSavedGames(): Record<number, SQSavedGame | null> {
  try {
    const raw = localStorage.getItem(SQ_SAVES_KEY);
    if (!raw) return { 1: null, 2: null, 3: null };
    return JSON.parse(raw);
  } catch {
    return { 1: null, 2: null, 3: null };
  }
}

export function saveSQGameSlot(slotId: number, data: Omit<SQSavedGame, 'slotId' | 'timestamp'>): void {
  const current = listSQSavedGames();
  current[slotId] = {
    slotId,
    timestamp: new Date().toLocaleString(),
    ...data
  };
  try {
    localStorage.setItem(SQ_SAVES_KEY, JSON.stringify(current));
  } catch {}
}

export function loadSQGameSlot(slotId: number): SQSavedGame | null {
  const current = listSQSavedGames();
  return current[slotId] || null;
}
