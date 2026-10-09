import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  RELEASES,
  PLANNED,
  CURRENT_VERSION,
  compareSemVer,
  formatReleaseDate,
} from "@/data/updates";

// Guards the Updates tab data: well-formed, newest-first releases, the version
// in package.json kept in step, and a roadmap with no dates or novelty claims.

describe("updates data", () => {
  it("has releases and the current version is the newest", () => {
    expect(RELEASES.length).toBeGreaterThan(0);
    expect(RELEASES[0].version).toBe(CURRENT_VERSION);
  });

  it("has well-formed versions and dates", () => {
    for (const r of RELEASES) {
      expect(r.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(r.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${r.date}T00:00:00Z`).toISOString().slice(0, 10)).toBe(r.date);
    }
  });

  it("is ordered newest first with unique versions", () => {
    for (let i = 1; i < RELEASES.length; i++) {
      expect(compareSemVer(RELEASES[i - 1].version, RELEASES[i].version)).toBeGreaterThan(0);
      expect(RELEASES[i - 1].date >= RELEASES[i].date).toBe(true);
    }
  });

  it("gives every release a title and non-empty changes", () => {
    for (const r of RELEASES) {
      expect(r.title.trim()).not.toBe("");
      expect(r.changes.length).toBeGreaterThan(0);
      for (const c of r.changes) expect(c.text.trim()).not.toBe("");
    }
  });

  it("keeps package.json in step with the current version", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
    expect(pkg.version).toBe(CURRENT_VERSION);
  });

  it("keeps the roadmap short and undated", () => {
    expect(PLANNED.length).toBeGreaterThanOrEqual(4);
    expect(PLANNED.length).toBeLessThanOrEqual(8);
    const dated = /\b(20\d\d|Q[1-4]|soon|next (week|month)|by (spring|summer|fall|autumn|winter))\b/i;
    for (const p of PLANNED) expect(p.text).not.toMatch(dated);
  });

  it("makes no novelty claims", () => {
    const text = RELEASES.flatMap((r) => [...(r.note ?? []), ...r.changes.map((c) => c.text)]).join(
      "\n",
    );
    expect(text).not.toMatch(/\b(first|only) (tool|app|site)\b|nobody else|no other tool/i);
  });

  it("formats dates and compares versions numerically", () => {
    expect(formatReleaseDate("2026-10-09")).toBe("9 Oct 2026");
    expect(compareSemVer("1.10.0", "1.9.0")).toBeGreaterThan(0);
  });
});
