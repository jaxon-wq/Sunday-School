"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SLIDES, type Slide, type SlideArt } from "@/lib/first-meeting";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function artSrc(art: SlideArt) {
  return `${BASE}/art/meeting/${art.file}`;
}

function isBleed(slide: Slide) {
  return slide.kind === "title" || slide.kind === "close" || slide.kind === "emphasis";
}

function SlideCopy({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case "title":
      return (
        <>
          {slide.kicker && (
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-primary sm:text-sm">
              {slide.kicker}
            </p>
          )}
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl md:text-6xl lg:text-7xl">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="mt-4 text-lg text-ink-2 sm:text-xl md:text-2xl">
              {slide.subtitle}
            </p>
          )}
        </>
      );
    case "item":
      return (
        <>
          {slide.kicker && (
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-primary sm:text-sm">
              {slide.kicker}
            </p>
          )}
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-5xl">
            {slide.title}
          </h2>
          {slide.who && (
            <p className="mt-3 text-lg font-semibold text-primary sm:text-xl">
              {slide.who}
            </p>
          )}
          {slide.body && (
            <div className="mt-5 max-w-xl space-y-3">
              {slide.body.map((line) => (
                <p key={line} className="text-base leading-relaxed text-ink-2 sm:text-lg">
                  {line}
                </p>
              ))}
            </div>
          )}
        </>
      );
    case "quote":
      return (
        <>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-primary sm:text-sm">
            Counsel
          </p>
          <blockquote className="mt-4 max-w-xl font-serif text-2xl font-bold leading-snug tracking-tight text-ink sm:text-3xl md:text-4xl">
            “{slide.text}”
          </blockquote>
          <p className="mt-6 text-base font-semibold text-ink-2 sm:text-lg">
            — {slide.attribution}
          </p>
        </>
      );
    case "goals":
      return (
        <>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-primary sm:text-sm">
            Aims
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-5xl">
            {slide.title}
          </h2>
          <ol className="mt-6 max-w-xl space-y-5">
            {slide.goals.map((g) => (
              <li key={g.n} className="flex gap-4">
                <span className="font-serif text-2xl font-bold text-primary sm:text-3xl">
                  {g.n}
                </span>
                <p className="pt-1 text-base leading-relaxed text-ink sm:text-lg">
                  {g.text}
                </p>
              </li>
            ))}
          </ol>
        </>
      );
    case "plan":
      return (
        <>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-primary sm:text-sm">
            {slide.who}
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-5xl">
            {slide.title}
          </h2>
          <ul className="mt-6 max-w-xl space-y-3">
            {slide.points.map((p) => (
              <li key={p} className="flex gap-3 text-base text-ink sm:text-lg">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </>
      );
    case "emphasis":
      return (
        <div className="text-center">
          {slide.lines.map((line, i) => (
            <p
              key={`${line}-${i}`}
              className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
              style={{
                opacity: 0.4 + (i / Math.max(1, slide.lines.length - 1)) * 0.6,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      );
    case "close":
      return (
        <>
          <h2 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="mt-5 text-lg text-white/85 sm:text-xl md:text-2xl">
              {slide.subtitle}
            </p>
          )}
        </>
      );
  }
}

function BleedSlide({ slide }: { slide: Slide }) {
  const art = slide.art;
  const lightTitle = slide.kind === "title";

  return (
    <div className="relative h-full w-full overflow-hidden">
      {art && (
        <img
          src={artSrc(art)}
          alt={`“${art.title}” by ${art.artist}`}
          className="meeting-ken absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div
        className={`absolute inset-0 ${
          lightTitle
            ? "bg-gradient-to-r from-[#f7fafb]/95 via-[#f7fafb]/78 to-[#f7fafb]/25"
            : "bg-gradient-to-r from-[#0a2a38]/88 via-[#0a2a38]/55 to-[#0a2a38]/25"
        }`}
      />
      <div
        className={`relative z-10 flex h-full flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-20 ${
          slide.kind === "emphasis" ? "items-center" : "items-start"
        }`}
      >
        <div className={slide.kind === "emphasis" ? "" : "max-w-2xl"}>
          <SlideCopy slide={slide} />
        </div>
        {art && (
          <p
            className={`absolute bottom-4 left-6 text-[0.65rem] tracking-wide sm:left-10 ${
              lightTitle ? "text-ink-3" : "text-white/55"
            }`}
          >
            {art.title} · {art.artist}
          </p>
        )}
      </div>
    </div>
  );
}

function SplitSlide({ slide }: { slide: Slide }) {
  const art = slide.art;

  return (
    <div className="grid h-full w-full grid-cols-1 landscape:grid-cols-2">
      <div className="relative flex flex-col justify-center bg-gradient-to-br from-[#f7fafb] via-white to-[#e8f1f5] px-6 py-5 sm:px-10 md:px-12 lg:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 50% at 0% 0%, rgba(0,97,132,0.1), transparent 55%)",
          }}
        />
        <div className="relative z-10">
          <SlideCopy slide={slide} />
        </div>
      </div>
      <div className="relative hidden min-h-0 landscape:block">
        {art ? (
          <>
            <img
              src={artSrc(art)}
              alt={`“${art.title}” by ${art.artist}`}
              className="meeting-ken absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/10" />
            <p className="absolute bottom-3 right-4 text-[0.65rem] tracking-wide text-white/80 drop-shadow">
              {art.title} · {art.artist}
            </p>
          </>
        ) : (
          <div className="h-full bg-primary/10" />
        )}
      </div>
    </div>
  );
}

async function enterLandscapePresentation() {
  const el = document.documentElement;
  try {
    if (!document.fullscreenElement && el.requestFullscreen) {
      await el.requestFullscreen();
    }
  } catch {
    /* denied */
  }
  try {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (o: string) => Promise<void>;
    };
    if (orientation?.lock) await orientation.lock("landscape");
  } catch {
    /* iOS / unsupported */
  }
}

export default function MeetingSlidesPage() {
  const [i, setI] = useState(0);
  const [started, setStarted] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const total = SLIDES.length;
  const slide = SLIDES[i];

  const go = useCallback(
    (dir: -1 | 1) => {
      setI((cur) => Math.min(total - 1, Math.max(0, cur + dir)));
    },
    [total]
  );

  useEffect(() => {
    function check() {
      setPortrait(window.matchMedia("(orientation: portrait)").matches);
    }
    check();
    const mq = window.matchMedia("(orientation: portrait)");
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Home") setI(0);
      else if (e.key === "End") setI(total - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, total]);

  useEffect(() => {
    if (started && !portrait) void enterLandscapePresentation();
  }, [started, portrait]);

  async function begin() {
    await enterLandscapePresentation();
    setStarted(true);
  }

  if (!started) {
    return (
      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#0a2a38] px-6 text-center text-white">
        <img
          src={`${BASE}/art/meeting/christ-sermon.jpg`}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2a38]/80 via-[#0a2a38]/70 to-[#0a2a38]/90" />
        <div className="relative z-10 max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9ec9dc]">
            Willow Haven Ward
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Presidency Meeting
          </h1>
          <p className="mt-4 text-base text-white/80">
            Best in landscape. Tap begin, then turn your phone sideways if it
            isn’t already.
          </p>
          <button
            type="button"
            onClick={() => void begin()}
            className="mt-8 rounded-md bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Begin slideshow
          </button>
          <p className="mt-6">
            <Link href="/presidency" className="text-sm text-white/60 hover:text-white">
              ← Back to Presidency
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#0a2a38]">
      {portrait && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#0a2a38] px-8 text-center text-white">
          <div
            aria-hidden
            className="meeting-phone-tilt mb-6 h-16 w-10 rounded-md border-2 border-white/70"
          />
          <p className="font-serif text-2xl font-bold">Turn your phone sideways</p>
          <p className="mt-3 max-w-xs text-sm text-white/75">
            The slideshow is built for landscape so the gospel art and the words
            can sit side by side.
          </p>
        </div>
      )}

      <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 bg-black/25 px-4 py-2 text-white backdrop-blur-sm">
        <Link
          href="/presidency"
          className="text-sm font-semibold text-white/85 hover:text-white"
        >
          ← Exit
        </Link>
        <p className="font-serif text-sm font-bold">Sunday School</p>
        <p className="text-sm tabular-nums text-white/70">
          {i + 1} / {total}
        </p>
      </header>

      <div
        className="relative min-h-0 flex-1"
        onClick={(e) => {
          const mid = window.innerWidth / 2;
          if (e.clientX < mid) go(-1);
          else go(1);
        }}
      >
        <div key={i} className="meeting-slide-in h-full">
          {isBleed(slide) ? <BleedSlide slide={slide} /> : <SplitSlide slide={slide} />}
        </div>
      </div>

      <footer className="relative z-10 flex shrink-0 items-center justify-between gap-3 bg-black/25 px-4 py-2.5 backdrop-blur-sm">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          disabled={i === 0}
          className="rounded-md border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-30"
        >
          Previous
        </button>
        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-5 bg-white" : "w-1.5 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          disabled={i === total - 1}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-30"
        >
          Next
        </button>
      </footer>
    </div>
  );
}
