import React, { useState } from 'react';
import { Box, Button } from '@chakra-ui/react';

import { AiFillFilter, AiOutlineFilter } from 'react-icons/ai';
import type { ProjectState, TagType } from './types';

type SidebarButtonProps = {
  index: number;
  data: TagType;
  filterTags: string[] | null;
  dispatch: (msg: any) => ProjectState;
};

const SidebarButton = (sidebarProps: SidebarButtonProps) => {
  const { index, data, filterTags, dispatch } = sidebarProps;
  const [barColor, setBarColor] = useState('#FFFFFF');

  return (
    <Box
      bg={barColor}
      key={`${data.title}-${index}`}
      onMouseOver={() => setBarColor('#D3D3D3')}
      onMouseOut={() => setBarColor('#FFF')}
    >
      <span>
        {`${data.title}  (${data.matches.length})`}
        <Button
          title="Filter by."
          size="xs"
          style={{ marginLeft: 10, cursor:'pointer' }}
          onClick={() => {
            console.log('tags filter check', filterTags);
            // nee to make a tag filter function
            if (filterTags.includes(data.title)) {
              dispatch({
                type: 'UPDATE_FILTER_TAGS',
                filterTags: filterTags.filter((t: string) => t !== data.title),
              });
            } else {
              dispatch({
                type: 'UPDATE_FILTER_TAGS',
                filterTags: [...filterTags, data.title],
              });
            }
          }}
        >
          {filterTags.includes(data.title) ? (
            <AiFillFilter />
          ) : (
            <AiOutlineFilter />
          )}
        </Button>
        {/* <Button title='Add to thread.' size={"xs"}>{<GrAddCircle />}</Button> */}
      </span>
    </Box>

    // <Popover
    //   trigger='hover'
    // >
    //   <PopoverTrigger>
    //     <Box
    //       style={{ cursor: 'pointer' }}
    //       bg={barColor}
    //       key={`${data.title}-${index}`}
    //       onMouseOver={()=> setBarColor('#D3D3D3')}
    //       onMouseOut={()=> setBarColor('#FFF')}
    //     >
    //       <span>{`${data.title}  (${data.matches.length})`} <Button size={"xs"}>{<FaFilter />}</Button><Button size={"xs"}>{<GrAddCircle />}</Button></span>
    //     </Box>
    //   </PopoverTrigger>
    //   <PopoverContent bg="white" color="gray">
    //     <PopoverArrow bg="white" />
    //     <PopoverBody>
    //       <Button
    //         style={{
    //             display:'inline-block',
    //             margin:5
    //           }}
    //           onClick={() => {
    //                     console.log('tags filter check', filterTags);
    //                     // nee to make a tag filter function
    //                     if (filterTags.includes(data.title)) {
    //                       alert('tag filter already exists');
    //                     } else {
    //                       dispatch({
    //                         type: 'UPDATE_FILTER_TAGS',
    //                         filterTags: [...filterTags, data.title],
    //                       });
    //                     }
    //                   }}
    //         >
    //             Filter artifacts by this tag.
    //       </Button>
    //       {showThreadPop ? (
    //         <Box>
    //           {researchThreads &&
    //           researchThreads.research_threads.length > 0 ? (
    //             researchThreads.research_threads.map((r, tIndex: number) => (
    //               <Box
    //                 key={`t-${tIndex}`}
    //                 onClick={() =>
    //                   dispatch({
    //                     type: 'ADD_TAG_TO_THREAD',
    //                     tag: data.title,
    //                     threadIndex: tIndex,
    //                   })
    //                 }
    //                 style={{
    //                   border: '1px solid gray',
    //                   borderRadius: '5px',
    //                   cursor: 'pointer',
    //                   textAlign: 'center',
    //                 }}
    //               >
    //                 {`Add to "${r.title}"`}
    //               </Box>
    //             ))
    //           ) : (
    //             <span>no threads yet</span>
    //           )}
    //           <Button onClick={() => setShowThreadPop(false)}>cancel</Button>
    //         </Box>
    //       ) : (
    //         <Button
    //         style={{
    //           display:'inline-block',
    //           margin:5
    //         }}
    //         onClick={() => setShowThreadPop(true)}>
    //           Add this tag to a thread.
    //         </Button>
    //       )}

    //     </PopoverBody>
    //   </PopoverContent>
    // </Popover>
  );
};

export default SidebarButton;
