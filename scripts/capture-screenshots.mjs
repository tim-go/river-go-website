// Regenerate the marketing screenshots from the running RiverLaunch app.
//
// This is a dev-time tool (the website itself ships no dependencies). It borrows
// Playwright from the sibling app repo, logs into a running app instance, captures
// the desktop + mobile views, frames the mobile shots in a device frame, and writes
// the final PNGs into public/assets/screenshots.
//
// Requirements:
//   - A running app instance. Capture against the live staging app with
//     APP_URL=https://staging.riverlaunch.app/ or a local dev server.
//   - Playwright installed in the app repo and a chromium browser downloaded
//     (`npx playwright install chromium`).
//
// Usage:
//   APP_URL=https://staging.riverlaunch.app/ APP_USER=you@example.com APP_PASS=secret \
//     node scripts/capture-screenshots.mjs
//
// Env overrides:
//   APP_URL           default http://localhost:6173/
//   APP_USER/APP_PASS login credentials (required)
//   OUT_DIR           default public/assets/screenshots
//   PLAYWRIGHT_CORE   path to a playwright-core install (default ../river-go/node_modules/playwright-core)
//   CHROME_EXE        path to a chromium binary (default: first match under ~/.cache/ms-playwright)

import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const require = createRequire(import.meta.url);

const APP_URL = process.env.APP_URL || "http://localhost:6173/";
const APP_USER = process.env.APP_USER;
const APP_PASS = process.env.APP_PASS;
const OUT = resolve(ROOT, process.env.OUT_DIR || "public/assets/screenshots");
const PW = process.env.PLAYWRIGHT_CORE || resolve(ROOT, "../river-go/node_modules/playwright-core");

if (!APP_USER || !APP_PASS) {
  console.error("Set APP_USER and APP_PASS env vars (a member login for the running app).");
  process.exit(1);
}

function findChromium() {
  if (process.env.CHROME_EXE) return process.env.CHROME_EXE;
  const base = resolve(homedir(), ".cache/ms-playwright");
  if (!existsSync(base)) throw new Error("No chromium found — run `npx playwright install chromium`.");
  for (const dir of readdirSync(base).filter((d) => d.startsWith("chromium-")).sort().reverse()) {
    for (const rel of ["chrome-linux64/chrome", "chrome-linux/chrome", "chrome-mac/Chromium.app/Contents/MacOS/Chromium"]) {
      const p = resolve(base, dir, rel);
      if (existsSync(p)) return p;
    }
  }
  throw new Error("No chromium binary found under ~/.cache/ms-playwright — run `npx playwright install chromium`.");
}

const { chromium } = require(PW);
const EXE = findChromium();
const browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });

async function login(page) {
  await page.goto(APP_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByLabel("Email").fill(APP_USER);
  await page.getByLabel("Password").fill(APP_PASS);
  await page.locator(".auth-form button[type=submit]").click();
  await page.waitForSelector(".auth-sheet", { state: "detached", timeout: 30000 });
  const notNow = page.getByRole("button", { name: "Not now" });
  if (await notNow.count().catch(() => 0)) await notNow.first().click().catch(() => {});
  await page.waitForTimeout(1200);
}

// nav by label; desktop uses the side rail, mobile the bottom bar.
const nav = (page, label, mobile) =>
  page.locator(mobile ? ".bottom-nav__item" : ".app-nav__item", { hasText: label }).first().click();

// The backend cold-starts (first calls 500), so gate on river cards appearing.
const waitRivers = async (page) => {
  await page.waitForSelector(".river-card", { timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll(".river-card").length > 5, undefined, { timeout: 30000 }).catch(() => {});
};

// Open a river detail panel from the Discover list and select a tab.
async function openRiver(page, tabLabel) {
  await page.locator(".river-card").first().click();
  await page.waitForSelector(".detail-panel--open", { timeout: 20000 });
  await page.waitForTimeout(2500);
  if (tabLabel) {
    const t = page.locator(".detail-panel button", { hasText: tabLabel });
    if (await t.count()) { await t.first().click(); await page.waitForTimeout(1800); }
  }
}

async function captureDesktop() {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await login(page);

  // Clean, chrome-free map for the marketing hero.
  await nav(page, "Map", false);
  await page.waitForSelector(".leaflet-container", { timeout: 20000 });
  await page.waitForTimeout(4500);
  await page.locator(".leaflet-container").screenshot({ path: resolve(OUT, "hero-map.png") });

  // Same map with the Layers panel expanded — shows the layer/filter system.
  await page.locator(".map-filter__expander").first().click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: resolve(OUT, "app-map-layers.png") });

  // Discover list.
  await nav(page, "Discover", false);
  await waitRivers(page);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: resolve(OUT, "app-discover.png") });

  // River detail panel (Levels tab).
  await openRiver(page, "Levels");
  await page.locator(".detail-panel").first().screenshot({ path: resolve(OUT, "app-river-detail.png") });

  console.log("desktop: hero-map, app-map-layers, app-discover, app-river-detail");
  await ctx.close();
}

async function captureMobile() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await login(page);

  await nav(page, "Map", true);
  await page.waitForSelector(".leaflet-container", { timeout: 20000 });
  await page.waitForTimeout(4000);
  const map = await page.screenshot();

  await nav(page, "Discover", true);
  await waitRivers(page);
  await page.waitForTimeout(2500);
  const discover = await page.screenshot();

  await openRiver(page, "Levels");
  const levels = await page.screenshot();
  const aboutTab = page.locator(".detail-panel button", { hasText: "About" });
  if (await aboutTab.count()) { await aboutTab.first().click(); await page.waitForTimeout(1600); }
  const about = await page.screenshot();
  await ctx.close();

  await frame([
    [map, "framed-phone-map.png"],
    [discover, "framed-phone-discover.png"],
    [levels, "framed-phone-levels.png"],
    [about, "framed-phone-about.png"],
  ]);
  console.log("mobile: framed-phone-{map,discover,levels,about}");
}

const frameHtml = (dataUri) => `<!doctype html><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box} html,body{background:transparent}
  #frame{display:inline-block;padding:70px 64px 96px}
  .phone{position:relative;width:360px;padding:12px;border-radius:46px;
    background:linear-gradient(150deg,#39456b,#10162b 60%);
    box-shadow:0 34px 70px rgba(2,5,16,.62),0 0 0 2px rgba(0,0,0,.5),
      inset 0 1px 0 rgba(165,190,255,.4),inset 0 0 0 1.5px rgba(120,150,230,.28)}
  .screen{position:relative;border-radius:34px;overflow:hidden;background:#05070f;line-height:0;
    box-shadow:inset 0 0 0 2px rgba(0,0,0,.7)}
  .screen img{width:100%;display:block}
  .btn{position:absolute;background:#222a44;border-radius:3px}
  .pwr{right:-3px;top:132px;width:3px;height:66px}
  .vol{left:-3px;top:108px;width:3px;height:40px}
  .vol2{left:-3px;top:156px;width:3px;height:40px}
</style><div id="frame"><div class="phone">
  <span class="btn vol"></span><span class="btn vol2"></span><span class="btn pwr"></span>
  <div class="screen"><img src="${dataUri}"></div>
</div></div>`;

async function frame(jobs) {
  const page = await browser.newPage({ viewport: { width: 560, height: 1000 }, deviceScaleFactor: 2 });
  for (const [buf, out] of jobs) {
    const uri = "data:image/png;base64," + buf.toString("base64");
    await page.setContent(frameHtml(uri), { waitUntil: "load" });
    await page.waitForTimeout(200);
    await page.locator("#frame").screenshot({ path: resolve(OUT, out), omitBackground: true });
  }
  await page.close();
}

await captureDesktop();
await captureMobile();
await browser.close();
console.log("Screenshots written to", OUT);
