"use client";

// Live packet for a presidency meeting: the standing agenda from Handbook 13,
// filled with whatever the app already knows — so the meeting runs from data,
// not from memory.

import { kitFor } from "./kits";
import { LESSONS, formatSunday, parseISODate } from "./lessons";
import {
  AppData,
  CARE_WATCH,
  Meeting,
  PIPELINE_STAGES,
  isTeachingSunday,
  teacherLoads,
  todayISO,
  todayStart,
} from "./store";

export type PacketSection = {
  title: string;
  bullets: string[];
  empty: string;
};

export type MeetingPacket = {
  generated: string;
  sections: PacketSection[];
  openActions: {
    id: string;
    text: string;
    assignedTo: string;
    fromDate: string;
    meetingId: string;
  }[];
  readiness: { ok: boolean; missing: string[] };
};

function shortSunday(iso: string): string {
  return formatSunday(iso).replace("Sunday, ", "");
}

export function buildMeetingPacket(data: AppData): MeetingPacket {
  const today = todayStart();
  const todayStr = todayISO();

  const openActions = data.meetings
    .flatMap((m) =>
      m.actions
        .filter((a) => !a.done)
        .map((a) => ({
          id: a.id,
          text: a.text,
          assignedTo: a.assignedTo,
          fromDate: m.date,
          meetingId: m.id,
        }))
    )
    .sort((a, b) => a.fromDate.localeCompare(b.fromDate));

  const unstaffed = data.classes.filter((c) => c.teacherIds.length === 0);
  const care = teacherLoads(data).filter(
    (l) => l.streak + (l.scheduledNext ? 1 : 0) >= CARE_WATCH
  );

  const visitOrder = [...data.classes]
    .map((cls) => {
      const last = data.visits
        .filter((v) => v.classId === cls.id)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      return { cls, last };
    })
    .sort((a, b) =>
      (a.last?.date ?? "0000").localeCompare(b.last?.date ?? "0000")
    );
  const visitNext = visitOrder[0];

  const teacherBullets: string[] = [];
  if (data.classes.length === 0) {
    // empty handled below
  } else {
    if (unstaffed.length)
      teacherBullets.push(
        `${unstaffed.length} class${unstaffed.length === 1 ? "" : "es"} without a teacher: ${unstaffed.map((c) => c.name).join(", ")}`
      );
    else
      teacherBullets.push(
        `All ${data.classes.length} classes have a teacher assigned`
      );
    for (const l of care.slice(0, 4)) {
      const n = l.streak + (l.scheduledNext ? 1 : 0);
      teacherBullets.push(
        `${l.teacher.name} — ${n} Sunday${n === 1 ? "" : "s"} in a row; consider offering a break`
      );
    }
    if (visitNext) {
      teacherBullets.push(
        visitNext.last
          ? `Visit next: ${visitNext.cls.name} (last ${shortSunday(visitNext.last.date)})`
          : `Visit next: ${visitNext.cls.name} (never visited)`
      );
    }
  }

  const upcomingTeaching = LESSONS.filter(
    (l) =>
      parseISODate(l.sunday) >= today &&
      isTeachingSunday(l.sunday, data.settings.meetWeeks)
  ).slice(0, 3);
  const lessonBullets = upcomingTeaching.map((l) => {
    const kit = kitFor(l.week);
    const kitBit = kit
      ? ` · kit: “${kit.question.slice(0, 72)}${kit.question.length > 72 ? "…" : ""}”`
      : " · kit not drafted yet";
    return `${shortSunday(l.sunday)} — ${l.ref}${kitBit}`;
  });

  const nextCouncil = data.councils
    .filter((c) => parseISODate(c.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const openCouncilFollowUps = data.councils.flatMap((c) =>
    c.followUps.filter((f) => !f.done).map((f) => `${f.text} (${c.topic})`)
  );
  const councilBullets: string[] = [];
  if (nextCouncil) {
    councilBullets.push(
      `Next teacher council: ${shortSunday(nextCouncil.date)} — ${nextCouncil.topic}`
    );
  }
  for (const f of openCouncilFollowUps.slice(0, 4)) {
    councilBullets.push(`Open follow-up: ${f}`);
  }

  const wardBullets: string[] = [];
  if (unstaffed.length)
    wardBullets.push(
      `Raise: ${unstaffed.length} unstaffed class${unstaffed.length === 1 ? "" : "es"} (${unstaffed.map((c) => c.name).join(", ")})`
    );
  if (care.length)
    wardBullets.push(
      `Raise: teacher load — ${care.map((l) => l.teacher.name).join(", ")}`
    );
  for (const f of openCouncilFollowUps.slice(0, 2)) {
    wardBullets.push(`From teacher council: ${f}`);
  }
  const pipelineReady = data.candidates.filter((c) => c.stage >= 4);
  if (pipelineReady.length)
    wardBullets.push(
      `Ready / nearly ready to teach: ${pipelineReady.map((c) => c.name).join(", ")}`
    );

  const pipelineBullets = data.candidates.map((c) => {
    const next =
      c.stage >= PIPELINE_STAGES.length
        ? "Ready to teach"
        : `Next: ${PIPELINE_STAGES[c.stage]}`;
    const cls = c.classId
      ? data.classes.find((x) => x.id === c.classId)?.name
      : undefined;
    return `${c.name} — ${next}${cls ? ` · ${cls}` : ""}`;
  });

  const sections: PacketSection[] = [
    {
      title: "Review assignments from the last meeting",
      bullets: openActions.map(
        (a) =>
          `${a.text} — ${a.assignedTo} (from ${shortSunday(a.fromDate)})`
      ),
      empty: "No open assignments yet — capture them as you go.",
    },
    {
      title:
        "Teachers and classes — who needs support, a break, or a substitute plan",
      bullets: teacherBullets,
      empty: "Add classes and teachers first so this section fills itself.",
    },
    {
      title: "Upcoming lessons and Sunday-evening kits",
      bullets: lessonBullets,
      empty: "No upcoming teaching Sundays on the calendar.",
    },
    {
      title: "Teacher council — next date and topic",
      bullets: councilBullets,
      empty: "No teacher council scheduled yet — pick a date on Councils.",
    },
    {
      title: "Ward council — what the president should raise",
      bullets: wardBullets,
      empty: "Nothing flagged yet — staffing, care, and pipeline will appear here.",
    },
    {
      title: "New teachers in process (pipeline and callings)",
      bullets: pipelineBullets,
      empty: "No candidates in the pipeline yet — add them under Teachers.",
    },
  ];

  const missing: string[] = [];
  const unnamed = data.presidency.filter((m) => !m.name.trim()).length;
  if (unnamed > 0)
    missing.push(
      unnamed === 4
        ? "Name the four presidency members"
        : `Name ${unnamed} remaining presidency member${unnamed === 1 ? "" : "s"}`
    );
  if (data.classes.length === 0) missing.push("Add your classes");
  if (data.teachers.length === 0) missing.push("Add your teachers");
  if (!data.meetings.some((m) => m.date >= todayStr))
    missing.push("Schedule tomorrow's meeting");

  return {
    generated: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    sections,
    openActions,
    readiness: { ok: missing.length === 0, missing },
  };
}

export function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function meetingHasDate(meetings: Meeting[], iso: string): boolean {
  return meetings.some((m) => m.date === iso);
}

export function packetText(p: MeetingPacket): string {
  const lines: string[] = [
    `SUNDAY SCHOOL — PRESIDENCY MEETING PACKET (${p.generated})`,
    "",
  ];
  for (const s of p.sections) {
    lines.push(s.title.toUpperCase());
    if (s.bullets.length === 0) lines.push(`  · ${s.empty}`);
    else for (const b of s.bullets) lines.push(`  · ${b}`);
    lines.push("");
  }
  return lines.join("\n");
}
