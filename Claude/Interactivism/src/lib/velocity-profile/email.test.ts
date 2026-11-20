/**
 * Internal notification tests.
 *
 * The subject line is the part Erik actually scans, so its exact shape is
 * pinned here. The body is checked for the facts a first call needs rather
 * than for formatting.
 */

import { describe, expect, it } from 'vitest';
import { buildInternalNotification } from './email';
import { scoreSubmission, type Answers } from './scoring';
import type { SubmissionRecord } from './storage';

const ANSWERS: Answers = {
  q1: 'q1-a', q2: 'q2-a', q3: 'q3-a', q4: 'q4-b', q5: 'q5-b', q6: 'q6-c',
  q7: 'q7-d', q8: 'q8-c', q9: 'q9-d', q10: 'q10-c',
  q11: ['q11-a', 'q11-e'], q12: 'q12-b',
};

/** `lead` REPLACES the default rather than merging, so a test can model an
 *  empty one. Results are always rescored from the lead actually used. */
function record(overrides: Partial<SubmissionRecord> = {}): SubmissionRecord {
  const lead = overrides.lead ?? {
    name: 'Jane Doe',
    level: 'vp' as const,
    fn: 'product' as const,
    company: 'Acme',
    industry: 'enterprise-saas' as const,
    walkthrough: true,
  };
  return {
    id: 'a'.repeat(32),
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:05:00.000Z',
    stage: 'complete',
    email: 'jane@acme.com',
    answers: ANSWERS,
    lead,
    results: scoreSubmission({ answers: ANSWERS, ...lead }, 180_000),
    attribution: { utm_source: 'linkedin', utm_campaign: 'vp-test', referrer: null },
    meta: { loadedCost: 180_000 },
    ...overrides,
  };
}

describe('buildInternalNotification', () => {
  it('uses the subject format from the spec', () => {
    const message = buildInternalNotification(record(), 'https://interactivism.com');
    expect(message.subject).toBe('[Velocity Profile][Hot] Jane Doe, VP Product, Acme');
  });

  it('reflects the tier in the subject', () => {
    const cold = buildInternalNotification(
      record({ lead: { name: 'Sam Lee', level: 'other', fn: 'other', company: 'Tiny', walkthrough: false } }),
      'https://interactivism.com',
    );
    expect(cold.subject).toMatch(/^\[Velocity Profile\]\[(Hot|Warm|Cold)\] /);
    expect(cold.subject).toContain('Sam Lee');
  });

  it('falls back to the email when the post-gate fields are empty', () => {
    const message = buildInternalNotification(record({ lead: {} }), 'https://interactivism.com');
    // No walkthrough, level or industry: team (+3), rework (+2), intent (+3).
    expect(message.subject).toBe('[Velocity Profile][Warm] jane@acme.com');
  });

  it('leaves "Other" out of the subject instead of printing it', () => {
    const message = buildInternalNotification(
      record({ lead: { name: 'Sam Lee', level: 'other', fn: 'other', company: 'Tiny' } }),
      'https://interactivism.com',
    );
    expect(message.subject).toBe('[Velocity Profile][Warm] Sam Lee, Tiny');
  });

  it('carries the archetype, cost, intent, focus and opening question', () => {
    const { text } = buildInternalNotification(record(), 'https://interactivism.com');

    expect(text).toContain('Feature Factory with a Committee streak');
    expect(text).toContain('$4.7M–$8.2M a year');
    expect(text).toContain('130 people × $180,000 × 20–35%');
    expect(text).toContain('A major launch or redesign');
    expect(text).toContain('Cost-cutting');
    expect(text).toContain('Make the product easier to learn and sell');
    expect(text).toContain('What did you ship last quarter that you’d remove if you could?');
    expect(text).toContain('YES — they asked for a call');
  });

  it('lists the flags and itemizes the score', () => {
    const { text } = buildInternalNotification(record(), 'https://interactivism.com');

    expect(text).toContain('slow-time-to-value');
    expect(text).toContain('high-howto-tickets');
    expect(text).toContain('+5  Walkthrough requested');
    expect(text).toContain('+3  Level: VP or C-level');
  });

  it('includes attribution and a working report link', () => {
    const { text } = buildInternalNotification(record(), 'https://interactivism.com');

    expect(text).toContain('utm_source: linkedin');
    expect(text).toContain(`https://interactivism.com/velocity-profile/report/${'a'.repeat(32)}`);
  });

  it('replies to the respondent, not to the notification address', () => {
    expect(buildInternalNotification(record(), 'https://x.test').replyTo).toBe('jane@acme.com');
  });

  it('says so plainly when the cost could not be calculated', () => {
    const partial = record({
      answers: { q1: 'q1-a', q2: 'q2-a', q3: 'q3-a', q4: 'q4-a', q5: 'q5-a', q6: 'q6-a' },
      results: scoreSubmission({ answers: { q1: 'q1-a', q2: 'q2-a', q3: 'q3-a' } }, 180_000),
    });
    expect(buildInternalNotification(partial, 'https://x.test').text).toContain('Not calculated');
  });

  it('notes when a tiebreak decided the archetype', () => {
    // F×2, C×2, E×2 — settled by Q2
    const tied: Answers = {
      ...ANSWERS,
      q1: 'q1-a', q2: 'q2-b', q3: 'q3-a', q4: 'q4-b', q5: 'q5-c', q6: 'q6-c',
    };
    const { text } = buildInternalNotification(
      record({ answers: tied, results: scoreSubmission({ answers: tied }, 180_000) }),
      'https://x.test',
    );
    expect(text).toContain('tie broken by Q2');
  });
});
