"use client";

import { useCallback, useEffect, useState } from "react";
import { LESSONS, parseISODate, sundayOccurrence } from "./lessons";

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

// Handbook-informed default Sunday rhythm for the presidency.
export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "confirm-teachers", label: "Thursday: confirm every class has a teacher for Sunday", assignedTo: "President" },
  { id: "arrange-subs", label: "Friday: arrange substitutes for any gaps", assignedTo: "First Counselor" },
  { id: "check-in", label: "Saturday: check in with any new or struggling teachers", assignedTo: "Second Counselor" },
  { id: "rooms-ready", label: "Sunday 8:40 — classrooms unlocked, chairs and materials ready", assignedTo: "Second Counselor" },
  { id: "greet-teachers", label: "Sunday 8:50 — greet each teacher before class", assignedTo: "President" },
  { id: "visit-class", label: "During class: visit one class (rotate weekly) and note what went well", assignedTo: "First Counselor" },
  { id: "council-notes", label: "After class: note follow-ups and anything for ward council", assignedTo: "Secretary" },
  { id: "thank-teacher", label: "Sunday evening: thank one teacher by text", assignedTo: "President" },
];

export type AppData = {
  teachers: Teacher[];
  classes: SSClass[];
  overrides: Override[];
  weekNotes: Record<string, string>;
  settings: { meetWeeks: MeetWeeks };
  presidency: PresidencyMember[];
  checklistItems: ChecklistItem[];
  // checklist completion state: sunday ISO -> itemId -> done
  checklist: Record<string, Record<string, boolean>>;
};

const KEY = "sunday-school-v1";

const DEFAULT_DATA: AppData = {
  teachers: [],
  classes: [],
  overrides: [],
  weekNotes: {},
  settings: { meetWeeks: "first-third" },
  presidency: PRESIDENCY_ROLES.map((role) => ({ role, name: "" })),
  checklistItems: DEFAULT_CHECKLIST,
  checklist: {},
};

export function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

// Merge stored data over defaults so older saves gain new fields.
export function migrate(raw: unknown): AppData {
  const d = (raw ?? {}) as Partial<AppData>;
  return {
    ...DEFAULT_DATA,
    ...d,
    settings: { ...DEFAULT_DATA.settings, ...(d.settings ?? {}) },
    presidency:
      Array.isArray(d.presidency) && d.presidency.length === 4
        ? d.presidency
        : DEFAULT_DATA.presidency,
    checklistItems:
      Array.isArray(d.checklistItems) && d.checklistItems.length > 0
        ? d.checklistItems
        : DEFAULT_CHECKLIST,
    checklist: d.checklist ?? {},
    weekNotes: d.weekNotes ?? {},
  };
}

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setData(raw ? migrate(JSON.parse(raw)) : DEFAULT_DATA);
    } catch {
      setData(DEFAULT_DATA);
    }
  }, []);

  const update = useCallback((fn: (d: AppData) => AppData) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // storage full or unavailable; keep in-memory state
      }
      return next;
    });
  }, []);

  return { data, update };
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
  fromName?: string;
}): string {
  const from = opts.fromName ? ` –${opts.fromName}` : "";
  return (
    `Hi ${firstName(opts.teacherName)}, could you cover the ${opts.className} class ` +
    `on ${opts.sundayLabel}? The lesson is ${opts.lessonRef} in Come, Follow Me. ` +
    `No pressure if you can't — just let me know either way. Thank you!${from}`
  );
}

// ---- Teacher care (GOSPEL.md principle 6: names, not numbers) ----
// A count of consecutive teaching Sundays exists so a person gets noticed
// and offered a break — never as a scoreboard.

export type TeacherLoad = {
  teacher: Teacher;
  // consecutive completed teaching Sundays taught, ending at the most recent
  streak: number;
  // assigned (or subbing) on the next teaching Sunday too
  scheduledNext: boolean;
  taughtOfLast8: number;
  nextSunday?: string;
};

function taughtOn(data: AppData, sunday: string, teacherId: string): boolean {
  return data.classes.some((c) => {
    const ov = findOverride(data, sunday, c.id);
    if (ov?.teacherId) return ov.teacherId === teacherId;
    return c.teacherIds.includes(teacherId);
  });
}

export function teacherLoads(data: AppData): TeacherLoad[] {
  const { meetWeeks } = data.settings;
  const sundays = LESSONS.map((l) => l.sunday).filter((s) =>
    isTeachingSunday(s, meetWeeks)
  );
  const today = todayStart();
  const past = sundays.filter((s) => parseISODate(s) < today);
  const next = sundays.find((s) => parseISODate(s) >= today);

  return data.teachers
    .map((teacher) => {
      let streak = 0;
      for (let i = past.length - 1; i >= 0; i--) {
        if (taughtOn(data, past[i], teacher.id)) streak++;
        else break;
      }
      const taughtOfLast8 = past
        .slice(-8)
        .filter((s) => taughtOn(data, s, teacher.id)).length;
      const scheduledNext = next ? taughtOn(data, next, teacher.id) : false;
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
}): string {
  return (
    `Hi ${firstName(opts.teacherName)}, just a friendly reminder that you're ` +
    `teaching ${opts.className} on ${opts.sundayLabel} — the lesson is ` +
    `${opts.lessonRef}. Thank you for all you do!`
  );
}
