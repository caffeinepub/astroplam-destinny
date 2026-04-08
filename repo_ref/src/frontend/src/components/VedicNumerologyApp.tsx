import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Settings,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import {
  type Chart,
  useCreateChart,
  useDeleteChart,
  useGetAllCharts,
  useLoginUser,
} from "../hooks/useVedicQueries";
import {
  type NumerologyResult,
  calculateDasaCycle,
  calculateNumerology,
  calculateYearNumber,
  formatDOB,
  getMonthName,
  validateDOB,
} from "../utils/numerology";
import { hasServiceAccess } from "../utils/visitorSession";
import CareerPrediction from "./CareerPrediction";
import { generateAllYearsPNG } from "./DownloadChartDialog";
import { MonthDayPromoSection } from "./MonthDayPromoSection";
import { NatalChart } from "./NatalChart";
import { VedicAdminPanel } from "./VedicAdminPanel";
import { YearChartGrid } from "./YearChartGrid";
import { YearScrollPicker } from "./YearScrollPicker";

interface DOBState {
  day: string;
  month: string;
  year: string;
}

interface VedicNumerologyAppProps {
  onClose?: () => void;
  onGoToNadiCards?: () => void;
  tier?: number;
  onGateBlocked?: () => void;
}

export default function VedicNumerologyApp({
  onClose,
  onGoToNadiCards,
  tier,
  onGateBlocked,
}: VedicNumerologyAppProps) {
  return (
    <AuthProvider>
      <AppInner
        onClose={onClose}
        onGoToNadiCards={onGoToNadiCards}
        tier={tier}
        onGateBlocked={onGateBlocked}
      />
    </AuthProvider>
  );
}

function SummaryPill({
  label,
  value,
  color,
}: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="font-body text-xs uppercase tracking-widest"
        style={{ color: "oklch(var(--muted-foreground))" }}
      >
        {label}
      </span>
      <span className="font-display text-3xl font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function AppInner({
  onClose,
  onGoToNadiCards,
  tier,
  onGateBlocked,
}: {
  onClose?: () => void;
  onGoToNadiCards?: () => void;
  tier?: number;
  onGateBlocked?: () => void;
}) {
  const visibleTier = tier ?? 3;
  const { auth, login, loginAdmin, sectionLevel } = useAuth();
  const navigate = useNavigate();

  const [dob, setDob] = useState<DOBState>(() => {
    try {
      const saved = sessionStorage.getItem("numerology_dob");
      if (saved) return JSON.parse(saved) as DOBState;
    } catch {
      // ignore
    }
    return { day: "", month: "", year: "" };
  });
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [dobError, setDobError] = useState<string | null>(null);
  const [newDobMode, setNewDobMode] = useState<"calendar" | "manual">("manual");
  const [newCalendarDate, setNewCalendarDate] = useState("");
  const newDobMMRef = useRef<HTMLInputElement>(null);
  const newDobYYYYRef = useRef<HTMLInputElement>(null);
  const [predictDob, setPredictDob] = useState<DOBState>({
    day: "",
    month: "",
    year: "",
  });
  const [predictDobMode, setPredictDobMode] = useState<"calendar" | "manual">(
    "manual",
  );
  const [predictCalDate, setPredictCalDate] = useState("");
  const predictMMRef = useRef<HTMLInputElement>(null);
  const predictYYYYRef = useRef<HTMLInputElement>(null);
  const dobFormRef = useRef<HTMLDivElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [selectedSaved, setSelectedSaved] = useState<Chart | null>(null);
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      return sessionStorage.getItem("numerology_activeTab") || "new";
    } catch {
      return "new";
    }
  });

  const [fromYear, setFromYear] = useState<number>(new Date().getFullYear());
  const [toYear, setToYear] = useState<number>(new Date().getFullYear() + 44);
  const [showYearCharts, setShowYearCharts] = useState<boolean>(false);
  const [yearDownloadMsg, setYearDownloadMsg] = useState<string>("");

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginIsAdmin, setLoginIsAdmin] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showMonthGate, setShowMonthGate] = useState(false);

  const [p1Dob, setP1Dob] = useState<DOBState>({
    day: "",
    month: "",
    year: "",
  });
  const [p2Dob, setP2Dob] = useState<DOBState>({
    day: "",
    month: "",
    year: "",
  });
  const [_compFromYear, _setCompFromYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [_compToYear, _setCompToYear] = useState<number>(
    new Date().getFullYear() + 44,
  );
  const [showComparison, setShowComparison] = useState(false);
  const [compError, setCompError] = useState<string | null>(null);
  const [p1Result, setP1Result] = useState<NumerologyResult | null>(null);
  const [p2Result, setP2Result] = useState<NumerologyResult | null>(null);
  const [compareChartTab, setCompareChartTab] = useState<"natal" | "year">(
    "natal",
  );

  const [dobMD, setDobMD] = useState({ day: "", month: "", year: "" });
  const [dobMDError, setDobMDError] = useState("");
  const [resultMD, setResultMD] = useState<NumerologyResult | null>(null);
  const [fromYearMD, setFromYearMD] = useState<number>(
    new Date().getFullYear(),
  );
  const [toYearMD, setToYearMD] = useState<number>(
    new Date().getFullYear() + 10,
  );
  const [showYearChartsMD, setShowYearChartsMD] = useState(false);

  const loginUser = useLoginUser();
  const { data: charts = [], isLoading: chartsLoading } = useGetAllCharts();
  const createChart = useCreateChart();
  const deleteChart = useDeleteChart();

  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    try {
      sessionStorage.setItem("numerology_dob", JSON.stringify(dob));
    } catch {
      // ignore
    }
  }, [dob]);

  useEffect(() => {
    try {
      if (result) {
        sessionStorage.setItem("numerology_result", JSON.stringify(result));
      } else {
        sessionStorage.removeItem("numerology_result");
      }
    } catch {
      /* ignore */
    }
  }, [result]);

  useEffect(() => {
    try {
      sessionStorage.setItem("numerology_activeTab", activeTab);
    } catch {
      /* ignore */
    }
  }, [activeTab]);
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "numerology_showYearCharts",
        String(showYearCharts),
      );
    } catch {
      /* ignore */
    }
  }, [showYearCharts]);
  function handleShowChart() {
    if (!hasServiceAccess("numerology")) {
      onGateBlocked?.();
      return;
    }
    const day = Number.parseInt(dob.day, 10);
    const month = Number.parseInt(dob.month, 10);
    const year = Number.parseInt(dob.year, 10);
    if (!dob.day || !dob.month || !dob.year) {
      setDobError("Please select a complete date of birth.");
      return;
    }
    const validationError = validateDOB(day, month, year);
    if (validationError) {
      setDobError(validationError);
      return;
    }
    setDobError(null);
    const numerology = calculateNumerology(formatDOB(day, month, year));
    setResult(numerology);
    setShowYearCharts(true);
  }

  function handleShowComparison() {
    if (!hasServiceAccess("numerology")) {
      onGateBlocked?.();
      return;
    }
    const d1 = Number.parseInt(p1Dob.day, 10);
    const m1 = Number.parseInt(p1Dob.month, 10);
    const y1 = Number.parseInt(p1Dob.year, 10);
    const d2 = Number.parseInt(p2Dob.day, 10);
    const m2 = Number.parseInt(p2Dob.month, 10);
    const y2 = Number.parseInt(p2Dob.year, 10);
    if (
      !p1Dob.day ||
      !p1Dob.month ||
      !p1Dob.year ||
      !p2Dob.day ||
      !p2Dob.month ||
      !p2Dob.year
    ) {
      setCompError("Please fill in both dates of birth.");
      return;
    }
    const e1 = validateDOB(d1, m1, y1);
    const e2 = validateDOB(d2, m2, y2);
    if (e1 || e2) {
      setCompError(e1 || e2 || "Invalid date.");
      return;
    }
    setCompError(null);
    setP1Result(calculateNumerology(formatDOB(d1, m1, y1)));
    setP2Result(calculateNumerology(formatDOB(d2, m2, y2)));
    setShowComparison(true);
  }

  async function handleSaveConfirm() {
    if (!result || !saveName.trim()) return;
    const dobStr = formatDOB(
      Number.parseInt(dob.day, 10),
      Number.parseInt(dob.month, 10),
      Number.parseInt(dob.year, 10),
    );
    try {
      await createChart.mutateAsync({
        name: saveName.trim(),
        dob: dobStr,
        basicNumber: result.basicNumber,
        destinyNumber: result.destinyNumber,
        chartNumbers: result.chartNumbers,
      });
      setSaveDialogOpen(false);
      setSaveName("");
      toast.success("Chart saved successfully!");
    } catch {
      toast.error("Failed to save chart. Please try again.");
    }
  }

  async function handleDeleteChart(e: React.MouseEvent, id: bigint) {
    e.stopPropagation();
    try {
      await deleteChart.mutateAsync(id);
      if (selectedSaved?.id === id) setSelectedSaved(null);
      toast.success("Chart deleted.");
    } catch {
      toast.error("Failed to delete chart.");
    }
  }

  function getSavedResult(chart: Chart): NumerologyResult {
    const chartNumbers = chart.chartNumbers.map(Number);
    const cellCounts: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) cellCounts[i] = 0;
    for (const n of chartNumbers)
      if (n >= 1 && n <= 9) cellCounts[n] = (cellCounts[n] || 0) + 1;
    return {
      basicNumber: Number(chart.basicNumber),
      destinyNumber: Number(chart.destinyNumber),
      chartNumbers,
      cellCounts,
    };
  }

  function openLoginModal(asAdmin = false) {
    setLoginIsAdmin(asAdmin);
    setLoginUsername("");
    setLoginPassword("");
    setLoginError(null);
    setShowLoginPassword(false);
    setLoginOpen(true);
  }

  async function handleLoginSubmit() {
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError("Please enter both username and password.");
      return;
    }
    if (loginIsAdmin) {
      const ok = loginAdmin(loginUsername.trim(), loginPassword.trim());
      if (ok) {
        setLoginOpen(false);
        setShowAdminPanel(true);
        toast.success("Welcome, Admin!");
      } else setLoginError("Invalid admin credentials.");
      return;
    }
    try {
      const level = await loginUser.mutateAsync({
        username: loginUsername.trim(),
        password: loginPassword.trim(),
      });
      login(loginUsername.trim(), level);
      setLoginOpen(false);
      toast.success(`Welcome back, ${loginUsername.trim()}!`);
    } catch {
      setLoginError("Invalid username or password.");
    }
  }

  if (showAdminPanel) {
    return (
      <>
        <Toaster position="top-right" />
        <VedicAdminPanel onBack={() => setShowAdminPanel(false)} />
      </>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col z-10">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="relative pt-14 pb-4 text-center">
        <div className="absolute top-3 left-3">
          {onClose && (
            <button
              type="button"
              data-ocid="vedic_app.close_button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-body font-semibold transition-colors"
              style={{
                background: "oklch(var(--secondary))",
                color: "oklch(var(--muted-foreground))",
                border: "1px solid oklch(var(--border))",
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {onGoToNadiCards && (
            <button
              type="button"
              onClick={onGoToNadiCards}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-body font-semibold transition-colors"
              style={{
                background: "oklch(var(--secondary))",
                color: "oklch(var(--muted-foreground))",
                border: "1px solid oklch(var(--border))",
              }}
            >
              🃏 Nadi Cards
            </button>
          )}
          {auth ? (
            <>
              <span
                className="font-body text-xs hidden sm:block"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                {auth.isAdmin ? "Admin" : auth.username}
              </span>
              {auth.isAdmin && (
                <button
                  type="button"
                  data-ocid="vedic_admin_panel.open_modal_button"
                  onClick={() => setShowAdminPanel(true)}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ color: "oklch(var(--primary))" }}
                  title="Open Admin Panel"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                data-ocid="vedic_login.open_modal_button"
                onClick={() => openLoginModal(false)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-body font-semibold transition-colors"
                style={{
                  background: "oklch(var(--primary))",
                  color: "oklch(var(--primary-foreground))",
                }}
              >
                <LogIn className="w-3.5 h-3.5" /> Login
              </button>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <h1
            className="font-display text-3xl sm:text-4xl font-bold tracking-wide"
            style={{
              color: "oklch(0.72 0.14 75)",
              textShadow: "0 1px 8px oklch(0.62 0.12 75 / 0.25)",
            }}
          >
            ✧ Numerology ✧
          </h1>
        </div>
        <p
          className="font-body text-xs tracking-[0.25em] uppercase font-semibold"
          style={{
            color: "oklch(0.62 0.09 75)",
            fontVariant: "small-caps",
            letterSpacing: "0.28em",
          }}
        >
          Ancient Numbers · Modern Insight
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-2 pb-16 w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Custom colored pill tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(
              [
                {
                  value: "new",
                  label: "New",
                  bg: "#f0f0f0",
                  text: "#333",
                  activeBg: "#9e9e9e",
                  activeText: "#fff",
                  ocid: "vedic_new_tab.tab",
                  minTier: 1,
                },
                {
                  value: "saved",
                  label: "Saved",
                  bg: "#fce4ec",
                  text: "#c2185b",
                  activeBg: "#f48fb1",
                  activeText: "#fff",
                  ocid: "vedic_saved_tab.tab",
                  minTier: 2,
                },
                {
                  value: "compare",
                  label: "Compare",
                  bg: "#e8f5e9",
                  text: "#2e7d32",
                  activeBg: "#66bb6a",
                  activeText: "#fff",
                  ocid: "vedic_comparison_tab.tab",
                  minTier: 3,
                },
                {
                  value: "months",
                  label: "Months",
                  bg: "#ede7f6",
                  text: "#6a1b9a",
                  activeBg: "#ab47bc",
                  activeText: "#fff",
                  ocid: "vedic_monthdays_tab.tab",
                  minTier: 2,
                },
                {
                  value: "predict",
                  label: "Predict",
                  bg: "#fff8e1",
                  text: "#e65100",
                  activeBg: "#ffa726",
                  activeText: "#fff",
                  ocid: "vedic_predict_tab.tab",
                  minTier: 3,
                },
                {
                  value: "career",
                  label: "Career",
                  bg: "#e3f2fd",
                  text: "#1565c0",
                  activeBg: "#42a5f5",
                  activeText: "#fff",
                  ocid: "vedic_career_tab.tab",
                  minTier: 1,
                },
              ] as const
            )
              .filter((tab) => visibleTier >= tab.minTier)
              .map((tab) => (
                <button
                  type="button"
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  data-ocid={tab.ocid}
                  className="rounded-full text-sm font-semibold px-4 py-1.5 transition-all duration-150"
                  style={{
                    background: activeTab === tab.value ? tab.activeBg : tab.bg,
                    color: activeTab === tab.value ? tab.activeText : tab.text,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              ))}
          </div>

          {/* New Chart Tab */}
          <TabsContent value="new" className="space-y-6 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="rounded-lg p-5"
                style={{
                  background: "oklch(var(--card))",
                  border: "1px solid oklch(var(--border))",
                }}
              >
                <h2
                  className="font-display text-lg font-semibold mb-4"
                  style={{ color: "oklch(var(--primary))" }}
                >
                  Enter Date of Birth
                </h2>
                {/* DOB mode toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setNewDobMode("manual")}
                    className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all"
                    style={{
                      background:
                        newDobMode === "manual"
                          ? "oklch(var(--primary))"
                          : "oklch(var(--muted))",
                      color:
                        newDobMode === "manual"
                          ? "oklch(var(--primary-foreground))"
                          : "oklch(var(--muted-foreground))",
                      border: "none",
                    }}
                  >
                    Manual
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDobMode("calendar")}
                    className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all"
                    style={{
                      background:
                        newDobMode === "calendar"
                          ? "oklch(var(--primary))"
                          : "oklch(var(--muted))",
                      color:
                        newDobMode === "calendar"
                          ? "oklch(var(--primary-foreground))"
                          : "oklch(var(--muted-foreground))",
                      border: "none",
                    }}
                  >
                    Calendar
                  </button>
                </div>
                {newDobMode === "calendar" ? (
                  <div className="mb-4">
                    <input
                      type="date"
                      data-ocid="vedic_dob_calendar.input"
                      value={newCalendarDate}
                      onChange={(e) => {
                        setNewCalendarDate(e.target.value);
                        if (e.target.value) {
                          const [y, m, d] = e.target.value.split("-");
                          setDob({
                            day: String(Number(d)),
                            month: String(Number(m)),
                            year: y,
                          });
                        }
                      }}
                      className="w-full h-9 px-3 rounded-md text-sm font-body"
                      style={{
                        background: "oklch(var(--input))",
                        border: "1px solid oklch(var(--border))",
                        color: "oklch(var(--foreground))",
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="space-y-1">
                      <Label
                        className="text-xs uppercase tracking-wider font-body"
                        style={{ color: "oklch(var(--muted-foreground))" }}
                      >
                        Day
                      </Label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="DD"
                        maxLength={2}
                        data-ocid="vedic_dob_day.input"
                        value={dob.day}
                        onChange={(e) => {
                          const num = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 2);
                          setDob((prev) => ({ ...prev, day: num }));
                          if (num.length === 2) newDobMMRef.current?.focus();
                        }}
                        className="w-16 h-9 px-3 rounded-md text-sm font-body text-center"
                        style={{
                          background: "oklch(var(--input))",
                          border: "1px solid oklch(var(--border))",
                          color: "oklch(var(--foreground))",
                        }}
                      />
                    </div>
                    <span
                      className="mt-5 font-bold"
                      style={{ color: "oklch(var(--primary))" }}
                    >
                      /
                    </span>
                    <div className="space-y-1">
                      <Label
                        className="text-xs uppercase tracking-wider font-body"
                        style={{ color: "oklch(var(--muted-foreground))" }}
                      >
                        Month
                      </Label>
                      <input
                        ref={newDobMMRef}
                        type="text"
                        inputMode="numeric"
                        placeholder="MM"
                        maxLength={2}
                        data-ocid="vedic_dob_month.input"
                        value={dob.month}
                        onChange={(e) => {
                          const num = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 2);
                          setDob((prev) => ({ ...prev, month: num }));
                          if (num.length === 2) newDobYYYYRef.current?.focus();
                        }}
                        className="w-16 h-9 px-3 rounded-md text-sm font-body text-center"
                        style={{
                          background: "oklch(var(--input))",
                          border: "1px solid oklch(var(--border))",
                          color: "oklch(var(--foreground))",
                        }}
                      />
                    </div>
                    <span
                      className="mt-5 font-bold"
                      style={{ color: "oklch(var(--primary))" }}
                    >
                      /
                    </span>
                    <div className="space-y-1">
                      <Label
                        className="text-xs uppercase tracking-wider font-body"
                        style={{ color: "oklch(var(--muted-foreground))" }}
                      >
                        Year
                      </Label>
                      <input
                        ref={newDobYYYYRef}
                        type="text"
                        inputMode="numeric"
                        placeholder="YYYY"
                        maxLength={4}
                        data-ocid="vedic_dob_year.input"
                        value={dob.year}
                        onChange={(e) => {
                          const num = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4);
                          setDob((prev) => ({ ...prev, year: num }));
                        }}
                        className="w-24 h-9 px-3 rounded-md text-sm font-body text-center"
                        style={{
                          background: "oklch(var(--input))",
                          border: "1px solid oklch(var(--border))",
                          color: "oklch(var(--foreground))",
                        }}
                      />
                    </div>
                  </div>
                )}

                {dobError && (
                  <p
                    className="text-xs font-body mb-3"
                    style={{ color: "oklch(var(--destructive))" }}
                  >
                    {dobError}
                  </p>
                )}

                {/* Year range inputs - shown with DOB */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="vedic_year_from"
                      className="text-xs uppercase tracking-wider font-body block"
                      style={{ color: "oklch(var(--muted-foreground))" }}
                    >
                      From Year
                    </label>
                    <input
                      id="vedic_year_from"
                      data-ocid="vedic_year_from.input"
                      type="number"
                      min={1800}
                      max={2200}
                      value={fromYear}
                      onChange={(e) =>
                        setFromYear(
                          Number.parseInt(e.target.value, 10) || fromYear,
                        )
                      }
                      className="w-full h-9 px-3 rounded-md text-sm font-body"
                      style={{
                        background: "oklch(var(--input))",
                        border: "1px solid oklch(var(--border))",
                        color: "oklch(var(--foreground))",
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="vedic_year_to"
                      className="text-xs uppercase tracking-wider font-body block"
                      style={{ color: "oklch(var(--muted-foreground))" }}
                    >
                      To Year
                    </label>
                    <input
                      id="vedic_year_to"
                      data-ocid="vedic_year_to.input"
                      type="number"
                      min={1800}
                      max={2200}
                      value={toYear}
                      onChange={(e) =>
                        setToYear(Number.parseInt(e.target.value, 10) || toYear)
                      }
                      className="w-full h-9 px-3 rounded-md text-sm font-body"
                      style={{
                        background: "oklch(var(--input))",
                        border: "1px solid oklch(var(--border))",
                        color: "oklch(var(--foreground))",
                      }}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleShowChart}
                  data-ocid="vedic_show_chart.primary_button"
                  className="w-full font-body font-semibold tracking-wide"
                  style={{
                    background: "oklch(var(--primary))",
                    color: "oklch(var(--primary-foreground))",
                  }}
                >
                  <ChevronDown className="w-4 h-4 mr-2" /> Show Charts
                </Button>
              </div>

              {/* Natal Chart - shown first, compact with legend */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    key="natal-result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mt-4 space-y-4"
                  >
                    {/* Summary pills */}
                    <div
                      className="rounded-lg p-4 flex items-center justify-center gap-8"
                      style={{
                        background: "oklch(var(--card))",
                        border: "1px solid oklch(var(--border))",
                      }}
                    >
                      <SummaryPill
                        label="Basic"
                        value={result.basicNumber}
                        color="#dc2626"
                      />
                      <div
                        className="w-px h-8"
                        style={{ background: "oklch(var(--border))" }}
                      />
                      <SummaryPill
                        label="Destiny"
                        value={result.destinyNumber}
                        color="#eab308"
                      />
                    </div>

                    {/* Natal Chart - compact with legend */}
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{ border: "1px solid oklch(var(--border))" }}
                    >
                      <NatalChart
                        cellCounts={result.cellCounts}
                        basicNumber={result.basicNumber}
                        destinyNumber={result.destinyNumber}
                        animate={true}
                        showLegend={true}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dasa & Year Charts download option - shown when results are visible */}
              {result && showYearCharts && (
                <div
                  className="rounded-lg p-4 space-y-4"
                  style={{
                    background: "oklch(var(--card))",
                    border: "1px solid oklch(var(--border))",
                  }}
                >
                  <h3
                    className="font-display text-base font-semibold"
                    style={{ color: "oklch(var(--primary))" }}
                  >
                    Dasa &amp; Year Charts
                  </h3>
                  {result &&
                    showYearCharts &&
                    sectionLevel >= 2 &&
                    visibleTier >= 2 && (
                      <div className="flex flex-col gap-1">
                        <Button
                          data-ocid="vedic_download_dasa_year.primary_button"
                          variant="outline"
                          className="w-full font-body font-semibold tracking-wide"
                          style={{
                            borderColor: "#2563eb",
                            color: "#2563eb",
                          }}
                          onClick={() => {
                            const MAX = 30;
                            const yearCount = toYear - fromYear + 1;
                            const effectiveTo =
                              yearCount > MAX ? fromYear + MAX - 1 : toYear;
                            setYearDownloadMsg(
                              yearCount > MAX
                                ? "Showing first 30 years only (max 30 per download)"
                                : "",
                            );
                            const entries: Array<{
                              yearIter: number;
                              dasaNumber: number;
                              yearNumber: number;
                              yearLabel: string;
                            }> = [];
                            const dasaPeriods = calculateDasaCycle(
                              result.basicNumber,
                              Number(dob.year),
                              fromYear,
                              effectiveTo,
                            );
                            for (let y = fromYear; y <= effectiveTo; y++) {
                              const yn = calculateYearNumber(
                                Number(dob.day),
                                Number(dob.month),
                                y,
                              );
                              const period = dasaPeriods.find(
                                (p) => p.startYear <= y && y < p.endYear,
                              );
                              const dn = period
                                ? period.dasaNumber
                                : result.basicNumber;
                              entries.push({
                                yearIter: y,
                                dasaNumber: dn,
                                yearNumber: yn,
                                yearLabel: `${y} – ${y + 1}`,
                              });
                            }
                            const dobStr = `${String(dob.day).padStart(2, "0")}-${String(dob.month).padStart(2, "0")}-${dob.year}`;
                            const dataUrl = generateAllYearsPNG(
                              entries,
                              Number(dob.day),
                              Number(dob.month),
                              result.basicNumber,
                              result.destinyNumber,
                              result.cellCounts,
                              dobStr,
                            );
                            const a = document.createElement("a");
                            a.href = dataUrl;
                            a.download = `dasa-year-charts-${fromYear}-${effectiveTo}.png`;
                            a.click();
                          }}
                        >
                          ⬇ Download Dasa Year Chart
                        </Button>
                        {yearDownloadMsg && (
                          <p
                            className="text-xs text-center"
                            style={{ color: "#d97706" }}
                          >
                            {yearDownloadMsg}
                          </p>
                        )}
                      </div>
                    )}
                </div>
              )}
              {/* end dasa section conditional */}

              <AnimatePresence>
                {showYearCharts && result && (
                  <motion.div
                    key="year-charts"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                  >
                    <YearChartGrid
                      day={Number.parseInt(dob.day, 10)}
                      month={Number.parseInt(dob.month, 10)}
                      year={Number.parseInt(dob.year, 10)}
                      basicNumber={result.basicNumber}
                      destinyNumber={result.destinyNumber}
                      natalCellCounts={result.cellCounts}
                      fromYear={fromYear}
                      toYear={toYear}
                      canAccessMonth={sectionLevel >= 2}
                      onMonthLocked={() => setShowMonthGate(true)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {result && (
                  <motion.div
                    key="chart-actions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="space-y-4"
                  >
                    <Button
                      onClick={() => setSaveDialogOpen(true)}
                      data-ocid="vedic_save_chart.primary_button"
                      variant="outline"
                      className="w-full font-body font-semibold tracking-wide"
                      style={{
                        borderColor: "oklch(var(--primary) / 0.5)",
                        color: "oklch(var(--primary))",
                      }}
                    >
                      Save This Chart
                    </Button>

                    {/* Prediction options after chart */}
                    <div className="space-y-3 pt-2">
                      <h3
                        className="font-display text-base font-semibold"
                        style={{ color: "oklch(var(--primary))" }}
                      >
                        Prediction Services
                      </h3>
                      {[
                        {
                          label: "Basic Nature",
                          desc: "Core personality traits from your birth numbers.",
                          icon: "🌱",
                          type: "basic",
                        },
                        {
                          label: "Advance Nature Prediction",
                          desc: "Deep dive into character, emotions, and hidden tendencies.",
                          icon: "🔮",
                          type: "advance",
                        },
                        {
                          label: "Nature + Career Prediction",
                          desc: "Full personality analysis + career guidance for your numbers.",
                          icon: "💼",
                          type: "career",
                        },
                        {
                          label: "Compare Charts",
                          desc: "Compare two DOBs side by side.",
                          icon: "⚖️",
                          type: "compare",
                        },
                      ].map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => {
                            if (sectionLevel >= 2) {
                              if (item.type !== "compare") {
                                try {
                                  sessionStorage.setItem(
                                    "numerology_current_result",
                                    JSON.stringify(result),
                                  );
                                } catch {}
                              }
                              navigate({
                                to: `/numerology/prediction/${item.type}`,
                              });
                            } else {
                              openLoginModal(false);
                            }
                          }}
                          className="w-full rounded-xl p-4 flex items-start gap-3 text-left transition-all"
                          style={{
                            background: "oklch(var(--card))",
                            border: "1px solid oklch(var(--border))",
                            cursor: "pointer",
                          }}
                        >
                          <span className="text-2xl shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="font-display text-sm font-bold"
                                style={{
                                  color:
                                    sectionLevel >= 2
                                      ? "oklch(var(--primary))"
                                      : "oklch(var(--muted-foreground))",
                                }}
                              >
                                {item.label}
                              </span>
                              {sectionLevel < 2 && (
                                <Lock
                                  className="w-3 h-3"
                                  style={{
                                    color: "oklch(var(--muted-foreground))",
                                  }}
                                />
                              )}
                            </div>
                            <p
                              className="font-body text-xs mt-0.5"
                              style={{
                                color: "oklch(var(--muted-foreground))",
                              }}
                            >
                              {item.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </TabsContent>

          {/* Saved Charts Tab */}
          <TabsContent value="saved" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {chartsLoading ? (
                <div
                  data-ocid="vedic_charts.loading_state"
                  className="space-y-3"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-20 w-full rounded-lg"
                      style={{ background: "oklch(var(--muted))" }}
                    />
                  ))}
                </div>
              ) : charts.length === 0 ? (
                <div
                  data-ocid="vedic_charts.empty_state"
                  className="text-center py-16 space-y-3"
                >
                  <BookOpen
                    className="w-12 h-12 mx-auto opacity-25"
                    style={{ color: "oklch(var(--primary))" }}
                  />
                  <p
                    className="font-display text-lg"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    No saved charts yet
                  </p>
                  <p
                    className="font-body text-sm"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    Calculate a natal chart and save it to see it here.
                  </p>
                </div>
              ) : (
                <div data-ocid="vedic_saved_charts.list" className="space-y-3">
                  {charts.map((chart, idx) => (
                    <motion.div
                      key={String(chart.id)}
                      data-ocid={`vedic_saved_chart.item.${idx + 1}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() =>
                        setSelectedSaved(
                          selectedSaved?.id === chart.id ? null : chart,
                        )
                      }
                      className="rounded-lg p-4 cursor-pointer transition-all"
                      style={{
                        background:
                          selectedSaved?.id === chart.id
                            ? "oklch(0.92 0.03 90)"
                            : "oklch(var(--card))",
                        border:
                          selectedSaved?.id === chart.id
                            ? "1px solid oklch(var(--primary) / 0.6)"
                            : "1px solid oklch(var(--border))",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-display font-semibold text-base truncate"
                            style={{ color: "oklch(var(--foreground))" }}
                          >
                            {chart.name}
                          </p>
                          <p
                            className="font-body text-sm mt-0.5"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            {chart.dob}
                          </p>
                          <div className="flex gap-3 mt-1.5">
                            <span
                              className="font-body text-xs"
                              style={{ color: "#dc2626" }}
                            >
                              Basic: {String(chart.basicNumber)}
                            </span>
                            <span
                              className="font-body text-xs"
                              style={{ color: "#eab308" }}
                            >
                              Destiny: {String(chart.destinyNumber)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          data-ocid={`vedic_delete_chart.delete_button.${idx + 1}`}
                          onClick={(e) => handleDeleteChart(e, chart.id)}
                          className="p-2 rounded-md transition-colors shrink-0"
                          style={{ color: "oklch(var(--muted-foreground))" }}
                          disabled={deleteChart.isPending}
                          aria-label="Delete chart"
                        >
                          {deleteChart.isPending &&
                          deleteChart.variables === chart.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <AnimatePresence>
                        {selectedSaved?.id === chart.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div
                              className="mt-4 pt-4"
                              style={{
                                borderTop: "1px solid oklch(var(--border))",
                              }}
                            >
                              <NatalChart
                                cellCounts={getSavedResult(chart).cellCounts}
                                basicNumber={Number(chart.basicNumber)}
                                destinyNumber={Number(chart.destinyNumber)}
                                animate={false}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="compare" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {!auth || sectionLevel < 2 ? (
                <div
                  className="rounded-lg p-10 flex flex-col items-center text-center gap-4"
                  data-ocid="vedic_compare_locked.panel"
                  style={{
                    background: "oklch(var(--card))",
                    border: "1px solid oklch(var(--border))",
                  }}
                >
                  <Lock
                    className="w-10 h-10 opacity-30"
                    style={{ color: "oklch(var(--primary))" }}
                  />
                  <p
                    className="font-display text-base font-semibold"
                    style={{ color: "oklch(var(--primary))" }}
                  >
                    Advanced Access Required
                  </p>
                  <p
                    className="font-body text-sm"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    Compare Charts requires Advanced access. Please log in with
                    an Advanced account.
                  </p>
                  {!auth && (
                    <Button
                      data-ocid="vedic_compare_login.primary_button"
                      onClick={() => openLoginModal(false)}
                      style={{
                        background: "oklch(var(--primary))",
                        color: "oklch(var(--primary-foreground))",
                      }}
                      className="font-body font-semibold gap-2"
                    >
                      <LogIn className="w-4 h-4" /> Login
                    </Button>
                  )}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {!showComparison ? (
                    <motion.div
                      key="comparison-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {[
                        {
                          label: "Person 1",
                          dob: p1Dob,
                          setDob: setP1Dob,
                          ocid: "comp_p1_dob.input",
                        },
                        {
                          label: "Person 2",
                          dob: p2Dob,
                          setDob: setP2Dob,
                          ocid: "comp_p2_dob.input",
                        },
                      ].map(({ label, dob: pDob, setDob: setPDob, ocid }) => (
                        <div
                          key={label}
                          className="rounded-lg p-5"
                          style={{
                            background: "oklch(var(--card))",
                            border: "1px solid oklch(var(--border))",
                          }}
                        >
                          <h2
                            className="font-display text-lg font-semibold mb-4"
                            style={{ color: "oklch(var(--primary))" }}
                          >
                            {label}
                          </h2>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                              <Label
                                className="text-xs uppercase tracking-wider font-body"
                                style={{
                                  color: "oklch(var(--muted-foreground))",
                                }}
                              >
                                Day
                              </Label>
                              <select
                                data-ocid={ocid}
                                value={pDob.day}
                                onChange={(e) =>
                                  setPDob((prev) => ({
                                    ...prev,
                                    day: e.target.value,
                                  }))
                                }
                                className="w-full h-9 px-3 rounded-md text-sm font-body appearance-none cursor-pointer"
                                style={{
                                  background: "oklch(var(--input))",
                                  border: "1px solid oklch(var(--border))",
                                  color: pDob.day
                                    ? "oklch(var(--foreground))"
                                    : "oklch(var(--muted-foreground))",
                                }}
                              >
                                <option value="" disabled>
                                  DD
                                </option>
                                {dayOptions.map((d) => (
                                  <option key={d} value={String(d)}>
                                    {String(d).padStart(2, "0")}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                className="text-xs uppercase tracking-wider font-body"
                                style={{
                                  color: "oklch(var(--muted-foreground))",
                                }}
                              >
                                Month
                              </Label>
                              <select
                                value={pDob.month}
                                onChange={(e) =>
                                  setPDob((prev) => ({
                                    ...prev,
                                    month: e.target.value,
                                  }))
                                }
                                className="w-full h-9 px-3 rounded-md text-sm font-body appearance-none cursor-pointer"
                                style={{
                                  background: "oklch(var(--input))",
                                  border: "1px solid oklch(var(--border))",
                                  color: pDob.month
                                    ? "oklch(var(--foreground))"
                                    : "oklch(var(--muted-foreground))",
                                }}
                              >
                                <option value="" disabled>
                                  MM
                                </option>
                                {monthOptions.map((m) => (
                                  <option key={m} value={String(m)}>
                                    {getMonthName(m)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                className="text-xs uppercase tracking-wider font-body"
                                style={{
                                  color: "oklch(var(--muted-foreground))",
                                }}
                              >
                                Year
                              </Label>
                              <YearScrollPicker
                                value={pDob.year}
                                onChange={(v) =>
                                  setPDob((prev) => ({ ...prev, year: v }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {compError && (
                        <p
                          className="text-xs font-body"
                          style={{ color: "oklch(var(--destructive))" }}
                          data-ocid="vedic_comparison.error_state"
                        >
                          {compError}
                        </p>
                      )}
                      <Button
                        onClick={handleShowComparison}
                        data-ocid="vedic_comparison.primary_button"
                        className="w-full font-body font-semibold tracking-wide"
                        style={{
                          background: "oklch(var(--primary))",
                          color: "oklch(var(--primary-foreground))",
                        }}
                      >
                        Compare Charts
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="comparison-result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <Button
                        variant="outline"
                        onClick={() => setShowComparison(false)}
                        data-ocid="vedic_comparison_back.secondary_button"
                        className="font-body gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </Button>
                      {p1Result && p2Result && (
                        <div className="space-y-3">
                          {/* Chart type tabs */}
                          <div
                            className="flex gap-1 rounded-lg p-1"
                            style={{ background: "oklch(var(--muted))" }}
                          >
                            {(["natal", "year"] as const).map((tab) => (
                              <button
                                type="button"
                                key={tab}
                                data-ocid={`compare_chart.${tab}.tab`}
                                onClick={() => setCompareChartTab(tab)}
                                className="flex-1 py-1.5 rounded-md text-xs font-semibold font-body transition-all"
                                style={{
                                  background:
                                    compareChartTab === tab
                                      ? "oklch(var(--card))"
                                      : "transparent",
                                  color:
                                    compareChartTab === tab
                                      ? "oklch(var(--primary))"
                                      : "oklch(var(--muted-foreground))",
                                  boxShadow:
                                    compareChartTab === tab
                                      ? "0 1px 3px oklch(0 0 0 / 0.1)"
                                      : "none",
                                }}
                              >
                                {tab === "natal"
                                  ? "Natal"
                                  : "Year · Month · Dasa"}
                              </button>
                            ))}
                          </div>

                          {compareChartTab === "natal" && (
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: "Person 1", r: p1Result },
                                { label: "Person 2", r: p2Result },
                              ].map(({ label, r }) => (
                                <div
                                  key={label}
                                  className="rounded-lg p-3 space-y-2"
                                  style={{
                                    background: "oklch(var(--card))",
                                    border: "1px solid oklch(var(--border))",
                                  }}
                                >
                                  <h3
                                    className="font-display text-sm font-semibold"
                                    style={{ color: "oklch(var(--primary))" }}
                                  >
                                    {label}
                                  </h3>
                                  <div className="flex gap-3">
                                    <span
                                      className="font-body text-xs"
                                      style={{ color: "#dc2626" }}
                                    >
                                      B: {r.basicNumber}
                                    </span>
                                    <span
                                      className="font-body text-xs"
                                      style={{ color: "#eab308" }}
                                    >
                                      D: {r.destinyNumber}
                                    </span>
                                  </div>
                                  <NatalChart
                                    cellCounts={r.cellCounts}
                                    basicNumber={r.basicNumber}
                                    destinyNumber={r.destinyNumber}
                                    animate={false}
                                    compact={true}
                                    hideHeader={true}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {compareChartTab === "year" && (
                            <div className="space-y-6">
                              {[
                                { label: "Person 1", r: p1Result, dob: p1Dob },
                                { label: "Person 2", r: p2Result, dob: p2Dob },
                              ].map(({ label, r, dob }) => (
                                <div key={label} className="space-y-2">
                                  <h3
                                    className="font-display text-sm font-semibold px-1"
                                    style={{ color: "oklch(var(--primary))" }}
                                  >
                                    {label} — B: {r.basicNumber} · D:{" "}
                                    {r.destinyNumber}
                                  </h3>
                                  <YearChartGrid
                                    day={Number.parseInt(dob.day, 10)}
                                    month={Number.parseInt(dob.month, 10)}
                                    year={Number.parseInt(dob.year, 10)}
                                    basicNumber={r.basicNumber}
                                    destinyNumber={r.destinyNumber}
                                    natalCellCounts={r.cellCounts}
                                    fromYear={new Date().getFullYear()}
                                    toYear={new Date().getFullYear() + 5}
                                    canAccessMonth={true}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          </TabsContent>

          {/* Month/Days Tab */}
          <TabsContent value="months" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {!auth || sectionLevel < 1 ? (
                <div
                  className="rounded-lg p-10 flex flex-col items-center text-center gap-4"
                  data-ocid="vedic_months_locked.panel"
                  style={{
                    background: "oklch(var(--card))",
                    border: "1px solid oklch(var(--border))",
                  }}
                >
                  <Lock
                    className="w-10 h-10 opacity-30"
                    style={{ color: "oklch(var(--primary))" }}
                  />
                  <p
                    className="font-display text-base font-semibold"
                    style={{ color: "oklch(var(--primary))" }}
                  >
                    Paid Access Required
                  </p>
                  <p
                    className="font-body text-sm"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    Month &amp; Day Charts requires Paid access. Please log in
                    or contact admin.
                  </p>
                  {!auth && (
                    <Button
                      data-ocid="vedic_months_login.primary_button"
                      onClick={() => openLoginModal(false)}
                      style={{
                        background: "oklch(var(--primary))",
                        color: "oklch(var(--primary-foreground))",
                      }}
                      className="font-body font-semibold gap-2"
                    >
                      <LogIn className="w-4 h-4" /> Login
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <MonthDayPromoSection
                    onTryIt={() => {
                      dobFormRef.current?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }}
                  />
                  <div ref={dobFormRef}>
                    <div
                      className="rounded-lg p-5 space-y-4"
                      style={{
                        background: "oklch(var(--card))",
                        border: "1px solid oklch(var(--border))",
                      }}
                    >
                      <h2
                        className="font-display text-lg font-semibold"
                        style={{ color: "oklch(var(--primary))" }}
                      >
                        Month &amp; Day Charts
                      </h2>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            Day
                          </Label>
                          <select
                            data-ocid="vedic_md_dob_day.input"
                            value={dobMD.day}
                            onChange={(e) =>
                              setDobMD((prev) => ({
                                ...prev,
                                day: e.target.value,
                              }))
                            }
                            className="w-full h-9 px-3 rounded-md text-sm font-body appearance-none cursor-pointer"
                            style={{
                              background: "oklch(var(--input))",
                              border: "1px solid oklch(var(--border))",
                              color: dobMD.day
                                ? "oklch(var(--foreground))"
                                : "oklch(var(--muted-foreground))",
                            }}
                          >
                            <option value="" disabled>
                              DD
                            </option>
                            {dayOptions.map((d) => (
                              <option key={d} value={String(d)}>
                                {String(d).padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            Month
                          </Label>
                          <select
                            value={dobMD.month}
                            onChange={(e) =>
                              setDobMD((prev) => ({
                                ...prev,
                                month: e.target.value,
                              }))
                            }
                            className="w-full h-9 px-3 rounded-md text-sm font-body appearance-none cursor-pointer"
                            style={{
                              background: "oklch(var(--input))",
                              border: "1px solid oklch(var(--border))",
                              color: dobMD.month
                                ? "oklch(var(--foreground))"
                                : "oklch(var(--muted-foreground))",
                            }}
                          >
                            <option value="" disabled>
                              MM
                            </option>
                            {monthOptions.map((m) => (
                              <option key={m} value={String(m)}>
                                {getMonthName(m)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            Year
                          </Label>
                          <YearScrollPicker
                            value={dobMD.year}
                            onChange={(v) =>
                              setDobMD((prev) => ({ ...prev, year: v }))
                            }
                          />
                        </div>
                      </div>
                      {dobMDError && (
                        <p
                          className="text-xs font-body"
                          style={{ color: "oklch(var(--destructive))" }}
                        >
                          {dobMDError}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            From Year
                          </Label>
                          <Input
                            type="number"
                            min={1800}
                            max={2200}
                            value={fromYearMD}
                            onChange={(e) =>
                              setFromYearMD(
                                Number.parseInt(e.target.value, 10) ||
                                  fromYearMD,
                              )
                            }
                            className="font-body"
                            style={{
                              background: "oklch(var(--input))",
                              borderColor: "oklch(var(--border))",
                            }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            To Year
                          </Label>
                          <Input
                            type="number"
                            min={1800}
                            max={2200}
                            value={toYearMD}
                            onChange={(e) =>
                              setToYearMD(
                                Number.parseInt(e.target.value, 10) || toYearMD,
                              )
                            }
                            className="font-body"
                            style={{
                              background: "oklch(var(--input))",
                              borderColor: "oklch(var(--border))",
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        data-ocid="vedic_md_show.primary_button"
                        onClick={() => {
                          const day = Number.parseInt(dobMD.day, 10);
                          const month = Number.parseInt(dobMD.month, 10);
                          const year = Number.parseInt(dobMD.year, 10);
                          if (!dobMD.day || !dobMD.month || !dobMD.year) {
                            setDobMDError(
                              "Please select a complete date of birth.",
                            );
                            return;
                          }
                          const err = validateDOB(day, month, year);
                          if (err) {
                            setDobMDError(err);
                            return;
                          }
                          setDobMDError("");
                          setResultMD(
                            calculateNumerology(formatDOB(day, month, year)),
                          );
                          setShowYearChartsMD(true);
                        }}
                        className="w-full font-body font-semibold tracking-wide"
                        style={{
                          background: "oklch(var(--primary))",
                          color: "oklch(var(--primary-foreground))",
                        }}
                      >
                        Show Year Charts
                      </Button>
                    </div>
                  </div>

                  {showYearChartsMD && resultMD && (
                    <div className="mt-4">
                      <YearChartGrid
                        day={Number.parseInt(dobMD.day, 10)}
                        month={Number.parseInt(dobMD.month, 10)}
                        year={Number.parseInt(dobMD.year, 10)}
                        basicNumber={resultMD.basicNumber}
                        destinyNumber={resultMD.destinyNumber}
                        natalCellCounts={resultMD.cellCounts}
                        fromYear={fromYearMD}
                        toYear={toYearMD}
                        canAccessMonth={sectionLevel >= 2}
                        onMonthLocked={() => setShowMonthGate(true)}
                      />
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </TabsContent>

          {/* Predict Tab */}
          <TabsContent value="predict" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {!auth || sectionLevel < 2 ? (
                <div
                  className="rounded-lg p-10 flex flex-col items-center text-center gap-4"
                  data-ocid="vedic_predict_locked.panel"
                  style={{
                    background: "oklch(var(--card))",
                    border: "1px solid oklch(var(--border))",
                  }}
                >
                  <Lock
                    className="w-10 h-10 opacity-30"
                    style={{ color: "oklch(var(--primary))" }}
                  />
                  <p
                    className="font-display text-base font-semibold"
                    style={{ color: "oklch(var(--primary))" }}
                  >
                    Advanced Access Required
                  </p>
                  <p
                    className="font-body text-sm"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    Predictions require Advanced access. Please log in or
                    contact admin.
                  </p>
                  {!auth && (
                    <Button
                      data-ocid="vedic_predict_login.primary_button"
                      onClick={() => openLoginModal(false)}
                      style={{
                        background: "oklch(var(--primary))",
                        color: "oklch(var(--primary-foreground))",
                      }}
                      className="font-body font-semibold gap-2"
                    >
                      <LogIn className="w-4 h-4" /> Login
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4" data-ocid="vedic_predict.panel">
                  <h2
                    className="font-display text-lg font-semibold"
                    style={{ color: "oklch(var(--primary))" }}
                  >
                    Choose Prediction Type
                  </h2>
                  {/* Predict DOB input */}
                  <div
                    className="rounded-lg p-5 mb-2"
                    style={{
                      background: "oklch(var(--card))",
                      border: "1px solid oklch(var(--border))",
                    }}
                  >
                    <h3
                      className="font-display text-base font-semibold mb-3"
                      style={{ color: "oklch(var(--primary))" }}
                    >
                      Enter Date of Birth
                    </h3>
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setPredictDobMode("manual")}
                        className="rounded-full px-3 py-1 text-sm font-semibold"
                        style={{
                          background:
                            predictDobMode === "manual"
                              ? "oklch(var(--primary))"
                              : "oklch(var(--muted))",
                          color:
                            predictDobMode === "manual"
                              ? "oklch(var(--primary-foreground))"
                              : "oklch(var(--muted-foreground))",
                          border: "none",
                        }}
                      >
                        Manual
                      </button>
                      <button
                        type="button"
                        onClick={() => setPredictDobMode("calendar")}
                        className="rounded-full px-3 py-1 text-sm font-semibold"
                        style={{
                          background:
                            predictDobMode === "calendar"
                              ? "oklch(var(--primary))"
                              : "oklch(var(--muted))",
                          color:
                            predictDobMode === "calendar"
                              ? "oklch(var(--primary-foreground))"
                              : "oklch(var(--muted-foreground))",
                          border: "none",
                        }}
                      >
                        Calendar
                      </button>
                    </div>
                    {predictDobMode === "calendar" ? (
                      <input
                        type="date"
                        value={predictCalDate}
                        onChange={(e) => {
                          setPredictCalDate(e.target.value);
                          if (e.target.value) {
                            const [y, m, d] = e.target.value.split("-");
                            setPredictDob({
                              day: String(Number(d)),
                              month: String(Number(m)),
                              year: y,
                            });
                          }
                        }}
                        className="w-full h-9 px-3 rounded-md text-sm"
                        style={{
                          background: "oklch(var(--input))",
                          border: "1px solid oklch(var(--border))",
                          color: "oklch(var(--foreground))",
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="DD"
                          maxLength={2}
                          data-ocid="predict_dob_day.input"
                          value={predictDob.day}
                          onChange={(e) => {
                            const n = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 2);
                            setPredictDob((p) => ({ ...p, day: n }));
                            if (n.length === 2) predictMMRef.current?.focus();
                          }}
                          className="w-16 h-9 px-3 rounded-md text-sm text-center"
                          style={{
                            background: "oklch(var(--input))",
                            border: "1px solid oklch(var(--border))",
                            color: "oklch(var(--foreground))",
                          }}
                        />
                        <span
                          style={{
                            color: "oklch(var(--primary))",
                            fontWeight: 700,
                          }}
                        >
                          /
                        </span>
                        <input
                          ref={predictMMRef}
                          type="text"
                          inputMode="numeric"
                          placeholder="MM"
                          maxLength={2}
                          data-ocid="predict_dob_month.input"
                          value={predictDob.month}
                          onChange={(e) => {
                            const n = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 2);
                            setPredictDob((p) => ({ ...p, month: n }));
                            if (n.length === 2) predictYYYYRef.current?.focus();
                          }}
                          className="w-16 h-9 px-3 rounded-md text-sm text-center"
                          style={{
                            background: "oklch(var(--input))",
                            border: "1px solid oklch(var(--border))",
                            color: "oklch(var(--foreground))",
                          }}
                        />
                        <span
                          style={{
                            color: "oklch(var(--primary))",
                            fontWeight: 700,
                          }}
                        >
                          /
                        </span>
                        <input
                          ref={predictYYYYRef}
                          type="text"
                          inputMode="numeric"
                          placeholder="YYYY"
                          maxLength={4}
                          data-ocid="predict_dob_year.input"
                          value={predictDob.year}
                          onChange={(e) => {
                            const n = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);
                            setPredictDob((p) => ({ ...p, year: n }));
                          }}
                          className="w-24 h-9 px-3 rounded-md text-sm text-center"
                          style={{
                            background: "oklch(var(--input))",
                            border: "1px solid oklch(var(--border))",
                            color: "oklch(var(--foreground))",
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {[
                    {
                      label: "Basic Nature",
                      desc: "Discover your core personality traits and natural tendencies based on your birth numbers.",
                      icon: "🌱",
                      type: "basic",
                      ocid: "predict_basic.primary_button",
                    },
                    {
                      label: "Advance Nature Prediction",
                      desc: "Deep dive into your strengths, challenges, and life patterns across all chart numbers.",
                      icon: "🔮",
                      type: "advance",
                      ocid: "predict_advance.primary_button",
                    },
                    {
                      label: "Nature + Career Prediction",
                      desc: "Full personality analysis followed by career guidance for each of your chart numbers.",
                      icon: "💼",
                      type: "career",
                      ocid: "predict_career.primary_button",
                    },
                    {
                      label: "Compare Charts",
                      desc: "Enter two dates of birth and compare Natal Charts side by side with compatibility notes.",
                      icon: "⚖️",
                      type: null,
                      ocid: "predict_compare.primary_button",
                    },
                  ].map((item, idx) => (
                    <button
                      key={item.label}
                      type="button"
                      data-ocid={item.ocid}
                      onClick={() => {
                        if (item.type) {
                          // Use predictDob if filled, else fall back to sessionStorage
                          if (
                            predictDob.day &&
                            predictDob.month &&
                            predictDob.year
                          ) {
                            const d = Number.parseInt(predictDob.day, 10);
                            const m = Number.parseInt(predictDob.month, 10);
                            const y = Number.parseInt(predictDob.year, 10);
                            const res = calculateNumerology(formatDOB(d, m, y));
                            sessionStorage.setItem(
                              "numerology_current_result",
                              JSON.stringify({
                                ...res,
                                dob: formatDOB(d, m, y),
                              }),
                            );
                          } else {
                            const stored = sessionStorage.getItem(
                              "numerology_current_result",
                            );
                            if (!stored) {
                              toast.error(
                                "Please enter a date of birth above or on the New tab first.",
                              );
                              return;
                            }
                          }
                          sessionStorage.setItem(
                            "numerology_prediction_type",
                            item.type,
                          );
                          navigate({ to: "/numerology/prediction" });
                        } else {
                          setActiveTab("compare");
                        }
                      }}
                      className="w-full rounded-lg p-5 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                      style={{
                        background: "oklch(var(--card))",
                        border: "1px solid oklch(var(--border))",
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-2xl shrink-0 mt-0.5">
                          {item.icon}
                        </span>
                        <div className="flex-1">
                          <p
                            className="font-display font-semibold text-base"
                            style={{ color: "oklch(var(--primary))" }}
                          >
                            {idx + 1}. {item.label}
                          </p>
                          <p
                            className="font-body text-sm mt-1"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            {item.desc}
                          </p>
                        </div>
                        <span
                          className="shrink-0 mt-1 opacity-40"
                          style={{ color: "oklch(var(--primary))" }}
                        >
                          →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>
          <TabsContent value="career" className="space-y-6 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CareerPrediction />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Month gate toast */}
      {showMonthGate && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-xl p-4 shadow-xl max-w-sm w-full mx-4 space-y-3"
          style={{
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
          }}
          data-ocid="vedic_month_gate.card"
        >
          <div className="flex items-center gap-2">
            <Lock
              className="w-4 h-4 shrink-0"
              style={{ color: "oklch(var(--primary))" }}
            />
            <p
              className="font-body text-sm font-semibold"
              style={{ color: "oklch(var(--foreground))" }}
            >
              Month charts require Paid access
            </p>
          </div>
          <p
            className="font-body text-xs"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Log in with a Paid or Advanced account to unlock month and day
            charts.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setShowMonthGate(false);
                openLoginModal(false);
              }}
              data-ocid="vedic_month_gate_login.primary_button"
              className="flex-1 font-body font-semibold text-xs"
              style={{
                background: "oklch(var(--primary))",
                color: "oklch(var(--primary-foreground))",
              }}
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" /> Login
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowMonthGate(false)}
              data-ocid="vedic_month_gate.cancel_button"
              className="font-body text-xs"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Save Chart Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent
          data-ocid="vedic_save_chart.dialog"
          style={{
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="font-display"
              style={{ color: "oklch(var(--primary))" }}
            >
              Save Chart
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label
              className="text-xs uppercase tracking-wider font-body"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Name
            </Label>
            <Input
              data-ocid="vedic_save_chart_name.input"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. John Doe"
              onKeyDown={(e) => e.key === "Enter" && handleSaveConfirm()}
              className="font-body"
              style={{
                background: "oklch(var(--input))",
                borderColor: "oklch(var(--border))",
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              data-ocid="vedic_save_chart.cancel_button"
              className="font-body"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveConfirm}
              disabled={!saveName.trim() || createChart.isPending}
              data-ocid="vedic_save_chart.confirm_button"
              className="font-body font-semibold"
              style={{
                background: "oklch(var(--primary))",
                color: "oklch(var(--primary-foreground))",
              }}
            >
              {createChart.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent
          data-ocid="vedic_login.dialog"
          style={{
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="font-display"
              style={{ color: "oklch(var(--primary))" }}
            >
              {loginIsAdmin ? "Admin Login" : "User Login"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label
                className="text-xs uppercase tracking-wider font-body"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                {loginIsAdmin ? "Email" : "Username"}
              </Label>
              <Input
                data-ocid="vedic_login_username.input"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder={loginIsAdmin ? "admin@email.com" : "username"}
                className="font-body"
                style={{
                  background: "oklch(var(--input))",
                  borderColor: "oklch(var(--border))",
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                className="text-xs uppercase tracking-wider font-body"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  data-ocid="vedic_login_password.input"
                  type={showLoginPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  onKeyDown={(e) => e.key === "Enter" && handleLoginSubmit()}
                  className="font-body pr-10"
                  style={{
                    background: "oklch(var(--input))",
                    borderColor: "oklch(var(--border))",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: "oklch(var(--muted-foreground))" }}
                  aria-label={
                    showLoginPassword ? "Hide password" : "Show password"
                  }
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {loginError && (
              <p
                className="text-xs font-body"
                style={{ color: "oklch(var(--destructive))" }}
              >
                {loginError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLoginOpen(false)}
              data-ocid="vedic_login.cancel_button"
              className="font-body"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLoginSubmit}
              disabled={loginUser.isPending}
              data-ocid="vedic_login.submit_button"
              className="font-body font-semibold"
              style={{
                background: "oklch(var(--primary))",
                color: "oklch(var(--primary-foreground))",
              }}
            >
              {loginUser.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Login"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
