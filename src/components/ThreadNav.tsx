import React, { useState } from 'react';
import { Badge, Box, Button, Divider, Input, Popover, PopoverBody, PopoverContent, PopoverTrigger, Tag, Textarea } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import * as d3 from 'd3';
import type { EntryType, ResearchThread } from './types';
import { BiTrash } from 'react-icons/bi';
import { MdCancel } from 'react-icons/md';
import { useProjectState } from './ProjectContextElectron';


export const jitter = (val: any) => Math.random() * val;

type MiniTimelineProps = {
  researchT: any;
  activities: EntryType[];
};

const MiniTimline = (props: MiniTimelineProps) => {
  const { researchT, activities } = props;

  const lilSVG = React.useRef(null);

  React.useEffect(() => {
    console.log('useEffect in Minitimeline rendering')
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(activities.map((m: any) => new Date(m.date))))
      .range([0, 150])
      .nice();

    // Create root container where we will append all other chart elements
    const svgEl = d3.select(lilSVG.current);
    svgEl.selectAll('*').remove(); // Clear svg content before adding new elements

    const svg = svgEl.append('g').attr('transform', `translate(0, 6)`);

    const circleG = svg.append('g').classed('circle-group', true);

    circleG.attr('transform', 'translate(0, 0)');

    circleG
      .selectAll('circle')
      .data(activities)
      .join('circle')
      .attr('cx', (d: any) => xScale(new Date(d.date)))
      .attr('cy', () => jitter(10))
      .attr('r', 3)
      .attr('fill', 'gray')
      .attr('fill-opacity', 0.1);

    circleG
      .selectAll('circle.associated')
      .data(
        researchT.tagged_activities && researchT.tagged_activities.length > 0
          ? researchT.tagged_activities.flatMap((fm: any) => fm.associatedActivities)
          : []
      )
      .join('circle')
      .attr('class', 'associated')
      .attr('cx', (d: any) => xScale(new Date(d.date)))
      .attr('cy', () => jitter(10))
      .attr('r', 3)
      .attr('fill', researchT.color)
      .attr('fill-opacity', 0.5);

    circleG
      .selectAll('circle.research')
      .data(researchT.evidence)
      .join('circle')
      .attr('class', 'research')
      .attr('cx', (d: any) => xScale(new Date(d.dob)))
      .attr('cy', () => jitter(10))
      .attr('r', 4.5)
      .attr('fill', researchT.color)
      .attr('fill-opacity', 1)
      .attr('stroke', '#ffffff');
  }, [activities]);

  return (
    <div style={{display:'inline-block', width:160}}>
      <svg ref={lilSVG} style={{ height: '20px', width: '100%' }} />
    </div>
  );
};

type ThreadNavProps = {
  viewType: string; // TODO: tighten to specific values
};

const ThreadNav = (threadProps: ThreadNavProps) => {
  const { viewType } = threadProps;
  const [{projectData, researchThreads, selectedThread}, dispatch] = useProjectState();

  const checkIfSelectThread = (i: any) => {
    if (selectedThread != null) {
      if (i != selectedThread) {
        return false;
      }
      return true;
    }
    return true;
  };

  const [showCreateThread, setShowCreateThread] = useState(false);
  const [threadName, setName] = React.useState(null);
  const [description, setDescription] = React.useState(null);

  const handleNameChange = (e: any) => {
    const inputValue = e.target.value;
    setName(inputValue);
  };
  const handleDescriptionChange = (e: any) => {
    const inputValue = e.target.value;
    setDescription(inputValue);
  };
  const headerStyle = { fontSize: '19px', fontWeight: 600, cursor: 'pointer' };

  const associatedTags = researchThreads?.research_threads.map((rt, i) => {
    let tags = rt.evidence.flatMap(fm => {
      let match = projectData.entries.filter(f => f.title === fm.activityTitle)[0].tags;
      return match});
    let groupTags = Array.from(d3.group(tags, d=> d));
    let sorted = groupTags.sort((a, b)=> b[1].length - a[1].length);

    return sorted.length > 10 ? sorted.slice(0, 10) : sorted;
  });

  console.log('associated tags', associatedTags);

  return (
    <Box>
      {(viewType === 'activity view' || viewType === 'overview') && (
        <div
          style={headerStyle}
        >
          <span style={{ display: 'inline' }}>Research Threads</span>
        </div>
      )}

      <Box>
        {researchThreads && researchThreads.research_threads ? (
          <Box style={{ 
            marginTop: 10, 
            marginBottom: 10,
            
            }}>
            {researchThreads.research_threads.map((rt: any, i: number) => (
              <div
                key={`rt-${i}`}
                style={{
                  borderLeft: '2px solid gray',
                  paddingLeft: 3,
                  opacity: checkIfSelectThread(i) ? 1 : .5,
                  marginTop:10,
                  marginBottom:10,
                  background: (checkIfSelectThread(i) && selectedThread !== null) ? `${rt.color}30` : '#fff',
                  borderRadius: 6
                }}
              >
              { (checkIfSelectThread(i) && selectedThread !== null) && (
                <div
                  title="Unselect Thread"
                  style={{
                    float:'right', 
                    cursor:"pointer",
                    width:30,
                    height:30,
                  }}
                  onClick={()=>
                    dispatch({
                      type: 'THREAD_FILTER',
                      filterRT: null,
                      selectedThread: null,
                    })}
                ><MdCancel size={30} /></div>
              )}
              <div style={{display:'inline'}}>
                <span
                  style={{ 
                    cursor: 'pointer', 
                    display:'inline',
                    fontSize:18,
                    fontWeight:600 
                  }}
                    onClick={() => {
                      dispatch({ type: 'THREAD_FILTER', filterRT:rt, selectedThread: i });
                    }}
                >
                  {`${rt.title} `}
                </span>
                <span>
                <Popover>
                    <PopoverTrigger>
                    <Button 
                      size={'xs'}
                      style={{display:'inline'}}
                    >Cite thread</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody>
                        copy this ref: {rt.rt_id}
                      </PopoverBody>
                    </PopoverContent>
                </Popover>
                </span>
              </div>
            <div style={{display:'inline', float:'right'}}>
              <span
                style={{display:'inline'}}
                >
                  <Button 
                    size={'xs'} 
                    bgColor={'#ff6863'} 
                    style={{display:'inline', margin:2}}
                    onClick={()=> {
                      dispatch({ type: 'DELETE_THREAD', deleteThread: rt.rt_id });
                    }}
                    >
                    <BiTrash style={{display:'inline'}} />
                  </Button></span>
                  </div>
                  <span
                      style={{fontSize:10, fontWeight: 800}}
                  >{`${rt.evidence.length} pieces of evidence`}</span>
             
                  <MiniTimline researchT={rt} activities={projectData.entries} />
               
                  <div
                    style={{paddingBottom:10,
                    fontSize:11
                    }}
                  >{rt.description}</div>
                  <div>
                    <span
                    style={{fontSize:9, display:'block', fontWeight:800}}
                    >{"Frequently occuring tags:"}</span>
                    {associatedTags && (associatedTags[i].map(at => (
                      <Badge
                        size={"xs"}
                        variant="outline"
                        style={{
                          margin:2, 
                          fontSize:10
                        }}
                      >{at[0]}</Badge>
                      )))}
                  </div>
                {/* {rt.associated_tags.map((t: any, i: number) => (
                  <div
                    key={`tag-${i}`}
                    style={{
                      backgroundColor: `${rt.color}50`,
                      fontSize: '9px',
                      display: 'inline-block',
                      margin: 1.5,
                      padding: 2,
                      borderRadius: 5,
                      // color: rt.color === '#3932a3' ? 'white' : 'black',
                    }}
                  >
                    {t}
                  </div>
                ))} */}
              
                <Divider />
              </div>
            
            
            ))}
          </Box>
        ) : (
          <span style={{ marginTop: 5, marginBottom: 5 }}>
            No research threads yet.
          </span>
        )}
      </Box>
      {viewType != 'detail' && (
        <>
          <Button
            style={{
              fontSize: '11px',
              borderRadius: 5,
              padding: 5,
              border: '1px solid gray',
            }}
            onClick={() =>
              showCreateThread
                ? setShowCreateThread(false)
                : setShowCreateThread(true)
            }
          >
            {showCreateThread ? 'Cancel thread' : `Start a thread `}
            <FaPlus style={{ paddingLeft: 5 }} />
          </Button>
          {showCreateThread && (
            <Box style={{ marginTop: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                <Input
                  placeholder="Name your thread."
                  onChange={handleNameChange}
                />
              </span>

              <Textarea
                placeholder="Describe what this thread is."
                onChange={handleDescriptionChange}
              />

              {/* {threadName && description && ( */}
                <Button
                  isActive={(threadName && description) ? true : false}
                  isDisabled={(threadName && description) ? false : true}
                  onClick={() => {
                    setName(null);
                    setDescription(null);
                    setShowCreateThread(false);
                    dispatch({
                      type: 'CREATE_THREAD',
                      threadName,
                      threadDescription: description,
                    });
                  }}
                >
                  CREATE
                </Button>
              {/* )} */}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ThreadNav;
