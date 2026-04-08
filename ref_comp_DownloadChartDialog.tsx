import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  GRID_LAYOUT,
  calculateDayNumber,
  calculateMonthCycle,
  getCellDisplay,
} from "../utils/numerology";

const GREEN_HEADER = "#2E8B57";
const BORDER_COLOR = "#c8a96e";
const CELL_BG = "#ffffff";
const BASIC_COLOR = "#dc2626";
const DESTINY_COLOR = "#eab308";
const NATAL_COLOR = "#000000";
const DASA_COLOR = "#ec4899";
const YEAR_COLOR_TEXT = "#ffffff";
const YEAR_BG = "rgba(22,163,74,0.88)";
const MONTH_COLOR = "#7c3aed";
const DAY_COLOR = "#ec4899";
const SCALE = 4;

const COLOR_LEGEND = [
  { label: "Natal", color: NATAL_COLOR, bg: undefined },
  { label: "Basic", color: BASIC_COLOR, bg: undefined },
  { label: "Destiny", color: DESTINY_COLOR, bg: undefined },
  { label: "Dasa", color: DASA_COLOR, bg: undefined },
  { label: "Month", color: MONTH_COLOR, bg: undefined },
  { label: "Day", color: DAY_COLOR, bg: undefined },
  { label: "Year", color: YEAR_COLOR_TEXT, bg: YEAR_BG },
];

const MONTH_NAMES = [
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

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface DownloadChartDialogProps {
  open: boolean;
  onClose: () => void;
  yearIter: number;
  day: number;
  month: number;
  birthYear: number;
  basicNumber: number;
  destinyNumber: number;
  natalCellCounts: Record<number, number>;
  dasaNumber: number;
  yearNumber: number;
  dob?: string; // "DD-MM-YYYY"
}

function formatDob(dob: string): string {
  return dob.replace(/-/g, "/");
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

function drawColorLegendBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
) {
  const barH = 28;
  ctx.fillStyle = "#f3f0e8";
  ctx.fillRect(x, y, w, barH);
  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 0.75;
  ctx.strokeRect(x, y, w, barH);

  const itemW = w / COLOR_LEGEND.length;
  ctx.font = "bold 9px Arial";
  ctx.textBaseline = "middle";

  for (let i = 0; i < COLOR_LEGEND.length; i++) {
    const item = COLOR_LEGEND[i];
    const ix = x + i * itemW;
    const dotSize = 10;
    const dotX = ix + 6;
    const dotY = y + barH / 2 - dotSize / 2;

    if (item.bg) {
      ctx.fillStyle = item.bg;
    } else {
      ctx.fillStyle = item.color;
    }
    ctx.fillRect(dotX, dotY, dotSize, dotSize);
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(dotX, dotY, dotSize, dotSize);

    ctx.fillStyle = "#333";
    ctx.textAlign = "left";
    ctx.fillText(item.label, dotX + dotSize + 3, y + barH / 2);
  }
}

function drawMiniChart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cellCounts: Record<number, number>,
  basicNumber: number,
  destinyNumber: number,
  dasaNumber: number | undefined,
  yearNumber: number | undefined,
  monthNumber: number | undefined,
  dayNumber: number | undefined,
  headerLabel: string,
) {
  const headerH = 28;
  const gridH = h - headerH;
  const cellW = w / 3;
  const cellH = gridH / 3;

  ctx.fillStyle = GREEN_HEADER;
  ctx.fillRect(x, y, w, headerH);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(headerLabel, x + w / 2, y + headerH / 2);

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cellNum = GRID_LAYOUT[row][col];
      const cx = x + col * cellW;
      const cy = y + headerH + row * cellH;

      ctx.fillStyle = CELL_BG;
      ctx.fillRect(cx, cy, cellW, cellH);

      ctx.save();
      ctx.translate(cx + cellW / 2, cy + cellH / 2);
      ctx.rotate(-0.49);
      ctx.fillStyle = "rgba(150,120,60,0.1)";
      ctx.font = "8px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Viku Kharb", 0, 0);
      ctx.restore();

      ctx.strokeStyle = BORDER_COLOR;
      ctx.lineWidth = 0.75;
      if (col < 2) {
        ctx.beginPath();
        ctx.moveTo(cx + cellW, cy);
        ctx.lineTo(cx + cellW, cy + cellH);
        ctx.stroke();
      }
      if (row < 2) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + cellH);
        ctx.lineTo(cx + cellW, cy + cellH);
        ctx.stroke();
      }

      const count = cellCounts[cellNum] ?? 0;
      const display = getCellDisplay(cellNum, cellCounts);
      const isBasic = cellNum === basicNumber;
      const isDestiny = cellNum === destinyNumber;
      const isDasa = dasaNumber !== undefined && cellNum === dasaNumber;
      const isYear = yearNumber !== undefined && cellNum === yearNumber;
      const isMonth = monthNumber !== undefined && cellNum === monthNumber;
      const isDay = dayNumber !== undefined && cellNum === dayNumber;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const midX = cx + cellW / 2;

      // Collect all parts to render horizontally
      const parts: Array<{
        text: string;
        color: string;
        bold?: boolean;
        italic?: boolean;
        bgColor?: string;
        isYear?: boolean;
        isDasa?: boolean;
      }> = [];

      if (count > 0) {
        parts.push({
          text: String(display),
          color: isBasic
            ? BASIC_COLOR
            : isDestiny
              ? DESTINY_COLOR
              : NATAL_COLOR,
          bold: true,
        });
      }
      if (isDasa)
        parts.push({
          text: String(dasaNumber),
          color: DASA_COLOR,
          bold: true,
          isDasa: true,
        });
      if (isYear)
        parts.push({
          text: String(yearNumber),
          color: YEAR_COLOR_TEXT,
          bold: true,
          bgColor: YEAR_BG,
          isYear: true,
        });
      if (isMonth)
        parts.push({
          text: String(monthNumber),
          color: MONTH_COLOR,
          bold: true,
        });
      if (isDay)
        parts.push({
          text: String(dayNumber),
          color: DAY_COLOR,
          bold: true,
          italic: true,
        });

      if (parts.length === 0) continue;

      // Draw parts horizontally centered in cell
      const getFontSz = (part: (typeof parts)[0]) => {
        const base = part.isYear ? 20 : part.isDasa ? 17 : 14;
        const len = part.text.length;
        return len <= 1
          ? base
          : len === 2
            ? Math.round(base * 0.8)
            : Math.round(base * 0.6);
      };

      // Measure total width
      const gap = 4;
      const widths: number[] = [];
      for (const part of parts) {
        const sz = getFontSz(part);
        ctx.font = `${part.italic ? "italic " : ""}${part.bold ? "bold " : ""}${sz}px Arial`;
        widths.push(ctx.measureText(part.text).width);
      }
      const totalW =
        widths.reduce((a, b) => a + b, 0) + gap * (parts.length - 1);
      let startX = midX - totalW / 2;
      const drawY = cy + cellH / 2;

      for (let pi = 0; pi < parts.length; pi++) {
        const part = parts[pi];
        const sz = getFontSz(part);
        ctx.font = `${part.italic ? "italic " : ""}${part.bold ? "bold " : ""}${sz}px Arial`;
        const tw = widths[pi];
        if (part.bgColor) {
          ctx.fillStyle = part.bgColor;
          ctx.fillRect(startX - 2, drawY - sz / 2 - 1, tw + 4, sz + 2);
        }
        ctx.fillStyle = part.color;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(part.text, startX, drawY);
        startX += tw + gap;
      }
    }
  }

  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y + headerH, w, gridH);
}

function drawNatalSectionHeader(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
) {
  const h = 24;
  ctx.fillStyle = "#e8f5ee";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 0.75;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = GREEN_HEADER;
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NATAL CHART", x + w / 2, y + h / 2);
  return h;
}

function generateMonthChartPNG(
  yearIter: number,
  day: number,
  month: number,
  basicNumber: number,
  destinyNumber: number,
  natalCellCounts: Record<number, number>,
  dasaNumber: number,
  yearNumber: number,
  dob: string,
): string {
  const periods = calculateMonthCycle(day, month, yearIter, yearNumber);

  const cols = 3;
  const rows = Math.ceil(periods.length / cols);
  const chartW = 280;
  const chartH = 230;
  const padding = 14;
  const titleH = 44;
  const legendH = 36;
  const natalSectionLabelH = 24;
  const natalChartSize = 240;
  const natalTotalH = natalSectionLabelH + natalChartSize + 8;

  const logicalW = cols * chartW + (cols + 1) * padding;
  const logicalH =
    titleH + natalTotalH + rows * chartH + (rows + 1) * padding + legendH;

  const canvas = document.createElement("canvas");
  canvas.width = logicalW * SCALE;
  canvas.height = logicalH * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  ctx.fillStyle = "#f9f6f0";
  ctx.fillRect(0, 0, logicalW, logicalH);

  // Title bar
  ctx.fillStyle = GREEN_HEADER;
  ctx.fillRect(0, 0, logicalW, titleH);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 11px Arial";
  ctx.fillText(`DOB: ${formatDob(dob)}`, logicalW / 2, titleH * 0.32);
  ctx.font = "bold 15px Arial";
  ctx.fillText(
    `Month Charts \u2013 Year ${yearIter}\u2013${yearIter + 1}`,
    logicalW / 2,
    titleH * 0.72,
  );

  // Natal chart section at top
  let natalY = titleH + 6;
  drawNatalSectionHeader(ctx, 0, natalY, logicalW);
  natalY += natalSectionLabelH;
  const natalX = (logicalW - natalChartSize) / 2;
  drawMiniChart(
    ctx,
    natalX,
    natalY,
    natalChartSize,
    natalChartSize,
    natalCellCounts,
    basicNumber,
    destinyNumber,
    undefined,
    undefined,
    undefined,
    undefined,
    "NATAL",
  );

  const monthsStartY = titleH + natalTotalH + padding;
  periods.forEach((period, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = padding + col * (chartW + padding);
    const y = monthsStartY + row * (chartH + padding);
    const label = `${formatDate(period.startDate)}\u2013${formatDate(period.endDate)}`;
    drawMiniChart(
      ctx,
      x,
      y,
      chartW,
      chartH,
      natalCellCounts,
      basicNumber,
      destinyNumber,
      dasaNumber,
      yearNumber,
      period.monthNumber,
      undefined,
      label,
    );
  });

  drawColorLegendBar(ctx, 0, logicalH - legendH, logicalW);
  return canvas.toDataURL("image/png");
}

function generateDayChartPages(
  yearIter: number,
  day: number,
  month: number,
  basicNumber: number,
  destinyNumber: number,
  natalCellCounts: Record<number, number>,
  dasaNumber: number,
  yearNumber: number,
  dob: string,
): Array<{ dataUrl: string; filename: string; monthIndex: number }> {
  const periods = calculateMonthCycle(day, month, yearIter, yearNumber);

  type DayEntry = { date: Date; monthNumber: number; dayNumber: number };
  const allDays: DayEntry[] = [];
  for (const period of periods) {
    const dates = enumerateDates(period.startDate, period.endDate);
    for (const date of dates) {
      allDays.push({
        date,
        monthNumber: period.monthNumber,
        dayNumber: calculateDayNumber(date, period.monthNumber),
      });
    }
  }

  const grouped = new Map<string, DayEntry[]>();
  for (const entry of allDays) {
    const key = `${entry.date.getFullYear()}-${entry.date.getMonth()}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  const pages: Array<{
    dataUrl: string;
    filename: string;
    monthIndex: number;
  }> = [];

  const cols = 4;
  const chartW = 220;
  const chartH = 180;
  const padding = 12;
  const titleH = 44;
  const legendH = 36;
  const natalSectionLabelH = 24;
  const natalChartSize = 200;
  const natalTotalH = natalSectionLabelH + natalChartSize + 8;

  for (const [key, days] of grouped) {
    const [yrStr, moStr] = key.split("-");
    const yr = Number(yrStr);
    const mo = Number(moStr);
    const monthName = MONTH_NAMES[mo];
    const rows = Math.ceil(days.length / cols);
    const logicalW = cols * chartW + (cols + 1) * padding;
    const logicalH =
      titleH + natalTotalH + rows * chartH + (rows + 1) * padding + legendH;

    const canvas = document.createElement("canvas");
    canvas.width = logicalW * SCALE;
    canvas.height = logicalH * SCALE;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(SCALE, SCALE);

    ctx.fillStyle = "#f9f6f0";
    ctx.fillRect(0, 0, logicalW, logicalH);

    // Title bar
    ctx.fillStyle = GREEN_HEADER;
    ctx.fillRect(0, 0, logicalW, titleH);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 11px Arial";
    ctx.fillText(`DOB: ${formatDob(dob)}`, logicalW / 2, titleH * 0.32);
    ctx.font = "bold 15px Arial";
    ctx.fillText(
      `Day Chart \u2013 ${monthName} ${yr}`,
      logicalW / 2,
      titleH * 0.72,
    );

    // Natal chart section at top
    let natalY = titleH + 6;
    drawNatalSectionHeader(ctx, 0, natalY, logicalW);
    natalY += natalSectionLabelH;
    const natalX = (logicalW - natalChartSize) / 2;
    drawMiniChart(
      ctx,
      natalX,
      natalY,
      natalChartSize,
      natalChartSize,
      natalCellCounts,
      basicNumber,
      destinyNumber,
      undefined,
      undefined,
      undefined,
      undefined,
      "NATAL",
    );

    const daysStartY = titleH + natalTotalH + padding;
    days.forEach((entry, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = padding + col * (chartW + padding);
      const y = daysStartY + row * (chartH + padding);
      const label = formatDate(entry.date);
      drawMiniChart(
        ctx,
        x,
        y,
        chartW,
        chartH,
        natalCellCounts,
        basicNumber,
        destinyNumber,
        dasaNumber,
        yearNumber,
        entry.monthNumber,
        entry.dayNumber,
        label,
      );
    });

    drawColorLegendBar(ctx, 0, logicalH - legendH, logicalW);

    const moShort = monthName.slice(0, 3).toLowerCase();
    pages.push({
      dataUrl: canvas.toDataURL("image/png"),
      filename: `day-chart-${moShort}-${yr}.png`,
      monthIndex: mo,
    });
  }

  return pages;
}

function generateNatalChartPNG(
  natalCellCounts: Record<number, number>,
  basicNumber: number,
  destinyNumber: number,
  dasaNumber: number,
  yearNumber: number,
  dob: string,
): string {
  const titleH = 44;
  const legendH = 36;
  const chartSize = 480;
  const logicalW = chartSize;
  const logicalH = titleH + chartSize + legendH;

  const canvas = document.createElement("canvas");
  canvas.width = logicalW * SCALE;
  canvas.height = logicalH * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  ctx.fillStyle = "#f9f6f0";
  ctx.fillRect(0, 0, logicalW, logicalH);

  ctx.fillStyle = GREEN_HEADER;
  ctx.fillRect(0, 0, logicalW, titleH);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 11px Arial";
  ctx.fillText(`DOB: ${formatDob(dob)}`, logicalW / 2, titleH * 0.32);
  ctx.font = "bold 15px Arial";
  ctx.fillText("Natal Chart", logicalW / 2, titleH * 0.72);

  drawMiniChart(
    ctx,
    0,
    titleH,
    chartSize,
    chartSize,
    natalCellCounts,
    basicNumber,
    destinyNumber,
    dasaNumber,
    yearNumber,
    undefined,
    undefined,
    "NATAL CHART",
  );

  drawColorLegendBar(ctx, 0, titleH + chartSize, logicalW);
  return canvas.toDataURL("image/png");
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function generateAllYearsPNG(
  entries: Array<{
    yearIter: number;
    dasaNumber: number;
    yearNumber: number;
    yearLabel: string;
  }>,
  day: number,
  month: number,
  basicNumber: number,
  destinyNumber: number,
  natalCellCounts: Record<number, number>,
  dob: string,
): string {
  // day and month are used for context; kept for API consistency
  void day;
  void month;

  const MAX = 30;
  const limited = entries.slice(0, MAX);

  const cols = 3;
  const cardW = 200;
  const cardH = 220;
  const padding = 12;
  const titleH = 44;
  const legendH = 36;
  const natalSectionLabelH = 24;
  const natalChartSize = 240;
  const natalTotalH = natalSectionLabelH + natalChartSize + 8;
  const rows = Math.ceil(limited.length / cols);

  const logicalW = cols * cardW + (cols + 1) * padding;
  const logicalH =
    titleH + natalTotalH + rows * cardH + (rows + 1) * padding + legendH;

  const canvas = document.createElement("canvas");
  canvas.width = logicalW * SCALE;
  canvas.height = logicalH * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  ctx.fillStyle = "#f9f6f0";
  ctx.fillRect(0, 0, logicalW, logicalH);

  // Title bar
  ctx.fillStyle = GREEN_HEADER;
  ctx.fillRect(0, 0, logicalW, titleH);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 11px Arial";
  ctx.fillText(`DOB: ${formatDob(dob)}`, logicalW / 2, titleH * 0.32);
  ctx.font = "bold 15px Arial";
  ctx.fillText("Dasa & Year Charts", logicalW / 2, titleH * 0.72);

  // Natal chart section at top
  let natalY = titleH + 6;
  drawNatalSectionHeader(ctx, 0, natalY, logicalW);
  natalY += natalSectionLabelH;
  const natalX = (logicalW - natalChartSize) / 2;
  drawMiniChart(
    ctx,
    natalX,
    natalY,
    natalChartSize,
    natalChartSize,
    natalCellCounts,
    basicNumber,
    destinyNumber,
    undefined,
    undefined,
    undefined,
    undefined,
    "NATAL",
  );

  const cardsStartY = titleH + natalTotalH + padding;
  limited.forEach((entry, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = padding + col * (cardW + padding);
    const y = cardsStartY + row * (cardH + padding);
    drawMiniChart(
      ctx,
      x,
      y,
      cardW,
      cardH,
      natalCellCounts,
      basicNumber,
      destinyNumber,
      entry.dasaNumber,
      entry.yearNumber,
      undefined,
      undefined,
      entry.yearLabel,
    );
  });

  drawColorLegendBar(ctx, 0, logicalH - legendH, logicalW);
  return canvas.toDataURL("image/png");
}

export function DownloadChartDialog({
  open,
  onClose,
  yearIter,
  day,
  month,
  basicNumber,
  destinyNumber,
  natalCellCounts,
  dasaNumber,
  yearNumber,
  dob,
}: DownloadChartDialogProps) {
  const dobDisplay = dob
    ? formatDob(dob)
    : `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
  const dobStr =
    dob ??
    `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-????`;

  const [step, setStep] = useState<"options" | "month-picker">("options");

  function handleClose() {
    setStep("options");
    onClose();
  }

  function handleDownloadMonth() {
    setTimeout(() => {
      try {
        const dataUrl = generateMonthChartPNG(
          yearIter,
          day,
          month,
          basicNumber,
          destinyNumber,
          natalCellCounts,
          dasaNumber,
          yearNumber,
          dobStr,
        );
        triggerDownload(dataUrl, `year-${yearIter}-month-chart.png`);
        handleClose();
      } catch (err) {
        console.error(err);
      }
    }, 50);
  }

  function handleDownloadDayForMonth(targetMonthIndex: number) {
    setTimeout(() => {
      try {
        const pages = generateDayChartPages(
          yearIter,
          day,
          month,
          basicNumber,
          destinyNumber,
          natalCellCounts,
          dasaNumber,
          yearNumber,
          dobStr,
        );
        const page = pages.find((p) => p.monthIndex === targetMonthIndex);
        if (page) {
          triggerDownload(page.dataUrl, page.filename);
        }
        handleClose();
      } catch (err) {
        console.error(err);
      }
    }, 50);
  }

  function handleDownloadNatal() {
    setTimeout(() => {
      try {
        const dataUrl = generateNatalChartPNG(
          natalCellCounts,
          basicNumber,
          destinyNumber,
          dasaNumber,
          yearNumber,
          dobStr,
        );
        triggerDownload(dataUrl, "natal-chart.png");
        handleClose();
      } catch (err) {
        console.error(err);
      }
    }, 50);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        data-ocid="download_chart.dialog"
        className="max-w-sm w-full"
        style={{ background: "#ffffff", border: `1px solid ${BORDER_COLOR}` }}
      >
        <DialogHeader>
          <DialogTitle
            className="font-display font-bold text-center"
            style={{ color: GREEN_HEADER }}
          >
            {step === "options" && "Download Chart"}
            {step === "month-picker" && "Choose Month"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-1">
          {/* ── OPTIONS STEP ── */}
          {step === "options" && (
            <>
              {/* Color Legend — shown first */}
              <div
                className="rounded-md px-3 py-2"
                style={{
                  background: "#fafaf8",
                  border: `1px solid ${BORDER_COLOR}`,
                }}
              >
                <p
                  className="text-xs font-semibold mb-2"
                  style={{ color: "#555" }}
                >
                  Color Guide:
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {COLOR_LEGEND.map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                        style={{
                          background: item.bg ?? item.color,
                          border: "1px solid rgba(0,0,0,0.15)",
                        }}
                      />
                      <span className="text-xs" style={{ color: "#333" }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DOB */}
              <div
                className="rounded-md px-3 py-2 text-sm font-semibold text-center"
                style={{
                  background: "#f0faf4",
                  color: GREEN_HEADER,
                  border: `1px solid ${BORDER_COLOR}`,
                }}
              >
                DOB: {dobDisplay}
              </div>

              {/* Download buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  data-ocid="download_chart.month_button"
                  onClick={handleDownloadMonth}
                  variant="outline"
                  className="w-full justify-start font-bold"
                  style={{ borderColor: MONTH_COLOR, color: MONTH_COLOR }}
                >
                  📅 Month Chart — Year {yearIter}–{yearIter + 1}
                </Button>
                <Button
                  data-ocid="download_chart.day_button"
                  onClick={() => setStep("month-picker")}
                  className="w-full justify-start font-bold"
                  style={{ background: GREEN_HEADER, color: "#fff" }}
                >
                  📆 Day Chart — Pick a Month
                </Button>
                <Button
                  data-ocid="download_chart.natal_button"
                  onClick={handleDownloadNatal}
                  variant="outline"
                  className="w-full justify-start font-bold"
                  style={{ borderColor: "#999", color: NATAL_COLOR }}
                >
                  ⬛ Natal Chart
                </Button>
              </div>
            </>
          )}

          {/* ── MONTH PICKER STEP ── */}
          {step === "month-picker" && (
            <>
              <button
                type="button"
                onClick={() => setStep("options")}
                className="text-sm text-left font-medium"
                style={{
                  color: GREEN_HEADER,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ← Back
              </button>
              <p className="text-sm text-center" style={{ color: "#555" }}>
                Select a month to download its day chart for Year {yearIter}–
                {yearIter + 1}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {MONTH_SHORT.map((name, idx) => (
                  <Button
                    key={name}
                    data-ocid={`download_chart.month_picker.item.${idx + 1}`}
                    onClick={() => handleDownloadDayForMonth(idx)}
                    variant="outline"
                    className="w-full font-bold text-sm"
                    style={{ borderColor: GREEN_HEADER, color: GREEN_HEADER }}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
