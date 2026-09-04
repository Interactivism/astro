/**
 * Content collection schemas.
 * Source of truth: CONTENT.md — all changes there first, then here.
 *
 * File location: src/content.config.ts (Astro 5 preferred location).
 * CONTENT.md references src/content/config.ts (old Astro 4 path);
 * the schemas are identical, only the file location differs.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ============================================================
// Controlled vocabularies
// Mirrors CONTENT.md exactly. Add new values here first.
// ============================================================

const INDUSTRY_IDS = [
  'adtech',
  'aerospace-defense',
  'ai-content',
  'consumer',
  'enterprise-saas',
  'fintech',
  'martech',
  'media-publishing',
  'nonprofit-civic',
] as const;

const SERVICE_IDS = [
  'product-design',
  'human-ai-experience',
  'user-research',
  'development',
  'product-strategy',
  'brand-development',
] as const;

const DELIVERABLE_IDS = [
  'experience-strategy',
  'heuristic-evaluation',
  'usability-assessment',
  'personas',
  'information-architecture',
  'brand-strategy',
  'brand-identity',
  'positioning-framework',
  'messaging-framework',
  'print-collateral',
  'illustration',
  'animation',
  'content-strategy',
  'ui-ux-design',
  'design-system',
  'data-visualization',
  'web-development',
  'mobile-app-development',
  'futurecasting',
] as const;

// ============================================================
// Case Studies
// ============================================================

const caseStudies = defineCollection({
  loader: glob({
    // Flat structure: one {slug}.mdx per case study at the collection root.
    // Images live in co-named subdirectories: {slug}/hero.jpg, {slug}/images/*.
    pattern: '*.mdx',
    base: './src/content/caseStudies',
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(80),
      client: z.string(),
      publishedDate: z.coerce.date(),
      status: z.enum(['draft', 'published']),
      // Auto-stamped by the pre-commit git hook. Not set on entries that have
      // never been committed since the hook was introduced.
      lastUpdatedBy: z.string().optional(),
      lastUpdatedAt: z.string().optional(),
      summary: z.string().min(100).max(160),
      heroImage: image().optional(),
      heroImageWide: image().optional(),
      photoCredit: z.object({
        photographer: z.string().optional(),
        photographerUrl: z.string().url().optional(),
        platform: z.string().optional(),
        platformUrl: z.string().url().optional(),
      }).optional(),
      ogImage: image().optional(),
      services: z.array(z.enum(SERVICE_IDS)).min(1),
      industry: z.enum(INDUSTRY_IDS),
      year: z.coerce.number().int().positive(),
      // Optional end year. Omit for single-year projects.
      // Use a number (e.g. 2023) for completed ranges, or the string 'present' for ongoing work.
      yearEnd: z.union([z.coerce.number().int().positive(), z.literal('present')]).optional(),
      deliverables: z.array(z.enum(DELIVERABLE_IDS)).min(1),
      duration: z.string().optional(),
      // 0–4 metric entries. Empty array and omitted are both treated as "no metrics".
      metrics: z
        .array(
          z.object({
            value: z.string(),
            label: z.string(),
          })
        )
        .max(4)
        .optional(),
      relatedCaseStudies: z.array(z.string()).max(2).optional(),
      gallery: z.array(
        z.object({
          image: image(),
          caption: z.string().optional(),
        })
      ).optional(),
    }),
});

// ============================================================
// Blog Posts
// ============================================================

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().max(100),
        // References an ID in the authors collection.
        // Validated at render time via getEntry('authors', entry.data.author).
        author: z.string(),
        publishedDate: z.coerce.date(),
        status: z.enum(['draft', 'published']),
        summary: z.string().min(100).max(200),
        heroImage: image().optional(),
        heroImageWide: image().optional(),
        photoCredit: z.object({
          photographer: z.string().optional(),
          platform: z.string().optional(),
        }).optional(),
        ogImage: image().optional(),
        tags: z.array(z.string()).optional(),
        // Only set when republishing from another platform (e.g. Medium).
        canonical: z.string().url().optional(),
      })
      .superRefine((data, ctx) => {
        // Either both hero images or neither — never just one.
        const hasHero = data.heroImage !== undefined;
        const hasHeroWide = data.heroImageWide !== undefined;
        if (hasHero && !hasHeroWide) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'heroImageWide is required when heroImage is set.',
            path: ['heroImageWide'],
          });
        }
        if (hasHeroWide && !hasHero) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'heroImage is required when heroImageWide is set.',
            path: ['heroImage'],
          });
        }
      }),
});

// ============================================================
// Authors
// JSON files — one per author. ID is the filename (without .json).
// ============================================================

const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      order: z.number().int().positive().optional(),
      bio: z.string().min(10),
      avatar: image(),
      social: z
        .object({
          linkedin: z.string().url().nullable().optional(),
          medium: z.string().url().nullable().optional(),
          instagram: z.string().url().nullable().optional(),
          website: z.string().url().nullable().optional(),
        })
        .optional(),
    }),
});

// ============================================================
// Services
// One MDX file per service. ID is the filename (without .mdx).
// ============================================================

const services = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Must match the filename. Case study `services` arrays validate against SERVICE_IDS.
      id: z.enum(SERVICE_IDS),
      order: z.number().int().positive(),
      summary: z.string(),
      heroImage: image().optional(),
      heroImageWide: image().optional(),
      photoCredit: z.string().optional(),
    }),
});

// ============================================================
// Industries
// One MDX file per industry vertical. ID is the filename (without .mdx)
// and must be one of INDUSTRY_IDS, so pages can filter case studies by it.
//
// These are business-development landing pages, linked from outbound
// outreach rather than site navigation. They are deliberately excluded
// from the sitemap (see astro.config.mjs) so that traffic is attributable.
// ============================================================

const industries = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/industries' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Must match the filename. Case studies carry a matching `industry` value.
      id: z.enum(INDUSTRY_IDS),
      summary: z.string(),
      // Client names to display as a credibility roster. Not all have case studies.
      clients: z.array(z.string()).min(1),
      // Headline above the booking CTA. Set per-industry so the wording can be
      // tuned to the vertical; templating it would force an article ("a"/"an")
      // that is wrong for vowel-initial names like AdTech.
      ctaHeadline: z.string().optional(),
      // Case study slugs (filenames without .mdx). When set, this list fully
      // determines what appears — auto-matching by `industry` is skipped.
      // A sales page needs to exclude as well as include: the industry tag is
      // broad enough that matching on it alone surfaces weak proof alongside
      // strong. Omit the field to fall back to auto-matching by tag.
      featuredCaseStudies: z.array(z.string()).optional(),
      heroImage: image().optional(),
      heroImageWide: image().optional(),
      photoCredit: z.string().optional(),
    }),
});

// ============================================================
// Export
// ============================================================

export const collections = { caseStudies, blog, authors, services, industries };
