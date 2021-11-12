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
import TopBar from './TopBar';
import ProjectBinView from './ProjectBinView';
import TopicProjectListView from './TopicProjectListView';
import ConceptEvo from './ConceptEvo';
import ProjectGridView from './ProjectGridView';
import { useProjectState } from './ProjectContext';

interface ProjectProps {
  folderPath: string;
}

const Project = (ProjectPropValues: ProjectProps) => {
  // const { projectData, folderPath } = ProjectPropValues;

  // const [viewType, setViewType] = useState<string>('concepts/list');

  // if (viewType === 'concepts/list') {
  //   return (
  //     <div>
  //     <TopBar  
  //       projectData={projectData}
  //       folderPath={folderPath}
  //       viewType={viewType}
  //       setViewType={setViewType}/>
  //     <ProjectListView
  //       projectData={projectData}
  //       folderPath={folderPath}
  //       viewType={viewType}
  //       setViewType={setViewType}
  //     />
  //     </div>
  //   );
  // }

  // if (viewType === 'topics/list') {
  //   return (
  //     <div>
  //     <TopBar  
  //       projectData={projectData}
  //       folderPath={folderPath}
  //       viewType={viewType}
  //       setViewType={setViewType}/>
  //     <TopicProjectListView
  //       projectData={projectData}
  //       folderPath={folderPath}
  //       viewType={viewType}
  //       setViewType={setViewType}
  //     />
  //     </div>
  //   );
  // }

  // if (viewType === 'timeline') {
  //   return (
  //     <div>
  //     <TopBar  
  //       projectData={projectData}
  //       folderPath={folderPath}
  //       viewType={viewType}
  //       setViewType={setViewType}/>
  //     <ProjectTimelineView
  //       projectData={projectData}
  //       folderPath={folderPath}
  //       viewType={viewType}
  //       setViewType={setViewType}
  //     />
  //     </div>
  //   );
  // }

  // if (viewType === 'concept evolution') {
  //   return (
  //     <div>
  //     <TopBar  
  //       projectData={projectData}
  //       folderPath={folderPath}
  //       viewType={viewType}
  //       setViewType={setViewType}/>
        
  //       <ConceptEvo></ConceptEvo>
  //     </div>
  //   );
  // }

  // if (viewType === 'bin') {
  //   return (
  //     <div>
  //     <TopBar  
  //       projectData={projectData}
  //       folderPath={folderPath}
  //       viewType={viewType}
  //       setViewType={setViewType}/>
  //     <ProjectBinView
  //       projectData={projectData}
  //       folderPath={folderPath}
  //       viewType={viewType}
  //       setViewType={setViewType}
  //     />
  //     </div>
  //   );
  // }
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
