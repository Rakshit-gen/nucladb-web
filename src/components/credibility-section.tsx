import { Reveal } from "./reveal";

const STATS = [
  { value: "83", label: "tests, across 22 files" },
  { value: "go test -race", label: "the documented standard" },
  { value: "3", label: "real chaos tests: partition, kill/restart, disk failure" },
  { value: "porcupine", label: "the real Jepsen linearizability checker" },
  { value: "36+", label: "incremental commits, start to distributed cluster" },
];

const NOT_CLAIMED = [
  "No verified GitHub star count, and no claim about one.",
  "clients/python is a local pip install, not a confirmed published PyPI package.",
  "No SIFT1M (large-scale) run yet, only SIFT-small, because of the fsync-per-write build cost. Named as future work, not implied.",
];

export function CredibilitySection() {
  return (
    <section className="relative bg-navy-950 py-28 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="kicker kicker--on-dark mb-4">Credibility, checked</p>
          <h2 className="max-w-2xl text-[2rem] leading-tight font-semibold tracking-tight sm:text-[2.4rem]">
            Everything above is verifiable in the repo.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.04} className="bg-navy-950 p-7">
              <p className="font-mono-ui text-[1.15rem] font-medium text-glow-cyan">{s.value}</p>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-white/55">{s.label}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            <p className="mb-4 text-[0.9rem] font-semibold text-white/85">What this site does not claim</p>
            <ul className="space-y-2.5">
              {NOT_CLAIMED.map((line) => (
                <li key={line} className="flex gap-3 text-[0.86rem] leading-relaxed text-white/55">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
