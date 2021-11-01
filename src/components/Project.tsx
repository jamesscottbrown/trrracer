/* eslint no-console: off */

import React, { useState } from 'react';

import { ProjectType } from './types';
import ProjectListView from './ProjectListView';
import ProjectTimelineView from './ProjectTimelineView';
import TopBar from './TopBar';
import ProjectBinView from './ProjectBinView';
import TopicProjectListView from './TopicProjectListView';
import ConceptEvo from './ConceptEvo';

interface ProjectProps {
  projectData: ProjectType;
  folderPath: string;
}

const Project = (ProjectPropValues: ProjectProps) => {
  const { projectData, folderPath } = ProjectPropValues;

  const [viewType, setViewType] = useState<string>('concepts/list');

  if (viewType === 'concepts/list') {
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

  if (viewType === 'topics/list') {
    return (
      <div>
      <TopBar  
        projectData={projectData}
        folderPath={folderPath}
        viewType={viewType}
        setViewType={setViewType}/>
      <TopicProjectListView
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

  if (viewType === 'concept evolution') {
    return (
      <div>
      <TopBar  
        projectData={projectData}
        folderPath={folderPath}
        viewType={viewType}
        setViewType={setViewType}/>
        
        <ConceptEvo></ConceptEvo>
      </div>
    );
  }

  if (viewType === 'bin') {
    return (
      <div>
      <TopBar  
        projectData={projectData}
        folderPath={folderPath}
        viewType={viewType}
        setViewType={setViewType}/>
      <ProjectBinView
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
