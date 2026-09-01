import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";
import { TerminalBlock } from "./terminal-block";
import { REPO_URL, INSTALL_CMD } from "@/lib/site";

export function CtaSection() {
  return (
    <section className="relative bg-cream py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="kicker mb-4">Get started</p>
            <h2 className="text-[2rem] leading-tight font-semibold tracking-tight text-ink sm:text-[2.4rem]">
              One command. A real server. Your terminal.
            </h2>
            <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-ink-soft">
              <code className="font-mono-ui text-[0.85em]">install.sh</code> installs
              both binaries and <code className="font-mono-ui text-[0.85em]">quickstart</code>{" "}
              spins up a throwaway local server, runs a scripted demo, then leaves
              it running so you can keep poking at it.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/docs/quickstart"
                className="group flex items-center gap-2 rounded-full bg-navy-950 px-5 py-3 text-[0.85rem] font-medium text-white transition-transform hover:-translate-y-0.5"
              >
                Full quickstart guide
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-ink/15 px-5 py-3 text-[0.85rem] font-medium text-ink transition-colors hover:border-ink/35"
              >
                View on GitHub
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <TerminalBlock
              title="install.sh"
              copyText={INSTALL_CMD}
              lines={[
                { text: "$ curl -fsSL .../install.sh | sh", muted: true },
                { text: "$ nucladb-cli quickstart" },
                { text: "" },
                { text: "$ export NUCLADB_ADDR=127.0.0.1:53211", muted: true },
                { text: "$ nucladb-cli insert -id=1 -vector=1,0,0,0 -meta=team=search" },
                { text: "inserted id=1", muted: true },
                { text: "$ nucladb-cli search -vector=1,0,0,0 -top-k=5" },
                { text: "1  score=0.000000  map[team:search]", muted: true },
              ]}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
