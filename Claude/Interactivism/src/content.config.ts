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
] as const;

// ============================================================
// Case Studies
// ============================================================

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/caseStudies' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(80),
      client: z.string(),
      publishedDate: z.coerce.date(),
      status: z.enum(['draft', 'published']),
      summary: z.string().min(100).max(160),
      heroImage: image(),
      heroImageWide: image(),
      ogImage: image().optional(),
      services: z.array(z.enum(SERVICE_IDS)).min(1),
      industry: z.enum(INDUSTRY_IDS),
      year: z.number().int().positive(),
      role: z.string(),
      duration: z.string().optional(),
      // If present: 1–4 entries. Omit entirely when there are no metrics;
      // don't pass an empty array (enforced by .min(1)).
      metrics: z
        .array(
          z.object({
            value: z.string(),
            label: z.string(),
          })
        )
        .min(1)
        .max(4)
        .optional(),
      relatedCaseStudies: z.array(z.string()).max(2).optional(),
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
      // Must match the filename. Validated by convention; enforce in CI if needed.
      id: z.string(),
      name: z.string(),
      role: z.string(),
      bio: z.string().min(200).max(400),
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
    }),
});

// ============================================================
// Export
// ============================================================

export const collections = { caseStudies, blog, authors, services };
