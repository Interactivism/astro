# Interactivism Design System

## Purpose of this document

This is the source of truth for visual decisions on interactivism.com. Anything related to colors, typography, spacing, components, or layout patterns is decided here. PROJECT.md handles intent and information architecture; DESIGN.md handles how things look.

When working in this repo (especially via Claude Code): **read this document before any visual work.** If a needed pattern doesn't exist, add it here first, then implement.

The current interactivism.com is the canonical reference for visual direction, but the new site should be a refined version — clean up inconsistencies, drop one-off styles, enforce a single set of tokens. Anywhere this document conflicts with the live site, this document wins.

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
| `brand-yellow` | `#F2DB07` | Brand accent |
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
| `surface.milk` | `paper-0` @ 95% opacity | Mobile nav menu background |
| `border.subtle` | `ink-900` @ 10% opacity | Hairline dividers |
| `accent.surface` | `brand-yellow` | Primary button background, text link underline on hover |
| `accent.subtle` | `ink-900` @ 25% opacity | Secondary button background |
| `accent.text` | `ink-900` | Text links, focus rings |

### Interactive states

Applies to buttons and text links. The pattern: lighten/darken via HSL relative to the base color, so each component variant gets consistent state behavior without per-component overrides.

| State | Definition |
|---|---|
| `state.default` | Base color as defined per component. |
| `state.hover` | Primary button background shifts hue +4° toward green-yellow (HSL 54° → 58°, same lightness), reading as a subtle brightening. For text links: underline appears in `accent.surface`, base color unchanged. Cursor: pointer. |
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
--font-display:  'DM Serif Display'                          /* Headlines */
--font-body:     'DM Sans Variable', 'DM Sans'               /* Body, UI */
--font-mono:     'IBM Plex Mono', ui-monospace, monospace    /* Code, metadata */
```

The body font is loaded via `@fontsource-variable/dm-sans`, which registers the family as `'DM Sans Variable'`. The fallback `'DM Sans'` catches systems where DM Sans is installed natively. The Tailwind config mirrors this: `fontFamily.body: ['"DM Sans Variable"', '"DM Sans"', 'system-ui', 'sans-serif']`.

Self-host fonts via `@fontsource/*` packages rather than loading from Google Fonts CDN — better performance, fewer DNS lookups, no third-party requests on every page load. This is the kind of detail Lighthouse 90+ depends on.

### Type scale

A modular scale with a 1.25 (major third) ratio works well for editorial sites. Adjust the base after observing the live site's body size.

| Token | Size (rem) | Px @ 16px base | Use |
|---|---|---|---|
| `text-xs` | 0.875 | 14 | Metadata, eyebrow labels, footer content |
| `text-sm` | 1 | 16 | Captions, fine print |
| `text-base` | 1.125 | 18 | Body default |
| `text-lg` | 1.25 | 20 | Large body, intro paragraphs |
| `text-xl` | 1.5 | 24 | Subheadings (h4), buttons |
| `text-2xl` | 1.875 | 30 | h3, nav items |
| `text-3xl` | 2.5 | 40 | h2 |
| `text-4xl` | 3.5 | 56 | h1 (default) |
| `text-5xl` | 4.5 | 72 | Page-level headlines |
| `text-6xl` | 6 | 96 | Hero headlines |
| `text-7xl` | 7 | 112 | Full-bleed slider headline (desktop) |

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

Horizontal page padding: `px-6` mobile, `px-6 lg:px-12` desktop (two-step, no intermediate tablet stop). Containers are centered with `mx-auto`. Add wider containers only if a specific layout demands it.

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
| `rounded-sm` | 4px | Buttons, form inputs, small UI |
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

### Quick reference

| Component | File | Appears on |
|---|---|---|
| Header | `src/components/layout/Header.astro` | Every page |
| Footer | `src/components/layout/Footer.astro` | Every page |
| Marquee | `src/components/layout/Marquee.astro` | All pages except home |
| MapMarquee | `src/components/contact/MapMarquee.astro` | Contact |
| Button | `src/components/ui/Button.astro` | CTAs, forms |
| CTA band | *(inline section, no dedicated component file)* | Bottom of most pages |
| Slider | `src/components/home/Slider.astro` | Home |

See SCHEMA.md for file structure and implementation conventions.

### Header

Persistent across every page. Two distinct treatments based on viewport.

**Desktop (`lg` and up): scroll-locked sidenav**

Top-down order:

1. **Branding** — Logo (`logo-light`) inside a 200×200px knockout from the sidenav background `surface.alt`, letting the background image (homepage slides, marquee images) show through.
2. **Nav items** (see below)
3. **Footer block** (social icons + copyright, see Footer section)

Sidenav width: 360px. Main content shifts right by this width (no overlay). Sidenav itself scroll-locks; main content scrolls independently.

The 200×200 logo silhouette in the sidenav acts as a knockout — content positioned behind the sidenav (hero slide images on the homepage, marquee images on case study and blog post detail pages) shows through the wordmark glyphs. The sidenav background `surface.alt` covers everything outside the silhouette.

**Logo variant detection** — to ensure contrast, the logo SVG switches between `logo-light` (white wordmark) and `logo-dark` (ink wordmark) based on the average luminance of the 200×200px image region behind it (80px inset from top-left). Threshold: **197 / 255 (77%)**. At or above → `logo-dark`; below → `logo-light`. Build-time detection via `src/lib/imageBrightness.ts` (`getLogoVariant`); runtime re-sampling in `Slider.astro` on every slide change. Both use the same threshold and `>=` comparison.

**Frozen-slice scroll behavior** (case study and blog post detail pages, desktop): when the user scrolls past the marquee image, the slice of the marquee that fell within the logo silhouette at page load remains visible inside the wordmark — the marquee image disappears as a scrolling element, but its essence persists in the logo. This creates page-level identity continuity: the logo carries the marquee's character throughout the scroll. Implementation note: this is a real engineering effort (likely involving a separately-positioned image element clipped to the wordmark glyph shapes), and may be deferred to a follow-up session if it's blocking initial scaffolding. The static load-state composition is the v1 minimum.

**Mobile / tablet (`<lg`): floating header**

The mobile header has no background. Logo left (`logo-tile`, sized to ~48×48 or similar — the black tile sits cleanly on the light page and matches the brand presence of the desktop sidenav), nav icon (hamburger) right. The nav icon is sticky on scroll, with a **54×54px** background in `paper-0` @ 25% opacity. Tap the hamburger → full-screen overlay nav menu. The hamburger morphs to an X that, when tapped, exits the overlay. The nav overlay uses `surface.milk` as background. It contains **only the nav items** — no logo, no footer — centered vertically and horizontally in the full-screen overlay. Nav items stack with min 44px tap targets.

Hamburger icon: 32×32px SVG, stroke width 2px.

**Nav items, in this order:**

1. Services
2. Work
3. Clients
4. Blog
5. Team
6. Contact

This order matches the live site and is intentional — capability, then proof, then conversion. Don't reorder without a reason.

Nav item labels are rendered in **sentence case** — no `uppercase` or `tracking-widest`. Size: `text-2xl` (30px), weight: `font-light` (300). Nav items are indented `108px` from the left edge of the sidenav, visually aligning with the logo silhouette.

**Current page indicator:** `state.on` — nav item text color changes to `#9B9B9B` (light grey) to indicate the active page.

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

Three variants, one size. Implemented as `src/components/ui/Button.astro` — renders an `<a>` when `href` is provided, a `<button>` otherwise.

- **Primary** (`variant="primary"`) — `accent.surface` background, `text.headline` label. Used for primary CTAs ("Let's talk", "Get in touch").
- **Ghost** (`variant="ghost"`) — `paper-0` @ 66% opacity background, `text.headline` label. Used over dark hero images and marquee overlays (e.g. "View project" on work slides).
- **Dark** (`variant="dark"`) — `ink-900` background, `text.inverse` label. Used for secondary actions on light surfaces (e.g. "Load more posts" on the blog index).

Button labels are **sentence case** — not ALL CAPS. No `uppercase` or `tracking-widest` on button text.

Sizing: `text-xl` (24px), `py-3 px-6` padding, `rounded-sm` (4px radius). Single size across the site. Hero CTAs use the same button at the same size — hierarchy comes from surrounding type and space, not from a larger button variant.

States follow the global interactive-state definitions: `default`, `hover`, `pressed`, `disabled`. Focus ring uses `accent.text` at 2px offset. Disabled state: `opacity-40`, `cursor-not-allowed`.

**Component:** `src/components/ui/Button.astro`

### Text links

Text links are styled globally via a base `a` rule in `global.css` — there is no separate `<TextLink>` component.

- Default: `ink-900` color, weight 500, no underline.
- Hover: underline appears in `accent.surface` (yellow), text color unchanged.
- Pressed: underline darkens per `state.pressed`.

Nav links are styled within the Header component and override these defaults.

### Icons

Single icon library: **Lucide** (`lucide-astro` or `lucide-react` for interactive contexts).

- Stroke width: 2px (consistent across the site)
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

List of team members. Photo, name, role, bio blurb with jump link to team member detail, optional social links rendered as **inline SVG icons** (LinkedIn, Medium, Instagram, globe for website) — not text labels. Icons use `currentColor` at 16×16px with an `aria-label` on the link for accessibility.

### Team member detail

Same layout as list items on the team member index, but with a full bio and social links rendered as **inline SVG icons** (same treatment as the team index — LinkedIn, Medium, Instagram, globe for website; 16×16px, `currentColor`, `aria-label` on the link). A link to go back (to /team/) is also shown.

### Forms

Contact form. Fields: Name, Email, Company (optional), Message. Submit via Netlify Forms.

- Inputs: `surface.alt` background, `border.subtle` border, focus ring in `accent.text`
- Labels float above inputs (not placeholder-only). Placeholders shown until input is focused; on focus they fade; on input they disappear.
- Validation: on blur for individual fields, on submit for required-field checks. Errors render in `color-error` below the field with both color and icon (color is never the only signal).
- Submit button is the primary button variant.
- Submit success: inline confirmation replaces the form (no page redirect). Failure: error message above the submit button, form remains editable.

### Marquee

A full-bleed, viewport-height image strip used as a hero section on **all pages except the homepage**. This includes case study and blog post detail pages, and the static pages: Services, Clients, Team, and Contact (Contact uses `MapMarquee` — see below).

On content pages (case studies, blog posts), the marquee displays the `heroImageWide` (4:1 image) with the client name or post category as a tag superimposed flush left. On static pages, the marquee uses a fixed image — see "Image treatment" below for the naming convention.

On desktop, the marquee runs full viewport width — the leftmost ~360px is partially obscured by the sidenav, with only the logo knockout region (200×200px centered in the sidenav) showing through. This creates the frozen-slice effect: a 200×200 portion of the marquee image appears inside the logo silhouette and remains visible as the user scrolls past the marquee itself.

Implementation detail for the frozen-slice (desktop only): a separately positioned, `position: fixed` element clipped to 200×200px sits behind the sidenav at exactly the logo silhouette location (80px from left, 80px from top). It displays an independently initialized copy of the marquee image — not a CSS trick — so that it remains visually synchronized with the sidenav regardless of scroll position.

**Sizing constraint:** the marquee wrapper has `lg:min-h-[300px]` to ensure the image always covers the logo window (which extends to 280px from the top). The frozen-slice image mirrors this with `height: max(25vw, 300px)` — matching the `aspect-[4/1]` fluid height at wider viewports and the fixed floor at narrower ones. If the min-height changes, update both values together.

**Component:** `src/components/layout/Marquee.astro`

### MapMarquee

A variant of the Marquee component used on the Contact page. Rather than a Google Maps embed, it uses a **static image** (same pipeline as all other marquee images) wrapped in an `<a>` link to Google Maps for the studio location. This is simpler, faster, and avoids the Maps API dependency entirely.

The static image lives at `src/assets/images/marquee/contact-wide.jpg` (4:1) and follows the same frozen-slice behavior as all other marquee images on desktop. The link opens Google Maps at the studio address.

**Component:** `src/components/contact/MapMarquee.astro`

### CTA band

Repeated section pattern: "Are you ready to take your product to the next level?" with a primary button "Let's talk" that links to `/contact/`. Lives at the bottom of all pages except `/contact/`.

### Image treatment

- **Aspect ratios:**
  - Case study and blog post `heroImage`: 16:9 (Work/Blog index card, homepage slide, mobile detail page hero). Source min 1920px wide.
  - Case study and blog post `heroImageWide`: 4:1 (desktop detail page marquee). Source min 2400px wide.
  - Static page marquee images: 4:1 (desktop marquee). Source min 2400px wide. Same composition constraints as `heroImageWide` — focal subject in the right ~85% of the frame.
  - Team headshots: 1:1.
- **Two-image pattern for detail pages.** Detail pages need two distinct images at meaningfully different aspect ratios — 16:9 for mobile, 4:1 for desktop marquee. The aspect ratios are too different to share a source. See CONTENT.md "Image strategy" for the schema and editorial reasoning.
- **Static page marquee images.** The static pages (Services, Clients, Team) each have a fixed marquee image. These are **not** CMS fields — they are static assets imported directly by each Astro page. No frontmatter or Keystatic schema is needed; the file path is the contract. Images live in:

  ```
  src/assets/images/marquee/
    work.jpg
    services.jpg
    clients.jpg
    blog.jpg
    team.jpg
  ```

  Contact uses `MapMarquee` (Google Maps) instead of a photo, so it has no entry here. If Contact ever needs a photo fallback, add `contact.jpg` and a conditional in `MapMarquee.astro`.

  To swap a static marquee image: replace the file at the same path and redeploy. No schema changes needed.

- **Marquee composition constraint.** `heroImageWide` and static marquee images (4:1) render full viewport width on desktop with the leftmost ~360px partially obscured by the sidenav (visible only inside the logo silhouette). Authors compose with this in mind: the focal subject sits in the right ~85% of the frame, and the leftmost region is visually quiet enough that the logo knockout reads as a focal moment rather than a distraction.
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
<meta name="theme-color" content="#F2DB07">
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

The manifest declares `name: "Interactivism"`, `theme_color: #F2DB07` (brand-yellow), `background_color: #FEFEFE` (paper-0). Manifest icons are declared with both `purpose: "maskable"` and `purpose: "any"` for cross-platform behavior.

### Empty, loading, and error states

- **Blog with zero posts:** "Posts coming soon. In the meantime, [let's talk](/contact/)."
- **Form submit success:** inline confirmation replaces the form: "Thanks — we'll be in touch within one business day."
- **Form submit failure:** error message above submit button, form fields preserved.
- **404 page:** custom page with oversized "shrug" ASCII art, "We couldn't find that page. It's us, not you." and links back to Home, Work, and Contact.
- **Slow image load:** `surface.alt` placeholder holds aspect ratio until image arrives; no spinner.

---

## Page patterns

### Homepage slider

Slide composition:

1. **Hero slide** — studio positioning. Driven by the `hero` block in `src/data/homepage.json` (headline + image + CTA). Persistent across case study rotations; edited only when positioning changes.
2. **Work slides** — one per featured case study. Driven by the `featuredCaseStudies` array in `src/data/homepage.json` (3–8 slugs). Each slide shows the case study's hero image, client name, and project title, with primary CTA "Let's talk" plus secondary CTA "View project" linking to the case study. Edited when business priorities shift or new work ships.
3. **Pagination control** — current slide / total slides, with previous and next flippers. Layout: `[← | current / total | →]`.

See CONTENT.md "Homepage (data file)" for the schema and editorial workflow.

**Slider behavior (accessibility-critical for the Lighthouse 90+ target):**

- **Auto-advance:** slides change every 5 seconds automatically.
- **Pause on hover / focus:** hovering or focusing inside the slider region temporarily suspends auto-advance; it resumes on mouse leave / blur. This is non-destructive — auto-advance can restart.
- **Permanent stop on explicit navigation (WCAG 2.2.2):** clicking the pagination controls or swiping permanently stops auto-advance for the remainder of the page session. It does not restart on hover leave or focus blur.
- **Reduced motion:** if `prefers-reduced-motion` is set, auto-advance is disabled entirely and slide transitions are instant.
- **Keyboard support:** left/right arrow keys advance slides when the slider region has focus (also triggers the permanent stop).
- **Touch:** swipe left/right on mobile and tablet (also triggers the permanent stop).
- **Focus management:** when a slide changes, focus moves to the new slide's heading. Hidden slides are `aria-hidden="true"` and not focusable.
- Slider container has `role="region"`, `aria-label="Featured work"`, and `aria-roledescription="carousel"`.

**Component:** `src/components/home/Slider.astro` (or `.tsx` for the interactive logic).

### Work index

Marquee at top using `src/assets/images/marquee/work.jpg`. Reverse-chronological list of case studies below. And lastly, a CTA band.

Grid: single column at `lg` (1024px), two columns at `xl` (1280px+). Case study detail and blog post detail pages likewise use a single-column layout at `lg`, deferring the metadata sidebar to `xl`.

### Services page

Marquee at top using `src/assets/images/marquee/services.jpg` (frozen-slice logo knockout applies on desktop). Index of service offerings below. Vertical stack: each service has a title (h2), 1–2 paragraphs of overview, and a "Learn more" link that jumps to the corresponding service detail page. Closes with a CTA band.

### Service detail page

One page per service offering. Consolidates what was previously split across category and sub-category pages on the live site — substantial long-form content (800–1500 words) that covers the service in depth.

Layout:

- Hero (title + one-paragraph positioning statement)
- Body content with h2 sections for each sub-topic of the service (e.g. for UX Design: "Information Architecture," "User Research," "Interaction Design")
- Each h2 has an auto-generated `id` (via `rehype-slug`) so it can be deep-linked
- Related case studies module (2–3 cards) showing work in this service area
- CTA band

Note on URL strategy: the live site has a three-level hierarchy (`/services/` → `/services/ux-design/` → `/services/ux-design/information-architecture/`). The new site flattens to two levels (`/services/` → `/services/product-design/`). Sub-category URLs from the old site redirect to anchor sections on the renamed consolidated detail page. See "URL strategy & redirects" in PROJECT.md.

### Clients page

Marquee at top using `src/assets/images/marquee/clients.jpg` (frozen-slice logo knockout applies on desktop). Exhaustive list of clients with some linked to case studies in the /work/ section.

### Team page

Marquee at top using `src/assets/images/marquee/team.jpg` (frozen-slice logo knockout applies on desktop). Studio narrative (a few paragraphs), list of brief team bios with links to expanded bios, CTA band.

### Blog index

Marquee at top using `src/assets/images/marquee/blog.jpg`. Reverse-chronological list of posts below. A **"Load more posts"** button (dark variant) appears after 10 posts and loads the next 10 on click. All posts are server-rendered for SEO and no-JS resilience; JS hides posts beyond the threshold and reveals the button. To preview the button with fewer than 10 posts, append `?pageSize=N` to the URL.

### Contact page

Full-bleed MapMarquee hero (Google Maps at zoom 15, showing the studio location with neighborhood label) — this *is* the Contact page's marquee, just map-based rather than photo-based. Followed by a headline, brief intro, contact form, and alternative contact methods (email, social).

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

**Focus ring implementation:** `global.css` strips the browser default (`:focus { outline: none }`) and restores a clear keyboard ring via `:focus-visible { ring-2 ring-ink-900 ring-offset-2 }`. iOS Safari incorrectly fires `:focus-visible` on programmatic `.focus()` calls triggered by touch interactions (e.g. hamburger refocus after menu close, slider heading focus on slide change). This is suppressed by `html.is-touching :focus-visible { outline: none; box-shadow: none }`, toggled by a touch-tracking script in `BaseLayout.astro` that adds `is-touching` to `<html>` on `touchstart` and removes it 500ms after `touchend` (immediately on `keydown`).

