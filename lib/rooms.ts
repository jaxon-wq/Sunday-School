// Door-by-door places in the Willow Park meetinghouse
// (1500 North 2700 West, Lehi), from sheet F102 "Room Signage and
// Location Plan" (Spring Haven & Lehi Utah Willow Park, 1 Jul 2024).
//
// Numbers here are the signs on the doors. They are not the architectural
// plan numbers: plan room 104 is a bishop's office, while the door signed
// "104" is a classroom.

export type RoomZone = "chapel" | "north" | "south" | "foyer";

export type Place = {
  /** Value saved on a class. Matches LCR room text. */
  entry: string;
  /** Other ways the ward writes this room. */
  keys: string[];
  /** Quiet label: "Room 107", "Gym". */
  label: string;
  /** What you look for on the door. */
  door: string;
  /** One line a person can follow without the drawing. */
  where: string;
  zone: RoomZone;
  /** Walk order inside the zone, chapel end first. */
  order: number;
};

export const ZONES: { id: RoomZone; title: string; walk: string }[] = [
  {
    id: "chapel",
    title: "Beside the chapel",
    walk: "Cultural Center One shares a wall with the chapel. Cultural Center Two is the smaller hall just past it.",
  },
  {
    id: "north",
    title: "Classrooms toward Relief Society",
    walk: "From the chapel: 101, 102, 103, 104, 105, 106, 107, 108, then the Relief Society room by the font. Room 109 is beside the materials center, near the ramp to the font hall.",
  },
  {
    id: "south",
    title: "Classrooms toward Primary",
    walk: "From the foyer: 114, 113, the serving area, then 112, 111, 110, the Mother's Room, and Primary.",
  },
  {
    id: "foyer",
    title: "Off the foyer",
    walk: "Four bishop's offices open off the foyers. The sign on each door names the ward.",
  },
];

const numbered = (
  n: number,
  where: string,
  zone: RoomZone,
  order: number
): Place => ({
  entry: String(n),
  keys: [String(n), `room ${n}`],
  label: `Room ${n}`,
  door: String(n),
  where,
  zone,
  order,
});

export const PLACES: Place[] = [
  {
    entry: "Gym",
    keys: ["gym", "cultural hall", "cultural center", "cultural center one", "cc1"],
    label: "Gym",
    door: "Cultural Center One",
    where: "The large hall beside the chapel",
    zone: "chapel",
    order: 0,
  },
  {
    entry: "Cultural Center Two",
    keys: ["cultural center two", "cc2"],
    label: "Cultural Center Two",
    door: "Cultural Center Two",
    where: "The smaller hall just past the gym",
    zone: "chapel",
    order: 1,
  },
  numbered(101, "First classroom past the chapel, toward Relief Society", "north", 101),
  numbered(102, "Second classroom from the chapel, toward Relief Society", "north", 102),
  numbered(103, "Third classroom from the chapel, toward Relief Society", "north", 103),
  numbered(104, "Fourth classroom from the chapel, toward Relief Society", "north", 104),
  numbered(105, "Fifth classroom from the chapel, toward Relief Society", "north", 105),
  numbered(106, "Third door before the Relief Society room", "north", 106),
  numbered(107, "Two doors before the Relief Society room", "north", 107),
  numbered(108, "The classroom door beside the Relief Society room", "north", 108),
  numbered(109, "Beside the materials center, near the ramp to the font hall", "north", 109),
  {
    entry: "Relief Society",
    keys: ["relief society", "rs", "rs room"],
    label: "Relief Society",
    door: "Relief Society",
    where: "Large room at the end of the 101–108 hall, by the baptismal font",
    zone: "north",
    order: 200,
  },
  numbered(114, "First classroom on the Primary side, from the foyer", "south", 0),
  numbered(113, "Second classroom on the Primary side, from the foyer", "south", 1),
  numbered(112, "After the serving area, toward Primary", "south", 2),
  numbered(111, "Second classroom before the Mother's Room", "south", 3),
  numbered(110, "The classroom just before the Mother's Room", "south", 4),
  {
    entry: "Mother's Room",
    keys: ["mothers room", "mother's room"],
    label: "Mother's Room",
    door: "Mother's Room",
    where: "Between room 110 and the Primary room",
    zone: "south",
    order: 5,
  },
  {
    entry: "Primary",
    keys: ["primary", "primary room"],
    label: "Primary",
    door: "Primary",
    where: "Southeast corner, past the Mother's Room",
    zone: "south",
    order: 6,
  },
  {
    entry: "Bishop's Office",
    keys: ["bishop's office", "bishops office", "bishop office"],
    label: "Bishop's Office",
    door: "Bishop's Office",
    where: "Off the foyer. The sign names our ward",
    zone: "foyer",
    order: 0,
  },
];

function normalize(room: string): string {
  return room
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/\b(room|rm)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const BY_KEY = new Map<string, Place>();
for (const place of PLACES) {
  BY_KEY.set(normalize(place.entry), place);
  for (const key of place.keys) BY_KEY.set(normalize(key), place);
}

export function placeFor(room?: string): Place | null {
  if (!room?.trim()) return null;
  return BY_KEY.get(normalize(room)) ?? null;
}

/** Label for a stored room, without turning "Gym" into "Room Gym". */
export function formatRoom(room?: string): string {
  const place = placeFor(room);
  if (place) return place.label;
  const raw = room?.trim() ?? "";
  if (!raw) return "";
  if (/^\d+$/.test(raw)) return `Room ${raw}`;
  return raw;
}

/** Landmark line. Includes the door words when they differ from the label. */
export function roomDetail(room?: string): string {
  const place = placeFor(room);
  if (!place) return "";
  if (place.door !== place.label) return `${place.door} · ${place.where}`;
  return place.where;
}
