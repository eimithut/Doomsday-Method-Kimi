/**
 * IndexedDB Database Layer for Doomsday Trainer
 * Uses the `idb` library for Promise-based handling
 *
 * Stores:
 *  - sessions: Training sessions
 *  - answers: Individual answers (with 4 states)
 *  - user_stats: Streak tracking + last completion
 *  - daily_results: Completed daily challenges
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Session, Answer, UserStats, DailyResult } from '../types';

const DB_NAME = 'doomsday_db';
const DB_VERSION = 2;

interface DoomsdayDB extends DBSchema {
  sessions: {
    key: number;
    value: Session;
    indexes: {
      'by-date': string;
      'by-mode': string;
    };
  };
  answers: {
    key: number;
    value: Answer;
    indexes: {
      'by-session': number;
      'by-century': number;
      'by-month': number;
      'by-state': string;
      'by-help': number;
    };
  };
  user_stats: {
    key: number;
    value: UserStats;
  };
  daily_results: {
    key: string; // date string as key
    value: DailyResult;
  };
}

let dbInstance: IDBPDatabase<DoomsdayDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<DoomsdayDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<DoomsdayDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Version 1 stores
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        sessionStore.createIndex('by-date', 'date');
        sessionStore.createIndex('by-mode', 'mode');
      }

      if (!db.objectStoreNames.contains('answers')) {
        const answerStore = db.createObjectStore('answers', {
          keyPath: 'id',
          autoIncrement: true,
        });
        answerStore.createIndex('by-session', 'sessionId');
        answerStore.createIndex('by-century', 'century');
        answerStore.createIndex('by-month', 'generatedMonth');
      }

      // Version 2: user_stats + daily_results + answer state index
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('user_stats')) {
          db.createObjectStore('user_stats', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }

        if (!db.objectStoreNames.contains('daily_results')) {
          db.createObjectStore('daily_results', {
            keyPath: 'date',
          });
        }

        // Version 2: add new indexes
        // (indexes are added in upgrade, no need to check existing)
      }
    },
  });

  return dbInstance;
}

// ── Sessions ─────────────────────────────────────────────────────

export async function createSession(session: Omit<Session, 'id'>): Promise<number> {
  const db = await getDB();
  return db.add('sessions', session as Session);
}

export async function getAllSessions(): Promise<Session[]> {
  const db = await getDB();
  const sessions = await db.getAll('sessions');
  const answers = await db.getAll('answers');
  
  for (const s of sessions) {
    const sessionAnswers = answers.filter(a => a.sessionId === s.id);
    if (sessionAnswers.length > 0) {
      const correct = sessionAnswers.filter(a => a.state === 'correct' || a.state === 'correct_with_help').length;
      s.totalQuestions = sessionAnswers.length;
      s.correctAnswers = correct;
      s.accuracy = Math.round((correct / sessionAnswers.length) * 100);
      s.avgTimeMs = Math.round(sessionAnswers.reduce((sum, a) => sum + a.timeMs, 0) / sessionAnswers.length);
    }
  }
  return sessions;
}

export async function getSessionsByMode(mode: Session['mode']): Promise<Session[]> {
  const db = await getDB();
  return db.getAllFromIndex('sessions', 'by-mode', mode);
}

export async function deleteSession(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('sessions', id);
}

// ── Answers ──────────────────────────────────────────────────────

export async function addAnswer(answer: Omit<Answer, 'id'>): Promise<number> {
  const db = await getDB();
  return db.add('answers', answer as Answer);
}

export async function getAnswersBySession(sessionId: number): Promise<Answer[]> {
  const db = await getDB();
  return db.getAllFromIndex('answers', 'by-session', sessionId);
}

export async function getAllAnswers(): Promise<Answer[]> {
  const db = await getDB();
  return db.getAll('answers');
}

// ── User Stats ───────────────────────────────────────────────────

export async function getOrCreateUserStats(): Promise<UserStats & { id: number }> {
  const db = await getDB();
  const all = await db.getAll('user_stats');
  if (all.length > 0) {
    return all[0] as UserStats & { id: number };
  }
  const id = await db.add('user_stats', {
    lastCompletedDate: null,
    streakCount: 0,
    bestStreak: 0,
    totalDailyCompleted: 0,
  });
  return { id, lastCompletedDate: null, streakCount: 0, bestStreak: 0, totalDailyCompleted: 0 };
}

export async function updateUserStats(stats: UserStats & { id: number }): Promise<void> {
  const db = await getDB();
  await db.put('user_stats', stats);
}

// ── Daily Results ────────────────────────────────────────────────

export async function saveDailyResult(result: DailyResult): Promise<void> {
  const db = await getDB();
  await db.put('daily_results', result);
}

export async function getDailyResult(date: string): Promise<DailyResult | undefined> {
  const db = await getDB();
  return db.get('daily_results', date);
}

export async function hasCompletedDaily(date: string): Promise<boolean> {
  const db = await getDB();
  const result = await db.get('daily_results', date);
  return !!result;
}

// ── Analytics Queries ────────────────────────────────────────────

export async function getAccuracyByCentury(): Promise<{ century: number; accuracy: number }[]> {
  const db = await getDB();
  const answers = await db.getAll('answers');
  const centuryMap = new Map<number, { total: number; correct: number }>();

  for (const a of answers) {
    const existing = centuryMap.get(a.century) || { total: 0, correct: 0 };
    existing.total++;
    if (a.state === 'correct' || a.state === 'correct_with_help') {
      existing.correct++;
    }
    centuryMap.set(a.century, existing);
  }

  return Array.from(centuryMap.entries())
    .map(([century, stats]) => ({
      century,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }))
    .sort((a, b) => a.century - b.century);
}

export async function getAccuracyByMonth(): Promise<{ month: string; accuracy: number; monthIdx: number }[]> {
  const db = await getDB();
  const answers = await db.getAll('answers');
  const monthMap = new Map<number, { total: number; correct: number }>();

  for (const a of answers) {
    const existing = monthMap.get(a.generatedMonth) || { total: 0, correct: 0 };
    existing.total++;
    if (a.state === 'correct' || a.state === 'correct_with_help') {
      existing.correct++;
    }
    monthMap.set(a.generatedMonth, existing);
  }

  return Array.from({ length: 12 }, (_, i) => {
    const stats = monthMap.get(i + 1) || { total: 0, correct: 0 };
    return {
      month: String(i + 1),
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      monthIdx: i + 1,
    };
  });
}

export async function getStateDistribution(): Promise<{
  correct: number;
  incorrect: number;
  correct_with_help: number;
  incorrect_with_help: number;
}> {
  const db = await getDB();
  const answers = await db.getAll('answers');

  return {
    correct: answers.filter((a) => a.state === 'correct').length,
    incorrect: answers.filter((a) => a.state === 'incorrect').length,
    correct_with_help: answers.filter((a) => a.state === 'correct_with_help').length,
    incorrect_with_help: answers.filter((a) => a.state === 'incorrect_with_help').length,
  };
}

export async function getWeaknessAnalysis(): Promise<{
  month: number;
  errorRate: number;
  total: number;
}[]> {
  const db = await getDB();
  const answers = await db.getAll('answers');
  const monthMap = new Map<number, { total: number; errors: number }>();

  for (const a of answers) {
    const existing = monthMap.get(a.generatedMonth) || { total: 0, errors: 0 };
    existing.total++;
    if (a.state === 'incorrect' || a.state === 'incorrect_with_help') {
      existing.errors++;
    }
    monthMap.set(a.generatedMonth, existing);
  }

  return Array.from({ length: 12 }, (_, i) => {
    const stats = monthMap.get(i + 1) || { total: 0, errors: 0 };
    return {
      month: i + 1,
      errorRate: stats.total > 0 ? Math.round((stats.errors / stats.total) * 100) : 0,
      total: stats.total,
    };
  });
}

export async function getProgressOverTime(): Promise<{ date: string; accuracy: number; avgTime: number }[]> {
  const db = await getDB();
  const sessions = await db.getAllFromIndex('sessions', 'by-date');
  const answers = await db.getAll('answers');

  const validSessions = sessions.filter(s => {
    const sessionAnswers = answers.filter(a => a.sessionId === s.id);
    return sessionAnswers.length > 0;
  });

  return validSessions.map((s) => {
    const sessionAnswers = answers.filter(a => a.sessionId === s.id);
    const correct = sessionAnswers.filter(a => a.state === 'correct' || a.state === 'correct_with_help').length;
    const accuracy = Math.round((correct / sessionAnswers.length) * 100);
    const avgTimeMs = Math.round(sessionAnswers.reduce((sum, a) => sum + a.timeMs, 0) / sessionAnswers.length);
    return {
      date: s.date,
      accuracy,
      avgTime: Math.round(avgTimeMs / 100) / 10,
    };
  });
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('answers');
  await db.clear('sessions');
  await db.clear('user_stats');
  await db.clear('daily_results');
}
