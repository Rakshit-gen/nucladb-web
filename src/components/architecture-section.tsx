import { Reveal } from "./reveal";

const STAGES = [
  {
    label: "Client",
    title: "gRPC :9090 · REST :8080",
    body: "REST is a hand-written JSON translation layer over the gRPC service, not grpc-gateway, since vendoring the full googleapis proto tree isn't worth it for five routes.",
    code: "internal/api/grpc · internal/api/gateway",
  },
  {
    label: "Routing",
    title: "engine.Store",
    body: "Tenant routing, storage quotas, and QPS rate limits are enforced here, before a request ever reaches an engine. One Engine is opened lazily per tenant, on first access.",
    code: "internal/engine.Store",
  },
  {
    label: "Write path",
    title: "WAL → HNSW graph → PQ (optional)",
    body: "Every write is fsync'd to the write-ahead log before it's acknowledged, then applied to the in-memory HNSW graph. Product quantization compresses vectors after that, if enabled.",
    code: "internal/storage/wal · internal/index/hnsw · internal/index/pq",
  },
  {
    label: "Durability",
    title: "mmap-backed snapshot",
    body: "Periodic atomic snapshots (write-to-temp, rename-into-place) let a restart skip replaying the WAL from empty, and let a dataset larger than RAM page in via the OS instead of failing.",
    code: "internal/storage/segment",
  },
];

export function ArchitectureSection() {
  return (
    <section id="architecture" className="relative bg-cream-deep py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="kicker mb-4">Architecture</p>
          <h2 className="max-w-2xl text-[2rem] leading-tight font-semibold tracking-tight text-ink sm:text-[2.4rem]">
            One request, four layers.
          </h2>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft">
            Every stage below is a real package in the repo, linked to its source.
          </p>
        </Reveal>

        <div className="relative mt-16 grid gap-0">
          {STAGES.map((stage, i) => (
            <Reveal key={stage.title} delay={i * 0.08}>
              <div className="relative flex gap-6 pb-10 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-navy-600 bg-navy-900 font-mono-ui text-[0.72rem] text-glow-cyan">
                    {i + 1}
                  </span>
                  {i < STAGES.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-gradient-to-b from-navy-600 to-navy-600/20" />
                  )}
                </div>
                <div className="flex-1 rounded-2xl border border-cream-line bg-white/60 p-6">
                  <p className="kicker mb-2 !text-ink-faint">{stage.label}</p>
                  <h3 className="text-[1.05rem] font-semibold text-ink">{stage.title}</h3>
                  <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-ink-soft">
                    {stage.body}
                  </p>
                  <p className="mt-3 font-mono-ui text-[0.74rem] text-ink-faint">{stage.code}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
