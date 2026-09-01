import { ImageResponse } from "next/og";

export const alt = "NuclaDB: Not a wrapper around Qdrant. The thing Qdrant is made of.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY_950 = "#070b1a";
const GLOW_CYAN = "#7fe3d4";
const GLOW_VIOLET = "#a78bfa";
const GLOW_AMBER = "#f2c879";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: NAVY_950,
          backgroundImage: [
            `radial-gradient(ellipse 900px 500px at 82% 18%, ${GLOW_CYAN}33, transparent 60%)`,
            `radial-gradient(ellipse 700px 500px at 100% 100%, ${GLOW_VIOLET}2e, transparent 60%)`,
            `radial-gradient(circle at 4px 4px, #ffffff14 2px, transparent 0)`,
          ].join(", "),
          backgroundSize: "auto, auto, 44px 44px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: GLOW_CYAN,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 30,
              height: 30,
              borderRadius: 8,
              background: GLOW_CYAN,
            }}
          />
          NuclaDB
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 44,
            fontSize: 62,
            fontWeight: 600,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            maxWidth: 980,
          }}
        >
          <div style={{ display: "flex" }}>Not a wrapper around Qdrant.</div>
          <div style={{ display: "flex", color: GLOW_CYAN, fontStyle: "italic" }}>
            The thing Qdrant is made of.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 25,
            lineHeight: 1.5,
            color: "#ffffff99",
            maxWidth: 820,
          }}
        >
          A vector search engine written from scratch in Go: HNSW, product
          quantization, a crash-safe WAL, and a Raft-coordinated cluster.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            marginTop: 52,
            fontSize: 21,
            color: "#ffffff70",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", width: 8, height: 8, borderRadius: 999, background: GLOW_CYAN }} />
            github.com/Rakshit-gen/NuclaDB
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", width: 8, height: 8, borderRadius: 999, background: GLOW_AMBER }} />
            Benchmarked against Qdrant
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
