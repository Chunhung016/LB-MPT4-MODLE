import { SpellingWord, WORKSHEET_QUESTIONS } from './theme1Words';

export interface ThemeInfo {
  id: number;
  title: string;
  name: string;
  category: string;
  description: string;
  words: SpellingWord[];
}

export const MAIN_WORKSHEET_THEME: ThemeInfo = {
  id: 1,
  title: 'WORKSHEET',
  name: 'Part 5 Spelling (Q1–Q8)',
  category: 'Spelling Practice',
  description: 'Practice the 8 vocabulary definitions and spelling clues.',
  words: WORKSHEET_QUESTIONS,
};

export const ALL_THEMES: ThemeInfo[] = [MAIN_WORKSHEET_THEME];

export function getThemeById(themeId: number): ThemeInfo {
  return ALL_THEMES.find((t) => t.id === themeId) || MAIN_WORKSHEET_THEME;
}

export function getThemeWords(themeId?: number): SpellingWord[] {
  return WORKSHEET_QUESTIONS;
}
