import { ProjectsDatabase } from '../types';
import projectsJson from '../../data/projects.json';

export const initialProjectsDatabase: ProjectsDatabase = projectsJson as unknown as ProjectsDatabase;

