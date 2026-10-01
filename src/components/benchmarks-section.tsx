"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SectionHeader } from "./section-header";

const ROWS = [
  { ef: 10, n: { recall: 0.932, qps: 13914, lat: [0.07, 0.09], rss: 45.8 }, q: { recall: 0.959, qps: 7624, lat: [0.13, 0.17], rss: 116.1 } },
  { ef: 20, n: { recall: 0.981, qps: 13966, lat: [0.07, 0.09], rss: 45.8 }, q: { recall: 0.989, qps: 7451, lat: [0.13, 0.15], rss: 116.2 } },
  { ef: 50, n: { recall: 0.996, qps: 10653, lat: [0.09, 0.11], rss: 45.9 }, q: { recall: 0.998, qps: 7051, lat: [0.14, 0.16], rss: 116.3 } },
  { ef: 100, n: { recall: 0.998, qps: 7542, lat: [0.13, 0.16], rss: 45.9 }, q: { recall: 1.0, qps: 6465, lat: [0.15, 0.17], rss: 116.5 } },
  { ef: 200, n: { recall: 1.0, qps: 5822, lat: [0.17, 0.21], rss: 45.9 }, q: { recall: 1.0, qps: 5512, lat: [0.18, 0.22], rss: 116.6 } },
];
type Side = (typeof ROWS)[number]["n"];

const METRICS: { id: string; label: string; better: string; get: (s: Side) => number; fmt: (v: number) => string; max: number }[] = [
  { id: "qps", label: "Searches per second", better: "higher is better", get: (s) => s.qps, fmt: (v) => Math.round(v).toLocaleString("en-US"), max: 15000 },
  { id: "rss", label: "Memory used", better: "lower is better", get: (s) => s.rss, fmt: (v) => `${v.toFixed(0)} MB`, max: 120 },
  { id: "lat", label: "Time per search", better: "lower is better", get: (s) => s.lat[0], fmt: (v) => `${v.toFixed(2)} ms`, max: 0.2 },
  { id: "recall", label: "Right answers", better: "higher is better", get: (s) => s.recall, fmt: (v) => `${(v * 100).toFixed(1)}%`, max: 1 },
];

// True once the element has scrolled into view.
function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

function CountUp({ to, run, fmt }: { to: number; run: boolean; fmt: (v: number) => string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1200);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  return <>{fmt(v)}</>;
}

function Bars({ run }: { run: boolean }) {
  const [mi, setMi] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const m = METRICS[mi];
  return (
    <div>
      <div role="tablist" aria-label="What to compare" className="flex flex-wrap gap-x-6 border-b border-ink/15">
        {METRICS.map((x, i) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={mi === i}
            onClick={() => setMi(i)}
            className={`-mb-px border-b-2 py-3 text-[0.92rem] transition-colors ${
              mi === i ? "border-teal text-ink" : "border-transparent text-ink-faint hover:text-ink-soft"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-6 text-[0.82rem] text-ink-soft">
        <span className="flex items-center gap-2"><span className="h-3 w-3 bg-teal" /> NuclaDB</span>
        <span className="flex items-center gap-2"><span className="hatch h-3 w-3 border border-ink/40" /> Qdrant</span>
        <span className="ml-auto text-ink-faint">{m.better}</span>
      </div>

      <div className="mt-4 grid h-64 grid-cols-5 gap-3 border-b-2 border-ink bg-[linear-gradient(var(--cream-line)_1px,transparent_1px)] bg-[size:100%_25%] sm:gap-6">
        {ROWS.map((r, i) => (
          <div
            key={r.ef}
            className="relative flex items-end justify-center gap-1.5"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            {[r.n, r.q].map((side, j) => {
              const v = m.get(side);
              return (
                <div key={j} className="relative flex h-full w-full max-w-12 items-end">
                  <div
                    className={`w-full transition-[height] duration-700 ease-out ${j ? "hatch border border-ink/40 bg-cream" : "bg-teal"}`}
                    style={{ height: run ? `${Math.max(1, (v / m.max) * 100)}%` : "0%", transitionDelay: `${i * 60}ms` }}
                  />
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 font-mono-ui text-[0.68rem] whitespace-nowrap text-ink transition-opacity ${
                      hover === i ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ bottom: `calc(${(v / m.max) * 100}% + 4px)` }}
                  >
                    {m.fmt(v)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-5 gap-3 text-center font-mono-ui text-[0.72rem] text-ink-faint sm:gap-6">
        {ROWS.map((r) => (
          <span key={r.ef}>effort {r.ef}</span>
        ))}
      </div>
    </div>
  );
}

// A table cell with a bar behind the number, so the column reads at a glance.
function Bar({ value, max, us, children }: { value: number; max: number; us: boolean; children: React.ReactNode }) {
  const pct = (value / max) * 100;
  const color = us ? "rgba(15,122,107,0.22)" : "rgba(26,33,56,0.09)";
  return (
    <td className="py-2 pr-4" style={{ background: `linear-gradient(90deg, ${color} ${pct}%, transparent ${pct}%)` }}>
      {children}
    </td>
  );
}

export function BenchmarksSection() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    <section id="benchmarks" className="bg-cream pt-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader title="Against Qdrant, on the same machine">
          <p>10,000 items, 100 searches, median of 5 runs. Hover the bars for numbers.</p>
        </SectionHeader>

        <div ref={ref} className="mt-10 grid grid-cols-3 divide-x divide-ink/15 border-y-2 border-ink">
          {[
            { to: 1.8, fmt: (v: number) => `${v.toFixed(1)}×`, label: "up to, searches per second" },
            { to: 2.5, fmt: (v: number) => `${v.toFixed(1)}×`, label: "less memory" },
            { to: 416, fmt: (v: number) => `${Math.round(v)} ms`, label: "to load 10,000 items" },
          ].map((s) => (
            <div key={s.label} className="px-3 py-6 first:pl-0 sm:px-8 sm:first:pl-0">
              <p className="font-mono-ui text-[1.5rem] leading-none font-medium tracking-[-0.03em] text-teal tabular-nums sm:text-[4rem]">
                <CountUp to={s.to} run={seen} fmt={s.fmt} />
              </p>
              <p className="mt-3 text-[0.85rem] text-ink-soft">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-cream-line bg-[#f8f0dc] p-5 sm:p-8">
          <Bars run={seen} />
          <p className="mt-6 max-w-2xl text-[0.85rem] leading-relaxed text-ink-faint">
            At the lowest effort, Qdrant gets slightly more answers right. Raise the
            effort and both reach 100%.{" "}
            <Link href="/docs/design-decisions/hnsw-ef-tuning" className="text-ink-soft underline decoration-ink/25 underline-offset-4 hover:text-ink">
              How effort works
            </Link>
          </p>
        </div>

        <details className="group mt-10">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-ink/25 px-4 py-2 text-[0.88rem] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream">
            All the numbers
            <span aria-hidden="true" className="transition-transform group-open:rotate-180">↓</span>
          </summary>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] font-mono-ui text-[0.8rem]">
              <thead>
                <tr className="border-b-2 border-ink text-right text-[0.72rem] text-ink-soft">
                  <th className="py-2 pr-4 text-left font-normal">efSearch</th>
                  <th className="py-2 pr-4 font-normal">recall@10</th>
                  <th className="py-2 pr-4 font-normal">queries/s</th>
                  <th className="py-2 pr-4 font-normal">p50 ms</th>
                  <th className="py-2 pr-4 font-normal">p95 ms</th>
                  <th className="py-2 font-normal">RSS MB</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.flatMap((r) =>
                  (["n", "q"] as const).map((k) => (
                    <tr key={`${r.ef}${k}`} className={`text-right transition-colors hover:bg-cream-deep ${k === "q" ? "border-b border-ink/15 text-ink-soft" : "font-medium text-ink"}`}>
                      <td className={`py-1.5 pr-4 text-left ${k === "q" ? "pl-8" : ""}`}>{k === "n" ? `${r.ef} NuclaDB` : "Qdrant"}</td>
                      <td className="py-2 pr-4">{r[k].recall.toFixed(3)}</td>
                      <Bar value={r[k].qps} max={15000} us={k === "n"}>{r[k].qps.toLocaleString("en-US")}</Bar>
                      <td className="py-2 pr-4">{r[k].lat[0].toFixed(2)}</td>
                      <td className="py-2 pr-4">{r[k].lat[1].toFixed(2)}</td>
                      <Bar value={r[k].rss} max={120} us={k === "n"}>{r[k].rss.toFixed(1)}</Bar>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </section>
  );
}
