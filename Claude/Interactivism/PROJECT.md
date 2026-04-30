# Interactivism.com

## What this project is

This repo is the rebuild of **interactivism.com**, the marketing site for Interactivism — a digital product design & development studio based in Pasadena, CA.

We are migrating off WordPress (currently hosted on Closte) to a static site built with Astro, with content authored in Markdown/MDX and edited via Keystatic. The new site should inherit the look, feel, and positioning of the existing interactivism.com — this is a tech migration with design fidelity, not a redesign.

## About Interactivism

Interactivism is a digital product design & development studio that helps clients ranging from NASA to Dollar Shave Club create products and services that are engaging, efficient, and easy to use. Our work has helped create more than $3B in exits.

The studio is led by the co-founders Erik Wingren and Petra Wennberg, with a small team named on the About page.

### Voice and tone

Confident, expert, plainspoken. Avoid agency clichés ("we craft delightful experiences"), hedging language, and superlatives without substance. Specifics over adjectives. The reader should come away thinking *these people know what they're doing* — not because we said so, but because the writing demonstrates it.

## Goals of the new site

The site serves two equally important goals:

1. **Generate qualified inbound leads.** Founders, product leaders, and operators who land on the site should quickly understand what we do, see proof we can do it, and know how to start a conversation.
2. **Support outbound business development.** When a prospect gets a cold email or LinkedIn message and visits the site to vet us, the site should close the credibility gap — case studies, client logos, and clear capability statements that make a follow-up meeting feel low-risk.

Both audiences need the same things — proof, clarity, easy next step — but the outbound audience is more skeptical and arrives with less context. Design and content decisions should optimize for the harder of the two cases.

## Information architecture

The site has the following top-level pages:

- **Home** — positioning, selected work, primary CTA
- **Work** — index of case studies + individual case study detail pages
- **Services** — capabilities offered, with enough specificity to be credible
- **Clients** — logo wall and/or client list, distinct from case studies (clients we've worked with vs. work we can show)
- **Team** — brief description of founders and select team members, with links to expanded profiles
- **Blog** — articles, notes, points of view
- **Contact** — primary conversion surface

### Content collections

The site has four Astro content collections (case studies, blog posts, authors, and service pages), plus two flat data files (`clients.json` and `homepage.json`). Schemas, fields, validation rules, and MDX components are documented in detail in **CONTENT.md** — this document is the source of truth for content structure.

At a high level:

- **`caseStudies`** — individual project writeups, written in MDX with embedded components for stats, pull quotes, image grids, and before/after comparisons. Several case studies are ready to publish at launch.
- **`blog`** — articles and shorter posts. Migrating existing posts from WordPress; expect cleanup work on the imported content.
- **`authors`** — author profiles referenced by blog posts (Erik, Petra, named team members, and a studio-byline "Interactivism" entry).
- **`services`** — one MDX page per service offering, surfaced on the Services index and at `/services/[service]/`.
- **`clients.json`** — flat data file driving the Clients page and homepage logo wall.
- **`homepage.json`** — flat data file driving the homepage composition (hero + featured case studies + featured blog posts).

`src/content/config.ts` (Astro / Zod) and `keystatic.config.ts` (CMS UI) implement the same schemas in different syntaxes. Both must stay in sync — see CONTENT.md for the mapping.

## Tech stack

- **Framework:** Astro (latest), with MDX support via `@astrojs/mdx`
- **Styling:** Tailwind with a custom config mirroring Interactivism's design tokens.
- **Content:** Markdown/MDX in `src/content/`, validated via Astro content collections + Zod schemas
- **CMS:** Keystatic, starting in local mode, with the option to switch to GitHub mode later if non-technical team members need access
- **Hosting:** Netlify (chosen for first-class Astro support and built-in form handling for the contact page)
- **Forms:** Netlify Forms for the contact page; route to hello@interactivism.com
- **Images:** Astro's built-in image optimization (`astro:assets`); source images live in `src/assets/`
- **Sitemap & RSS:** `@astrojs/sitemap` and `@astrojs/rss`
- **Analytics:** Google Analytics

## Design fidelity

The new site carries forward the look and feel of the current interactivism.com — refined, not redesigned. Design tokens (colors, typography, spacing, component patterns) and the URL strategy live in **DESIGN.md**, which is the source of truth for visual and IA decisions. This document defers to it on anything design-related.

## Migration scope

Content being migrated from the current WordPress site:

- **Case studies** — those ready to publish carry forward; tagged with industry and services per the CONTENT.md schema.
- **Selected blog posts** — cleanup pass required; older or low-value posts may be pruned rather than migrated.
- **Service pages** — content from the live site's three-level service hierarchy (`/services/` → category → sub-category) consolidates into one MDX page per service in the new `services` collection. Sub-category content becomes h2 sections within the consolidated page; old URLs redirect to anchors. See DESIGN.md "URL strategy & redirects" for the redirect pattern.
- **Author profiles** — team member bios from the live Team page become entries in the `authors` collection. Bios may need rewriting to fit CONTENT.md's length and structure constraints. Includes a studio-byline "Interactivism" entry for posts not attributed to an individual.
- **Client list / logos** — populates `clients.json` and the homepage logo wall.
- **Static page content** — home, services index, team, contact.

Out of scope for migration:

- WordPress comments
- WordPress user accounts
- Any plugin-driven functionality not explicitly listed above

URL structure preserves existing slugs where possible, with 301 redirects from old paths to new paths configured in `netlify.toml`. The complete redirect map — including the service-hierarchy consolidation — is generated from a URL inventory of the live site before cutover. See DESIGN.md for redirect specifics.

## Success criteria

The migration is successful when:

1. The new site is live at interactivism.com with feature parity for everything in scope above.
2. Lighthouse scores are 90+ on Performance, Accessibility, Best Practices, and SEO across all page types.
3. All inbound links to the old site resolve (200 or 301, never 404). Verified via Screaming Frog crawl post-launch.
4. Erik or Petra can publish a new blog post or case study via Keystatic without touching code or config.
5. The Closte WordPress install can be safely retired after a 2–4 week overlap period.

## Working with this repo

When making changes via Claude Code or otherwise:

- **Read DESIGN.md before any visual work.** Design decisions follow the tokens and patterns documented there. If a needed pattern doesn't exist, add it to DESIGN.md before implementing it.
- **Read CONTENT.md before any schema or content-template work.** Content structure decisions follow CONTENT.md. Schema changes happen there first, then propagate to `src/content/config.ts` and `keystatic.config.ts` in the same commit.
- **Commit frequently in small, reviewable chunks.** Page-by-page or component-by-component, not feature-branches-with-fifty-files.
- **Match the existing voice.** Confident, expert, plainspoken. When in doubt, write less and be more specific.
- **Don't add dependencies casually.** Astro + a few official integrations should cover almost everything. New runtime dependencies need a real justification.
