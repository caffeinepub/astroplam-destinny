import type { BlueCard, DisplayCard, RedCard, YellowCard } from "../types/nadi";
import { HOUSE_SYMBOLS, PLANET_SYMBOLS } from "../utils/deck";

interface NadiCardProps {
  dc: DisplayCard;
  size?: "sm" | "md";
}

const BACK_IMAGES: Record<string, string> = {
  blue: "/assets/generated/card-back-blue.dim_200x300.jpg",
  red: "/assets/generated/card-back-red.dim_200x300.jpg",
  yellow: "/assets/generated/card-back-yellow.dim_200x300.jpg",
};

export default function NadiCard({ dc, size = "md" }: NadiCardProps) {
  const { card, revealed } = dc;
  const isSmall = size === "sm";
  const w = isSmall ? 72 : 92;
  const h = isSmall ? 108 : 138;
  const backSrc = BACK_IMAGES[card.type];

  return (
    <div
      className="flex-shrink-0 rounded-lg overflow-hidden"
      style={{ width: w, height: h, flexShrink: 0 }}
    >
      {!revealed ? (
        <img
          src={backSrc}
          alt="card back"
          style={{ width: w, height: h, objectFit: "cover", display: "block" }}
        />
      ) : (
        <>
          {card.type === "blue" && (
            <BlueFace card={card as BlueCard} w={w} h={h} small={isSmall} />
          )}
          {card.type === "red" && (
            <RedFace card={card as RedCard} w={w} h={h} small={isSmall} />
          )}
          {card.type === "yellow" && (
            <YellowFace card={card as YellowCard} w={w} h={h} small={isSmall} />
          )}
        </>
      )}
    </div>
  );
}

function BlueFace({
  card,
  w,
  h,
  small,
}: { card: BlueCard; w: number; h: number; small: boolean }) {
  const symbol = HOUSE_SYMBOLS[card.house] ?? "✦";
  return (
    <div
      className="flex flex-col items-center justify-between p-1.5"
      style={{
        width: w,
        height: h,
        background:
          "linear-gradient(160deg, oklch(0.18 0.10 262) 0%, oklch(0.28 0.14 255) 55%, oklch(0.20 0.12 268) 100%)",
        border: "2px solid oklch(0.72 0.148 85)",
        borderRadius: 8,
        boxSizing: "border-box",
      }}
    >
      <div
        className="text-[10px] font-bold text-center w-full"
        style={{ color: "oklch(0.78 0.148 85)" }}
      >
        {card.house}
      </div>
      <div
        className={`${small ? "text-xl" : "text-2xl"} leading-none`}
        style={{ color: "oklch(0.85 0.10 88)" }}
      >
        {symbol}
      </div>
      <div
        className={`text-center font-semibold leading-tight ${small ? "text-[8px]" : "text-[9px]"}`}
        style={{ color: "oklch(0.92 0.06 85)" }}
      >
        {card.name}
      </div>
    </div>
  );
}

function RedFace({
  card,
  w,
  h,
  small,
}: { card: RedCard; w: number; h: number; small: boolean }) {
  const symbol = PLANET_SYMBOLS[card.planet] ?? "★";
  return (
    <div
      className="flex flex-col items-center justify-between p-1.5"
      style={{
        width: w,
        height: h,
        background:
          "linear-gradient(160deg, oklch(0.18 0.12 22) 0%, oklch(0.30 0.20 20) 55%, oklch(0.22 0.14 18) 100%)",
        border: "2px solid oklch(0.72 0.148 85)",
        borderRadius: 8,
        boxSizing: "border-box",
      }}
    >
      <div
        className="text-[8px] font-bold uppercase tracking-widest"
        style={{ color: "oklch(0.78 0.148 85)" }}
      >
        Planet
      </div>
      <div
        className={`${small ? "text-xl" : "text-2xl"} leading-none`}
        style={{ color: "oklch(0.88 0.12 85)" }}
      >
        {symbol}
      </div>
      <div
        className={`text-center font-semibold leading-tight ${small ? "text-[8px]" : "text-[9px]"}`}
        style={{ color: "oklch(0.92 0.06 85)" }}
      >
        {card.planet}
      </div>
    </div>
  );
}

function YellowFace({
  card,
  w,
  h,
  small,
}: { card: YellowCard; w: number; h: number; small: boolean }) {
  const rasiNames = [
    "",
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];
  const rasiSymbols = [
    "",
    "♈",
    "♉",
    "♊",
    "♋",
    "♌",
    "♍",
    "♎",
    "♏",
    "♐",
    "♑",
    "♒",
    "♓",
  ];
  const name = rasiNames[card.rasiNumber] ?? `Rasi ${card.rasiNumber}`;
  const sym = rasiSymbols[card.rasiNumber] ?? "✦";
  return (
    <div
      className="flex flex-col items-center justify-between p-1.5"
      style={{
        width: w,
        height: h,
        background:
          "linear-gradient(160deg, oklch(0.62 0.16 82) 0%, oklch(0.72 0.20 88) 55%, oklch(0.58 0.15 76) 100%)",
        border: "2px solid oklch(0.35 0.06 78)",
        borderRadius: 8,
        boxSizing: "border-box",
      }}
    >
      <div
        className="text-[8px] font-bold"
        style={{ color: "oklch(0.25 0.05 70)" }}
      >
        Rasi {card.rasiNumber}
      </div>
      <div
        className={`${small ? "text-xl" : "text-2xl"} leading-none`}
        style={{ color: "oklch(0.22 0.06 70)" }}
      >
        {sym}
      </div>
      <div
        className={`text-center font-semibold leading-tight ${small ? "text-[8px]" : "text-[9px]"}`}
        style={{ color: "oklch(0.20 0.06 70)" }}
      >
        {name}
      </div>
    </div>
  );
}
