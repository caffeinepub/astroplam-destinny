import { motion } from "motion/react";
import { useMemo } from "react";
import {
  DAY_NAMES,
  calculateDasaCycle,
  calculateDayNumber,
  calculateMonthCycle,
  calculateNumerology,
  calculateYearNumber,
  formatDOB,
} from "../utils/numerology";
import { NatalChart } from "./NatalChart";

interface MonthDayPromoSectionProps {
  onTryIt: () => void;
}

const GOLD = "#c8a96e";
const SECTION_GREEN = "#2E8B57";
const MONTH_PURPLE = "#7c3aed";
const DAY_PINK = "#ec4899";
const BASIC_RED = "#dc2626";
const DESTINY_YELLOW = "#eab308";
const DASA_NAVY = "#1E3A5F";
const YEAR_GREEN = "#16a34a";

const SAMPLE_DAY = 5;
const SAMPLE_MONTH = 2;
const SAMPLE_YEAR = 1998;
const TARGET_YEAR = 2025;

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function FormulaCard({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-lg p-4 flex flex-col gap-2"
      style={{
        border: `1.5px solid ${GOLD}`,
        background: "oklch(var(--card))",
        boxShadow: "0 2px 12px 0 rgba(200,169,110,0.08)",
      }}
    >
      <h3
        className="font-display font-bold text-sm uppercase tracking-widest"
        style={{ color: SECTION_GREEN }}
      >
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function ColorDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full flex-shrink-0"
        style={{ width: 12, height: 12, background: color }}
      />
      <span
        className="font-body text-xs"
        style={{ color: "oklch(var(--muted-foreground))" }}
      >
        {label}
      </span>
    </div>
  );
}

export function MonthDayPromoSection({ onTryIt }: MonthDayPromoSectionProps) {
  const numerology = useMemo(
    () => calculateNumerology(formatDOB(SAMPLE_DAY, SAMPLE_MONTH, SAMPLE_YEAR)),
    [],
  );
  const yearNumber = useMemo(
    () => calculateYearNumber(SAMPLE_DAY, SAMPLE_MONTH, TARGET_YEAR),
    [],
  );
  const dasaNumber = useMemo(() => {
    const periods = calculateDasaCycle(
      numerology.basicNumber,
      SAMPLE_YEAR,
      TARGET_YEAR,
      TARGET_YEAR,
    );
    return (
      periods.find((p) => p.startYear <= TARGET_YEAR && p.endYear > TARGET_YEAR)
        ?.dasaNumber ?? numerology.basicNumber
    );
  }, [numerology.basicNumber]);

  const monthPeriods = useMemo(
    () =>
      calculateMonthCycle(SAMPLE_DAY, SAMPLE_MONTH, TARGET_YEAR, yearNumber),
    [yearNumber],
  );

  // First 7 days of the first month period for Day Number demo
  const firstPeriod = monthPeriods[0];
  const sampleDays = useMemo(() => {
    const days: Array<{ date: Date; dayNum: number; dayName: string }> = [];
    const cur = new Date(firstPeriod.startDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(cur);
      const dayNum = calculateDayNumber(d, firstPeriod.monthNumber);
      days.push({ date: d, dayNum, dayName: DAY_NAMES[d.getDay()] });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, [firstPeriod]);

  const firstPeriodDays = firstPeriod.monthNumber * 8 - sampleDays.length;

  return (
    <section
      data-ocid="month_day_promo.section"
      className="w-full space-y-8 pb-4"
      style={{ background: "oklch(var(--background))" }}
    >
      {/* A. Header block */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3 pt-6 px-2"
      >
        <h2
          className="font-display font-bold text-2xl md:text-3xl tracking-tight"
          style={{ color: SECTION_GREEN }}
        >
          Month &amp; Day Number System
        </h2>
        <p
          className="font-body text-sm md:text-base max-w-xl mx-auto leading-relaxed"
          style={{ color: "oklch(var(--muted-foreground))" }}
        >
          Every year divides into 9 personal Month cycles. Each day within a
          cycle carries its own vibration.
        </p>
        <div
          className="mx-auto rounded-full"
          style={{
            width: 80,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          }}
        />
      </motion.div>

      {/* B. Formula explanation boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormulaCard title="Month Number Formula" delay={0.1}>
          <p
            className="font-body text-xs leading-relaxed"
            style={{ color: "oklch(var(--foreground))" }}
          >
            Starts on your birthday each year. 9 periods in sequence:{" "}
            <span className="font-semibold" style={{ color: MONTH_PURPLE }}>
              Year Number → +1 → ... → 9 → 1
            </span>
            . Duration ={" "}
            <span className="font-semibold" style={{ color: MONTH_PURPLE }}>
              Month Number × 8 days
            </span>
            .
          </p>
          <div
            className="rounded-md p-2.5 font-mono text-xs mt-1"
            style={{
              background: "oklch(var(--muted))",
              color: MONTH_PURPLE,
              border: `1px solid ${GOLD}44`,
            }}
          >
            Period 1: YearNum × 8 days
            <br />
            Period 2: (YearNum+1) × 8 days
            <br />
            ...
            <br />
            Period 9: (YearNum+8 mod 9) × 8 days
          </div>
        </FormulaCard>

        <FormulaCard title="Day Number Formula" delay={0.2}>
          <p
            className="font-body text-xs leading-relaxed"
            style={{ color: "oklch(var(--foreground))" }}
          >
            Day Number ={" "}
            <span className="font-semibold" style={{ color: DAY_PINK }}>
              Month Number + Day-of-Week Number
            </span>{" "}
            (reduced to 1–9)
          </p>
          <div
            className="rounded-md p-2.5 font-mono text-xs mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5"
            style={{
              background: "oklch(var(--muted))",
              color: "oklch(var(--foreground))",
              border: `1px solid ${GOLD}44`,
            }}
          >
            <span style={{ color: DAY_PINK }}>Sun = 1</span>
            <span style={{ color: DAY_PINK }}>Mon = 2</span>
            <span style={{ color: DAY_PINK }}>Tue = 9</span>
            <span style={{ color: DAY_PINK }}>Wed = 5</span>
            <span style={{ color: DAY_PINK }}>Thu = 3</span>
            <span style={{ color: DAY_PINK }}>Fri = 6</span>
            <span style={{ color: DAY_PINK }}>Sat = 8</span>
          </div>
        </FormulaCard>

        <FormulaCard title="Color Legend" delay={0.3}>
          <div className="grid grid-cols-2 gap-y-2 gap-x-3">
            <ColorDot color={BASIC_RED} label="Basic Number" />
            <ColorDot color={DESTINY_YELLOW} label="Destiny Number" />
            <ColorDot color={DASA_NAVY} label="Dasa Number" />
            <ColorDot color={YEAR_GREEN} label="Year Number" />
            <ColorDot color={MONTH_PURPLE} label="Month Number" />
            <ColorDot color={DAY_PINK} label="Day Number" />
          </div>
        </FormulaCard>
      </div>

      {/* C. Month Cycle Section */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col gap-1"
        >
          <h3
            className="font-display font-bold text-lg md:text-xl tracking-tight"
            style={{ color: SECTION_GREEN }}
          >
            Month Cycle — DOB 05-02-1998, Year {TARGET_YEAR}
          </h3>
          {/* Summary row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="font-body text-xs uppercase tracking-wider"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                Year Number:
              </span>
              <span
                className="font-display font-bold text-base"
                style={{ color: YEAR_GREEN }}
              >
                {yearNumber}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="font-body text-xs uppercase tracking-wider"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                Basic:
              </span>
              <span
                className="font-display font-bold text-base"
                style={{ color: BASIC_RED }}
              >
                {numerology.basicNumber}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="font-body text-xs uppercase tracking-wider"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                Destiny:
              </span>
              <span
                className="font-display font-bold text-base"
                style={{ color: DESTINY_YELLOW }}
              >
                {numerology.destinyNumber}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="font-body text-xs uppercase tracking-wider"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                Dasa:
              </span>
              <span
                className="font-display font-bold text-base"
                style={{ color: DASA_NAVY }}
              >
                {dasaNumber}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthPeriods.map((period, idx) => (
            <motion.div
              key={`month-promo-${period.monthNumber}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * idx }}
              className="rounded-lg overflow-hidden"
              style={{
                border: `1.5px solid ${GOLD}`,
                background: "oklch(var(--card))",
                boxShadow: "0 2px 8px 0 rgba(200,169,110,0.1)",
              }}
              data-ocid={`month_promo.item.${idx + 1}`}
            >
              {/* Header bar */}
              <div
                className="px-3 py-2 flex items-center justify-between"
                style={{ background: MONTH_PURPLE }}
              >
                <span className="font-display font-bold text-xs uppercase tracking-widest text-white">
                  Month #{period.monthNumber}
                </span>
                <span className="font-body text-xs text-white/80">
                  {period.monthNumber * 8} days
                </span>
              </div>
              {/* Date range */}
              <div
                className="px-3 py-1.5 text-center font-body text-xs font-medium"
                style={{
                  color: "oklch(var(--muted-foreground))",
                  borderBottom: `1px solid ${GOLD}44`,
                }}
              >
                {formatDate(period.startDate)} → {formatDate(period.endDate)}
              </div>
              {/* NatalChart with month number highlighted */}
              <NatalChart
                cellCounts={numerology.cellCounts}
                basicNumber={numerology.basicNumber}
                destinyNumber={numerology.destinyNumber}
                animate={false}
                compact={true}
                hideHeader={true}
                dasaNumber={dasaNumber}
                yearNumber={yearNumber}
                monthNumber={period.monthNumber}
              />
              {/* Month Number label */}
              <div
                className="px-3 py-1.5 text-center font-body text-xs"
                style={{
                  borderTop: `1px solid ${GOLD}44`,
                  background: "oklch(var(--card))",
                }}
              >
                Month Number:{" "}
                <span
                  className="font-display font-bold text-sm"
                  style={{ color: MONTH_PURPLE }}
                >
                  {period.monthNumber}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* D. Day Number section */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h3
            className="font-display font-bold text-lg md:text-xl tracking-tight"
            style={{ color: SECTION_GREEN }}
          >
            Day Numbers — Period 1 (Month {firstPeriod.monthNumber})
          </h3>
          <p
            className="font-body text-xs mt-1"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            First 7 days of the first month period, starting{" "}
            {formatDate(firstPeriod.startDate)}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {sampleDays.map(({ date, dayNum, dayName }, idx) => (
            <motion.div
              key={`day-promo-${date.toISOString().slice(0, 10)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * idx + 0.3 }}
              className="rounded-lg overflow-hidden"
              style={{
                border: `1.5px solid ${GOLD}`,
                background: "oklch(var(--card))",
                boxShadow: "0 2px 8px 0 rgba(200,169,110,0.1)",
              }}
              data-ocid={`day_promo.item.${idx + 1}`}
            >
              {/* Header bar */}
              <div
                className="px-2 py-1.5 text-center"
                style={{ background: DAY_PINK }}
              >
                <span className="font-display font-bold text-[11px] text-white tracking-wide">
                  {formatDate(date)}
                </span>
                <span className="font-body text-[10px] text-white/80 block leading-none mt-0.5">
                  {dayName.slice(0, 3)}
                </span>
              </div>
              {/* NatalChart with day number highlighted */}
              <NatalChart
                cellCounts={numerology.cellCounts}
                basicNumber={numerology.basicNumber}
                destinyNumber={numerology.destinyNumber}
                animate={false}
                compact={true}
                hideHeader={true}
                dasaNumber={dasaNumber}
                yearNumber={yearNumber}
                monthNumber={firstPeriod.monthNumber}
                dayNumber={dayNum}
              />
              {/* Day Number label */}
              <div
                className="px-2 py-1.5 text-center font-body text-[11px]"
                style={{
                  borderTop: `1px solid ${GOLD}44`,
                  background: "oklch(var(--card))",
                }}
              >
                Day:{" "}
                <span
                  className="font-display font-bold text-sm"
                  style={{ color: DAY_PINK }}
                >
                  {dayNum}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {firstPeriodDays > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="font-body text-xs text-center"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            ...and {firstPeriodDays} more days in this period
          </motion.p>
        )}
      </div>

      {/* E. CTA block */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="rounded-xl p-6 text-center space-y-4"
        style={{
          background: `linear-gradient(135deg, ${SECTION_GREEN}10, ${GOLD}18)`,
          border: `1.5px solid ${GOLD}`,
        }}
      >
        <div
          className="mx-auto rounded-full flex items-center justify-center w-12 h-12"
          style={{
            background: `${SECTION_GREEN}18`,
            border: `2px solid ${GOLD}`,
          }}
        >
          <span
            className="font-display font-black text-lg"
            style={{ color: SECTION_GREEN }}
          >
            M
          </span>
        </div>
        <p
          className="font-body text-sm md:text-base max-w-md mx-auto"
          style={{ color: "oklch(var(--foreground))" }}
        >
          Calculate your personal Month &amp; Day cycles — enter your date of
          birth below
        </p>
        <button
          type="button"
          data-ocid="month_day_promo.primary_button"
          onClick={onTryIt}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-body font-semibold text-sm tracking-wide transition-all hover:scale-105 hover:shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${SECTION_GREEN}, #1a6b3e)`,
            color: "#ffffff",
            border: `1px solid ${GOLD}`,
            boxShadow: `0 4px 16px 0 ${SECTION_GREEN}44`,
          }}
        >
          ✨ Calculate Now
        </button>
      </motion.div>
    </section>
  );
}
