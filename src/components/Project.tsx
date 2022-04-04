/* eslint no-console: off */

import React, { useEffect, useState } from 'react';
import { Flex, Box, UnorderedList, ListItem, Button } from '@chakra-ui/react';

import ProjectListView from './ProjectListView';
import TopBar from './TopBar';
import { useProjectState } from './ProjectContext';
import CenterView from './CenterView';
import LeftSidebar from './LeftSidebar';
import ArtifactDetailWindow from './ArtifactDetailWindow';
import ThreadView from './TheadView';
import ProjectTimelineView from './ProjectTimelineView';
import { EntryType } from './types';
import ActivitytoThread from './ActivityToThread';
import QueryView from './QueryView';
import BubbleVis from './BubbleVis';
import PaperView from './PaperView';
import ForceMagic from '../ForceMagic';

const StupidTooltip = (props:any) => {
  
  const {posX, posY, showTool, setShowTool, hoverActivity, setHoverActivity} = props;
  const [{ highlightedTag, highlightedType, researchThreads }] =
  useProjectState();

  const [seeThreadAssign, setSeeThreadAssign] = useState(false);
  
  const tooltipRef = React.useRef(null);

  return(
    showTool ? (
      <div 
        ref={tooltipRef}
        style={{
          zIndex:9000000,
          position:'absolute', 
          top: posY, 
          left: posX, 
          padding:5,
          borderRadius:10, 
          backgroundColor: 'white'}}>
            {`${hoverActivity ? hoverActivity.title : ""}`}
            <div style={{backgroundColor:"white", color:"gray"}}>
   
            <div>
              {seeThreadAssign ? (
                <div>
                  {researchThreads && 
                  researchThreads.research_threads.length > 0 ? (
                    researchThreads.research_threads.map(
                      (rt: any, tIndex: number) => (
                        <React.Fragment key={`rt-${tIndex}`}>
                          <ActivitytoThread
                            thread={rt}
                            threadIndex={tIndex}
                            activity={hoverActivity}
                            activityIndex={hoverActivity.index}
                          />
                        </React.Fragment>
                      ))
              ) : (
                <span>no threads yet</span>
              )}
            </div> 
          ) : (
            <div>
              <span style={{ display: 'block' }}>Artifacts:</span>
              <UnorderedList>
                {hoverActivity.files.map((f: File, i: number) => (
                  <ListItem key={`f-${f.title}-${i}`}>{f.title}</ListItem>
                ))}
              </UnorderedList>
            </div>
          )}
        </div>
        <div>
          {seeThreadAssign ? ( 
            <Box>
              <Button onClick={() => setSeeThreadAssign(false)}>cancel</Button>
            </Box>
          ) : (
            <Button onClick={() => setSeeThreadAssign(true)}>
              Add this activity to a thread.
            </Button>
          )}
        </div>
      </div>

      </div>
    ): null
  )
} 

interface ProjectProps {
  folderPath: string;
}

const Project = (ProjectPropValues: ProjectProps) => {
  const { folderPath } = ProjectPropValues;
  const [{ projectData, filterTags, filterType, filterDates, filterQuery, filterRT, goBackView, researchThreads, artifactTypes }] = useProjectState();
  const [viewType, setViewType] = useState<string>('overview');
  const [reversedOrder, setReversedOrder] = useState<boolean>(true);
  const [newTitle, setNewTitle] = useState<string>(projectData.title);
  // const [timeFilter, setTimeFilter] = useState<any>(null);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(-1);
  const [filteredActivities, setfilteredActivities] = useState(projectData.entries);
  const [hoverActivity, setHoverActivity] = useState(projectData.entries[0]);
  const [showTool, setShowTool] = useState(false);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [groupBy, setGroupBy] = useState(null);
  const [splitBubbs, setSplitBubbs] = useState(false);
  
  // Update title when projectData changes.
  useEffect(() => {
    setNewTitle(projectData.title);
  }, [projectData]);                                                                                                                                        

  // Update title when projectData changes.
  useEffect(() => {
    const tagFiltered = projectData.entries
    .filter((entryData: any) => {
      return filterTags.every((requiredTag: string) =>
        entryData.tags.includes(requiredTag)
      );
    })
    .map((e, index) => ({ ...e, index }));
 
  const typeFiltered = tagFiltered
    .filter((entryData: any) => {
      if (filterType) {
        if(filterType.includes('undefined')){
          return entryData.files.map((m: any) => !m.artifactType || m.artifactType === "").includes(true);
        }else{
          return entryData.files.map((m: any) => m.artifactType).includes(filterType);
        }
        
      } else {
        return entryData;
      }
    })
    .map((e: EntryType, index: number) => ({ ...e, index }));

    let rtFiltered = typeFiltered.filter((entryData:any)=> {
      if(filterRT){
        return filterRT.key.includes(entryData.title);
      }else{
        return typeFiltered;
      }
    })

    let timeFiltered =
    filterDates[0] != null && filterDates[1] != null
      ? rtFiltered.filter(
          (f) =>
            new Date(f.date) >= filterDates[0] &&
            new Date(f.date) <= filterDates[1]
        )
      : rtFiltered;

      timeFiltered.sort(
      (a, b) =>
        (reversedOrder ? -1 : +1) *
        (Number(new Date(a.date)) - Number(new Date(b.date)))
    );
   
    let queryFiltered = 
        filterQuery != null ? 
          timeFiltered.filter((f)=> filterQuery.includes(f.title)) : timeFiltered;

      setfilteredActivities(queryFiltered);
    }, [projectData.entries, filterTags, filterType, filterDates, filterRT, filterQuery]); 

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
          filteredActivities={filteredActivities}
          setViewType={setViewType}
          reversedOrder={reversedOrder}
          setReversedOrder={setReversedOrder}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          filteredActivityNames={null}
        />
        <Flex position="relative" top={220}>
          <LeftSidebar />
          <CenterView
            projectEntries={projectData.entries}
            folderPath={folderPath}
          />
          <Box flex="1.1" h="calc(100vh - 250px)" overflowY="auto">
            <ProjectListView
              projectData={projectData}
              filteredActivities={filteredActivities}
              setViewType={setViewType}
              hoverActivity={hoverActivity}
              setPosX={setPosX}
              setPoY={setPosY}
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
          viewType={viewType}
          setViewType={setViewType}
          reversedOrder={reversedOrder}
          setReversedOrder={setReversedOrder}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          filteredActivityNames={filteredActivities.map(n => n.title)}
        />  
    
        <Flex position="relative" top={220}>
          <LeftSidebar />
          <Box flex="3.5" h="calc(100vh - 250px)">
          <ProjectTimelineView 
            projectData={projectData}
            filteredActivities={filteredActivities}
            folderPath={folderPath}
            selectedEntryIndex={selectedEntryIndex} 
            setSelectedEntryIndex={setSelectedEntryIndex}
            setHoverActivity={setHoverActivity}
            setShowTool={setShowTool}
          />
          </Box>
          <Box flex="1.5" h="calc(100vh - 250px)" overflowY="auto">
            <ProjectListView
              filteredActivities={filteredActivities}
              setViewType={setViewType}
              selectedEntryIndex={selectedEntryIndex} 
              setSelectedEntryIndex={setSelectedEntryIndex}
              hoverActivity={hoverActivity}
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
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          filteredActivityNames={null}
        />

        <ThreadView />
      </div>
    );
  }
  if (viewType === 'query') {
    return(
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
        viewType={viewType}
        folderPath={folderPath}
        filteredActivities={filteredActivities}
        setViewType={setViewType}
        reversedOrder={reversedOrder}
        setReversedOrder={setReversedOrder}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        filteredActivityNames={null}
      />
      <Flex position="relative" top={130}>
        <LeftSidebar setGroupBy={setGroupBy} setSplitBubbs={setSplitBubbs}/>
        <BubbleVis 
          filteredActivities={filteredActivities}
          projectData={projectData}
          groupBy={groupBy}
          splitBubbs={splitBubbs}
          setHoverActivity={setHoverActivity}
          flexAmount={2}
        />
        <Box flex="3" h="calc(100vh - 130px)" overflowY="auto">
          <QueryView 
            setViewType={setViewType} 
            filteredActivities={filteredActivities}
            projectData={projectData} 
           />
        </Box>
      </Flex>
    </div>
    )
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
  if(viewType === 'overview'){
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
          viewType={viewType}
          folderPath={folderPath}
          filteredActivities={filteredActivities}
          setViewType={setViewType}
          reversedOrder={reversedOrder}
          setReversedOrder={setReversedOrder}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          filteredActivityNames={null}
        />
        <Flex position="relative" top={130}>
          <LeftSidebar setGroupBy={setGroupBy} setSplitBubbs={setSplitBubbs}/>
          <BubbleVis 
            filteredActivities={filteredActivities}
            projectData={projectData}
            groupBy={groupBy}
            splitBubbs={splitBubbs}
            setHoverActivity={setHoverActivity}
            flexAmount={2}
          />
          <Box flex="1.5" h="calc(100vh - 130px)" overflowY="auto">
            <ProjectListView
              projectData={projectData}
              filteredActivities={filteredActivities}
              setViewType={setViewType}
              hoverActivity={hoverActivity}
              setPosX={setPosX}
              setPoY={setPosY}
            />
          </Box>
        </Flex>
      </div>
    );
  }
  if(viewType === 'explore paper'){
    return(
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
      newTitle={newTitle}
      setNewTitle={setNewTitle}
      filteredActivityNames={null}
    />
    <PaperView folderPath={folderPath}/> 
  </div>
    ) 
  }
};

export default Project;
