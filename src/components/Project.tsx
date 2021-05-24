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

  const [viewType, setViewType] = useState('list');

  if (viewType === 'list') {
    return (
      <ProjectListView
        projectData={projectData}
        folderPath={folderPath}
        setViewType={setViewType}
      />
    );
  }

  if (viewType === 'timeline') {
    return (
      <ProjectTimelineView
        projectData={projectData}
        folderPath={folderPath}
        setViewType={setViewType}
      />
    );
  }

  return null;
};

export default Project;
