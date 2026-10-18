"use client";

import Link from "next/link";
import { LESSONS, formatSunday, parseISODate } from "@/lib/lessons";
import { ZONES, formatRoom, placeFor, type RoomZone } from "@/lib/rooms";
import {
  effectiveTeacherLabel,
  isTeachingSunday,
  todayStart,
  useAppData,
  type SSClass,
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

  const placed = new Map<RoomZone, SSClass[]>();
  const unmatched: SSClass[] = [];
  for (const cls of data.classes) {
    const place = placeFor(cls.room);
    if (!place) {
      unmatched.push(cls);
      continue;
    }
    const list = placed.get(place.zone) ?? [];
    list.push(cls);
    placed.set(place.zone, list);
  }
  for (const list of placed.values()) {
    list.sort(
      (a, b) =>
        (placeFor(a.room)?.order ?? 0) - (placeFor(b.room)?.order ?? 0)
    );
  }

  const zones = ZONES.filter((z) => (placed.get(z.id)?.length ?? 0) > 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-3">
            Willow Haven Ward
            {next ? ` · ${formatSunday(next.sunday)}` : ""}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">
            Where classes meet
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            1500 North 2700 West. Numbers are the signs on the doors.
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-line-2 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-surface"
          >
            Print
          </button>
          <Link
            href="/teachers"
            className="rounded-md border border-line-2 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-surface"
          >
            Change a room
          </Link>
        </div>
      </header>

      {data.classes.length === 0 && (
        <p className="text-sm text-ink-3">
          No classes yet.{" "}
          <Link href="/teachers" className="font-semibold text-primary underline">
            Add them
          </Link>{" "}
          and each one can take a room.
        </p>
      )}

      {zones.map((zone) => (
        <section key={zone.id}>
          <h2 className="font-serif text-xl font-bold">{zone.title}</h2>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
            {placed.get(zone.id)!.map((cls) => {
              const place = placeFor(cls.room)!;
              const eff = next
                ? effectiveTeacherLabel(data, next.sunday, cls)
                : null;
              return (
                <li
                  key={cls.id}
                  className="flex items-start justify-between gap-4 px-4 py-4 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{cls.name}</p>
                    <p className="mt-0.5 text-sm text-ink-2">{place.where}</p>
                    {eff && (
                      <p
                        className={
                          eff.missing
                            ? "mt-1 text-sm font-semibold text-warn"
                            : "mt-1 text-sm text-ink-2"
                        }
                      >
                        {eff.label}
                        {eff.isSubstitute && (
                          <span className="ml-2 rounded bg-primary-soft px-1.5 py-0.5 text-xs font-semibold text-primary">
                            substitute
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-right font-serif text-2xl font-bold leading-none tracking-tight text-primary">
                    {place.door}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {unmatched.length > 0 && (
        <section>
          <h2 className="font-serif text-xl font-bold">Not on this plan</h2>
          <p className="mt-1 text-sm text-ink-2">
            These classes have a room the door list does not know, or no room
            yet.
          </p>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
            {unmatched.map((cls) => (
              <li
                key={cls.id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <span className="font-semibold">{cls.name}</span>
                <span className="text-ink-3">
                  {cls.room ? formatRoom(cls.room) : "No room yet"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-lg border border-line bg-surface px-4 py-4 sm:px-5">
        <h2 className="font-serif text-lg font-bold">How the doors run</h2>
        <dl className="mt-3 space-y-3 text-sm">
          {ZONES.map((zone) => (
            <div key={zone.id}>
              <dt className="font-semibold text-ink">{zone.title}</dt>
              <dd className="text-ink-2">{zone.walk}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
