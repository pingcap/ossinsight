/** Shared constants for OpenGraph and Twitter card images */

export const OG_IMAGE_SIZE = { width: 800, height: 418 };

export const OG_CONTENT_TYPE = 'image/png';

/** Radial gradient overlay used as background decoration in OG images */
export const OG_GRADIENT_STYLE = {
  position: 'absolute' as const,
  left: -200,
  top: -200,
  width: 800,
  height: 800,
  backgroundImage: 'radial-gradient(circle, rgba(255,99,174,0.12) 0%, transparent 70%)',
  borderRadius: 9999,
};
