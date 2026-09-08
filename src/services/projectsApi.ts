import { Project, ProjectsDatabase } from '../types';
import { initialProjectsDatabase } from '../data/defaultProjects';
import { parseGoogleDriveUrl } from '../utils/googleDrive';

const LOCAL_STORAGE_KEY = 'dripjects_database_v5';

export async function fetchProjectsDatabase(): Promise<ProjectsDatabase> {
  // 1. Try fetching from dynamic backend API if running in full-stack mode
  try {
    const res = await fetch('/api/projects');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && Array.isArray(data.projects)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // API not reachable, expected in static deployment (e.g. Vercel)
  }

  // 2. Try fetching static /data/projects.json (guaranteed static asset on Vercel)
  try {
    const staticRes = await fetch('/data/projects.json');
    const staticType = staticRes.headers.get('content-type') || '';
    if (staticRes.ok && staticType.includes('application/json')) {
      const staticData = await staticRes.json();
      if (staticData && Array.isArray(staticData.projects)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(staticData));
        return staticData;
      }
    }
  } catch {
    // Fall through
  }

  // 3. Fallback to localStorage cache if present and newer than bundled default
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.projects)) {
        // If bundled data is newer or has updated projects, prioritize bundled data
        const bundledUpdated = new Date(initialProjectsDatabase.metadata.lastUpdated).getTime();
        const cachedUpdated = new Date(parsed.metadata?.lastUpdated || 0).getTime();
        if (cachedUpdated >= bundledUpdated) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error('Error reading localStorage cache', e);
  }

  // 4. Bundled fallback imported directly from data/projects.json at build time
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialProjectsDatabase));
  return initialProjectsDatabase;
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
  const p = currentDb.projects.find(item => item.id === id);
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
  const p = currentDb.projects.find(item => item.id === id);
  if (p) {
    p.diamonds = (p.diamonds || 0) + 1;
    currentDb.metadata.totalDiamonds = (currentDb.metadata.totalDiamonds || 0) + 1;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentDb));
    return p.diamonds;
  }
  return 0;
}

export function exportDatabaseAsJsonFile(database: ProjectsDatabase): void {
  const jsonStr = JSON.stringify(database, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dripjects-database-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
