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

export const THUMBNAIL_SYNC_EVENT = 'dripjects:thumbnail-sync';

/**
 * Dispatches an event to all thumbnail listeners and updates localStorage
 * to immediately bust client-side image cache across all cards and modals.
 */
export function triggerThumbnailSync(timestamp: number = Date.now()) {
  try {
    localStorage.setItem('dripjects_yt_thumb_buster', String(timestamp));
    window.dispatchEvent(new CustomEvent(THUMBNAIL_SYNC_EVENT, { detail: timestamp }));
  } catch (err) {
    console.error('Failed to trigger thumbnail sync event:', err);
  }
}

/**
 * Triggers both a client cache-buster and calls the server to download the
 * newest YouTube thumbnail to the local public assets folder.
 */
export async function syncProjectThumbnail(project: Project): Promise<{ success: boolean; timestamp: number }> {
  const ts = Date.now();
  triggerThumbnailSync(ts);

  try {
    const res = await fetch(`/api/projects/${encodeURIComponent(project.id)}/sync-thumbnail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      const finalTs = data.timestamp || ts;
      triggerThumbnailSync(finalTs);
      return { success: true, timestamp: finalTs };
    }
  } catch (err) {
    console.warn('Backend sync endpoint unavailable; client-side cache buster applied:', err);
  }

  return { success: true, timestamp: ts };
}

/**
 * Generates an ordered list of thumbnail candidates:
 * 1. User's Chosen Picture (project.bannerImage) - Priority 1
 * 2. Gallery images (Priority 2)
 * 3. YouTube link thumbnail (Fallback)
 * 4. Default asset fallback
 */
export function getProjectThumbnailCandidates(project: Project, cacheBuster?: string | number): ThumbnailCandidate[] {
  const candidates: ThumbnailCandidate[] = [];
  const seenUrls = new Set<string>();

  const addCandidate = (url: string | undefined, sourceType: ThumbnailCandidate['sourceType']) => {
    if (!url) return;
    const trimmed = url.trim();
    if (!trimmed || seenUrls.has(trimmed)) return;
    seenUrls.add(trimmed);
    candidates.push({ url: trimmed, sourceType });
  };

  // 1. User's chosen picture (Priority 1) - Ensures chosen image loads first!
  addCandidate(project.bannerImage, 'banner');

  // 2. Gallery images (Priority 2)
  if (project.galleryImages && Array.isArray(project.galleryImages)) {
    for (const imgUrl of project.galleryImages) {
      addCandidate(imgUrl, 'gallery');
    }
  }

  // 3. YouTube video thumbnail (Fallback if custom image fails or isn't provided)
  const videoId = extractYouTubeId(project.youtubeVideoUrl);
  if (videoId) {
    const buster = cacheBuster || (project.updatedAt ? new Date(project.updatedAt).getTime() : 1789181607000);
    const yt = getYouTubeThumbnails(videoId, buster);
    addCandidate(yt.maxres, 'youtube');
    addCandidate(yt.hq, 'youtube');
    addCandidate(yt.sd, 'youtube');
    addCandidate(yt.mq, 'youtube');
    addCandidate(yt.fallbackMaxres, 'youtube');
    addCandidate(yt.fallbackHq, 'youtube');
  }

  // 4. Default fallback image
  addCandidate('/assets/pvpprac1.0beta.png', 'fallback');

  return candidates;
}

/**
 * Custom React Hook to manage thumbnail loading with automatic fallbacks & cache-busting:
 * YouTube -> Gallery Image -> Banner -> Fallback
 */
export function useProjectThumbnail(project: Project, manualCacheBuster?: string | number) {
  const [syncTimestamp, setSyncTimestamp] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('dripjects_yt_thumb_buster');
      if (stored) return parseInt(stored, 10);
    } catch {}
    return project.updatedAt ? new Date(project.updatedAt).getTime() : 1789181607000;
  });

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  // Listen for global thumbnail sync events
  useEffect(() => {
    const handleSync = (e: any) => {
      const ts = e?.detail || Date.now();
      setSyncTimestamp(ts);
      setCandidateIndex(0);
      setHasFailedAll(false);
    };
    window.addEventListener(THUMBNAIL_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(THUMBNAIL_SYNC_EVENT, handleSync);
  }, []);

  // Reset index when project or video changes
  useEffect(() => {
    setCandidateIndex(0);
    setHasFailedAll(false);
  }, [project.id, project.youtubeVideoUrl, project.bannerImage, project.updatedAt]);

  const activeBuster = manualCacheBuster || syncTimestamp;

  const candidates = useMemo(
    () => getProjectThumbnailCandidates(project, activeBuster),
    [project.youtubeVideoUrl, project.galleryImages, project.bannerImage, project.updatedAt, activeBuster]
  );

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
    syncTimestamp,
  };
}

/**
 * Updates a project's thumbnail picture and ensures it is added to the gallery as well.
 * Persists changes to the server and localStorage, then broadcasts the change across the app.
 */
export async function updateProjectThumbnailAndGallery(
  project: Project,
  imageUrl: string,
  base64Data?: string,
  fileName?: string
): Promise<{ success: boolean; project: Project; finalUrl: string }> {
  let finalUrl = imageUrl;
  const ts = Date.now();

  // 1. Try dedicated server endpoint
  try {
    const res = await fetch(`/api/projects/${encodeURIComponent(project.id)}/thumbnail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl,
        imageBase64: base64Data,
        fileName,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.project) {
        triggerThumbnailSync(ts);
        return { success: true, project: data.project, finalUrl: data.finalUrl || imageUrl };
      }
    }
  } catch (err) {
    console.warn('Backend thumbnail endpoint error, applying client-side fallback:', err);
  }

  // 2. Client-side fallback update
  const newGallery = Array.isArray(project.galleryImages) ? [...project.galleryImages] : [];
  if (!newGallery.includes(finalUrl)) {
    newGallery.unshift(finalUrl);
  }

  const updatedProject: Project = {
    ...project,
    bannerImage: finalUrl,
    galleryImages: newGallery,
    updatedAt: new Date().toISOString(),
  };

  try {
    await fetch(`/api/projects/${encodeURIComponent(project.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bannerImage: finalUrl,
        galleryImages: newGallery,
      }),
    });
  } catch {}

  triggerThumbnailSync(ts);
  return { success: true, project: updatedProject, finalUrl };
}
