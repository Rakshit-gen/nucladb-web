"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  LIMITS,
  METRICS,
  NucladbError,
  createTenant,
  issueKey,
  listKeys,
  revokeKey,
  tenantFor,
  type Metric,
  type Workspace,
} from "@/lib/nucladb-admin";

export type ActionResult = { error?: string; key?: string };

async function workspace(): Promise<{ userId: string; ws?: Workspace }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  const user = await (await clerkClient()).users.getUser(userId);
  return { userId, ws: user.privateMetadata.nucladb as Workspace | undefined };
}

function message(e: unknown) {
  if (e instanceof NucladbError) {
    return e.status === 503 ? "The NuclaDB server didn't answer. It may be waking up; try again in 30 seconds." : e.message;
  }
  return "Something went wrong. Try again.";
}

export async function setUpIndex(_: ActionResult, form: FormData): Promise<ActionResult> {
  const { userId, ws: existing } = await workspace();
  if (existing) return { error: "Your index is already set up." };
  const dim = Number(form.get("dim"));
  const metric = String(form.get("metric")) as Metric;
  if (!Number.isInteger(dim) || dim < 2 || dim > 4096) return { error: "Dimension must be a whole number from 2 to 4096." };
  if (!METRICS.includes(metric)) return { error: "Pick a distance metric." };

  const ws: Workspace = { tenant: tenantFor(userId), dim, metric };
  try {
    await createTenant(ws);
  } catch (e) {
    return { error: message(e) };
  }
  await (await clerkClient()).users.updateUserMetadata(userId, { privateMetadata: { nucladb: ws } });
  revalidatePath("/console");
  return {};
}

export async function createKey(_: ActionResult, form: FormData): Promise<ActionResult> {
  const { ws } = await workspace();
  if (!ws) return { error: "Set up your index first." };
  const name = String(form.get("name") ?? "").trim() || "default";
  if (name.length > 64) return { error: "Keep the name under 64 characters." };
  try {
    const keys = await listKeys(ws.tenant);
    if (keys.length >= LIMITS.keys) {
      return { error: `You can have ${LIMITS.keys} keys at a time. Revoke one to make another.` };
    }
    const { key } = await issueKey(ws.tenant, name);
    revalidatePath("/console");
    return { key };
  } catch (e) {
    return { error: message(e) };
  }
}

export async function revoke(id: string): Promise<ActionResult> {
  const { ws } = await workspace();
  if (!ws) return { error: "Set up your index first." };
  try {
    // Only revoke a key this user owns.
    if (!(await listKeys(ws.tenant)).some((k) => k.id === id)) return { error: "No such key." };
    await revokeKey(id);
  } catch (e) {
    return { error: message(e) };
  }
  revalidatePath("/console");
  return {};
}
