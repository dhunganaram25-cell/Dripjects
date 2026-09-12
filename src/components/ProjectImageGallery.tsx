/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Images, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ExternalLink, 
  ZoomIn, 
  ImageIcon,
  Check,
  Star,
  Camera,
  UploadCloud
} from 'lucide-react';
import { getSafeImageCandidates } from '../utils/imageUtils';

interface ProjectImageGalleryProps {
  images: string[];
  projectTitle: string;
  currentThumbnailUrl?: string;
  onSetAsThumbnail?: (url: string) => void;
  onOpenThumbnailChooser?: () => void;
}

interface GalleryCardProps {
  imgUrl: string;
  index: number;
  projectTitle: string;
  isCurrentThumbnail: boolean;
  onClick: (workingUrl: string) => void;
  onSetAsThumbnail?: (url: string) => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({
  imgUrl,
  index,
  projectTitle,
  isCurrentThumbnail,
  onClick,
  onSetAsThumbnail,
}) => {
  const candidates = React.useMemo(() => getSafeImageCandidates(imgUrl), [imgUrl]);
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  const currentSrc = candidates[candidateIdx] || imgUrl;

  const handleImageError = () => {
    if (candidateIdx + 1 < candidates.length) {
      setCandidateIdx(prev => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  return (
    <div
      onClick={() => onClick(currentSrc)}
      className={`group relative aspect-video rounded-xl overflow-hidden bg-slate-900 border transition-all cursor-pointer shadow-md ${
        isCurrentThumbnail 
          ? 'border-emerald-500/80 ring-2 ring-emerald-500/30' 
          : 'border-slate-800 hover:border-emerald-500/50'
      }`}
    >
      {/* Loading Skeleton */}
      {!hasLoaded && !hasFailedAll && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-slate-600" />
        </div>
      )}

      {/* Render Image */}
      {!hasFailedAll ? (
        <img
          src={currentSrc}
          alt={`${projectTitle} screenshot ${index + 1}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setHasLoaded(true)}
          onError={handleImageError}
          className={`w-full h-full object-cover object-center group-hover:scale-110 transition-all duration-300 ${
            hasLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-900 text-slate-500">
          <ImageIcon className="w-6 h-6 mb-1 text-slate-600" />
          <span className="text-[10px]">Screenshot #{index + 1}</span>
        </div>
      )}

      {/* Current Thumbnail Badge */}
      {isCurrentThumbnail && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-bold shadow-md">
          <Check className="w-3 h-3 stroke-[3]" />
          <span>Thumbnail</span>
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between p-2 text-white">
        <div className="w-full flex justify-end">
          {onSetAsThumbnail && !isCurrentThumbnail && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetAsThumbnail(currentSrc);
              }}
              title="Set this picture as project thumbnail"
              className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold shadow-md transition-all cursor-pointer"
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Make Thumbnail</span>
            </button>
          )}
        </div>

        <div className="p-2 rounded-lg bg-black/60 text-emerald-400 backdrop-blur-sm shadow">
          <ZoomIn className="w-4 h-4" />
        </div>

        <div className="w-full flex justify-between items-center text-[10px] text-slate-300">
          <span>Click to expand</span>
          <span className="font-mono bg-black/70 px-1.5 py-0.5 rounded">#{index + 1}</span>
        </div>
      </div>
    </div>
  );
};

export const ProjectImageGallery: React.FC<ProjectImageGalleryProps> = ({
  images,
  projectTitle,
  currentThumbnailUrl,
  onSetAsThumbnail,
  onOpenThumbnailChooser,
}) => {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [lightboxCandidateIdx, setLightboxCandidateIdx] = useState(0);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex(prev => 
          prev !== null ? (prev === 0 ? images.length - 1 : prev - 1) : null
        );
      } else if (e.key === 'ArrowRight') {
        setActiveLightboxIndex(prev => 
          prev !== null ? (prev === images.length - 1 ? 0 : prev + 1) : null
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, images.length]);

  // Reset candidate index when active image changes
  useEffect(() => {
    setLightboxCandidateIdx(0);
  }, [activeLightboxIndex]);

  if (!images || images.length === 0) {
    return null;
  }

  const activeImageRaw = activeLightboxIndex !== null ? images[activeLightboxIndex] : '';
  const lightboxCandidates = activeImageRaw ? getSafeImageCandidates(activeImageRaw) : [];
  const currentLightboxSrc = lightboxCandidates[lightboxCandidateIdx] || activeImageRaw;
  const isCurrentActiveThumb = Boolean(
    currentThumbnailUrl && 
    activeImageRaw && 
    (currentThumbnailUrl === activeImageRaw || currentThumbnailUrl === currentLightboxSrc)
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Images className="w-4 h-4 text-emerald-400" />
          <span>Image Gallery & Screenshots</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
            {images.length} photo{images.length !== 1 ? 's' : ''}
          </span>
        </h4>

        {/* Change / Upload Thumbnail Button */}
        {onOpenThumbnailChooser && (
          <button
            type="button"
            onClick={onOpenThumbnailChooser}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer w-fit"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Choose / Upload Thumbnail Picture</span>
          </button>
        )}
      </div>

      {/* Thumbnails Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((imgUrl, index) => (
          <GalleryCard
            key={`${imgUrl}-${index}`}
            imgUrl={imgUrl}
            index={index}
            projectTitle={projectTitle}
            isCurrentThumbnail={Boolean(currentThumbnailUrl && currentThumbnailUrl === imgUrl)}
            onClick={() => setActiveLightboxIndex(index)}
            onSetAsThumbnail={onSetAsThumbnail}
          />
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeLightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={() => setActiveLightboxIndex(null)}
        >
          {/* Top Bar */}
          <div 
            className="w-full max-w-5xl flex items-center justify-between z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-white">
              <span className="font-bold text-sm">{projectTitle}</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">
                Image {activeLightboxIndex + 1} of {images.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Set as thumbnail from lightbox */}
              {onSetAsThumbnail && !isCurrentActiveThumb && (
                <button
                  type="button"
                  onClick={() => onSetAsThumbnail(currentLightboxSrc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Set as Thumbnail</span>
                </button>
              )}

              {isCurrentActiveThumb && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Current Thumbnail</span>
                </span>
              )}

              <a
                href={currentLightboxSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Open full image in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setActiveLightboxIndex(null)}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 transition-colors cursor-pointer"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Large Image Container */}
          <div 
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center py-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            {images.length > 1 && (
              <button
                onClick={() => setActiveLightboxIndex(prev => 
                  prev !== null ? (prev === 0 ? images.length - 1 : prev - 1) : null
                )}
                className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-emerald-500 hover:text-slate-950 text-white border border-slate-700 shadow-xl transition-all cursor-pointer"
                title="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Displayed Image */}
            <img
              key={currentLightboxSrc}
              src={currentLightboxSrc}
              alt={`${projectTitle} large view ${activeLightboxIndex + 1}`}
              referrerPolicy="no-referrer"
              onError={() => {
                if (lightboxCandidateIdx + 1 < lightboxCandidates.length) {
                  setLightboxCandidateIdx(prev => prev + 1);
                }
              }}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800"
            />

            {/* Next Button */}
            {images.length > 1 && (
              <button
                onClick={() => setActiveLightboxIndex(prev => 
                  prev !== null ? (prev === images.length - 1 ? 0 : prev + 1) : null
                )}
                className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-emerald-500 hover:text-slate-950 text-white border border-slate-700 shadow-xl transition-all cursor-pointer"
                title="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {images.length > 1 && (
            <div 
              className="w-full max-w-2xl flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveLightboxIndex(idx)}
                  className={`relative w-16 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activeLightboxIndex === idx
                      ? 'border-emerald-400 scale-105 shadow-lg'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
