import DashaSection from "@/components/DashaSection";
import EventAnalysis from "@/components/EventAnalysis";
import NadiNumbers from "@/components/NadiNumbers";
import NorthIndianChart from "@/components/NorthIndianChart";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import ServiceGateModal from "@/components/ServiceGateModal";
import ServiceNavBar from "@/components/ServiceNavBar";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  type AyanamsaType,
  type ChartPlanet,
  type ChartResult,
  SIGN_ABBR,
  calculateHoraryChart,
  calculateKPChart,
  calculateNadiNumbers,
  calculateTransitPlanets,
  formatDeg,
  getSeedEntry,
} from "@/lib/kpEngine";
import { reviveChartResult } from "@/lib/reviveChart";
import { hasServiceAccess } from "@/utils/visitorSession";
import { useNavigate } from "@tanstack/react-router";
import {
  Download,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  Save,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Event color map for chart house number coloring
const EVENT_CHART_COLORS: Record<string, Record<number, string>> = {
  normal: {},
  abortion: {
    1: "#dc2626",
    4: "#dc2626",
    6: "#dc2626",
    8: "#dc2626",
    10: "#dc2626",
    12: "#dc2626",
    2: "#15803d",
    5: "#15803d",
    9: "#15803d",
    11: "#15803d",
  },
  aggression: { 7: "#dc2626", 8: "#dc2626", 12: "#dc2626" },
  accident: { 4: "#dc2626", 6: "#dc2626", 8: "#dc2626", 12: "#dc2626" },
  arrest: { 2: "#dc2626", 3: "#dc2626", 8: "#dc2626", 12: "#dc2626" },
  award: {
    10: "#15803d",
    11: "#15803d",
    6: "#dc2626",
    8: "#dc2626",
    12: "#dc2626",
  },
  bail: {
    10: "#15803d",
    11: "#15803d",
    6: "#dc2626",
    8: "#dc2626",
    12: "#dc2626",
  },
  career: {
    10: "#15803d",
    11: "#15803d",
    6: "#dc2626",
    8: "#dc2626",
    12: "#dc2626",
  },
  change_career: { 5: "#15803d", 9: "#15803d" },
  childbirth: {
    2: "#15803d",
    5: "#15803d",
    11: "#15803d",
    1: "#dc2626",
    4: "#dc2626",
    10: "#dc2626",
    6: "#ea580c",
    8: "#ea580c",
    12: "#ea580c",
  },
  cold_nature: {
    2: "#15803d",
    5: "#15803d",
    9: "#15803d",
    11: "#15803d",
    1: "#dc2626",
    4: "#dc2626",
    6: "#dc2626",
    10: "#dc2626",
  },
  coming_home: { 2: "#15803d", 4: "#15803d", 11: "#15803d" },
  depression: { 1: "#dc2626", 2: "#dc2626", 6: "#dc2626", 8: "#dc2626" },
  divorce: {
    1: "#dc2626",
    6: "#dc2626",
    8: "#dc2626",
    10: "#dc2626",
    12: "#dc2626",
    2: "#15803d",
    5: "#15803d",
    7: "#15803d",
    9: "#15803d",
    11: "#15803d",
  },
  education: {
    6: "#dc2626",
    8: "#dc2626",
    12: "#dc2626",
    2: "#15803d",
    4: "#15803d",
    5: "#15803d",
    9: "#15803d",
    11: "#15803d",
  },
  health: {
    5: "#15803d",
    9: "#15803d",
    11: "#15803d",
    6: "#dc2626",
    8: "#dc2626",
    12: "#dc2626",
  },
  litigation: {
    6: "#dc2626",
    8: "#dc2626",
    12: "#dc2626",
    10: "#15803d",
    11: "#15803d",
  },
  litigation_win: {
    6: "#dc2626",
    8: "#dc2626",
    12: "#dc2626",
    10: "#15803d",
    11: "#15803d",
  },
  love: { 5: "#15803d", 8: "#15803d", 12: "#15803d" },
  marriage: {
    2: "#15803d",
    7: "#15803d",
    11: "#15803d",
    1: "#dc2626",
    6: "#dc2626",
    10: "#dc2626",
    5: "#2563eb",
    9: "#2563eb",
  },
  property_purchase: {
    4: "#15803d",
    11: "#15803d",
    6: "#ec4899",
    8: "#ec4899",
    12: "#ec4899",
  },
  property_sale: { 3: "#15803d", 5: "#15803d", 10: "#15803d", 11: "#2563eb" },
  transfer: { 3: "#15803d", 9: "#15803d", 12: "#15803d" },
  travel: { 3: "#15803d", 9: "#15803d", 12: "#15803d" },
  vehicle_purchase: {
    4: "#15803d",
    11: "#15803d",
    6: "#ec4899",
    8: "#ec4899",
    12: "#ec4899",
  },
  vehicle_sale: { 3: "#15803d", 5: "#15803d", 10: "#15803d" },
};

const EVENT_OPTIONS = [
  { id: "normal", label: "Normal / सामान्य" },
  { id: "abortion", label: "Abortion / गर्भपात" },
  { id: "aggression", label: "Aggression / आक्रामकता" },
  { id: "accident", label: "Accident / दुर्घटना" },
  { id: "arrest", label: "Arrest / गिरफ़्तारी" },
  { id: "award", label: "Award / पुरस्कार" },
  { id: "bail", label: "Bail / जमानत" },
  { id: "career", label: "Career / करियर" },
  { id: "change_career", label: "Change in Career / करियर बदलाव" },
  { id: "childbirth", label: "Child Birth / संतान" },
  { id: "cold_nature", label: "Cold Nature / ठंडा स्वभाव" },
  { id: "coming_home", label: "Coming Home / घर वापसी" },
  { id: "depression", label: "Depression / अवसाद" },
  { id: "divorce", label: "Divorce / तलाक" },
  { id: "education", label: "Education / शिक्षा" },
  { id: "health", label: "Health / स्वास्थ्य" },
  { id: "litigation", label: "Litigation / मुकदमा" },
  { id: "litigation_win", label: "Litigation Win / मुकदमा जीत" },
  { id: "love", label: "Love / प्रेम" },
  { id: "marriage", label: "Marriage / विवाह" },
  { id: "property_purchase", label: "Property Purchase / संपत्ति खरीद" },
  { id: "property_sale", label: "Property Sale / संपत्ति बिक्री" },
  { id: "transfer", label: "Transfer / तबादला" },
  { id: "travel", label: "Travel / यात्रा" },
  { id: "vehicle_purchase", label: "Vehicle Purchase / वाहन खरीद" },
  { id: "vehicle_sale", label: "Vehicle Sale / वाहन बिक्री" },
];

interface FormState {
  date: string;
  time: string;
  place: string;
  lat: string;
  lon: string;
  tz: string;
  ayanamsa: AyanamsaType;
}

const DEFAULT_FORM: FormState = {
  date: "1990-01-15",
  time: "08:30",
  place: "Mumbai, India",
  lat: "19.0760",
  lon: "72.8777",
  tz: "5.5",
  ayanamsa: "kp-old",
};

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HoroscopePage() {
  const navigate = useNavigate();
  const [showGate, setShowGate] = useState(false);
  const [form, setForm] = useState<FormState>(() => {
    try {
      const saved = localStorage.getItem("horoscope_form_v5");
      if (saved) return JSON.parse(saved) as FormState;
    } catch {
      // ignore
    }
    return DEFAULT_FORM;
  });
  const [result, setResult] = useState<ChartResult | null>(() => {
    try {
      const saved = localStorage.getItem("horoscope_result_v5");
      if (saved) return reviveChartResult(JSON.parse(saved));
    } catch {
      /* ignore */
    }
    return null;
  });
  const [labelMode, setLabelMode] = useState<"english" | "hindi">("english");
  const [kpMode, setKpMode] = useState<"old" | "new" | "viku">("old");
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeEventId, setActiveEventId] = useState("normal");

  // DD/MM/YYYY manual DOB state for horoscope
  const [dobDay, setDobDay] = useState(() => {
    try {
      const saved = localStorage.getItem("horoscope_form_v5");
      if (saved) {
        const f = JSON.parse(saved) as FormState;
        if (f.date) {
          const [, , d] = f.date.split("-");
          return String(Number(d));
        }
      }
    } catch {}
    return "15";
  });
  const [dobMonth, setDobMonth] = useState(() => {
    try {
      const saved = localStorage.getItem("horoscope_form_v5");
      if (saved) {
        const f = JSON.parse(saved) as FormState;
        if (f.date) {
          const [, m] = f.date.split("-");
          return String(Number(m));
        }
      }
    } catch {}
    return "1";
  });
  const [dobYear, setDobYear] = useState(() => {
    try {
      const saved = localStorage.getItem("horoscope_form_v5");
      if (saved) {
        const f = JSON.parse(saved) as FormState;
        if (f.date) {
          const [y] = f.date.split("-");
          return y;
        }
      }
    } catch {}
    return "1990";
  });
  const dobMMRef = useRef<HTMLInputElement>(null);
  const dobYYYYRef = useRef<HTMLInputElement>(null);

  // Auth hooks
  const { login, clear, loginStatus, identity } = useInternetIdentity();

  const isLoggedIn = loginStatus === "success" && !!identity;
  const principal = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal =
    principal.length > 12
      ? `${principal.slice(0, 6)}...${principal.slice(-4)}`
      : principal;

  const handleSaveChart = async () => {
    try {
      localStorage.setItem("horoscope_form_v5", JSON.stringify(form));
      if (result)
        localStorage.setItem("horoscope_result_v5", JSON.stringify(result));
      toast.success("Chart saved! It will auto-load next time you visit.");
    } catch {
      toast.error("Could not save chart.");
    }
  };

  const handleLoadChart = async () => {
    try {
      const savedForm = localStorage.getItem("horoscope_form_v5");
      const savedResult = localStorage.getItem("horoscope_result_v5");
      if (savedForm) setForm(JSON.parse(savedForm) as FormState);
      if (savedResult) setResult(reviveChartResult(JSON.parse(savedResult)));
      if (savedForm || savedResult) toast.success("Chart loaded successfully.");
      else toast.info("No saved chart found.");
    } catch {
      toast.error("Could not load chart.");
    }
  };

  // Transit state
  const [transitDate, setTransitDate] = useState(todayString);
  const [transitTime, setTransitTime] = useState("12:00");
  const [transitPlanets, setTransitPlanets] = useState<ChartPlanet[] | null>(
    null,
  );
  const [isTransitCalc, setIsTransitCalc] = useState(false);

  // Horary state
  const [horaryForm, setHoraryForm] = useState({
    date: todayString(),
    time: "12:00",
    place: "Mumbai, India",
    lat: "19.0760",
    lon: "72.8777",
    tz: "5.5",
    seed: "15",
  });
  const [_horaryResult, setHoraryResult] = useState<ChartResult | null>(null);
  const [_horaryLabelMode, _setHoraryLabelMode] = useState<"english" | "hindi">(
    "english",
  );
  const [_isHoraryCalc, setIsHoraryCalc] = useState(false);
  const [_isHoraryGeocoding, setIsHoraryGeocoding] = useState(false);

  // On mount: clear old stale cache keys and auto-recalculate from saved form
  useEffect(() => {
    // Clear caches from old KP ayanamsa calibration
    for (const k of [
      "horoscope_result_v5",
      "horoscope_form_v5",
      "horoscope_result_v3",
      "horoscope_form_v3",
      "nadi_result_v1",
      "nadi_form_v1",
      "kp_result_v4",
      "kp_form_v4",
    ]) {
      localStorage.removeItem(k);
    }

    // Clear old v1/v2/v3 caches so stale results don't show
    try {
      localStorage.removeItem("horoscope_form_v1");
      localStorage.removeItem("horoscope_result_v1");
      localStorage.removeItem("horoscope_form_v2");
      localStorage.removeItem("horoscope_result_v2");
      localStorage.removeItem("horoscope_form_v3");
      localStorage.removeItem("horoscope_result_v3");
      localStorage.removeItem("horoscope_form_v4");
      localStorage.removeItem("horoscope_result_v4");
    } catch {
      /* ignore */
    }

    // Auto-recalculate from saved form if available
    try {
      const savedForm = localStorage.getItem("horoscope_form_v5");
      if (!savedForm) return;
      const f = JSON.parse(savedForm) as FormState;
      const [yr, mo, dd] = f.date ? f.date.split("-").map(Number) : [0, 0, 0];
      if (!yr || !mo || !dd) return;
      const [hr, min] = (f.time || "12:00").split(":").map(Number);
      const lat = Number.parseFloat(f.lat);
      const lon = Number.parseFloat(f.lon);
      const tz = Number.parseFloat(f.tz);
      if (Number.isNaN(lat) || Number.isNaN(lon) || Number.isNaN(tz)) return;
      const savedKpMode = (
        f.ayanamsa === "kp-new"
          ? "kp-new"
          : f.ayanamsa === "viku"
            ? "viku"
            : "kp-old"
      ) as import("@/lib/kpEngine").AyanamsaType;
      if (f.ayanamsa === "kp-new") setKpMode("new");
      else if (f.ayanamsa === "viku") setKpMode("viku");
      else setKpMode("old");
      const chart = calculateKPChart(
        yr,
        mo,
        dd,
        hr,
        min,
        lat,
        lon,
        tz,
        savedKpMode,
      );
      setResult(chart);
      localStorage.setItem("horoscope_result_v5", JSON.stringify(chart));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("horoscope_form_v5", JSON.stringify(form));
    } catch {
      // ignore
    }
  }, [form]);

  useEffect(() => {
    try {
      if (result) {
        localStorage.setItem("horoscope_result_v5", JSON.stringify(result));
      } else {
        // result cleared (no-op for localStorage persistence)
      }
    } catch {
      /* ignore */
    }
  }, [result]);

  const updateForm = (field: keyof FormState, val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const handleCalculate = () => {
    if (!hasServiceAccess("astro-chart")) {
      setShowGate(true);
      return;
    }
    try {
      setIsCalculating(true);
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
        toast.error("Please enter a valid date of birth (DD/MM/YYYY).");
        setIsCalculating(false);
        return;
      }
      const [hr, min] = form.time.split(":").map(Number);
      const lat = Number.parseFloat(form.lat);
      const lon = Number.parseFloat(form.lon);
      const tz = Number.parseFloat(form.tz);
      if (Number.isNaN(lat) || Number.isNaN(lon) || Number.isNaN(tz)) {
        toast.error("Please enter valid latitude, longitude and UTC offset.");
        return;
      }
      const chart = calculateKPChart(
        y,
        m,
        d,
        hr,
        min,
        lat,
        lon,
        tz,
        kpMode === "new" ? "kp-new" : kpMode === "viku" ? "viku" : "kp-old",
      );
      setResult(chart);
      localStorage.setItem("horoscope_form_v5", JSON.stringify(form));
      localStorage.setItem("horoscope_result_v5", JSON.stringify(chart));
      setTransitPlanets(null);
      setTimeout(() => {
        document
          .getElementById("chart-result")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e) {
      toast.error(
        `Calculation error: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const updateHoraryForm = (field: string, val: string) =>
    setHoraryForm((prev) => ({ ...prev, [field]: val }));

  const _handleHoraryGeocode = async () => {
    if (!horaryForm.place.trim()) return;
    setIsHoraryGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(horaryForm.place)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (data && data.length > 0) {
        updateHoraryForm("lat", Number.parseFloat(data[0].lat).toFixed(4));
        updateHoraryForm("lon", Number.parseFloat(data[0].lon).toFixed(4));
        toast.success(
          `Found: ${data[0].display_name.split(",").slice(0, 3).join(", ")}`,
        );
      } else {
        toast.error("Place not found. Please enter coordinates manually.");
      }
    } catch {
      toast.error("Geocoding failed. Check your internet connection.");
    } finally {
      setIsHoraryGeocoding(false);
    }
  };

  const _handleHoraryCalculate = () => {
    try {
      setIsHoraryCalc(true);
      const [y, m, d] = horaryForm.date.split("-").map(Number);
      const [hr, min] = horaryForm.time.split(":").map(Number);
      const lat = Number.parseFloat(horaryForm.lat);
      const lon = Number.parseFloat(horaryForm.lon);
      const tz = Number.parseFloat(horaryForm.tz);
      const seed = Number.parseInt(horaryForm.seed, 10);
      if (Number.isNaN(lat) || Number.isNaN(lon) || Number.isNaN(tz)) {
        toast.error("Please enter valid latitude, longitude and UTC offset.");
        return;
      }
      if (Number.isNaN(seed) || seed < 1 || seed > 249) {
        toast.error("Seed number must be between 1 and 249.");
        return;
      }
      const chart = calculateHoraryChart(seed, y, m, d, hr, min, lat, lon, tz);
      setHoraryResult(chart);
      setTimeout(() => {
        document
          .getElementById("horary-result")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e) {
      toast.error(
        `Horary error: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setIsHoraryCalc(false);
    }
  };

  const _horaryEntry = getSeedEntry(Number.parseInt(horaryForm.seed, 10) || 15);

  const handleTransitCalculate = () => {
    if (!result) return;
    try {
      setIsTransitCalc(true);
      const [y, m, d] = transitDate.split("-").map(Number);
      const [hr, min] = transitTime.split(":").map(Number);
      const lat = Number.parseFloat(form.lat);
      const lon = Number.parseFloat(form.lon);
      const tz = Number.parseFloat(form.tz);
      const natalTropCusps = result.cusps.map((c) => c.tropLon);
      const tp = calculateTransitPlanets(
        y,
        m,
        d,
        hr,
        min,
        lat,
        lon,
        tz,
        result.ayanamsaType,
        natalTropCusps,
      );
      setTransitPlanets(tp);
    } catch (e) {
      toast.error(
        `Transit error: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setIsTransitCalc(false);
    }
  };

  // Adjust transit date/time by given minutes delta
  const adjustTransitTime = (minutesDelta: number) => {
    const [y, mo, d] = transitDate.split("-").map(Number);
    const [hr, mn] = transitTime.split(":").map(Number);
    const dt = new Date(y, mo - 1, d, hr, mn);
    dt.setMinutes(dt.getMinutes() + minutesDelta);
    const newDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    const newTime = `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
    setTransitDate(newDate);
    setTransitTime(newTime);
    // Auto-recalculate if transit was already calculated
    if (transitPlanets !== null && result) {
      try {
        const lat = Number.parseFloat(form.lat);
        const lon = Number.parseFloat(form.lon);
        const tz = Number.parseFloat(form.tz);
        const natalTropCusps = result.cusps.map((c) => c.tropLon);
        const tp = calculateTransitPlanets(
          dt.getFullYear(),
          dt.getMonth() + 1,
          dt.getDate(),
          dt.getHours(),
          dt.getMinutes(),
          lat,
          lon,
          tz,
          result.ayanamsaType,
          natalTropCusps,
        );
        setTransitPlanets(tp);
      } catch (e) {
        toast.error(
          `Transit error: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const planetRows = [...result.planets, result.ascendant]
      .map(
        (p) =>
          `  ${p.name.padEnd(12)} ${p.signName.padEnd(14)} ${formatDeg(p.degrees).padEnd(14)} ${(p.nakshatra || "").padEnd(20)} ${String(p.pada).padEnd(5)} ${(p.nakshatraLord || "").padEnd(10)} ${(p.subLord || "").padEnd(10)} H${p.natalHouse}  H${p.bhavaHouse}  ${p.retrograde ? "R" : ""}`,
      )
      .join("\n");

    const cuspRows = result.cusps
      .map(
        (c) =>
          `  H${String(c.house).padEnd(3)} ${c.signName.padEnd(14)} ${formatDeg(c.degrees).padEnd(14)} ${(c.nakshatra || "").padEnd(20)} ${String(c.pada).padEnd(5)} ${(c.nakshatraLord || "").padEnd(10)} ${c.subLord || ""}`,
      )
      .join("\n");

    // Vimshottari Dasa section
    const now = new Date();
    const formatDate = (d: Date) => d.toISOString().slice(0, 10);
    let dasaSection = `\nVimshottari Dasa System:\n${"-".repeat(80)}\n`;
    for (const md of result.dasha.mahadashas) {
      const mdActive = md.startDate <= now && now < md.endDate;
      dasaSection += `  ${md.lord.padEnd(10)} ${formatDate(md.startDate)} – ${formatDate(md.endDate)}${mdActive ? "  << ACTIVE" : ""}\n`;
      if (mdActive && md.antardashas) {
        for (const ad of md.antardashas) {
          const adActive = ad.startDate <= now && now < ad.endDate;
          dasaSection += `    ${ad.lord.padEnd(10)} ${formatDate(ad.startDate)} – ${formatDate(ad.endDate)}${adActive ? "  << ACTIVE" : ""}\n`;
          if (adActive && ad.pratyantars) {
            for (const pt of ad.pratyantars) {
              const ptActive = pt.startDate <= now && now < pt.endDate;
              dasaSection += `      ${pt.lord.padEnd(10)} ${formatDate(pt.startDate)} – ${formatDate(pt.endDate)}${ptActive ? "  << ACTIVE" : ""}\n`;
            }
          }
        }
      }
    }

    // Event Analysis section
    const eventRules: Array<{
      en: string;
      hi: string;
      good: number[];
      supporter: number[];
      bad: number[];
      supporterBad: number[];
    }> = [
      {
        en: "Education",
        hi: "शिक्षा",
        good: [2, 4, 5, 9, 11],
        supporter: [],
        bad: [6, 8, 12],
        supporterBad: [],
      },
      {
        en: "Career",
        hi: "करियर",
        good: [10, 11],
        supporter: [],
        bad: [6, 8, 12],
        supporterBad: [],
      },
      {
        en: "Travel",
        hi: "यात्रा",
        good: [3, 9, 12],
        supporter: [7],
        bad: [],
        supporterBad: [],
      },
      {
        en: "Marriage",
        hi: "विवाह",
        good: [2, 7, 11],
        supporter: [5, 9],
        bad: [1, 6, 10],
        supporterBad: [8, 12],
      },
      {
        en: "Health",
        hi: "स्वास्थ्य",
        good: [5, 9, 11],
        supporter: [],
        bad: [6, 8, 12],
        supporterBad: [],
      },
      {
        en: "Litigation",
        hi: "मुकदमा",
        good: [10, 11],
        supporter: [5, 9],
        bad: [6, 8, 12],
        supporterBad: [],
      },
      {
        en: "Child Birth",
        hi: "संतान",
        good: [2, 5, 9, 11],
        supporter: [],
        bad: [1, 4, 10],
        supporterBad: [],
      },
      {
        en: "Nature",
        hi: "स्वभाव",
        good: [2, 5, 9, 11],
        supporter: [],
        bad: [6, 8, 12],
        supporterBad: [],
      },
    ];

    const nadiNums = calculateNadiNumbers(
      result.planets,
      result.ascendant.sign,
      result.cusps.map((c) => c.sign),
    );

    function classifyNums(nums: number[], rule: (typeof eventRules)[0]) {
      const good: number[] = [];
      const supporter: number[] = [];
      const bad: number[] = [];
      const supporterBad: number[] = [];
      const neutral: number[] = [];
      for (const n of nums) {
        if (rule.good.includes(n)) good.push(n);
        else if (rule.supporter.includes(n)) supporter.push(n);
        else if (rule.bad.includes(n)) bad.push(n);
        else if (rule.supporterBad.includes(n)) supporterBad.push(n);
        else neutral.push(n);
      }
      return { good, supporter, bad, supporterBad, neutral };
    }

    let eventSection = `\nEvent Analysis (House Classifications):\n${"=".repeat(80)}\n`;
    for (const ev of eventRules) {
      eventSection += `\n${ev.en} / ${ev.hi}\n`;
      eventSection += `  House Rules -> Good: [${ev.good.join(",")}]${ev.supporter.length ? `  Supporter: [${ev.supporter.join(",")}]` : ""}  Bad: [${ev.bad.join(",")}]${ev.supporterBad.length ? `  Supporter of Bad: [${ev.supporterBad.join(",")}]` : ""}\n`;
      eventSection += `  ${"Planet".padEnd(10)} ${"Houses".padEnd(20)} ${"Good".padEnd(15)} ${"Supporter".padEnd(15)} ${"Bad".padEnd(15)} ${"Sup.Bad".padEnd(12)} Neutral\n`;
      eventSection += `  ${"-".repeat(95)}\n`;
      for (const row of nadiNums) {
        const rows = [
          { label: row.planet.name, nums: row.planet.numbers },
          { label: row.nakLord.name, nums: row.nakLord.numbers },
          { label: row.subLord.name, nums: row.subLord.numbers },
        ];
        for (const r of rows) {
          const c = classifyNums(r.nums, ev);
          eventSection += `  ${r.label.padEnd(10)} ${r.nums.join(",").padEnd(20)} ${c.good.join(",").padEnd(15)} ${c.supporter.join(",").padEnd(15)} ${c.bad.join(",").padEnd(15)} ${c.supporterBad.join(",").padEnd(12)} ${c.neutral.join(",")}\n`;
        }
      }
    }

    let transitSection = "";
    if (transitPlanets) {
      const transitRows = transitPlanets
        .map(
          (p) =>
            `  ${p.name.padEnd(12)} ${p.signName.padEnd(14)} ${formatDeg(p.degrees).padEnd(14)} ${(p.nakshatra || "").padEnd(20)} ${(p.nakshatraLord || "").padEnd(10)} ${(p.subLord || "").padEnd(10)} H${p.natalHouse}  ${p.retrograde ? "R" : ""}`,
        )
        .join("\n");
      transitSection = `\nTransit Details:\n  Date: ${transitDate}  Time: ${transitTime}\n\nTransit Planets:\n${"-".repeat(80)}\n  Planet       Sign           Degree         Nakshatra            Nak Lord   Sub Lord   Natal H  R\n${transitRows}\n`;
    }

    const report = [
      "Horoscope Calculator - Chart Report",
      "=======================================",
      "",
      "Birth Details:",
      `  Date:      ${form.date}`,
      `  Time:      ${form.time}`,
      `  Place:     ${form.place}`,
      `  Latitude:  ${form.lat}  Longitude: ${form.lon}`,
      `  UTC Offset: ${form.tz}`,
      `  Ayanamsa:  ${kpMode === "old" ? "KP Old" : kpMode === "new" ? "KP New" : "Viku"} (${result.ayanamsa.toFixed(4)}°)`,
      "",
      `Ascendant: ${result.ascendant.signName} ${formatDeg(result.ascendant.degrees)}`,
      "",
      "Planet Details:",
      "-".repeat(80),
      "  Planet       Sign           Degree         Nakshatra            Pada  Nak Lord   Sub Lord   Natal H  Bhava H  R",
      planetRows,
      "",
      "House Cusps:",
      "-".repeat(80),
      "  House Sign           Degree         Nakshatra            Pada  Nak Lord   Sub Lord",
      cuspRows,
      transitSection,
      dasaSection,
      eventSection,
      "",
      `Generated: ${new Date().toLocaleString()}`,
    ].join("\n");

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kp-chart-${form.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Chart report downloaded!");
  };

  const handleReset = () => {
    setResult(null);
    setForm(DEFAULT_FORM);
    setTransitPlanets(null);
  };

  const adjustBirthTime = (deltaMinutes: number) => {
    const y = Number.parseInt(dobYear, 10) || 1990;
    const m = Number.parseInt(dobMonth, 10) || 1;
    const d = Number.parseInt(dobDay, 10) || 1;
    const [hr, min] = form.time.split(":").map(Number);
    const totalMinutes = hr * 60 + min + deltaMinutes;
    const dayShift = Math.floor(totalMinutes / 1440);
    const clampedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
    const newHr = Math.floor(clampedMinutes / 60);
    const newMin = clampedMinutes % 60;
    const date = new Date(y, m - 1, d + dayShift);
    const newDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const newTime = `${String(newHr).padStart(2, "0")}:${String(newMin).padStart(2, "0")}`;
    setForm((prev) => ({ ...prev, date: newDate, time: newTime }));
    // Sync dob fields with new date after adjustment
    const [newY, newM, newD] = newDate.split("-");
    setDobYear(newY);
    setDobMonth(String(Number(newM)));
    setDobDay(String(Number(newD)));
    try {
      const lat = Number.parseFloat(form.lat);
      const lon = Number.parseFloat(form.lon);
      const tz = Number.parseFloat(form.tz);
      const chart = calculateKPChart(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        newHr,
        newMin,
        lat,
        lon,
        tz,
        kpMode === "new" ? "kp-new" : kpMode === "viku" ? "viku" : "kp-old",
      );
      setResult(chart);
    } catch (e) {
      toast.error(
        `Calculation error: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  };

  const TIME_STEPS = [
    { label: "−1d", delta: -1440 },
    { label: "−1h", delta: -60 },
    { label: "−10m", delta: -10 },
    { label: "−1m", delta: -1 },
    { label: "+1m", delta: 1 },
    { label: "+10m", delta: 10 },
    { label: "+1h", delta: 60 },
    { label: "+1d", delta: 1440 },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(var(--background))" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-md"
        style={{ background: "oklch(var(--card) / 0.92)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
            <span
              className="font-bold text-lg tracking-tight"
              style={{ color: "oklch(var(--foreground))" }}
            >
              Horoscope
            </span>
          </div>
          <span className="text-xs text-muted-foreground ml-1 hidden sm:block">
            Horoscope Calculator
          </span>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="ml-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors border border-border/60 rounded px-2 py-1"
          >
            ← Back
          </button>
          <div className="ml-auto flex items-center gap-2">
            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                data-ocid="app.secondary_button"
              >
                <RefreshCw className="w-3 h-3" /> New Chart
              </button>
            )}
            {/* Auth section */}
            {!isLoggedIn ? (
              <Button
                variant="outline"
                size="sm"
                data-ocid="auth.primary_button"
                onClick={() => login()}
                disabled={loginStatus === "logging-in"}
                className="text-xs border-[#c8a96e] hover:bg-primary/10 flex items-center gap-1.5"
              >
                {loginStatus === "logging-in" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <LogIn className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">Login to Save</span>
              </Button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span
                  className="text-xs text-muted-foreground hidden sm:inline"
                  title={principal}
                >
                  {shortPrincipal}
                </span>
                {result && (
                  <Button
                    variant="outline"
                    size="sm"
                    data-ocid="save.button"
                    onClick={handleSaveChart}
                    className="text-xs border-emerald-400/60 hover:bg-emerald-50 text-emerald-700 flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="load.button"
                  onClick={handleLoadChart}
                  className="text-xs border-blue-400/60 hover:bg-blue-50 text-blue-700 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">Load</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  data-ocid="logout.button"
                  onClick={() => clear()}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <ServiceNavBar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Tabs defaultValue="horoscope" className="space-y-4">
          <TabsList
            className="flex w-full overflow-x-auto"
            style={{ "--tab-active-bg": "#2E8B57" } as React.CSSProperties}
          >
            <TabsTrigger
              data-ocid="horoscope.tab"
              value="horoscope"
              className="shrink-0 whitespace-nowrap"
            >
              Horoscope
            </TabsTrigger>
            <TabsTrigger
              data-ocid="planets.tab"
              value="planets"
              className="shrink-0 whitespace-nowrap"
            >
              Planets &amp; Houses
            </TabsTrigger>
            <TabsTrigger
              data-ocid="transit.tab"
              value="transit"
              className="shrink-0 whitespace-nowrap"
            >
              Transit
            </TabsTrigger>
            <TabsTrigger
              data-ocid="events.tab"
              value="events"
              className="shrink-0 whitespace-nowrap"
              style={{
                fontFamily: "Noto Sans Devanagari, system-ui, sans-serif",
              }}
            >
              घटनाएं / Events
            </TabsTrigger>
          </TabsList>

          {/* ====== TAB 1: HOROSCOPE ====== */}
          <TabsContent value="horoscope" className="space-y-6">
            {/* Birth Form */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="rounded-xl border shadow-gold bg-card p-5 space-y-4">
                <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#2E8B57]" />
                  Birth Details
                </h2>

                {/* Ayanamsa */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground font-medium">
                    Ayanamsa:
                  </span>
                  <div className="flex rounded-lg overflow-hidden border border-[#c8a96e]">
                    {(["old", "new", "viku"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setKpMode(m);
                          updateForm(
                            "ayanamsa",
                            m === "new"
                              ? "kp-new"
                              : m === "viku"
                                ? "viku"
                                : "kp-old",
                          );
                        }}
                        className="px-3 py-1.5 text-xs font-semibold transition-colors"
                        style={{
                          background:
                            kpMode === m
                              ? m === "viku"
                                ? "#7c3aed"
                                : "#2E8B57"
                              : "transparent",
                          color: kpMode === m ? "white" : "#666",
                        }}
                      >
                        {m === "old"
                          ? "KP Old"
                          : m === "new"
                            ? "KP New"
                            : "Viku"}
                      </button>
                    ))}
                  </div>
                </div>

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
                        data-ocid="birth_day.input"
                        value={dobDay}
                        onChange={(e) => {
                          const num = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 2);
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
                        data-ocid="birth_month.input"
                        value={dobMonth}
                        onChange={(e) => {
                          const num = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 2);
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
                        data-ocid="birth_year.input"
                        value={dobYear}
                        onChange={(e) => {
                          const num = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4);
                          setDobYear(num);
                        }}
                        className="w-20 h-9 px-2 text-center border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="tob"
                      className="text-xs text-muted-foreground"
                    >
                      Time of Birth
                    </Label>
                    <Input
                      id="tob"
                      data-ocid="time.input"
                      type="time"
                      value={form.time}
                      onChange={(e) => updateForm("time", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="tz"
                      className="text-xs text-muted-foreground"
                    >
                      UTC Offset (hrs)
                    </Label>
                    <Input
                      id="tz"
                      data-ocid="timezone.input"
                      type="number"
                      step="0.5"
                      value={form.tz}
                      onChange={(e) => updateForm("tz", e.target.value)}
                      placeholder="5.5 for IST"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                    <Label
                      htmlFor="place"
                      className="text-xs text-muted-foreground"
                    >
                      Place of Birth
                    </Label>
                    <PlaceAutocomplete
                      id="place"
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
                      htmlFor="lat"
                      className="text-xs text-muted-foreground"
                    >
                      Latitude
                    </Label>
                    <Input
                      id="lat"
                      data-ocid="lat.input"
                      type="number"
                      step="0.0001"
                      value={form.lat}
                      onChange={(e) => updateForm("lat", e.target.value)}
                      placeholder="19.0760"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="lon"
                      className="text-xs text-muted-foreground"
                    >
                      Longitude
                    </Label>
                    <Input
                      id="lon"
                      data-ocid="lon.input"
                      type="number"
                      step="0.0001"
                      value={form.lon}
                      onChange={(e) => updateForm("lon", e.target.value)}
                      placeholder="72.8777"
                    />
                  </div>
                </div>

                <Button
                  data-ocid="calculate.primary_button"
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full sm:w-auto text-sm font-semibold"
                  style={{
                    background: "#2E8B57",
                    color: "#ffffff",
                  }}
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Calculate KP Chart
                    </>
                  )}
                </Button>
              </div>
            </motion.section>

            {/* Results */}
            {result ? (
              <motion.section
                id="chart-result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-5"
              >
                {/* Full birth details info card */}
                <div className="rounded-xl border border-border bg-card px-4 py-3 space-y-2">
                  <div className="flex flex-wrap items-start gap-x-6 gap-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 shrink-0 text-[#2E8B57]" />
                      <span className="text-xs text-muted-foreground">
                        DOB:
                      </span>
                      <span className="text-xs font-semibold">{form.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        Time:
                      </span>
                      <span className="text-xs font-semibold">{form.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        Place:
                      </span>
                      <span className="text-xs font-semibold">
                        {form.place}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        Lat:
                      </span>
                      <span className="text-xs font-semibold">{form.lat}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        Lon:
                      </span>
                      <span className="text-xs font-semibold">{form.lon}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        UTC:
                      </span>
                      <span className="text-xs font-semibold">{form.tz}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800 border-amber-300 text-xs"
                    >
                      ASC: {result.ascendant.signName}{" "}
                      {formatDeg(result.ascendant.degrees)}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800 border-amber-300 text-xs"
                    >
                      Ayanamsa: {result.ayanamsa.toFixed(4)}° (
                      {kpMode === "old"
                        ? "KP Old"
                        : kpMode === "new"
                          ? "KP New"
                          : "Viku"}
                      )
                    </Badge>
                    <Button
                      data-ocid="download.button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="ml-auto text-xs flex items-center gap-1.5"
                      style={{
                        background: "#2E8B57",
                        color: "#ffffff",
                        border: "none",
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Report
                    </Button>
                  </div>
                </div>

                {/* Birth Time Adjustment Controls */}
                <div className="rounded-xl border border-[#c8a96e] bg-card px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground">
                      Adjust Birth Time
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Current: {form.date} {form.time}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "−1d", delta: -1440 },
                      { label: "−1h", delta: -60 },
                      { label: "−10m", delta: -10 },
                      { label: "−1m", delta: -1 },
                      { label: "+1m", delta: 1 },
                      { label: "+10m", delta: 10 },
                      { label: "+1h", delta: 60 },
                      { label: "+1d", delta: 1440 },
                    ].map((step) => (
                      <button
                        key={step.label}
                        type="button"
                        onClick={() => adjustBirthTime(step.delta)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                          step.delta > 0
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100"
                        }`}
                      >
                        {step.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Charts + Dasha side panel layout */}
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Left: charts + event selector (65% on lg+) */}
                  <div className="flex flex-col gap-5 lg:w-[65%]">
                    {/* Two charts */}
                    <div className="flex flex-col sm:flex-row gap-5">
                      {/* Natal Chart (left) */}
                      <div className="sm:w-1/2 rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-sm text-foreground">
                            Natal Chart (Rashi)
                          </h3>
                          {/* Label mode toggle */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              data-ocid="label.toggle"
                              onClick={() => setLabelMode("english")}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-l-md border transition-colors ${
                                labelMode === "english"
                                  ? "bg-[#2E8B57] text-white border-[#2E8B57]"
                                  : "bg-card text-muted-foreground border-border hover:bg-accent"
                              }`}
                            >
                              EN
                            </button>
                            <button
                              type="button"
                              data-ocid="label.toggle"
                              onClick={() => setLabelMode("hindi")}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-r-md border-t border-r border-b transition-colors ${
                                labelMode === "hindi"
                                  ? "bg-[#2E8B57] text-white border-[#2E8B57]"
                                  : "bg-card text-muted-foreground border-border hover:bg-accent"
                              }`}
                              style={{
                                fontFamily: "Noto Sans Devanagari, sans-serif",
                              }}
                            >
                              हि
                            </button>
                          </div>
                        </div>
                        <NorthIndianChart
                          planets={result.planets}
                          ascendant={result.ascendant}
                          cusps={result.cusps}
                          labelMode={labelMode}
                          mode="natal"
                          eventHouseColors={
                            EVENT_CHART_COLORS[activeEventId] ?? {}
                          }
                        />
                      </div>

                      {/* Bhavchalit Chart (right) */}
                      <div className="sm:w-1/2 rounded-xl border border-blue-200 bg-card p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3
                            className="font-semibold text-sm"
                            style={{ color: "#0066aa" }}
                          >
                            Bhavchalit Chart
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            Shifted planet positions
                          </span>
                        </div>
                        <NorthIndianChart
                          planets={result.planets}
                          ascendant={result.ascendant}
                          cusps={result.cusps}
                          labelMode={labelMode}
                          mode="bhavchalit"
                          eventHouseColors={
                            EVENT_CHART_COLORS[activeEventId] ?? {}
                          }
                        />
                      </div>
                    </div>

                    {/* Event Selector */}
                    <div className="rounded-xl border border-[#c8a96e] bg-card px-4 py-3 flex items-center gap-3">
                      <span
                        className="text-xs font-semibold text-foreground whitespace-nowrap"
                        style={{
                          fontFamily:
                            "Noto Sans Devanagari, system-ui, sans-serif",
                        }}
                      >
                        Event / घटना चुनें
                      </span>
                      <select
                        data-ocid="event.select"
                        value={activeEventId}
                        onChange={(e) => setActiveEventId(e.target.value)}
                        className="flex-1 text-xs border border-border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        style={{
                          fontFamily:
                            "Noto Sans Devanagari, system-ui, sans-serif",
                          maxWidth: "320px",
                        }}
                      >
                        {EVENT_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {activeEventId !== "normal" && (
                        <span className="text-xs text-muted-foreground">
                          {Object.entries(
                            EVENT_CHART_COLORS[activeEventId] ?? {},
                          ).map(([h, c]) => (
                            <span
                              key={h}
                              style={{
                                color: c,
                                fontWeight: 700,
                                marginRight: 4,
                              }}
                            >
                              H{h}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* end left column */}
                  {/* Right: Dasha panel (35% on lg+) */}
                  <div className="lg:w-[35%]">
                    <div className="sticky top-4">
                      <DashaSection
                        dasha={result.dasha}
                        storageKey="horoscope_dasha_open"
                      />
                    </div>
                  </div>
                </div>
                {/* end charts+dasha outer flex */}

                {/* Nadi Planet Numbers */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#2E8B57]" />
                    <h3 className="font-semibold text-sm text-foreground">
                      Nadi Planet Numbers
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      (Planet · Nak Lord · Sub Lord significance)
                    </span>
                  </div>
                  <NadiNumbers
                    nadiPlanets={calculateNadiNumbers(
                      result.planets,
                      result.ascendant.sign,
                      result.cusps.map((c) => c.sign),
                    )}
                  />
                </div>
              </motion.section>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center py-16 text-muted-foreground"
              >
                <Star className="w-12 h-12 mx-auto mb-4 text-[#2E8B57]/30" />
                <p className="font-medium">
                  Enter birth details above and click{" "}
                  <strong>Calculate KP Chart</strong>
                </p>
                <p className="text-sm mt-1">
                  North Indian chart with Bhavchalit and Vimshottari Dasha will
                  appear here
                </p>
              </motion.div>
            )}
          </TabsContent>

          {/* ====== TAB 2: PLANETS & HOUSES ====== */}
          <TabsContent value="planets" className="space-y-4">
            {result ? (
              <>
                {/* Planet Details */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#2E8B57]" />
                    <span className="font-semibold text-sm">
                      Planet Details
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
                        {[...result.planets, result.ascendant].map((p, i) => (
                          <TableRow
                            key={p.name}
                            data-ocid={`planets.row.${i + 1}`}
                            className="text-xs hover:bg-accent/30"
                          >
                            <TableCell className="font-semibold text-sm whitespace-nowrap">
                              {p.name}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {p.signName}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap font-mono">
                              {formatDeg(p.degrees)}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {p.nakshatra}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {p.pada}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {p.nakshatraLord}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {p.subLord}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {p.natalHouse}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {p.bhavaHouse}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {p.retrograde ? "R" : ""}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* House Cusps */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#2E8B57]" />
                    <span className="font-semibold text-sm">House Cusps</span>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-xs">House</TableHead>
                          <TableHead className="text-xs">Sign</TableHead>
                          <TableHead className="text-xs">Degree</TableHead>
                          <TableHead className="text-xs">Nakshatra</TableHead>
                          <TableHead className="text-xs">Pada</TableHead>
                          <TableHead className="text-xs">Nak Lord</TableHead>
                          <TableHead className="text-xs">Sub Lord</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.cusps.map((c, i) => (
                          <TableRow
                            key={c.house}
                            data-ocid={`cusps.row.${i + 1}`}
                            className="text-xs hover:bg-accent/30"
                          >
                            <TableCell className="font-semibold text-sm whitespace-nowrap">
                              H{c.house} {SIGN_ABBR[c.sign]}
                            </TableCell>
                            <TableCell>{c.signName}</TableCell>
                            <TableCell>{formatDeg(c.degrees)}</TableCell>
                            <TableCell>{c.nakshatra}</TableCell>
                            <TableCell>{c.pada}</TableCell>
                            <TableCell>{c.nakshatraLord}</TableCell>
                            <TableCell>{c.subLord}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-4 text-[#2E8B57]/30" />
                <p className="font-medium">
                  Calculate a birth chart first to view planet and house details
                </p>
              </div>
            )}
          </TabsContent>

          {/* ====== TAB 3: TRANSIT ====== */}
          <TabsContent value="transit" className="space-y-5">
            {!result ? (
              <div
                data-ocid="transit.empty_state"
                className="text-center py-16 text-muted-foreground"
              >
                <Star className="w-12 h-12 mx-auto mb-4 text-[#2E8B57]/30" />
                <p className="font-medium">
                  Please calculate a birth chart first
                </p>
                <p className="text-sm mt-1">
                  Go to the Horoscope tab, enter birth details and calculate.
                </p>
              </div>
            ) : (
              <>
                {/* Transit date/time controls */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#2E8B57]" />
                    Transit Date
                  </h3>
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Date
                      </Label>
                      <Input
                        data-ocid="transit.input"
                        type="date"
                        value={transitDate}
                        onChange={(e) => setTransitDate(e.target.value)}
                        className="w-40"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Time
                      </Label>
                      <Input
                        data-ocid="transit.input"
                        type="time"
                        value={transitTime}
                        onChange={(e) => setTransitTime(e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>

                  {/* Time step buttons */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">
                      Quick Adjust / Time Steps
                    </Label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {TIME_STEPS.slice(0, 4).map((step) => (
                        <Button
                          key={step.label}
                          variant="outline"
                          size="sm"
                          data-ocid="transit.secondary_button"
                          onClick={() => adjustTransitTime(step.delta)}
                          className="h-7 px-2.5 text-xs font-mono border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                        >
                          {step.label}
                        </Button>
                      ))}
                      <span className="mx-1 text-xs font-mono text-muted-foreground bg-muted rounded px-2 py-1">
                        {transitDate} {transitTime}
                      </span>
                      {TIME_STEPS.slice(4).map((step) => (
                        <Button
                          key={step.label}
                          variant="outline"
                          size="sm"
                          data-ocid="transit.secondary_button"
                          onClick={() => adjustTransitTime(step.delta)}
                          className="h-7 px-2.5 text-xs font-mono border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                        >
                          {step.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    data-ocid="transit.primary_button"
                    onClick={handleTransitCalculate}
                    disabled={isTransitCalc}
                    className="text-sm font-semibold"
                    style={{
                      background: "oklch(var(--primary))",
                      color: "oklch(var(--primary-foreground))",
                    }}
                  >
                    {isTransitCalc ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        Calculate Transit
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Transit planets will be placed in natal house structure
                    (birth location: {form.place})
                  </p>
                </div>

                {/* Charts side by side */}
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Natal Chart */}
                  <div className="lg:w-1/2 rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm text-foreground">
                        Natal Chart
                      </h3>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-amber-100 text-amber-800 border-amber-300"
                      >
                        {form.date}
                      </Badge>
                    </div>
                    <NorthIndianChart
                      planets={result.planets}
                      ascendant={result.ascendant}
                      cusps={result.cusps}
                      labelMode={labelMode}
                      mode="natal"
                    />
                  </div>

                  {/* Transit Chart */}
                  <div className="lg:w-1/2 rounded-xl border border-green-200 bg-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        className="font-semibold text-sm"
                        style={{ color: "#006622" }}
                      >
                        Transit Chart
                      </h3>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-800 border-green-300"
                      >
                        {transitDate}
                      </Badge>
                    </div>
                    {transitPlanets ? (
                      <NorthIndianChart
                        planets={transitPlanets}
                        ascendant={result.ascendant}
                        cusps={result.cusps}
                        labelMode={labelMode}
                        mode="natal"
                        title={`Transit — ${transitDate} ${transitTime}`}
                      />
                    ) : (
                      <div
                        data-ocid="transit.empty_state"
                        className="flex flex-col items-center justify-center py-16 text-muted-foreground"
                      >
                        <Star className="w-10 h-10 mb-3 text-primary/20" />
                        <p className="text-sm">
                          Select a date and click Calculate Transit
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transit planet table */}
                {transitPlanets && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#2E8B57]" />
                      <span className="font-semibold text-sm">
                        Transit Planet Positions — {transitDate}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-xs">Planet</TableHead>
                            <TableHead className="text-xs">Sign</TableHead>
                            <TableHead className="text-xs">Degree</TableHead>
                            <TableHead className="text-xs">Nakshatra</TableHead>
                            <TableHead className="text-xs">Nak Lord</TableHead>
                            <TableHead className="text-xs">Sub Lord</TableHead>
                            <TableHead className="text-xs">Natal H</TableHead>
                            <TableHead className="text-xs">Bhava H</TableHead>
                            <TableHead className="text-xs">R</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transitPlanets.map((p, i) => (
                            <TableRow
                              key={p.name}
                              data-ocid={`transit.row.${i + 1}`}
                              className="text-xs hover:bg-accent/30"
                            >
                              <TableCell className="font-semibold text-sm whitespace-nowrap">
                                {p.name}
                              </TableCell>
                              <TableCell>{p.signName}</TableCell>
                              <TableCell>{formatDeg(p.degrees)}</TableCell>
                              <TableCell>{p.nakshatra}</TableCell>
                              <TableCell>{p.nakshatraLord}</TableCell>
                              <TableCell>{p.subLord}</TableCell>
                              <TableCell>{p.natalHouse}</TableCell>
                              <TableCell>{p.bhavaHouse}</TableCell>
                              <TableCell>{p.retrograde ? "R" : ""}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </TabsContent>
          {/* ====== TAB 4: EVENTS ====== */}
          <TabsContent value="events" className="space-y-4">
            {result ? (
              <EventAnalysis
                nadiPlanets={calculateNadiNumbers(
                  result.planets,
                  result.ascendant.sign,
                  result.cusps.map((c) => c.sign),
                )}
                activeEventColors={EVENT_CHART_COLORS[activeEventId]}
              />
            ) : (
              <div
                data-ocid="events.empty_state"
                className="text-center py-16 text-muted-foreground"
              >
                <Star className="w-12 h-12 mx-auto mb-4 text-[#2E8B57]/30" />
                <p className="font-medium">
                  Calculate a birth chart first to view event analysis
                </p>
                <p
                  className="text-sm mt-1"
                  style={{
                    fontFamily: "Noto Sans Devanagari, system-ui, sans-serif",
                  }}
                >
                  पहले जन्म कुंडली की गणना करें
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <footer className="border-t border-border/50 mt-8 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with{" "}
        <span className="text-red-500">♥</span> using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors underline underline-offset-2"
        >
          caffeine.ai
        </a>
      </footer>
      {showGate && (
        <ServiceGateModal
          service="astro-chart"
          onClose={() => setShowGate(false)}
        />
      )}
    </div>
  );
}
