"use client";

import Link from "next/link";
import LessonArt from "@/components/LessonArt";
import { LESSONS, formatSunday, occurrenceLabel, parseISODate } from "@/lib/lessons";
import {
  NEW_SCHEDULE_START,
  effectiveTeacherLabel,
  isTeachingSunday,
  todayStart,
  useAppData,
} from "@/lib/store";

// A clean, screenshottable view of the next several Sundays — for the
// bishopric, a teachers' group thread, or the clerk's bulletin.
export default function MonthPage() {
  const { data } = useAppData();
  if (!data) return null;

  const today = todayStart();
  const upcoming = LESSONS.filter((l) => parseISODate(l.sunday) >= today).slice(
    0,
    5
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            The next month
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            Screenshot this, or print it for the bishopric.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Print
          </button>
          <Link
            href="/schedule"
            className="rounded-md border border-line-2 px-4 py-1.5 text-sm font-semibold text-ink hover:bg-surface"
          >
            Full schedule
          </Link>
        </div>
      </div>

      <div className="hidden print:block">
        <h1 className="font-serif text-2xl font-bold">
          Sunday School — coming Sundays
        </h1>
      </div>

      <div className="space-y-4">
        {upcoming.map((l) => {
          const teaching = isTeachingSunday(l.sunday, data.settings.meetWeeks);
          return (
            <div
              key={l.sunday}
              className={`overflow-hidden rounded-lg border ${
                teaching ? "border-line bg-white" : "border-line bg-surface"
              }`}
            >
              <div className="flex items-stretch">
                <div className="w-24 shrink-0 sm:w-36">
                  <LessonArt week={l.week} className="h-full min-h-24 w-full" />
                </div>
                <div className="min-w-0 flex-1 p-4 sm:p-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h2 className="font-serif text-xl font-bold">
                      {formatSunday(l.sunday)}
                    </h2>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        teaching
                          ? "bg-primary-soft text-primary-dark"
                          : "bg-surface-2 text-ink-3"
                      }`}
                    >
                      {teaching
                        ? l.sunday >= NEW_SCHEDULE_START
                          ? "Sunday School · 25 min"
                          : `Sunday School · ${occurrenceLabel(l.sunday)}`
                        : `No Sunday School · ${occurrenceLabel(l.sunday)}`}
                    </span>
                  </div>
                  <p className="mt-0.5 font-serif text-ink-2">{l.ref}</p>
                  {data.weekNotes[l.sunday] && (
                    <p className="mt-1 text-sm font-medium text-primary-dark">
                      {data.weekNotes[l.sunday]}
                    </p>
                  )}
                  {teaching && data.classes.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {data.classes.map((cls) => {
                        const eff = effectiveTeacherLabel(data, l.sunday, cls);
                        return (
                          <li key={cls.id} className="text-sm">
                            <span className="text-ink-2">{cls.name}: </span>
                            <span
                              className={
                                eff.missing
                                  ? "font-semibold text-warn"
                                  : "font-medium"
                              }
                            >
                              {eff.label}
                              {eff.isSubstitute && " (substitute)"}
                            </span>
                            {cls.room && (
                              <span className="text-ink-3"> · Room {cls.room}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
