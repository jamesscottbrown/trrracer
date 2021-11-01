/* eslint no-console: off */

import React from 'react';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
} from '@chakra-ui/react';

import { ProjectType } from './types';
import ProjectListView from './ProjectListView';
import ProjectTimelineView from './ProjectTimelineView';

interface ProjectProps {
  projectData: ProjectType;
  folderPath: string;
}

const Project = (ProjectPropValues: ProjectProps) => {
  const { projectData, folderPath } = ProjectPropValues;

  return (
    <>
      <Heading as="h1">{projectData.title}</Heading>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>List View</Tab>
          <Tab>Timeline View</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <ProjectListView
              projectData={projectData}
              folderPath={folderPath}
            />
          </TabPanel>

          <TabPanel>
            <ProjectTimelineView
              projectData={projectData}
              folderPath={folderPath}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );

  return null;
};

export default Project;
