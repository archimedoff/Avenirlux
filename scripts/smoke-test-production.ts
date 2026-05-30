#!/usr/bin/env npx tsx
/** Smoke-test a deployed AvenirLux instance. Usage: npx tsx scripts/smoke-test-production.ts [baseUrl] */
const SMOKE_BASE = (process.argv[2] || process.env.SMOKE_BASE_URL || "https://avenirlux.vercel.app").replace(/\/$/, "");

const ROUTES: { path: string; expect: number; label: string }[] = [
  { path: "/", expect: 200, label: "Homepage" },
  { path: "/hotels", expect: 200, label: "Hotel search" },
  { path: "/hotels?city=Paris", expect: 200, label: "City search" },
  { path: "/concierge", expect: 200, label: "Concierge" },
  { path: "/auth", expect: 200, label: "Sign in" },
  { path: "/destinations/paris", expect: 200, label: "Destination page" },
  { path: "/robots.txt", expect: 200, label: "Robots" },
  { path: "/sitemap.xml", expect: 200, label: "Sitemap" },
  { path: "/api/health", expect: 200, label: "Health (may 503 if DB unset)" },
];

async function run() {
  console.log(`\nSmoke test: ${SMOKE_BASE}\n`);
  let fail = 0;
  for (const r of ROUTES) {
    try {
      const res = await fetch(`${SMOKE_BASE}${r.path}`, { redirect: "follow" });
      const ok = r.path === "/api/health" ? res.status === 200 || res.status === 503 : res.status === r.expect;
      console.log(`  ${ok ? "✓" : "✗"} ${r.label.padEnd(20)} ${res.status}`);
      if (!ok) fail++;
      if (r.path === "/" && ok) {
        const html = await res.text();
        if (!html.includes("<title>")) { console.log("    WARN: missing title tag"); fail++; }
        if (html.includes("og:image") || html.includes("opengraph")) console.log("    OG metadata present");
      }
    } catch (e) {
      console.log(`  ✗ ${r.label.padEnd(20)} ERROR ${e}`);
      fail++;
    }
  }
  console.log(fail ? "\nSome checks failed.\n" : "\nAll smoke tests passed.\n");
  process.exit(fail ? 1 : 0);
}

run();
