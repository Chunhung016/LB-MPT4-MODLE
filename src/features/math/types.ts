export type QuestionId = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'all' | 'export';

export interface QuestionMeta {
  id: QuestionId;
  number: number;
  title: string;
  subtitle: string;
  topic: string;
  badgeColor: string;
}
