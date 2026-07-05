"use client";

import { useState } from "react";
import LessonArt from "@/components/LessonArt";
import { LESSONS, Lesson, formatSunday, lessonUrl, occurrenceLabel, parseISODate } from "@/lib/lessons";
import {
  MeetWeeks,
  NEW_SCHEDULE_START,
  findOverride,
  isPastSunday,
  isTeachingSunday,
  regularTeacherNames,
  reminderMessage,
  smsHref,
  subRequestMessage,
  todayStart,
  useAppData,
} from "@/lib/store";

function monthOf(l: Lesson): string {
  return parseISODate(l.sunday).toLocaleDateString("en-US", { month: "long" });
}

export default function SchedulePage() {
  const { data, update } = useAppData();
  const [teachingOnly, setTeachingOnly] = useState(false);
  const [showPast, setShowPast] = useState(false);
  if (!data) return null;

  const { meetWeeks } = data.settings;
  const president = data.presidency.find((p) => p.role === "President");
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

  function setHeadcount(sunday: string, classId: string, raw: string) {
    update((d) => {
      const attendance = { ...d.attendance };
      const day = { ...(attendance[sunday] ?? {}) };
      const n = parseInt(raw, 10);
      if (Number.isFinite(n) && n >= 0) day[classId] = n;
      else delete day[classId];
      if (Object.keys(day).length) attendance[sunday] = day;
      else delete attendance[sunday];
      return { ...d, attendance };
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

  let lastMonth = "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            2026 Schedule
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            Come, Follow Me — Old Testament. Assign substitutes, send texts, and
            add notes for teaching Sundays.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-ink-2">Meets (through Aug 30)</span>
            <select
              value={meetWeeks}
              onChange={(e) =>
                update((d) => ({
                  ...d,
                  settings: { meetWeeks: e.target.value as MeetWeeks },
                }))
              }
              className="rounded-md border border-line-2 bg-white px-2 py-1.5 text-ink"
            >
              <option value="first-third">1st &amp; 3rd Sundays</option>
              <option value="second-fourth">2nd &amp; 4th Sundays</option>
              <option value="every">Every Sunday</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-ink-2">
            <input
              type="checkbox"
              checked={teachingOnly}
              onChange={(e) => setTeachingOnly(e.target.checked)}
              className="accent-primary"
            />
            Teaching Sundays only
          </label>
          <label className="flex items-center gap-1.5 text-ink-2">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
              className="accent-primary"
            />
            Show past weeks
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-primary/25 bg-primary-soft px-4 py-3 text-sm text-ink">
        <span className="font-semibold text-primary-dark">
          New second-hour schedule:
        </span>{" "}
        beginning September 6, Sunday School meets{" "}
        <span className="font-semibold">every Sunday for 25 minutes</span>{" "}
        (followed by quorum and Relief Society meetings). The alternating-week
        setting above only applies through August 30. August 30 (5th Sunday) is
        set aside to prepare for the change.
      </div>

      <div className="space-y-3">
        {visible.map((lesson) => {
          const teaching = isTeachingSunday(lesson.sunday, meetWeeks);
          const past = isPastSunday(lesson.sunday);
          const isNext = lesson.sunday === nextSunday;
          const month = monthOf(lesson);
          const showMonth = month !== lastMonth;
          lastMonth = month;
          const sundayShort = formatSunday(lesson.sunday).replace(
            "Sunday, ",
            ""
          );
          return (
            <div key={lesson.sunday}>
              {showMonth && (
                <h2 className="mb-3 mt-8 border-b border-line pb-2 font-serif text-xl font-bold first:mt-0">
                  {month}
                </h2>
              )}
              <div
                className={`overflow-hidden rounded-lg border ${
                  past ? "opacity-60" : ""
                } ${isNext ? "border-primary" : "border-line"} ${
                  teaching ? "bg-white" : "bg-surface"
                }`}
              >
                <div
                  className={`flex items-stretch gap-3 sm:gap-4 ${
                    teaching ? "p-4" : "p-3"
                  }`}
                >
                  <div
                    className={`shrink-0 self-stretch overflow-hidden rounded-md ${
                      teaching ? "w-20 sm:w-28" : "w-14 opacity-80 sm:w-20"
                    }`}
                  >
                    <LessonArt
                      week={lesson.week}
                      className="h-full min-h-14 w-full"
                    />
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="hidden w-12 shrink-0 text-[11px] font-bold uppercase tracking-wider text-ink-3 sm:inline-block">
                        Wk {lesson.week}
                      </span>
                      <span className="font-serif text-lg font-bold">
                        {sundayShort}
                      </span>
                      <a
                        href={lessonUrl(lesson.week)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm hover:text-primary hover:underline ${
                          lesson.special
                            ? "font-semibold text-primary"
                            : "text-ink-2"
                        }`}
                        title="Open this lesson in Come, Follow Me"
                      >
                        {lesson.ref}
                      </a>
                      <span className="ml-auto flex items-center gap-2">
                        {lesson.sunday === "2026-08-30" && (
                          <span className="rounded bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                            Prep for new schedule
                          </span>
                        )}
                        {isNext && (
                          <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-white">
                            Next Sunday
                          </span>
                        )}
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-semibold ${
                            teaching
                              ? "bg-primary-soft text-primary-dark"
                              : "bg-surface-2 text-ink-3"
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
                      <div className="mt-3 space-y-2 border-t border-line pt-3">
                        {data.classes.length === 0 ? (
                          <p className="text-sm text-ink-3">
                            Add classes on the Teachers &amp; Classes page to
                            track assignments.
                          </p>
                        ) : (
                          <div className="grid gap-2 lg:grid-cols-2">
                            {data.classes.map((cls) => {
                              const ov = findOverride(
                                data,
                                lesson.sunday,
                                cls.id
                              );
                              const regular = regularTeacherNames(cls, data);
                              const covering = ov?.teacherId
                                ? data.teachers.find(
                                    (t) => t.id === ov.teacherId
                                  )
                                : undefined;
                              const regularTeacher = data.teachers.find(
                                (t) => t.id === cls.teacherIds[0]
                              );
                              const textTarget = covering ?? regularTeacher;
                              const msg = covering
                                ? subRequestMessage({
                                    teacherName: covering.name,
                                    className: cls.name,
                                    sundayLabel: sundayShort,
                                    lessonRef: lesson.ref,
                                    lessonUrl: lessonUrl(lesson.week),
                                    fromName: president?.name || undefined,
                                  })
                                : regularTeacher
                                  ? reminderMessage({
                                      teacherName: regularTeacher.name,
                                      className: cls.name,
                                      sundayLabel: sundayShort,
                                      lessonRef: lesson.ref,
                                      lessonUrl: lessonUrl(lesson.week),
                                    })
                                  : "";
                              return (
                                <div
                                  key={cls.id}
                                  className="flex items-center justify-between gap-2 text-sm"
                                >
                                  <span className="truncate text-ink-2">
                                    {cls.name}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <select
                                      value={ov?.teacherId ?? ""}
                                      onChange={(e) =>
                                        setSubstitute(
                                          lesson.sunday,
                                          cls.id,
                                          e.target.value
                                        )
                                      }
                                      className={`w-40 rounded-md border px-2 py-1 ${
                                        ov?.teacherId
                                          ? "border-primary/40 bg-primary-soft text-primary-dark"
                                          : "border-line-2 bg-white text-ink"
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
                                    {textTarget?.phone && msg && (
                                      <a
                                        href={smsHref(textTarget.phone, msg)}
                                        className="whitespace-nowrap rounded-md border border-line-2 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary-soft"
                                        title={
                                          covering
                                            ? `Text ${covering.name} the substitute request`
                                            : `Text ${regularTeacher?.name} a friendly reminder`
                                        }
                                      >
                                        {covering ? "Text sub" : "Text"}
                                      </a>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {data.classes.length > 0 && (
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-3">
                              Headcount
                            </span>
                            {data.classes.map((cls) => (
                              <label
                                key={cls.id}
                                className="flex items-center gap-1.5 text-ink-2"
                              >
                                {cls.name}
                                <input
                                  type="number"
                                  min={0}
                                  inputMode="numeric"
                                  value={
                                    data.attendance[lesson.sunday]?.[cls.id] ??
                                    ""
                                  }
                                  onChange={(e) =>
                                    setHeadcount(
                                      lesson.sunday,
                                      cls.id,
                                      e.target.value
                                    )
                                  }
                                  className="w-14 rounded-md border border-line px-2 py-1 text-center"
                                />
                              </label>
                            ))}
                          </div>
                        )}
                        <input
                          type="text"
                          value={data.weekNotes[lesson.sunday] ?? ""}
                          onChange={(e) =>
                            setWeekNote(lesson.sunday, e.target.value)
                          }
                          placeholder="Note for this Sunday (e.g. ward conference, combined class)…"
                          className="w-full rounded-md border border-line px-3 py-1.5 text-sm placeholder:text-ink-3"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-ink-3">
        Weekly outline from{" "}
        <a
          href="https://www.churchofjesuschrist.org/study/manual/come-follow-me-for-home-and-church-old-testament-2026?lang=eng"
          className="text-primary underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Come, Follow Me — For Home and Church: Old Testament 2026
        </a>
        . Artwork attribution in{" "}
        <a
          href="https://github.com/jaxon-wq/Sunday-School/blob/main/public/art/ATTRIBUTION.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          public/art
        </a>
        .
      </p>
    </div>
  );
}
