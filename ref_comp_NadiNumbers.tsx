import type { NadiPlanet } from "@/lib/kpEngine";

const PLANET_COLORS: Record<string, string> = {
  Sun: "#cc0000",
  Moon: "#887700",
  Mars: "#8b0000",
  Mercury: "#006400",
  Jupiter: "#7b008b",
  Venus: "#006666",
  Saturn: "#bb0066",
  Rahu: "#8b0000",
  Ketu: "#8b6914",
};

// Grid order: Row1: Ketu, Moon, Jupiter | Row2: Venus, Mars, Saturn | Row3: Sun, Rahu, Mercury
const GRID_ROWS = [
  ["Ketu", "Moon", "Jupiter"],
  ["Venus", "Mars", "Saturn"],
  ["Sun", "Rahu", "Mercury"],
] as const;

function fmtNums(numbers: number[]): string {
  if (numbers.length === 0) return "-";
  return `${numbers.join(",")},`;
}

interface Props {
  nadiPlanets: NadiPlanet[];
}

function PlanetBox({ np }: { np: NadiPlanet }) {
  const planetColor = PLANET_COLORS[np.planet.name] || "#333";
  const nakColor = PLANET_COLORS[np.nakLord.name] || "#555";
  const subColor = PLANET_COLORS[np.subLord.name] || "#555";

  return (
    <div style={{ backgroundColor: "#fff", minWidth: 0, flex: 1 }}>
      {[
        {
          name: np.planet.name,
          nums: np.planet.numbers,
          color: planetColor,
          border: true,
        },
        {
          name: np.nakLord.name,
          nums: np.nakLord.numbers,
          color: nakColor,
          border: true,
        },
        {
          name: np.subLord.name,
          nums: np.subLord.numbers,
          color: subColor,
          border: false,
        },
      ].map(({ name, nums, color, border }) => (
        <div
          key={name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "4px 8px",
            borderBottom: border ? "1px solid #e8dfc8" : undefined,
            gap: "6px",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              color,
              fontSize: "clamp(12px, 3vw, 14px)",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </span>
          <span
            style={{
              color: "#333",
              fontSize: "clamp(12px, 3vw, 14px)",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {fmtNums(nums)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function NadiNumbers({ nadiPlanets }: Props) {
  const byName: Record<string, NadiPlanet> = {};
  for (const np of nadiPlanets) {
    byName[np.planet.name] = np;
  }

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table
        style={{
          minWidth: "600px",
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        <tbody>
          {GRID_ROWS.map((row) => (
            <tr key={row.join("-")}>
              {row.map((planetName) => {
                const np = byName[planetName];
                return (
                  <td
                    key={planetName}
                    style={{
                      border: "2px solid #c8b88a",
                      padding: 0,
                      verticalAlign: "top",
                    }}
                  >
                    {np ? (
                      <PlanetBox np={np} />
                    ) : (
                      <div
                        style={{
                          padding: "4px",
                          color: "#999",
                          fontSize: "clamp(12px, 3vw, 14px)",
                        }}
                      >
                        {planetName}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
