// Door signs and walking notes for the Willow Park meetinghouse
// (1500 North 2700 West, Lehi). Taken from the F102 room-signage plan:
// hallway signs say 101–114; plan numbers underneath are different.
// "Gym" is not a door sign here. The halls are Cultural Center One and Two.

export type MeetingPlace = {
  /** What the door sign says. */
  sign: string;
  /** How to walk there. Empty when the room is not on this plan. */
  where: string;
  known: boolean;
};

function normalize(room: string): string {
  return room
    .trim()
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/^room\s+/, "")
    .replace(/^the\s+/, "")
    .replace(/\s+/g, " ");
}

const NUMBERED: Record<string, string> = {
  "101": "North hallway, first classroom from the chapel.",
  "102": "North hallway, chapel end.",
  "103": "North hallway, chapel end.",
  "104": "North hallway, chapel end.",
  "105": "North hallway, toward the Relief Society room.",
  "106": "North hallway, toward the Relief Society room.",
  "107": "North hallway, toward the Relief Society room.",
  "108": "North hallway, last classroom before the Relief Society room.",
  "109": "Beside the materials center, at the ramp into Cultural Center Two.",
  "110": "South hallway, beside the mother’s room.",
  "111": "South hallway, Primary end.",
  "112": "South hallway, Primary end.",
  "113": "South hallway, chapel side of the serving area.",
  "114": "South hallway, beside the bishop’s office at the chapel.",
};

const NAMED: {
  match: (key: string) => boolean;
  sign: string;
  where: string;
  known?: boolean;
}[] = [
    {
      match: (key) => key === "gym",
      sign: "Gym",
      where:
        "No door in this building says Gym. Cultural Center One is the large hall beside the chapel. Cultural Center Two is the smaller hall.",
      known: false,
    },
    {
      match: (key) =>
        key === "cultural hall" ||
        key === "cultural center" ||
        key === "cultural center one" ||
        key === "cultural center 1",
      sign: "Cultural Center One",
      where: "The large hall beside the chapel.",
    },
    {
      match: (key) =>
        key === "cultural center two" ||
        key === "cultural center 2" ||
        key === "small gym",
      sign: "Cultural Center Two",
      where: "The smaller hall, east of Cultural Center One.",
    },
    {
      match: (key) =>
        key === "relief society" ||
        key === "rs" ||
        key === "relief society room",
      sign: "Relief Society",
      where: "East end of the north hallway, past room 108.",
    },
    {
      match: (key) => /^bishop(?:s)? office$/.test(key) || key === "bishop",
      sign: "Bishop's Office",
      where:
        "Use the office signed for this ward. Four bishop’s offices sit at the corners of the chapel.",
    },
    {
      match: (key) => key === "primary" || key === "primary room",
      sign: "Primary",
      where: "South hallway, past the mother’s room.",
    },
  ];

export function placeFor(room?: string): MeetingPlace {
  const raw = room?.trim() ?? "";
  if (!raw) return { sign: "", where: "", known: false };
  const key = normalize(raw);
  const numbered = NUMBERED[key];
  if (numbered) return { sign: key, where: numbered, known: true };
  for (const named of NAMED) {
    if (named.match(key))
      return {
        sign: named.sign,
        where: named.where,
        known: named.known !== false,
      };
  }
  return { sign: raw, where: "", known: false };
}

/** Door-sign text for a roster room, or the room as entered. */
export function doorName(room?: string): string | undefined {
  const place = placeFor(room);
  return place.sign || undefined;
}
