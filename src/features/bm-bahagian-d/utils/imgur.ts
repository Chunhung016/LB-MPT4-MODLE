/**
 * Helper utility to normalize any Imgur link into a direct loadable image URL.
 * Handles formats like:
 * - https://imgur.com/B5Vrqn9
 * - http://imgur.com/B5Vrqn9
 * - imgur.com/B5Vrqn9
 * - https://i.imgur.com/B5Vrqn9.png
 * - https://imgur.com/a/B5Vrqn9
 * - https://imgur.com/gallery/B5Vrqn9
 */
export function formatImgurUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  // If already a direct image URL with extension (png, jpg, jpeg, gif, webp, etc.)
  if (/^https?:\/\/i\.imgur\.com\/[a-zA-Z0-9]+\.(png|jpg|jpeg|gif|webp)$/i.test(trimmed)) {
    return trimmed;
  }

  // Match imgur link patterns
  // Examples: imgur.com/B5Vrqn9, https://imgur.com/a/B5Vrqn9, https://imgur.com/gallery/B5Vrqn9
  const match = trimmed.match(/(?:https?:\/\/)?(?:i\.)?imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]+)(?:\.[a-zA-Z]{3,4})?/i);

  if (match && match[1]) {
    const id = match[1];
    return `https://i.imgur.com/${id}.png`;
  }

  return trimmed;
}
