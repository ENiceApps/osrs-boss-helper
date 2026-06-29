// Generated favicon — a minimal gold sword on the app's dark field, drawn with
// flexbox primitives (no emoji/font dependency, so the build needs no network).
// Replaces the default Next.js favicon.ico.
import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

const GOLD = "#d4af37";
const BG = "#0d0f12";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          borderRadius: "12px",
        }}
      >
        {/* Sword silhouette, top → bottom: pommel · crossguard · blade. */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", width: "12px", height: "12px", background: GOLD, borderRadius: "6px" }} />
          <div style={{ display: "flex", width: "34px", height: "7px", background: GOLD, borderRadius: "2px" }} />
          <div style={{ display: "flex", width: "9px", height: "30px", background: GOLD, borderRadius: "0 0 3px 3px" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
