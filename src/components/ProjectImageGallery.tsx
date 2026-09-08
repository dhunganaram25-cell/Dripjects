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
  Maximize2 
} from 'lucide-react';

interface ProjectImageGalleryProps {
  images: string[];
  projectTitle: string;
}

export const ProjectImageGallery: React.FC<ProjectImageGalleryProps> = ({
  images,
  projectTitle,
}) => {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

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

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Images className="w-4 h-4 text-emerald-400" />
          <span>Image Gallery & Screenshots</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
            {images.length}
          </span>
        </h4>
        <span className="text-[11px] text-slate-500">
          Editable via <code className="text-emerald-400">projects.json</code>
        </span>
      </div>

      {/* Thumbnails Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((imgUrl, index) => (
          <div
            key={index}
            onClick={() => setActiveLightboxIndex(index)}
            className="group relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer shadow-md"
          >
            <img
              src={imgUrl}
              alt={`${projectTitle} screenshot ${index + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                // Fallback if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
              <div className="p-2 rounded-lg bg-black/60 text-emerald-400 backdrop-blur-sm">
                <ZoomIn className="w-4 h-4" />
              </div>
            </div>

            {/* Index badge */}
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-mono text-slate-300 pointer-events-none">
              #{index + 1}
            </div>
          </div>
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
            className="w-full max-w-6xl flex items-center justify-between z-10"
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
              <a
                href={images[activeLightboxIndex]}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Open original image"
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
              src={images[activeLightboxIndex]}
              alt={`${projectTitle} large view ${activeLightboxIndex + 1}`}
              referrerPolicy="no-referrer"
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
          <div 
            className="w-full max-w-2xl flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveLightboxIndex(i)}
                className={`relative w-16 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  activeLightboxIndex === i
                    ? 'border-emerald-400 scale-105 shadow-lg shadow-emerald-500/30'
                    : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`thumbnail ${i + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
