// Runs on every Netlify deploy (see netlify.toml).
// 1. Stamps CSS/JS URLs with the commit so caches can't serve stale assets.
// 2. Scans /videos and injects the playlist into index.html. Each video's
//    title is its file name without the extension, e.g.
//    "videos/diegointhedark - 500pts.mp4" -> "diegointhedark - 500pts".
//    An image with the same name (.jpg/.jpeg/.png/.webp) is used as its poster.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { extname, basename } from "node:path";

const VIDEO_EXT = { ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/mp4", ".m4v": "video/mp4" };
const POSTER_EXT = [".jpg", ".jpeg", ".png", ".webp"];

const files = existsSync("videos") ? readdirSync("videos") : [];
const videos = files
  .filter((f) => !f.startsWith(".") && VIDEO_EXT[extname(f).toLowerCase()])
  .sort((a, b) => a.localeCompare(b))
  .map((f) => {
    const title = basename(f, extname(f));
    const poster = files.find((p) => basename(p, extname(p)) === title && POSTER_EXT.includes(extname(p).toLowerCase()));
    return {
      title,
      src: "videos/" + encodeURIComponent(f),
      type: VIDEO_EXT[extname(f).toLowerCase()],
      ...(poster ? { poster: "videos/" + encodeURIComponent(poster) } : {}),
    };
  });

const buildId = process.env.COMMIT_REF || "dev";
const json = JSON.stringify(videos).replace(/</g, "\\u003c");

let html = readFileSync("index.html", "utf8");
html = html.replaceAll("__BUILD_ID__", buildId).replace("/*__VIDEOS__*/[]", json);
writeFileSync("index.html", html);

console.log(`Playlist: ${videos.length} video(s)`);
for (const v of videos) console.log("  -", v.title);
