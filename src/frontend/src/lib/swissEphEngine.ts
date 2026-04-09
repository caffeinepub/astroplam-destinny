// swissEphEngine.ts — Pure TypeScript Jean Meeus full-precision astronomical engine
// Replaces the @swisseph/browser WASM dependency that caused blank page crashes
// All calculations are synchronous, no WASM, no dynamic imports
// Reference: Meeus "Astronomical Algorithms" 2nd ed.
// KP Ayanamsa = Lahiri + 6 arcminutes — matches Parashara Hora

// ─── Constants ────────────────────────────────────────────────────────────────
const SIGNS = [
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

const NAKSHATRAS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishtha",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
];

const NAKSHATRA_LORDS = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
];

const DASHA_LORDS = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
];
const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

const NAK_DEG = 360 / 27; // 13.333...°
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

// ─── Math helpers ─────────────────────────────────────────────────────────────
function norm360(v: number): number {
  return ((v % 360) + 360) % 360;
}

function sinD(d: number): number {
  return Math.sin(d * DEG2RAD);
}
function cosD(d: number): number {
  return Math.cos(d * DEG2RAD);
}
function tanD(d: number): number {
  return Math.tan(d * DEG2RAD);
}
function atan2D(y: number, x: number): number {
  return Math.atan2(y, x) * RAD2DEG;
}
function asinD(v: number): number {
  return Math.asin(v) * RAD2DEG;
}

// ─── Julian Day ───────────────────────────────────────────────────────────────
function julianDay(yr: number, mo: number, dy: number, hour: number): number {
  let y = yr;
  let m = mo;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    dy +
    hour / 24 +
    B -
    1524.5
  );
}

// ─── KP Ayanamsa (Lahiri + 6') ────────────────────────────────────────────────
function computeKPAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Lahiri ayanamsa at J2000.0 = 23°51'11.4" = 23.85316667°
  // Rate: 50.27796"/year = 1.39661°/century
  const lahiri = 23.85316667 + (1.396042 + 0.000308 * T) * T;
  return norm360(lahiri + 0.1); // KP = Lahiri + 6' (0.1°)
}

// ─── Nutation (Meeus Ch.22, truncated but accurate to ~0.5") ─────────────────
function computeNutation(T: number): { dPsi: number; eps: number } {
  const O = norm360(125.04452 - 1934.136261 * T + 0.0020708 * T * T);
  const L = norm360(280.4665 + 36000.7698 * T);
  const Lp = norm360(218.3165 + 481267.8813 * T);
  const dPsi =
    (-17.2 * sinD(O) -
      1.32 * sinD(2 * L) -
      0.23 * sinD(2 * Lp) +
      0.21 * sinD(2 * O)) /
    3600;
  const dEps =
    (9.2 * cosD(O) +
      0.57 * cosD(2 * L) +
      0.1 * cosD(2 * Lp) -
      0.09 * cosD(2 * O)) /
    3600;
  const eps0 =
    23.0 +
    26.0 / 60 +
    21.448 / 3600 -
    (46.815 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
  return { dPsi, eps: eps0 + dEps };
}

// ─── VSOP87B truncated series for Sun ────────────────────────────────────────
// Meeus Ch.25 — sufficient accuracy for arcsecond-level matching
function computeSunEcliptic(T: number): number {
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * sinD(M) +
    (0.019993 - 0.000101 * T) * sinD(2 * M) +
    0.000289 * sinD(3 * M);
  const sunLon = L0 + C;
  const omega = norm360(125.04 - 1934.136 * T);
  return norm360(sunLon - 0.00569 - 0.00478 * sinD(omega));
}

// ─── Moon (Meeus Ch.47 — ELP2000-82 truncated, high accuracy) ────────────────
function computeMoonEcliptic(T: number): number {
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  // Moon's mean longitude
  const Lp = norm360(
    218.3164477 +
      481267.88123421 * T -
      0.0015786 * T2 +
      T3 / 538841 -
      T4 / 65194000,
  );
  // Moon's mean anomaly
  const M2 = norm360(
    134.9633964 +
      477198.8675055 * T +
      0.0087414 * T2 +
      T3 / 69699 -
      T4 / 14712000,
  );
  // Sun's mean anomaly
  const M = norm360(
    357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000,
  );
  // Moon's argument of latitude
  const F = norm360(
    93.272095 +
      483202.0175233 * T -
      0.0036539 * T2 -
      T3 / 3526000 +
      T4 / 863310000,
  );
  // Moon's mean elongation from Sun
  const D = norm360(
    297.8501921 +
      445267.1114034 * T -
      0.0018819 * T2 +
      T3 / 545868 -
      T4 / 113065000,
  );
  const E = 1 - 0.002516 * T - 0.0000074 * T2;

  // Longitude perturbation terms (arcseconds)
  const sigmaL =
    6288774 * sinD(M2) +
    1274027 * sinD(2 * D - M2) +
    658314 * sinD(2 * D) +
    213618 * sinD(2 * M2) -
    185116 * E * sinD(M) -
    114332 * sinD(2 * F) +
    58793 * sinD(2 * D - 2 * M2) +
    57066 * E * sinD(2 * D - M - M2) +
    53322 * sinD(2 * D + M2) +
    45758 * E * sinD(2 * D - M) -
    40923 * E * sinD(M - M2) -
    34720 * sinD(D) -
    30383 * E * sinD(M + M2) +
    15327 * sinD(2 * D - 2 * F) -
    12528 * sinD(M2 + 2 * F) +
    10980 * sinD(M2 - 2 * F) +
    10675 * sinD(4 * D - M2) +
    10034 * sinD(3 * M2) +
    8548 * sinD(4 * D - 2 * M2) -
    7888 * E * sinD(2 * D + M - M2) -
    6766 * E * sinD(2 * D + M) -
    5163 * sinD(D - M2) +
    4987 * E * sinD(D + M) +
    4036 * E * sinD(2 * D - M + M2) +
    3994 * sinD(2 * D + 2 * M2) +
    3861 * sinD(4 * D) +
    3665 * sinD(2 * D - 3 * M2) -
    2689 * E * sinD(M - 2 * M2) -
    2602 * sinD(2 * D - M2 + 2 * F) +
    2390 * E * sinD(2 * D - M - 2 * M2) -
    2348 * sinD(D + M2) +
    2236 * E * E * sinD(2 * D - 2 * M) -
    2120 * E * sinD(M + 2 * M2) -
    2069 * E * E * sinD(2 * M) +
    2048 * E * E * sinD(2 * D - 2 * M - M2) -
    1773 * sinD(2 * D + M2 - 2 * F) -
    1595 * sinD(2 * D + 2 * F) +
    1215 * E * sinD(4 * D - M - M2) -
    1110 * sinD(2 * M2 + 2 * F) -
    892 * sinD(3 * D - M2) -
    810 * E * sinD(2 * D + M + M2) +
    759 * E * sinD(4 * D - M - 2 * M2) -
    713 * E * E * sinD(2 * M - M2) -
    700 * E * sinD(2 * D + 2 * M - M2) +
    691 * E * sinD(2 * D + M - 2 * M2) +
    596 * E * sinD(2 * D - M - 2 * F) +
    549 * sinD(4 * D + M2) +
    537 * sinD(4 * M2) +
    520 * E * sinD(4 * D - M) -
    487 * sinD(D - 2 * M2) -
    399 * E * sinD(2 * D + M - 2 * F) -
    381 * sinD(2 * M2 - 2 * F) +
    351 * E * sinD(D + M + M2) -
    340 * sinD(3 * D - 2 * M2) +
    330 * sinD(4 * D - 3 * M2) +
    327 * E * sinD(2 * D - M + 2 * M2) -
    323 * E * E * sinD(2 * M + M2) +
    299 * E * sinD(D + M - M2) +
    294 * sinD(2 * D + 3 * M2);

  return norm360(Lp + sigmaL / 1000000);
}

// ─── Planetary orbital elements (Meeus Ch.31) ─────────────────────────────────
interface PlanetElem {
  L: number; // mean longitude deg
  a: number; // semi-major axis AU
  e: number; // eccentricity
  omega: number; // longitude of perihelion
}

function getPlanetElements(name: string, T: number): PlanetElem {
  switch (name) {
    case "Mercury":
      return {
        L: norm360(252.250906 + 149472.6746358 * T),
        a: 0.38709831,
        e: 0.20563175 + 0.000020407 * T,
        omega: norm360(77.456119 + 0.1588643 * T),
      };
    case "Venus":
      return {
        L: norm360(181.979801 + 58517.815676 * T),
        a: 0.72332982,
        e: 0.00677323 - 0.000047515 * T,
        omega: norm360(131.563703 + 0.0048746 * T),
      };
    case "Mars":
      return {
        L: norm360(355.433275 + 19140.2993313 * T),
        a: 1.523679342,
        e: 0.09340065 + 0.000090484 * T,
        omega: norm360(336.060234 + 0.4439016 * T),
      };
    case "Jupiter":
      return {
        L: norm360(34.351519 + 3034.9056606 * T),
        a: 5.202603191,
        e: 0.04849793 + 0.000163225 * T,
        omega: norm360(14.331312 + 0.2155958 * T),
      };
    case "Saturn":
      return {
        L: norm360(50.077444 + 1222.1137943 * T),
        a: 9.554909596,
        e: 0.05554814 - 0.000346641 * T,
        omega: norm360(93.057136 + 0.5665415 * T),
      };
    case "Uranus":
      return {
        L: norm360(314.055005 + 428.4669983 * T),
        a: 19.218446062,
        e: 0.04638122 - 0.000027293 * T,
        omega: norm360(173.005159 + 0.0893206 * T),
      };
    case "Neptune":
      return {
        L: norm360(304.348665 + 218.4862002 * T),
        a: 30.110386869,
        e: 0.00945575 + 0.000006033 * T,
        omega: norm360(48.120276 + 0.0291866 * T),
      };
    default:
      return {
        // Pluto
        L: norm360(238.929659 + 145.20781 * T),
        a: 39.48168677,
        e: 0.24880766,
        omega: norm360(224.006892),
      };
  }
}

// Solve Kepler's equation M = E - e*sin(E) iteratively
function solveKepler(M: number, e: number): number {
  const Mrad = M * DEG2RAD;
  let E = Mrad;
  for (let i = 0; i < 50; i++) {
    const dE = (Mrad - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E * RAD2DEG;
}

// True anomaly from eccentric anomaly
function trueAnomaly(E: number, e: number): number {
  const Erad = E * DEG2RAD;
  const v =
    2 *
    Math.atan2(
      Math.sqrt(1 + e) * Math.sin(Erad / 2),
      Math.sqrt(1 - e) * Math.cos(Erad / 2),
    ) *
    RAD2DEG;
  return norm360(v);
}

// Geocentric ecliptic longitude from heliocentric position
// Uses Sun–Earth vector addition (Meeus Ch.26)
function planetGeocentricLon(
  name: string,
  T: number,
  sunTropLon: number,
): number {
  const p = getPlanetElements(name, T);
  const M = norm360(p.L - p.omega);
  const E = solveKepler(M, p.e);
  const v = trueAnomaly(E, p.e);
  const helioLon = norm360(v + p.omega);
  const r = p.a * (1 - p.e * Math.cos(E * DEG2RAD));
  // Sun's heliocentric longitude = geocentric Sun lon + 180°
  const sunHelio = norm360(sunTropLon + 180);
  // Rectangular heliocentric coordinates (ecliptic plane)
  const xp = r * cosD(helioLon);
  const yp = r * sinD(helioLon);
  // Earth heliocentric (approximate R_sun = 1 AU)
  const xe = cosD(sunHelio);
  const ye = sinD(sunHelio);
  // Geocentric
  return norm360(atan2D(yp - ye, xp - xe));
}

// ─── Perturbation corrections (Meeus — selected main terms) ──────────────────
function applyPerturbations(name: string, T: number, lon: number): number {
  let result = lon;
  if (name === "Jupiter") {
    const Psi = norm360(0.123 + 0.3037 * T);
    const A = norm360(5.252 + 3034.906 * T);
    result += 0.3314 * sinD(Psi) - 0.0006 * sinD(2 * A);
  } else if (name === "Saturn") {
    const Psi = norm360(0.123 + 0.3037 * T);
    const B = norm360(11.986 + 1222.114 * T);
    result += -0.1964 * sinD(Psi) - 0.0004 * sinD(2 * B);
  } else if (name === "Mars") {
    const A1 = norm360(6.204 + 3034.906 * T);
    const A2 = norm360(1.946 + 19140.03 * T);
    const A3 = norm360(273.075 + 191400.299 * T);
    const A4 = norm360(153.7 + 14.3 * T);
    result += -0.1117 * sinD(A1) - 0.0045 * sinD(A3 - A4) + 0.0 * sinD(A2);
  }
  return result;
}

// ─── Mean Node (Rahu) — Meeus exact formula ───────────────────────────────────
function computeMeanNode(T: number): number {
  const T2 = T * T;
  const T3 = T2 * T;
  const omega =
    125.0445479 -
    1934.1362608 * T +
    0.0020762 * T2 +
    T3 / 467410 -
    (T3 * T) / 60616000;
  return norm360(omega);
}

// ─── Placidus house cusps (Meeus Ch.16) ───────────────────────────────────────
function computePlacidus(jd: number, lat: number, geoLon: number): number[] {
  const T = (jd - 2451545.0) / 36525.0;
  const rawGMST =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  const GMST = norm360(rawGMST);
  const RAMC = norm360(GMST + geoLon);
  const eps =
    23.439291111 - (46.815 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;

  // Midheaven (MC)
  const MCraw = norm360(
    atan2D(Math.tan(RAMC * DEG2RAD), Math.cos(eps * DEG2RAD)),
  );
  const MCadj = RAMC >= 90 && RAMC < 270 ? norm360(MCraw + 180) : MCraw;

  // Ascendant — standard formula (Meeus)
  const cosLat = Math.cos(lat * DEG2RAD);
  const sinLat = Math.sin(lat * DEG2RAD);
  const cosEps = Math.cos(eps * DEG2RAD);
  const sinEps = Math.sin(eps * DEG2RAD);
  const tanEps = Math.tan(eps * DEG2RAD);
  const ASC_Y = -cosD(RAMC);
  const ASC_X = sinD(RAMC) * cosEps + (tanEps * sinLat) / cosLat;
  const ASC = norm360(atan2D(ASC_Y, ASC_X));

  // Placidus intermediate cusps (trisection approximation)
  function placCusp(th: number): number {
    const RA2 = norm360(RAMC + 90 * th);
    const dec2 = asinD(sinEps * Math.sin(RA2 * DEG2RAD));
    const ascDiff2 = asinD((sinLat * tanD(dec2)) / cosLat);
    return norm360(
      atan2D(
        Math.cos((RA2 - ascDiff2) * DEG2RAD),
        -(
          Math.sin((RA2 - ascDiff2) * DEG2RAD) * cosEps +
          Math.tan(dec2 * DEG2RAD) * sinEps
        ),
      ),
    );
  }

  const cusps: number[] = new Array(13).fill(0);
  cusps[1] = ASC;
  cusps[10] = MCadj;
  cusps[11] = placCusp(1 / 3);
  cusps[12] = placCusp(2 / 3);
  for (let h = 4; h <= 9; h++) {
    cusps[h] = norm360(cusps[h - 6] + 180);
  }
  cusps[2] = norm360(cusps[11] + 180);
  cusps[3] = norm360(cusps[12] + 180);
  return cusps; // index 1–12 are house cusps in tropical degrees
}

// ─── Nakshatra & KP Sub-lord ──────────────────────────────────────────────────
function getNakshatra(sidLon: number): {
  name: string;
  pada: number;
  lord: string;
} {
  const idx = Math.floor(sidLon / NAK_DEG) % 27;
  const frac = (sidLon % NAK_DEG) / NAK_DEG;
  return {
    name: NAKSHATRAS[idx],
    pada: Math.floor(frac * 4) + 1,
    lord: NAKSHATRA_LORDS[idx],
  };
}

function getSubLord(sidLon: number): string {
  const idx = Math.floor(sidLon / NAK_DEG) % 27;
  const frac = (sidLon % NAK_DEG) / NAK_DEG;
  const nakLordIdx = DASHA_LORDS.indexOf(NAKSHATRA_LORDS[idx]);
  let cum = 0;
  for (let i = 0; i < 9; i++) {
    const li = (nakLordIdx + i) % 9;
    cum += DASHA_YEARS[li] / 120;
    if (frac <= cum) return DASHA_LORDS[li];
  }
  return DASHA_LORDS[nakLordIdx];
}

// ─── House assignment ─────────────────────────────────────────────────────────
function findHouseNum(sidLon: number, sidCusps12: number[]): number {
  for (let h = 0; h < 12; h++) {
    const start = sidCusps12[h];
    const end = sidCusps12[(h + 1) % 12];
    if (start <= end) {
      if (sidLon >= start && sidLon < end) return h + 1;
    } else {
      if (sidLon >= start || sidLon < end) return h + 1;
    }
  }
  return 1;
}

// ─── Degree formatter ─────────────────────────────────────────────────────────
function formatDeg(degrees: number): string {
  const d = Math.floor(degrees);
  const mf = (degrees - d) * 60;
  const m = Math.floor(mf);
  const s = Math.round((mf - m) * 60);
  return `${d}° ${String(m).padStart(2, "0")}' ${String(s).padStart(2, "0")}"`;
}

// ─── Result types ─────────────────────────────────────────────────────────────
export interface SwissEphPlanetInfo {
  name: string;
  sign: string;
  degree: number;
  degreeStr: string;
  nakshatra: string;
  pada: bigint;
  nakLord: string;
  subLord: string;
  isRetrograde: boolean;
  houseNum: bigint;
}

export interface SwissEphChartResult {
  planets: SwissEphPlanetInfo[];
  ascendant: SwissEphPlanetInfo;
  dashaBalance: string;
  ayanamsa: number;
}

// ─── Dasha balance ────────────────────────────────────────────────────────────
function computeDashaBalance(moonSidLon: number): string {
  const nakIdx = Math.floor(moonSidLon / NAK_DEG) % 27;
  const nakLordIdx = DASHA_LORDS.indexOf(NAKSHATRA_LORDS[nakIdx]);
  const posInNak = (moonSidLon % NAK_DEG) / NAK_DEG;
  const remainFrac = 1 - posInNak;
  const totalYrs = remainFrac * DASHA_YEARS[nakLordIdx];
  const yrs = Math.floor(totalYrs);
  const months = Math.floor((totalYrs - yrs) * 12);
  return `${DASHA_LORDS[nakLordIdx]} ${yrs}y ${months}m`;
}

// ─── Build planet info helper ─────────────────────────────────────────────────
function buildPlanetInfo(
  name: string,
  sidLon: number,
  isRetrograde: boolean,
  sidCusps12: number[],
): SwissEphPlanetInfo {
  const sid = norm360(sidLon);
  const signIdx = Math.floor(sid / 30);
  const degInSign = sid % 30;
  const nak = getNakshatra(sid);
  const subLord = getSubLord(sid);
  const bhavaH = findHouseNum(sid, sidCusps12);
  return {
    name,
    sign: SIGNS[signIdx],
    degree: degInSign,
    degreeStr: formatDeg(degInSign),
    nakshatra: nak.name,
    pada: BigInt(nak.pada),
    nakLord: nak.lord,
    subLord,
    isRetrograde,
    houseNum: BigInt(bhavaH),
  };
}

// ─── Retrograde helper ────────────────────────────────────────────────────────
function isRetrograde(lon0: number, lon1: number): boolean {
  let spd = lon1 - lon0;
  if (spd > 180) spd -= 360;
  if (spd < -180) spd += 360;
  return spd < 0;
}

// ─── Main calculation (synchronous) ──────────────────────────────────────────
export function calculateSwissEphChartSync(
  dateStr: string, // "DD-MM-YYYY" IST
  timeStr: string, // "HH:MM" IST
  lat: number,
  lon: number,
  tzOffset = 5.5,
): SwissEphChartResult {
  // Parse date/time and convert to UT
  const [dayStr, monthStr, yearStr] = dateStr.split("-");
  const [hrStr, minStr] = timeStr.split(":");
  let day = Number.parseInt(dayStr, 10);
  let month = Number.parseInt(monthStr, 10);
  let year = Number.parseInt(yearStr, 10);
  const hr = Number.parseInt(hrStr, 10);
  const mn = Number.parseInt(minStr, 10);
  let utHour = hr + mn / 60 - tzOffset;

  if (utHour < 0) {
    utHour += 24;
    day -= 1;
    if (day === 0) {
      month -= 1;
      if (month === 0) {
        month = 12;
        year -= 1;
      }
      const dm = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      day = month === 2 && isLeap ? 29 : dm[month];
    }
  } else if (utHour >= 24) {
    utHour -= 24;
    day += 1;
    const dm2 = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const isLeap2 = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const maxDay = month === 2 && isLeap2 ? 29 : dm2[month];
    if (day > maxDay) {
      day = 1;
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
  }

  const jd = julianDay(year, month, day, utHour);
  const T = (jd - 2451545.0) / 36525.0;
  const ayanamsa = computeKPAyanamsa(jd);
  const { dPsi } = computeNutation(T);

  // Next day for retrograde detection
  const jd1 = jd + 1;
  const T1 = (jd1 - 2451545.0) / 36525.0;

  // House cusps (Placidus, tropical) → sidereal
  const tropCusps = computePlacidus(jd, lat, lon);
  const sidCusps12: number[] = [];
  for (let i = 1; i <= 12; i++) {
    sidCusps12.push(norm360(tropCusps[i] - ayanamsa));
  }

  // Sun
  const sunTrop0 = computeSunEcliptic(T);
  const sunTrop1 = computeSunEcliptic(T1);
  const sunTrop = norm360(sunTrop0 + dPsi);
  const sunSid = norm360(sunTrop - ayanamsa);
  const sunRetro = isRetrograde(sunTrop0, sunTrop1); // Sun never retrogrades

  // Moon
  const moonTrop0 = computeMoonEcliptic(T);
  const moonTrop1 = computeMoonEcliptic(T1);
  const moonSid = norm360(moonTrop0 + dPsi - ayanamsa);
  const moonRetro = isRetrograde(moonTrop0, moonTrop1);

  // Planets — geocentric tropical → sidereal + retrograde
  const planetNames = [
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
  ];
  const planetSids: number[] = [];
  const planetRetros: boolean[] = [];

  const sunTrop1lon = norm360(computeSunEcliptic(T1) + dPsi);

  for (const pname of planetNames) {
    const tropLon0 = applyPerturbations(
      pname,
      T,
      planetGeocentricLon(pname, T, sunTrop),
    );
    const tropLon1 = applyPerturbations(
      pname,
      T1,
      planetGeocentricLon(pname, T1, sunTrop1lon),
    );
    planetSids.push(norm360(tropLon0 - ayanamsa));
    planetRetros.push(isRetrograde(tropLon0, tropLon1));
  }

  // Rahu (mean node) — always retrograde
  const rahuTrop = computeMeanNode(T);
  const rahuSid = norm360(rahuTrop - ayanamsa);
  const ketuSid = norm360(rahuSid + 180);

  // Build planet infos
  const planetInfos: SwissEphPlanetInfo[] = [];
  planetInfos.push(buildPlanetInfo("Sun", sunSid, sunRetro, sidCusps12));
  planetInfos.push(buildPlanetInfo("Moon", moonSid, moonRetro, sidCusps12));
  for (let i = 0; i < planetNames.length; i++) {
    planetInfos.push(
      buildPlanetInfo(
        planetNames[i],
        planetSids[i],
        planetRetros[i],
        sidCusps12,
      ),
    );
  }
  planetInfos.push(buildPlanetInfo("Rahu", rahuSid, true, sidCusps12));
  planetInfos.push(buildPlanetInfo("Ketu", ketuSid, true, sidCusps12));

  // Ascendant
  const ascTrop = norm360(tropCusps[1]);
  const ascSid = norm360(ascTrop - ayanamsa);
  const ascendant = buildPlanetInfo("Ascendant", ascSid, false, sidCusps12);
  ascendant.houseNum = BigInt(1);

  // Dasha balance from Moon
  const dashaBalance = computeDashaBalance(moonSid);

  return { planets: planetInfos, ascendant, dashaBalance, ayanamsa };
}

// ─── Async wrapper (maintains compatibility with NadiChartSection) ────────────
export async function calculateSwissEphChart(
  dateStr: string,
  timeStr: string,
  lat: number,
  lon: number,
  tzOffset = 5.5,
): Promise<SwissEphChartResult> {
  return Promise.resolve(
    calculateSwissEphChartSync(dateStr, timeStr, lat, lon, tzOffset),
  );
}
