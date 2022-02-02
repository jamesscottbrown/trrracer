import React, { useState } from 'react';
import {
  Box,
  Flex,
  useColorModeValue,
  Heading,
  Spacer,
  Checkbox,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  FormControl,
  FormLabel,
  Switch,
  SliderFilledTrack,
  SliderTrack,
  SliderThumb,
  Slider,
  Editable,
  EditableInput,
  EditablePreview
} from '@chakra-ui/react';
import {
  Search2Icon,
  SearchIcon
} from '@chakra-ui/icons';
import { EntryType, FileObj, ProjectViewProps } from './types';
import ViewTypeControl from './ViewTypeControl';
import TopTimeline from './TopTimeline';
import FileUpload from './FileUpload';
import { FaEye, FaEyeSlash, FaPlus } from 'react-icons/fa';
import { useProjectState } from './ProjectContext';

const TopBar = (ProjectPropValues: ProjectViewProps) =>{

  const [, dispatch] = useProjectState();
  const { projectData, folderPath, viewType, setViewType, reversedOrder, setReversedOrder, setNewTitle } = ProjectPropValues;

  console.log('PROJECT DATA', projectData)

  let splitTitle = (title)=>{
    let t = title.split('/');
    return t[t.length - 1];
  }

  const addEntry = () => {
    dispatch({ type: 'ADD_ENTRY' });
  };

  const saveFiles = (fileList: FileObj[]) => {
    dispatch({ type: 'ADD_FILES', fileList });
  };

return (
<Box position={"fixed"} left={0} right={0} flexFlow={'row wrap'} zIndex={1000} height={200}>
  <Flex  
    bg={useColorModeValue('white', 'gray.800')}
    color={useColorModeValue('gray.600', 'white')}
    minH={'60px'}
    py={{ base: 2 }}
    px={{ base: 4 }}
    borderBottom={1}
    borderStyle={'solid'}
    borderColor={useColorModeValue('gray.200', 'gray.900')}
    align={'center'}
    >
     
      {/* <Heading as="h1">
          <Editable
            // value={newTitle}
            valu={projectData.title}
            onChange={(val) => setNewTitle(val)}
            onCancel={() => setNewTitle(projectData.title)}
            onSubmit={(val) => dispatch({ type: 'UPDATE_TITLE', title: val })}
          >
            <EditablePreview />
            <EditableInput />
          </Editable>
      </Heading> */}
      <Heading as="h3">{splitTitle(projectData.title)}</Heading>
      <Spacer/>
      <InputGroup align={'center'} width={'400px'} marginEnd={'90px'}>
        <Input variant='flushed' placeholder='Search by term' />
        <InputRightElement width='4.5rem'>
          <Button h='1.75rem' size='sm' onClick={console.log("TEST")}>
            <Search2Icon/>
          </Button>
        </InputRightElement>
      </InputGroup>
      
      <div style={{float:"right"}}><ViewTypeControl viewType={viewType} setViewType={setViewType} /></div>
    </Flex>
    <Flex  h={'150px'}>
    <Box flex={1.1} p={10} bg={useColorModeValue('white', 'gray.800')}
    color={useColorModeValue('gray.600', 'white')}>
      <Box>
        <FormControl display='flex' alignItems='center'>
        <FormLabel htmlFor='filter-artifacts' mb='2'>
            {`    Hide filtered artifacts.`}
          </FormLabel>
          <Switch id='filter-artifacts' />
        </FormControl>
      </Box>

      <Box>
      <FormControl display='flex' alignItems='center'>
      <FormLabel>{`Old ---> New`}</FormLabel>
        <Checkbox
            checked={reversedOrder}
            onChange={(e) => setReversedOrder(e.target.checked)}
        >
        </Checkbox>
        </FormControl>
      </Box>

      <Box>
      <FormControl display='flex' alignItems='center'>
        <FormLabel>Artifact space</FormLabel>
        <Slider aria-label='slider-ex-2' colorScheme='pink' defaultValue={30} width={150}>
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </FormControl>

    </Box>
  
 
    </Box>

    <TopTimeline projectData={projectData}/>

    <Box flex="1.8" bg='green.500' maxWidth='25%'>
      <Flex flexFlow={'row wrap'} p={5}>
        
        <Button alignSelf={"center"} onClick={addEntry} type="button">
          <FaPlus /> Add entry
        </Button>
    
       
        <FileUpload
          saveFiles={saveFiles}
          containerStyle={{}}
          msg={
            <>
              Drag and drop some files here, or <b>click to select files</b>,
              create a new entry.
            </>
          }
        />
      </Flex>

    </Box>
    </Flex>
   
</Box>
)

}

export default TopBar;
      
     