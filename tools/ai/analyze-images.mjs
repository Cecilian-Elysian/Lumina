#!/usr/bin/env node
/* ============================================================
 * Lumina — 分析 viewer 当前所有图片 URL
 * ------------------------------------------------------------
 * 把 config.js 中的兜底图(以及可选的上游图床图片)
 * 列出来供 build-focal-points.mjs 使用。
 *
 * 用法:
 *   node ai/analyze-images.mjs             → 仅打印 URL 列表
 *   node ai/analyze-images.mjs --json      → 输出 JSON 数组
 * ============================================================ */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readViewerConfig } from '../server/lib/config-reader.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [];
  })
);

async function main() {
  const CONFIG = await readViewerConfig();
  const urls = CONFIG.fallbackImages || [];

  if (args.json) {
    console.log(JSON.stringify(urls, null, 2));
  } else {
    console.log(`📊 共 ${urls.length} 张兜底图:\n`);
    urls.forEach((u, i) => console.log(`${String(i+1).padStart(3, ' ')}. ${u}`));
  }
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});