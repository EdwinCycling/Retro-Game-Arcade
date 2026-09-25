export interface BridgeHighScoreEntry {
  name: string;
  initials: string;
  contract: string;
  resultScore: number;
  totalMasterpoints: number;
  date: string;
}

const STORAGE_KEY = 'arcade_bridge_leaderboard_v1';

export function getBridgeHighScores(): BridgeHighScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [
        { name: 'Harold Vanderbilt', initials: 'HV', contract: '7NT (Grand Slam)', resultScore: 2220, totalMasterpoints: 540, date: '1925-11-01' },
        { name: 'Ely Culbertson', initials: 'EC', contract: '6♠ (Small Slam)', resultScore: 1430, totalMasterpoints: 410, date: '1931-12-15' },
        { name: 'Charles Goren', initials: 'CG', contract: '3NT +3', resultScore: 690, totalMasterpoints: 320, date: '1944-03-22' },
        { name: 'Zia Mahmood', initials: 'ZM', contract: '4♥ +2', resultScore: 680, totalMasterpoints: 280, date: '1977-08-14' },
        { name: 'Meesterbridger (Vader)', initials: 'PAP', contract: '4♠ +1', resultScore: 650, totalMasterpoints: 250, date: '1985-05-10' },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveBridgeHighScore(entry: Omit<BridgeHighScoreEntry, 'date'>): void {
  try {
    const scores = getBridgeHighScores();
    const newEntry: BridgeHighScoreEntry = {
      ...entry,
      date: new Date().toISOString().split('T')[0]
    };
    scores.push(newEntry);
    scores.sort((a, b) => b.resultScore - a.resultScore);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, 10)));
  } catch {
    // ignore
  }
}
