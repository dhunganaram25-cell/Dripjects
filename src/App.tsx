/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { FilterBar, SortOption } from './components/FilterBar';
import { ProjectCard } from './components/ProjectCard';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { DownloadPasswordDialog } from './components/DownloadPasswordDialog';
import { DirectDownloadToast } from './components/DirectDownloadToast';
import { DripjectsLogo } from './components/DripjectsLogo';
import { 
  fetchProjectsDatabase, 
  recordDownloadApi 
} from './services/projectsApi';
import { triggerDirectDownload } from './utils/googleDrive';
import { Project, ProjectCategory, ProjectsDatabase, ProjectVersion } from './types';
import { initialProjectsDatabase } from './data/defaultProjects';
import { SearchX, Check, X, Sparkles } from 'lucide-react';

export default function App() {
  const [database, setDatabase] = useState<ProjectsDatabase>(initialProjectsDatabase);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal & Dialog States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectModalTab, setProjectModalTab] = useState<'overview' | 'versions' | 'gallery' | 'features' | 'installation' | 'changelog'>('overview');
  
  // Download Target State (supports downloading specific versions)
  const [downloadTarget, setDownloadTarget] = useState<{
    project: Project;
    version?: ProjectVersion | null;
  } | null>(null);

  // Active Download Toast State
  const [activeDownload, setActiveDownload] = useState<{ project: Project; url: string; versionTag?: string } | null>(null);

  // Custom Share Toast State
  const [shareToast, setShareToast] = useState<{ project: Project; url: string } | null>(null);

  // General Notification Toast
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Deep Linking: Extract requested project and section from URL path e.g. /dripjects/:slug or /dripjects/:slug/versions
  const checkUrlForProject = useCallback((projectsList: Project[]) => {
    try {
      const pathname = window.location.pathname; // e.g. /dripjects/pvp-practice/versions
      const hash = window.location.hash; // e.g. #/dripjects/...
      const search = new URLSearchParams(window.location.search);

      let targetId = '';
      let targetTab: 'overview' | 'versions' = 'overview';

      // Check URL pathname
      const pathMatch = pathname.match(/^\/dripjects\/([^/]+)(?:\/([^/]+))?/);
      if (pathMatch) {
        targetId = decodeURIComponent(pathMatch[1]).trim();
        if (pathMatch[2] && pathMatch[2].toLowerCase() === 'versions') {
          targetTab = 'versions';
        }
      } else if (hash.includes('/dripjects/')) {
        const hashPart = hash.split('/dripjects/')[1];
        const parts = hashPart.split('/');
        targetId = decodeURIComponent(parts[0]).trim();
        if (parts[1] && parts[1].toLowerCase() === 'versions') {
          targetTab = 'versions';
        }
      } else if (search.get('project')) {
        targetId = search.get('project')!.trim();
        if (search.get('tab') === 'versions') {
          targetTab = 'versions';
        }
      }

      if (targetId && projectsList.length > 0) {
        const found = projectsList.find(p => 
          p.id.toLowerCase() === targetId.toLowerCase() ||
          p.slug?.toLowerCase() === targetId.toLowerCase() ||
          p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === targetId.toLowerCase() ||
          targetId.toLowerCase().startsWith(p.slug?.toLowerCase() || p.id.toLowerCase())
        );
        if (found) {
          setSelectedProject(found);
          setProjectModalTab(targetTab);
        }
      }
    } catch (err) {
      console.warn('URL parsing error:', err);
    }
  }, []);

  // Fetch initial database & check deep links
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchProjectsDatabase();
      setDatabase(data);
      setIsLoading(false);
      checkUrlForProject(data.projects);
    }
    loadData();
  }, [checkUrlForProject]);

  // Handle browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      checkUrlForProject(database.projects);
      if (window.location.pathname === '/' || window.location.pathname === '') {
        setSelectedProject(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [database.projects, checkUrlForProject]);

  // Compute category counts for pills
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    database.projects.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [database.projects]);

  // Filtered and Sorted Projects
  const filteredProjects = useMemo(() => {
    return database.projects
      .filter((project) => {
        if (selectedCategory !== 'all' && project.category !== selectedCategory) {
          return false;
        }

        if (selectedTag) {
          const t = selectedTag.toLowerCase();
          const hasTag = project.tags.some(tag => tag.toLowerCase() === t);
          if (!hasTag) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = project.title.toLowerCase().includes(q);
          const matchesTagline = project.tagline.toLowerCase().includes(q);
          const matchesTags = project.tags.some(t => t.toLowerCase().includes(q));
          const matchesGameVer = project.gameVersion.toLowerCase().includes(q);
          const matchesVer = project.version.toLowerCase().includes(q);
          const matchesDesc = project.description.toLowerCase().includes(q);
          if (!matchesTitle && !matchesTagline && !matchesTags && !matchesGameVer && !matchesVer && !matchesDesc) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'title-desc') {
          return b.title.localeCompare(a.title);
        }
        return 0;
      });
  }, [database.projects, selectedCategory, selectedTag, searchQuery, sortBy]);

  // Featured Project
  const featuredProject = useMemo(() => {
    return database.projects.find(p => p.featured) || database.projects[0];
  }, [database.projects]);

  // Handler: When user clicks "Download" (supports specific older versions!)
  const handleRequestDownload = (project: Project, version?: ProjectVersion | null) => {
    setDownloadTarget({ project, version });
  };

  // Handler: When user confirms download from Password Dialog
  const handleConfirmDownload = async (project: Project, version?: ProjectVersion | null) => {
    // Determine download URL
    const targetUrl = version?.directDownloadUrl || version?.googleDriveUrl || project.directDownloadUrl || project.googleDriveUrl;
    const versionLabel = version?.version || project.version;

    // Trigger browser download immediately
    triggerDirectDownload(targetUrl);

    // Show feedback toast
    setActiveDownload({ project, url: targetUrl, versionTag: versionLabel });

    // Increment download count in background API silently
    await recordDownloadApi(project.id);
  };

  // Handler: Custom Share Link (e.g. dripjects.vercel.app/dripjects/{project.slug})
  const handleShare = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const origin = window.location.origin;
    const projectSlug = encodeURIComponent(project.slug || project.id);
    const customShareUrl = `${origin}/dripjects/${projectSlug}`;

    try {
      window.history.pushState(null, '', `/dripjects/${projectSlug}`);
    } catch {
      // ignore
    }

    try {
      navigator.clipboard.writeText(customShareUrl);
    } catch {
      // fallback
    }
    setShareToast({ project, url: customShareUrl });
    setTimeout(() => {
      setShareToast(null);
    }, 4500);
  };

  // Handler: Select Project (open modal and update URL)
  const handleSelectProject = (project: Project, tab: 'overview' | 'versions' = 'overview') => {
    setSelectedProject(project);
    setProjectModalTab(tab);
    
    const slug = encodeURIComponent(project.slug || project.id);
    const targetPath = tab === 'versions' ? `/dripjects/${slug}/versions` : `/dripjects/${slug}`;
    try {
      window.history.pushState(null, '', targetPath);
    } catch {
      // ignore
    }
  };

  // Handler: Tab change within project modal
  const handleTabChange = (tab: 'overview' | 'versions' | 'gallery' | 'features' | 'installation' | 'changelog') => {
    setProjectModalTab(tab);
    if (!selectedProject) return;

    const slug = encodeURIComponent(selectedProject.slug || selectedProject.id);
    const targetPath = tab === 'versions' ? `/dripjects/${slug}/versions` : `/dripjects/${slug}`;
    try {
      window.history.replaceState(null, '', targetPath);
    } catch {
      // ignore
    }
  };

  // Handler: Close Project Modal (restore clean URL)
  const handleCloseProjectModal = () => {
    setSelectedProject(null);
    try {
      window.history.pushState(null, '', '/');
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Public Sticky Navigation Header */}
      <Navbar
        metadata={database.metadata}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero & Highlights Banner */}
        <StatsBanner
          featuredProject={featuredProject}
          onSelectProject={(p) => handleSelectProject(p, 'overview')}
          onRequestDownloadProject={handleRequestDownload}
          onShareProject={handleShare}
        />

        {/* Filter and Category Bar */}
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedTag(null);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onClearTag={() => setSelectedTag(null)}
          categoryCounts={categoryCounts}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalResults={filteredProjects.length}
        />

        {/* Projects Grid / List */}
        {filteredProjects.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                viewMode={viewMode}
                onSelect={(p) => handleSelectProject(p, 'overview')}
                onRequestDownload={handleRequestDownload}
                onShare={handleShare}
                onSelectTag={(tag) => setSelectedTag(tag)}
              />
            ))}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="py-16 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <SearchX className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No projects found</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
                {selectedTag
                  ? `No projects found with tag #${selectedTag}.`
                  : searchQuery
                  ? `No projects matched "${searchQuery}". Try different keywords.`
                  : `No projects currently in category "${selectedCategory}".`}
              </p>
            </div>
            {(searchQuery || selectedTag) && (
              <div className="flex items-center justify-center gap-3 pt-2">
                {selectedTag && (
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg transition-colors cursor-pointer border border-emerald-500/30"
                  >
                    Clear Tag #{selectedTag}
                  </button>
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Public Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 mt-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <DripjectsLogo size="sm" />

          <div className="flex items-center gap-4 text-slate-400 flex-wrap">
            <span>Direct Google Drive Delivery</span>
            <span>•</span>
            <span>All Versions Archive</span>
            <span>•</span>
            <span>100% Free For Everyone</span>
            <span>•</span>
            <span>No Auth Required</span>
          </div>
        </div>
      </footer>

      {/* Project Detail Modal with All Versions Tab & Slug Routing */}
      <ProjectDetailModal
        project={selectedProject}
        initialTab={projectModalTab}
        onClose={handleCloseProjectModal}
        onRequestDownload={handleRequestDownload}
        onShare={handleShare}
        onSelectTag={(tag) => {
          setSelectedTag(tag);
          handleCloseProjectModal();
        }}
        onTabChange={handleTabChange}
      />

      {/* Password Dialog (shown before unzipping/downloading) */}
      <DownloadPasswordDialog
        project={downloadTarget?.project || null}
        version={downloadTarget?.version || null}
        isOpen={Boolean(downloadTarget)}
        onClose={() => setDownloadTarget(null)}
        onConfirmDownload={handleConfirmDownload}
      />

      {/* Direct Download Active Toast */}
      {activeDownload && (
        <DirectDownloadToast
          project={activeDownload.project}
          downloadUrl={activeDownload.url}
          onClose={() => setActiveDownload(null)}
        />
      )}

      {/* Custom Share Link Notification Toast */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-4 rounded-2xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/50 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                <Check className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>Direct Share Link Copied!</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Direct link to <strong className="text-emerald-400">{shareToast.project.title}</strong> is now on your clipboard.
                </p>
                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 select-all truncate max-w-[280px]">
                  {shareToast.url}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShareToast(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* General Notification Toast */}
      {notificationToast && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm animate-in slide-in-from-bottom-5 duration-200">
          <div className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex items-center gap-2.5 text-xs text-slate-200">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notificationToast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
