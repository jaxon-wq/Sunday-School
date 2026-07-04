"use client";

// Ward council brief: everything the Sunday School president should have in
// hand walking into ward council, assembled from data already in the app.

import { LESSONS, formatSunday, parseISODate } from "./lessons";
import {
  AppData,
  CARE_WATCH,
  PIPELINE_STAGES,
  isTeachingSunday,
  teacherLoads,
  todayStart,
} from "./store";

export type Brief = {
  generated: string;
  staffing: { total: number; unstaffed: string[] };
  subsUsed: { sunday: string; className: string; subName: string }[];
  care: { name: string; count: number }[];
  attendance: {
    className: string;
    latest: number | null;
    recentAvg: number | null;
    priorAvg: number | null;
  }[];
  pipeline: { name: string; next: string }[];
  nextCouncil?: { date: string; topic: string };
  openFollowUps: { text: string; topic: string }[];
};

const avg = (a: number[]): number | null =>
  a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null;

export function buildBrief(data: AppData): Brief {
  const teach = LESSONS.map((l) => l.sunday).filter((s) =>
    isTeachingSunday(s, data.settings.meetWeeks)
  );
  const past = teach.filter((s) => parseISODate(s) < todayStart());
  const last5 = past.slice(-5);

  const subsUsed = last5.flatMap((sunday) =>
    data.overrides
      .filter((o) => o.sunday === sunday && o.teacherId)
      .map((o) => ({
        sunday,
        className:
          data.classes.find((c) => c.id === o.classId)?.name ?? "a class",
        subName:
          data.teachers.find((t) => t.id === o.teacherId)?.name ?? "someone",
      }))
  );

  const care = teacherLoads(data)
    .filter((l) => l.streak + (l.scheduledNext ? 1 : 0) >= CARE_WATCH)
    .map((l) => ({
      name: l.teacher.name,
      count: l.streak + (l.scheduledNext ? 1 : 0),
    }));

  const attendance = data.classes.map((c) => {
    const vals = teach
      .map((s) => data.attendance[s]?.[c.id])
      .filter((v): v is number => typeof v === "number");
    return {
      className: c.name,
      latest: vals.at(-1) ?? null,
      recentAvg: avg(vals.slice(-4)),
      priorAvg: avg(vals.slice(-8, -4)),
    };
  });

  const pipeline = data.candidates.map((c) => ({
    name: c.name,
    next: c.stage >= 5 ? "Ready to teach" : `Next: ${PIPELINE_STAGES[c.stage]}`,
  }));

  const today = todayStart();
  const nextCouncil = data.councils
    .filter((c) => parseISODate(c.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const openFollowUps = data.councils.flatMap((c) =>
    c.followUps.filter((f) => !f.done).map((f) => ({ text: f.text, topic: c.topic }))
  );

  return {
    generated: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    staffing: {
      total: data.classes.length,
      unstaffed: data.classes
        .filter((c) => c.teacherIds.length === 0)
        .map((c) => c.name),
    },
    subsUsed,
    care,
    attendance,
    pipeline,
    nextCouncil: nextCouncil
      ? { date: nextCouncil.date, topic: nextCouncil.topic }
      : undefined,
    openFollowUps,
  };
}

export function briefText(b: Brief): string {
  const lines: string[] = [`SUNDAY SCHOOL — WARD COUNCIL BRIEF (${b.generated})`, ""];

  lines.push(
    `Staffing: ${b.staffing.total} classes, ` +
      (b.staffing.unstaffed.length
        ? `${b.staffing.unstaffed.length} without a teacher (${b.staffing.unstaffed.join(", ")})`
        : "all staffed")
  );

  lines.push(
    b.subsUsed.length
      ? `Substitutes (last 5 teaching Sundays): ${b.subsUsed
          .map((s) => `${s.subName} for ${s.className} (${formatSunday(s.sunday).replace("Sunday, ", "")})`)
          .join("; ")}`
      : "Substitutes (last 5 teaching Sundays): none needed"
  );

  if (b.care.length)
    lines.push(
      `Teacher care: ${b.care.map((c) => `${c.name} — ${c.count} Sundays in a row`).join("; ")}`
    );

  const att = b.attendance.filter((a) => a.recentAvg !== null);
  if (att.length)
    lines.push(
      `Attendance (avg of last 4): ${att
        .map(
          (a) =>
            `${a.className} ${a.recentAvg}` +
            (a.priorAvg !== null ? ` (was ${a.priorAvg})` : "")
        )
        .join("; ")}`
    );

  if (b.pipeline.length)
    lines.push(
      `New teachers in process: ${b.pipeline.map((p) => `${p.name} (${p.next})`).join("; ")}`
    );

  if (b.nextCouncil)
    lines.push(
      `Next teacher council: ${formatSunday(b.nextCouncil.date)} — ${b.nextCouncil.topic}`
    );

  if (b.openFollowUps.length)
    lines.push(
      `Open follow-ups: ${b.openFollowUps.map((f) => f.text).join("; ")}`
    );

  return lines.join("\n");
}
