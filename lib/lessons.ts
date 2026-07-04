// Weekly outline from "Come, Follow Me — For Home and Church: Old Testament 2026"
// https://www.churchofjesuschrist.org/study/manual/come-follow-me-for-home-and-church-old-testament-2026

export type Lesson = {
  week: number;
  dates: string; // date range as printed in the manual
  sunday: string; // ISO date of the Sunday that ends this study week
  ref: string; // scripture block or special observance
  special?: boolean;
};

export const LESSONS: Lesson[] = [
  { week: 1, dates: "December 29 – January 4", sunday: "2026-01-04", ref: "Introduction to the Old Testament" },
  { week: 2, dates: "January 5–11", sunday: "2026-01-11", ref: "Moses 1; Abraham 3" },
  { week: 3, dates: "January 12–18", sunday: "2026-01-18", ref: "Genesis 1–2; Moses 2–3; Abraham 4–5" },
  { week: 4, dates: "January 19–25", sunday: "2026-01-25", ref: "Genesis 3–4; Moses 4–5" },
  { week: 5, dates: "January 26 – February 1", sunday: "2026-02-01", ref: "Genesis 5; Moses 6" },
  { week: 6, dates: "February 2–8", sunday: "2026-02-08", ref: "Moses 7" },
  { week: 7, dates: "February 9–15", sunday: "2026-02-15", ref: "Genesis 6–11; Moses 8" },
  { week: 8, dates: "February 16–22", sunday: "2026-02-22", ref: "Genesis 12–17; Abraham 1–2" },
  { week: 9, dates: "February 23 – March 1", sunday: "2026-03-01", ref: "Genesis 18–23" },
  { week: 10, dates: "March 2–8", sunday: "2026-03-08", ref: "Genesis 24–33" },
  { week: 11, dates: "March 9–15", sunday: "2026-03-15", ref: "Genesis 37–41" },
  { week: 12, dates: "March 16–22", sunday: "2026-03-22", ref: "Genesis 42–50" },
  { week: 13, dates: "March 23–29", sunday: "2026-03-29", ref: "Exodus 1–6" },
  { week: 14, dates: "March 30 – April 5", sunday: "2026-04-05", ref: "Easter", special: true },
  { week: 15, dates: "April 6–12", sunday: "2026-04-12", ref: "Exodus 7–13" },
  { week: 16, dates: "April 13–19", sunday: "2026-04-19", ref: "Exodus 14–18" },
  { week: 17, dates: "April 20–26", sunday: "2026-04-26", ref: "Exodus 19–20; 24; 31–34" },
  { week: 18, dates: "April 27 – May 3", sunday: "2026-05-03", ref: "Exodus 35–40; Leviticus 1; 4; 16; 19" },
  { week: 19, dates: "May 4–10", sunday: "2026-05-10", ref: "Numbers 11–14; 20–24; 27" },
  { week: 20, dates: "May 11–17", sunday: "2026-05-17", ref: "Deuteronomy 6–8; 15; 18; 29–30; 34" },
  { week: 21, dates: "May 18–24", sunday: "2026-05-24", ref: "Joshua 1–8; 23–24" },
  { week: 22, dates: "May 25–31", sunday: "2026-05-31", ref: "Judges 2–4; 6–8; 13–16" },
  { week: 23, dates: "June 1–7", sunday: "2026-06-07", ref: "Ruth; 1 Samuel 1–7" },
  { week: 24, dates: "June 8–14", sunday: "2026-06-14", ref: "1 Samuel 8–10; 13; 15–16" },
  { week: 25, dates: "June 15–21", sunday: "2026-06-21", ref: "1 Samuel 17–18; 24–26; 2 Samuel 5–7" },
  { week: 26, dates: "June 22–28", sunday: "2026-06-28", ref: "2 Samuel 11–12; 1 Kings 3; 6–9; 11" },
  { week: 27, dates: "June 29 – July 5", sunday: "2026-07-05", ref: "1 Kings 12–13; 17–22" },
  { week: 28, dates: "July 6–12", sunday: "2026-07-12", ref: "2 Kings 2–7" },
  { week: 29, dates: "July 13–19", sunday: "2026-07-19", ref: "2 Kings 16–25" },
  { week: 30, dates: "July 20–26", sunday: "2026-07-26", ref: "2 Chronicles 14–20; 26; 30" },
  { week: 31, dates: "July 27 – August 2", sunday: "2026-08-02", ref: "Ezra 1; 3–7; Nehemiah 2; 4–6; 8" },
  { week: 32, dates: "August 3–9", sunday: "2026-08-09", ref: "Esther" },
  { week: 33, dates: "August 10–16", sunday: "2026-08-16", ref: "Job 1–3; 12–14; 19; 21–24; 38–40; 42" },
  { week: 34, dates: "August 17–23", sunday: "2026-08-23", ref: "Psalms 1–2; 8; 19–33; 40; 46" },
  { week: 35, dates: "August 24–30", sunday: "2026-08-30", ref: "Psalms 49–51; 61–66; 69–72; 77–78; 85–86" },
  { week: 36, dates: "August 31 – September 6", sunday: "2026-09-06", ref: "Psalms 102–3; 110; 116–19; 127–28; 135–39; 146–50" },
  { week: 37, dates: "September 7–13", sunday: "2026-09-13", ref: "Proverbs 1–4; 15–16; 22; 31; Ecclesiastes 1–3; 11–12" },
  { week: 38, dates: "September 14–20", sunday: "2026-09-20", ref: "Isaiah 1–12" },
  { week: 39, dates: "September 21–27", sunday: "2026-09-27", ref: "Isaiah 13–14; 22; 24–30; 35" },
  { week: 40, dates: "September 28 – October 4", sunday: "2026-10-04", ref: "Isaiah 40–49" },
  { week: 41, dates: "October 5–11", sunday: "2026-10-11", ref: "Isaiah 50–57" },
  { week: 42, dates: "October 12–18", sunday: "2026-10-18", ref: "Isaiah 58–66" },
  { week: 43, dates: "October 19–25", sunday: "2026-10-25", ref: "Jeremiah 1–3; 7; 16–18; 20" },
  { week: 44, dates: "October 26 – November 1", sunday: "2026-11-01", ref: "Jeremiah 31–33; 36–38; Lamentations 1; 3" },
  { week: 45, dates: "November 2–8", sunday: "2026-11-08", ref: "Ezekiel 1–3; 33–34; 36–37; 47" },
  { week: 46, dates: "November 9–15", sunday: "2026-11-15", ref: "Daniel 1–7" },
  { week: 47, dates: "November 16–22", sunday: "2026-11-22", ref: "Hosea 1–6; 10–14; Joel" },
  { week: 48, dates: "November 23–29", sunday: "2026-11-29", ref: "Amos; Obadiah; Jonah" },
  { week: 49, dates: "November 30 – December 6", sunday: "2026-12-06", ref: "Micah; Nahum; Habakkuk; Zephaniah" },
  { week: 50, dates: "December 7–13", sunday: "2026-12-13", ref: "Haggai 1–2; Zechariah 1–4; 7–14" },
  { week: 51, dates: "December 14–20", sunday: "2026-12-20", ref: "Malachi" },
  { week: 52, dates: "December 21–27", sunday: "2026-12-27", ref: "Christmas", special: true },
];

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatSunday(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function sundayOccurrence(iso: string): number {
  return Math.ceil(parseISODate(iso).getDate() / 7);
}

const ORDINALS = ["", "1st", "2nd", "3rd", "4th", "5th"];

export function occurrenceLabel(iso: string): string {
  return `${ORDINALS[sundayOccurrence(iso)]} Sunday`;
}
