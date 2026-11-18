/**
 * Which calendar a "Book a call" button sends someone to.
 *
 * The config lives in `src/data/booking.json` and is editable in Keystatic
 * under "Book a call". The *window* is static — changing it needs a deploy —
 * but the comparison against "now" happens per request in `src/pages/book.ts`,
 * so a window set in advance flips on its own at the right moment with no
 * deploy and nothing to remember.
 */

export type BookingMode = 'auto' | 'erik' | 'petra';

export interface BookingConfig {
  mode: BookingMode;
  erikUrl: string;
  petraUrl: string;
  /** Local wall-clock time, 'YYYY-MM-DDTHH:mm', read in `timeZone`. */
  coverStart: string | null;
  coverEnd: string | null;
  /** IANA zone the two values above are written in. */
  timeZone: string;
}

export interface BookingTarget {
  url: string;
  who: 'Erik' | 'Petra';
  /** Why this target was chosen — surfaced in the endpoint's debug output. */
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
 * hour right for a window that starts within a day or so of a DST change.
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
 * `auto` needs BOTH ends of the window. A half-set window is treated as no
 * window at all and falls back to Erik, so a half-finished edit can never
 * strand bookings on the wrong calendar indefinitely.
 */
export function resolveBooking(config: BookingConfig, now: Date = new Date()): BookingTarget {
  const erik: BookingTarget = { url: config.erikUrl, who: 'Erik', reason: 'default' };
  const petra: BookingTarget = { url: config.petraUrl, who: 'Petra', reason: 'manual override' };

  if (config.mode === 'erik') return { ...erik, reason: 'manual override' };
  if (config.mode === 'petra') return petra;

  if (!config.coverStart || !config.coverEnd) {
    return { ...erik, reason: 'no cover window set' };
  }

  const start = zonedToUtc(config.coverStart, config.timeZone);
  const end = zonedToUtc(config.coverEnd, config.timeZone);

  if (!start || !end) return { ...erik, reason: 'cover window could not be parsed' };
  if (end <= start) return { ...erik, reason: 'cover window ends before it starts' };

  if (now >= start && now < end) {
    return { ...petra, reason: `inside cover window (${config.coverStart} to ${config.coverEnd} ${config.timeZone})` };
  }

  return { ...erik, reason: now < start ? 'before cover window' : 'after cover window' };
}
