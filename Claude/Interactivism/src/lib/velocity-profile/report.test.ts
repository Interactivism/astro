/**
 * Report assembly tests.
 *
 * Also carries the invariants that keep the Keystatic content keys locked to
 * the code: an offering or industry note that exists in one place and not the
 * other is the exact drift this repo keeps getting bitten by.
 */

import { describe, expect, it } from 'vitest';
import {
  ARCHETYPES,
  INDUSTRY_NOTE_KEYS,
  OFFERINGS,
  QUESTIONS,
  industryNoteKey,
  type ArchetypeTag,
} from '../../data/velocity-profile';
import reportCopy from '../../data/velocity-report.json';
import { buildReport, renderReportEmail, type ArchetypeContent } from './report';
import { scoreSubmission, type Answers } from './scoring';
import type { SubmissionRecord } from './storage';

// ── Fixtures ───────────────────────────────────────────────────

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
      caseStudy: 'some-case-study',
      draft: true,
    } satisfies ArchetypeContent,
  ]),
) as Record<ArchetypeTag, ArchetypeContent>;

const ANSWERS: Answers = {
  q1: 'q1-a', q2: 'q2-a', q3: 'q3-a', q4: 'q4-b', q5: 'q5-b', q6: 'q6-c',
  q7: 'q7-d', q8: 'q8-c', q9: 'q9-d', q10: 'q10-c',
  q11: ['q11-a'], q12: 'q12-b',
};

function record(answers: Answers = ANSWERS, lead: SubmissionRecord['lead'] = {}): SubmissionRecord {
  return {
    id: 'b'.repeat(32),
    createdAt: '', updatedAt: '', stage: 'complete',
    email: 'jane@acme.com',
    answers,
    lead,
    results: scoreSubmission({ answers, ...lead }, 180_000),
    attribution: null,
    meta: { loadedCost: 180_000 },
  };
}

// ── Build ──────────────────────────────────────────────────────

describe('buildReport', () => {
  it('assembles all seven sections', () => {
    const report = buildReport(record(ANSWERS, { industry: 'fintech' }), CONTENT);

    expect(report.archetype.name).toBe('Feature Factory');
    expect(report.archetype.secondaryName).toBe('Committee');
    expect(report.archetype.strengthCopy).toBe('F strength copy.');
    expect(report.failureMode.copy).toBe('F failure copy.');
    expect(report.cost?.display).toBe('$4.7M–$8.2M');
    expect(report.industryNote).toBe(reportCopy.industryNotes.fintech);
    expect(report.moves).toHaveLength(3);
    expect(report.offering?.name).toBe('UX audit + product design');
  });

  it('quotes back at most three of their own answers', () => {
    const report = buildReport(record(), CONTENT);

    expect(report.failureMode.evidence).toHaveLength(3);
    expect(report.failureMode.evidence[0]).toEqual({
      prompt: 'After your last major release',
      answer: 'We debated whether it matched what we’d agreed to',
    });
    // Labels, never option IDs.
    for (const item of report.failureMode.evidence) {
      expect(item.answer).not.toMatch(/^q\d/);
    }
  });

  it('falls back to the generic industry note', () => {
    for (const industry of ['marcom', 'consumer', 'aerospace-defense', 'other', undefined] as const) {
      const report = buildReport(record(ANSWERS, { industry }), CONTENT);
      expect(report.industryNote).toBe(reportCopy.industryNotes.other);
    }
  });

  it('uses the specific note for the three priority industries', () => {
    for (const industry of ['adtech', 'enterprise-saas', 'fintech'] as const) {
      const report = buildReport(record(ANSWERS, { industry }), CONTENT);
      expect(report.industryNote).toBe(reportCopy.industryNotes[industry]);
      expect(report.industryNote).not.toBe(reportCopy.industryNotes.other);
    }
  });

  it('swaps in the unmeasured note and drops that flag from the list', () => {
    const report = buildReport(record({ ...ANSWERS, q8: 'q8-e' }), CONTENT);

    expect(report.cost?.single).toBe(true);
    expect(report.cost?.unmeasuredNote).toBe(reportCopy.unmeasuredNote);
    expect(report.cost?.flags.map((f) => f.label)).not.toContain('Rework is not measured');
  });

  it('omits the unmeasured note when rework was reported', () => {
    expect(buildReport(record(), CONTENT).cost?.unmeasuredNote).toBeNull();
  });

  it('spells out the cost assumptions with real numbers', () => {
    const report = buildReport(record(), CONTENT);
    expect(report.cost?.assumptionsLine).toBe('130 people × $180,000 × 20–35% of their time');
  });

  it('prints one percentage, not a range, on the "Not sure" path', () => {
    // That option carries a single figure, and rendering it as a range read
    // "10–10% of their time" in a report a prospect was reading.
    const report = buildReport(record({ ...ANSWERS, q8: 'q8-e' }), CONTENT);
    expect(report.cost?.assumptionsLine).toBe('130 people × $180,000 × 10% of their time');
    expect(report.cost?.assumptionsLine).not.toMatch(/(\d+)–\1%/);
  });

  it('flags a tiebreak so the page can soften the claim', () => {
    const tied: Answers = {
      ...ANSWERS,
      q1: 'q1-a', q2: 'q2-b', q3: 'q3-a', q4: 'q4-b', q5: 'q5-c', q6: 'q6-c',
    };
    expect(buildReport(record(tied), CONTENT).archetype.settledByTiebreak).toBe(true);
    expect(buildReport(record(), CONTENT).archetype.settledByTiebreak).toBe(false);
  });

  it('survives a record with no cost and no offering', () => {
    const sparse = record({ q1: 'q1-a', q2: 'q2-a', q3: 'q3-a' });
    const report = buildReport(sparse, CONTENT);

    expect(report.cost).toBeNull();
    expect(report.offering).toBeNull();
    expect(report.moves).toHaveLength(3);
  });
});

// ── Text rendering ─────────────────────────────────────────────

describe('renderReportEmail', () => {
  const text = renderReportEmail(
    buildReport(record(ANSWERS, { industry: 'adtech' }), CONTENT),
    'https://interactivism.com/velocity-profile/report/bbbb',
    'https://interactivism.com/book',
    'Sam',
  );

  it('opens with the name, the archetype, and the persona line', () => {
    expect(text.startsWith('Sam,')).toBe(true);
    expect(text).toContain('Feature Factory, with a Committee streak');
    expect(text).toContain('the team that never stops shipping');
  });

  it('leads with the report link and the cost figure, as the reason to click', () => {
    expect(text).toContain('https://interactivism.com/velocity-profile/report/bbbb');
    expect(text).toContain('$4.7M–$8.2M a year');
  });

  it('stays short, and leaves the body of the report on the web', () => {
    // The point of the rewrite: the email is an invitation, not the report.
    expect(text.split('\n').length).toBeLessThan(25);
    expect(text).not.toContain('WHERE IT BREAKS DOWN');
    expect(text).not.toContain('THREE MOVES');
    expect(text).not.toContain('F move 1');
    expect(text).not.toContain(reportCopy.industryNotes.adtech);
  });

  it('drops the cost line rather than hedging it when there is no range', () => {
    // The "Not sure" path still produces a figure, so the line stays; it is a
    // missing team size or rework answer that removes the cost block entirely.
    const noCost = renderReportEmail(
      buildReport(record({ q1: 'q1-a', q2: 'q2-a', q3: 'q3-a' }), CONTENT),
      'https://interactivism.com/velocity-profile/report/dddd',
      'https://interactivism.com/book',
    );
    expect(noCost).not.toContain('costing you');
    expect(noCost).toContain('Read the full report:');
  });

  it('greets without a name when we do not have one', () => {
    const anonymous = renderReportEmail(
      buildReport(record(ANSWERS), CONTENT),
      'https://interactivism.com/velocity-profile/report/cccc',
      'https://interactivism.com/book',
    );
    expect(anonymous.startsWith('Hi,')).toBe(true);
  });

  it('ends with both links', () => {
    expect(text).toContain('https://interactivism.com/book');
  });

  it('leaks no option IDs or archetype tags', () => {
    expect(text).not.toMatch(/\bq\d{1,2}-[a-f]\b/);
  });
});

// ── Content key invariants ─────────────────────────────────────

describe('report copy keys', () => {
  it('has an offering for exactly the set Q12 maps to', () => {
    const q12 = QUESTIONS.find((q) => q.id === 'q12')!;
    const fromQuestions = new Set(q12.options.map((o) => (o as { offering: string }).offering));

    expect(new Set(Object.keys(OFFERINGS))).toEqual(fromQuestions);
    expect(new Set(Object.keys(reportCopy.offerings))).toEqual(fromQuestions);
  });

  it('has an industry note for every note key, and no extras', () => {
    expect(new Set(Object.keys(reportCopy.industryNotes))).toEqual(new Set(INDUSTRY_NOTE_KEYS));
  });

  it('routes every lead industry to a note that exists', () => {
    const notes = reportCopy.industryNotes as Record<string, string>;
    for (const industry of [...INDUSTRY_NOTE_KEYS, 'marcom', 'consumer', 'nonsense', undefined]) {
      expect(notes[industryNoteKey(industry)]).toBeTruthy();
    }
  });

  it('ships non-empty copy for every key', () => {
    for (const [key, value] of Object.entries(reportCopy.offerings)) {
      expect(value, `offering ${key}`).not.toBe('');
    }
    for (const [key, value] of Object.entries(reportCopy.industryNotes)) {
      expect(value, `industry note ${key}`).not.toBe('');
    }
    expect(reportCopy.assumptions).not.toBe('');
    expect(reportCopy.unmeasuredNote).not.toBe('');
  });
});
