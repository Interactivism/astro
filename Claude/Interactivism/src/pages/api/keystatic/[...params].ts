export const prerender = false;

import { makeHandler } from '@keystatic/astro/api';
import config          from '../../../../keystatic.config';
import { execSync }    from 'node:child_process';

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
  const env = (process.env.KEYSTATIC_EDITOR_NAME ?? '').trim();
  if (env) return env;
  try { return execSync('git config user.name', { encoding: 'utf8' }).trim(); } catch (_) {}
  try { return execSync('git config user.email', { encoding: 'utf8' }).trim(); } catch (_) {}
  return 'Unknown';
}

async function stampRequest(request: Request): Promise<Request> {
  // Only stamp in local / dev mode — GitHub mode records identity via OAuth commits.
  if (process.env.NODE_ENV !== 'development') return request;

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
  const req = await stampRequest(context.request);
  return _handler({ ...context, request: req });
}

export const ALL = handler;
export const GET = handler;
export const POST = handler;
