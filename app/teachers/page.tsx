"use client";

import { useRef, useState } from "react";
import {
  Candidate,
  PIPELINE_STAGES,
  migrate,
  todayISO,
  uid,
  useAppData,
} from "@/lib/store";

const inputCls =
  "rounded-md border border-line px-3 py-1.5 text-sm placeholder:text-ink-3";

export default function TeachersPage() {
  const { data, update } = useAppData();
  const [className, setClassName] = useState("");
  const [classRoom, setClassRoom] = useState("");
  const [tName, setTName] = useState("");
  const [tPhone, setTPhone] = useState("");
  const [tSub, setTSub] = useState(false);
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cClass, setCClass] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
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

  async function shareData() {
    const file = new File(
      [JSON.stringify(data, null, 2)],
      "sunday-school-data.json",
      { type: "application/json" }
    );
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Sunday School data" });
        return;
      }
    } catch {
      // fall through to download
    }
    exportData();
  }

  // Handles plain "Name, phone" lines AND LCR-style exports: tab-separated
  // columns with "Last, First" names, emails, and phones in any order.
  function parsePastedLine(line: string) {
    const cells = (
      line.includes("\t") ? line.split("\t") : line.split(",")
    )
      .map((s) => s.trim())
      .filter(Boolean);
    if (cells.length === 0) return null;

    let phone: string | undefined;
    let email: string | undefined;
    const nameParts: string[] = [];
    for (const cell of cells) {
      if (!email && cell.includes("@")) email = cell;
      else if (!phone && (cell.match(/\d/g)?.length ?? 0) >= 7) phone = cell;
      else nameParts.push(cell);
    }
    if (nameParts.length === 0) return null;

    let name = nameParts.join(", ");
    // Comma-only line like "Munns, Jaxon" arrives as two name cells — or a
    // single tab cell "Munns, Jaxon" — either way, flip Last, First.
    const flip = name.match(/^([A-Za-zÀ-ÿ'’-]+),\s*(.+)$/);
    if (flip && !line.includes("\t") && nameParts.length === 2)
      name = `${nameParts[1]} ${nameParts[0]}`;
    else if (flip && line.includes("\t")) name = `${flip[2]} ${flip[1]}`;

    return { name, phone, email };
  }

  function importPasted() {
    const rows = pasteText
      .split("\n")
      .map(parsePastedLine)
      .filter((r): r is NonNullable<typeof r> => r !== null);
    if (rows.length === 0) return;
    update((d) => ({
      ...d,
      teachers: [
        ...d.teachers,
        ...rows.map((r) => ({
          id: uid(),
          name: r.name,
          phone: r.phone,
          email: r.email,
        })),
      ],
    }));
    setPasteText("");
    setShowPaste(false);
  }

  function addCandidate(e: React.FormEvent) {
    e.preventDefault();
    const name = cName.trim();
    if (!name) return;
    const cand: Candidate = {
      id: uid(),
      name,
      phone: cPhone.trim() || undefined,
      classId: cClass || undefined,
      stage: 0,
      stageDates: [null, null, null, null, null],
    };
    update((d) => ({ ...d, candidates: [...d.candidates, cand] }));
    setCName("");
    setCPhone("");
    setCClass("");
  }

  function advanceCandidate(id: string) {
    update((d) => ({
      ...d,
      candidates: d.candidates.map((c) => {
        if (c.id !== id || c.stage >= 5) return c;
        const stageDates = [...c.stageDates];
        stageDates[c.stage] = todayISO();
        return { ...c, stage: c.stage + 1, stageDates };
      }),
    }));
  }

  function removeCandidate(id: string) {
    update((d) => ({
      ...d,
      candidates: d.candidates.filter((c) => c.id !== id),
    }));
  }

  function graduateCandidate(cand: Candidate) {
    const newId = uid();
    update((d) => ({
      ...d,
      candidates: d.candidates.filter((c) => c.id !== cand.id),
      teachers: [
        ...d.teachers,
        { id: newId, name: cand.name, phone: cand.phone },
      ],
      classes: cand.classId
        ? d.classes.map((c) =>
            c.id === cand.classId
              ? { ...c, teacherIds: [...c.teacherIds, newId] }
              : c
          )
        : d.classes,
    }));
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
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            onClick={shareData}
            className="rounded-md bg-primary px-4 py-1.5 font-semibold text-white hover:bg-primary-dark"
          >
            Share with presidency
          </button>
          <button
            onClick={exportData}
            className="rounded-md border border-line-2 bg-white px-4 py-1.5 font-semibold text-ink hover:bg-surface"
          >
            Export
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-md border border-line-2 bg-white px-4 py-1.5 font-semibold text-ink hover:bg-surface"
          >
            Import
          </button>
          <button
            onClick={() => setShowPaste((v) => !v)}
            className="rounded-md border border-line-2 bg-white px-4 py-1.5 font-semibold text-ink hover:bg-surface"
          >
            Paste list…
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

      {showPaste && (
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-sm font-semibold">Paste a list of teachers</p>
          <p className="mt-0.5 text-xs text-ink-2">
            One per line, from LCR or a spreadsheet: <code>Name, phone</code>{" "}
            (phone optional; commas or tabs both work).
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={5}
            placeholder={"Sister Hale, 555-0102\nBrother Larsen\t555-0101"}
            className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2 font-mono text-sm placeholder:text-ink-3"
          />
          <button
            onClick={importPasted}
            className="mt-2 rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Add{" "}
            {pasteText.split("\n").filter((l) => l.trim()).length || ""}{" "}
            teachers
          </button>
        </div>
      )}

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

      {/* New teacher pipeline */}
      <section>
        <h2 className="mb-1 font-serif text-xl font-bold">
          New teacher pipeline
        </h2>
        <p className="mb-3 text-sm text-ink-2">
          From recommendation to the classroom, so no one falls in the crack
          between &quot;bishopric approved&quot; and &quot;nobody told them
          where the manuals are.&quot;
        </p>
        <form
          onSubmit={addCandidate}
          className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface p-3"
        >
          <input
            value={cName}
            onChange={(e) => setCName(e.target.value)}
            placeholder="Name to recommend"
            className={`min-w-0 flex-1 bg-white ${inputCls}`}
          />
          <input
            value={cPhone}
            onChange={(e) => setCPhone(e.target.value)}
            placeholder="Phone"
            className={`w-32 bg-white ${inputCls}`}
          />
          <select
            value={cClass}
            onChange={(e) => setCClass(e.target.value)}
            className="rounded-md border border-line bg-white px-2 py-1.5 text-sm text-ink-2"
          >
            <option value="">Class in mind…</option>
            {data.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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

        {data.candidates.length === 0 ? (
          <p className="text-sm text-ink-3">
            No one in process. When you recommend someone to the bishopric,
            add them here.
          </p>
        ) : (
          <div className="divide-y divide-line rounded-lg border border-line bg-white">
            {data.candidates.map((cand) => {
              const targetClass = data.classes.find(
                (c) => c.id === cand.classId
              );
              return (
                <div
                  key={cand.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3"
                >
                  <div className="min-w-40">
                    <p className="font-semibold">{cand.name}</p>
                    <p className="text-xs text-ink-3">
                      {[cand.phone, targetClass?.name]
                        .filter(Boolean)
                        .join(" · ") || "No class assigned yet"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {PIPELINE_STAGES.map((s, i) => (
                      <span
                        key={s}
                        title={cand.stageDates[i] ?? undefined}
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          i < cand.stage
                            ? "bg-primary text-white"
                            : "bg-surface-2 text-ink-3"
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <span className="ml-auto flex items-center gap-2">
                    {cand.stage < 5 ? (
                      <button
                        onClick={() => advanceCandidate(cand.id)}
                        className="rounded-md border border-line-2 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary-soft"
                      >
                        Mark {PIPELINE_STAGES[cand.stage].toLowerCase()}
                      </button>
                    ) : (
                      <button
                        onClick={() => graduateCandidate(cand)}
                        className="rounded-md bg-confirm px-3 py-1 text-xs font-semibold text-white hover:opacity-90"
                      >
                        Add as teacher{targetClass ? ` → ${targetClass.name}` : ""}
                      </button>
                    )}
                    <button
                      onClick={() => removeCandidate(cand.id)}
                      className="text-xs text-ink-3 hover:text-danger"
                    >
                      Remove
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-xs text-ink-3">
        Data lives on this device and belongs to the ward — use Share to send
        it to a counselor (AirDrop or Messages), Export to back up, and Import
        to load a file you&apos;ve been sent.
      </p>
    </div>
  );
}
