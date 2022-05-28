import React, { useState } from 'react';
import {
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button
} from '@chakra-ui/react';

import { FaSortAlphaUp, FaSortAmountDown } from 'react-icons/fa';
import { ChevronDownIcon } from '@chakra-ui/icons';
import * as d3 from 'd3';
import SidebarButton from './SidebarButton';
import ThreadNav from './ThreadNav';
import { ToolIcon } from './Project';
import { stateUpdateWrapperUseJSON } from '../fileUtil';
import { useProjectState } from './ProjectContext';
import { MdCancel } from 'react-icons/md';

const LeftSidebar = (props: any) => {
  
  const { fromTop } = props;
  const [{projectData, researchThreads, artifactTypes, selectedThread, filterTags}, dispatch] = useProjectState();

  console.log('filtertagsssss',filterTags);

  const artifacts = projectData.entries.flatMap((f) => f.files);
  const [fileTypeShown, setFileTypeShown] = useState({
    title: 'all',
    matches: artifacts.length,
  });

  const tags = projectData.tags.filter(f => filterTags?.indexOf(f.title) === -1).map((t) => {
    t.matches = projectData.entries.filter((f) => {
      return f.tags.indexOf(t.title) > -1;
    });
    return t;
  });

  console.log('tag lengthhhh',tags.length, tags, filterTags)

  const [ sortedTags, setSortedTags ] = useState(tags.sort((a, b) => b.matches.length - a.matches.length))
  
  const types = d3
    .groups(artifacts, (a) => a.fileType)
    .map((ty) => {
      return { title: ty[0], matches: ty[1].length };
    });

  const aTypes = d3
    .groups(artifacts, (a) => a.artifactType)
    .map((ty) => {
      let colorTest = artifactTypes.artifact_types.filter(f => f.type === ty[0])
      return { title: ty[0] ? ty[0] : 'undefined', matches: ty[1].length, color: colorTest.length > 0 ? colorTest[0].color : 'gray'};
    });

  const sortedTypes = types.sort((a, b) => b.matches - a.matches);
  sortedTypes.push({ title: 'all', matches: artifacts.length });

  const sortedArtTypes = aTypes.sort((a, b) => b.matches - a.matches);
  sortedArtTypes.push({ title: 'all', matches: artifacts.length });
  const headerStyle = { fontSize: '19px', fontWeight: 600 };

  return (
    <Box
      margin="8px"
      style={{ 
        paddingLeft: 5, 
        paddingRight: 5 
      }}
      flex={1}
      flexDirection="column"
      h={`calc(100vh - ${(fromTop + 5)}px)`}
      overflow="auto"
      borderRight={'1px solid #A3AAAF'}
      boxShadow={"0 3px 8px #A3AAAF"}
      borderRadius={6}
      p={3}
    >
      <ThreadNav
        researchTs={researchThreads ? researchThreads.research_threads : null}
        viewType={"overview"}
        selectedThread={selectedThread}
        projectData={projectData}
        dispatch={dispatch}
      />
      <br />
      <Box
        marginTop="10px"
        marginBottom="10px"
        padding="3px"
      >
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {`View ${fileTypeShown.title} artifacts (${fileTypeShown.matches})`}
          </MenuButton>
          <MenuList>
            <MenuItem>all</MenuItem>
            {sortedArtTypes.map((m: any, i: any) => (
              <MenuItem
                key={`type-${i}`}
                data={m}
                index={i}
                onClick={() => {
                  stateUpdateWrapperUseJSON(fileTypeShown, m, setFileTypeShown)
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
              >{`${m.title} (${m.matches})`}<ToolIcon artifactType={m.title} size={18} style={{ color: m.color, display: 'inline' }}/></MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Box>
      <br />

      <span style={headerStyle}>{`${tags.length} Tags`} 
      <FaSortAlphaUp 
        style={{
          display:'inline-block', 
          marginLeft:'5px',
          cursor:'pointer'
        }} 
        onClick={()=>  {
          let temp = tags.sort((a, b) => a.title.localeCompare(b.title))
          setSortedTags(temp) }}
        />
      <FaSortAmountDown 
        style={{
          display:'inline-block', 
          marginLeft:'5px',
          cursor:'pointer'
        }} 
        onClick={()=> {
          let temp = tags.sort((a, b) => b.matches.length - a.matches.length)
          setSortedTags(temp)}}
        />
      </span>
      <br />
      <Box
        marginLeft="3px"
        borderLeftColor="black"
        borderLeftWidth="1px"
        padding="3px"
      >
        {
          (filterTags.length > 0) && (
            filterTags.map(ft => (
              <div
                style={{
                  background:`#dadada90`, 
                  padding:5, 
                  borderRadius:5
                }}
              ><span>{`Tag filter: ${ft}`}</span>
              <span
                style={{
                  float:'right', 
                  padding:5,
                  cursor:'pointer'
                }}
                onClick={()=> 
                  dispatch({
                  type: 'UPDATE_FILTER_TAGS',
                  filterTags: filterTags.filter((f) => f != ft),
                })}
              ><MdCancel /></span></div>
            ))
          )
        }
        {sortedTags.map((st: any, s: any) => (
          <React.Fragment key={`tag-${s}-frag`}>
            <SidebarButton isTag 
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
