import { SpellingWord } from '../data/theme1Words';

export interface MistakeRecord {
  id: string; // unique id e.g. `${wordId}-${timestamp}`
  wordId: number;
  word: string;
  description: string;
  firstLetter: string;
  boxCount: number;
  chinese: string;
  phonics: string[];
  imageUrl?: string;
  themeId: number;
  themeName: string;
  themeTitle: string;
  timestamp: number; // Date.now()
  dateFormatted: string; // e.g. "21 Aug 2026, 03:30 PM"
  failReason: 'wrong_spelling' | 'time_out';
  studentAttempt?: string;
  timesPracticed: number;
  isMastered: boolean; // marked true when student successfully re-practices in Mistake Book or main theme
}

const MISTAKE_BOOK_STORAGE_KEY = 'worksheet_english_part5_mistakes_v1';

export function loadMistakes(): MistakeRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(MISTAKE_BOOK_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load mistakes:', err);
  }
  return [];
}

export function saveMistakes(mistakes: MistakeRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MISTAKE_BOOK_STORAGE_KEY, JSON.stringify(mistakes));
  } catch (err) {
    console.error('Failed to save mistakes:', err);
  }
}

export function addOrUpdateMistake(
  word: SpellingWord,
  themeId: number,
  themeName: string,
  themeTitle: string,
  failReason: 'wrong_spelling' | 'time_out',
  studentAttempt?: string
): MistakeRecord[] {
  const current = loadMistakes();
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ', ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Check if word is already in mistake book
  const existingIdx = current.findIndex((m) => m.word.toLowerCase() === word.word.toLowerCase());

  let updatedList: MistakeRecord[];

  if (existingIdx >= 0) {
    // Update existing record with latest timestamp and reason
    const existing = current[existingIdx];
    const updated: MistakeRecord = {
      ...existing,
      wordId: word.id,
      word: word.word,
      description: word.description,
      firstLetter: word.firstLetter,
      boxCount: word.boxCount,
      chinese: word.chinese,
      phonics: word.phonics,
      imageUrl: word.imageUrl,
      id: existing.id,
      themeId,
      themeName,
      themeTitle,
      timestamp: Date.now(),
      dateFormatted,
      failReason,
      studentAttempt: studentAttempt || existing.studentAttempt,
      isMastered: false, // Reset mastered if failed again
    };
    updatedList = [updated, ...current.filter((_, idx) => idx !== existingIdx)];
  } else {
    // Add new record
    const newRecord: MistakeRecord = {
      id: `${word.id}-${Date.now()}`,
      wordId: word.id,
      word: word.word,
      description: word.description,
      firstLetter: word.firstLetter,
      boxCount: word.boxCount,
      chinese: word.chinese,
      phonics: word.phonics,
      imageUrl: word.imageUrl,
      themeId,
      themeName,
      themeTitle,
      timestamp: Date.now(),
      dateFormatted,
      failReason,
      studentAttempt,
      timesPracticed: 0,
      isMastered: false,
    };
    updatedList = [newRecord, ...current];
  }

  saveMistakes(updatedList);
  return updatedList;
}

export function markMistakeMastered(wordText: string): MistakeRecord[] {
  const current = loadMistakes();
  const updated = current.map((m) => {
    if (m.word.toLowerCase() === wordText.toLowerCase()) {
      return {
        ...m,
        timesPracticed: (m.timesPracticed || 0) + 1,
        isMastered: true,
      };
    }
    return m;
  });
  saveMistakes(updated);
  return updated;
}

export function removeMistake(id: string): MistakeRecord[] {
  const current = loadMistakes();
  const updated = current.filter((m) => m.id !== id);
  saveMistakes(updated);
  return updated;
}

export function clearAllMistakes(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MISTAKE_BOOK_STORAGE_KEY);
}
