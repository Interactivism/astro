/**
 * Preview authentication API.
 *
 * POST /api/preview-auth/  — validate password, set session cookie.
 * GET  /api/preview-auth/?action=logout — clear session cookie.
 */
import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';

export const prerender = false;

const COOKIE_NAME = 'preview_session';
const COOKIE_PATH = '/preview';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function cookieToken(password: string): string {
  return createHash('sha256')
    .update(password + 'interactivism-preview')
    .digest('hex');
}

/** POST — submit password form */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const submitted = (form.get('password') as string | null) ?? '';
  const redirectTo  = (form.get('redirect')  as string | null) ?? '/preview/';

  const password = (import.meta.env.PREVIEW_PASSWORD as string | undefined) ?? '';

  if (!password || submitted === password) {
    cookies.set(COOKIE_NAME, cookieToken(password), {
      httpOnly: true,
      sameSite: 'strict',
      path: COOKIE_PATH,
      maxAge: COOKIE_MAX_AGE,
      secure: import.meta.env.PROD,
    });
    return redirect(redirectTo);
  }

  // Wrong password — bounce back to the form with an error flag.
  const params = new URLSearchParams({ redirect: redirectTo, error: '1' });
  return redirect(`/preview/?${params}`);
};

/** GET ?action=logout — clear the session cookie */
export const GET: APIRoute = async ({ cookies, redirect, url }) => {
  if (url.searchParams.get('action') === 'logout') {
    cookies.delete(COOKIE_NAME, { path: COOKIE_PATH });
    return redirect('/preview/');
  }
  return new Response(null, { status: 404 });
};
