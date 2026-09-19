#!/usr/bin/env node
/**
 * Pack the npm tarball and refuse to ship if gitleaks finds a Cruise key
 * (or anything else) inside it. A published secret is a revoke, not a revert.
 */
import { execFileSync, execSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = mkdtempSync(join(tmpdir(), "cruise-n8n-pack-"));

try {
  execSync("npm pack --pack-destination " + JSON.stringify(dir), {
    cwd: root,
    stdio: "inherit",
  });
  const tgz = readdirSync(dir).find((f) => f.endsWith(".tgz"));
  if (!tgz) throw new Error("npm pack produced no .tgz");
  console.log("packed", join(dir, tgz));

  execFileSync(
    "gitleaks",
    ["detect", "--source", dir, "--no-git", "--redact", "--no-banner", "--config", join(root, ".gitleaks.toml")],
    { stdio: "inherit" },
  );
  console.log("pack:check ok");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
