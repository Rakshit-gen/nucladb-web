"use client";

import { useActionState, useEffect, useState, useTransition, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import type { KeyInfo } from "@/lib/nucladb-admin";
import { createKey, revoke, setUpIndex, type ActionResult } from "./actions";

const input =
  "h-10 border border-white/15 bg-navy-900 px-3 font-mono-ui text-[0.88rem] text-white placeholder:text-white/30 focus:border-glow-cyan focus:outline-none";
const primary =
  "h-10 bg-[#3fa596] px-5 text-[0.88rem] font-medium text-navy-950 hover:bg-glow-cyan disabled:opacity-40 disabled:hover:bg-[#3fa596]";
const quiet = "font-mono-ui text-[0.8rem] text-white/55 hover:text-white disabled:opacity-40";

const PRESETS = [
  { dim: 384, label: "384", note: "all-MiniLM-L6-v2, bge-small" },
  { dim: 768, label: "768", note: "nomic-embed-text, bge-base" },
  { dim: 1024, label: "1024", note: "bge-large, Cohere embed v3" },
  { dim: 1536, label: "1536", note: "OpenAI text-embedding-3-small" },
];

function Error({ text }: { text?: string }) {
  return text ? (
    <p role="alert" className="mt-3 text-[0.88rem] text-[#f4a78a]">
      {text}
    </p>
  ) : null;
}

export function SetupForm() {
  const [state, action, pending] = useActionState<ActionResult, FormData>(setUpIndex, {});
  const [dim, setDim] = useState(384);

  return (
    <form action={action} className="max-w-2xl">
      <fieldset>
        <legend className="text-[1.05rem] font-medium">Vector length</legend>
        <p className="mt-1 max-w-xl text-[0.88rem] leading-relaxed text-white/50">
          How many numbers your embedding model returns for each piece of text. It&apos;s in the model&apos;s docs, or
          check the length of one embedding. Not sure? 384 fits most small open-source models.
        </p>
        <div className="mt-4 border-t border-white/10">
          {PRESETS.map((p) => (
            <label
              key={p.dim}
              className="flex cursor-pointer items-center gap-4 border-b border-white/10 py-3 text-[0.92rem] has-[:checked]:text-white text-white/65"
            >
              <input
                type="radio"
                name="preset"
                checked={dim === p.dim}
                onChange={() => setDim(p.dim)}
                className="accent-[var(--glow-cyan)]"
              />
              <span className="w-14 font-mono-ui">{p.label}</span>
              <span className="text-white/45">{p.note}</span>
            </label>
          ))}
          <label className="flex items-center gap-4 border-b border-white/10 py-3 text-[0.92rem] text-white/65">
            <span className="w-[calc(13px+1rem)]" />
            <span>Other</span>
            <input
              name="dim"
              type="number"
              min={2}
              max={4096}
              required
              value={dim}
              onChange={(e) => setDim(Number(e.target.value))}
              className={`${input} w-28`}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="mt-10">
        <legend className="text-[1.05rem] font-medium">Distance</legend>
        <p className="mt-1 max-w-xl text-[0.88rem] leading-relaxed text-white/50">
          How &quot;close&quot; two vectors are. Keep cosine unless your model&apos;s docs say otherwise.
        </p>
        <div className="mt-4 flex flex-wrap gap-6 text-[0.92rem] text-white/65">
          {[
            ["cosine", "cosine (most text embeddings)"],
            ["dot", "dot product"],
            ["l2", "euclidean (L2)"],
          ].map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2">
              <input type="radio" name="metric" value={value} defaultChecked={value === "cosine"} className="accent-[var(--glow-cyan)]" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" disabled={pending} className={`${primary} relative mt-10 overflow-hidden`}>
        {pending ? "Creating index..." : "Create index"}
        {pending && <BusyLine />}
      </button>
      <Error text={state.error} />
    </form>
  );
}

const ease = [0.22, 1, 0.36, 1] as const;

// A thin line that runs along the bottom of a button while it waits.
function BusyLine() {
  return (
    <motion.span
      aria-hidden
      className="absolute bottom-0 left-0 h-[2px] w-1/3 bg-navy-950/70"
      initial={{ x: "-100%" }}
      animate={{ x: "300%" }}
      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function KeysPanel({
  keys,
  max,
  disabled,
  onCreated,
}: {
  keys: KeyInfo[];
  max: number;
  disabled: boolean;
  onCreated: (key: string) => void;
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(createKey, {});
  useEffect(() => {
    if (state.key) onCreated(state.key);
  }, [state.key, onCreated]);
  const [shown, setShown] = useState<string | undefined>();
  const [confirming, setConfirming] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<string>();
  const [revoking, startRevoke] = useTransition();

  // A new key replaces the one on screen; dismissing hides it for good.
  const fresh = state.key && state.key !== shown ? state.key : undefined;
  const full = keys.length >= max;

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-[1.05rem] font-medium">Your keys</h2>
        <span className="font-mono-ui text-[0.8rem] text-white/45">
          <motion.span key={keys.length} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="inline-block">
            {keys.length}
          </motion.span>{" "}
          of {max} used
        </span>
      </div>
      <p className="mt-1 text-[0.85rem] leading-relaxed text-white/45">
        The ID identifies a key without revealing it. Revoke a key if it leaks; anything using it stops working at once.
      </p>

      <AnimatePresence initial={false}>
        {fresh && (
          <motion.div
            key={fresh}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden"
          >
            <div className="mt-4 border border-glow-cyan/50 bg-glow-cyan/[0.06] p-5">
              <p className="text-[0.92rem]">Copy your new key now. It&apos;s shown once; the server keeps only a hash of it.</p>
              <div className="relative mt-3 flex items-center gap-2 overflow-hidden border border-white/10 bg-navy-950 px-3 py-2">
                {/* One sweep across the key when it appears. */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-glow-cyan/25 to-transparent"
                  initial={{ left: "-6rem" }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
                />
                <code className="flex-1 overflow-x-auto font-mono-ui text-[0.88rem] whitespace-nowrap text-glow-cyan">{fresh}</code>
                <CopyButton text={fresh} dark />
              </div>
              <p className="mt-3 text-[0.82rem] text-white/50">
                Put it in your app&apos;s server-side environment, for example as NUCLADB_API_KEY. Never ship it in browser
                code.
              </p>
              <button type="button" onClick={() => setShown(fresh)} className={`${quiet} mt-4`}>
                I&apos;ve saved it
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <table className="mt-4 w-full border-t border-white/10 text-left text-[0.88rem]">
        <thead className="font-mono-ui text-[0.78rem] text-white/40">
          <tr className="border-b border-white/10">
            <th className="py-2.5 font-normal">Name</th>
            <th className="py-2.5 font-normal">ID</th>
            <th className="hidden py-2.5 font-normal sm:table-cell">Created</th>
            <th className="py-2.5" />
          </tr>
        </thead>
        <tbody>
          {keys.length === 0 && (
            <tr className="border-b border-white/10">
              <td colSpan={4} className="py-6 text-white/45">
                No keys yet. Name your first one below, after the app that will use it.
              </td>
            </tr>
          )}
          <AnimatePresence initial={false}>
            {keys.map((k) => (
              <motion.tr
                key={k.id}
                layout
                // A new key slides in lit up, then settles; a revoked one slides out.
                initial={{ opacity: 0, x: -12, backgroundColor: "rgba(127,227,212,0.14)" }}
                animate={{ opacity: 1, x: 0, backgroundColor: confirming === k.id ? "rgba(255,255,255,0.03)" : "rgba(127,227,212,0)" }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.25 } }}
                transition={{ duration: 0.5, ease, backgroundColor: { duration: 1.4 } }}
                className="border-b border-white/10"
              >
                {confirming === k.id ? (
                  <>
                    <td colSpan={3} className="py-3 pr-3 text-white/75">
                      Revoke <span className="font-mono-ui">{k.name}</span>? Apps using it start getting 401 on their next
                      request.
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        disabled={revoking}
                        onClick={() =>
                          startRevoke(async () => {
                            const res = await revoke(k.id);
                            setRevokeError(res.error);
                            setConfirming(null);
                          })
                        }
                        className="font-mono-ui text-[0.8rem] text-[#f4a78a] hover:text-white disabled:opacity-40"
                      >
                        {revoking ? "revoking..." : "revoke"}
                      </button>
                      <button type="button" onClick={() => setConfirming(null)} className={`${quiet} ml-4`}>
                        cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 pr-3">{k.name}</td>
                    <td className="py-3 pr-3 font-mono-ui text-white/60">{k.id}</td>
                    <td className="hidden py-3 pr-3 text-white/60 sm:table-cell">
                      {new Date(k.created_unix * 1000).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 text-right">
                      <button type="button" onClick={() => setConfirming(k.id)} className={quiet}>
                        revoke
                      </button>
                    </td>
                  </>
                )}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      <Error text={revokeError} />

      <form action={action} className="mt-6 flex flex-wrap gap-3">
        <label htmlFor="key-name" className="sr-only">
          Key name
        </label>
        <input
          id="key-name"
          name="name"
          maxLength={64}
          placeholder="what it's for, e.g. portfolio-site"
          disabled={full || disabled}
          className={`${input} min-w-0 flex-1`}
        />
        <button type="submit" disabled={pending || full || disabled} className={`${primary} relative overflow-hidden`}>
          {pending ? "Creating..." : "Create key"}
          {pending && <BusyLine />}
        </button>
      </form>
      {full && <p className="mt-3 text-[0.85rem] text-white/45">That&apos;s the limit of {max} keys. Revoke one to make another.</p>}
      <Error text={state.error} />
    </section>
  );
}

const TABS = ["curl", "Python", "TypeScript"] as const;

function Usage({ url, tenant, dim, qps, apiKey }: { url: string; tenant: string; dim: number; qps: number; apiKey: string }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("curl");
  const vec = `[${dim} numbers]`;
  const code = {
    curl: `export NUCLADB_API_KEY=${apiKey || "nk_..."}   # your key

# 1. store vectors. ids are whole numbers; the same id again replaces it.
#    Up to ${qps} vectors per request, and each vector counts toward ${qps}/s.
curl -s ${url}/v1/vectors:batch \\
  -H "Authorization: Bearer $NUCLADB_API_KEY" \\
  -d '{"vectors":[{"id":"1","values":${vec},"metadata":{"title":"Hello"},"tenant_id":"${tenant}"}]}'

# 2. search: returns the 5 stored vectors closest to the query
curl -s ${url}/v1/search \\
  -H "Authorization: Bearer $NUCLADB_API_KEY" \\
  -d '{"tenant_id":"${tenant}","query":${vec},"top_k":5}'`,
    Python: `import os, requests

URL = "${url}"
TENANT = "${tenant}"
HEADERS = {"Authorization": f"Bearer {os.environ['NUCLADB_API_KEY']}"}

# 1. store vectors. embedding is a list of ${dim} floats from your model.
#    ids are whole numbers as strings; send at most ${qps} vectors per request.
requests.post(f"{URL}/v1/vectors:batch", headers=HEADERS, json={
    "vectors": [{"id": "1", "values": embedding, "metadata": {"title": "Hello"}, "tenant_id": TENANT}],
}).raise_for_status()

# 2. search: the 5 stored vectors closest to query_embedding
res = requests.post(f"{URL}/v1/search", headers=HEADERS, json={
    "tenant_id": TENANT, "query": query_embedding, "top_k": 5,
})
for m in res.json().get("matches", []):
    print(m["id"], m["score"], m.get("metadata"))`,
    TypeScript: `const URL = "${url}";
const TENANT = "${tenant}";
const headers = { Authorization: \`Bearer \${process.env.NUCLADB_API_KEY}\` };

// 1. store vectors. embedding is a number[] of length ${dim} from your model.
//    ids are whole numbers as strings; send at most ${qps} vectors per request.
await fetch(\`\${URL}/v1/vectors:batch\`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    vectors: [{ id: "1", values: embedding, metadata: { title: "Hello" }, tenant_id: TENANT }],
  }),
});

// 2. search: the 5 stored vectors closest to queryEmbedding
const res = await fetch(\`\${URL}/v1/search\`, {
  method: "POST",
  headers,
  body: JSON.stringify({ tenant_id: TENANT, query: queryEmbedding, top_k: 5 }),
});
const { matches = [] } = await res.json();`,
  }[tab];

  return (
    <section className="mt-20">
      <h2 className="text-[1.05rem] font-medium">Use your key</h2>
      <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-white/55">
        Two calls cover most apps: store your vectors once, then search them. Your server URL and tenant_id are
        already filled in; swap in your key and your model&apos;s embeddings. Run these from your server, not the
        browser. The full REST reference is in the{" "}
        <Link href="/docs" className="underline decoration-white/30 underline-offset-4 hover:text-white">
          docs
        </Link>
        .
      </p>
      <div className="mt-5 border border-white/10">
        <div role="tablist" className="flex items-center border-b border-white/10">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`relative border-r border-white/10 px-4 py-2.5 font-mono-ui text-[0.8rem] transition-colors ${
                tab === t ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {tab === t && (
                <motion.span
                  layoutId="tab-marker"
                  className="absolute inset-x-0 -bottom-px h-[2px] bg-glow-cyan"
                  transition={{ duration: 0.3, ease }}
                />
              )}
              {t}
            </button>
          ))}
          <div className="ml-auto pr-2">
            <CopyButton text={code} dark />
          </div>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.pre
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="overflow-x-auto p-5 font-mono-ui text-[0.82rem] leading-relaxed text-white/80"
          >
            {code}
          </motion.pre>
        </AnimatePresence>
      </div>
    </section>
  );
}

// The three steps at the top; the first gets ticked once a key exists.
export function Steps({ hasKey }: { hasKey: boolean }) {
  const steps = [
    ["Create a key", "Give it a name below and copy the key it shows you. It's shown only once."],
    ["Keep it on your server", "Save it as an environment variable, e.g. NUCLADB_API_KEY. Never put it in browser code."],
    ["Send it with each request", "As a Bearer token, together with your tenant_id. Copy an example at the bottom."],
  ];
  return (
    <ol className="mb-14 grid border-y border-white/10 text-[0.92rem] md:grid-cols-3">
      {steps.map(([title, body], i) => (
        <li key={title} className="border-white/10 py-5 md:border-l md:px-6 md:first:border-l-0 md:first:pl-0">
          <span className="inline-flex w-5 font-mono-ui text-white/40">
            <AnimatePresence mode="wait" initial={false}>
              {i === 0 && hasKey ? (
                <motion.svg
                  key="tick"
                  viewBox="0 0 16 16"
                  className="mt-[3px] h-3.5 w-3.5 text-glow-cyan"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                >
                  <motion.path
                    d="M2.5 8.5l3.5 3.5 7.5-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                  />
                </motion.svg>
              ) : (
                <motion.span key="n" exit={{ opacity: 0 }}>
                  {i + 1}.
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <span className={`font-medium ${i === 0 && hasKey ? "text-white/60 line-through decoration-white/30" : ""}`}>{title}</span>
          <p className="mt-1.5 leading-relaxed text-white/55">{body}</p>
        </li>
      ))}
    </ol>
  );
}

// Fills from empty to the stored count when the page loads.
export function VectorBar({ used, max }: { used: number; max: number }) {
  return (
    <div className="mt-2 h-[3px] bg-white/10">
      <motion.div
        className="h-full bg-glow-cyan"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(used > 0 ? 1 : 0, Math.min(100, (used / max) * 100))}%` }}
        transition={{ duration: 0.9, ease, delay: 0.2 }}
      />
    </div>
  );
}

// Workbench holds the key you just created, so the curl example can use it
// without you pasting it back in. It lives in memory only.
export function Workbench({
  keys,
  max,
  disabled,
  url,
  tenant,
  dim,
  qps,
  aside,
}: {
  keys: KeyInfo[];
  max: number;
  disabled: boolean;
  url: string;
  tenant: string;
  dim: number;
  qps: number;
  aside: ReactNode;
}) {
  const [apiKey, setApiKey] = useState("");
  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <KeysPanel keys={keys} max={max} disabled={disabled} onCreated={setApiKey} />
        {aside}
      </div>
      <Usage url={url} tenant={tenant} dim={dim} qps={qps} apiKey={apiKey} />
    </MotionConfig>
  );
}
