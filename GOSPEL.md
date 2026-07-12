# The Gospel of This Project

*This document is the constitution of the Sunday School app. Every feature, design
decision, and line of code is measured against it. When a proposed change conflicts
with these principles, the principles win — or this document is deliberately amended
first. Written by Jax (ward Sunday School president) and Claude, July 2026.*

## What this tool is for

The purpose of Sunday School is not to run classes. Per General Handbook chapter 13,
it is to **help members improve their learning and teaching of the gospel — at home
and at church.** This tool exists to serve that purpose through the people responsible
for it: the Sunday School presidency.

It is built for three recurring moments:

1. **The hallway moment** — Sunday, 8:55am, phone in one hand: who's teaching,
   which room, is anyone missing?
2. **The Saturday night moment** — a teacher texts "I can't make it tomorrow."
   The scramble that follows should take ninety seconds, not ninety minutes.
3. **The quiet moment** — Tuesday night: who needs encouragement, what does the
   bishop need to hear, what happens at the next teacher council?

## Who it serves

- **The users are the presidency**: president, two counselors, secretary. Four people.
- **The beneficiaries are the teachers** — and through them, every member and family
  in the ward. Teachers never need to install anything: the tool reaches them where
  they already are (a text message), never the other way around.

## The principles

1. **The teacher is who we serve.** Every feature must reduce a teacher's burden or
   build their confidence, or it doesn't ship.

2. **Home-centered, church-supported.** The tool points people *into* Come, Follow Me.
   It never competes with the curriculum or pretends church is the main event.
   Twenty-five minutes on Sunday is a spark; the fire is at home.

3. **Sunday is for people, not admin.** Everything must work in 30 seconds,
   one-handed, in a hallway. If a feature needs a desk, it failed.

4. **Works in a chapel basement.** Offline-first, fast, zero dependence on chapel
   Wi-Fi. Artwork ships with the app. External services are conveniences, never
   dependencies.

5. **Reverence for sacred things.** No gamification, no streaks, no badges on the
   things of God. Scripture, art, and people are treated with dignity. Beauty is a
   feature — the Rembrandts stay.

6. **Names, not numbers.** Any count exists so a *person* gets noticed and ministered
   to. The moment a number becomes a scoreboard, we have sinned against the point.
   (Attendance is deliberately unscoped until we can honor this principle fully.)

7. **Handbook-true.** Features map to real responsibilities in General Handbook
   chapter 13. We do not invent bureaucracy the Lord didn't ask for. Counselors and
   the secretary should find their *actual* responsibilities reflected here, clearly.

8. **The calendar is the spine.** All 52 Sundays. Everything — lessons, teachers,
   substitutes, checklists, councils — hangs off a Sunday. (Including the
   September 6, 2026 second-hour transition, which the app handles automatically.)

9. **The data belongs to the ward.** Private by default, exportable always, no
   lock-in. Real names and contact info live in the presidency's hands, not in
   third-party analytics. When the president is released, handoff takes five minutes.

10. **It should feel like the Church built it.** The design language follows
    churchofjesuschrist.org, Gospel Library, and Member Tools: light, clean,
    unhurried, serif titles, the Church's palette. A counselor opening this for the
    first time should already know how to use it.

## Current decisions of record

- **Sharing** (updated July 2026): presidency of four. Sync is live via an
  encrypted cloud copy keyed by a shared presidency code — each device encrypts
  before upload; the server only stores ciphertext. Still offline-first
  (localStorage is source of truth; sync is best-effort when online).
  Export/import remains for one-off moves. No user accounts.
- **Teachers stay outside the app**: sub requests and reminders go out as prefilled
  text messages from the presidency's phones.
- **Real data**: to be populated from LCR when access arrives (paste-in importer is
  ready); the data model mirrors LCR concepts so import is natural.
- **Attendance** (decided July 2026): this tool records **headcounts only — numbers,
  never names**. Named attendance rolls belong to Member Tools/LCR, the Church's
  system of record; we do not duplicate them (principles 6, 7, 9). A "who needs
  noticing" layer may come later, designed as carefully as this document was.
- **Passcode, not logins** (decided July 2026): the public site holds no ward data —
  each device holds its own copy, so protection lives at the device: an optional
  per-device passcode encrypts everything at rest (AES-GCM; forgotten passcode =
  unrecoverable, by design). Presidency sync uses a separate shared code for
  the cloud copy — not user accounts, and not security theater.

## The test

Before shipping anything, ask:

> Does this make a teacher's Sunday lighter, a counselor's role clearer, or a
> member's home study stronger — and would it still work with no Wi-Fi, in a
> hallway, in 30 seconds?

If yes to none, it doesn't ship.
