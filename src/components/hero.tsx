import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroDots } from "./hero-dots";
import { TerminalBlock } from "./terminal-block";
import { INSTALL_CMD } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-navy-950 pt-28 pb-16">
      <div className="absolute inset-0 overflow-hidden bg-black" aria-hidden="true">
        <HeroDots />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent lg:via-black/35" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6">
        <p className="kicker kicker--on-dark mb-5">
          Open-source vector database · written from scratch in Go
        </p>
        <h1 className="max-w-2xl text-[2.9rem] leading-[1.04] font-semibold tracking-tight text-white sm:text-[4.25rem]">
          Search by meaning,
          <br />
          <span className="font-serif-display italic font-normal text-glow-cyan">
            built from the index up.
          </span>
        </h1>
        <p className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-white/70">
          A vector database finds the closest matches to an embedding, which is
          what powers semantic search and RAG. Most wrap an existing engine;
          NuclaDB is the engine.
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

        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-white/10 pt-6 font-mono-ui text-[0.78rem] text-white/40">
          <span>
            <span className="text-white/80">46 MB</span> for 10K vectors
          </span>
          <span>
            <span className="text-white/80">13,900</span> searches/sec
          </span>
          <span>
            <span className="text-white/80">zero</span> vendored engines
          </span>
        </div>

        <div className="mt-10 max-w-xl">
          <TerminalBlock
            title="quickstart"
            copyText={`${INSTALL_CMD}\nnucladb-cli quickstart`}
            lines={[
              { text: "$ curl -fsSL .../install.sh | sh" },
              { text: "$ nucladb-cli quickstart", muted: false },
              { text: "  Starting a throwaway nucladbd (dim=4, metric=l2) ...", muted: true },
              { text: "  $ nucladb-cli search -vector=1,0,0,0 -top-k=2", muted: true },
              { text: "  export NUCLADB_ADDR=127.0.0.1:53211", muted: true },
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
