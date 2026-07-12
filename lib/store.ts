"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  decryptJson,
  deriveKey,
  encryptJson,
  isLockedBlob,
  randomSaltB64,
  unb64,
} from "./crypto";
import { LESSONS, parseISODate, sundayOccurrence } from "./lessons";
import {
  initSync,
  schedulePush,
  type SyncStatus,
} from "./sync";

export type Teacher = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  substitute?: boolean;
};

export type SSClass = {
  id: string;
  name: string;
  room?: string;
  teacherIds: string[];
};

// A per-Sunday, per-class change: a substitute covering that day
export type Override = {
  sunday: string;
  classId: string;
  teacherId?: string;
};

export type MeetWeeks = "first-third" | "second-fourth" | "every";

export type PresidencyRole =
  | "President"
  | "First Counselor"
  | "Second Counselor"
  | "Secretary";

export const PRESIDENCY_ROLES: PresidencyRole[] = [
  "President",
  "First Counselor",
  "Second Counselor",
  "Secretary",
];

export type PresidencyMember = {
  role: PresidencyRole;
  name: string;
  phone?: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
  assignedTo: PresidencyRole | "Everyone";
};

// Handbook-informed default weekly rhythm for the presidency.
export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "arrange-subs", label: "As needed: arrange a substitute when a teacher can't make it", assignedTo: "First Counselor" },
  { id: "tech-help", label: "As needed: help teachers with tech or materials when they ask", assignedTo: "Second Counselor" },
  { id: "visit-class", label: "During class: visit one class (rotate) and note what went well", assignedTo: "First Counselor" },
  { id: "official-roll", label: "After class: confirm attendance was marked in Member Tools", assignedTo: "Secretary" },
  { id: "mark-taught", label: "After class: on the Schedule, check off who taught each class", assignedTo: "First Counselor" },
  { id: "council-notes", label: "After class: note anything for ward council", assignedTo: "Secretary" },
  { id: "thank-teacher", label: "Sometime this week: thank one teacher by text", assignedTo: "President" },
  { id: "send-kit", label: "Sunday evening: send teachers next week's kit", assignedTo: "President" },
];

// A teacher council meeting (Handbook 13; Teaching in the Savior's Way)
export type Council = {
  id: string;
  date: string; // ISO date
  topic: string;
  notes: string;
  followUps: { id: string; text: string; done: boolean }[];
};

// New-teacher pipeline: recommend → called → sustained → set apart → oriented
export const PIPELINE_STAGES = [
  "Recommended",
  "Called",
  "Sustained",
  "Set apart",
  "Oriented",
] as const;

export type Candidate = {
  id: string;
  name: string;
  phone?: string;
  classId?: string;
  stage: number; // number of completed stages (0–5)
  stageDates: (string | null)[]; // ISO date each stage was completed
  note?: string;
};

// Presidency meeting: standing agenda, notes, and assignments that carry
// forward until done.
export type Meeting = {
  id: string;
  date: string; // ISO
  notes: string;
  actions: {
    id: string;
    text: string;
    assignedTo: PresidencyRole | "Everyone";
    done: boolean;
  }[];
};

// A counselor's class visit — feeds the rotation and teacher councils.
export type Visit = {
  id: string;
  classId: string;
  date: string; // ISO
  by: PresidencyRole;
  note?: string; // what went well
};

export type AppData = {
  schemaVersion?: number;
  meetings: Meeting[];
  visits: Visit[];
  teachers: Teacher[];
  classes: SSClass[];
  overrides: Override[];
  weekNotes: Record<string, string>;
  settings: { meetWeeks: MeetWeeks };
  presidency: PresidencyMember[];
  checklistItems: ChecklistItem[];
  // checklist completion state: sunday ISO -> itemId -> done
  checklist: Record<string, Record<string, boolean>>;
  // headcounts only, never names: sunday ISO -> classId -> count
  attendance: Record<string, Record<string, number>>;
  // who actually taught: sunday ISO -> classId -> teacherId (counselor check-off)
  taught: Record<string, Record<string, string>>;
  councils: Council[];
  candidates: Candidate[];
};

const SCHEMA_VERSION = 8;

const KEY = "sunday-school-v1";

// Willow Haven Ward Sunday School roster from the LCR Organizations and
// Callings print (11 Jul 2026). Used as the on-device default until the
// presidency edits or replaces it. Vacancies are omitted; unassigned
// teachers are marked substitute.
const WARD_TEACHERS: Teacher[] = [
  { id: "t1", name: "Brooks Clements" },
  { id: "t2", name: "Sterling Fillmore" },
  { id: "t3", name: "Brianne Larsen" },
  { id: "t4", name: "Jennifer McAllister" },
  { id: "t5", name: "Ryan Marsh" },
  { id: "t6", name: "Stacey Marsh" },
  { id: "t7", name: "Stephanie Marchello" },
  { id: "t8", name: "Kristen Mendenhall" },
  { id: "t9", name: "Brady Farr" },
  { id: "t10", name: "Tyler Turner" },
  { id: "t11", name: "Kyle Mercer", substitute: true },
  { id: "t12", name: "Neal Pearson", substitute: true },
  { id: "t13", name: "Stan Maeser" },
  { id: "t14", name: "Lorah Maeser" },
];

const WARD_CLASSES: SSClass[] = [
  {
    id: "c1",
    name: "Adult Sunday School",
    room: "Gym",
    teacherIds: ["t1", "t2", "t3"],
  },
  {
    id: "c2",
    name: "Seniors Class",
    room: "Bishops Office",
    teacherIds: ["t13", "t14"],
  },
  { id: "c3", name: "Course 16", room: "107", teacherIds: ["t4"] },
  {
    id: "c4",
    name: "Course 15",
    room: "Relief Society",
    teacherIds: ["t5", "t6"],
  },
  {
    id: "c5",
    name: "Course 13, Course 14",
    room: "104",
    teacherIds: ["t7", "t8"],
  },
  {
    id: "c6",
    name: "Course 11, Course 12",
    room: "110",
    teacherIds: ["t9", "t10"],
  },
];

const WARD_PRESIDENCY: PresidencyMember[] = [
  { role: "President", name: "Jaxon Munns" },
  { role: "First Counselor", name: "Mark Ellis" },
  { role: "Second Counselor", name: "Trevor Colborn" },
  { role: "Secretary", name: "Marcos Menendez" },
];

const DEFAULT_DATA: AppData = {
  teachers: WARD_TEACHERS,
  classes: WARD_CLASSES,
  overrides: [],
  weekNotes: {},
  settings: { meetWeeks: "first-third" },
  presidency: WARD_PRESIDENCY,
  checklistItems: DEFAULT_CHECKLIST,
  checklist: {},
  attendance: {},
  taught: {},
  councils: [],
  candidates: [],
  meetings: [],
  visits: [],
};

export function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

// Merge stored data over defaults so older saves gain new fields.
export function migrate(raw: unknown): AppData {
  const d = (raw ?? {}) as Partial<AppData>;
  let checklistItems =
    Array.isArray(d.checklistItems) && d.checklistItems.length > 0
      ? d.checklistItems
      : DEFAULT_CHECKLIST;

  // v2: the official Member Tools roll is a Handbook duty (13.2.1) —
  // add the checklist item once for pre-v2 saves; deletions after that stick.
  if ((d.schemaVersion ?? 1) < 2) {
    if (!checklistItems.some((i) => i.id === "official-roll")) {
      const rollItem = DEFAULT_CHECKLIST.find((i) => i.id === "official-roll")!;
      const at = checklistItems.findIndex((i) => i.id === "council-notes");
      checklistItems = [...checklistItems];
      checklistItems.splice(at === -1 ? checklistItems.length : at, 0, rollItem);
    }
  }

  // v3: the Sunday-evening teacher kit becomes part of the rhythm.
  if ((d.schemaVersion ?? 1) < 3) {
    if (!checklistItems.some((i) => i.id === "send-kit")) {
      const kitItem = DEFAULT_CHECKLIST.find((i) => i.id === "send-kit")!;
      checklistItems = [...checklistItems, kitItem];
    }
  }

  // v4: default checklist times become relative to church start (wards
  // meet at different hours). Only rewrites labels still at the old default.
  if ((d.schemaVersion ?? 1) < 4) {
    const oldLabels: Record<string, string> = {
      "rooms-ready": "Sunday 8:40 — classrooms unlocked, chairs and materials ready",
      "greet-teachers": "Sunday 8:50 — greet each teacher before class",
    };
    const v4Labels: Record<string, string> = {
      "rooms-ready":
        "Sunday, 20 min before church — classrooms unlocked, chairs and materials ready",
      "greet-teachers":
        "Sunday, 10 min before church — greet each teacher before class",
    };
    checklistItems = checklistItems.map((i) =>
      oldLabels[i.id] === i.label ? { ...i, label: v4Labels[i.id] } : i
    );
  }

  // v6: counselor check-off of who taught — replaces inferred streaks.
  if ((d.schemaVersion ?? 1) < 6) {
    if (!checklistItems.some((i) => i.id === "mark-taught")) {
      const item = DEFAULT_CHECKLIST.find((i) => i.id === "mark-taught")!;
      const at = checklistItems.findIndex((i) => i.id === "council-notes");
      checklistItems = [...checklistItems];
      checklistItems.splice(at === -1 ? checklistItems.length : at, 0, item);
    }
  }

  // Empty roster (fresh install or never populated) → seed the ward's LCR
  // print so the presidency isn't staring at blank classes on day one.
  let teachers =
    Array.isArray(d.teachers) && d.teachers.length > 0
      ? d.teachers
      : WARD_TEACHERS;
  let classes =
    Array.isArray(d.classes) && d.classes.length > 0
      ? d.classes
      : WARD_CLASSES;
  let presidency =
    Array.isArray(d.presidency) &&
    d.presidency.length === 4 &&
    d.presidency.some((m) => m.name.trim())
      ? d.presidency
      : WARD_PRESIDENCY;

  // v7: Seniors Class teachers are the Maesers (LCR had the callings vacant).
  if ((d.schemaVersion ?? 1) < 7) {
    const maesers = WARD_TEACHERS.filter(
      (t) => t.id === "t13" || t.id === "t14"
    );
    for (const m of maesers) {
      if (!teachers.some((t) => t.id === m.id || /maeser/i.test(t.name))) {
        teachers = [...teachers, m];
      }
    }
    classes = classes.map((c) => {
      if (c.id !== "c2" && !/^seniors/i.test(c.name)) return c;
      if (c.teacherIds.length > 0) return c;
      const ids = maesers
        .map(
          (m) =>
            teachers.find((t) => t.id === m.id || /maeser/i.test(t.name))?.id
        )
        .filter((id): id is string => Boolean(id));
      return { ...c, teacherIds: ids };
    });
  }

  // v8: practical weekly checklist, Maeser names, Secretary default.
  if ((d.schemaVersion ?? 1) < 8) {
    teachers = teachers.map((t) => {
      if (t.id === "t13" || /brother\s+maeser/i.test(t.name))
        return { ...t, name: "Stan Maeser" };
      if (t.id === "t14" || /sister\s+maeser/i.test(t.name))
        return { ...t, name: "Lorah Maeser" };
      return t;
    });
    presidency = presidency.map((m) =>
      m.role === "Secretary" && !m.name.trim()
        ? { ...m, name: "Marcos Menendez" }
        : m
    );
    checklistItems = [...DEFAULT_CHECKLIST];
  }

  return {
    ...DEFAULT_DATA,
    ...d,
    schemaVersion: SCHEMA_VERSION,
    settings: { ...DEFAULT_DATA.settings, ...(d.settings ?? {}) },
    presidency,
    teachers,
    classes,
    checklistItems,
    checklist: d.checklist ?? {},
    weekNotes: d.weekNotes ?? {},
    attendance: d.attendance ?? {},
    taught: d.taught ?? {},
    councils: Array.isArray(d.councils) ? d.councils : [],
    candidates: Array.isArray(d.candidates) ? d.candidates : [],
    meetings: Array.isArray(d.meetings) ? d.meetings : [],
    visits: Array.isArray(d.visits) ? d.visits : [],
  };
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// The derived key lives only in memory for the session: client-side
// navigation keeps it; closing or relaunching the app requires the
// passcode again.
let sessionKey: CryptoKey | null = null;
let sessionSalt: string | null = null;

export type LockState = "loading" | "locked" | "ready";

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [lockState, setLockState] = useState<LockState>("loading");
  const [lockEnabled, setLockEnabled] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("not-connected");
  const applyingRemote = useRef(false);
  const dataRef = useRef<AppData | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) {
          setData(DEFAULT_DATA);
          setLockState("ready");
          return;
        }
        const parsed = JSON.parse(raw);
        if (isLockedBlob(parsed)) {
          setLockEnabled(true);
          if (sessionKey) {
            try {
              const obj = await decryptJson(sessionKey, parsed);
              setData(migrate(obj));
              setLockState("ready");
              return;
            } catch {
              sessionKey = null;
              sessionSalt = null;
            }
          }
          setLockState("locked");
          return;
        }
        setData(migrate(parsed));
        setLockState("ready");
      } catch {
        setData(DEFAULT_DATA);
        setLockState("ready");
      }
    })();
  }, []);

  const persist = useCallback((next: AppData, fromRemote = false) => {
    if (sessionKey && sessionSalt) {
      const key = sessionKey;
      const salt = sessionSalt;
      encryptJson(key, salt, next)
        .then((blob) => localStorage.setItem(KEY, JSON.stringify(blob)))
        .catch(() => {
          // encryption failed; keep in-memory state rather than write plaintext
        });
    } else {
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // storage full or unavailable; keep in-memory state
      }
    }
    if (!fromRemote && !applyingRemote.current) schedulePush();
  }, []);

  useEffect(() => {
    if (lockState !== "ready" || !data) return;
    return initSync({
      getData: () => dataRef.current,
      applyRemote: (remote, updatedAt) => {
        applyingRemote.current = true;
        const next = migrate(remote);
        setData(next);
        persist(next, true);
        localStorage.setItem("ss-sync-remote-at", updatedAt);
        localStorage.setItem("ss-sync-local-at", updatedAt);
        applyingRemote.current = false;
      },
      onStatus: setSyncStatus,
    });
    // Init once when app becomes ready — dataRef holds current data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockState, persist]);

  const update = useCallback(
    (fn: (d: AppData) => AppData) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = fn(prev);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const blob = JSON.parse(raw);
      if (!isLockedBlob(blob)) return false;
      const key = await deriveKey(pin, unb64(blob.salt));
      const obj = await decryptJson(key, blob); // throws on wrong passcode
      sessionKey = key;
      sessionSalt = blob.salt;
      setData(migrate(obj));
      setLockState("ready");
      return true;
    } catch {
      return false;
    }
  }, []);

  const enableLock = useCallback(
    async (pin: string) => {
      if (!data) return;
      const salt = randomSaltB64();
      const key = await deriveKey(pin, unb64(salt));
      sessionKey = key;
      sessionSalt = salt;
      const blob = await encryptJson(key, salt, data);
      localStorage.setItem(KEY, JSON.stringify(blob));
      setLockEnabled(true);
    },
    [data]
  );

  const disableLock = useCallback(() => {
    if (!data) return;
    sessionKey = null;
    sessionSalt = null;
    localStorage.setItem(KEY, JSON.stringify(data));
    setLockEnabled(false);
  }, [data]);

  // Forgotten passcode: the data is unrecoverable by design — start over.
  const wipe = useCallback(() => {
    sessionKey = null;
    sessionSalt = null;
    localStorage.removeItem(KEY);
    setData(DEFAULT_DATA);
    setLockEnabled(false);
    setLockState("ready");
  }, []);

  return {
    data,
    update,
    lockState,
    lockEnabled,
    unlock,
    enableLock,
    disableLock,
    wipe,
    syncStatus,
  };
}

// Per the First Presidency announcement (March 2026), the alternating-week
// pattern ends September 6, 2026: Sunday School meets every Sunday for
// 25 minutes in a split second hour.
export const NEW_SCHEDULE_START = "2026-09-06";

export function isTeachingSunday(iso: string, meetWeeks: MeetWeeks): boolean {
  if (iso >= NEW_SCHEDULE_START) return true;
  if (meetWeeks === "every") return true;
  const n = sundayOccurrence(iso);
  return meetWeeks === "first-third" ? n === 1 || n === 3 : n === 2 || n === 4;
}

export function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isPastSunday(iso: string): boolean {
  return parseISODate(iso) < todayStart();
}

export function findOverride(
  data: AppData,
  sunday: string,
  classId: string
): Override | undefined {
  return data.overrides.find(
    (o) => o.sunday === sunday && o.classId === classId
  );
}

export function regularTeacherNames(cls: SSClass, data: AppData): string[] {
  return cls.teacherIds
    .map((id) => data.teachers.find((t) => t.id === id)?.name)
    .filter((n): n is string => Boolean(n));
}

// Who actually teaches this class on this Sunday (substitute wins)
export function effectiveTeacherLabel(
  data: AppData,
  sunday: string,
  cls: SSClass
): { label: string; isSubstitute: boolean; missing: boolean } {
  const ov = findOverride(data, sunday, cls.id);
  if (ov?.teacherId) {
    const t = data.teachers.find((x) => x.id === ov.teacherId);
    if (t) return { label: t.name, isSubstitute: true, missing: false };
  }
  const names = regularTeacherNames(cls, data);
  if (names.length === 0)
    return { label: "No teacher assigned", isSubstitute: false, missing: true };
  return { label: names.join(", "), isSubstitute: false, missing: false };
}

// ---- Text-message helpers (teachers never install anything) ----

export function firstName(name: string): string {
  const parts = name.trim().split(/\s+/);
  // "Brother Larsen" / "Sister Hale" -> keep the honorific + surname
  if (parts.length === 2 && /^(brother|sister|bro\.?|sis\.?)$/i.test(parts[0]))
    return name.trim();
  return parts[0] ?? name;
}

export function smsHref(phone: string, body: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  // `?&body=` is the cross-platform-safe form (iOS and Android both accept it)
  return `sms:${digits}?&body=${encodeURIComponent(body)}`;
}

export function subRequestMessage(opts: {
  teacherName: string;
  className: string;
  sundayLabel: string;
  lessonRef: string;
  lessonUrl?: string;
  fromName?: string;
}): string {
  const from = opts.fromName ? ` –${opts.fromName}` : "";
  const link = opts.lessonUrl ? ` Lesson is right here: ${opts.lessonUrl}` : "";
  return (
    `Hi ${firstName(opts.teacherName)}, could you cover the ${opts.className} class ` +
    `on ${opts.sundayLabel}? It's ${opts.lessonRef} in Come, Follow Me.${link} ` +
    `No pressure if you can't — just let me know either way. Thank you!${from}`
  );
}

// ---- Teacher care (GOSPEL.md principle 6: names, not numbers) ----
// Streaks come only from counselor check-offs of who actually taught —
// never inferred backward from class assignments.

export type TeacherLoad = {
  teacher: Teacher;
  // consecutive logged teaching Sundays this teacher taught, ending at the
  // most recent logged Sunday
  streak: number;
  // assigned (or subbing) on the next teaching Sunday
  scheduledNext: boolean;
  taughtOfLast8: number;
  nextSunday?: string;
};

/** True if a counselor recorded this teacher as having taught that Sunday. */
export function taughtOn(data: AppData, sunday: string, teacherId: string): boolean {
  const day = data.taught[sunday];
  if (!day) return false;
  return Object.values(day).includes(teacherId);
}

/** True if any class on this Sunday has a who-taught check-off. */
export function sundayIsLogged(data: AppData, sunday: string): boolean {
  const day = data.taught[sunday];
  return Boolean(day && Object.keys(day).length > 0);
}

export function teacherLoads(data: AppData): TeacherLoad[] {
  const { meetWeeks } = data.settings;
  const sundays = LESSONS.map((l) => l.sunday).filter((s) =>
    isTeachingSunday(s, meetWeeks)
  );
  const today = todayStart();
  const past = sundays.filter((s) => parseISODate(s) < today);
  // Only Sundays counselors have logged — unlogged history doesn't invent
  // or break a streak.
  const loggedPast = past.filter((s) => sundayIsLogged(data, s));
  const next = sundays.find((s) => parseISODate(s) >= today);

  return data.teachers
    .map((teacher) => {
      let streak = 0;
      for (let i = loggedPast.length - 1; i >= 0; i--) {
        if (taughtOn(data, loggedPast[i], teacher.id)) streak++;
        else break;
      }
      const taughtOfLast8 = loggedPast
        .slice(-8)
        .filter((s) => taughtOn(data, s, teacher.id)).length;
      // Upcoming assignment is still from the roster (forward-looking only).
      const scheduledNext = next
        ? data.classes.some((c) => {
            const ov = findOverride(data, next, c.id);
            if (ov?.teacherId) return ov.teacherId === teacher.id;
            return c.teacherIds.includes(teacher.id);
          })
        : false;
      return { teacher, streak, scheduledNext, taughtOfLast8, nextSunday: next };
    })
    .sort(
      (a, b) =>
        b.streak + (b.scheduledNext ? 1 : 0) -
        (a.streak + (a.scheduledNext ? 1 : 0))
    );
}

// Streak (including the upcoming Sunday) at which we gently suggest a break.
export const CARE_THRESHOLD = 6;
export const CARE_WATCH = 4;

export function offerBreakMessage(teacherName: string): string {
  return (
    `Hi ${firstName(teacherName)}, thank you for teaching so faithfully week ` +
    `after week — we see it, and we're grateful. Would you like a Sunday off ` +
    `soon? We'd be glad to line up a substitute. Just say the word.`
  );
}

export function reminderMessage(opts: {
  teacherName: string;
  className: string;
  sundayLabel: string;
  lessonRef: string;
  lessonUrl?: string;
}): string {
  const link = opts.lessonUrl ? ` One tap to the lesson: ${opts.lessonUrl}` : "";
  return (
    `Hi ${firstName(opts.teacherName)}, just a friendly reminder that you're ` +
    `teaching ${opts.className} on ${opts.sundayLabel} — the lesson is ` +
    `${opts.lessonRef}.${link} Thank you for all you do!`
  );
}
