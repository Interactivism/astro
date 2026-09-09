import type { CollectionEntry } from 'astro:content';

type CaseStudy = CollectionEntry<'caseStudies'>;
type Industry = CollectionEntry<'industries'>;

/** Maximum cards shown on an industry page. Headroom above the current four,
 *  so adding a featured entry does not silently drop another off the end. */
const MAX_RELATED = 6;

const sortYear = (cs: CaseStudy) =>
  cs.data.yearEnd === 'present' ? Infinity : (cs.data.yearEnd ?? cs.data.year);

/**
 * The ordered case studies an industry page shows.
 *
 * Shared by the industry page itself and by /work/[slug], which needs the
 * identical list to scope its prev/next navigation to the vertical a visitor
 * arrived from. Keeping one implementation means the two cannot drift.
 *
 * An explicit `featuredCaseStudies` list replaces auto-matching by tag rather
 * than extending it, so a page can exclude weakly-related work carrying the
 * same industry tag. Unknown slugs throw rather than vanishing silently.
 */
export function selectIndustryCaseStudies(
  industry: Industry,
  allCaseStudies: CaseStudy[],
  now: Date = new Date(),
): CaseStudy[] {
  const isLive = (cs: CaseStudy) =>
    cs.data.status === 'published' && cs.data.publishedDate <= now;

  const featured = (industry.data.featuredCaseStudies ?? []).map((slug) => {
    const match = allCaseStudies.find((cs) => cs.id === slug);
    if (!match) {
      throw new Error(
        `industries/${industry.id}: featuredCaseStudies references "${slug}", which is not a case study.`,
      );
    }
    return match;
  });

  const selected = featured.length > 0
    ? featured
    : allCaseStudies.filter((cs) => cs.data.industry === industry.id);

  const deduped = new Map(selected.filter(isLive).map((cs) => [cs.id, cs]));
  return [...deduped.values()]
    .sort((a, b) => sortYear(b) - sortYear(a))
    .slice(0, MAX_RELATED);
}
