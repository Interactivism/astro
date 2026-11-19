/**
 * Keystatic CMS configuration — local storage mode.
 *
 * Mirrors the content collection schemas in src/content.config.ts.
 * Source of truth for both is CONTENT.md — update that doc first.
 * Controlled vocabularies are shared via src/lib/vocabularies.ts.
 *
 * Admin UI: http://localhost:4321/keystatic  (dev only in local mode)
 */
import { config, collection, singleton, fields } from '@keystatic/core';
import { block, wrapper } from '@keystatic/core/content-components';

// ============================================================
// Controlled vocabularies
// Defined once in src/lib/vocabularies.ts, which content.config.ts and the
// page templates read too. Add new values there, not here.
// ============================================================

import { industryOptions, serviceOptions, deliverableOptions } from './src/lib/vocabularies';
import {
  ARCHETYPES,
  INDUSTRY_NOTE_KEYS,
  LEAD_INDUSTRIES,
  OFFERINGS,
} from './src/data/velocity-profile';

// Velocity Profile option lists and field sets, generated from the config so
// the CMS cannot offer a tag, offering or industry that the code does not know.
const archetypeOptions = Object.entries(ARCHETYPES).map(([tag, meta]) => ({
  label: `${tag} — ${meta.name}`,
  value: tag,
}));

const industryNoteLabel = (key: string) =>
  LEAD_INDUSTRIES.find((i) => i.value === key)?.label ?? 'Everyone else';

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
            description: 'Max 80 characters.',
            validation: { isRequired: true, length: { max: 80 } },
          },
        }),
        client: fields.text({
          label: 'Client',
          validation: { isRequired: true },
        }),
        industry: fields.select({
          label: 'Industry',
          options: industryOptions,
          defaultValue: 'consumer',
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
            photographerUrl: fields.url({
              label: 'Photographer URL',
              description: 'Link to the photographer\'s profile page.',
            }),
            platform: fields.text({
              label: 'Platform',
              description: 'e.g. "Unsplash". Leave blank to omit.',
            }),
            platformUrl: fields.url({
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
            validation: { length: { max: 4 } },
          }
        ),
        relatedCaseStudies: fields.array(
          fields.text({ label: 'Slug' }),
          {
            label: 'Related Case Studies',
            description: 'Slugs of related case studies. Max 2.',
            validation: { length: { max: 2 } },
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
                  directory: 'public/images/before-after',
                  publicPath: '/images/before-after/',
                  validation: { isRequired: true },
                }),
                after: fields.image({
                  label: 'After image',
                  directory: 'public/images/before-after',
                  publicPath: '/images/before-after/',
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
            description: 'Max 100 characters.',
            validation: { isRequired: true, length: { max: 100 } },
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
            photographerUrl: fields.url({
              label: 'Photographer URL',
              description: 'Link to the photographer\'s profile page.',
            }),
            platform: fields.text({
              label: 'Platform',
              description: 'e.g. "Unsplash". Leave blank to omit.',
            }),
            platformUrl: fields.url({
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
                  directory: 'public/images/before-after',
                  publicPath: '/images/before-after/',
                  validation: { isRequired: true },
                }),
                after: fields.image({
                  label: 'After image',
                  directory: 'public/images/before-after',
                  publicPath: '/images/before-after/',
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
        // Marquee images live in a per-entry subdirectory, which fields.image
        // cannot express. They must still be declared, or Keystatic refuses to
        // open the entry at all — fields.ignored passes the paths through
        // untouched without trying to manage the files.
        heroImage: fields.ignored(),
        heroImageWide: fields.ignored(),
        photoCredit: fields.text({
          label: 'Photo credit',
          description: 'HTML. e.g. Marquee photo by <a href="...">Name</a> on <a href="...">Unsplash</a>',
          multiline: true,
        }),
        content: fields.mdx({
          label: 'Content',
          components: {},
        }),
      },
    }),

    // ----------------------------------------------------------
    // Industries — outbound BD landing pages
    // ----------------------------------------------------------
    industries: collection({
      label: 'Industries',
      slugField: 'title',
      path: 'src/content/industries/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      previewUrl: '/industries/{slug}/',
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'Display name, e.g. "AdTech". The slug must match the filename.',
            validation: { isRequired: true },
          },
        }),
        id: fields.select({
          label: 'Industry ID',
          description: 'Must match the filename and the tag used on case studies.',
          options: industryOptions,
          defaultValue: 'adtech',
        }),
        summary: fields.text({
          label: 'Summary',
          description: 'Sits under the page title and doubles as the meta description.',
          multiline: true,
          validation: { isRequired: true },
        }),
        // See the note on the services collection above.
        heroImage: fields.ignored(),
        heroImageWide: fields.ignored(),
        photoCredit: fields.text({
          label: 'Photo credit',
          description: 'HTML. e.g. Marquee photo by <a href="...">Name</a> on <a href="...">Unsplash</a>',
          multiline: true,
        }),
        ctaHeadline: fields.text({
          label: 'CTA headline',
          description: 'Above the booking button. Defaults to "Let\'s talk about your <Title> product." Set it per industry so the wording reads naturally — a generic template forces an article that is wrong for vowel-initial names like AdTech.',
        }),
        featuredCaseStudies: fields.array(
          fields.relationship({
            label: 'Case study',
            collection: 'caseStudies',
            validation: { isRequired: true },
          }),
          {
            label: 'Featured Case Studies',
            description: 'Replaces auto-matching entirely — leave empty to fall back to every case study tagged with this industry. Use it to exclude weakly-related work carrying the same tag.',
            itemLabel: (props) => props.value ?? 'Case study',
            validation: { length: { max: 6 } },
          }
        ),
        clients: fields.array(
          fields.text({ label: 'Client name' }),
          {
            label: 'Clients',
            description: 'Roster shown near the top of the page. At least one required.',
            itemLabel: (props) => props.value || 'Client',
            validation: { length: { min: 1 } },
          }
        ),
        content: fields.mdx({
          label: 'Content',
          components: {},
        }),
      },
    }),

    // ----------------------------------------------------------
    // Velocity Profile archetypes — report copy for each of the five.
    //
    // Only the prose lives here. Names, teaser lines and the scoring tags are
    // in src/data/velocity-profile.ts and are not editable, because the
    // scoring depends on them.
    // ----------------------------------------------------------
    velocityArchetypes: collection({
      label: 'Velocity Profile — Archetypes',
      slugField: 'title',
      path: 'src/content/velocityArchetypes/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'The archetype name, e.g. "Feature Factory".',
            validation: { isRequired: true },
          },
        }),
        tag: fields.select({
          label: 'Archetype',
          description: 'Which archetype this copy belongs to. Exactly one entry per archetype.',
          options: archetypeOptions,
          defaultValue: 'F',
        }),
        strengthCopy: fields.text({
          label: 'What they are good at',
          description: 'Two sentences. Opens the report, so it should land as recognition, not flattery.',
          multiline: true,
          validation: { isRequired: true },
        }),
        failureModeCopy: fields.text({
          label: 'The failure mode',
          description: 'Where this archetype breaks down. The report quotes their own answers back underneath this.',
          multiline: true,
          validation: { isRequired: true },
        }),
        moves: fields.array(
          fields.object({
            title: fields.text({ label: 'Move', validation: { isRequired: true } }),
            body: fields.text({ label: 'What it means', multiline: true, validation: { isRequired: true } }),
          }),
          {
            label: 'Three moves',
            description: 'Exactly three. Each must be useful without hiring us — that is what makes the report worth forwarding.',
            itemLabel: (props) => props.fields.title.value || 'Move',
            validation: { length: { min: 3, max: 3 } },
          },
        ),
        caseStudy: fields.relationship({
          label: 'Case study',
          collection: 'caseStudies',
          description: 'Proof shown beside the offering. Leave empty until you have picked one.',
        }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Draft copy still shows in the report — this flag only marks it as unreviewed.',
          defaultValue: true,
        }),
        content: fields.mdx({
          label: 'Notes',
          description: 'Not rendered. Scratch space for rationale.',
          components: {},
        }),
      },
    }),

  },

  singletons: {

    // ----------------------------------------------------------
    // Book a call — where the CTA buttons send people.
    //
    // The override period is static and changing it needs a deploy, but
    // /book compares it against the current time on every request. Dates set
    // weeks ahead therefore take effect on their own. Saving here commits to
    // main and triggers a build that publishes the dates; that build does not
    // perform the switch.
    // ----------------------------------------------------------
    booking: singleton({
      label: 'Book a call',
      path: 'src/data/booking',
      format: { data: 'json' },
      schema: {

        // Conditional rather than a flat select plus always-visible dates:
        // the date fields appear only when an override is actually being
        // scheduled, so the normal state is unambiguous on screen.
        scheduling: fields.conditional(
          fields.select({
            label: 'Where the “Book a call” buttons go',
            description:
              'Normally every “Book a call” button on the site opens Erik’s scheduling page. Pick an override only when that should change.',
            options: [
              { label: 'Erik — normal', value: 'erik' },
              { label: 'Petra — between two dates you choose', value: 'scheduled' },
              { label: 'Petra — starting now, until you set this back', value: 'petra' },
            ],
            defaultValue: 'erik',
          }),
          {
            erik: fields.empty(),
            petra: fields.empty(),
            scheduled: fields.object(
              {
                start: fields.datetime({
                  label: 'Switch to Petra at',
                  description: 'Up until this moment, buttons still go to Erik.',
                }),
                end: fields.datetime({
                  label: 'Switch back to Erik at',
                  description: 'From this moment on, buttons go to Erik again.',
                }),
                timeZone: fields.text({
                  label: 'Time zone for both dates',
                  description: 'IANA name. Leave as America/Los_Angeles unless you are setting these from another time zone.',
                  defaultValue: 'America/Los_Angeles',
                  validation: { isRequired: true },
                }),
              },
              {
                label: 'Override period',
                description:
                  'Both dates are required. If either is missing the override is ignored and buttons keep going to Erik.',
              },
            ),
          },
        ),

        links: fields.object(
          {
            erikUrl: fields.url({
              label: 'Erik’s scheduling page',
              validation: { isRequired: true },
            }),
            petraUrl: fields.url({
              label: 'Petra’s scheduling page',
              validation: { isRequired: true },
            }),
          },
          {
            label: 'Scheduling pages',
            description: 'The two Google Calendar booking links. These rarely change.',
          },
        ),

      },
    }),

    // ----------------------------------------------------------
    // Velocity Profile report — the copy that is not per-archetype.
    //
    // Both field sets are generated from src/data/velocity-profile.ts, so a
    // new offering or industry note appears here automatically and a removed
    // one disappears.
    // ----------------------------------------------------------
    velocityReport: singleton({
      label: 'Velocity Profile — Report copy',
      path: 'src/data/velocity-report',
      format: { data: 'json' },
      schema: {
        intro: fields.text({
          label: 'Report intro',
          description: 'One or two sentences at the top, above the archetype.',
          multiline: true,
        }),
        industryNotes: fields.object(
          Object.fromEntries(
            INDUSTRY_NOTE_KEYS.map((key) => [
              key,
              fields.text({
                label: industryNoteLabel(key),
                description:
                  key === 'other'
                    ? 'Shown to every industry without its own note.'
                    : `Shown when the respondent selects ${industryNoteLabel(key)}.`,
                multiline: true,
                validation: { isRequired: true },
              }),
            ]),
          ),
          {
            label: 'Industry notes',
            description: 'One paragraph each. Generated from the industries the quiz scores.',
          },
        ),
        offerings: fields.object(
          Object.fromEntries(
            Object.entries(OFFERINGS).map(([key, name]) => [
              key,
              fields.text({
                label: name,
                description: `Shown when their one thing to fix maps to ${name}.`,
                multiline: true,
                validation: { isRequired: true },
              }),
            ]),
          ),
          {
            label: 'Offerings',
            description: 'One paragraph each, chosen by the respondent\u2019s Q12 answer.',
          },
        ),
        assumptions: fields.text({
          label: 'Cost assumptions',
          description: 'Shown under every dollar figure. The numbers themselves are filled in automatically.',
          multiline: true,
          validation: { isRequired: true },
        }),
        unmeasuredNote: fields.text({
          label: 'Note for "Not sure" on rework',
          description: 'Replaces the range with a single figure and this note.',
          multiline: true,
          validation: { isRequired: true },
        }),
      },
    }),

  },
});
