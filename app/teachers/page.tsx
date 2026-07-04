"use client";

import { useState } from "react";
import { uid, useAppData } from "@/lib/store";

const inputCls =
  "rounded-lg border border-pp-border bg-pp-card-2 px-3 py-1.5 text-sm text-pp-text placeholder:text-pp-muted/60";

export default function TeachersPage() {
  const { data, update } = useAppData();
  const [className, setClassName] = useState("");
  const [classRoom, setClassRoom] = useState("");
  const [tName, setTName] = useState("");
  const [tPhone, setTPhone] = useState("");
  const [tSub, setTSub] = useState(false);
  if (!data) return null;

  function addClass(e: React.FormEvent) {
    e.preventDefault();
    const name = className.trim();
    if (!name) return;
    update((d) => ({
      ...d,
      classes: [
        ...d.classes,
        { id: uid(), name, room: classRoom.trim() || undefined, teacherIds: [] },
      ],
    }));
    setClassName("");
    setClassRoom("");
  }

  function removeClass(id: string) {
    update((d) => ({
      ...d,
      classes: d.classes.filter((c) => c.id !== id),
      overrides: d.overrides.filter((o) => o.classId !== id),
    }));
  }

  function addTeacher(e: React.FormEvent) {
    e.preventDefault();
    const name = tName.trim();
    if (!name) return;
    update((d) => ({
      ...d,
      teachers: [
        ...d.teachers,
        {
          id: uid(),
          name,
          phone: tPhone.trim() || undefined,
          substitute: tSub,
        },
      ],
    }));
    setTName("");
    setTPhone("");
    setTSub(false);
  }

  function removeTeacher(id: string) {
    update((d) => ({
      ...d,
      teachers: d.teachers.filter((t) => t.id !== id),
      classes: d.classes.map((c) => ({
        ...c,
        teacherIds: c.teacherIds.filter((tid) => tid !== id),
      })),
      overrides: d.overrides.filter((o) => o.teacherId !== id),
    }));
  }

  function assignTeacher(classId: string, teacherId: string) {
    if (!teacherId) return;
    update((d) => ({
      ...d,
      classes: d.classes.map((c) =>
        c.id === classId && !c.teacherIds.includes(teacherId)
          ? { ...c, teacherIds: [...c.teacherIds, teacherId] }
          : c
      ),
    }));
  }

  function unassignTeacher(classId: string, teacherId: string) {
    update((d) => ({
      ...d,
      classes: d.classes.map((c) =>
        c.id === classId
          ? { ...c, teacherIds: c.teacherIds.filter((t) => t !== teacherId) }
          : c
      ),
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-pp-text">
          Teachers &amp; Classes
        </h1>
        <p className="mt-2 text-sm text-pp-muted">
          Set up your classes, add teachers, and assign who teaches what.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Classes */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-pp-text">Classes</h2>
          <form
            onSubmit={addClass}
            className="flex flex-wrap gap-2 rounded-2xl border border-pp-border bg-pp-card p-3"
          >
            <input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Class name (e.g. Youth 14–15)"
              className={`min-w-0 flex-1 ${inputCls}`}
            />
            <input
              value={classRoom}
              onChange={(e) => setClassRoom(e.target.value)}
              placeholder="Room"
              className={`w-24 ${inputCls}`}
            />
            <button
              type="submit"
              className="rounded-full bg-pp-gold px-5 py-1.5 text-sm font-semibold text-pp-ink transition-colors hover:bg-pp-gold-light"
            >
              Add
            </button>
          </form>

          {data.classes.length === 0 && (
            <p className="text-sm text-pp-muted">No classes yet.</p>
          )}
          {data.classes.map((cls) => (
            <div
              key={cls.id}
              className="rounded-2xl border border-pp-border bg-pp-card p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-pp-text">
                  {cls.name}
                  {cls.room && (
                    <span className="ml-2 text-xs font-normal text-pp-muted">
                      Room {cls.room}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => removeClass(cls.id)}
                  className="text-xs text-pp-muted hover:text-rose-400"
                >
                  Delete
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {cls.teacherIds.map((tid) => {
                  const t = data.teachers.find((x) => x.id === tid);
                  if (!t) return null;
                  return (
                    <span
                      key={tid}
                      className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-pp-text"
                    >
                      {t.name}
                      <button
                        onClick={() => unassignTeacher(cls.id, tid)}
                        className="text-pp-muted hover:text-rose-400"
                        aria-label={`Remove ${t.name} from ${cls.name}`}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
                {cls.teacherIds.length === 0 && (
                  <span className="text-xs font-semibold text-amber-300">
                    No teacher assigned
                  </span>
                )}
                <select
                  value=""
                  onChange={(e) => assignTeacher(cls.id, e.target.value)}
                  className="rounded-lg border border-pp-border bg-pp-card-2 px-2 py-1 text-xs text-pp-muted"
                >
                  <option value="">+ Assign teacher…</option>
                  {data.teachers
                    .filter((t) => !cls.teacherIds.includes(t.id))
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                        {t.substitute ? " (sub)" : ""}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ))}
        </section>

        {/* Teachers */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-pp-text">Teachers</h2>
          <form
            onSubmit={addTeacher}
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-pp-border bg-pp-card p-3"
          >
            <input
              value={tName}
              onChange={(e) => setTName(e.target.value)}
              placeholder="Name"
              className={`min-w-0 flex-1 ${inputCls}`}
            />
            <input
              value={tPhone}
              onChange={(e) => setTPhone(e.target.value)}
              placeholder="Phone"
              className={`w-32 ${inputCls}`}
            />
            <label className="flex items-center gap-1.5 text-xs text-pp-muted">
              <input
                type="checkbox"
                checked={tSub}
                onChange={(e) => setTSub(e.target.checked)}
                className="accent-pp-gold"
              />
              Substitute
            </label>
            <button
              type="submit"
              className="rounded-full bg-pp-gold px-5 py-1.5 text-sm font-semibold text-pp-ink transition-colors hover:bg-pp-gold-light"
            >
              Add
            </button>
          </form>

          {data.teachers.length === 0 && (
            <p className="text-sm text-pp-muted">No teachers yet.</p>
          )}
          {data.teachers.length > 0 && (
            <ul className="divide-y divide-white/5 rounded-2xl border border-pp-border bg-pp-card">
              {data.teachers.map((t) => {
                const classes = data.classes
                  .filter((c) => c.teacherIds.includes(t.id))
                  .map((c) => c.name);
                return (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-pp-text">
                        {t.name}
                        {t.substitute && (
                          <span className="ml-2 rounded-full bg-pp-gold/20 px-2 py-0.5 text-xs font-semibold text-pp-gold-light">
                            substitute
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-pp-muted">
                        {[t.phone, classes.join(", ") || "Unassigned"]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <button
                      onClick={() => removeTeacher(t.id)}
                      className="text-xs text-pp-muted hover:text-rose-400"
                    >
                      Delete
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
