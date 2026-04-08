import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActorWithConfig } from "../config";
import { useActor } from "./useActor";

const ADMIN_USERNAME = "vikaskharb00007@gmail.com";
const ADMIN_PASSWORD = "Vikas00007@admin";
const CHARTS_KEY = "vedic_saved_charts";

// ─── Chart type (localStorage-backed) ──────────────────────────────────────

export interface Chart {
  id: bigint;
  name: string;
  dob: string;
  basicNumber: bigint;
  destinyNumber: bigint;
  chartNumbers: bigint[];
}

function loadCharts(): Chart[] {
  try {
    const raw = localStorage.getItem(CHARTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<{
      id: string;
      name: string;
      dob: string;
      basicNumber: string;
      destinyNumber: string;
      chartNumbers: string[];
    }>;
    return parsed.map((c) => ({
      ...c,
      id: BigInt(c.id),
      basicNumber: BigInt(c.basicNumber),
      destinyNumber: BigInt(c.destinyNumber),
      chartNumbers: c.chartNumbers.map((n) => BigInt(n)),
    }));
  } catch {
    return [];
  }
}

function saveCharts(charts: Chart[]) {
  const serializable = charts.map((c) => ({
    ...c,
    id: c.id.toString(),
    basicNumber: c.basicNumber.toString(),
    destinyNumber: c.destinyNumber.toString(),
    chartNumbers: c.chartNumbers.map((n) => n.toString()),
  }));
  localStorage.setItem(CHARTS_KEY, JSON.stringify(serializable));
}

export function useGetAllCharts() {
  return useQuery<Chart[]>({
    queryKey: ["vedic_charts"],
    queryFn: () => loadCharts(),
  });
}

export function useCreateChart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      dob,
      basicNumber,
      destinyNumber,
      chartNumbers,
    }: {
      name: string;
      dob: string;
      basicNumber: number;
      destinyNumber: number;
      chartNumbers: number[];
    }) => {
      const charts = loadCharts();
      const newChart: Chart = {
        id: BigInt(Date.now()),
        name,
        dob,
        basicNumber: BigInt(basicNumber),
        destinyNumber: BigInt(destinyNumber),
        chartNumbers: chartNumbers.map((n) => BigInt(n)),
      };
      saveCharts([...charts, newChart]);
      return newChart;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vedic_charts"] });
    },
  });
}

export function useDeleteChart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      const charts = loadCharts().filter((c) => c.id !== id);
      saveCharts(charts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vedic_charts"] });
    },
  });
}

// ─── Auth Hooks ──────────────────────────────────────────────────────────────

export function useLoginUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }) => {
      if (!actor) throw new Error("Actor not ready");
      const level = await (actor as any).numerologyLogin(username, password);
      return Number(level);
    },
  });
}

export function useListUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["vedic_admin", "users"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).numerologyListUsers(ADMIN_USERNAME, ADMIN_PASSWORD);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      password,
      sectionLevel,
    }: { username: string; password: string; sectionLevel: number }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).numerologyCreateUser(
        ADMIN_USERNAME,
        ADMIN_PASSWORD,
        username,
        password,
        BigInt(sectionLevel),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vedic_admin", "users"] });
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).numerologyDeleteUser(
        ADMIN_USERNAME,
        ADMIN_PASSWORD,
        username,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vedic_admin", "users"] });
    },
  });
}

export function useUpdateUserLevel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      sectionLevel,
    }: { username: string; sectionLevel: number }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateNumerologyUserLevel?.(
        username,
        BigInt(sectionLevel),
        ADMIN_PASSWORD,
        ADMIN_USERNAME,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vedic_admin", "users"] });
    },
  });
}

export function useGetFreeEmailClaims() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["vedic_admin", "free_emails"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getFreeEmailClaims?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimFreeAccess() {
  return useMutation({
    mutationFn: async (email: string) => {
      const anonActor = await createActorWithConfig();
      return (anonActor as any).claimFreeAccess?.(email);
    },
  });
}

export function useCheckFreeAccess() {
  return useMutation({
    mutationFn: async (email: string) => {
      const anonActor = await createActorWithConfig();
      return (anonActor as any).checkFreeAccessClaimed?.(email);
    },
  });
}

export function useSetUserAccessExpiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      durationDays,
    }: { username: string; durationDays: number }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).setUserAccessExpiry?.(
        username,
        BigInt(durationDays),
        ADMIN_PASSWORD,
        ADMIN_USERNAME,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vedic_admin", "users"] });
    },
  });
}

export function useGetUserAccessExpiry(username: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["vedic_admin", "expiry", username],
    queryFn: async () => {
      if (!actor) return null;
      const result = await (actor as any).getUserAccessExpiry?.(username);
      return result && result.length > 0 ? Number(result[0]) : null;
    },
    enabled: !!actor && !isFetching && !!username,
  });
}
