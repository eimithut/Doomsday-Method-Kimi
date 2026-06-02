/**
 * Seeded Pseudo-Random Number Generator (PRNG)
 * and Countdown Helpers for the Daily Challenge
 */

// Simple Linear Congruential Generator (LCG)
class LCG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

/**
 * Generates a unique numeric seed from a Date object
 */
export function dateSeed(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return (y * 10000) + (m * 100) + d;
}

/**
 * Returns the current date as an ISO-like date string 'YYYY-MM-DD' representing "today"
 */
export function getTodayKey(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Generates a list of deterministic, seeded dates between minYear and maxYear
 */
export function generateSeededDates(
  seed: number,
  count: number,
  minYear: number,
  maxYear: number
): { year: number; month: number; day: number }[] {
  const prng = new LCG(seed);
  const dates: { year: number; month: number; day: number }[] = [];

  for (let i = 0; i < count; i++) {
    const year = prng.nextInt(minYear, maxYear);
    const month = prng.nextInt(1, 12);
    const maxDays = new Date(year, month, 0).getDate();
    const day = prng.nextInt(1, maxDays);
    dates.push({ year, month, day });
  }

  return dates;
}

/**
 * Returns the milliseconds remaining until the next local day starts (midnight)
 */
export function getTimeUntilNextDay(date: Date = new Date()): number {
  const nextDay = new Date(date);
  nextDay.setHours(24, 0, 0, 0); // Midnight start of tomorrow
  return nextDay.getTime() - date.getTime();
}

/**
 * Formats a duration in milliseconds into a 'HH:MM:SS' countdown string
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSecs = Math.floor(ms / 1000);
  const secs = totalSecs % 60;
  const totalMins = Math.floor(totalSecs / 60);
  const mins = totalMins % 60;
  const hours = Math.floor(totalMins / 60);

  return [
    String(hours).padStart(2, '0'),
    String(mins).padStart(2, '0'),
    String(secs).padStart(2, '0'),
  ].join(':');
}
