/**
 * Pythagorean name number calculation
 * A=1, B=2, ... I=9, J=1, K=2, ... (mod 9 cycle)
 */
export function calculateNameNumber(name: string): number {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "");
  if (!letters) return 0;
  let sum = 0;
  for (const ch of letters) {
    const val = ch.charCodeAt(0) - 64; // A=1..Z=26
    sum += ((val - 1) % 9) + 1;
  }
  // Reduce to single digit
  let n = sum;
  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((s, d) => s + Number.parseInt(d, 10), 0);
  }
  return n;
}

/**
 * Chaldean name number calculation
 */
const CHALDEAN_MAP: Record<string, number> = {
  A: 1,
  I: 1,
  J: 1,
  Q: 1,
  Y: 1,
  B: 2,
  K: 2,
  R: 2,
  C: 3,
  G: 3,
  L: 3,
  S: 3,
  D: 4,
  M: 4,
  T: 4,
  E: 5,
  H: 5,
  N: 5,
  X: 5,
  U: 6,
  V: 6,
  W: 6,
  O: 7,
  Z: 7,
  F: 8,
  P: 8,
};

export function calculateChaldeanNameNumber(name: string): number {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "");
  if (!letters) return 0;
  let sum = 0;
  for (const ch of letters) {
    sum += CHALDEAN_MAP[ch] ?? 0;
  }
  if (sum === 0) return 0;
  let n = sum;
  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((s, d) => s + Number.parseInt(d, 10), 0);
  }
  return n;
}

export function reduceMonth(month: number): number {
  if (month <= 9) return month;
  if (month === 10) return 1;
  if (month === 11) return 2;
  return 3; // 12
}

export const NAME_NUMBER_MEANINGS: Record<number, string> = {
  1: "Leadership, independence, ambition, pioneering spirit.",
  2: "Diplomacy, sensitivity, cooperation, emotional depth.",
  3: "Creativity, self-expression, communication, optimism.",
  4: "Hard work, stability, discipline, practical builder.",
  5: "Freedom, adaptability, adventure, quick thinking.",
  6: "Nurturing, responsibility, harmony, family-oriented.",
  7: "Analysis, introspection, wisdom, spiritual seeker.",
  8: "Power, material success, authority, ambitious drive.",
  9: "Compassion, humanitarianism, universal love, idealism.",
};

export const MONTH_NUMBER_MEANINGS: Record<number, string> = {
  1: "Month 1 (Jan) — A fresh start; natural born leader with initiative.",
  2: "Month 2 (Feb) — Cooperative; relationship-focused and intuitive.",
  3: "Month 3 (Mar) — Creative and expressive; strong communication.",
  4: "Month 4 (Apr) — Grounded and methodical; builder energy.",
  5: "Month 5 (May) — Adventurous and versatile; loves change.",
  6: "Month 6 (Jun) — Nurturing and harmonious; family first.",
  7: "Month 7 (Jul) — Introspective and spiritual; seeks deeper truth.",
  8: "Month 8 (Aug) — Ambitious and powerful; material mastery.",
  9: "Month 9 (Sep) — Compassionate and wise; service to others.",
  10: "Month 10 (Oct) — Like 1, leadership with added depth and experience.",
  11: "Month 11 (Nov) — Highly intuitive; master number energy.",
  12: "Month 12 (Dec) — Creative completion; generous and optimistic.",
};
