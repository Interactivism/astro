# Interactivism Content Schemas

## Purpose of this document

This is the source of truth for content structure on interactivism.com — the schemas for case studies, blog posts, authors, and supporting collections. PROJECT.md handles intent; DESIGN.md handles how things look; CONTENT.md handles what gets written and how it's structured.

When working in this repo (especially via Claude Code): **this document defines what `src/content/config.ts` (Astro) and `keystatic.config.ts` (CMS) must implement.** Both files derive from the same schema spec — they describe the same content shape from different angles. Schema changes happen here first, then propagate to both configs in the same commit.

---

## Content collections overview

The site has four content collections, each living under `src/content/`:

| Collection | Path | Purpose | File format |
|---|---|---|---|
| `caseStudies` | `src/content/caseStudies/` | Project writeups, the primary work showcase | `.mdx` |
| `blog` | `src/content/blog/` | Articles, points of view, notes | `.mdx` (or `.md` for simple posts) |
| `authors` | `src/content/authors/` | Author profiles referenced by blog posts | `.json` |
| `services` | `src/content/services/` | Service detail page bodies | `.mdx` |

Plus two supporting data files (not content collections — flat data files imported as needed):

- `src/data/clients.json` — list of all clients for the Clients page and homepage logo wall
- `src/data/homepage.json` — homepage composition (hero content + featured case studies + featured blog posts)

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

Industry is a single value from this list. Add new industries here before using them in a case study; both the Astro schema and Keystatic config validate against this list.

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

### Deliverables list (controlled vocabulary)

`deliverables` is an array of one or more values from this list. Add new deliverables here before using them in a case study.

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
| `<Code>` | Multi-line code with syntax highlighting (markdown fences also work) |

Case-study-specific components (`<Stat>`, `<StatRow>`, `<BeforeAfter>`) are *not* available in blog posts. They belong to a different content type and shouldn't drift across.

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
  "avatar": "./interactivism-mark.jpg",
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

This list consolidates the live site's prior service structure: "UX + Design" merges into "Product Design," "Strategy + Growth" becomes "Product Strategy," "User Research" replaces "Research" (display name and URL aligned), and "Training" drops entirely. Redirects for the renamed and dropped URLs are documented in DESIGN.md.

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

## Clients (data file)

Not a content collection — a flat JSON data file at `src/data/clients.json`.

### Schema

```json
[
  {
    "name": "NASA",
    "logo": "/logos/nasa.svg",
    "url": "https://www.nasa.gov",
    "caseStudy": "nasa-mission-planning",
    "featured": true
  },
  {
    "name": "Dollar Shave Club",
    "logo": "/logos/dollar-shave-club.svg",
    "url": "https://www.dollarshaveclub.com",
    "caseStudy": "dollar-shave-club",
    "featured": true
  },
  {
    "name": "Acme Corp",
    "logo": "/logos/acme.svg",
    "url": null,
    "caseStudy": null,
    "featured": false
  }
]
```

### Field details

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | Display name. |
| `logo` | path | yes | Path to SVG in `public/logos/`. SVGs render inline; can inherit `currentColor` for hover states. |
| `url` | url | no | Client's website. `null` if private/internal client. |
| `caseStudy` | string | no | Slug of an existing case study. `null` if no public case study. Drives the "View work" link on the Clients page. |
| `featured` | boolean | yes | Featured clients appear on the homepage logo wall (top 8–12). All clients appear on the Clients page. |

The Clients page renders the list with case-study links where available; the homepage logo wall renders only `featured: true` entries.

---

## Homepage (data file)

Not a content collection — a single flat data file at `src/data/homepage.json` that drives the homepage composition. Editing this file is the canonical way to change what's on the homepage.

The homepage has two distinct editorial surfaces:

1. **The hero** — fixed studio positioning. Persists across case study rotations. Edit only when the studio's positioning evolves.
2. **The featured case studies and blog posts** — editorial curation. Rotate as new work ships or as business priorities shift.

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
  ],
  "featuredBlogPosts": [
    "why-we-stopped-using-design-systems"
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
| `featuredBlogPosts` | string[] | yes | Slugs of blog posts for the homepage blog teaser. 0–3 items. Empty array is valid (no blog teaser). |

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

Renders as a Singleton with three field groups (hero, featured case studies, featured blog posts). The featured arrays use Keystatic's relationship-array field with reordering support — editors drag items to reorder, and the dropdown for adding new items only shows published content.

### How the homepage slider uses this

The homepage hero slider contains:
- **Slide 1:** the studio hero (`hero.headline` + `hero.image` + `hero.cta`)
- **Slides 2–N:** the featured case studies, each rendering with their own client name, project title, hero image, and a "View Project" secondary CTA linking to the case study

This is one mechanism, not two — but the editorial inputs for slide 1 (the hero) are separate from the inputs for the rest. See DESIGN.md "Homepage slider" for the visual treatment.

---

## Status, drafts, and scheduling

- `status: "draft"` excludes content from production builds. Drafts are visible in `astro dev` (so you can preview locally) but never deploy.
- For scheduled publishing: set `status: "published"` and a future `publishedDate`. The build at that future date will include the post; until then, builds exclude posts with future dates.
- Astro's `getCollection()` filters need explicit handling — every page that lists posts uses a helper:

```ts
// src/lib/content.ts
import { getCollection } from 'astro:content';

export async function getPublishedPosts(collection: 'blog' | 'caseStudies') {
  const all = await getCollection(collection);
  const now = new Date();
  return all
    .filter(entry => entry.data.status === 'published')
    .filter(entry => entry.data.publishedDate <= now)
    .sort((a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf());
}
```

This helper is the single chokepoint — every page that lists content goes through it. Don't bypass it.

---

## Validation rules

These are enforced at build time via Zod schemas in `src/content/config.ts`. Build fails if any rule is violated.

**All collections:**
- `title`, `summary`, and required string fields must be non-empty.
- `publishedDate` must be a valid ISO date.
- `status` must be `"draft"` or `"published"`.

**Case studies:**
- `services` array must contain at least 1 valid service ID.
- `industry` must be a valid ID from the controlled list.
- `summary` length: 100–160 characters.
- `metrics`, if present, must contain 1–4 entries (no empty array).
- `heroImage` and `heroImageWide` must both be present.

**Blog posts:**
- `author` must reference an existing author ID.
- `summary` length: 100–200 characters.
- If `heroImage` is set, `heroImageWide` must also be set (and vice versa). Either both or neither.

**Authors:**
- `id` must match the filename.
- `bio` length: 200–400 characters.

**Services:**
- `id` must match the filename.
- `order` must be a positive integer.

**Homepage data file:**
- `featuredCaseStudies` slugs must each reference a published case study.
- `featuredBlogPosts` slugs must each reference a published blog post.
- `featuredCaseStudies` length: 3–8.
- `featuredBlogPosts` length: 0–3.
- No duplicate slugs in either array.
- `hero.image` must resolve to a real file in `public/`.

When a build fails on validation, the error message points to the file and field. Fix in place rather than disabling validation.

---

## Keystatic ↔ Astro mapping

Both configs implement the same schemas, but in different syntaxes:

- **`src/content/config.ts`** (Astro) — uses Zod schemas. Validates content at build time. Generates TypeScript types for use in templates.
- **`keystatic.config.ts`** (Keystatic) — uses Keystatic's field functions. Generates the editor UI.

When a schema changes, **both files update in the same commit**. Drift between the two will cause one of two failure modes:
- Keystatic shows fields that Astro doesn't validate → silent garbage in frontmatter
- Astro requires fields that Keystatic doesn't expose → editors can't publish via the UI

A short reference for the mapping:

| Schema concept | Astro (Zod) | Keystatic |
|---|---|---|
| Required string | `z.string()` | `fields.text({ validation: { isRequired: true } })` |
| Optional string | `z.string().optional()` | `fields.text({ validation: { isRequired: false } })` |
| Date | `z.date()` | `fields.date()` |
| Enum | `z.enum(['draft', 'published'])` | `fields.select({ options: [...] })` |
| Image | `image()` (from `astro:assets`) | `fields.image({ directory, publicPath })` |
| Array of strings | `z.array(z.string())` | `fields.array(fields.text(...))` |
| Reference to another collection | `reference('authors')` | `fields.relationship({ collection: 'authors' })` |
| Markdown body | (handled by Astro) | `fields.markdoc({ ... })` or `fields.mdx({ ... })` |

The full configs live in `src/content/config.ts` and `keystatic.config.ts`. This document is the spec they implement.

---

## Migration notes

When migrating WordPress content into these schemas:

- **Case studies on the live site need to be mapped to the new schema.** Most fields will need to be filled in (industry, services, year, role, metrics, related case studies). The conversion script handles structure; field values are a manual pass.
- **Blog posts need cleanup more than mapping.** WordPress's Gutenberg HTML doesn't convert cleanly to MDX. Plan to hand-edit the top 10–20 most valuable posts; older posts may be pruned rather than migrated.
- **Service pages migrate from a three-level hierarchy to one consolidated page per service.** The live site has `/services/` → category (e.g. `/services/ux-design/`) → sub-category (e.g. `/services/ux-design/information-architecture/`). The new `services` collection collapses category and sub-category content into a single MDX file per service, with sub-category content becoming h2 sections. Sub-category URLs redirect to anchor sections on the consolidated page (see DESIGN.md "URL strategy & redirects").
- **Authors are migrated from the live Team page.** Each team member with a bio on the current site becomes an entry in the `authors` collection. Bios likely need rewriting to fit the 200–400 character constraint — the live bios may be longer or shorter. Add the studio-byline "Interactivism" entry as a manual addition (it has no source on the live site). Authors must exist before any blog post that references them is migrated.
- **Clients need to be inventoried.** The `clients.json` file is hand-built from the current site's client list, with `caseStudy` references added for clients that have public case studies.
- **The homepage composition is hand-built.** `homepage.json` is a from-scratch editorial decision, not migrated content. The hero copy can carry forward from the live site's hero ("We design and develop digital experiences..."), but `featuredCaseStudies` and `featuredBlogPosts` are fresh choices about what to surface at launch. Author this file last, after the case studies and blog posts it references have been migrated and published.

The full migration plan is in PROJECT.md. This document describes only the content shape; the migration sequence is separate.
