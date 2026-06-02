/**
 * Shared Type Definitions for Doomsday Trainer
 */

export type AppView = 'hero' | 'learn' | 'train' | 'daily' | 'analytics';

export type Lang = 'de' | 'en' | 'lv';

export type TrainingMode = 'endless' | 'timeattack';

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface CenturyFilter {
  [key: number]: boolean;
}

export interface TrainingStats {
  streak: number;
  bestStreak: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracy: number;
  avgTimeMs: number;
  currentTimeMs: number;
}

export interface Session {
  id?: number;
  mode: TrainingMode;
  date: string;
  duration?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  accuracy?: number;
  avgTimeMs?: number;
}

export interface Answer {
  id?: number;
  sessionId: number;
  generatedDate: string;
  generatedYear: number;
  generatedMonth: number;
  generatedDay: number;
  givenAnswer: Weekday;
  correctAnswer: Weekday;
  timeMs: number;
  state: 'correct' | 'incorrect' | 'correct_with_help' | 'incorrect_with_help';
  century: number;
  usedHelp: boolean;
}

export interface UserStats {
  id?: number;
  lastCompletedDate: string | null;
  streakCount: number;
  bestStreak: number;
  totalDailyCompleted: number;
}

export interface DailyResult {
  date: string; // key
  answers: Array<{
    year: number;
    month: number;
    day: number;
    correctAnswer: Weekday;
    givenAnswer: Weekday;
    state: Answer['state'];
    timeMs: number;
    usedHelp: boolean;
  }>;
  totalTimeMs: number;
  streak: number;
}

export type LearnStep = number;

export const WEEKDAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export const DEFAULT_CENTURY_FILTER: CenturyFilter = {
  1800: true,
  1900: true,
  2000: true,
  2100: true,
};

export const TIME_ATTACK_SECONDS = 60;

export const DAILY_QUESTION_COUNT = 5;
