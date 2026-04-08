export interface BlueCard {
  type: "blue";
  house: number;
  name: string;
  id: string;
}

export interface RedCard {
  type: "red";
  planet: string;
  planetIndex: number;
  id: string;
}

export interface YellowCard {
  type: "yellow";
  rasiNumber: number;
  id: string;
}

export type NadiCardData = BlueCard | RedCard | YellowCard;

export interface DisplayCard {
  card: NadiCardData;
  revealed: boolean;
  displayId: string;
}

export interface DisplayRow {
  index: number;
  cards: DisplayCard[];
  complete: boolean;
}

export type AppPhase = "idle" | "wished" | "shuffled" | "reading" | "complete";
