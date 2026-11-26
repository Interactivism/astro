/**
 * A blog summary can carry one inline link to a section of its own post.
 *
 * The summary is a single Zod string that reaches five surfaces: the meta
 * description, the OG tag, the Article JSON-LD, the card on /blog, and the
 * paragraph under the title. Only the last one can hold a link — a `<a>` in a
 * meta description is markup in a text slot, and a link inside a BlogCard is a
 * link nested inside a link, which is invalid HTML.
 *
 * So the summary stays one plain string with markdown link syntax in it, and
 * each surface asks for the form it needs: `summaryToHtml` on the post page,
 * `summaryToText` everywhere else.
 *
 *   summary: "… Here are the five. [Which one is yours?](#which-one-is-yours)"
 *
 * **Fragments only.** The target must be `#some-id`, which is the whole point —
 * a jump to a heading in the same post. It also means `summaryToHtml` can never
 * emit a `javascript:` or off-site href, so the one place that renders this with
 * `set:html` cannot be turned into an injection by a CMS edit. Anything else is
 * left as literal text in both forms: visible and obviously wrong, rather than
 * silently dropped.
 *
 * Heading ids come from `rehype-slug` (see astro.config.mjs) — lowercased,
 * punctuation stripped, spaces to hyphens. "Which one is yours?" becomes
 * `which-one-is-yours`. Read the id off the rendered page rather than deriving
 * it by hand; a link to an id that does not exist fails silently.
 */

/** `[label](#fragment)` — fragment targets only, for the reason above. */
const SUMMARY_LINK = /\[([^\]\n]+)\]\((#[A-Za-z0-9_-]+)\)/g;

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ESCAPES[char]);
}

/**
 * The summary as plain text — link syntax flattened to its label.
 * For meta descriptions, OG tags, JSON-LD, and blog cards.
 */
export function summaryToText(summary: string): string {
  return summary.replace(SUMMARY_LINK, '$1');
}

/**
 * The summary as HTML, with fragment links rendered as anchors.
 * For the paragraph under the post title, via `set:html`.
 *
 * Escaping runs first and over the whole string, so any `<` an editor types
 * is inert before the link pattern is applied. The pattern survives escaping
 * untouched: brackets and parentheses are not escaped, and a label containing
 * an escaped entity still matches.
 *
 * Link classes follow DESIGN.md, "Inline links inside body or meta text": the
 * global `a` rule forces ink-900 at weight 500, so the color and weight of the
 * surrounding text have to be restated or the link renders darker and heavier
 * than the sentence it sits in.
 */
export function summaryToHtml(summary: string): string {
  return escapeHtml(summary).replace(
    SUMMARY_LINK,
    (_match, label: string, href: string) =>
      `<a href="${href}" class="text-body font-light underline decoration-accent decoration-2 underline-offset-4 hover:text-headline transition duration-fast">${label}</a>`,
  );
}
