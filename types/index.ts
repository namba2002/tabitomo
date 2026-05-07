export type Season = "spring" | "summer" | "autumn" | "winter" | "undecided";

export interface Room {
  id: string;
  slug: string;
  name: string;
  created_at: string;
}

export interface Item {
  id: string;
  room_id: string;
  title: string;
  season: Season;
  memo: string | null;
  url: string | null;
  is_done: boolean;
  created_at: string;
  done_at: string | null;
}
