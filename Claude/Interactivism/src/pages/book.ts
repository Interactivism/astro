/**
 * /book — single entry point for every "Book a call" button.
 *
 * Redirects to whichever calendar is current. Rendered per request (not
 * prerendered) so an override period set in advance takes effect on its own,
 * without a deploy at the moment it starts or ends.
 *
 * `/book?debug` returns the decision as text instead of redirecting, for
 * checking an override without actually opening a booking page.
 */
import type { APIRoute } from 'astro';
import bookingData from '../data/booking.json';
import { resolveBooking, type BookingConfig } from '../lib/booking';

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  const target = resolveBooking(bookingData as BookingConfig);

  // Never cached: the whole point is that the answer changes over time, and a
  // cached 302 at the CDN or in a browser would outlive the override.
  const headers = {
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
    'X-Robots-Tag': 'noindex, nofollow',
  };

  if (url.searchParams.has('debug')) {
    const cfg = bookingData as BookingConfig;
    const period = cfg.scheduling?.discriminant === 'scheduled' ? cfg.scheduling.value : null;
    const tz = period?.timeZone ?? 'America/Los_Angeles';
    const now = new Date();
    const body = [
      `now (UTC):     ${now.toISOString()}`,
      `now (${tz}):   ${now.toLocaleString('en-US', { timeZone: tz })}`,
      `setting:       ${cfg.scheduling?.discriminant ?? '(unset)'}`,
      `override:      ${period ? `${period.start ?? '—'} to ${period.end ?? '—'}` : 'none'}`,
      '',
      `would send to ${target.who}: ${target.url}`,
      `reason:        ${target.reason}`,
    ].join('\n');
    return new Response(body, { status: 200, headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  // 302, not 301: a permanent redirect would be cached by browsers forever and
  // would keep sending people to the wrong calendar after the override ends.
  return new Response(null, { status: 302, headers: { ...headers, Location: target.url } });
};
