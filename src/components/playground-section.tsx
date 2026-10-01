"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeader } from "./section-header";
import { REPO_URL } from "@/lib/site";

type Status = "loading" | "ready" | "busy" | "error";
type BusyAction = "insert" | "search" | "both" | null;

type InsertPayload = { insertedCount: number; total: number; elapsedMs: number };
type SearchPayload = {
  results: { id: number; distance: number }[];
  searchElapsedMs: number;
  bruteForceMs: number;
  recall: number;
  topK: number;
  corpusSize: number;
};

const DIM = 32;
const M = 16;
const EF_CONSTRUCTION = 100;
const EF_SEARCH = 60;
const TOP_K = 10;
const BATCH_SIZES = [500, 1000, 2500, 5000];

type WorkerMessage =
  | { type: "ready" }
  | { type: "result"; reqId: number; payload: unknown }
  | { type: "error"; reqId: number | null; message: string };

export function PlaygroundSection() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<number, { resolve: (v: unknown) => void; reject: (e: string) => void }>());
  const reqIdRef = useRef(0);

  const [status, setStatus] = useState<Status>("loading");
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [batchSize, setBatchSize] = useState(1000);
  const [corpusSize, setCorpusSize] = useState(0);
  const [insertResult, setInsertResult] = useState<InsertPayload | null>(null);
  const [searchResult, setSearchResult] = useState<SearchPayload | null>(null);
  const [history, setHistory] = useState<SearchPayload[]>([]);

  const call = useCallback((cmd: string, args: Record<string, unknown>) => {
    return new Promise<unknown>((resolve, reject) => {
      const reqId = ++reqIdRef.current;
      pendingRef.current.set(reqId, { resolve, reject });
      workerRef.current?.postMessage({ reqId, cmd, args });
    });
  }, []);

  useEffect(() => {
    const worker = new Worker("/wasm/playground-worker.js");
    workerRef.current = worker;

    worker.onmessage = (ev: MessageEvent<WorkerMessage>) => {
      const msg = ev.data;
      if (msg.type === "ready") {
        call("reset", { dim: DIM, m: M, efConstruction: EF_CONSTRUCTION, metric: "cosine" })
          .then(() => setStatus("ready"))
          .catch((err) => {
            setStatus("error");
            setErrorMsg(String(err));
          });
        return;
      }
      if (msg.type === "result") {
        pendingRef.current.get(msg.reqId)?.resolve(msg.payload);
        pendingRef.current.delete(msg.reqId);
        return;
      }
      if (msg.type === "error") {
        if (msg.reqId != null) {
          pendingRef.current.get(msg.reqId)?.reject(msg.message);
          pendingRef.current.delete(msg.reqId);
        } else {
          setStatus("error");
          setErrorMsg(msg.message);
        }
      }
    };
    worker.onerror = () => {
      setStatus("error");
      setErrorMsg("The WASM worker failed to load.");
    };

    return () => worker.terminate();
  }, [call]);

  async function insert() {
    const res = (await call("insertRandom", { count: batchSize })) as InsertPayload;
    setInsertResult(res);
    setCorpusSize(res.total);
  }

  async function search() {
    const res = (await call("searchRandom", { topK: TOP_K, ef: EF_SEARCH })) as SearchPayload;
    setSearchResult(res);
    setHistory((h) => [res, ...h].slice(0, 6));
  }

  async function run(action: Exclude<BusyAction, null>, steps: (() => Promise<void>)[]) {
    setStatus("busy");
    setBusyAction(action);
    try {
      for (const step of steps) await step();
      setStatus("ready");
    } catch (err) {
      setErrorMsg(String(err));
      setStatus("error");
    } finally {
      setBusyAction(null);
    }
  }

  const busy = status === "busy" || status === "loading";
  const speedup = searchResult && searchResult.searchElapsedMs > 0
    ? searchResult.bruteForceMs / searchResult.searchElapsedMs
    : null;

  return (
    <section id="playground" className="bg-navy-950 pt-24 pb-24 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader title="Try the index in your browser" dark>
          <p>
            <code className="font-mono-ui text-[0.88em] text-white">internal/index/hnsw</code>, the
            package the server uses, compiled to WebAssembly and running in this tab.
            Build an index, search it, and compare the answer with a full scan of every
            vector.
          </p>
        </SectionHeader>

        <div className="mt-12 rounded-lg border border-white/15">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 px-6 py-3.5 sm:px-7">
              <span className="font-mono-ui text-[0.74rem] text-white/40">
                dim={DIM} &middot; cosine &middot; M={M} &middot; efConstruction={EF_CONSTRUCTION} &middot; efSearch={EF_SEARCH}
              </span>
              <span className="font-mono-ui text-[0.74rem] text-white/60">
                {status === "loading" ? "loading engine…" : status === "error" ? "engine failed to load" : `${corpusSize.toLocaleString()} vectors indexed`}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="border-b border-white/15 p-6 sm:p-7 lg:border-r lg:border-b-0">
                <Step n={1} title="Build the index" done={corpusSize > 0}>
                  <p className="mb-3 text-[0.82rem] text-white/50">Random {DIM}-dimension vectors per batch:</p>
                  <div role="radiogroup" aria-label="Batch size" className="inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-navy-950 p-1">
                    {BATCH_SIZES.map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={batchSize === n}
                        disabled={busy}
                        onClick={() => setBatchSize(n)}
                        className={`rounded-lg px-3 py-1.5 font-mono-ui text-[0.78rem] transition-colors disabled:opacity-50 ${
                          batchSize === n ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
                        }`}
                      >
                        {n.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => run("insert", [insert])}
                      disabled={busy}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[0.85rem] font-medium text-navy-950 transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {busyAction === "insert" && <Spinner dark />}
                      {status === "loading"
                        ? "Loading engine…"
                        : busyAction === "insert"
                          ? "Inserting…"
                          : `Insert ${batchSize.toLocaleString()} vectors`}
                    </button>
                  </div>
                  {insertResult && (
                    <p className="mt-4 font-mono-ui text-[0.76rem] text-white/50">
                      Last batch: {insertResult.insertedCount.toLocaleString()} in{" "}
                      <span className="text-white/80">{insertResult.elapsedMs.toFixed(1)} ms</span>
                      {" "}({Math.round((insertResult.insertedCount / insertResult.elapsedMs) * 1000).toLocaleString()}/s)
                    </p>
                  )}
                </Step>

                <Step n={2} title="Search it" done={searchResult !== null} last>
                  <p className="mb-4 text-[0.82rem] text-white/50">
                    A fresh random query, top {TOP_K}, through HNSW and through a full scan.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => run("search", [search])}
                      disabled={busy || corpusSize === 0}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-[0.85rem] font-medium text-white/85 transition-colors hover:border-white/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {busyAction === "search" && <Spinner />}
                      {busyAction === "search" ? "Searching…" : "Search"}
                    </button>
                    {corpusSize === 0 && (
                      <button
                        type="button"
                        onClick={() => run("both", [insert, search])}
                        disabled={busy}
                        className="inline-flex items-center gap-2 rounded-full border border-glow-cyan/40 px-5 py-2.5 text-[0.85rem] font-medium text-glow-cyan transition-colors hover:border-glow-cyan disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {busyAction === "both" && <Spinner />}
                        {busyAction === "both" ? "Working…" : `Insert ${batchSize.toLocaleString()} and search`}
                      </button>
                    )}
                  </div>
                </Step>

                {status === "error" && (
                  <p className="mt-6 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-[0.85rem] text-red-300/90">
                    {errorMsg}
                  </p>
                )}
              </div>

              <div className="p-6 sm:p-7" aria-live="polite">
                {!searchResult ? (
                  <div className="flex h-full min-h-56 flex-col justify-center">
                    <p className="text-[0.9rem] text-white/60">Results show up here.</p>
                    <p className="mt-2 max-w-sm text-[0.85rem] leading-relaxed text-white/45">
                      Try a search at 1,000 vectors, then add more and search again: the
                      full scan slows down as the index grows, HNSW barely does.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[1.05rem] leading-snug text-white/85">
                      {speedup !== null && (
                        <>
                          HNSW answered{" "}
                          <span className="font-semibold text-glow-cyan">
                            {speedup >= 1 ? `${speedup.toFixed(1)}× faster` : `${(1 / speedup).toFixed(1)}× slower`}
                          </span>{" "}
                          than the full scan
                        </>
                      )}{" "}
                      and found{" "}
                      <span className="font-semibold text-glow-cyan">
                        {Math.round(searchResult.recall * searchResult.topK)} of the {searchResult.topK}
                      </span>{" "}
                      true nearest neighbours.
                    </p>

                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <Stat label="HNSW search" value={`${searchResult.searchElapsedMs.toFixed(3)} ms`} />
                      <Stat label="full scan" value={`${searchResult.bruteForceMs.toFixed(3)} ms`} muted />
                      <Stat label={`recall@${searchResult.topK}`} value={searchResult.recall.toFixed(2)} />
                    </div>

                    <div className="mt-7">
                      <p className="mb-2.5 text-[0.8rem] text-white/45">
                        Top {Math.min(5, searchResult.results.length)} matches · cosine distance, lower is closer
                      </p>
                      <div>
                        {searchResult.results.slice(0, 5).map((r, i) => (
                          <div key={r.id} className="flex items-center justify-between border-b border-white/10 py-1.5 font-mono-ui text-[0.78rem]">
                            <span className="text-white/55">#{i + 1}  id {r.id}</span>
                            <span className="text-white">{r.distance.toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {history.length > 1 && (
                      <div className="mt-7">
                        <p className="mb-2.5 text-[0.8rem] text-white/45">
                          Your searches, newest first
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full font-mono-ui text-[0.74rem]">
                            <thead>
                              <tr className="text-left text-white/35">
                                <th className="py-1 pr-4 font-normal">vectors</th>
                                <th className="py-1 pr-4 font-normal">HNSW</th>
                                <th className="py-1 pr-4 font-normal">full scan</th>
                                <th className="py-1 font-normal">recall</th>
                              </tr>
                            </thead>
                            <tbody>
                              {history.map((h, i) => (
                                <tr key={i} className="border-t border-white/5 text-white/60">
                                  <td className="py-1.5 pr-4">{h.corpusSize.toLocaleString()}</td>
                                  <td className="py-1.5 pr-4 text-glow-cyan">{h.searchElapsedMs.toFixed(3)} ms</td>
                                  <td className="py-1.5 pr-4">{h.bruteForceMs.toFixed(3)} ms</td>
                                  <td className="py-1.5">{h.recall.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
        </div>

          <p className="mt-4 text-[0.82rem] text-white/45">
            Timings come from your machine and vary between runs; very small corpora
            can make the full scan the faster one.{" "}
            <a
              href={`${REPO_URL}/blob/main/cmd/wasm/main.go`}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-white/30 underline-offset-2 hover:text-white"
            >
              Read the WASM entry point
            </a>
            .
          </p>
      </div>
    </section>
  );
}

function Step({
  n,
  title,
  last = false,
  children,
}: {
  n: number;
  title: string;
  done: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={last ? "" : "mb-8 border-b border-white/10 pb-8"}>
      <h3 className="mb-2 text-[0.95rem] font-semibold text-white">
        <span className="mr-2 font-mono-ui text-white/45">{n}.</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Stat({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="min-w-0">
      <p className={`font-mono-ui text-lg font-medium sm:text-xl ${muted ? "text-white/60" : "text-white"}`}>{value}</p>
      <p className="mt-1 text-[0.76rem] text-white/45">{label}</p>
    </div>
  );
}

function Spinner({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-t-transparent ${
        dark ? "border-navy-950/30 border-t-navy-950" : "border-white/25 border-t-white"
      }`}
    />
  );
}
