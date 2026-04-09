// nadiChartEngine.ts — Display helpers for Nadi Chart
// Kept: nadiFormatDeg, NadiDashaData, NadiDashaEntry types, calcDasha
// Removed: All VSOP87B planetary calculation code (replaced by swissEphEngine.ts)

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface NadiDashaEntry {
  lord: string;
  startDate: Date;
  endDate: Date;
  antardashas?: NadiDashaEntry[];
  pratyantars?: NadiDashaEntry[];
}

export interface NadiDashaData {
  mahadashas: NadiDashaEntry[];
}

// ─── Format helper ─────────────────────────────────────────────────────────────
export function nadiFormatDeg(degrees: number): string {
  const d = Math.floor(degrees);
  const mf = (degrees - d) * 60;
  const m = Math.floor(mf);
  const s = Math.round((mf - m) * 60);
  return `${d}° ${String(m).padStart(2, "0")}' ${String(s).padStart(2, "0")}"`;
}

// ─── Dasha constants ───────────────────────────────────────────────────────────
const NAK_DEG = 360 / 27;
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

function addYears(date: Date, years: number): Date {
  return new Date(date.getTime() + years * 365.25 * 24 * 60 * 60 * 1000);
}

// ─── Dasha Calculation ─────────────────────────────────────────────────────────
export function calcDasha(birthDate: Date, moonSidLon: number): NadiDashaData {
  const nakIdx = Math.floor(moonSidLon / NAK_DEG) % 27;
  const nakLordIdx = DASHA_LORDS.indexOf(NAKSHATRA_LORDS[nakIdx]);
  const posInNak = (moonSidLon % NAK_DEG) / NAK_DEG;
  const remainFrac = 1 - posInNak;
  const mahadashas: NadiDashaEntry[] = [];
  let cur = birthDate;
  for (let i = 0; i < 9; i++) {
    const li = (nakLordIdx + i) % 9;
    const mdYears = i === 0 ? remainFrac * DASHA_YEARS[li] : DASHA_YEARS[li];
    const mdEnd = addYears(cur, mdYears);
    const antardashas: NadiDashaEntry[] = [];
    let adCur = cur;
    for (let j = 0; j < 9; j++) {
      const ali = (li + j) % 9;
      const adYears = (DASHA_YEARS[ali] / 120) * mdYears;
      const adEnd = addYears(adCur, adYears);
      const pratyantars: NadiDashaEntry[] = [];
      let ptCur = adCur;
      for (let k = 0; k < 9; k++) {
        const pli = (ali + k) % 9;
        const ptYears = (DASHA_YEARS[pli] / 120) * adYears;
        const ptEnd = addYears(ptCur, ptYears);
        pratyantars.push({
          lord: DASHA_LORDS[pli],
          startDate: ptCur,
          endDate: ptEnd,
        });
        ptCur = ptEnd;
      }
      antardashas.push({
        lord: DASHA_LORDS[ali],
        startDate: adCur,
        endDate: adEnd,
        pratyantars,
      });
      adCur = adEnd;
    }
    mahadashas.push({
      lord: DASHA_LORDS[li],
      startDate: cur,
      endDate: mdEnd,
      antardashas,
    });
    cur = mdEnd;
  }
  const CORRECTION_MS = -3 * 24 * 60 * 60 * 1000;
  function shiftDate(d: Date) {
    return new Date(d.getTime() + CORRECTION_MS);
  }
  for (const md of mahadashas) {
    md.startDate = shiftDate(md.startDate);
    md.endDate = shiftDate(md.endDate);
    if (md.antardashas) {
      for (const ad of md.antardashas) {
        ad.startDate = shiftDate(ad.startDate);
        ad.endDate = shiftDate(ad.endDate);
        if (ad.pratyantars) {
          for (const pt of ad.pratyantars) {
            pt.startDate = shiftDate(pt.startDate);
            pt.endDate = shiftDate(pt.endDate);
          }
        }
      }
    }
  }
  return { mahadashas };
}
