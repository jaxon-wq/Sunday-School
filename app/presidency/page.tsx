"use client";

import Link from "next/link";
import { useState } from "react";
import { LESSONS, formatSunday, parseISODate } from "@/lib/lessons";
import {
  buildMeetingPacket,
  meetingHasDate,
  packetText,
  tomorrowISO,
} from "@/lib/meeting-packet";
import { getSyncConfig, pullFromCloud, pushToCloud, saveSyncConfig } from "@/lib/sync";
import { migrate } from "@/lib/store";
import {
  CARE_THRESHOLD,
  CARE_WATCH,
  ChecklistItem,
  Meeting,
  PRESIDENCY_ROLES,
  PresidencyRole,
  Visit,
  isTeachingSunday,
  offerBreakMessage,
  smsHref,
  teacherLoads,
  todayISO,
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
  const [meetingDate, setMeetingDate] = useState(tomorrowISO);
  const [newAction, setNewAction] = useState<Record<string, string>>({});
  const [newActionOwner, setNewActionOwner] = useState<
    Record<string, PresidencyRole | "Everyone">
  >({});
  const [visitClass, setVisitClass] = useState("");
  const [visitBy, setVisitBy] = useState<PresidencyRole>("First Counselor");
  const [visitNote, setVisitNote] = useState("");
  const [syncToken, setSyncToken] = useState(() => getSyncConfig().token);
  const [syncGist, setSyncGist] = useState(() => getSyncConfig().gistId);
  const [syncPass, setSyncPass] = useState("");
  const [syncMsg, setSyncMsg] = useState("");
  const [syncBusy, setSyncBusy] = useState(false);
  const [packetCopied, setPacketCopied] = useState(false);
  if (!data) return null;

  const packet = buildMeetingPacket(data);
  const tomorrow = tomorrowISO();
  const hasTomorrow = meetingHasDate(data.meetings, tomorrow);

  function scheduleMeeting(date: string) {
    if (!date || meetingHasDate(data!.meetings, date)) return;
    const m: Meeting = {
      id: uid(),
      date,
      notes: "",
      actions: [],
    };
    update((d) => ({ ...d, meetings: [...d.meetings, m] }));
  }

  async function copyPacket() {
    try {
      await navigator.clipboard.writeText(packetText(packet));
      setPacketCopied(true);
      setTimeout(() => setPacketCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  async function doPush() {
    if (!data || !syncPass) {
      setSyncMsg("Enter the presidency passphrase first.");
      return;
    }
    setSyncBusy(true);
    setSyncMsg("");
    try {
      saveSyncConfig(syncToken, syncGist);
      const r = await pushToCloud(data, syncPass);
      setSyncGist(r.gistId);
      setSyncMsg(`Pushed ✓ (${new Date(r.updatedAt).toLocaleTimeString()})`);
    } catch (e) {
      setSyncMsg(e instanceof Error ? e.message : "Push failed.");
    } finally {
      setSyncBusy(false);
    }
  }

  async function doPull() {
    if (!syncPass) {
      setSyncMsg("Enter the presidency passphrase first.");
      return;
    }
    setSyncBusy(true);
    setSyncMsg("");
    try {
      saveSyncConfig(syncToken, syncGist);
      const r = await pullFromCloud(syncPass);
      const incoming = migrate(r.data);
      if (
        window.confirm(
          `Replace this device's data with the presidency copy from ${new Date(r.updatedAt).toLocaleString()}? (${incoming.teachers.length} teachers, ${incoming.classes.length} classes)`
        )
      ) {
        update(() => incoming);
        setSyncMsg("Pulled ✓ — this device now matches the presidency copy.");
      } else {
        setSyncMsg("Pull cancelled.");
      }
    } catch (e) {
      setSyncMsg(e instanceof Error ? e.message : "Pull failed.");
    } finally {
      setSyncBusy(false);
    }
  }

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

      {!packet.readiness.ok && (
        <section className="rounded-lg border border-primary/30 bg-primary-soft p-5">
          <h2 className="font-serif text-lg font-bold text-primary-dark">
            Ready for tomorrow&apos;s meeting
          </h2>
          <p className="mt-1 text-sm text-ink-2">
            A few minutes of setup and the agenda fills itself from the app.
          </p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink">
            {packet.readiness.missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            {!hasTomorrow && (
              <button
                type="button"
                onClick={() => scheduleMeeting(tomorrow)}
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Schedule tomorrow
              </button>
            )}
            {data.classes.length === 0 && (
              <Link
                href="/teachers"
                className="rounded-md border border-line-2 bg-white px-4 py-1.5 text-sm font-semibold text-ink hover:bg-surface"
              >
                Add classes &amp; teachers
              </Link>
            )}
            <button
              type="button"
              onClick={copyPacket}
              className="rounded-md border border-line-2 bg-white px-4 py-1.5 text-sm font-semibold text-ink hover:bg-surface"
            >
              {packetCopied ? "Copied ✓" : "Copy meeting packet"}
            </button>
          </div>
        </section>
      )}

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

      {/* Presidency meetings */}
      <section>
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl font-bold">Presidency meetings</h2>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={copyPacket}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {packetCopied ? "Copied ✓" : "Copy packet"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Print
            </button>
          </div>
        </div>
        <p className="mb-3 text-sm text-ink-2">
          Standing agenda filled from what the app already knows — notes and
          assignments that don&apos;t get lost between meetings.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!meetingDate) return;
            scheduleMeeting(meetingDate);
            setMeetingDate(tomorrowISO());
          }}
          className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface p-3 print:hidden"
        >
          <input
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            className="rounded-md border border-line bg-white px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Schedule meeting
          </button>
          {!hasTomorrow && (
            <button
              type="button"
              onClick={() => scheduleMeeting(tomorrow)}
              className="rounded-md border border-line-2 bg-white px-4 py-1.5 text-sm font-semibold text-ink hover:bg-surface"
            >
              Tomorrow
            </button>
          )}
          <span className="text-xs text-ink-3">
            A good rhythm is monthly, or biweekly through the September
            transition.
          </span>
        </form>

        <div className="space-y-4">
          {data.meetings.length === 0 && (
            <p className="text-sm text-ink-3">
              No meetings yet — tap Tomorrow to put one on the calendar.
            </p>
          )}
          {[...data.meetings]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((m) => {
              const patch = (p: Partial<Meeting>) =>
                update((d) => ({
                  ...d,
                  meetings: d.meetings.map((x) =>
                    x.id === m.id ? { ...x, ...p } : x
                  ),
                }));
              const upcoming = m.date >= todayISO();
              return (
                <div
                  key={m.id}
                  className={`rounded-lg border bg-white p-5 ${
                    upcoming ? "border-primary/40" : "border-line"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-serif text-lg font-bold">
                      {new Date(m.date + "T12:00:00").toLocaleDateString(
                        "en-US",
                        { weekday: "long", month: "long", day: "numeric" }
                      )}
                    </h3>
                    <button
                      onClick={() =>
                        update((d) => ({
                          ...d,
                          meetings: d.meetings.filter((x) => x.id !== m.id),
                        }))
                      }
                      className="text-xs text-ink-3 hover:text-danger print:hidden"
                    >
                      Delete
                    </button>
                  </div>
                  {upcoming && (
                    <div className="mt-4 space-y-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                        Live agenda · {packet.generated}
                      </p>
                      {packet.sections.map((s) => (
                        <div key={s.title}>
                          <p className="text-sm font-semibold text-ink">
                            {s.title}
                          </p>
                          {s.bullets.length === 0 ? (
                            <p className="mt-1 text-sm text-ink-3">{s.empty}</p>
                          ) : (
                            <ul className="mt-1.5 space-y-1">
                              {s.bullets.map((b) => (
                                <li
                                  key={b}
                                  className="flex gap-2 text-sm text-ink-2"
                                >
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <textarea
                    value={m.notes}
                    onChange={(e) => patch({ notes: e.target.value })}
                    placeholder="Notes…"
                    rows={2}
                    className="mt-3 w-full rounded-md border border-line px-3 py-2 text-sm placeholder:text-ink-3"
                  />
                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                      Assignments
                    </p>
                    {m.actions.map((a) => (
                      <label
                        key={a.id}
                        className="mt-1.5 flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={a.done}
                          onChange={() =>
                            patch({
                              actions: m.actions.map((x) =>
                                x.id === a.id ? { ...x, done: !x.done } : x
                              ),
                            })
                          }
                          className="accent-primary"
                        />
                        <span
                          className={a.done ? "text-ink-3 line-through" : ""}
                        >
                          {a.text}
                        </span>
                        <span className="ml-auto shrink-0 rounded bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-2">
                          {ownerName(a.assignedTo)}
                        </span>
                      </label>
                    ))}
                    <div className="mt-2 flex flex-wrap gap-2 print:hidden">
                      <input
                        value={newAction[m.id] ?? ""}
                        onChange={(e) =>
                          setNewAction((s) => ({
                            ...s,
                            [m.id]: e.target.value,
                          }))
                        }
                        placeholder="Add an assignment…"
                        className="min-w-0 flex-1 rounded-md border border-line px-3 py-1.5 text-sm placeholder:text-ink-3"
                      />
                      <select
                        value={newActionOwner[m.id] ?? "President"}
                        onChange={(e) =>
                          setNewActionOwner((s) => ({
                            ...s,
                            [m.id]: e.target.value as
                              | PresidencyRole
                              | "Everyone",
                          }))
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
                        onClick={() => {
                          const text = (newAction[m.id] ?? "").trim();
                          if (!text) return;
                          patch({
                            actions: [
                              ...m.actions,
                              {
                                id: uid(),
                                text,
                                assignedTo: newActionOwner[m.id] ?? "President",
                                done: false,
                              },
                            ],
                          });
                          setNewAction((s) => ({ ...s, [m.id]: "" }));
                        }}
                        className="rounded-md border border-line-2 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary-soft"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Sunday checklist */}
      <section className="print:hidden">
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
      <section className="print:hidden">
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

      {/* Class visits */}
      <section className="print:hidden">
        <h2 className="mb-1 font-serif text-xl font-bold">Class visits</h2>
        <p className="mb-3 text-sm text-ink-2">
          The checklist says &quot;visit one class, rotate&quot; — this
          remembers the rotation. What you note here becomes teacher-council
          material.
        </p>
        {data.classes.length === 0 ? (
          <p className="text-sm text-ink-3">Add classes first.</p>
        ) : (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!visitClass) return;
                const v: Visit = {
                  id: uid(),
                  classId: visitClass,
                  date: todayISO(),
                  by: visitBy,
                  note: visitNote.trim() || undefined,
                };
                update((d) => ({ ...d, visits: [...d.visits, v] }));
                setVisitNote("");
                setVisitClass("");
              }}
              className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface p-3"
            >
              <select
                value={visitClass}
                onChange={(e) => setVisitClass(e.target.value)}
                className="rounded-md border border-line bg-white px-2 py-1.5 text-sm"
              >
                <option value="">Visited class…</option>
                {data.classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={visitBy}
                onChange={(e) => setVisitBy(e.target.value as PresidencyRole)}
                className="rounded-md border border-line bg-white px-2 py-1.5 text-sm"
              >
                {PRESIDENCY_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input
                value={visitNote}
                onChange={(e) => setVisitNote(e.target.value)}
                placeholder="What went well?"
                className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-1.5 text-sm placeholder:text-ink-3"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Log visit
              </button>
            </form>
            <div className="divide-y divide-line rounded-lg border border-line bg-white">
              {[...data.classes]
                .map((cls) => {
                  const classVisits = data.visits
                    .filter((v) => v.classId === cls.id)
                    .sort((a, b) => b.date.localeCompare(a.date));
                  return { cls, last: classVisits[0], count: classVisits.length };
                })
                .sort((a, b) =>
                  (a.last?.date ?? "0000").localeCompare(b.last?.date ?? "0000")
                )
                .map(({ cls, last, count }, i) => (
                  <div
                    key={cls.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm"
                  >
                    <span className="min-w-32 font-semibold">{cls.name}</span>
                    {i === 0 && (
                      <span className="rounded bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                        visit next
                      </span>
                    )}
                    <span className="text-ink-2">
                      {last
                        ? `Last visited ${new Date(last.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} by ${ownerName(last.by)}`
                        : "Never visited"}
                      {count > 0 && ` · ${count} visit${count === 1 ? "" : "s"}`}
                    </span>
                    {last?.note && (
                      <span className="w-full text-xs italic text-ink-3 sm:w-auto">
                        &ldquo;{last.note}&rdquo;
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </>
        )}
      </section>

      {/* Security */}
      <section className="print:hidden">
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

      {/* Presidency sync */}
      <section className="print:hidden">
        <h2 className="mb-1 font-serif text-xl font-bold">
          Presidency sync <span className="text-sm font-normal text-ink-3">(beta)</span>
        </h2>
        <p className="mb-3 text-sm text-ink-2">
          Push this device&apos;s data to a private, encrypted cloud copy;
          counselors pull it to theirs. Data leaves the device only as
          ciphertext — the passphrase never does.
        </p>
        <div className="space-y-2 rounded-lg border border-line bg-white p-4">
          <div className="flex flex-wrap gap-2">
            <input
              type="password"
              value={syncToken}
              onChange={(e) => setSyncToken(e.target.value)}
              placeholder="GitHub token (gist scope)"
              className="min-w-0 flex-1 rounded-md border border-line px-3 py-1.5 text-sm placeholder:text-ink-3"
            />
            <input
              value={syncGist}
              onChange={(e) => setSyncGist(e.target.value)}
              placeholder="Gist ID (filled after first push)"
              className="w-64 rounded-md border border-line px-3 py-1.5 text-sm placeholder:text-ink-3"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="password"
              value={syncPass}
              onChange={(e) => setSyncPass(e.target.value)}
              placeholder="Presidency passphrase"
              className="min-w-0 flex-1 rounded-md border border-line px-3 py-1.5 text-sm placeholder:text-ink-3"
            />
            <button
              onClick={doPush}
              disabled={syncBusy}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {syncBusy ? "Working…" : "Push"}
            </button>
            <button
              onClick={doPull}
              disabled={syncBusy}
              className="rounded-md border border-line-2 px-4 py-1.5 text-sm font-semibold text-ink hover:bg-surface disabled:opacity-50"
            >
              Pull
            </button>
            {syncMsg && <span className="text-sm text-ink-2">{syncMsg}</span>}
          </div>
          <p className="text-xs text-ink-3">
            Setup once: the president creates a fine-grained GitHub token
            (Settings → Developer settings → Tokens, <em>gists only</em>),
            pushes, then shares the token, gist ID, and passphrase with
            counselors in person or by AirDrop. Last push wins — push after
            you make changes, pull before you rely on them. The token stays
            on this device and is never included in Export files.
          </p>
        </div>
      </section>

      {/* Roles & responsibilities */}
      <section className="print:hidden">
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
