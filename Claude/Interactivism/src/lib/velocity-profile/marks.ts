/**
 * Velocity Profile — archetype marks.
 *
 * One geometric composition per archetype, drawn rather than illustrated: the
 * site has no illustration language, and five drawn characters would have
 * invented one by accident. These are built from the same vocabulary as the
 * rest of the site — paper, ink, the brand yellow, a single stroke weight —
 * so they read as a set and as ours.
 *
 * Each one says something about the failure mode, not the name:
 *   F  identical units marching off the edge — output without end
 *   C  a ring of equals around an empty center — nobody at the middle
 *   E  a precise lattice with the top course missing — solid, unfinished
 *   S  a shape pulled out of true by one outsized force
 *   X  scattered sparks, every one of them urgent
 *
 * SERVER ONLY. This module is keyed by archetype tag, so it must never be
 * imported into client code — see the containment note in the quiz page. The
 * teaser endpoint sends the rendered markup for the one archetype a visitor
 * resolved to, never the map.
 *
 * `currentColor` is deliberate: the stroke follows the surrounding text color,
 * so a mark works on paper and on the accent band without a second copy.
 */

import type { ArchetypeTag } from '../../data/velocity-profile';

const ACCENT = '#F2DB07';

/** 120×120, 3px strokes, round caps. Scaled by the consumer, never by itself. */
const frame = (body: string): string =>
  `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

export const ARCHETYPE_MARKS: Record<ArchetypeTag, string> = {
  // Four identical units in step, the fifth already past the edge.
  F: frame(
    `<rect x="6" y="40" width="26" height="26" fill="${ACCENT}" />` +
      `<rect x="38" y="40" width="26" height="26" fill="${ACCENT}" />` +
      `<rect x="70" y="40" width="26" height="26" fill="${ACCENT}" />` +
      `<path d="M102 40h12v26h-12" />` +
      `<path d="M6 80h108" stroke-dasharray="2 10" />`,
  ),

  // Five equal circles in a ring. The center is marked and empty.
  C: frame(
    `<circle cx="60" cy="22" r="13" fill="${ACCENT}" />` +
      `<circle cx="96" cy="48" r="13" fill="${ACCENT}" />` +
      `<circle cx="82" cy="92" r="13" fill="${ACCENT}" />` +
      `<circle cx="38" cy="92" r="13" fill="${ACCENT}" />` +
      `<circle cx="24" cy="48" r="13" fill="${ACCENT}" />` +
      `<path d="M54 60h12M60 54v12" stroke-dasharray="3 5" />`,
  ),

  // A lattice, built true, with the top course never laid.
  E: frame(
    `<rect x="18" y="66" width="36" height="22" fill="${ACCENT}" />` +
      `<rect x="66" y="66" width="36" height="22" fill="${ACCENT}" />` +
      `<rect x="42" y="92" width="36" height="22" fill="${ACCENT}" />` +
      `<rect x="18" y="92" width="18" height="22" />` +
      `<rect x="84" y="92" width="18" height="22" />` +
      // The course that was never laid, drawn as the blocks it would have
      // been. Dashed lines read as dust at this size; ghost blocks read as
      // something missing.
      `<rect x="18" y="40" width="36" height="22" stroke-dasharray="4 6" />` +
      `<rect x="66" y="40" width="36" height="22" stroke-dasharray="4 6" />`,
  ),

  // A square pulled out of true toward one corner.
  S: frame(
    `<path d="M20 24h52l26 30-30 46H20z" fill="${ACCENT}" />` +
      `<path d="M72 24l34-8" />` +
      `<circle cx="110" cy="14" r="6" fill="currentColor" stroke="none" />`,
  ),

  // Sparks, all of them demanding attention at once.
  X: frame(
    `<path d="M34 18v16M26 26h16" />` +
      `<path d="M92 40v18M83 49h18" />` +
      `<path d="M30 76v14M23 83h14" />` +
      `<path d="M74 92v16M66 100h16" />` +
      `<circle cx="60" cy="56" r="16" fill="${ACCENT}" />` +
      `<path d="M60 48v10M60 64v.5" stroke-width="4" />`,
  ),
};

export function markFor(tag: ArchetypeTag): string {
  return ARCHETYPE_MARKS[tag];
}
