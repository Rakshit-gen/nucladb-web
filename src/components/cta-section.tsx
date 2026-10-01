"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CopyButton } from "./copy-button";
import { INSTALL_CMD, REPO_URL } from "@/lib/site";

const CLONE = `git clone ${REPO_URL}.git && cd NuclaDB`;

const TABS = [
  {
    id: "script",
    label: "Install script",
    note: "Installs the server and CLI, then runs a short demo.",
    code: `${INSTALL_CMD}
nucladb-cli quickstart`,
  },
  {
    id: "source",
    label: "From source",
    note: "Needs Go.",
    code: `${CLONE}
go build -o bin/nucladbd ./cmd/nucladbd
go build -o bin/nucladb-cli ./cmd/nucladb-cli
./bin/nucladbd -data-dir=./data -dim=4 -metric=l2 &

./bin/nucladb-cli insert -id=1 -vector=1,0,0,0 -meta=team=search
./bin/nucladb-cli search -vector=1,0,0,0 -top-k=5`,
  },
  {
    id: "docker",
    label: "Docker",
    note: "One server, data kept in a Docker volume.",
    code: `${CLONE}
docker compose up -d
curl localhost:8080/metrics`,
  },
  {
    id: "python",
    label: "Python",
    note: "Talks to a running server.",
    code: `pip install ./clients/python

from nucladb import Client, DistanceMetric

with Client("localhost:9090") as db:
    db.insert("1", [1.0, 0.0, 0.0, 0.0], metadata={"team": "search"})
    for m in db.search([1.0, 0.0, 0.0, 0.0], top_k=3, metric=DistanceMetric.L2):
        print(m.id, m.score, m.metadata)`,
  },
];

export function CtaSection() {
  const [active, setActive] = useState(TABS[0].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tab = TABS.find((t) => t.id === active)!;

  function onKey(e: React.KeyboardEvent, i: number) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const next = (i + step + TABS.length) % TABS.length;
    setActive(TABS[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <section id="get-started" className="border-t border-ink/15 bg-cream-deep py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <h2 className="text-[clamp(2.25rem,4.6vw,3.75rem)] leading-[1.05] font-medium tracking-[-0.045em]">
            Run it on your machine
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
            One binary, no other services to set up.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[0.92rem]">
            <Link href="/docs/quickstart" className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
              Quickstart guide
            </Link>
            <Link href="/docs/api" className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
              API reference
            </Link>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
              Source on GitHub
            </a>
          </div>
        </div>

        <div className="min-w-0">
          <div role="tablist" aria-label="Ways to install" className="flex flex-wrap gap-x-6 border-b border-ink/15">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active === t.id}
                aria-controls={`panel-${t.id}`}
                tabIndex={active === t.id ? 0 : -1}
                onClick={() => setActive(t.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={`-mb-px border-b-2 py-3 text-[0.9rem] transition-colors ${
                  active === t.id ? "border-teal text-ink" : "border-transparent text-ink-faint hover:text-ink-soft"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div role="tabpanel" id={`panel-${tab.id}`} aria-labelledby={`tab-${tab.id}`} className="pt-5">
            <p className="text-[0.88rem] leading-relaxed text-ink-soft">{tab.note}</p>
            <div className="relative mt-4 rounded-xl bg-navy-950 shadow-[0_30px_60px_-30px_rgba(7,11,26,0.55)]">
              <div className="absolute top-2 right-2">
                <CopyButton text={tab.code} dark />
              </div>
              <pre className="overflow-x-auto p-5 pr-12 font-mono-ui text-[0.8rem] leading-relaxed text-white/85">{tab.code}</pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
