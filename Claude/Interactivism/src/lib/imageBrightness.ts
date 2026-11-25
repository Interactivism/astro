/**
 * Build-time logo variant detection.
 *
 * Samples the desktop sidenav logo region — 200×200px with an 80px inset
 * from the top-left of the image — and returns whether the logo should be
 * 'white' (logo-white.svg) or 'black' (logo-black.svg) to maintain contrast
 * against that background region. Both are the wordmark alone on a
 * transparent ground; the name is the ink, not the backdrop.
 *
 * Used in Astro page frontmatter at build time. Never runs in the browser.
 */
import sharp from 'sharp';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';

/** Luminance threshold: above → background is bright → use dark logo. */
const THRESHOLD = 197;

/** Inset and crop size matching the desktop sidenav logo silhouette. */
const LOGO_LEFT   = 80;
const LOGO_TOP    = 80;
const LOGO_SIZE   = 200;

/**
 * Which logo asset to render, named for its ink.
 *
 * 'white' and 'black' are the wordmark alone, transparent behind, and take
 * their contrast from whatever sits under them. 'tile' is a different object:
 * a self-contained black block with the wordmark knocked out of it, which
 * brings its own background and so is not a variant of the other two.
 *
 * These were 'light' | 'dark' | 'tile', which read as the background the mark
 * was *for* rather than the mark itself — ambiguous in exactly the way that
 * let 'dark' get used as a no-image default, where it rendered as a black
 * wordmark on bare page next to the black tile every other such page showed.
 */
export type LogoVariant = 'white' | 'black' | 'tile';

/**
 * Reads `imagePath` from the filesystem, crops the logo region, and returns
 * the logo variant that ensures contrast.
 *
 * @param imagePath  Absolute filesystem path to the image.
 * @returns          'black' when the background is bright; 'white' when it is
 *                   dark. Falls back to 'white' on any read/decode error.
 */
export async function getLogoVariant(imagePath: string): Promise<LogoVariant> {
  try {
    const image = sharp(imagePath);
    const { width = 0, height = 0 } = await image.metadata();

    // Clamp crop to image bounds — gracefully handles smaller test images.
    const left        = Math.min(LOGO_LEFT, Math.max(0, width  - 1));
    const top         = Math.min(LOGO_TOP,  Math.max(0, height - 1));
    const cropWidth   = Math.min(LOGO_SIZE, width  - left);
    const cropHeight  = Math.min(LOGO_SIZE, height - top);

    const { data, info } = await image
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channels   = info.channels;      // 3 (RGB) or 4 (RGBA)
    const pixelCount = data.length / channels;
    let luminanceSum = 0;

    for (let i = 0; i < data.length; i += channels) {
      luminanceSum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    return luminanceSum / pixelCount >= THRESHOLD ? 'black' : 'white';
  } catch {
    return 'white';
  }
}

/**
 * Returns the raw average luminance (0–255) of the logo region.
 * Useful for threshold tuning. Falls back to -1 on error.
 */
export async function getLuminance(imagePath: string): Promise<number> {
  try {
    const image = sharp(imagePath);
    const { width = 0, height = 0 } = await image.metadata();

    const left       = Math.min(LOGO_LEFT, Math.max(0, width  - 1));
    const top        = Math.min(LOGO_TOP,  Math.max(0, height - 1));
    const cropWidth  = Math.min(LOGO_SIZE, width  - left);
    const cropHeight = Math.min(LOGO_SIZE, height - top);

    const { data, info } = await image
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channels   = info.channels;
    const pixelCount = data.length / channels;
    let luminanceSum = 0;

    for (let i = 0; i < data.length; i += channels) {
      luminanceSum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    return Math.round(luminanceSum / pixelCount);
  } catch {
    return -1;
  }
}

/**
 * Resolves a content entry's image frontmatter field to an absolute path on
 * disk.
 *
 * Why this exists rather than reading the path off the resolved image: by the
 * time `image()` has run, the filesystem path is gone. In dev the metadata's
 * `src` is a `/@fs/…` URL that still contains it, but a production build
 * replaces that with `/_astro/<name>.<hash>.jpg` — directory discarded, name
 * hashed. Anything written against the dev shape works locally and silently
 * reads the wrong file after deploy, which is the failure this replaces: the
 * blog template passed a hardcoded `marquee/blog.jpg` to the brightness check
 * no matter which hero a post declared.
 *
 * `entry.filePath` survives into the build, so the raw frontmatter is the one
 * place the authored path is still intact. Astro resolves these relative to
 * the content file, so this does the same.
 *
 * Deliberately a line match, not a YAML parse: the field holds a path, the
 * frontmatter has already been validated by Zod before anything calls this,
 * and a parser here would be a second schema to keep in sync.
 *
 * @param entryFilePath  `entry.filePath` — relative to the project root.
 * @param field          Frontmatter key, e.g. 'heroImageWide'.
 * @returns              Absolute path, or undefined if absent or missing on disk.
 */
export function resolveEntryImagePath(
  entryFilePath: string,
  field: string,
): string | undefined {
  const abs = resolvePath(process.cwd(), entryFilePath);
  if (!existsSync(abs)) return undefined;

  const source = readFileSync(abs, 'utf8');
  const lines = source.split('\n');
  if (lines[0]?.trim() !== '---') return undefined;

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') break;
    const match = lines[i].match(new RegExp(`^${field}:\\s*(.+?)\\s*$`));
    if (!match) continue;
    const value = match[1].replace(/^["']|["']$/g, '');
    if (!value) return undefined;
    const imagePath = resolvePath(dirname(abs), value);
    return existsSync(imagePath) ? imagePath : undefined;
  }
  return undefined;
}

/**
 * Logo variant for a content entry, read from the image that entry actually
 * declares. Returns 'tile' when the field is absent or unreadable — the black
 * lockup marquee-less pages use, which is the right answer when there is no
 * image to sit on.
 */
export async function getLogoVariantForEntry(
  entryFilePath: string,
  field: string,
): Promise<LogoVariant> {
  const imagePath = resolveEntryImagePath(entryFilePath, field);
  return imagePath ? getLogoVariant(imagePath) : 'tile';
}
