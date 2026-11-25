/**
 * Formatting for `publishedDate`, which is a calendar date, not an instant.
 *
 * Frontmatter carries `2026-11-24` — a day, with no time and no place. Zod's
 * `z.coerce.date()` hands that to `new Date()`, which reads a bare `YYYY-MM-DD`
 * as midnight UTC. Formatting that instant in the build machine's local zone
 * then walks it backwards anywhere west of Greenwich: midnight UTC on the 24th
 * is 4pm Pacific on the 23rd, so the post renders a day early.
 *
 * Fix the formatter, not the data. Pinning `timeZone: 'UTC'` reads the instant
 * back in the zone it was created in, which returns the calendar date the author
 * actually typed, on every machine, for every reader.
 *
 * Every surface that prints a published date goes through here. Three copies of
 * the options object drifted into the codebase before this existed, and all
 * three carried the same bug.
 */

const PUBLISHED_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
};

/** "November 24, 2026" — the date as written in frontmatter. */
export function formatPublishedDate(date: Date): string {
  return date.toLocaleDateString('en-US', PUBLISHED_DATE_FORMAT);
}
