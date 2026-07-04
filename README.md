# Sunday School Manager

A simple organizer for a ward Sunday School presidency, built around the
2026 **Come, Follow Me — Old Testament** curriculum.

## Features

- **Dashboard** — the next Sunday School date and lesson, who's teaching each
  class (including substitutes), and warnings for classes with no teacher.
- **Schedule** — all 52 weeks of the official 2026 Come, Follow Me outline,
  with teaching Sundays highlighted (configurable: 1st & 3rd, 2nd & 4th, or
  every Sunday — through August 30 only; starting September 6, 2026 the app
  automatically switches to the new second-hour schedule where Sunday School
  meets every Sunday for 25 minutes). Assign a substitute per class per
  Sunday and add week notes (ward conference, combined classes, etc.).
- **Teachers & Classes** — add classes and teachers, assign teachers to
  classes, and flag people as substitutes.

All data is stored in your browser (localStorage) — no accounts, no server,
no database. Note this means data is per-device; clear your browser data and
it's gone.

## Running it

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Curriculum source

The weekly outline comes from
[Come, Follow Me — For Home and Church: Old Testament 2026](https://www.churchofjesuschrist.org/study/manual/come-follow-me-for-home-and-church-old-testament-2026?lang=eng).
Lesson data lives in [lib/lessons.ts](lib/lessons.ts).
