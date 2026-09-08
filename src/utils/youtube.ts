/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Extracts YouTube Video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Direct ID
 */
export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If it's already an 11-char ID with valid characters
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    // Regex matching standard YouTube patterns
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
    const match = trimmed.match(regex);
    return match && match[1] ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Returns high quality and max-res thumbnails for a YouTube video using YouTube's official i.ytimg.com CDN
 */
export function getYouTubeThumbnails(videoId: string) {
  return {
    maxres: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    hq: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    mq: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    fallbackMaxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    fallbackHq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
}

/**
 * Builds the muted video preview embed URL (loops smoothly without halting controls)
 */
export function getYouTubePreviewEmbedUrl(videoId: string): string {
  // Use standard www.youtube.com domain with:
  // autoplay=1 (browser allows autoplay when muted)
  // mute=1 (required by browser autoplay policy)
  // controls=0 (clean hover preview)
  // loop=1 & playlist (continuous loop without ending after 5s)
  // playsinline=1 & rel=0 (in-place playback, no external suggestions)
  // modestbranding=1 & enablejsapi=1
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;
}

/**
 * Builds full playable embed URL with audio and controls
 */
export function getYouTubeFullEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
}
