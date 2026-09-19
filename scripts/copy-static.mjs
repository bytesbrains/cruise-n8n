#!/usr/bin/env node
/**
 * Copy non-TS assets n8n expects beside compiled node files (icons).
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const icons = [
  "nodes/Cruise/cruise.svg",
  "nodes/LmChatCruise/cruise.svg",
];

for (const rel of icons) {
  const from = join(root, rel);
  const to = join(root, "dist", rel);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  console.log("copied", to);
}
