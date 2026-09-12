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

export type ProjectStatus = 
  | '100% Complete' 
  | '90% Almost Done' 
  | '75% Major Update' 
  | '50% Work in Progress' 
  | 'Beta' 
  | 'Alpha';

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

export interface ProjectVersion {
  version: string;
  versionName?: string;
  gameVersion: string;
  releaseDate: string;
  status: ProjectStatus;
  isLatest?: boolean;
  fileSize: string;
  zipPassword?: string;
  googleDriveUrl: string;
  directDownloadUrl: string;
  changelogNotes: string[];
  requirements?: string[];
  requiredMods?: RequiredMod[];
  downloadCount?: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: Exclude<ProjectCategory, 'all'>;
  version: string;
  latestVersion?: string;
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
  versions: ProjectVersion[];
  diamonds: number;
  downloads: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  zipPassword?: string;
  requirements?: string[];
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

export interface WebsitePrivData {
  appName: string;
  siteName: string;
  tagline: string;
  owner: string;
  version: string;
  lastUpdated: string;
  stats?: {
    totalProjects?: number;
    totalDownloads?: number;
    totalDiamonds?: number;
  };
  downloadPolicies?: {
    requireAuthForDownload?: boolean;
    freeForAll?: boolean;
  };
  branding?: {
    logoText?: string;
    badge?: string;
    accentColor?: string;
  };
}

export interface ProjectsDatabase {
  metadata: DatabaseMetadata;
  projects: Project[];
}

export interface AppDatabaseState {
  metadata: DatabaseMetadata;
  priv: WebsitePrivData;
  projects: Project[];
}
