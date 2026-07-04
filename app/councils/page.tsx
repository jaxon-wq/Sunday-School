"use client";

import { useState } from "react";
import { buildBrief, briefText } from "@/lib/brief";
import { formatSunday, parseISODate } from "@/lib/lessons";
import { Council, todayISO, todayStart, uid, useAppData } from "@/lib/store";

// Discussion topics adapted from "Teaching in the Savior's Way" principles,
// plus timely topics for the September 2026 second-hour change.
const AGENDA_TOPICS: { title: string; prompts: string[] }[] = [
  {
    title: "Focus on Jesus Christ",
    prompts: [
      "How can any lesson — even a hard Old Testament chapter — point to the Savior?",
      "Share a moment when a class discussion turned to Christ. What made it happen?",
    ],
  },
  {
    title: "Love those you teach",
    prompts: [
      "What do we know about the people in our classes beyond their faces?",
      "How could we learn one new thing about a quiet class member this month?",
    ],
  },
  {
    title: "Teach by the Spirit",
    prompts: [
      "What helps you feel guided while preparing? While teaching?",
      "How do we leave room for the Spirit in a tightly planned lesson?",
    ],
  },
  {
    title: "Teach the doctrine",
    prompts: [
      "How do we keep discussions anchored to the scriptures themselves?",
      "What do we do when a discussion drifts into speculation?",
    ],
  },
  {
    title: "Invite diligent learning",
    prompts: [
      "What invitation could class members act on before next week?",
      "How do we follow up without turning invitations into assignments?",
    ],
  },
  {
    title: "Teaching in 25 minutes",
    prompts: [
      "One scripture, one question, one testimony — what would you cut from your last lesson?",
      "How does a 25-minute class change what 'covering the material' means?",
      "What can move from the classroom to the home under the new schedule?",
    ],
  },
  {
    title: "Reaching those not in the room",
    prompts: [
      "Who hasn't been in class lately, and who is closest to them?",
      "How can a lesson bless someone who wasn't there to hear it?",
    ],
  },
  {
    title: "Questions that invite revelation",
    prompts: [
      "What's the difference between a quiz question and a pondering question?",
      "Share the best question you've ever been asked in a class.",
    ],
  },
  {
    title: "Supporting learning at home",
    prompts: [
      "How can Sunday's class strengthen a family's Come, Follow Me study — not replace it?",
      "What could we ask about members' home study without prying?",
    ],
  },
];

export default function CouncilsPage() {
  const { data, update } = useAppData();
  const [date, setDate] = useState("");
  const [topic, setTopic] = useState(AGENDA_TOPICS[0].title);
  const [copied, setCopied] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState<Record<string, string>>({});
  if (!data) return null;

  const brief = buildBrief(data);
  const councils = [...data.councils].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const upcoming = councils.filter(
    (c) => parseISODate(c.date) >= todayStart()
  );
  const pastCouncils = councils.filter(
    (c) => parseISODate(c.date) < todayStart()
  );

  function addCouncil(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    const c: Council = { id: uid(), date, topic, notes: "", followUps: [] };
    update((d) => ({ ...d, councils: [...d.councils, c] }));
    setDate("");
  }

  function patchCouncil(id: string, patch: Partial<Council>) {
    update((d) => ({
      ...d,
      councils: d.councils.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }

  function removeCouncil(id: string) {
    update((d) => ({ ...d, councils: d.councils.filter((c) => c.id !== id) }));
  }

  function addFollowUp(c: Council) {
    const text = (newFollowUp[c.id] ?? "").trim();
    if (!text) return;
    patchCouncil(c.id, {
      followUps: [...c.followUps, { id: uid(), text, done: false }],
    });
    setNewFollowUp((m) => ({ ...m, [c.id]: "" }));
  }

  async function copyBrief() {
    await navigator.clipboard.writeText(briefText(brief));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function CouncilCard({ c }: { c: Council }) {
    const topicInfo = AGENDA_TOPICS.find((t) => t.title === c.topic);
    return (
      <div className="rounded-lg border border-line bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-serif text-lg font-bold">
            {formatSunday(c.date)} — {c.topic}
          </h3>
          <button
            onClick={() => removeCouncil(c.id)}
            className="text-xs text-ink-3 hover:text-danger"
          >
            Delete
          </button>
        </div>
        {topicInfo && (
          <ul className="mt-3 space-y-1.5">
            {topicInfo.prompts.map((p) => (
              <li key={p} className="flex gap-2 text-sm text-ink-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                {p}
              </li>
            ))}
          </ul>
        )}
        <textarea
          value={c.notes}
          onChange={(e) => patchCouncil(c.id, { notes: e.target.value })}
          placeholder="Notes from the discussion…"
          rows={2}
          className="mt-3 w-full rounded-md border border-line px-3 py-2 text-sm placeholder:text-ink-3"
        />
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
            Follow-ups
          </p>
          {c.followUps.map((f) => (
            <label
              key={f.id}
              className="mt-1.5 flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={f.done}
                onChange={() =>
                  patchCouncil(c.id, {
                    followUps: c.followUps.map((x) =>
                      x.id === f.id ? { ...x, done: !x.done } : x
                    ),
                  })
                }
                className="accent-primary"
              />
              <span className={f.done ? "text-ink-3 line-through" : ""}>
                {f.text}
              </span>
            </label>
          ))}
          <div className="mt-2 flex gap-2">
            <input
              value={newFollowUp[c.id] ?? ""}
              onChange={(e) =>
                setNewFollowUp((m) => ({ ...m, [c.id]: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && addFollowUp(c)}
              placeholder="Add a follow-up…"
              className="min-w-0 flex-1 rounded-md border border-line px-3 py-1.5 text-sm placeholder:text-ink-3"
            />
            <button
              onClick={() => addFollowUp(c)}
              className="rounded-md border border-line-2 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary-soft"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">
          Councils
        </h1>
        <p className="mt-1 text-sm text-ink-2">
          Walk into ward council prepared, and help teachers counsel together.
        </p>
      </div>

      {/* Ward council brief */}
      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl font-bold">Ward council brief</h2>
          <button
            onClick={copyBrief}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            {copied ? "Copied ✓" : "Copy as text"}
          </button>
        </div>
        <div className="divide-y divide-line rounded-lg border border-line bg-white">
          <BriefRow label="Staffing">
            {brief.staffing.total} classes ·{" "}
            {brief.staffing.unstaffed.length ? (
              <span className="font-semibold text-warn">
                {brief.staffing.unstaffed.length} without a teacher (
                {brief.staffing.unstaffed.join(", ")})
              </span>
            ) : (
              <span className="font-semibold text-confirm">all staffed</span>
            )}
          </BriefRow>
          <BriefRow label="Substitutes · last 5 teaching Sundays">
            {brief.subsUsed.length
              ? brief.subsUsed
                  .map(
                    (s) =>
                      `${s.subName} covered ${s.className} (${formatSunday(s.sunday).replace("Sunday, ", "")})`
                  )
                  .join(" · ")
              : "None needed"}
          </BriefRow>
          <BriefRow label="Teacher care">
            {brief.care.length
              ? brief.care
                  .map((c) => `${c.name} — ${c.count} Sundays in a row`)
                  .join(" · ")
              : "No one currently carrying too much"}
          </BriefRow>
          <BriefRow label="Attendance · avg of last 4 recorded">
            {brief.attendance.some((a) => a.recentAvg !== null)
              ? brief.attendance
                  .filter((a) => a.recentAvg !== null)
                  .map(
                    (a) =>
                      `${a.className}: ${a.recentAvg}` +
                      (a.priorAvg !== null ? ` (was ${a.priorAvg})` : "")
                  )
                  .join(" · ")
              : "No headcounts recorded yet — add them on the Schedule page after class"}
          </BriefRow>
          <BriefRow label="New teachers in process">
            {brief.pipeline.length
              ? brief.pipeline.map((p) => `${p.name} — ${p.next}`).join(" · ")
              : "None right now"}
          </BriefRow>
          <BriefRow label="Teacher councils">
            {brief.nextCouncil
              ? `Next: ${formatSunday(brief.nextCouncil.date)} — ${brief.nextCouncil.topic}`
              : "None scheduled"}
            {brief.openFollowUps.length > 0 &&
              ` · ${brief.openFollowUps.length} open follow-up${brief.openFollowUps.length === 1 ? "" : "s"}`}
          </BriefRow>
        </div>
      </section>

      {/* Teacher councils */}
      <section>
        <h2 className="mb-1 font-serif text-xl font-bold">Teacher councils</h2>
        <p className="mb-3 text-sm text-ink-2">
          Teachers counseling together in the Savior&apos;s way — the
          Handbook&apos;s engine for better teaching. Pick a topic and the
          agenda writes itself.
        </p>
        <form
          onSubmit={addCouncil}
          className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface p-3"
        >
          <input
            type="date"
            value={date}
            min={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-line bg-white px-3 py-1.5 text-sm"
          />
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-line bg-white px-2 py-1.5 text-sm"
          >
            {AGENDA_TOPICS.map((t) => (
              <option key={t.title} value={t.title}>
                {t.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Schedule
          </button>
        </form>

        <div className="space-y-4">
          {upcoming.length === 0 && pastCouncils.length === 0 && (
            <p className="text-sm text-ink-3">
              No teacher councils yet. A good rhythm is one per quarter.
            </p>
          )}
          {upcoming.map((c) => (
            <CouncilCard key={c.id} c={c} />
          ))}
          {pastCouncils.length > 0 && (
            <>
              <h3 className="pt-2 text-xs font-bold uppercase tracking-wider text-ink-3">
                Past councils
              </h3>
              {pastCouncils.map((c) => (
                <CouncilCard key={c.id} c={c} />
              ))}
            </>
          )}
        </div>
        <p className="mt-3 text-xs text-ink-3">
          Topics adapted from{" "}
          <a
            href="https://www.churchofjesuschrist.org/study/manual/teaching-in-the-saviors-way-2022?lang=eng"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Teaching in the Savior&apos;s Way
          </a>
          .
        </p>
      </section>
    </div>
  );
}

function BriefRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-3">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-ink">{children}</p>
    </div>
  );
}
