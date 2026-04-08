import type { ChartResult } from "@/lib/kpEngine";

function reviveDashaEntry(e: any): any {
  return {
    ...e,
    startDate: new Date(e.startDate),
    endDate: new Date(e.endDate),
    antardashas: e.antardashas?.map(reviveDashaEntry),
    pratyantars: e.pratyantars?.map(reviveDashaEntry),
  };
}

export function reviveChartResult(data: any): ChartResult {
  if (!data) return data;
  return {
    ...data,
    birthDate: data.birthDate ? new Date(data.birthDate) : new Date(),
    dasha: data.dasha?.mahadashas
      ? { mahadashas: data.dasha.mahadashas.map(reviveDashaEntry) }
      : { mahadashas: [] },
  };
}
