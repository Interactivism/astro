/**
 * Velocity Profile — campaign keys.
 *
 * A campaign key is the short `?c=` parameter on an invited link. A valid,
 * open key lets the visitor read the full report without giving an email:
 * the quiz shows one button where the gate would be, and the record is stored
 * with no contact details at all.
 *
 * SERVER-ONLY, like the question config. The quiz page never imports this
 * module; it learns whether the gate is open from the teaser endpoint's
 * answer, for the one key the visitor arrived with. Shipping the table would
 * publish every live key.
 *
 * One key per audience and touch — never per person. A per-person key would
 * identify the reader, which the privacy page does not cover and the link
 * does not disclose.
 *
 * Anyone holding a link can forward it, and the recipient skips the gate too.
 * That is accepted: forwarding is what the report is for. `active` and
 * VELOCITY_CAMPAIGNS_OFF are the controls if a key travels further than
 * intended.
 */

import { LEAD_INDUSTRIES, type LeadIndustry } from '../../data/velocity-profile';
import { scoreSubmission, type Answers } from './scoring';
import { createToken, type Attribution, type SubmissionRecord } from './storage';

export interface Campaign {
  /** What appears in the link. Lowercase letters, digits and hyphens. */
  key: string;
  /** Skips the email gate. */
  open: boolean;
  /** Stands in for the post-gate industry field, so the report keeps its tailored note. */
  industry: LeadIndustry;
  /** Set false to retire a key in code. */
  active: boolean;
}

const CAMPAIGNS: readonly Campaign[] = [
  { key: 'adtech-t3',  open: true, industry: 'adtech',          active: true },
  { key: 'saas-t3',    open: true, industry: 'enterprise-saas', active: true },
  { key: 'fintech-t3', open: true, industry: 'fintech',         active: true },
  // Warm testers: people we asked to try it. General report, no industry note.
  { key: 'warm-test',  open: true, industry: 'other',           active: true },
];

/** The shape a key must have before it is looked up, stored or reported. */
export const CAMPAIGN_KEY = /^[a-z0-9][a-z0-9-]{0,39}$/;

const INDUSTRY_VALUES = new Set<string>(LEAD_INDUSTRIES.map((item) => item.value));

/**
 * Keys switched off from the environment, comma separated. Lets a leaked key
 * be retired from the Netlify UI — a redeploy, but no code change.
 */
function switchedOff(): Set<string> {
  return new Set(
    (process.env.VELOCITY_CAMPAIGNS_OFF ?? '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** Every configured campaign, for tests and invariants. */
export function allCampaigns(): readonly Campaign[] {
  return CAMPAIGNS;
}

/**
 * The campaign for a submitted key, or null.
 *
 * Null covers every way a key can be wrong — not a string, malformed, unknown,
 * retired, switched off — because the caller's answer is the same in each
 * case: fall back to the public, gated flow. It never throws.
 */
export function resolveCampaign(raw: unknown): Campaign | null {
  if (typeof raw !== 'string') return null;
  const key = raw.trim().toLowerCase();
  if (!CAMPAIGN_KEY.test(key)) return null;

  const campaign = CAMPAIGNS.find((item) => item.key === key);
  if (!campaign || !campaign.active || !INDUSTRY_VALUES.has(campaign.industry)) return null;
  if (switchedOff().has(key)) return null;
  return campaign;
}

/** How an invited link is recorded. Derived from the key, so it cannot drift from it. */
export function campaignAttribution(campaign: Campaign): Record<string, string> {
  return { utm_source: 'outbound', utm_medium: 'email', utm_campaign: campaign.key };
}

/**
 * A record for the open flow: answers, result, campaign — and no email.
 *
 * The campaign's attribution wins over anything the browser sent under the
 * same names; the referrer and landing time the browser captured are kept.
 */
export function buildOpenRecord(input: {
  answers: Answers;
  campaign: Campaign;
  attribution: Attribution | null;
  loadedCost: number;
  now?: string;
}): SubmissionRecord {
  const { answers, campaign, loadedCost } = input;
  const now = input.now ?? new Date().toISOString();
  const lead = { industry: campaign.industry };

  return {
    id: createToken(),
    createdAt: now,
    updatedAt: now,
    stage: 'open',
    campaign: campaign.key,
    answers,
    lead,
    results: scoreSubmission({ answers, ...lead }, loadedCost),
    attribution: { ...(input.attribution ?? {}), ...campaignAttribution(campaign) },
    meta: { loadedCost },
  };
}
