/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { FilterBar } from './components/FilterBar';
import { ProjectCard } from './components/ProjectCard';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { DownloadPasswordDialog } from './components/DownloadPasswordDialog';
import { DirectDownloadToast } from './components/DirectDownloadToast';
import { GoogleLoginGate, GoogleUser } from './components/GoogleLoginGate';
import { 
  fetchProjectsDatabase, 
  recordDownloadApi, 
  giveDiamondApi 
} from './services/projectsApi';
import { triggerDirectDownload } from './utils/googleDrive';
import { Project, ProjectCategory, ProjectsDatabase } from './types';
import { initialProjectsDatabase } from './data/defaultProjects';
import { SearchX, Share2, Check, ExternalLink, X } from 'lucide-react';

export default function App() {
  // Google Authentication State
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(() => {
    try {
      const saved = localStorage.getItem('dripjects_google_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [database, setDatabase] = useState<ProjectsDatabase>(initialProjectsDatabase);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'downloads' | 'newest' | 'diamonds' | 'title'>('downloads');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal & Dialog States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [downloadDialogProject, setDownloadDialogProject] = useState<Project | null>(null);

  // Active Download Toast State
  const [activeDownload, setActiveDownload] = useState<{ project: Project; url: string } | null>(null);

  // Custom Share Toast State
  const [shareToast, setShareToast] = useState<{ project: Project; url: string } | null>(null);

  // Deep Linking: Extract requested project from URL path e.g. /dripjects/:project
  const checkUrlForProject = useCallback((projectsList: Project[]) => {
    try {
      const pathname = window.location.pathname; // e.g. /dripjects/pvp-practice-1-0-beta
      const hash = window.location.hash; // e.g. #/dripjects/...
      const search = new URLSearchParams(window.location.search);

      let targetId = '';
      if (pathname.startsWith('/dripjects/')) {
        targetId = decodeURIComponent(pathname.replace('/dripjects/', '')).trim();
      } else if (hash.includes('/dripjects/')) {
        targetId = decodeURIComponent(hash.split('/dripjects/')[1]).trim();
      } else if (search.get('project')) {
        targetId = search.get('project')!.trim();
      }

      if (targetId && projectsList.length > 0) {
        const found = projectsList.find(p => 
          p.id.toLowerCase() === targetId.toLowerCase() ||
          p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === targetId.toLowerCase() ||
          p.title.toLowerCase() === targetId.toLowerCase()
        );
        if (found) {
          setSelectedProject(found);
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

  // Filtered and Sorted Projects
  const filteredProjects = useMemo(() => {
    return database.projects
      .filter((project) => {
        if (selectedCategory !== 'all' && project.category !== selectedCategory) {
          return false;
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
        if (sortBy === 'downloads') {
          return (b.downloads || 0) - (a.downloads || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'diamonds') {
          return (b.diamonds || 0) - (a.diamonds || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [database.projects, selectedCategory, searchQuery, sortBy]);

  // Featured Project
  const featuredProject = useMemo(() => {
    return database.projects.find(p => p.featured) || database.projects[0];
  }, [database.projects]);

  // Handler: When user clicks "Download", first show the Password Dialog!
  const handleRequestDownload = (project: Project) => {
    setDownloadDialogProject(project);
  };

  // Handler: When user confirms download from Password Dialog
  const handleConfirmDownload = async (project: Project) => {
    const targetUrl = project.directDownloadUrl || project.googleDriveUrl;

    // Trigger browser download immediately
    triggerDirectDownload(targetUrl);

    // Show feedback toast
    setActiveDownload({ project, url: targetUrl });

    // Increment download count
    const newCount = await recordDownloadApi(project.id);
    setDatabase(prev => {
      const updated = prev.projects.map(p => 
        p.id === project.id ? { ...p, downloads: newCount || p.downloads + 1 } : p
      );
      return {
        ...prev,
        projects: updated,
        metadata: {
          ...prev.metadata,
          totalDownloads: prev.metadata.totalDownloads + 1,
        }
      };
    });

    if (selectedProject && selectedProject.id === project.id) {
      setSelectedProject(prev => prev ? { ...prev, downloads: (prev.downloads || 0) + 1 } : null);
    }
  };

  // Handler: Custom Share Link (e.g. dripjects.vercel.app/dripjects/{project})
  const handleShare = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Construct custom direct URL
    const origin = window.location.origin;
    const projectSlug = encodeURIComponent(project.id);
    const customShareUrl = `${origin}/dripjects/${projectSlug}`;

    // Update browser URL bar history
    try {
      window.history.pushState(null, '', `/dripjects/${projectSlug}`);
    } catch {
      // ignore
    }

    // Copy custom link to clipboard
    navigator.clipboard.writeText(customShareUrl);

    // Show custom share notification toast
    setShareToast({ project, url: customShareUrl });
    setTimeout(() => {
      setShareToast(null);
    }, 4500);
  };

  // Handler: Select Project (open modal and update URL)
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    try {
      window.history.pushState(null, '', `/dripjects/${encodeURIComponent(project.id)}`);
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

  // Handler: Diamond Upvote
  const handleGiveDiamond = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();

    const newCount = await giveDiamondApi(project.id);
    setDatabase(prev => {
      const updated = prev.projects.map(p => 
        p.id === project.id ? { ...p, diamonds: newCount || p.diamonds + 1 } : p
      );
      return {
        ...prev,
        projects: updated,
        metadata: {
          ...prev.metadata,
          totalDiamonds: prev.metadata.totalDiamonds + 1,
        }
      };
    });

    if (selectedProject && selectedProject.id === project.id) {
      setSelectedProject(prev => prev ? { ...prev, diamonds: (prev.diamonds || 0) + 1 } : null);
    }
  };

  // Handler: Google Sign Out
  const handleSignOut = () => {
    localStorage.removeItem('dripjects_google_user');
    setCurrentUser(null);
  };

  // If user is not logged in with Google, enforce authentication gate
  if (!currentUser) {
    return (
      <GoogleLoginGate
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Public Sticky Navigation Header */}
      <Navbar
        metadata={database.metadata}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero & Highlights Banner */}
        <StatsBanner
          featuredProject={featuredProject}
          onSelectProject={handleSelectProject}
          onRequestDownloadProject={handleRequestDownload}
          onShareProject={handleShare}
        />

        {/* Filter and Category Bar */}
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalResults={filteredProjects.length}
        />

        {/* Projects Grid / List (Public View Only) */}
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
                onSelect={handleSelectProject}
                onRequestDownload={handleRequestDownload}
                onGiveDiamond={handleGiveDiamond}
                onShare={handleShare}
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
                {searchQuery
                  ? `No projects matched "${searchQuery}". Try different keywords.`
                  : `No projects currently in category "${selectedCategory}".`}
              </p>
            </div>
            {searchQuery && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Public Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 mt-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-['Space_Grotesk',sans-serif]">DRIPJECTS</span>
            <span>•</span>
            <span>Open Source Minecraft Creations Vault</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Direct Google Drive Delivery</span>
            <span>•</span>
            <span>Password Protected Archives</span>
          </div>
        </div>
      </footer>

      {/* Project Detail Modal (Clean, Public View) */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={handleCloseProjectModal}
        onRequestDownload={handleRequestDownload}
        onGiveDiamond={handleGiveDiamond}
        onShare={handleShare}
      />

      {/* Password Dialog (shown before unzipping/downloading) */}
      <DownloadPasswordDialog
        project={downloadDialogProject}
        isOpen={Boolean(downloadDialogProject)}
        onClose={() => setDownloadDialogProject(null)}
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
                  <span>Custom Share Link Copied!</span>
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
              onClick={() => setShareToast(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
