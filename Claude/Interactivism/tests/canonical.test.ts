/**
 * Every built page's canonical URL must be its own served URL.
 *
 * This test exists because of the shape of the failure it guards. A canonical
 * tag is emitted on all 60-odd routes from one expression in BaseLayout. If
 * that expression is ever wrong — pointing many pages at one URL, or at a URL
 * that redirects — the site deindexes. Nothing changes in the browser, nothing
 * fails to build, and the symptom surfaces in Search Console weeks later.
 *
 * So the value is asserted against reality rather than reasoned about: walk
 * `dist`, derive each page's URL from where the file actually sits, and compare.
 *
 * The expectations, and why each one:
 *
 *   - A page's canonical equals its own URL. Catches a value that drifts from
 *     the served path — most plausibly if `trailingSlash` or the Netlify
 *     adapter changes, since astro.config.mjs documents that `'ignore'` is a
 *     deliberate workaround for Keystatic OAuth and is therefore a setting
 *     somebody may revisit for reasons that have nothing to do with SEO.
 *   - Unless the entry declares one. A post republished from elsewhere points
 *     at the original. Read from the content files, not from a list kept here,
 *     so adding one cannot drift from the test.
 *   - A noindex page has none. Pointing a page that must not be indexed at one
 *     that should is contradictory.
 *   - canonical and og:url agree. They come from the same expression; if they
 *     ever disagree, one of them is being built some other way.
 *   - The sweep saw a plausible number of pages, so an empty or stale `dist`
 *     cannot pass vacuously.
 *
 * Needs a build. `npm test` on its own skips with a message rather than
 * failing, so the suite still runs without one — which does mean this only
 * bites when something has built first.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(projectRoot, 'dist');
const contentDir = resolve(projectRoot, 'src/content');
const SITE = 'https://interactivism.com';

/** Served at a 404 status, so it is never indexed and its URL is not a page. */
const NOT_A_PAGE = new Set(['404.html']);

function htmlFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) htmlFiles(full, found);
    else if (entry.endsWith('.html')) found.push(full);
  }
  return found;
}

/** The URL a built file is served at: dist/blog/x/index.html -> /blog/x/ */
function servedUrl(file: string): string {
  const rel = relative(distDir, file).split(sep).join('/');
  const path = rel.replace(/index\.html$/, '');
  return `${SITE}/${path}`;
}

const attr = (html: string, pattern: RegExp): string | null => {
  const match = html.match(pattern);
  return match ? match[1] : null;
};

const canonicalOf = (html: string) =>
  attr(html, /<link rel="canonical" href="([^"]*)"/);
const ogUrlOf = (html: string) =>
  attr(html, /<meta property="og:url" content="([^"]*)"/);
const isNoindex = (html: string) => /<meta name="robots" content="noindex/.test(html);

/**
 * Entries that declare their own canonical, read from the content files.
 * Keyed by the URL path the entry is published at.
 */
function declaredCanonicals(): Map<string, string> {
  const out = new Map<string, string>();
  const blogDir = resolve(contentDir, 'blog');
  if (!existsSync(blogDir)) return out;
  for (const entry of readdirSync(blogDir)) {
    if (!entry.endsWith('.mdx') && !entry.endsWith('.md')) continue;
    const source = readFileSync(resolve(blogDir, entry), 'utf8');
    const match = source.match(/^canonical:\s*["']?(https?:\/\/[^"'\s]+)["']?\s*$/m);
    if (match) {
      out.set(`${SITE}/blog/${entry.replace(/\.mdx?$/, '')}/`, match[1]);
    }
  }
  return out;
}

const built = existsSync(distDir) ? htmlFiles(distDir) : [];
const pages = built.filter((f) => !NOT_A_PAGE.has(relative(distDir, f)));

describe.skipIf(built.length === 0)('canonical URLs in the build', () => {
  const declared = declaredCanonicals();

  it('swept a plausible number of pages', () => {
    // Guards against a `dist` that exists but is empty or half-written, which
    // would let every other assertion here pass by having nothing to check.
    expect(pages.length).toBeGreaterThan(50);
  });

  it.each(pages.map((f) => [relative(distDir, f), f]))(
    '%s',
    (_label, file) => {
      const html = readFileSync(file as string, 'utf8');
      const url = servedUrl(file as string);
      const canonical = canonicalOf(html);

      if (isNoindex(html)) {
        expect(canonical, 'a noindex page must not point at an indexable one').toBeNull();
        return;
      }

      expect(canonical, 'every indexable page carries a canonical').not.toBeNull();
      expect(canonical).toBe(declared.get(url) ?? url);

      // Same expression builds both; a disagreement means one is built elsewhere.
      if (!declared.has(url)) expect(ogUrlOf(html)).toBe(canonical);
    },
  );

  it('points no two pages at the same URL', () => {
    // The deindexing failure, stated directly: many pages, one canonical.
    const seen = new Map<string, string[]>();
    for (const file of pages) {
      const html = readFileSync(file, 'utf8');
      if (isNoindex(html)) continue;
      const canonical = canonicalOf(html);
      if (!canonical) continue;
      seen.set(canonical, [...(seen.get(canonical) ?? []), relative(distDir, file)]);
    }
    const collisions = [...seen.entries()].filter(([, files]) => files.length > 1);
    expect(collisions, `collisions: ${JSON.stringify(collisions)}`).toEqual([]);
  });
});

describe.skipIf(built.length > 0)('canonical URLs in the build', () => {
  it('skipped: no dist/ — run `npm run build` first', () => {
    expect(built.length).toBe(0);
  });
});
