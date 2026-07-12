"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SLIDES, type Slide } from "@/lib/first-meeting";

function SlideView({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case "title":
      return (
        <div className="flex h-full flex-col justify-center px-8 sm:px-16 lg:px-24">
          {slide.kicker && (
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary sm:text-base">
              {slide.kicker}
            </p>
          )}
          <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight text-ink sm:text-6xl lg:text-7xl">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="mt-6 text-xl text-ink-2 sm:text-2xl">{slide.subtitle}</p>
          )}
        </div>
      );
    case "item":
      return (
        <div className="flex h-full flex-col justify-center px-8 sm:px-16 lg:px-24">
          {slide.kicker && (
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary sm:text-base">
              {slide.kicker}
            </p>
          )}
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {slide.title}
          </h2>
          {slide.who && (
            <p className="mt-4 text-xl font-semibold text-primary sm:text-2xl">
              {slide.who}
            </p>
          )}
          {slide.body && (
            <div className="mt-8 max-w-3xl space-y-4">
              {slide.body.map((line) => (
                <p key={line} className="text-lg leading-relaxed text-ink-2 sm:text-xl">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    case "quote":
      return (
        <div className="flex h-full flex-col justify-center px-8 sm:px-16 lg:px-24">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Counsel
          </p>
          <blockquote className="mt-6 max-w-3xl font-serif text-3xl font-bold leading-snug tracking-tight text-ink sm:text-4xl lg:text-5xl">
            “{slide.text}”
          </blockquote>
          <p className="mt-8 text-lg font-semibold text-ink-2 sm:text-xl">
            — {slide.attribution}
          </p>
        </div>
      );
    case "goals":
      return (
        <div className="flex h-full flex-col justify-center px-8 sm:px-16 lg:px-24">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Aims
          </p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {slide.title}
          </h2>
          <ol className="mt-10 max-w-3xl space-y-8">
            {slide.goals.map((g) => (
              <li key={g.n} className="flex gap-5">
                <span className="font-serif text-3xl font-bold text-primary sm:text-4xl">
                  {g.n}
                </span>
                <p className="pt-1 text-lg leading-relaxed text-ink sm:text-xl">
                  {g.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      );
    case "plan":
      return (
        <div className="flex h-full flex-col justify-center px-8 sm:px-16 lg:px-24">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            {slide.who}
          </p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {slide.title}
          </h2>
          <ul className="mt-10 max-w-3xl space-y-4">
            {slide.points.map((p) => (
              <li key={p} className="flex gap-3 text-lg text-ink sm:text-xl">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "emphasis":
      return (
        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
          {slide.lines.map((line, i) => (
            <p
              key={`${line}-${i}`}
              className="font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl"
              style={{ opacity: 0.45 + (i / (slide.lines.length - 1)) * 0.55 }}
            >
              {line}
            </p>
          ))}
        </div>
      );
    case "close":
      return (
        <div className="flex h-full flex-col justify-center px-8 sm:px-16 lg:px-24">
          <h2 className="font-serif text-5xl font-bold tracking-tight text-ink sm:text-6xl lg:text-7xl">
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="mt-6 text-xl text-ink-2 sm:text-2xl">{slide.subtitle}</p>
          )}
        </div>
      );
  }
}

export default function MeetingSlidesPage() {
  const [i, setI] = useState(0);
  const total = SLIDES.length;
  const slide = SLIDES[i];

  const go = useCallback(
    (dir: -1 | 1) => {
      setI((cur) => Math.min(total - 1, Math.max(0, cur + dir)));
    },
    [total]
  );

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

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-gradient-to-br from-[#f7fafb] via-white to-[#e8f1f5]">
      {/* subtle atmosphere — soft primary wash, not flat white */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 100% 0%, rgba(0,97,132,0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 0% 100%, rgba(0,97,132,0.08), transparent 50%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/presidency"
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Presidency
        </Link>
        <p className="font-serif text-sm font-bold text-ink">Sunday School</p>
        <p className="text-sm tabular-nums text-ink-3">
          {i + 1} / {total}
        </p>
      </header>

      <div className="relative z-10 min-h-0 flex-1">
        <SlideView slide={slide} />
      </div>

      <footer className="relative z-10 flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={i === 0}
          className="rounded-md border border-line-2 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-surface disabled:opacity-30"
        >
          Previous
        </button>
        <div className="flex gap-1.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-6 bg-primary" : "w-1.5 bg-line-2 hover:bg-ink-3"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={i === total - 1}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-30"
        >
          Next
        </button>
      </footer>
    </div>
  );
}
