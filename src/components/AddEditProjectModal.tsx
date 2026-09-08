import React, { useState, useEffect } from 'react';
import { 
  X, 
  HardDriveDownload, 
  Save, 
  Check, 
  Link2, 
  Image as ImageIcon, 
  AlertCircle, 
  Sparkles,
  Info 
} from 'lucide-react';
import { Project, ProjectCategory, ProjectStatus } from '../types';
import { parseGoogleDriveUrl, extractGoogleDriveFileId } from '../utils/googleDrive';

interface AddEditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => void;
  initialProject?: Project | null;
}

const PRESET_BANNERS = [
  { label: 'Fantasy Citadel', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Gothic Castle', url: 'https://images.unsplash.com/photo-1548625361-195feee89a07?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cyber City', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Magic Portal', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cyber Samurai', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80' },
];

export const AddEditProjectModal: React.FC<AddEditProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<Exclude<ProjectCategory, 'all'>>('maps');
  const [version, setVersion] = useState('v1.0.0');
  const [gameVersion, setGameVersion] = useState('Minecraft Java 1.21.x');
  const [status, setStatus] = useState<ProjectStatus>('100% Complete');
  const [completionPercentage, setCompletionPercentage] = useState(100);
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  const [fileSize, setFileSize] = useState('25 MB');
  const [bannerImage, setBannerImage] = useState(PRESET_BANNERS[0].url);
  const [description, setDescription] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [installation, setInstallation] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [author, setAuthor] = useState('Saphal');
  const [featured, setFeatured] = useState(false);
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');
  const [galleryImagesText, setGalleryImagesText] = useState('');
  const [zipPassword, setZipPassword] = useState('123');

  useEffect(() => {
    if (initialProject) {
      setTitle(initialProject.title);
      setTagline(initialProject.tagline);
      setCategory(initialProject.category);
      setVersion(initialProject.version);
      setGameVersion(initialProject.gameVersion);
      setStatus(initialProject.status);
      setCompletionPercentage(initialProject.completionPercentage);
      setGoogleDriveUrl(initialProject.googleDriveUrl);
      setFileSize(initialProject.fileSize);
      setBannerImage(initialProject.bannerImage);
      setYoutubeVideoUrl(initialProject.youtubeVideoUrl || '');
      setGalleryImagesText(
        initialProject.galleryImages ? initialProject.galleryImages.join('\n') : ''
      );
      setZipPassword(initialProject.zipPassword || '123');
      setDescription(initialProject.description);
      setFeaturesText(initialProject.features.join('\n'));
      setInstallation(initialProject.installation);
      setTagsText(initialProject.tags.join(', '));
      setAuthor(initialProject.author);
      setFeatured(Boolean(initialProject.featured));
    } else {
      // Reset defaults
      setTitle('');
      setTagline('');
      setCategory('maps');
      setVersion('v1.0.0');
      setGameVersion('Minecraft Java 1.21.x');
      setStatus('100% Complete');
      setCompletionPercentage(100);
      setGoogleDriveUrl('');
      setFileSize('25 MB');
      setBannerImage(PRESET_BANNERS[0].url);
      setYoutubeVideoUrl('');
      setGalleryImagesText('');
      setZipPassword('123');
      setDescription('');
      setFeaturesText('');
      setInstallation('');
      setTagsText('Minecraft, Custom');
      setAuthor('Saphal');
      setFeatured(false);
    }
  }, [initialProject, isOpen]);

  // Live Google Drive parser
  const driveInfo = parseGoogleDriveUrl(googleDriveUrl);
  const fileId = extractGoogleDriveFileId(googleDriveUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide a project title');
      return;
    }

    const features = featuresText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const tags = tagsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const rawGallery = galleryImagesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const galleryImages = rawGallery.length > 0 
      ? rawGallery 
      : [bannerImage.trim() || PRESET_BANNERS[0].url];

    const projectData: Partial<Project> = {
      ...(initialProject ? { id: initialProject.id } : {}),
      title: title.trim(),
      tagline: tagline.trim(),
      category,
      version: version.trim(),
      gameVersion: gameVersion.trim(),
      status,
      completionPercentage: Number(completionPercentage),
      googleDriveUrl: googleDriveUrl.trim(),
      directDownloadUrl: driveInfo.directDownloadUrl || googleDriveUrl.trim(),
      fileSize: fileSize.trim() || '10 MB',
      bannerImage: bannerImage.trim() || PRESET_BANNERS[0].url,
      youtubeVideoUrl: youtubeVideoUrl.trim() || undefined,
      galleryImages,
      zipPassword: zipPassword.trim() || '123',
      description: description.trim(),
      features,
      installation: installation.trim(),
      tags: tags.length > 0 ? tags : ['Minecraft'],
      author: author.trim() || 'Saphal',
      featured,
    };

    onSave(projectData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <HardDriveDownload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              <p className="text-xs text-slate-400">
                Will be permanently saved into your <code className="text-emerald-300">projects.json</code> database
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-5">
          {/* Section: Google Drive Download Link (Crucial Feature!) */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border-2 border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Link2 className="w-4 h-4" />
              <span>Google Drive Download Link (Required)</span>
            </div>

            <p className="text-xs text-slate-300">
              Paste your Google Drive sharing link. Dripjects automatically extracts the File ID and creates an instant direct download trigger!
            </p>

            <input
              id="google-drive-url-input"
              type="text"
              required
              value={googleDriveUrl}
              onChange={(e) => setGoogleDriveUrl(e.target.value)}
              placeholder="e.g. https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />

            {/* Validation Feedback */}
            {googleDriveUrl ? (
              fileId ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Valid Google Drive ID detected: <code className="font-mono text-white">{fileId}</code>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/20">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Custom URL provided. Standard direct download will be used.</span>
                </div>
              )
            ) : null}
          </div>

          {/* Title & Tagline */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project Title *
              </label>
              <input
                id="project-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Aetheria: Sky Citadel & Floating Isles"
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Short Tagline / Hook
              </label>
              <input
                id="project-tagline-input"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. An immense fantasy adventure map with custom dungeons and floating biomes."
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category, Version, Game Version, File Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                id="project-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="maps">Maps & Worlds</option>
                <option value="texture-packs">Texture Packs</option>
                <option value="mods">Mods & Addons</option>
                <option value="datapacks">Data Packs</option>
                <option value="skins">Skins</option>
                <option value="schematics">Schematics</option>
                <option value="tools">Tools & Utilities</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project Version
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0.0"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Minecraft / App Version
              </label>
              <input
                type="text"
                value={gameVersion}
                onChange={(e) => setGameVersion(e.target.value)}
                placeholder="Minecraft Java 1.21.x"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                File Size
              </label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="e.g. 48.5 MB"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Status & Completion Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status Badge
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="100% Complete">100% Complete</option>
                <option value="90% Almost Done">90% Almost Done</option>
                <option value="75% Major Update">75% Major Update</option>
                <option value="50% Work in Progress">50% Work in Progress</option>
                <option value="Beta">Beta</option>
                <option value="Alpha">Alpha</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Completion Percentage</span>
                <span className="text-emerald-400 font-mono">{completionPercentage}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={completionPercentage}
                onChange={(e) => setCompletionPercentage(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* YouTube Video URL (Cover & Hover Preview) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-red-500 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>YouTube Video URL (Cover & 5s Hover Preview)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Plays 5s preview on hover & fetches YouTube thumbnail</span>
            </label>
            <input
              type="url"
              value={youtubeVideoUrl}
              onChange={(e) => setYoutubeVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=MmB9b5njVbA or https://youtu.be/..."
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Image Gallery Screenshots (Online Links) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Image Gallery Online Links (One URL per line)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Displayed in screenshots gallery with full lightbox viewer</span>
            </label>
            <textarea
              rows={3}
              value={galleryImagesText}
              onChange={(e) => setGalleryImagesText(e.target.value)}
              placeholder="https://imgs.search.brave.com/...&#10;https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono resize-y"
            />
          </div>

          {/* Banner Image with Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fallback Banner Image URL</span>
              </label>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>Presets:</span>
                {PRESET_BANNERS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBannerImage(preset.url)}
                    className="hover:text-emerald-400 px-1 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Detailed Description & Lore
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell visitors about your creation, world background, how you built it, etc."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-y"
            />
          </div>

          {/* Features (One per line) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Key Features (one per line)
            </label>
            <textarea
              rows={3}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder="7 celestial floating islands&#10;Custom loot chests&#10;Vanilla survival ready"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono resize-y"
            />
          </div>

          {/* Installation Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Installation Instructions
            </label>
            <textarea
              rows={2}
              value={installation}
              onChange={(e) => setInstallation(e.target.value)}
              placeholder="1. Download ZIP from Google Drive&#10;2. Extract into .minecraft/saves&#10;3. Launch Minecraft"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono resize-y"
            />
          </div>

          {/* Tags & Author & Zip Password */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="Adventure, Fantasy, Survival, 1.21"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ZIP Password
              </label>
              <input
                type="text"
                value={zipPassword}
                onChange={(e) => setZipPassword(e.target.value)}
                placeholder="123"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-project-btn"
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-lg shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{initialProject ? 'Save Changes' : 'Add to Dripjects'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
