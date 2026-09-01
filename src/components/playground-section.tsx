"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "./reveal";
import { REPO_URL } from "@/lib/site";

type Status = "loading" | "ready" | "busy" | "error";
type BusyAction = "insert" | "search" | null;

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

  async function handleInsert() {
    setStatus("busy");
    setBusyAction("insert");
    try {
      const res = (await call("insertRandom", { count: batchSize })) as InsertPayload;
      setInsertResult(res);
      setCorpusSize(res.total);
      setStatus("ready");
    } catch (err) {
      setErrorMsg(String(err));
      setStatus("error");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSearch() {
    setStatus("busy");
    setBusyAction("search");
    try {
      const res = (await call("searchRandom", { topK: TOP_K, ef: EF_SEARCH })) as SearchPayload;
      setSearchResult(res);
      setStatus("ready");
    } catch (err) {
      setErrorMsg(String(err));
      setStatus("error");
    } finally {
      setBusyAction(null);
    }
  }

  const busy = status === "busy" || status === "loading";

  return (
    <section id="playground" className="relative bg-navy-950 py-28 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mb-4 flex items-center gap-3">
            <p className="kicker kicker--on-dark">Playground · Runs in your browser</p>
            <StatusDot status={status} />
          </div>
          <h2 className="max-w-2xl text-[2rem] leading-tight font-semibold tracking-tight sm:text-[2.4rem]">
            This is the real engine, compiled to WebAssembly.
          </h2>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-white/60">
            Not a mock. <code className="font-mono-ui text-[0.85em] text-glow-cyan">internal/index/hnsw</code>{" "}
            is the exact package the server runs, compiled unmodified to WASM and
            executing right here, in this tab. Insert random vectors, then search,
            and see the real graph timing and recall against a brute-force check
            computed alongside it.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-30px_rgba(6,10,25,0.7)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-7 py-4">
              <span className="font-mono-ui text-[0.76rem] text-white/40">
                dim={DIM} &middot; cosine &middot; M={M} &middot; efConstruction={EF_CONSTRUCTION}
              </span>
              <span className="font-mono-ui text-[0.76rem] text-white/40">
                {corpusSize.toLocaleString()} vectors indexed
              </span>
            </div>

            <div className="p-7">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[0.82rem] text-white/50">Insert</span>
                  <select
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    disabled={busy}
                    className="rounded-lg border border-white/15 bg-navy-950 px-3 py-2 font-mono-ui text-[0.82rem] text-white/85 transition-colors hover:border-white/25 disabled:opacity-50"
                  >
                    {BATCH_SIZES.map((n) => (
                      <option key={n} value={n}>
                        {n.toLocaleString()} vectors
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleInsert}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[0.85rem] font-medium text-navy-950 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {busyAction === "insert" && <Spinner dark />}
                  {status === "loading" ? "Loading engine…" : busyAction === "insert" ? "Inserting…" : "Insert"}
                </button>

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={busy || corpusSize === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-[0.85rem] font-medium text-white/85 transition-colors hover:border-white/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busyAction === "search" && <Spinner />}
                  {busyAction === "search" ? "Searching…" : "Search"}
                </button>
              </div>

              {status === "error" && (
                <p className="mt-5 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-[0.85rem] text-red-300/90">
                  {errorMsg}
                </p>
              )}

              {!insertResult && status !== "error" && (
                <p className="mt-6 border-t border-white/10 pt-6 text-[0.85rem] text-white/40">
                  Insert a batch to build the index, then search it.
                </p>
              )}

              {insertResult && (
                <div className="mt-7 grid grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-3">
                  <Stat label="vectors inserted" value={insertResult.insertedCount.toLocaleString()} />
                  <Stat label="build time" value={`${insertResult.elapsedMs.toFixed(1)} ms`} />
                  <Stat
                    label="inserts / sec"
                    value={Math.round((insertResult.insertedCount / insertResult.elapsedMs) * 1000).toLocaleString()}
                  />
                </div>
              )}

              {searchResult && (
                <div className="mt-7 grid grid-cols-1 gap-8 border-t border-white/10 pt-6 lg:grid-cols-[1fr_auto]">
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                    <Stat label="search time" value={`${searchResult.searchElapsedMs.toFixed(3)} ms`} />
                    <Stat label="brute-force time" value={`${searchResult.bruteForceMs.toFixed(3)} ms`} />
                    <Stat label={`recall@${searchResult.topK}`} value={searchResult.recall.toFixed(3)} />
                    <Stat label="corpus at query" value={searchResult.corpusSize.toLocaleString()} />
                  </div>

                  <div className="lg:w-64">
                    <p className="mb-2 font-mono-ui text-[0.7rem] uppercase tracking-wider text-white/35">
                      Top {Math.min(5, searchResult.results.length)} matches
                    </p>
                    <div className="space-y-1.5">
                      {searchResult.results.slice(0, 5).map((r, i) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between rounded-md bg-white/[0.03] px-3 py-1.5 font-mono-ui text-[0.76rem]"
                        >
                          <span className="text-white/50">
                            #{i + 1} id={r.id}
                          </span>
                          <span className="text-glow-cyan">{r.distance.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mt-4 text-[0.8rem] text-white/35">
            The query vector and its ground truth are generated fresh on every search,
            so recall reflects this exact corpus, not a cached number.{" "}
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
        </Reveal>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono-ui text-xl font-medium text-glow-cyan">{value}</p>
      <p className="mt-1 text-[0.76rem] text-white/45">{label}</p>
    </div>
  );
}

function StatusDot({ status }: { status: Status }) {
  const color =
    status === "error" ? "bg-red-400" : status === "loading" ? "bg-glow-amber" : "bg-glow-cyan";
  const label =
    status === "error" ? "error" : status === "loading" ? "loading" : status === "busy" ? "running" : "ready";
  return (
    <span className="inline-flex items-center gap-1.5 font-mono-ui text-[0.68rem] uppercase tracking-wider text-white/40">
      <span className={`h-1.5 w-1.5 rounded-full ${color} ${status === "loading" ? "animate-pulse" : ""}`} />
      {label}
    </span>
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
