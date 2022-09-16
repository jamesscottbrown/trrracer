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

  );
};

export default SidebarButton;
