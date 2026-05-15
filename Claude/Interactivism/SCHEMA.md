# Interactivism Schema & Implementation Reference

## Purpose of this document

Developer reference for the Interactivism site. Covers the mapping between Astro content schemas and Keystatic CMS config, build-time validation rules, file structure conventions, and implementation notes.

For what to write (editorial guide): see CONTENT.md.  
For visual decisions: see DESIGN.md.  
For project intent and IA: see PROJECT.md.

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

The full configs live in `src/content/config.ts` and `keystatic.config.ts`. CONTENT.md is the spec they implement.

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
- `featuredCaseStudies` length: 3–8.
- No duplicate slugs in the array.
- `hero.image` must resolve to a real file in `public/`.

When a build fails on validation, the error message points to the file and field. Fix in place rather than disabling validation.

---

## Migration notes

- **Service pages migrate from a three-level hierarchy to one consolidated page per service.** The live site has `/services/` → category (e.g. `/services/ux-design/`) → sub-category (e.g. `/services/ux-design/information-architecture/`). The new `services` collection collapses category and sub-category content into a single MDX file per service, with sub-category content becoming h2 sections. Sub-category URLs redirect to anchor sections on the consolidated page (see PROJECT.md "URL strategy & redirects").
- **Slugs are permanent once published.** Changing a slug breaks inbound links and requires a redirect in `netlify.toml`. This applies to case studies, blog posts, and service IDs.
- **The homepage composition is hand-built.** `homepage.json` is a from-scratch editorial decision, not migrated content. The hero copy can carry forward from the live site's hero, but `featuredCaseStudies` is a fresh choice about what to surface at launch. Author this file last, after the case studies it references have been migrated and published.

---

## File structure

```
src/
  styles/
    global.css          # Tailwind directives + base styles
    typography.css      # Prose styling for blog/case study bodies
  components/
    ui/                 # Buttons, links, form fields, icons
    layout/             # Header, Footer, Marquee, Container
    home/               # Slider and other homepage-specific components
    contact/            # MapMarquee and other contact-page components
    case-study/         # MDX components for case study bodies
  assets/
    brand/              # Logo files
    images/
      marquee/          # Static page marquee images (work, services, clients, blog, team)
      # All other images: processed by astro:assets
```

Add subfolders (e.g. `components/blog/`) only when a specific page accumulates enough custom components to justify the split. Don't create folders for files that don't exist yet.

---

## Token conventions

Tokens defined in DESIGN.md are mirrored in `tailwind.config.mjs` under `theme.extend`. When a token is added or changed in DESIGN.md, update the Tailwind config in the same commit.

---

## Tailwind plugins

- `@tailwindcss/typography` — for blog and case study prose (with custom `prose-interactivism` modifier matching our type scale)
- `@tailwindcss/forms` — sane form defaults

---

## Don't reach for these

These are intentionally not part of the system:

- Component libraries (shadcn, Radix-as-default, Headless UI) — overkill for a marketing site, adds dependencies that need maintenance
- Animation libraries (Framer Motion, GSAP) — CSS transitions cover everything we need; revisit only if a specific case study demands it
- CSS-in-JS — we have Tailwind
- Additional icon libraries beyond Lucide

---

## Keystatic dev notes

Content stamping and save behavior:

- The Keystatic save handler at `src/pages/api/keystatic/[...params].ts` auto-stamps `lastUpdatedBy` on every save using the authenticated user's email.
- On slug rename, the handler automatically renames `public/images/slideshows/[old-slug]/` to match the new slug and updates all slideshow image paths in the MDX body.
- In local dev, a post-save script in `src/pages/keystatic/[...params].astro` handles the transient "Could not find image" error that occurs while `content-assets.mjs` rebuilds after a save. It uses sessionStorage to survive the HMR reload and triggers one final reload after a 1800ms settle delay.
- Stale Vite dep cache causes Keystatic blank screen. Fix: `rm -rf node_modules/.vite && npm run dev`.
