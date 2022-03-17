import React, { useState } from 'react';
import {
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
} from '@chakra-ui/react';

import { ChevronDownIcon } from '@chakra-ui/icons';

import * as d3 from 'd3';
import { useProjectState } from './ProjectContext';
import SidebarButton from './SidebarButton';
import ThreadNav from './ThreadNav';

const LeftSidebar = () => {
  const [{ projectData, researchThreads }, dispatch] = useProjectState();
  const artifacts = projectData.entries.flatMap((f) => f.files);

  const [fileTypeShown, setFileTypeShown] = useState({
    title: 'all',
    matches: artifacts.length,
  });

  const types = d3
    .groups(artifacts, (a) => a.fileType)
    .map((ty) => {
      return { title: ty[0], matches: ty[1].length };
    });
  const sortedTypes = types.sort((a, b) => b.matches - a.matches);
  sortedTypes.push({ title: 'all', matches: artifacts.length });

  const tags = projectData.tags.map((t) => {
    t.matches = projectData.entries.filter((f) => {
      return f.tags.indexOf(t.title) > -1;
    });
    return t;
  });

  const sortedTags = tags.sort((a, b) => b.matches.length - a.matches.length);
  const headerStyle = { fontSize: '19px', fontWeight: 600 };

  return (
    <Box
      margin="8px"
      p={5}
      flex={1}
      flexDirection="column"
      h="calc(100vh - 250px)"
      overflow="auto"
    >
      <ThreadNav
        researchTs={researchThreads ? researchThreads.research_threads : null}
        viewType="overview"
      />
      <br />
      <Box
        marginLeft="3px"
        marginTop="10px"
        marginBottom="10px"
        borderLeftColor="black"
        borderLeftWidth="1px"
        padding="3px"
      >
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {`View ${fileTypeShown.title} artifacts (${fileTypeShown.matches})`}
          </MenuButton>
          <MenuList>
            <MenuItem>all</MenuItem>
            {sortedTypes.map((m: any, i: any) => (
              <MenuItem
                key={`type-${i}`}
                data={m}
                index={i}
                onClick={() => {
                  setFileTypeShown(m);
                  if (m.title != 'all') {
                    dispatch({
                      type: 'UPDATE_FILTER_TYPES',
                      filterType: m.title,
                    });
                  } else {
                    dispatch({ type: 'UPDATE_FILTER_TYPES', filterType: null });
                  }
                }}
              >{`${m.title} (${m.matches})`}</MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Box>
      <span style={headerStyle}>{`${tags.length} Tags`}</span>
      <br />
      <Box
        marginLeft="3px"
        borderLeftColor="black"
        borderLeftWidth="1px"
        padding="3px"
      >
        {sortedTags.map((st: any, s: any) => (
          <React.Fragment key={`tag-${s}-frag`}>
            <SidebarButton isTag data={st} index={s} />
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default LeftSidebar;
