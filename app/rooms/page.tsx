"use client";

import { useState } from "react";
import Link from "next/link";
import {
  doorName,
  isYouthClass,
  parseRosterText,
  placeFor,
  youthAgeLabel,
} from "@/lib/rooms";
import { regularTeacherNames, SSClass, useAppData } from "@/lib/store";

function SignCard({
  cls,
  teachers,
  showWriteInLines,
  onSaveRoom,
  onSaveRoster,
}: {
  cls: SSClass;
  teachers: string[];
  showWriteInLines: boolean;
  onSaveRoom: (room: string) => void;
  onSaveRoster: (roster: string[]) => void;
}) {
  const place = placeFor(cls.room);
  const sign = doorName(cls.room);
  const youth = isYouthClass(cls.name, cls.roster);
  const ageLabel = youthAgeLabel(cls.name);
  const roster = cls.roster ?? [];

  const [roomDraft, setRoomDraft] = useState(cls.room ?? "");
  const [editingRoster, setEditingRoster] = useState(false);
  const [rosterDraft, setRosterDraft] = useState(roster.join("\n"));

  function saveRoster() {
    const parsed = parseRosterText(rosterDraft);
    onSaveRoster(parsed);
    setRosterDraft(parsed.join("\n"));
    setEditingRoster(false);
  }

  return (
    <div className="flex flex-col justify-between rounded-lg border-2 border-ink/80 bg-white p-5 print:break-inside-avoid print:rounded-none print:border print:border-dashed print:border-ink/60 print:p-4">
      <div>
        {/* Sign header — sits right below the physical 6" x 6" room plaque */}
        <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            Sunday School
            {ageLabel ? ` · ${ageLabel.replace(/^Youth · /, "")}` : ""}
          </p>
          {sign ? (
            <span className="shrink-0 rounded bg-primary-soft px-2 py-0.5 font-serif text-sm font-bold text-primary-dark print:border print:border-line-2 print:bg-transparent">
              {sign}
            </span>
          ) : (
            <span className="shrink-0 text-xs font-semibold text-warn print:hidden">
              No room set
            </span>
          )}
        </div>

        {/* Class name */}
        <h2 className="mt-2.5 font-serif text-2xl font-bold leading-tight tracking-tight text-ink">
          {cls.name}
        </h2>

        {/* Teachers */}
        <p className="mt-1 text-sm text-ink-2">
          <span className="font-semibold text-ink">
            {teachers.length === 1 ? "Teacher: " : "Teachers: "}
          </span>
          {teachers.length > 0 ? (
            teachers.join(" · ")
          ) : (
            <span className="font-semibold text-warn">No teacher assigned</span>
          )}
        </p>

        {/* Youth class roster — printed right on the door sign */}
        {youth && (
          <div
            className={`mt-3.5 border-t border-line pt-2.5 ${
              roster.length === 0 && !showWriteInLines ? "print:hidden" : ""
            }`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-3">
                Class Roster
                {roster.length > 0 ? ` (${roster.length})` : ""}
              </p>
              <button
                type="button"
                onClick={() => {
                  setRosterDraft((cls.roster ?? []).join("\n"));
                  setEditingRoster((v) => !v);
                }}
                className="text-xs font-semibold text-primary hover:underline print:hidden"
              >
                {editingRoster
                  ? "Cancel"
                  : roster.length > 0
                    ? "Edit roster"
                    : "+ Add class roster"}
              </button>
            </div>

            {roster.length > 0 && !editingRoster && (
              <ul
                className={`mt-1.5 grid gap-x-4 gap-y-0.5 text-xs font-medium text-ink ${
                  roster.length > 14
                    ? "grid-cols-2 sm:grid-cols-3 print:grid-cols-3"
                    : "grid-cols-2"
                }`}
              >
                {roster.map((member) => (
                  <li key={member} className="truncate py-0.5">
                    {member}
                  </li>
                ))}
              </ul>
            )}

            {roster.length === 0 && !editingRoster && (
              <>
                <p className="mt-1 text-xs text-ink-3 print:hidden">
                  No youth names added yet. Click{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setRosterDraft("");
                      setEditingRoster(true);
                    }}
                    className="font-semibold text-primary hover:underline"
                  >
                    + Add class roster
                  </button>{" "}
                  to paste names from LCR so youth can find their name on the
                  door.
                </p>
                {showWriteInLines && (
                  <div className="mt-2 hidden grid-cols-2 gap-x-4 gap-y-3 print:grid">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="border-b border-line-2 pb-1" />
                    ))}
                  </div>
                )}
              </>
            )}

            {editingRoster && (
              <div className="mt-2 space-y-2 rounded-md border border-line bg-surface p-2.5 print:hidden">
                <p className="text-xs text-ink-2">
                  One name per line, or paste directly from an LCR class roll
                  (<code>Last, First</code> is flipped automatically).
                </p>
                <textarea
                  value={rosterDraft}
                  onChange={(e) => setRosterDraft(e.target.value)}
                  rows={6}
                  placeholder={"Ethan McAllister\nEmma Larsen\nNoah Mendenhall"}
                  className="w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-3"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-ink-3">
                    {parseRosterText(rosterDraft).length} names
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingRoster(false)}
                      className="rounded-md border border-line-2 bg-white px-2.5 py-1 text-xs font-semibold text-ink hover:bg-surface"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveRoster}
                      className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-primary-dark"
                    >
                      Save roster
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Screen-only room editor + building plan location helper */}
      <div className="mt-4 border-t border-line pt-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs text-ink-2">
            <span className="font-semibold">Room / plaque:</span>
            <input
              value={roomDraft}
              onChange={(e) => setRoomDraft(e.target.value)}
              onBlur={() => onSaveRoom(roomDraft)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSaveRoom(roomDraft);
                }
              }}
              placeholder="e.g. 107 or Relief Society"
              aria-label={`Room for ${cls.name}`}
              className="w-44 rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink"
            />
          </label>
          {!youth && (
            <button
              type="button"
              onClick={() => {
                if (roster.length === 0) {
                  onSaveRoster(["Class member"]);
                }
              }}
              className="text-xs text-ink-3 hover:text-primary hover:underline"
            >
              + Roster on sign
            </button>
          )}
        </div>
        {place.where && (
          <p className="mt-1.5 text-xs text-ink-2">{place.where}</p>
        )}
        {place.note && (
          <p
            className={`mt-1 text-xs ${
              place.known ? "text-ink-3" : "font-medium text-warn"
            }`}
          >
            {place.note}
          </p>
        )}
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const { data, update } = useAppData();
  const [youthOnly, setYouthOnly] = useState(false);
  const [showWriteInLines, setShowWriteInLines] = useState(false);

  if (!data) return null;

  function setRoom(classId: string, room: string) {
    update((d) => ({
      ...d,
      classes: d.classes.map((c) =>
        c.id === classId ? { ...c, room: room.trim() || undefined } : c
      ),
    }));
  }

  function setRoster(classId: string, roster: string[]) {
    update((d) => ({
      ...d,
      classes: d.classes.map((c) =>
        c.id === classId
          ? { ...c, roster: roster.length > 0 ? roster : undefined }
          : c
      ),
    }));
  }

  const visibleClasses = youthOnly
    ? data.classes.filter((c) => isYouthClass(c.name, c.roster))
    : data.classes;

  return (
    <div className="space-y-6">
      {/* Top header & print controls (hidden on print) */}
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Room Signs &amp; Locations
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-2">
            Small printable signs sized to mount under each room number plaque
            so members and youth know which Sunday School class meets inside.
            Youth classes include their class roster right on the sign.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-1.5 text-xs text-ink-2">
            <input
              type="checkbox"
              checked={youthOnly}
              onChange={(e) => setYouthOnly(e.target.checked)}
              className="accent-primary"
            />
            Youth signs only
          </label>
          <label className="flex items-center gap-1.5 text-xs text-ink-2">
            <input
              type="checkbox"
              checked={showWriteInLines}
              onChange={(e) => setShowWriteInLines(e.target.checked)}
              className="accent-primary"
            />
            Blank lines if roster is empty
          </label>
          <a
            href="/sunday-school-room-signs.pdf"
            download="Sunday-School-room-signs.pdf"
            className="rounded-md border border-line-2 bg-white px-4 py-1.5 text-sm font-semibold text-ink hover:bg-surface"
          >
            Download PDF
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Print signs
          </button>
        </div>
      </div>

      {/* Building map vs. door plaque callout */}
      <div className="rounded-lg border border-primary/25 bg-primary-soft px-4 py-3 text-xs text-ink print:hidden">
        <span className="font-semibold text-primary-dark">
          New building note (1500 N 2700 W):
        </span>{" "}
        On the F102 floor plan drawing, <strong>110</strong> is a Clerk’s
        Office, <strong>104</strong> is a Bishop’s Office, and{" "}
        <strong>107</strong> is the south hallway — while the physical{" "}
        <strong>6&quot; × 6&quot; door plaques</strong> in the hallways are
        numbered <strong>101–108</strong> (north hallway, map rooms 142–135) and{" "}
        <strong>110–114</strong> (south hallway, map rooms 118, 117, 116, 113,
        112). Set each class’s room below to match the door where you’ll post
        its sign.
      </div>

      {visibleClasses.length === 0 ? (
        <p className="text-sm text-ink-2">
          No classes yet.{" "}
          <Link
            href="/teachers"
            className="font-semibold text-primary hover:underline"
          >
            Add classes on Teachers &amp; Classes
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2 print:gap-3">
          {visibleClasses.map((cls) => (
            <SignCard
              key={`${cls.id}-${cls.room ?? ""}-${(cls.roster ?? []).length}`}
              cls={cls}
              teachers={regularTeacherNames(cls, data)}
              showWriteInLines={showWriteInLines}
              onSaveRoom={(room) => setRoom(cls.id, room)}
              onSaveRoster={(roster) => setRoster(cls.id, roster)}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-ink-3 print:hidden">
        Tip: When printing, each card has a dashed cut border so you can trim it
        and tape it directly beneath the 6&quot; × 6&quot; room number sign.
        You can also manage classes and rosters on{" "}
        <Link
          href="/teachers"
          className="font-semibold text-primary hover:underline"
        >
          Teachers &amp; Classes
        </Link>
        .
      </p>
    </div>
  );
}
