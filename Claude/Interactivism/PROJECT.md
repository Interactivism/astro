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

`src/content/config.ts` (Astro / Zod) and `keystatic.config.ts` (CMS UI) implement the same schemas in different syntaxes. Both must stay in sync — see SCHEMA.md for the mapping.

## URL strategy & redirects

The new site's URL structure is intentionally flatter than the live site. Most paths carry forward unchanged; service URLs consolidate from three levels to two.

### Final URL structure

```
/                                   Home
/services/                          Services index
/services/[service]/                Service detail (e.g. /services/product-design/)
/work/                              Case studies index
/work/[slug]/                       Case study detail
/clients/                           Clients list
/blog/                              Blog index
/blog/[slug]/                       Blog post
/team/                              Team page
/contact/                           Contact

/sitemap.xml                        Auto-generated via @astrojs/sitemap
/rss.xml                            Auto-generated via @astrojs/rss
/404                                Custom 404 page
```

Trailing slashes are consistent across the site (always present on directory-style URLs). Astro's `trailingSlash` config option is set to `'always'` in production and `'ignore'` in development — the `'ignore'` setting is required in dev so that Keystatic's API routes (which call endpoints without trailing slashes) are not 404'd by the dev server.

### Redirects (built during migration, lives in `netlify.toml`)

Four categories of redirect to handle:

1. **Service rename redirects.** Several service URLs change in the new site (consolidating from six services to five, with three renames):

   | From | To |
   |---|---|
   | `/services/ux-design/` | `/services/product-design/` |
   | `/services/strategy-growth/` | `/services/product-strategy/` |
   | `/services/research/` | `/services/user-research/` |
   | `/services/training/` | `/services/` |

   `/services/human-ai-experience/`, `/services/development/`, and `/services/brand-development/` carry forward unchanged.

2. **Service sub-category pages → consolidated service page anchors.** Every URL like `/services/ux-design/information-architecture/` redirects to the renamed parent's anchor: `/services/product-design/#information-architecture`. The destination service page must render `id` attributes on the corresponding h2 sections (handled automatically via `rehype-slug` on Astro's MDX pipeline).

3. **WordPress permalink patterns → new slugs.** Date-based blog URLs like `/2024/03/15/post-title/` redirect to `/blog/post-title/`. Category and tag archive URLs from WordPress redirect to the blog index.

4. **Any URL that no longer exists** (orphaned WordPress pages, plugin-generated URLs, dropped Training sub-category pages, etc.) redirects to the most relevant section, or to the 404 page if no relevant destination exists.

The complete redirect map is generated during the migration phase by crawling the live site (Screaming Frog or the WordPress REST API) for an exhaustive URL inventory, then writing one redirect rule per old URL. No URL goes unmapped.

Pattern in `netlify.toml`:

```toml
# Service rename
[[redirects]]
  from = "/services/ux-design/"
  to = "/services/product-design/"
  status = 301

# Sub-category to consolidated page anchor
[[redirects]]
  from = "/services/ux-design/information-architecture/"
  to = "/services/product-design/#information-architecture"
  status = 301
```

Test redirects on the staging deploy before cutover. A bad redirect map causes SEO damage that takes months to recover from.

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

The new site carries forward the look and feel of the current interactivism.com — refined, not redesigned. Design tokens (colors, typography, spacing, component patterns) live in **DESIGN.md**, which is the source of truth for visual decisions. The URL strategy lives in this document ("URL strategy & redirects" above). This document defers to DESIGN.md on anything visual.

## Migration scope

Content migrated from the WordPress site at launch:

- **Case studies** — published case studies are live; new work is added via Keystatic. Tagged with industry and services per the CONTENT.md schema.
- **Blog posts** — selected posts migrated with cleanup; older or low-value posts were pruned.
- **Service pages** — the live site's three-level hierarchy consolidated into one MDX page per service. Sub-category content became h2 sections; old URLs redirect to anchors. See "URL strategy & redirects" below for the redirect pattern.
- **Author profiles** — team member bios are in the `authors` collection. Includes a studio-byline "Interactivism" entry for posts not attributed to an individual.
- **Client list / logos** — populates `clients.json` and the homepage logo wall.
- **Static page content** — home, services index, team, contact.

Ongoing updates — new case studies, blog posts, and author profiles — are authored via Keystatic. The WordPress install (Closte) is retired.

Not migrated: WordPress comments, user accounts, plugin-driven functionality.

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
