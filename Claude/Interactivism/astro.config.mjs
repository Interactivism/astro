import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import rehypeSlug from 'rehype-slug';
import remarkSmartypants from 'remark-smartypants';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const isDev = process.env.NODE_ENV !== 'production';

// Inline Keystatic integration: sets up the virtual:keystatic-config Vite plugin
// but does NOT inject routes (we own /keystatic/ and /api/keystatic/ as explicit pages).
function keystatic() {
  return {
    name: 'keystatic',
    hooks: {
      'astro:config:setup': ({ updateConfig, config }) => {
        const configRoot = fileURLToPath(config.root);
        updateConfig({
          vite: {
            plugins: [{
              name: 'keystatic-config',
              resolveId(id) {
                if (id === 'virtual:keystatic-config') {
                  return configRoot + 'keystatic.config.ts';
                }
              },
            }],
            optimizeDeps: {
              entries: ['keystatic.config.*', '.astro/keystatic-imports.js'],
            },
            resolve: {
              dedupe: ['@keystatic/core', 'react', 'react-dom'],
            },
          },
        });
        const dotAstro = new URL('./.astro/', config.root);
        mkdirSync(dotAstro, { recursive: true });
        writeFileSync(
          new URL('keystatic-imports.js', dotAstro),
          `import "@keystatic/astro/ui";\nimport "@keystatic/astro/api";\nimport "@keystatic/core/ui";\n`,
        );
      },
    },
  };
}

export default defineConfig({
  site: 'https://interactivism.com',
  trailingSlash: 'ignore',
  // Skip the Netlify adapter in dev — its middleware intercepts /api/ routes
  // before Astro can serve them, breaking Keystatic's local API.
  adapter: isDev ? undefined : netlify(),
  output: 'static',

  integrations: [
    mdx(),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    keystatic(),
  ],

  markdown: {
    remarkPlugins: [remarkSmartypants],
    rehypePlugins: [rehypeSlug],
  },

  image: {
    // Astro's built-in image optimization via astro:assets
    domains: [],
  },
});
