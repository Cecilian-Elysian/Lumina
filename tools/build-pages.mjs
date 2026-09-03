#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(toolsDir, '..');
const outputDir = path.join(projectRoot, 'dist');
const publicEntries = ['index.html', 'gallery.html', '404.html', 'css', 'js'];

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

for (const entry of publicEntries) {
  await fs.cp(
    path.join(projectRoot, entry),
    path.join(outputDir, entry),
    { recursive: true }
  );
}

console.log(`[build] Cloudflare Pages assets: ${publicEntries.join(', ')}`);
console.log(`[build] Output: ${outputDir}`);
