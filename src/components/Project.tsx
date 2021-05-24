/* eslint no-console: off */

import React, { useState } from 'react';

import { ProjectType } from './types';
import ProjectListView from './ProjectListView';
import ProjectTimelineView from './ProjectTimelineView';

interface ProjectProps {
  projectData: ProjectType;
  folderPath: string;
}

const Project = (ProjectPropValues: ProjectProps) => {
  const { projectData, folderPath } = ProjectPropValues;

  const [viewType, setViewType] = useState<string>('list');

  if (viewType === 'list') {
    return (
      <ProjectListView
        projectData={projectData}
        folderPath={folderPath}
        viewType={viewType}
        setViewType={setViewType}
      />
    );
  }

  if (viewType === 'timeline') {
    return (
      <ProjectTimelineView
        projectData={projectData}
        folderPath={folderPath}
        viewType={viewType}
        setViewType={setViewType}
      />
    );
  }

  return null;
};

export default Project;
