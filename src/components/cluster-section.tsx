import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

const LAYERS = [
  { name: "raft", body: "Wraps hashicorp/raft to govern cluster metadata only: which nodes exist, which node leads each shard. Never touches a vector write directly." },
  { name: "ring", body: "Consistent hashing over a fixed shard count chosen at cluster creation, so shard identity, and therefore replication, is never a moving target." },
  { name: "router", body: "Insert/Delete hash a vector id (FNV-1a) to one shard. Search fans out to every shard concurrently and merges each shard's top-K into one ranked result." },
  { name: "replication", body: "A shard leader streams its WAL to followers over plain TCP, deliberately outside Raft, for write latency, with automatic full-snapshot catch-up." },
  { name: "health", body: "Only the current Raft leader probes liveness. Fast per-shard failover after a few missed probes; full eviction and rebalance after more." },
];

export function ClusterSection() {
  return (
    <section className="relative bg-cream-deep py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <p className="kicker mb-4">Distributed · Phase 2</p>
            <h2 className="text-[2rem] leading-tight font-semibold tracking-tight text-ink sm:text-[2.4rem]">
              A real cluster sits on top,{" "}
              <span className="font-serif-display italic font-normal">benchmarked honestly.</span>
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-ink-soft">
              Raft governs topology, never the write path itself, since running
              every vector write through consensus would be correct but
              dramatically slower. Replication is deliberately async, which buys
              latency at the cost of a real, measured failover window where an
              acknowledged write can be lost. Checked with Jepsen-style testing
              using the real{" "}
              <code className="font-mono-ui text-[0.85em]">porcupine</code> checker,
              not just asserted.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
              <div>
                <p className="font-mono-ui text-2xl font-medium text-ink">4</p>
                <p className="mt-1 text-[0.78rem] text-ink-faint">shards benchmarked</p>
              </div>
              <div>
                <p className="font-mono-ui text-2xl font-medium text-ink">22&ndash;42%</p>
                <p className="mt-1 text-[0.78rem] text-ink-faint">QPS cost vs. single-node</p>
              </div>
              <div>
                <p className="font-mono-ui text-2xl font-medium text-ink">0.963</p>
                <p className="mt-1 text-[0.78rem] text-ink-faint">recall@10, ef=10, 4-shard</p>
              </div>
              <div>
                <p className="font-mono-ui text-2xl font-medium text-ink">async</p>
                <p className="mt-1 text-[0.78rem] text-ink-faint">WAL-stream replication</p>
              </div>
            </div>

            <Link
              href="/docs/distributed"
              className="mt-8 inline-flex items-center gap-2 text-[0.9rem] font-medium text-ink transition-colors hover:text-glow-violet"
            >
              Read the distributed-cluster docs
              <ArrowRight size={15} />
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-cream-line bg-white/50 p-2">
              {LAYERS.map((l, i) => (
                <div
                  key={l.name}
                  className={`flex gap-4 p-5 ${i < LAYERS.length - 1 ? "border-b border-cream-line" : ""}`}
                >
                  <span className="font-mono-ui text-[0.8rem] text-glow-violet">/{l.name}</span>
                  <p className="text-[0.86rem] leading-relaxed text-ink-soft">{l.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
