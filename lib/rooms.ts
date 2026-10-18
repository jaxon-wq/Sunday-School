// Rooms and printable door signs for the Willow Park meetinghouse
// (1500 North 2700 West, Lehi) from the F102 Room Signage & Location Plan.
//
// The F102 sheet has two numbering systems:
// 1. Plan room numbers printed inside each room on the architectural drawing
//    (e.g. 135–142 in the north hallway, 112–118 in the south hallway, and
//    110 for the south clerk's office).
// 2. Door signage numbers (6" x 6" wall plaques 101–114) listed in the F102
//    Signage Schedule and mounted beside each classroom door.

export type MeetingPlace = {
  /** Clean room label to show on schedules and door signs (e.g. "Room 107", "Relief Society"). */
  sign: string;
  /** Short badge text for the top of a door sign (e.g. "Room 107", "Relief Society"). */
  badge: string;
  /** Walking directions in the building. */
  where: string;
  /** Warning or clarification when the map number and door plaque differ. */
  note?: string;
  /** True when this is a valid classroom or hall with a known door sign. */
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

function formatRoomBadge(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^\d+$/.test(t)) return `Room ${t}`;
  if (/^room\s+\d+$/i.test(t)) return `Room ${t.replace(/^room\s+/i, "")}`;
  return t;
}

// Classrooms indexed by the number entered in the app.
// Covers both the 6" x 6" door plaques (101–114) and the F102 map room numbers
// (110, 112–118, 134–142, 160, 161, 166), calling out where the two differ.
const NUMBERED: Record<string, Omit<MeetingPlace, "sign" | "badge">> = {
  "101": {
    where: "North hallway, first classroom from the chapel (map room 142).",
    known: true,
  },
  "102": {
    where: "North hallway, second classroom from the chapel (map room 141).",
    known: true,
  },
  "103": {
    where: "North hallway, third classroom from the chapel (map room 140).",
    known: true,
  },
  "104": {
    where: "Door plaque 104 is in the north hallway (map room 139).",
    note: "On the floor plan drawing, room 104 is a bishop’s office by the chapel; door plaque 104 is north-hallway classroom 139.",
    known: true,
  },
  "105": {
    where: "North hallway, fifth classroom from the chapel (map room 138).",
    known: true,
  },
  "106": {
    where: "North hallway, toward the Relief Society room (map room 137).",
    known: true,
  },
  "107": {
    where: "Door plaque 107 is in the north hallway (map room 136).",
    note: "On the floor plan drawing, 107 is the south hallway; door plaque 107 is north-hallway classroom 136.",
    known: true,
  },
  "108": {
    where:
      "North hallway, last classroom before the Relief Society room (map room 135).",
    known: true,
  },
  "109": {
    where:
      "Beside the materials center, at the ramp into Cultural Center Two (map room 166).",
    known: true,
  },
  "110": {
    where:
      "On the floor plan map, 110 is a Clerk’s Office south of the chapel.",
    note: "Map room 110 is a Clerk’s Office. (Door plaque 110 is on south-hallway classroom 118, beside the Mother’s Room.)",
    known: false,
  },
  "111": {
    where:
      "South hallway classroom toward Primary (map room 117 carries door plaque 111).",
    note: "On the floor plan drawing, 111 is a bishop’s office; door plaque 111 is on classroom 117.",
    known: true,
  },
  "112": {
    where:
      "South hallway classroom (map room 112 has door plaque 114; map room 116 has door plaque 112).",
    known: true,
  },
  "113": {
    where: "South hallway, chapel side of the serving area (door plaque 113).",
    known: true,
  },
  "114": {
    where:
      "Door plaque 114 is the south-hallway classroom beside the bishop’s office (map room 112).",
    note: "On the floor plan drawing, 114 is an interview room; door plaque 114 is on classroom 112.",
    known: true,
  },
  "116": {
    where:
      "South hallway, between the serving area and Primary (door plaque 112).",
    known: true,
  },
  "117": {
    where: "South hallway, toward Primary (door plaque 111).",
    known: true,
  },
  "118": {
    where:
      "South hallway, classroom beside the Mother’s Room (door plaque 110).",
    known: true,
  },
  "120": {
    where: "Primary room — south hallway, past the Mother’s Room.",
    known: true,
  },
  "123": {
    where: "High Council room — east wing across from Cultural Center Two.",
    known: true,
  },
  "134": {
    where:
      "Relief Society room — east end of the north hallway, past the classrooms.",
    known: true,
  },
  "135": {
    where:
      "North hallway, last classroom before the Relief Society room (door plaque 108).",
    known: true,
  },
  "136": {
    where: "North hallway, toward the Relief Society room (door plaque 107).",
    known: true,
  },
  "137": {
    where: "North hallway, toward the Relief Society room (door plaque 106).",
    known: true,
  },
  "138": {
    where: "North hallway, fifth classroom from the chapel (door plaque 105).",
    known: true,
  },
  "139": {
    where: "North hallway, fourth classroom from the chapel (door plaque 104).",
    known: true,
  },
  "140": {
    where: "North hallway, third classroom from the chapel (door plaque 103).",
    known: true,
  },
  "141": {
    where: "North hallway, second classroom from the chapel (door plaque 102).",
    known: true,
  },
  "142": {
    where: "North hallway, first classroom from the chapel (door plaque 101).",
    known: true,
  },
  "160": {
    where: "Cultural Center One — the large hall beside the chapel.",
    known: true,
  },
  "161": {
    where: "Cultural Center Two — the smaller hall, east of Cultural Center One.",
    known: true,
  },
  "166": {
    where:
      "Beside the materials center, at the ramp into Cultural Center Two (door plaque 109).",
    known: true,
  },
};

const NAMED: {
  match: (key: string) => boolean;
  sign: string;
  where: string;
  note?: string;
  known?: boolean;
}[] = [
  {
    match: (key) => key === "gym",
    sign: "Gym",
    where: "Cultural Center One is the large hall beside the chapel.",
    note: "Door signs in this building say Cultural Center One (west hall) and Cultural Center Two (east hall), not Gym.",
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
    where: "East end of the north hallway, past the classrooms.",
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
    where: "South hallway, past the Mother’s Room.",
  },
  {
    match: (key) => key === "high council" || key === "high council room",
    sign: "High Council",
    where: "East wing, across from Cultural Center Two.",
  },
  {
    match: (key) => key === "chapel",
    sign: "Chapel",
    where: "West end of the building.",
  },
];

export function placeFor(room?: string): MeetingPlace {
  const raw = room?.trim() ?? "";
  if (!raw) return { sign: "", badge: "", where: "", known: false };
  const key = normalize(raw);
  const numbered = NUMBERED[key];
  if (numbered) {
    const label = `Room ${key}`;
    return {
      sign: label,
      badge: label,
      where: numbered.where,
      note: numbered.note,
      known: numbered.known,
    };
  }
  for (const named of NAMED) {
    if (named.match(key)) {
      return {
        sign: named.sign,
        badge: named.sign,
        where: named.where,
        note: named.note,
        known: named.known !== false,
      };
    }
  }
  const badge = formatRoomBadge(raw);
  return { sign: badge, badge, where: "", known: false };
}

/** Room label for schedules and cards (never replaces a room number with "Hallway"). */
export function doorName(room?: string): string | undefined {
  const place = placeFor(room);
  return place.sign || undefined;
}

/** Whether a class is a youth Sunday School class (or already has a youth roster). */
export function isYouthClass(name: string, roster?: string[]): boolean {
  if (roster && roster.length > 0) return true;
  return /\b(course\s*1[1-8]|youth|deacons?|teachers?|priests?|beehives?|mia\s*maids?|laurels?|young\s+men|young\s+women|ages?\s*1[1-8])\b/i.test(
    name
  );
}

/** Friendly age subtitle for youth Sunday School courses on door signs. */
export function youthAgeLabel(name: string): string | undefined {
  const nums = [...name.matchAll(/\bcourse\s*(1[1-8])\b/gi)].map((m) =>
    Number(m[1])
  );
  if (nums.length === 1) {
    return `Youth · Turning ${nums[0]} in 2026`;
  }
  if (nums.length >= 2) {
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    return min === max
      ? `Youth · Turning ${min} in 2026`
      : `Youth · Ages ${min}–${max}`;
  }
  if (/\byouth\b/i.test(name)) {
    return "Youth Sunday School";
  }
  return undefined;
}

function flipLastFirst(raw: string): string {
  const m = raw.trim().match(/^([^,]+),\s*(.+)$/);
  if (!m) return raw.trim();
  return `${m[2].trim()} ${m[1].trim()}`;
}

const ROSTER_NOISE =
  /^(name|preferred name|gender|age|birth\s*date|phone|e-?mail|count\s*:|for church use only|intellectual reserve|sunday school|class roster|members|students|teachers?|leader|all|filter|print|options|\d+)$/i;

/**
 * Parse a pasted class roster (either one name per line or a copy-pasted LCR
 * class roll with columns like "Last, First \t Male \t 14 \t 12 May 2012").
 */
export function parseRosterText(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const rawLine of raw.split(/\r?\n/)) {
    let line = rawLine
      .trim()
      .replace(/^\d+[.)]\s*/, "")
      .replace(/^[-•*]\s*/, "");
    if (!line) continue;

    // Take the first tab-separated column when pasted from an LCR table.
    if (line.includes("\t")) {
      line = line.split("\t")[0].trim();
    }

    // Strip trailing LCR columns if space-separated (Gender / Age / Birthdate / Phone).
    line = line
      .replace(/\s+(?:Male|Female|[MF])\s+\d{1,2}\b.*$/i, "")
      .replace(/\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\b.*$/, "")
      .replace(/\s+\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}.*$/, "")
      .trim();

    if (!line || ROSTER_NOISE.test(line)) continue;
    if (/^course\s*1[1-8]/i.test(line)) continue;

    const name = flipLastFirst(line).replace(/\s+/g, " ").trim();
    if (!name || ROSTER_NOISE.test(name)) continue;

    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(name);
    }
  }

  return out;
}
