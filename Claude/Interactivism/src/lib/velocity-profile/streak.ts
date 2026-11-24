/**
 * Velocity Profile — the "with a … streak" phrase.
 *
 * One place for it because the article depends on the name: "a Committee
 * streak", but "an Engineering-Led streak". Imports nothing, so the quiz
 * page's client script can use it without pulling in server-only config.
 */

/** "a" or "an", by the first letter. Enough for archetype names; not general English. */
export function article(name: string): 'a' | 'an' {
  return /^[aeiou]/i.test(name.trim()) ? 'an' : 'a';
}

/** e.g. "with an Engineering-Led streak". */
export function streakPhrase(secondaryName: string): string {
  return `with ${article(secondaryName)} ${secondaryName} streak`;
}
