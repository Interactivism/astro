/**
 * Typography lint — straight apostrophes in user-facing text.
 *
 * Scans all .astro files in src/ and reports any straight apostrophe (U+0027)
 * found within a word ([a-zA-Z]'[a-zA-Z]), excluding:
 *   - Astro frontmatter blocks  (--- … ---)
 *   - Single-line code/JSDoc comments  (// … and * …)
 *   - HTML comments  <!-- … -->  (single- or multi-line)
 *   - <script> blocks
 *   - <style> blocks
 *
 * Frontmatter JS is excluded because esbuild rejects non-ASCII characters in
 * certain token positions in dev mode; use the ’ escape there instead.
 *
 * Markdown/MDX files are exempt — remark-smartypants handles them at build time.
 *
 * Usage:
 *   node scripts/lint-typography.mjs    exits 1 on violations
 *   npm run lint:typography
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const srcDir      = resolve(projectRoot, 'src');

// ── helpers ──────────────────────────────────────────────────────────────────

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (entry.endsWith('.astro')) files.push(full);
  }
  return files;
}

const STRAIGHT_IN_WORD = /[a-zA-Z]'[a-zA-Z]/;

// ── scan ─────────────────────────────────────────────────────────────────────

let violations = 0;

for (const file of walk(srcDir)) {
  const rel   = file.replace(projectRoot + '/', '');
  const lines = readFileSync(file, 'utf8').split('\n');

  let inFrontmatter = lines[0]?.trim() === '---'; // true until closing ---
  let frontmatterClosed = false;
  let inHtmlComment = false;
  let inScript      = false;
  let inStyle       = false;

  for (let i = 0; i < lines.length; i++) {
    const raw     = lines[i];
    const trimmed = raw.trim();

    // ── frontmatter (--- … ---) ──────────────────────────────────────────────
    if (inFrontmatter && !frontmatterClosed) {
      if (i > 0 && trimmed === '---') frontmatterClosed = true;
      continue;
    }

    // ── block state ──────────────────────────────────────────────────────────
    if (inHtmlComment) {
      if (raw.includes('-->')) inHtmlComment = false;
      continue;
    }
    if (raw.includes('<!--')) {
      if (!raw.includes('-->')) inHtmlComment = true;
      continue; // skip the opening line regardless
    }

    if (/<script[\s>]/.test(raw)) inScript = true;
    if (/<\/script>/.test(raw))  { inScript = false; continue; }
    if (inScript) continue;

    if (/<style[\s>]/.test(raw)) inStyle = true;
    if (/<\/style>/.test(raw))   { inStyle = false; continue; }
    if (inStyle) continue;

    // ── line exclusions ──────────────────────────────────────────────────────
    if (/^\s*(\/\/|\*|#)/.test(trimmed)) continue; // code / JSDoc comments

    // ── check ────────────────────────────────────────────────────────────────
    if (STRAIGHT_IN_WORD.test(raw)) {
      console.error(`  ${rel}:${i + 1}  ${trimmed}`);
      violations++;
    }
  }
}

if (violations > 0) {
  console.error(
    `\n✖  ${violations} straight apostrophe(s) in user-facing text.` +
    `\n   Use ' (U+2019) instead of ' (U+0027).`
  );
  process.exit(1);
} else {
  console.log('✓  No straight apostrophes in user-facing text.');
}
