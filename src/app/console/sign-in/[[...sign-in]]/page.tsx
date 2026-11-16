import { SignIn } from "@clerk/nextjs";
import { LIMITS } from "@/lib/nucladb-admin";

export default function SignInPage() {
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-start">
      <div className="max-w-lg">
        <h1 className="text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-medium tracking-[-0.04em]">
          Get an API key for NuclaDB
        </h1>
        <p className="mt-5 text-[1.05rem] leading-relaxed text-white/60">
          Sign in and you get your own index on the hosted NuclaDB server, plus keys that can read and write it.
          Nothing to install; it speaks plain HTTP and JSON.
        </p>
        <dl className="mt-10 border-t border-white/10 font-mono-ui text-[0.85rem]">
          {[
            ["Requests", `${LIMITS.qps} per second`],
            ["Vectors", LIMITS.vectors.toLocaleString("en")],
            ["Keys", `${LIMITS.keys} at a time`],
            ["Price", "free"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-white/10 py-3">
              <dt className="text-white/50">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <SignIn path="/console/sign-in" fallbackRedirectUrl="/console" />
    </div>
  );
}
