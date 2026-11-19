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

export interface ArchetypeContent {
  tag: ArchetypeTag;
  title: string;
  strengthCopy: string;
  failureModeCopy: string;
  moves: { title: string; body: string }[];
  caseStudy?: string;
  draft: boolean;
}

// ============================================================
// Report
// ============================================================

export interface Report {
  intro: string;
  archetype: {
    name: string;
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
  offering: { name: string; body: string; caseStudy?: string } | null;
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
  { id: 'q5', prompt: 'Where design sits' },
  { id: 'q3', prompt: 'How contested decisions get settled' },
  { id: 'q2', prompt: 'What decides the roadmap' },
];

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
        assumptionsLine:
          `${results.cost.assumptions.teamSize} people × ` +
          `$${results.cost.assumptions.loadedCost.toLocaleString('en-US')} × ` +
          `${Math.round(results.cost.assumptions.reworkLow * 100)}–` +
          `${Math.round(results.cost.assumptions.reworkHigh * 100)}% of their time`,
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
          caseStudy: copy.caseStudy,
        }
      : null,
    draft: copy.draft,
  };
}

// ============================================================
// Plain-text rendering, for the email
// ============================================================

const rule = '─'.repeat(52);

export function renderReportText(report: Report, reportUrl: string, bookingUrl: string): string {
  const parts: string[] = [
    report.intro,
    '',
    rule,
    report.archetype.secondaryName
      ? `${report.archetype.name.toUpperCase()}, with a ${report.archetype.secondaryName} streak`
      : report.archetype.name.toUpperCase(),
    rule,
    '',
    report.archetype.strengthCopy,
    '',
    'WHERE IT BREAKS DOWN',
    report.failureMode.copy,
  ];

  if (report.failureMode.evidence.length) {
    parts.push('', 'In your own answers:');
    for (const item of report.failureMode.evidence) {
      parts.push(`  ${item.prompt}: ${item.answer}`);
    }
  }

  if (report.cost) {
    parts.push(
      '',
      'WHAT IT IS COSTING YOU',
      report.cost.single
        ? `${report.cost.display} a year`
        : `${report.cost.display} a year`,
      `  ${report.cost.assumptionsLine}`,
      '',
      report.cost.assumptions,
    );
    if (report.cost.unmeasuredNote) parts.push('', report.cost.unmeasuredNote);
    if (report.cost.flags.length) {
      parts.push('', 'Worth a look:');
      for (const flag of report.cost.flags) parts.push(`  • ${flag.label} — you said “${flag.answer}”`);
    }
  }

  parts.push('', 'YOUR INDUSTRY', report.industryNote);

  parts.push('', 'THREE MOVES TEAMS LIKE YOURS MAKE');
  report.moves.forEach((move, i) => {
    parts.push('', `${i + 1}. ${move.title}`, `   ${move.body}`);
  });

  if (report.offering) {
    parts.push('', 'WHERE WE COME IN', report.offering.name, report.offering.body);
  }

  parts.push(
    '',
    rule,
    'Want to talk it through? Twenty minutes with one of our partners:',
    bookingUrl,
    '',
    `Read this online: ${reportUrl}`,
    '',
    'Interactivism — product design and development, Los Angeles',
  );

  return parts.join('\n');
}
