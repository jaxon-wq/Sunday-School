"use client";

import Link from "next/link";
import LessonArt, { artworkFor } from "@/components/LessonArt";
import { LESSONS, formatSunday, lessonUrl, occurrenceLabel, parseISODate } from "@/lib/lessons";
import {
  CARE_THRESHOLD,
  NEW_SCHEDULE_START,
  effectiveTeacherLabel,
  isTeachingSunday,
  offerBreakMessage,
  smsHref,
  teacherLoads,
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
  const nextArt = next ? artworkFor(next.week) : null;
  const careAlert = teacherLoads(data).find(
    (l) => l.streak + (l.scheduledNext ? 1 : 0) >= CARE_THRESHOLD
  );

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
        <div className="rounded-lg border border-line bg-surface p-6">
          <h2 className="font-serif text-lg font-bold">Get set up</h2>
          <p className="mt-1 text-sm text-ink-2">
            Add your classes and teachers to start tracking who teaches each
            Sunday. You can start from a typical ward setup and rename things
            later — or wait and populate from LCR.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={seedClasses}
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Start with a typical setup
            </button>
            <Link
              href="/teachers"
              className="rounded-md border border-line-2 bg-white px-5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface"
            >
              Add classes manually
            </Link>
          </div>
        </div>
      )}

      {unstaffed.length > 0 && (
        <div className="rounded-lg border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-ink">
          <span className="font-semibold text-warn">
            {unstaffed.length}{" "}
            {unstaffed.length === 1 ? "class has" : "classes have"} no teacher
            assigned:
          </span>{" "}
          {unstaffed.map((c) => c.name).join(", ")} ·{" "}
          <Link href="/teachers" className="font-semibold text-primary underline">
            assign teachers
          </Link>
        </div>
      )}

      {careAlert && (
        <div className="rounded-lg border border-primary/25 bg-primary-soft px-4 py-3 text-sm text-ink">
          <span className="font-semibold text-primary-dark">Teacher care:</span>{" "}
          {careAlert.teacher.name} has taught{" "}
          {careAlert.streak + (careAlert.scheduledNext ? 1 : 0)} Sundays in a
          row{careAlert.scheduledNext && ", including this coming Sunday"}.
          Consider offering a break —{" "}
          {careAlert.teacher.phone && (
            <>
              <a
                href={smsHref(
                  careAlert.teacher.phone,
                  offerBreakMessage(careAlert.teacher.name)
                )}
                className="font-semibold text-primary underline"
              >
                send a kind text
              </a>{" "}
              or{" "}
            </>
          )}
          <Link href="/presidency" className="font-semibold text-primary underline">
            see teacher care
          </Link>
          .
        </div>
      )}

      {next && (
        <section className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="relative">
            <LessonArt week={next.week} className="h-56 w-full sm:h-72" />
          </div>
          <div className="px-5 pb-5 pt-4 sm:px-8 sm:pb-7 sm:pt-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-3">
                Next Sunday School ·{" "}
                {next.sunday >= NEW_SCHEDULE_START
                  ? "25 minutes"
                  : occurrenceLabel(next.sunday)}
              </p>
              {nextArt && (
                <p className="text-xs italic text-ink-3">
                  “{nextArt.title},” {nextArt.artist}
                </p>
              )}
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              {formatSunday(next.sunday)}
            </h1>
            <p className="mt-1 font-serif text-lg">
              <a
                href={lessonUrl(next.week)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-2 hover:text-primary hover:underline"
              >
                {next.ref}
              </a>
            </p>
            {data.weekNotes[next.sunday] && (
              <p className="mt-3 inline-block rounded-md bg-primary-soft px-3 py-1.5 text-sm text-primary-dark">
                {data.weekNotes[next.sunday]}
              </p>
            )}
            {data.classes.length > 0 && (
              <ul className="mt-5 divide-y divide-line border-t border-line">
                {data.classes.map((cls) => {
                  const eff = effectiveTeacherLabel(data, next.sunday, cls);
                  return (
                    <li
                      key={cls.id}
                      className="flex items-center justify-between gap-4 py-2.5 text-sm"
                    >
                      <span className="text-ink-2">{cls.name}</span>
                      <span
                        className={
                          eff.missing
                            ? "font-semibold text-warn"
                            : "font-medium text-ink"
                        }
                      >
                        {eff.label}
                        {eff.isSubstitute && (
                          <span className="ml-2 rounded bg-primary-soft px-1.5 py-0.5 text-xs font-semibold text-primary">
                            substitute
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/schedule"
                className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Manage substitutes
              </Link>
              <Link
                href="/presidency"
                className="rounded-md border border-line-2 bg-white px-5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface"
              >
                Sunday checklist
              </Link>
            </div>
          </div>
        </section>
      )}

      {new Date().toISOString().slice(0, 10) < NEW_SCHEDULE_START && (
        <div className="rounded-lg border border-primary/25 bg-primary-soft px-4 py-3 text-sm text-ink">
          <span className="font-semibold text-primary-dark">Heads up:</span>{" "}
          starting September 6, Sunday School meets every Sunday for 25 minutes
          under the new second-hour schedule. The schedule switches over
          automatically.
        </div>
      )}

      {comingUp.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl font-bold">Coming up</h2>
            <Link
              href="/schedule"
              className="text-sm font-semibold text-primary hover:text-primary-dark hover:underline"
            >
              Full schedule
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
                  className="w-48 shrink-0 overflow-hidden rounded-lg border border-line bg-white"
                >
                  <LessonArt week={l.week} className="h-28 w-full" />
                  <div className="p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-3">
                      Week {l.week}
                      {teaching && (
                        <span className="ml-1.5 rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold normal-case tracking-normal text-primary">
                          Sunday School
                        </span>
                      )}
                    </p>
                    <p className="mt-1 font-serif font-bold">
                      {formatSunday(l.sunday).replace("Sunday, ", "")}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs">
                      <a
                        href={lessonUrl(l.week)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:text-primary hover:underline ${
                          l.special
                            ? "font-semibold text-primary"
                            : "text-ink-2"
                        }`}
                      >
                        {l.ref}
                      </a>
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
          <div className="col-span-2 flex overflow-hidden rounded-lg border border-line bg-white">
            <LessonArt week={thisWeek.week} className="w-28 shrink-0 sm:w-32" />
            <div className="p-4">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-3">
                This week&apos;s study
              </h2>
              <p className="mt-1.5 font-serif font-bold">{thisWeek.ref}</p>
              <p className="text-sm text-ink-2">{thisWeek.dates}</p>
              <a
                href={lessonUrl(thisWeek.week)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-block text-xs font-semibold text-primary hover:underline"
              >
                Open in Come, Follow Me
              </a>
            </div>
          </div>
        )}
        <div className="rounded-lg border border-line bg-white p-4 text-center">
          <p className="font-serif text-3xl font-bold">{data.classes.length}</p>
          <p className="text-sm text-ink-2">Classes</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4 text-center">
          <p className="font-serif text-3xl font-bold">
            {data.teachers.length}
          </p>
          <p className="text-sm text-ink-2">Teachers</p>
        </div>
      </div>
    </div>
  );
}
