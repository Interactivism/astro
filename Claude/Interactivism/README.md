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
| `VELOCITY_LOADED_COST` | Rework cost calculation | `180000` |
| `VELOCITY_NOTIFY_EMAIL` | Where lead notifications go | No notification sent, logged instead |
| `RESEND_API_KEY` | Sending mail via Resend | Nothing sent, message logged |
| `VELOCITY_FROM_EMAIL` | `From:` on outbound mail | Nothing sent, message logged |
| `VELOCITY_REPLY_EMAIL` | Where "Send my result" on an open report is addressed | `hello@interactivism.com` |
| `VELOCITY_CAMPAIGNS_OFF` | Campaign keys to switch off, comma separated | None switched off |
| `VELOCITY_RATE_SALT` | Hashing IPs for rate limiting | `velocity-profile` — set a real secret |

`VELOCITY_FROM_EMAIL` must be on a domain verified in Resend. Until the DNS
records are in place, mail will be rejected.

`VELOCITY_LOADED_COST` is the fully loaded annual cost of one person on a
product team, and it drives every dollar figure shown to a prospect. It lives
in the environment so it can change without a deploy and does not sit in a
public repo.

## Velocity Profile

A 12-question lead-gen self-assessment at `/velocity-profile`. See the
"Velocity Profile" section of [CONTENT.md](CONTENT.md) for the content model,
and [VELOCITY-PROFILE.md](VELOCITY-PROFILE.md) for the non-engineering brief —
what it offers, what a campaign can and cannot claim about it, and how leads
are scored.

```
src/data/velocity-profile.ts        questions, options, tags, calc values
src/lib/velocity-profile/
  scoring.ts                        pure scoring — archetype, cost, lead score
  storage.ts                        Netlify Blobs, in-memory in dev
  email.ts                          Resend + the internal notification
  campaigns.ts                      campaign keys for invited links (server-only)
  marks.ts                          the five archetype figures, as SVG
src/pages/velocity-profile/         the quiz and the report page
src/pages/api/velocity-profile/     teaser and submit endpoints
```

Two rules this code depends on:

**Archetype tags must not reach the browser.** The client script never imports
`src/data/velocity-profile.ts`; it reads what it needs from DOM data
attributes, and the template iterates `toClientQuestions()`, which strips tags,
calc values and weights. Tests assert the projection is clean. If you add
client code, do not import that module into it.

`marks.ts` is keyed by archetype tag and is therefore server-only, like the
config: the teaser endpoint sends one rendered figure, never the map.

**Results are always recomputed server-side.** Whatever the browser posts about
its own score is ignored. `/api/velocity-profile/submit` rescores from the
submitted option IDs.

### Invited links (the open flow)

A link carrying a valid campaign key — `/velocity-profile/?c=<key>` — skips the
email gate. The visitor answers the same 12 questions and sees the same
teaser, then one button, "See the full report", which stores the record and
goes straight to the report. No email is asked for, stored, or sent.

Keys live in `src/lib/velocity-profile/campaigns.ts`. Each one sets the
industry (standing in for the post-gate field, so the report keeps its
tailored note) and is recorded on the submission as `campaign`, with
`utm_source=outbound`, `utm_medium=email`, and `utm_campaign=<key>` in
`attribution`. Rules:

- **The table is server-only**, like the question config. The page learns
  whether the gate is open from the teaser endpoint's `open` flag, for the one
  key the visitor arrived with. Do not import `campaigns.ts` into client code.
- **The browser is not trusted.** Stage `open` on the submit endpoint checks
  the key again before storing anything. An unknown, malformed, or retired key
  gets the ordinary gated flow, never an error.
- **One key per audience, never per person.** A per-person key identifies the
  reader, which the privacy page does not cover.
- **Retiring a key:** set `active: false`, or add it to
  `VELOCITY_CAMPAIGNS_OFF` (comma separated) in Netlify and redeploy.
- Anyone holding a link can forward it, and the recipient skips the gate too.
  That is accepted.

Open records have `stage: "open"`, no `email`, and only `industry` in `lead`.
Every reader of `record.email` has to allow for it being absent.

The report for an open record adds a "Send my result" link in two places — a
`mailto:` to `VELOCITY_REPLY_EMAIL`, carrying the archetype and the report
link. It is the only way an open result reaches us with a name on it, and only
if the reader presses send. The internal notification for an open record has
the subject `[Velocity Profile][Open] <key>: <archetype>` and no identity.
**It is not permission to mention the result to anyone**: at a handful of
sends per key the timing can make the reader obvious, and they have not told
us anything.

### Storage

The report email is short on purpose — archetype, persona line, cost figure,
link. The report itself lives on the web, where it can be shared and where
changing the copy does not mean resending anything.

Submissions live in Netlify Blobs under the `velocity-profile` store, keyed by
the report token. Records hold no IP address; rate limiting keeps a salted hash
in a separate store that is never joined to a submission.

Under `npm run dev` the Netlify adapter is deliberately disabled (it breaks
Keystatic's local API), so Blobs is unavailable and storage falls back to an
in-memory map that does not survive a server restart. **The Blobs path
therefore cannot be exercised locally** — verify it with a real submission
right after the first deploy.

Records that stop at `stage: "email"` mean the second call failed after the
first succeeded — the email and archetype are stored, the detail fields are
not. They are no longer the common case: one click now fires both stages, so
the gate no longer captures an email from someone who abandons the detail
fields. That is deliberate. The button says "Send my report", and storing an
address from a person who never pressed it would not match what the button or
the privacy page says.

### Rate limiting

20 new submissions per hour per IP, as a sliding window in Blobs. Only the
stages that create a record are counted — "email" and "open": stage "complete" needs a token that only stage one can
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

The quiz fires these through the GA4 tag in `BaseLayout.astro`
(`G-ZWM7LHWLM3`), **which loads on the production site only**. `npm run dev`
and Netlify deploy previews ship no tag at all, so local clicks and preview
testing never reach the property — the gate is `import.meta.env.PROD` plus
Netlify's `CONTEXT`. GA's own internal-traffic filter still covers browsing the
live site from the office or home, but that one is tied to an IP and a phone or
a VPN walks past it.

Everything that reports an event does so through `window.gtag?.()`, so a
missing tag is a no-op rather than an error. If you need to watch events
locally, spy on `window.gtag` in the console — there is nothing to unset. All of them were verified firing in order against a real run.

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
| `vp_open_submitted` | — | Open flow: the record was saved, on the way to the report |
| `vp_open_failed` | — | Open flow: the save failed |

On an invited link every quiz event also carries `campaign`, the key from
`?c=`. It is sent whenever the key is well formed, before the server has said
whether it is valid, so a mistyped key shows up as its own value rather than
vanishing.

No answer content is ever sent — only the step number and question ID. The two
failure events exist so a broken endpoint shows up as a cliff in the funnel
instead of silence.

### The report page

| Event | Parameters | When |
|---|---|---|
| `vp_report_view` | `archetype`, `offering` | The report is opened |
| `vp_report_section` | + `section` (`cost`, `moves`, `cta`) | That section is half on screen, once per reader |
| `vp_report_book_click` | `archetype`, `offering` | "Pick a time" pressed |
| `vp_report_share` | + `method` (`native`, `clipboard`, `manual`, `email`) | The link was shared |
| `vp_report_reply_click` | + `placement` (`top`, `cta`) | "Send my result" pressed, on an open report. A click, not a sent email |

Report events from an open record also carry `campaign`, taken from the stored
record, so it is always a valid key.

Every report event carries `archetype` and `offering`, which is what answers
"does this land differently for a Firefighter than a Committee", and "which
pitch gets booked".

Sections are named rather than measured as scroll percentages. "Reached the
moves" is a question about the document; "scrolled 50%" is a question about
pixels, and its answer changes with the length of someone's cost paragraph.

**The report token is never sent to Google.** The page passes `analyticsPath`
to `BaseLayout`, which overrides `page_location` and `page_path` with
`/velocity-profile/report/`. Without it the default page_view would hand
Google a working key to a stranger's report, since the URL is the only thing
protecting it. Any future page whose URL is itself a secret needs the same
prop — and both fields, because GA4 reports on `page_location` and would
otherwise keep the real one.

### Registering the custom dimensions (needs doing once, in the GA4 UI)

Event parameters do not appear in reports until they are registered. Until
this is done, `step` is collected but cannot be reported on, and the
drop-off-by-step question cannot be answered.

1. Open [Google Analytics](https://analytics.google.com), pick the
   Interactivism property.
2. **Admin** (the gear, bottom left) → under *Data display* → **Custom definitions**.
3. **Create custom dimension**, once for each row:

   | Dimension name | Scope | Event parameter |
   |---|---|---|
   | Quiz step | Event | `step` |
   | Quiz question | Event | `question_id` |
   | Walkthrough requested | Event | `walkthrough` |
   | Archetype | Event | `archetype` |
   | Offering | Event | `offering` |
   | Report section | Event | `section` |
   | Share method | Event | `method` |
   | Quiz campaign | Event | `campaign` |
   | Reply placement | Event | `placement` |

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
