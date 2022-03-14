/* eslint no-console: off */

import React, { useState } from 'react';
import { Flex, Box } from '@chakra-ui/react';

import ProjectListView from './ProjectListView';
import TopBar from './TopBar';
import { useProjectState } from './ProjectContext';
import CenterView from './CenterView';
import LeftSidebar from './LeftSidebar';
import ArtifactDetailWindow from './ArtifactDetailWindow';
import ThreadView from './TheadView';
import ProjectTimelineView from './ProjectTimelineView';

interface ProjectProps {
  folderPath: string;
}

const Project = (ProjectPropValues: ProjectProps) => {
  const { folderPath } = ProjectPropValues;
  const [{ projectData }] = useProjectState();
  const [viewType, setViewType] = useState<string>('timeline');
  const [reversedOrder, setReversedOrder] = useState<boolean>(true);
  const [newTitle, setNewTitle] = useState<string>(projectData.title);
  const [timeFilter, setTimeFilter] = useState<any>(null);

  if (viewType === 'activity view') {
    return (
      <div
        style={{
          height: '100vh',
          position: 'fixed',
          top: 0,
          bottom: 0,
          width: '100%',
        }}
      >
        <TopBar
          folderPath={folderPath}
          viewType={viewType}
          setViewType={setViewType}
          reversedOrder={reversedOrder}
          setReversedOrder={setReversedOrder}
          setNewTitle={setNewTitle}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
        />
        <Flex position="relative" top={220}>
          <LeftSidebar />
          <CenterView
            projectEntries={projectData.entries}
            folderPath={folderPath}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
          />
          <Box flex="1.1" h="calc(100vh - 250px)" overflowY="auto">
            <ProjectListView
              projectData={projectData}
              folderPath={folderPath}
              reversedOrder={reversedOrder}
              setViewType={setViewType}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
            />
          </Box>
        </Flex>
      </div>
    );
  }

  if (viewType === 'timeline') {
    return (
      <div
        style={{
          height: '100vh',
          position: 'fixed',
          top: 0,
          bottom: 0,
          width: '100%',
        }}
      >
        <TopBar
          folderPath={folderPath}
          viewType={viewType}
          setViewType={setViewType}
          reversedOrder={reversedOrder}
          setReversedOrder={setReversedOrder}
          setNewTitle={setNewTitle}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
        />
        <Flex position="relative" top={220}>
          <LeftSidebar />
          <ProjectTimelineView 
            projectData={projectData}
            folderPath={folderPath}
          />
          <Box flex="1.1" h="calc(100vh - 250px)" overflowY="auto">
            <ProjectListView
              projectData={projectData}
              folderPath={folderPath}
              reversedOrder={reversedOrder}
              setViewType={setViewType}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
            />
          </Box>
        </Flex>
      </div>
    );
  }

  if (viewType === 'research threads') {
    return (
      <div
        style={{
          height: '100vh',
          position: 'fixed',
          top: 0,
          bottom: 0,
          width: '100%',
        }}
      >
        <TopBar
          folderPath={folderPath}
          viewType={viewType}
          setViewType={setViewType}
          reversedOrder={reversedOrder}
          setReversedOrder={setReversedOrder}
          setNewTitle={setNewTitle}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
        />

        <ThreadView />
      </div>
    );
  }

  if (viewType === 'detail view') {
    return (
      <ArtifactDetailWindow
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
