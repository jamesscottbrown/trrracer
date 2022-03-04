import React, { useState } from 'react';
import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverArrow,
  PopoverContent,
  PopoverBody,
  Button,
} from '@chakra-ui/react';

import { useProjectState } from './ProjectContext';

const SidebarButton = (sidebarProps: any) => {
  const { isTag, index, data } = sidebarProps;
  const [{ researchThreads, projectData, filterTags, filterTypes }, dispatch] = useProjectState();
  const [barColor, setBarColor] = useState('#FFFFFF');
  const [showThreadPop, setShowThreadPop] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const closePopover = () => {
    setShowPopover(false);
    if (isTag) {
      setBarColor('#FFFFFF');
      // dispatch({ type: 'HIGHLIGHT_TAG', highlightedTag: null });
    }
  };

  if (!isTag) {
    return (
      <Box
        style={{ cursor: 'pointer' }}
        bg={barColor}
        key={`${data.title}-${index}`}
        onMouseOver={() => {
          setBarColor('#D3D3D3');
        }}
        onMouseLeave={() => {
          setBarColor('#FFFFFF');
        }}
        onClick={()=> {
          console.log('tags filter check', filterTypes, data);
          //nee to make a tag filter function
          // if(filterTags.includes(data.title)){
          //   alert('tag filter already exists');
          // }else{

          //   // dispatch({ type: 'UPDATE_FILTER_TYPES', filterTypes: [...filterTypes, data.title] });
          // } 
        }}
      >
        {`${data.title}  (${data.matches.length})`}
      </Box>
    );
  } else if (!showPopover) {
    return (
      <Box
        style={{ cursor: 'pointer' }}
        bg={barColor}
        key={`${data.title}-${index}`}
        onMouseEnter={() => {
          setShowPopover(true);
          if (isTag) {
            setBarColor('#D3D3D3');
            dispatch({ type: 'HIGHLIGHT_TAG', highlightedTag: data.title });
          }
        }}
        onMouseLeave={() => {
          console.log('Moused out:', data.title);

          setShowPopover(false);
          if (isTag) {
            setBarColor('#FFFFFF');
            dispatch({ type: 'HIGHLIGHT_TAG', highlightedTag: null });
          }
        }}

        onClick={()=> {
          console.log('tags filter check', filterTags);
          //nee to make a tag filter function
          if(filterTags.includes(data.title)){
            alert('tag filter already exists');
          }else{
            dispatch({ type: 'UPDATE_FILTER_TAGS', filterTags: [...filterTags, data.title] });
          } 
        }}
      >
        {`${data.title}  (${data.matches.length})`}
      </Box>
    );
  }

  return (
    <Popover
      isOpen={showPopover}
      onClose={closePopover}
      onMouseLeave={closePopover}
    >
      <PopoverTrigger>
        <Box
          style={{ cursor: 'pointer' }}
          bg={barColor}
          key={`${data.title}-${index}`}
        >
          {`${data.title}  (${data.matches.length})`}
        </Box>
      </PopoverTrigger>
      <PopoverContent bg="white" color="gray">
        <PopoverArrow bg="white" />

        <PopoverBody>
          {showThreadPop ? (
            <Box>
              {researchThreads &&
              researchThreads.research_threads.length > 0 ? (
                researchThreads.research_threads.map((r, tIndex: number) => (
                  <Box
                    key={`t-${tIndex}`}
                    onClick={() =>
                      dispatch({
                        type: 'ADD_TAG_TO_THREAD',
                        tag: data.title,
                        threadIndex: tIndex,
                      })
                    }
                    style={{
                      border: '1px solid gray',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {`Add to "${r.title}"`}
                  </Box>
                ))
              ) : (
                <span>{'no threads yet'}</span>
              )}
              <Button onClick={() => setShowThreadPop(false)}>
                {'cancel'}
              </Button>
            </Box>
          ) : (
            <Button onClick={() => setShowThreadPop(true)}>
              {'Add this tag to a thread.'}
            </Button>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default SidebarButton;
