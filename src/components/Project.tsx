/* eslint no-console: off */

import React, { useEffect, useState } from 'react';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Editable,
  EditablePreview,
  EditableInput,
} from '@chakra-ui/react';

import ProjectListView from './ProjectListView';
import ProjectTimelineView from './ProjectTimelineView';
import ProjectGridView from './ProjectGridView';
import { useProjectState } from './ProjectContext';

interface ProjectProps {
  folderPath: string;
}

const Project = (ProjectPropValues: ProjectProps) => {
  const { folderPath } = ProjectPropValues;
  const [{ projectData }, dispatch] = useProjectState();

  const [newTitle, setNewTitle] = useState<string>(projectData.title);

  // Update title when projectData changes.
  useEffect(() => {
    setNewTitle(projectData.title);
  }, [projectData]);

  return (
    <>
      <Heading as="h1">
        <Editable
          /* defaultValue={projectData.title} */
          value={newTitle}
          onChange={(val) => setNewTitle(val)}
          onCancel={() => setNewTitle(projectData.title)}
          onSubmit={(val) => dispatch({ type: 'UPDATE_TITLE', title: val })}
        >
          <EditablePreview />
          <EditableInput />
        </Editable>
      </Heading>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>List View</Tab>
          <Tab>Timeline View</Tab>
          <Tab>Grid View</Tab>
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

          <TabPanel>
            <ProjectGridView
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
