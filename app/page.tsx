"use client";

import Link from "next/link";
import LessonArt from "@/components/LessonArt";
import { LESSONS, formatSunday, occurrenceLabel, parseISODate } from "@/lib/lessons";
import {
  NEW_SCHEDULE_START,
  effectiveTeacherLabel,
  isTeachingSunday,
  todayStart,
  uid,
  useAppData,
} from "@/lib/store";

const STARTER_CLASSES = [
  "Sunday School (Adults)",
  "Youth 12–13",
  "Youth 14–15",
  "Youth 16–17",
];

export default function Dashboard() {
  const { data, update } = useAppData();
  if (!data) return null;

  const today = todayStart();
  const upcoming = LESSONS.filter((l) => parseISODate(l.sunday) >= today);
  const teachingWeeks = upcoming.filter((l) =>
    isTeachingSunday(l.sunday, data.settings.meetWeeks)
  );
  const next = teachingWeeks[0];
  const thisWeek = upcoming[0];
  const comingUp = upcoming.slice(1, 11);
  const unstaffed = data.classes.filter((c) => c.teacherIds.length === 0);

  function seedClasses() {
    update((d) => ({
      ...d,
      classes: [
        ...d.classes,
        ...STARTER_CLASSES.map((name) => ({ id: uid(), name, teacherIds: [] })),
      ],
    }));
  }

  return (
    <div className="space-y-10">
      {data.classes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-pp-border bg-pp-card p-6">
          <h2 className="font-display text-lg font-semibold text-pp-text">
            Get set up
          </h2>
          <p className="mt-1 text-sm text-pp-muted">
            Add your classes and teachers to start tracking who teaches each
            Sunday. You can start from a typical ward setup and rename things
            later.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={seedClasses}
              className="rounded-full bg-pp-gold px-5 py-2 text-sm font-semibold text-pp-ink transition-colors hover:bg-pp-gold-light"
            >
              Start with a typical setup
            </button>
            <Link
              href="/teachers"
              className="rounded-full border border-pp-border px-5 py-2 text-sm font-semibold text-pp-text transition-colors hover:bg-white/5"
            >
              Add classes manually
            </Link>
          </div>
        </div>
      )}

      {unstaffed.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <span className="font-semibold">{unstaffed.length}</span>{" "}
          {unstaffed.length === 1 ? "class has" : "classes have"} no teacher
          assigned: {unstaffed.map((c) => c.name).join(", ")} ·{" "}
          <Link href="/teachers" className="font-semibold underline">
            assign teachers
          </Link>
        </div>
      )}

      {next && (
        <section className="relative min-h-[380px] overflow-hidden rounded-3xl border border-pp-border sm:min-h-[420px]">
          <div className="absolute inset-0">
            <LessonArt week={next.week} className="h-full w-full" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-pp-ink/95 via-pp-ink/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-pp-ink/95 via-transparent to-pp-ink/30" />
          <div className="relative flex min-h-[380px] flex-col justify-end p-6 sm:min-h-[420px] sm:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-pp-gold">
              Next Sunday School
            </p>
            <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {formatSunday(next.sunday)}
            </h1>
            <p className="mt-2 text-lg font-medium text-pp-text/90">
              {next.ref}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-pp-gold px-3.5 py-1 text-xs font-bold text-pp-ink">
                {next.sunday >= NEW_SCHEDULE_START
                  ? "25 min class"
                  : occurrenceLabel(next.sunday)}
              </span>
              {data.weekNotes[next.sunday] && (
                <span className="rounded-full border border-white/15 bg-black/40 px-3.5 py-1 text-xs font-medium text-pp-text backdrop-blur">
                  {data.weekNotes[next.sunday]}
                </span>
              )}
            </div>
            {data.classes.length > 0 && (
              <ul className="mt-6 max-w-xl divide-y divide-white/10 border-t border-white/10">
                {data.classes.map((cls) => {
                  const eff = effectiveTeacherLabel(data, next.sunday, cls);
                  return (
                    <li
                      key={cls.id}
                      className="flex items-center justify-between gap-4 py-2.5 text-sm"
                    >
                      <span className="text-pp-text/75">{cls.name}</span>
                      <span
                        className={
                          eff.missing
                            ? "font-semibold text-amber-300"
                            : "font-medium text-white"
                        }
                      >
                        {eff.label}
                        {eff.isSubstitute && (
                          <span className="ml-2 rounded-full bg-pp-gold/20 px-2 py-0.5 text-xs font-semibold text-pp-gold-light">
                            sub
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-6">
              <Link
                href="/schedule"
                className="inline-block rounded-full bg-white px-6 py-2.5 text-sm font-bold text-pp-ink transition-colors hover:bg-pp-text"
              >
                Manage substitutes →
              </Link>
            </div>
          </div>
        </section>
      )}

      {new Date().toISOString().slice(0, 10) < NEW_SCHEDULE_START && (
        <div className="rounded-2xl border border-pp-gold/25 bg-pp-gold/10 px-4 py-3 text-sm text-pp-text/90">
          <span className="font-semibold text-pp-gold-light">Heads up:</span>{" "}
          starting September 6, Sunday School meets every Sunday for 25 minutes
          under the new second-hour schedule. The schedule switches over
          automatically.
        </div>
      )}

      {comingUp.length > 0 && (
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold text-pp-text">
              Coming up
            </h2>
            <Link
              href="/schedule"
              className="text-sm font-semibold text-pp-gold hover:text-pp-gold-light"
            >
              Full schedule →
            </Link>
          </div>
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
            {comingUp.map((l) => {
              const teaching = isTeachingSunday(
                l.sunday,
                data.settings.meetWeeks
              );
              return (
                <div
                  key={l.sunday}
                  className={`group w-52 shrink-0 overflow-hidden rounded-2xl border transition-colors ${
                    teaching
                      ? "border-pp-gold/40 bg-pp-card"
                      : "border-pp-border bg-pp-card-2"
                  }`}
                >
                  <div className="relative h-32">
                    <LessonArt week={l.week} className="h-full w-full" />
                    {teaching && (
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-pp-gold px-2.5 py-0.5 text-[10px] font-bold text-pp-ink">
                        Sunday School
                      </span>
                    )}
                  </div>
                  <div className="p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-pp-muted">
                      Week {l.week}
                    </p>
                    <p className="font-display mt-1 text-base font-semibold text-pp-text">
                      {formatSunday(l.sunday).replace("Sunday, ", "")}
                    </p>
                    <p
                      className={`mt-1 line-clamp-2 text-xs leading-relaxed ${
                        l.special
                          ? "font-semibold text-pp-gold-light"
                          : "text-pp-muted"
                      }`}
                    >
                      {l.ref}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {thisWeek && (
          <div className="col-span-2 flex overflow-hidden rounded-2xl border border-pp-border bg-pp-card">
            <div className="w-36 shrink-0">
              <LessonArt week={thisWeek.week} className="h-full w-full" />
            </div>
            <div className="p-5">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-pp-gold">
                This week&apos;s study
              </h2>
              <p className="font-display mt-2 text-lg font-semibold leading-snug text-pp-text">
                {thisWeek.ref}
              </p>
              <p className="mt-1 text-sm text-pp-muted">{thisWeek.dates}</p>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-pp-border bg-pp-card p-5 text-center">
          <p className="font-display text-4xl font-semibold text-pp-text">
            {data.classes.length}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-pp-muted">
            Classes
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-pp-border bg-pp-card p-5 text-center">
          <p className="font-display text-4xl font-semibold text-pp-text">
            {data.teachers.length}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-pp-muted">
            Teachers
          </p>
        </div>
      </div>
    </div>
  );
}
