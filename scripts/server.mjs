import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

// Lightweight static dev server that mirrors this site's Firebase Hosting
// config (public/, cleanUrls: true, trailingSlash: false, custom 404.html).
// Zero dependencies on purpose — the site itself ships no bundler.

const ROOT = resolve("public");
const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 5050);

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

const contentType = (path) =>
  CONTENT_TYPES[extname(path).toLowerCase()] || "application/octet-stream";

// Resolve a request pathname to a readable file inside ROOT, applying
// Firebase-style cleanUrls (/foo -> foo.html) and directory index fallback.
async function resolveFile(pathname) {
  const safe = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const base = join(ROOT, safe);
  if (!base.startsWith(ROOT + sep) && base !== ROOT) return null; // traversal guard

  const candidates = [];
  if (base === ROOT || pathname.endsWith("/")) {
    candidates.push(join(base, "index.html"));
  } else {
    candidates.push(base, `${base}.html`, join(base, "index.html"));
  }
  for (const candidate of candidates) {
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {
      // try next candidate
    }
  }
  return null;
}

function send(res, status, filePath, headers = {}) {
  res.writeHead(status, { "Content-Type": contentType(filePath), ...headers });
  if (res.req.method === "HEAD") return res.end();
  createReadStream(filePath).pipe(res);
}

const server = createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end("Method Not Allowed");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  // Mirror Firebase: cleanUrls strips ".html", trailingSlash:false drops "/".
  if (pathname.endsWith(".html")) {
    const clean = pathname.slice(0, -".html".length) || "/";
    res.writeHead(301, { Location: clean + url.search }).end();
    return;
  }
  if (pathname.length > 1 && pathname.endsWith("/")) {
    res.writeHead(301, { Location: pathname.slice(0, -1) + url.search }).end();
    return;
  }

  const file = await resolveFile(pathname);
  if (file) {
    send(res, 200, file);
    return;
  }

  const notFound = join(ROOT, "404.html");
  try {
    await stat(notFound);
    send(res, 404, notFound);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("404 Not Found");
  }
});

server.listen(PORT, HOST, () => {
  const shown = HOST === "0.0.0.0" ? "localhost" : HOST;
  console.log(`RiverLaunch site serving public/ at http://${shown}:${PORT}`);
});
