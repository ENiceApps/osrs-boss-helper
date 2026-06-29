// Social-share card (Open Graph + Twitter) generated at build time. This is what
// renders when the site link is pasted into Discord / Reddit / X. Drawn with
// next/og (Satori) — flexbox + a subset of CSS only, no Tailwind, no grid.
// Colours mirror the "Midnight Gilded" theme in app/globals.css.
import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const alt = `${SITE_NAME} — DPS-optimised OSRS loadouts built from your own bank`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#d4af37";
const BG = "#0d0f12";
const TEXT = "#ece6d8";
const MUTED = "#9a917f";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: BG,
          // Subtle gold glow so the card isn't a flat rectangle.
          backgroundImage: `radial-gradient(circle at 25% 15%, rgba(212,175,55,0.16), transparent 55%)`,
          fontFamily: "sans-serif",
        }}
      >
        {/* Title row: a gold accent bar (the app's section-title motif) + name. */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              width: "14px",
              height: "96px",
              background: GOLD,
              borderRadius: "4px",
              marginRight: "32px",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 92,
              fontWeight: 700,
              color: GOLD,
              letterSpacing: "-2px",
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 40,
            color: TEXT,
            marginTop: "40px",
            maxWidth: "960px",
            lineHeight: 1.35,
          }}
        >
          {SITE_DESCRIPTION}
        </div>

        <div style={{ display: "flex", fontSize: 27, color: MUTED, marginTop: "56px" }}>
          osrsbosshelper.com · free &amp; open-source · nothing leaves your computer
        </div>
      </div>
    ),
    { ...size },
  );
}
