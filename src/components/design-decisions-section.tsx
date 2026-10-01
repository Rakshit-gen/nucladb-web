import Link from "next/link";
import { SectionHeader } from "./section-header";

const WRITEUPS = [
  {
    slug: "wal-then-snapshot",
    title: "Why WAL-then-snapshot, and what it costs",
  },
  {
    slug: "hnsw-ef-tuning",
    title: "Tuning HNSW: what the recall/latency curve looks like",
  },
  {
    slug: "product-quantization-cost",
    title: "What product quantization cost",
  },
  {
    slug: "what-raft-gave-and-cost",
    title: "What Raft gave the system, and what it cost",
  },
];

export function DesignDecisionsSection() {
  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader title="How it was built">
          <p>Short write-ups on the choices that mattered.</p>
        </SectionHeader>

        <ol className="mt-10 border-t border-ink">
          {WRITEUPS.map((w) => (
            <li key={w.slug} className="border-b border-ink/15">
              <Link
                href={`/docs/design-decisions/${w.slug}`}
                className="group flex items-baseline justify-between gap-6 px-2 py-6 transition-colors duration-200 hover:bg-ink md:px-4"
              >
                <h3 className="text-[1.15rem] font-medium text-ink transition-colors group-hover:text-cream">
                  {w.title}
                </h3>
                <span aria-hidden="true" className="text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-glow-cyan">→</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
