import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "./icons";
import { REPO_URL } from "@/lib/site";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-[0.95rem] font-semibold tracking-tight text-white">
      <span className="relative flex h-6 w-6 items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <circle cx="6" cy="6" r="2.4" fill="#7fe3d4" />
          <circle cx="18" cy="7" r="1.7" fill="#a78bfa" />
          <circle cx="17" cy="18" r="2.4" fill="#7fe3d4" />
          <circle cx="6" cy="16" r="1.5" fill="#f2c879" />
          <path d="M6 6 L18 7 M18 7 L17 18 M17 18 L6 16 M6 16 L6 6 M6 6 L17 18" stroke="rgba(244,238,222,0.45)" strokeWidth="0.8" />
        </svg>
      </span>
      NuclaDB
    </Link>
  );
}

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-navy-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-7 font-mono-ui text-[0.78rem] uppercase tracking-wider text-white/60 md:flex">
          <Link href="/docs" className="transition-colors hover:text-white">
            Docs
          </Link>
          <Link href="/#benchmarks" className="transition-colors hover:text-white">
            Benchmarks
          </Link>
          <Link href="/#architecture" className="transition-colors hover:text-white">
            Architecture
          </Link>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-white">
            <GithubIcon size={14} />
            GitHub
          </a>
        </nav>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-full bg-white/95 px-4 py-2 font-mono-ui text-[0.72rem] uppercase tracking-wider text-navy-950 transition-transform hover:-translate-y-0.5 hover:bg-white"
        >
          View source
          <ArrowUpRight size={13} />
        </a>
      </div>
    </header>
  );
}
