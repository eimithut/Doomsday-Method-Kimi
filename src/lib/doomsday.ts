/**
 * John Conway's Doomsday Algorithm Implementation
 * Calculates the day of the week for any given date.
 */
import type { Weekday } from '../types';

/**
 * Check if a year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get the century anchor day for the Gregorian calendar
 * The anchor day for a century repeats every 400 years
 */
export function getCenturyAnchor(century: number): Weekday {
  // Century code formula: (5 * (century % 4) + 2) % 7
  // But the standard Conway approach uses known anchors
  const centuryIndex = Math.floor(century / 100);
  const anchor = (5 * (centuryIndex % 4) + 2) % 7;
  return anchor as Weekday;
}

/**
 * Get the doomsday (anchor day) for a specific year
 * Using the "odd + 11" method or standard Conway method
 */
export function getYearDoomsday(year: number): Weekday {
  const century = Math.floor(year / 100) * 100;
  const yy = year - century; // Last two digits

  // Conway's method:
  // 1. Divide yy by 12: a = floor(yy / 12)
  // 2. Remainder: b = yy % 12
  // 3. Divide b by 4: c = floor(b / 4)
  // 4. Sum: a + b + c
  // 5. Add century anchor
  // 6. Modulo 7

  const a = Math.floor(yy / 12);
  const b = yy % 12;
  const c = Math.floor(b / 4);
  const centuryAnchor = getCenturyAnchor(century);

  return ((a + b + c + centuryAnchor) % 7) as Weekday;
}

/**
 * Get the doomsday date for a specific month
 * These are the dates that always fall on the year's doomsday
 */
export function getMonthDoomsday(month: number, year: number): number {
  const leap = isLeapYear(year);

  switch (month) {
    case 1: return leap ? 4 : 3;  // Jan 3 (non-leap), Jan 4 (leap)
    case 2: return leap ? 29 : 28; // Feb 28/29
    case 3: return 14; // Pi day! March 14
    case 4: return 4;  // 4/4
    case 5: return 9;  // 5/9
    case 6: return 6;  // 6/6
    case 7: return 11; // 7/11
    case 8: return 8;  // 8/8
    case 9: return 5;  // 9/5
    case 10: return 10; // 10/10
    case 11: return 7;  // 11/7
    case 12: return 12; // 12/12
    default: return 4;
  }
}

/**
 * Calculate the day of the week for any date
 * Returns 0=Sunday, 1=Monday, ..., 6=Saturday
 */
export function calculateWeekday(year: number, month: number, day: number): Weekday {
  const yearDoomsday = getYearDoomsday(year);
  const monthDoomsday = getMonthDoomsday(month, year);

  // Calculate difference between target day and month's doomsday
  const diff = day - monthDoomsday;

  // Add difference to year's doomsday, modulo 7
  // Handle negative modulo correctly
  let result = (yearDoomsday + diff) % 7;
  if (result < 0) result += 7;

  return result as Weekday;
}

/**
 * Get the "month code" for quick calculation
 * This is the offset from the year's doomsday to the first day of the month
 */
export function getMonthCode(month: number, year: number): number {
  const doomsday = getMonthDoomsday(month, year);
  const weekdayOfDoomsday = calculateWeekday(year, month, doomsday);

  // Calculate what day of the week the 1st of the month is
  let firstDay = (weekdayOfDoomsday - ((doomsday - 1) % 7)) % 7;
  if (firstDay < 0) firstDay += 7;

  return firstDay;
}

/**
 * Generate a random date within a reasonable range for training
 * Default: years 1600-2399 (full Gregorian calendar range)
 */
export function generateRandomDate(
  minYear: number = 1600,
  maxYear: number = 2399
): { year: number; month: number; day: number } {
  const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
  const month = Math.floor(Math.random() * 12) + 1;

  // Get days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;

  return { year, month, day };
}

/**
 * Get the century code with a descriptive label
 */
export function getCenturyInfo(century: number): { anchor: Weekday; label: string } {
  const anchor = getCenturyAnchor(century);
  const labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return { anchor, label: labels[anchor] };
}

/**
 * Verify the algorithm against JavaScript's native Date
 * Returns true if our calculation matches the native implementation
 */
export function verifyAgainstNative(year: number, month: number, day: number): boolean {
  const ourResult = calculateWeekday(year, month, day);
  const nativeDate = new Date(year, month - 1, day);
  const nativeResult = nativeDate.getDay() as Weekday;
  return ourResult === nativeResult;
}

/**
 * Get mnemonic hints for month doomsdays
 */
export function getMnemonicForMonth(month: number): string {
  const mnemonics: Record<number, string> = {
    1: 'Jan 3 (or 4 in leap years)',
    2: 'Feb 28 (or 29 in leap years) - last day of month',
    3: 'March 14 - Pi Day! 3.14',
    4: '4/4 - Easy!',
    5: '5/9 - "I work 9 to 5"',
    6: '6/6 - Easy!',
    7: '7/11 - "7-Eleven"',
    8: '8/8 - Easy!',
    9: '9/5 - "9 to 5"',
    10: '10/10 - Easy!',
    11: '11/7 - "7-Eleven" (reversed)',
    12: '12/12 - Easy!',
  };
  return mnemonics[month] || '';
}

/**
 * Common century anchors for reference
 */
export const COMMON_CENTURY_ANCHORS: Record<number, { anchor: Weekday; day: string }> = {
  1500: { anchor: 3, day: 'Wednesday' },
  1600: { anchor: 2, day: 'Tuesday' },
  1700: { anchor: 0, day: 'Sunday' },
  1800: { anchor: 5, day: 'Friday' },
  1900: { anchor: 3, day: 'Wednesday' },
  2000: { anchor: 2, day: 'Tuesday' },
  2100: { anchor: 0, day: 'Sunday' },
  2200: { anchor: 5, day: 'Friday' },
  2300: { anchor: 3, day: 'Wednesday' },
};

/**
 * Get step-by-step explanation of the calculation
 */
export function getCalculationSteps(year: number, month: number, day: number): string[] {
  const steps: string[] = [];
  const century = Math.floor(year / 100) * 100;
  const yy = year - century;
  const leap = isLeapYear(year);

  steps.push(`Step 1: Century anchor for ${century}s is ${getCenturyInfo(century).label}`);
  steps.push(`Step 2: Take last two digits: ${yy}`);
  steps.push(`Step 3: ${yy} ÷ 12 = ${Math.floor(yy / 12)} remainder ${yy % 12}`);
  steps.push(`Step 4: ${yy % 12} ÷ 4 = ${Math.floor((yy % 12) / 4)} (integer division)`);

  const a = Math.floor(yy / 12);
  const b = yy % 12;
  const c = Math.floor(b / 4);
  const sum = a + b + c;
  const centuryAnchor = getCenturyAnchor(century);

  steps.push(`Step 5: Sum: ${a} + ${b} + ${c} = ${sum}`);
  steps.push(`Step 6: ${sum} + century anchor (${centuryAnchor}) = ${sum + centuryAnchor}`);
  steps.push(`Step 7: ${sum + centuryAnchor} mod 7 = ${(sum + centuryAnchor) % 7} → Year's doomsday`);

  const monthDoomsday = getMonthDoomsday(month, year);
  steps.push(`Step 8: Month doomsday: ${month}/${monthDoomsday}${leap ? ' (leap year)' : ''}`);
  steps.push(`Step 9: ${day} - ${monthDoomsday} = ${day - monthDoomsday} days difference`);

  const result = calculateWeekday(year, month, day);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  steps.push(`Step 10: Doomsday + ${day - monthDoomsday} = ${dayNames[result]} ✓`);

  return steps;
}
