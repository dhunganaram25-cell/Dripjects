import { Project, ProjectsDatabase, WebsitePrivData, DatabaseMetadata } from '../types';
import { initialProjectsDatabase, initialPrivData } from '../data/defaultProjects';

const LOCAL_STORAGE_KEY = 'dripjects_database_v6';
const PRIV_STORAGE_KEY = 'dripjects_priv_v6';

function normalizeProjects(rawProjects: any[]): Project[] {
  return rawProjects.map((p) => {
    const slug = p.slug || p.id || p.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'project';
    const initialVersion = p.version || p.latestVersion || '1.0';
    
    // Ensure versions array exists and has at least one version entry
    let versions = Array.isArray(p.versions) && p.versions.length > 0 ? p.versions : [];
    if (versions.length === 0) {
      versions = [
        {
          version: initialVersion,
          versionName: `${initialVersion} Release`,
          gameVersion: p.gameVersion || 'Minecraft Java',
          releaseDate: p.updatedAt ? p.updatedAt.split('T')[0] : '2026-09-08',
          status: p.status || 'Beta',
          isLatest: true,
          fileSize: p.fileSize || 'Custom Map (.zip)',
          zipPassword: p.zipPassword || '123',
          googleDriveUrl: p.googleDriveUrl || '',
          directDownloadUrl: p.directDownloadUrl || p.googleDriveUrl || '',
          changelogNotes: Array.isArray(p.changelog?.[0]?.notes) ? p.changelog[0].notes : ['Release on Dripjects'],
          requirements: p.requirements || [],
          requiredMods: p.requiredMods || []
        }
      ];
    }

    return {
      ...p,
      id: p.id || slug,
      slug,
      version: initialVersion,
      latestVersion: p.latestVersion || initialVersion,
      versions,
    };
  });
}

export async function fetchWebsitePriv(): Promise<WebsitePrivData> {
  try {
    const res = await fetch('/api/priv');
    if (res.ok) {
      const data = await res.json();
      if (data && data.appName) {
        localStorage.setItem(PRIV_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // API not reachable, try static
  }

  try {
    const staticRes = await fetch('/data/priv.json');
    if (staticRes.ok) {
      const staticData = await staticRes.json();
      if (staticData && staticData.appName) {
        localStorage.setItem(PRIV_STORAGE_KEY, JSON.stringify(staticData));
        return staticData;
      }
    }
  } catch {
    // Fall through
  }

  try {
    const cached = localStorage.getItem(PRIV_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.appName) return parsed;
    }
  } catch {
    // ignore
  }

  return initialPrivData;
}

export async function fetchProjectsDatabase(): Promise<ProjectsDatabase> {
  // 1. Try fetching from dynamic backend API if running in full-stack mode
  try {
    const res = await fetch('/api/projects');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && Array.isArray(data.projects)) {
        const normalized: ProjectsDatabase = {
          metadata: data.metadata || initialProjectsDatabase.metadata,
          projects: normalizeProjects(data.projects)
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
      }
    }
  } catch {
    // API not reachable, expected in static deployment (e.g. Vercel)
  }

  // 2. Try fetching static /data/projects.json (guaranteed static asset on Vercel)
  try {
    const [staticRes, privData] = await Promise.all([
      fetch('/data/projects.json'),
      fetchWebsitePriv()
    ]);
    const staticType = staticRes.headers.get('content-type') || '';
    if (staticRes.ok && staticType.includes('application/json')) {
      const staticData = await staticRes.json();
      const rawList = Array.isArray(staticData) ? staticData : (staticData.projects || []);
      if (Array.isArray(rawList) && rawList.length > 0) {
        const normalized: ProjectsDatabase = {
          metadata: {
            appName: privData.appName || 'Dripjects',
            owner: privData.owner || 'ItzDrifter',
            lastUpdated: privData.lastUpdated || new Date().toISOString(),
            version: privData.version || '1.2.0',
            totalProjects: rawList.length,
            totalDownloads: privData.stats?.totalDownloads || rawList.reduce((s: number, p: any) => s + (p.downloads || 0), 0),
            totalDiamonds: privData.stats?.totalDiamonds || rawList.reduce((s: number, p: any) => s + (p.diamonds || 0), 0),
          },
          projects: normalizeProjects(rawList)
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
      }
    }
  } catch {
    // Fall through
  }

  // 3. Fallback to localStorage cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.projects)) {
        return {
          ...parsed,
          projects: normalizeProjects(parsed.projects)
        };
      }
    }
  } catch (e) {
    console.error('Error reading localStorage cache', e);
  }

  // 4. Bundled fallback
  const bundled: ProjectsDatabase = {
    ...initialProjectsDatabase,
    projects: normalizeProjects(initialProjectsDatabase.projects)
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bundled));
  return bundled;
}

export async function recordDownloadApi(id: string): Promise<number> {
  try {
    const res = await fetch(`/api/projects/${id}/download`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      return data.downloads;
    }
  } catch {
    // Backend API unavailable, track locally
  }

  const currentDb = await fetchProjectsDatabase();
  const p = currentDb.projects.find(item => item.id === id || item.slug === id);
  if (p) {
    p.downloads = (p.downloads || 0) + 1;
    currentDb.metadata.totalDownloads = (currentDb.metadata.totalDownloads || 0) + 1;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentDb));
    return p.downloads;
  }
  return 0;
}

export async function giveDiamondApi(id: string): Promise<number> {
  try {
    const res = await fetch(`/api/projects/${id}/diamond`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      return data.diamonds;
    }
  } catch {
    // Backend API unavailable, track locally
  }

  const currentDb = await fetchProjectsDatabase();
  const p = currentDb.projects.find(item => item.id === id || item.slug === id);
  if (p) {
    p.diamonds = (p.diamonds || 0) + 1;
    currentDb.metadata.totalDiamonds = (currentDb.metadata.totalDiamonds || 0) + 1;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentDb));
    return p.diamonds;
  }
  return 0;
}

export async function syncDatabaseApi(newDb: ProjectsDatabase): Promise<boolean> {
  try {
    const res = await fetch('/api/database/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDb)
    });
    if (res.ok) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newDb));
      return true;
    }
  } catch {
    // API not reachable
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newDb));
  return true;
}

export function exportDatabaseAsJsonFile(db: ProjectsDatabase) {
  const jsonStr = JSON.stringify(db, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dripjects-database-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

