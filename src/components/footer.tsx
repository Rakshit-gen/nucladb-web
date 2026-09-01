import Link from "next/link";
import { REPO_URL } from "@/lib/site";

const COLUMNS = [
  {
    heading: "Docs",
    links: [
      { label: "Quickstart", href: "/docs/quickstart" },
      { label: "Architecture", href: "/docs/architecture" },
      { label: "API reference", href: "/docs/api" },
      { label: "CLI reference", href: "/docs/cli" },
    ],
  },
  {
    heading: "Engineering notes",
    links: [
      { label: "WAL then snapshot", href: "/docs/design-decisions/wal-then-snapshot" },
      { label: "HNSW ef tuning", href: "/docs/design-decisions/hnsw-ef-tuning" },
      { label: "Product quantization cost", href: "/docs/design-decisions/product-quantization-cost" },
      { label: "What Raft gave and cost", href: "/docs/design-decisions/what-raft-gave-and-cost" },
    ],
  },
  {
    heading: "Project",
    links: [
      { label: "GitHub", href: REPO_URL },
      { label: "Distributed cluster", href: "/docs/distributed" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-navy-950 py-16 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[0.95rem] font-semibold text-white">NuclaDB</p>
            <p className="mt-3 text-[0.82rem] leading-relaxed text-white/45">
              A vector search engine, built from scratch in Go and benchmarked
              honestly.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="font-mono-ui text-[0.72rem] uppercase tracking-wider text-white/40">
                {col.heading}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[0.85rem] text-white/65 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-[0.78rem] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>Built by Rakshit Sisodiya.</p>
          <p className="font-mono-ui">go test ./... -race</p>
        </div>
      </div>
    </footer>
  );
}
