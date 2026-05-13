/**
 * Keystatic CMS configuration — local storage mode.
 *
 * Mirrors the content collection schemas in src/content.config.ts.
 * Source of truth for both is CONTENT.md — update that doc first,
 * then keep this file and content.config.ts in sync.
 *
 * Admin UI: http://localhost:4321/keystatic  (dev only in local mode)
 */
import { config, collection, fields } from '@keystatic/core';
import { block, wrapper } from '@keystatic/core/content-components';

// ============================================================
// Controlled vocabularies — must mirror content.config.ts
// ============================================================

const industryOptions = [
  { label: 'AdTech',              value: 'adtech' },
  { label: 'Aerospace & Defense', value: 'aerospace-defense' },
  { label: 'AI & Content',        value: 'ai-content' },
  { label: 'Consumer',            value: 'consumer' },
  { label: 'Enterprise SaaS',     value: 'enterprise-saas' },
  { label: 'Fintech',             value: 'fintech' },
  { label: 'MarTech',             value: 'martech' },
  { label: 'Media & Publishing',  value: 'media-publishing' },
  { label: 'Nonprofit & Civic',   value: 'nonprofit-civic' },
] as const;

const serviceOptions = [
  { label: 'Product Design',        value: 'product-design' },
  { label: 'Human + AI Experience', value: 'human-ai-experience' },
  { label: 'User Research',         value: 'user-research' },
  { label: 'Development',           value: 'development' },
  { label: 'Product Strategy',      value: 'product-strategy' },
  { label: 'Brand Development',     value: 'brand-development' },
] as const;

const deliverableOptions = [
  { label: 'Experience Strategy',       value: 'experience-strategy' },
  { label: 'Heuristic Evaluation',      value: 'heuristic-evaluation' },
  { label: 'Usability Assessment',      value: 'usability-assessment' },
  { label: 'Personas',                  value: 'personas' },
  { label: 'Information Architecture',  value: 'information-architecture' },
  { label: 'Brand Strategy',            value: 'brand-strategy' },
  { label: 'Brand Identity',            value: 'brand-identity' },
  { label: 'Positioning Framework',     value: 'positioning-framework' },
  { label: 'Messaging Framework',       value: 'messaging-framework' },
  { label: 'Print Collateral',          value: 'print-collateral' },
  { label: 'Illustration',              value: 'illustration' },
  { label: 'Animation',                 value: 'animation' },
  { label: 'Content Strategy',          value: 'content-strategy' },
  { label: 'UI/UX Design',              value: 'ui-ux-design' },
  { label: 'Design System',             value: 'design-system' },
  { label: 'Data Visualization',        value: 'data-visualization' },
  { label: 'Web Development',           value: 'web-development' },
  { label: 'Mobile App Development',    value: 'mobile-app-development' },
  { label: 'Futurecasting',             value: 'futurecasting' },
] as const;

// ============================================================
// Export
// ============================================================

export default config({
  storage: process.env.NODE_ENV === 'development'
    ? { kind: 'local' }
    : {
        kind: 'github',
        repo: {
          owner: 'Interactivism',
          name: 'astro',
        },
        // The git repo root is the home directory; the project lives two levels in.
        pathPrefix: 'Claude/Interactivism',
      },

  collections: {

    // ----------------------------------------------------------
    // Case Studies
    // Path: src/content/caseStudies/{slug}.mdx
    // Images: src/content/caseStudies/{slug}/{filename}
    // publicPath './' → getSrcPrefix gives './{slug}/' → no '..' traversal
    // ----------------------------------------------------------
    caseStudies: collection({
      label: 'Case Studies',
      slugField: 'title',
      path: 'src/content/caseStudies/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      previewUrl: '/preview/work/{slug}/',
      columns: ['client', 'lastUpdatedBy', 'status'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            validation: { isRequired: true },
          },
        }),
        client: fields.text({
          label: 'Client',
          validation: { isRequired: true },
        }),
        publishedDate: fields.date({
          label: 'Published Date',
          validation: { isRequired: true },
        }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          defaultValue: 'draft',
        }),
        lastUpdatedBy: fields.text({
          label: 'Last Updated By',
          description: 'Auto-stamped by git hook on commit (git config user.name). Do not edit manually.',
        }),
        lastUpdatedAt: fields.text({
          label: 'Last Updated At',
          description: 'ISO timestamp. Auto-stamped by git hook on commit. Do not edit manually.',
        }),
        summary: fields.text({
          label: 'Summary',
          description: '100–160 characters. Used for meta description and Work index cards.',
          multiline: true,
          validation: { isRequired: true, length: { min: 100, max: 160 } },
        }),

        // Images — co-located with the MDX file in src/content/caseStudies/{slug}/
        // publicPath '../' → getSrcPrefix gives '../{slug}/' so the stored value
        // '../{slug}/hero.jpg' resolves correctly from {slug}/index.mdx in Astro.
        heroImage: fields.image({
          label: 'Hero Image (16:9)',
          description: 'Mobile hero and Work index card. Source min 1920px wide. A placeholder is shown when omitted.',
          directory: 'src/content/caseStudies',
          publicPath: './',
        }),
        heroImageWide: fields.image({
          label: 'Hero Image Wide (4:1)',
          description: 'Desktop marquee. Source min 2400px wide. A placeholder is shown when omitted.',
          directory: 'src/content/caseStudies',
          publicPath: './',
        }),
        photoCredit: fields.object(
          {
            photographer: fields.text({
              label: 'Photographer name',
              description: 'Leave blank to hide the photo credit entirely.',
            }),
            photographerUrl: fields.text({
              label: 'Photographer URL',
              description: 'Link to the photographer\'s profile page.',
            }),
            platform: fields.text({
              label: 'Platform',
              description: 'e.g. "Unsplash". Leave blank to omit.',
            }),
            platformUrl: fields.text({
              label: 'Platform URL',
              description: 'Link to the specific photo on the platform.',
            }),
          },
          {
            label: 'Photo Credit',
            description: 'Renders as "Marquee photo by [name]" or "Marquee photo by [name] on [platform]".',
          }
        ),
        ogImage: fields.image({
          label: 'OG Image (optional)',
          description: '1200×630px. Falls back to the default OG image if omitted.',
          directory: 'src/content/caseStudies',
          publicPath: './',
        }),

        // Taxonomy
        industry: fields.select({
          label: 'Industry',
          options: industryOptions,
          defaultValue: 'consumer',
        }),
        services: fields.multiselect({
          label: 'Services',
          description: 'At least one required.',
          options: serviceOptions,
        }),
        year: fields.text({
          label: 'Start Year',
          description: '4-digit year, e.g. 2015',
          validation: { isRequired: true, length: { min: 4, max: 4 } },
        }),
        yearEnd: fields.text({
          label: 'End Year',
          description: 'Leave blank for single-year projects. Use a 4-digit year (e.g. 2023) or "present" for ongoing work.',
        }),

        // Deliverables
        deliverables: fields.multiselect({
          label: 'Deliverables',
          description: 'At least one required.',
          options: deliverableOptions,
        }),
        duration: fields.text({
          label: 'Duration',
          description: 'e.g. "5 months"',
        }),

        // Metrics
        metrics: fields.array(
          fields.object({
            value: fields.text({ label: 'Value', description: 'e.g. "40%"' }),
            label: fields.text({ label: 'Label', description: 'e.g. "reduction in onboarding drop-off"' }),
          }),
          {
            label: 'Metrics',
            description: '1–4 metrics. Omit entirely if none.',
            itemLabel: (props) => props.fields.value.value ?? 'Metric',
          }
        ),
        relatedCaseStudies: fields.array(
          fields.text({ label: 'Slug' }),
          {
            label: 'Related Case Studies',
            description: 'Slugs of related case studies. Max 2.',
          }
        ),
        gallery: fields.array(
          fields.object({
            image: fields.image({
              label: 'Image',
              directory: 'src/content/caseStudies',
              publicPath: './',
              validation: { isRequired: true },
            }),
            caption: fields.text({
              label: 'Caption',
              description: 'Optional. Shown below the slideshow.',
            }),
          }),
          {
            label: 'Gallery',
            description: 'Optional slideshow images.',
            itemLabel: (props) => props.fields.caption.value || 'Slide',
          }
        ),

        // Body
        content: fields.mdx({
          label: 'Content',
          components: {
            Slideshow: block({
              label: 'Slideshow',
              schema: {
                slides: fields.array(
                  fields.object({
                    image: fields.image({
                      label: 'Image',
                      directory: 'public/images/slideshows',
                      publicPath: '/images/slideshows/',
                    }),
                    caption: fields.text({ label: 'Caption' }),
                  }),
                  {
                    label: 'Slides',
                    itemLabel: (props) => props.fields.caption.value || 'Slide',
                  }
                ),
              },
            }),
            YouTube: block({
              label: 'YouTube',
              schema: {
                url: fields.text({
                  label: 'YouTube URL or Video ID',
                  validation: { isRequired: true },
                }),
                caption: fields.text({ label: 'Caption' }),
              },
            }),
            ImageWithCaption: block({
              label: 'Image with Caption',
              schema: {
                src: fields.image({
                  label: 'Image',
                  directory: 'src/content/caseStudies',
                  publicPath: './',
                  validation: { isRequired: true },
                }),
                alt: fields.text({ label: 'Alt text', validation: { isRequired: true } }),
                caption: fields.text({ label: 'Caption' }),
              },
            }),
            ImageGrid: wrapper({
              label: 'Image Grid',
              schema: {
                columns: fields.select({
                  label: 'Columns',
                  options: [
                    { label: '2 columns', value: '2' },
                    { label: '3 columns', value: '3' },
                  ],
                  defaultValue: '2',
                }),
              },
            }),
            BeforeAfter: block({
              label: 'Before / After',
              schema: {
                before: fields.image({
                  label: 'Before image',
                  directory: 'src/content/caseStudies',
                  publicPath: './',
                  validation: { isRequired: true },
                }),
                after: fields.image({
                  label: 'After image',
                  directory: 'src/content/caseStudies',
                  publicPath: './',
                  validation: { isRequired: true },
                }),
                alt: fields.text({ label: 'Alt text' }),
                beforeLabel: fields.text({ label: 'Before label', description: 'Defaults to "Before"' }),
                afterLabel: fields.text({ label: 'After label', description: 'Defaults to "After"' }),
              },
            }),
            PullQuote: wrapper({
              label: 'Pull Quote',
              schema: {
                author: fields.text({ label: 'Attribution', description: 'e.g. "Jane Doe, CEO of Acme". Optional.' }),
              },
            }),
            Aside: wrapper({
              label: 'Aside',
              schema: {},
            }),
          },
        }),
      },
    }),

    // ----------------------------------------------------------
    // Blog Posts
    // ----------------------------------------------------------
    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      previewUrl: '/preview/blog/{slug}/',
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            validation: { isRequired: true },
          },
        }),
        author: fields.relationship({
          label: 'Author',
          collection: 'authors',
          validation: { isRequired: true },
        }),
        publishedDate: fields.date({
          label: 'Published Date',
          validation: { isRequired: true },
        }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          defaultValue: 'draft',
        }),
        summary: fields.text({
          label: 'Summary',
          description: '100–200 characters.',
          multiline: true,
          validation: { isRequired: true, length: { min: 100, max: 200 } },
        }),
        heroImage: fields.image({
          label: 'Hero Image (16:9)',
          description: 'Optional. A placeholder is shown when omitted.',
          directory: 'src/content/blog',
          publicPath: '../../content/blog/',
        }),
        heroImageWide: fields.image({
          label: 'Hero Image Wide (4:1)',
          description: 'Required when Hero Image is set. A placeholder is shown when omitted.',
          directory: 'src/content/blog',
          publicPath: '../../content/blog/',
        }),
        photoCredit: fields.object(
          {
            photographer: fields.text({
              label: 'Photographer name',
              description: 'Leave blank to hide the photo credit entirely.',
            }),
            photographerUrl: fields.text({
              label: 'Photographer URL',
              description: 'Link to the photographer\'s profile page.',
            }),
            platform: fields.text({
              label: 'Platform',
              description: 'e.g. "Unsplash". Leave blank to omit.',
            }),
            platformUrl: fields.text({
              label: 'Platform URL',
              description: 'Link to the specific photo on the platform.',
            }),
          },
          {
            label: 'Photo Credit',
            description: 'Renders as "Marquee photo by [name]" or "Marquee photo by [name] on [platform]".',
          }
        ),
        ogImage: fields.image({
          label: 'OG Image (optional)',
          directory: 'src/content/blog',
          publicPath: '../../content/blog/',
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { label: 'Tags' }
        ),
        canonical: fields.url({
          label: 'Canonical URL',
          description: 'Only set when republishing from another platform (e.g. Medium).',
        }),
        content: fields.mdx({
          label: 'Content',
          components: {
            Slideshow: block({
              label: 'Slideshow',
              schema: {
                slides: fields.array(
                  fields.object({
                    image: fields.image({
                      label: 'Image',
                      directory: 'public/images/blog',
                      publicPath: '/images/blog/',
                    }),
                    caption: fields.text({ label: 'Caption' }),
                  }),
                  {
                    label: 'Slides',
                    itemLabel: (props) => props.fields.caption.value || 'Slide',
                  }
                ),
              },
            }),
            YouTube: block({
              label: 'YouTube',
              schema: {
                url: fields.text({
                  label: 'YouTube URL or Video ID',
                  validation: { isRequired: true },
                }),
                caption: fields.text({ label: 'Caption' }),
              },
            }),
            ImageWithCaption: block({
              label: 'Image with Caption',
              schema: {
                src: fields.image({
                  label: 'Image',
                  directory: 'src/content/blog',
                  publicPath: './',
                  validation: { isRequired: true },
                }),
                alt: fields.text({ label: 'Alt text', validation: { isRequired: true } }),
                caption: fields.text({ label: 'Caption' }),
              },
            }),
            ImageGrid: wrapper({
              label: 'Image Grid',
              schema: {
                columns: fields.select({
                  label: 'Columns',
                  options: [
                    { label: '2 columns', value: '2' },
                    { label: '3 columns', value: '3' },
                  ],
                  defaultValue: '2',
                }),
              },
            }),
            BeforeAfter: block({
              label: 'Before / After',
              schema: {
                before: fields.image({
                  label: 'Before image',
                  directory: 'src/content/blog',
                  publicPath: './',
                  validation: { isRequired: true },
                }),
                after: fields.image({
                  label: 'After image',
                  directory: 'src/content/blog',
                  publicPath: './',
                  validation: { isRequired: true },
                }),
                alt: fields.text({ label: 'Alt text' }),
                beforeLabel: fields.text({ label: 'Before label', description: 'Defaults to "Before"' }),
                afterLabel: fields.text({ label: 'After label', description: 'Defaults to "After"' }),
              },
            }),
            PullQuote: wrapper({
              label: 'Pull Quote',
              schema: {
                author: fields.text({ label: 'Attribution', description: 'e.g. "Jane Doe, CEO of Acme". Optional.' }),
              },
            }),
            Aside: wrapper({
              label: 'Aside',
              schema: {},
            }),
          },
        }),
      },
    }),

    // ----------------------------------------------------------
    // Authors
    // ----------------------------------------------------------
    authors: collection({
      label: 'Authors & Team',
      slugField: 'name',
      path: 'src/content/authors/*',
      format: 'json',
      schema: {
        name: fields.slug({
          name: {
            label: 'Name',
            validation: { isRequired: true },
          },
        }),
        role: fields.text({
          label: 'Role',
          validation: { isRequired: true },
        }),
        order: fields.integer({
          label: 'Display Order',
          description: 'Controls the order on the Team page. Lower numbers appear first.',
          validation: { isRequired: false, min: 1 },
        }),
        bio: fields.text({
          label: 'Bio',
          description: 'Full bio for the detail page. Index page shows the first 300 characters.',
          multiline: true,
          validation: { isRequired: true },
        }),
        avatar: fields.image({
          label: 'Avatar',
          description: '1:1 square. Min 400×400px.',
          directory: 'src/content/authors',
          publicPath: '../../content/authors/',
          validation: { isRequired: true },
        }),
        social: fields.object(
          {
            linkedin: fields.url({ label: 'LinkedIn' }),
            medium: fields.url({ label: 'Medium' }),
            instagram: fields.url({ label: 'Instagram' }),
            website: fields.url({ label: 'Website' }),
          },
          { label: 'Social Links' }
        ),
      },
    }),

    // ----------------------------------------------------------
    // Services
    // ----------------------------------------------------------
    services: collection({
      label: 'Services',
      slugField: 'title',
      path: 'src/content/services/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            validation: { isRequired: true },
          },
        }),
        id: fields.select({
          label: 'Service ID',
          description: 'Must match the filename.',
          options: serviceOptions,
          defaultValue: 'product-design',
        }),
        order: fields.integer({
          label: 'Display Order',
          validation: { isRequired: true, min: 1 },
        }),
        summary: fields.text({
          label: 'Summary',
          multiline: true,
          validation: { isRequired: true },
        }),
        content: fields.mdx({
          label: 'Content',
          components: {},
        }),
      },
    }),

  },
});
