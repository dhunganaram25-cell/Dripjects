/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Project } from '../types';
import { extractYouTubeId, getYouTubeThumbnails } from './youtube';

export interface ThumbnailCandidate {
  url: string;
  sourceType: 'youtube' | 'gallery' | 'banner' | 'fallback';
}

/**
 * Generates an ordered list of thumbnail candidates according to user rule:
 * 1. YouTube link thumbnail (maxres, then hq)
 * 2. If not working, gallery images (in order)
 * 3. Fallback banner image
 * 4. Default asset
 */
export function getProjectThumbnailCandidates(project: Project): ThumbnailCandidate[] {
  const candidates: ThumbnailCandidate[] = [];
  const seenUrls = new Set<string>();

  const addCandidate = (url: string | undefined, sourceType: ThumbnailCandidate['sourceType']) => {
    if (!url) return;
    const trimmed = url.trim();
    if (!trimmed || seenUrls.has(trimmed)) return;
    seenUrls.add(trimmed);
    candidates.push({ url: trimmed, sourceType });
  };

  // 1. YouTube video thumbnail (Priority 1)
  const videoId = extractYouTubeId(project.youtubeVideoUrl);
  if (videoId) {
    const yt = getYouTubeThumbnails(videoId);
    addCandidate(yt.maxres, 'youtube');
    addCandidate(yt.hq, 'youtube');
    addCandidate(yt.fallbackMaxres, 'youtube');
    addCandidate(yt.fallbackHq, 'youtube');
  }

  // 2. Gallery images (Priority 2: If YouTube link is not working or not present)
  if (project.galleryImages && Array.isArray(project.galleryImages)) {
    for (const imgUrl of project.galleryImages) {
      addCandidate(imgUrl, 'gallery');
    }
  }

  // 3. Fallback Banner image
  addCandidate(project.bannerImage, 'banner');

  // 4. Default fallback image
  addCandidate('/assets/pvpprac1.0beta.png', 'fallback');

  return candidates;
}

/**
 * Custom React Hook to manage thumbnail loading with automatic fallbacks:
 * YouTube -> Gallery Image -> Banner -> Fallback
 */
export function useProjectThumbnail(project: Project) {
  const candidates = useMemo(() => getProjectThumbnailCandidates(project), [
    project.youtubeVideoUrl,
    project.galleryImages,
    project.bannerImage,
  ]);

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  // Reset index when project changes
  useEffect(() => {
    setCandidateIndex(0);
    setHasFailedAll(false);
  }, [project.id, project.youtubeVideoUrl, project.bannerImage]);

  const currentCandidate = candidates[candidateIndex] || candidates[candidates.length - 1];

  const advanceCandidate = useCallback(() => {
    setCandidateIndex(prev => {
      const next = prev + 1;
      if (next < candidates.length) {
        return next;
      }
      setHasFailedAll(true);
      return prev;
    });
  }, [candidates.length]);

  const handleImageError = useCallback(() => {
    advanceCandidate();
  }, [advanceCandidate]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // YouTube returns a 120x90 placeholder image when maxres/hq is missing
    if (
      currentCandidate?.sourceType === 'youtube' &&
      img.naturalWidth > 0 &&
      img.naturalWidth <= 120 &&
      img.naturalHeight <= 90
    ) {
      advanceCandidate();
    }
  }, [currentCandidate?.sourceType, advanceCandidate]);

  return {
    src: currentCandidate?.url || '/assets/pvpprac1.0beta.png',
    sourceType: currentCandidate?.sourceType || 'fallback',
    isYouTubeWorking: currentCandidate?.sourceType === 'youtube' && !hasFailedAll,
    handleImageError,
    handleImageLoad,
    candidateIndex,
  };
}
