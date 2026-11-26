/**
 * Product Velocity Profile — question set and scoring constants.
 *
 * The single typed source of truth for what the quiz asks, what the options
 * are, and what each option is worth. Pure data: no copy that a respondent
 * reads *about their result* lives here. Archetype names, descriptions, the
 * three moves, industry notes and offering blurbs are Keystatic content, so
 * that Erik can edit them without a code change.
 *
 * Archetype tags live in this module and MUST NOT reach the browser. The quiz
 * page sends option IDs only; `toClientQuestions()` is the one sanctioned way
 * to hand questions to client code, and `scoring.test.ts` asserts that its
 * output contains no tag values.
 *
 * Related:
 *   src/lib/velocity-profile/scoring.ts   consumes this; pure functions
 *   src/lib/vocabularies.ts               the site's *content* taxonomy,
 *                                         deliberately separate (see
 *                                         LEAD_INDUSTRIES below)
 */

// ============================================================
// Archetypes
// ============================================================

export const ARCHETYPE_TAGS = ['F', 'C', 'E', 'S', 'X'] as const;
export type ArchetypeTag = (typeof ARCHETYPE_TAGS)[number];

/**
 * The archetypes themselves: name, the one-line summary in both voices, and
 * the short strength / failure-mode labels.
 *
 * This is identity, not report copy. The report's longer write-ups — two
 * sentences on what they're good at, the failure mode quoted back against
 * their own answers, the three moves — are Keystatic content, because Erik
 * will rewrite those. These five short strings define what an archetype *is*,
 * so they sit next to the tags that produce them.
 *
 * `teaser` and `thirdPerson` say the same thing in different voices, and which
 * one a surface wants follows from whether the reader has been told this is
 * their own team. Second person on the quiz result screen, in the report email
 * and in the share text, where the archetype is a verdict about the reader.
 * Third person in <ArchetypeList>, which publishes all five at once — "you
 * ship more than almost anyone" is false of four of them on the same page.
 * Keep them in step: an edit to one usually wants the other.
 */
export const ARCHETYPES = {
  F: {
    name: 'Feature Factory',
    // One line, said about them rather than to them — it sits under the name
    // like a job title. Published publicly by <ArchetypeList>, so it is final copy.
    descriptor: 'The team that never stops shipping',
    teaser: 'You ship more than almost anyone, but more isn’t always better.',
    thirdPerson: 'Ships more than almost anyone, but more isn’t always better.',
    strength: 'Ships constantly',
    failureMode: 'Output gets mistaken for outcomes, and the product sprawls',
    openingQuestion: 'What did you ship last quarter that you’d remove if you could?',
  },
  C: {
    name: 'Committee',
    descriptor: 'The team that needs everyone to agree',
    teaser: 'You rarely ship the wrong thing, but often ship the right thing late.',
    thirdPerson: 'Rarely ships the wrong thing, but often ships the right thing late.',
    strength: 'Alignment, low risk',
    failureMode: 'Decisions stall, and designs get averaged into mush',
    openingQuestion: 'Which decision has been open the longest right now?',
  },
  E: {
    name: 'Engineering-Led',
    descriptor: 'The team that builds it right, then wonders who it’s for',
    teaser: 'Your product is built to hold up under pressure — just like the database underneath it.',
    thirdPerson: 'The product is built to hold up under pressure — just like the database underneath it.',
    strength: 'Solid, scalable tech',
    failureMode: 'The UI mirrors the data model, and UX is an afterthought',
    openingQuestion: 'How long does it take a new customer to get value, and who trains them?',
  },
  S: {
    name: 'Sales-Driven',
    descriptor: 'The team that never says no to a customer',
    teaser: 'You’re closer to revenue than most teams, and the roadmap shows it — all over the place.',
    thirdPerson: 'Closer to revenue than most teams, and the roadmap shows it — all over the place.',
    strength: 'Close to revenue',
    failureMode: 'The roadmap is the last big deal, so there are one-off features everywhere',
    openingQuestion: 'Walk me through the last feature you built for one customer. Who else uses it?',
  },
  X: {
    name: 'Firefighter',
    descriptor: 'The team that is always one escalation behind',
    teaser: 'You’re great in a crisis. But the problem is, there’s always another crisis.',
    thirdPerson: 'Great in a crisis. But the problem is, there’s always another crisis.',
    strength: 'Responds fast',
    failureMode: 'No room for planned work, so debt compounds',
    openingQuestion: 'What would you work on with 1 quiet month?',
  },
} as const satisfies Record<ArchetypeTag, {
  name: string;
  /** One line under the name, like a job title. Persona, not prose. */
  descriptor: string;
  /** Second person — for a reader who has been told this is their own team. */
  teaser: string;
  /** Third person — for a surface that publishes more than one archetype. */
  thirdPerson: string;
  strength: string;
  failureMode: string;
  /** Opening question for the first call, sent in the internal notification. */
  openingQuestion: string;
}>;

/**
 * Tiebreak precedence when two or more archetypes tie on count.
 *
 * Q2 leads because what decides the roadmap is the strongest single signal of
 * how a team actually operates; Q1 is next. The rest follow in order. This is
 * the spec's "use the tied archetype that Q2 picked, then fall back to Q1,
 * then Q3, and so on", written out so it can be read and tested.
 */
export const ARCHETYPE_TIEBREAK_ORDER = ['q2', 'q1', 'q3', 'q4', 'q5', 'q6'] as const;

// ============================================================
// Cost model
// ============================================================

/**
 * Fully loaded annual cost per person on the product team.
 *
 * Overridden at runtime by VELOCITY_LOADED_COST so the figure behind every
 * dollar range shown to a prospect can change without a deploy and without
 * sitting in a public repo. This is the documented fallback for local dev.
 */
export const DEFAULT_LOADED_COST = 180_000;

// ============================================================
// Questions
// ============================================================

export type QuestionId =
  | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6'
  | 'q7' | 'q8' | 'q9' | 'q10' | 'q11' | 'q12';

export type ArchetypeQuestionId = (typeof ARCHETYPE_TIEBREAK_ORDER)[number];

export type OfferingKey =
  | 'design-system-embedded'
  | 'ux-audit-product-design'
  | 'strategy-prototyping'
  | 'design-system'
  | 'research-measurement';

export type IntentWeight = 'high' | 'medium' | 'low';

interface BaseOption {
  /** Opaque to the client. Letters only, so nothing about scoring leaks. */
  readonly id: string;
  readonly label: string;
}

export interface ArchetypeOption extends BaseOption {
  readonly tag: ArchetypeTag;
}

export interface TeamOption extends BaseOption {
  /** Midpoint used for the cost calculation. */
  readonly size: number;
}

export interface ReworkOption extends BaseOption {
  readonly low: number;
  readonly high: number;
  /** "Not sure" — priced at a single figure and called out in the report. */
  readonly unsure?: true;
}

export interface FlagOption extends BaseOption {
  /** Surfaces as a flag in the report. Not priced. */
  readonly flagged?: true;
}

export interface IntentOption extends BaseOption {
  readonly weight: IntentWeight;
}

export interface FocusOption extends BaseOption {
  readonly offering: OfferingKey;
}

interface QuestionBase {
  readonly id: QuestionId;
  readonly prompt: string;
  readonly part: 1 | 2 | 3;
}

export type Question =
  | (QuestionBase & { kind: 'archetype'; multi: false; options: readonly ArchetypeOption[] })
  | (QuestionBase & { kind: 'team';      multi: false; options: readonly TeamOption[] })
  | (QuestionBase & { kind: 'rework';    multi: false; options: readonly ReworkOption[] })
  | (QuestionBase & { kind: 'flag';      multi: false; options: readonly FlagOption[] })
  | (QuestionBase & { kind: 'intent';    multi: true;  options: readonly IntentOption[] })
  | (QuestionBase & { kind: 'focus';     multi: false; options: readonly FocusOption[] });

export const QUESTIONS = [
  // ── Part 1: Archetype ──────────────────────────────────────
  {
    id: 'q1',
    part: 1,
    kind: 'archetype',
    multi: false,
    prompt: 'Which sentence do you hear most often in planning?',
    options: [
      { id: 'q1-a', label: '“Let’s ship it and see what happens.”',               tag: 'F' },
      { id: 'q1-b', label: '“Let’s make sure everyone’s aligned first.”',         tag: 'C' },
      { id: 'q1-c', label: '“Engineering says that’s not feasible this quarter.”', tag: 'E' },
      { id: 'q1-d', label: '“[Big customer] needs this for their renewal.”',      tag: 'S' },
      { id: 'q1-e', label: '“We’ll get to it once this fire’s out.”',             tag: 'X' },
    ],
  },
  {
    id: 'q2',
    part: 1,
    kind: 'archetype',
    multi: false,
    prompt: 'What makes the cut onto your roadmap?',
    options: [
      { id: 'q2-a', label: 'Our delivery commitments and backlog', tag: 'F' },
      { id: 'q2-b', label: 'Whatever survives stakeholder review',  tag: 'C' },
      { id: 'q2-c', label: 'Platform and technical priorities',     tag: 'E' },
      { id: 'q2-d', label: 'Customer and prospect requests',        tag: 'S' },
      { id: 'q2-e', label: 'Whatever broke or got escalated',       tag: 'X' },
    ],
  },
  {
    id: 'q3',
    part: 1,
    kind: 'archetype',
    multi: false,
    prompt: 'When a design proves hard to implement, how does it usually get settled?',
    // Options reframed with the prompt. The earlier set answered "when a
    // decision is contested"; against "hard to implement", a bare "whatever's
    // simplest to build" reads as the correct answer rather than one pattern
    // among five, and would have pulled every respondent toward Engineering-Led.
    // Each option still carries exactly one tag, in the same order.
    options: [
      { id: 'q3-a', label: 'We ship a simpler version now and plan to revisit it',  tag: 'F' },
      { id: 'q3-b', label: 'It goes back for review until someone senior weighs in', tag: 'C' },
      { id: 'q3-c', label: 'Engineering picks the approach and design adapts',      tag: 'E' },
      { id: 'q3-d', label: 'What we promised a customer stays, whatever it costs',  tag: 'S' },
      { id: 'q3-e', label: 'Nobody settles it. The first workaround ships',         tag: 'X' },
    ],
  },
  {
    id: 'q4',
    part: 1,
    kind: 'archetype',
    multi: false,
    // Single-select on purpose, despite inviting "all of them". Each of the six
    // archetype questions contributes exactly one tag, and the archetype is the
    // most frequent tag across them. Letting one question contribute four tags
    // would flatten the signal it is supposed to sharpen. "Select one" above the
    // options is what forces the choice.
    prompt: 'What happened in the first 30 days after your last major release?',
    options: [
      { id: 'q4-a', label: 'We were already deep into the next feature',        tag: 'F' },
      { id: 'q4-b', label: 'We debated whether it matched what we’d agreed to', tag: 'C' },
      { id: 'q4-c', label: 'Users needed help or training to use it',           tag: 'E' },
      { id: 'q4-d', label: 'Sales asked for a variation for another account',   tag: 'S' },
      { id: 'q4-e', label: 'Hotfixes and support escalations',                  tag: 'X' },
    ],
  },
  {
    id: 'q5',
    part: 1,
    kind: 'archetype',
    multi: false,
    // "Where does design sit" was not a question these options answered — they
    // describe how design works, and several could be true at once. Reframed as
    // a closest-fit question with options that exclude each other. Same tags,
    // same order.
    prompt: 'Which of these is closest to how design works on your team?',
    options: [
      { id: 'q5-a', label: 'Design runs a sprint ahead of engineering, barely',   tag: 'F' },
      { id: 'q5-b', label: 'Every design goes through review and sign-off',       tag: 'C' },
      { id: 'q5-c', label: 'Design comes in after the build, to clean it up',     tag: 'E' },
      { id: 'q5-d', label: 'Design output is mostly demos and customer mockups',  tag: 'S' },
      { id: 'q5-e', label: 'Whoever has time does the design',                    tag: 'X' },
    ],
  },
  {
    id: 'q6',
    part: 1,
    kind: 'archetype',
    multi: false,
    prompt: 'Which piece of user feedback sounds most familiar?',
    options: [
      { id: 'q6-a', label: '“It does a lot, but I can’t find anything.”',   tag: 'F' },
      { id: 'q6-b', label: '“It’s fine. Nothing stands out.”',             tag: 'C' },
      { id: 'q6-c', label: '“Powerful, but you need training to use it.”', tag: 'E' },
      { id: 'q6-d', label: '“Every screen works differently.”',            tag: 'S' },
      { id: 'q6-e', label: '“It’s not reliable.”',                         tag: 'X' },
    ],
  },

  // ── Part 2: Cost of drag ───────────────────────────────────
  {
    id: 'q7',
    part: 2,
    kind: 'team',
    multi: false,
    prompt: 'What’s the size of your team (engineering, design, and product combined)?',
    options: [
      { id: 'q7-a', label: 'Under 10', size: 7 },
      { id: 'q7-b', label: '10–25',    size: 18 },
      { id: 'q7-c', label: '26–75',    size: 50 },
      { id: 'q7-d', label: '76–200',   size: 130 },
      { id: 'q7-e', label: 'Over 200', size: 250 },
    ],
  },
  {
    id: 'q8',
    part: 2,
    kind: 'rework',
    multi: false,
    prompt:
      'In the past 12 months, roughly what share of that team’s time was spent fixing things you’d already shipped?',
    options: [
      { id: 'q8-a', label: 'Under 10%', low: 0.05, high: 0.10 },
      { id: 'q8-b', label: '10–20%',    low: 0.10, high: 0.20 },
      { id: 'q8-c', label: '20–35%',    low: 0.20, high: 0.35 },
      { id: 'q8-d', label: 'Over 35%',  low: 0.35, high: 0.45 },
      { id: 'q8-e', label: 'Not sure',  low: 0.10, high: 0.10, unsure: true },
    ],
  },
  {
    id: 'q9',
    part: 2,
    kind: 'flag',
    multi: false,
    prompt: 'How long does it take for a new user to become fully productive in your product?',
    // An even order-of-magnitude scale. The previous one mixed "under an hour"
    // with "3+ months" and asked people to judge the gaps between them.
    options: [
      { id: 'q9-a', label: 'Minutes' },
      { id: 'q9-b', label: 'Hours' },
      { id: 'q9-c', label: 'Days' },
      { id: 'q9-d', label: 'Weeks',  flagged: true },
      { id: 'q9-e', label: 'Months', flagged: true },
    ],
  },
  {
    id: 'q10',
    part: 2,
    kind: 'flag',
    multi: false,
    prompt: 'What share of your support tickets begin with “How do I…” or “Where is…”?',
    options: [
      { id: 'q10-a', label: 'Under 10%' },
      { id: 'q10-b', label: '10–25%' },
      { id: 'q10-c', label: '25–50%',               flagged: true },
      { id: 'q10-d', label: 'Over 50%',             flagged: true },
      { id: 'q10-e', label: 'We don’t track this',  flagged: true },
    ],
  },

  // ── Part 3: Intent ─────────────────────────────────────────
  {
    id: 'q11',
    part: 3,
    kind: 'intent',
    multi: true,
    prompt: 'What’s coming in the next 6 months?',
    options: [
      { id: 'q11-a', label: 'A major launch or redesign',             weight: 'high' },
      { id: 'q11-b', label: 'Scaling the team',                       weight: 'high' },
      { id: 'q11-c', label: 'New product leadership or a reorg',      weight: 'high' },
      { id: 'q11-d', label: 'A fundraise or exit prep',               weight: 'high' },
      { id: 'q11-e', label: 'Cost-cutting',                           weight: 'medium' },
      { id: 'q11-f', label: 'Steady state',                           weight: 'low' },
    ],
  },
  {
    id: 'q12',
    part: 3,
    kind: 'focus',
    multi: false,
    prompt: 'If you could fix 1 thing this quarter, what would it be?',
    options: [
      { id: 'q12-a', label: 'Ship faster without the rework',                  offering: 'design-system-embedded' },
      { id: 'q12-b', label: 'Make the product easier to learn and sell',       offering: 'ux-audit-product-design' },
      { id: 'q12-c', label: 'Get the team aligned on what to build',           offering: 'strategy-prototyping' },
      { id: 'q12-d', label: 'Make the product consistent across teams and screens', offering: 'design-system' },
      { id: 'q12-e', label: 'Prove the impact of what we ship',                offering: 'research-measurement' },
    ],
  },
] as const satisfies readonly Question[];

// ============================================================
// Offerings and report content keys
// ============================================================

/**
 * What we pitch, chosen by the respondent's Q12 answer.
 *
 * The names are here; the paragraph under each is Keystatic content. A test
 * asserts these keys are exactly the set Q12 maps to, so adding a Q12 option
 * without an offering — or leaving a dead offering behind — fails the build.
 */
export const OFFERINGS = {
  'design-system-embedded': 'Design system + embedded team',
  'ux-audit-product-design': 'UX audit + product design',
  'strategy-prototyping': 'Product strategy + rapid prototyping',
  'design-system': 'Design system',
  'research-measurement': 'User research + measurement framework',
} as const satisfies Record<OfferingKey, string>;

/**
 * Industries that get their own paragraph in the report. Everything else —
 * Marcom, Aerospace & Defense, Consumer, Other, and a respondent who skipped
 * the field — falls through to `other`.
 *
 * Derived from the priority list rather than written out, so the three
 * industries we write notes for stay the three we score a point for.
 */
export const INDUSTRY_NOTE_KEYS = ['adtech', 'enterprise-saas', 'fintech', 'other'] as const;
export type IndustryNoteKey = (typeof INDUSTRY_NOTE_KEYS)[number];

export function industryNoteKey(industry: string | undefined): IndustryNoteKey {
  return (INDUSTRY_NOTE_KEYS as readonly string[]).includes(industry ?? '')
    ? (industry as IndustryNoteKey)
    : 'other';
}

// ============================================================
// Post-gate fields
// ============================================================

export const LEVELS = [
  { value: 'director', label: 'Director' },
  { value: 'vp',       label: 'VP' },
  { value: 'c-level',  label: 'C-level' },
  { value: 'other',    label: 'Other' },
] as const;
export type Level = (typeof LEVELS)[number]['value'];

export const FUNCTIONS = [
  { value: 'product',     label: 'Product' },
  { value: 'design',      label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'other',       label: 'Other' },
] as const;
export type Fn = (typeof FUNCTIONS)[number]['value'];

/**
 * Industries as a *respondent* self-identifies, which is not the same list as
 * the case study taxonomy in src/lib/vocabularies.ts. That one classifies our
 * own work; this one qualifies a lead, so it carries "Other" and omits the
 * verticals we have no landing page or industry note for.
 *
 * Where a value exists in both lists the slug is identical, and a test asserts
 * that, so the two can never drift apart silently. `marcom` is the exception:
 * it has no counterpart, because the content vocabulary calls the nearest
 * thing `martech`. See the note in the Phase 1 report.
 */
export const LEAD_INDUSTRIES = [
  { value: 'adtech',             label: 'AdTech',              priority: true },
  { value: 'enterprise-saas',    label: 'Enterprise SaaS',     priority: true },
  // "Fintech", not the prompt's "FinTech": the content vocabulary already
  // spells it this way on the live industry page, and a test enforces the match.
  { value: 'fintech',            label: 'Fintech',             priority: true },
  { value: 'marcom',             label: 'Marcom' },
  { value: 'aerospace-defense',  label: 'Aerospace & Defense' },
  { value: 'consumer',           label: 'Consumer' },
  { value: 'other',              label: 'Other' },
] as const;
export type LeadIndustry = (typeof LEAD_INDUSTRIES)[number]['value'];

/** Industries worth a point in the lead score. */
export const PRIORITY_INDUSTRIES: readonly LeadIndustry[] = LEAD_INDUSTRIES
  .filter((i) => (i as { priority?: boolean }).priority === true)
  .map((i) => i.value);

/**
 * Free-mail domains. A match produces a soft warning, never a hard block:
 * plenty of real Director+ prospects at small companies use Gmail, and a
 * blocked submission is a lost lead.
 */
export const FREE_MAIL_DOMAINS: readonly string[] = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'hotmail.com',
  'outlook.com', 'live.com', 'msn.com', 'aol.com', 'icloud.com', 'me.com',
  'mac.com', 'proton.me', 'protonmail.com', 'gmx.com', 'mail.com',
  'zoho.com', 'yandex.com', 'fastmail.com', 'hey.com',
];

// ============================================================
// Lookup helpers
// ============================================================

type AnyOption = Question['options'][number];

const OPTION_INDEX: ReadonlyMap<string, { question: Question; option: AnyOption }> = new Map(
  QUESTIONS.flatMap((question) =>
    question.options.map((option) => [option.id, { question, option }] as const),
  ),
);

export function findOption(id: string): { question: Question; option: AnyOption } | undefined {
  return OPTION_INDEX.get(id);
}

export function getQuestion(id: QuestionId): Question {
  const question = QUESTIONS.find((q) => q.id === id);
  if (!question) throw new Error(`Unknown question: ${id}`);
  return question;
}

/** Human-readable label for a stored option ID, for the internal notification. */
export function labelFor(id: string): string {
  return OPTION_INDEX.get(id)?.option.label ?? id;
}

// ============================================================
// Client-safe projection
// ============================================================

export interface ClientOption {
  readonly id: string;
  readonly label: string;
}

export interface ClientQuestion {
  readonly id: QuestionId;
  readonly part: 1 | 2 | 3;
  readonly prompt: string;
  readonly multi: boolean;
  readonly options: readonly ClientOption[];
}

/**
 * The only shape that may be serialized into the page or sent to the browser.
 * Strips tags, calc values, weights, flags and offering keys — everything the
 * client has no business knowing and that scoring recomputes server-side
 * anyway. Option order is NOT randomized here; the client shuffles, so that
 * the static page stays cacheable.
 */
export function toClientQuestions(): readonly ClientQuestion[] {
  return QUESTIONS.map((q) => ({
    id: q.id,
    part: q.part,
    prompt: q.prompt,
    multi: q.multi,
    options: q.options.map(({ id, label }) => ({ id, label })),
  }));
}
