/**
 * Impossible Mission High Scores & Mission Records
 */

export interface ImpossibleMissionRecord {
  initials: string;
  remainingSeconds: number;
  piecesFound: number;
  date: string;
  cleared: boolean;
}

const STORAGE_KEY = 'impossible_mission_high_scores';

export const DEFAULT_IMPOSSIBLE_SCORES: ImpossibleMissionRecord[] = [
  { initials: 'EPX', remainingSeconds: 16820, piecesFound: 36, date: '1984-04-12', cleared: true },
  { initials: 'DCW', remainingSeconds: 14200, piecesFound: 36, date: '1984-05-01', cleared: true },
  { initials: 'ELV', remainingSeconds: 11400, piecesFound: 32, date: '1984-06-15', cleared: false },
  { initials: 'SID', remainingSeconds: 9800,  piecesFound: 28, date: '1984-07-20', cleared: false },
  { initials: 'C64', remainingSeconds: 6200,  piecesFound: 24, date: '1984-08-04', cleared: false }
];

export function getImpossibleMissionScores(): ImpossibleMissionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_IMPOSSIBLE_SCORES));
      return DEFAULT_IMPOSSIBLE_SCORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Ignore localStorage errors
  }
  return DEFAULT_IMPOSSIBLE_SCORES;
}

export function saveImpossibleMissionScore(record: ImpossibleMissionRecord): ImpossibleMissionRecord[] {
  try {
    const current = getImpossibleMissionScores();
    const updated = [...current, record].sort((a, b) => {
      if (a.cleared !== b.cleared) return a.cleared ? -1 : 1;
      return b.remainingSeconds - a.remainingSeconds;
    }).slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_IMPOSSIBLE_SCORES;
  }
}
