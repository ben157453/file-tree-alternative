import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

const root = process.cwd();
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const version = pkg.version;
const outDir = path.join(root, "dist", version);

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

// Copy styles.css
const cssSrc = path.join(root, "styles.css");
const cssDst = path.join(outDir, "styles.css");
if (existsSync(cssSrc)) {
  copyFileSync(cssSrc, cssDst);
}

// Copy manifest.json
const manifestSrc = path.join(root, "manifest.json");
const manifestDst = path.join(outDir, "manifest.json");
if (existsSync(manifestSrc)) {
  // Ensure version in manifest matches package.json version
  const manifest = JSON.parse(readFileSync(manifestSrc, "utf8"));
  manifest.version = version;
  writeFileSync(manifestDst, JSON.stringify(manifest, null, "\t"));
}
