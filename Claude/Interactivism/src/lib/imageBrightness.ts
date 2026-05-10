/**
 * Build-time logo variant detection.
 *
 * Samples the desktop sidenav logo region — 200×200px with an 80px inset
 * from the top-left of the image — and returns whether the logo should be
 * 'light' (logo-light.svg, white wordmark) or 'dark' (logo-dark.svg, dark
 * wordmark) to maintain contrast against that background region.
 *
 * Used in Astro page frontmatter at build time. Never runs in the browser.
 */
import sharp from 'sharp';

/** Luminance threshold: above → background is bright → use dark logo. */
const THRESHOLD = 197;

/** Inset and crop size matching the desktop sidenav logo silhouette. */
const LOGO_LEFT   = 80;
const LOGO_TOP    = 80;
const LOGO_SIZE   = 200;

export type LogoVariant = 'light' | 'dark' | 'tile';

/**
 * Reads `imagePath` from the filesystem, crops the logo region, and returns
 * the logo variant that ensures contrast.
 *
 * @param imagePath  Absolute filesystem path to the image.
 * @returns          'dark' when background is bright; 'light' when dark.
 *                   Falls back to 'light' on any read/decode error.
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

    return luminanceSum / pixelCount >= THRESHOLD ? 'dark' : 'light';
  } catch {
    return 'light';
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
