/**
 * The regression this guards: a post dated 2026-11-24 rendered as
 * "November 23, 2026" on a Pacific machine, because a bare `YYYY-MM-DD` parses
 * as midnight UTC and was being formatted in local time.
 *
 * `process.env.TZ` is set per-case rather than globally, so this fails on CI in
 * UTC as readily as on a laptop in Los Angeles. `Intl` caches formatters by
 * zone, so each case builds its own via the function under test.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { formatPublishedDate } from './publishedDate';

const originalTZ = process.env.TZ;

afterEach(() => {
  process.env.TZ = originalTZ;
});

describe('formatPublishedDate', () => {
  it('returns the frontmatter date west of UTC, where the old code lost a day', () => {
    process.env.TZ = 'America/Los_Angeles';
    expect(formatPublishedDate(new Date('2026-11-24'))).toBe('November 24, 2026');
  });

  it('returns the frontmatter date east of UTC', () => {
    process.env.TZ = 'Asia/Tokyo';
    expect(formatPublishedDate(new Date('2026-11-24'))).toBe('November 24, 2026');
  });

  it('returns the frontmatter date in UTC', () => {
    process.env.TZ = 'UTC';
    expect(formatPublishedDate(new Date('2026-11-24'))).toBe('November 24, 2026');
  });

  it('holds across a year boundary, the worst case for an off-by-one day', () => {
    process.env.TZ = 'America/Los_Angeles';
    expect(formatPublishedDate(new Date('2024-01-01'))).toBe('January 1, 2024');
  });
});
