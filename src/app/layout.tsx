import type { Metadata } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
import "./globals.css";

const sans = Inter_Tight({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic", "normal"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const siteUrl = "https://nucladb-web.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NuclaDB: Not a wrapper around Qdrant. The thing Qdrant is made of.",
    template: "%s · NuclaDB",
  },
  description:
    "A vector similarity search engine written from scratch in Go: HNSW indexing, product quantization, a crash-safe WAL, mmap snapshots, multi-tenancy, and a Raft-coordinated distributed cluster, benchmarked head-to-head against Qdrant, honestly.",
  openGraph: {
    title: "NuclaDB: the thing vector databases are made of",
    description:
      "HNSW, product quantization, WAL durability, multi-tenancy, and a Raft-coordinated cluster, built from scratch in Go and benchmarked head-to-head against Qdrant.",
    url: siteUrl,
    siteName: "NuclaDB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NuclaDB: the thing vector databases are made of",
    description:
      "A vector search engine built from scratch in Go, benchmarked head-to-head against Qdrant, including where it loses.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <RootProvider theme={{ forcedTheme: "light", enableSystem: false }}>{children}</RootProvider>
      </body>
    </html>
  );
}
