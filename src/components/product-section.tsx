import { Database, GitBranch, Layers, Lock, Radio, ShieldCheck } from "lucide-react";
import { Reveal } from "./reveal";

const FEATURES = [
  {
    icon: GitBranch,
    title: "HNSW, from scratch",
    body: "Malkov & Yashunin's Hierarchical Navigable Small World graph, coarse-grained RW-locked for correctness and verified under go test -race.",
  },
  {
    icon: Layers,
    title: "Product quantization",
    body: "Optional lossy compression: k-means++ codebooks per subspace, asymmetric distance computation, so the query vector is never itself quantized.",
  },
  {
    icon: ShieldCheck,
    title: "Crash-safe WAL",
    body: "Every write is fsync'd before it's acknowledged. A custom binary record format with CRC32 checksums makes replay torn-write-safe.",
  },
  {
    icon: Database,
    title: "mmap-backed snapshots",
    body: "Atomic write-to-temp, rename-into-place snapshots, loaded via mmap so a dataset larger than RAM pages in instead of failing to start.",
  },
  {
    icon: Lock,
    title: "Real multi-tenancy",
    body: "Every tenant gets an isolated graph, WAL, and snapshot on disk, plus an independent storage quota and QPS rate limit enforced before the engine.",
  },
  {
    icon: Radio,
    title: "Raft-coordinated cluster",
    body: "Consistent-hash sharding, scatter-gather search routing, and async WAL-stream replication with automatic health-checked failover.",
  },
];

export function ProductSection() {
  return (
    <section className="relative bg-cream py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="kicker mb-5">Product · Architecture</p>
          <h2 className="max-w-2xl text-[2rem] leading-tight font-semibold tracking-tight text-ink sm:text-[2.4rem]">
            Most vector databases you see on GitHub{" "}
            <span className="font-serif-display italic font-normal">wrap</span> an
            existing engine.
          </h2>
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft">
            NuclaDB goes the other direction. It <em>is</em> the internals a
            production vector engine is built from, implemented and tested
            directly, so the interesting engineering is in this repo, not
            imported from one.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <article className="h-full rounded-2xl border border-cream-line bg-white/50 p-7 transition-colors hover:bg-white/90">
                <span className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-glow-cyan">
                  <f.icon size={17} strokeWidth={1.6} />
                </span>
                <h3 className="text-[0.98rem] font-semibold text-ink">{f.title}</h3>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-soft">{f.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
