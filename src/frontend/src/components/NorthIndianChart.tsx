import { SIGN_ABBR } from "@/lib/kpEngine";
import type { ChartCusp, ChartPlanet } from "@/lib/kpEngine";

const PLANET_COLORS: Record<string, string> = {
  Su: "#cc0000",
  Mo: "#887700",
  Ma: "#8b0000",
  Me: "#006400",
  Ju: "#8b008b",
  Ve: "#006666",
  Sa: "#cc0066",
  Ra: "#8b0000",
  Ke: "#8b6914",
  Ne: "#000080",
  Ur: "#cc4400",
  Pl: "#333333",
  As: "#cc8800",
};

const HINDI_ABBR: Record<string, string> = {
  Su: "सू",
  Mo: "चं",
  Ma: "मं",
  Me: "बु",
  Ju: "गु",
  Ve: "शु",
  Sa: "श",
  Ra: "रा",
  Ke: "के",
  Ur: "यू",
  Ne: "ने",
  Pl: "प्लू",
  As: "ल",
};

const RETRO_MARKER: Record<string, string> = {
  Ra: "*",
  Ke: "*",
};

interface Props {
  planets: ChartPlanet[];
  ascendant: ChartPlanet;
  cusps?: ChartCusp[];
  labelMode?: "english" | "hindi";
  mode?: "natal" | "bhavchalit";
  title?: string;
  eventHouseColors?: Record<number, string>;
}

const S = 500;
const C = S / 2; // 250

type Pt = [number, number];

// Outer corners
const TL: Pt = [0, 0];
const TR: Pt = [S, 0];
const BR: Pt = [S, S];
const BL: Pt = [0, S];

// Inner diamond vertices — corners touch MIDPOINTS of outer square sides
const DT: Pt = [C, 0]; // top midpoint
const DR: Pt = [S, C]; // right midpoint
const DB: Pt = [C, S]; // bottom midpoint
const DL: Pt = [0, C]; // left midpoint

// Intersection points: where the two full diagonals (X) cross the inner diamond edges
const I1: Pt = [C / 2, C / 2]; // [125,125]
const I2: Pt = [C + C / 2, C / 2]; // [375,125]
const I3: Pt = [C + C / 2, C + C / 2]; // [375,375]
const I4: Pt = [C / 2, C + C / 2]; // [125,375]
const CC: Pt = [C, C]; // [250,250] center

// 12 house polygons — anti-clockwise from top (H1 at top)
const HOUSE_POLYS: Record<number, Pt[]> = {
  1: [DT, I2, CC, I1], // top inner rhombus
  2: [TL, DT, I1], // top-left outer triangle (near top)
  3: [TL, I1, DL], // top-left outer triangle (near left)
  4: [DL, I1, CC, I4], // left inner rhombus
  5: [BL, DL, I4], // bottom-left outer triangle (near left)
  6: [BL, I4, DB], // bottom-left outer triangle (near bottom)
  7: [DB, I4, CC, I3], // bottom inner rhombus
  8: [BR, DB, I3], // bottom-right outer triangle (near bottom)
  9: [BR, I3, DR], // bottom-right outer triangle (near right)
  10: [DR, I2, CC, I3], // right inner rhombus
  11: [TR, DR, I2], // top-right outer triangle (near right)
  12: [TR, I2, DT], // top-right outer triangle (near top)
};

// Centroids for label placement
const HOUSE_CENTROIDS: Record<number, Pt> = {
  1: [250, 120], // top inner rhombus
  2: [108, 52], // top-left upper triangle
  3: [48, 112], // top-left lower triangle
  4: [122, 250], // left inner rhombus
  5: [48, 388], // bottom-left lower triangle
  6: [108, 448], // bottom-left upper triangle
  7: [250, 380], // bottom inner rhombus
  8: [392, 448], // bottom-right lower triangle
  9: [452, 388], // bottom-right upper triangle
  10: [378, 250], // right inner rhombus
  11: [452, 112], // top-right upper triangle
  12: [392, 52], // top-right lower triangle
};

function polyStr(pts: Pt[]): string {
  return pts.map((p) => `${p[0]},${p[1]}`).join(" ");
}

export default function NorthIndianChart({
  planets,
  ascendant,
  cusps: _cusps,
  labelMode = "english",
  mode = "natal",
  title,
  eventHouseColors = {},
}: Props) {
  const lagnaSign = ascendant.sign;
  const borderColor = mode === "bhavchalit" ? "#0066aa" : "#22a855";
  const isHindi = labelMode === "hindi";

  const getPlanetsInHouse = (houseNum: number): ChartPlanet[] => {
    const all = [...planets, ascendant];
    if (mode === "bhavchalit") {
      return all.filter((p) => p.bhavaHouse === houseNum);
    }
    const sign = (lagnaSign + houseNum - 1) % 12;
    return all.filter((p) => p.sign === sign);
  };

  const getLabel = (abbr: string) =>
    isHindi ? HINDI_ABBR[abbr] || abbr : abbr;

  const HOUSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Corner houses (small triangles): H2, H3, H5, H6, H8, H9, H11, H12
  // Inner rhombus houses (bigger): H1, H4, H7, H10
  const isCorner = (h: number) => [2, 3, 5, 6, 8, 9, 11, 12].includes(h);
  const isInner = (h: number) => [1, 4, 7, 10].includes(h);

  return (
    <div>
      {title && (
        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            fontWeight: 700,
            color: borderColor,
            marginBottom: "4px",
            letterSpacing: "0.04em",
          }}
        >
          {title}
        </div>
      )}
      <div style={{ width: "100%", maxWidth: "520px", margin: "0 auto" }}>
        <svg
          viewBox={`0 0 ${S} ${S}`}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            overflow: "visible",
          }}
          role="img"
          aria-label={
            mode === "bhavchalit"
              ? "Bhavchalit Chart"
              : "North Indian KP Astrology Chart"
          }
        >
          {/* White background */}
          <rect x="0" y="0" width={S} height={S} fill="white" />

          {/* House polygon fills */}
          {HOUSES.map((h) => (
            <polygon
              key={h}
              points={polyStr(HOUSE_POLYS[h])}
              fill="white"
              stroke="none"
            />
          ))}

          {/* === STRUCTURE: outer square + full X diagonals + inner diamond === */}
          {/* 1. Outer border */}
          <rect
            x="0"
            y="0"
            width={S}
            height={S}
            fill="none"
            stroke={borderColor}
            strokeWidth="3"
          />
          {/* 2. Full diagonal X — corner to corner */}
          <line
            x1={TL[0]}
            y1={TL[1]}
            x2={BR[0]}
            y2={BR[1]}
            stroke={borderColor}
            strokeWidth="2"
          />
          <line
            x1={TR[0]}
            y1={TR[1]}
            x2={BL[0]}
            y2={BL[1]}
            stroke={borderColor}
            strokeWidth="2"
          />
          {/* 3. Inner diamond — corners at midpoints of outer square sides */}
          <polygon
            points={polyStr([DT, DR, DB, DL])}
            fill="none"
            stroke={borderColor}
            strokeWidth="2"
          />

          {/* House content */}
          {HOUSES.map((h) => {
            const [cx, cy] = HOUSE_CENTROIDS[h];
            const planetsHere = getPlanetsInHouse(h);
            const isLagna = h === 1;

            const maxCols = isInner(h) ? 3 : isCorner(h) ? 2 : 2;
            const cols = Math.min(maxCols, planetsHere.length || 1);
            const spacingX = isCorner(h) ? 24 : 28;
            const spacingY = isCorner(h) ? 18 : 20;

            const rows: ChartPlanet[][] = [];
            for (let i = 0; i < planetsHere.length; i += cols) {
              rows.push(planetsHere.slice(i, i + cols));
            }

            const totalPlanetH = rows.length * spacingY;
            const hdrH = isLagna ? 28 : 18;
            const blockH = hdrH + (planetsHere.length > 0 ? totalPlanetH : 0);
            const startY = cy - blockH / 2;

            // House number color: use event color if provided, else default gray
            const houseNumColor = eventHouseColors[h] ?? "#c0c0c0";

            return (
              <g key={h}>
                {/* House number */}
                <text
                  x={cx}
                  y={startY + 14}
                  textAnchor="middle"
                  fill={houseNumColor}
                  fontSize={isCorner(h) ? 16 : 20}
                  fontWeight={eventHouseColors[h] ? "bold" : "normal"}
                  fontFamily="system-ui, sans-serif"
                >
                  {((lagnaSign + h - 1) % 12) + 1}
                </text>

                {isLagna && (
                  <text
                    x={cx}
                    y={startY + 26}
                    textAnchor="middle"
                    fill={borderColor}
                    fontSize={9}
                    fontWeight="bold"
                    fontFamily="system-ui, sans-serif"
                  >
                    ASC
                  </text>
                )}

                {/* Sign label for this house */}
                {!isCorner(h) ? (
                  <text
                    x={cx}
                    y={startY + (isLagna ? 36 : 26)}
                    textAnchor="middle"
                    fill="#888"
                    fontSize={8}
                    fontFamily="system-ui, sans-serif"
                  >
                    {SIGN_ABBR[(lagnaSign + h - 1) % 12]}
                  </text>
                ) : null}

                {rows.map((row, rowIdx) => {
                  const rowY = startY + hdrH + rowIdx * spacingY + 12;
                  const rowWidth = (row.length - 1) * spacingX;
                  return row.map((p, colIdx) => {
                    const px = cx - rowWidth / 2 + colIdx * spacingX;
                    const deg = Math.floor(p.degrees);
                    const col = PLANET_COLORS[p.abbr] || "#333";
                    const lbl = getLabel(p.abbr);
                    const isHindiLbl = isHindi && HINDI_ABBR[p.abbr];
                    const fontSize = isHindiLbl ? 13 : 12;

                    let marker = "";
                    if (p.retrograde) marker += "R";
                    else if (RETRO_MARKER[p.abbr])
                      marker += RETRO_MARKER[p.abbr];

                    return (
                      <g key={`h${h}-p-${p.abbr}`}>
                        <text
                          x={px + fontSize * 0.4}
                          y={rowY - 6}
                          textAnchor="start"
                          fill={col}
                          fontSize={7}
                          fontWeight="normal"
                          fontFamily="system-ui, sans-serif"
                          opacity={0.9}
                        >
                          {deg}
                          {marker}
                        </text>
                        <text
                          x={px}
                          y={rowY}
                          textAnchor="middle"
                          fill={col}
                          fontSize={fontSize}
                          fontWeight="bold"
                          fontFamily={
                            isHindi
                              ? "Noto Sans Devanagari, system-ui, sans-serif"
                              : "system-ui, sans-serif"
                          }
                        >
                          {lbl}
                        </text>
                      </g>
                    );
                  });
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
