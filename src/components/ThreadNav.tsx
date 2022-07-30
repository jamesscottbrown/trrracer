import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Editable,
  EditableInput,
  EditablePreview,
  FormControl,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Select,
  Textarea,
} from '@chakra-ui/react';
import { FaEdit, FaPlus } from 'react-icons/fa';
import * as d3 from 'd3';
import { BiTrash } from 'react-icons/bi';
import { MdCancel } from 'react-icons/md';
import ReactMde from 'react-mde';
import Showdown from 'showdown';
import { IconEye, IconEyeOff } from '@tabler/icons';

import { useProjectState } from './ProjectContext';
import type { EntryType } from './types';

export const jitter = (val: any) => Math.random() * val;

type MiniTimelineProps = {
  researchT: any;
  activities: EntryType[];
};

export const CreateThreadComponent = (props:any) => {

  const {
    setShowCreateThread
  } = props
  const [{projectData},dispatch] = useProjectState();

  const [threadName, setName] = useState(null);
  const [description, setDescription] = useState(null);

  const handleNameChange = (e: any) => {
    const inputValue = e.target.value;
    setName(inputValue);
  };
  const handleDescriptionChange = (e: any) => {
    const inputValue = e.target.value;
    setDescription(inputValue);
  };

  return(
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
      <Button
        isActive={threadName && description ? true : false}
        isDisabled={threadName && description ? false : true}
        onClick={() => {
          let actTitle = `Created thread: ${threadName}`;
          setName(null);
          setDescription(null);
          setShowCreateThread(false);
          dispatch({
            type: 'CREATE_THREAD',
            threadName,
            threadDescription: description,
            evidence: [
              {
                activityTitle: actTitle,
                activity_index: projectData.entries.length,
                dob: new Date(),
                rationale: 'Thread created',
                type: 'activity',
              },
            ],
          });

          dispatch({
            type: 'ADD_ENTRY',
            data: {
              title: actTitle,
              date: new Date(),
              description: description,
            },
          });
        }}
      >
        CREATE
      </Button>
    </Box>
  // )}
  )
}

const MiniTimline = (props: MiniTimelineProps) => {
  const { researchT, activities } = props;

  const lilSVG = React.useRef(null);

  const ex = d3.extent(activities.map((m: any) => new Date(m.date)));
  React.useEffect(() => {
    const xScale = d3
      .scaleTime()
      .domain([(ex[0] || new Date()) as Date, ex[1] || (new Date() as Date)])
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
          ? researchT.tagged_activities.flatMap(
              (fm: any) => fm.associatedActivities
            )
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
    <div style={{ display: 'inline-block', width: 160 }}>
      <svg ref={lilSVG} style={{ height: '20px', width: '100%' }} />
    </div>
  );
};

type ThreadNavProps = {
  viewType: string; // TODO: tighten to specific values
};

const EditableThread = (threadProps: any) => {
  const { index, threadData, setEditMode } = threadProps;
  const [{ researchThreads }, dispatch] = useProjectState();

  const filteredThreads = researchThreads?.research_threads.filter((f) => {
    const test = f.actions.map((m) => m.action);
    return test.indexOf('merge') === -1;
  });

  const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>(
    'preview'
  );
  const [mergeWindow, setMergeWindow] = useState(false);

  const handleChangeTab = (newTab: 'write' | 'preview') => {
    setSelectedTab(newTab);
  };

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });

  const otherThreads = researchThreads?.research_threads.filter(
    (_, i) => i !== index
  );
  const [description, setDescription] = useState(threadData.description);
  const [mergeTo, setMergeTo] = useState(otherThreads[0].title);

  const updateField = (
    threadIndex: number,
    fieldName: string,
    newValue: any
  ) => {
    dispatch({ type: 'UPDATE_THREAD_FIELD', threadIndex, fieldName, newValue });
  };

  return (
    <div>
      <div
        key={`rt-${index}`}
        style={{
          borderLeft: '2px solid gray',
          paddingLeft: 3,
          marginTop: 10,
          marginBottom: 10,
          borderRadius: 6,
        }}
      >
        <div style={{ display: 'inline' }}>
          <span
            style={{
              cursor: 'pointer',
              display: 'inline',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            <Editable
              defaultValue={threadData.title}
              onSubmit={(val) => updateField(index, 'title', val)}
            >
              <EditablePreview />
              <EditableInput />
            </Editable>
          </span>
          {!mergeWindow ? (
            <Button size="xs" onClick={() => setMergeWindow(true)}>
              Merge into Another
            </Button>
          ) : (
            <div>
              <Button size="xs" onClick={() => setMergeWindow(false)}>
                Cancel
              </Button>
              <Button
                size="xs"
                onClick={() => {
                  dispatch({
                    type: 'MERGE_THREADS',
                    toThread: mergeTo,
                    fromThread: threadData.title,
                  });
                }}
              >
                Confirm Merge
              </Button>
              <FormControl>
                <Select
                  onChange={(ev) => {
                    setMergeTo(ev.target.value);
                  }}
                  value={mergeTo}
                  width="max-content"
                >
                  {filteredThreads
                    ?.filter((_, i) => i !== index)
                    .map((m, j) => (
                      <option key={`option-${j}`}>{m.title}</option>
                    ))}
                </Select>
              </FormControl>
            </div>
          )}
        </div>
        <div style={{ display: 'inline', float: 'right' }}>
          <span style={{ display: 'inline' }}>
            <Button
              size="xs"
              style={{ display: 'inline' }}
              onClick={() => {
                setEditMode(null);
              }}
            >
              Go Back
            </Button>
            <Button
              size="xs"
              bgColor="#ff6863"
              style={{ display: 'inline', margin: 2 }}
              onClick={() => {
                dispatch({
                  type: 'DELETE_THREAD',
                  deleteThread: threadData.rt_id,
                });
              }}
            >
              <BiTrash style={{ display: 'inline' }} />
              DELETE
            </Button>
          </span>
        </div>
        <div style={{ paddingBottom: 10, fontSize: 11 }}>
          <div className="markdownEditorContainer">
            <ReactMde
              value={description}
              onChange={setDescription}
              selectedTab={selectedTab}
              onTabChange={handleChangeTab}
              generateMarkdownPreview={(markdown) =>
                Promise.resolve(converter.makeHtml(markdown))
              }
            />
            {description !== threadData.description && (
              <>
                <b style={{ color: 'red' }}>
                  You have made unsaved changes to this field. These will be
                  lost if you switch to editing a different field.
                </b>
                <Button
                  onClick={() => updateField(index, 'description', description)}
                >
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
        <Divider />
      </div>
    </div>
  );
};

const ThreadBanner = (props:any) => {

  const {index, rt, expanded, setExpanded} = props;
  const [{isReadOnly, filterRT}, dispatch] = useProjectState();
  const [bannerColor, setBannerColor] = useState(index != filterRT?.rtIndex ? '#fff' : rt.color);

  return (
    <div
      style={{
        display: isReadOnly ? 'block' : 'inline',
      }}
      onMouseEnter={()=> {
        if(index != filterRT?.rtIndex) setBannerColor(`${rt.color}20`);
      }}
      onMouseLeave={()=> {
        if(index != filterRT?.rtIndex) setBannerColor('#fff');
      }}
      key={`banner-${index}`}
    >
      <div style={{
        border:`1.5px solid ${rt.color}`, 
        padding:4, 
        borderRadius:5,
        backgroundColor: bannerColor
        }}>
        <span
          style={{
            cursor: 'pointer',
            display: 'inline',
            fontSize: 18,
            fontWeight: 600,
            color:'#3a3b3c'
          }}
          onClick={() => {
            dispatch({
              type: 'THREAD_FILTER',
              filterRT: rt,
              rtIndex: index,
            });
            setExpanded(true);
          }}
        >
          {`${rt.title} `}
        </span>
        {
          index != filterRT?.rtIndex && (
          <span
            style={{
              padding: 5, 
              float:'right', 
              display:'inline', 
              cursor:'pointer'}}
            onClick={()=> {
              setExpanded(expanded ? false : true)
            }}
          > 
            {expanded ? <IconEyeOff color='#3a3b3c'/> : <IconEye color='#3a3b3c'/>}
          </span>
        )}
        
      </div> 
  </div>
  )
}

const ThreadComponent = (props:any) => {

  const {rt, index, editMode, setEditMode, filteredThreads} = props;
  const [{projectData, isReadOnly, filterRT, viewParams}, dispatch] = useProjectState();
  const [expanded, setExpanded] = useState(false);

  const checkIfSelectThread = (i: any) => {
    if (filterRT && filterRT?.rtIndex != null) {
      if (i != filterRT?.rtIndex) {
        return false;
      }
      return true;
    }
    return true;
  };

  const associatedTags = filteredThreads.map((rt, i) => {
    let tags = rt.evidence.flatMap((fm) => {
      let match = projectData.entries.filter(
        (f) => f.title === fm.activityTitle
      )[0].tags;
      return match;
    });
    let groupTags = Array.from(d3.group(tags, (d) => d));
    let sorted = groupTags.sort((a, b) => b[1].length - a[1].length);

    return sorted.length > 10 ? sorted.slice(0, 10) : sorted;
  });

  

  return(
    <React.Fragment key={`frag-${index}`}>
    {editMode !== index ? (
      <div
        key={`rt-${index}`}
        style={{
          borderLeft: '2px solid gray',
          paddingLeft: 3,
          opacity: checkIfSelectThread(index) ? 1 : 0.5,
          marginTop: 10,
          marginBottom: 10,
          background:
            filterRT && checkIfSelectThread(index) && filterRT?.rtId !== null
              ? `${rt.color}30`
              : '#fff',
          borderRadius: 6,
        }}
      >
        {(filterRT && filterRT?.rtId === rt.rt_id) && (
          <div
            title="Unselect Thread"
            style={{
              float: 'right',
              cursor: 'pointer',
              width: 30,
              height: 30,
            }}
            onClick={() => { 
              setExpanded(false)
              dispatch({
                type: 'THREAD_FILTER',
                filterRT: null,
                rtIndex: null
              })
              
            }}
          >
            <MdCancel size={30} />
          </div>
        )}

      <ThreadBanner 
        index={index} 
        rt={rt} 
        expanded={expanded} 
        setExpanded={setExpanded} />

      { expanded && (
      <div style={{paddingTop:5}}>
          {!isReadOnly && (
            <div style={{ display: 'inline', float: 'right' }}>
              <span style={{ display: 'inline' }}>
                <Button
                  size={'sm'}
                  style={{ display: 'inline' }}
                  onClick={() => {
                    setEditMode(index);
                  }}
                >
                  <FaEdit />
                </Button>
              </span>
            </div>
          )}
          
            <span
              style={{ fontSize: 10, fontWeight: 800 }}
            >{`${rt.evidence.length} pieces of evidence`}</span>
        
            <MiniTimline
              researchT={rt}
              activities={projectData.entries}
            />
    
            <div style={{ paddingBottom: 10, fontSize: 11 }}>
              {rt.description}
            </div>
        
          {associatedTags && editMode != index && (
            <div>
              <span
                style={{
                  fontSize: 9,
                  display: 'block',
                  fontWeight: 800,
                }}
              >
                {'Frequently occuring tags:'}
              </span>
              {associatedTags[index].map((at, j) => (
                <Badge
                  key={`tag-${j}`}
                  size={'xs'}
                  variant="outline"
                  style={{
                    margin: 2,
                    fontSize: 10,
                  }}
                >
                  {at[0]}
                </Badge>
              ))}
            </div>
          )}
          {!isReadOnly && (
            <div
            style={{paddingBottom:'10px'}}
            >
              <Popover>
                <PopoverTrigger>
                  <Button size={'xs'} style={{ display: 'inline' }}>
                    Cite thread
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverBody>
                    <span style={{ display: 'block' }}>
                      <Button
                        onClick={() => {
                          let indexTest = projectData.citations
                            .map((c) => c.id)
                            .indexOf(rt.rt_id);
                          let index =
                            indexTest > -1
                              ? indexTest + 1
                              : projectData.citations.length + 1;
                          navigator.clipboard.writeText(
                            String.raw`\trrracer{overview}{thread}{${rt.rt_id}}{${index}}`
                          );

                          if (indexTest === -1) {
                            let newCitations = [
                              ...projectData.citations,
                              { id: rt.rt_id, cIndex: index },
                            ];
                            dispatch({
                              type: 'ADD_CITATION',
                              citations: newCitations,
                            });
                          }
                        }}
                      >
                        Copy this ref
                      </Button>
                    </span>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
       )}

        <Divider />
      </div>
    ) : (
      <EditableThread
        key={`edit-thread-${index}`}
        index={index}
        threadData={rt}
        setEditMode={setEditMode}
      />
    )}
    </React.Fragment>
  )
}

const ThreadNav = (threadProps: ThreadNavProps) => {
  const { viewType } = threadProps;
  const [
    { projectData, researchThreads, filterRT, isReadOnly, viewParams },
    dispatch,
  ] = useProjectState();

  const [showCreateThread, setShowCreateThread] = useState(false);
  // const [threadName, setName] = useState(null);
  // const [description, setDescription] = useState(null);
  const [editMode, setEditMode] = useState<null | number>(null);
  const [hasCancel, sethasCancel] = useState(true);

  const filteredThreads = useMemo(() => {
    if (viewParams && viewParams.view === 'paper') {
      return researchThreads?.research_threads.filter(
        (_, i) => i === filterRT?.rtId
      );
    }
    return researchThreads?.research_threads.filter((f) => {
      const test = f.actions.map((m) => m.action);
      return test.indexOf('merge') === -1;
    });
  }, [researchThreads?.research_threads, viewParams]);

  useEffect(() => {
    if (viewParams && viewParams.view === 'paper') {
      sethasCancel(false);
    } else {
      sethasCancel(true);
    }
  }, [viewParams]);

  // const handleNameChange = (e: any) => {
  //   const inputValue = e.target.value;
  //   setName(inputValue);
  // };
  // const handleDescriptionChange = (e: any) => {
  //   const inputValue = e.target.value;
  //   setDescription(inputValue);
  // };

  const headerStyle = { 
    fontSize: '19px', 
    fontWeight: 600, 
    cursor: 'pointer',
    position:'sticky',
    top:'0px',
    margin:'auto',
    height:'50px',
    backgroundColor:'#FAFAFA',
    padding:5,
    zIndex: 1000,
    color:'#3a3b3c'
  };

  return (
    <Box>
      {(viewType === 'activity view' || viewType === 'overview') && (
        <div style={headerStyle}>
          <span style={{ display: 'inline' }}>{`${researchThreads.research_threads.length} Research Threads`}</span>
        </div>
      )}
      <Box>
        {researchThreads && filteredThreads ? (
          <Box
            style={{
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            {filteredThreads.map((rt: any, i: number) => (
              <React.Fragment
              key={`rt-${rt.rt_id}`}
              >
              <ThreadComponent 
                rt={rt} 
                index={i} 
                editMode={editMode} 
                setEditMode={setEditMode} 
                filteredThreads={filteredThreads} />
              </React.Fragment>
            ))}
          </Box>
        ) : (
          <span style={{ marginTop: 5, marginBottom: 5 }}>
            No research threads yet.
          </span>
        )}
      </Box>

      {viewType !== 'detail' && (
        <>
          {!isReadOnly && (
            <Button
              style={{
                fontSize: '11px',
                borderRadius: 5,
                padding: 7,
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
          )}

          {showCreateThread && (
            <CreateThreadComponent 
              setShowCreateThread={setShowCreateThread}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default ThreadNav;
