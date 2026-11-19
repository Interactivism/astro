/**
 * Scoring tests.
 *
 * Covers what the spec calls out explicitly — every tie path, the "Not sure"
 * cost path, each tier boundary, and rounding — plus two invariants that guard
 * known failure modes in this repo: archetype tags must not leak to the client,
 * and the lead-industry list must not drift from the content vocabulary.
 *
 * Archetype option letters map to tags in a fixed pattern: a=F, b=C, c=E,
 * d=S, e=X. Answer sets below are written out longhand so the counts they
 * produce can be checked by eye.
 */

import { describe, expect, it } from 'vitest';
import {
  ARCHETYPE_TAGS,
  LEAD_INDUSTRIES,
  PRIORITY_INDUSTRIES,
  QUESTIONS,
  toClientQuestions,
} from '../../data/velocity-profile';
import { INDUSTRIES } from '../vocabularies';
import {
  collectFlags,
  computeLeadScore,
  computeReworkCost,
  formatCost,
  isFreeMailDomain,
  resolveArchetype,
  roundCost,
  scoreSubmission,
  tierFor,
  type Answers,
  type Submission,
} from './scoring';

// ============================================================
// Archetype
// ============================================================

describe('resolveArchetype', () => {
  it('picks an outright winner without a tiebreak', () => {
    // F×4, C×2
    const answers: Answers = { q1: 'q1-a', q2: 'q2-a', q3: 'q3-a', q4: 'q4-a', q5: 'q5-b', q6: 'q6-b' };
    const result = resolveArchetype(answers);

    expect(result.primary).toBe('F');
    expect(result.settledBy).toBeNull();
    expect(result.counts).toEqual({ F: 4, C: 2, E: 0, S: 0, X: 0 });
  });

  it('settles a tie with Q2, which leads the tiebreak order', () => {
    // F×2, C×2, E×2 — Q2 picked C
    const answers: Answers = { q1: 'q1-a', q2: 'q2-b', q3: 'q3-a', q4: 'q4-b', q5: 'q5-c', q6: 'q6-c' };
    const result = resolveArchetype(answers);

    expect(result.primary).toBe('C');
    expect(result.settledBy).toBe('q2');
  });

  it('falls back to Q1 when Q2 picked an archetype that is not tied', () => {
    // F×2, C×2, X×1, E×1 — Q2 picked X, which is not in the tie
    const answers: Answers = { q1: 'q1-a', q2: 'q2-e', q3: 'q3-a', q4: 'q4-b', q5: 'q5-b', q6: 'q6-c' };
    const result = resolveArchetype(answers);

    expect(result.primary).toBe('F');
    expect(result.settledBy).toBe('q1');
  });

  it('falls back to Q3 when neither Q2 nor Q1 picked a tied archetype', () => {
    // F×2, C×2, X×1, S×1 — Q2 picked S, Q1 picked X, Q3 picked F
    const answers: Answers = { q1: 'q1-e', q2: 'q2-d', q3: 'q3-a', q4: 'q4-a', q5: 'q5-b', q6: 'q6-b' };
    const result = resolveArchetype(answers);

    expect(result.primary).toBe('F');
    expect(result.settledBy).toBe('q3');
  });

  /**
   * Q3 is as deep as a complete answer set can push the tiebreak. Every tied
   * archetype holds at least 2 of the 6 picks, so a 2-way tie accounts for 4
   * picks; at most 2 can sit at the two earliest slots (Q2, Q1), which leaves
   * a tied pick at Q3. Q4–Q6 are only reachable with a partial answer set.
   */
  it('reaches Q4 only with an incomplete answer set', () => {
    // C×1, E×1 with Q2 and Q3 unanswered
    const answers: Answers = { q1: 'q1-c', q4: 'q4-b' };
    const result = resolveArchetype(answers);

    expect(result.settledBy).toBe('q1');
    expect(result.primary).toBe('E');

    // Now remove Q1 as well, leaving Q4 and Q5 to settle it.
    const deeper = resolveArchetype({ q4: 'q4-b', q5: 'q5-c' });
    expect(deeper.settledBy).toBe('q4');
    expect(deeper.primary).toBe('C');
  });

  it('falls back to declaration order when nothing was answered', () => {
    const result = resolveArchetype({});

    expect(result.primary).toBe(ARCHETYPE_TAGS[0]);
    expect(result.settledBy).toBeNull();
    expect(result.secondary).toBeNull();
  });

  it('ignores an option ID that belongs to a different question', () => {
    // q2 cannot be answered with a Q1 option.
    const result = resolveArchetype({ q1: 'q1-a', q2: 'q1-a' });

    expect(result.counts.F).toBe(1);
  });

  describe('secondary', () => {
    it('is suppressed when the runner-up scored only once', () => {
      // F×4, C×1, E×1
      const answers: Answers = { q1: 'q1-a', q2: 'q2-a', q3: 'q3-a', q4: 'q4-a', q5: 'q5-b', q6: 'q6-c' };
      expect(resolveArchetype(answers).secondary).toBeNull();
    });

    it('is shown at a count of 2', () => {
      // F×4, C×2
      const answers: Answers = { q1: 'q1-a', q2: 'q2-a', q3: 'q3-a', q4: 'q4-a', q5: 'q5-b', q6: 'q6-b' };
      expect(resolveArchetype(answers).secondary).toBe('C');
    });

    it('breaks its own tie with the same order, skipping the primary', () => {
      // F×2, C×2, E×2 — primary is C via Q2, so F and E tie for secondary
      const answers: Answers = { q1: 'q1-a', q2: 'q2-b', q3: 'q3-a', q4: 'q4-b', q5: 'q5-c', q6: 'q6-c' };
      const result = resolveArchetype(answers);

      expect(result.primary).toBe('C');
      // Q2's pick is the primary, so Q1 decides: F.
      expect(result.secondary).toBe('F');
    });

    it('is never the same as the primary', () => {
      for (const question of QUESTIONS.filter((q) => q.kind === 'archetype')) {
        for (const option of question.options) {
          const answers = Object.fromEntries(
            QUESTIONS.filter((q) => q.kind === 'archetype').map((q) => [q.id, q.options[0].id]),
          ) as Answers;
          const result = resolveArchetype({ ...answers, [question.id]: option.id });
          expect(result.secondary).not.toBe(result.primary);
        }
      }
    });
  });
});

// ============================================================
// Rounding and formatting
// ============================================================

describe('roundCost', () => {
  it('rounds to the nearest $50K below $1M', () => {
    expect(roundCost(70_000)).toBe(50_000);
    expect(roundCost(140_000)).toBe(150_000);
    expect(roundCost(74_999)).toBe(50_000);
    expect(roundCost(75_000)).toBe(100_000); // exact half rounds up
  });

  it('rounds to the nearest $0.1M at and above $1M', () => {
    expect(roundCost(1_000_000)).toBe(1_000_000);
    expect(roundCost(1_040_000)).toBe(1_000_000);
    expect(roundCost(1_050_000)).toBe(1_100_000);
    expect(roundCost(9_100_000)).toBe(9_100_000);
  });

  it('applies the $50K rule to a value just under $1M, which can round up to $1M', () => {
    expect(roundCost(980_000)).toBe(1_000_000);
  });
});

describe('formatCost', () => {
  it('prints thousands below $1M', () => {
    expect(formatCost(50_000)).toBe('$50K');
    expect(formatCost(950_000)).toBe('$950K');
  });

  it('prints one decimal of millions at and above $1M', () => {
    expect(formatCost(1_000_000)).toBe('$1.0M');
    expect(formatCost(2_000_000)).toBe('$2.0M');
    expect(formatCost(3_500_000)).toBe('$3.5M');
  });
});

// ============================================================
// Rework cost
// ============================================================

describe('computeReworkCost', () => {
  it('produces the range in the spec example', () => {
    // 50 people × $200K × 20–35%
    const cost = computeReworkCost({ q7: 'q7-c', q8: 'q8-c' });

    expect(cost?.display).toBe('$2.0M–$3.5M');
    expect(cost?.single).toBe(false);
    expect(cost?.assumptions).toEqual({
      teamSize: 50,
      loadedCost: 200_000,
      reworkLow: 0.20,
      reworkHigh: 0.35,
    });
  });

  it('shows a single figure at 10% for "Not sure"', () => {
    const cost = computeReworkCost({ q7: 'q7-c', q8: 'q8-e' });

    expect(cost?.single).toBe(true);
    expect(cost?.low).toBe(cost?.high);
    expect(cost?.display).toBe('$1.0M');
    expect(cost?.assumptions.reworkLow).toBe(0.10);
  });

  it('rounds a small team to the nearest $50K', () => {
    // 7 people × $200K × 5–10% = $70K–$140K
    expect(computeReworkCost({ q7: 'q7-a', q8: 'q8-a' })?.display).toBe('$50K–$150K');
  });

  it('honors an overridden loaded cost', () => {
    const cost = computeReworkCost({ q7: 'q7-c', q8: 'q8-c' }, 250_000);

    expect(cost?.assumptions.loadedCost).toBe(250_000);
    expect(cost?.display).toBe('$2.5M–$4.4M'); // 2.5M and 4.375M → nearest 0.1M
  });

  it('returns null when team size or rework share is missing', () => {
    expect(computeReworkCost({ q8: 'q8-c' })).toBeNull();
    expect(computeReworkCost({ q7: 'q7-c' })).toBeNull();
    expect(computeReworkCost({})).toBeNull();
  });
});

// ============================================================
// Flags
// ============================================================

describe('collectFlags', () => {
  it('flags unmeasured rework, slow time to value, and heavy how-do-I tickets', () => {
    const flags = collectFlags({ q8: 'q8-e', q9: 'q9-e', q10: 'q10-d' });

    expect(flags.map((f) => f.code)).toEqual([
      'rework-unmeasured',
      'slow-time-to-value',
      'high-howto-tickets',
    ]);
    expect(flags[1].answer).toBe('3+ months');
  });

  it('distinguishes untracked tickets from a high ticket share', () => {
    expect(collectFlags({ q10: 'q10-e' })[0].code).toBe('tickets-untracked');
    expect(collectFlags({ q10: 'q10-c' })[0].code).toBe('high-howto-tickets');
  });

  it('does not flag answers below the threshold', () => {
    expect(collectFlags({ q8: 'q8-b', q9: 'q9-c', q10: 'q10-b' })).toEqual([]);
  });

  it('flags a month, matching "about a month or longer"', () => {
    expect(collectFlags({ q9: 'q9-d' }).map((f) => f.code)).toEqual(['slow-time-to-value']);
  });
});

// ============================================================
// Lead score
// ============================================================

describe('tierFor', () => {
  it('puts the boundaries at 5 and 10', () => {
    expect(tierFor(4)).toBe('cold');
    expect(tierFor(5)).toBe('warm');
    expect(tierFor(9)).toBe('warm');
    expect(tierFor(10)).toBe('hot');
  });

  it('treats zero as cold', () => {
    expect(tierFor(0)).toBe('cold');
  });
});

describe('computeLeadScore', () => {
  it('scores nothing for an empty submission', () => {
    const result = computeLeadScore({ answers: {} });

    expect(result.score).toBe(0);
    expect(result.tier).toBe('cold');
    expect(result.breakdown).toEqual([]);
  });

  it('lands on 4 — cold, just under the boundary', () => {
    // Director (2) + team of 26–75 (2)
    const result = computeLeadScore({
      answers: { q7: 'q7-c', q8: 'q8-b' },
      level: 'director',
      industry: 'other',
    });

    expect(result.score).toBe(4);
    expect(result.tier).toBe('cold');
  });

  it('lands on 5 — warm, on the lower boundary', () => {
    const result = computeLeadScore({ answers: {}, walkthrough: true });

    expect(result.score).toBe(5);
    expect(result.tier).toBe('warm');
  });

  it('lands on 9 — warm, just under hot', () => {
    // Walkthrough (5) + high-intent event (3) + priority industry (1)
    const result = computeLeadScore({
      answers: { q11: ['q11-a'] },
      walkthrough: true,
      industry: 'adtech',
    });

    expect(result.score).toBe(9);
    expect(result.tier).toBe('warm');
  });

  it('lands on 10 — hot, on the boundary', () => {
    // Walkthrough (5) + high-intent event (3) + Director (2)
    const result = computeLeadScore({
      answers: { q11: ['q11-a'] },
      walkthrough: true,
      level: 'director',
    });

    expect(result.score).toBe(10);
    expect(result.tier).toBe('hot');
  });

  it('tops out at 17 with every signal present', () => {
    const result = computeLeadScore({
      answers: { q7: 'q7-e', q8: 'q8-d', q11: ['q11-a', 'q11-b'] },
      level: 'c-level',
      industry: 'fintech',
      walkthrough: true,
    });

    expect(result.score).toBe(17);
    expect(result.tier).toBe('hot');
  });

  it('awards the high-intent bonus once, however many high options are picked', () => {
    const one = computeLeadScore({ answers: { q11: ['q11-a'] } });
    const all = computeLeadScore({ answers: { q11: ['q11-a', 'q11-b', 'q11-c', 'q11-d'] } });

    expect(one.score).toBe(3);
    expect(all.score).toBe(3);
  });

  it('awards nothing for medium or low intent', () => {
    expect(computeLeadScore({ answers: { q11: ['q11-e', 'q11-f'] } }).score).toBe(0);
  });

  it('scores VP and C-level above Director, and Other not at all', () => {
    const score = (level: Submission['level']) => computeLeadScore({ answers: {}, level }).score;

    expect(score('vp')).toBe(3);
    expect(score('c-level')).toBe(3);
    expect(score('director')).toBe(2);
    expect(score('other')).toBe(0);
    expect(score(undefined)).toBe(0);
  });

  it('scores team size in two bands, with nothing below 26', () => {
    const score = (q7: string) => computeLeadScore({ answers: { q7 } }).score;

    expect(score('q7-a')).toBe(0); // 7
    expect(score('q7-b')).toBe(0); // 18
    expect(score('q7-c')).toBe(2); // 50
    expect(score('q7-d')).toBe(3); // 130
    expect(score('q7-e')).toBe(3); // 250
  });

  it('scores rework at 20% or more, but not the "Not sure" 10%', () => {
    const score = (q8: string) => computeLeadScore({ answers: { q8 } }).score;

    expect(score('q8-a')).toBe(0);
    expect(score('q8-b')).toBe(0);
    expect(score('q8-c')).toBe(2);
    expect(score('q8-d')).toBe(2);
    expect(score('q8-e')).toBe(0); // Not sure, priced at 10% — no points
  });

  it('scores only the three priority industries', () => {
    for (const industry of LEAD_INDUSTRIES) {
      const expected = PRIORITY_INDUSTRIES.includes(industry.value) ? 1 : 0;
      expect(computeLeadScore({ answers: {}, industry: industry.value }).score).toBe(expected);
    }
  });

  it('itemizes the score so the internal notification can explain it', () => {
    const result = computeLeadScore({
      answers: { q7: 'q7-d', q11: ['q11-b'] },
      level: 'vp',
      walkthrough: true,
    });

    expect(result.breakdown.reduce((sum, item) => sum + item.points, 0)).toBe(result.score);
    expect(result.breakdown.map((item) => item.label)).toEqual([
      'Walkthrough requested',
      'High-intent event in the next 6 months',
      'Level: VP or C-level',
      'Team of 76+',
    ]);
  });
});

// ============================================================
// Email domain
// ============================================================

describe('isFreeMailDomain', () => {
  it('recognizes common free mail', () => {
    expect(isFreeMailDomain('jane@gmail.com')).toBe(true);
    expect(isFreeMailDomain('Jane@GMAIL.COM')).toBe(true);
    expect(isFreeMailDomain('  jane@icloud.com  ')).toBe(true);
  });

  it('passes a work address', () => {
    expect(isFreeMailDomain('jane@acme.com')).toBe(false);
    expect(isFreeMailDomain('jane@mail.acme.com')).toBe(false);
  });

  it('does not throw on malformed input', () => {
    expect(isFreeMailDomain('not-an-email')).toBe(false);
    expect(isFreeMailDomain('')).toBe(false);
  });
});

// ============================================================
// Composite
// ============================================================

describe('scoreSubmission', () => {
  it('assembles archetype, cost, flags, lead score and offering', () => {
    const result = scoreSubmission({
      answers: {
        q1: 'q1-a', q2: 'q2-a', q3: 'q3-a', q4: 'q4-b', q5: 'q5-b', q6: 'q6-c',
        q7: 'q7-c', q8: 'q8-c', q9: 'q9-d', q10: 'q10-c',
        q11: ['q11-a'], q12: 'q12-d',
      },
      level: 'vp',
      industry: 'enterprise-saas',
      walkthrough: true,
    });

    expect(result.archetype.primary).toBe('F');
    expect(result.cost?.display).toBe('$2.0M–$3.5M');
    expect(result.flags.map((f) => f.code)).toEqual(['slow-time-to-value', 'high-howto-tickets']);
    // 5 walkthrough + 3 intent + 3 VP + 2 team + 2 rework + 1 industry
    expect(result.lead.score).toBe(16);
    expect(result.lead.tier).toBe('hot');
    expect(result.offering).toBe('design-system');
  });

  it('returns a null offering when Q12 is unanswered', () => {
    expect(scoreSubmission({ answers: {} }).offering).toBeNull();
  });
});

// ============================================================
// Invariants
// ============================================================

describe('client projection', () => {
  it('carries no archetype tag, calc value, weight or offering key', () => {
    const serialized = JSON.stringify(toClientQuestions());

    for (const key of ['tag', 'size', 'low', 'high', 'unsure', 'flagged', 'weight', 'offering']) {
      expect(serialized).not.toContain(`"${key}"`);
    }
  });

  it('keeps every question and option, with IDs intact', () => {
    const client = toClientQuestions();

    expect(client).toHaveLength(QUESTIONS.length);
    client.forEach((question, i) => {
      expect(question.id).toBe(QUESTIONS[i].id);
      expect(question.options.map((o) => o.id)).toEqual(QUESTIONS[i].options.map((o) => o.id));
      expect(Object.keys(question.options[0])).toEqual(['id', 'label']);
    });
  });

  it('uses option IDs that reveal nothing about scoring', () => {
    for (const question of QUESTIONS) {
      for (const option of question.options) {
        expect(option.id).toMatch(/^q(1[0-2]|[1-9])-[a-f]$/);
      }
    }
  });
});

describe('lead industries', () => {
  it('matches the content vocabulary wherever the two overlap', () => {
    // Guards the drift that has bitten every hand-copied list in this repo.
    const content = new Map<string, string>(INDUSTRIES.map((i) => [i.value, i.label]));

    for (const lead of LEAD_INDUSTRIES) {
      const contentLabel = content.get(lead.value);
      if (contentLabel) expect(lead.label).toBe(contentLabel);
    }
  });

  it('derives the priority list from the flagged entries', () => {
    expect(PRIORITY_INDUSTRIES).toEqual(['adtech', 'enterprise-saas', 'fintech']);
  });

  it('has a unique slug per entry', () => {
    const values = LEAD_INDUSTRIES.map((i) => i.value);
    expect(new Set(values).size).toBe(values.length);
  });
});
