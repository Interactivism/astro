export const prerender = false;

import { makeHandler } from '@keystatic/astro/api';
import config from '../../../../keystatic.config';

const handler = makeHandler({
  config,
  clientId:          process.env.KEYSTATIC_GITHUB_CLIENT_ID,
  clientSecret:      process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
  secret:            process.env.KEYSTATIC_SECRET,
  // Tells Keystatic where the project root is in local mode.
  // Without this it resolves paths from the git root (~/), not the project dir.
  localBaseDirectory: process.cwd(),
});

export const ALL = handler;
export const GET = handler;
export const POST = handler;
