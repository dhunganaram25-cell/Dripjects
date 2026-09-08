export type ProjectCategory = 
  | 'all'
  | 'maps'
  | 'texture-packs'
  | 'mods'
  | 'datapacks'
  | 'skins'
  | 'schematics'
  | 'tools'
  | 'other';

export type ProjectStatus = '100% Complete' | '90% Almost Done' | '75% Major Update' | '50% Work in Progress' | 'Beta' | 'Alpha';

export interface ProjectChangelog {
  version: string;
  date: string;
  notes: string[];
}

export interface RequiredMod {
  name: string;
  url: string;
  version?: string;
  description?: string;
  required?: boolean;
}

export interface MirrorLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  category: Exclude<ProjectCategory, 'all'>;
  version: string;
  gameVersion: string;
  status: ProjectStatus;
  completionPercentage: number;
  googleDriveUrl: string;
  directDownloadUrl: string;
  fileSize: string;
  bannerImage: string;
  youtubeVideoUrl?: string;
  galleryImages: string[];
  description: string;
  features: string[];
  installation: string;
  changelog: ProjectChangelog[];
  diamonds: number;
  downloads: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  zipPassword?: string;
  requiredMods?: RequiredMod[];
  mirrorLinks?: MirrorLink[];
  featured?: boolean;
}

export interface DatabaseMetadata {
  appName: string;
  owner: string;
  lastUpdated: string;
  version: string;
  totalProjects: number;
  totalDownloads: number;
  totalDiamonds: number;
}

export interface ProjectsDatabase {
  metadata: DatabaseMetadata;
  projects: Project[];
}
