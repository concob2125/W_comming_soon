const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "dist");

const entries = [
  "index.html",
  "assets",
  "public",
  "CommingSoon",
  "Geometrydashiver",
];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const entry of entries) {
  const source = path.join(root, entry);
  const target = path.join(out, entry);

  if (!fs.existsSync(source)) continue;

  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.cpSync(source, target, { recursive: true });
  } else {
    fs.copyFileSync(source, target);
  }
}

console.log("Built WEARSHIVER static site to dist/");
