"use client";

// Weekly teacher kits: one extra resource and one framing question per week.
// Rules (GOSPEL.md): links to official sources only, never more than one
// extra, and the question does the heavy lifting — ask before tell.
// Kits are drafted by the presidency and edited like a manuscript; weeks
// without a kit still get the lesson link in the Sunday message.

import { firstName } from "./store";
import { LESSONS, formatSunday, lessonUrl } from "./lessons";
import { artworkFor } from "@/components/LessonArt";

export type Kit = {
  week: number;
  talkTitle?: string;
  talkSpeaker?: string;
  talkUrl?: string;
  question: string;
};

const GC = "https://www.churchofjesuschrist.org/study/general-conference";

export const KITS: Record<number, Kit> = {
  28: {
    week: 28,
    talkTitle: "The Ministry of Angels",
    talkSpeaker: "Jeffrey R. Holland",
    talkUrl: `${GC}/2008/10/the-ministry-of-angels?lang=eng`,
    question:
      "Naaman wanted to do 'some great thing' — washing in a muddy river felt beneath him. What simple thing might God be asking of us while we hold out for a great one?",
  },
  29: {
    week: 29,
    talkTitle: "The Power of Scripture",
    talkSpeaker: "Richard G. Scott",
    talkUrl: `${GC}/2011/10/the-power-of-scripture?lang=eng`,
    question:
      "Josiah's generation lost the book of the law inside their own temple — and didn't notice. What might we have lost in the house without noticing, and what would change if we found it again?",
  },
  30: {
    week: 30,
    talkTitle: "Fear Not to Do Good",
    talkSpeaker: "Henry B. Eyring",
    talkUrl: `${GC}/2017/10/fear-not-to-do-good?lang=eng`,
    question:
      "Jehoshaphat put the singers in front of the army. Why would God lead with praise instead of swords — and what battle of yours would that reorder?",
  },
  31: {
    week: 31,
    talkTitle: "We Are Doing a Great Work and Cannot Come Down",
    talkSpeaker: "Dieter F. Uchtdorf",
    talkUrl: `${GC}/2009/04/we-are-doing-a-great-work-and-cannot-come-down?lang=eng`,
    question:
      "Nehemiah refused to leave the wall to argue with his critics. What keeps pulling you down off your wall — and what would staying up cost you?",
  },
  32: {
    week: 32,
    talkTitle: "Turn On Your Light",
    talkSpeaker: "Sharon Eubank",
    talkUrl: `${GC}/2017/10/turn-on-your-light?lang=eng`,
    question:
      "Esther couldn't know she was born 'for such a time as this' until the time arrived — and saying yes could have killed her. What time might you have been placed here for?",
  },
  33: {
    week: 33,
    talkTitle: "Infuriating Unfairness",
    talkSpeaker: "Dale G. Renlund",
    talkUrl: `${GC}/2021/04/infuriating-unfairness?lang=eng`,
    question:
      "Job's friends got it right for seven days — they sat with him in silence. Then they started explaining. Why is presence so much harder than explanation?",
  },
  34: {
    week: 34,
    talkTitle: "Songs Sung and Unsung",
    talkSpeaker: "Jeffrey R. Holland",
    talkUrl: `${GC}/2017/04/songs-sung-and-unsung?lang=eng`,
    question:
      "The Psalms are Israel singing everything to God — including anger, fear, and doubt. What are you not saying to God because it doesn't feel 'church'?",
  },
  35: {
    week: 35,
    talkTitle: "Repentance: A Joyful Choice",
    talkSpeaker: "Dale G. Renlund",
    talkUrl: `${GC}/2016/10/repentance-a-joyful-choice?lang=eng`,
    question:
      "Psalm 51 is David's prayer after his worst night — and Israel kept it in the songbook. Why would God want the worst night sung, not hidden?",
  },
};

export function kitFor(week: number): Kit | undefined {
  return KITS[week];
}

// The Sunday-evening message: lesson link, one extra, one question,
// and explicit permission to ignore all of it.
export function kitMessage(opts: {
  teacherName: string;
  week: number;
}): string {
  const lesson = LESSONS.find((l) => l.week === opts.week);
  if (!lesson) return "";
  const kit = kitFor(opts.week);
  const art = artworkFor(opts.week);
  const date = formatSunday(lesson.sunday).replace("Sunday, ", "");

  let msg =
    `Hi ${firstName(opts.teacherName)}! Next Sunday (${date}) is ` +
    `${lesson.ref}. Lesson: ${lessonUrl(opts.week)}`;

  if (kit?.talkUrl) {
    msg += ` If you'd like one extra, ${kit.talkSpeaker}'s "${kit.talkTitle}" pairs beautifully: ${kit.talkUrl}`;
  }
  if (kit?.question) {
    msg += ` A question worth sitting with as you prepare: ${kit.question}`;
  }
  msg += ` (Our artwork this week is “${art.title}” by ${art.artist}.) No homework here — you already have everything you need. Thank you for teaching!`;
  return msg;
}
