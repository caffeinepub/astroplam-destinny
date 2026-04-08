import type { NadiPlanet } from "@/lib/kpEngine";

const HINDI_NAME: Record<string, string> = {
  Su: "सूर्य",
  Mo: "चन्द्र",
  Ma: "मंगल",
  Me: "बुध",
  Ju: "गुरु",
  Ve: "शुक्र",
  Sa: "शनि",
  Ra: "राहु",
  Ke: "केतु",
};

const ENGLISH_NAME: Record<string, string> = {
  Su: "Sun",
  Mo: "Moon",
  Ma: "Mars",
  Me: "Mercury",
  Ju: "Jupiter",
  Ve: "Venus",
  Sa: "Saturn",
  Ra: "Rahu",
  Ke: "Ketu",
};

const PLANET_COLORS: Record<string, string> = {
  Su: "#cc0000",
  Mo: "#888800",
  Ma: "#8b0000",
  Me: "#006400",
  Ju: "#8b008b",
  Ve: "#006666",
  Sa: "#cc0066",
  Ra: "#8b0000",
  Ke: "#8b6914",
};

type CategoryColor = "good" | "supporter" | "bad" | "supporterBad" | "neutral";

const CAT_COLORS: Record<CategoryColor, string> = {
  good: "#15803d",
  supporter: "#4f46e5",
  bad: "#dc2626",
  supporterBad: "#ea580c",
  neutral: "#6b7280",
};

interface EventRule {
  good: number[];
  supporter: number[];
  bad: number[];
  supporterBad: number[];
}

const EVENTS: Array<{
  id: string;
  hi: string;
  en: string;
  rule: EventRule;
}> = [
  {
    id: "education",
    hi: "शिक्षा",
    en: "Education",
    rule: {
      good: [2, 4, 5, 9, 11],
      supporter: [],
      bad: [6, 8, 12],
      supporterBad: [],
    },
  },
  {
    id: "career",
    hi: "करियर",
    en: "Career",
    rule: { good: [10, 11], supporter: [], bad: [6, 8, 12], supporterBad: [] },
  },
  {
    id: "travel",
    hi: "यात्रा",
    en: "Travel",
    rule: { good: [3, 9, 12], supporter: [7], bad: [], supporterBad: [] },
  },
  {
    id: "marriage",
    hi: "विवाह",
    en: "Marriage",
    rule: {
      good: [2, 7, 11],
      supporter: [5, 9],
      bad: [1, 6, 10],
      supporterBad: [8, 12],
    },
  },
  {
    id: "health",
    hi: "स्वास्थ्य",
    en: "Health",
    rule: {
      good: [5, 9, 11],
      supporter: [],
      bad: [6, 8, 12],
      supporterBad: [],
    },
  },
  {
    id: "litigation",
    hi: "मुकदमा",
    en: "Litigation",
    rule: {
      good: [10, 11],
      supporter: [5, 9],
      bad: [6, 8, 12],
      supporterBad: [],
    },
  },
  {
    id: "childbirth",
    hi: "संतान",
    en: "Child Birth",
    rule: {
      good: [2, 5, 9, 11],
      supporter: [],
      bad: [1, 4, 10],
      supporterBad: [],
    },
  },
  {
    id: "nature",
    hi: "स्वभाव",
    en: "Nature",
    rule: {
      good: [2, 5, 9, 11],
      supporter: [],
      bad: [6, 8, 12],
      supporterBad: [],
    },
  },
];

function classifyNumbers(
  numbers: number[],
  rule: EventRule,
): Record<CategoryColor, number[]> {
  const result: Record<CategoryColor, number[]> = {
    good: [],
    supporter: [],
    bad: [],
    supporterBad: [],
    neutral: [],
  };
  for (const n of numbers) {
    if (rule.good.includes(n)) result.good.push(n);
    else if (rule.supporter.includes(n)) result.supporter.push(n);
    else if (rule.bad.includes(n)) result.bad.push(n);
    else if (rule.supporterBad.includes(n)) result.supporterBad.push(n);
    else result.neutral.push(n);
  }
  return result;
}

function bilingualName(name: string): string {
  const engToAbbr: Record<string, string> = {
    Sun: "Su",
    Moon: "Mo",
    Mars: "Ma",
    Mercury: "Me",
    Jupiter: "Ju",
    Venus: "Ve",
    Saturn: "Sa",
    Rahu: "Ra",
    Ketu: "Ke",
  };
  const abbr = engToAbbr[name] || name;
  const hi = HINDI_NAME[abbr];
  const en = ENGLISH_NAME[abbr] || name;
  return hi ? `${hi} / ${en}` : en;
}

function NumbersCell({
  numbers,
  cat,
  activeEventColors,
}: {
  numbers: number[];
  cat: CategoryColor;
  activeEventColors?: Record<number, string>;
}) {
  const defaultColor = CAT_COLORS[cat];
  if (numbers.length === 0) {
    return (
      <td style={styles.cell}>
        <span style={{ color: "#ccc" }}>—</span>
      </td>
    );
  }
  return (
    <td style={styles.cell}>
      <span style={{ fontWeight: 700, fontSize: "12px" }}>
        {numbers.map((n, i) => {
          const color = activeEventColors?.[n]
            ? activeEventColors[n]
            : defaultColor;
          return (
            <span key={n} style={{ color }}>
              {n}
              {i < numbers.length - 1 ? ", " : ""}
            </span>
          );
        })}
      </span>
    </td>
  );
}

function PlanetBlock({
  np,
  rule,
  activeEventColors,
}: {
  np: NadiPlanet;
  rule: EventRule;
  activeEventColors?: Record<number, string>;
}) {
  const planetColor = PLANET_COLORS[np.abbr] || "#555";
  const hiName = HINDI_NAME[np.abbr] || np.abbr;
  const enName = ENGLISH_NAME[np.abbr] || np.abbr;

  const rows = [
    {
      label: bilingualName(np.planet.name),
      numbers: np.planet.numbers,
      key: "planet",
    },
    {
      label: bilingualName(np.nakLord.name),
      numbers: np.nakLord.numbers,
      key: "nak",
    },
    {
      label: bilingualName(np.subLord.name),
      numbers: np.subLord.numbers,
      key: "sub",
    },
  ];

  return (
    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
      {/* Planet name column */}
      <td
        style={{
          ...styles.cell,
          width: "90px",
          minWidth: "90px",
          verticalAlign: "middle",
          borderRight: "2px solid #bfdbfe",
          background: `${planetColor}0d`,
          padding: "6px 8px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "Noto Sans Devanagari, sans-serif",
            fontSize: "15px",
            fontWeight: 700,
            color: planetColor,
            lineHeight: 1.2,
          }}
        >
          {hiName}
        </div>
        <div style={{ fontSize: "10px", color: "#666", fontWeight: 600 }}>
          {enName}
        </div>
      </td>

      {/* Sub-rows stacked in one td */}
      <td style={{ padding: 0 }} colSpan={5}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {rows.map((row) => {
              const classified = classifyNumbers(row.numbers, rule);
              return (
                <tr
                  key={row.key}
                  style={{
                    borderBottom:
                      row.key !== "sub" ? "1px solid #f3f4f6" : undefined,
                  }}
                >
                  <td
                    style={{
                      ...styles.cell,
                      width: "100px",
                      minWidth: "80px",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: planetColor,
                      borderRight: "1px solid #e5e7eb",
                      whiteSpace: "nowrap",
                      fontFamily: "Noto Sans Devanagari, sans-serif",
                    }}
                  >
                    {row.label}
                  </td>
                  <NumbersCell
                    numbers={classified.good}
                    cat="good"
                    activeEventColors={activeEventColors}
                  />
                  <NumbersCell
                    numbers={classified.supporter}
                    cat="supporter"
                    activeEventColors={activeEventColors}
                  />
                  <NumbersCell
                    numbers={classified.bad}
                    cat="bad"
                    activeEventColors={activeEventColors}
                  />
                  <NumbersCell
                    numbers={classified.supporterBad}
                    cat="supporterBad"
                    activeEventColors={activeEventColors}
                  />
                  <NumbersCell
                    numbers={classified.neutral}
                    cat="neutral"
                    activeEventColors={activeEventColors}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </td>
    </tr>
  );
}

const styles: Record<string, React.CSSProperties> = {
  cell: {
    padding: "5px 8px",
    fontSize: "12px",
    verticalAlign: "middle",
  },
  headerCell: {
    padding: "6px 8px",
    fontSize: "10px",
    fontWeight: 700,
    textAlign: "center" as const,
    whiteSpace: "nowrap" as const,
    borderBottom: "2px solid #e5e7eb",
  },
};

interface Props {
  nadiPlanets: NadiPlanet[];
  activeEventColors?: Record<number, string>;
}

export default function EventAnalysis({
  nadiPlanets,
  activeEventColors,
}: Props) {
  const scrollToSection = (id: string) => {
    document
      .getElementById(`event-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Sticky sub-nav */}
      <div
        style={{
          position: "sticky",
          top: "60px",
          zIndex: 40,
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "8px 0",
          overflowX: "auto",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "inline-flex", gap: "6px", padding: "0 8px" }}>
          {EVENTS.map((ev) => (
            <button
              key={ev.id}
              type="button"
              data-ocid={`events.${ev.id}.button`}
              onClick={() => scrollToSection(ev.id)}
              style={{
                padding: "4px 10px",
                borderRadius: "16px",
                border: "1px solid #bfdbfe",
                background: "#eff6ff",
                color: "#1d4ed8",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Noto Sans Devanagari, system-ui, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {ev.hi} / {ev.en}
            </button>
          ))}
        </div>
      </div>

      {/* Event sections */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          padding: "16px 0",
        }}
      >
        {EVENTS.map((ev) => (
          <section
            key={ev.id}
            id={`event-${ev.id}`}
            data-ocid={`events.${ev.id}.section`}
            style={{
              borderRadius: "12px",
              border: "1.5px solid #bfdbfe",
              background: "white",
              overflow: "hidden",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
          >
            {/* Section title */}
            <div
              style={{
                background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                padding: "10px 16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "Noto Sans Devanagari, sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.3,
                }}
              >
                {ev.hi}
              </div>
              <div
                style={{ fontSize: "12px", color: "#bfdbfe", fontWeight: 600 }}
              >
                {ev.en}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "520px",
                }}
              >
                <thead>
                  <tr style={{ background: "#f0f9ff" }}>
                    <th
                      style={{
                        ...styles.headerCell,
                        width: "90px",
                        borderRight: "2px solid #bfdbfe",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Noto Sans Devanagari, sans-serif",
                        }}
                      >
                        ग्रह
                      </span>
                      <br />
                      <span style={{ fontSize: "9px", color: "#64748b" }}>
                        Planet
                      </span>
                    </th>
                    <th
                      style={{
                        ...styles.headerCell,
                        borderRight: "1px solid #e5e7eb",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Noto Sans Devanagari, sans-serif",
                        }}
                      >
                        स्तर
                      </span>
                      <br />
                      <span style={{ fontSize: "9px", color: "#64748b" }}>
                        Level
                      </span>
                    </th>
                    <th
                      style={{
                        ...styles.headerCell,
                        color: CAT_COLORS.good,
                        borderRight: "1px solid #e5e7eb",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Noto Sans Devanagari, sans-serif",
                        }}
                      >
                        अच्छे
                      </span>
                      <br />
                      <span style={{ fontSize: "9px" }}>Good</span>
                    </th>
                    <th
                      style={{
                        ...styles.headerCell,
                        color: CAT_COLORS.supporter,
                        borderRight: "1px solid #e5e7eb",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Noto Sans Devanagari, sans-serif",
                        }}
                      >
                        सहायक
                      </span>
                      <br />
                      <span style={{ fontSize: "9px" }}>Supporter</span>
                    </th>
                    <th
                      style={{
                        ...styles.headerCell,
                        color: CAT_COLORS.bad,
                        borderRight: "1px solid #e5e7eb",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Noto Sans Devanagari, sans-serif",
                        }}
                      >
                        खराब
                      </span>
                      <br />
                      <span style={{ fontSize: "9px" }}>Bad</span>
                    </th>
                    <th
                      style={{
                        ...styles.headerCell,
                        color: CAT_COLORS.supporterBad,
                        borderRight: "1px solid #e5e7eb",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Noto Sans Devanagari, sans-serif",
                        }}
                      >
                        सहायक (खराब)
                      </span>
                      <br />
                      <span style={{ fontSize: "9px" }}>Bad Sup.</span>
                    </th>
                    <th
                      style={{
                        ...styles.headerCell,
                        color: CAT_COLORS.neutral,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Noto Sans Devanagari, sans-serif",
                        }}
                      >
                        तटस्थ
                      </span>
                      <br />
                      <span style={{ fontSize: "9px" }}>Neutral</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nadiPlanets.map((np) => (
                    <PlanetBlock
                      key={np.abbr}
                      np={np}
                      rule={ev.rule}
                      activeEventColors={activeEventColors}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
