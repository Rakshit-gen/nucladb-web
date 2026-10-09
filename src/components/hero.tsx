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
        <div className="relative flex min-w-0 flex-col items-center text-center">
        {/* Quiets the ASCII field behind the copy only; the edges of the hero keep it at full strength. */}
        <div
          className="pointer-events-none absolute -inset-x-28 -inset-y-24 -z-10 bg-[radial-gradient(closest-side,var(--navy-950)_72%,transparent)] opacity-95"
          aria-hidden="true"
        />
        <h1 className="max-w-3xl text-[clamp(2.5rem,5vw,4rem)] leading-[1.12] font-medium tracking-[-0.045em] text-white [text-shadow:0_2px_18px_var(--navy-950)]">
          <span className="inline-block whitespace-nowrap"><span className="hero-word hero-word-first inline-block">Search</span>{" "}<span className="hero-word hero-word-second inline-block">by</span></span>{" "}
          <span className="hero-word hero-word-third inline-block text-glow-cyan">meaning.</span>
        </h1>
        <p className="hero-copy-enter hero-copy-late mt-5 max-w-lg text-balance text-[0.95rem] leading-[1.8] text-white/90 [text-shadow:0_1px_10px_var(--navy-950)] sm:text-base">
          An open-source vector database, written in Go.
          <br className="hidden sm:block" />{" "}
          Store embeddings. Find the closest matches. Run it yourself.
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
            className="rounded-full border border-white/30 bg-navy-950/70 px-5 py-3 text-[0.85rem] font-medium text-white transition-colors hover:border-white/60"
          >
            See the benchmarks
          </a>
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-white/15 pt-6 font-mono-ui text-[0.78rem] text-white/65 [text-shadow:0_1px_8px_var(--navy-950)]">
          <span>
            <span className="text-white">46 MB</span> for 10K vectors
          </span>
          <span>
            <span className="text-white">13,900</span> searches/sec
          </span>
          <span>
            <span className="text-white">zero</span> vendored engines
          </span>
        </div>

        </div>
        <div className="w-full max-w-2xl"><HeroSearchDemo /></div>
      </div>

    </section>
  );
}
