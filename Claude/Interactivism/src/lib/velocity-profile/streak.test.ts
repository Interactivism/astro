/**
 * The streak phrase: the article has to agree with the archetype name.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ARCHETYPES } from '../../data/velocity-profile';
import { article, streakPhrase } from './streak';

describe('streakPhrase', () => {
  it('uses "an" before a vowel and "a" otherwise, for every archetype name', () => {
    for (const { name } of Object.values(ARCHETYPES)) {
      const expected = /^[aeiou]/i.test(name) ? 'an' : 'a';
      expect(article(name)).toBe(expected);
      expect(streakPhrase(name)).toBe(`with ${expected} ${name} streak`);
    }
  });

  it('covers both articles with the real names', () => {
    const articles = new Set(Object.values(ARCHETYPES).map(({ name }) => article(name)));
    expect(articles).toEqual(new Set(['a', 'an']));
    expect(streakPhrase('Engineering-Led')).toBe('with an Engineering-Led streak');
    expect(streakPhrase('Committee')).toBe('with a Committee streak');
  });

  it('is the only place the phrase is written', () => {
    const src = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return files(path);
        return /\.(ts|astro)$/.test(name) && !/\.test\.ts$/.test(name) && name !== 'streak.ts' ? [path] : [];
      });

    const found = files(src);
    expect(found.length).toBeGreaterThan(0);
    for (const file of found) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/with an? [^\n]{0,60} streak/);
    }
  });
});
