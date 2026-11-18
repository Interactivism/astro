# Working in this repo

Marketing site for Interactivism. Astro 5 + Tailwind + Keystatic, deployed to Netlify.

## Read before you work

| Doc | Owns |
|---|---|
| **PROJECT.md** | Intent, IA, URL strategy and redirects, structured data and discoverability |
| **DESIGN.md** | Every visual decision — tokens, components, page patterns |
| **CONTENT.md** | Content schemas, controlled vocabularies, what to write |
| **SCHEMA.md** | Astro ↔ Keystatic mapping, validation rules, implementation notes |

If a pattern you need doesn't exist, add it to the owning doc in the same commit that implements it.

## Rules that are easy to get wrong

**The git repo root is the user's home directory, not this folder.** Paths in git output carry a `Claude/Interactivism/` prefix, and `git show <sha>:<path>` needs it. Never run `git add .` or `git add -A` — stage named files only, or you will commit unrelated parts of the home directory.

**Don't deploy unless asked.** Build and verify locally, then stop. Pushing to `main` publishes to production immediately. Keystatic in production also commits to `main`, so local can fall behind without warning — check before assuming.

**The Kratos case study is archived and must not be published.** The client declined publication. It lives in `archive/` with restore steps; `status: draft` was not enough, because its screenshots under `public/` were served at HTTP 200 regardless of content status. Kratos stays on the client list.

**Schema changes touch two files.** `src/content.config.ts` (Zod, build time) and `keystatic.config.ts` (editor UI) implement the same spec and must change in the same commit. Controlled vocabularies are the exception — industries, services and deliverables live once in `src/lib/vocabularies.ts` and both configs import from it. See SCHEMA.md, "Where Astro and Keystatic disagree" — the failure modes are silent in both directions. After any change, open one entry of every affected collection in Keystatic and round-trip a save.

**Derive lists, don't hand-maintain them.** Service names in structured data, which industries have landing pages, counts of anything: read them from the collection at build time. Every hand-kept copy in this repo's history has drifted.

**Verify against enumerated reality, not assumption.** Grep the source for every occurrence before changing a fact that appears in more than one place, and compare computed styles against a neighboring element rather than trusting that a Tailwind class did what it looks like it does — several don't exist (see DESIGN.md, "Inline links inside body or meta text").

## Voice

Confident, expert, plainspoken. Specifics over adjectives. No agency clichés. American English. When in doubt, write less and be more specific.
