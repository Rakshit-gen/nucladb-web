import "server-only";
import { createHash } from "node:crypto";

// Calls the NuclaDB server with its admin key. Only the console's server
// code imports this; the admin key never reaches a browser.

export const NUCLADB_URL = (process.env.NUCLADB_URL ?? "https://nucladb-demo.onrender.com").replace(/\/$/, "");

// Every console user gets the same limits. The server enforces them per
// tenant (max_qps and max_vectors); the rest are the console's own. dim and
// indexes keep the free 512 MB instance from running out of memory: five
// full indexes at 1536 floats are about 300 MB of vectors.
export const LIMITS = { qps: 10, vectors: 10_000, keys: 3, dim: 1536, indexes: 5 } as const;

export const METRICS = ["cosine", "l2", "dot"] as const;
export type Metric = (typeof METRICS)[number];

// Stored in the Clerk user's private metadata, so the console can
// re-create the tenant with the same settings if the server loses it.
export type Workspace = { tenant: string; dim: number; metric: Metric };

export type KeyInfo = { id: string; name: string; tenants: string[]; created_unix: number; expires_unix?: number };
type TenantInfo = {
  tenant_id: string;
  vector_count?: number;
  dim?: number;
  quota?: { max_vectors?: number; max_qps?: number };
};

export class NucladbError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function tenantFor(userId: string) {
  return "u-" + createHash("sha256").update(userId).digest("hex").slice(0, 16);
}

async function call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const key = process.env.NUCLADB_ADMIN_KEY;
  if (!key) throw new NucladbError(500, "NUCLADB_ADMIN_KEY isn't set on the console's server");
  let res: Response;
  try {
    res = await fetch(NUCLADB_URL + path, {
      method: init.method ?? "GET",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      // The free Render instance can take ~30s to wake up.
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    throw new NucladbError(503, "The NuclaDB server didn't answer");
  }
  const text = await res.text();
  if (!res.ok) {
    let message = text;
    try {
      message = JSON.parse(text).error ?? text;
    } catch {}
    throw new NucladbError(res.status, message);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

// ensureTenant makes sure the user's tenant exists with the fixed limits,
// re-creating it if the server lost it (the free demo has no disk), and
// returns how many vectors it holds.
export async function ensureTenant(ws: Workspace): Promise<number> {
  const { tenants = [] } = await call<{ tenants?: TenantInfo[] }>("/v1/tenants");
  const t = tenants.find((t) => t.tenant_id === ws.tenant);
  if (!t) {
    await createTenant(ws);
    return 0;
  }
  if (t.quota?.max_qps !== LIMITS.qps || t.quota?.max_vectors !== LIMITS.vectors) {
    await call(`/v1/tenants/${ws.tenant}/quota`, {
      method: "PUT",
      body: { max_qps: LIMITS.qps, max_vectors: LIMITS.vectors },
    });
  }
  return t.vector_count ?? 0;
}

export async function createTenant(ws: Workspace) {
  try {
    await call("/v1/tenants", {
      method: "POST",
      body: { tenant_id: ws.tenant, dim: ws.dim, metric: ws.metric, max_qps: LIMITS.qps, max_vectors: LIMITS.vectors },
    });
  } catch (e) {
    if (!(e instanceof NucladbError && e.status === 409)) throw e;
  }
}

export async function listKeys(tenant: string): Promise<KeyInfo[]> {
  const { keys = [] } = await call<{ keys?: KeyInfo[] }>("/v1/keys");
  // Only keys scoped to exactly this tenant belong to the user; the admin
  // key and keys for other tenants never show up here.
  return keys.filter((k) => k.tenants.length === 1 && k.tenants[0] === tenant);
}

export async function issueKey(tenant: string, name: string) {
  return call<{ key: string; info: KeyInfo }>("/v1/keys", { method: "POST", body: { name, tenants: [tenant] } });
}

export async function revokeKey(id: string) {
  await call(`/v1/keys/${encodeURIComponent(id)}`, { method: "DELETE" });
}
