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
 * Returns high quality and max-res thumbnails for a YouTube video
 */
export function getYouTubeThumbnails(videoId: string) {
  return {
    maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    mq: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
  };
}

/**
 * Builds the 5-second muted preview embed URL (loops 0s to 5s without controls)
 */
export function getYouTubePreviewEmbedUrl(videoId: string, durationSec = 5): string {
  // Parameters:
  // autoplay=1 (start playing immediately)
  // mute=1 (browsers allow autoplay only if muted)
  // controls=0 (hide playback bar)
  // loop=1 & playlist (loops continuously)
  // start=0 & end=5 (plays first 5 seconds)
  // modestbranding=1 & rel=0 (clean display)
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&start=0&end=${durationSec}&modestbranding=1&rel=0&playsinline=1&showinfo=0&disablekb=1&fs=0`;
}

/**
 * Builds full playable embed URL with audio and controls
 */
export function getYouTubeFullEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1`;
}
