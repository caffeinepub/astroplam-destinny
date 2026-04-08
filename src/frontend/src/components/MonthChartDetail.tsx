import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { type MonthPeriod, calculateMonthCycle } from "../utils/numerology";
import { DayChartDetail } from "./DayChartDetail";
import { NatalChart } from "./NatalChart";

const GREEN = "#16a34a";

interface MonthChartDetailProps {
  day: number;
  month: number;
  birthYear: number;
  targetYear: number;
  basicNumber: number;
  destinyNumber: number;
  natalCellCounts: Record<number, number>;
  dasaNumber: number;
  yearNumber: number;
  onClose: () => void;
}

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function MonthChartDetail({
  day,
  month,
  targetYear,
  basicNumber,
  destinyNumber,
  natalCellCounts,
  dasaNumber,
  yearNumber,
  onClose,
}: MonthChartDetailProps) {
  const periods = calculateMonthCycle(day, month, targetYear, yearNumber);
  const [selectedPeriod, setSelectedPeriod] = useState<MonthPeriod | null>(
    null,
  );

  const lastPeriod = periods[periods.length - 1];
  const remainderStart = new Date(lastPeriod.endDate);
  remainderStart.setDate(remainderStart.getDate() + 1);
  const remainderEnd = new Date(remainderStart);
  remainderEnd.setDate(remainderEnd.getDate() + 4);

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          data-ocid="month_detail.dialog"
          className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0"
          style={{
            background: "oklch(var(--background))",
            border: "1px solid oklch(var(--border))",
          }}
        >
          <DialogHeader
            className="sticky top-0 z-10 px-4 py-3 flex flex-row items-center justify-between"
            style={{ background: GREEN, borderBottom: "none" }}
          >
            <DialogTitle className="font-display font-bold tracking-widest text-sm uppercase text-white">
              YEAR {targetYear} – {targetYear + 1}
            </DialogTitle>
            <button
              type="button"
              data-ocid="month_detail.close_button"
              onClick={onClose}
              className="rounded-full p-1 transition-colors hover:bg-white/20"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </DialogHeader>

          <div className="p-4 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-md overflow-hidden"
                style={{
                  border: "1px solid oklch(var(--border))",
                  background: "oklch(var(--card))",
                }}
              >
                <div
                  className="py-1.5 px-3 text-center font-display font-bold tracking-widest text-xs uppercase text-white"
                  style={{ background: "oklch(var(--natal-header))" }}
                >
                  NATAL
                </div>
                <NatalChart
                  cellCounts={natalCellCounts}
                  basicNumber={basicNumber}
                  destinyNumber={destinyNumber}
                  animate={false}
                  compact={true}
                  hideHeader={true}
                />
              </div>

              <div
                className="rounded-md overflow-hidden"
                style={{
                  border: "1px solid oklch(var(--border))",
                  background: "oklch(var(--card))",
                }}
              >
                <NatalChart
                  cellCounts={natalCellCounts}
                  basicNumber={basicNumber}
                  destinyNumber={destinyNumber}
                  animate={false}
                  dasaNumber={dasaNumber}
                  yearNumber={yearNumber}
                  compact={true}
                  yearLabel={`${targetYear} - ${targetYear + 1}`}
                />
              </div>
            </div>

            <div className="flex gap-4 flex-wrap items-center px-1 text-xs font-body">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                <span style={{ color: "oklch(var(--muted-foreground))" }}>
                  Month number
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: GREEN }}
                />
                <span style={{ color: "oklch(var(--muted-foreground))" }}>
                  Year number
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A5F]" />
                <span style={{ color: "oklch(var(--muted-foreground))" }}>
                  Dasa number
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {periods.map((period, idx) => (
                <button
                  key={`month-period-num${period.monthNumber}-pos${idx}`}
                  type="button"
                  data-ocid={`month_period.item.${idx + 1}`}
                  onClick={() => setSelectedPeriod(period)}
                  className="rounded-md overflow-hidden text-left w-full transition-all hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none"
                  style={{
                    border: "2px solid oklch(var(--border))",
                    background: "oklch(var(--card))",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="py-1 px-2 text-center font-body text-[10px] font-semibold text-white"
                    style={{ background: GREEN }}
                  >
                    {formatDate(period.startDate)} –{" "}
                    {formatDate(period.endDate)}
                  </div>
                  <NatalChart
                    cellCounts={natalCellCounts}
                    basicNumber={basicNumber}
                    destinyNumber={destinyNumber}
                    animate={false}
                    dasaNumber={dasaNumber}
                    yearNumber={yearNumber}
                    monthNumber={period.monthNumber}
                    compact={true}
                    hideHeader={true}
                  />
                  <div
                    className="py-1 text-center font-body text-[9px] font-medium"
                    style={{
                      color: "#dc2626",
                      background: "oklch(var(--card))",
                    }}
                  >
                    Tap for daily charts →
                  </div>
                </button>
              ))}

              <div
                data-ocid="month_chart.remainder.card"
                className="rounded-md overflow-hidden"
                style={{
                  border: "1px solid oklch(var(--border))",
                  background: "oklch(var(--card))",
                }}
              >
                <div
                  className="py-1 px-2 text-center font-body text-[10px] font-semibold text-white"
                  style={{ background: "oklch(0.55 0.04 264)" }}
                >
                  {formatDate(remainderStart)} – {formatDate(remainderEnd)}
                </div>
                <div
                  className="flex items-center justify-center"
                  style={{ minHeight: "44px", padding: "12px" }}
                >
                  <div
                    className="w-full"
                    style={{
                      height: "2px",
                      background: "oklch(var(--border))",
                      borderRadius: "1px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedPeriod && (
        <DayChartDetail
          period={selectedPeriod}
          natalCellCounts={natalCellCounts}
          basicNumber={basicNumber}
          destinyNumber={destinyNumber}
          dasaNumber={dasaNumber}
          yearNumber={yearNumber}
          onClose={() => setSelectedPeriod(null)}
        />
      )}
    </>
  );
}
