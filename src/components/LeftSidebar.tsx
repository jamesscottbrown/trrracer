import React, { useState } from 'react';
import {
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
} from '@chakra-ui/react';

import { FaSortAlphaUp, FaSortAmountDown } from 'react-icons/fa';
import { ChevronDownIcon } from '@chakra-ui/icons';
import * as d3 from 'd3';
import { MdCancel } from 'react-icons/md';

import SidebarButton from './SidebarButton';
import ThreadNav from './ThreadNav';
import { ToolIcon } from './Project';
import { stateUpdateWrapperUseJSON } from '../fileUtil';
import { useProjectState } from './ProjectContext';
import type { ArtifactTypesType, FileTypesType } from './types';

const LeftSidebar = (props: { fromTop: number }) => {
  const { fromTop } = props;
  const [
    { projectData, researchThreads, artifactTypes, filterTags },
    dispatch,
  ] = useProjectState();
  const artifacts = projectData.entries.flatMap((f) => f.files);
  const [fileTypeShown, setFileTypeShown] = useState({
    title: 'all',
    matches: artifacts.length,
  });
  
  const tags = [...projectData.tags]
    .filter((f) => filterTags?.indexOf(f.title) === -1)
    .map((t) => {
      const matches = [...projectData.entries].filter((f) => {
        return f.tags.indexOf(t.title) > -1;
      });
      t.matches = matches.map((m) => m.activity_uid);
      return t;
    });
    console.log('TAGS', tags, projectData, filterTags)
  const [sortedTags, setSortedTags] = useState(
    tags.sort((a, b) => (b.matches || []).length - (a.matches || []).length)
  );

  const types: FileTypesType[] = d3
    .groups(artifacts, (a) => a.fileType)
    .map((ty) => {
      return { title: ty[0], matches: ty[1].length };
    });

  const aTypes: ArtifactTypesType[] = d3
    .groups(artifacts, (a) => a.artifactType)
    .map((ty) => {
      const colorTest = artifactTypes.artifact_types.filter(
        (f) => f.type === ty[0]
      );
      return {
        title: ty[0] ? ty[0] : 'undefined',
        matches: ty[1].length,
        color: colorTest.length > 0 ? colorTest[0].color : 'gray',
      };
    });

  const sortedTypes = types.sort((a, b) => b.matches - a.matches);
  sortedTypes.push({ title: 'all', matches: artifacts.length });

  const sortedArtTypes = aTypes.sort((a, b) => b.matches - a.matches);
  sortedArtTypes.push({ title: 'all', matches: artifacts.length, color: '' });

  const headerStyle = {
    fontSize: '19px',
    fontWeight: 600,
    backgroundColor: '#FAFAFA',
    position: 'sticky' as const, // N.B. the "as const" is required to avoid a TypeScript error
    height: '40px',
    top: '0px',
    padding: 6,
  };

  return (
    <Box
      margin="8px"
      style={{
        paddingLeft: 5,
        paddingRight: 5,
      }}
      // flex={1}
      width="400px"
      flexDirection="column"
      h={`calc(100vh - ${fromTop + 5}px)`}
      overflow="auto"
      borderRight="1px solid #A3AAAF"
      boxShadow="0 3px 8px #A3AAAF"
      borderRadius={6}
      p={3}
    >
      <ThreadNav viewType="overview" />
      <br />
      <Box marginTop="10px" marginBottom="10px" padding="3px">
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {`View ${fileTypeShown.title} artifacts (${fileTypeShown.matches})`}
          </MenuButton>
          <MenuList>
            <MenuItem>all</MenuItem>
            {sortedArtTypes.map((m, i) => (
              <MenuItem
                key={`type-${i}`}
                data={m}
                index={i}
                onClick={() => {
                  stateUpdateWrapperUseJSON(fileTypeShown, m, setFileTypeShown);
                  // setFileTypeShown(m);
                  if (m.title !== 'all') {
                    dispatch({
                      type: 'UPDATE_FILTER_TYPES',
                      filterType: m.title,
                    });
                  } else {
                    dispatch({ type: 'UPDATE_FILTER_TYPES', filterType: null });
                  }
                }}
              >
                {`${m.title} (${m.matches})`}
                <ToolIcon
                  artifactType={m.title}
                  size={18}
                  style={{ color: m.color, display: 'inline' }}
                />
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Box>
      <br />

      <div style={headerStyle}>
        {`${tags.length} Tags`}
        <FaSortAlphaUp
          style={{
            display: 'inline-block',
            marginLeft: '5px',
            cursor: 'pointer',
          }}
          onClick={() => {
            const temp = tags.sort((a, b) => a.title.localeCompare(b.title));
            setSortedTags(temp);
          }}
        />
        <FaSortAmountDown
          style={{
            display: 'inline-block',
            marginLeft: '5px',
            cursor: 'pointer',
          }}
          onClick={() => {
            const temp = tags.sort(
              (a, b) => (b.matches || []).length - (a.matches || []).length
            );
            setSortedTags(temp);
          }}
        />
      </div>
      <br />
      <Box
        marginLeft="3px"
        borderLeftColor="black"
        borderLeftWidth="1px"
        padding="3px"
      >
        {(filterTags || []).length > 0 && (
          <div
            style={{
              border: '0.5px solid rgb(163, 170, 175)',
              borderRadius: '6px',
            }}
          >
            <span>Filtering to only show events tagged</span>
            {(filterTags || []).map((ft, i) => (
              <div
                style={{
                  background: `#dadada90`,
                  padding: 5,
                  borderRadius: 5,
                }}
                key={ft}
              >
                <span>
                  {i > 0 && <b>and </b>}
                  {ft}
                </span>
                <span
                  style={{
                    float: 'right',
                    padding: 5,
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    dispatch({
                      type: 'UPDATE_FILTER_TAGS',
                      filterTags: (filterTags || []).filter((f) => f !== ft),
                    })
                  }
                >
                  <MdCancel />
                </span>
              </div>
            ))}
          </div>
        )}
        {sortedTags.map((st, s) => (
          <React.Fragment key={`tag-${s}-frag`}>
            <SidebarButton
              isTag
              data={st}
              index={s}
              researchThread={researchThreads}
              filterTags={filterTags}
              dispatch={dispatch}
            />
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default LeftSidebar;
