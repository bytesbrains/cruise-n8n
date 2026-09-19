#!/usr/bin/env node
/**
 * Fail the build if package.json is not a valid n8n community package shape.
 * Mirrors what n8n's community scanner expects before we ever publish.
 */
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const failures = [];

if (!pkg.name?.startsWith("n8n-nodes-") && !pkg.name?.includes("/n8n-nodes-")) {
  failures.push(`name must start with n8n-nodes- (got ${pkg.name})`);
}
if (!pkg.keywords?.includes("n8n-community-node-package")) {
  failures.push("keywords must include n8n-community-node-package");
}
if (!pkg.n8n || typeof pkg.n8n !== "object") {
  failures.push('missing top-level "n8n" object');
} else {
  if (!Number.isInteger(pkg.n8n.n8nNodesApiVersion) || pkg.n8n.n8nNodesApiVersion < 1) {
    failures.push("n8n.n8nNodesApiVersion must be a positive integer");
  }
  if (pkg.n8n.aiNodeSdkVersion != null) {
    if (!Number.isInteger(pkg.n8n.aiNodeSdkVersion) || pkg.n8n.aiNodeSdkVersion < 1) {
      failures.push("n8n.aiNodeSdkVersion must be a positive integer when set");
    }
    if (!pkg.peerDependencies?.["@n8n/ai-node-sdk"]) {
      failures.push('aiNodeSdkVersion requires peerDependencies["@n8n/ai-node-sdk"]');
    }
  }
  if (!Array.isArray(pkg.n8n.nodes) || pkg.n8n.nodes.length === 0) {
    failures.push("n8n.nodes must be a non-empty array");
  } else {
    for (const p of pkg.n8n.nodes) {
      if (typeof p !== "string" || !p.startsWith("dist/")) {
        failures.push(`n8n.nodes entry must be a dist/ path (got ${p})`);
      }
    }
  }
  if (pkg.n8n.credentials) {
    for (const p of pkg.n8n.credentials) {
      if (typeof p !== "string" || !p.startsWith("dist/")) {
        failures.push(`n8n.credentials entry must be a dist/ path (got ${p})`);
      }
    }
  }
}

if (failures.length) {
  console.error("check:package failed:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}

console.log("check:package ok");
