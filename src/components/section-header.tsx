import type { ReactNode } from "react";

export function SectionHeader({ title, children, dark = false }: { title: string; children?: ReactNode; dark?: boolean }) {
  return (
    <header className={`border-t pt-10 ${dark ? "border-white/15" : "border-ink/15"}`}>
      <h2 className={`max-w-4xl text-[clamp(2.25rem,4.6vw,3.75rem)] leading-[1.05] font-medium tracking-[-0.045em] text-balance ${dark ? "text-white" : "text-ink"}`}>
        {title}
      </h2>
      {children && <div className={`mt-5 max-w-xl text-[1.05rem] leading-relaxed ${dark ? "text-white/60" : "text-ink-soft"}`}>{children}</div>}
    </header>
  );
}
