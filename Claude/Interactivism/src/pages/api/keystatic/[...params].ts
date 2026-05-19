export const prerender = false;

import { makeHandler } from '@keystatic/astro/api';
import config          from '../../../../keystatic.config';
import { execSync }    from 'node:child_process';
import { existsSync, renameSync } from 'node:fs';
import { resolve }     from 'node:path';

const _handler = makeHandler({
  config,
  clientId:           process.env.KEYSTATIC_GITHUB_CLIENT_ID,
  clientSecret:       process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
  secret:             process.env.KEYSTATIC_SECRET,
  localBaseDirectory: process.cwd(),
});

// ── meta-stamp logic ────────────────────────────────────────────────────────
// Intercepts the Keystatic "update" save request in local mode and injects
// lastUpdatedBy + lastUpdatedAt into any case study MDX file being written.
// Identity: KEYSTATIC_EDITOR_NAME env var → git config user.name → user.email.
//
// The Keystatic update payload is:
//   { additions: [{ path: string, contents: <base64url> }], deletions: [...] }

const CASE_STUDY_RE = /^src\/content\/caseStudies\/[^/]+\.mdx$/;

function b64urlToString(s: string): string {
  // base64url → base64 → Buffer → UTF-8
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(b64, 'base64').toString('utf8');
}
function stringToB64url(s: string): string {
  return Buffer.from(s, 'utf8').toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function setFrontmatterField(md: string, key: string, value: string): string {
  const line = `${key}: ${JSON.stringify(value)}`;
  const re   = new RegExp(`^${key}:.*$`, 'm');
  return re.test(md)
    ? md.replace(re, line)
    : md.replace(/^(---\r?\n)/, `$1${line}\n`);
}

function editorName(): string {
  const env = (import.meta.env.KEYSTATIC_EDITOR_NAME ?? '').trim();
  if (env) return env;
  try { return execSync('git config user.name', { encoding: 'utf8' }).trim(); } catch (_) {}
  try { return execSync('git config user.email', { encoding: 'utf8' }).trim(); } catch (_) {}
  return 'Unknown';
}

// ── slug-rename logic ────────────────────────────────────────────────────────
// Keystatic handles the MDX file and the content-dir hero images automatically
// (via additions/deletions in the payload).  What it cannot know about are the
// public/images/slideshows/[slug]/ directories and the Slideshow component paths
// embedded in MDX body text — those we fix here.
//
// Detection: a rename is a request that deletes exactly one case-study MDX and
// adds exactly one case-study MDX in the same call, with different slugs.

const SLUG_FROM_PATH = /^src\/content\/caseStudies\/([^/]+)\.mdx$/;

async function renameSlugAssets(request: Request): Promise<Request> {
  if (!import.meta.env.DEV) return request;

  const urlPath = new URL(request.url, 'https://x').pathname;
  if (request.method !== 'POST' || !urlPath.endsWith('/update')) return request;

  let body: { additions?: { path: string; contents: string }[]; deletions?: { path: string }[] };
  try { body = await request.clone().json(); } catch { return request; }

  // Collect deleted and added case-study slugs
  const deletedSlugs = (body.deletions ?? [])
    .map(d => d?.path?.match(SLUG_FROM_PATH)?.[1])
    .filter((s): s is string => !!s);

  const addedMdx = (body.additions ?? [])
    .filter(a => SLUG_FROM_PATH.test(a?.path ?? ''));

  // Require exactly one-to-one rename
  if (deletedSlugs.length !== 1 || addedMdx.length !== 1) return request;

  const oldSlug = deletedSlugs[0];
  const newSlug = addedMdx[0].path.match(SLUG_FROM_PATH)![1];
  if (oldSlug === newSlug) return request;

  // 1. Rename the public slideshow directory if it exists
  const root = process.cwd();
  const oldDir = resolve(root, 'public', 'images', 'slideshows', oldSlug);
  const newDir = resolve(root, 'public', 'images', 'slideshows', newSlug);
  if (existsSync(oldDir)) {
    try {
      renameSync(oldDir, newDir);
      console.log(`[keystatic] renamed slideshow dir: ${oldSlug} → ${newSlug}`);
    } catch (e) {
      console.error(`[keystatic] failed to rename slideshow dir: ${e}`);
    }
  }

  // 2. Update /images/slideshows/[old]/ → /images/slideshows/[new]/ in MDX body
  const oldRef = `/images/slideshows/${oldSlug}/`;
  const newRef = `/images/slideshows/${newSlug}/`;

  const newBody = {
    ...body,
    additions: body.additions!.map(a => {
      if (!SLUG_FROM_PATH.test(a.path)) return a;
      try {
        const md = b64urlToString(a.contents).replaceAll(oldRef, newRef);
        return { ...a, contents: stringToB64url(md) };
      } catch { return a; }
    }),
  };

  return new Request(request.url, {
    method:  request.method,
    headers: new Headers(request.headers),
    body:    JSON.stringify(newBody),
  });
}

async function stampRequest(request: Request): Promise<Request> {
  // Only stamp in local / dev mode — GitHub mode records identity via OAuth commits.
  // TODO (go-live): extend this to GitHub mode. Options: (a) extract the GitHub
  // user from the Keystatic session JWT (signed with KEYSTATIC_SECRET), or (b)
  // a GitHub Actions workflow that stamps frontmatter after Keystatic commits.
  if (!import.meta.env.DEV) return request;

  // Only intercept POST …/update
  const path = new URL(request.url, 'https://x').pathname;
  if (request.method !== 'POST' || !path.endsWith('/update')) return request;

  let body: { additions?: { path: string; contents: string }[]; deletions?: unknown[] };
  try { body = await request.clone().json(); } catch { return request; }

  if (!body.additions?.some(a => CASE_STUDY_RE.test(a?.path))) return request;

  const editor = editorName();
  const now    = new Date().toISOString();

  const newBody = {
    ...body,
    additions: body.additions!.map(a => {
      if (!CASE_STUDY_RE.test(a.path)) return a;
      try {
        let md = b64urlToString(a.contents);
        md = setFrontmatterField(md, 'lastUpdatedBy', editor);
        md = setFrontmatterField(md, 'lastUpdatedAt', now);
        return { ...a, contents: stringToB64url(md) };
      } catch { return a; }
    }),
  };

  return new Request(request.url, {
    method:  request.method,
    headers: new Headers(request.headers),
    body:    JSON.stringify(newBody),
  });
}

// ── route handler ────────────────────────────────────────────────────────────

async function handler(context: Parameters<typeof _handler>[0]) {
  let req = await renameSlugAssets(context.request);
  req = await stampRequest(req);
  return _handler({ ...context, request: req });
}

export const ALL = handler;
export const GET = handler;
export const POST = handler;
