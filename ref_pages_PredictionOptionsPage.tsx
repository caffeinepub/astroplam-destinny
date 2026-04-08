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
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Lock, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { useLoginUser } from "../hooks/useVedicQueries";
import type { NumerologyResult } from "../utils/numerology";

const PREDICTION_TYPES = [
  {
    id: "basic",
    title: "Basic Nature",
    icon: "🌱",
    desc: "Understand your core personality traits from the numbers in your Natal chart.",
    minLevel: 1,
    color: "#22c55e",
    bg: "oklch(0.95 0.05 150)",
  },
  {
    id: "advance",
    title: "Advance Nature Prediction",
    icon: "🔮",
    desc: "Deep dive into your character — relationships, emotions, and hidden tendencies.",
    minLevel: 2,
    color: "#6366f1",
    bg: "oklch(0.95 0.04 280)",
  },
  {
    id: "career",
    title: "Nature + Career Prediction",
    icon: "💼",
    desc: "Discover your ideal career path and professional strengths through numerology.",
    minLevel: 3,
    color: "#f59e0b",
    bg: "oklch(0.96 0.06 85)",
  },
  {
    id: "compare",
    title: "Compare Charts",
    icon: "⚖️",
    desc: "Compare two people's charts side-by-side to reveal compatibility and dynamics.",
    minLevel: 4,
    color: "#ef4444",
    bg: "oklch(0.96 0.04 25)",
  },
];

function PredictionOptionsInner() {
  const navigate = useNavigate();
  const { sectionLevel, login, auth } = useAuth();
  const loginUser = useLoginUser();
  const [storedResult, setStoredResult] = useState<NumerologyResult | null>(
    null,
  );

  const [loginOpen, setLoginOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pendingNavType, setPendingNavType] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("numerology_current_result");
      if (raw) setStoredResult(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // After login, navigate to pending prediction
  useEffect(() => {
    if (auth && pendingNavType && sectionLevel >= 1) {
      const pt = PREDICTION_TYPES.find((p) => p.id === pendingNavType);
      if (pt && sectionLevel >= pt.minLevel) {
        setLoginOpen(false);
        setPendingNavType(null);
        navigate({ to: `/numerology/prediction/${pendingNavType}` });
      }
    }
  }, [auth, sectionLevel, pendingNavType, navigate]);

  const freeAccessEmail = localStorage.getItem("numerology_free_email");
  const freeAccessUsed =
    localStorage.getItem("numerology_free_used") === "true";
  const sessionFreeGranted =
    sessionStorage.getItem("numerology_free_granted") === "true";
  const effectiveLevel =
    sectionLevel > 0
      ? sectionLevel
      : freeAccessEmail && !freeAccessUsed
        ? 1
        : sessionFreeGranted
          ? 1
          : 0;

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    try {
      const level = await loginUser.mutateAsync({
        username: loginUsername,
        password: loginPassword,
      });
      login(loginUsername, level);
      setLoginOpen(false);
      if (pendingNavType) {
        navigate({ to: `/numerology/prediction/${pendingNavType}` });
        setPendingNavType(null);
      }
    } catch {
      setLoginError("Invalid username or password.");
    }
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
          data-ocid="prediction_options.secondary_button"
          onClick={() => navigate({ to: "/numerology" })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-body font-semibold transition-colors"
          style={{
            background: "oklch(var(--secondary))",
            color: "oklch(var(--muted-foreground))",
            border: "1px solid oklch(var(--border))",
          }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Numerology
        </button>
        <h1
          className="font-display text-lg font-bold"
          style={{ color: "oklch(var(--primary))" }}
        >
          ✨ Predictions
        </h1>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {storedResult && (
          <div
            className="rounded-lg p-3 mb-5 flex items-center gap-6 justify-center"
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
                {storedResult.basicNumber}
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
                {storedResult.destinyNumber}
              </p>
            </div>
          </div>
        )}

        <p
          className="font-body text-sm mb-1 text-center"
          style={{ color: "oklch(var(--muted-foreground))" }}
        >
          Choose a prediction type below. Locked sections require admin access.
        </p>
        <p
          className="font-body text-xs mb-5 text-center"
          style={{ color: "oklch(var(--muted-foreground))", opacity: 0.75 }}
        >
          💡 You can enter your date of birth directly on any prediction page.
        </p>

        <div className="space-y-3">
          <AnimatePresence>
            {PREDICTION_TYPES.map((pt, idx) => {
              const hasAccess = effectiveLevel >= pt.minLevel;
              return (
                <motion.div
                  key={pt.id}
                  data-ocid={`prediction_options.item.${idx + 1}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  onClick={() => {
                    if (hasAccess) {
                      navigate({ to: `/numerology/prediction/${pt.id}` });
                    } else {
                      setPendingNavType(pt.id);
                      setLoginUsername("");
                      setLoginPassword("");
                      setLoginError(null);
                      setLoginOpen(true);
                    }
                  }}
                  className="rounded-xl p-5 flex items-start gap-4 transition-all cursor-pointer"
                  style={{
                    background: hasAccess ? pt.bg : "oklch(var(--card))",
                    border: `1px solid ${hasAccess ? `${pt.color}40` : "oklch(var(--border))"}`,
                    opacity: 1,
                  }}
                >
                  <span className="text-3xl shrink-0 mt-0.5">{pt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="font-display font-bold text-base"
                        style={{
                          color: hasAccess
                            ? pt.color
                            : "oklch(var(--muted-foreground))",
                        }}
                      >
                        {pt.title}
                      </h3>
                      {!hasAccess && (
                        <Lock
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: "oklch(var(--muted-foreground))" }}
                        />
                      )}
                      {hasAccess && (
                        <Sparkles
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: pt.color }}
                        />
                      )}
                    </div>
                    <p
                      className="font-body text-sm"
                      style={{
                        color: hasAccess
                          ? "oklch(var(--foreground))"
                          : "oklch(var(--muted-foreground))",
                      }}
                    >
                      {pt.desc}
                    </p>
                    {!hasAccess && (
                      <p
                        className="font-body text-xs mt-1.5 font-medium"
                        style={{ color: "oklch(var(--muted-foreground))" }}
                      >
                        🔒 Tap to log in and unlock
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {effectiveLevel === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 rounded-xl p-4 text-center space-y-3"
            style={{
              background: "oklch(var(--card))",
              border: "1px solid oklch(var(--border))",
            }}
          >
            <p
              className="font-body text-sm font-semibold"
              style={{ color: "oklch(var(--foreground))" }}
            >
              Need access? Tap any prediction tile to log in.
            </p>
          </motion.div>
        )}
      </main>

      {/* Login Dialog */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent
          className="max-w-sm"
          data-ocid="prediction_options.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              User Login
            </DialogTitle>
            <p
              className="font-body text-sm"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Enter credentials provided by admin
            </p>
          </DialogHeader>
          <form onSubmit={handleLoginSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="login-username"
                className="font-body text-xs uppercase tracking-wider"
              >
                Username / ID
              </Label>
              <Input
                id="login-username"
                data-ocid="prediction_options.input"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="login-password"
                className="font-body text-xs uppercase tracking-wider"
              >
                Password
              </Label>
              <Input
                id="login-password"
                data-ocid="prediction_options.input"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
            {loginError && (
              <p
                className="font-body text-sm"
                data-ocid="prediction_options.error_state"
                style={{ color: "#ef4444" }}
              >
                {loginError}
              </p>
            )}
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                data-ocid="prediction_options.cancel_button"
                onClick={() => setLoginOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="prediction_options.submit_button"
                disabled={loginUser.isPending}
                style={{
                  background: "oklch(var(--primary))",
                  color: "oklch(var(--primary-foreground))",
                }}
              >
                {loginUser.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Log In"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PredictionOptionsPage() {
  return (
    <AuthProvider>
      <PredictionOptionsInner />
    </AuthProvider>
  );
}
