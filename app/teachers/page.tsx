"use client";

import { useRef, useState } from "react";
import { migrate, uid, useAppData } from "@/lib/store";

const inputCls =
  "rounded-md border border-line px-3 py-1.5 text-sm placeholder:text-ink-3";

export default function TeachersPage() {
  const { data, update } = useAppData();
  const [className, setClassName] = useState("");
  const [classRoom, setClassRoom] = useState("");
  const [tName, setTName] = useState("");
  const [tPhone, setTPhone] = useState("");
  const [tSub, setTSub] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
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
        { id: uid(), name, phone: tPhone.trim() || undefined, substitute: tSub },
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

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sunday-school-data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importData(file: File) {
    file.text().then((text) => {
      try {
        const incoming = migrate(JSON.parse(text));
        if (
          window.confirm(
            `Import ${incoming.teachers.length} teachers and ${incoming.classes.length} classes? This replaces the data on this device.`
          )
        ) {
          update(() => incoming);
        }
      } catch {
        window.alert("That file doesn't look like a Sunday School export.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Teachers &amp; Classes
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            Set up your classes, add teachers, and assign who teaches what.
            Populate from LCR when you get access.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <button
            onClick={exportData}
            className="rounded-md border border-line-2 bg-white px-4 py-1.5 font-semibold text-ink hover:bg-surface"
          >
            Export data
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-md border border-line-2 bg-white px-4 py-1.5 font-semibold text-ink hover:bg-surface"
          >
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importData(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Classes */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-bold">Classes</h2>
          <form
            onSubmit={addClass}
            className="flex flex-wrap gap-2 rounded-lg border border-line bg-surface p-3"
          >
            <input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Class name (e.g. Youth 14–15)"
              className={`min-w-0 flex-1 bg-white ${inputCls}`}
            />
            <input
              value={classRoom}
              onChange={(e) => setClassRoom(e.target.value)}
              placeholder="Room"
              className={`w-24 bg-white ${inputCls}`}
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Add
            </button>
          </form>

          {data.classes.length === 0 && (
            <p className="text-sm text-ink-3">No classes yet.</p>
          )}
          {data.classes.map((cls) => (
            <div
              key={cls.id}
              className="rounded-lg border border-line bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {cls.name}
                  {cls.room && (
                    <span className="ml-2 text-xs font-normal text-ink-3">
                      Room {cls.room}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => removeClass(cls.id)}
                  className="text-xs text-ink-3 hover:text-danger"
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
                      className="flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink"
                    >
                      {t.name}
                      <button
                        onClick={() => unassignTeacher(cls.id, tid)}
                        className="text-ink-3 hover:text-danger"
                        aria-label={`Remove ${t.name} from ${cls.name}`}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
                {cls.teacherIds.length === 0 && (
                  <span className="text-xs font-semibold text-warn">
                    No teacher assigned
                  </span>
                )}
                <select
                  value=""
                  onChange={(e) => assignTeacher(cls.id, e.target.value)}
                  className="rounded-md border border-line bg-white px-2 py-1 text-xs text-ink-2"
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
          <h2 className="font-serif text-xl font-bold">Teachers</h2>
          <form
            onSubmit={addTeacher}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface p-3"
          >
            <input
              value={tName}
              onChange={(e) => setTName(e.target.value)}
              placeholder="Name"
              className={`min-w-0 flex-1 bg-white ${inputCls}`}
            />
            <input
              value={tPhone}
              onChange={(e) => setTPhone(e.target.value)}
              placeholder="Phone"
              className={`w-32 bg-white ${inputCls}`}
            />
            <label className="flex items-center gap-1.5 text-xs text-ink-2">
              <input
                type="checkbox"
                checked={tSub}
                onChange={(e) => setTSub(e.target.checked)}
                className="accent-primary"
              />
              Substitute
            </label>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Add
            </button>
          </form>

          {data.teachers.length === 0 && (
            <p className="text-sm text-ink-3">No teachers yet.</p>
          )}
          {data.teachers.length > 0 && (
            <ul className="divide-y divide-line rounded-lg border border-line bg-white">
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
                      <p className="font-semibold">
                        {t.name}
                        {t.substitute && (
                          <span className="ml-2 rounded bg-primary-soft px-1.5 py-0.5 text-xs font-semibold text-primary">
                            substitute
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-ink-2">
                        {[t.phone, classes.join(", ") || "Unassigned"]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <button
                      onClick={() => removeTeacher(t.id)}
                      className="text-xs text-ink-3 hover:text-danger"
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

      <p className="text-xs text-ink-3">
        Data lives on this device and belongs to the ward — use Export to back
        up or hand off, and Import on a counselor&apos;s device to share the
        current setup.
      </p>
    </div>
  );
}
