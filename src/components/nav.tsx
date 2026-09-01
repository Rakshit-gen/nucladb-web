"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { GithubIcon } from "./icons";
import { REPO_URL } from "@/lib/site";

const LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/#playground", label: "Playground" },
  { href: "/#benchmarks", label: "Benchmarks" },
  { href: "/#architecture", label: "Architecture" },
];

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2 text-[0.95rem] font-semibold tracking-tight text-white">
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
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-navy-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-7 font-mono-ui text-[0.78rem] uppercase tracking-wider text-white/60 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 rounded-full bg-white/95 px-4 py-2 font-mono-ui text-[0.72rem] uppercase tracking-wider text-navy-950 transition-transform hover:-translate-y-0.5 hover:bg-white sm:flex"
          >
            View source
            <ArrowUpRight size={13} />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/30 hover:text-white md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/[0.06] bg-navy-950/95 px-6 py-4 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 font-mono-ui text-[0.85rem] uppercase tracking-wider text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-3 font-mono-ui text-[0.85rem] uppercase tracking-wider text-white/70 transition-colors hover:bg-white/5 hover:text-white sm:hidden"
            >
              <GithubIcon size={14} />
              View source
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
