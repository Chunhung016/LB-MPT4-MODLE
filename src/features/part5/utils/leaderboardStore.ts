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

// Seed sample leaderboard entries for initial display if DB is empty
const INITIAL_DEMO_ENTRIES: LeaderboardEntry[] = [
  {
    id: 'demo-1',
    child_name: 'Emma',
    theme_name: 'My Week',
    score: 1450,
    mastered_count: 10,
    total_questions: 10,
    max_streak: 10,
    time_seconds: 54,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'demo-2',
    child_name: 'Lucas',
    theme_name: 'In the Garden',
    score: 1320,
    mastered_count: 10,
    total_questions: 10,
    max_streak: 8,
    time_seconds: 68,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'demo-3',
    child_name: 'Chloe',
    theme_name: 'School Life',
    score: 1200,
    mastered_count: 9,
    total_questions: 10,
    max_streak: 7,
    time_seconds: 75,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'demo-4',
    child_name: 'Noah',
    theme_name: 'Animals',
    score: 1080,
    mastered_count: 9,
    total_questions: 10,
    max_streak: 5,
    time_seconds: 82,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'demo-5',
    child_name: 'Sophia',
    theme_name: 'My Week',
    score: 950,
    mastered_count: 8,
    total_questions: 10,
    max_streak: 4,
    time_seconds: 90,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

export function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage parse errors
  }
  return INITIAL_DEMO_ENTRIES;
}

export function saveLocalLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries.slice(0, 100)));
  } catch {
    // Ignore storage write errors
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
