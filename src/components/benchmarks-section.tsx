"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal } from "./reveal";

const EF_ROWS = [
  { ef: 10, nRecall: "0.932", qRecall: "0.959", nQps: 13914, qQps: 7624, nLat: "0.07 / 0.09", qLat: "0.13 / 0.17", nRss: "45.8 MB", qRss: "116.1 MB" },
  { ef: 20, nRecall: "0.981", qRecall: "0.989", nQps: 13966, qQps: 7451, nLat: "0.07 / 0.09", qLat: "0.13 / 0.15", nRss: "45.8 MB", qRss: "116.2 MB" },
  { ef: 50, nRecall: "0.996", qRecall: "0.998", nQps: 10653, qQps: 7051, nLat: "0.09 / 0.11", qLat: "0.14 / 0.16", nRss: "45.9 MB", qRss: "116.3 MB" },
  { ef: 100, nRecall: "0.998", qRecall: "1.000", nQps: 7542, qQps: 6465, nLat: "0.13 / 0.16", qLat: "0.15 / 0.17", nRss: "45.9 MB", qRss: "116.5 MB" },
  { ef: 200, nRecall: "1.000", qRecall: "1.000", nQps: 5822, qQps: 5512, nLat: "0.17 / 0.21", qLat: "0.18 / 0.22", nRss: "45.9 MB", qRss: "116.6 MB" },
];

const MAX_QPS = Math.max(...EF_ROWS.flatMap((r) => [r.nQps, r.qQps]));

function Bar({ pct, delay, className }: { pct: number; delay: number; className: string }) {
  return (
    <div className="h-2 flex-1 rounded-full bg-white/5">
      <motion.div
        className={`h-2 rounded-full ${className}`}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

export function BenchmarksSection() {
  return (
    <section id="benchmarks" className="relative bg-navy-950 py-28 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="kicker kicker--on-dark mb-4">Benchmarks · Real numbers</p>
          <h2 className="max-w-2xl text-[2rem] leading-tight font-semibold tracking-tight sm:text-[2.4rem]">
            We measured our own weaknesses too.
          </h2>
          <p className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-white/60">
            A committed head-to-head against a real Qdrant binary. SIFT-small,
            10K vectors, measured over each system&rsquo;s network API.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Reveal className="min-w-0 lg:col-span-1">
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <p className="kicker kicker--on-dark mb-4">Build time</p>
              <p className="font-mono-ui text-5xl font-medium text-glow-amber">416ms</p>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-white/60">
                to build 10K vectors vs Qdrant&rsquo;s 557ms, with every batch fsync&rsquo;d before ack.
                Down from 43.9s with one fsync per vector.
                <Link href="/docs/design-decisions/wal-then-snapshot" className="ml-1 underline decoration-white/30 underline-offset-2 hover:text-white">
                  Why →
                </Link>
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.06} className="min-w-0 lg:col-span-1">
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <p className="kicker kicker--on-dark mb-4">Memory, at every ef</p>
              <p className="font-mono-ui text-5xl font-medium text-glow-cyan">&lt;½×</p>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-white/60">
                RSS stays under half of Qdrant&rsquo;s at every efSearch tested
                (about 46 MB vs 116 MB).
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="min-w-0 lg:col-span-1">
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <p className="kicker kicker--on-dark mb-4">Product quantization</p>
              <p className="font-mono-ui text-5xl font-medium text-glow-violet">57.7%</p>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-white/60">
                recall@10 at 16× compression for flat PQ; 99.3% when the top 100 are re-ranked.
                A tested library, not yet used by the server.
                <Link href="/docs/design-decisions/product-quantization-cost" className="ml-1 underline decoration-white/30 underline-offset-2 hover:text-white">
                  Why →
                </Link>
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-16">
          <p className="kicker kicker--on-dark mb-6">Queries per second, by efSearch</p>
          <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            {EF_ROWS.map((row, i) => {
              const nPct = (row.nQps / MAX_QPS) * 100;
              const qPct = (row.qQps / MAX_QPS) * 100;
              const rowDelay = i * 0.08;
              return (
                <motion.div
                  key={row.ef}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: rowDelay }}
                >
                  <span className="w-12 shrink-0 font-mono-ui text-[0.78rem] text-white/40">ef {row.ef}</span>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-16 shrink-0 font-mono-ui text-[0.7rem] uppercase tracking-wider text-white/40">
                        NuclaDB
                      </span>
                      <Bar pct={nPct} delay={rowDelay + 0.1} className="bg-glow-cyan" />
                      <span className="w-16 shrink-0 text-right font-mono-ui text-[0.78rem] text-glow-cyan">
                        {row.nQps}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-16 shrink-0 font-mono-ui text-[0.7rem] uppercase tracking-wider text-white/40">
                        Qdrant
                      </span>
                      <Bar pct={qPct} delay={rowDelay + 0.18} className="bg-white/35" />
                      <span className="w-16 shrink-0 text-right font-mono-ui text-[0.78rem] text-white/50">
                        {row.qQps}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <p className="mt-4 text-[0.82rem] text-white/40">
            NuclaDB has higher QPS at every ef: 13914 vs 7624 at ef=10. Qdrant&rsquo;s recall is a
            little higher at low ef (0.959 vs 0.932 at ef=10). Median of 5 passes after a warm-up.
          </p>

          <details className="group mt-4">
            <summary className="cursor-pointer font-mono-ui text-[0.78rem] text-white/40 transition-colors hover:text-white/70">
              View full data table (recall@10, latency, RSS) &darr;
            </summary>
            <div className="relative mt-4">
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
                <table className="w-full min-w-[880px] text-left font-mono-ui text-[0.82rem]">
                <thead>
                  <tr className="border-b border-white/10 text-white/40">
                    <th className="px-5 py-3.5 font-normal">ef</th>
                    <th className="px-5 py-3.5 font-normal">NuclaDB recall@10</th>
                    <th className="px-5 py-3.5 font-normal">Qdrant recall@10</th>
                    <th className="px-5 py-3.5 font-normal">NuclaDB QPS</th>
                    <th className="px-5 py-3.5 font-normal">Qdrant QPS</th>
                    <th className="px-5 py-3.5 font-normal">NuclaDB p50 / p95 ms</th>
                    <th className="px-5 py-3.5 font-normal">Qdrant p50 / p95 ms</th>
                    <th className="px-5 py-3.5 font-normal">NuclaDB RSS</th>
                    <th className="px-5 py-3.5 font-normal">Qdrant RSS</th>
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
                      <td className="px-5 py-3 text-glow-cyan">{row.nLat}</td>
                      <td className="px-5 py-3 text-white/50">{row.qLat}</td>
                      <td className="px-5 py-3 text-white/50">{row.nRss}</td>
                      <td className="px-5 py-3 text-white/50">{row.qRss}</td>
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
              <span className="font-semibold text-white">The benchmark caught two bugs in itself.</span>{" "}
              Qdrant&rsquo;s default <code className="font-mono-ui text-glow-amber">full_scan_threshold</code> sits
              above this dataset&rsquo;s size, so an out-of-the-box run compares HNSW against exact
              search. Its <code className="font-mono-ui text-glow-amber">indexing_threshold</code> did the same
              to build time: the old 124ms Qdrant build never built an index. Both are now forced.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
