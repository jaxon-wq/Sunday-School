"use client";

// Parse an LCR "Organizations and Callings" print (Sunday School section)
// into presidency, classes, and teachers. Vacancies are skipped.
// Names arrive as "Last, First" and are flipped to "First Last".

import { AppData, PresidencyRole, Teacher, SSClass, uid } from "./store";

export type LcrImportResult = {
  presidency: AppData["presidency"];
  teachers: Teacher[];
  classes: SSClass[];
  skippedVacancies: number;
  warnings: string[];
};

const ROLE_MAP: Record<string, PresidencyRole> = {
  "sunday school president": "President",
  "sunday school first counselor": "First Counselor",
  "sunday school second counselor": "Second Counselor",
  "sunday school secretary": "Secretary",
};

function flipName(raw: string): string {
  const m = raw.trim().match(/^([^,]+),\s*(.+)$/);
  if (!m) return raw.trim();
  return `${m[2].trim()} ${m[1].trim()}`;
}

function isVacant(name: string): boolean {
  return /calling\s+vacant/i.test(name) || /^vacant$/i.test(name.trim());
}

function isNoise(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  if (/^calling\s+name\s+sustained/i.test(t)) return true;
  if (/^count:\s*\d+/i.test(t)) return true;
  if (/organizations and callings/i.test(t)) return true;
  if (/for church use only/i.test(t)) return true;
  if (/intellectual reserve/i.test(t)) return true;
  if (/^\d+$/.test(t)) return true;
  return false;
}

type Section =
  | { kind: "presidency" }
  | { kind: "class"; name: string; room?: string }
  | { kind: "unassigned" }
  | { kind: "skip"; label: string };

function parseSectionHeader(line: string): Section | null {
  const t = line.trim();
  if (/^sunday school presidency$/i.test(t)) return { kind: "presidency" };
  if (/^unassigned teachers$/i.test(t)) return { kind: "unassigned" };
  if (/^resource center$/i.test(t)) return { kind: "skip", label: t };

  // "Adult Sunday School Room: Gym" or "Course 13, Course 14 Room: 104"
  const withRoom = t.match(/^(.*?)\s+Room:\s*(.+)$/i);
  if (withRoom) {
    return {
      kind: "class",
      name: withRoom[1].trim(),
      room: withRoom[2].trim(),
    };
  }
  return null;
}

function parseCallingLine(
  line: string
): { calling: string; name: string } | null {
  const t = line.trim();
  // "Sunday School Teacher Clements, Brooks 18 Jan 2026"
  // "Sunday School President Munns, Jaxon 5 Jul 2026"
  // "Sunday School Teacher Turner, Tyler 11 Jan 2026 ✓"
  // "Sunday School Teacher Calling Vacant"
  const m = t.match(
    /^(Sunday School (?:President|First Counselor|Second Counselor|Secretary|Teacher)|Resource Center Specialist)\s+(.+?)(?:\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4})?(?:\s+[✓✔])?\s*$/i
  );
  if (!m) return null;
  return { calling: m[1].trim(), name: m[2].trim() };
}

export function parseLcrOrganizationsText(text: string): LcrImportResult {
  const warnings: string[] = [];
  let skippedVacancies = 0;

  const presidency: AppData["presidency"] = [
    { role: "President", name: "" },
    { role: "First Counselor", name: "" },
    { role: "Second Counselor", name: "" },
    { role: "Secretary", name: "" },
  ];
  const teachers: Teacher[] = [];
  const classes: SSClass[] = [];
  const teacherIndex = new Map<string, string>(); // lower name -> id

  function ensureTeacher(name: string, substitute?: boolean): string {
    const key = name.toLowerCase();
    const existing = teacherIndex.get(key);
    if (existing) {
      if (substitute) {
        const t = teachers.find((x) => x.id === existing);
        if (t) t.substitute = true;
      }
      return existing;
    }
    const id = uid();
    teachers.push({ id, name, substitute: substitute || undefined });
    teacherIndex.set(key, id);
    return id;
  }

  let section: Section | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    if (isNoise(rawLine)) continue;
    const header = parseSectionHeader(rawLine);
    if (header) {
      section = header;
      if (header.kind === "class") {
        classes.push({
          id: uid(),
          name: header.name,
          room: header.room,
          teacherIds: [],
        });
      }
      continue;
    }
    if (!section || section.kind === "skip") continue;

    const row = parseCallingLine(rawLine);
    if (!row) continue;
    if (isVacant(row.name)) {
      skippedVacancies++;
      continue;
    }

    const display = flipName(row.name);

    if (section.kind === "presidency") {
      const role = ROLE_MAP[row.calling.toLowerCase()];
      if (role) {
        const slot = presidency.find((p) => p.role === role);
        if (slot) slot.name = display;
      }
      continue;
    }

    if (section.kind === "unassigned") {
      ensureTeacher(display, true);
      continue;
    }

    if (section.kind === "class") {
      const id = ensureTeacher(display);
      const cls = classes[classes.length - 1];
      if (cls && !cls.teacherIds.includes(id)) cls.teacherIds.push(id);
    }
  }

  if (teachers.length === 0)
    warnings.push("No teachers found — is this an Organizations and Callings Sunday School print?");
  if (classes.length === 0)
    warnings.push("No classes found.");

  return { presidency, teachers, classes, skippedVacancies, warnings };
}

/** Merge an LCR parse into existing app data (replaces roster fields). */
export function applyLcrImport(data: AppData, parsed: LcrImportResult): AppData {
  return {
    ...data,
    presidency: parsed.presidency.map((p, i) => ({
      ...p,
      // keep phone if same role already had one and name matches
      phone:
        data.presidency[i]?.name === p.name
          ? data.presidency[i]?.phone
          : p.phone,
    })),
    teachers: parsed.teachers,
    classes: parsed.classes,
    // drop overrides that pointed at old class/teacher ids
    overrides: [],
  };
}

export function isLcrOrganizationsPaste(text: string): boolean {
  return (
    /sunday school presidency/i.test(text) ||
    (/sunday school teacher/i.test(text) && /room:/i.test(text))
  );
}
