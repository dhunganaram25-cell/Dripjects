/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Normalizes and provides multi-tier fallbacks for gallery and project images.
 * Solves cross-origin blocking (CORP: same-origin) and hotlinking protections (e.g. Planet Minecraft, Discord CDNs).
 */

const LOCAL_MAP: Record<string, string> = {
  '20130550': '/assets/pvpprac_gallery1.webp',
  '20130551': '/assets/pvpprac_gallery2.webp',
  '20130549': '/assets/pvpprac_gallery1.webp',
  '20130552': '/assets/pvpprac_gallery2.webp',
};

export function getSafeImageCandidates(rawUrl: string, fallbackBanner = '/assets/pvpprac1.0beta.png'): string[] {
  if (!rawUrl) return [fallbackBanner];
  
  const trimmed = rawUrl.trim();
  const candidates: string[] = [];

  // If already a local asset, it is completely reliable
  if (trimmed.startsWith('/') || trimmed.startsWith('./')) {
    candidates.push(trimmed);
    return candidates;
  }

  // Check if it's a known Planet Minecraft image ID that we have mirrored locally
  for (const [key, localPath] of Object.entries(LOCAL_MAP)) {
    if (trimmed.includes(key)) {
      candidates.push(localPath);
      break;
    }
  }

  // Add the direct URL
  candidates.push(trimmed);

  // If it is an external URL, add an image proxy candidate (wsrv.nl)
  // wsrv.nl converts headers to cross-origin-resource-policy: cross-origin and strips restrictive referrers
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const proxied = `https://wsrv.nl/?url=${encodeURIComponent(trimmed)}`;
    if (!candidates.includes(proxied)) {
      candidates.push(proxied);
    }
  }

  // Final fallback to banner
  if (!candidates.includes(fallbackBanner)) {
    candidates.push(fallbackBanner);
  }

  return candidates;
}
