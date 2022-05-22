import React, { useState } from 'react';
import { Box, Button, Divider, Input, Popover, PopoverBody, PopoverContent, PopoverTrigger, Textarea } from '@chakra-ui/react';
import { FaPlus, FaFillDrip } from 'react-icons/fa';
import { GiCancel, GiSewingString } from 'react-icons/gi';
import * as d3 from 'd3';
import { useProjectState } from './ProjectContext';

import type { EntryType, ResearchThread } from './types';
import { BiTrash } from 'react-icons/bi';


export const jitter = (val: any) => Math.random() * val;

type MiniTimelineProps = {
  researchT: any;
  activities: EntryType[];
};

const MiniTimline = (props: MiniTimelineProps) => {
  const { researchT, activities } = props;

  const lilSVG = React.useRef(null);

  React.useEffect(() => {
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
  researchTs: ResearchThread[];
  viewType: string; // TODO: tighten to specific values
};

const ThreadNav = (threadProps: ThreadNavProps) => {
  const { researchTs, viewType } = threadProps;
  const [{ projectData, selectedArtifactIndex, selectedThread }, dispatch] =
    useProjectState();

  const checkIfSelectThread = (i: any) => {
    if (selectedThread != null) {
      if (i != selectedThread) {
        return 0.5;
      }
      return 1;
    }
    return 1;
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
        {researchTs ? (
          <Box style={{ 
            marginTop: 10, 
            marginBottom: 10,
          
            }}>
            {researchTs.map((rt: any, i: number) => (
              <div
                key={`rt-${i}`}
                style={{
                  borderLeft: '2px solid gray',
                  paddingLeft: 3,
                  opacity: checkIfSelectThread(i),
                  marginTop:10,
                  marginBottom:10
                }}
              >
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
                    style={{display:'inline'}}
                    onClick={()=> {
                      dispatch({ type: 'DELETE_THREAD', deleteThread: rt.rt_id });
                    }}
                    >
                    <BiTrash style={{display:'inline'}} />
                  </Button></span>
                  </div>
                  <span
                      style={{fontSize:10}}
                  >{`${rt.evidence.length} pieces of evidence`}</span>
             
                  <MiniTimline researchT={rt} activities={projectData.entries} />
               
                  <div
                    style={{paddingBottom:10,
                    fontSize:11
                    }}
                  >{rt.description}</div>
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
                    console.log('creat threaddd', threadName, description);
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
