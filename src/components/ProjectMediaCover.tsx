/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Volume2, Maximize2, ExternalLink, Image as ImageIcon, RefreshCw, Check } from 'lucide-react';
import { Project } from '../types';
import { extractYouTubeId, getYouTubePreviewEmbedUrl, getYouTubeFullEmbedUrl } from '../utils/youtube';
import { useProjectThumbnail, syncProjectThumbnail } from '../utils/thumbnailHelper';

interface ProjectMediaCoverProps {
  project: Project;
  className?: string;
  aspectRatio?: 'video' | 'banner';
  allowWatchFull?: boolean;
}

export const ProjectMediaCover: React.FC<ProjectMediaCoverProps> = ({
  project,
  className = '',
  aspectRatio = 'video',
  allowWatchFull = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  const videoId = extractYouTubeId(project.youtubeVideoUrl);
  const { 
    src: thumbnailSrc, 
    sourceType, 
    isYouTubeWorking, 
    handleImageError, 
    handleImageLoad 
  } = useProjectThumbnail(project);

  const handleSyncThumbnail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await syncProjectThumbnail(project);
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 2000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle hover debounce (start preview after 250ms of hovering if videoId exists)
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!videoId || isPlayingFull) return;

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setIsPreviewActive(true);
    }, 250);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (!isPlayingFull) {
      setIsPreviewActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const aspectClass = aspectRatio === 'banner' ? 'aspect-[21/9]' : 'aspect-video';

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full ${aspectClass} overflow-hidden bg-slate-950 rounded-2xl group select-none ${className}`}
    >
      {/* 1. Underlying Static Thumbnail (Always mounted for rock-solid stability and zero flicker) */}
      <div className="absolute inset-0 z-10 w-full h-full">
        <img
          src={thumbnailSrc}
          alt={project.title}
          onError={handleImageError}
          onLoad={handleImageLoad}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

        {/* YouTube Sync Button (forces cache-busting from YouTube Studio) */}
        {videoId && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleSyncThumbnail}
              title="Force sync latest thumbnail from YouTube Studio"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-emerald-400 text-[11px] font-semibold border border-slate-700/80 backdrop-blur-md transition-all cursor-pointer shadow-lg"
            >
              {justSynced ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Synced!</span>
                </>
              ) : (
                <>
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Thumbnail'}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* YouTube Video Badge */}
        {videoId && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-[11px] font-bold shadow-md shadow-red-950/50 backdrop-blur-sm transition-transform group-hover:scale-105">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>Hover to preview</span>
          </div>
        )}

        {/* Fallback indicator badge when showing gallery image */}
        {!videoId && sourceType === 'gallery' && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/85 text-slate-300 text-[10px] font-semibold border border-slate-700/80 backdrop-blur-sm">
            <ImageIcon className="w-3 h-3 text-cyan-400" />
            <span>Gallery Photo</span>
          </div>
        )}

        {/* Center Play Button Icon on Hover */}
        {videoId && !isPreviewActive && !isPlayingFull && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-950/80 transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* 2. YouTube Hover Preview Mode (Smooth muted looping video) */}
      {isPreviewActive && videoId && !isPlayingFull && (
        <div className="absolute inset-0 z-20 bg-black">
          <iframe
            src={getYouTubePreviewEmbedUrl(videoId)}
            title={`${project.title} Preview`}
            className="w-full h-full border-0 pointer-events-none scale-105"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
          />

          {/* Smooth continuous animated bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80 z-30">
            <div className="h-full bg-emerald-400 animate-[previewProgress_5s_linear_infinite]" />
          </div>

          {/* Floating Watch Full Button */}
          {allowWatchFull && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlayingFull(true);
              }}
              className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-emerald-500 hover:text-slate-950 text-white text-xs font-bold rounded-xl border border-white/20 shadow-lg backdrop-blur-md transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch Full Video</span>
            </button>
          )}

          {/* Previewing Pill indicator */}
          <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2 py-0.5 bg-black/70 rounded-md border border-white/10 text-[10px] text-white font-mono uppercase tracking-wider backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>Preview Playing</span>
          </div>
        </div>
      )}

      {/* 3. Full Player Mode (Direct playback with controls and audio) */}
      {isPlayingFull && videoId && (
        <div className="absolute inset-0 z-30 bg-black">
          <iframe
            src={getYouTubeFullEmbedUrl(videoId)}
            title={project.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPlayingFull(false);
              setIsPreviewActive(false);
            }}
            className="absolute top-3 right-3 z-40 px-2.5 py-1 bg-black/80 hover:bg-black text-white text-[11px] font-bold rounded-lg backdrop-blur-md border border-white/20 transition-all cursor-pointer"
          >
            Close Video
          </button>
        </div>
      )}
    </div>
  );
};

