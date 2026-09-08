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

// Helper to safely load database
async function loadDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      return null;
    }
    const raw = await fs.promises.readFile(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading projects.json:', err);
    return null;
  }
}

// Helper to safely save database
async function saveDatabase(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    await fs.promises.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving projects.json:', err);
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

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Dripjects' });
});

// GET all projects and database metadata
app.get('/api/projects', async (req, res) => {
  const db = await loadDatabase();
  if (!db) {
    return res.status(500).json({ error: 'Database not initialized' });
  }
  res.json(db);
});

// POST create project
app.post('/api/projects', async (req, res) => {
  const db = await loadDatabase();
  if (!db) {
    return res.status(500).json({ error: 'Database could not be loaded' });
  }

  const newProject = req.body;
  if (!newProject.title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const id = newProject.id || `drip-proj-${Date.now().toString(36)}`;
  const driveUrl = newProject.googleDriveUrl || '';
  const directDownloadUrl = computeDirectDownloadUrl(driveUrl);

  const formattedProject = {
    id,
    title: newProject.title,
    tagline: newProject.tagline || '',
    category: newProject.category || 'maps',
    version: newProject.version || 'v1.0.0',
    gameVersion: newProject.gameVersion || 'Minecraft 1.21.x',
    status: newProject.status || '100% Complete',
    completionPercentage: Number(newProject.completionPercentage) || 100,
    googleDriveUrl: driveUrl,
    directDownloadUrl,
    fileSize: newProject.fileSize || '10 MB',
    bannerImage: newProject.bannerImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    galleryImages: newProject.galleryImages || [newProject.bannerImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'],
    description: newProject.description || '',
    features: Array.isArray(newProject.features) ? newProject.features : [],
    installation: newProject.installation || '',
    changelog: Array.isArray(newProject.changelog) ? newProject.changelog : [
      {
        version: newProject.version || 'v1.0.0',
        date: new Date().toISOString().split('T')[0],
        notes: ['Initial release on Dripjects']
      }
    ],
    diamonds: Number(newProject.diamonds) || 0,
    downloads: Number(newProject.downloads) || 0,
    views: Number(newProject.views) || 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: newProject.author || 'Saphal',
    tags: Array.isArray(newProject.tags) ? newProject.tags : ['Minecraft', 'Creation'],
    featured: Boolean(newProject.featured),
    mirrorLinks: newProject.mirrorLinks || []
  };

  db.projects.unshift(formattedProject);
  db.metadata.totalProjects = db.projects.length;
  db.metadata.lastUpdated = new Date().toISOString();

  await saveDatabase(db);
  res.status(201).json({ success: true, project: formattedProject, database: db });
});

// PUT update project
app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const db = await loadDatabase();
  if (!db) {
    return res.status(500).json({ error: 'Database could not be loaded' });
  }

  const idx = db.projects.findIndex((p: any) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const updatedFields = req.body;
  const driveUrl = updatedFields.googleDriveUrl !== undefined ? updatedFields.googleDriveUrl : db.projects[idx].googleDriveUrl;
  const directDownloadUrl = driveUrl ? computeDirectDownloadUrl(driveUrl) : db.projects[idx].directDownloadUrl;

  db.projects[idx] = {
    ...db.projects[idx],
    ...updatedFields,
    id, // protect id
    googleDriveUrl: driveUrl,
    directDownloadUrl,
    updatedAt: new Date().toISOString()
  };

  db.metadata.lastUpdated = new Date().toISOString();
  await saveDatabase(db);
  res.json({ success: true, project: db.projects[idx], database: db });
});

// DELETE project
app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const db = await loadDatabase();
  if (!db) {
    return res.status(500).json({ error: 'Database could not be loaded' });
  }

  const beforeLen = db.projects.length;
  db.projects = db.projects.filter((p: any) => p.id !== id);
  if (db.projects.length === beforeLen) {
    return res.status(404).json({ error: 'Project not found' });
  }

  db.metadata.totalProjects = db.projects.length;
  db.metadata.lastUpdated = new Date().toISOString();
  await saveDatabase(db);
  res.json({ success: true, database: db });
});

// POST increment download count
app.post('/api/projects/:id/download', async (req, res) => {
  const { id } = req.params;
  const db = await loadDatabase();
  if (!db) return res.status(500).json({ error: 'Database could not be loaded' });

  const project = db.projects.find((p: any) => p.id === id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  project.downloads = (project.downloads || 0) + 1;
  db.metadata.totalDownloads = (db.metadata.totalDownloads || 0) + 1;
  db.metadata.lastUpdated = new Date().toISOString();

  await saveDatabase(db);
  res.json({ 
    success: true, 
    downloads: project.downloads, 
    totalDownloads: db.metadata.totalDownloads,
    directDownloadUrl: project.directDownloadUrl 
  });
});

// POST increment diamond count
app.post('/api/projects/:id/diamond', async (req, res) => {
  const { id } = req.params;
  const db = await loadDatabase();
  if (!db) return res.status(500).json({ error: 'Database could not be loaded' });

  const project = db.projects.find((p: any) => p.id === id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  project.diamonds = (project.diamonds || 0) + 1;
  db.metadata.totalDiamonds = (db.metadata.totalDiamonds || 0) + 1;
  db.metadata.lastUpdated = new Date().toISOString();

  await saveDatabase(db);
  res.json({ 
    success: true, 
    diamonds: project.diamonds, 
    totalDiamonds: db.metadata.totalDiamonds 
  });
});

// POST replace/sync entire database (from JSON editor)
app.post('/api/database/sync', async (req, res) => {
  const newDb = req.body;
  if (!newDb || !Array.isArray(newDb.projects)) {
    return res.status(400).json({ error: 'Invalid JSON schema: must have a "projects" array' });
  }

  // Ensure metadata is consistent
  newDb.metadata = {
    appName: newDb.metadata?.appName || 'Dripjects',
    owner: newDb.metadata?.owner || 'Saphal',
    lastUpdated: new Date().toISOString(),
    version: newDb.metadata?.version || '1.0.0',
    totalProjects: newDb.projects.length,
    totalDownloads: newDb.projects.reduce((sum: number, p: any) => sum + (Number(p.downloads) || 0), 0),
    totalDiamonds: newDb.projects.reduce((sum: number, p: any) => sum + (Number(p.diamonds) || 0), 0),
  };

  // Ensure every project has directDownloadUrl calculated
  newDb.projects = newDb.projects.map((p: any) => ({
    ...p,
    directDownloadUrl: p.googleDriveUrl ? computeDirectDownloadUrl(p.googleDriveUrl) : (p.directDownloadUrl || '')
  }));

  const saved = await saveDatabase(newDb);
  if (!saved) return res.status(500).json({ error: 'Failed to write projects.json' });

  res.json({ success: true, database: newDb });
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
    console.log(`Dripjects server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
