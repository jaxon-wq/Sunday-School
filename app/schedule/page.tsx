"use client";

import { useState } from "react";
import LessonArt from "@/components/LessonArt";
import { LESSONS, formatSunday, occurrenceLabel, parseISODate } from "@/lib/lessons";
import {
  MeetWeeks,
  NEW_SCHEDULE_START,
  findOverride,
  isPastSunday,
  isTeachingSunday,
  regularTeacherNames,
  todayStart,
  useAppData,
} from "@/lib/store";

export default function SchedulePage() {
  const { data, update } = useAppData();
  const [teachingOnly, setTeachingOnly] = useState(false);
  const [showPast, setShowPast] = useState(false);
  if (!data) return null;

  const { meetWeeks } = data.settings;
  const nextSunday = LESSONS.find(
    (l) => parseISODate(l.sunday) >= todayStart()
  )?.sunday;

  const visible = LESSONS.filter((l) => {
    if (teachingOnly && !isTeachingSunday(l.sunday, meetWeeks)) return false;
    if (!showPast && isPastSunday(l.sunday)) return false;
    return true;
  });

  function setSubstitute(sunday: string, classId: string, teacherId: string) {
    update((d) => {
      const overrides = d.overrides.filter(
        (o) => !(o.sunday === sunday && o.classId === classId)
      );
      if (teacherId) overrides.push({ sunday, classId, teacherId });
      return { ...d, overrides };
    });
  }

  function setWeekNote(sunday: string, note: string) {
    update((d) => {
      const weekNotes = { ...d.weekNotes };
      if (note) weekNotes[sunday] = note;
      else delete weekNotes[sunday];
      return { ...d, weekNotes };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-pp-text">
            2026 Schedule
          </h1>
          <p className="mt-2 text-sm text-pp-muted">
            Come, Follow Me — Old Testament. Assign substitutes and add notes
            for teaching Sundays.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-pp-muted">Meets (through Aug 30)</span>
            <select
              value={meetWeeks}
              onChange={(e) =>
                update((d) => ({
                  ...d,
                  settings: { meetWeeks: e.target.value as MeetWeeks },
                }))
              }
              className="rounded-lg border border-pp-border bg-pp-card px-2 py-1.5 text-pp-text"
            >
              <option value="first-third">1st &amp; 3rd Sundays</option>
              <option value="second-fourth">2nd &amp; 4th Sundays</option>
              <option value="every">Every Sunday</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-pp-muted">
            <input
              type="checkbox"
              checked={teachingOnly}
              onChange={(e) => setTeachingOnly(e.target.checked)}
              className="accent-pp-gold"
            />
            Teaching Sundays only
          </label>
          <label className="flex items-center gap-1.5 text-pp-muted">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
              className="accent-pp-gold"
            />
            Show past weeks
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-pp-gold/25 bg-pp-gold/10 px-4 py-3 text-sm text-pp-text/90">
        <span className="font-semibold text-pp-gold-light">
          New second-hour schedule:
        </span>{" "}
        beginning September 6, Sunday School meets{" "}
        <span className="font-semibold">every Sunday for 25 minutes</span>{" "}
        (followed by quorum and Relief Society meetings). The alternating-week
        setting above only applies through August 30. August 30 (5th Sunday)
        is set aside to prepare for the change.
      </div>

      <div className="space-y-3">
        {visible.map((lesson) => {
          const teaching = isTeachingSunday(lesson.sunday, meetWeeks);
          const past = isPastSunday(lesson.sunday);
          const isNext = lesson.sunday === nextSunday;
          return (
            <div
              key={lesson.sunday}
              className={`overflow-hidden rounded-2xl border ${
                past ? "opacity-50" : ""
              } ${
                isNext
                  ? "border-pp-gold/50 bg-gradient-to-br from-[#231b0e] to-pp-card-2"
                  : "border-pp-border bg-pp-card"
              }`}
            >
              <div className="flex items-stretch gap-4 p-4">
                <div className="hidden w-28 shrink-0 self-stretch overflow-hidden rounded-xl border border-white/5 sm:block">
                  <LessonArt week={lesson.week} className="h-full min-h-16 w-full" />
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="hidden w-12 shrink-0 text-[11px] font-bold uppercase tracking-wider text-pp-muted sm:inline-block">
                      Wk {lesson.week}
                    </span>
                    <span className="font-display text-lg font-semibold text-pp-text">
                      {formatSunday(lesson.sunday)}
                    </span>
                    <span
                      className={`text-sm ${
                        lesson.special
                          ? "font-semibold text-pp-gold-light"
                          : "text-pp-muted"
                      }`}
                    >
                      {lesson.ref}
                    </span>
                    <span className="ml-auto flex items-center gap-2">
                      {lesson.sunday === "2026-08-30" && (
                        <span className="rounded-full bg-pp-gold/15 px-2.5 py-0.5 text-xs font-semibold text-pp-gold-light">
                          Prep for new schedule
                        </span>
                      )}
                      {isNext && (
                        <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-pp-ink">
                          Next Sunday
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          teaching
                            ? "bg-pp-gold text-pp-ink"
                            : "bg-white/5 text-pp-muted"
                        }`}
                      >
                        {teaching
                          ? lesson.sunday >= NEW_SCHEDULE_START
                            ? "Sunday School · 25 min"
                            : `Sunday School · ${occurrenceLabel(lesson.sunday)}`
                          : occurrenceLabel(lesson.sunday)}
                      </span>
                    </span>
                  </div>

                  {teaching && (
                    <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                      {data.classes.length === 0 ? (
                        <p className="text-sm text-pp-muted">
                          Add classes on the Teachers &amp; Classes page to
                          track assignments.
                        </p>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {data.classes.map((cls) => {
                            const ov = findOverride(data, lesson.sunday, cls.id);
                            const regular = regularTeacherNames(cls, data);
                            return (
                              <label
                                key={cls.id}
                                className="flex items-center justify-between gap-2 text-sm"
                              >
                                <span className="truncate text-pp-muted">
                                  {cls.name}
                                </span>
                                <select
                                  value={ov?.teacherId ?? ""}
                                  onChange={(e) =>
                                    setSubstitute(
                                      lesson.sunday,
                                      cls.id,
                                      e.target.value
                                    )
                                  }
                                  className={`w-44 rounded-lg border px-2 py-1 ${
                                    ov?.teacherId
                                      ? "border-pp-gold/50 bg-pp-gold/15 text-pp-gold-light"
                                      : "border-pp-border bg-pp-card-2 text-pp-text"
                                  }`}
                                >
                                  <option value="">
                                    {regular.length > 0
                                      ? regular.join(", ")
                                      : "— no teacher —"}
                                  </option>
                                  {data.teachers
                                    .filter(
                                      (t) => !cls.teacherIds.includes(t.id)
                                    )
                                    .map((t) => (
                                      <option key={t.id} value={t.id}>
                                        Sub: {t.name}
                                      </option>
                                    ))}
                                </select>
                              </label>
                            );
                          })}
                        </div>
                      )}
                      <input
                        type="text"
                        value={data.weekNotes[lesson.sunday] ?? ""}
                        onChange={(e) =>
                          setWeekNote(lesson.sunday, e.target.value)
                        }
                        placeholder="Note for this Sunday (e.g. ward conference, combined class)…"
                        className="w-full rounded-lg border border-pp-border bg-pp-card-2 px-3 py-1.5 text-sm text-pp-text placeholder:text-pp-muted/60"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-pp-muted/70">
        Weekly outline from{" "}
        <a
          href="https://www.churchofjesuschrist.org/study/manual/come-follow-me-for-home-and-church-old-testament-2026?lang=eng"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Come, Follow Me — For Home and Church: Old Testament 2026
        </a>
        .
      </p>
    </div>
  );
}
