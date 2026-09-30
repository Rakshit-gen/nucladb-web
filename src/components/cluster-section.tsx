import Link from "next/link";
import { Activity, ArrowRight, Hash, Network, RefreshCw, Waypoints } from "lucide-react";
import { Reveal } from "./reveal";

const STATS = [
  { value: "4", label: "shards benchmarked" },
  { value: "38–45%", label: "QPS cost vs. single-node" },
  { value: "0.978", label: "recall@10, ef=10, 4-shard" },
  { value: "async", label: "WAL-stream replication" },
];

const LAYERS = [
  { name: "raft", icon: Network, body: "Wraps hashicorp/raft for cluster metadata only: which nodes exist, which leads each shard. Timeouts are configurable." },
  { name: "ring", icon: Hash, body: "Consistent hashing over a fixed shard count, so shard identity is never a moving target." },
  { name: "router", icon: Waypoints, body: "Writes hash to one shard; search fans out to all shards, retries a failed shard once, and returns partial results if some still fail." },
  { name: "replication", icon: RefreshCw, body: "Shard leader streams its WAL to followers outside Raft, catches diverged followers by checksum, and wakes on each write." },
  { name: "health", icon: Activity, body: "The Raft leader probes all nodes in parallel, fails over to the most caught-up replica, then evicts and rebalances." },
];

export function ClusterSection() {
  return (
    <section className="relative bg-cream-deep py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.1fr_1fr]">
          <Reveal className="min-w-0">
            <p className="kicker mb-5">Distributed · Library, not yet a server mode</p>
            <h2 className="text-[2rem] leading-tight font-semibold tracking-tight text-ink sm:text-[2.4rem]">
              A real cluster sits on top,{" "}
              <span className="font-serif-display italic font-normal">benchmarked honestly.</span>
            </h2>
            <p className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-ink-soft">
              Raft governs topology, never the write path. Replication is async,
              which is faster but opens a measured failover window where an
              acknowledged write can be lost. We checked that with{" "}
              <code className="font-mono-ui text-[0.85em]">porcupine</code> rather than assuming it.
              These packages are tested end to end, but <code className="font-mono-ui text-[0.85em]">nucladbd</code>{" "}
              doesn&rsquo;t run as a cluster yet.
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
