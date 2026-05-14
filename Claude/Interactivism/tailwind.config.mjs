/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      // ============================================================
      // Colors — raw palette + semantic tokens
      // Source of truth: DESIGN.md "Color" section
      // ============================================================

      colors: {
        // --- Raw palette ---
        ink: {
          900: '#0D0D0D', // headlines, darkest text
          700: '#333333', // body text
          500: '#4A4A4A', // muted text, metadata
          300: '#CECECE', // disabled / placeholder text
        },
        paper: {
          0: '#FEFEFE',   // page background
          100: '#F1EFEF', // alternative background
        },
        'brand-yellow': '#F2DB07',

        // inverse — white for use on dark backgrounds (bg-inverse, border-inverse, text-inverse)
        inverse: '#FEFEFE',

        // Status colors
        success: '#27AE74',
        info: '#3498EF',
        warning: '#F4D053',
        error: '#E74C50',

        // --- Semantic: surfaces ---
        // bg-surface         → page background (paper-0)
        // bg-surface-alt     → sidenav, form inputs (paper-100)
        // bg-surface-milk    → mobile nav overlay (paper-0 @ 95%)
        surface: {
          DEFAULT: '#FEFEFE',
          alt: '#F1EFEF',
          milk: 'rgba(254, 254, 254, 0.95)',
        },

        // --- Semantic: accent ---
        // bg-accent          → primary button, link underline (brand-yellow)
        // bg-accent-hover    → brand-yellow hue-shifted +4° toward green-yellow (54° → 58°)
        // bg-accent-pressed  → brand-yellow darkened ~20% lightness
        // bg-accent-subtle   → secondary button bg (ink-900 @ 25%)
        accent: {
          DEFAULT: '#F2DB07',
          hover: '#F3ED07',    // brand-yellow hue-shifted +4° (HSL 54° → 58°, same L=49%)
          pressed: '#8F8B04',  // brand-yellow darkened ~20% lightness
          subtle: 'rgba(13, 13, 13, 0.25)',
        },
      },

      // Text semantic tokens — separate extension avoids the text-text-X
      // double-prefix that would occur if nested under colors.text.*
      // text-headline, text-body, text-muted, text-inverse
      textColor: {
        headline: '#0D0D0D', // text.headline → ink-900
        body: '#333333',     // text.default  → ink-700 (renamed: 'default' is reserved)
        muted: '#4A4A4A',    // text.muted    → ink-500
        inverse: '#FEFEFE',  // text.inverse  → paper-0
      },

      // Border semantic token
      // border-subtle → hairline dividers (ink-900 @ 10%)
      borderColor: {
        subtle: 'rgba(13, 13, 13, 0.10)',
      },

      // ============================================================
      // Typography
      // Source of truth: DESIGN.md "Typography" section
      // ============================================================

      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"DM Sans Variable"', '"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },

      // Full type scale — all steps overridden from Tailwind defaults.
      // xs=14  sm=16  base=18  lg=20  xl=24  2xl=30  3xl=40
      // 4xl=56  5xl=72  6xl=96  7xl=112
      fontSize: {
        'xs':   '0.875rem', // 14px — metadata, eyebrow labels
        'sm':   '1rem',     // 16px — captions, fine print
        'base': '1.125rem', // 18px — body default
        'lg':   '1.25rem',  // 20px — large body, intro paragraphs
        'xl':   '1.5rem',   // 24px — subheadings (h4), nav, buttons
        '2xl':  '1.875rem', // 30px — h3
        '3xl':  '2.5rem',   // 40px — h2
        '4xl':  '3.5rem',   // 56px — h1 default
        '5xl':  '4.5rem',   // 72px — page-level headline
        '6xl':  '6rem',     // 96px — hero headline
        '7xl':  '7rem',     // 112px — full-bleed slider headline (desktop)
      },

      lineHeight: {
        display: '1.1',  // h1, h2 — tight editorial
        heading: '1.25', // h3, h4
        body: '1.6',     // body copy
        prose: '1.7',    // long-form (blog, case studies)
      },

      // ============================================================
      // Spacing / Layout
      // Source of truth: DESIGN.md "Spacing" and "Container widths"
      // ============================================================

      maxWidth: {
        prose: '720px',    // container-prose — long-form text
        content: '1200px', // container-default — standard page width
        readable: '68ch',  // ~65–75 chars per line for body copy
      },

      // ============================================================
      // Motion
      // Source of truth: DESIGN.md "Motion" section
      // ============================================================

      transitionDuration: {
        fast: '150ms',    // hover states, focus rings
        DEFAULT: '250ms', // most UI transitions, image hover
      },

      transitionTimingFunction: {
        DEFAULT: 'ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
