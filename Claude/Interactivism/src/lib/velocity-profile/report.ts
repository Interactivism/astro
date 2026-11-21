/**
 * Velocity Profile — report assembly.
 *
 * Pure: no astro:content import, so it is unit-testable. The Keystatic entries
 * are loaded by ./content.ts and passed in.
 *
 * Builds one structured report from a stored submission plus the Keystatic
 * copy. The web page and the email are two renderings of this same object, so
 * they cannot say different things.
 *
 * Section order follows the spec:
 *   1 archetype   2 failure mode   3 cost   4 industry note
 *   5 three moves 6 where we come in   7 CTA
 */

import {
  ARCHETYPES,
  OFFERINGS,
  industryNoteKey,
  labelFor,
  type ArchetypeTag,
} from '../../data/velocity-profile';
import reportCopy from '../../data/velocity-report.json';
import type { SubmissionRecord } from './storage';
import type { CostAssumptions } from './scoring';

export interface ArchetypeContent {
  tag: ArchetypeTag;
  title: string;
  strengthCopy: string;
  failureModeCopy: string;
  moves: { title: string; body: string }[];
  draft: boolean;
}

// ============================================================
// Report
// ============================================================

export interface Report {
  intro: string;
  archetype: {
    name: string;
    /** One line under the name. Persona, not prose. */
    descriptor: string;
    teaser: string;
    strength: string;
    strengthCopy: string;
    secondaryName: string | null;
    /** True when a tiebreak decided it, so the page can soften the claim. */
    settledByTiebreak: boolean;
  };
  failureMode: {
    label: string;
    copy: string;
    /** Their own answers, quoted back. */
    evidence: { prompt: string; answer: string }[];
  };
  cost: {
    display: string;
    single: boolean;
    assumptionsLine: string;
    assumptions: string;
    unmeasuredNote: string | null;
    flags: { label: string; answer: string }[];
  } | null;
  industryNote: string;
  moves: { title: string; body: string }[];
  offering: { name: string; body: string } | null;
  draft: boolean;
}

const FLAG_LABELS: Record<string, string> = {
  'rework-unmeasured': 'Rework is not measured',
  'slow-time-to-value': 'Slow time to value',
  'high-howto-tickets': 'Support is answering “where is it?”',
  'tickets-untracked': 'Ticket mix is not tracked',
};

/**
 * Questions quoted back under the failure mode, in priority order. The first
 * two or three that were actually answered are used.
 */
const EVIDENCE_QUESTIONS: { id: 'q3' | 'q4' | 'q5' | 'q6' | 'q2'; prompt: string }[] = [
  { id: 'q4', prompt: 'After your last major release' },
  { id: 'q6', prompt: 'The feedback that stings' },
  { id: 'q5', prompt: 'How design works on your team' },
  { id: 'q3', prompt: 'When a design is hard to build' },
  { id: 'q2', prompt: 'What makes the roadmap' },
];

/**
 * "7 people × $180,000 × 20–35% of their time".
 *
 * Collapses to a single percentage when the low and high match, which is the
 * "Not sure" path: that option carries one figure rather than a range, and
 * printing it as a range read "10–10% of their time".
 */
function assumptionsLine(a: CostAssumptions): string {
  const low = Math.round(a.reworkLow * 100);
  const high = Math.round(a.reworkHigh * 100);
  const share = low === high ? `${low}%` : `${low}–${high}%`;
  return `${a.teamSize} people × $${a.loadedCost.toLocaleString('en-US')} × ${share} of their time`;
}

export function buildReport(
  record: SubmissionRecord,
  content: Record<ArchetypeTag, ArchetypeContent>,
): Report {
  const { results, answers, lead } = record;
  const primaryTag = results.archetype.primary;
  const meta = ARCHETYPES[primaryTag];
  const copy = content[primaryTag];

  const evidence = EVIDENCE_QUESTIONS.filter((item) => answers[item.id])
    .slice(0, 3)
    .map((item) => ({ prompt: item.prompt, answer: labelFor(answers[item.id]!) }));

  const cost = results.cost
    ? {
        display: results.cost.display,
        single: results.cost.single,
        assumptionsLine: assumptionsLine(results.cost.assumptions),
        assumptions: reportCopy.assumptions,
        unmeasuredNote: results.flags.some((flag) => flag.code === 'rework-unmeasured')
          ? reportCopy.unmeasuredNote
          : null,
        flags: results.flags
          .filter((flag) => flag.code !== 'rework-unmeasured')
          .map((flag) => ({ label: FLAG_LABELS[flag.code] ?? flag.code, answer: flag.answer })),
      }
    : null;

  const offeringKey = results.offering;

  return {
    intro: reportCopy.intro,
    archetype: {
      name: meta.name,
      descriptor: meta.descriptor,
      teaser: meta.teaser,
      strength: meta.strength,
      strengthCopy: copy.strengthCopy,
      secondaryName: results.archetype.secondary
        ? ARCHETYPES[results.archetype.secondary].name
        : null,
      settledByTiebreak: results.archetype.settledBy !== null,
    },
    failureMode: {
      label: meta.failureMode,
      copy: copy.failureModeCopy,
      evidence,
    },
    cost,
    industryNote: reportCopy.industryNotes[industryNoteKey(lead.industry)],
    moves: copy.moves,
    offering: offeringKey
      ? {
          name: OFFERINGS[offeringKey],
          body: reportCopy.offerings[offeringKey],
        }
      : null,
    draft: copy.draft,
  };
}

// ============================================================
// Plain-text rendering, for the email
// ============================================================

const rule = '─'.repeat(52);

export function renderReportEmail(
  report: Report,
  reportUrl: string,
  bookingUrl: string,
  firstName?: string,
): string {
  const headline = report.archetype.secondaryName
    ? `${report.archetype.name}, with a ${report.archetype.secondaryName} streak`
    : report.archetype.name;

  const parts: string[] = [
    firstName ? `${firstName},` : 'Hi,',
    '',
    `Your team came out as ${headline} — ${report.archetype.descriptor.toLowerCase()}.`,
    '',
    report.archetype.teaser,
    '',
  ];

  // The cost lands as the consequence of the line above it — you ship late,
  // here is the bill — which is what earns the click. It is dropped rather
  // than hedged when there is no range to quote, which is the "Not sure"
  // path: a vaguer version of this sentence promises nothing and costs a line.
  if (report.cost) {
    parts.push(
      `On the numbers you gave us, that’s costing you somewhere around ${report.cost.display} a year in rework.`,
      '',
    );
  }

  parts.push(
    'Read the full report:',
    reportUrl,
    '',
    'No sign-in, so forward it to anyone who should see it.',
    '',
    rule,
    'Want to talk it through? Thirty minutes with one of our partners:',
    bookingUrl,
    '',
    'Interactivism — product design and development, Los Angeles',
  );

  return parts.join('\n');
}
