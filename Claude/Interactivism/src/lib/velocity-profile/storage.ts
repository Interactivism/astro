/**
 * Velocity Profile — submission storage.
 *
 * Netlify Blobs in production, an in-memory map in dev.
 *
 * The dev fallback exists because astro.config.mjs deliberately skips the
 * Netlify adapter under `npm run dev` (its middleware breaks Keystatic's local
 * API), so there is no Netlify runtime for `getStore()` to attach to. Rather
 * than require `netlify dev` for every local run, an unavailable store falls
 * back to a map on globalThis, which survives Vite's module reloads but not a
 * server restart. That is fine for local testing and means nothing touches
 * disk.
 *
 * Consequence worth knowing: the Blobs code path cannot be exercised locally.
 * It is verified by the first real submission after a deploy.
 *
 * Privacy: the record holds no IP address. Rate limiting hashes the IP and
 * keeps it in a separate, short-lived store that is never joined to a
 * submission.
 */

import type { ScoredSubmission, Answers } from './scoring';
import type { Fn, LeadIndustry, Level } from '../../data/velocity-profile';

// ============================================================
// Record
// ============================================================

export interface Attribution {
  readonly referrer?: string | null;
  readonly landedAt?: string;
  readonly [utm: string]: string | null | undefined;
}

export interface LeadFields {
  name?: string;
  level?: Level;
  fn?: Fn;
  company?: string;
  industry?: LeadIndustry;
  walkthrough?: boolean;
}

export interface SubmissionRecord {
  /** Also the blob key and the report token. Unguessable, no PII. */
  id: string;
  createdAt: string;
  updatedAt: string;
  /** 'email' = gated but post-gate fields not yet supplied. */
  stage: 'email' | 'complete';
  email: string;
  answers: Answers;
  lead: LeadFields;
  results: ScoredSubmission;
  attribution: Attribution | null;
  meta: { loadedCost: number };
}

export const SUBMISSIONS_STORE = 'velocity-profile';
export const RATE_STORE = 'velocity-profile-rate';

// ============================================================
// Token
// ============================================================

/** 32 hex characters from the platform CSPRNG. Unguessable, and carries no PII. */
export function createToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================
// Store access
// ============================================================

type Store = {
  get(key: string, opts?: { type: 'json' }): Promise<unknown>;
  setJSON(key: string, value: unknown): Promise<unknown>;
};

const memory: Map<string, Map<string, unknown>> =
  ((globalThis as Record<string, unknown>).__vpMemoryStores as Map<string, Map<string, unknown>>) ??
  ((globalThis as Record<string, unknown>).__vpMemoryStores = new Map());

function memoryStore(name: string): Store {
  if (!memory.has(name)) memory.set(name, new Map());
  const bucket = memory.get(name)!;
  return {
    async get(key) {
      return bucket.has(key) ? structuredClone(bucket.get(key)) : null;
    },
    async setJSON(key, value) {
      bucket.set(key, structuredClone(value));
    },
  };
}

let warned = false;

/**
 * Netlify Blobs when the runtime provides it, memory otherwise.
 *
 * `consistency: 'strong'` because both callers read-then-write: a rate-limit
 * counter and a two-step submission both give wrong answers on a stale read.
 */
export async function getStore(name: string): Promise<Store> {
  try {
    const { getStore: getNetlifyStore } = await import('@netlify/blobs');
    return getNetlifyStore({ name, consistency: 'strong' }) as unknown as Store;
  } catch (error) {
    if (!warned) {
      warned = true;
      console.warn(
        `[velocity-profile] Netlify Blobs unavailable (${
          error instanceof Error ? error.message : 'unknown'
        }). Falling back to in-memory storage. Expected under \`npm run dev\`; a problem anywhere else.`,
      );
    }
    return memoryStore(name);
  }
}

// ============================================================
// Submissions
// ============================================================

export async function putSubmission(record: SubmissionRecord): Promise<void> {
  const store = await getStore(SUBMISSIONS_STORE);
  await store.setJSON(record.id, record);
}

export async function getSubmission(id: string): Promise<SubmissionRecord | null> {
  if (!/^[0-9a-f]{32}$/.test(id)) return null;
  const store = await getStore(SUBMISSIONS_STORE);
  const record = (await store.get(id, { type: 'json' })) as SubmissionRecord | null;
  return record ?? null;
}

// ============================================================
// Rate limiting
// ============================================================

/**
 * 20 new submissions per hour per IP.
 *
 * Deliberately loose. Mobile carriers and large offices put many people behind
 * one address, and ad traffic is mostly mobile, so a tight limit locks out real
 * respondents long before it inconveniences anyone malicious. The honeypot and
 * per-question validation do more useful work than this does.
 */
export const RATE_LIMIT = { max: 20, windowMs: 60 * 60 * 1000 };

/** SHA-256 of the IP plus a server-side salt. Never stored on a submission. */
export async function hashIp(ip: string): Promise<string> {
  const salt = process.env.VELOCITY_RATE_SALT ?? 'velocity-profile';
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sliding window per IP.
 *
 * Honest about what this is: it raises the cost of casual abuse. Netlify Blobs
 * is eventually consistent even on a strong read, and a determined script
 * rotating IPs goes straight through. Netlify's own rate limiting is the real
 * answer and is a paid-plan feature.
 */
export async function checkRateLimit(ipHash: string, now = Date.now()): Promise<boolean> {
  try {
    const store = await getStore(RATE_STORE);
    const previous = ((await store.get(ipHash, { type: 'json' })) as number[] | null) ?? [];
    const recent = previous.filter((at) => now - at < RATE_LIMIT.windowMs);

    if (recent.length >= RATE_LIMIT.max) return false;

    recent.push(now);
    await store.setJSON(ipHash, recent);
    return true;
  } catch {
    // Never block a real submission because the counter failed.
    return true;
  }
}

/** Client IP from the proxy headers Netlify sets. */
export function clientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get('x-nf-client-connection-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  );
}
