// First presidency meeting — Willow Haven Ward, July 2026.
// Used by the meeting slideshow and seeded into the app agenda.

export type SlideArt = {
  /** Filename under /public/art/meeting/ */
  file: string;
  title: string;
  artist: string;
};

export type Slide =
  | {
      kind: "title";
      kicker?: string;
      title: string;
      subtitle?: string;
      art?: SlideArt;
    }
  | {
      kind: "item";
      kicker?: string;
      title: string;
      body?: string[];
      who?: string;
      art?: SlideArt;
    }
  | {
      kind: "quote";
      attribution: string;
      text: string;
      art?: SlideArt;
    }
  | {
      kind: "goals";
      title: string;
      goals: { n: string; text: string }[];
      art?: SlideArt;
    }
  | {
      kind: "plan";
      title: string;
      who: string;
      points: string[];
      art?: SlideArt;
    }
  | { kind: "emphasis"; lines: string[]; art?: SlideArt }
  | {
      kind: "close";
      title: string;
      subtitle?: string;
      art?: SlideArt;
    };

export const MEETING_DATE = "2026-07-12";
export const MEETING_DATE_LABEL = "Sunday, July 12, 2026";

export const MEETING_AGENDA_SEED: { id: string; text: string }[] = [
  { id: "m1", text: "Opening prayer — Trevor" },
  { id: "m2", text: "Introduction — Jaxon (a sacred opportunity)" },
  {
    id: "m3",
    text: "Handbook: teaching in the Church and in the home",
  },
  { id: "m4", text: "President Rich’s counsel" },
  {
    id: "m5",
    text: "Our two aims: Sunday School members look forward to — and transform how the gospel is taught at home",
  },
  { id: "m6", text: "Initial plans — Trevor & Mark: visit a class each week" },
  {
    id: "m7",
    text: "After each visit: private praise to the teacher + praise in the GroupMe",
  },
  {
    id: "m8",
    text: "Jaxon: Sunday-evening thoughts for teachers",
  },
  { id: "m9", text: "Onboard everyone to the app" },
];

export const MEETING_NOTES = `First presidency meeting

Opening prayer — Trevor
Introduction — Jaxon (sacred opportunity)

Handbook: teaching in the Church and in the home
President Rich quote

Two aims:
1) Make Sunday School the block members look forward to
2) Transform how the gospel is taught in the homes of this ward

Plans:
• Trevor & Mark — attend a different Sunday School class each week; after, send (1) a private note to the teacher with sincere praise only, and (2) similar praise in the Sunday School GroupMe. Praise and uplift.
• Jaxon — prepare weekly thoughts to send teachers Sunday evening
• Onboard the whole presidency to the app`;

export const MEETING_ACTIONS: {
  text: string;
  assignedTo: "President" | "First Counselor" | "Second Counselor" | "Everyone";
}[] = [
  {
    text: "Each week: visit a different Sunday School class",
    assignedTo: "First Counselor",
  },
  {
    text: "Each week: visit a different Sunday School class",
    assignedTo: "Second Counselor",
  },
  {
    text: "After each visit: private praise text to the teacher (praise only)",
    assignedTo: "Everyone",
  },
  {
    text: "After each visit: post similar praise in the Sunday School GroupMe",
    assignedTo: "Everyone",
  },
  {
    text: "Sunday evening: send teachers weekly thoughts / kit",
    assignedTo: "President",
  },
  {
    text: "Get every presidency member onto the app with sync",
    assignedTo: "Everyone",
  },
];

const ART = {
  sermon: {
    file: "christ-sermon.jpg",
    title: "Sermon on the Mount",
    artist: "Carl Bloch",
  },
  gethsemane: {
    file: "christ-gethsemane.jpg",
    title: "Christ in Gethsemane",
    artist: "Carl Bloch",
  },
  youngRuler: {
    file: "christ-young-ruler.jpg",
    title: "Christ and the Rich Young Ruler",
    artist: "Heinrich Hofmann",
  },
  healing: {
    file: "christ-healing.jpg",
    title: "Christ Healing the Sick",
    artist: "Carl Bloch",
  },
  children: {
    file: "christ-children.jpg",
    title: "Suffer the Children",
    artist: "Carl Bloch",
  },
  resurrection: {
    file: "christ-resurrection.jpg",
    title: "The Resurrection",
    artist: "Carl Bloch",
  },
  bibleLesson: {
    file: "bible-lesson.jpg",
    title: "The Bible Lesson",
    artist: "Philippe Mercier",
  },
  familyBible: {
    file: "family-bible.jpg",
    title: "Reading the Bible",
    artist: "Marie-Guillemine Benoist",
  },
} as const satisfies Record<string, SlideArt>;

export const SLIDES: Slide[] = [
  {
    kind: "title",
    kicker: "Willow Haven Ward · Sunday School",
    title: "Presidency Meeting",
    subtitle: MEETING_DATE_LABEL,
    art: ART.sermon,
  },
  {
    kind: "item",
    kicker: "We begin",
    title: "Opening prayer",
    who: "Trevor",
    art: ART.gethsemane,
  },
  {
    kind: "item",
    kicker: "Introduction",
    title: "A sacred opportunity",
    who: "Jaxon",
    body: [
      "We have been trusted with the learning and teaching of the gospel in this ward — at church and at home.",
    ],
    art: ART.youngRuler,
  },
  {
    kind: "item",
    kicker: "General Handbook",
    title: "Teaching in the Church and in the home",
    body: [
      "Sunday School exists to help members improve how they learn and teach the gospel — not merely to fill a classroom hour.",
      "What we do on Sunday should strengthen gospel teaching at home.",
    ],
    art: ART.bibleLesson,
  },
  {
    kind: "quote",
    attribution: "President Rich",
    text: "Add President Rich’s quote here before the meeting.",
    art: ART.healing,
  },
  {
    kind: "goals",
    title: "What we’re aiming for",
    goals: [
      {
        n: "01",
        text: "Make Sunday School the hour members look forward to — warm, Christ-centered, and alive.",
      },
      {
        n: "02",
        text: "Transform how the gospel is taught in the homes of this ward.",
      },
    ],
    art: ART.children,
  },
  {
    kind: "item",
    kicker: "How we’ll start",
    title: "Initial plans",
    body: [
      "Small, steady habits that put teachers first and praise first.",
    ],
    art: ART.sermon,
  },
  {
    kind: "plan",
    title: "Visit a class each week",
    who: "Trevor & Mark",
    points: [
      "Attend a different Sunday School class every week",
      "Sit as a learner — notice what lifts the room",
      "Leave with something specific and true to praise",
    ],
    art: ART.youngRuler,
  },
  {
    kind: "plan",
    title: "Two notes after every visit",
    who: "Trevor & Mark",
    points: [
      "A private message to the teacher — sincere praise only. How the lesson helped you.",
      "A message to the Sunday School GroupMe — the same spirit of gratitude, shared with the team.",
    ],
    art: ART.healing,
  },
  {
    kind: "emphasis",
    lines: ["Praise.", "Praise.", "Praise.", "Uplift.", "Uplift.", "Uplift."],
    art: ART.children,
  },
  {
    kind: "plan",
    title: "Sunday-evening thoughts for teachers",
    who: "Jaxon",
    points: [
      "Each Sunday evening, send a short prep thought to the teachers",
      "Point them into Come, Follow Me — never replace it",
      "One clear idea they can carry into the week and into class",
    ],
    art: ART.familyBible,
  },
  {
    kind: "plan",
    title: "Onboard everyone to the app",
    who: "All four of us",
    points: [
      "Same presidency code so we share one living roster",
      "Checklist, visits, who taught, and assignments — in one place",
      "Built for the hallway, not a desk",
    ],
    art: ART.bibleLesson,
  },
  {
    kind: "close",
    title: "Let’s go to work",
    subtitle: "For the teachers. For the homes. For Him.",
    art: ART.resurrection,
  },
];
