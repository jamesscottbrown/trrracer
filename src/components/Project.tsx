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
import { relative } from 'path/posix';
import ArtifactDetailWindow from './ArtifactDetailWindow';

interface ProjectProps {
  folderPath: string;
}

const Project = (ProjectPropValues: ProjectProps) => {
  
  const { folderPath } = ProjectPropValues;
  const [{ projectData }, dispatch] = useProjectState();
  const [viewType, setViewType] = useState<string>('activity view');
  const [selectedArtifactIndex, setSelectedArtifactIndex] = useState<any>(null);
  const [selectedArtifactEntry, setSelectedArtifactEntry] = useState<any>(null);
  const [reversedOrder, setReversedOrder] = useState<boolean>(true);
  const [newTitle, setNewTitle] = useState<string>(projectData.title);



  if (viewType === 'activity view') {

    return (
      
      <div style={{height: '100vh', position:'fixed', top:0, bottom:0}}>
      <TopBar  
        projectData={projectData}
        folderPath={folderPath}
        viewType={viewType}
        setViewType={setViewType}
        reversedOrder={reversedOrder}
        setReversedOrder={setReversedOrder}
        setNewTitle={setNewTitle}/>
      <Flex position={'relative'} top={220}>
      <LeftSidebar projectData={projectData}></LeftSidebar>
      <CenterView projectEntries={projectData.entries} folderPath={folderPath}></CenterView>
      <Box flex="1.1" h='calc(100vh - 250px)' overflowY={'auto'}>
        <ProjectListView
          projectData={projectData}
          folderPath={folderPath}
          // viewType={viewType}
          reversedOrder={reversedOrder}
          setViewType={setViewType}
          setSelectedArtifactIndex={setSelectedArtifactIndex}
          setSelectedArtifactEntry={setSelectedArtifactEntry}
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
      </div>
    );
  }

  if (viewType === 'detail view') {
    return (
      <ArtifactDetailWindow 
      selectedArtifactIndex={selectedArtifactIndex} 
      setSelectedArtifactIndex={setSelectedArtifactIndex} 
      setSelectedArtifactEntry={setSelectedArtifactEntry} 
      selectedArtifactEntry={selectedArtifactEntry} 
      setViewType={setViewType} 
      folderPath={folderPath}
      projectData={projectData}
      />
    
      
    
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
 
};

export default Project;
