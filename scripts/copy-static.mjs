#!/usr/bin/env node
/**
 * Copy non-TS assets n8n expects beside compiled node files (icons).
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "nodes/Cruise/cruise.svg");
const to = join(root, "dist/nodes/Cruise/cruise.svg");
mkdirSync(dirname(to), { recursive: true });
copyFileSync(from, to);
console.log("copied", to);
