import { SectionHeader } from "./section-header";
import { REPO_URL } from "@/lib/site";

const PARTS = [
  { name: "Fast similarity search", what: "Finds the closest matches without checking every item.", live: true, path: "internal/index/hnsw" },
  { name: "Crash-safe writes", what: "Once it says OK, your data survives a crash or power cut.", live: true, path: "internal/storage/wal" },
  { name: "Quick restarts", what: "Reloads from a saved file instead of starting over.", live: true, path: "internal/storage/segment" },
  { name: "Many apps, one server", what: "Each app gets its own space, key and limits.", live: true, path: "internal/engine" },
  { name: "Works from any language", what: "gRPC, REST, a CLI and a Python client.", live: true, path: "internal/api" },
  { name: "Compression", what: "Stores items in about a sixteenth of the space.", live: false, path: "internal/index/pq" },
  { name: "Multiple machines", what: "Splits one collection across several servers.", live: false, path: "internal/cluster" },
];

export function ProductSection() {
  return (
    <section id="features" className="bg-cream py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader title="What it does">
          <p>Everything is written from scratch in Go. Hover a row to see its source.</p>
        </SectionHeader>

        <ul className="mt-10 border-t border-ink">
          {PARTS.map((p, i) => (
            <li key={p.name}>
              <a
                href={`${REPO_URL}/tree/main/${p.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-b border-ink/15 px-2 py-5 transition-colors duration-200 hover:bg-ink md:grid-cols-[3.5rem_16rem_minmax(0,1fr)_9rem] md:px-4"
              >
                <span className="font-mono-ui text-[0.85rem] text-ink-faint transition-colors group-hover:text-glow-cyan">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[1.15rem] font-medium tracking-[-0.01em] text-ink transition-colors group-hover:text-cream">{p.name}</span>
                <span className="order-4 col-span-2 col-start-2 text-ink-soft transition-colors group-hover:text-cream/70 md:order-none md:col-span-1 md:col-start-auto">
                  {p.what}
                  <span className="mt-1 block font-mono-ui text-[0.78rem] text-glow-cyan opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{p.path} ↗</span>
                </span>
                <span className={`flex items-center gap-2 justify-self-end font-mono-ui text-[0.78rem] ${p.live ? "text-teal group-hover:text-glow-cyan" : "text-rust group-hover:text-glow-amber"}`}>
                  <span className={`h-2 w-2 rounded-full ${p.live ? "bg-current" : "border border-current"}`} />
                  {p.live ? "in the server" : "coming next"}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
