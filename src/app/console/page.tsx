import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  LIMITS,
  NUCLADB_URL,
  NucladbError,
  ensureTenant,
  listKeys,
  type KeyInfo,
  type Workspace,
} from "@/lib/nucladb-admin";
import { CopyButton } from "@/components/copy-button";
import { SetupForm, Steps, VectorBar, Workbench } from "./console-client";

export const dynamic = "force-dynamic";

export default async function ConsolePage() {
  const user = await currentUser();
  if (!user) redirect("/console/sign-in");
  const ws = user.privateMetadata.nucladb as Workspace | undefined;

  if (!ws) {
    return (
      <>
        <Heading title="Set up your index">
          An index is where your vectors live. You get one, and every key you
          create can read and write it. Tell us what kind of vectors you&apos;ll
          store; this is a one-time step.
        </Heading>
        <SetupForm />
      </>
    );
  }

  let vectors = 0;
  let keys: KeyInfo[] = [];
  let down = "";
  try {
    [vectors, keys] = await Promise.all([
      ensureTenant(ws),
      listKeys(ws.tenant),
    ]);
  } catch (e) {
    down =
      e instanceof NucladbError && e.status !== 503
        ? e.message
        : "The NuclaDB server didn't answer. The free instance sleeps when idle and takes about 30 seconds to wake; reload the page in a moment.";
  }

  return (
    <>
      <Heading title="API keys">
        A key lets your app store and search vectors in your index. It works on
        your index only.
      </Heading>

      <Steps hasKey={keys.length > 0} />

      {down && (
        <p className="mb-10 border-l-2 border-glow-amber pl-4 text-[0.95rem] text-white/80">
          {down}
        </p>
      )}

      <Workbench
        keys={keys}
        max={LIMITS.keys}
        disabled={!!down}
        url={NUCLADB_URL}
        tenant={ws.tenant}
        dim={ws.dim}
        qps={LIMITS.qps}
        aside={
          <aside>
            <h2 className="text-[1.05rem] font-medium">Connection details</h2>
            <p className="mt-1 text-[0.82rem] text-white/45">
              What your app needs besides the key.
            </p>
            <dl className="mt-4 border-t border-white/10 text-[0.88rem]">
              <Row
                label="Server URL"
                value={NUCLADB_URL}
                hint="Where your app sends requests."
                copy
              />
              <Row
                label="tenant_id"
                value={ws.tenant}
                hint="Your index's name. Put it in every request."
                copy
              />
              <Row
                label="Vector length"
                value={String(ws.dim)}
                hint="Every vector you send must have this many numbers."
              />
              <Row
                label="Distance"
                value={ws.metric}
                hint="How similarity between vectors is measured."
              />
              <Row
                label="Rate limit"
                value={`${LIMITS.qps} requests/s`}
                hint={`Each vector in a batch counts as one, so batches hold at most ${LIMITS.qps}. Faster gets HTTP 429; wait and retry.`}
              />
              <div className="border-b border-white/10 py-3">
                <div className="flex justify-between">
                  <dt className="text-white/50">Vectors stored</dt>
                  <dd className="font-mono-ui">
                    {vectors.toLocaleString()} /{" "}
                    {LIMITS.vectors.toLocaleString()}
                  </dd>
                </div>
                <VectorBar used={vectors} max={LIMITS.vectors} />
              </div>
            </dl>
            <p className="mt-4 text-[0.82rem] leading-relaxed text-white/45">
              The server runs on a free instance. It sleeps when idle, so the
              first request after a break can take about 30 seconds, and stored
              vectors are cleared when it redeploys. Your keys and settings are
              kept, so have your app re-send its vectors if the count above
              drops to 0.
            </p>
          </aside>
        }
      />
    </>
  );
}

function Heading({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <header className="mb-12 max-w-2xl">
      <h1 className="text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-medium tracking-[-0.04em]">
        {title}
      </h1>
      <p className="mt-4 text-[1.02rem] leading-relaxed text-white/60">
        {children}
      </p>
    </header>
  );
}

function Row({
  label,
  value,
  hint,
  copy,
}: {
  label: string;
  value: string;
  hint: string;
  copy?: boolean;
}) {
  return (
    <div className="border-b border-white/10 py-3">
      <div className="flex items-center justify-between gap-3">
        <dt className="shrink-0 text-white/50">{label}</dt>
        <dd className="flex min-w-0 items-center gap-1 font-mono-ui">
          <span className="truncate" title={value}>
            {value}
          </span>
          {copy && <CopyButton text={value} dark />}
        </dd>
      </div>
      <p className="mt-1 text-[0.78rem] text-white/35">{hint}</p>
    </div>
  );
}
