// NadiChartSection — Nadi Chart using backend canister calculateNadiPlanets
// Planetary calculations run server-side via Motoko + Swiss Ephemeris HTTP outcalls
// Dasha tree is computed locally from Moon's sidereal longitude
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { NadiDashaData, NadiDashaEntry } from "@/lib/nadiChartEngine";
import { useActor as _useActor } from "@caffeineai/core-infrastructure";
import { Loader2, Star } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";

const useActor = () => _useActor(createActor);

// ─── Dasha helpers (pure JS, no backend needed) ───────────────────────────────
const NAK_DEG = 360 / 27;
const DASHA_LORDS = ["Ke", "Ve", "Su", "Mo", "Ma", "Ra", "Ju", "Sa", "Me"];
const DASHA_LORD_NAMES: Record<string, string> = {
  Ke: "Ketu",
  Ve: "Venus",
  Su: "Sun",
  Mo: "Moon",
  Ma: "Mars",
  Ra: "Rahu",
  Ju: "Jupiter",
  Sa: "Saturn",
  Me: "Mercury",
};
const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];
const NAKSHATRA_LORDS = [
  "Ke",
  "Ve",
  "Su",
  "Mo",
  "Ma",
  "Ra",
  "Ju",
  "Sa",
  "Me",
  "Ke",
  "Ve",
  "Su",
  "Mo",
  "Ma",
  "Ra",
  "Ju",
  "Sa",
  "Me",
  "Ke",
  "Ve",
  "Su",
  "Mo",
  "Ma",
  "Ra",
  "Ju",
  "Sa",
  "Me",
];

function addYears(date: Date, years: number): Date {
  return new Date(date.getTime() + years * 365.25 * 24 * 60 * 60 * 1000);
}

function calcDasha(birthDate: Date, moonSidLon: number): NadiDashaData {
  const nakIdx = Math.floor(moonSidLon / NAK_DEG) % 27;
  const nakLordIdx = DASHA_LORDS.indexOf(NAKSHATRA_LORDS[nakIdx]);
  const posInNak = (moonSidLon % NAK_DEG) / NAK_DEG;
  const remainFrac = 1 - posInNak;
  const mahadashas: NadiDashaEntry[] = [];
  let cur = birthDate;
  for (let i = 0; i < 9; i++) {
    const li = (nakLordIdx + i) % 9;
    const mdYears = i === 0 ? remainFrac * DASHA_YEARS[li] : DASHA_YEARS[li];
    const mdEnd = addYears(cur, mdYears);
    const antardashas: NadiDashaEntry[] = [];
    let adCur = cur;
    for (let j = 0; j < 9; j++) {
      const ali = (li + j) % 9;
      const adYears = (DASHA_YEARS[ali] / 120) * mdYears;
      const adEnd = addYears(adCur, adYears);
      const pratyantars: NadiDashaEntry[] = [];
      let ptCur = adCur;
      for (let k = 0; k < 9; k++) {
        const pli = (ali + k) % 9;
        const ptYears = (DASHA_YEARS[pli] / 120) * adYears;
        const ptEnd = addYears(ptCur, ptYears);
        pratyantars.push({
          lord: DASHA_LORD_NAMES[DASHA_LORDS[pli]] ?? DASHA_LORDS[pli],
          startDate: ptCur,
          endDate: ptEnd,
        });
        ptCur = ptEnd;
      }
      antardashas.push({
        lord: DASHA_LORD_NAMES[DASHA_LORDS[ali]] ?? DASHA_LORDS[ali],
        startDate: adCur,
        endDate: adEnd,
        pratyantars,
      });
      adCur = adEnd;
    }
    mahadashas.push({
      lord: DASHA_LORD_NAMES[DASHA_LORDS[li]] ?? DASHA_LORDS[li],
      startDate: cur,
      endDate: mdEnd,
      antardashas,
    });
    cur = mdEnd;
  }
  const CORRECTION_MS = -3 * 24 * 60 * 60 * 1000;
  function shiftDate(d: Date) {
    return new Date(d.getTime() + CORRECTION_MS);
  }
  for (const md of mahadashas) {
    md.startDate = shiftDate(md.startDate);
    md.endDate = shiftDate(md.endDate);
    for (const ad of md.antardashas ?? []) {
      ad.startDate = shiftDate(ad.startDate);
      ad.endDate = shiftDate(ad.endDate);
      for (const pt of ad.pratyantars ?? []) {
        pt.startDate = shiftDate(pt.startDate);
        pt.endDate = shiftDate(pt.endDate);
      }
    }
  }
  return { mahadashas };
}

// ─── Display result type ──────────────────────────────────────────────────────
interface PlanetRow {
  name: string;
  sign: string;
  degreeStr: string;
  nakshatra: string;
  pada: number;
  nakLord: string;
  subLord: string;
  houseNum: number;
  isRetrograde: boolean;
}

interface NadiDisplayResult {
  planets: PlanetRow[];
  ascendant: PlanetRow;
  dasha: NadiDashaData;
  dashaBalance: string;
  inputDate: string;
  inputTime: string;
  inputPlace: string;
}

// ─── Inline DashaSection ──────────────────────────────────────────────────────
function isActive(entry: NadiDashaEntry): boolean {
  const now = new Date();
  return entry.startDate <= now && now < entry.endDate;
}

function fmtDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function NadiDashaSection({ dasha }: { dasha: NadiDashaData }) {
  const [isOpen, setIsOpen] = useState(true);
  const [mahaIdx, setMahaIdx] = useState(() => {
    const idx = dasha.mahadashas.findIndex(isActive);
    return idx >= 0 ? idx : 0;
  });
  const [selectedAntar, setSelectedAntar] = useState<number | null>(() => {
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

  const rows: Array<{ entry: NadiDashaEntry; idx: number }> =
    level === 0
      ? antars.map((e, i) => ({ entry: e, idx: i }))
      : pratyantars.map((e, i) => ({ entry: e, idx: i }));

  const headerLabel =
    level === 0
      ? `D : ${currentMaha?.lord ?? ""}`
      : `D > B: ${currentMaha?.lord ?? ""}, ${currentAntar?.lord ?? ""}`;

  return (
    <div className="rounded-xl border border-border bg-white text-gray-800 overflow-hidden">
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
          <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-gray-700 mr-2">
              {headerLabel}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setMahaIdx(
                    (i) =>
                      (i - 1 + dasha.mahadashas.length) %
                      dasha.mahadashas.length,
                  );
                  setSelectedAntar(null);
                  setLevel(0);
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => {
                  setMahaIdx((i) => (i + 1) % dasha.mahadashas.length);
                  setSelectedAntar(null);
                  setLevel(0);
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                →
              </button>
              {level === 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (antars.length === 0) return;
                    if (selectedAntar === null) {
                      const ai = antars.findIndex(isActive);
                      setSelectedAntar(ai >= 0 ? ai : 0);
                    }
                    setLevel(1);
                  }}
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
                onClick={() => {
                  setLevel(0);
                  setSelectedAntar(null);
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                CD
              </button>
            </div>
          </div>

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
                return (
                  <button
                    type="button"
                    key={`${entry.lord}-${idx}`}
                    data-ocid={`nadi_dasha.item.${idx + 1}`}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors ${active ? "bg-amber-50" : isSelected ? "bg-blue-50" : ""}`}
                    onClick={() => {
                      if (level === 0)
                        setSelectedAntar(idx === selectedAntar ? null : idx);
                    }}
                    onDoubleClick={() => {
                      if (level === 0) {
                        setSelectedAntar(idx);
                        setLevel(1);
                      }
                    }}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors ${active || isSelected ? "border-blue-500 bg-blue-500" : "border-gray-400 bg-transparent"}`}
                    />
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

          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-[11px] text-gray-400">
              {level === 0
                ? "Showing Antardasha — click to select, double-click to drill into Pratyantardasha | ← → = navigate Dasa"
                : "Showing Pratyantardasha — click BACK TO BHUKTI to return"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sign index helper ────────────────────────────────────────────────────────
const SIGN_NAMES = [
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
function getSignIndex(signName: string): number {
  const idx = SIGN_NAMES.findIndex(
    (s) => s.toLowerCase() === signName.toLowerCase(),
  );
  return idx >= 0 ? idx : 0;
}

// ─── Main NadiChartSection ────────────────────────────────────────────────────
interface NadiFormState {
  date: string;
  time: string;
  place: string;
  lat: string;
  lon: string;
  tz: string;
}

const DEFAULT_NADI_FORM: NadiFormState = {
  date: "2008-02-05",
  time: "15:50",
  place: "Jind, Haryana, India",
  lat: "29.3200",
  lon: "76.3200",
  tz: "5.5",
};

export default function NadiChartSection() {
  const { actor } = useActor();
  const [form, setForm] = useState<NadiFormState>(DEFAULT_NADI_FORM);
  const [result, setResult] = useState<NadiDisplayResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // DD/MM/YYYY split fields
  const [dobDay, setDobDay] = useState("5");
  const [dobMonth, setDobMonth] = useState("2");
  const [dobYear, setDobYear] = useState("2008");
  const dobMMRef = useRef<HTMLInputElement>(null);
  const dobYYYYRef = useRef<HTMLInputElement>(null);

  const updateForm = (field: keyof NadiFormState, val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const handleCalculate = async () => {
    setError(null);
    const d = Number.parseInt(dobDay, 10);
    const m = Number.parseInt(dobMonth, 10);
    const y = Number.parseInt(dobYear, 10);
    if (
      !d ||
      !m ||
      !y ||
      d < 1 ||
      d > 31 ||
      m < 1 ||
      m > 12 ||
      y < 1800 ||
      y > 2100
    ) {
      toast.error("Please enter a valid date (DD/MM/YYYY).");
      return;
    }
    const [hr, min] = form.time.split(":").map(Number);
    const lat = Number.parseFloat(form.lat);
    const lon = Number.parseFloat(form.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      toast.error("Please enter valid latitude and longitude.");
      return;
    }

    if (!actor) {
      toast.error("Backend not ready. Please wait a moment and try again.");
      return;
    }

    setIsCalculating(true);
    try {
      // Format: DD-MM-YYYY and HH:MM — backend expects this format
      const dateStr = `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
      const timeStr = `${String(hr).padStart(2, "0")}:${String(min).padStart(2, "0")}`;

      // Call backend canister — calculateNadiPlanets uses Swiss Ephemeris server-side
      const response = await (
        actor as unknown as {
          calculateNadiPlanets(
            dateStr: string,
            timeStr: string,
            lat: number,
            lon: number,
          ): Promise<
            | { __kind__: "ok"; ok: BackendNadiChartResult }
            | { err: string }
            | { ok: BackendNadiChartResult }
          >;
        }
      ).calculateNadiPlanets(dateStr, timeStr, lat, lon);

      // Handle both { __kind__: "ok", ok: ... } and { ok: ... } / { err: ... } shapes
      let chartData: BackendNadiChartResult;
      if ("__kind__" in response) {
        if (response.__kind__ === "ok") {
          chartData = response.ok;
        } else {
          throw new Error(
            (response as unknown as { __kind__: "err"; err: string }).err,
          );
        }
      } else if ("ok" in response) {
        chartData = response.ok;
      } else if ("err" in response) {
        throw new Error(response.err);
      } else {
        throw new Error("Unexpected response from backend");
      }

      // Map NadiPlanetInfo (backend) → PlanetRow (display)
      const toRow = (p: BackendNadiPlanetInfo): PlanetRow => ({
        name: p.name,
        sign: p.sign,
        degreeStr: p.degreeStr,
        nakshatra: p.nakshatra,
        pada: Number(p.pada),
        nakLord: p.nakLord,
        subLord: p.subLord,
        houseNum: Number(p.houseNum),
        isRetrograde: p.isRetrograde,
      });

      // Build dasha from Moon's sidereal position (from backend result)
      const moonPlanet = chartData.planets.find((p) => p.name === "Moon");
      const moonSignIdx = moonPlanet ? getSignIndex(moonPlanet.sign) : 0;
      const moonSidLon = moonSignIdx * 30 + (moonPlanet?.degree ?? 0);
      const birthDate = new Date(y, m - 1, d, hr, min);
      const dasha = calcDasha(birthDate, moonSidLon);

      setResult({
        planets: chartData.planets.map(toRow),
        ascendant: toRow(chartData.ascendant),
        dasha,
        dashaBalance: chartData.dashaBalance,
        inputDate: dateStr,
        inputTime: timeStr,
        inputPlace: form.place,
      });

      setTimeout(() => {
        document
          .getElementById("nadi-chart-result")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast.error(`Calculation error: ${msg}`);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="rounded-xl border shadow-gold bg-card p-5 space-y-4">
          <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
            <Star className="w-4 h-4 text-[#2E8B57]" />
            Nadi Chart — Birth Details
          </h2>
          <p className="text-xs text-muted-foreground">
            Uses Swiss Ephemeris via backend canister — true JPL-level precision
            for 1950–2050
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Date of Birth (DD / MM / YYYY)
              </Label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="DD"
                  maxLength={2}
                  data-ocid="nadi_birth_day.input"
                  value={dobDay}
                  onChange={(e) => {
                    const num = e.target.value.replace(/\D/g, "").slice(0, 2);
                    setDobDay(num);
                    if (num.length === 2) dobMMRef.current?.focus();
                  }}
                  className="w-14 h-9 px-2 text-center border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-muted-foreground">/</span>
                <input
                  ref={dobMMRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="MM"
                  maxLength={2}
                  data-ocid="nadi_birth_month.input"
                  value={dobMonth}
                  onChange={(e) => {
                    const num = e.target.value.replace(/\D/g, "").slice(0, 2);
                    setDobMonth(num);
                    if (num.length === 2) dobYYYYRef.current?.focus();
                  }}
                  className="w-14 h-9 px-2 text-center border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-muted-foreground">/</span>
                <input
                  ref={dobYYYYRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="YYYY"
                  maxLength={4}
                  data-ocid="nadi_birth_year.input"
                  value={dobYear}
                  onChange={(e) =>
                    setDobYear(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className="w-20 h-9 px-2 text-center border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="nadi-tob"
                className="text-xs text-muted-foreground"
              >
                Time of Birth
              </Label>
              <Input
                id="nadi-tob"
                data-ocid="nadi_time.input"
                type="time"
                value={form.time}
                onChange={(e) => updateForm("time", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="nadi-tz"
                className="text-xs text-muted-foreground"
              >
                UTC Offset (hrs)
              </Label>
              <Input
                id="nadi-tz"
                data-ocid="nadi_timezone.input"
                type="number"
                step="0.5"
                value={form.tz}
                onChange={(e) => updateForm("tz", e.target.value)}
                placeholder="5.5 for IST"
              />
            </div>

            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
              <Label
                htmlFor="nadi-place"
                className="text-xs text-muted-foreground"
              >
                Place of Birth
              </Label>
              <PlaceAutocomplete
                id="nadi-place"
                value={form.place}
                onChange={(val) => updateForm("place", val)}
                onSelect={(lat, lon, tz, _name) => {
                  updateForm("lat", lat);
                  updateForm("lon", lon);
                  updateForm("tz", tz);
                }}
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="nadi-lat"
                className="text-xs text-muted-foreground"
              >
                Latitude
              </Label>
              <Input
                id="nadi-lat"
                data-ocid="nadi_lat.input"
                type="number"
                step="0.0001"
                value={form.lat}
                onChange={(e) => updateForm("lat", e.target.value)}
                placeholder="29.3200"
              />
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="nadi-lon"
                className="text-xs text-muted-foreground"
              >
                Longitude
              </Label>
              <Input
                id="nadi-lon"
                data-ocid="nadi_lon.input"
                type="number"
                step="0.0001"
                value={form.lon}
                onChange={(e) => updateForm("lon", e.target.value)}
                placeholder="76.3200"
              />
            </div>
          </div>

          <Button
            data-ocid="nadi_calculate.primary_button"
            onClick={handleCalculate}
            disabled={isCalculating || !actor}
            className="w-full sm:w-auto text-sm font-semibold"
            style={{ background: "#2E8B57", color: "#ffffff" }}
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating via Swiss Ephemeris…
              </>
            ) : !actor ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting to backend…
              </>
            ) : (
              <>
                <Star className="w-4 h-4 mr-2" />
                Calculate Nadi Chart
              </>
            )}
          </Button>
        </div>
      </motion.section>

      {/* Error state */}
      {error && !isCalculating && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Error:</strong> {error}
          <p className="mt-1 text-xs text-red-500">
            The backend Swiss Ephemeris engine returned an error. Please check
            your date/time/location and try again.
          </p>
        </div>
      )}

      {/* Results */}
      {result ? (
        <motion.section
          id="nadi-chart-result"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          {/* Info card */}
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 shrink-0 text-[#2E8B57]" />
                <span className="text-xs text-muted-foreground">Date:</span>
                <span className="text-xs font-semibold">
                  {result.inputDate}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Time:</span>
                <span className="text-xs font-semibold">
                  {result.inputTime}
                </span>
              </div>
              {result.inputPlace && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Place:</span>
                  <span className="text-xs font-semibold">
                    {result.inputPlace}
                  </span>
                </div>
              )}
              {result.dashaBalance && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Dasha Balance:
                  </span>
                  <span className="text-xs font-semibold">
                    {result.dashaBalance}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">ASC:</span>
                <span className="text-xs font-semibold">
                  {result.ascendant.sign} {result.ascendant.degreeStr}
                </span>
              </div>
            </div>
          </div>

          {/* Planet Table + Dasha side by side on lg */}
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Planet Table (65%) */}
            <div className="lg:w-[65%] rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                <Star className="w-4 h-4 text-[#2E8B57]" />
                <span className="font-semibold text-sm">
                  Nadi Chart — Planetary Positions (Swiss Ephemeris)
                </span>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-sm font-semibold whitespace-nowrap">
                        Planet
                      </TableHead>
                      <TableHead className="text-sm font-semibold whitespace-nowrap">
                        Sign
                      </TableHead>
                      <TableHead className="text-sm font-semibold whitespace-nowrap">
                        Degree
                      </TableHead>
                      <TableHead className="text-sm font-semibold whitespace-nowrap">
                        Nakshatra
                      </TableHead>
                      <TableHead className="text-sm font-semibold whitespace-nowrap">
                        Pada
                      </TableHead>
                      <TableHead className="text-sm font-semibold whitespace-nowrap">
                        Nak Lord
                      </TableHead>
                      <TableHead className="text-sm font-semibold whitespace-nowrap">
                        Sub Lord
                      </TableHead>
                      <TableHead className="text-sm font-semibold whitespace-nowrap">
                        Natal H
                      </TableHead>
                      <TableHead className="text-sm font-semibold whitespace-nowrap">
                        Bhava H
                      </TableHead>
                      <TableHead className="text-sm font-semibold whitespace-nowrap">
                        R
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Ascendant row */}
                    <TableRow
                      data-ocid="nadi_planets.row.asc"
                      className="text-xs hover:bg-accent/30 bg-amber-50/40"
                    >
                      <TableCell className="font-semibold text-sm whitespace-nowrap text-amber-700">
                        {result.ascendant.name}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {result.ascendant.sign}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap font-mono">
                        {result.ascendant.degreeStr}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {result.ascendant.nakshatra}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {result.ascendant.pada}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {result.ascendant.nakLord}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {result.ascendant.subLord}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {result.ascendant.houseNum}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {result.ascendant.houseNum}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap" />
                    </TableRow>
                    {result.planets.map((p, i) => (
                      <TableRow
                        key={p.name}
                        data-ocid={`nadi_planets.row.${i + 1}`}
                        className="text-xs hover:bg-accent/30"
                      >
                        <TableCell className="font-semibold text-sm whitespace-nowrap">
                          {p.name}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {p.sign}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap font-mono">
                          {p.degreeStr}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {p.nakshatra}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {p.pada}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {p.nakLord}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {p.subLord}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {p.houseNum}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {p.houseNum}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap font-semibold text-red-600">
                          {p.isRetrograde ? "R" : ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Dasha Panel (35%) */}
            <div className="lg:w-[35%]">
              <div className="sticky top-4">
                <NadiDashaSection dasha={result.dasha} />
              </div>
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          data-ocid="nadi_chart.empty_state"
          className="text-center py-16 text-muted-foreground"
        >
          <Star className="w-12 h-12 mx-auto mb-4 text-[#2E8B57]/30" />
          <p className="font-medium">
            Enter birth details above and click{" "}
            <strong>Calculate Nadi Chart</strong>
          </p>
          <p className="text-sm mt-1">
            Planet table with Nakshatra, Sub Lord, and Vimshottari Dasha will
            appear here
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Backend type aliases (inline, avoids importing from backend.ts) ──────────
interface BackendNadiPlanetInfo {
  subLord: string;
  isRetrograde: boolean;
  name: string;
  pada: bigint | number;
  sign: string;
  degree: number;
  nakLord: string;
  houseNum: bigint | number;
  degreeStr: string;
  nakshatra: string;
}

interface BackendNadiChartResult {
  dashaBalance: string;
  planets: BackendNadiPlanetInfo[];
  ascendant: BackendNadiPlanetInfo;
}
