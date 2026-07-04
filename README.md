# Sunday School

A ward Sunday School presidency tool for the 2026 **Come, Follow Me — Old
Testament** year, built to look and feel like the Church's own apps
(churchofjesuschrist.org · Gospel Library · Member Tools).

Read [GOSPEL.md](GOSPEL.md) first — it is the constitution of this project.
Every feature is measured against it.

## Features

- **Home** — the next Sunday School at a glance: artwork, lesson, who's
  teaching each class, substitutes, and gaps.
- **Schedule** — all 52 weeks with classic gospel artwork, grouped by month.
  Assign substitutes and send prefilled text messages (sub requests and
  teacher reminders) straight from any Sunday. Handles the September 6, 2026
  second-hour change automatically (every Sunday, 25 minutes).
- **Teachers & Classes** — roster and assignments, ready to be populated from
  LCR. Export/import JSON to back up or share with counselors.
- **Presidency** — the four members, Handbook-13 roles and responsibilities,
  and a per-Sunday checklist with assignments (confirm teachers Thursday,
  arrange subs Friday, rooms ready 8:40, …).

## Design

The UI follows the Church's design language: Ensign Sans/Serif (via the
Church's public font service) with Noto fallbacks, the official palette
(text `#212225`, primary `#006184`), white surfaces, serif titles.

All 52 paintings are public-domain classics (Rembrandt, Michelangelo, Tissot,
Doré, Carl Bloch…) served locally from [public/art](public/art) — no network
dependency. Sources in [public/art/ATTRIBUTION.md](public/art/ATTRIBUTION.md).

## Data

Everything lives in the browser (localStorage): no accounts, no server, no
analytics. The data belongs to the ward — export it, import it, hand it off.

## Running it

```bash
npm install
npm run dev
```

## Curriculum source

Weekly outline from
[Come, Follow Me — For Home and Church: Old Testament 2026](https://www.churchofjesuschrist.org/study/manual/come-follow-me-for-home-and-church-old-testament-2026?lang=eng).
Lesson data in [lib/lessons.ts](lib/lessons.ts). Role descriptions adapted from
the [General Handbook, ch. 13](https://www.churchofjesuschrist.org/study/manual/general-handbook/13-sunday-school?lang=eng).
