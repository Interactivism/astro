import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';

export default defineConfig({
  site: 'https://interactivism.com',
  trailingSlash: 'always',

  integrations: [
    mdx(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],

  markdown: {
    rehypePlugins: [rehypeSlug],
  },

  image: {
    // Astro's built-in image optimization via astro:assets
    domains: [],
  },
});
