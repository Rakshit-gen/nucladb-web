import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
import "./globals.css";

const sans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
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
    "An open-source vector database written in Go: HNSW search, a crash-safe write-ahead log, mmap snapshots and per-tenant API keys, benchmarked against Qdrant.",
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
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <RootProvider theme={{ forcedTheme: "light", enableSystem: false }}>{children}</RootProvider>
      </body>
    </html>
  );
}
