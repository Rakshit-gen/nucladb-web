import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroAscii } from "./hero-ascii";
import { HeroSearchDemo } from "./hero-search-demo";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-navy-950 pt-36 pb-16">
      <div className="pointer-events-none absolute inset-0 bg-navy-950" aria-hidden="true" />
      <HeroAscii />


      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-12 px-6">
        <div className="flex min-w-0 flex-col items-center text-center">
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

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
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

        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-white/10 pt-6 font-mono-ui text-[0.78rem] text-white/40">
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

        </div>
        <div className="w-full max-w-2xl"><HeroSearchDemo /></div>
      </div>

      <div className="relative z-10 mx-auto mt-10 flex items-center gap-2 text-white/30">
        <span className="font-mono-ui text-[0.68rem] uppercase tracking-[0.2em]">Scroll</span>
        <span className="h-8 w-px bg-white/30" />
      </div>
    </section>
  );
}
