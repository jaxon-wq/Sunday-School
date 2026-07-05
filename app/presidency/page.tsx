"use client";

import { useState } from "react";
import { LESSONS, formatSunday, parseISODate } from "@/lib/lessons";
import {
  CARE_THRESHOLD,
  CARE_WATCH,
  ChecklistItem,
  PRESIDENCY_ROLES,
  PresidencyRole,
  isTeachingSunday,
  offerBreakMessage,
  smsHref,
  teacherLoads,
  todayStart,
  uid,
  useAppData,
} from "@/lib/store";

// Adapted from General Handbook ch. 13 (Sunday School).
const RESPONSIBILITIES: { role: string; duties: string[] }[] = [
  {
    role: "President",
    duties: [
      "Preside; serve as a member of the ward council",
      "Recommend members to serve as Sunday School teachers",
      "Support teacher council meetings and help teachers improve in the Savior's way",
      "Help ward members improve gospel learning at home and at church",
      "Hold regular presidency meetings; counsel with the bishopric",
    ],
  },
  {
    role: "First Counselor",
    duties: [
      "Serve as assigned by the president (suggested: adult classes)",
      "Arrange substitutes when teachers can't make it",
      "Visit classes regularly; encourage and support teachers",
      "Lead teacher council discussions as assigned",
    ],
  },
  {
    role: "Second Counselor",
    duties: [
      "Serve as assigned by the president (suggested: youth classes)",
      "Sunday logistics: rooms, chairs, and class materials ready",
      "Fellowship and orient newly called teachers",
      "Check in with new or struggling teachers each week",
    ],
  },
  {
    role: "Secretary",
    duties: [
      "Prepare agendas for presidency and teacher council meetings",
      "Record assignments and follow-ups; make sure nothing is dropped",
      "Keep class and teacher lists current (from LCR when available)",
      "Note items the president should raise in ward council",
    ],
  },
];

export default function PresidencyPage() {
  const { data, update, lockEnabled, enableLock, disableLock } = useAppData();
  const [newItem, setNewItem] = useState("");
  const [newOwner, setNewOwner] = useState<PresidencyRole | "Everyone">(
    "President"
  );
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [pinBusy, setPinBusy] = useState(false);
  if (!data) return null;

  async function savePin(e: React.FormEvent) {
    e.preventDefault();
    if (pin1.length < 4) {
      setPinMsg("Use at least 4 characters.");
      return;
    }
    if (pin1 !== pin2) {
      setPinMsg("Those don't match.");
      return;
    }
    setPinBusy(true);
    await enableLock(pin1);
    setPinBusy(false);
    setPin1("");
    setPin2("");
    setPinMsg(lockEnabled ? "Passcode changed." : "Passcode on — data on this device is now encrypted.");
  }

  const today = todayStart();
  const upcomingTeaching = LESSONS.filter(
    (l) =>
      parseISODate(l.sunday) >= today &&
      isTeachingSunday(l.sunday, data.settings.meetWeeks)
  );
  const target = upcomingTeaching[0];
  const done = target ? (data.checklist[target.sunday] ?? {}) : {};
  const doneCount = target
    ? data.checklistItems.filter((i) => done[i.id]).length
    : 0;

  function setMember(role: PresidencyRole, field: "name" | "phone", value: string) {
    update((d) => ({
      ...d,
      presidency: d.presidency.map((m) =>
        m.role === role ? { ...m, [field]: value } : m
      ),
    }));
  }

  function toggle(itemId: string) {
    if (!target) return;
    const sunday = target.sunday;
    update((d) => {
      const forDay = { ...(d.checklist[sunday] ?? {}) };
      forDay[itemId] = !forDay[itemId];
      return { ...d, checklist: { ...d.checklist, [sunday]: forDay } };
    });
  }

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    const label = newItem.trim();
    if (!label) return;
    const item: ChecklistItem = { id: uid(), label, assignedTo: newOwner };
    update((d) => ({ ...d, checklistItems: [...d.checklistItems, item] }));
    setNewItem("");
  }

  function removeItem(id: string) {
    update((d) => ({
      ...d,
      checklistItems: d.checklistItems.filter((i) => i.id !== id),
    }));
  }

  function ownerName(role: ChecklistItem["assignedTo"]): string {
    if (role === "Everyone") return "Everyone";
    const m = data!.presidency.find((p) => p.role === role);
    return m?.name ? `${role} · ${m.name.split(" ")[0]}` : role;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">
          Presidency
        </h1>
        <p className="mt-1 text-sm text-ink-2">
          Who we are, what each of us carries, and the rhythm of a Sunday.
        </p>
      </div>

      {/* Members */}
      <section>
        <h2 className="mb-3 font-serif text-xl font-bold">Members</h2>
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          {data.presidency.map((m, i) => (
            <div
              key={m.role}
              className={`flex flex-wrap items-center gap-3 px-4 py-3 ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <span className="w-36 shrink-0 text-sm font-semibold">
                {m.role}
              </span>
              <input
                value={m.name}
                onChange={(e) => setMember(m.role, "name", e.target.value)}
                placeholder="Name"
                className="min-w-0 flex-1 rounded-md border border-line px-3 py-1.5 text-sm placeholder:text-ink-3"
              />
              <input
                value={m.phone ?? ""}
                onChange={(e) => setMember(m.role, "phone", e.target.value)}
                placeholder="Phone"
                className="w-36 rounded-md border border-line px-3 py-1.5 text-sm placeholder:text-ink-3"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Sunday checklist */}
      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl font-bold">Sunday checklist</h2>
          {target && (
            <p className="text-sm text-ink-2">
              For{" "}
              <span className="font-semibold text-ink">
                {formatSunday(target.sunday)}
              </span>{" "}
              · {target.ref} ·{" "}
              <span className="font-semibold text-primary">
                {doneCount}/{data.checklistItems.length} done
              </span>
            </p>
          )}
        </div>
        {!target ? (
          <p className="text-sm text-ink-3">No upcoming teaching Sundays.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-white">
            {data.checklistItems.map((item, i) => (
              <label
                key={item.id}
                className={`group flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-surface ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(done[item.id])}
                  onChange={() => toggle(item.id)}
                  className="h-4 w-4 shrink-0 accent-primary"
                />
                <span
                  className={`flex-1 text-sm ${
                    done[item.id] ? "text-ink-3 line-through" : "text-ink"
                  }`}
                >
                  {item.label}
                </span>
                <span className="shrink-0 rounded bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-2">
                  {ownerName(item.assignedTo)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    removeItem(item.id);
                  }}
                  className="text-xs text-ink-3 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                  aria-label={`Remove "${item.label}"`}
                >
                  Remove
                </button>
              </label>
            ))}
            <form
              onSubmit={addItem}
              className="flex flex-wrap items-center gap-2 border-t border-line bg-surface px-4 py-3"
            >
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add a checklist item…"
                className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-1.5 text-sm placeholder:text-ink-3"
              />
              <select
                value={newOwner}
                onChange={(e) =>
                  setNewOwner(e.target.value as PresidencyRole | "Everyone")
                }
                className="rounded-md border border-line bg-white px-2 py-1.5 text-sm"
              >
                {[...PRESIDENCY_ROLES, "Everyone"].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Add
              </button>
            </form>
          </div>
        )}
        <p className="mt-2 text-xs text-ink-3">
          The checklist resets automatically each teaching Sunday. Checked items
          are saved per date.
        </p>
      </section>

      {/* Teacher care */}
      <section>
        <h2 className="mb-1 font-serif text-xl font-bold">Teacher care</h2>
        <p className="mb-3 text-sm text-ink-2">
          Under the weekly schedule a faithful teacher can quietly carry too
          much. These counts exist so a person gets noticed — not as a
          scoreboard.
        </p>
        {(() => {
          const loads = teacherLoads(data!).filter(
            (l) =>
              data!.classes.some((c) => c.teacherIds.includes(l.teacher.id)) ||
              l.taughtOfLast8 > 0
          );
          if (loads.length === 0)
            return (
              <p className="text-sm text-ink-3">
                Add teachers and classes to see teaching load here.
              </p>
            );
          return (
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              {loads.map((l, i) => {
                const effective = l.streak + (l.scheduledNext ? 1 : 0);
                const tier =
                  effective >= CARE_THRESHOLD
                    ? "bg-warn-soft text-warn"
                    : effective >= CARE_WATCH
                      ? "bg-primary-soft text-primary-dark"
                      : "bg-surface-2 text-ink-2";
                return (
                  <div
                    key={l.teacher.id}
                    className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 ${
                      i > 0 ? "border-t border-line" : ""
                    }`}
                  >
                    <span className="min-w-32 font-semibold">
                      {l.teacher.name}
                      {l.teacher.substitute && (
                        <span className="ml-2 rounded bg-primary-soft px-1.5 py-0.5 text-xs font-semibold text-primary">
                          substitute
                        </span>
                      )}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${tier}`}
                    >
                      {effective === 0
                        ? "not currently teaching"
                        : `${effective} Sunday${effective === 1 ? "" : "s"} in a row`}
                    </span>
                    {l.scheduledNext && effective > 0 && (
                      <span className="text-xs text-ink-3">
                        including this coming Sunday
                      </span>
                    )}
                    <span className="text-xs text-ink-3">
                      · taught {l.taughtOfLast8} of the last 8
                    </span>
                    {l.teacher.phone && effective >= CARE_WATCH && (
                      <a
                        href={smsHref(
                          l.teacher.phone,
                          offerBreakMessage(l.teacher.name)
                        )}
                        className="ml-auto rounded-md border border-line-2 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary-soft"
                      >
                        Offer a break
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </section>

      {/* Security */}
      <section>
        <h2 className="mb-1 font-serif text-xl font-bold">Passcode</h2>
        <p className="mb-3 text-sm text-ink-2">
          {lockEnabled
            ? "Passcode is on. Everything this app stores on this device is encrypted — without the passcode it's unreadable."
            : "Optional: set a passcode and everything this app stores on this device is encrypted. You'll enter it once each time you open the app."}
        </p>
        <div className="rounded-lg border border-line bg-white p-4">
          <form onSubmit={savePin} className="flex flex-wrap items-center gap-2">
            <input
              type="password"
              value={pin1}
              onChange={(e) => setPin1(e.target.value)}
              placeholder={lockEnabled ? "New passcode" : "Passcode"}
              className="w-40 rounded-md border border-line px-3 py-1.5 text-sm placeholder:text-ink-3"
            />
            <input
              type="password"
              value={pin2}
              onChange={(e) => setPin2(e.target.value)}
              placeholder="Repeat it"
              className="w-40 rounded-md border border-line px-3 py-1.5 text-sm placeholder:text-ink-3"
            />
            <button
              type="submit"
              disabled={pinBusy}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {pinBusy ? "Working…" : lockEnabled ? "Change passcode" : "Turn on"}
            </button>
            {lockEnabled && (
              <button
                type="button"
                onClick={() => {
                  disableLock();
                  setPinMsg("Passcode off — data stored unencrypted again.");
                }}
                className="rounded-md border border-line-2 px-4 py-1.5 text-sm font-semibold text-ink hover:bg-surface"
              >
                Turn off
              </button>
            )}
            {pinMsg && <span className="text-sm text-ink-2">{pinMsg}</span>}
          </form>
          <p className="mt-3 text-xs text-ink-3">
            Each device sets its own passcode — have your counselors set one
            too. If a passcode is forgotten the data can&apos;t be recovered
            (that&apos;s the point), so keep an exported backup somewhere safe.
            Note: exported and shared files are unencrypted — treat them like
            a paper roster. The website itself holds no ward data; this
            protects the copy on each device.
          </p>
        </div>
      </section>

      {/* Roles & responsibilities */}
      <section>
        <h2 className="mb-3 font-serif text-xl font-bold">
          Roles &amp; responsibilities
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {RESPONSIBILITIES.map((r) => (
            <div
              key={r.role}
              className="rounded-lg border border-line bg-white p-5"
            >
              <h3 className="font-serif text-lg font-bold">{r.role}</h3>
              <ul className="mt-3 space-y-2">
                {r.duties.map((duty) => (
                  <li key={duty} className="flex gap-2 text-sm text-ink-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {duty}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-3">
          Adapted from the{" "}
          <a
            href="https://www.churchofjesuschrist.org/study/manual/general-handbook/13-sunday-school?lang=eng"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            General Handbook, chapter 13: Sunday School
          </a>
          . Assignments between counselors are the president&apos;s to adjust.
        </p>
      </section>
    </div>
  );
}
