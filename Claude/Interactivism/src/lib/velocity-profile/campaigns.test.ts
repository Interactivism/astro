/**
 * Campaign key tests — the open flow.
 *
 * Three things are pinned here: which keys open the gate, what an open record
 * holds (and does not), and that the key table stays on the server.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { ARCHETYPES, LEAD_INDUSTRIES, type ArchetypeTag } from '../../data/velocity-profile';
import {
  CAMPAIGN_KEY,
  allCampaigns,
  buildOpenRecord,
  campaignAttribution,
  resolveCampaign,
} from './campaigns';
import { buildInternalNotification, buildReportEmail, sendReportEmail } from './email';
import { buildReplyLink, buildReport, type ArchetypeContent } from './report';
import { scoreSubmission, type Answers } from './scoring';
import type { SubmissionRecord } from './storage';

const ANSWERS: Answers = {
  q1: 'q1-a', q2: 'q2-a', q3: 'q3-a', q4: 'q4-b', q5: 'q5-b', q6: 'q6-c',
  q7: 'q7-d', q8: 'q8-c', q9: 'q9-d', q10: 'q10-c',
  q11: ['q11-a'], q12: 'q12-b',
};

const CONTENT = Object.fromEntries(
  (Object.keys(ARCHETYPES) as ArchetypeTag[]).map((tag) => [
    tag,
    {
      tag,
      title: ARCHETYPES[tag].name,
      strengthCopy: `${tag} strength copy.`,
      failureModeCopy: `${tag} failure copy.`,
      moves: [
        { title: `${tag} move 1`, body: 'body 1' },
        { title: `${tag} move 2`, body: 'body 2' },
        { title: `${tag} move 3`, body: 'body 3' },
      ],
      draft: false,
    } satisfies ArchetypeContent,
  ]),
) as Record<ArchetypeTag, ArchetypeContent>;

/** The first configured open key, so the tests follow the table rather than a copy of it. */
const OPEN = allCampaigns().find((item) => item.open && item.active)!;

function openRecord(): SubmissionRecord {
  return buildOpenRecord({
    answers: ANSWERS,
    campaign: OPEN,
    attribution: { referrer: 'https://mail.example/', landedAt: '2026-12-01T16:00:00.000Z', utm_source: 'spoofed' },
    loadedCost: 180_000,
    now: '2026-12-01T16:03:00.000Z',
  });
}

function gatedRecord(): SubmissionRecord {
  return {
    id: 'c'.repeat(32),
    createdAt: '', updatedAt: '', stage: 'complete',
    email: 'jane@acme.com',
    answers: ANSWERS,
    lead: {},
    results: scoreSubmission({ answers: ANSWERS }, 180_000),
    attribution: null,
    meta: { loadedCost: 180_000 },
  };
}

afterEach(() => {
  delete process.env.VELOCITY_CAMPAIGNS_OFF;
});

// ── The table ──────────────────────────────────────────────────

describe('campaign table', () => {
  it('has at least one open key to test against', () => {
    expect(OPEN).toBeDefined();
  });

  it('holds only well-formed, unique keys with a real industry', () => {
    const industries = new Set<string>(LEAD_INDUSTRIES.map((item) => item.value));
    const keys = allCampaigns().map((item) => item.key);

    expect(new Set(keys).size).toBe(keys.length);
    for (const campaign of allCampaigns()) {
      expect(campaign.key).toMatch(CAMPAIGN_KEY);
      expect(industries.has(campaign.industry)).toBe(true);
    }
  });
});

// ── Resolution ─────────────────────────────────────────────────

describe('resolveCampaign', () => {
  it('resolves every active key, ignoring case and stray whitespace', () => {
    for (const campaign of allCampaigns().filter((item) => item.active)) {
      expect(resolveCampaign(campaign.key)?.key).toBe(campaign.key);
      expect(resolveCampaign(` ${campaign.key.toUpperCase()} `)?.key).toBe(campaign.key);
    }
  });

  it('returns null for anything that is not a live key, and never throws', () => {
    const bad: unknown[] = [
      undefined, null, '', 42, {}, [], ['adtech-t3'],
      'no-such-key', '../etc', 'a b', '<script>', 'x'.repeat(41), '-leading-hyphen',
      '__proto__', 'constructor',
    ];
    for (const value of bad) expect(resolveCampaign(value)).toBeNull();
  });

  it('refuses a key switched off from the environment, and only that key', () => {
    process.env.VELOCITY_CAMPAIGNS_OFF = ` other-key, ${OPEN.key.toUpperCase()} `;
    expect(resolveCampaign(OPEN.key)).toBeNull();

    const others = allCampaigns().filter((item) => item.active && item.key !== OPEN.key);
    for (const campaign of others) expect(resolveCampaign(campaign.key)).not.toBeNull();
  });
});

// ── The open record ────────────────────────────────────────────

describe('buildOpenRecord', () => {
  it('stores no email and no identity', () => {
    const record = openRecord();

    expect(record.stage).toBe('open');
    expect(record.campaign).toBe(OPEN.key);
    expect('email' in record).toBe(false);
    expect(record.lead).toEqual({ industry: OPEN.industry });
    expect(record.id).toMatch(/^[0-9a-f]{32}$/);
  });

  it('takes its attribution from the campaign, over what the browser sent', () => {
    const { attribution } = openRecord();

    expect(attribution).toMatchObject(campaignAttribution(OPEN));
    expect(attribution?.utm_source).toBe('outbound');
    expect(attribution?.utm_campaign).toBe(OPEN.key);
    // The browser's referrer and landing time are kept.
    expect(attribution?.referrer).toBe('https://mail.example/');
    expect(attribution?.landedAt).toBe('2026-12-01T16:00:00.000Z');
  });

  it('scores with the campaign industry', () => {
    const record = openRecord();
    expect(record.results).toEqual(
      scoreSubmission({ answers: ANSWERS, industry: OPEN.industry }, 180_000),
    );
  });
});

// ── Everything that reads a record ─────────────────────────────

describe('an open record downstream', () => {
  it('builds a full report with no email and no detail fields', () => {
    const report = buildReport(openRecord(), CONTENT);

    expect(report.archetype.name).toBeTruthy();
    expect(report.industryNote).toBeTruthy();
    expect(report.moves).toHaveLength(3);
    expect(report.cost).not.toBeNull();
  });

  it('gets a notification that names the campaign and nobody else', () => {
    const record = openRecord();
    const message = buildInternalNotification(record, 'https://interactivism.com');
    const archetype = ARCHETYPES[record.results.archetype.primary].name;

    expect(message.subject).toBe(`[Velocity Profile][Open] ${OPEN.key}: ${archetype}`);
    expect(message.replyTo).toBeUndefined();
    expect(message.text).toContain(`campaign "${OPEN.key}"`);
    expect(message.text).toContain('Do not mention this result');
    expect(message.text).toContain(`https://interactivism.com/velocity-profile/report/${record.id}`);
    expect(message.text).not.toContain('undefined');
  });

  it('is never sent a report email', async () => {
    const record = openRecord();
    expect(buildReportEmail(record, 'text', 'Committee').to).toBe('');
    expect(await sendReportEmail(record, 'text', 'Committee')).toEqual({ ok: true, skipped: true });
  });
});

// ── "Send my result" ───────────────────────────────────────────

describe('buildReplyLink', () => {
  const url = 'https://interactivism.com/velocity-profile/report/abc';

  it('exists for an open record and carries the archetype and the report link', () => {
    const record = openRecord();
    const report = buildReport(record, CONTENT);
    const reply = buildReplyLink(record, report, url, 'partner@example.com')!;

    expect(reply.subject).toBe(`My Velocity Profile: ${report.archetype.name}`);
    expect(reply.body).toContain(report.archetype.name);
    expect(reply.body).toContain(url);
    if (report.archetype.secondaryName) {
      expect(reply.body).toContain(`${report.archetype.secondaryName} streak`);
    }

    expect(reply.href.startsWith('mailto:partner@example.com?subject=')).toBe(true);
    const query = new URLSearchParams(reply.href.split('?')[1]);
    expect(query.get('subject')).toBe(reply.subject);
    expect(query.get('body')).toBe(reply.body);
  });

  it('does not exist for a gated record', () => {
    const record = gatedRecord();
    expect(buildReplyLink(record, buildReport(record, CONTENT), url, 'partner@example.com')).toBeNull();
  });

  it('does not exist without an address to send to', () => {
    const record = openRecord();
    expect(buildReplyLink(record, buildReport(record, CONTENT), url, '')).toBeNull();
  });
});

// ── The table stays on the server ──────────────────────────────

describe('the key table does not reach the browser', () => {
  const src = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

  /** Every .astro file under src/, enumerated rather than listed by hand. */
  function astroFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) return astroFiles(path);
      return name.endsWith('.astro') ? [path] : [];
    });
  }

  /** The client code in an .astro file: its <script> blocks, minus the frontmatter. */
  function clientScripts(source: string): string {
    const body = source.replace(/^---[\s\S]*?\n---/, '');
    return (body.match(/<script[\s\S]*?<\/script>/g) ?? []).join('\n');
  }

  it('finds .astro files to check', () => {
    expect(astroFiles(src).length).toBeGreaterThan(0);
  });

  it('is imported by no client script, and no key is written into one', () => {
    for (const file of astroFiles(src)) {
      const scripts = clientScripts(readFileSync(file, 'utf8'));
      expect(scripts, file).not.toMatch(/campaigns/);
      for (const campaign of allCampaigns()) expect(scripts, file).not.toContain(campaign.key);
    }
  });

  it('is not imported by the quiz page at all, frontmatter included', () => {
    const quiz = readFileSync(join(src, 'pages', 'velocity-profile', 'index.astro'), 'utf8');
    expect(quiz).not.toMatch(/from ['"][^'"]*campaigns['"]/);
    for (const campaign of allCampaigns()) expect(quiz).not.toContain(campaign.key);
  });
});
