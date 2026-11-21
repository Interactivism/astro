/**
 * Content integrity for the Velocity Profile archetypes.
 *
 * `getArchetypeContent()` throws at request time if a tag is missing or
 * duplicated, which protects the report page but only once someone has
 * already loaded a broken one. This reads the files directly so the same
 * mistake fails here first.
 *
 * Note: the Netlify build runs `npm run build`, not `npm test`, so this does
 * not currently gate a deploy. See the README.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ARCHETYPES, type ArchetypeTag } from '../../data/velocity-profile';

const here = dirname(fileURLToPath(import.meta.url));

const entries = readdirSync(here)
  .filter((name) => name.endsWith('.mdx'))
  .map((name) => {
    const source = readFileSync(join(here, name), 'utf8');
    const frontmatter = /^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? '';
    return {
      name,
      source,
      frontmatter,
      tag: /^tag:\s*([A-Z])\s*$/m.exec(frontmatter)?.[1] as ArchetypeTag | undefined,
    };
  });

describe('archetype content', () => {
  it('has exactly one entry per archetype', () => {
    const tags = entries.map((entry) => entry.tag);

    expect(tags.filter(Boolean)).toHaveLength(entries.length);
    expect(new Set(tags)).toEqual(new Set(Object.keys(ARCHETYPES)));
    expect(entries).toHaveLength(Object.keys(ARCHETYPES).length);
  });

  it('gives every entry the copy the report renders', () => {
    for (const entry of entries) {
      expect(entry.frontmatter, entry.name).toMatch(/strengthCopy:/);
      expect(entry.frontmatter, entry.name).toMatch(/failureModeCopy:/);
      // Three moves, each with a title and a body.
      expect(entry.frontmatter.match(/^\s+- title:/gm) ?? [], entry.name).toHaveLength(3);
      expect(entry.frontmatter.match(/^\s+body:/gm) ?? [], entry.name).toHaveLength(3);
    }
  });

  it('titles each entry with the archetype name from the config', () => {
    for (const entry of entries) {
      // Quoted or bare: Keystatic rewrites frontmatter in its own style on the
      // first save, and both forms are valid YAML.
      const title = /^title:\s*(.+)$/m
        .exec(entry.frontmatter)?.[1]
        .trim()
        .replace(/^["'](.*)["']$/, '$1');
      expect(title, entry.name).toBe(ARCHETYPES[entry.tag!].name);
    }
  });

  it('carries a draft flag the report can read', () => {
    // The copy was reviewed and approved, so these are all false now. The flag
    // stays in the schema: it is how a half-rewritten entry gets marked while
    // it is being worked on, and the report renders either way.
    for (const entry of entries) {
      expect(entry.frontmatter, entry.name).toMatch(/^draft:\s*(true|false)\s*$/m);
    }
  });

  it('keeps TODO markers out of the rendered fields', () => {
    for (const entry of entries) {
      expect(entry.frontmatter, `${entry.name} frontmatter`).not.toMatch(/TODO/);
    }
  });
});
