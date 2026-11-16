import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { NuclaMark } from "@/components/icons";

export const metadata: Metadata = {
  title: "Console",
  robots: { index: false },
};

const appearance = {
  variables: {
    colorPrimary: "#3fa596",
    colorPrimaryForeground: "#070b1a",
    colorBackground: "#0c1226",
    colorForeground: "#e7e9f6",
    colorMutedForeground: "#9aa2c4",
    colorInput: "#070b1a",
    colorInputForeground: "#e7e9f6",
    colorNeutral: "#e7e9f6",
    borderRadius: "0px",
    fontFamily: "var(--font-sans)",
  },
};

export default function ConsoleLayout({ children }: LayoutProps<"/console">) {
  return (
    <ClerkProvider signInUrl="/console/sign-in" appearance={appearance}>
      <div className="flex min-h-screen flex-col bg-navy-950 text-white">
        <header className="border-b border-white/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-5">
              <Link href="/" className="flex items-center gap-2 text-[0.95rem] font-semibold tracking-tight">
                <NuclaMark size={22} />
                NuclaDB
              </Link>
              <span className="h-4 w-px bg-white/15" />
              <Link href="/console" className="font-mono-ui text-[0.8rem] text-white/70 hover:text-white">
                console
              </Link>
            </div>
            <div className="flex items-center gap-6 font-mono-ui text-[0.8rem] text-white/60">
              <Link href="/docs" className="hover:text-white">
                docs
              </Link>
              <UserButton />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-14 pb-24">{children}</main>
      </div>
    </ClerkProvider>
  );
}
