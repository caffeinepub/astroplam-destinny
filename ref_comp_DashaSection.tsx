import type { DashaData, DashaEntry } from "@/lib/kpEngine";
import { useEffect, useState } from "react";

function isActive(entry: DashaEntry): boolean {
  const now = new Date();
  return entry.startDate <= now && now < entry.endDate;
}

function fmtDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}

interface Props {
  dasha: DashaData;
  storageKey?: string;
}

export default function DashaSection({
  dasha,
  storageKey = "dasha_open",
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved !== null) return saved === "true";
    } catch {}
    return true;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, String(isOpen));
    } catch {}
  }, [isOpen, storageKey]);

  const [mahaIdx, setMahaIdx] = useState<number>(() => {
    const idx = dasha.mahadashas.findIndex(isActive);
    return idx >= 0 ? idx : 0;
  });

  const [selectedAntar, setSelectedAntar] = useState<number | null>(() => {
    // Auto-select the currently running antardasha
    const mahaI = dasha.mahadashas.findIndex(isActive);
    if (mahaI >= 0) {
      const antars = dasha.mahadashas[mahaI]?.antardashas ?? [];
      const antarI = antars.findIndex(isActive);
      return antarI >= 0 ? antarI : null;
    }
    return null;
  });

  const [level, setLevel] = useState<0 | 1>(0);

  const currentMaha = dasha.mahadashas[mahaIdx];
  const antars = currentMaha?.antardashas ?? [];
  const currentAntar = selectedAntar !== null ? antars[selectedAntar] : null;
  const pratyantars = currentAntar?.pratyantars ?? [];

  const goToPrevMaha = () => {
    setMahaIdx(
      (i) => (i - 1 + dasha.mahadashas.length) % dasha.mahadashas.length,
    );
    setSelectedAntar(null);
    setLevel(0);
  };
  const goToNextMaha = () => {
    setMahaIdx((i) => (i + 1) % dasha.mahadashas.length);
    setSelectedAntar(null);
    setLevel(0);
  };

  const handleAntra = () => {
    if (antars.length === 0) return;
    if (selectedAntar === null) {
      const activeIdx = antars.findIndex(isActive);
      setSelectedAntar(activeIdx >= 0 ? activeIdx : 0);
    }
    setLevel(1);
  };
  const handleCD = () => {
    setLevel(0);
    setSelectedAntar(null);
  };

  const rows: Array<{ entry: DashaEntry; idx: number }> =
    level === 0
      ? antars.map((e, i) => ({ entry: e, idx: i }))
      : pratyantars.map((e, i) => ({ entry: e, idx: i }));

  const headerLabel =
    level === 0
      ? `D : ${currentMaha?.lord ?? ""}`
      : `D > B: ${currentMaha?.lord ?? ""}, ${currentAntar?.lord ?? ""}`;

  return (
    <div className="rounded-xl border border-border bg-white text-gray-800 overflow-hidden">
      {/* Collapsible toggle header */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-sm text-gray-700">
          Vimshottari Dasha
        </span>
        <span className="text-xs text-gray-500">
          {isOpen ? "▲ Hide" : "▼ Show"}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-gray-700 mr-2">
              {headerLabel}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Dasa navigation arrows */}
              <button
                type="button"
                title="Previous Dasa"
                onClick={goToPrevMaha}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                ←
              </button>
              <button
                type="button"
                title="Next Dasa"
                onClick={goToNextMaha}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                →
              </button>

              {level === 0 ? (
                <button
                  type="button"
                  onClick={handleAntra}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  ANTRA
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setLevel(0)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  BACK TO BHUKTI
                </button>
              )}
              <button
                type="button"
                onClick={handleCD}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                CD
              </button>
            </div>
          </div>

          {/* Mahadasha row at top (level 0) */}
          {level === 0 && currentMaha && (
            <div className="px-4 py-2 bg-blue-50 border-b border-gray-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-blue-500 flex-shrink-0" />
              <span className="font-semibold text-sm text-blue-700">
                {currentMaha.lord} (Mahadasha)
              </span>
              <span className="text-xs text-gray-500 ml-auto">
                {fmtDate(currentMaha.startDate)} —{" "}
                {fmtDate(currentMaha.endDate)}
              </span>
            </div>
          )}

          {/* Antardasha context row at pratyantar level */}
          {level === 1 && currentAntar && (
            <div className="px-4 py-2 bg-indigo-50 border-b border-gray-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-indigo-500 flex-shrink-0" />
              <span className="font-semibold text-sm text-indigo-700">
                {currentAntar.lord} (Antardasha / Bhukti)
              </span>
              <span className="text-xs text-gray-500 ml-auto">
                {fmtDate(currentAntar.startDate)} —{" "}
                {fmtDate(currentAntar.endDate)}
              </span>
            </div>
          )}

          {/* Sub-period list */}
          <div
            className="divide-y divide-gray-100 overflow-y-auto"
            style={{ maxHeight: "min(420px, 60vh)" }}
          >
            {rows.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                {level === 0
                  ? "No antardasha data available"
                  : "No pratyantar data available"}
              </div>
            ) : (
              rows.map(({ entry, idx }) => {
                const active = isActive(entry);
                const isSelected = level === 0 ? selectedAntar === idx : false;
                const handleSelect = () => {
                  if (level === 0) {
                    setSelectedAntar(idx === selectedAntar ? null : idx);
                  }
                };
                return (
                  <button
                    type="button"
                    key={`${entry.lord}-${idx}`}
                    data-ocid={`dasha.item.${idx + 1}`}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors ${
                      active ? "bg-amber-50" : isSelected ? "bg-blue-50" : ""
                    }`}
                    onClick={handleSelect}
                    onDoubleClick={() => {
                      if (level === 0) {
                        setSelectedAntar(idx);
                        setLevel(1);
                      }
                    }}
                  >
                    {/* Radio circle */}
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors ${
                        active || isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-400 bg-transparent"
                      }`}
                    />
                    {/* Content */}
                    <span className="flex-1 min-w-0">
                      <span className="font-medium text-sm text-gray-800">
                        {entry.lord}
                        {active && (
                          <span className="ml-2 text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                            NOW
                          </span>
                        )}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {fmtDate(entry.startDate)} — {fmtDate(entry.endDate)}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Level label */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-[11px] text-gray-400">
              {level === 0
                ? "Showing Antardasha (Bhukti) — click to select, double-click to drill into Pratyantardasha | ← → = navigate Dasa"
                : "Showing Pratyantardasha — click BACK TO BHUKTI to return"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
