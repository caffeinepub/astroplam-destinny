import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSaveNadiReading } from "../hooks/useNadiQueries";
import type {
  AppPhase,
  BlueCard,
  DisplayCard,
  DisplayRow,
  NadiCardData,
  RedCard,
  YellowCard,
} from "../types/nadi";
import {
  HOUSE_SYMBOLS,
  PLANET_SYMBOLS,
  createBlueCards,
  createRedCards,
  createYellowCards,
  getBlueCount,
  shuffleArray,
} from "../utils/deck";
import NadiCardDisplay from "./NadiCardDisplay";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const THREE_WITH_REPEAT_STOP = [
  "Aggression",
  "Wisdom",
  "Sorrow",
  "Intellect",
  "Beauty",
];

type AppMode = "auto" | "pick";

interface SpreadCard {
  card: NadiCardData;
  used: boolean;
  flipped: boolean;
  revealed: boolean;
}

type PickPhase = "idle" | "pick-red" | "pick-blue" | "pick-yellow" | "complete";

interface PickState {
  phase: PickPhase;
  currentRow: number;
  blueTarget: number | "repeat";
  bluePickedCount: number;
  blueHousesSeen: string[];
}

export default function NadiAppMain() {
  const [mode, setMode] = useState<AppMode>("auto");
  const navigate = useNavigate();

  // --- Auto Pull state ---
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [isShuffling, setIsShuffling] = useState(false);
  const [rows, setRows] = useState<DisplayRow[]>([]);
  const [activeRowIndex, setActiveRowIndex] = useState(-1);
  const [notes, setNotes] = useState("");
  const blueRef = useRef<BlueCard[]>([]);
  const redRef = useRef<RedCard[]>([]);
  const yellowRef = useRef<YellowCard[]>([]);
  const readingInProgress = useRef(false);

  // --- Pick Cards state ---
  const [spreadBlue, setSpreadBlue] = useState<SpreadCard[]>([]);
  const [spreadRed, setSpreadRed] = useState<SpreadCard[]>([]);
  const [spreadYellow, setSpreadYellow] = useState<SpreadCard[]>([]);
  const [pickRows, setPickRows] = useState<DisplayRow[]>([]);
  const [pickState, setPickState] = useState<PickState>({
    phase: "idle",
    currentRow: 0,
    blueTarget: 2,
    bluePickedCount: 0,
    blueHousesSeen: [],
  });
  const [pickActiveRow, setPickActiveRow] = useState(-1);

  const _saveReading = useSaveNadiReading();

  const usedBlue = rows.flatMap((r) =>
    r.cards.filter((c) => c.card.type === "blue"),
  ).length;
  const usedRed = rows.filter((r) =>
    r.cards.some((c) => c.card.type === "red"),
  ).length;
  const remainingBlue = 48 - usedBlue;
  const remainingRed = 12 - usedRed;

  const addCard = (rowIndex: number, card: NadiCardData, displayId: string) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === rowIndex
          ? { ...r, cards: [...r.cards, { card, revealed: false, displayId }] }
          : r,
      ),
    );
  };

  const revealCard = (displayId: string) => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        cards: r.cards.map((c) =>
          c.displayId === displayId ? { ...c, revealed: true } : c,
        ),
      })),
    );
  };

  const markRowComplete = (rowIndex: number) => {
    setRows((prev) =>
      prev.map((r, i) => (i === rowIndex ? { ...r, complete: true } : r)),
    );
  };

  const handleShuffle = async () => {
    if (phase === "reading") return;
    setIsShuffling(true);
    await sleep(700);
    blueRef.current = shuffleArray(createBlueCards());
    redRef.current = shuffleArray(createRedCards());
    yellowRef.current = createYellowCards();
    setIsShuffling(false);
    setRows([]);
    setPhase("shuffled");
    toast.success("Cards shuffled. Press Pull to begin.");
  };

  const handlePull = async () => {
    if (readingInProgress.current || phase !== "shuffled") return;
    readingInProgress.current = true;
    setPhase("reading");

    const blueRemaining = [...blueRef.current];
    const redRemaining = [...redRef.current];

    setRows([
      { index: 0, cards: [], complete: false },
      { index: 1, cards: [], complete: false },
      { index: 2, cards: [], complete: false },
    ]);

    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
      setActiveRowIndex(rowIndex);
      await sleep(300);

      const redCard = redRemaining.shift()!;
      const redId = `r${rowIndex}-red`;
      addCard(rowIndex, redCard, redId);
      await sleep(350);
      revealCard(redId);
      await sleep(700);

      const blueCount = getBlueCount(redCard.planet);

      if (blueCount === "repeat") {
        const seen = new Set<string>();
        let bi = 0;
        while (blueRemaining.length > 0) {
          const blueCard = blueRemaining.shift()!;
          const bid = `r${rowIndex}-b${bi}`;
          const isRepeat = seen.has(blueCard.name);
          seen.add(blueCard.name);
          addCard(rowIndex, blueCard, bid);
          await sleep(350);
          revealCard(bid);
          await sleep(600);
          bi++;
          if (isRepeat) break;
        }
      } else if (THREE_WITH_REPEAT_STOP.includes(redCard.planet)) {
        let prevHouse: number | null = null;
        let stopped = false;
        for (let j = 0; j < 3 && blueRemaining.length > 0 && !stopped; j++) {
          const blueCard = blueRemaining.shift()!;
          const bid = `r${rowIndex}-b${j}`;
          addCard(rowIndex, blueCard, bid);
          await sleep(350);
          revealCard(bid);
          await sleep(600);
          if (j === 1 && blueCard.house === prevHouse) {
            stopped = true;
          }
          prevHouse = blueCard.house;
        }
      } else {
        for (
          let j = 0;
          j < (blueCount as number) && blueRemaining.length > 0;
          j++
        ) {
          const blueCard = blueRemaining.shift()!;
          const bid = `r${rowIndex}-b${j}`;
          addCard(rowIndex, blueCard, bid);
          await sleep(350);
          revealCard(bid);
          await sleep(600);
        }
      }

      if (rowIndex === 2) {
        const yellowCard = yellowRef.current.find(
          (y) => y.rasiNumber === redCard.planetIndex,
        );
        if (yellowCard) {
          const yid = `r${rowIndex}-yellow`;
          addCard(rowIndex, yellowCard, yid);
          await sleep(350);
          revealCard(yid);
          await sleep(700);
        }
      }

      markRowComplete(rowIndex);
      await sleep(500);
    }

    setActiveRowIndex(-1);
    setPhase("complete");
    readingInProgress.current = false;
  };

  const handleReset = () => {
    setPhase("idle");
    setRows([]);
    setActiveRowIndex(-1);
    blueRef.current = [];
    redRef.current = [];
    yellowRef.current = [];
    readingInProgress.current = false;
  };

  const initPickMode = () => {
    const blue = shuffleArray(createBlueCards()).map((c) => ({
      card: c,
      used: false,
      flipped: false,
      revealed: false,
    }));
    const red = shuffleArray(createRedCards()).map((c) => ({
      card: c,
      used: false,
      flipped: false,
      revealed: false,
    }));
    const yellow = createYellowCards().map((c) => ({
      card: c,
      used: false,
      flipped: false,
      revealed: false,
    }));
    setSpreadBlue(blue);
    setSpreadRed(red);
    setSpreadYellow(yellow);
    setPickRows([
      { index: 0, cards: [], complete: false },
      { index: 1, cards: [], complete: false },
      { index: 2, cards: [], complete: false },
    ]);
    setPickState({
      phase: "pick-red",
      currentRow: 0,
      blueTarget: 2,
      bluePickedCount: 0,
      blueHousesSeen: [],
    });
    setPickActiveRow(0);
  };

  const getPickPrompt = (ps: PickState): string => {
    if (ps.phase === "idle") return "Press Start to begin your reading.";
    if (ps.phase === "complete") return "Reading complete!";
    const rowLabel = `Row ${ps.currentRow + 1}`;
    if (ps.phase === "pick-red") return `${rowLabel}: Tap a Red Planet card ↓`;
    if (ps.phase === "pick-blue") {
      if (ps.blueTarget === "repeat") {
        return `${rowLabel}: Tap Blue House cards — stop when you pick a repeated house.`;
      }
      const remaining = (ps.blueTarget as number) - ps.bluePickedCount;
      if (ps.blueTarget === 3 && ps.bluePickedCount === 0) {
        return `${rowLabel}: Tap up to 3 Blue cards — stops at 2 if same house appears twice ↓`;
      }
      return `${rowLabel}: Tap ${remaining} more Blue House card${remaining !== 1 ? "s" : ""} ↓`;
    }
    if (ps.phase === "pick-yellow")
      return `${rowLabel}: Tap the matching Yellow Rasi card ↓`;
    return "";
  };

  const addPickCard = (
    rowIndex: number,
    card: NadiCardData,
    displayId: string,
  ) => {
    setPickRows((prev) =>
      prev.map((r, i) =>
        i === rowIndex
          ? { ...r, cards: [...r.cards, { card, revealed: true, displayId }] }
          : r,
      ),
    );
  };

  const markPickRowComplete = (rowIndex: number) => {
    setPickRows((prev) =>
      prev.map((r, i) => (i === rowIndex ? { ...r, complete: true } : r)),
    );
  };

  const advanceRow = (ps: PickState, blueHousesSeen: string[]): PickState => {
    const nextRow = ps.currentRow + 1;
    if (ps.currentRow === 2 && ps.phase === "pick-blue") {
      markPickRowComplete(ps.currentRow);
      return {
        ...ps,
        phase: "pick-yellow",
        blueHousesSeen,
        bluePickedCount: 0,
      };
    }
    markPickRowComplete(ps.currentRow);
    setPickActiveRow(nextRow < 3 ? nextRow : -1);
    if (nextRow >= 3) {
      return {
        ...ps,
        phase: "complete",
        currentRow: nextRow,
        blueHousesSeen: [],
        bluePickedCount: 0,
      };
    }
    return {
      ...ps,
      phase: "pick-red",
      currentRow: nextRow,
      blueTarget: 2,
      bluePickedCount: 0,
      blueHousesSeen: [],
    };
  };

  const handleSpreadCardClick = (
    cardIndex: number,
    cardType: "blue" | "red" | "yellow",
  ) => {
    const ps = pickState;
    if (ps.phase === "idle" || ps.phase === "complete") return;
    if (ps.phase === "pick-red" && cardType !== "red") return;
    if (ps.phase === "pick-blue" && cardType !== "blue") return;
    if (ps.phase === "pick-yellow" && cardType !== "yellow") return;

    const spread =
      cardType === "blue"
        ? spreadBlue
        : cardType === "red"
          ? spreadRed
          : spreadYellow;
    const sc = spread[cardIndex];
    if (!sc || sc.used) return;

    const updateSpread = (prev: SpreadCard[]) =>
      prev.map((c, i) =>
        i === cardIndex
          ? { ...c, flipped: true, used: true, revealed: true }
          : c,
      );

    if (cardType === "blue") setSpreadBlue(updateSpread);
    else if (cardType === "red") setSpreadRed(updateSpread);
    else setSpreadYellow(updateSpread);

    const card = sc.card;
    const rowIdx = ps.currentRow;
    const displayId = `pick-r${rowIdx}-${cardType}-${cardIndex}`;

    setTimeout(() => {
      addPickCard(rowIdx, card, displayId);
      setPickState((prev) => {
        if (prev.phase === "pick-red") {
          const redCard = card as RedCard;
          return {
            ...prev,
            phase: "pick-blue",
            blueTarget: getBlueCount(redCard.planet),
            bluePickedCount: 0,
            blueHousesSeen: [],
          };
        }
        if (prev.phase === "pick-blue") {
          const blueCard = card as BlueCard;
          const newCount = prev.bluePickedCount + 1;
          const newSeen = [...prev.blueHousesSeen, blueCard.name];
          if (prev.blueTarget === "repeat") {
            if (prev.blueHousesSeen.includes(blueCard.name))
              return advanceRow(prev, newSeen);
            return {
              ...prev,
              bluePickedCount: newCount,
              blueHousesSeen: newSeen,
            };
          }
          if (prev.blueTarget === 3 && newCount === 2) {
            const prevHouseName =
              prev.blueHousesSeen[prev.blueHousesSeen.length - 1];
            if (prevHouseName === blueCard.name)
              return advanceRow(prev, newSeen);
          }
          if (newCount >= (prev.blueTarget as number))
            return advanceRow(prev, newSeen);
          return {
            ...prev,
            bluePickedCount: newCount,
            blueHousesSeen: newSeen,
          };
        }
        if (prev.phase === "pick-yellow")
          return advanceRow(prev, prev.blueHousesSeen);
        return prev;
      });
    }, 350);
  };

  const handlePickReset = () => {
    setPickState({
      phase: "idle",
      currentRow: 0,
      blueTarget: 2,
      bluePickedCount: 0,
      blueHousesSeen: [],
    });
    setPickRows([]);
    setPickActiveRow(-1);
    setSpreadBlue([]);
    setSpreadRed([]);
    setSpreadYellow([]);
  };

  const handleModeSwitch = (newMode: AppMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    handleReset();
    handlePickReset();
  };

  const handlePrint = () => window.print();

  const canShuffle = phase !== "reading";
  const canPull = phase === "shuffled";
  const canPrint =
    mode === "auto"
      ? rows.length > 0
      : pickRows.some((r) => r.cards.length > 0);
  const _isPickActive =
    pickState.phase !== "idle" && pickState.phase !== "complete";
  const isYellowLocked = pickState.phase !== "pick-yellow";

  return (
    <div className="min-h-screen" style={{ background: "#e8e8e8" }}>
      {/* Orange top section */}
      <div className="nadi-deck-area" style={{ background: "#f5a623" }}>
        {/* Title bar */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-bold text-white text-base">Vedic Cards</span>
          <div className="flex gap-2 no-print items-center flex-wrap justify-end">
            {/* Vedic Numerology button */}
            <button
              type="button"
              data-ocid="nadi.vedic_numerology_link"
              onClick={() => navigate({ to: "/numerology" })}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "white",
                border: "1.5px solid rgba(255,255,255,0.55)",
              }}
            >
              <span style={{ fontSize: 13 }}>🔢</span>
              Vedic Numerology
            </button>

            {/* Mode Toggle */}
            <div
              className="flex rounded-lg overflow-hidden border"
              style={{
                borderColor: "rgba(255,255,255,0.4)",
                background: "rgba(0,0,0,0.15)",
              }}
            >
              <button
                data-ocid="nadi.auto_pull_toggle"
                type="button"
                onClick={() => handleModeSwitch("auto")}
                className="px-3 py-1 text-xs font-semibold transition-all"
                style={{
                  background:
                    mode === "auto" ? "rgba(255,255,255,0.9)" : "transparent",
                  color: mode === "auto" ? "#c0392b" : "rgba(255,255,255,0.85)",
                }}
              >
                Auto Pull
              </button>
              <button
                data-ocid="nadi.pick_cards_toggle"
                type="button"
                onClick={() => handleModeSwitch("pick")}
                className="px-3 py-1 text-xs font-semibold transition-all"
                style={{
                  background:
                    mode === "pick" ? "rgba(255,255,255,0.9)" : "transparent",
                  color: mode === "pick" ? "#c0392b" : "rgba(255,255,255,0.85)",
                }}
              >
                Pick Cards
              </button>
            </div>

            {mode === "auto" && (
              <>
                <Button
                  data-ocid="nadi.pull_button"
                  onClick={handlePull}
                  disabled={!canPull}
                  size="sm"
                  className="h-8 px-4 font-semibold text-white"
                  style={{
                    background: canPull ? "#c0392b" : "#a93226",
                    border: "none",
                    opacity: canPull ? 1 : 0.7,
                  }}
                >
                  Pull
                </Button>
                <Button
                  data-ocid="nadi.shuffle_button"
                  onClick={handleShuffle}
                  disabled={!canShuffle}
                  size="sm"
                  className="h-8 px-4 font-semibold text-white"
                  style={{
                    background: canShuffle ? "#c0392b" : "#a93226",
                    border: "none",
                    opacity: canShuffle ? 1 : 0.7,
                  }}
                >
                  Shuffle
                </Button>
              </>
            )}

            {mode === "pick" && pickState.phase === "idle" && (
              <Button
                data-ocid="nadi.start_pick_button"
                onClick={initPickMode}
                size="sm"
                className="h-8 px-4 font-semibold text-white"
                style={{ background: "#c0392b", border: "none" }}
              >
                Start
              </Button>
            )}

            <Button
              data-ocid="nadi.print_button"
              onClick={handlePrint}
              disabled={!canPrint}
              size="sm"
              className="h-8 px-4 font-semibold"
              style={{
                background: "white",
                color: "#333",
                border: "none",
                opacity: canPrint ? 1 : 0.6,
              }}
            >
              Print
            </Button>
          </div>
        </div>

        {/* AUTO PULL: Deck area */}
        {mode === "auto" && (
          <div className="px-3 pb-4">
            <div
              className="w-full mb-3 rounded-lg overflow-hidden"
              style={{ height: 88 }}
            >
              <DeckFan
                remaining={remainingBlue}
                total={48}
                isShuffling={isShuffling}
                backSrc="/assets/generated/card-back-blue.dim_200x300.jpg"
                borderColor="#4a7aff"
                accentColor="rgba(74,122,255,0.25)"
              />
            </div>
            <div className="flex gap-3">
              <div
                className="flex-1 rounded-lg overflow-hidden"
                style={{ height: 88 }}
              >
                <DeckFan
                  remaining={remainingRed}
                  total={12}
                  isShuffling={isShuffling}
                  backSrc="/assets/generated/card-back-red.dim_200x300.jpg"
                  borderColor="#ff4a4a"
                  accentColor="rgba(255,74,74,0.25)"
                />
              </div>
              <div
                className="flex-1 rounded-lg overflow-hidden"
                style={{ height: 88 }}
              >
                <DeckFan
                  remaining={12}
                  total={12}
                  isShuffling={isShuffling}
                  backSrc="/assets/generated/card-back-yellow.dim_200x300.jpg"
                  borderColor="#d4b83a"
                  accentColor="rgba(212,184,58,0.25)"
                />
              </div>
            </div>
          </div>
        )}

        {/* PICK CARDS: Card spreads */}
        {mode === "pick" && (
          <div className="pb-4">
            {pickState.phase === "idle" ? (
              <div className="text-center py-6 text-white text-sm opacity-80">
                Press Start to spread all cards and begin picking.
              </div>
            ) : (
              <>
                <div
                  data-ocid="nadi.pick_prompt"
                  className="mx-3 mb-3 px-3 py-2 rounded-lg text-sm font-semibold text-white text-center"
                  style={{ background: "rgba(0,0,0,0.25)" }}
                >
                  {getPickPrompt(pickState)}
                </div>

                {/* Blue spread */}
                <div className="mb-2">
                  <div className="px-3 mb-1 text-xs font-bold text-white opacity-70">
                    Blue Cards
                  </div>
                  <div
                    data-ocid="nadi.blue_spread"
                    className="flex gap-1 overflow-x-auto px-3 pb-2"
                    style={{
                      WebkitOverflowScrolling: "touch",
                      opacity:
                        pickState.phase === "pick-blue" ||
                        pickState.phase === "pick-red"
                          ? 1
                          : 0.5,
                    }}
                  >
                    {spreadBlue
                      .filter((sc) => !sc.used)
                      .map((sc) => {
                        const origIdx = spreadBlue.indexOf(sc);
                        return (
                          <SpreadCardItem
                            key={`blue-${origIdx}`}
                            sc={sc}
                            cardType="blue"
                            index={origIdx}
                            canPick={pickState.phase === "pick-blue"}
                            onClick={() =>
                              handleSpreadCardClick(origIdx, "blue")
                            }
                          />
                        );
                      })}
                  </div>
                </div>

                {/* Red spread */}
                <div className="mb-2">
                  <div className="px-3 mb-1 text-xs font-bold text-white opacity-70">
                    Red Cards
                  </div>
                  <div
                    data-ocid="nadi.red_spread"
                    className="flex gap-1 overflow-x-auto px-3 pb-2"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    {spreadRed
                      .filter((sc) => !sc.used)
                      .map((sc) => {
                        const origIdx = spreadRed.indexOf(sc);
                        return (
                          <SpreadCardItem
                            key={`red-${origIdx}`}
                            sc={sc}
                            cardType="red"
                            index={origIdx}
                            canPick={pickState.phase === "pick-red"}
                            onClick={() =>
                              handleSpreadCardClick(origIdx, "red")
                            }
                          />
                        );
                      })}
                  </div>
                </div>

                {/* Yellow spread */}
                <div className="mb-2">
                  <div
                    className="px-3 mb-1 text-xs font-bold text-white"
                    style={{ opacity: isYellowLocked ? 0.4 : 0.9 }}
                  >
                    Yellow Cards{isYellowLocked ? " — locked until Row 3" : ""}
                  </div>
                  <div
                    data-ocid="nadi.yellow_spread"
                    className="flex gap-1 overflow-x-auto px-3 pb-2"
                    style={{
                      WebkitOverflowScrolling: "touch",
                      opacity: isYellowLocked ? 0.35 : 1,
                      pointerEvents: isYellowLocked ? "none" : "auto",
                    }}
                  >
                    {spreadYellow
                      .filter((sc) => !sc.used)
                      .map((sc) => {
                        const origIdx = spreadYellow.indexOf(sc);
                        return (
                          <SpreadCardItem
                            key={`yellow-${origIdx}`}
                            sc={sc}
                            cardType="yellow"
                            index={origIdx}
                            canPick={pickState.phase === "pick-yellow"}
                            onClick={() =>
                              handleSpreadCardClick(origIdx, "yellow")
                            }
                          />
                        );
                      })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Gray reading area */}
      <div
        className="nadi-reading-area px-3 pt-4 pb-6"
        style={{ background: "#e0e0e0" }}
      >
        {mode === "auto" && (
          <>
            {rows.length === 0 && (
              <div
                className="text-center py-6 text-sm"
                style={{ color: "#666" }}
              >
                {phase === "idle" &&
                  "Press Shuffle then Pull to begin your reading."}
                {phase === "shuffled" &&
                  "Cards shuffled. Press Pull to draw your reading."}
              </div>
            )}
            <div className="space-y-6">
              {rows.map((row) => (
                <ReadingRow
                  key={`row-${row.index}`}
                  row={row}
                  rowIdx={row.index}
                  isActive={activeRowIndex === row.index}
                />
              ))}
            </div>
            {phase === "complete" && (
              <div className="mt-4 text-center no-print">
                <Button
                  data-ocid="nadi.reset_button"
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  style={{ borderColor: "#999", color: "#555" }}
                >
                  New Reading
                </Button>
              </div>
            )}
          </>
        )}

        {mode === "pick" && (
          <>
            {pickRows.length === 0 && pickState.phase === "idle" && (
              <div
                className="text-center py-6 text-sm"
                style={{ color: "#666" }}
              >
                Press Start to spread cards and begin your reading.
              </div>
            )}
            {pickRows.length > 0 && (
              <div className="space-y-6">
                {pickRows.map((row) => (
                  <ReadingRow
                    key={`pick-row-${row.index}`}
                    row={row}
                    rowIdx={row.index}
                    isActive={pickActiveRow === row.index}
                  />
                ))}
              </div>
            )}
            {pickState.phase === "complete" && (
              <div className="mt-4 text-center no-print">
                <Button
                  data-ocid="nadi.pick_reset_button"
                  onClick={handlePickReset}
                  variant="outline"
                  size="sm"
                  style={{ borderColor: "#999", color: "#555" }}
                >
                  New Reading
                </Button>
              </div>
            )}
          </>
        )}

        {/* Vedic Numerology banner */}
        <div
          className="mt-8 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between"
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            border: "1.5px solid rgba(212,184,58,0.35)",
          }}
        >
          <div>
            <div
              className="text-sm font-bold"
              style={{ color: "oklch(0.78 0.148 85)" }}
            >
              ✦ Also Try: Vedic Numerology
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: "oklch(0.70 0.06 80)" }}
            >
              Discover your life path, name number & destiny through ancient
              Vedic wisdom.
            </div>
          </div>
          <button
            type="button"
            data-ocid="nadi.numerology_banner_button"
            onClick={() => navigate({ to: "/numerology" })}
            className="flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.62 0.16 82), oklch(0.55 0.18 60))",
              color: "oklch(0.12 0.02 70)",
              border: "none",
            }}
          >
            Open Numerology →
          </button>
        </div>

        {/* Notes */}
        <div className="mt-8">
          <label
            htmlFor="nadi-notes"
            className="block text-sm font-semibold mb-1"
            style={{ color: "#444" }}
          >
            Notes:
          </label>
          <textarea
            id="nadi-notes"
            data-ocid="nadi.notes_textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter your notes"
            rows={6}
            className="w-full rounded border p-3 text-sm"
            style={{
              background: "white",
              borderColor: "#ccc",
              color: "#333",
              resize: "vertical",
            }}
          />
        </div>

        <div className="mt-8 text-center text-xs" style={{ color: "#999" }}>
          Built with{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#aaa" }}
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </div>
  );
}

// ======================== DECK FAN ========================

const SLICE_COUNT = 22;
const FULL_CARD_W = 58;
const FULL_CARD_H = 88;

import { useEffect, useRef as useRef2 } from "react";

function DeckFan({
  remaining,
  total,
  isShuffling,
  backSrc,
  borderColor,
  accentColor,
}: {
  remaining: number;
  total: number;
  isShuffling: boolean;
  backSrc: string;
  borderColor: string;
  accentColor: string;
}) {
  const containerRef = useRef2<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(300);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerW(entry.contentRect.width);
    });
    ro.observe(el);
    setContainerW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const ratio = remaining / total;
  const visibleSlices = Math.max(1, Math.round(SLICE_COUNT * ratio));
  const sliceWidth = (containerW - FULL_CARD_W) / Math.max(visibleSlices, 1);
  const slices = Array.from({ length: visibleSlices }, (_, i) => ({
    id: `fan-${i}-of-${visibleSlices}`,
    left: i * sliceWidth,
    opacity: 0.82 + (i / visibleSlices) * 0.15,
  }));

  return (
    <div
      ref={containerRef}
      className={isShuffling ? "animate-pulse" : ""}
      style={{
        position: "relative",
        width: "100%",
        height: FULL_CARD_H,
        background: accentColor,
        overflow: "hidden",
      }}
    >
      {remaining === 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: borderColor,
              fontSize: 11,
              opacity: 0.6,
              fontWeight: 600,
            }}
          >
            Empty
          </span>
        </div>
      ) : (
        <>
          {slices.map((slice) => (
            <div
              key={slice.id}
              style={{
                position: "absolute",
                left: slice.left,
                top: 0,
                width: sliceWidth + 1,
                height: FULL_CARD_H,
                backgroundImage: `url(${backSrc})`,
                backgroundSize: `${FULL_CARD_W}px ${FULL_CARD_H}px`,
                backgroundPosition: "center",
                borderRight: `1px solid ${borderColor}44`,
                opacity: slice.opacity,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: FULL_CARD_W,
              height: FULL_CARD_H,
              backgroundImage: `url(${backSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: `2px solid ${borderColor}`,
              borderRadius: 6,
              boxShadow: `0 2px 10px rgba(0,0,0,0.5), 0 0 8px ${borderColor}60`,
            }}
          />
        </>
      )}
    </div>
  );
}

// ======================== SPREAD CARD ITEM ========================

const BACK_BORDER_COLORS: Record<string, string> = {
  blue: "#4a7aff",
  red: "#ff4a4a",
  yellow: "#d4b83a",
};
const BACK_IMAGES_SPREAD: Record<string, string> = {
  blue: "/assets/generated/card-back-blue.dim_200x300.jpg",
  red: "/assets/generated/card-back-red.dim_200x300.jpg",
  yellow: "/assets/generated/card-back-yellow.dim_200x300.jpg",
};

function SpreadCardItem({
  sc,
  cardType,
  index,
  canPick,
  onClick,
}: {
  sc: SpreadCard;
  cardType: "blue" | "red" | "yellow";
  index: number;
  canPick: boolean;
  onClick: () => void;
}) {
  const W = 52;
  const H = 78;
  const backSrc = BACK_IMAGES_SPREAD[cardType];
  const borderColor = BACK_BORDER_COLORS[cardType];
  return (
    <div
      data-ocid={`nadi.spread_card.${index + 1}`}
      onClick={canPick ? onClick : undefined}
      onKeyDown={
        canPick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      role={canPick ? "button" : undefined}
      tabIndex={canPick ? 0 : undefined}
      style={{
        width: W,
        height: H,
        flexShrink: 0,
        cursor: canPick ? "pointer" : "default",
        perspective: 600,
        position: "relative",
      }}
    >
      <div
        style={{
          width: W,
          height: H,
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.35s ease",
          transform: sc.revealed ? "rotateY(180deg)" : "rotateY(0deg)",
          borderRadius: 6,
        }}
      >
        {/* Back face */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: 6,
            overflow: "hidden",
            border: `2px solid ${borderColor}`,
            opacity: sc.used ? 0.3 : canPick ? 1 : 0.75,
            boxShadow: canPick ? `0 0 6px ${borderColor}60` : "none",
            transition: "opacity 0.2s, box-shadow 0.2s",
          }}
        >
          <img
            src={backSrc}
            alt="card back"
            style={{
              width: W,
              height: H,
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
        {/* Front face */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: 6,
            overflow: "hidden",
            border: `2px solid ${borderColor}`,
          }}
        >
          <SpreadCardFace card={sc.card} cardType={cardType} w={W} h={H} />
        </div>
      </div>
    </div>
  );
}

function SpreadCardFace({
  card,
  cardType,
  w,
  h,
}: { card: NadiCardData; cardType: string; w: number; h: number }) {
  if (cardType === "blue") {
    const bc = card as BlueCard;
    const sym = HOUSE_SYMBOLS[bc.house] ?? "✦";
    return (
      <div
        className="flex flex-col items-center justify-between p-1"
        style={{
          width: w,
          height: h,
          background:
            "linear-gradient(160deg, oklch(0.18 0.10 262) 0%, oklch(0.28 0.14 255) 55%, oklch(0.20 0.12 268) 100%)",
          boxSizing: "border-box",
        }}
      >
        <div
          className="text-[8px] font-bold text-center"
          style={{ color: "oklch(0.78 0.148 85)" }}
        >
          {bc.name}
        </div>
        <div
          className="text-base leading-none"
          style={{ color: "oklch(0.85 0.10 88)" }}
        >
          {sym}
        </div>
        <div
          className="text-[7px] text-center font-semibold"
          style={{ color: "oklch(0.92 0.06 85)" }}
        >
          {bc.house}
        </div>
      </div>
    );
  }
  if (cardType === "red") {
    const rc = card as RedCard;
    const sym = PLANET_SYMBOLS[rc.planet] ?? "★";
    return (
      <div
        className="flex flex-col items-center justify-between p-1"
        style={{
          width: w,
          height: h,
          background:
            "linear-gradient(160deg, oklch(0.18 0.12 22) 0%, oklch(0.30 0.20 20) 55%, oklch(0.22 0.14 18) 100%)",
          boxSizing: "border-box",
        }}
      >
        <div
          className="text-[7px] font-bold uppercase"
          style={{ color: "oklch(0.78 0.148 85)" }}
        >
          Planet
        </div>
        <div
          className="text-base leading-none"
          style={{ color: "oklch(0.88 0.12 85)" }}
        >
          {sym}
        </div>
        <div
          className="text-[7px] text-center font-semibold"
          style={{ color: "oklch(0.92 0.06 85)" }}
        >
          {rc.planet}
        </div>
      </div>
    );
  }
  const yc = card as YellowCard;
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
  const sym = rasiSymbols[yc.rasiNumber] ?? "✦";
  const name = rasiNames[yc.rasiNumber] ?? `Rasi ${yc.rasiNumber}`;
  return (
    <div
      className="flex flex-col items-center justify-between p-1"
      style={{
        width: w,
        height: h,
        background:
          "linear-gradient(160deg, oklch(0.62 0.16 82) 0%, oklch(0.72 0.20 88) 55%, oklch(0.58 0.15 76) 100%)",
        boxSizing: "border-box",
      }}
    >
      <div
        className="text-[7px] font-bold"
        style={{ color: "oklch(0.25 0.05 70)" }}
      >
        Rasi {yc.rasiNumber}
      </div>
      <div
        className="text-base leading-none"
        style={{ color: "oklch(0.22 0.06 70)" }}
      >
        {sym}
      </div>
      <div
        className="text-[7px] text-center font-semibold"
        style={{ color: "oklch(0.20 0.06 70)" }}
      >
        {name}
      </div>
    </div>
  );
}

// ======================== READING ROW ========================

function ReadingRow({
  row,
  rowIdx,
  isActive,
}: { row: DisplayRow; rowIdx: number; isActive: boolean }) {
  const redCard = row.cards.find((c) => c.card.type === "red");
  const planetName = redCard ? (redCard.card as RedCard).planet : "";
  const planetSymbol = planetName ? (PLANET_SYMBOLS[planetName] ?? "✦") : "✦";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-ocid={`nadi.row.item.${rowIdx + 1}`}
      className="rounded-lg p-3"
      style={{
        background: isActive
          ? "rgba(255,255,255,0.5)"
          : "rgba(255,255,255,0.2)",
        transition: "background 0.3s",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded"
          style={{ background: "#ccc", color: "#555" }}
        >
          Row {rowIdx + 1}
        </span>
        {planetName && (
          <span className="text-xs font-semibold" style={{ color: "#444" }}>
            {planetSymbol} {planetName}
          </span>
        )}
        {isActive && (
          <span
            className="text-xs animate-pulse ml-auto"
            style={{ color: "#c0392b" }}
          >
            Picking...
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 items-start pb-1">
        <AnimatePresence>
          {row.cards.map((dc, cardIdx) => (
            <motion.div
              key={dc.displayId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: cardIdx * 0.03 }}
              style={{ flexShrink: 0 }}
            >
              <NadiCardDisplay dc={dc} size="md" />
            </motion.div>
          ))}
        </AnimatePresence>
        {isActive && row.cards.length === 0 && (
          <div
            className="rounded-lg border-2 border-dashed flex items-center justify-center flex-shrink-0"
            style={{ width: 92, height: 138, borderColor: "#bbb" }}
          >
            <span className="text-xs" style={{ color: "#aaa" }}>
              ...
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
