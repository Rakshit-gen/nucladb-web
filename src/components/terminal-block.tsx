import { CopyButton } from "./copy-button";

type Line = { text: string; muted?: boolean };

export function TerminalBlock({
  title = "shell",
  lines,
  copyText,
}: {
  title?: string;
  lines: Line[];
  copyText?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-navy-950/80 shadow-[0_20px_60px_-20px_rgba(6,10,25,0.6)] backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-2 font-mono-ui text-[0.7rem] text-white/40">{title}</span>
        </div>
        {copyText ? <CopyButton text={copyText} dark /> : null}
      </div>
      <div className="relative">
      <pre className="overflow-x-auto px-4 py-4 font-mono-ui text-[0.82rem] leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className={line.muted ? "text-white/40" : "text-glow-cyan/90"}>
            {line.text === "" ? " " : line.text}
          </div>
        ))}
      </pre>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-navy-950/90 to-transparent sm:hidden" />
      </div>
    </div>
  );
}
