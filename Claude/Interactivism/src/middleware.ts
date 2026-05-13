/**
 * Middleware — guards all /preview/* routes with a password.
 *
 * Set PREVIEW_PASSWORD in your Netlify environment variables.
 * If the variable is not set (e.g. local dev without a .env), all
 * /preview/* routes are accessible without a password.
 *
 * The session cookie is scoped to /preview so it never leaks to
 * the main site, and is HttpOnly + Secure in production.
 */
import { defineMiddleware } from 'astro:middleware';
import { createHash } from 'node:crypto';

/** Derive a deterministic token from the configured password. */
function cookieToken(password: string): string {
  return createHash('sha256')
    .update(password + 'interactivism-preview')
    .digest('hex');
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Only guard /preview/* routes.
  if (!pathname.startsWith('/preview')) return next();

  // Always allow: the password form itself and the auth/logout API.
  if (pathname === '/preview' || pathname === '/preview/') return next();
  if (pathname.startsWith('/api/preview-auth')) return next();

  const password = import.meta.env.PREVIEW_PASSWORD as string | undefined;

  // No password configured — let everything through (convenient in local dev).
  if (!password) return next();

  const cookie = context.cookies.get('preview_session');
  if (cookie?.value === cookieToken(password)) return next();

  // Not authenticated — redirect to the login form, preserving the destination.
  const destination = encodeURIComponent(pathname + context.url.search);
  return context.redirect(`/preview/?redirect=${destination}`);
});
