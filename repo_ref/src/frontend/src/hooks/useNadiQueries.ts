import { useMutation } from "@tanstack/react-query";

interface NadiCardRow {
  planet: string;
  blueHouseCards: Array<string>;
  yellowRasiCard?: bigint;
}

// Lightweight save hook - readings are local-only in this app
export function useSaveNadiReading() {
  return useMutation({
    mutationFn: async (_data: { wishText: string; rows: NadiCardRow[] }) => {
      return BigInt(0);
    },
  });
}
