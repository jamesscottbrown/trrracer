/* eslint no-console: off */

import React, { useEffect, useState } from 'react';
// import { StyleSheet, Text, View } from "react-native";
import {
  Flex,
  Box
} from '@chakra-ui/react';

import ProjectListView from './ProjectListView';
import ProjectTimelineView from './ProjectTimelineView';
import TopBar from './TopBar';
import { useProjectState } from './ProjectContext';
import CenterView from './CenterView';
import LeftSidebar from './LeftSidebar';

interface ProjectProps {
  folderPath: string;
}

const Project = (ProjectPropValues: ProjectProps) => {
  // const { projectData, folderPath } = ProjectPropValues;
  const { folderPath } = ProjectPropValues;
  const [{ projectData }, dispatch] = useProjectState();
  const [viewType, setViewType] = useState<string>('activity view');
  const [reversedOrder, setReversedOrder] = useState<boolean>(true);

  console.log('projectrData',projectData)

  if (viewType === 'activity view') {

    return (
      
      <div>
      <TopBar  
        projectData={projectData}
        folderPath={folderPath}
        viewType={viewType}
        setViewType={setViewType}/>
      <Flex>
      <LeftSidebar projectData={projectData}></LeftSidebar>
      <CenterView projectEntries={projectData.entries}></CenterView>
      <Box flex=".5" bg='green.500' maxWidth='25%'>
        <ProjectListView
            projectData={projectData}
            folderPath={folderPath}
            viewType={viewType}
            reversedOrder={reversedOrder}
            setViewType={setViewType}
            />
      </Box>
      </Flex>
      </div>
    );
  }
  if (viewType === 'tag view') {
    return (
      <div>
      <TopBar  
        projectData={projectData}
        folderPath={folderPath}
        viewType={viewType}
        setViewType={setViewType}/>
      {/* <ProjectListView
        projectData={projectData}
        folderPath={folderPath}
        viewType={viewType}
        setViewType={setViewType}
      /> */}
      </div>
    );
  }

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


  console.log('IN PROJECT',projectData);

  const [newTitle, setNewTitle] = useState<string>(projectData.title);

  // Update title when projectData changes.
  useEffect(() => {
    setNewTitle(projectData.title);
  }, [projectData]);

  // return (
    // <>


    {/* <TopBar projectData={projectData} folderPath={folderPath}></TopBar> */}
      {/* <Tabs variant="enclosed">
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
      </Tabs> */}
    // </>
  // );

  // return null;
};

export default Project;
