# Kratos — Modernizing satellite ground systems (archived)

Archived 2026-10-13. **The client did not approve publication and asked that it
not be published.** Erik has asked them to reconsider; until that changes, none
of this should be deployed.

Archived rather than deleted so the work survives if approval comes later.

## Why it had to move out of the site, not just stay a draft

`status: draft` keeps the case study page from being built, but it does not
cover everything. Fifteen Kratos product screenshots — OpsCenter UI and
OpenSpace Design System components — were sitting under `public/`, which Netlify
serves verbatim regardless of any content status. They returned HTTP 200 on
interactivism.com at predictable URLs. Nothing linked to them, but the files
were public.

Moving them here removes them from the deployed site.

## Contents

    content/kratos-....mdx              the case study
    content/kratos-.../                 hero images
    public/images/before-after/...      4 before/after comparisons
    public/images/slideshows/...        11 design system screenshots

## To restore

1. `content/kratos-....mdx` → `src/content/caseStudies/`
2. `content/kratos-.../` → `src/content/caseStudies/`
3. `public/images/before-after/kratos-.../` → `public/images/before-after/`
4. `public/images/slideshows/kratos-.../` → `public/images/slideshows/`
5. Re-add the slug to `featuredCaseStudies` in
   `src/content/industries/aerospace-defense.mdx`
6. Set `status: published` once approval is in writing

The hero images were stored inverted relative to every other case study
(`heroImage` held the 2400x600 panorama). They were corrected before archiving,
so the copies here follow the convention: `heroImage` 900x506,
`heroImageWide` 2400x600.
