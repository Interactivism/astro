import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const allPosts = await getCollection('blog');
  const now = new Date();

  const posts = allPosts
    .filter((p) => p.data.status === 'published' && p.data.publishedDate <= now)
    .sort((a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime());

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
