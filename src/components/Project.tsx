/* eslint no-console: off */

import React, { useState } from 'react';

import { ProjectType } from './types';
import ProjectListView from './ProjectListView';
import ProjectTimelineView from './ProjectTimelineView';
import TopBar from './TopBar';

interface ProjectProps {
  projectData: ProjectType;
  folderPath: string;
}

const Project = (ProjectPropValues: ProjectProps) => {
  const { projectData, folderPath } = ProjectPropValues;

  const [viewType, setViewType] = useState<string>('list');

  if (viewType === 'list') {
    return (
      <div>
      <TopBar  
        projectData={projectData}
        folderPath={folderPath}
        viewType={viewType}
        setViewType={setViewType}/>
      <ProjectListView
        projectData={projectData}
        folderPath={folderPath}
        viewType={viewType}
        setViewType={setViewType}
      />
      </div>
    );
  }

  if (viewType === 'timeline') {
    return (
      <div>
      <TopBar  
        projectData={projectData}
        folderPath={folderPath}
        viewType={viewType}
        setViewType={setViewType}/>
      <ProjectTimelineView
        projectData={projectData}
        folderPath={folderPath}
        viewType={viewType}
        setViewType={setViewType}
      />
      </div>
    );
  }

  return null;
};

export default Project;
