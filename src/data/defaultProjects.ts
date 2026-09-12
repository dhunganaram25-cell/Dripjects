import { ProjectsDatabase, WebsitePrivData, DatabaseMetadata } from '../types';
import projectsData from '../../data/projects.json';
import privData from '../../data/priv.json';

export const initialPrivData: WebsitePrivData = privData as WebsitePrivData;

export const initialProjectsMetadata: DatabaseMetadata = {
  appName: initialPrivData.appName || 'Dripjects',
  owner: initialPrivData.owner || 'ItzDrifter',
  lastUpdated: initialPrivData.lastUpdated || new Date().toISOString(),
  version: initialPrivData.version || '1.2.0',
  totalProjects: (projectsData.projects ? projectsData.projects.length : 1),
  totalDownloads: 0,
  totalDiamonds: 0,
};

export const initialProjectsDatabase: ProjectsDatabase = {
  metadata: initialProjectsMetadata,
  projects: ((projectsData as any).projects || projectsData) as any,
};
