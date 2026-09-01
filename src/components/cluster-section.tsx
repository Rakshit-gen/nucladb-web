import Link from "next/link";
import { Activity, ArrowRight, Hash, Network, RefreshCw, Waypoints } from "lucide-react";
import { Reveal } from "./reveal";

const STATS = [
  { value: "4", label: "shards benchmarked" },
  { value: "22–42%", label: "QPS cost vs. single-node" },
  { value: "0.963", label: "recall@10, ef=10, 4-shard" },
  { value: "async", label: "WAL-stream replication" },
];

const LAYERS = [
  { name: "raft", icon: Network, body: "Wraps hashicorp/raft to govern cluster metadata only: which nodes exist, which node leads each shard. Never touches a vector write directly." },
  { name: "ring", icon: Hash, body: "Consistent hashing over a fixed shard count chosen at cluster creation, so shard identity, and therefore replication, is never a moving target." },
  { name: "router", icon: Waypoints, body: "Insert/Delete hash a vector id (FNV-1a) to one shard. Search fans out to every shard concurrently and merges each shard's top-K into one ranked result." },
  { name: "replication", icon: RefreshCw, body: "A shard leader streams its WAL to followers over plain TCP, deliberately outside Raft, for write latency, with automatic full-snapshot catch-up." },
  { name: "health", icon: Activity, body: "Only the current Raft leader probes liveness. Fast per-shard failover after a few missed probes; full eviction and rebalance after more." },
];

export function ClusterSection() {
  return (
    <section className="relative bg-cream-deep py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.1fr_1fr]">
          <Reveal className="min-w-0">
            <p className="kicker mb-5">Distributed · Phase 2</p>
            <h2 className="text-[2rem] leading-tight font-semibold tracking-tight text-ink sm:text-[2.4rem]">
              A real cluster sits on top,{" "}
              <span className="font-serif-display italic font-normal">benchmarked honestly.</span>
            </h2>
            <p className="mt-6 text-[1.02rem] leading-relaxed text-ink-soft">
              Raft governs topology, never the write path itself, since running
              every vector write through consensus would be correct but
              dramatically slower. Replication is deliberately async, which buys
              latency at the cost of a real, measured failover window where an
              acknowledged write can be lost. Checked with Jepsen-style testing
              using the real{" "}
              <code className="font-mono-ui text-[0.85em]">porcupine</code> checker,
              not just asserted.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-xl border border-cream-line bg-white/50 p-4">
                  <p className="font-mono-ui text-xl font-medium text-ink">{s.value}</p>
                  <p className="mt-1.5 text-[0.76rem] leading-snug text-ink-faint">{s.label}</p>
                </div>
              ))}
            </div>

            <Link
              href="/docs/distributed"
              className="mt-8 inline-flex items-center gap-2 text-[0.9rem] font-medium text-ink transition-colors hover:text-glow-violet"
            >
              Read the distributed-cluster docs
              <ArrowRight size={15} />
            </Link>
          </Reveal>

          <Reveal delay={0.1} className="min-w-0">
            <div className="rounded-2xl border border-cream-line bg-white/50 p-2">
              {LAYERS.map((l, i) => (
                <div
                  key={l.name}
                  className={`flex gap-4 p-6 ${i < LAYERS.length - 1 ? "border-b border-cream-line" : ""}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-glow-violet">
                    <l.icon size={16} strokeWidth={1.6} />
                  </span>
                  <div>
                    <p className="font-mono-ui text-[0.8rem] text-glow-violet">/{l.name}</p>
                    <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink-soft">{l.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
