/**
 * Velocity Profile — loading the Keystatic report copy.
 *
 * Separated from report.ts so that the report builder stays free of
 * `astro:content` and can be unit-tested. This module only runs inside Astro.
 */

import { getCollection } from 'astro:content';
import { ARCHETYPES, type ArchetypeTag } from '../../data/velocity-profile';
import type { ArchetypeContent } from './report';

/**
 * All five archetypes, keyed by tag.
 *
 * Throws rather than returning a partial map: a missing or duplicated tag
 * means somebody's report would render blank, and failing the build is far
 * cheaper than finding that out from a prospect.
 */
export async function getArchetypeContent(): Promise<Record<ArchetypeTag, ArchetypeContent>> {
  const entries = await getCollection('velocityArchetypes');
  const byTag = new Map<string, ArchetypeContent>();

  for (const entry of entries) {
    const { tag } = entry.data;
    if (byTag.has(tag)) {
      throw new Error(
        `[velocity-profile] Two archetype entries claim tag "${tag}". Each tag needs exactly one entry.`,
      );
    }
    byTag.set(tag, { ...entry.data, tag } as ArchetypeContent);
  }

  const missing = (Object.keys(ARCHETYPES) as ArchetypeTag[]).filter((tag) => !byTag.has(tag));
  if (missing.length) {
    throw new Error(
      `[velocity-profile] No archetype content for: ${missing.join(', ')}. ` +
        `Add an entry under src/content/velocityArchetypes/ for each.`,
    );
  }

  return Object.fromEntries(byTag) as Record<ArchetypeTag, ArchetypeContent>;
}

