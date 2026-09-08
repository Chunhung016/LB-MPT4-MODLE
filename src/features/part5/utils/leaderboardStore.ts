import {
  saveLeaderboardScore,
  getLeaderboardScores,
  clearLeaderboardScores,
} from '../../../services/firebaseDb';

export interface LeaderboardEntry {
  id: string;
  child_name: string;
  theme_name: string;
  score: number;
  mastered_count: number;
  total_questions: number;
  max_streak: number;
  time_seconds: number;
  created_at: string;
  is_current_user?: boolean;
}

const LOCAL_STORAGE_KEY = 'little_bee_spelling_leaderboard_v1';

// No fake/demo data - start fresh and empty
const INITIAL_DEMO_ENTRIES: LeaderboardEntry[] = [];

export function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage parse errors
  }
  return [];
}

export function saveLocalLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries.slice(0, 100)));
  } catch {
    // Ignore storage write errors
  }
}

export async function clearAllLeaderboard(): Promise<void> {
  await clearLeaderboardScores();
  try { localStorage.removeItem(LOCAL_STORAGE_KEY); } catch { /* optional cache */ }
}

/**
 * Calculate game score based on game performance
 */
export function calculateGameScore(
  masteredCount: number,
  totalQuestions: number,
  maxStreak: number,
  timeSeconds: number
): number {
  if (totalQuestions <= 0) return 0;

  // 100 points per mastered word
  const baseScore = masteredCount * 100;

  // Perfect game bonus
  const perfectBonus = masteredCount === totalQuestions ? 250 : 0;

  // Streak bonus (30 pts per max streak level over 2)
  const streakBonus = Math.max(0, maxStreak - 1) * 30;

  // Speed bonus (faster completion under 2 minutes gives extra points)
  const expectedSeconds = totalQuestions * 15;
  const speedBonus =
    masteredCount > 0 && timeSeconds < expectedSeconds
      ? Math.round(Math.max(0, (expectedSeconds - timeSeconds) * 2))
      : 0;

  return baseScore + perfectBonus + streakBonus + speedBonus;
}

export async function submitGameScore(entry: Omit<LeaderboardEntry, 'id' | 'created_at'>): Promise<LeaderboardEntry> {
  const { is_current_user, ...score } = entry;
  const newEntry: LeaderboardEntry = { ...score, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  await saveLeaderboardScore(newEntry);
  return newEntry;
}
export async function fetchLeaderboard(filter: 'all' | 'today' = 'all'): Promise<LeaderboardEntry[]> {
  return getLeaderboardScores(filter);
}

/**
 * Get the current player's ranking and best score from the leaderboard entries
 */
export function getChildLeaderboardStats(
  entries: LeaderboardEntry[],
  childName: string
): { rank: number | null; bestScore: number; recentEntry: LeaderboardEntry | null; totalRanked: number } {
  if (!entries || entries.length === 0) {
    return { rank: null, bestScore: 0, recentEntry: null, totalRanked: 0 };
  }

  const normalizedChild = childName.trim().toLowerCase();
  const childIndex = entries.findIndex((e) => e.child_name.trim().toLowerCase() === normalizedChild);

  const childEntries = entries.filter((e) => e.child_name.trim().toLowerCase() === normalizedChild);
  const bestScore = childEntries.length > 0 ? Math.max(...childEntries.map((e) => e.score)) : 0;
  const recentEntry = childEntries.length > 0
    ? [...childEntries].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;

  return {
    rank: childIndex !== -1 ? childIndex + 1 : null,
    bestScore,
    recentEntry,
    totalRanked: entries.length,
  };
}
