import rss from '@astrojs/rss';
import { getPublishedEntries } from '../lib/content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getPublishedEntries('blog');

  return rss({
    title: 'Interactivism',
    description: 'Digital product design & development — articles from the Interactivism studio in Pasadena, CA.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedDate,
      description: post.data.summary,
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
