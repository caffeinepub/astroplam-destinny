import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { type MonthPeriod, calculateDayNumber } from "../utils/numerology";
import { NatalChart } from "./NatalChart";

const GREEN = "#16a34a";
const DAY_COLOR = "#dc2626";

interface DayChartDetailProps {
  period: MonthPeriod;
  natalCellCounts: Record<number, number>;
  basicNumber: number;
  destinyNumber: number;
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

function enumerateDates(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function DayChartDetail({
  period,
  natalCellCounts,
  basicNumber,
  destinyNumber,
  dasaNumber,
  yearNumber,
  onClose,
}: DayChartDetailProps) {
  const dates = enumerateDates(period.startDate, period.endDate);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-ocid="day_detail.dialog"
        className="max-w-3xl w-full max-h-[90vh] p-0 flex flex-col"
        style={{
          background: "oklch(var(--background))",
          border: "1px solid oklch(var(--border))",
        }}
      >
        <DialogHeader
          className="sticky top-0 z-10 px-4 py-3 flex flex-row items-center justify-between shrink-0"
          style={{ background: DAY_COLOR, borderBottom: "none" }}
        >
          <DialogTitle className="font-display font-bold tracking-widest text-sm uppercase text-white">
            DAYS: {formatDate(period.startDate)} – {formatDate(period.endDate)}
            <span className="ml-3 font-body text-xs font-normal opacity-90">
              Month #{period.monthNumber} • {dates.length} days
            </span>
          </DialogTitle>
          <button
            type="button"
            data-ocid="day_detail.close_button"
            onClick={onClose}
            className="rounded-full p-1 transition-colors hover:bg-white/20"
            aria-label="Close day detail"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </DialogHeader>

        <div
          className="flex gap-3 flex-wrap items-center px-4 py-2 text-xs font-body border-b shrink-0"
          style={{ borderColor: "oklch(var(--border))" }}
        >
          <LegendDot color="oklch(var(--number-basic))" label="Basic" />
          <LegendDot color="oklch(var(--number-destiny))" label="Destiny" />
          <LegendDot color="#1E3A5F" label="Dasa" />
          <LegendDot color={GREEN} label="Year" />
          <LegendDot color="#7c3aed" label="Month" />
          <LegendDot color={DAY_COLOR} label="Day" />
        </div>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {dates.map((date, idx) => {
              const dayNumber = calculateDayNumber(date, period.monthNumber);
              return (
                <div
                  key={date.toISOString()}
                  data-ocid={`day_chart.item.${idx + 1}`}
                  className="rounded-md overflow-hidden"
                  style={{
                    border: "1px solid oklch(var(--border))",
                    background: "oklch(var(--card))",
                  }}
                >
                  <div
                    className="py-1 px-2 text-center font-body text-[10px] font-semibold text-white leading-tight"
                    style={{ background: GREEN }}
                  >
                    {formatDate(date)}
                  </div>
                  <NatalChart
                    cellCounts={natalCellCounts}
                    basicNumber={basicNumber}
                    destinyNumber={destinyNumber}
                    animate={false}
                    dasaNumber={dasaNumber}
                    yearNumber={yearNumber}
                    monthNumber={period.monthNumber}
                    dayNumber={dayNumber}
                    compact={true}
                    hideHeader={true}
                  />
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span style={{ color: "oklch(var(--muted-foreground))" }}>{label}</span>
    </div>
  );
}
