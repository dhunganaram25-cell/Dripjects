import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'projects.json');
const PRIV_FILE = path.join(DATA_DIR, 'priv.json');

// Helper to safely load projects
async function loadProjects() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      return [];
    }
    const raw = await fs.promises.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.projects)) return parsed.projects;
    return [];
  } catch (err) {
    console.error('Error reading projects.json:', err);
    return [];
  }
}

// Helper to safely save projects
async function saveProjects(projects: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const payload = { projects };
    await fs.promises.writeFile(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    
    // Also sync to public/data/projects.json for static builds
    const publicDataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(publicDataDir)) {
      fs.mkdirSync(publicDataDir, { recursive: true });
    }
    await fs.promises.writeFile(path.join(publicDataDir, 'projects.json'), JSON.stringify(payload, null, 2), 'utf-8');
    
    return true;
  } catch (err) {
    console.error('Error saving projects.json:', err);
    return false;
  }
}

// Helper to safely load priv website data
async function loadPriv() {
  try {
    if (!fs.existsSync(PRIV_FILE)) {
      return {
        appName: 'Dripjects',
        siteName: 'DRIPJECTS',
        tagline: 'Custom Minecraft Maps & Creations Vault',
        owner: 'ItzDrifter (Creator)',
        version: '1.2.0',
        lastUpdated: new Date().toISOString(),
        stats: {
          totalProjects: 1,
          totalDownloads: 128,
          totalDiamonds: 42
        },
        downloadPolicies: {
          guestDownloadLimit: 3,
          authenticatedDownloadLimit: 'unlimited',
          requireAuthForDownload: true
        }
      };
    }
    const raw = await fs.promises.readFile(PRIV_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading priv.json:', err);
    return null;
  }
}

// Helper to safely save priv website data
async function savePriv(privData: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    await fs.promises.writeFile(PRIV_FILE, JSON.stringify(privData, null, 2), 'utf-8');
    
    // Also sync to public/data/priv.json for static builds
    const publicDataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(publicDataDir)) {
      fs.mkdirSync(publicDataDir, { recursive: true });
    }
    await fs.promises.writeFile(path.join(publicDataDir, 'priv.json'), JSON.stringify(privData, null, 2), 'utf-8');
    
    return true;
  } catch (err) {
    console.error('Error saving priv.json:', err);
    return false;
  }
}

// Helper to extract Google Drive file ID
function extractDriveId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const m1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (m1 && m1[1]) return m1[1];
  const m2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (m2 && m2[1]) return m2[1];
  const m3 = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/i);
  if (m3 && m3[1]) return m3[1];
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) return trimmed;
  return null;
}

// Helper to format direct download URL
function computeDirectDownloadUrl(googleDriveUrl: string): string {
  if (!googleDriveUrl) return '';
  if (googleDriveUrl.includes('drive.usercontent.google.com')) {
    return googleDriveUrl;
  }
  const fileId = extractDriveId(googleDriveUrl);
  if (fileId) {
    return `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
  }
  return googleDriveUrl;
}

// Helper to extract YouTube video ID
function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
    const match = trimmed.match(regex);
    return match && match[1] ? match[1] : null;
  } catch {
    return null;
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Dripjects' });
});

// GET all projects and website metadata (combining projects.json and priv.json)
app.get('/api/projects', async (req, res) => {
  const [projects, priv] = await Promise.all([loadProjects(), loadPriv()]);
  
  const totalDownloads = projects.reduce((sum, p) => sum + (Number(p.downloads) || 0), 0);
  const totalDiamonds = projects.reduce((sum, p) => sum + (Number(p.diamonds) || 0), 0);

  const metadata = {
    appName: priv?.appName || 'Dripjects',
    owner: priv?.owner || 'ItzDrifter',
    lastUpdated: priv?.lastUpdated || new Date().toISOString(),
    version: priv?.version || '1.2.0',
    totalProjects: projects.length,
    totalDownloads: priv?.stats?.totalDownloads ?? totalDownloads,
    totalDiamonds: priv?.stats?.totalDiamonds ?? totalDiamonds
  };

  res.json({
    metadata,
    projects,
    priv
  });
});

// GET website private data
app.get('/api/priv', async (req, res) => {
  const priv = await loadPriv();
  res.json(priv || {});
});

// POST create project
app.post('/api/projects', async (req, res) => {
  const projects = await loadProjects();
  const newProject = req.body;
  if (!newProject.title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const slug = newProject.slug || newProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const id = newProject.id || slug;
  const driveUrl = newProject.googleDriveUrl || '';
  const directDownloadUrl = computeDirectDownloadUrl(driveUrl);
  const initialVersion = newProject.version || '1.0';

  const formattedProject = {
    id,
    slug,
    title: newProject.title,
    tagline: newProject.tagline || '',
    category: newProject.category || 'maps',
    version: initialVersion,
    latestVersion: initialVersion,
    gameVersion: newProject.gameVersion || 'Minecraft Java',
    status: newProject.status || '100% Complete',
    completionPercentage: Number(newProject.completionPercentage) || 100,
    googleDriveUrl: driveUrl,
    directDownloadUrl,
    fileSize: newProject.fileSize || 'Custom Map (.zip)',
    bannerImage: newProject.bannerImage || '/assets/pvpprac1.0beta.png',
    youtubeVideoUrl: newProject.youtubeVideoUrl || '',
    galleryImages: Array.isArray(newProject.galleryImages) ? newProject.galleryImages : [],
    description: newProject.description || '',
    features: Array.isArray(newProject.features) ? newProject.features : [],
    installation: newProject.installation || '',
    changelog: Array.isArray(newProject.changelog) ? newProject.changelog : [
      {
        version: initialVersion,
        date: new Date().toISOString().split('T')[0],
        notes: ['Initial release on Dripjects']
      }
    ],
    versions: Array.isArray(newProject.versions) && newProject.versions.length > 0 ? newProject.versions : [
      {
        version: initialVersion,
        versionName: `${initialVersion} Release`,
        gameVersion: newProject.gameVersion || 'Minecraft Java',
        releaseDate: new Date().toISOString().split('T')[0],
        status: newProject.status || 'Beta',
        isLatest: true,
        fileSize: newProject.fileSize || 'Custom Map (.zip)',
        zipPassword: newProject.zipPassword || '123',
        googleDriveUrl: driveUrl,
        directDownloadUrl,
        changelogNotes: ['Initial release on Dripjects']
      }
    ],
    diamonds: Number(newProject.diamonds) || 0,
    downloads: Number(newProject.downloads) || 0,
    views: Number(newProject.views) || 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: newProject.author || 'ItzDrifter',
    zipPassword: newProject.zipPassword || '123',
    tags: Array.isArray(newProject.tags) ? newProject.tags : ['Minecraft', 'PvP'],
    featured: Boolean(newProject.featured),
    mirrorLinks: newProject.mirrorLinks || []
  };

  projects.unshift(formattedProject);
  await saveProjects(projects);

  const priv = await loadPriv();
  if (priv && priv.stats) {
    priv.stats.totalProjects = projects.length;
    priv.lastUpdated = new Date().toISOString();
    await savePriv(priv);
  }

  res.status(201).json({ success: true, project: formattedProject });
});

// PUT update project
app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const projects = await loadProjects();

  const idx = projects.findIndex((p: any) => p.id === id || p.slug === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const updatedFields = req.body;
  const driveUrl = updatedFields.googleDriveUrl !== undefined ? updatedFields.googleDriveUrl : projects[idx].googleDriveUrl;
  const directDownloadUrl = driveUrl ? computeDirectDownloadUrl(driveUrl) : projects[idx].directDownloadUrl;

  projects[idx] = {
    ...projects[idx],
    ...updatedFields,
    id: projects[idx].id, // protect id
    googleDriveUrl: driveUrl,
    directDownloadUrl,
    updatedAt: new Date().toISOString()
  };

  await saveProjects(projects);
  res.json({ success: true, project: projects[idx] });
});

// DELETE project
app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const projects = await loadProjects();

  const beforeLen = projects.length;
  const filtered = projects.filter((p: any) => p.id !== id && p.slug !== id);
  if (filtered.length === beforeLen) {
    return res.status(404).json({ error: 'Project not found' });
  }

  await saveProjects(filtered);

  const priv = await loadPriv();
  if (priv && priv.stats) {
    priv.stats.totalProjects = filtered.length;
    priv.lastUpdated = new Date().toISOString();
    await savePriv(priv);
  }

  res.json({ success: true, remaining: filtered.length });
});

// POST increment download count
app.post('/api/projects/:id/download', async (req, res) => {
  const { id } = req.params;
  const [projects, priv] = await Promise.all([loadProjects(), loadPriv()]);

  const project = projects.find((p: any) => p.id === id || p.slug === id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  project.downloads = (project.downloads || 0) + 1;
  await saveProjects(projects);

  if (priv) {
    if (!priv.stats) priv.stats = {};
    priv.stats.totalDownloads = (priv.stats.totalDownloads || 0) + 1;
    priv.lastUpdated = new Date().toISOString();
    await savePriv(priv);
  }

  res.json({ 
    success: true, 
    downloads: project.downloads, 
    totalDownloads: priv?.stats?.totalDownloads || project.downloads,
    directDownloadUrl: project.directDownloadUrl 
  });
});

// POST increment diamond count
app.post('/api/projects/:id/diamond', async (req, res) => {
  const { id } = req.params;
  const [projects, priv] = await Promise.all([loadProjects(), loadPriv()]);

  const project = projects.find((p: any) => p.id === id || p.slug === id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  project.diamonds = (project.diamonds || 0) + 1;
  await saveProjects(projects);

  if (priv) {
    if (!priv.stats) priv.stats = {};
    priv.stats.totalDiamonds = (priv.stats.totalDiamonds || 0) + 1;
    priv.lastUpdated = new Date().toISOString();
    await savePriv(priv);
  }

  res.json({ 
    success: true, 
    diamonds: project.diamonds, 
    totalDiamonds: priv?.stats?.totalDiamonds || project.diamonds 
  });
});

// POST force sync YouTube thumbnail for a project
app.post('/api/projects/:id/sync-thumbnail', async (req, res) => {
  const { id } = req.params;
  const projects = await loadProjects();
  const project = projects.find((p: any) => p.id === id || p.slug === id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const now = new Date().toISOString();
  project.updatedAt = now;

  // Mirror newest thumbnail from YouTube to local assets
  const videoId = extractYouTubeId(project.youtubeVideoUrl);
  if (videoId) {
    try {
      const fetchResp = await fetch(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
      if (fetchResp.ok) {
        const buffer = await fetchResp.arrayBuffer();
        const assetsDir = path.join(process.cwd(), 'public', 'assets');
        if (!fs.existsSync(assetsDir)) {
          fs.mkdirSync(assetsDir, { recursive: true });
        }
        await fs.promises.writeFile(path.join(assetsDir, 'pvpprac1.0beta.png'), Buffer.from(buffer));
        await fs.promises.writeFile(path.join(assetsDir, 'pvpprac1.0beta.jpg'), Buffer.from(buffer));
      }
    } catch (e) {
      console.warn('Could not mirror thumbnail to public/assets:', e);
    }
  }

  await saveProjects(projects);
  res.json({ success: true, timestamp: Date.now(), project });
});

// POST sync whole database (backward compatibility)
app.post('/api/database/sync', async (req, res) => {
  const newDb = req.body;
  const rawProjects = Array.isArray(newDb) ? newDb : (newDb?.projects || []);
  
  const projects = rawProjects.map((p: any) => ({
    ...p,
    directDownloadUrl: p.googleDriveUrl ? computeDirectDownloadUrl(p.googleDriveUrl) : (p.directDownloadUrl || '')
  }));

  await saveProjects(projects);

  if (newDb?.metadata || newDb?.priv) {
    const priv = await loadPriv();
    const updatedPriv = {
      ...priv,
      ...(newDb.priv || {}),
      lastUpdated: new Date().toISOString(),
      stats: {
        totalProjects: projects.length,
        totalDownloads: projects.reduce((sum: number, p: any) => sum + (Number(p.downloads) || 0), 0),
        totalDiamonds: projects.reduce((sum: number, p: any) => sum + (Number(p.diamonds) || 0), 0),
      }
    };
    await savePriv(updatedPriv);
  }

  res.json({ success: true, projectsCount: projects.length });
});

// Start the server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
