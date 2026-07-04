"use client";

import { useCallback, useEffect, useState } from "react";
import { parseISODate, sundayOccurrence } from "./lessons";

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

export type AppData = {
  teachers: Teacher[];
  classes: SSClass[];
  overrides: Override[];
  weekNotes: Record<string, string>;
  settings: { meetWeeks: MeetWeeks };
};

const KEY = "sunday-school-v1";

const DEFAULT_DATA: AppData = {
  teachers: [],
  classes: [],
  overrides: [],
  weekNotes: {},
  settings: { meetWeeks: "first-third" },
};

export function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(raw ? { ...DEFAULT_DATA, ...JSON.parse(raw) } : DEFAULT_DATA);
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
