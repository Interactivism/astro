# Interactivism Design System

## Purpose of this document

This is the source of truth for visual decisions on interactivism.com. Anything related to colors, typography, spacing, components, or layout patterns is decided here. PROJECT.md handles intent and information architecture; DESIGN.md handles how things look.

When working in this repo (especially via Claude Code): **read this document before any visual work.** If a needed pattern doesn't exist, add it here first, then implement.

The current interactivism.com is the canonical reference for visual direction, but the new site should be a refined version — clean up inconsistencies, drop one-off styles, enforce a single set of tokens. Anywhere this document conflicts with the live site, this document wins.

> Items marked `[OBSERVE]` need values pulled from the live site via browser DevTools. See the checklist at the end of this document.

---

## Foundations

### Brand expression

The visual language should reinforce the positioning established in PROJECT.md: **confident, expert, plainspoken**. In design terms that translates to:

- **Restrained, not decorative.** White space, clear hierarchy, photography that does the work — not gradients, glows, or visual noise added to feel "designed."
- **Editorial over marketing.** Closer to a thoughtful publication than a SaaS landing page. Generous type, strong photography, minimal UI chrome.
- **Confident scale.** Big headlines, big imagery, real intervals between sections. The site should feel like a studio that doesn't need to oversell.
- **Specifics visible.** Real client names, real numbers ($3B in exits), real case studies. The design should give these elements room to land.

### Logo and brand marks

Brand assets live in `src/assets/brand/`.

Interactivism's primary identity is a **square wordmark** ("INTERACTIVISM."). It comes in three SVG variants, each for a specific context:

| File | Description | Use |
|---|---|---|
| `logo-light.svg` | White wordmark, transparent background | Dark backgrounds, image overlays, the sidenav knockout (where the page background shows through) |
| `logo-dark.svg` | `ink-900` wordmark, transparent background | Light backgrounds where the wordmark sits directly on the page (`paper-0`) without a tile |
| `logo-tile.svg` | Self-contained 200×200 black tile, wordmark knocked out in white | Contexts where the studio wants a distinctive, self-contained brand block — e.g. mobile header, social avatars, OG images |

`logo-tile.svg` is not a "dark variant" of the wordmark — it's a self-contained brand element that brings its own black background. It works on light page surfaces (creating contrast against `paper-0`) but does not work over dark backgrounds (the tile disappears). Use `logo-light` over dark surfaces.

All three files use the same path data and a 200×200 viewBox. The `<svg>` element does not declare inline `width` or `height` — sizing is controlled by CSS in the consuming component. Square aspect ratio is preserved by the viewBox.

#### Arrow mark

A separate, secondary brand asset: a yellow square (`brand-yellow`) with a black diagonal arrow pointing up-right.

- File: `favicon.svg` (and the binary kit derived from it: `favicon.ico`, `apple-touch-icon.png`)
- **Scope: favicon and home-screen icon only.** Not used elsewhere on the site or in marketing surfaces.

This is a deliberately narrow scope for now. The arrow mark is a real brand element, but its broader role — as a UI affordance, a marketing accent, or a social-share visual — has not been decided. Revisit this section when expanding the mark's use.

---

## Styling approach

**Tailwind CSS with a custom config** mirroring the tokens in this document. Decision rationale:

- LLMs (including Claude Code) write Tailwind correctly and consistently more easily than they write vanilla CSS. Class names are local, specificity isn't a concern, and there's no risk of file-organization drift across components.
- Tailwind's `theme.extend` is a clean place to define design tokens once and have them auto-available as utility classes (`bg-ink`, `text-accent`, etc.).
- Token discipline is enforced by default — using an off-palette color requires adding it to config, which surfaces the decision instead of hiding it.
- Astro + Tailwind is a well-trodden integration with no friction.

### Configuration approach

Design tokens defined here are mirrored in `tailwind.config.mjs`. Semantic names (e.g. `surface.default`, `text.muted`) are preferred over literal names (e.g. `gray-900`) because they survive palette evolution. Raw palette values exist as a foundation layer; semantic tokens reference them.

---

## Color

### Raw palette

| Token name | Hex value | Context |
|---|---|---|
| `ink-900` | `#0D0D0D` | Headlines, darkest text |
| `ink-700` | `#333333` | Body text |
| `ink-500` | `#4A4A4A` | Muted text, metadata |
| `ink-300` | `#CECECE` | Disabled / placeholder text |
| `paper-0` | `#FEFEFE` | Page background |
| `paper-100` | `#F1EFEF` | Alternative background |
| `brand-yellow` | `#F3ED07` | Brand accent |
| `color-success` | `#27AE74` | Success messages |
| `color-info` | `#3498EF` | Info messages |
| `color-warning` | `#F4D053` | Warning messages |
| `color-error` | `#E74C50` | Error messages |

### Semantic tokens

The names below are what get used in components. They map to raw palette values in `tailwind.config.mjs`.

| Semantic token | Maps to | Used for |
|---|---|---|
| `text.headline` | `ink-900` | Headlines |
| `text.default` | `ink-700` | Body copy, default text, button labels |
| `text.muted` | `ink-500` | Metadata, captions, secondary info |
| `text.inverse` | `paper-0` | Text on dark or image backgrounds |
| `surface.default` | `paper-0` | Page background |
| `surface.alt` | `paper-100` | Desktop sidenav background, form input backgrounds |
| `surface.milk` | `paper-0` @ 85% opacity | Mobile nav menu background |
| `border.subtle` | `ink-900` @ 10% opacity | Hairline dividers |
| `accent.surface` | `brand-yellow` | Primary button background, text link underline on hover |
| `accent.subtle` | `ink-900` @ 25% opacity | Secondary button background |
| `accent.text` | `ink-900` | Text links, focus rings |

### Interactive states

Applies to buttons and text links. The pattern: lighten/darken via HSL relative to the base color, so each component variant gets consistent state behavior without per-component overrides.

| State | Definition |
|---|---|
| `state.default` | Base color as defined per component. |
| `state.hover` | Background darkens by ~12% lightness. For text links: underline appears in `accent.surface`, base color unchanged. Cursor: pointer. |
| `state.pressed` | Background darkens by ~20% lightness (deeper than hover). Applied via `:active`. No transform, no scale. |
| `state.on` | For current nav item / selected toggle. 2px `accent.surface` underline (nav) or solid `accent.surface` background (toggle). |
| `state.disabled` | 50% opacity, `cursor: not-allowed`. Hover and pressed states do not fire. |

Implementation note: in Tailwind, generate hover/pressed values at config time as explicit tokens (e.g. `accent-surface-hover`, `accent-surface-pressed`) rather than relying on runtime `hsl(from ...)` syntax. Easier to test, broader browser support, and surfaces the values for accessibility checking.

### Accessibility

All text/background pairings must meet **WCAG AA** at minimum (4.5:1 for body text, 3:1 for large text). Verify pairings before locking the palette — particularly `accent.surface` (yellow) on `paper-0`, which is borderline for text and should be reserved for backgrounds with `ink-900` text on top.

---

## Typography

### Font families

```
--font-display:  'DM Serif Display'   /* Headlines */
--font-body:     'Source Sans 3'   /* Body, UI */
--font-mono:     'IBM Plex Mono', ui-monospace, monospace  /* Code, metadata */
```

Self-host fonts via `@fontsource/*` packages rather than loading from Google Fonts CDN — better performance, fewer DNS lookups, no third-party requests on every page load. This is the kind of detail Lighthouse 90+ depends on.

### Type scale

A modular scale with a 1.25 (major third) ratio works well for editorial sites. Adjust the base after observing the live site's body size.

| Token | Size (rem) | Px @ 16px base | Use |
|---|---|---|---|
| `text-xs` | 0.75 | 12 | Metadata, eyebrow labels |
| `text-sm` | 0.875 | 14 | Captions, fine print |
| `text-base` | 1 | 16 | Body default |
| `text-lg` | 1.125 | 18 | Large body, intro paragraphs |
| `text-xl` | 1.25 | 20 | Subheadings (h4) |
| `text-2xl` | 1.5 | 24 | h3 |
| `text-3xl` | 1.875 | 30 | h2 |
| `text-4xl` | 2.5 | 40 | h1 (default) |
| `text-5xl` | 3.5 | 56 | Page-level headlines |
| `text-6xl` | 4.5 | 72 | Hero headlines |

### Weights

```
--font-weight-regular:  300
--font-weight-medium:   500
--font-weight-bold:     700
```

### Line height

| Context | Line height |
|---|---|
| Display headlines (h1, h2) | 1.1 |
| Subheadings (h3, h4) | 1.25 |
| Body | 1.6 |
| Long-form prose (blog, case studies) | 1.7 |

### Paragraph spacing


```
p {
  margin-bottom: 1.5em;
}
```

### Measure (line length)

Body copy in long-form contexts (blog, case studies) should max out at **65–75 characters per line**. Implement via `max-w-prose` or a custom `max-w-readable` utility (~68ch).

---

## Spacing

### Spacing scale

A 4px base, 8-point rhythm. Tailwind's default scale already matches this and is fine to use as-is.

| Token | Value | Common use |
|---|---|---|
| `space-1` | 4px | Tight inline gaps |
| `space-2` | 8px | Default inline gap |
| `space-3` | 12px | Form field spacing |
| `space-4` | 16px | Stack gap, default |
| `space-6` | 24px | Card padding |
| `space-8` | 32px | Stack gap, generous |
| `space-12` | 48px | Section internal spacing |
| `space-16` | 64px | Section padding (mobile) |
| `space-24` | 96px | Section padding (desktop) |
| `space-32` | 128px | Major section breaks |

### Section rhythm

Sections on the homepage and marketing pages use generous vertical padding to give content room. Default pattern:

- **Mobile:** `py-16` (64px top/bottom)
- **Desktop:** `py-24` to `py-32` (96–128px)

### Container widths

| Token | Max width | Use |
|---|---|---|
| `container-prose` | 720px | Long-form text (blog post body, case study narrative) |
| `container-default` | 1200px | Standard page width for everything else |

Horizontal page padding: `px-6` mobile, `px-8` tablet, `px-12` desktop. Containers are centered with `mx-auto`. Add wider containers only if a specific layout demands it.

---

## Layout & breakpoints

| Name | Min width | Notes |
|---|---|---|
| `sm` | 640px | Large phone / small tablet |
| `md` | 768px | Tablet |
| `lg` | 1024px | Small laptop |
| `xl` | 1280px | Desktop default |
| `2xl` | 1536px | Large desktop |

**Mobile-first** by default. Layouts cascade up; desktop-specific styles use `md:` and `lg:` prefixes.

---

## Radii & motion

### Border radius

| Token | Value | Use |
|---|---|---|
| `rounded-none` | 0 | Default for editorial elements (case study images, hero) |
| `rounded-sm` | 4px | Form inputs, small UI |
| `rounded-md` | 8px | Buttons, cards |
| `rounded-full` | 9999px | Pills, avatars |

### Shadows

The site does not use drop shadows. Hierarchy comes from typography, color, and spacing. If a component genuinely needs lift, revisit this decision in the doc rather than reaching for an inline shadow.

### Motion

| Token | Duration | Easing | Use |
|---|---|---|---|
| `transition-fast` | 150ms | `ease-out` | Hover states, focus rings |
| `transition-default` | 250ms | `ease-out` | Most UI transitions, image hover scale |

Respect `prefers-reduced-motion`: animations that move significant content are reduced or removed when the OS preference is set.

---

## Components

This inventory is derived from observed IA + standard marketing-site patterns. Each component lives in `src/components/` as an Astro component (or `.tsx` if interactivity is required).

### Header

Persistent across every page. Two distinct treatments based on viewport.

**Desktop (`lg` and up): scroll-locked sidenav**

Top-down order:

1. **Branding** — Logo (`logo-light`) inside a 200×200px knockout from the sidenav background `surface.alt`, letting the background image (homepage slides, marquee images) show through.
2. **Nav items** (see below)
3. **Footer block** (social icons + copyright, see Footer section)

Sidenav width: 360px. Main content shifts right by this width (no overlay). Sidenav itself scroll-locks; main content scrolls independently.

The 200×200 logo silhouette in the sidenav acts as a knockout — content positioned behind the sidenav (hero slide images on the homepage, marquee images on case study and blog post detail pages) shows through the wordmark glyphs. The sidenav background `surface.alt` covers everything outside the silhouette.

**Frozen-slice scroll behavior** (case study and blog post detail pages, desktop): when the user scrolls past the marquee image, the slice of the marquee that fell within the logo silhouette at page load remains visible inside the wordmark — the marquee image disappears as a scrolling element, but its essence persists in the logo. This creates page-level identity continuity: the logo carries the marquee's character throughout the scroll. Implementation note: this is a real engineering effort (likely involving a separately-positioned image element clipped to the wordmark glyph shapes), and may be deferred to a follow-up session if it's blocking initial scaffolding. The static load-state composition is the v1 minimum.

**Mobile / tablet (`<lg`): floating header**

The mobile header has no background. Logo left (`logo-tile`, sized to ~48×48 or similar — the black tile sits cleanly on the light page and matches the brand presence of the desktop sidenav), nav icon (hamburger) right. The nav icon is sticky on scroll, with a 60×60px background in `paper-0` @ 25% opacity. Tap the hamburger → full-screen overlay nav menu. The hamburger morphs to an X that, when tapped, exits the overlay. The nav overlay uses `surface.milk` as background for contrast while maintaining spatial awareness. Nav items stack with min 44px tap targets.

**Nav items, in this order:**

1. Services
2. Work
3. Clients
4. Blog
5. Team
6. Contact

This order matches the live site and is intentional — capability, then proof, then conversion. Don't reorder without a reason.

**Current page indicator:** `state.on` — a 2px `accent.surface` underline on the active item.

**Component:** `src/components/layout/Header.astro`

### Footer

Persistent across every page. On desktop, the footer lives inside the sidenav; on mobile, it sits at the bottom of the page.

Elements, in order:

1. **Contact info** — `+1-323-325-5080` and `40 E. Colorado Blvd, Suite A, Pasadena, CA 91105`
2. **Social icons row** — three platforms in this order:
   - Instagram — https://www.instagram.com/interactivism/
   - Medium — https://medium.com/@interactivismco
   - LinkedIn — https://www.linkedin.com/company/interactivism
3. **Copyright** — `© {currentYear} Interactivism`. Year rendered dynamically via `{new Date().getFullYear()}`, never hardcoded.

**Behavior:**
- Vertical padding: `py-16` mobile, `py-24` desktop
- Social icons: SVG, `accent.text` fill, sized consistently. Hover transitions fill to `accent.surface`.

**Component:** `src/components/layout/Footer.astro`

### Buttons

Two variants, one size.

- **Primary** — `accent.surface` background, `text.headline` label. Used for primary CTAs ("Let's Talk", "Get in touch").
- **Secondary** — `accent.subtle` background, `text.headline` label. Used for paired CTAs ("View Project").

Sizing: 16px text, 12px/24px padding. Single size across the site. Hero CTAs use the same button at the same size — hierarchy comes from surrounding type and space, not from a larger button variant.

States follow the global interactive-state definitions: `default`, `hover`, `pressed`, `disabled`. Focus ring uses `accent.text` at 2px offset.

### Text links

Single component, `<TextLink>`. Optional `withArrow` prop appends a right-arrow glyph for "Learn more" / jump-link contexts.

- Default: `accent.text` color, weight 500, no underline.
- Hover: underline appears in `accent.surface` (yellow), text color unchanged.
- Pressed: underline darkens per `state.pressed`.

Nav links are styled within the Header component, not via `<TextLink>`.

### Icons

Single icon library: **Lucide** (`lucide-astro` or `lucide-react` for interactive contexts).

- Stroke width: 1.5px (consistent across the site)
- Default size: 20px in body / nav contexts; 16px inline with text; 24px in standalone UI affordances
- Color: inherits from `currentColor` so icons take on the parent's text color
- Social icons in the footer use brand-specific SVGs (not Lucide), since Lucide's social glyphs are abstracted

### Case study excerpt (work index)

Displayed in a list on the Work index page.

- Hero image (16:9) with the client name as a tag superimposed flush left, `space-8` from the bottom.
- Client name: tag, `text-lg`, `text.inverse` over image
- Project title: h3, `font-display`, `text-2xl`
- Optional: services tags or one-line summary
- Entire card is a link.
- Hover: image scales to 1.03 over `transition-default`. No shadow, no card lift — only the image moves.

### Case study detail page

The page has a marquee at the top: 4:1 (`heroImageWide`) on desktop, 16:9 (`heroImage`) on mobile. The desktop marquee runs full viewport width with the sidenav overlaying its leftmost region (the logo silhouette punches through to reveal the image inside the wordmark). The client name renders as a tag superimposed on the marquee.

Below the marquee, body content is structured with a metadata column (Industry, Services, Platforms) on the right and the case study narrative on the left, in `container-default`. The narrative is MDX with these components available (`src/components/case-study/`):

- `<Stat>` — single large number + label (e.g. "$3B in exits")
- `<StatRow>` — three or four `<Stat>` components in a row
- `<ImageWithCaption>` — single image with optional caption
- `<ImageGrid>` — 2-up or 3-up image grid
- `<PullQuote>` — large blockquote with attribution
- `<BeforeAfter>` — paired images for redesign comparisons
- `<CaseStudyMeta>` — top metadata block (client, services rendered, year)

### Blog post

Simpler than case studies. Standard editorial layout:

- Title (`text-5xl`, `font-display`)
- Metadata row (date, author, reading time, tags)
- Optional hero image
- Body in `container-prose`, with prose styles (Tailwind `@tailwindcss/typography` plugin or custom)
- Author bio at end (small, optional)

### Client list

Exhaustive list of clients with some linked to case studies in the /work/ section. Grid of 2-3 columns desktop, single column mobile.

### Team (team member index)

List of team members. Photo, name, role, bio blurb with jump link to team member detail, optional social links.

### Team member detail

Same layout as list items on the team member index, but with a full bio, and a link to go back (to /team/) 

### Forms

Contact form. Fields: Name, Email, Company (optional), Message. Submit via Netlify Forms.

- Inputs: `surface.alt` background, `border.subtle` border, focus ring in `accent.text`
- Labels float above inputs (not placeholder-only). Placeholders shown until input is focused; on focus they fade; on input they disappear.
- Validation: on blur for individual fields, on submit for required-field checks. Errors render in `color-error` below the field with both color and icon (color is never the only signal).
- Submit button is the primary button variant.
- Submit success: inline confirmation replaces the form (no page redirect). Failure: error message above the submit button, form remains editable.

### CTA band

Repeated section pattern: "Are you ready to take your product to the next level?" with a primary button "Let's Talk" that links to `/contact/`. Lives at the bottom of all pages except `/contact/`.

### Image treatment

- **Aspect ratios:**
  - Case study and blog post `heroImage`: 16:9 (Work/Blog index card, homepage slide, mobile detail page hero). Source min 1920px wide.
  - Case study and blog post `heroImageWide`: 4:1 (desktop detail page marquee). Source min 2400px wide.
  - Team headshots: 1:1.
- **Two-image pattern for detail pages.** Detail pages need two distinct images at meaningfully different aspect ratios — 16:9 for mobile, 4:1 for desktop marquee. The aspect ratios are too different to share a source. See CONTENT.md "Image strategy" for the schema and editorial reasoning.
- **Marquee composition constraint.** `heroImageWide` (4:1) renders full viewport width on desktop with the leftmost ~360px partially obscured by the sidenav (visible only inside the logo silhouette). Authors compose with this in mind: the focal subject sits in the right ~85% of the frame, and the leftmost region is visually quiet enough that the logo knockout reads as a focal moment rather than a distraction.
- **Color treatment:** full color, no duotones or filters. Photography is part of the work showcase.
- **Loading:** every `<Image>` uses Astro's `astro:assets` for automatic optimization. Set `loading="eager"` only on hero images above the fold; everything else is `loading="lazy"` (default).
- **Placeholders:** while loading, image containers reserve space via aspect-ratio CSS to prevent layout shift. No skeleton shimmers — just a `surface.alt` background until the image loads.
- **Alt text:** required on every content image. Decorative images use `alt=""` explicitly.

### Social share images (OG)

Every page needs an `og:image` for previews on LinkedIn, Slack, iMessage, Twitter/X, etc. Standard size: 1200×630px, PNG.

**v1 architecture: static default + per-content overrides.**

- **Default OG image** (`public/og-default.png`) — used for any page without a custom one. Brand-yellow background, `logo-tile` left, "Digital product design & development." in `font-display` right. Used for Home, Services, Team, Contact, and any case study or blog post that hasn't been given a custom `ogImage`.
- **Per-content custom OG images** — set via the `ogImage` field on case study and blog post frontmatter. Co-located with the content file (`./og.jpg`). Astro's `astro:assets` pipeline handles them.
- **Case studies launching at v1** can reuse hero images as OG images (aspect ratio is close enough); blog posts default to the static OG.

**v2 (future): dynamic OG generation.** Use `astro-og-canvas` or `@vercel/og` to render OG images at build time from page metadata — case study title or blog post title rendered on a branded template. Removes the per-post production step. Add when manual per-post OG images become a maintenance burden, not before.

### Favicon and web manifest

The favicon kit lives at the public root and gets wired into the base layout's `<head>`:

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#F3ED07">
```

Asset locations:

```
public/
  favicon.ico                          # Multi-resolution ICO (16/32/48)
  favicon.svg                          # Modern browsers
  favicon-96x96.png                    # Some Android contexts
  apple-touch-icon.png                 # 180×180, iOS home screen
  site.webmanifest                     # PWA manifest
  web-app-manifest-192x192.png         # Manifest icon, small
  web-app-manifest-512x512.png         # Manifest icon, large
  og-default.png                       # 1200×630, fallback OG
```

The manifest declares `name: "Interactivism"`, `theme_color: #F3ED07` (brand-yellow), `background_color: #FEFEFE` (paper-0). Manifest icons are declared with both `purpose: "maskable"` and `purpose: "any"` for cross-platform behavior.

### Empty, loading, and error states

- **Blog with zero posts:** "We're working on something. Check back soon." + link to Contact.
- **Form submit success:** inline confirmation replaces the form: "Thanks — we'll be in touch within a few business days."
- **Form submit failure:** error message above submit button, form fields preserved.
- **404 page:** custom page with Interactivism wordmark, "We couldn't find that page," and links back to Home, Work, and Contact.
- **Slow image load:** `surface.alt` placeholder holds aspect ratio until image arrives; no spinner.

---

## Page patterns

### Homepage slider

Slide composition:

1. **Hero slide** — studio positioning. Driven by the `hero` block in `src/data/homepage.json` (headline + image + CTA). Persistent across case study rotations; edited only when positioning changes.
2. **Work slides** — one per featured case study. Driven by the `featuredCaseStudies` array in `src/data/homepage.json` (3–8 slugs). Each slide shows the case study's hero image, client name, and project title, with primary CTA "Let's Talk" plus secondary CTA "View Project" linking to the case study. Edited when business priorities shift or new work ships.
3. **Pagination control** — current slide / total slides, with previous and next flippers. Layout: `[← | current / total | →]`.

See CONTENT.md "Homepage (data file)" for the schema and editorial workflow.

**Slider behavior (accessibility-critical for the Lighthouse 90+ target):**

- **No auto-advance.** Auto-advancing carousels harm accessibility and reduce engagement. User-controlled only.
- **Keyboard support:** left/right arrow keys advance slides when the slider region has focus.
- **Touch:** swipe left/right on mobile and tablet.
- **Focus management:** when a slide changes, focus moves to the new slide's heading. Hidden slides are `aria-hidden="true"` and not focusable.
- **Reduced motion:** if `prefers-reduced-motion` is set, slide transitions are instant (no slide animation).
- Slider container has `role="region"` and `aria-label="Featured work"`.

**Component:** `src/components/home/Slider.astro` (or `.tsx` for the interactive logic).

### Work index

Reverse-chronological list of case studies. And lastly, a CTA band.

### Services page

Index of service offerings. Vertical stack: each service has a title (h2), 1–2 paragraphs of overview, and a "Learn more" link that jumps to the corresponding service detail page. Closes with a CTA band.

### Service detail page

One page per service offering. Consolidates what was previously split across category and sub-category pages on the live site — substantial long-form content (800–1500 words) that covers the service in depth.

Layout:

- Hero (title + one-paragraph positioning statement)
- Body content with h2 sections for each sub-topic of the service (e.g. for UX Design: "Information Architecture," "User Research," "Interaction Design")
- Each h2 has an auto-generated `id` (via `rehype-slug`) so it can be deep-linked
- Inline sub-nav at the top of the body links to those h2 sections (anchor links within the same page, not separate URLs)
- Related case studies module (2–3 cards) showing work in this service area
- CTA band

Note on URL strategy: the live site has a three-level hierarchy (`/services/` → `/services/ux-design/` → `/services/ux-design/information-architecture/`). The new site flattens to two levels (`/services/` → `/services/product-design/`). Sub-category URLs from the old site redirect to anchor sections on the renamed consolidated detail page. See "URL strategy & redirects" below.

### Clients page

Exhaustive list of clients with some linked to case studies in the /work/ section.

### Team page

Studio narrative (a few paragraphs), list of brief team bios with links to expanded bios, CTA band.

### Blog index

Reverse-chronological list of posts. Pagination after 10–12 posts.

### Contact page

Headline, brief intro, contact form, alternative contact methods (email, social), office location if relevant.

---

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

Trailing slashes are consistent across the site (always present on directory-style URLs). Astro's `trailingSlash` config option locks this in.

### Redirects (built during migration, lives in `netlify.toml`)

Four categories of redirect to handle:

1. **Service rename redirects.** Several service URLs change in the new site (consolidating from six services to five, with three renames):

   | From | To |
   |---|---|
   | `/services/ux-design/` | `/services/product-design/` |
   | `/services/strategy-growth/` | `/services/product-strategy/` |
   | `/services/research/` | `/services/user-research/` |
   | `/services/training/` | `/services/` |

   `/services/human-ai-experience/` and `/services/development/` carry forward unchanged.

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

---

## Accessibility baseline

Non-negotiable for v1, supporting the Lighthouse 90+ target in PROJECT.md:

- All interactive elements should be reachable and operable via keyboard
- Visible focus indicators on every focusable element (use `accent.text` for the ring)
- Skip-to-main-content link in the header
- Semantic HTML — actual `<button>`, `<nav>`, `<main>`, heading hierarchy that makes sense
- All images have meaningful `alt` text (or `alt=""` if decorative)
- Color is never the only indicator of meaning (links underlined or otherwise distinguished beyond color)
- Form fields have associated `<label>` elements
- `prefers-reduced-motion` honored

---

## Implementation notes

### File structure

```
src/
  styles/
    global.css          # Tailwind directives + base styles
    typography.css      # Prose styling for blog/case study bodies
  components/
    ui/                 # Buttons, links, form fields, icons
    layout/             # Header, Footer, Container
    case-study/         # MDX components for case study bodies
  assets/
    brand/              # Logo files
    images/             # Optimized images, processed by astro:assets
```

Add subfolders (e.g. `components/home/`, `components/blog/`) only when a specific page accumulates enough custom components to justify the split. Don't create folders for files that don't exist yet.

### Token export

Tokens defined here are mirrored in `tailwind.config.mjs` under `theme.extend`. When a token is added or changed in this document, update the Tailwind config in the same commit.

### Tailwind plugins

- `@tailwindcss/typography` — for blog and case study prose (with custom `prose-interactivism` modifier matching our type scale)
- `@tailwindcss/forms` — sane form defaults

### Don't reach for these

These are intentionally not part of the system:

- Component libraries (shadcn, Radix-as-default, Headless UI) — overkill for a marketing site, adds dependencies that need maintenance
- Animation libraries (Framer Motion, GSAP) — CSS transitions cover everything we need; revisit only if a specific case study demands it
- CSS-in-JS — we have Tailwind
- Additional icon libraries beyond Lucide

---
