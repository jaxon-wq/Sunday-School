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
    <div className="space-y-8">
      {data.classes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-pp-border bg-pp-card p-6">
          <h2 className="font-bold text-white">Get set up</h2>
          <p className="mt-1 text-sm text-pp-muted">
            Add your classes and teachers to start tracking who teaches each
            Sunday. You can start from a typical ward setup and rename things
            later.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={seedClasses}
              className="rounded-full bg-pp-blue px-5 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(0,100,255,0.4)] transition-colors hover:bg-pp-blue-light"
            >
              Start with a typical setup
            </button>
            <Link
              href="/teachers"
              className="rounded-full border border-pp-border px-5 py-2 text-sm font-semibold text-pp-text transition-colors hover:bg-white/10"
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
        <section className="relative overflow-hidden rounded-3xl border border-pp-border shadow-[0_0_60px_rgba(0,100,255,0.25)]">
          <LessonArt week={next.week} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070d20]/95 via-[#0a1638]/80 to-[#0a1638]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070d20]/90 via-transparent to-transparent" />
          <div className="relative p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            Next Sunday School
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {formatSunday(next.sunday)}
          </h1>
          <p className="mt-1 text-lg font-medium text-blue-100">{next.ref}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-pp-blue px-3 py-1 text-xs font-bold text-white">
              {next.sunday >= NEW_SCHEDULE_START
                ? "25 min class"
                : occurrenceLabel(next.sunday)}
            </span>
            {data.weekNotes[next.sunday] && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
                {data.weekNotes[next.sunday]}
              </span>
            )}
          </div>
          {data.classes.length > 0 && (
            <ul className="mt-6 divide-y divide-white/10 border-t border-white/10">
              {data.classes.map((cls) => {
                const eff = effectiveTeacherLabel(data, next.sunday, cls);
                return (
                  <li
                    key={cls.id}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <span className="text-blue-100">{cls.name}</span>
                    <span
                      className={
                        eff.missing
                          ? "font-semibold text-amber-300"
                          : "font-medium text-white"
                      }
                    >
                      {eff.label}
                      {eff.isSubstitute && (
                        <span className="ml-2 rounded-full bg-violet-500/25 px-2 py-0.5 text-xs font-semibold text-violet-300">
                          sub
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href="/schedule"
            className="mt-5 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-[#0a1230] transition-colors hover:bg-blue-100"
          >
            Manage substitutes →
          </Link>
          </div>
        </section>
      )}

      {new Date().toISOString().slice(0, 10) < NEW_SCHEDULE_START && (
        <div className="rounded-2xl border border-pp-blue/30 bg-pp-blue/10 px-4 py-3 text-sm text-blue-200">
          <span className="font-semibold">Heads up:</span> starting September
          6, Sunday School meets every Sunday for 25 minutes under the new
          second-hour schedule. The schedule switches over automatically.
        </div>
      )}

      {comingUp.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-white">Coming up</h2>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {comingUp.map((l) => {
              const teaching = isTeachingSunday(
                l.sunday,
                data.settings.meetWeeks
              );
              return (
                <div
                  key={l.sunday}
                  className={`w-48 shrink-0 overflow-hidden rounded-2xl border ${
                    teaching
                      ? "border-pp-blue/40 bg-[#0d1734]"
                      : "border-pp-border bg-pp-card-2"
                  }`}
                >
                  <div className="relative h-26">
                    <LessonArt week={l.week} className="h-full w-full" />
                    {teaching && (
                      <span className="absolute left-2 top-2 rounded-full bg-pp-blue px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(0,100,255,0.6)]">
                        Sunday School
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] font-semibold text-pp-muted">
                      Week {l.week}
                    </p>
                    <p className="font-bold text-white">
                      {formatSunday(l.sunday).replace("Sunday, ", "")}
                    </p>
                    <p
                      className={`mt-0.5 line-clamp-2 text-xs ${
                        l.special
                          ? "font-semibold text-rose-300"
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
            <div className="w-32 shrink-0">
              <LessonArt week={thisWeek.week} className="h-full w-full" />
            </div>
            <div className="p-5">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-pp-muted">
                This week&apos;s study
              </h2>
              <p className="mt-2 font-bold text-white">{thisWeek.ref}</p>
              <p className="text-sm text-pp-muted">{thisWeek.dates}</p>
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-pp-border bg-pp-card p-5 text-center">
          <p className="text-3xl font-extrabold text-white">
            {data.classes.length}
          </p>
          <p className="text-sm text-pp-muted">Classes</p>
        </div>
        <div className="rounded-2xl border border-pp-border bg-pp-card p-5 text-center">
          <p className="text-3xl font-extrabold text-white">
            {data.teachers.length}
          </p>
          <p className="text-sm text-pp-muted">Teachers</p>
        </div>
      </div>
    </div>
  );
}
