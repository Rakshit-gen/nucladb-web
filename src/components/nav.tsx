"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { GithubIcon } from "./icons";
import { REPO_URL } from "@/lib/site";

const LINKS = [
  { href: "/#playground", label: "Playground" },
  { href: "/#features", label: "Features" },
  { href: "/#architecture", label: "Architecture" },
  { href: "/#benchmarks", label: "Benchmarks" },
  { href: "/docs", label: "Docs" },
];

// Tracks which landing-page section is in the middle of the screen, so the
// nav can mark it, and whether the page has scrolled past the top.
function useScrollState() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const sections = LINKS.flatMap((l) => {
      const el = l.href.startsWith("/#") ? document.getElementById(l.href.slice(2)) : null;
      return el ? [el] : [];
    });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
          else setActive((cur) => (cur === e.target.id ? "" : cur));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return { scrolled, active };
}

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
  const { scrolled, active } = useScrollState();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || open
          ? "border-white/[0.08] bg-navy-950/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-7 font-mono-ui text-[0.78rem] uppercase tracking-wider text-white/60 md:flex">
          {LINKS.map((l) => {
            const current = active !== "" && l.href === `/#${active}`;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={current ? "true" : undefined}
                className={`relative py-1 transition-colors hover:text-white ${current ? "text-white" : ""}`}
              >
                {l.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-glow-cyan transition-transform duration-300 ${
                    current ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
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
