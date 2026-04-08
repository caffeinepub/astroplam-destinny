import { Download, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateDasaCycle, calculateYearNumber } from "../utils/numerology";
import { DownloadChartDialog } from "./DownloadChartDialog";
import { MonthChartDetail } from "./MonthChartDetail";
import { NatalChart } from "./NatalChart";

const GREEN = "#2E8B57";
const DASA_COLOR = "#1e293b";
const YEAR_COLOR = "#16a34a";

interface YearChartGridProps {
  day: number;
  month: number;
  year: number;
  basicNumber: number;
  destinyNumber: number;
  natalCellCounts: Record<number, number>;
  fromYear: number;
  toYear: number;
  canAccessMonth?: boolean;
  onMonthLocked?: () => void;
  dasaNumber?: number;
  dob?: string; // "DD-MM-YYYY"
}

interface YearEntry {
  yearIter: number;
  dasaNumber: number;
  yearNumber: number;
  yearLabel: string;
}

interface DownloadState {
  yearIter: number;
  dasaNumber: number;
  yearNumber: number;
}

export function YearChartGrid({
  day,
  month,
  year,
  basicNumber,
  destinyNumber,
  natalCellCounts,
  fromYear,
  toYear,
  canAccessMonth = true,
  onMonthLocked,
  dob,
}: YearChartGridProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [downloadState, setDownloadState] = useState<DownloadState | null>(
    null,
  );

  const entries = useMemo<YearEntry[]>(() => {
    const dasaPeriods = calculateDasaCycle(basicNumber, year, fromYear, toYear);
    const result: YearEntry[] = [];
    const clampedTo = Math.min(toYear, fromYear + 99);

    for (let y = fromYear; y <= clampedTo; y++) {
      const period = dasaPeriods.find((p) => y >= p.startYear && y < p.endYear);
      const dasaNumber = period ? period.dasaNumber : basicNumber;
      const yearNumber = calculateYearNumber(day, month, y);
      result.push({
        yearIter: y,
        dasaNumber,
        yearNumber,
        yearLabel: `${y} - ${y + 1}`,
      });
    }

    return result;
  }, [day, month, year, basicNumber, fromYear, toYear]);

  const selectedEntry =
    selectedYear !== null
      ? (entries.find((e) => e.yearIter === selectedYear) ?? null)
      : null;

  function handleYearClick(yearIter: number) {
    if (!canAccessMonth) {
      onMonthLocked?.();
      return;
    }
    setSelectedYear(yearIter);
  }

  function handleDownloadClick(e: React.MouseEvent, entry: YearEntry) {
    e.stopPropagation();
    if (!canAccessMonth) {
      onMonthLocked?.();
      return;
    }
    setDownloadState({
      yearIter: entry.yearIter,
      dasaNumber: entry.dasaNumber,
      yearNumber: entry.yearNumber,
    });
  }

  const dobString =
    dob ??
    `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;

  return (
    <div data-ocid="year_charts.panel" className="space-y-4">
      <div className="flex gap-3 flex-wrap items-center justify-between px-1">
        <div className="flex gap-5 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: DASA_COLOR }}
            />
            <span
              className="text-xs font-body italic"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Dasa number
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: YEAR_COLOR, border: "1.5px solid #aaa" }}
            />
            <span
              className="text-xs font-body"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Year number
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-body"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              {entries.length} year charts ·{" "}
              {canAccessMonth
                ? "Tap card for months"
                : "🔒 Month charts require Paid access"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {entries.map((entry) => (
          <div
            key={entry.yearIter}
            data-ocid="year_chart.card"
            className="relative rounded-md overflow-hidden"
            style={{
              background: "#ffffff",
              border:
                selectedYear === entry.yearIter
                  ? `2px solid ${GREEN}`
                  : "1px solid #c8a96e",
              boxShadow:
                selectedYear === entry.yearIter
                  ? `0 0 0 2px ${GREEN}33`
                  : "none",
            }}
          >
            <button
              type="button"
              className="w-full p-0 bg-transparent text-left cursor-pointer"
              onClick={() => handleYearClick(entry.yearIter)}
              style={{
                transform:
                  selectedYear === entry.yearIter ? "scale(1.02)" : "scale(1)",
                transition: "transform 0.15s",
              }}
            >
              {/* D / Y label row */}
              <div
                className="flex items-center justify-center gap-2 px-2 py-0.5"
                style={{
                  background: "#f7f0e0",
                  borderBottom: "1px solid #c8a96e",
                }}
              >
                <span
                  className="font-body font-bold text-xs"
                  style={{ color: "#ec4899" }}
                >
                  D {entry.dasaNumber}
                </span>
                <span style={{ color: "#c8a96e", fontSize: "10px" }}>·</span>
                <span
                  className="font-body font-bold text-xs"
                  style={{
                    color: "#15803d",
                    background: "rgba(22,163,74,0.12)",
                    borderRadius: "3px",
                    padding: "0 3px",
                  }}
                >
                  Y {entry.yearNumber}
                </span>
              </div>
              <NatalChart
                cellCounts={natalCellCounts}
                basicNumber={basicNumber}
                destinyNumber={destinyNumber}
                animate={false}
                dasaNumber={entry.dasaNumber}
                yearNumber={entry.yearNumber}
                compact={true}
                yearLabel={entry.yearLabel}
              />
            </button>

            {/* Download / Lock button */}
            <button
              type="button"
              data-ocid="year_chart.download_button"
              onClick={(e) => handleDownloadClick(e, entry)}
              className="absolute bottom-1 right-1 rounded p-0.5 transition-colors"
              style={{
                background: canAccessMonth
                  ? "rgba(46,139,87,0.12)"
                  : "rgba(0,0,0,0.07)",
                color: canAccessMonth ? GREEN : "#999",
                zIndex: 10,
              }}
              title={
                canAccessMonth
                  ? `Download ${entry.yearLabel} chart`
                  : "Paid users only"
              }
              aria-label={
                canAccessMonth
                  ? `Download ${entry.yearLabel} chart`
                  : "Locked: Paid users only"
              }
            >
              {canAccessMonth ? (
                <Download className="w-3 h-3" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
            </button>
          </div>
        ))}
      </div>

      {selectedEntry !== null && selectedYear !== null && canAccessMonth && (
        <MonthChartDetail
          day={day}
          month={month}
          birthYear={year}
          targetYear={selectedYear}
          basicNumber={basicNumber}
          destinyNumber={destinyNumber}
          natalCellCounts={natalCellCounts}
          dasaNumber={selectedEntry.dasaNumber}
          yearNumber={selectedEntry.yearNumber}
          onClose={() => setSelectedYear(null)}
        />
      )}

      {downloadState && (
        <DownloadChartDialog
          open={true}
          onClose={() => setDownloadState(null)}
          yearIter={downloadState.yearIter}
          day={day}
          month={month}
          birthYear={year}
          basicNumber={basicNumber}
          destinyNumber={destinyNumber}
          natalCellCounts={natalCellCounts}
          dasaNumber={downloadState.dasaNumber}
          yearNumber={downloadState.yearNumber}
          dob={dobString}
        />
      )}
    </div>
  );
}
