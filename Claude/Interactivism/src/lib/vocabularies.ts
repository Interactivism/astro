/**
 * Controlled vocabularies — the single source of truth for industries,
 * services and deliverables.
 *
 * Source of truth for the *content* of these lists is CONTENT.md. This file is
 * where that spec is expressed once in code; everything else derives from it:
 *
 *   src/content.config.ts   → the ID tuples, for the Zod enums
 *   keystatic.config.ts     → the option arrays, for the CMS selects
 *   page templates          → the label maps, for display
 *
 * Adding a value means editing one array here, and the ID, the CMS option and
 * the display label all follow. Before this existed the same lists were
 * hand-copied into six places, and they had already drifted: the deliverable
 * `mobile-app-development` was missing from the live case study template, so
 * four published case studies rendered the raw slug in their sidebar while the
 * preview template showed it correctly.
 *
 * Deliberately free of imports. This is pulled into both the Astro content
 * layer and the Keystatic config, so it must stay a plain module.
 */

interface Term {
  readonly value: string;
  readonly label: string;
}

/** Alphabetical — Keystatic renders this order in its select. */
export const INDUSTRIES = [
  { value: 'adtech', label: 'AdTech' },
  { value: 'aerospace-defense', label: 'Aerospace & Defense' },
  { value: 'ai-content', label: 'AI & Content' },
  { value: 'consumer', label: 'Consumer' },
  { value: 'enterprise-saas', label: 'Enterprise SaaS' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'martech', label: 'MarTech' },
  { value: 'media-publishing', label: 'Media & Publishing' },
  { value: 'nonprofit-civic', label: 'Nonprofit & Civic' },
] as const satisfies readonly Term[];

/** Ordered as the services are presented on the site, not alphabetically. */
export const SERVICES = [
  { value: 'product-design', label: 'Product Design' },
  { value: 'human-ai-experience', label: 'Human + AI Experience' },
  { value: 'user-research', label: 'User Research' },
  { value: 'development', label: 'Development' },
  { value: 'product-strategy', label: 'Product Strategy' },
  { value: 'brand-development', label: 'Brand Development' },
] as const satisfies readonly Term[];

/** Grouped roughly by discipline: research, brand, content, design, build. */
export const DELIVERABLES = [
  { value: 'experience-strategy', label: 'Experience Strategy' },
  { value: 'heuristic-evaluation', label: 'Heuristic Evaluation' },
  { value: 'usability-assessment', label: 'Usability Assessment' },
  { value: 'personas', label: 'Personas' },
  { value: 'information-architecture', label: 'Information Architecture' },
  { value: 'brand-strategy', label: 'Brand Strategy' },
  { value: 'brand-identity', label: 'Brand Identity' },
  { value: 'positioning-framework', label: 'Positioning Framework' },
  { value: 'messaging-framework', label: 'Messaging Framework' },
  { value: 'print-collateral', label: 'Print Collateral' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'animation', label: 'Animation' },
  { value: 'content-strategy', label: 'Content Strategy' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'design-system', label: 'Design System' },
  { value: 'data-visualization', label: 'Data Visualization' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-app-development', label: 'Mobile App Development' },
  { value: 'futurecasting', label: 'Futurecasting' },
] as const satisfies readonly Term[];

export type IndustryId = (typeof INDUSTRIES)[number]['value'];
export type ServiceId = (typeof SERVICES)[number]['value'];
export type DeliverableId = (typeof DELIVERABLES)[number]['value'];

/**
 * `z.enum()` needs a non-empty readonly tuple to produce a literal union, and
 * `.map()` widens to `string[]`. The assertion restores the literal types that
 * the `as const` above already guarantees.
 */
const ids = <T extends readonly Term[]>(terms: T) =>
  terms.map((t) => t.value) as unknown as readonly [T[number]['value'], ...T[number]['value'][]];

const labels = <T extends readonly Term[]>(terms: T) =>
  Object.fromEntries(terms.map((t) => [t.value, t.label])) as Record<T[number]['value'], string>;

/** For the Zod enums in src/content.config.ts. */
export const INDUSTRY_IDS = ids(INDUSTRIES);
export const SERVICE_IDS = ids(SERVICES);
export const DELIVERABLE_IDS = ids(DELIVERABLES);

/** For display in page templates. */
export const INDUSTRY_LABELS = labels(INDUSTRIES);
export const SERVICE_LABELS = labels(SERVICES);
export const DELIVERABLE_LABELS = labels(DELIVERABLES);

/** For the `fields.select` / `fields.multiselect` options in keystatic.config.ts. */
export const industryOptions = INDUSTRIES as readonly Term[] as { label: string; value: IndustryId }[];
export const serviceOptions = SERVICES as readonly Term[] as { label: string; value: ServiceId }[];
export const deliverableOptions = DELIVERABLES as readonly Term[] as { label: string; value: DeliverableId }[];
