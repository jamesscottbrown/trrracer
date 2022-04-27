import React, { useState } from 'react';
import {
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
  FormControl,
  Switch,
  FormLabel,
} from '@chakra-ui/react';

import { FaFillDrip, FaSortAlphaUp, FaSortAmountDown } from 'react-icons/fa';
import { GiCancel, GiSewingString } from 'react-icons/gi';

import { ChevronDownIcon } from '@chakra-ui/icons';
import * as d3 from 'd3';
import { useProjectState } from './ProjectContext';
import SidebarButton from './SidebarButton';
import ThreadNav from './ThreadNav';

const LeftSidebar = (props: any) => {
  
  const {fromTop} = props;

  const [{ projectData, researchThreads, artifactTypes }, dispatch] =
    useProjectState();
 
  const artifacts = projectData.entries.flatMap((f) => f.files);

  const [fileTypeShown, setFileTypeShown] = useState({
    title: 'all',
    matches: artifacts.length,
  });

  const [artifactTypeShown, seArtifactTypeShown] = useState({
    title: 'all',
    matches: artifacts.length,
  });

  const tags = projectData.tags.map((t) => {
    t.matches = projectData.entries.filter((f) => {
      return f.tags.indexOf(t.title) > -1;
    });
    return t;
  });

 // const sortedTags = tags.sort((a, b) => b.matches.length - a.matches.length);

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
      borderRadius={6}
      margin="8px"
      style={{ paddingLeft: 5, paddingRight: 5 }}
      flex={1}
      flexDirection="column"
      h={`calc(100vh - ${(fromTop + 5)}px)`}
      overflow="auto"
      borderRight={'1px solid #A3AAAF'}
      boxShadow={"0 3px 8px #A3AAAF"}
      p={3}
    >
    
      <ThreadNav
        researchTs={researchThreads ? researchThreads.research_threads : null}
        viewType="overview"
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
              >{`${m.title} (${m.matches})`}<FaFillDrip style={{ color: m.color, display: 'inline' }}/></MenuItem>
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
          console.log('click alpha')
          let temp = tags.sort((a, b) => a.title.localeCompare(b.title))
          console.log(temp);
          setSortedTags(temp) }}
        />
      <FaSortAmountDown 
        style={{
          display:'inline-block', 
          marginLeft:'5px',
          cursor:'pointer'
        }} 
        onClick={()=> {
          console.log('click freq')
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
