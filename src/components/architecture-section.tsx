"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "./section-header";
import { REPO_URL } from "@/lib/site";

type Stop = { name: string; save: string | null; find: string | null; path: string };

// One row of stops; each mode lights the ones its request passes through.
const STOPS: Stop[] = [
  { name: "Your app", save: "sends an item", find: "sends a question", path: "clients/python" },
  { name: "API", save: "gRPC or REST", find: "gRPC or REST", path: "internal/api" },
  { name: "Gatekeeper", save: "checks your key", find: "checks your key", path: "internal/engine" },
  { name: "Log on disk", save: "written first, survives a crash", find: null, path: "internal/storage/wal" },
  { name: "Search graph", save: "item is linked in", find: "walks the links", path: "internal/index/hnsw" },
  { name: "Backup file", save: "saved every 5 min", find: null, path: "internal/storage/segment" },
];

const MODES = { save: "Saving an item", find: "Finding similar items" } as const;
type Mode = keyof typeof MODES;

export function ArchitectureSection() {
  const [mode, setMode] = useState<Mode>("save");
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const route = STOPS.map((s, i) => (s[mode] ? i : -1)).filter((i) => i >= 0);
  const at = route[step % route.length];

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setStep((s) => s + 1), 1100);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section id="architecture" className="bg-cream py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader title="What happens to your data">
          <p>Saving goes to disk before anything else. Searching never waits on the disk.</p>
        </SectionHeader>

        <div role="tablist" aria-label="Request type" className="mt-10 flex gap-6 border-b border-ink/15">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                setStep(0);
              }}
              className={`-mb-px border-b-2 py-3 text-[0.95rem] transition-colors ${
                mode === m ? "border-teal text-ink" : "border-transparent text-ink-faint hover:text-ink-soft"
              }`}
            >
              {MODES[m]}
            </button>
          ))}
        </div>

        <ol
          className="dot-grid mt-8 grid grid-cols-1 gap-5 rounded-2xl border border-cream-line bg-[#f8f0dc] p-6 md:grid-cols-6 md:gap-0 md:p-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {STOPS.map((s, i) => {
            const on = s[mode] !== null;
            const here = i === at;
            const passed = on && route.indexOf(i) <= route.indexOf(at);
            return (
              <li key={s.name} className={`relative flex items-start gap-4 md:block ${on ? "" : "opacity-30"}`}>
                <div className="relative flex items-center md:mb-5">
                  <span
                    className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-mono-ui text-[0.85rem] transition-all duration-300 ${
                      here ? "scale-110 border-ink bg-ink text-glow-cyan" : passed ? "border-teal bg-cream text-teal" : "border-ink/25 bg-cream text-ink-faint"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {i < STOPS.length - 1 && (
                    <span className="relative mx-2 hidden h-0.5 flex-1 bg-ink/15 md:block">
                      {here && <span className="flow-dot absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-teal" />}
                    </span>
                  )}
                </div>
                <div className="pr-4">
                  <a
                    href={`${REPO_URL}/tree/main/${s.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-ink underline decoration-transparent underline-offset-4 hover:decoration-ink/40"
                  >
                    {s.name}
                  </a>
                  <p className={`mt-1 text-[0.88rem] leading-snug transition-colors ${here ? "text-ink" : "text-ink-soft"}`}>
                    {s[mode] ?? "skipped"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
