# interactivism.com

Marketing site for Interactivism. Astro 5 + Tailwind + Keystatic, deployed to Netlify.

The working docs are the source of truth for everything else:

| Doc | Owns |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Rules that are easy to get wrong |
| [PROJECT.md](PROJECT.md) | Intent, IA, URL strategy and redirects, structured data |
| [DESIGN.md](DESIGN.md) | Every visual decision — tokens, components, page patterns |
| [CONTENT.md](CONTENT.md) | Content schemas, controlled vocabularies, what to write |
| [SCHEMA.md](SCHEMA.md) | Astro ↔ Keystatic mapping, validation rules |

## Commands

```bash
npm run dev               # dev server at :4321, Keystatic at /keystatic
npm run build             # production build
npm test                  # unit tests (vitest)
npm run lint:typography   # straight apostrophes in .astro user-facing text
```

If Keystatic shows a blank screen or a 504 "Outdated Optimize Dep", clear the
stale Vite cache: `rm -rf node_modules/.vite && npm run dev`.

## Environment variables

Set these in Netlify under **Site configuration → Environment variables**.
Everything below has a safe fallback, so a missing variable degrades rather
than breaks — but the Velocity Profile is not fully live until the first four
are set.

| Variable | Used by | Default if unset |
|---|---|---|
| `VELOCITY_LOADED_COST` | Rework cost calculation | `200000` |
| `VELOCITY_NOTIFY_EMAIL` | Where lead notifications go | No notification sent, logged instead |
| `RESEND_API_KEY` | Sending mail via Resend | Nothing sent, message logged |
| `VELOCITY_FROM_EMAIL` | `From:` on outbound mail | Nothing sent, message logged |
| `VELOCITY_RATE_SALT` | Hashing IPs for rate limiting | `velocity-profile` — set a real secret |

`VELOCITY_FROM_EMAIL` must be on a domain verified in Resend. Until the DNS
records are in place, mail will be rejected.

`VELOCITY_LOADED_COST` is the fully loaded annual cost of one person on a
product team, and it drives every dollar figure shown to a prospect. It lives
in the environment so it can change without a deploy and does not sit in a
public repo.

## Velocity Profile

A 12-question lead-gen self-assessment at `/velocity-profile`. See the
"Velocity Profile" section of [CONTENT.md](CONTENT.md) for the content model.

```
src/data/velocity-profile.ts        questions, options, tags, calc values
src/lib/velocity-profile/
  scoring.ts                        pure scoring — archetype, cost, lead score
  storage.ts                        Netlify Blobs, in-memory in dev
  email.ts                          Resend + the internal notification
src/pages/velocity-profile/         the quiz and the report page
src/pages/api/velocity-profile/     teaser and submit endpoints
```

Two rules this code depends on:

**Archetype tags must not reach the browser.** The client script never imports
`src/data/velocity-profile.ts`; it reads what it needs from DOM data
attributes, and the template iterates `toClientQuestions()`, which strips tags,
calc values and weights. Tests assert the projection is clean. If you add
client code, do not import that module into it.

**Results are always recomputed server-side.** Whatever the browser posts about
its own score is ignored. `/api/velocity-profile/submit` rescores from the
submitted option IDs.

### Storage

Submissions live in Netlify Blobs under the `velocity-profile` store, keyed by
the report token. Records hold no IP address; rate limiting keeps a salted hash
in a separate store that is never joined to a submission.

Under `npm run dev` the Netlify adapter is deliberately disabled (it breaks
Keystatic's local API), so Blobs is unavailable and storage falls back to an
in-memory map that does not survive a server restart. **The Blobs path
therefore cannot be exercised locally** — verify it with a real submission
right after the first deploy.

Records that stop at `stage: "email"` are people who passed the gate but
abandoned the fields below it. Their email and archetype are still stored.

### Rate limiting

20 new submissions per hour per IP, as a sliding window in Blobs. Only the
first stage is counted: stage "complete" needs a token that only stage one can
issue, so it is already gated, and charging both stages meant an honest
respondent spent two of their allowance and could be cut off halfway through,
having already handed over their email.

The limit is deliberately loose. Mobile carriers and large offices put many
people behind one address and ad traffic is mostly mobile, so a tight limit
locks out real respondents long before it inconveniences anyone malicious.
This raises the cost of casual abuse; it is not real protection. Blobs is
eventually consistent, and a script rotating IPs goes straight through.
Netlify's own rate limiting is the real answer and is a paid-plan feature.

## Analytics

The quiz fires these through the GA4 tag already in `BaseLayout.astro`
(`G-ZWM7LHWLM3`). All of them were verified firing in order against a real run.

| Event | Parameters | When |
|---|---|---|
| `vp_start` | — | "Start" pressed |
| `vp_question_answered` | `step` (1–12), `question_id` | Each question advanced past |
| `vp_teaser_view` | — | Archetype shown |
| `vp_email_submitted` | — | Email **saved** (not merely submitted) |
| `vp_email_failed` | — | The save failed |
| `vp_postgate_complete` | `walkthrough` (bool) | Post-gate fields saved |
| `vp_walkthrough_optin` | — | They asked for a call |
| `vp_postgate_failed` | — | The post-gate save failed |

No answer content is ever sent — only the step number and question ID. The two
failure events exist so a broken endpoint shows up as a cliff in the funnel
instead of silence.

### Registering the custom dimensions (needs doing once, in the GA4 UI)

Event parameters do not appear in reports until they are registered. Until
this is done, `step` is collected but cannot be reported on, and the
drop-off-by-step question cannot be answered.

1. Open [Google Analytics](https://analytics.google.com), pick the
   Interactivism property.
2. **Admin** (the gear, bottom left) → under *Data display* → **Custom definitions**.
3. **Create custom dimension**, three times:

   | Dimension name | Scope | Event parameter |
   |---|---|---|
   | Quiz step | Event | `step` |
   | Quiz question | Event | `question_id` |
   | Walkthrough requested | Event | `walkthrough` |

4. Save each one.

**This is not retroactive.** Only data collected after you save it is
reportable, and it takes 24–48 hours to show up. Do it before the ads start,
not after.

### Marking the conversions

**Admin → Events**, find `vp_postgate_complete` and `vp_walkthrough_optin`,
and toggle **Mark as key event** on each. They only appear in that list after
they have fired at least once in production, so this is a second visit.

### Seeing the drop-off

**Explore → Funnel exploration.** Steps: `vp_start` → `vp_teaser_view` →
`vp_email_submitted` → `vp_postgate_complete`. The gap between
`vp_teaser_view` and `vp_email_submitted` is the gate's cost — the number that
decides whether gating was the right call.

For drop-off *within* the questions, add `vp_question_answered` and break it
down by the Quiz step dimension. **Count users, not events**: going back and
re-answering fires the event again for that step, so an event count
overstates it.
