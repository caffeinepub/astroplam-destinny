import type { BlueCard, RedCard, YellowCard } from "../types/nadi";

const HOUSES: Array<{ house: number; name: string }> = [
  { house: 1, name: "Soul" },
  { house: 2, name: "Profusion" },
  { house: 3, name: "Interaction" },
  { house: 4, name: "Earth" },
  { house: 5, name: "Love" },
  { house: 6, name: "Evil" },
  { house: 7, name: "Companion" },
  { house: 8, name: "Mystic" },
  { house: 9, name: "Blessing" },
  { house: 10, name: "Authority" },
  { house: 11, name: "Desires" },
  { house: 12, name: "Death" },
];

const PLANETS: Array<{ planet: string; planetIndex: number }> = [
  { planet: "King", planetIndex: 1 },
  { planet: "Queen", planetIndex: 2 },
  { planet: "Aggression", planetIndex: 3 },
  { planet: "Demon", planetIndex: 4 },
  { planet: "Wisdom", planetIndex: 5 },
  { planet: "Sorrow", planetIndex: 6 },
  { planet: "Intellect", planetIndex: 7 },
  { planet: "Salvation", planetIndex: 8 },
  { planet: "Beauty", planetIndex: 9 },
  { planet: "Revolution", planetIndex: 10 },
  { planet: "Illusion", planetIndex: 11 },
  { planet: "Destruction", planetIndex: 12 },
];

export function createBlueCards(): BlueCard[] {
  const cards: BlueCard[] = [];
  for (const h of HOUSES) {
    for (let i = 0; i < 4; i++) {
      cards.push({
        type: "blue",
        house: h.house,
        name: h.name,
        id: `blue-${h.house}-${i}`,
      });
    }
  }
  return cards;
}

export function createRedCards(): RedCard[] {
  return PLANETS.map((p) => ({
    type: "red",
    planet: p.planet,
    planetIndex: p.planetIndex,
    id: `red-${p.planetIndex}`,
  }));
}

export function createYellowCards(): YellowCard[] {
  return Array.from({ length: 12 }, (_, i) => ({
    type: "yellow",
    rasiNumber: i + 1,
    id: `yellow-${i + 1}`,
  }));
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getBlueCount(planet: string): number | "repeat" {
  const two = ["King", "Queen", "Revolution", "Illusion", "Destruction"];
  const three = ["Aggression", "Wisdom", "Sorrow", "Intellect", "Beauty"];
  const repeat = ["Demon", "Salvation"];
  if (two.includes(planet)) return 2;
  if (three.includes(planet)) return 3;
  if (repeat.includes(planet)) return "repeat";
  return 2;
}

export const PLANET_SYMBOLS: Record<string, string> = {
  King: "♛",
  Queen: "♕",
  Aggression: "⚔",
  Demon: "☽",
  Wisdom: "☿",
  Sorrow: "♄",
  Intellect: "✦",
  Salvation: "✸",
  Beauty: "♀",
  Revolution: "⚡",
  Illusion: "∞",
  Destruction: "✺",
};

export const HOUSE_SYMBOLS: Record<number, string> = {
  1: "☉",
  2: "✦",
  3: "☽",
  4: "⊕",
  5: "♡",
  6: "⚠",
  7: "⚖",
  8: "🕗",
  9: "✿",
  10: "♛",
  11: "★",
  12: "✝",
};
