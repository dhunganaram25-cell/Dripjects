/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Project } from '../types';
import { useProjectThumbnail } from '../utils/thumbnailHelper';

interface ProjectThumbnailProps {
  project: Project;
  className?: string;
  alt?: string;
}

export const ProjectThumbnail: React.FC<ProjectThumbnailProps> = ({
  project,
  className = 'w-full h-full object-cover',
  alt,
}) => {
  const { 
    src, 
    handleImageError, 
    handleImageLoad 
  } = useProjectThumbnail(project);

  return (
    <img
      src={src}
      alt={alt || project.title}
      onError={handleImageError}
      onLoad={handleImageLoad}
      referrerPolicy="no-referrer"
      className={className}
    />
  );
};
