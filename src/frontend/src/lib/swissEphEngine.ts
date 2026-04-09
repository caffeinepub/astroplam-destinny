// swissEphEngine.ts — Swiss Ephemeris (WebAssembly) calculation engine for Nadi Chart
// Uses @swisseph/browser (WASM) for true JPL/Moshier sub-arcsecond precision
// Replaces all VSOP87B JavaScript approximations
// KP Ayanamsa = Lahiri + 6 arcminutes (0.1°) — matches Parashara Hora
// Rahu = Mean Node (LunarPoint.MeanNode=10), always retrograde
// Reference: 05-02-2008 15:50 IST (10:20 UT) — Mars Tau 29°59', Moon Cap 1°22'

// CJS-bundled package — import default class only, use numeric constants for enums
// biome-ignore lint: need default import from CJS bundle
import SwissEphemeris from "@swisseph/browser";

// Swiss Ephemeris planet constants (from @swisseph/core Planet enum)
const SWE_SUN = 0;
const SWE_MOON = 1;
const SWE_MERCURY = 2;
const SWE_VENUS = 3;
const SWE_MARS = 4;
const SWE_JUPITER = 5;
const SWE_SATURN = 6;
const SWE_URANUS = 7;
const SWE_NEPTUNE = 8;
const SWE_PLUTO = 9;
const SWE_MEAN_NODE = 10; // Rahu (LunarPoint.MeanNode)
const SWE_HOUSE_PLACIDUS = "P"; // HouseSystem.Placidus

// ─── Singleton WASM instance ──────────────────────────────────────────────────
let _swe: InstanceType<typeof SwissEphemeris> | null = null;
let _initPromise: Promise<InstanceType<typeof SwissEphemeris>> | null = null;

async function getSwe(): Promise<InstanceType<typeof SwissEphemeris>> {
  if (_swe) return _swe;
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const instance = new SwissEphemeris();
    await instance.init();
    _swe = instance;
    return instance;
  })();
  return _initPromise;
}

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
const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17]; // sums to 120

const NAK_DEG = 360 / 27; // 13.333...°

// ─── KP Ayanamsa (Lahiri IAU 1956 + 6 arcminutes) ────────────────────────────
// Formula: Lahiri = 23°51'11.4" at J1900.0, precesses at 50.2388475"/year
// This formula closely matches Swiss Ephemeris Lahiri ayanamsa
function computeKPAyanamsa(jd: number): number {
  // Lahiri ayanamsa — Jean Meeus / IAU standard formula
  // T = Julian centuries from J2000.0
  const T = (jd - 2451545.0) / 36525.0;
  // Lahiri (Chitrapaksha) ayanamsa:
  // = 23.853333 + (1.396042 + 0.000308 * T) * T at J2000.0 epoch
  // More accurate: use the Chapront mean longitude approach
  // Lahiri at J2000.0 = 23°51'11" = 23.8531°
  // Rate ≈ 1.396042°/century = 50.29"/year
  const lahiri = 23.85106 + (1.396042 + 0.000308 * T) * T;
  // KP ayanamsa = Lahiri + 6 arcminutes (0.1°)
  let ayan = lahiri + 0.1;
  // Normalize to 0–360
  ayan = ((ayan % 360) + 360) % 360;
  return ayan;
}

function norm360(v: number): number {
  return ((v % 360) + 360) % 360;
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
// cusps[1..12] are tropical — we apply ayanamsa to get sidereal house cusps
function findHouseNum(sidLon: number, sidCusps: number[]): number {
  for (let h = 0; h < 12; h++) {
    const start = sidCusps[h];
    const end = sidCusps[(h + 1) % 12];
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

// ─── Result type (matches NadiPlanetInfo from backend.d.ts) ──────────────────
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

// ─── Main calculation ─────────────────────────────────────────────────────────
export async function calculateSwissEphChart(
  dateStr: string, // "DD-MM-YYYY" in local time (IST)
  timeStr: string, // "HH:MM" in local time (IST)
  lat: number,
  lon: number,
  tzOffset = 5.5, // UTC offset in hours (5.5 for IST)
): Promise<SwissEphChartResult> {
  const swe = await getSwe();

  // Parse date/time
  const [dayStr, monthStr, yearStr] = dateStr.split("-");
  const [hrStr, minStr] = timeStr.split(":");
  const day = Number.parseInt(dayStr, 10);
  const month = Number.parseInt(monthStr, 10);
  const year = Number.parseInt(yearStr, 10);
  const hr = Number.parseInt(hrStr, 10);
  const min = Number.parseInt(minStr, 10);

  // Convert local time (IST) to UT
  const localDecimalHour = hr + min / 60;
  let utHour = localDecimalHour - tzOffset;
  let utDay = day;
  let utMonth = month;
  let utYear = year;

  if (utHour < 0) {
    utHour += 24;
    utDay--;
    if (utDay === 0) {
      utMonth--;
      if (utMonth === 0) {
        utMonth = 12;
        utYear--;
      }
      const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const isLeap =
        (utYear % 4 === 0 && utYear % 100 !== 0) || utYear % 400 === 0;
      utDay = utMonth === 2 && isLeap ? 29 : daysInMonth[utMonth];
    }
  } else if (utHour >= 24) {
    utHour -= 24;
    utDay++;
    const daysInMonth2 = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const isLeap2 =
      (utYear % 4 === 0 && utYear % 100 !== 0) || utYear % 400 === 0;
    const maxDay = utMonth === 2 && isLeap2 ? 29 : daysInMonth2[utMonth];
    if (utDay > maxDay) {
      utDay = 1;
      utMonth++;
      if (utMonth > 12) {
        utMonth = 1;
        utYear++;
      }
    }
  }

  // Julian Day (UT)
  const jd = swe.julianDay(utYear, utMonth, utDay, utHour);

  // KP Ayanamsa
  const ayanamsa = computeKPAyanamsa(jd);

  // House cusps (tropical) — Placidus
  const houseData = swe.calculateHouses(
    jd,
    lat,
    lon,
    SWE_HOUSE_PLACIDUS as Parameters<typeof swe.calculateHouses>[3],
  );
  // cusps[0] unused, cusps[1..12] are house cusps (tropical degrees)
  const tropCusps = houseData.cusps; // 13-element array, index 1-12 used
  // Convert to sidereal for KP house assignment
  const sidCusps: number[] = [];
  for (let i = 0; i < 13; i++) {
    sidCusps.push(norm360(tropCusps[i] - ayanamsa));
  }
  // sidCusps[1..12] are house cusps in sidereal degrees

  const ascTrop = houseData.ascendant; // tropical Ascendant
  const ascSid = norm360(ascTrop - ayanamsa);

  // Working sidereal cusps as 0-indexed array for findHouseNum
  const sidCusps12 = sidCusps.slice(1, 13); // [0..11] = houses 1..12

  // ─── Planet bodies to calculate ─────────────────────────────────────────
  const planetBodies: Array<{ name: string; body: number }> = [
    { name: "Sun", body: SWE_SUN },
    { name: "Moon", body: SWE_MOON },
    { name: "Mars", body: SWE_MARS },
    { name: "Mercury", body: SWE_MERCURY },
    { name: "Jupiter", body: SWE_JUPITER },
    { name: "Venus", body: SWE_VENUS },
    { name: "Saturn", body: SWE_SATURN },
    { name: "Uranus", body: SWE_URANUS },
    { name: "Neptune", body: SWE_NEPTUNE },
    { name: "Pluto", body: SWE_PLUTO },
  ];

  const planetInfos: SwissEphPlanetInfo[] = [];

  for (const pb of planetBodies) {
    const pos = swe.calculatePosition(jd, pb.body);
    const tropLon = pos.longitude;
    const sidLon = norm360(tropLon - ayanamsa);
    const signIdx = Math.floor(sidLon / 30);
    const degInSign = sidLon % 30;
    const nak = getNakshatra(sidLon);
    const subLord = getSubLord(sidLon);
    const bhavaH = findHouseNum(sidLon, sidCusps12);
    const isRetrograde = pos.longitudeSpeed < 0;

    planetInfos.push({
      name: pb.name,
      sign: SIGNS[signIdx],
      degree: degInSign,
      degreeStr: formatDeg(degInSign),
      nakshatra: nak.name,
      pada: BigInt(nak.pada),
      nakLord: nak.lord,
      subLord,
      isRetrograde,
      houseNum: BigInt(bhavaH),
    });
  }

  // ─── Rahu (Mean Node) and Ketu ───────────────────────────────────────────
  const rahuPos = swe.calculatePosition(jd, SWE_MEAN_NODE);
  const rahuTrop = rahuPos.longitude;
  const rahuSid = norm360(rahuTrop - ayanamsa);
  const rahuSignIdx = Math.floor(rahuSid / 30);
  const rahuDeg = rahuSid % 30;
  const rahuNak = getNakshatra(rahuSid);
  const rahuBhava = findHouseNum(rahuSid, sidCusps12);

  planetInfos.push({
    name: "Rahu",
    sign: SIGNS[rahuSignIdx],
    degree: rahuDeg,
    degreeStr: formatDeg(rahuDeg),
    nakshatra: rahuNak.name,
    pada: BigInt(rahuNak.pada),
    nakLord: rahuNak.lord,
    subLord: getSubLord(rahuSid),
    isRetrograde: true, // mean node always retrograde
    houseNum: BigInt(rahuBhava),
  });

  // Ketu = Rahu + 180°
  const ketuSid = norm360(rahuSid + 180);
  const ketuSignIdx = Math.floor(ketuSid / 30);
  const ketuDeg = ketuSid % 30;
  const ketuNak = getNakshatra(ketuSid);
  const ketuBhava = findHouseNum(ketuSid, sidCusps12);

  planetInfos.push({
    name: "Ketu",
    sign: SIGNS[ketuSignIdx],
    degree: ketuDeg,
    degreeStr: formatDeg(ketuDeg),
    nakshatra: ketuNak.name,
    pada: BigInt(ketuNak.pada),
    nakLord: ketuNak.lord,
    subLord: getSubLord(ketuSid),
    isRetrograde: true, // always retrograde
    houseNum: BigInt(ketuBhava),
  });

  // ─── Ascendant ────────────────────────────────────────────────────────────
  const ascSignIdx = Math.floor(ascSid / 30);
  const ascDeg = ascSid % 30;
  const ascNak = getNakshatra(ascSid);
  const ascendant: SwissEphPlanetInfo = {
    name: "Ascendant",
    sign: SIGNS[ascSignIdx],
    degree: ascDeg,
    degreeStr: formatDeg(ascDeg),
    nakshatra: ascNak.name,
    pada: BigInt(ascNak.pada),
    nakLord: ascNak.lord,
    subLord: getSubLord(ascSid),
    isRetrograde: false,
    houseNum: BigInt(1),
  };

  // ─── Dasha balance (from Moon) ────────────────────────────────────────────
  const moonInfo = planetInfos.find((p) => p.name === "Moon");
  const moonSignIdx = moonInfo ? SIGNS.indexOf(moonInfo.sign) : 0;
  const moonSidLon = moonSignIdx * 30 + (moonInfo?.degree ?? 0);
  const dashaBalance = computeDashaBalance(moonSidLon);

  return {
    planets: planetInfos,
    ascendant,
    dashaBalance,
    ayanamsa,
  };
}

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
