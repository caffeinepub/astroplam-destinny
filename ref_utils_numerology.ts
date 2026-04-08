/**
 * Vedic Numerology calculation utilities
 */

export interface NumerologyResult {
  basicNumber: number;
  destinyNumber: number;
  chartNumbers: number[]; // all numbers placed (with repetition)
  cellCounts: Record<number, number>; // count of each digit 1-9
}

/**
 * Reduce a number to single digit (1-9) by summing digits.
 * Note: 0 stays 0 (but we skip 0s when placing in chart).
 */
function reduceToSingleDigit(input: number): number {
  let n = input;
  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((sum, d) => sum + Number.parseInt(d, 10), 0);
  }
  return n;
}

/**
 * Extract individual non-zero digits from a number.
 * e.g. 22 → [2, 2], 5 → [5], 11 → [1, 1], 3 → [3], 0 → []
 */
function getIndividualDigits(n: number): number[] {
  return String(n)
    .split("")
    .map(Number)
    .filter((d) => d !== 0);
}

export function calculateNumerology(dob: string): NumerologyResult {
  const parts = dob.split(/[-/]/);
  if (parts.length !== 3) {
    throw new Error("Invalid DOB format. Use DD-MM-YYYY");
  }

  const day = Number.parseInt(parts[0], 10);
  const month = Number.parseInt(parts[1], 10);
  const year = Number.parseInt(parts[2], 10);

  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
    throw new Error("Invalid date values");
  }

  const basicNumber = reduceToSingleDigit(day);

  const dobDigits = dob.replace(/[-/]/g, "").split("").map(Number);
  const destinySum = dobDigits.reduce((a, b) => a + b, 0);
  const destinyNumber = reduceToSingleDigit(destinySum);

  const chartNumbers: number[] = [];

  const simpleDates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30];
  const isSimpleDate = simpleDates.includes(day);

  const dayDigits = getIndividualDigits(day);
  for (const d of dayDigits) {
    chartNumbers.push(d);
  }

  if (!isSimpleDate) {
    chartNumbers.push(basicNumber);
  }

  const monthDigits = getIndividualDigits(month);
  for (const d of monthDigits) {
    chartNumbers.push(d);
  }

  const yearStr = String(year).padStart(4, "0");
  const lastTwoDigits = yearStr.slice(-2).split("").map(Number);
  for (const d of lastTwoDigits) {
    if (d !== 0) {
      chartNumbers.push(d);
    }
  }

  chartNumbers.push(destinyNumber);

  const cellCounts: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) {
    cellCounts[i] = 0;
  }
  for (const n of chartNumbers) {
    if (n >= 1 && n <= 9) {
      cellCounts[n] = (cellCounts[n] || 0) + 1;
    }
  }

  return { basicNumber, destinyNumber, chartNumbers, cellCounts };
}

export function getCellDisplay(
  number: number,
  cellCounts: Record<number, number>,
): string {
  const count = cellCounts[number] || 0;
  if (count === 0) return "";
  return String(number).repeat(count);
}

export const GRID_LAYOUT: number[][] = [
  [3, 1, 9],
  [6, 7, 5],
  [2, 8, 4],
];

export function validateDOB(
  day: number,
  month: number,
  year: number,
): string | null {
  if (day < 1 || day > 31) return "Day must be between 1 and 31";
  if (month < 1 || month > 12) return "Month must be between 1 and 12";
  if (year < 1800 || year > 2200) return "Year must be between 1800 and 2200";

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth)
    return `${getMonthName(month)} has only ${daysInMonth} days`;

  return null;
}

export function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month - 1] || "";
}

export function formatDOB(day: number, month: number, year: number): string {
  return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${String(year)}`;
}

export function getDayOfWeekNumber(date: Date): number {
  const map = [1, 2, 9, 5, 3, 6, 8];
  return map[date.getDay()];
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function calculateDayNumber(date: Date, monthNumber: number): number {
  const dow = getDayOfWeekNumber(date);
  let n = monthNumber + dow;
  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((sum, d) => sum + Number.parseInt(d, 10), 0);
  }
  return n;
}

export function calculateYearNumber(
  day: number,
  month: number,
  targetYear: number,
): number {
  const birthdayInYear = new Date(targetYear, month - 1, day);
  const dayOfWeekNum = getDayOfWeekNumber(birthdayInYear);

  const yearStr = String(targetYear).padStart(4, "0");
  const lastTwo = yearStr.slice(-2).split("").map(Number);

  let sum = day + month + dayOfWeekNum;
  for (const d of lastTwo) {
    if (d !== 0) sum += d;
  }

  let n = sum;
  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((s, d) => s + Number.parseInt(d, 10), 0);
  }
  return n;
}

export interface DasaPeriod {
  dasaNumber: number;
  startYear: number;
  endYear: number;
}

export interface MonthPeriod {
  monthNumber: number;
  startDate: Date;
  endDate: Date;
}

export function calculateMonthCycle(
  day: number,
  month: number,
  targetYear: number,
  yearNumber: number,
): MonthPeriod[] {
  const startDate = new Date(targetYear, month - 1, day);

  const sequence: number[] = [];
  for (let i = 0; i < 9; i++) {
    sequence.push(((yearNumber - 1 + i) % 9) + 1);
  }

  const periods: MonthPeriod[] = [];
  let currentDate = new Date(startDate);

  for (const num of sequence) {
    const duration = num * 8;
    const periodStart = new Date(currentDate);
    const periodEnd = new Date(currentDate);
    periodEnd.setDate(periodEnd.getDate() + duration - 1);

    periods.push({
      monthNumber: num,
      startDate: periodStart,
      endDate: periodEnd,
    });

    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + duration);
  }

  return periods;
}

export function calculateDasaCycle(
  basicNumber: number,
  birthYear: number,
  fromYear: number,
  toYear: number,
): DasaPeriod[] {
  // Dasa sequence always starts at birthYear with basicNumber.
  // Sequence: basicNumber, basicNumber+1, ..., 9, 1, 2, ... repeating.
  // Each dasa lasts exactly <dasaNumber> years.
  // Total one full cycle = 1+2+3+4+5+6+7+8+9 = 45 years.

  const result: DasaPeriod[] = [];

  // Anchor: first dasa starts at birthYear with basicNumber
  // Walk forward from birthYear in cycles of 45 years until we pass toYear,
  // and also walk backward from birthYear to cover fromYear if it's before birthYear.

  // Build the 9-number sequence starting from basicNumber
  const makeSequence = (): number[] => {
    const seq: number[] = [];
    for (let i = 0; i < 9; i++) {
      seq.push(((basicNumber - 1 + i) % 9) + 1);
    }
    return seq;
  };

  const sequence = makeSequence();
  const cycleLength = 45; // 1+2+...+9

  // Find the earliest cycle start that covers fromYear.
  // Each full cycle is 45 years. Anchor = birthYear.
  // cycleIndex k means cycle starts at birthYear + k*45.
  // We need cycleStart <= fromYear, so k <= (fromYear - birthYear) / 45.
  const kStart = Math.floor((fromYear - birthYear) / cycleLength) - 1;
  const kEnd = Math.ceil((toYear - birthYear) / cycleLength) + 1;

  for (let k = kStart; k <= kEnd; k++) {
    const cycleStartYear = birthYear + k * cycleLength;
    let currentYear = cycleStartYear;

    for (const num of sequence) {
      const startYear = currentYear;
      const endYear = currentYear + num;
      currentYear = endYear;

      // Only include periods that overlap with [fromYear, toYear]
      if (endYear > fromYear && startYear <= toYear) {
        result.push({ dasaNumber: num, startYear, endYear });
      }

      if (currentYear > toYear) break;
    }
  }

  // Sort by startYear and deduplicate
  result.sort((a, b) => a.startYear - b.startYear);
  const seen = new Set<string>();
  const deduped: DasaPeriod[] = [];
  for (const p of result) {
    const key = `${p.startYear}-${p.endYear}-${p.dasaNumber}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(p);
    }
  }

  return deduped;
}
