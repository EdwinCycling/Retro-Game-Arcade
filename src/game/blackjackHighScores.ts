export interface BlackjackHighScoreEntry {
  name: string;
  initials: string;
  bankroll: number;
  handsPlayed: number;
  blackjacks: number;
  date: string;
}

const STORAGE_KEY = 'arcade_blackjack_leaderboard_v1';

export function getBlackjackHighScores(): BlackjackHighScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [
        { name: 'Edward Thorp', initials: 'EOT', bankroll: 4850, handsPlayed: 64, blackjacks: 8, date: '1962-11-15' },
        { name: 'MIT Blackjack Team', initials: 'MIT', bankroll: 3500, handsPlayed: 45, blackjacks: 6, date: '1979-05-20' },
        { name: 'Ken Uston', initials: 'UST', bankroll: 2750, handsPlayed: 38, blackjacks: 4, date: '1982-08-14' },
        { name: 'Stanford Wong', initials: 'WNG', bankroll: 2100, handsPlayed: 30, blackjacks: 3, date: '1986-04-10' },
        { name: 'Vegas High Roller', initials: 'VHR', bankroll: 1750, handsPlayed: 25, blackjacks: 2, date: '1995-10-01' },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveBlackjackHighScore(entry: Omit<BlackjackHighScoreEntry, 'date'>): void {
  try {
    const scores = getBlackjackHighScores();
    const newEntry: BlackjackHighScoreEntry = {
      ...entry,
      date: new Date().toISOString().split('T')[0]
    };
    scores.push(newEntry);
    scores.sort((a, b) => b.bankroll - a.bankroll);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, 10)));
  } catch {
    // ignore
  }
}
