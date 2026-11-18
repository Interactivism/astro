/**
 * Where the "Book a call" buttons send people.
 *
 * Config lives in `src/data/booking.json`, edited in Keystatic under
 * "Book a call". The default is Erik; an override either runs between two
 * dates or starts immediately.
 *
 * The override period is static — changing it needs a deploy — but the
 * comparison against "now" happens per request in `src/pages/book.ts`, so a
 * period set weeks ahead takes effect on its own with no deploy at the
 * boundary and nothing to remember.
 */

/** Matches Keystatic's `fields.conditional` serialization. */
export type Scheduling =
  | { discriminant: 'erik'; value?: unknown }
  | { discriminant: 'petra'; value?: unknown }
  | {
      discriminant: 'scheduled';
      value: {
        /** Local wall-clock, 'YYYY-MM-DDTHH:mm', read in `timeZone`. */
        start: string | null;
        end: string | null;
        timeZone: string;
      };
    };

export interface BookingConfig {
  scheduling: Scheduling;
  links: { erikUrl: string; petraUrl: string };
}

export interface BookingTarget {
  url: string;
  who: 'Erik' | 'Petra';
  /** Why this target was chosen — surfaced by /book?debug. */
  reason: string;
}

/**
 * How far `timeZone` is from UTC at a given instant, in milliseconds.
 * Derived from Intl rather than hardcoded, so DST is handled for free.
 */
function zoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);

  const n = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  // Intl renders midnight as hour 24 in some runtimes; normalize it.
  const asUtc = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour') % 24, n('minute'), n('second'));
  return asUtc - instant.getTime();
}

/**
 * Read a wall-clock string as an instant in `timeZone`.
 *
 * Two passes: the first guesses the offset from the naive instant, the second
 * re-reads it at the corrected instant. That second pass is what keeps the
 * hour right for a period starting within a day or so of a DST change.
 */
export function zonedToUtc(local: string, timeZone: string): Date | null {
  // Accept a bare date, 'YYYY-MM-DDTHH:mm', or the same with seconds.
  const m = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2})(:\d{2})?)?$/.exec(local.trim());
  if (!m) return null;
  const naive = Date.parse(`${m[1]}T${m[2] ?? '00:00'}${m[3] ?? ':00'}Z`);
  if (Number.isNaN(naive)) return null;

  let ts = naive - zoneOffsetMs(new Date(naive), timeZone);
  ts = naive - zoneOffsetMs(new Date(ts), timeZone);
  return new Date(ts);
}

/**
 * Resolve the booking target for a moment in time.
 *
 * Every failure path returns Erik: a scheduled override needs BOTH dates, in
 * the right order, both parseable. A half-finished or malformed edit degrades
 * to the normal state rather than stranding bookings on the wrong calendar.
 */
export function resolveBooking(config: BookingConfig, now: Date = new Date()): BookingTarget {
  const erik = (reason: string): BookingTarget => ({ url: config.links.erikUrl, who: 'Erik', reason });
  const petra = (reason: string): BookingTarget => ({ url: config.links.petraUrl, who: 'Petra', reason });

  const { scheduling } = config;

  if (scheduling?.discriminant === 'petra') return petra('override: set to Petra until changed back');
  if (scheduling?.discriminant !== 'scheduled') return erik('normal: no override set');

  const { start: startLocal, end: endLocal, timeZone } = scheduling.value ?? {};

  if (!startLocal || !endLocal) return erik('override ignored: both dates are required');

  const start = zonedToUtc(startLocal, timeZone);
  const end = zonedToUtc(endLocal, timeZone);

  if (!start || !end) return erik('override ignored: a date could not be read');
  if (end <= start) return erik('override ignored: it ends before it starts');

  if (now >= start && now < end) {
    return petra(`override active: ${startLocal} to ${endLocal} ${timeZone}`);
  }

  return erik(now < start ? 'override has not started yet' : 'override has ended');
}
