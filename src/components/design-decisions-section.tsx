import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./reveal";

const WRITEUPS = [
  {
    n: "01",
    slug: "wal-then-snapshot",
    title: "Why WAL-then-snapshot, and what it costs",
    body: "Every insert fsyncs before returning (~4.4ms each): the direct cause of the ~350x build-time gap vs. Qdrant.",
  },
  {
    n: "02",
    slug: "hnsw-ef-tuning",
    title: "Tuning HNSW: what the recall/latency curve looks like",
    body: "Recall saturates by ef=50 (0.997); ef=200 buys +0.3% recall for over 2x the latency.",
  },
  {
    n: "03",
    slug: "product-quantization-cost",
    title: "What product quantization cost",
    body: "57.7% recall@10 at 16x compression, capped by no re-ranking and no IVF: named as follow-up, not hidden.",
  },
  {
    n: "04",
    slug: "what-raft-gave-and-cost",
    title: "What Raft gave the system, and what it cost",
    body: "Raft agrees on shard topology through faults, but async replication means cross-failover linearizability isn't guaranteed: checked with Jepsen-style testing.",
  },
];

export function DesignDecisionsSection() {
  return (
    <section className="relative bg-cream py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="kicker mb-5">Engineering notes</p>
          <h2 className="max-w-2xl text-[2rem] leading-tight font-semibold tracking-tight text-ink sm:text-[2.4rem]">
            Every design decision, with its{" "}
            <span className="font-serif-display italic font-normal">measured</span> cost.
          </h2>
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft">
            Four write-ups on tradeoffs we made and what they actually cost,
            measured rather than assumed.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {WRITEUPS.map((w, i) => (
            <Reveal key={w.slug} delay={i * 0.06}>
              <Link
                href={`/docs/design-decisions/${w.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-cream-line bg-white/50 p-8 transition-colors hover:bg-white/90"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono-ui text-[0.78rem] text-ink-faint">{w.n}</span>
                  <ArrowUpRight
                    size={16}
                    className="text-ink-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  />
                </div>
                <h3 className="mt-4 text-[1.08rem] font-semibold leading-snug text-ink">{w.title}</h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft">{w.body}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
