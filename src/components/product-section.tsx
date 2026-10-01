import { ArrowUpRight, Database, GitBranch, Layers, Lock, Radio, ShieldCheck } from "lucide-react";
import { Reveal } from "./reveal";
import { REPO_URL } from "@/lib/site";

type Status = "server" | "library";

const FEATURES: {
  icon: typeof GitBranch;
  title: string;
  plain: string;
  body: string;
  status: Status;
  path: string;
}[] = [
  {
    icon: GitBranch,
    title: "HNSW, from scratch",
    plain: "The graph structure that makes nearest-neighbour search fast.",
    body: "The Malkov & Yashunin graph, RW-locked for correctness and verified under go test -race.",
    status: "server",
    path: "internal/index/hnsw",
  },
  {
    icon: ShieldCheck,
    title: "Crash-safe WAL",
    plain: "No acknowledged write is lost, even on a power cut.",
    body: "Every write fsync'd before ack, with group commit sharing one fsync across a batch. CRC32-checksummed records make replay torn-write-safe.",
    status: "server",
    path: "internal/storage/wal",
  },
  {
    icon: Database,
    title: "mmap-backed snapshots",
    plain: "Serve a dataset that's larger than the machine's RAM.",
    body: "Atomic write-and-rename, loaded via mmap so a dataset larger than RAM pages in.",
    status: "server",
    path: "internal/storage/segment",
  },
  {
    icon: Lock,
    title: "Real multi-tenancy",
    plain: "Many isolated tenants share one server safely.",
    body: "Isolated graph, WAL, and snapshot per tenant, with its own dimension, metric, quota and QPS limit, plus API keys scoped to tenants.",
    status: "server",
    path: "internal/engine",
  },
  {
    icon: Layers,
    title: "Product quantization",
    plain: "Compresses vectors so the index fits in far less memory.",
    body: "k-means++ codebooks with asymmetric distance, optional re-ranking and IVF.",
    status: "library",
    path: "internal/index/pq",
  },
  {
    icon: Radio,
    title: "Raft-coordinated cluster",
    plain: "Spread search across several machines.",
    body: "Consistent-hash sharding, scatter-gather search, async WAL replication with health-checked failover.",
    status: "library",
    path: "internal/cluster",
  },
];

function StatusBadge({ status }: { status: Status }) {
  return status === "server" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700/10 px-2.5 py-1 font-mono-ui text-[0.66rem] uppercase tracking-wider text-emerald-800">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
      In the server
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-600/10 px-2.5 py-1 font-mono-ui text-[0.66rem] uppercase tracking-wider text-amber-800">
      <span className="h-1.5 w-1.5 rounded-full border border-amber-600" />
      Tested library
    </span>
  );
}

export function ProductSection() {
  return (
    <section id="features" className="relative bg-cream py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <Reveal>
            <p className="kicker mb-5">Features · What&rsquo;s inside</p>
            <h2 className="max-w-2xl text-[2rem] leading-tight font-semibold tracking-tight text-ink sm:text-[2.4rem]">
              Most vector databases on GitHub{" "}
              <span className="font-serif-display italic font-normal">wrap</span> an
              existing engine.
            </h2>
            <p className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-ink-soft">
              NuclaDB <em>is</em> the engine. Each part below is its own package in the
              repo, and each one says plainly whether the server uses it today.
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
              <StatusBadge status="server" />
              <StatusBadge status="library" />
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05} className="h-full">
              <article className="group flex h-full flex-col rounded-2xl border border-cream-line bg-white/55 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-ink/15 hover:bg-white hover:shadow-[0_18px_40px_-24px_rgba(26,33,56,0.35)]">
                <div className="mb-6 flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-glow-cyan transition-transform duration-300 group-hover:scale-105">
                    <f.icon size={18} strokeWidth={1.6} />
                  </span>
                  <StatusBadge status={f.status} />
                </div>
                <h3 className="text-[1.02rem] font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-ink">{f.plain}</p>
                <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-faint">{f.body}</p>
                <a
                  href={`${REPO_URL}/tree/main/${f.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1 pt-6 font-mono-ui text-[0.74rem] text-ink-faint transition-colors hover:text-ink"
                >
                  {f.path}
                  <ArrowUpRight size={12} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
