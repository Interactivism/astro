# Product Velocity Profile — brief

A one-page orientation for anyone working *around* the assessment — campaigns,
outreach, sales follow-up — rather than in the code. If you are about to edit
the repo, start at [README.md](README.md) instead.

**Live:** https://interactivism.com/velocity-profile/

---

## What it is

A 12-question self-assessment that tells a product leader how their team ships,
what rework is probably costing them, and three things they could do about it
on Monday. It takes about 3 minutes. The full result is gated behind a work
email.

**Who it is for:** Director level and above in product, design, or engineering.
Priority industries are AdTech, Enterprise SaaS, and Fintech — those three get
a tailored paragraph in the report and score an extra point as a lead.
Everyone else gets a general version, not a worse one.

## What happens, in order

1. **Twelve questions**, one per screen, in three parts — how the team decides,
   what rework costs, and what is coming in the next 6 months.
2. **Teaser**: their archetype and one sentence, free, before any ask.
3. **Gate**: a work email. The detail fields (name, company, level, function,
   industry) unfurl once the address is valid, and one button sends.
4. **Email**: short — archetype, the cost figure, and a link. The report itself
   lives on the web.
5. **Report**: strength, failure mode quoted back against their own answers,
   the cost estimate, an industry note, three moves, one offering, a booking
   CTA, and a share block.

### Invited links

A link with a campaign key on the end — `/velocity-profile/?c=<key>` — skips
step 3. Same questions, same teaser, then one button straight to the report.
No email is asked for or stored, so we do not know who took it unless they
press "Send my result" on the report, which opens an email to us in their own
mail app with their profile and the report link.

Keys are one per audience, never one per person. Copy that says "no sign-up"
is true **only** with a valid key on the link; on the public page it is false.

We get a notification when someone finishes on an invited link — campaign and
archetype, no name. **Never mention a result to someone who has not sent it to
us**, even when the timing makes it obvious who it was.

## The five archetypes

Feature Factory, Committee, Engineering-Led, Sales-Driven, Firefighter. Each
has a one-line persona descriptor and a geometric mark. Six of the twelve
questions each contribute one tag; the most common tag wins, and a strong
runner-up shows as a "streak" — "Committee, with a Sales-Driven streak".

Names, descriptors, and teaser lines: `src/data/velocity-profile.ts`.
The longer report copy is in Keystatic, under Velocity Profile — Archetypes.

## The number

> team size × $180,000 × the rework share they reported

$180K is the fully loaded annual cost of one person, set in Netlify as
`VELOCITY_LOADED_COST` so it can change without a deploy. Results range from
about $50K for a small team at low rework to roughly $20M for 250+ people at
over 35%.

**Say "estimate", never "audit".** The report says so itself, in those words,
and the figure is presented as an order of magnitude. If someone answers "not
sure" on rework, the report assumes 10% and tells them it did.

## What we learn about a lead

Answers, result, email, and the five detail fields, plus how they arrived (the
campaign tag on the link, or the referring site). **No IP address is stored
with a submission.**

Each lead is scored and tiered — hot at 10+, warm at 5+, cold below. Points
come from asking for a walkthrough (5), a high-intent event in the next 6
months (3), seniority (2–3), team size (2–3), rework at 20% or more (2), and a
priority industry (1). The tier is in the subject line of the internal
notification.

## What the campaign can and cannot say

- **Can:** it is free, takes 3 minutes, needs no sign-in to read or forward,
  and the three moves are useful without hiring us. That last one is
  deliberate — it is what makes the report worth forwarding.
- **Cannot:** any claim that the dollar figure is measured, audited, or
  specific to their business. It is arithmetic on two answers they gave.
- **Privacy:** we do not sell data or share it with advertisers, and we delete
  on request. The [privacy page](https://interactivism.com/privacy/) says what
  is collected and who touches it. Keep campaign copy consistent with it.
- **No cookie banner today.** Google Analytics sets cookies. If ads target the
  EU or UK, that decision needs making before the spend starts.
- **Rate limit:** 20 submissions an hour from one IP address. Fine for real
  traffic; worth knowing if a team demos it together on one network.

## What we can measure

The whole funnel is instrumented: start, each question, the teaser, the email,
the post-gate fields, the walkthrough opt-in, then on the report itself —
opened, reached the cost, reached the moves, reached the CTA, booking clicked,
and shared. Report events carry the archetype and the offering, so "which pitch
gets booked" is answerable.

Two caveats:

- **GA4 custom dimensions must be registered before the data is reportable**,
  and registration is not retroactive. See the Analytics section of
  [README.md](README.md).
- **There is no traffic yet** beyond our own testing, so nothing here has been
  validated against real respondents. Treat every assumption as untested.

## Where things change

| To change | Go to |
|---|---|
| Report copy, archetypes, industry notes, offerings | Keystatic, at `/keystatic` |
| Questions, options, scoring, archetype identity | `src/data/velocity-profile.ts` — code change, with tests |
| The cost basis | `VELOCITY_LOADED_COST` in Netlify, then redeploy |
| Where lead notifications land | `VELOCITY_NOTIFY_EMAIL` in Netlify |
| Which calendar "Book a call" opens | `src/data/booking.json` |
| Campaign keys for invited links | `src/lib/velocity-profile/campaigns.ts` — code change, with tests |
| Where "Send my result" is addressed | `VELOCITY_REPLY_EMAIL` in Netlify |

Changing an option's archetype tag changes everyone's result, which is why
those live in code behind tests rather than in the CMS.
