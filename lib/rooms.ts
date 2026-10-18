// Rooms for the Willow Park meetinghouse (1500 North 2700 West, Lehi),
// using the numbers printed on the F102 plan. Those numbers are not the
// small door plaques: plan 110 is a clerk's office, while a classroom
// door nearby is plaqued 110.

export type MeetingPlace = {
  /** Label to show for this room. */
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

function spot(sign: string, where: string, known = true): MeetingPlace {
  return { sign, where, known };
}

// Numbers as printed on the plan, not the separate door plaques.
const NUMBERED: Record<string, MeetingPlace> = {
  "100": spot("Vestibule", "South foyer vestibule.", false),
  "101": spot("Foyer", "Foyer south of the chapel.", false),
  "102": spot("Clerk's Office", "Clerk's office south of the chapel.", false),
  "103": spot("Waiting", "Waiting room south of the chapel.", false),
  "104": spot(
    "Bishop's Office",
    "On the plan, 104 is a bishop's office by the sacrament preparation room, not a classroom.",
    false
  ),
  "105": spot("Vestibule", "Vestibule by the sacrament preparation room.", false),
  "106": spot(
    "Sacrament preparation",
    "Sacrament preparation room, not a classroom.",
    false
  ),
  "107": spot(
    "Hallway",
    "On the plan, 107 is the hallway south of the chapel, not a classroom.",
    false
  ),
  "108": spot(
    "Family restroom",
    "Family restroom by the chapel, not a classroom.",
    false
  ),
  "109": spot("Waiting", "Waiting room south of the chapel.", false),
  "110": spot(
    "Clerk's Office",
    "On the plan, 110 is a clerk's office south of the chapel, beside the foyer. The door says Clerk's Office.",
    false
  ),
  "111": spot(
    "Bishop's Office",
    "Bishop's office south of the chapel, next to clerk's office 110.",
    false
  ),
  "112": spot(
    "112",
    "South hallway, the classroom next to the bishop's office by the chapel."
  ),
  "113": spot("113", "South hallway, chapel end."),
  "114": spot("Interview", "Interview room on the south hallway.", false),
  "116": spot("116", "South hallway, toward Primary."),
  "117": spot("117", "South hallway, toward Primary."),
  "118": spot("118", "South hallway, the classroom beside the mother's room."),
  "134": spot(
    "Relief Society",
    "East end of the north hallway, past the row of classrooms."
  ),
  "135": spot(
    "135",
    "North hallway, the last classroom before the Relief Society room."
  ),
  "136": spot("136", "North hallway, toward the Relief Society room."),
  "137": spot("137", "North hallway, toward the Relief Society room."),
  "138": spot("138", "North hallway, chapel end."),
  "139": spot("139", "North hallway, chapel end."),
  "140": spot("140", "North hallway, chapel end."),
  "141": spot("141", "North hallway, chapel end."),
  "142": spot("142", "North hallway, the first classroom from the chapel."),
  "160": spot("Cultural Center One", "The large hall beside the chapel."),
  "161": spot("Cultural Center Two", "The smaller hall, east of Cultural Center One."),
  "166": spot(
    "166",
    "Beside the materials center, at the ramp into Cultural Center Two."
  ),
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
      where: "East end of the north hallway, past the row of classrooms.",
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
  if (numbered) return numbered;
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
