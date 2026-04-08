import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  calculateNumerology,
  formatDOB,
  getMonthName,
} from "../utils/numerology";
import { NatalChart } from "./NatalChart";
import { YearScrollPicker } from "./YearScrollPicker";

interface PredictTabProps {
  onOpenLogin: () => void;
}

interface DOBState {
  day: string;
  month: string;
  year: string;
}

const NUMBER_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#22c55e",
  5: "#14b8a6",
  6: "#3b82f6",
  7: "#6366f1",
  8: "#a855f7",
  9: "#ec4899",
};

const NUMBER_PLANETS: Record<number, string> = {
  1: "Sun",
  2: "Moon",
  3: "Jupiter",
  4: "Rahu",
  5: "Mercury",
  6: "Venus",
  7: "Ketu",
  8: "Saturn",
  9: "Mars",
};

const NATURE_PREDICTIONS: Record<number, string> = {
  1: "Number 1 individuals are natural-born leaders with a strong sense of self-confidence and independence. They are driven by ambition, possess great willpower, and are often pioneers in their field. They have a magnetic personality and a desire to be first. However, they can be stubborn, dominating, and ego-driven. Their strength lies in their ability to initiate new projects and inspire others, but they must learn to collaborate and temper their pride.",
  2: "Number 2 individuals are gentle, intuitive, and deeply empathetic. They are the peacemakers of the numerological world, always seeking harmony and balance in relationships. They have a strong sense of diplomacy and are excellent at seeing multiple perspectives. Their sensitivity can sometimes make them indecisive or overly dependent on others' approval. Their greatest gift is their ability to nurture, support, and bring people together with grace and compassion.",
  3: "Number 3 individuals radiate joy, creativity, and self-expression. They are naturally gifted communicators, artists, and entertainers who bring light wherever they go. They possess a vivid imagination and an innate ability to inspire others through words, art, or performance. Their challenge lies in focus and follow-through, as they can scatter their energies. When they channel their creativity with discipline, they can achieve extraordinary things and uplift those around them.",
  4: "Number 4 individuals are the builders and organizers of the numerological spectrum. They are hardworking, disciplined, and highly reliable. They value structure, routine, and practical results. They have strong moral values and a deep sense of responsibility. While they can be overly rigid and resistant to change, their dedication and perseverance ensure lasting success. They are the foundation upon which great things are built, steady and trustworthy in all endeavors.",
  5: "Number 5 individuals are freedom-seekers, adventurers, and lovers of variety and change. They are highly adaptable, quick-witted, and magnetically charming. They thrive on new experiences, travel, and intellectual stimulation. Their restless nature can lead to impulsiveness and difficulty committing to long-term goals. However, their curiosity and versatility make them excellent at navigating change and inspiring others to embrace life's endless possibilities with enthusiasm and courage.",
  6: "Number 6 individuals are nurturers, healers, and protectors with a deep love for family and community. They carry a strong sense of responsibility and are drawn to service, art, and beauty. They are deeply compassionate and devoted, often placing others' needs above their own. Their challenge is to set healthy boundaries and avoid becoming overly controlling or self-sacrificing. Their natural warmth, generosity, and sense of justice make them pillars of strength for those around them.",
  7: "Number 7 individuals are the seekers of truth, wisdom, and inner understanding. They are deeply introspective, analytical, and spiritually inclined. They prefer solitude and quiet reflection over social gatherings, and they are often drawn to research, philosophy, or mysticism. They can appear reserved or mysterious, but beneath the surface lies a rich inner world. Their greatest strength is their depth of insight and their ability to uncover hidden truths that others overlook.",
  8: "Number 8 individuals are powerful, ambitious, and highly capable in the material world. They are natural executives with exceptional organizational skills and a strong drive for success, wealth, and authority. They understand the laws of cause and effect and can manifest great abundance when aligned with their purpose. Their challenges include a tendency toward workaholism, control, and materialism. When they balance ambition with compassion, they become unstoppable forces of positive transformation.",
  9: "Number 9 individuals are the humanitarians and idealists of the numerological world. They carry a deep compassion for all living beings and are driven by a desire to serve, heal, and uplift humanity. They are wise, generous, and possess a broad perspective on life. Their emotional depth can sometimes lead to disappointment when the world does not meet their high ideals. However, their selflessness, creativity, and spiritual insight make them powerful agents of change and healing.",
};

const CAREER_PREDICTIONS: Record<number, string> = {
  1: "Career-wise, Number 1 individuals excel in leadership roles and entrepreneurial ventures. They are born to be at the forefront — as CEOs, directors, founders, or heads of organizations. They thrive in environments where they can take initiative, make decisions, and chart their own course. Politics, management, military leadership, and innovation-driven industries are natural fits. Their challenge is to work harmoniously with teams rather than always insisting on having the final say.",
  2: "Number 2 individuals thrive in careers centered on collaboration, support, and human connection. They excel as counselors, therapists, social workers, diplomats, and mediators. They are also gifted in roles involving arts, music, and creative partnerships. Working behind the scenes or in a supportive capacity suits them well. Their sensitivity and intuition make them exceptional in any profession that requires emotional intelligence, patience, and the ability to truly listen and understand others.",
  3: "Number 3 individuals are naturally drawn to creative, communicative, and expressive careers. They excel as writers, actors, musicians, teachers, public speakers, journalists, and content creators. Any field that allows them to share their ideas and entertain or educate others is a perfect fit. Marketing, advertising, fashion, and media also align with their gifts. Their challenge is to maintain consistency and avoid spreading themselves too thin across too many creative projects simultaneously.",
  4: "Number 4 individuals are best suited for careers that require precision, structure, and long-term planning. They excel as engineers, architects, accountants, project managers, scientists, and administrators. Real estate, construction, finance, and law are also excellent fields for them. They are the most dependable employees or managers, and they build careers through hard work rather than shortcuts. Their dedication and methodical approach guarantee success when they commit fully to their professional goals.",
  5: "Number 5 individuals thrive in dynamic, fast-paced careers that offer variety, freedom, and constant change. They excel as salespeople, marketers, journalists, travel professionals, event planners, and entrepreneurs. Any career that allows them to meet new people, explore new places, and think on their feet is ideal. They struggle with routine and may change careers multiple times before finding their true calling. Once they align freedom with purpose, they become extraordinary forces of innovation and energy.",
  6: "Number 6 individuals are most fulfilled in careers centered on care, healing, and service to others. They excel as doctors, nurses, teachers, social workers, counselors, interior designers, and chefs. Professions in arts and beauty also resonate strongly. They are excellent at managing households, teams, or organizations where nurturing leadership is required. Their dedication to quality and their natural warmth make them beloved in any service-oriented field where human wellbeing is the central focus.",
  7: "Number 7 individuals excel in careers that demand deep analysis, research, and specialized knowledge. They are natural scientists, researchers, analysts, philosophers, psychologists, and spiritual teachers. Technology, data science, academia, and investigative journalism also suit them well. They work best independently or in quiet environments away from excessive social demands. Their gift for uncovering hidden patterns and thinking deeply makes them pioneers in their chosen fields when they trust their intuition alongside their intellect.",
  8: "Number 8 individuals are destined for careers in business, finance, law, and leadership. They excel as executives, entrepreneurs, bankers, investors, real estate developers, and corporate lawyers. Any field involving power, strategy, and large-scale resource management aligns with their natural strengths. They have exceptional instincts for timing and opportunity. Their challenge is to use their power ethically and generously. When they align financial ambition with a higher purpose, they create lasting impact and extraordinary wealth.",
  9: "Number 9 individuals are best suited for careers in healing, teaching, art, and humanitarian service. They excel as doctors, therapists, spiritual guides, social activists, writers, artists, and nonprofit leaders. International work and cross-cultural roles also resonate strongly with their broad vision. They are drawn to professions where they can make a tangible difference in people's lives. Their compassion, creativity, and wisdom make them exceptional leaders in any field dedicated to uplifting humanity and creating a more just world.",
};

function SectionHeader({
  title,
  description,
  open,
  onToggle,
}: {
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-start justify-between px-4 py-3 rounded-t-lg text-left"
      style={{ background: "#2E8B57" }}
    >
      <div className="flex-1 pr-2">
        <span className="font-display font-semibold text-sm tracking-wider text-white block">
          {title}
        </span>
        {description && (
          <span
            className="text-xs font-body mt-0.5 block"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {description}
          </span>
        )}
      </div>
      <div className="mt-0.5 flex-shrink-0">
        {open ? (
          <ChevronUp size={16} className="text-white" />
        ) : (
          <ChevronDown size={16} className="text-white" />
        )}
      </div>
    </button>
  );
}

function NumberCard({
  num,
  text,
  highlight,
  highlightLabel,
}: {
  num: number;
  text: string;
  highlight?: boolean;
  highlightLabel?: string;
}) {
  const color = NUMBER_COLORS[num];
  const planet = NUMBER_PLANETS[num];

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: highlight ? `2px solid ${color}` : "1px solid #e5e7eb",
        background: "white",
      }}
    >
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ background: highlight ? color : `${color}18` }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm text-white flex-shrink-0"
          style={{ background: color }}
        >
          {num}
        </div>
        <div>
          <span
            className="font-display font-semibold text-sm block"
            style={{ color: highlight ? "white" : color }}
          >
            Number {num} — {planet}
          </span>
          {highlight && highlightLabel && (
            <span
              className="text-xs font-body"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {highlightLabel}
            </span>
          )}
        </div>
      </div>
      <p
        className="p-3 text-sm font-body leading-relaxed"
        style={{ color: "#374151" }}
      >
        {text}
      </p>
    </div>
  );
}

function DOBForm({
  dob,
  setDob,
  onSubmit,
  buttonLabel = "Show Chart",
  ocidPrefix,
}: {
  dob: DOBState;
  setDob: (d: DOBState) => void;
  onSubmit: () => void;
  buttonLabel?: string;
  ocidPrefix: string;
}) {
  const [inputMode, setInputMode] = useState<"manual" | "calendar">("manual");
  const [calDate, setCalDate] = useState("");
  const mmRef = useRef<HTMLInputElement>(null);
  const yyyyRef = useRef<HTMLInputElement>(null);

  function applyCalendar(val: string) {
    setCalDate(val);
    if (val) {
      const [y, m, d] = val.split("-");
      setDob({ day: String(Number(d)), month: String(Number(m)), year: y });
    }
  }

  function handleDD(v: string) {
    const num = v.replace(/\D/g, "").slice(0, 2);
    setDob({ ...dob, day: num });
    if (num.length === 2) mmRef.current?.focus();
  }

  function handleMM(v: string) {
    const num = v.replace(/\D/g, "").slice(0, 2);
    setDob({ ...dob, month: num });
    if (num.length === 2) yyyyRef.current?.focus();
  }

  function handleYYYY(v: string) {
    setDob({ ...dob, year: v.replace(/\D/g, "").slice(0, 4) });
  }

  const isReady = !!dob.day && !!dob.month && !!dob.year;

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setInputMode("manual")}
          className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
          style={{
            background: inputMode === "manual" ? "#d4af37" : "#f5e9c4",
            color: inputMode === "manual" ? "#fff" : "#7a5c00",
            border: "none",
          }}
        >
          Manual
        </button>
        <button
          type="button"
          onClick={() => setInputMode("calendar")}
          className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
          style={{
            background: inputMode === "calendar" ? "#d4af37" : "#f5e9c4",
            color: inputMode === "calendar" ? "#fff" : "#7a5c00",
            border: "none",
          }}
        >
          Calendar
        </button>
      </div>

      {inputMode === "calendar" ? (
        <div className="space-y-1">
          <Label
            className="text-xs uppercase tracking-wider font-body"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Date of Birth
          </Label>
          <input
            type="date"
            data-ocid={`${ocidPrefix}.input`}
            value={calDate}
            onChange={(e) => applyCalendar(e.target.value)}
            className="w-full rounded-md px-3 py-2 text-sm border focus:outline-none"
            style={{
              borderColor: "#d4af37",
              background: "#fffdf5",
              color: "#3d2b00",
            }}
          />
        </div>
      ) : (
        <div className="space-y-1">
          <Label
            className="text-xs uppercase tracking-wider font-body"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Date of Birth (DD / MM / YYYY)
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="DD"
              maxLength={2}
              data-ocid={`${ocidPrefix}.input`}
              value={dob.day}
              onChange={(e) => handleDD(e.target.value)}
              className="w-14 rounded-md px-2 py-2 text-sm border text-center focus:outline-none"
              style={{
                borderColor: "#d4af37",
                background: "#fffdf5",
                color: "#3d2b00",
              }}
            />
            <span style={{ color: "#d4af37", fontWeight: 700 }}>/</span>
            <input
              ref={mmRef}
              type="text"
              inputMode="numeric"
              placeholder="MM"
              maxLength={2}
              value={dob.month}
              onChange={(e) => handleMM(e.target.value)}
              className="w-14 rounded-md px-2 py-2 text-sm border text-center focus:outline-none"
              style={{
                borderColor: "#d4af37",
                background: "#fffdf5",
                color: "#3d2b00",
              }}
            />
            <span style={{ color: "#d4af37", fontWeight: 700 }}>/</span>
            <input
              ref={yyyyRef}
              type="text"
              inputMode="numeric"
              placeholder="YYYY"
              maxLength={4}
              value={dob.year}
              onChange={(e) => handleYYYY(e.target.value)}
              className="w-20 rounded-md px-2 py-2 text-sm border text-center focus:outline-none"
              style={{
                borderColor: "#d4af37",
                background: "#fffdf5",
                color: "#3d2b00",
              }}
            />
          </div>
        </div>
      )}
      <Button
        data-ocid={`${ocidPrefix}.submit_button`}
        onClick={onSubmit}
        disabled={!isReady}
        className="w-full font-body font-semibold"
        style={{ background: "#2E8B57", color: "white" }}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

export function PredictTab({ onOpenLogin }: PredictTabProps) {
  const { auth } = useAuth();

  const [dob, setDob] = useState<DOBState>({ day: "", month: "", year: "" });
  const [result, setResult] = useState<ReturnType<
    typeof calculateNumerology
  > | null>(null);
  const [fromYear, setFromYear] = useState<string>("");
  const [toYear, setToYear] = useState<string>("");
  const [submittedRange, setSubmittedRange] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const [openSection, setOpenSection] = useState<number | null>(null);

  // Compare section
  const [dob1, setDob1] = useState<DOBState>({ day: "", month: "", year: "" });
  const [dob2, setDob2] = useState<DOBState>({ day: "", month: "", year: "" });
  const [compare1, setCompare1] = useState<ReturnType<
    typeof calculateNumerology
  > | null>(null);
  const [compare2, setCompare2] = useState<ReturnType<
    typeof calculateNumerology
  > | null>(null);

  function handleShowPrediction() {
    if (!dob.day || !dob.month || !dob.year) return;
    if (!fromYear || !toYear) return;
    const r = calculateNumerology(
      formatDOB(Number(dob.day), Number(dob.month), Number(dob.year)),
    );
    setResult(r);
    setSubmittedRange({ from: fromYear, to: toYear });
    setOpenSection(null);
  }

  function toggleSection(n: number) {
    setOpenSection((prev) => (prev === n ? null : n));
  }

  if (!auth) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-6"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "#e8f5e9" }}
        >
          <Lock size={36} style={{ color: "#2E8B57" }} />
        </div>
        <div className="space-y-2">
          <h2
            className="font-display text-xl font-bold"
            style={{ color: "#2E8B57" }}
          >
            Paid Service
          </h2>
          <p
            className="font-body text-sm"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            This is a paid service. Please use your admin-provided credentials
            to access detailed predictions.
          </p>
        </div>
        <Button
          data-ocid="predict_login.button"
          onClick={onOpenLogin}
          className="px-8 font-body font-semibold"
          style={{ background: "#2E8B57", color: "white" }}
        >
          Login to Access
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* DOB Form */}
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
        <DOBForm
          dob={dob}
          setDob={setDob}
          onSubmit={handleShowPrediction}
          buttonLabel="Show Prediction"
          ocidPrefix="predict_dob"
        />
        <div className="flex gap-3 items-end mt-3">
          <div className="flex-1 space-y-1">
            <label
              htmlFor="predict_from_year"
              className="text-xs uppercase tracking-wider font-body"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              From Year
            </label>
            <input
              id="predict_from_year"
              type="text"
              inputMode="numeric"
              placeholder="YYYY"
              maxLength={4}
              value={fromYear}
              onChange={(e) =>
                setFromYear(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              className="w-full rounded-md px-3 py-2 text-sm border focus:outline-none"
              style={{
                borderColor: "#d4af37",
                background: "#fffdf5",
                color: "#3d2b00",
              }}
            />
          </div>
          <div className="flex-1 space-y-1">
            <label
              htmlFor="predict_to_year"
              className="text-xs uppercase tracking-wider font-body"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              To Year
            </label>
            <input
              id="predict_to_year"
              type="text"
              inputMode="numeric"
              placeholder="YYYY"
              maxLength={4}
              value={toYear}
              onChange={(e) =>
                setToYear(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              className="w-full rounded-md px-3 py-2 text-sm border focus:outline-none"
              style={{
                borderColor: "#d4af37",
                background: "#fffdf5",
                color: "#3d2b00",
              }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            key="predict-results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            {/* Year range info */}
            {submittedRange && (
              <div
                className="text-sm px-4 py-2 rounded-lg text-center font-body"
                style={{
                  background: "#fffdf5",
                  border: "1px solid #d4af37",
                  color: "#7a5c00",
                }}
              >
                Showing predictions for {submittedRange.from} to{" "}
                {submittedRange.to}
              </div>
            )}
            {/* Number pills */}
            <div className="flex gap-3 justify-center">
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-display text-2xl font-bold text-white mx-auto"
                  style={{ background: NUMBER_COLORS[result.basicNumber] }}
                >
                  {result.basicNumber}
                </div>
                <p
                  className="text-xs font-body mt-1"
                  style={{ color: "oklch(var(--muted-foreground))" }}
                >
                  Basic
                </p>
              </div>
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-display text-2xl font-bold text-white mx-auto"
                  style={{ background: NUMBER_COLORS[result.destinyNumber] }}
                >
                  {result.destinyNumber}
                </div>
                <p
                  className="text-xs font-body mt-1"
                  style={{ color: "oklch(var(--muted-foreground))" }}
                >
                  Destiny
                </p>
              </div>
            </div>

            {/* Natal Chart */}
            <NatalChart
              cellCounts={result.cellCounts}
              basicNumber={result.basicNumber}
              destinyNumber={result.destinyNumber}
              animate={true}
            />

            {/* 4 sections in 2x2 grid on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Section 1: Nature */}
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid #2E8B57" }}
              >
                <SectionHeader
                  title="1. NATURE PREDICTION"
                  description="Personality traits and nature analysis based on your numerology numbers"
                  open={openSection === 1}
                  onToggle={() => toggleSection(1)}
                />
                <AnimatePresence>
                  {openSection === 1 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="p-3 space-y-3"
                        style={{ background: "#f9fafb" }}
                      >
                        {Object.entries(NATURE_PREDICTIONS).map(([n, text]) => (
                          <NumberCard
                            key={n}
                            num={Number(n)}
                            text={text}
                            highlight={Number(n) === result.basicNumber}
                            highlightLabel={
                              Number(n) === result.basicNumber
                                ? "Your Basic Number"
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Section 2: Career */}
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid #2E8B57" }}
              >
                <SectionHeader
                  title="2. CAREER PREDICTION"
                  description="Career guidance and professional strengths based on your destiny number"
                  open={openSection === 2}
                  onToggle={() => toggleSection(2)}
                />
                <AnimatePresence>
                  {openSection === 2 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="p-3 space-y-3"
                        style={{ background: "#f9fafb" }}
                      >
                        {Object.entries(CAREER_PREDICTIONS).map(([n, text]) => (
                          <NumberCard
                            key={n}
                            num={Number(n)}
                            text={text}
                            highlight={Number(n) === result.destinyNumber}
                            highlightLabel={
                              Number(n) === result.destinyNumber
                                ? "Your Destiny Number"
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Section 3: Nature + Career */}
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid #2E8B57" }}
              >
                <SectionHeader
                  title="3. NATURE + CAREER PREDICTION"
                  description="Combined analysis of your personality and career path for your specific numbers"
                  open={openSection === 3}
                  onToggle={() => toggleSection(3)}
                />
                <AnimatePresence>
                  {openSection === 3 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3" style={{ background: "#f9fafb" }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Nature card */}
                          <div
                            className="rounded-lg overflow-hidden"
                            style={{
                              border: `2px solid ${NUMBER_COLORS[result.basicNumber]}`,
                              background: "white",
                            }}
                          >
                            <div
                              className="px-3 py-2 flex items-center gap-2"
                              style={{
                                background: NUMBER_COLORS[result.basicNumber],
                              }}
                            >
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-sm text-white flex-shrink-0"
                                style={{ background: "rgba(255,255,255,0.25)" }}
                              >
                                {result.basicNumber}
                              </div>
                              <div>
                                <p className="font-display font-bold text-white text-sm">
                                  Your Nature
                                </p>
                                <p
                                  className="text-xs"
                                  style={{ color: "rgba(255,255,255,0.8)" }}
                                >
                                  Basic Number {result.basicNumber} —{" "}
                                  {NUMBER_PLANETS[result.basicNumber]}
                                </p>
                              </div>
                            </div>
                            <p
                              className="p-3 text-sm font-body leading-relaxed"
                              style={{ color: "#374151" }}
                            >
                              {NATURE_PREDICTIONS[result.basicNumber]}
                            </p>
                          </div>
                          {/* Career card */}
                          <div
                            className="rounded-lg overflow-hidden"
                            style={{
                              border: `2px solid ${NUMBER_COLORS[result.destinyNumber]}`,
                              background: "white",
                            }}
                          >
                            <div
                              className="px-3 py-2 flex items-center gap-2"
                              style={{
                                background: NUMBER_COLORS[result.destinyNumber],
                              }}
                            >
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-sm text-white flex-shrink-0"
                                style={{ background: "rgba(255,255,255,0.25)" }}
                              >
                                {result.destinyNumber}
                              </div>
                              <div>
                                <p className="font-display font-bold text-white text-sm">
                                  Your Career
                                </p>
                                <p
                                  className="text-xs"
                                  style={{ color: "rgba(255,255,255,0.8)" }}
                                >
                                  Destiny Number {result.destinyNumber} —{" "}
                                  {NUMBER_PLANETS[result.destinyNumber]}
                                </p>
                              </div>
                            </div>
                            <p
                              className="p-3 text-sm font-body leading-relaxed"
                              style={{ color: "#374151" }}
                            >
                              {CAREER_PREDICTIONS[result.destinyNumber]}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Section 4: Compare */}
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid #2E8B57" }}
              >
                <SectionHeader
                  title="4. COMPARE CHARTS"
                  description="Compare two natal charts side by side to analyze compatibility"
                  open={openSection === 4}
                  onToggle={() => toggleSection(4)}
                />
                <AnimatePresence>
                  {openSection === 4 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="p-3 space-y-4"
                        style={{ background: "#f9fafb" }}
                      >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {/* Chart 1 */}
                          <div
                            className="rounded-lg p-3 space-y-3"
                            style={{
                              background: "white",
                              border: "1px solid oklch(var(--border))",
                            }}
                          >
                            <h4
                              className="font-display font-semibold text-sm"
                              style={{ color: "#2E8B57" }}
                            >
                              Person 1
                            </h4>
                            <DOBForm
                              dob={dob1}
                              setDob={setDob1}
                              onSubmit={() => {
                                if (!dob1.day || !dob1.month || !dob1.year)
                                  return;
                                setCompare1(
                                  calculateNumerology(
                                    formatDOB(
                                      Number(dob1.day),
                                      Number(dob1.month),
                                      Number(dob1.year),
                                    ),
                                  ),
                                );
                              }}
                              ocidPrefix="predict_compare1"
                            />
                            {compare1 && (
                              <NatalChart
                                cellCounts={compare1.cellCounts}
                                basicNumber={compare1.basicNumber}
                                destinyNumber={compare1.destinyNumber}
                                compact={true}
                              />
                            )}
                          </div>
                          {/* Chart 2 */}
                          <div
                            className="rounded-lg p-3 space-y-3"
                            style={{
                              background: "white",
                              border: "1px solid oklch(var(--border))",
                            }}
                          >
                            <h4
                              className="font-display font-semibold text-sm"
                              style={{ color: "#2E8B57" }}
                            >
                              Person 2
                            </h4>
                            <DOBForm
                              dob={dob2}
                              setDob={setDob2}
                              onSubmit={() => {
                                if (!dob2.day || !dob2.month || !dob2.year)
                                  return;
                                setCompare2(
                                  calculateNumerology(
                                    formatDOB(
                                      Number(dob2.day),
                                      Number(dob2.month),
                                      Number(dob2.year),
                                    ),
                                  ),
                                );
                              }}
                              ocidPrefix="predict_compare2"
                            />
                            {compare2 && (
                              <NatalChart
                                cellCounts={compare2.cellCounts}
                                basicNumber={compare2.basicNumber}
                                destinyNumber={compare2.destinyNumber}
                                compact={true}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
