/**
 * POST /api/velocity-profile/submit
 *
 * Two stages against one record:
 *   stage "email"    — the gate. Stores answers + email, returns the token.
 *   stage "complete" — post-gate fields. Rescores and notifies.
 *
 * Splitting it this way means an email captured at the gate survives even if
 * the respondent abandons the fields below it. Those records stay at
 * stage "email" and are recoverable from Blobs.
 *
 * Nothing the client computed is trusted. Every result on the record is
 * recomputed here from the submitted option IDs.
 */
import type { APIRoute } from 'astro';
import {
  DEFAULT_LOADED_COST,
  FUNCTIONS,
  LEAD_INDUSTRIES,
  LEVELS,
  QUESTIONS,
  type Fn,
  type LeadIndustry,
  type Level,
} from '../../../data/velocity-profile';
import { scoreSubmission, type Answers } from '../../../lib/velocity-profile/scoring';
import {
  checkRateLimit,
  clientIp,
  createToken,
  getSubmission,
  hashIp,
  putSubmission,
  type Attribution,
  type LeadFields,
  type SubmissionRecord,
} from '../../../lib/velocity-profile/storage';
import {
  sendInternalNotification,
  sendReportEmail,
} from '../../../lib/velocity-profile/email';
import { getArchetypeContent } from '../../../lib/velocity-profile/content';
import { buildReport, renderReportEmail } from '../../../lib/velocity-profile/report';
import { ARCHETYPES } from '../../../data/velocity-profile';

export const prerender = false;

// ── Validation tables, enumerated from the config ──────────────
const SINGLE_IDS = QUESTIONS.filter((q) => !q.multi).map((q) => q.id);
const MULTI_IDS = QUESTIONS.filter((q) => q.multi).map((q) => q.id);
const OPTIONS_BY_QUESTION = new Map<string, Set<string>>(
  QUESTIONS.map((q) => [q.id, new Set<string>(q.options.map((o) => o.id))]),
);

const LEVEL_VALUES = new Set<string>(LEVELS.map((l) => l.value));
const FN_VALUES = new Set<string>(FUNCTIONS.map((f) => f.value));
const INDUSTRY_VALUES = new Set<string>(LEAD_INDUSTRIES.map((i) => i.value));

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_TEXT = 200;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });

/** Trim, cap length, and drop anything that is not a string. */
function text(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, MAX_TEXT);
  return trimmed || undefined;
}

/** Keep only option IDs that belong to the question they were submitted under. */
function parseAnswers(raw: unknown): { answers: Answers; missing: string[] } {
  const submitted = (raw ?? {}) as Record<string, unknown>;
  const answers: Record<string, string | string[]> = {};
  const missing: string[] = [];

  for (const id of SINGLE_IDS) {
    const value = submitted[id];
    if (typeof value === 'string' && OPTIONS_BY_QUESTION.get(id)!.has(value)) answers[id] = value;
    else missing.push(id);
  }

  for (const id of MULTI_IDS) {
    const value = submitted[id];
    const picked = Array.isArray(value)
      ? value.filter((v): v is string => typeof v === 'string' && OPTIONS_BY_QUESTION.get(id)!.has(v))
      : [];
    if (picked.length) answers[id] = picked;
    else missing.push(id);
  }

  return { answers: answers as Answers, missing };
}

function parseAttribution(raw: unknown): Attribution | null {
  if (!raw || typeof raw !== 'object') return null;
  const out: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^(utm_[a-z_]{1,20}|gclid|fbclid|referrer|landedAt)$/.test(key)) continue;
    if (typeof value === 'string') out[key] = value.slice(0, MAX_TEXT);
    else if (value === null) out[key] = null;
  }
  return Object.keys(out).length ? (out as Attribution) : null;
}

function parseLeadFields(raw: unknown): LeadFields {
  const body = (raw ?? {}) as Record<string, unknown>;
  const level = text(body.level);
  const fn = text(body.fn);
  const industry = text(body.industry);

  return {
    name: text(body.name),
    company: text(body.company),
    level: level && LEVEL_VALUES.has(level) ? (level as Level) : undefined,
    fn: fn && FN_VALUES.has(fn) ? (fn as Fn) : undefined,
    industry: industry && INDUSTRY_VALUES.has(industry) ? (industry as LeadIndustry) : undefined,
    walkthrough: body.walkthrough === true,
  };
}

function loadedCost(): number {
  const raw = Number(process.env.VELOCITY_LOADED_COST);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_LOADED_COST;
}

export const POST: APIRoute = async ({ request, url }) => {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Malformed request.' }, 400);
  }

  // Honeypot. Bots fill every field they find; real users never see this one.
  if (text(payload['vp-bot'])) return json({ ok: true, token: createToken() });

  const siteUrl = url.origin;
  const stage = payload.stage === 'complete' ? 'complete' : 'email';

  // Only stage "email" is rate limited. It is the one that creates records;
  // stage "complete" needs a token that only stage 1 can issue, so it is
  // already gated. Charging both stages to the same budget meant every honest
  // respondent spent two of their allowance and could be cut off halfway
  // through, having already handed over their email.
  if (stage === 'email' && !(await checkRateLimit(await hashIp(clientIp(request))))) {
    return json({ error: 'Too many submissions from this network. Try again later.' }, 429);
  }

  // ── Stage 2: post-gate fields on an existing record ──────────
  if (stage === 'complete') {
    const token = text(payload.token);
    const existing = token ? await getSubmission(token) : null;
    if (!existing) return json({ error: 'Unknown submission.' }, 404);

    existing.lead = parseLeadFields(payload.lead);
    existing.stage = 'complete';
    existing.updatedAt = new Date().toISOString();
    // Level and industry only arrive now, and both feed the lead score.
    existing.results = scoreSubmission(
      { answers: existing.answers, ...existing.lead },
      existing.meta.loadedCost,
    );

    await putSubmission(existing);

    // Both sends are best-effort. The lead is already stored; a 500 here would
    // make the respondent retry and lose the fields they just filled, and the
    // report is readable on the web either way.
    try {
      const report = buildReport(existing, await getArchetypeContent());
      const text = renderReportEmail(
        report,
        `${siteUrl}/velocity-profile/report/${existing.id}`,
        `${siteUrl}/book?src=velocity-profile-report`,
        existing.lead.name?.trim().split(/\s+/)[0],
      );
      const sent = await sendReportEmail(
        existing,
        text,
        ARCHETYPES[existing.results.archetype.primary].name,
      );
      if (!sent.ok) console.error('[velocity-profile] Report email failed:', sent.error);
    } catch (error) {
      console.error('[velocity-profile] Could not build the report email:', error);
    }

    const notified = await sendInternalNotification(existing, siteUrl);
    if (!notified.ok) {
      console.error('[velocity-profile] Internal notification failed:', notified.error);
    }

    return json({
      ok: true,
      token: existing.id,
      walkthrough: Boolean(existing.lead.walkthrough),
      bookingUrl: existing.lead.walkthrough ? '/book?src=velocity-profile' : null,
    });
  }

  // ── Stage 1: the gate ────────────────────────────────────────
  const email = text(payload.email);
  if (!email || !EMAIL.test(email)) {
    return json({ error: 'Enter an email address we can reach you at.' }, 400);
  }

  const { answers, missing } = parseAnswers(payload.answers);
  if (missing.length) {
    return json({ error: 'Some questions are unanswered.', missing }, 400);
  }

  const cost = loadedCost();
  const now = new Date().toISOString();
  const record: SubmissionRecord = {
    id: createToken(),
    createdAt: now,
    updatedAt: now,
    stage: 'email',
    email,
    answers,
    lead: {},
    results: scoreSubmission({ answers }, cost),
    attribution: parseAttribution(payload.attribution),
    meta: { loadedCost: cost },
  };

  await putSubmission(record);

  return json({ ok: true, token: record.id });
};
