# Interactivism Content Schemas

## Purpose of this document

This is the source of truth for content structure on interactivism.com — the schemas for case studies, blog posts, authors, and supporting collections. PROJECT.md handles intent; DESIGN.md handles how things look; CONTENT.md handles what gets written and how it's structured.

When working in this repo (especially via Claude Code): **this document defines what `src/content.config.ts` (Astro) and `keystatic.config.ts` (CMS) must implement.** Both files derive from the same schema spec — they describe the same content shape from different angles. Schema changes happen here first, then propagate to `src/content.config.ts` and `keystatic.config.ts` in the same commit. The Keystatic↔Astro mapping table lives in SCHEMA.md.

---

## Content collections overview

The site has five content collections, each living under `src/content/`:

| Collection | Path | Purpose | File format |
|---|---|---|---|
| `caseStudies` | `src/content/caseStudies/` | Project writeups, the primary work showcase | `.mdx` |
| `blog` | `src/content/blog/` | Articles, points of view, notes | `.mdx` (or `.md` for simple posts) |
| `authors` | `src/content/authors/` | Author profiles referenced by blog posts | `.json` |
| `services` | `src/content/services/` | Service detail page bodies | `.mdx` |
| `industries` | `src/content/industries/` | Industry landing pages for BD outreach and vertical search | `.mdx` |

Plus two supporting data files (not content collections — flat data files imported as needed):

- `src/data/clients.json` — list of all clients for the Clients page
- `src/data/homepage.json` — homepage composition (hero content + featured case studies)
- `src/data/booking.json` — which calendar the "Book a call" buttons point at (edited via the one Keystatic singleton)

---

## Case Studies

### File location and naming

```
src/content/caseStudies/
  credtent.mdx
  dollar-shave-club.mdx
  nasa-mission-planning.mdx
```

- Filename is the slug. Lowercase, hyphenated, no special characters.
- Slug pattern: `[client-or-project-name]`. If a single client has multiple case studies, use `[client]-[project]` (e.g. `nasa-mission-planning`, `nasa-earth-observatory`).
- Slugs are permanent once published — changing a slug breaks inbound links and requires a redirect. Pick carefully.

### Frontmatter schema

```yaml
---
title: "Reimagining content licensing for the AI era"
client: "Credtent"
publishedDate: 2025-09-15
status: "published"                 # "draft" | "published"
summary: "A platform helping creators license their work to AI companies on their own terms."
heroImage: "./hero.jpg"
heroImageWide: "./hero-wide.jpg"    # 4:1 marquee for desktop detail page
ogImage: "./og.jpg"                 # optional; falls back to default OG
services:                            # array of service IDs (see Services collection)
  - "product-design"
  - "product-strategy"
  - "development"
deliverables:                        # array of deliverable IDs (controlled vocabulary)
  - "ui-ux-design"
  - "design-system"
industry: "ai-content"               # single industry ID (see industries list)
year: 2025
yearEnd: 2026                        # optional; omit for single-year projects; use "present" for ongoing
role: "Product strategy, design system, front-end development"
duration: "6 months"                 # optional, free-text
metrics:                             # optional array, omit if no metrics
  - value: "$3B"
    label: "in client exits across portfolio"
  - value: "40%"
    label: "reduction in onboarding time"
gallery:                             # optional; images shown in a slideshow above the prose body
  - "./gallery-01.jpg"
  - "./gallery-02.jpg"
relatedCaseStudies:                  # optional, max 2; manual curation overrides auto-related
  - "dollar-shave-club"
  - "nasa-mission-planning"
---
```

### Field details

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Project title, not client name. Used in h1 and page `<title>`. Max 80 chars. |
| `client` | string | yes | Client name as it appears in the case study card eyebrow. |
| `publishedDate` | date (ISO) | yes | Used for sort order. Drafts can have future dates. |
| `status` | enum | yes | `draft` posts are excluded from production builds. Default: `draft`. |
| `summary` | string | yes | One-line description. Used in case study cards, OG description, RSS, and search results. 100–160 characters. |
| `heroImage` | image | yes | Canonical 16:9 image for the case study. Used on the Work index card, homepage slide, and the **mobile** detail page hero. Min 1920px wide. |
| `heroImageWide` | image | yes | 4:1 marquee for the **desktop** detail page hero. Composed knowing the leftmost ~360px is partially obscured by the sidenav (visible only inside the logo silhouette). Min 2400px wide. |
| `ogImage` | image | no | If omitted, the case study uses the site default OG image. Recommended: 1200×630px. |
| `services` | string[] | yes | Array of service IDs. Must match IDs in the Services collection. Min 1 item. |
| `industry` | string | yes | Single industry ID from the controlled list (see below). |
| `year` | number | yes | The year the project started. |
| `yearEnd` | number \| `"present"` | no | The year the project ended. Omit for single-year projects. Use `"present"` for ongoing engagements. Displayed as "2020–2023" or "2020–Present". |
| `deliverables` | string[] | yes | What was produced. Controlled vocabulary — see deliverables list below. Min 1 item. |
| `role` | string | no | Free-text description of Interactivism's role on the project. |
| `duration` | string | no | Free-text. Omit if not relevant. |
| `metrics` | array | no | 0–4 metrics. Omit entirely if there are none — don't pass an empty array. |
| `gallery` | image[] | no | Optional slideshow shown above the prose body. Co-located images via relative paths. Omit if no gallery. |
| `relatedCaseStudies` | string[] | no | Manual curation. If omitted, related case studies are auto-derived (same industry first, then shared services). Max 2. |

### Industry list (controlled vocabulary)

Industry is a single value from this list. Add new industries here before using them in a case study.

In code the list lives once, in `src/lib/vocabularies.ts`, as `{ value, label }` pairs. The Zod enum, the Keystatic select and the display label on a case study page are all derived from it — adding a value means editing one array.

| ID | Display name |
|---|---|
| `adtech` | AdTech |
| `aerospace-defense` | Aerospace & Defense |
| `ai-content` | AI & Content |
| `consumer` | Consumer |
| `enterprise-saas` | Enterprise SaaS |
| `fintech` | Fintech |
| `martech` | MarTech |
| `media-publishing` | Media & Publishing |
| `nonprofit-civic` | Nonprofit & Civic |

The list is alphabetical for ease of scanning in editor UIs (Keystatic renders it as a select). Display order on a future Work-by-industry filter UI is a separate concern and can be controlled at render time.

**Not every industry has a landing page.** The `industries` collection currently covers 4 of the 9 IDs. On a case study page the Industry value links to `/industries/[id]/` when a page exists and renders as plain text when it does not. The set of linked industries is derived from the collection at build time — never hand-list it, or the list rots into 404s the first time a page is added or removed.

**Choosing a tag.** Pick the industry the buyer would use to describe themselves, and check what comparable work is already tagged before inventing a distinction. Precedent: Velocify (sales acceleration) and both Local IQ studies (sales enablement, lead management) are all `enterprise-saas` — functionally the same category of B2B product, so they share a bucket. Kin Community's Tandem is `martech` rather than `enterprise-saas` because a two-sided influencer/brand marketplace is not something a SaaS buyer would recognize as their own category.

**The tag and the industry page's selected work are independent.** An industry page's `featuredCaseStudies` *replaces* tag matching rather than adding to it (see the Industries section below). A case study can therefore appear on an industry page it is not tagged with, and vice versa. That is allowed — the tag drives the sidebar link, the page field drives the page — but a long-standing mismatch usually means the tag is wrong.

### Deliverables list (controlled vocabulary)

`deliverables` is an array of one or more values from this list. Add new deliverables here before using them in a case study, then add the `{ value, label }` pair to `src/lib/vocabularies.ts`.

A missing label used to render the raw slug on the page: before the vocabularies were shared, `mobile-app-development` was absent from the live case study template's label map and four published case studies displayed the slug. The template still falls back to the raw ID, so the failure is cosmetic and silent — the shared module is what prevents it.

| ID | Display name |
|---|---|
| `animation` | Animation |
| `augmented-reality-experience` | Augmented Reality Experience |
| `brand-identity` | Brand Identity |
| `brand-strategy` | Brand Strategy |
| `content-strategy` | Content Strategy |
| `data-visualization` | Data Visualization |
| `design-system` | Design System |
| `experience-strategy` | Experience Strategy |
| `futurecasting` | Futurecasting |
| `heuristic-evaluation` | Heuristic Evaluation |
| `illustration` | Illustration |
| `information-architecture` | Information Architecture |
| `messaging-framework` | Messaging Framework |
| `mobile` | Mobile |
| `native-mobile-app` | Native Mobile App |
| `personas` | Personas |
| `positioning-framework` | Positioning Framework |
| `print-collateral` | Print Collateral |
| `ui-ux-design` | UI/UX Design |
| `usability-assessment` | Usability Assessment |
| `web-development` | Web Development |

### MDX body content

Case study bodies are MDX. The following components are available without import (registered globally via `astro.config.mjs`):

| Component | Purpose | Example |
|---|---|---|
| `<Stat>` | Single large number + label | `<Stat value="$3B" label="in client exits" />` |
| `<StatRow>` | 2–4 stats in a row | `<StatRow><Stat .../><Stat .../></StatRow>` |
| `<ImageWithCaption>` | Single image with optional caption | `<ImageWithCaption src="./screen.png" alt="..." caption="..." />` |
| `<ImageGrid>` | 2-up or 3-up image grid | `<ImageGrid columns={2}>...</ImageGrid>` |
| `<PullQuote>` | Large blockquote with attribution | `<PullQuote author="Jane Doe, CEO">...</PullQuote>` |
| `<BeforeAfter>` | Paired images for redesign comparisons | `<BeforeAfter before="./old.png" after="./new.png" />` |
| `<Aside>` | Short sidebar / callout | `<Aside>Note: this only applies to...</Aside>` |

Standard markdown (h2, h3, lists, links, code, regular images) works as expected. The body's max width follows `container-prose` (720px); embedded media can break out to wider containers via the components above.

### Image conventions for case studies

- Source images live in the same folder as the `.mdx` file: `src/content/caseStudies/credtent/hero.jpg`, `src/content/caseStudies/credtent/screen-01.png`, etc.
- For case studies with many images, use a subfolder per case study: `src/content/caseStudies/credtent.mdx` + `src/content/caseStudies/credtent/[images]`.
- Reference images via relative paths from the `.mdx` file (`./hero.jpg`).
- Astro's `astro:assets` handles optimization, format conversion, and responsive sizing. Don't pre-optimize — let the build do it.
- Naming pattern: `hero.jpg`, `hero-wide.jpg`, `og.jpg`, then descriptive lowercase-hyphenated names (`onboarding-flow.png`, `dashboard-redesign.png`).

### Image strategy: heroImage and heroImageWide

A case study has two required images:

- **`heroImage`** — 16:9, the canonical image. Used on the Work index card, homepage slider, and the mobile case study detail page hero. The same image is reused at multiple sizes via Astro's image pipeline; CSS handles any minor sizing differences.
- **`heroImageWide`** — 4:1, the desktop case study detail page marquee. A meaningfully different aspect ratio than `heroImage` — wider, shorter — and a different composition, not a crop. The 4:1 marquee runs full viewport width on desktop, with the leftmost ~360px partially obscured by the sidenav (visible only inside the logo silhouette per DESIGN.md).

**Why two fields and not one.** A 4:1 image cropped to 16:9 (or vice versa) loses too much; the aspect ratios are too different to share a source. Authors compose each intentionally for its context. The `heroImage` is what most surfaces use; `heroImageWide` exists specifically for the desktop detail page.

**Composition note for `heroImageWide`.** The leftmost 360px sits behind the sidenav background. Compose the image so that visually quiet content lives in this region — the focal subject should occupy the right ~85% of the frame. The logo silhouette (200×200, positioned in the upper-left of the sidenav) reveals a slice of the image as a knockout effect.

This is a deliberately minimal v1 approach. A proper editorial cropping UI (focal point picker or per-surface crop frames) is a meaningful engineering effort and adds value only if manual workflow becomes a bottleneck. Revisit when the studio is publishing case studies frequently enough that the per-image overhead actually matters.

The same pattern applies to blog posts: `heroImage` (16:9) is the canonical image used on the blog index card and mobile detail page; `heroImageWide` (4:1) is the desktop detail page marquee.

---

## Blog Posts

### File location and naming

```
src/content/blog/
  why-we-stopped-using-design-systems.mdx
  the-case-against-personas.md
  notes-on-mission-planning-ux.mdx
```

- Filename is the slug. Lowercase, hyphenated.
- `.md` for posts that are pure prose; `.mdx` for posts that need embedded components.
- Slugs are permanent — same rules as case studies.

### Frontmatter schema

```yaml
---
title: "Why we stopped using design systems"
author: "erik-wingren"                  # author ID, references authors collection
publishedDate: 2025-10-22
status: "published"
summary: "After five years of building design systems for clients, here's what we got wrong."
heroImage: "./hero.jpg"                 # required if any imagery; 16:9
heroImageWide: "./hero-wide.jpg"        # required if heroImage is set; 4:1 desktop marquee
ogImage: "./og.jpg"                     # optional
tags:                                   # optional
  - "design-systems"
  - "process"
canonical: "https://interactivism.com/blog/why-we-stopped-using-design-systems/"  # optional, only when republishing
---
```

### Field details

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Post title. Max 100 chars. |
| `author` | string | yes | Author ID. Must match a file in `src/content/authors/`. |
| `publishedDate` | date (ISO) | yes | |
| `status` | enum | yes | `draft` posts are excluded from production builds. |
| `summary` | string | yes | 100–200 chars. Used in blog index cards, OG description, RSS. |
| `heroImage` | image | no | Optional. 16:9. Used on the blog index card and the mobile detail page hero. If omitted, the post and card render without imagery. |
| `heroImageWide` | image | conditional | Required if `heroImage` is set. 4:1, the desktop detail page marquee. If `heroImage` is omitted, this is also omitted (the post just has no hero on either breakpoint). |
| `ogImage` | image | no | Falls back to `heroImage` if present, then to default OG. |
| `tags` | string[] | no | Free-form tags for now. If we ever add tag pages, this becomes a controlled vocabulary. |
| `canonical` | url | no | Only set when the post was originally published elsewhere (e.g. Medium). Tells search engines where the original lives. |

### MDX body content

Blog post bodies can be `.md` (no components, pure markdown) or `.mdx` (with components). When using MDX, the following components are available:

| Component | Purpose |
|---|---|
| `<PullQuote>` | Same as case study — large blockquote |
| `<Aside>` | Sidebar / callout |
| `<ImageWithCaption>` | Image with optional caption |
| `<Slideshow>` | Multi-image carousel |
| `<YouTube>` | Embedded video |
| `<ArchetypeList>` | The five Velocity Profile archetypes, generated at build time |

This table is the enumerated set, not a wish list: it matches the `components={{ … }}` map in `src/pages/blog/[slug].astro`, the identical map in `src/pages/preview/blog/[slug].astro`, and the `components` object on the blog `fields.mdx()` in `keystatic.config.ts`. **All four have to agree.** A component in the MDX that the template does not pass renders as nothing; one the template passes but Keystatic does not know about is mangled when an editor opens the post; and one the *preview* route passes but production does not is worse than either, because the draft looks right in review and publishes as nothing. Adding one is a four-file change.

Case-study-specific components (`<Stat>`, `<StatRow>`) are *not* available in blog posts. They belong to a different content type and shouldn't drift across.

**`<ArchetypeList>` takes no fields and is not editable.** It reads `ARCHETYPES` from `src/data/velocity-profile.ts` at build time and renders each archetype's name, descriptor, and teaser line. It deliberately withholds the strength, the failure mode, and the three moves — those are the report's payoff and the reason to take the assessment. To change what it says, edit the data file, not the post.

### Apostrophes

Use `’` (U+2019), not `'`. `npm run lint:typography` enforces it, but what it
checks depends on where the text lives, and the two rules are inverses:

| File | Checked | Why |
|---|---|---|
| `.astro` | template, **not** frontmatter | Frontmatter is JS; esbuild rejects non-ASCII in some token positions in dev. Use the `’` escape there. |
| `.md` / `.mdx` | frontmatter, **not** body | `remark-smartypants` converts body quotes at build time, so a straight `'` in prose is already correct at the source. |
| `.json` under `src/content/` | string values | Content JSON has no markdown processor between it and the page — an `authors/*.json` bio renders verbatim. Keys are skipped, as are `url`/`src`/`slug`/`id`-ish keys, where an apostrophe belongs to an address. |

The frontmatter half is the one that bites. `summary` is a Zod string, not
markdown: it goes straight into the meta description, the blog card, and the OG
tag without passing through smartypants. Every summary in the repo carried a
straight apostrophe until the rule existed, and the gap stayed invisible
precisely because the body two lines below was being fixed automatically.

### Reading time

Auto-calculated from word count at build time via `reading-time`. No frontmatter field needed. Displayed in the post metadata row as "5 min read."

### Image conventions for blog posts

Same as case studies:
- Co-located with the `.mdx` file
- Subfolder for posts with many images
- Astro's `astro:assets` handles optimization
- Naming: `hero.jpg`, `og.jpg`, descriptive names for body images

---

## Authors

### File location and format

```
src/content/authors/
  erik-wingren.json
  petra-wennberg.json
  interactivism.json
  jane-smith.json
```

- One file per author. Filename is the author ID (referenced from blog post frontmatter).
- JSON, not MDX — authors are structured data, not content.

### Schema

```json
{
  "id": "erik-wingren",
  "name": "Erik Wingren",
  "role": "Co-founder",
  "bio": "Erik leads strategy and design at Interactivism. Previously at [...].",
  "avatar": "./erik-wingren.jpg",
  "social": {
    "linkedin": "https://www.linkedin.com/in/ewingren",
    "medium": null,
    "instagram": null,
    "website": null
  }
}
```

### Field details

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Must match the filename. Lowercase-hyphenated. |
| `name` | string | yes | Display name as it appears in bylines. |
| `role` | string | yes | For studio team members. For the "Interactivism" author entry, set to `"Studio"` or similar. |
| `bio` | string | yes | One paragraph. Used on the Team page and at the bottom of blog posts. 200–400 chars. |
| `avatar` | image | yes | Square aspect ratio. Min 400×400px. |
| `social` | object | no | All sub-fields optional. Set unused platforms to `null` rather than omitting (keeps schema consistent). |

### The "Interactivism" author entry

For posts that should be bylined to the studio rather than an individual:

```json
{
  "id": "interactivism",
  "name": "Interactivism",
  "role": "Studio",
  "bio": "Interactivism is a digital product design & development studio based in Pasadena, CA.",
  "avatar": "./avatar.svg",
  "social": {
    "linkedin": "https://www.linkedin.com/company/interactivism",
    "medium": "https://medium.com/@interactivismco",
    "instagram": "https://www.instagram.com/interactivism/"
  }
}
```

This is just another author file — the byline rendering doesn't need a special case for it.

---

## Services

### File location

```
src/content/services/
  product-design.mdx
  human-ai-experience.mdx
  user-research.mdx
  development.mdx
  product-strategy.mdx
  brand-development.mdx
```

One file per service. The filename is the service ID, referenced from case study frontmatter.

### The canonical service list

The site has six services. This is the controlled list that case study `services` arrays must match:

| Display name | ID | URL |
|---|---|---|
| Product Design | `product-design` | `/services/product-design/` |
| Human + AI Experience | `human-ai-experience` | `/services/human-ai-experience/` |
| User Research | `user-research` | `/services/user-research/` |
| Development | `development` | `/services/development/` |
| Product Strategy | `product-strategy` | `/services/product-strategy/` |
| Brand Development | `brand-development` | `/services/brand-development/` |

This list consolidates the live site's prior service structure: "UX + Design" merges into "Product Design," "Strategy + Growth" becomes "Product Strategy," "User Research" replaces "Research" (display name and URL aligned), and "Training" drops entirely. Redirects for the renamed and dropped URLs are documented in PROJECT.md.

### Frontmatter schema

```yaml
---
title: "Product Design"
id: "product-design"
order: 1                             # display order on /services/ index
summary: "Research-driven product design, from information architecture and interaction design to the visual systems that hold them together."
heroImage: "./hero.jpg"              # optional
heroImageWide: "./hero.jpg"          # optional; 4:1 desktop marquee (can reuse heroImage)
photoCredit: 'Photo by <a href="...">Name</a> on <a href="...">Unsplash</a>'  # optional
---
```

### MDX body

The body is the long-form content for the service detail page (800–1500 words). Structured with h2 sections for each sub-topic of the service.

Available components: same as case studies (this is the same kind of long-form content).

### Naming and IDs

Service IDs are stable. Once a service ID is published, changing it requires updating every case study that references it and adding a redirect. Pick carefully. Adding a new service means adding a new MDX file and writing the page; case studies can then reference the new ID.

---

## Industries

Landing pages at `/industries/[id]/`, one MDX file per industry, built for business development: a prospect in a given vertical should land on proof that we have worked in their world. They are also the only pages that answer vertical-shaped search queries ("UX agency for adtech"), which nothing else on the site covers.

### File location

`src/content/industries/[id].mdx`, where `[id]` is an ID from the industry controlled vocabulary above. Only some industries have a page; see "Industry list" for how that interacts with case study tags.

### Frontmatter schema

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Display name, matching the industry list ("Aerospace & Defense") |
| `id` | yes | Must be an ID from the industry controlled vocabulary |
| `summary` | yes | Lede under the H1, and the meta description |
| `clients` | yes | At least 1. Roster of client names, not case study slugs |
| `ctaHeadline` | no | Falls back to a generated line. Write it article-free — the fallback has no leading article, so "AdTech product problem" works where "an AdTech product" does not |
| `featuredCaseStudies` | no | Case study slugs. **Replaces** tag matching — see below |
| `heroImage` / `heroImageWide` | no | Marquee. Same 900x506 / 2400x600 convention as case studies |
| `photoCredit` | no | Attribution line for the marquee image |

The MDX body holds the point-of-view sections — typically 3 to 4 H2 sections about how design work in that vertical actually goes.

### featuredCaseStudies replaces tag matching

With `featuredCaseStudies` set, the Selected work section shows exactly those studies, in that order. With it absent, the page falls back to every published case study tagged with the industry.

This is deliberate: auto-matching could only ever *add*, so a page could not exclude a tagged study that did not belong. The selection runs through `src/lib/industryCaseStudies.ts`, shared by the industry page and the case study prev/next navigation so the two cannot drift. A slug in `featuredCaseStudies` that is not a real case study fails the build rather than rendering an empty card.

A page with no featured list and no tagged studies simply does not render the section — `aerospace-defense` is the live example, where the roster and the confidentiality section carry the page instead.

### Indexing

These pages are in the sitemap and are indexed. They were originally excluded to keep their traffic cleanly attributable to outreach; that is no longer necessary, because GA4 reports organic search separately from direct, and a plain-text outreach email sends no referrer. For a page with no other inbound path, direct is effectively the outreach number.

Short root-level aliases (`/adtech`, `/fintech`, …) 301 to the canonical `/industries/[id]/`. Use the short form in outbound email; never link the short form internally.

## Clients (data file)

Not a content collection — a flat JSON data file at `src/data/clients.json`.

### Schema

```json
[
  { "name": "NASA", "href": "/work/nasa-mission-planning/" },
  { "name": "Dollar Shave Club", "href": "/work/dollar-shave-club/" },
  { "name": "Acme Corp" }
]
```

### Field details

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | Display name. |
| `href` | path | no | Link to a case study. Omit if no public case study. |

The Clients page renders all entries alphabetically, linking to the case study where `href` is set.

---

## Book a call (data file + singleton)

`src/data/booking.json`, edited in Keystatic under **Book a call** — the only Keystatic singleton. Decides where every "Book a call" button on the site sends people.

### The control

One select, "Where the Book a call buttons go":

| Option | Effect |
|---|---|
| **Erik — normal** | The default. Every button opens Erik's scheduling page |
| **Petra — between two dates you choose** | Reveals an Override period: switch to Petra at one moment, back to Erik at another |
| **Petra — starting now, until you set this back** | Immediate switch, for an unplanned absence |

The date fields only exist when a scheduled override is selected, so the normal state cannot be misread as a half-configured one. The two scheduling links sit at the bottom under "Scheduling pages" — they rarely change.

### How the timing works

Buttons link to `/book`, never to a calendar URL directly. `src/pages/book.ts` runs per request (`prerender = false`), compares the current time against the override period, and issues a **302** to the right calendar.

The split matters: the *period* is static and changing it needs a deploy, but the *comparison* happens on every request. So dates set weeks ahead flip on their own at the right moment, with nothing to remember and no deploy at the boundary. Saving in Keystatic commits to `main` and triggers a build, which publishes the new dates — that build does not perform the switch.

`/book?debug` prints the decision as plain text instead of redirecting — use it to check an override without opening a booking page.

### Rules this encodes

- **302, never 301.** A permanent redirect gets cached by browsers indefinitely and would keep sending people to the wrong calendar long after the override ends. The response also sets `Cache-Control: no-store`, since a cached redirect at the CDN has the same problem.
- **Every failure path falls back to Erik** — a missing date, an inverted period, an unreadable value, an unrecognized setting. The default is the common case, so a broken config degrades to correct-most-of-the-time rather than to nothing.
- `/book` is `noindex` and absent from the sitemap. It is a redirect, not a page.

The stored shape follows Keystatic's `fields.conditional` serialization — `{ discriminant, value }` — so the data file mirrors the form rather than needing a translation layer.

Logic and its reasoning live in `src/lib/booking.ts`; it is pure and separable from the endpoint so the period math can be tested without a server.

## Homepage (data file)

Not a content collection — a single flat data file at `src/data/homepage.json` that drives the homepage composition. Editing this file is the canonical way to change what's on the homepage.

The homepage has two distinct editorial surfaces:

1. **The hero** — fixed studio positioning. Persists across case study rotations. Edit only when the studio's positioning evolves.
2. **The featured case studies** — editorial curation. Rotate as new work ships or as business priorities shift.

Keeping these separate means rotating the featured work doesn't disturb the hero, and updating the hero doesn't require touching every case study.

### Schema

```json
{
  "hero": {
    "headline": "We design and develop digital products that are engaging, efficient, and easy to use.",
    "image": "/homepage/hero.jpg",
    "cta": {
      "label": "Let's talk",
      "href": "/contact/"
    }
  },
  "featuredCaseStudies": [
    "credtent",
    "dollar-shave-club",
    "tvscientific",
    "nasa-mission-planning"
  ]
}
```

### Field details

| Field | Type | Required | Notes |
|---|---|---|---|
| `hero.headline` | string | yes | The studio-positioning headline. Max 140 characters. |
| `hero.image` | path | yes | Path to the hero image in `public/`. Single source for now (slider hero is one slide). |
| `hero.cta.label` | string | yes | Primary CTA button text. |
| `hero.cta.href` | path | yes | CTA destination. Typically `/contact/`. |
| `featuredCaseStudies` | string[] | yes | Slugs of case studies for the homepage slider (slides 2–N). 3–8 items. |

### Validation rules

Enforced at build time:

- Every slug in `featuredCaseStudies` must reference an existing, **published** case study. Build fails on a missing or draft slug.
- Every slug in `featuredBlogPosts` must reference an existing, **published** blog post. Same rule.
- `featuredCaseStudies` length: 3–8.
- `featuredBlogPosts` length: 0–3.
- `hero.image` must resolve to an existing file in `public/`.
- No duplicate slugs in either array.

### Order

The order in each array is the display order on the homepage. Reorder by reordering the array.

### Keystatic UI

Renders as a Singleton with two field groups (hero, featured case studies). The featured array uses Keystatic's relationship-array field with reordering support — editors drag items to reorder, and the dropdown for adding new items only shows published content.

### How the homepage slider uses this

The homepage hero slider contains:
- **Slide 1:** the studio hero (`hero.headline` + `hero.image` + `hero.cta`)
- **Slides 2–N:** the featured case studies, each rendering with their own client name, project title, hero image, and a "View Project" secondary CTA linking to the case study

This is one mechanism, not two — but the editorial inputs for slide 1 (the hero) are separate from the inputs for the rest. See DESIGN.md "Homepage slider" for the visual treatment.

---

## Velocity Profile (collection + singleton)

The lead-gen self-assessment at `/velocity-profile`. Content is split across
three places, deliberately.

### What lives where

| What | Where | Why |
|---|---|---|
| Questions, options, archetype tags, calc values | `src/data/velocity-profile.ts` | Scoring depends on them. Changing an option's tag changes everyone's result, so this is a code change with a test behind it, not a CMS edit. |
| Archetype names, persona descriptors, teaser lines, strength and failure-mode labels | `src/data/velocity-profile.ts` | Identity, not copy. The scoring returns a tag; these turn it into a persona. |
| Archetype marks (the five geometric figures) | `src/lib/velocity-profile/marks.ts` | Drawn in code so they version with the archetypes they belong to. Server only — see below. |
| Archetype report prose, the three moves, case study slot | `velocityArchetypes` collection | Erik rewrites these. |
| Industry notes, offering paragraphs, cost assumptions | `velocityReport` singleton | Same, and they are not per-archetype. |

Nothing is duplicated across the two. The teaser line appears only on the
teaser screen; the report's longer write-up appears only in the report.

**The marks never ship to the quiz page.** All five would tell anyone reading
the HTML how many archetypes exist and what each looks like, which is the leak
the tags are kept out of the bundle to prevent. The teaser endpoint sends the
rendered SVG for the one archetype a visitor resolved to, and the report page
renders its own server-side.

**The email is an invitation, not the report.** It carries the archetype, the
persona line, the cost figure and a link; everything else lives on the web,
where it can be shared and where the copy can change without a resend.

### Archetypes

Exactly five entries, one per tag (F, C, E, S, X). `getArchetypeContent()`
throws if a tag is missing or claimed twice, because the alternative is a
prospect receiving a report with a blank section.

- **What they are good at** — two sentences. First thing they read after
  handing over an email, so it needs to land as recognition, not flattery.
- **The failure mode** — the report quotes two or three of their own answers
  underneath it. Generic is worse than wrong here.
- **Three moves** — exactly three, and each must be useful *without hiring us*.
  That is what makes the report worth forwarding to a colleague, which is
  where most of the reach comes from. The field and the code call these
  "moves"; the reader sees "Three things that would move the needle".
- **Draft** — marks copy as unreviewed. It still renders; the flag is a note
  to ourselves.

There is deliberately **no case study link**. The slot existed, one section
above the only ask in the document, and a link out to `/work/` is an exit:
same tab, full site nav, and the booking CTA two back-clicks away. Proof now
lives as a sentence inside the offering paragraph instead — same evidence, no
navigation. If an offering has no engagement worth naming, it carries no proof
sentence rather than a weak one.

The **persona descriptor** sits with the name rather than here: one line, said
about them rather than to them, like a job title under a photo. It is rendered
lowercase mid-sentence in the email, so it carries no final period.

### Report copy singleton

The industry notes and offering paragraphs are **generated** into the Keystatic
UI from `src/data/velocity-profile.ts`. Adding a Q12 option with a new offering
makes a new field appear here; removing one makes it disappear. Do not add keys
to `src/data/velocity-report.json` by hand — they will not have a field, and a
test will fail.

Three industries get their own note: AdTech, Enterprise SaaS, and Fintech — the
same three the lead score awards a point for, derived from one list so they
cannot drift. Everything else, including Marcom, Aerospace & Defense, Consumer,
and anyone who skipped the field, gets the `other` paragraph.

### The industry list is not the content vocabulary

`LEAD_INDUSTRIES` in the quiz config is separate from `INDUSTRIES` in
`src/lib/vocabularies.ts`. The content vocabulary classifies *our* work; the
quiz list qualifies a lead, so it carries "Other" and "Marcom" and omits the
verticals we have no note for. Where a value exists in both, the slug and
label are identical, and a test enforces that.

---

## Status, drafts, and scheduling

- `status: "draft"` excludes content from production builds. Drafts are visible in `astro dev` (so you can preview locally) but never deploy.
- For scheduled publishing: set `status: "published"` and a future `publishedDate`. The build at that future date will include the post; until then, builds exclude posts with future dates.
- Astro's `getCollection()` filters need explicit handling — every page that lists posts uses a helper:

```ts
// src/lib/content.ts
import { getCollection } from 'astro:content';

export async function getPublishedEntries(collection: 'blog' | 'caseStudies') {
  const all = await getCollection(collection);
  const now = new Date();
  return all
    .filter(entry => entry.data.status === 'published')
    .filter(entry => entry.data.publishedDate <= now)
    .sort((a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf());
}
```

This helper is the single chokepoint — every page that lists content goes through it. Don't bypass it. The function is used on the blog index, work index, homepage, and RSS feed.

### `publishedDate` is a calendar date, not an instant

Frontmatter carries a day — `2026-11-24` — with no time and no place. Zod's
`z.coerce.date()` hands that to `new Date()`, which reads a bare `YYYY-MM-DD` as
midnight UTC. Two consequences, and only one of them is handled:

- **Display is pinned to UTC.** Formatting that instant in the build machine's
  local zone walks it backwards anywhere west of Greenwich: midnight UTC on the
  24th is 4pm Pacific on the 23rd, so the post renders a day early. Every surface
  that prints a published date calls `formatPublishedDate()` from
  `src/lib/publishedDate.ts`, which pins `timeZone: 'UTC'` and so returns the day
  the author typed. Never inline a `toLocaleDateString` for a published date —
  three copies of the options object drifted in before that helper existed, and
  all three carried the bug.
- **Scheduling still resolves at UTC midnight.** The `publishedDate <= now`
  comparison above means a post dated tomorrow goes live 8 hours early Pacific
  (7 under DST). Known, not fixed — fixing it is a decision about when "that
  day" starts, not a bug fix.

---

## Validation rules

Build-time validation is enforced via Zod schemas in `src/content.config.ts`. The full rule set is documented in SCHEMA.md. Key rules to know:

- `status: "draft"` excludes content from all production builds.
- `summary` length: 100–160 chars for case studies, 100–200 for blog posts.
- `services` array: at least 1 valid service ID per case study.
- If `heroImage` is set on a blog post, `heroImageWide` must also be set (and vice versa).
- `featuredCaseStudies` in `homepage.json`: 3–8 slugs, all must be published.

---

