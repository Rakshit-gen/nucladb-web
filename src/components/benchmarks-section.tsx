import Link from "next/link";
import { Reveal } from "./reveal";

const EF_ROWS = [
  { ef: 10, nRecall: "0.8960", qRecall: "1.0000", nQps: 7432.4, qQps: 3661.1, nRss: "45.2 MB", qRss: "102.7 MB" },
  { ef: 20, nRecall: "0.9620", qRecall: "1.0000", nQps: 6298.9, qQps: 4522.6, nRss: "45.2 MB", qRss: "102.7 MB" },
  { ef: 50, nRecall: "0.9970", qRecall: "1.0000", nQps: 4932.9, qQps: 5057.7, nRss: "45.3 MB", qRss: "102.7 MB" },
  { ef: 100, nRecall: "1.0000", qRecall: "1.0000", nQps: 3675.8, qQps: 4951.5, nRss: "45.4 MB", qRss: "102.7 MB" },
  { ef: 200, nRecall: "1.0000", qRecall: "1.0000", nQps: 2367.5, qQps: 5063.3, nRss: "45.6 MB", qRss: "102.7 MB" },
];

const MAX_QPS = Math.max(...EF_ROWS.flatMap((r) => [r.nQps, r.qQps]));

export function BenchmarksSection() {
  return (
    <section id="benchmarks" className="relative bg-navy-950 py-28 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="kicker kicker--on-dark mb-4">Benchmarks · Real numbers</p>
          <h2 className="max-w-2xl text-[2rem] leading-tight font-semibold tracking-tight sm:text-[2.4rem]">
            We measured our own weaknesses too.
          </h2>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-white/60">
            A real, reproducible, committed head-to-head against an actual Qdrant
            binary: 10,000 base vectors, 100 queries, dim=128, SIFT-small,
            measured over each system&rsquo;s real network API. Not synthetic, not
            an in-process shortcut.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Reveal className="min-w-0 lg:col-span-1">
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <p className="kicker kicker--on-dark mb-4">Build time</p>
              <p className="font-mono-ui text-3xl font-medium text-glow-amber">~350×</p>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-white/60">
                slower to build 10K vectors than Qdrant (43.9s vs 124ms): fsync-per-write
                with no batching, the correct-but-slow default for a WAL that means it.
                <Link href="/docs/design-decisions/wal-then-snapshot" className="ml-1 underline decoration-white/30 underline-offset-2 hover:text-white">
                  Why, in depth →
                </Link>
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.06} className="min-w-0 lg:col-span-1">
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <p className="kicker kicker--on-dark mb-4">Memory, at every ef</p>
              <p className="font-mono-ui text-3xl font-medium text-glow-cyan">&lt;½×</p>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-white/60">
                NuclaDB&rsquo;s RSS stays under half of Qdrant&rsquo;s across every efSearch value
                tested (45.2–45.6 MB vs a flat 102.7 MB).
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="min-w-0 lg:col-span-1">
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <p className="kicker kicker--on-dark mb-4">Product quantization</p>
              <p className="font-mono-ui text-3xl font-medium text-glow-violet">57.7%</p>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-white/60">
                recall@10 at a fixed 16× memory reduction, the near-worst-case
                config (no re-ranking, no IVF), measured as a clean read of
                quantization error alone.
                <Link href="/docs/design-decisions/product-quantization-cost" className="ml-1 underline decoration-white/30 underline-offset-2 hover:text-white">
                  Why, in depth →
                </Link>
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-16">
          <p className="kicker kicker--on-dark mb-6">Queries per second, by efSearch</p>
          <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            {EF_ROWS.map((row) => {
              const nPct = (row.nQps / MAX_QPS) * 100;
              const qPct = (row.qQps / MAX_QPS) * 100;
              return (
                <div key={row.ef} className="flex items-center gap-4">
                  <span className="w-12 shrink-0 font-mono-ui text-[0.78rem] text-white/40">ef {row.ef}</span>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-16 shrink-0 font-mono-ui text-[0.7rem] uppercase tracking-wider text-white/40">
                        NuclaDB
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-white/5">
                        <div className="h-2 rounded-full bg-glow-cyan" style={{ width: `${nPct}%` }} />
                      </div>
                      <span className="w-16 shrink-0 text-right font-mono-ui text-[0.78rem] text-glow-cyan">
                        {row.nQps}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-16 shrink-0 font-mono-ui text-[0.7rem] uppercase tracking-wider text-white/40">
                        Qdrant
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-white/5">
                        <div className="h-2 rounded-full bg-white/35" style={{ width: `${qPct}%` }} />
                      </div>
                      <span className="w-16 shrink-0 text-right font-mono-ui text-[0.78rem] text-white/50">
                        {row.qQps}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-[0.82rem] text-white/40">
            At low ef (10&ndash;20), NuclaDB&rsquo;s QPS actually beats Qdrant&rsquo;s outright:
            7432 vs 3661 at ef=10.
          </p>

          <details className="group mt-4">
            <summary className="cursor-pointer font-mono-ui text-[0.78rem] text-white/40 transition-colors hover:text-white/70">
              View full data table (recall@10, RSS) &darr;
            </summary>
            <div className="relative mt-4">
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
                <table className="w-full min-w-[640px] text-left font-mono-ui text-[0.82rem]">
                <thead>
                  <tr className="border-b border-white/10 text-white/40">
                    <th className="px-5 py-3.5 font-normal">ef</th>
                    <th className="px-5 py-3.5 font-normal">NuclaDB recall@10</th>
                    <th className="px-5 py-3.5 font-normal">Qdrant recall@10</th>
                    <th className="px-5 py-3.5 font-normal">NuclaDB QPS</th>
                    <th className="px-5 py-3.5 font-normal">Qdrant QPS</th>
                    <th className="px-5 py-3.5 font-normal">NuclaDB RSS</th>
                  </tr>
                </thead>
                <tbody>
                  {EF_ROWS.map((row) => (
                    <tr key={row.ef} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-3 text-white/70">{row.ef}</td>
                      <td className="px-5 py-3 text-glow-cyan">{row.nRecall}</td>
                      <td className="px-5 py-3 text-white/50">{row.qRecall}</td>
                      <td className="px-5 py-3 text-glow-cyan">{row.nQps}</td>
                      <td className="px-5 py-3 text-white/50">{row.qQps}</td>
                      <td className="px-5 py-3 text-white/50">{row.nRss}</td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-2xl bg-gradient-to-l from-navy-950 to-transparent md:hidden" />
            </div>
          </details>
        </Reveal>

        <Reveal delay={0.2} className="mt-10">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-glow-violet/[0.08] to-transparent p-7">
            <p className="text-[0.9rem] leading-relaxed text-white/70">
              <span className="font-semibold text-white">The benchmark caught a real bug in itself.</span>{" "}
              Qdrant&rsquo;s default <code className="font-mono-ui text-glow-amber">full_scan_threshold</code> (10,000 KB)
              sits above this dataset&rsquo;s raw size (~5,120 KB): an out-of-the-box run would
              have silently compared HNSW against exact search, not HNSW against HNSW.
              Caught by noticing suspiciously perfect recall at every ef, then fixed by
              forcing the threshold down.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
