/**
 * Product Velocity Profile — scoring.
 *
 * Pure functions over the config in src/data/velocity-profile.ts. No I/O, no
 * dates, no env reads: the loaded cost comes in as an argument so the caller
 * owns the env var and the tests own the number.
 *
 * Everything here is recomputed server-side on submission. Whatever the client
 * claims about its own results is ignored.
 */

import {
  ARCHETYPE_TAGS,
  ARCHETYPE_TIEBREAK_ORDER,
  DEFAULT_LOADED_COST,
  FREE_MAIL_DOMAINS,
  PRIORITY_INDUSTRIES,
  findOption,
  type ArchetypeQuestionId,
  type ArchetypeTag,
  type Fn,
  type LeadIndustry,
  type Level,
  type OfferingKey,
  type QuestionId,
} from '../../data/velocity-profile';

// ============================================================
// Input
// ============================================================

/** Option IDs as submitted. Q11 is multi-select; everything else is single. */
export type Answers = Partial<Record<Exclude<QuestionId, 'q11'>, string>> & {
  readonly q11?: readonly string[];
};

export interface Submission {
  readonly answers: Answers;
  readonly level?: Level;
  readonly fn?: Fn;
  readonly industry?: LeadIndustry;
  readonly walkthrough?: boolean;
}

// ============================================================
// Archetype
// ============================================================

export interface ArchetypeResult {
  readonly primary: ArchetypeTag;
  readonly secondary: ArchetypeTag | null;
  readonly counts: Readonly<Record<ArchetypeTag, number>>;
  /**
   * Which question broke the tie for the primary, or null when the primary won
   * outright. Surfaced in the internal notification — a result settled by a
   * tiebreak is a weaker read on the team than a 4-of-6 landslide.
   */
  readonly settledBy: ArchetypeQuestionId | null;
}

/** The tag a respondent picked for one of Q1–Q6, if they answered it. */
function tagFor(answers: Answers, questionId: ArchetypeQuestionId): ArchetypeTag | null {
  const id = answers[questionId];
  if (!id) return null;
  const found = findOption(id);
  if (!found || found.question.kind !== 'archetype' || found.question.id !== questionId) return null;
  return (found.option as { tag: ArchetypeTag }).tag;
}

export function countTags(answers: Answers): Record<ArchetypeTag, number> {
  const counts = Object.fromEntries(ARCHETYPE_TAGS.map((t) => [t, 0])) as Record<ArchetypeTag, number>;
  for (const questionId of ARCHETYPE_TIEBREAK_ORDER) {
    const tag = tagFor(answers, questionId);
    if (tag) counts[tag] += 1;
  }
  return counts;
}

/**
 * Pick one archetype from a tied set.
 *
 * Walks the tiebreak order and returns the first tied archetype a respondent
 * actually picked. With all six questions answered this always resolves, since
 * every tied archetype scored at least one point from some question. The
 * declaration-order fallback only matters for partial answer sets, which the
 * submission endpoint rejects but which the report page may still encounter in
 * stored data.
 */
function breakTie(
  answers: Answers,
  tied: readonly ArchetypeTag[],
): { tag: ArchetypeTag; settledBy: ArchetypeQuestionId | null } {
  for (const questionId of ARCHETYPE_TIEBREAK_ORDER) {
    const tag = tagFor(answers, questionId);
    if (tag && tied.includes(tag)) return { tag, settledBy: questionId };
  }
  const fallback = ARCHETYPE_TAGS.find((t) => tied.includes(t));
  return { tag: fallback ?? ARCHETYPE_TAGS[0], settledBy: null };
}

export function resolveArchetype(answers: Answers): ArchetypeResult {
  const counts = countTags(answers);

  const topCount = Math.max(...ARCHETYPE_TAGS.map((t) => counts[t]));
  const topTied = ARCHETYPE_TAGS.filter((t) => counts[t] === topCount);
  const primaryPick = topTied.length > 1
    ? breakTie(answers, topTied)
    : { tag: topTied[0], settledBy: null as ArchetypeQuestionId | null };
  const primary = primaryPick.tag;

  // Secondary: next-highest, and only when it carries real weight.
  const rest = ARCHETYPE_TAGS.filter((t) => t !== primary);
  const nextCount = Math.max(...rest.map((t) => counts[t]));
  let secondary: ArchetypeTag | null = null;
  if (nextCount >= 2) {
    const nextTied = rest.filter((t) => counts[t] === nextCount);
    secondary = nextTied.length > 1 ? breakTie(answers, nextTied).tag : nextTied[0];
  }

  return { primary, secondary, counts, settledBy: primaryPick.settledBy };
}

// ============================================================
// Rework cost
// ============================================================

export interface CostAssumptions {
  readonly teamSize: number;
  readonly loadedCost: number;
  readonly reworkLow: number;
  readonly reworkHigh: number;
}

export interface CostResult {
  readonly low: number;
  readonly high: number;
  /** True on the "Not sure" path: one figure, not a range. */
  readonly single: boolean;
  readonly display: string;
  readonly assumptions: CostAssumptions;
}

/** Nearest $50K below $1M, nearest $0.1M above it. */
export function roundCost(value: number): number {
  const step = value < 1_000_000 ? 50_000 : 100_000;
  return Math.round(value / step) * step;
}

/** "$350K" or "$2.0M". Decided on the rounded value, so $1.0M never prints as $1000K. */
export function formatCost(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(value / 1_000)}K`;
}

export function computeReworkCost(
  answers: Answers,
  loadedCost: number = DEFAULT_LOADED_COST,
): CostResult | null {
  const team = answers.q7 ? findOption(answers.q7) : undefined;
  const rework = answers.q8 ? findOption(answers.q8) : undefined;
  if (!team || team.question.kind !== 'team') return null;
  if (!rework || rework.question.kind !== 'rework') return null;

  const { size } = team.option as { size: number };
  const { low: reworkLow, high: reworkHigh, unsure } =
    rework.option as { low: number; high: number; unsure?: true };

  const low = roundCost(size * loadedCost * reworkLow);
  const high = roundCost(size * loadedCost * reworkHigh);
  const single = unsure === true || low === high;

  return {
    low,
    high,
    single,
    display: single ? formatCost(low) : `${formatCost(low)}–${formatCost(high)}`,
    assumptions: { teamSize: size, loadedCost, reworkLow, reworkHigh },
  };
}

// ============================================================
// Flags
// ============================================================

export type FlagCode =
  | 'rework-unmeasured'
  | 'slow-time-to-value'
  | 'high-howto-tickets'
  | 'tickets-untracked';

export interface Flag {
  readonly code: FlagCode;
  /** The respondent's own answer, for quoting back in the report. */
  readonly answer: string;
}

export function collectFlags(answers: Answers): readonly Flag[] {
  const flags: Flag[] = [];

  const rework = answers.q8 ? findOption(answers.q8) : undefined;
  if (rework?.question.kind === 'rework' && (rework.option as { unsure?: true }).unsure) {
    flags.push({ code: 'rework-unmeasured', answer: rework.option.label });
  }

  const ttv = answers.q9 ? findOption(answers.q9) : undefined;
  if (ttv?.question.kind === 'flag' && (ttv.option as { flagged?: true }).flagged) {
    flags.push({ code: 'slow-time-to-value', answer: ttv.option.label });
  }

  const tickets = answers.q10 ? findOption(answers.q10) : undefined;
  if (tickets?.question.kind === 'flag' && (tickets.option as { flagged?: true }).flagged) {
    flags.push({
      code: tickets.option.id === 'q10-e' ? 'tickets-untracked' : 'high-howto-tickets',
      answer: tickets.option.label,
    });
  }

  return flags;
}

// ============================================================
// Lead score
// ============================================================

export type Tier = 'hot' | 'warm' | 'cold';

export interface LeadScoreResult {
  readonly score: number;
  readonly tier: Tier;
  /** Itemized for the internal notification, so the number is never a mystery. */
  readonly breakdown: readonly { readonly label: string; readonly points: number }[];
}

export function tierFor(score: number): Tier {
  if (score >= 10) return 'hot';
  if (score >= 5) return 'warm';
  return 'cold';
}

export function computeLeadScore(submission: Submission): LeadScoreResult {
  const { answers, level, industry, walkthrough } = submission;
  const breakdown: { label: string; points: number }[] = [];
  const add = (label: string, points: number) => {
    if (points > 0) breakdown.push({ label, points });
  };

  if (walkthrough) add('Walkthrough requested', 5);

  const wantsHigh = (answers.q11 ?? []).some((id) => {
    const found = findOption(id);
    return found?.question.kind === 'intent' && (found.option as { weight: string }).weight === 'high';
  });
  if (wantsHigh) add('High-intent event in the next 6 months', 3);

  if (level === 'vp' || level === 'c-level') add('Level: VP or C-level', 3);
  else if (level === 'director') add('Level: Director', 2);

  const team = answers.q7 ? findOption(answers.q7) : undefined;
  if (team?.question.kind === 'team') {
    const { size } = team.option as { size: number };
    if (size >= 76) add('Team of 76+', 3);
    else if (size >= 26) add('Team of 26–75', 2);
  }

  const rework = answers.q8 ? findOption(answers.q8) : undefined;
  if (rework?.question.kind === 'rework') {
    const { low, unsure } = rework.option as { low: number; unsure?: true };
    if (!unsure && low >= 0.20) add('Rework at 20% or more', 2);
  }

  if (industry && PRIORITY_INDUSTRIES.includes(industry)) add('Priority industry', 1);

  const score = breakdown.reduce((sum, item) => sum + item.points, 0);
  return { score, tier: tierFor(score), breakdown };
}

// ============================================================
// Email domain
// ============================================================

/** Soft signal only. A match warns; it never blocks a submission. */
export function isFreeMailDomain(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1];
  return domain ? FREE_MAIL_DOMAINS.includes(domain) : false;
}

// ============================================================
// Composite
// ============================================================

export interface ScoredSubmission {
  readonly archetype: ArchetypeResult;
  readonly cost: CostResult | null;
  readonly flags: readonly Flag[];
  readonly lead: LeadScoreResult;
  readonly offering: OfferingKey | null;
}

export function scoreSubmission(
  submission: Submission,
  loadedCost: number = DEFAULT_LOADED_COST,
): ScoredSubmission {
  const focus = submission.answers.q12 ? findOption(submission.answers.q12) : undefined;

  return {
    archetype: resolveArchetype(submission.answers),
    cost: computeReworkCost(submission.answers, loadedCost),
    flags: collectFlags(submission.answers),
    lead: computeLeadScore(submission),
    offering:
      focus?.question.kind === 'focus'
        ? (focus.option as { offering: OfferingKey }).offering
        : null,
  };
}
