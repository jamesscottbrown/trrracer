/* eslint no-console: off */
import React, { useEffect, useState } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import ProjectListView from './ProjectListView';
import TopBar from './TopBar';
import { useProjectState } from './ProjectContext';
import LeftSidebar from './LeftSidebar';
import ArtifactDetailWindow from './ArtifactDetailWindow';
import { EntryType } from './types';
import QueryView from './QueryView';
import BubbleVis from './BubbleVis';
import PaperView from './PaperView';

interface ProjectProps {
  folderPath: string;
}

const Project = (ProjectPropValues: ProjectProps) => {
  const { folderPath } = ProjectPropValues;
  const [
    {
      projectData,
      filterTags,
      filterType,
      filterDates,
      filterQuery,
      filterRT,
      threadTypeFilterArray,
      researchThreads
    },
  ] = useProjectState();
  const [viewType, setViewType] = useState<string>('overview');
  const [reversedOrder, setReversedOrder] = useState<boolean>(true);
  const [newTitle, setNewTitle] = useState<string>(projectData.title);
  const [filteredActivities, setfilteredActivities] = useState(
    projectData.entries
  );
  const [hoverActivity, setHoverActivity] = useState(projectData.entries[0]);
  const [groupBy, setGroupBy] = useState(null);
  const [splitBubbs, setSplitBubbs] = useState(false);
  const [defineEvent, setDefineEvent] = useState<boolean>(false);

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
          if (filterType.includes('undefined')) {
            return entryData.files
              .map((m: any) => !m.artifactType || m.artifactType === '')
              .includes(true);
          }
          return entryData.files
            .map((m: any) => m.artifactType)
            .includes(filterType);
        }
        return entryData;
      })
      .map((e: EntryType, index: number) => ({ ...e, index }));

    console.log('filterRT in project LOOK HERE', filterRT);

    const rtFiltered = typeFiltered.filter((entryData: any) => {
      if (filterRT) {
        return (
          filterRT.key.includes(entryData.title) ||
          filterRT.associatedKey.includes(entryData.title)
        );
      }
      return typeFiltered;
    });

    const rtTypesFiltered = rtFiltered.filter((entryData: any) => {
      if (filterRT) {
        let nono = [];
        let evidence = researchThreads?.research_threads.filter(f => f.title === filterRT.title)[0].evidence;
        
        threadTypeFilterArray.forEach((ty, i)=> {
          if(!ty.show){
            if(ty.type != 'tags'){
              let exclude = evidence?.filter(e => e.type === ty.type).map(m => m.activityTitle);
              nono = [...nono, exclude];
              
            }else{
              nono = [...nono, ...filterRT.associatedKey.filter(as => filterRT.key.indexOf(as) === -1)]
            }
          }
        });
        console.log('NONO', nono)
        return (
          nono.indexOf(entryData.title) === -1 
        );
      }
      return typeFiltered;
    });

    const timeFiltered =
      filterDates[0] != null && filterDates[1] != null
        ? rtTypesFiltered.filter(
            (f) =>
              new Date(f.date) >= filterDates[0] &&
              new Date(f.date) <= filterDates[1]
          )
        : rtTypesFiltered;

    timeFiltered.sort(
      (a, b) =>
        (reversedOrder ? -1 : +1) *
        (Number(new Date(a.date)) - Number(new Date(b.date)))
    );

    const queryFiltered =
      filterQuery != null
        ? timeFiltered.filter((f) => filterQuery.includes(f.title))
        : timeFiltered;

    setfilteredActivities(queryFiltered);
  }, [
    projectData.entries,
    filterTags,
    filterType,
    filterDates,
    filterRT,
    filterQuery,
    threadTypeFilterArray,
  ]);

  if (viewType === 'query') {
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
          <LeftSidebar setGroupBy={setGroupBy} setSplitBubbs={setSplitBubbs} />
          <BubbleVis
            filteredActivities={filteredActivities}
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
    );
  }
  if (viewType === 'detail view') {
    return (
      <ArtifactDetailWindow
        setViewType={setViewType}
        folderPath={folderPath}
        projectData={projectData}
        filteredActivities={projectData.entries}
      />
    );
  }
  if (viewType === 'overview') {
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
          defineEvent={defineEvent}
          setDefineEvent={setDefineEvent}
        />
        <Flex position="relative" top={'100px'}>
          <LeftSidebar />
          <BubbleVis
            filteredActivities={filteredActivities}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            splitBubbs={splitBubbs}
            setSplitBubbs={setSplitBubbs}
            setHoverActivity={setHoverActivity}
            flexAmount={2}
            defineEvent={defineEvent}
            setDefineEvent={setDefineEvent}
          />
          <Box flex="1.5" h="calc(100vh - 130px)" overflowY="auto">
            <ProjectListView
              projectData={projectData}
              filteredActivities={filteredActivities}
              setViewType={setViewType}
              hoverActivity={hoverActivity}
            />
          </Box>
        </Flex>
      </div>
    );
  }
  if (viewType === 'explore paper') {
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
        <PaperView folderPath={folderPath} />
      </div>
    );
  }
};

export default Project;
