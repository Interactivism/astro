/**
 * Content query helpers.
 * All pages that list content go through these — never bypass them.
 * Source of truth: CONTENT.md "Status, drafts, and scheduling".
 */
import { getCollection } from 'astro:content';

/**
 * Returns published, non-future-dated entries from a content collection,
 * sorted reverse-chronological by publishedDate.
 */
export async function getPublishedEntries(
  collection: 'blog' | 'caseStudies'
) {
  const all = await getCollection(collection);
  const now = new Date();
  return all
    .filter((entry) => entry.data.status === 'published')
    .filter((entry) => entry.data.publishedDate <= now)
    .sort(
      (a, b) =>
        b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf()
    );
}
