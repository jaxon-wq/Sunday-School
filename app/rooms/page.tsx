"use client";

import Link from "next/link";
import { LESSONS, formatSunday, parseISODate } from "@/lib/lessons";
import { doorName, placeFor } from "@/lib/rooms";
import {
  effectiveTeacherLabel,
  isTeachingSunday,
  regularTeacherNames,
  todayStart,
  useAppData,
} from "@/lib/store";

export default function RoomsPage() {
  const { data } = useAppData();
  if (!data) return null;

  const today = todayStart();
  const next = LESSONS.find(
    (l) =>
      parseISODate(l.sunday) >= today &&
      isTeachingSunday(l.sunday, data.settings.meetWeeks)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Where we meet
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink-2">
            Each class and the room number on the building plan. A number that
            is not a classroom is called out.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Print
        </button>
      </div>

      <div className="hidden print:block">
        <h1 className="font-serif text-2xl font-bold">
          Sunday School — where we meet
        </h1>
        {next && (
          <p className="text-sm text-ink-2">{formatSunday(next.sunday)}</p>
        )}
      </div>

      {data.classes.length === 0 ? (
        <p className="text-sm text-ink-2">
          No classes yet.{" "}
          <Link href="/teachers" className="font-semibold text-primary hover:underline">
            Add them
          </Link>{" "}
          and a room for each.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
          {data.classes.map((cls) => {
            const place = placeFor(cls.room);
            const sign = doorName(cls.room);
            const regulars = regularTeacherNames(cls, data);
            const eff = next
              ? effectiveTeacherLabel(data, next.sunday, cls)
              : null;
            return (
              <li key={cls.id} className="px-4 py-4 sm:px-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-xl font-bold">{cls.name}</h2>
                  {sign && (
                    <p className="shrink-0 text-right font-serif text-lg font-bold text-primary">
                      {/^\d+$/.test(sign) ? `Room ${sign}` : sign}
                    </p>
                  )}
                </div>
                {place.where && (
                  <p
                    className={`mt-1 text-sm ${
                      place.known ? "text-ink-2" : "font-medium text-warn"
                    }`}
                  >
                    {place.where}
                  </p>
                )}
                {!place.known && cls.room && !place.where && (
                  <p className="mt-1 text-sm text-ink-3">
                    Room saved as “{cls.room}”. It is not on the building sign
                    list.
                  </p>
                )}
                {!cls.room && (
                  <p className="mt-1 text-sm font-semibold text-warn">
                    No room yet
                  </p>
                )}
                <p
                  className={`mt-2 text-sm ${
                    regulars.length === 0
                      ? "font-semibold text-warn"
                      : "text-ink"
                  }`}
                >
                  {regulars.length > 0
                    ? regulars.join(", ")
                    : "No teacher assigned"}
                </p>
                {eff?.isSubstitute && next && (
                  <p className="mt-1 text-sm text-primary">
                    {formatSunday(next.sunday)}: {eff.label}{" "}
                    <span className="rounded bg-primary-soft px-1.5 py-0.5 text-xs font-semibold">
                      substitute
                    </span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-sm text-ink-3 print:hidden">
        North hallway runs from the chapel to the Relief Society room. South
        hallway runs from the chapel, past the serving area, to Primary. Change
        a room on{" "}
        <Link href="/teachers" className="font-semibold text-primary hover:underline">
          Teachers
        </Link>
        .
      </p>
    </div>
  );
}
