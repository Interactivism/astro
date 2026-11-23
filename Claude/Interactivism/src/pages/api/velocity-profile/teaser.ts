/**
 * POST /api/velocity-profile/teaser
 *
 * Resolves the archetype for a completed Part 1 and returns only what the
 * teaser screen displays. Exists so that archetype tags never reach the
 * browser: the client posts option IDs and gets back a name and a sentence.
 *
 * Deliberately returns nothing else — no counts, no tags, no cost. The full
 * result is computed again on submission, from the stored answers, and the
 * client's copy of it is never trusted.
 *
 * One addition: `open`, true when the visitor arrived with a campaign key
 * that skips the email gate. It is answered here, for that one key, so the
 * page never holds the key table. It only decides which screen to show —
 * stage "open" on the submit endpoint checks the key again before it stores
 * anything.
 */
import type { APIRoute } from 'astro';
import { ARCHETYPES, QUESTIONS } from '../../../data/velocity-profile';
import { resolveArchetype, type Answers } from '../../../lib/velocity-profile/scoring';
import { markFor } from '../../../lib/velocity-profile/marks';
import { resolveCampaign } from '../../../lib/velocity-profile/campaigns';

export const prerender = false;

const ARCHETYPE_QUESTION_IDS = QUESTIONS.filter((q) => q.kind === 'archetype').map((q) => q.id);

/** Option IDs that belong to Part 1, enumerated from the config. */
const VALID_IDS = new Set<string>(
  QUESTIONS.filter((q) => q.kind === 'archetype').flatMap((q) => q.options.map((o) => o.id)),
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });

export const POST: APIRoute = async ({ request }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Malformed request.' }, 400);
  }

  const submitted = (payload as { answers?: Record<string, unknown> })?.answers;
  if (!submitted || typeof submitted !== 'object') {
    return json({ error: 'No answers supplied.' }, 400);
  }

  // Accept only Part 1 answers, and only IDs that exist. Anything else is
  // dropped rather than rejected: a stray key is not worth failing a response
  // the respondent is waiting on.
  const answers: Answers = {};
  for (const questionId of ARCHETYPE_QUESTION_IDS) {
    const value = submitted[questionId];
    if (typeof value === 'string' && VALID_IDS.has(value)) {
      (answers as Record<string, string>)[questionId] = value;
    }
  }

  const answered = Object.keys(answers).length;
  if (answered < ARCHETYPE_QUESTION_IDS.length) {
    return json({ error: 'Part 1 is incomplete.', answered }, 400);
  }

  const { primary, secondary } = resolveArchetype(answers);

  // The mark travels as rendered SVG, not as a tag or a key. The quiz page
  // ships no marks of its own: shipping all five would tell anyone reading the
  // HTML exactly how many archetypes exist and what each looks like, which is
  // the same leak the tags are kept out of the bundle to prevent.
  return json({
    primary: {
      name: ARCHETYPES[primary].name,
      descriptor: ARCHETYPES[primary].descriptor,
      teaser: ARCHETYPES[primary].teaser,
      mark: markFor(primary),
    },
    secondary: secondary ? { name: ARCHETYPES[secondary].name } : null,
    open: Boolean(resolveCampaign((payload as { c?: unknown }).c)?.open),
  });
};
