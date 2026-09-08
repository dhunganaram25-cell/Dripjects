import { Project, ProjectsDatabase } from '../types';
import { initialProjectsDatabase } from '../data/defaultProjects';
import { parseGoogleDriveUrl } from '../utils/googleDrive';

const LOCAL_STORAGE_KEY = 'dripjects_database_v3';

export async function fetchProjectsDatabase(): Promise<ProjectsDatabase> {
  // First try fetching from backend if available
  try {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.projects)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // API not reachable, expected in static deployment (e.g. Vercel)
  }

  // Fallback to localStorage cache if present and valid
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.projects)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading localStorage cache', e);
  }

  // Clean initial static dataset
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
