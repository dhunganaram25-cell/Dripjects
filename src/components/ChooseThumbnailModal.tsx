/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  Layers, 
  AlertCircle,
  Camera,
  FolderOpen
} from 'lucide-react';
import { Project } from '../types';

interface ChooseThumbnailModalProps {
  isOpen: boolean;
  project: Project;
  onClose: () => void;
  onSelectThumbnail: (imageUrl: string, base64Data?: string, fileName?: string) => Promise<void>;
}

const PRESET_THUMBNAILS = [
  { label: 'PvP Practice 1.0 Arena', url: '/assets/pvpprac1.0beta.png' },
  { label: 'PvP Duel Sparring Ring', url: '/assets/pvpprac_gallery1.webp' },
  { label: 'PvP Bot Sparring Chamber', url: '/assets/pvpprac_gallery2.webp' },
  { label: 'Gladiator Colosseum', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Combat Arena Castle', url: 'https://images.unsplash.com/photo-1548625361-195feee89a07?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Neon PvP Grid', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
];

export const ChooseThumbnailModal: React.FC<ChooseThumbnailModalProps> = ({
  isOpen,
  project,
  onClose,
  onSelectThumbnail,
}) => {
  if (!isOpen) return null;

  const [activeSourceTab, setActiveSourceTab] = useState<'upload' | 'url' | 'gallery'>('upload');
  const [selectedUrl, setSelectedUrl] = useState<string>(project.bannerImage || '');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [previewError, setPreviewError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine gallery images with presets, removing duplicates
  const availableGallery = React.useMemo(() => {
    const list: { label: string; url: string; isGallery: boolean }[] = [];
    const seen = new Set<string>();

    if (Array.isArray(project.galleryImages)) {
      project.galleryImages.forEach((img, idx) => {
        if (!seen.has(img)) {
          seen.add(img);
          list.push({ label: `Gallery Photo #${idx + 1}`, url: img, isGallery: true });
        }
      });
    }

    PRESET_THUMBNAILS.forEach((preset) => {
      if (!seen.has(preset.url)) {
        seen.add(preset.url);
        list.push({ label: preset.label, url: preset.url, isGallery: false });
      }
    });

    return list;
  }, [project.galleryImages]);

  // Handle local file drop or selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('Image size exceeds 20MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setUploadedBase64(dataUrl);
        setUploadedFileName(file.name);
        setSelectedUrl(dataUrl);
        setPreviewError(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) return;
    setSelectedUrl(customUrlInput.trim());
    setUploadedBase64(null);
    setPreviewError(false);
  };

  const handleConfirm = async () => {
    if (!selectedUrl) return;
    setIsSaving(true);
    try {
      await onSelectThumbnail(selectedUrl, uploadedBase64 || undefined, uploadedFileName || undefined);
      onClose();
    } catch (err) {
      console.error('Error setting thumbnail:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Choose Thumbnail Picture</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Adds to Gallery
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                For <strong className="text-slate-200">{project.title}</strong> — overrides stale YouTube thumbnails
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Switcher Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveSourceTab('upload')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeSourceTab === 'upload'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload From Device</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSourceTab('gallery')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeSourceTab === 'gallery'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Gallery & Presets ({availableGallery.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSourceTab('url')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeSourceTab === 'url'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Image URL Link</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Tab 1: Upload File */}
          {activeSourceTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 sm:p-8 text-center bg-slate-950/40 hover:bg-slate-950/70 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 flex items-center justify-center mb-3 transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Click to browse or drop an image file here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports PNG, JPG, JPEG, WEBP (up to 20MB)
                </p>
                {uploadedFileName && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-mono">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Loaded: {uploadedFileName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: URL Input */}
          {activeSourceTab === 'url' && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Paste Direct Image URL (HTTPS)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/map-screenshot.png"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyUrl()}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Preview
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                You can paste direct image links from Imgur, Discord, GitHub, or any image CDN.
              </p>
            </div>
          )}

          {/* Tab 3: Gallery & Presets */}
          {activeSourceTab === 'gallery' && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 mb-2">
                Select any existing gallery photo or high-res arena preset:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {availableGallery.map((item, idx) => {
                  const isSelected = selectedUrl === item.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedUrl(item.url);
                        setUploadedBase64(null);
                        setPreviewError(false);
                      }}
                      className={`group relative aspect-video rounded-xl overflow-hidden bg-slate-950 border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-950/60' 
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80" />
                      
                      <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between text-[10px] text-white">
                        <span className="truncate font-medium">{item.label}</span>
                        {item.isGallery && (
                          <span className="shrink-0 px-1 py-0.2 bg-slate-800/80 rounded text-[9px] text-cyan-300">
                            Gallery
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Preview Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Selected Thumbnail Preview</span>
              </span>
              {selectedUrl === project.bannerImage && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Current Thumbnail
                </span>
              )}
            </div>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              {selectedUrl && !previewError ? (
                <img
                  src={selectedUrl}
                  alt="Thumbnail Preview"
                  referrerPolicy="no-referrer"
                  onError={() => setPreviewError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                  <AlertCircle className="w-6 h-6 text-amber-400 mb-1" />
                  <span className="text-xs text-slate-400">
                    {previewError ? 'Unable to load image from that URL. Please try another image.' : 'No thumbnail selected yet'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-300/90 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                This picture will be saved as the project thumbnail and also added to the gallery.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedUrl || isSaving || previewError}
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-emerald-950/50 active:scale-98"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Saving Thumbnail...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Set Thumbnail & Add to Gallery</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
