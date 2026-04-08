import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { NatalChart } from "../components/NatalChart";
import PredictionPanel from "../components/PredictionPanel";
import { YearScrollPicker } from "../components/YearScrollPicker";
import { AuthProvider } from "../contexts/AuthContext";
import { NUMBER_TRAITS } from "../utils/numberTraits";
import {
  type NumerologyResult,
  calculateNumerology,
  formatDOB,
  getMonthName,
  validateDOB,
} from "../utils/numerology";

const NUMBER_CAREER: Record<number, string> = {
  1: "Natural leaders and entrepreneurs. Excel in management, politics, executive roles, and any position requiring initiative and authority. Best when working independently or leading teams.",
  2: "Born diplomats and counselors. Thrive in psychology, nursing, HR, social work, teaching, and relationship management. Sensitive nature makes them excellent mediators.",
  3: "Excellent communicators and planners. Suited for law, consulting, financial planning, judiciary, and education. Decision-making skills make them strong advisors.",
  4: "Hard workers and researchers. Ideal for IT, engineering, research, data analysis, and project management. Depth of study makes them experts in their field.",
  5: "Sales and finance specialists. Excel in trading, banking, marketing, negotiations, and money management. Highly routinized nature brings consistency.",
  6: "Creative and presentation-focused. Thrive in fashion, culinary arts, interior design, modeling, entertainment, hospitality, and beauty industries.",
  7: "Analysts and strategists. Excel in research, academia, foreign trade, import/export, consulting, and any role requiring logic and deep investigation.",
  8: "Hard workers who fight for justice. Well-suited for law, social activism, government service, medicine, and entrepreneurship. Excel despite struggles.",
  9: "Bold and energetic professionals. Ideal for military, police, sports, fitness training, surgery, and leadership roles requiring courage and decisiveness.",
};

type PredType = "basic" | "advance" | "career" | "compare";

interface DOBState {
  day: string;
  month: string;
  year: string;
}

function InlineDOBForm({
  onResult,
}: { onResult: (r: NumerologyResult) => void }) {
  const [dob, setDob] = useState<DOBState>({ day: "", month: "", year: "" });
  const [error, setError] = useState<string | null>(null);

  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  function handleGenerate() {
    const d = Number.parseInt(dob.day, 10);
    const m = Number.parseInt(dob.month, 10);
    const y = Number.parseInt(dob.year, 10);
    if (!dob.day || !dob.month || !dob.year) {
      setError("Please select your day, month, and year.");
      return;
    }
    const err = validateDOB(d, m, y);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    const result = calculateNumerology(formatDOB(d, m, y));
    try {
      sessionStorage.setItem(
        "numerology_current_result",
        JSON.stringify(result),
      );
    } catch {
      /* ignore */
    }
    onResult(result);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div
        className="rounded-xl p-5 space-y-4"
        style={{
          background: "oklch(var(--card))",
          border: "1px solid oklch(var(--border))",
        }}
      >
        <div className="text-center space-y-1">
          <p className="text-2xl">🔢</p>
          <h2
            className="font-display text-base font-bold"
            style={{ color: "oklch(var(--primary))" }}
          >
            Enter Your Date of Birth
          </h2>
          <p
            className="font-body text-sm"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Fill in your DOB to generate your Natal Chart and view this
            prediction.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <p
              className="text-xs font-body mb-1"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Day
            </p>
            <select
              data-ocid="prediction_detail.select"
              value={dob.day}
              onChange={(e) => setDob({ ...dob, day: e.target.value })}
              className="w-full h-10 px-2 rounded-md text-sm font-body appearance-none cursor-pointer"
              style={{
                background: "oklch(var(--input))",
                border: "1px solid oklch(var(--border))",
                color: dob.day
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
          <div>
            <p
              className="text-xs font-body mb-1"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Month
            </p>
            <select
              value={dob.month}
              onChange={(e) => setDob({ ...dob, month: e.target.value })}
              className="w-full h-10 px-2 rounded-md text-sm font-body appearance-none cursor-pointer"
              style={{
                background: "oklch(var(--input))",
                border: "1px solid oklch(var(--border))",
                color: dob.month
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
          <div>
            <p
              className="text-xs font-body mb-1"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Year
            </p>
            <YearScrollPicker
              value={dob.year}
              onChange={(v) => setDob({ ...dob, year: v })}
            />
          </div>
        </div>

        {error && (
          <p
            className="text-xs font-body"
            data-ocid="prediction_detail.error_state"
            style={{ color: "oklch(var(--destructive))" }}
          >
            {error}
          </p>
        )}

        <Button
          onClick={handleGenerate}
          data-ocid="prediction_detail.primary_button"
          className="w-full font-body font-semibold"
          style={{
            background: "oklch(var(--primary))",
            color: "oklch(var(--primary-foreground))",
          }}
        >
          Generate &amp; View Prediction
        </Button>
      </div>
    </motion.div>
  );
}

function CompareView() {
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
  const [p1Result, setP1Result] = useState<NumerologyResult | null>(null);
  const [p2Result, setP2Result] = useState<NumerologyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState(false);

  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  function handleCompare() {
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
      setError("Please fill in both dates of birth.");
      return;
    }
    const e1 = validateDOB(d1, m1, y1);
    const e2 = validateDOB(d2, m2, y2);
    if (e1 || e2) {
      setError(e1 || e2 || "Invalid date.");
      return;
    }
    setError(null);
    setP1Result(calculateNumerology(formatDOB(d1, m1, y1)));
    setP2Result(calculateNumerology(formatDOB(d2, m2, y2)));
    setShown(true);
  }

  function getCompatibilityNote(
    r1: NumerologyResult,
    r2: NumerologyResult,
  ): string {
    const same = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
      (n) => r1.cellCounts[n] > 0 && r2.cellCounts[n] > 0,
    );
    const clash = Math.abs(r1.basicNumber - r2.basicNumber);
    let note = "";
    if (same.length >= 3)
      note += `Strong common ground — both share numbers ${same.join(", ")}. `;
    if (r1.destinyNumber === r2.destinyNumber)
      note += "Same Destiny number creates a deep karmic bond. ";
    if (clash === 0)
      note +=
        "Identical Basic numbers — mirror personalities, easy understanding.";
    else if (clash <= 2)
      note += "Close Basic numbers — harmonious energy and compatible goals.";
    else
      note +=
        "Different Basic numbers — complementary strengths, may need extra communication.";
    return (
      note ||
      "Unique combination — explore each other's charts for deeper insight."
    );
  }

  function DOBForm({
    label,
    dob,
    setDob,
    ocidPrefix,
  }: {
    label: string;
    dob: DOBState;
    setDob: (d: DOBState) => void;
    ocidPrefix: string;
  }) {
    return (
      <div
        className="rounded-lg p-4 space-y-3"
        style={{
          background: "oklch(var(--card))",
          border: "1px solid oklch(var(--border))",
        }}
      >
        <h3
          className="font-display text-base font-bold"
          style={{ color: "oklch(var(--primary))" }}
        >
          {label}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p
              className="text-xs font-body mb-1"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Day
            </p>
            <select
              data-ocid={`${ocidPrefix}.select`}
              value={dob.day}
              onChange={(e) => setDob({ ...dob, day: e.target.value })}
              className="w-full h-9 px-2 rounded-md text-sm font-body appearance-none cursor-pointer"
              style={{
                background: "oklch(var(--input))",
                border: "1px solid oklch(var(--border))",
                color: dob.day
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
          <div>
            <p
              className="text-xs font-body mb-1"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Month
            </p>
            <select
              value={dob.month}
              onChange={(e) => setDob({ ...dob, month: e.target.value })}
              className="w-full h-9 px-2 rounded-md text-sm font-body appearance-none cursor-pointer"
              style={{
                background: "oklch(var(--input))",
                border: "1px solid oklch(var(--border))",
                color: dob.month
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
          <div>
            <p
              className="text-xs font-body mb-1"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Year
            </p>
            <YearScrollPicker
              value={dob.year}
              onChange={(v) => setDob({ ...dob, year: v })}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DOBForm
        label="Person 1"
        dob={p1Dob}
        setDob={setP1Dob}
        ocidPrefix="compare_p1"
      />
      <DOBForm
        label="Person 2"
        dob={p2Dob}
        setDob={setP2Dob}
        ocidPrefix="compare_p2"
      />
      {error && (
        <p
          className="text-xs font-body"
          style={{ color: "oklch(var(--destructive))" }}
          data-ocid="compare.error_state"
        >
          {error}
        </p>
      )}
      <Button
        onClick={handleCompare}
        data-ocid="compare.primary_button"
        className="w-full font-body font-semibold"
        style={{
          background: "oklch(var(--primary))",
          color: "oklch(var(--primary-foreground))",
        }}
      >
        Compare Charts
      </Button>

      {shown && p1Result && p2Result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div
            className="rounded-xl p-4"
            style={{
              background: "oklch(0.95 0.04 280)",
              border: "1px solid oklch(0.82 0.08 280)",
            }}
          >
            <h3
              className="font-display text-sm font-bold mb-1"
              style={{ color: "#6366f1" }}
            >
              Compatibility Insight
            </h3>
            <p
              className="font-body text-sm"
              style={{ color: "oklch(var(--foreground))" }}
            >
              {getCompatibilityNote(p1Result, p2Result)}
            </p>
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Person 1", r: p1Result },
              { label: "Person 2", r: p2Result },
            ].map(({ label, r }) => {
              const nums = Object.entries(r.cellCounts)
                .filter(([, c]) => c > 0)
                .map(([n]) => Number(n));
              return (
                <div
                  key={`traits_${label}`}
                  className="rounded-lg p-3 space-y-2"
                  style={{
                    background: "oklch(var(--card))",
                    border: "1px solid oklch(var(--border))",
                  }}
                >
                  <h3
                    className="font-display text-xs font-semibold"
                    style={{ color: "oklch(var(--primary))" }}
                  >
                    {label} — Key Traits
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {nums.map((n) => (
                      <span
                        key={n}
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: "oklch(var(--secondary))",
                          color: "oklch(var(--foreground))",
                        }}
                      >
                        #{n}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function CareerView({ result }: { result: NumerologyResult }) {
  const nums = Object.entries(result.cellCounts)
    .filter(([, c]) => c > 0)
    .map(([n]) => Number(n));

  // Build combined nature paragraph
  const natureParagraph = nums
    .map((n) => {
      const traitData = NUMBER_TRAITS[n];
      if (!traitData) return null;
      const count = result.cellCounts[n] ?? 1;
      const useMultiple = traitData.multipleCondition(count);
      const traits = useMultiple ? traitData.multiple.EN : traitData.single.EN;
      return `Number ${n}: ${traits.slice(0, 4).join(", ")}.`;
    })
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-3">
      <NatalChart
        cellCounts={result.cellCounts}
        basicNumber={result.basicNumber}
        destinyNumber={result.destinyNumber}
        animate={false}
        compact={true}
        hideHeader={true}
      />
      <div
        className="rounded-lg p-4 flex items-center gap-6 justify-center"
        style={{
          background: "oklch(var(--card))",
          border: "1px solid oklch(var(--border))",
        }}
      >
        <div className="text-center">
          <p
            className="text-xs font-body"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Basic
          </p>
          <p
            className="font-display text-2xl font-bold"
            style={{ color: "#dc2626" }}
          >
            {result.basicNumber}
          </p>
        </div>
        <div
          className="w-px h-8"
          style={{ background: "oklch(var(--border))" }}
        />
        <div className="text-center">
          <p
            className="text-xs font-body"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Destiny
          </p>
          <p
            className="font-display text-2xl font-bold"
            style={{ color: "#eab308" }}
          >
            {result.destinyNumber}
          </p>
        </div>
      </div>

      {/* Combined Nature Profile */}
      {natureParagraph && (
        <div
          className="rounded-xl p-4 space-y-2"
          style={{
            background: "oklch(0.96 0.04 75)",
            border: "1px solid oklch(0.88 0.08 75)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🌟</span>
            <h3
              className="font-display text-sm font-bold"
              style={{ color: "oklch(0.55 0.12 75)" }}
            >
              Combined Nature Profile
            </h3>
          </div>
          <p
            className="font-body text-sm leading-relaxed"
            style={{ color: "oklch(0.35 0.08 75)" }}
          >
            {natureParagraph}
          </p>
        </div>
      )}

      {nums.map((n) => (
        <div
          key={n}
          className="rounded-xl p-4 space-y-2"
          style={{
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="font-display text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ background: `hsl(${n * 40}, 60%, 50%)` }}
            >
              {n}
            </span>
            <h3
              className="font-display text-sm font-bold"
              style={{ color: "oklch(var(--foreground))" }}
            >
              Career for Number {n}
            </h3>
          </div>
          <p
            className="font-body text-sm leading-relaxed"
            style={{ color: "oklch(var(--foreground))" }}
          >
            {NUMBER_CAREER[n] ??
              "Unique combination — versatile career options across many fields."}
          </p>
        </div>
      ))}
    </div>
  );
}

function PredictionDetailInner() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { type?: string };
  const predType = (params.type ?? "basic") as PredType;

  const [storedResult, setStoredResult] = useState<NumerologyResult | null>(
    null,
  );

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("numerology_current_result");
      if (raw) setStoredResult(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const titles: Record<PredType, string> = {
    basic: "🌱 Basic Nature",
    advance: "🔮 Advance Nature Prediction",
    career: "💼 Nature + Career Prediction",
    compare: "⚖️ Compare Charts",
  };

  function renderContent() {
    if (predType === "compare") {
      return <CompareView />;
    }
    // Always show DOB form at top; prediction appears below after DOB is filled
    return (
      <div className="space-y-4">
        <InlineDOBForm onResult={setStoredResult} />
        {storedResult && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <NatalChart
              cellCounts={storedResult.cellCounts}
              basicNumber={storedResult.basicNumber}
              destinyNumber={storedResult.destinyNumber}
              animate={false}
              compact={true}
              hideHeader={true}
            />
            {predType === "career" ? (
              <CareerView result={storedResult} />
            ) : (
              <PredictionPanel
                cellCounts={storedResult.cellCounts}
                basicNumber={storedResult.basicNumber}
                destinyNumber={storedResult.destinyNumber}
              />
            )}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(var(--background))" }}
    >
      {/* Toolbar */}
      <header
        className="px-4 py-3 flex items-center gap-3"
        style={{
          background: "oklch(var(--card))",
          borderBottom: "1px solid oklch(var(--border))",
        }}
      >
        <button
          type="button"
          data-ocid="prediction_detail.secondary_button"
          onClick={() => navigate({ to: "/numerology/prediction" })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-body font-semibold transition-colors"
          style={{
            background: "oklch(var(--secondary))",
            color: "oklch(var(--muted-foreground))",
            border: "1px solid oklch(var(--border))",
          }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1
          className="font-display text-base font-bold truncate"
          style={{ color: "oklch(var(--primary))" }}
        >
          {titles[predType]}
        </h1>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {renderContent()}
      </main>
    </div>
  );
}

export default function PredictionDetailPage() {
  return (
    <AuthProvider>
      <PredictionDetailInner />
    </AuthProvider>
  );
}
