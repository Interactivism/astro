/**
 * Velocity Profile — outbound email via Resend.
 *
 * Two messages: the respondent's report and the internal lead notification.
 *
 * Without RESEND_API_KEY nothing is sent: the message is logged and the call
 * reports `skipped`. That keeps local runs quiet and means a missing key never
 * takes down a submission — the lead is already stored by the time we get
 * here, and a lead in Blobs with no notification is recoverable, while a 500
 * that loses the submission is not.
 */

import {
  ARCHETYPES,
  LEAD_INDUSTRIES,
  LEVELS,
  FUNCTIONS,
  labelFor,
} from '../../data/velocity-profile';
import type { SubmissionRecord } from './storage';
import { streakPhrase } from './streak';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export interface SendResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.VELOCITY_FROM_EMAIL;

  if (!apiKey || !from) {
    console.info(
      `[velocity-profile] Email not sent (RESEND_API_KEY or VELOCITY_FROM_EMAIL unset).\n` +
        `  to: ${message.to}\n  subject: ${message.subject}\n\n${message.text}`,
    );
    return { ok: true, skipped: true };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      return { ok: false, error: `Resend responded ${response.status}: ${await response.text()}` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown send failure' };
  }
}

// ============================================================
// Internal notification
// ============================================================

const label = <T extends readonly { value: string; label: string }[]>(
  list: T,
  value: string | undefined,
): string => list.find((item) => item.value === value)?.label ?? '—';

/** "Jane Doe, VP Product, Acme" — whatever parts we actually have. */
function who(record: SubmissionRecord): string {
  const { name, level, fn, company } = record.lead;
  // "Other" is a real selection but says nothing in a subject line, so it is
  // left out rather than rendered as "Other Other".
  const role = [
    level && level !== 'other' ? label(LEVELS, level) : null,
    fn && fn !== 'other' ? label(FUNCTIONS, fn) : null,
  ]
    .filter(Boolean)
    .join(' ');
  return [name, role || null, company].filter(Boolean).join(', ') || record.email || 'No contact details';
}

export function buildInternalNotification(record: SubmissionRecord, siteUrl: string): EmailMessage {
  const { results, lead, answers, attribution } = record;
  const primary = ARCHETYPES[results.archetype.primary];
  const secondary = results.archetype.secondary
    ? ARCHETYPES[results.archetype.secondary].name
    : null;

  const tier = results.lead.tier;
  // An open record has nobody to name, and its lead score is low by
  // construction (no level, no walkthrough), so a tier would mislead. The
  // subject carries what there is: which campaign, and what they got.
  const open = record.stage === 'open';
  const subject = open
    ? `[Velocity Profile][Open] ${record.campaign ?? 'unknown campaign'}: ${primary.name}`
    : `[Velocity Profile][${tier[0].toUpperCase()}${tier.slice(1)}] ${who(record)}`;

  const intent = (answers.q11 ?? []).map(labelFor);

  const lines = [
    ...(open
      ? [
          `Open link, campaign "${record.campaign ?? 'unknown'}". No email was asked for or stored.`,
          'We do not know who this is. Do not mention this result to anyone who has not sent it to us.',
          '',
        ]
      : []),
    `${primary.name}${secondary ? ` ${streakPhrase(secondary)}` : ''}`,
    results.archetype.settledBy
      ? `  (tie broken by ${results.archetype.settledBy.toUpperCase()} — a weaker read than a clear winner)`
      : null,
    '',
    `Lead score   ${results.lead.score} — ${tier}`,
    ...results.lead.breakdown.map((item) => `  +${item.points}  ${item.label}`),
    '',
    `Email        ${record.email ?? '—'}`,
    `Name         ${lead.name || '—'}`,
    `Level        ${label(LEVELS, lead.level)}`,
    `Function     ${label(FUNCTIONS, lead.fn)}`,
    `Company      ${lead.company || '—'}`,
    `Industry     ${label(LEAD_INDUSTRIES, lead.industry)}`,
    `Walkthrough  ${lead.walkthrough ? 'YES — they asked for a call' : 'no'}`,
    '',
    '— Cost of rework —',
    results.cost
      ? `${results.cost.display} a year` +
        `\n  ${results.cost.assumptions.teamSize} people × $${results.cost.assumptions.loadedCost.toLocaleString('en-US')}` +
        ` × ${Math.round(results.cost.assumptions.reworkLow * 100)}–${Math.round(results.cost.assumptions.reworkHigh * 100)}%`
      : 'Not calculated — team size or rework share missing.',
    results.flags.length
      ? `Flags: ${results.flags.map((flag) => `${flag.code} ("${flag.answer}")`).join('; ')}`
      : 'No flags.',
    '',
    '— What is coming (Q11) —',
    intent.length ? intent.map((item) => `  • ${item}`).join('\n') : '  —',
    '',
    '— One thing to fix (Q12) —',
    `  ${answers.q12 ? labelFor(answers.q12) : '—'}`,
    '',
    '— Open the first call with —',
    `  "${primary.openingQuestion}"`,
    '',
    '— Source —',
    attribution
      ? Object.entries(attribution)
          .filter(([, value]) => value)
          .map(([key, value]) => `  ${key}: ${value}`)
          .join('\n') || '  direct'
      : '  unknown',
    '',
    `Report: ${siteUrl}/velocity-profile/report/${record.id}`,
  ];

  return {
    to: process.env.VELOCITY_NOTIFY_EMAIL ?? '',
    subject,
    text: lines.filter((line) => line !== null).join('\n'),
    replyTo: record.email,
  };
}

export async function sendInternalNotification(
  record: SubmissionRecord,
  siteUrl: string,
): Promise<SendResult> {
  const message = buildInternalNotification(record, siteUrl);
  if (!message.to) {
    console.warn('[velocity-profile] VELOCITY_NOTIFY_EMAIL unset — no internal notification sent.');
    return { ok: true, skipped: true };
  }
  return sendEmail(message);
}

// ============================================================
// Report email
// ============================================================

export function buildReportEmail(
  record: SubmissionRecord,
  reportText: string,
  archetypeName: string,
): EmailMessage {
  const firstName = record.lead.name?.trim().split(/\s+/)[0];
  return {
    // Callers only reach this for a gated record. An open one has no address,
    // and sendReportEmail refuses it before anything is built.
    to: record.email ?? '',
    subject: `${firstName ? `${firstName}, your` : 'Your'} Velocity Profile: ${archetypeName}`,
    text: reportText,
    // Replies go to a person, not into a void.
    replyTo: process.env.VELOCITY_NOTIFY_EMAIL || undefined,
  };
}

export async function sendReportEmail(
  record: SubmissionRecord,
  reportText: string,
  archetypeName: string,
): Promise<SendResult> {
  if (!record.email) return { ok: true, skipped: true };
  return sendEmail(buildReportEmail(record, reportText, archetypeName));
}
