import { Database, GitBranch, Layers, Lock, Radio, ShieldCheck } from "lucide-react";
import { Reveal } from "./reveal";

const FEATURES = [
  {
    icon: GitBranch,
    title: "HNSW, from scratch",
    plain: "The graph structure that makes nearest-neighbour search fast.",
    body: "The Malkov & Yashunin graph, RW-locked for correctness and verified under go test -race.",
  },
  {
    icon: Layers,
    title: "Product quantization",
    plain: "Compresses vectors so the index fits in far less memory.",
    body: "k-means++ codebooks per subspace with asymmetric distance, so the query vector itself is never quantized.",
  },
  {
    icon: ShieldCheck,
    title: "Crash-safe WAL",
    plain: "No acknowledged write is lost, even on a power cut.",
    body: "Every write fsync'd before ack. CRC32-checksummed binary records make replay torn-write-safe.",
  },
  {
    icon: Database,
    title: "mmap-backed snapshots",
    plain: "Serve a dataset that's larger than the machine's RAM.",
    body: "Atomic write-and-rename, loaded via mmap so a dataset larger than RAM pages in.",
  },
  {
    icon: Lock,
    title: "Real multi-tenancy",
    plain: "Many isolated tenants share one server safely.",
    body: "Isolated graph, WAL, and snapshot per tenant, with its own storage quota and QPS limit.",
  },
  {
    icon: Radio,
    title: "Raft-coordinated cluster",
    plain: "Spread search across several machines.",
    body: "Consistent-hash sharding, scatter-gather search, async WAL replication with health-checked failover.",
  },
];

export function ProductSection() {
  return (
    <section className="relative bg-cream py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="kicker mb-5">Product · Architecture</p>
          <h2 className="max-w-2xl text-[2rem] leading-tight font-semibold tracking-tight text-ink sm:text-[2.4rem]">
            Most vector databases on GitHub{" "}
            <span className="font-serif-display italic font-normal">wrap</span> an
            existing engine.
          </h2>
          <p className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-ink-soft">
            NuclaDB <em>is</em> the engine. The interesting work is in this repo,
            not imported from one.
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
                <p className="mt-2 text-[0.9rem] leading-relaxed text-ink">{f.plain}</p>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-faint">{f.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
