import { describe, it, expect } from 'vitest';
import { ARCHETYPE_MARKS, markFor } from './marks';
import { ARCHETYPE_TAGS, ARCHETYPES } from '../../data/velocity-profile';

describe('archetype marks', () => {
  it('has exactly one mark per archetype, and no extras', () => {
    expect(new Set(Object.keys(ARCHETYPE_MARKS))).toEqual(new Set(ARCHETYPE_TAGS));
  });

  it('returns well-formed, self-contained SVG', () => {
    for (const tag of ARCHETYPE_TAGS) {
      const mark = markFor(tag);
      expect(mark.startsWith('<svg'), tag).toBe(true);
      expect(mark.endsWith('</svg>'), tag).toBe(true);
      // Same box for all five, so they line up wherever they are placed.
      expect(mark, tag).toContain('viewBox="0 0 120 120"');
      // Decorative: the name beside it carries the meaning.
      expect(mark, tag).toContain('aria-hidden="true"');
    }
  });

  it('carries no tag or archetype name in the markup', () => {
    // These go out over the wire to the browser, one at a time. A tag or a
    // name embedded as an id or a class would undo the containment the teaser
    // endpoint exists to provide.
    for (const tag of ARCHETYPE_TAGS) {
      const mark = markFor(tag);
      expect(mark, tag).not.toMatch(/\bid=|\bclass=/);
      for (const other of ARCHETYPE_TAGS) {
        expect(mark.includes(ARCHETYPES[other].name), `${tag} contains ${other} name`).toBe(false);
      }
    }
  });

  it('draws something distinct for each archetype', () => {
    expect(new Set(Object.values(ARCHETYPE_MARKS)).size).toBe(ARCHETYPE_TAGS.length);
  });
});

describe('persona descriptors', () => {
  it('gives every archetype one short line', () => {
    for (const tag of ARCHETYPE_TAGS) {
      const { descriptor } = ARCHETYPES[tag];
      expect(descriptor, tag).toBeTruthy();
      // It sits under the name like a job title. A sentence is too long, and
      // the email lowercases it mid-sentence, so it must not end in a period.
      expect(descriptor.length, tag).toBeLessThan(60);
      expect(descriptor.endsWith('.'), tag).toBe(false);
    }
  });
});
