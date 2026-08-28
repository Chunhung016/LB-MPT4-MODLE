import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

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

/**
 * Clear all leaderboard entries (both in local storage and Supabase if accessible)
 */
export async function clearAllLeaderboard(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('spelling_bee_leaderboard').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch {
      // ignore
    }
  }
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

/**
 * Record a game score to Supabase and Local Storage
 */
export async function submitGameScore(entry: Omit<LeaderboardEntry, 'id' | 'created_at'>): Promise<LeaderboardEntry> {
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: 'score_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
  };

  // 1. Save to local storage first for instant feedback
  const localList = getLocalLeaderboard();
  const updatedLocal = [newEntry, ...localList].sort((a, b) => b.score - a.score);
  saveLocalLeaderboard(updatedLocal);

  // 2. Sync to Supabase if available
  if (isSupabaseConfigured) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from('spelling_bee_leaderboard').insert({
        user_id: userData?.user?.id || null,
        child_name: entry.child_name,
        theme_name: entry.theme_name,
        score: entry.score,
        mastered_count: entry.mastered_count,
        total_questions: entry.total_questions,
        max_streak: entry.max_streak,
        time_seconds: entry.time_seconds,
      });
    } catch {
      // Gracefully continue with local storage
    }
  }

  return newEntry;
}

/**
 * Fetch leaderboard records from Supabase (with fallback to local storage)
 */
export async function fetchLeaderboard(filter: 'all' | 'today' = 'all'): Promise<LeaderboardEntry[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('spelling_bee_leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(50);

      if (filter === 'today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        query = query.gte('created_at', startOfDay.toISOString());
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as LeaderboardEntry[];
      }
    } catch {
      // Fall through to local fallback
    }
  }

  // Fallback to local storage
  const local = getLocalLeaderboard();
  if (filter === 'today') {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayTime = startOfDay.getTime();
    return local.filter((e) => new Date(e.created_at).getTime() >= startOfDayTime).sort((a, b) => b.score - a.score);
  }
  return local.sort((a, b) => b.score - a.score);
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
