import DashaSection from "@/components/DashaSection";
import EventAnalysis from "@/components/EventAnalysis";
import NadiNumbers from "@/components/NadiNumbers";
import NorthIndianChart from "@/components/NorthIndianChart";
import ServiceGateModal from "@/components/ServiceGateModal";
import ServiceNavBar from "@/components/ServiceNavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type ChartResult,
  calculateHoraryChart,
  calculateNadiNumbers,
  formatDeg,
  getSeedEntry,
} from "@/lib/kpEngine";
import { reviveChartResult } from "@/lib/reviveChart";
import { hasServiceAccess } from "@/utils/visitorSession";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MapPin, Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function HoraryPage() {
  const navigate = useNavigate();

  const [showGate, setShowGate] = useState(false);
  const [horaryForm, setHoraryForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem("horary_form");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      place: "",
      lat: "",
      lon: "",
      tz: "5.5",
      seed: "15",
    };
  });
  const [horaryResult, setHoraryResult] = useState<ChartResult | null>(() => {
    try {
      const saved = sessionStorage.getItem("horary_result");
      if (saved) return reviveChartResult(JSON.parse(saved));
    } catch {
      // ignore
    }
    return null;
  });
  const [horaryLabelMode, setHoraryLabelMode] = useState<"english" | "hindi">(
    "english",
  );
  const [isHoraryCalc, setIsHoraryCalc] = useState(false);
  const [isHoraryGeocoding, setIsHoraryGeocoding] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem("horary_form", JSON.stringify(horaryForm));
    } catch {
      // ignore
    }
  }, [horaryForm]);

  useEffect(() => {
    try {
      if (horaryResult) {
        sessionStorage.setItem("horary_result", JSON.stringify(horaryResult));
      } else {
        sessionStorage.removeItem("horary_result");
      }
    } catch {
      // ignore
    }
  }, [horaryResult]);
  const updateHoraryForm = (field: string, val: string) =>
    setHoraryForm((prev) => ({ ...prev, [field]: val }));

  const handleHoraryGeocode = async () => {
    if (!horaryForm.place.trim()) return;
    setIsHoraryGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(horaryForm.place)}&format=json&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        updateHoraryForm("lat", Number.parseFloat(data[0].lat).toFixed(4));
        updateHoraryForm("lon", Number.parseFloat(data[0].lon).toFixed(4));
        toast.success(
          `Location found: ${data[0].display_name.split(",").slice(0, 2).join(",")}`,
        );
      } else {
        toast.error("Location not found. Try a different place name.");
      }
    } catch {
      toast.error("Geocoding failed. Please enter coordinates manually.");
    } finally {
      setIsHoraryGeocoding(false);
    }
  };

  const handleHoraryCalculate = () => {
    if (!hasServiceAccess("horary")) {
      setShowGate(true);
      return;
    }
    try {
      setIsHoraryCalc(true);
      const [y, m, d] = horaryForm.date.split("-").map(Number);
      const [hr, min] = horaryForm.time.split(":").map(Number);
      const lat = Number.parseFloat(horaryForm.lat);
      const lon = Number.parseFloat(horaryForm.lon);
      const tz = Number.parseFloat(horaryForm.tz);
      const seed = Number.parseInt(horaryForm.seed, 10);

      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        toast.error("Please enter valid coordinates or use location lookup.");
        setIsHoraryCalc(false);
        return;
      }
      if (seed < 1 || seed > 249) {
        toast.error("Seed number must be between 1 and 249.");
        setIsHoraryCalc(false);
        return;
      }

      const chart = calculateHoraryChart(seed, y, m, d, hr, min, lat, lon, tz);
      setHoraryResult(chart);
      setTimeout(() => {
        document
          .getElementById("horary-result")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (e) {
      toast.error(
        `Horary error: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setIsHoraryCalc(false);
    }
  };

  const horaryEntry = getSeedEntry(Number.parseInt(horaryForm.seed, 10) || 15);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            data-ocid="horary.back_button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>
          <div className="flex-1 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#2E8B57]" />
            <span className="font-display font-bold text-lg text-foreground">
              Horary / Prashna
            </span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">
            प्रश्न ज्योतिष
          </span>
        </div>
      </header>
      <ServiceNavBar />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Form Section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rounded-xl border shadow-sm bg-card p-5 space-y-4">
            <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-[#2E8B57]" />
              Horary Query Details / प्रश्न विवरण
            </h2>
            <p className="text-xs text-muted-foreground">
              Enter the date &amp; time of the question, your location, and the
              seed number (1–249) to cast a Horary chart.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label
                  htmlFor="h-dob"
                  className="text-xs text-muted-foreground"
                >
                  Date of Query
                </Label>
                <Input
                  id="h-dob"
                  data-ocid="horary.input"
                  type="date"
                  value={horaryForm.date}
                  onChange={(e) => updateHoraryForm("date", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="h-time"
                  className="text-xs text-muted-foreground"
                >
                  Time of Query
                </Label>
                <Input
                  id="h-time"
                  data-ocid="horary.input"
                  type="time"
                  value={horaryForm.time}
                  onChange={(e) => updateHoraryForm("time", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="h-tz" className="text-xs text-muted-foreground">
                  UTC Offset (hrs)
                </Label>
                <Input
                  id="h-tz"
                  data-ocid="horary.input"
                  type="number"
                  step="0.5"
                  value={horaryForm.tz}
                  onChange={(e) => updateHoraryForm("tz", e.target.value)}
                  placeholder="5.5 for IST"
                />
              </div>
              <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                <Label
                  htmlFor="h-place"
                  className="text-xs text-muted-foreground"
                >
                  Place
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="h-place"
                    data-ocid="horary.input"
                    value={horaryForm.place}
                    onChange={(e) => updateHoraryForm("place", e.target.value)}
                    placeholder="City, Country"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleHoraryGeocode()
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    data-ocid="horary_geocode.button"
                    onClick={handleHoraryGeocode}
                    disabled={isHoraryGeocoding}
                    className="shrink-0 border-[#c8a96e] hover:bg-primary/10"
                  >
                    {isHoraryGeocoding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    <span className="ml-1 hidden sm:inline">Look Up</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="h-lat"
                  className="text-xs text-muted-foreground"
                >
                  Latitude
                </Label>
                <Input
                  id="h-lat"
                  data-ocid="horary.input"
                  type="number"
                  step="0.0001"
                  value={horaryForm.lat}
                  onChange={(e) => updateHoraryForm("lat", e.target.value)}
                  placeholder="19.0760"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="h-lon"
                  className="text-xs text-muted-foreground"
                >
                  Longitude
                </Label>
                <Input
                  id="h-lon"
                  data-ocid="horary.input"
                  type="number"
                  step="0.0001"
                  value={horaryForm.lon}
                  onChange={(e) => updateHoraryForm("lon", e.target.value)}
                  placeholder="72.8777"
                />
              </div>
            </div>

            {/* Seed Number */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="space-y-1 flex-1 max-w-xs">
                  <Label
                    htmlFor="h-seed"
                    className="text-xs font-semibold text-primary"
                  >
                    Seed Number (प्रश्न संख्या) — 1 to 249
                  </Label>
                  <Input
                    id="h-seed"
                    data-ocid="horary_seed.input"
                    type="number"
                    min="1"
                    max="249"
                    value={horaryForm.seed}
                    onChange={(e) => updateHoraryForm("seed", e.target.value)}
                    className="text-lg font-bold border-[#c8a96e] focus:border-primary"
                  />
                </div>
              </div>
              {horaryForm.seed &&
                Number.parseInt(horaryForm.seed, 10) >= 1 &&
                Number.parseInt(horaryForm.seed, 10) <= 249 && (
                  <div className="text-sm font-medium text-foreground bg-card rounded-md px-3 py-2 border border-border">
                    <span className="text-primary font-bold">
                      Seed {horaryForm.seed}
                    </span>
                    {" → "}
                    <span>
                      {horaryEntry.nakName}{" "}
                      {Math.floor(horaryEntry.startSid % 30)}°
                      {Math.floor((horaryEntry.startSid % 1) * 60)}&#39;
                      {Math.round((((horaryEntry.startSid % 1) * 60) % 1) * 60)}
                      &#34;
                    </span>
                    {" | "}
                    <span className="text-muted-foreground">
                      Nak Lord: <strong>{horaryEntry.nakLord}</strong>
                    </span>
                    {" | "}
                    <span className="text-muted-foreground">
                      Sub Lord: <strong>{horaryEntry.subLord}</strong>
                    </span>
                  </div>
                )}
            </div>

            <Button
              data-ocid="horary_calculate.primary_button"
              onClick={handleHoraryCalculate}
              disabled={isHoraryCalc}
              className="w-full sm:w-auto text-sm font-semibold"
              style={{ background: "#2E8B57", color: "#ffffff" }}
            >
              {isHoraryCalc ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Calculate Horary Chart
                </>
              )}
            </Button>
          </div>
        </motion.section>

        {/* Results */}
        {horaryResult ? (
          <motion.section
            id="horary-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            <div className="rounded-xl border border-border bg-card px-4 py-3 space-y-2">
              <div className="flex flex-wrap items-start gap-x-6 gap-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 shrink-0 text-[#2E8B57]" />
                  <span className="text-xs text-muted-foreground">Date:</span>
                  <span className="text-xs font-semibold">
                    {horaryForm.date}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Time:</span>
                  <span className="text-xs font-semibold">
                    {horaryForm.time}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Seed:</span>
                  <span className="text-xs font-semibold">
                    {horaryForm.seed}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Lagna:</span>
                  <span className="text-xs font-semibold">
                    {horaryResult.ascendant.signName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Nak Lord:
                  </span>
                  <span className="text-xs font-semibold">
                    {horaryResult.ascendant.nakshatraLord}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Sub Lord:
                  </span>
                  <span className="text-xs font-semibold">
                    {horaryResult.ascendant.subLord}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Ayanamsa:
                  </span>
                  <span className="text-xs font-semibold">
                    {horaryResult.ayanamsa.toFixed(4)}° (KP Old)
                  </span>
                </div>
              </div>
            </div>

            <Tabs
              defaultValue="horary-chart"
              className="w-full"
              data-ocid="horary.tab"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="horary-chart" data-ocid="horary_chart.tab">
                  Horary Chart
                </TabsTrigger>
                <TabsTrigger
                  value="planets-houses"
                  data-ocid="horary_planets.tab"
                >
                  Planets &amp; Houses
                </TabsTrigger>
              </TabsList>

              <TabsContent value="horary-chart" className="space-y-5">
                <div className="flex flex-col lg:flex-row gap-5">
                  <div className="lg:w-1/2 rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm text-foreground">
                        Horary Chart (Rashi)
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          data-ocid="horary_label.toggle"
                          onClick={() => setHoraryLabelMode("english")}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-l-md border transition-colors ${
                            horaryLabelMode === "english"
                              ? "bg-[#2E8B57] text-white border-[#2E8B57]"
                              : "bg-card text-muted-foreground border-border hover:bg-accent"
                          }`}
                        >
                          EN
                        </button>
                        <button
                          type="button"
                          data-ocid="horary_label.toggle"
                          onClick={() => setHoraryLabelMode("hindi")}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-r-md border-t border-r border-b transition-colors ${
                            horaryLabelMode === "hindi"
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
                      planets={horaryResult.planets}
                      ascendant={horaryResult.ascendant}
                      cusps={horaryResult.cusps}
                      labelMode={horaryLabelMode}
                      mode="natal"
                    />
                  </div>
                  <div className="lg:w-1/2 rounded-xl border border-blue-200 bg-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        className="font-semibold text-sm"
                        style={{ color: "#0066aa" }}
                      >
                        Bhavchalit Chart
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        Shifted positions
                      </span>
                    </div>
                    <NorthIndianChart
                      planets={horaryResult.planets}
                      ascendant={horaryResult.ascendant}
                      cusps={horaryResult.cusps}
                      labelMode={horaryLabelMode}
                      mode="bhavchalit"
                    />
                  </div>
                </div>

                <div className="w-full">
                  <DashaSection
                    dasha={horaryResult.dasha}
                    storageKey="horary_dasha_open"
                  />
                </div>

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
                      horaryResult.planets,
                      horaryResult.ascendant.sign,
                      horaryResult.cusps.map((c) => c.sign),
                    )}
                  />
                </div>

                <EventAnalysis
                  nadiPlanets={calculateNadiNumbers(
                    horaryResult.planets,
                    horaryResult.ascendant.sign,
                    horaryResult.cusps.map((c) => c.sign),
                  )}
                />
              </TabsContent>

              <TabsContent value="planets-houses" className="space-y-5">
                {/* Planet Positions Table */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-[#2E8B57]" />
                    Planet Positions
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          {[
                            "Planet",
                            "Sign",
                            "Degree",
                            "Nakshatra",
                            "Sub Lord",
                          ].map((h) => (
                            <th
                              key={h}
                              className="text-left py-2 px-2 font-semibold text-muted-foreground"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {horaryResult.planets.map((p, i) => (
                          <tr
                            key={p.name}
                            className={i % 2 === 0 ? "bg-muted/30" : ""}
                          >
                            <td className="py-1.5 px-2 font-medium">
                              {p.name}
                              {p.retrograde && (
                                <span className="ml-1 text-red-500 text-[10px]">
                                  (R)
                                </span>
                              )}
                            </td>
                            <td className="py-1.5 px-2">{p.signName}</td>
                            <td className="py-1.5 px-2 font-mono">
                              {formatDeg(p.degrees)}
                            </td>
                            <td className="py-1.5 px-2">{p.nakshatra}</td>
                            <td className="py-1.5 px-2">{p.subLord}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* House Cusps Table */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-[#2E8B57]" />
                    House Cusps / Cusp Degrees
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          {[
                            "House",
                            "Sign",
                            "Degree",
                            "Nakshatra",
                            "Nak Lord",
                            "Sub Lord",
                            "Sublord of Lord",
                          ].map((h) => (
                            <th
                              key={h}
                              className="text-left py-2 px-2 font-semibold text-muted-foreground whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {horaryResult.cusps.map((c, i) => {
                          const subLordPlanet = horaryResult.planets.find(
                            (p) => p.name === c.subLord,
                          );
                          return (
                            <tr
                              key={c.house}
                              className={i % 2 === 0 ? "bg-muted/30" : ""}
                            >
                              <td className="py-1.5 px-2 font-medium">
                                {c.house}
                              </td>
                              <td className="py-1.5 px-2">{c.signName}</td>
                              <td className="py-1.5 px-2 font-mono">
                                {formatDeg(c.degrees)}
                              </td>
                              <td className="py-1.5 px-2">{c.nakshatra}</td>
                              <td className="py-1.5 px-2">{c.nakshatraLord}</td>
                              <td className="py-1.5 px-2">{c.subLord}</td>
                              <td className="py-1.5 px-2">
                                {subLordPlanet?.subLord ?? "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.section>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            data-ocid="horary.empty_state"
            className="text-center py-16 text-muted-foreground"
          >
            <Star className="w-12 h-12 mx-auto mb-4 text-[#2E8B57]/30" />
            <p className="font-medium">
              Enter query details and seed number above
            </p>
            <p
              className="text-sm mt-1"
              style={{
                fontFamily: "Noto Sans Devanagari, system-ui, sans-serif",
              }}
            >
              बीज संख्या और प्रश्न समय भरें
            </p>
          </motion.div>
        )}
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
        <ServiceGateModal service="horary" onClose={() => setShowGate(false)} />
      )}
    </div>
  );
}
