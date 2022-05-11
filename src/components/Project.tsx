/* eslint no-console: off */
import React, { useEffect, useState } from 'react';
import { Flex, Box, Tag, TagLabel } from '@chakra-ui/react';
import ProjectListView from './ProjectListView';
import TopBar from './TopBar';
import { useProjectState } from './ProjectContext';
import LeftSidebar from './LeftSidebar';
import ArtifactDetailWindow from './ArtifactDetailWindow';
import { EntryType } from './types';
import QueryView from './QueryView';
import BubbleVis from './BubbleVis';
import PaperView from './PaperView';
import AddEntryForm from './AddEntryForm';

interface ProjectProps {
  folderPath: string;
}

const ResearchThreadTypeTags = (rttt:any) => {

  const {fromTop, dispatch, filterRT, researchThreads, threadTypeFilterArray} = rttt;

  let chosenThread = filterRT ? researchThreads.research_threads.filter(f => f.title === filterRT.title)[0] : null;
  let threadTypeGroups = threadTypeFilterArray.map((ty)=> {
    ty.matches = ty.type === 'tags' ?  (filterRT? filterRT.associatedKey : null) : chosenThread?.evidence.filter(f => f.type === ty.type);
    return ty;
  });

  return (
    <Box
    style={{
      width:'100%',
      zIndex:5000,
      position:'fixed',
      top: filterRT ? 70 : -50
    }}
  >
  {filterRT && (
    <Flex style={{
      backgroundColor:'#fff',
      paddingBottom:'20px',
      paddingTop:'20px',
      paddingLeft:'40px',
      paddingRight:'20px',
      alignContent:"space-around",
      alignItems:"center",
      alignSelf:"center"
    }}>
    {threadTypeGroups.map((tg, i)=> (
      <Tag
      key={`r-t-t-t-i${i}`}
      style={{
        marginRight:'15px',
        cursor:'pointer',
        backgroundColor: chosenThread.color,
        color: chosenThread.color === '#3932a3' ? '#fff' : 'black',
        opacity: (tg.show && tg.matches.length > 0) ? 1 : 0.4,
      }}
      onClick={()=>{
        let temp = threadTypeFilterArray.map(m => {
          if(m.type === tg.type){
            m.show ? m.show = false : m.show = true;
          }
          return m;
        })
        dispatch({ type: 'UPDATE_RT_TYPE_SHOWN', threadTypeFilterArray: temp })
      }}
      >
        <TagLabel>
          {`${tg.type} : ${tg.matches.length}`}
        </TagLabel>
        </Tag> 
    ))
    }
    </Flex> 
  )}</Box>
  )
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
    }, dispatch
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
  const [hideByDefault, setHideByDefault] = useState<boolean>(false);
  const [addEntrySplash, setAddEntrySplash] = useState<boolean>(false);

  const fromTop = ((filterTags.length > 0) || (filterType != null) || (filterRT != null)) ? 110 : 70;

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
          setHideByDefault={setHideByDefault}
          hideByDefault={hideByDefault}
          addEntrySplash={addEntrySplash}
          setAddEntrySplash={setAddEntrySplash}
        />
        <Flex position="relative" top={`${fromTop}px`}>
          <LeftSidebar fromTop={fromTop} />
          <BubbleVis
            fromTop={fromTop}
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
        
          {
            addEntrySplash && (
                <AddEntryForm setAddEntrySplash={setAddEntrySplash} />
              )
          }
         
          {
            (filteredActivities.length != projectData.entries.length || !hideByDefault) && (
              <Box flex="1.5" h={`calc(100vh - ${(fromTop + 5)}px)`} overflowY="auto">
                <ResearchThreadTypeTags fromTop={fromTop} dispatch={dispatch} filterRT={filterRT} researchThreads={researchThreads} threadTypeFilterArray={threadTypeFilterArray} />
                
                    <ProjectListView
                      projectData={projectData}
                      filteredActivities={filteredActivities}
                      setViewType={setViewType}
                      hoverActivity={hoverActivity}
                    />
                  
              </Box>
            )
          }
        
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
