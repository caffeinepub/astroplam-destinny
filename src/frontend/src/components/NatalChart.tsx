import { motion } from "motion/react";
import type React from "react";
import { GRID_LAYOUT, getCellDisplay } from "../utils/numerology";

interface NatalChartProps {
  cellCounts: Record<number, number>;
  basicNumber: number;
  destinyNumber: number;
  animate?: boolean;
  dasaNumber?: number;
  yearNumber?: number;
  compact?: boolean;
  yearLabel?: string;
  monthNumber?: number;
  dayNumber?: number;
  hideHeader?: boolean;
  showLegend?: boolean;
}

// Color constants
const GREEN_HEADER = "#2E8B57";
const MONTH_COLOR = "#7c3aed";
const DAY_COLOR = "#ec4899";
const BASIC_COLOR = "#dc2626";
const DESTINY_COLOR = "#eab308";
const NATAL_COLOR = "#000000";
const DASA_COLOR = "#ec4899";
const YEAR_COLOR = "#ffffff";
const YEAR_BG = "rgba(22,163,74,0.88)";
const BORDER_COLOR = "#c8a96e";
const CELL_BG = "#ffffff";

function getFontSize(base: number, text: string): number {
  if (text.length <= 1) return base;
  if (text.length === 2) return Math.round(base * 0.8);
  return Math.round(base * 0.6);
}

function CellWatermark({ compact }: { compact: boolean }) {
  const wStyle: React.CSSProperties = {
    fontSize: compact ? "7px" : "9px",
    color: "rgba(150,120,60,0.18)",
    fontFamily: "Outfit, sans-serif",
    fontWeight: 600,
    whiteSpace: "nowrap" as const,
    letterSpacing: "0.08em",
  };

  return (
    <span
      aria-hidden
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      style={{
        transform: "rotate(-28deg)",
        userSelect: "none",
        zIndex: 0,
      }}
    >
      <span style={wStyle}>Viku Kharb</span>
    </span>
  );
}

function ColorLegend({ compact }: { compact?: boolean }) {
  const items = [
    { label: "Basic", color: BASIC_COLOR, bg: undefined },
    { label: "Destiny", color: DESTINY_COLOR, bg: undefined },
    { label: "Dasa", color: DASA_COLOR, bg: undefined },
    { label: "Year", color: YEAR_COLOR, bg: YEAR_BG },
  ];
  return (
    <div
      className="flex flex-wrap gap-x-3 gap-y-1 px-2 py-1.5"
      style={{
        background: "#fafaf7",
        borderTop: `1px solid ${BORDER_COLOR}`,
      }}
    >
      {items.map((item) => (
        <span
          key={item.label}
          className="flex items-center gap-1"
          style={{ fontSize: compact ? "9px" : "11px" }}
        >
          <span
            className="inline-block rounded-sm font-bold"
            style={{
              width: compact ? 12 : 16,
              height: compact ? 12 : 16,
              background: item.bg ?? item.color,
              color: item.bg ? item.color : "#fff",
              fontSize: compact ? 8 : 10,
              lineHeight: compact ? "12px" : "16px",
              textAlign: "center",
              border: item.bg ? `1px solid ${BORDER_COLOR}` : "none",
            }}
          >
            #
          </span>
          <span
            style={{
              color: "#7a6235",
              fontWeight: 500,
              fontFamily: "Outfit, sans-serif",
            }}
          >
            {item.label}
          </span>
        </span>
      ))}
    </div>
  );
}

export function NatalChart({
  cellCounts,
  basicNumber,
  destinyNumber,
  animate: shouldAnimate = true,
  dasaNumber,
  yearNumber,
  compact = false,
  yearLabel,
  monthNumber,
  dayNumber,
  hideHeader = false,
  showLegend = false,
}: NatalChartProps) {
  const cellMinHeight = compact ? "44px" : "72px";

  return (
    <div
      data-ocid="natal_chart.panel"
      className="w-full"
      style={{
        background: CELL_BG,
        border: `1px solid ${BORDER_COLOR}`,
      }}
    >
      {!hideHeader &&
        (yearLabel ? (
          <div
            className="py-1.5 px-3 text-center font-display font-bold tracking-[0.12em] text-xs uppercase"
            style={{ background: GREEN_HEADER, color: "#ffffff" }}
          >
            {yearLabel}
          </div>
        ) : (
          <div
            className="py-2.5 px-4 text-center font-display font-bold tracking-[0.2em] text-sm uppercase"
            style={{ background: GREEN_HEADER, color: "#ffffff" }}
          >
            NATAL CHART
          </div>
        ))}

      <div
        className="grid grid-cols-3"
        style={{
          border: `1.5px solid ${BORDER_COLOR}`,
          borderTop: hideHeader || !yearLabel ? undefined : "none",
        }}
      >
        {GRID_LAYOUT.flat().map((cellNum, idx) => {
          const count = cellCounts[cellNum] ?? 0;
          const display = getCellDisplay(cellNum, cellCounts);

          const isBasic = cellNum === basicNumber;
          const isDestiny = cellNum === destinyNumber;
          const isDasa = dasaNumber !== undefined && cellNum === dasaNumber;
          const isYear = yearNumber !== undefined && cellNum === yearNumber;
          const isMonth = monthNumber !== undefined && cellNum === monthNumber;
          const isDay = dayNumber !== undefined && cellNum === dayNumber;

          const row = Math.floor(idx / 3);
          const col = idx % 3;

          const displayStr = String(display);
          const dasaStr = String(dasaNumber);
          const yearStr = String(yearNumber);
          const monthStr = String(monthNumber);
          const dayStr = String(dayNumber);

          return (
            <div
              key={cellNum}
              className="relative flex items-center justify-center overflow-hidden"
              style={{
                minHeight: cellMinHeight,
                background: CELL_BG,
                borderRight: col < 2 ? `1px solid ${BORDER_COLOR}` : "none",
                borderBottom: row < 2 ? `1px solid ${BORDER_COLOR}` : "none",
              }}
            >
              <CellWatermark compact={compact} />

              <div
                className="relative z-10 flex flex-row flex-wrap items-center justify-center gap-1"
                style={{ padding: compact ? "2px" : "4px", width: "100%" }}
              >
                {count > 0 && (
                  <motion.span
                    initial={shouldAnimate ? { scale: 0.5, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: shouldAnimate ? idx * 0.05 : 0,
                      type: "spring",
                      stiffness: 300,
                    }}
                    className="font-display font-bold leading-none"
                    style={{
                      fontSize: `${getFontSize(compact ? 14 : 20, displayStr)}px`,
                      color: isBasic
                        ? BASIC_COLOR
                        : isDestiny
                          ? DESTINY_COLOR
                          : NATAL_COLOR,
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      display: "inline-block",
                      flexShrink: 1,
                      minWidth: 0,
                    }}
                  >
                    {display}
                  </motion.span>
                )}

                {isDasa && (
                  <span
                    className="font-display font-bold leading-none"
                    style={{
                      fontSize: `${getFontSize(compact ? 17 : 25, dasaStr)}px`,
                      color: DASA_COLOR,
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      display: "inline-block",
                      flexShrink: 1,
                      minWidth: 0,
                    }}
                  >
                    {dasaNumber}
                  </span>
                )}

                {isYear && (
                  <span
                    className="font-display font-bold leading-none rounded-sm px-0.5"
                    style={{
                      fontSize: `${getFontSize(compact ? 20 : 30, yearStr)}px`,
                      color: YEAR_COLOR,
                      background: YEAR_BG,
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      display: "inline-block",
                      flexShrink: 1,
                      minWidth: 0,
                    }}
                  >
                    {yearNumber}
                  </span>
                )}

                {isMonth && (
                  <span
                    className="font-display font-bold leading-none"
                    style={{
                      fontSize: `${getFontSize(compact ? 10 : 14, monthStr)}px`,
                      color: MONTH_COLOR,
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      display: "inline-block",
                      flexShrink: 1,
                      minWidth: 0,
                    }}
                  >
                    {monthNumber}
                  </span>
                )}

                {isDay && (
                  <span
                    className="font-display font-bold leading-none"
                    style={{
                      fontSize: `${getFontSize(compact ? 11 : 15, dayStr)}px`,
                      color: DAY_COLOR,
                      fontStyle: "italic",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      display: "inline-block",
                      flexShrink: 1,
                      minWidth: 0,
                    }}
                  >
                    {dayNumber}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showLegend && <ColorLegend compact={compact} />}
    </div>
  );
}
