import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroField } from "./hero-field";
import { TerminalBlock } from "./terminal-block";
import { INSTALL_CMD } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-navy-950 pt-28 pb-16">
      <HeroField />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6">
        <p className="kicker kicker--on-dark mb-5">Vector search engine · written from scratch in Go</p>
        <h1 className="max-w-3xl text-[2.6rem] leading-[1.08] font-semibold tracking-tight text-white sm:text-6xl">
          Not a wrapper around Qdrant.
          <br />
          <span className="font-serif-display italic font-normal text-glow-cyan">
            The thing Qdrant is made of.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-white/60">
          HNSW indexing, product quantization, a crash-safe WAL, mmap snapshots,
          multi-tenancy, and a Raft-coordinated distributed cluster: implemented
          and tested directly, then benchmarked head-to-head against a real Qdrant
          instance. Including where NuclaDB loses.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/docs"
            className="group flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[0.85rem] font-medium text-navy-950 transition-transform hover:-translate-y-0.5"
          >
            Read the docs
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#benchmarks"
            className="rounded-full border border-white/15 px-5 py-3 text-[0.85rem] font-medium text-white/85 transition-colors hover:border-white/35 hover:text-white"
          >
            See the benchmarks
          </a>
        </div>

        <div className="mt-12 max-w-xl">
          <TerminalBlock
            title="quickstart"
            copyText={`${INSTALL_CMD}\nnucladb-cli quickstart`}
            lines={[
              { text: "$ curl -fsSL .../install.sh | sh" },
              { text: "$ nucladb-cli quickstart", muted: false },
              { text: "  spinning up a throwaway local server…", muted: true },
              { text: "  inserted 3 vectors, searched top-3 in 0.4ms", muted: true },
              { text: "  → keep using it: NUCLADB_ADDR=127.0.0.1:53211", muted: true },
            ]}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-10 flex items-center gap-2 text-white/30">
        <span className="font-mono-ui text-[0.68rem] uppercase tracking-[0.2em]">Scroll</span>
        <span className="h-8 w-px animate-pulse bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
