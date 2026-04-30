# Claude Code kickoff prompt — Interactivism.com rebuild, session 1

Copy everything between the dividers into Claude Code as the opening message. The prompt is long because the inputs are; resist the urge to trim it. You'll only do this once.

---

## The prompt

I'm rebuilding interactivism.com — the marketing site for my agency Interactivism, currently on WordPress (hosted on Closte). The new site is Astro + MDX + Tailwind + Keystatic, deployed to Netlify. This is a tech migration with design fidelity, not a redesign.

Before you write any code, read these three documents in this order:

1. `PROJECT.md` — what this site is, who it's for, the goals, the migration scope
2. `DESIGN.md` — design tokens, components, page patterns, URL strategy
3. `CONTENT.md` — content schemas for case studies, blog posts, authors, services, clients

These three documents are the source of truth. Treat them as authoritative. If something in this prompt contradicts them, the documents win — flag the contradiction and ask. If you find yourself wanting to do something the documents don't cover, propose adding it to the right document first, then implement.

### What we're doing in this session

This is session 1 of the build. The goal is **the project scaffold and the homepage as a reference pattern** — nothing more. We're not migrating content, not building all the pages, not wiring up the CMS. We're establishing the patterns that every other session will follow.

Specifically:

1. **Scaffold the Astro project** with the integrations and dependencies the docs call for
2. **Set up the design system foundation** — `tailwind.config.mjs` with all tokens from DESIGN.md, fonts self-hosted via `@fontsource/*`, global styles
3. **Define the content collections** in `src/content/config.ts` matching CONTENT.md's schemas
4. **Build the layout shell** — base layout, Header (with the desktop sidenav and mobile floating header per DESIGN.md), Footer
5. **Build the homepage** to a polished state — hero slider, selected work, CTA band
6. **Set up the favicon kit and OG image wiring** in the base layout `<head>`

That's the scope. Keystatic, the other pages, content migration, and the redirect map all happen in later sessions. Don't get ahead.

### Working agreements

- **Commit frequently.** Each numbered step above is a logical commit. Commit at each checkpoint (see below). I'd rather review six small commits than one large one.
- **Show me the diff and ask before installing dependencies.** The docs specify which integrations and packages we use. Anything not on that list needs a justification before adding.
- **Match the voice in PROJECT.md.** Confident, expert, plainspoken. This applies to placeholder copy, error messages, code comments — everywhere words appear.
- **Tailwind tokens, not literal values.** No hardcoded hex colors, no off-scale spacing values. If you need something not in the config, add it to DESIGN.md and `tailwind.config.mjs` first.
- **Co-locate brand assets.** Logo SVGs go in `src/assets/brand/`. Favicon kit goes in `public/`. OG image goes in `public/`.
- **No premature abstraction.** Build for the homepage first. Don't generalize a component until a second use case actually appears. The right abstractions emerge from real duplication, not anticipated duplication.

### Checkpoints

Stop and show me your work at each of these points. I'll review and either approve or request changes before you continue.

**Checkpoint 1 — Project scaffold and dependencies (before any code)**

Show me:
- The Astro version and the integrations you're installing
- The full `package.json` you're about to commit
- Any deviation from what the docs specify, with rationale

Don't run `astro dev` yet. I want to confirm the dependency surface before we go further.

**Checkpoint 2 — Design system foundation**

Show me:
- `tailwind.config.mjs` with all design tokens from DESIGN.md (colors, type scale, spacing, breakpoints, motion)
- `src/styles/global.css` with the Tailwind directives, font face declarations via `@fontsource/*`, and any base element resets
- A simple test page rendering the type scale, color palette, and a couple of buttons, so we can verify the tokens are wired correctly

This is the most important checkpoint. The tokens established here propagate everywhere. If anything's wrong, it's cheap to fix now and expensive to fix later.

**Checkpoint 3 — Content collections defined**

Show me:
- `src/content/config.ts` with Zod schemas for `caseStudies`, `blog`, `authors`, `services`, matching CONTENT.md exactly
- One example file in each collection, populated with realistic placeholder content, that validates against the schema
- The TypeScript types Astro generates from the schemas

Don't migrate real content yet. We're verifying the schemas hold.

**Checkpoint 4 — Layout shell**

Show me:
- Base layout component with the favicon `<head>` snippet, OG meta tags, and analytics placeholder
- Header component implementing both the desktop sidenav and mobile floating header per DESIGN.md
- Footer component with the three social platforms and dynamic copyright year
- A bare-bones page (e.g. `/contact/`) wired up to the layout to verify the shell renders correctly at desktop and mobile breakpoints

The Header is the most complex part of this checkpoint. Get it right here and every other page inherits a clean shell.

**Checkpoint 5 — Homepage**

Show me:
- The homepage at `/` with the hero slider, selected work section, and CTA band per DESIGN.md
- Slider implements the accessibility behavior the docs require (no auto-advance, keyboard support, focus management, reduced-motion handling)
- Realistic placeholder content (not "Lorem ipsum" — write one-line teasers in the studio voice for two or three example case studies)
- Lighthouse run on the rendered homepage, with scores reported

If Lighthouse is below 90 on any axis, fix before we continue.

### What to do now

Start by reading the three docs. After you've read them, before you do anything else, tell me:

1. A one-paragraph summary of your understanding of the project
2. Any contradictions, ambiguities, or gaps you spotted across the three docs
3. The dependency list you're planning to install (for Checkpoint 1)

Don't run any commands yet. Just confirm the read.

---

## After the prompt — how to run the session

Some practical advice for you, not Claude Code:

**Resist the urge to multitask the first session.** This is the session that establishes the patterns. Pair on it actively. Let Claude Code do the typing; you're doing the reviewing and the deciding.

**At each checkpoint, actually look at the diff.** Not "looks fine, continue." The patterns set here propagate. A poorly-named token now is a multi-file rename later. A weird component structure now is a build-wide rewrite later.

**If something looks wrong, fix it now.** Future sessions will follow whatever pattern the homepage uses. "I'll clean it up later" is a lie we tell ourselves.

**Time budget the session.** A clean kickoff takes 3–5 hours of focused pairing. If the first checkpoint takes 90 minutes, slow down and figure out why. If you're racing, you're not reviewing carefully enough.

**Save the chat.** This first Claude Code session is the only one that establishes how you work together on this project. Future sessions will reference patterns from it. Worth keeping accessible.

**Things that will inevitably come up that aren't in the docs:**

- The placeholder case study copy for the homepage. Have a few one-liners ready, in voice, for two or three of your strongest case studies (Dollar Shave Club, NASA, tvScientific are reasonable picks).
- The exact Astro version. Latest stable is fine; if Claude Code asks, default to whatever is current.
- The Plausible/GA snippet specifics. PROJECT.md says Google Analytics; have your GA4 measurement ID ready, or a placeholder if you'd rather wire it up post-launch.
- Where to put the homepage hero image. The docs don't specify a source image; you'll either use one from the live site (in which case grab the file now) or pick a different one.

**What the next session should be:**

Session 2 should be Keystatic setup + the Work index page + one example case study migrated through the full pipeline (schema → content file → page rendering → CMS editing). That validates that the schema works for real content end-to-end, before you migrate the rest. We can write the prompt for session 2 once session 1's checkpoints are all green.
