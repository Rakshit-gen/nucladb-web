"use client";

import { useEffect, useState } from "react";

const command = "nucladb-cli search -vector=1,0,0,0 -top-k=2";
const points = Array.from({ length: 36 }, (_, i) => ({
  x: 22 + ((i * 79 + i * i * 3) % 396),
  y: 18 + ((i * 47 + i * i * 7) % 142),
}));

export function HeroSearchDemo() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      clearInterval(timer);
      if (reduced.matches) { setElapsed(7000); return; }
      setElapsed(0);
      const began = performance.now();
      timer = setInterval(() => {
        const next = Math.min(7000, performance.now() - began);
        setElapsed(next);
        if (next === 7000) clearInterval(timer);
      }, 50);
    };
    start();
    reduced.addEventListener("change", start);
    return () => { clearInterval(timer); reduced.removeEventListener("change", start); };
  }, []);

  const typed = Math.max(0, Math.floor((elapsed - 500) / 38));
  const searching = elapsed >= 2400;
  const firstMatch = elapsed >= 3700;
  const secondMatch = elapsed >= 4400;
  const complete = elapsed >= 5000;

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-glow-cyan/20 bg-navy-950/95 shadow-[0_24px_100px_-25px_rgba(127,227,212,0.16)] backdrop-blur-md" aria-label="Animated vector search example">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/20" /><span className="h-2 w-2 rounded-full bg-white/20" /><span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="ml-3 font-mono-ui text-[0.65rem] text-white/50">nucladb / vector search</span>
        </div>
      </div>
      <div className="px-5 pt-6 sm:px-6" aria-hidden="true">
        <div className="mb-3 font-mono-ui text-[0.62rem] text-white/35"># Find the two nearest vectors</div>
        <div className="min-h-14 break-all font-mono-ui text-[0.72rem] leading-6 text-glow-cyan sm:text-[0.76rem]">
          <span className="mr-2 text-white/35">$</span>{command.slice(0, typed)}<span className={`ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-glow-cyan ${typed >= command.length ? "invisible" : ""}`} />
        </div>
        <div className="relative mt-3 overflow-hidden rounded-lg border border-white/[0.06] bg-navy-900/40">
          <svg viewBox="0 0 440 180" className="w-full" role="presentation">
            <defs><pattern id="search-grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M 22 0 L 0 0 0 22" fill="none" stroke="#7fe3d4" strokeOpacity=".05" /></pattern></defs>
            <rect width="440" height="180" fill="url(#search-grid)" />
            {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="2" fill="#a78bfa" opacity={searching ? 0.4 : 0.2} />)}
            {searching && !complete && <circle cx="246" cy="85" r={20 + ((elapsed - 2400) / 18) % 115} fill="none" stroke="#7fe3d4" strokeOpacity=".25" />}
            <circle cx="246" cy="85" r="5" fill="#7fe3d4" opacity={searching ? 1 : 0.25} />
            <circle cx="246" cy="85" r="10" fill="none" stroke="#7fe3d4" strokeOpacity={searching ? 0.4 : 0.1} />
            <text x="261" y="80" fill="#7fe3d4" fontSize="9" fontFamily="monospace" opacity={searching ? 0.8 : 0.25}>query</text>
            {[{ x: 218, y: 103, show: firstMatch }, { x: 277, y: 115, show: secondMatch }].map((point, index) => <g key={index} opacity={point.show ? 1 : 0.15}>
              {point.show && <line x1="246" y1="85" x2={point.x} y2={point.y} stroke="#7fe3d4" strokeWidth="1" strokeDasharray="3 3" opacity=".65" />}
              <circle cx={point.x} cy={point.y} r={point.show ? 4 : 2} fill={point.show ? "#7fe3d4" : "#a78bfa"} />
              {point.show && <text x={point.x - 7} y={point.y + 18} fill="#7fe3d4" fontSize="8" fontFamily="monospace">0{index + 1}</text>}
            </g>)}
            <text x="12" y="166" fill="#ffffff" opacity=".25" fontSize="7" fontFamily="monospace">ILLUSTRATIVE PROJECTION</text>
          </svg>
        </div>
        <div className="min-h-[132px] pt-5 font-mono-ui text-[0.68rem] leading-7">
          <div className="flex justify-between border-b border-white/10 pb-1 text-white/30"><span>NEAREST MATCHES</span><span>RANK</span></div>
          <div className={`flex justify-between text-white/75 transition-opacity duration-500 motion-reduce:transition-none ${firstMatch ? "opacity-100" : "opacity-0"}`}><span><span className="mr-3 text-glow-cyan">↳</span>vector_001</span><span className="text-glow-cyan">01</span></div>
          <div className={`flex justify-between text-white/75 transition-opacity duration-500 motion-reduce:transition-none ${secondMatch ? "opacity-100" : "opacity-0"}`}><span><span className="mr-3 text-glow-cyan">↳</span>vector_002</span><span className="text-glow-cyan">02</span></div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 font-mono-ui text-[0.6rem] sm:px-6">
        <span className="text-glow-cyan/75" aria-hidden="true">{complete ? "2 matches found" : searching ? "Searching the index…" : "Ready"}</span>
        <span className="text-white/30">Example · 4 dimensions</span>
      </div>
      <p className="sr-only">Illustrative search using vector [1, 0, 0, 0], returning the two nearest matches, vector_001 and vector_002. This animation does not query a running database.</p>
    </div>
  );
}
