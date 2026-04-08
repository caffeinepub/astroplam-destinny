import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import {
  calculateDasaCycle,
  calculateNumerology,
  calculateYearNumber,
  formatDOB,
} from "../utils/numerology";
import { NatalChart } from "./NatalChart";

type Color = "green" | "yellow" | "red";

const colorBorder: Record<Color, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
};

const colorLabels: Record<Color, string> = {
  green: "✓ Positive Year",
  yellow: "~ Neutral Year",
  red: "✗ Challenging Year",
};

const colorLabelText: Record<Color, string> = {
  green: "#15803d",
  yellow: "#854d0e",
  red: "#b91c1c",
};

const colorLabelBg: Record<Color, string> = {
  green: "#f0fdf4",
  yellow: "#fefce8",
  red: "#fef2f2",
};

const DESTINY_POSITIVE_OVERRIDE = new Set([1, 3, 4, 5, 6, 8]);
const DESTINY_NEUTRAL_OVERRIDE = new Set([2, 7, 9]);

/** Count all occurrences from natal + dasa + year number (all digits 1-9). */
function makeCombinedCounts(
  natalCounts: Record<number, number>,
  dasaNumber: number,
  yearNum: number,
): Record<number, number> {
  const cc = { ...natalCounts };
  if (dasaNumber >= 1 && dasaNumber <= 9)
    cc[dasaNumber] = (cc[dasaNumber] ?? 0) + 1;
  if (yearNum >= 1 && yearNum <= 9) cc[yearNum] = (cc[yearNum] ?? 0) + 1;
  return cc;
}

function getYearColor(
  yearNum: number,
  destinyNum: number,
  combinedCounts: Record<number, number>,
): Color {
  const cc = combinedCounts[yearNum] ?? 0;

  if (yearNum === destinyNum) {
    if (DESTINY_POSITIVE_OVERRIDE.has(destinyNum)) return "green";
    if (DESTINY_NEUTRAL_OVERRIDE.has(destinyNum)) return "yellow";
  }

  switch (yearNum) {
    case 1:
      if (cc === 1) return "green"; // single 1 always positive
      if (cc % 2 === 0) return "green";
      return "red";
    case 2:
      return "yellow";
    case 3:
      if (cc === 1) return "green";
      return "red";
    case 4:
      if (cc % 2 === 0) return "yellow";
      return "red";
    case 5:
      return "green";
    case 6:
      if (cc === 1) return "green";
      if (cc === 2) return "yellow";
      return "red";
    case 7:
      return "yellow";
    case 8:
      if (cc % 2 === 0) return "green";
      return "red";
    case 9:
      if (cc <= 2) return "yellow";
      return "red";
    default:
      return "yellow";
  }
}

/**
 * Natal-only combinations — shown once above the year cards.
 * Uses only natal chart counts (no dasa/year contribution).
 */
function getNatalCombinations(natalCounts: Record<number, number>): string[] {
  const has = (n: number) => (natalCounts[n] ?? 0) > 0;
  const count = (n: number) => natalCounts[n] ?? 0;
  const results: string[] = [];

  // 9-4/5-4 inactive if natal has BOTH 9 and 5 (regardless of 4)
  const nineAndFiveInNatal = has(9) && has(5);

  // 9-4 combination (inactive if natal has both 9 and 5)
  if (has(9) && has(4) && !nineAndFiveInNatal) {
    results.push(
      "9-4 Combination: This chart carries a natural tendency for litigation or health-related challenges during certain periods. Check your Nadi chart for more specific events. Other attributes of your personal years remain prominent.",
    );
  }

  // 5-4 combination (inactive if natal has both 9 and 5)
  if (has(5) && has(4) && !nineAndFiveInNatal) {
    results.push(
      "5-4 Combination: This chart has a tendency for litigation or health-related events in certain years. Check your Nadi chart for more specific events. Other attributes of your personal years remain prominent.",
    );
  }

  // 5-7 (6 must NOT be in natal)
  if (has(5) && has(7) && !has(6)) {
    results.push(
      "5-7 Combination: Excellent potential for financial growth and an attractive, magnetic personality. This combination brings material opportunities and natural charm.",
    );
  }

  // 5-6-7
  if (has(5) && has(6) && has(7)) {
    results.push(
      "5-6-7 Combination: Your lifestyle tends to be more extravagant than usual standards. You are naturally drawn to comfort, luxury, and experiences beyond the ordinary.",
    );
  }

  // 2-8-4 (natal must have ALL THREE: 2, 8, AND 4)
  const twoEightFour = has(2) && has(8) && has(4);
  if (twoEightFour) {
    results.push(
      "2-8-4 Combination: Life brings profound highs and lows. Significant swings in fortune — personal or professional — are part of your journey. Stay grounded during both peaks and valleys.",
    );
  }

  // 1-odd8 (7 must NOT be in natal)
  if (!has(7)) {
    const nat8 = count(8);
    const nat1 = count(1);
    if (nat8 % 2 !== 0 && nat8 > 0 && nat1 > 0) {
      results.push(
        "1-Odd 8 Combination: This chart carries simultaneous drive and emotional intensity. Success comes, often through hardship and inner struggle. Resilience is your greatest asset.",
      );
    }
  }

  // 1-7-8
  if (has(1) && has(7) && has(8)) {
    results.push(
      "1-7-8 Combination: Acute intuition. This chart carries a deep inner knowing and instinctive awareness that guides important life decisions.",
    );
  }

  return results;
}

/**
 * Per-year combination texts appended after the main paragraph.
 * Uses combined counts (natal + dasa + year).
 */
function getYearCombinationTexts(
  natalCounts: Record<number, number>,
  combinedCounts: Record<number, number>,
  yearNum: number,
): string[] {
  const hasNatal = (n: number) => (natalCounts[n] ?? 0) > 0;
  const countCC = (n: number) => combinedCounts[n] ?? 0;
  const results: string[] = [];

  // 9-4/5-4 inactive if natal has BOTH 9 and 5
  const nineAndFiveInNatal = hasNatal(9) && hasNatal(5);

  if (!nineAndFiveInNatal) {
    // 9-4 active this year
    if ((hasNatal(9) && yearNum === 4) || (hasNatal(4) && yearNum === 9)) {
      results.push(
        "9-4 Combination active this year: Be cautious of litigation and health matters. Check your Nadi chart for more specific events. Other attributes of your personal year are also prominent.",
      );
    }
    // 5-4 active this year
    if ((hasNatal(5) && yearNum === 4) || (hasNatal(4) && yearNum === 5)) {
      results.push(
        "5-4 Combination active this year: Be cautious of litigation and health matters. Check your Nadi chart for more specific events. Other attributes of your personal year are also prominent.",
      );
    }
  }

  // 2-8-4 combination: only if natal has at least 2 of {2,8,4} AND combined has all 3
  const natalPairs284 = [
    hasNatal(2) && hasNatal(8),
    hasNatal(2) && hasNatal(4),
    hasNatal(8) && hasNatal(4),
  ].filter(Boolean).length;
  if (
    natalPairs284 >= 1 &&
    countCC(2) > 0 &&
    countCC(8) > 0 &&
    countCC(4) > 0
  ) {
    results.push(
      "2-8-4 Combination: This year may bring profound highs and lows. Stay grounded and avoid extreme decisions in either direction.",
    );
  }

  // 1-odd8 in year (7 must not be in natal)
  if (!hasNatal(7)) {
    const cc8 = countCC(8);
    const cc1 = countCC(1);
    if (cc8 % 2 !== 0 && cc8 > 0 && cc1 > 0) {
      results.push(
        "1-Odd 8 Combination active: This year intensifies your drive but also your inner struggle. Persistence and emotional balance are essential. Guard your mental well-being carefully.",
      );
    }
  }

  return results;
}

function getYearParagraph(
  yearNum: number,
  destinyNum: number,
  combinedCounts: Record<number, number>,
  natalCounts: Record<number, number>,
  dasaNumber: number,
  color: Color,
): string {
  const cc = combinedCounts[yearNum] ?? 0;
  const isDestiny = yearNum === destinyNum;
  const natCount = natalCounts[yearNum] ?? 0;
  // Intensified: natal has this number AND dasa is also this number
  const tripleAligned = natCount > 0 && dasaNumber === yearNum;

  if (yearNum === 1) {
    const extra =
      tripleAligned && cc % 2 !== 0
        ? " This is an intensified period — professional setbacks may feel more pronounced. Avoid impulsive career or financial decisions this year."
        : "";
    if (cc === 1 || color === "green") {
      return `This year brings a strong rise in your professional life. Your confidence peaks and opportunities come naturally. If you are employed, a promotion or recognition is highly likely. This is a great year to purchase property, a vehicle, or make important investments. Take bold steps — the energy favors you.${extra}`;
    }
    return `This year brings some instability in your professional path. Decision-making may feel harder and results may not match your effort. Avoid major financial risks or impulsive career moves. Focus on consistency and let things settle before making big changes.${extra}`;
  }

  if (yearNum === 2) {
    const extra = tripleAligned
      ? " Your emotional sensitivity is especially heightened this year — be extra cautious not to let feelings override practical judgment."
      : "";
    if (cc <= 1) {
      return `This year is generally stable for your career and finances. You may feel more emotionally driven and creative than usual. Be mindful not to make major decisions purely based on feelings — balance practicality with intuition. Collaborations and partnerships can work well for you this year.${extra}`;
    }
    return `This year you may find yourself overthinking and doubting your choices. Your emotional side is very active, which can cloud practical judgment. Avoid making business or financial decisions in an emotional state. Take time to reflect, seek advice, and think things through practically before acting.${extra}`;
  }

  if (yearNum === 3) {
    const extra = tripleAligned
      ? " With this number reinforced across multiple sources, both the financial opportunity and the family tension are amplified this year."
      : "";
    if (isDestiny) {
      return `Financially, this is a rewarding year for you. Income opportunities are strong and your sharp thinking helps you make smart moves. However, some disturbance in family life is possible — keep communication open with loved ones. Your intelligence and unconventional approach to problems will serve you well professionally.${extra}`;
    }
    if (cc === 1) {
      return `This is a good year for financial growth, especially through knowledge and skill-building. New learning opportunities may open doors for you. If you invest in improving yourself this year, the returns will be meaningful. Stay curious and keep exploring.${extra}`;
    }
    return `Family life may see some turbulence this year, which could distract you professionally. However, your sharp thinking helps you find solutions even under pressure. Don't let personal conflicts affect your work. Focus on problem-solving and use your mental clarity to navigate through challenges.${extra}`;
  }

  if (yearNum === 4) {
    // Intensified odd 4 (natal+dasa+year all bring 4, making odd)
    const intensifiedExtra =
      tripleAligned && cc % 2 !== 0
        ? " This is an especially intensified challenging period. The negative effects on career and life are heightened. Sudden family or marriage disturbances are more likely. Student matters and academic pressures may surface. Exercise extra caution in all major decisions."
        : "";
    if (isDestiny && cc % 2 !== 0) {
      return `Some extra expenses and travel are on the horizon this year, but your destiny favors you financially — money will come despite the challenges. Be prepared for unexpected costs and ensure your travel plans are well-organized. Some obstacles will appear but you have the resilience to handle them.${intensifiedExtra}`;
    }
    if (cc % 2 !== 0) {
      return `This year brings some extra challenges in your professional and personal life. Unexpected expenses may arise and travel could be stressful. If you must travel, opt for the most comfortable and direct route available. Keep your finances tight and avoid new financial commitments. Stay grounded and patient.${intensifiedExtra}`;
    }
    // even
    if (isDestiny) {
      return `Travel and some extra spending will occur this year, but your financial outlook remains positive. Money comes to you despite the costs. Challenges that arise will have solutions within reach. Keep a practical approach to expenses.${intensifiedExtra}`;
    }
    return `Travel is likely this year and extra spending in your personal life is possible. If challenges arise during travel, support and solutions will find you. Keep a buffer in your finances and manage expenses carefully. The year is manageable with planning.${intensifiedExtra}`;
  }

  if (yearNum === 5) {
    const extra = tripleAligned
      ? " With this energy amplified across multiple sources, keep a sharp eye on investment decisions and avoid anxiety-driven financial moves."
      : "";
    if (cc === 1) {
      return `This is an excellent year for financial growth. Your cash flow increases and multiple income avenues open up. You become more analytical and business-minded, making smart financial decisions. If you are in a job, thoughts of investment or starting something additional may surface — explore them carefully. A very promising year overall.${extra}`;
    }
    return `Financial energy is active this year but so is anxiety. You may feel restless about money matters and tend to overspend or over-invest. Make sure to ground yourself with daily exercise and avoid impulsive financial decisions. Research thoroughly before committing to any major purchase or investment.${extra}`;
  }

  if (yearNum === 6) {
    const extra = tripleAligned
      ? " With this combination intensified, social conflicts and legal disputes carry extra weight this year — handle all interpersonal matters with great care."
      : "";
    if (isDestiny && cc >= 2) {
      return `A financially positive year for you. Your desire for comfort and luxury is strong and you may spend generously on lifestyle upgrades. Some travel is likely. Be cautious of minor legal or interpersonal disputes — especially avoid conflicts with women. Despite the spending, your finances remain favorable.${extra}`;
    }
    if (cc === 1) {
      return `This year brings good financial energy and a desire to enjoy life's finer things. Short travel may occur and some minor legal or social conflicts are possible — handle them calmly and avoid escalation. Your finances are generally positive but spend mindfully.${extra}`;
    }
    return `The year is financially manageable but disputes and interpersonal friction are possible. Be especially careful to avoid arguments with women in your life — professional or personal. Extra spending is likely and legal matters could emerge if you're not careful. Stay composed and diplomatic.${extra}`;
  }

  if (yearNum === 7) {
    // Intensified 7 (natal+dasa+year all bring 7 → 777+ scenario)
    const intensifiedExtra = tripleAligned
      ? " This is an intensified 777 period — anxiety is significantly heightened, life may feel deeply unsettled, and travel is likely to be unfruitful. Visa applications or international opportunities face serious obstacles. Focus on mental well-being and avoid unnecessary long-distance travel."
      : "";
    if (cc >= 3) {
      return `This year brings heightened anxiety and some instability in your daily routine. Travel plans may not go as expected and visa applications or international opportunities could face obstacles. Career progress may feel slow. Focus on mental well-being, meditate if possible, and avoid unnecessary travel this year.${intensifiedExtra}`;
    }
    if (cc <= 1) {
      return `A year of steady progress and spiritual growth. Travel is fruitful and meaningful connections are made. If you have been thinking about relocating or applying for a visa to a developed country, this is a favorable year to try. Unmarried individuals may find meaningful romantic connections. Take time to relax and recharge.${intensifiedExtra}`;
    }
    return `Some anxiety and uncertainty may come this year. Travel may bring mixed results, though international opportunities are still possible. Life will see some changes — embrace them rather than resist. Stay adaptable and keep your expectations realistic.${intensifiedExtra}`;
  }

  if (yearNum === 8) {
    // Intensified odd 8 (natal+dasa+year all bring 8, making odd)
    const intensifiedExtra =
      tripleAligned && cc % 2 !== 0
        ? " This is an especially intensified period — feelings of depression and being stuck may be more pronounced than usual. Unwanted events may arrive more frequently. Avoid major financial investments or new business moves this year. As a remedy, focus on learning a new skill or developing yourself — this is the best use of your energy right now."
        : "";
    if (isDestiny && cc % 2 !== 0) {
      return `This is a year of hard work and inner struggle. You may feel that despite your best efforts, results are slow to come. Emotionally, you may feel stuck or low at times. Unwanted events may surprise you. However, your destiny supports financial gains even through difficulty. Use this year to learn something new and grow your skills — this is the best remedy.${intensifiedExtra}`;
    }
    if (cc % 2 !== 0) {
      return `This year demands patience and perseverance. You may feel overworked yet underappreciated, and unexpected events could add stress. Emotional fatigue is possible — take care of your mental health. Avoid making impulsive decisions when feeling frustrated. The rewards will come, but persistence is key this year.${intensifiedExtra}`;
    }
    return "A powerful year for career advancement and authority. If you are appearing for government exams or seeking promotions, this is highly favorable. Financial gains come with respect and recognition. This is also a great time to make significant purchases like property or a vehicle. Work steadily and the results will be impressive.";
  }

  if (yearNum === 9) {
    const extra = tripleAligned
      ? " With this energy reinforced across multiple sources, business fluctuations and feelings of frustration are amplified. Maintain steady daily routines to stay grounded."
      : "";
    if (isDestiny && cc >= 2) {
      return `Business may fluctuate this year and some frustration is likely. Work will come in waves — good periods followed by slow ones. You may feel stuck or unable to reach your full potential. Keep yourself motivated and maintain consistency even when things feel uncertain. This phase will pass.${extra}`;
    }
    if (cc <= 1) {
      return `A year of inner confidence and bold decision-making. You feel energetic and capable of taking on bigger challenges. Trust your instincts and don't hesitate to make the moves you have been planning. Career momentum picks up and a sense of purpose drives you forward.${extra}`;
    }
    return `This is a professionally frustrating year. If you run a business, sales and income may dip unexpectedly. You may feel blocked or stuck despite your efforts. Avoid impulsive decisions and instead focus on long-term strategies. Stay grounded and trust that this phase is temporary.${extra}`;
  }

  return color === "green"
    ? "This year brings positive energy for your career and finances. Stay focused and make the most of opportunities that come your way."
    : color === "yellow"
      ? "This year is generally stable. Avoid major risks and keep a steady approach to your professional and financial matters."
      : "This year brings some challenges. Stay patient, avoid impulsive decisions, and focus on consistent effort.";
}

interface YearCard {
  startYear: number;
  endYear: number;
  yearNumber: number;
  dasaNumber: number;
  natalCounts: Record<number, number>;
  color: Color;
  birthNumber: number;
  destinyNumber: number;
  combinedCounts: Record<number, number>;
}

interface CareerResult {
  cards: YearCard[];
  natalCounts: Record<number, number>;
  birthNumber: number;
  destinyNumber: number;
  natalCombinations: string[];
}

function buildCareerResult(
  day: number,
  month: number,
  year: number,
  startYear: number,
  numYears: number,
): CareerResult {
  const numResult = calculateNumerology(formatDOB(day, month, year));
  const { basicNumber, destinyNumber, cellCounts } = numResult;
  const natalCounts = cellCounts;

  const dasaCycles = calculateDasaCycle(
    basicNumber,
    year,
    startYear,
    startYear + numYears + 10,
  );

  const cards: YearCard[] = [];
  for (let i = 0; i < numYears; i++) {
    const y = startYear + i;
    const yearNum = calculateYearNumber(day, month, y);
    const dasa = dasaCycles.find((d) => d.startYear <= y && d.endYear > y);
    const dasaNumber = dasa?.dasaNumber ?? basicNumber;

    const combinedCounts = makeCombinedCounts(natalCounts, dasaNumber, yearNum);
    const color = getYearColor(yearNum, destinyNumber, combinedCounts);

    cards.push({
      startYear: y,
      endYear: y + 1,
      yearNumber: yearNum,
      dasaNumber,
      natalCounts,
      color,
      birthNumber: basicNumber,
      destinyNumber,
      combinedCounts,
    });
  }

  return {
    cards,
    natalCounts,
    birthNumber: basicNumber,
    destinyNumber,
    natalCombinations: getNatalCombinations(natalCounts),
  };
}

export default function CareerPrediction() {
  const [inputMode, setInputMode] = useState<"calendar" | "manual">("manual");
  const [calendarDate, setCalendarDate] = useState("");
  const [manualDD, setManualDD] = useState("");
  const [manualMM, setManualMM] = useState("");
  const [manualYYYY, setManualYYYY] = useState("");
  const [startYear, setStartYear] = useState(String(new Date().getFullYear()));
  const [numYears, setNumYears] = useState("5");
  const [result, setResult] = useState<CareerResult | null>(null);
  const [error, setError] = useState("");

  const mmRef = useRef<HTMLInputElement>(null);
  const yyyyRef = useRef<HTMLInputElement>(null);

  function handleManualDD(v: string) {
    const num = v.replace(/\D/g, "").slice(0, 2);
    setManualDD(num);
    if (num.length === 2) mmRef.current?.focus();
  }

  function handleManualMM(v: string) {
    const num = v.replace(/\D/g, "").slice(0, 2);
    setManualMM(num);
    if (num.length === 2) yyyyRef.current?.focus();
  }

  function calculate() {
    setError("");
    let day: number;
    let month: number;
    let year: number;
    if (inputMode === "calendar") {
      if (!calendarDate) {
        setError("Please select a date.");
        return;
      }
      const [y, m, d] = calendarDate.split("-").map(Number);
      day = d;
      month = m;
      year = y;
    } else {
      day = Number.parseInt(manualDD, 10);
      month = Number.parseInt(manualMM, 10);
      year = Number.parseInt(manualYYYY, 10);
      if (!day || !month || !year || manualYYYY.length !== 4) {
        setError("Please enter a valid date (DD / MM / YYYY).");
        return;
      }
    }
    if (
      day < 1 ||
      day > 31 ||
      month < 1 ||
      month > 12 ||
      year < 1800 ||
      year > 2100
    ) {
      setError("Please enter a valid date.");
      return;
    }
    const sy = Number.parseInt(startYear, 10);
    const ny = Number.parseInt(numYears, 10);
    if (!sy || sy < 1900 || sy > 2200) {
      setError("Please enter a valid starting year.");
      return;
    }
    if (!ny || ny < 1 || ny > 20) {
      setError("Number of years must be 1–20.");
      return;
    }
    setResult(buildCareerResult(day, month, year, sy, ny));
  }

  return (
    <div className="space-y-4" data-ocid="career.panel">
      {/* Input section */}
      <div
        className="rounded-2xl p-4 space-y-4"
        style={{ background: "#fffdf5", border: "1.5px solid #d4af37" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌟</span>
          <h2 className="text-xl font-bold" style={{ color: "#7a5c00" }}>
            Career Prediction
          </h2>
        </div>

        {/* DOB toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setInputMode("manual")}
            className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all"
            style={{
              background: inputMode === "manual" ? "#d4af37" : "#f5e9c4",
              color: inputMode === "manual" ? "#fff" : "#7a5c00",
              border: "none",
            }}
          >
            Manual
          </button>
          <button
            type="button"
            onClick={() => setInputMode("calendar")}
            className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all"
            style={{
              background: inputMode === "calendar" ? "#d4af37" : "#f5e9c4",
              color: inputMode === "calendar" ? "#fff" : "#7a5c00",
              border: "none",
            }}
          >
            Calendar
          </button>
        </div>

        {inputMode === "calendar" ? (
          <div className="space-y-1">
            <Label style={{ color: "#7a5c00" }}>Date of Birth</Label>
            <input
              type="date"
              value={calendarDate}
              onChange={(e) => setCalendarDate(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none"
              style={{
                borderColor: "#d4af37",
                background: "#fffdf5",
                color: "#3d2b00",
              }}
            />
          </div>
        ) : (
          <div className="space-y-1">
            <Label style={{ color: "#7a5c00" }}>
              Date of Birth (DD / MM / YYYY)
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="DD"
                maxLength={2}
                value={manualDD}
                onChange={(e) => handleManualDD(e.target.value)}
                className="w-16 rounded-lg px-3 py-2 text-sm border text-center focus:outline-none"
                style={{
                  borderColor: "#d4af37",
                  background: "#fffdf5",
                  color: "#3d2b00",
                }}
              />
              <span style={{ color: "#d4af37", fontWeight: 700 }}>/</span>
              <input
                ref={mmRef}
                type="text"
                inputMode="numeric"
                placeholder="MM"
                maxLength={2}
                value={manualMM}
                onChange={(e) => handleManualMM(e.target.value)}
                className="w-16 rounded-lg px-3 py-2 text-sm border text-center focus:outline-none"
                style={{
                  borderColor: "#d4af37",
                  background: "#fffdf5",
                  color: "#3d2b00",
                }}
              />
              <span style={{ color: "#d4af37", fontWeight: 700 }}>/</span>
              <input
                ref={yyyyRef}
                type="text"
                inputMode="numeric"
                placeholder="YYYY"
                maxLength={4}
                value={manualYYYY}
                onChange={(e) =>
                  setManualYYYY(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className="w-24 rounded-lg px-3 py-2 text-sm border text-center focus:outline-none"
                style={{
                  borderColor: "#d4af37",
                  background: "#fffdf5",
                  color: "#3d2b00",
                }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <Label style={{ color: "#7a5c00" }}>Starting Year</Label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="e.g. 2025"
              value={startYear}
              onChange={(e) =>
                setStartYear(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              className="w-28 rounded-lg px-3 py-2 text-sm border focus:outline-none"
              style={{
                borderColor: "#d4af37",
                background: "#fffdf5",
                color: "#3d2b00",
              }}
            />
          </div>
          <div className="space-y-1">
            <Label style={{ color: "#7a5c00" }}>Years to Show (1–20)</Label>
            <input
              type="number"
              min={1}
              max={20}
              value={numYears}
              onChange={(e) => setNumYears(e.target.value)}
              className="w-20 rounded-lg px-3 py-2 text-sm border focus:outline-none"
              style={{
                borderColor: "#d4af37",
                background: "#fffdf5",
                color: "#3d2b00",
              }}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600" data-ocid="career.error_state">
            {error}
          </p>
        )}

        <Button
          data-ocid="career.submit_button"
          onClick={calculate}
          className="font-semibold px-6"
          style={{ background: "#d4af37", color: "#fff", border: "none" }}
        >
          Generate Career Chart
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4" data-ocid="career.list">
          {/* Natal Chart (once at top) */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1.5px solid #d4af37" }}
          >
            <div className="px-3 pt-3 pb-1">
              <p className="text-xs font-semibold" style={{ color: "#7a5c00" }}>
                Natal Chart
              </p>
            </div>
            <NatalChart
              cellCounts={result.natalCounts}
              basicNumber={result.birthNumber}
              destinyNumber={result.destinyNumber}
              animate={false}
              compact={true}
              yearLabel="Natal"
            />
          </div>

          {/* Natal Combinations */}
          {result.natalCombinations.length > 0 && (
            <div
              className="rounded-xl p-4 space-y-2"
              style={{ background: "#fffdf5", border: "1.5px solid #d4af37" }}
            >
              <p className="text-sm font-bold" style={{ color: "#7a5c00" }}>
                Chart Combinations
              </p>
              {result.natalCombinations.map((combo) => (
                <p
                  key={combo.slice(0, 30)}
                  className="text-xs leading-relaxed"
                  style={{ color: "#4b3a1a" }}
                >
                  • {combo}
                </p>
              ))}
            </div>
          )}

          {/* Year Cards */}
          <div className="grid grid-cols-3 gap-2">
            {result.cards.map((card, i) => {
              const border = colorBorder[card.color];
              const labelText = colorLabelText[card.color];
              const labelBg = colorLabelBg[card.color];
              const paragraph = getYearParagraph(
                card.yearNumber,
                card.destinyNumber,
                card.combinedCounts,
                card.natalCounts,
                card.dasaNumber,
                card.color,
              );
              const combos = getYearCombinationTexts(
                card.natalCounts,
                card.combinedCounts,
                card.yearNumber,
              );
              return (
                <motion.div
                  key={card.startYear}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  data-ocid={`career.item.${i + 1}`}
                  className="rounded-md overflow-hidden flex flex-col"
                  style={{
                    background: "#ffffff",
                    border: `2px solid ${border}`,
                  }}
                >
                  <NatalChart
                    cellCounts={card.natalCounts}
                    basicNumber={card.birthNumber}
                    destinyNumber={card.destinyNumber}
                    animate={false}
                    dasaNumber={card.dasaNumber}
                    yearNumber={card.yearNumber}
                    compact={true}
                    yearLabel={`${card.startYear} - ${card.endYear}`}
                  />
                  {/* D/Y label */}
                  <div
                    className="flex items-center justify-center gap-2 px-2 py-0.5"
                    style={{
                      background: "#f7f0e0",
                      borderBottom: "1px solid #d4af37",
                    }}
                  >
                    <span
                      className="font-body font-bold text-xs"
                      style={{ color: "#ec4899" }}
                    >
                      D {card.dasaNumber}
                    </span>
                    <span style={{ color: "#d4af37", fontSize: "10px" }}>
                      ·
                    </span>
                    <span
                      className="font-body font-bold text-xs"
                      style={{
                        color: "#15803d",
                        background: "rgba(22,163,74,0.12)",
                        borderRadius: "3px",
                        padding: "0 3px",
                      }}
                    >
                      Y {card.yearNumber}
                    </span>
                  </div>
                  <div
                    className="py-1 px-2 text-center text-xs font-semibold"
                    style={{ background: labelBg, color: labelText }}
                  >
                    {colorLabels[card.color]}
                  </div>
                  <div
                    className="px-2 py-2 text-xs leading-relaxed"
                    style={{ color: "#4b3a1a", background: "#fffdf5" }}
                  >
                    {paragraph}
                  </div>
                  {combos.length > 0 && (
                    <div
                      className="px-2 pb-2 space-y-1"
                      style={{ background: "#fffdf5" }}
                    >
                      {combos.map((c) => (
                        <p
                          key={c.slice(0, 30)}
                          className="text-xs leading-relaxed italic"
                          style={{
                            color: "#7a5c00",
                            borderTop: "1px dashed #e8d89a",
                            paddingTop: "4px",
                          }}
                        >
                          {c}
                        </p>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
