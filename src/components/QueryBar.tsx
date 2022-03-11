import React from 'react';

import {
  Input,
  InputGroup,
  InputRightElement,
  Button
} from '@chakra-ui/react';

import {
    Search2Icon
  } from '@chakra-ui/icons';
import { useProjectState } from './ProjectContext';

const QueryBar = (queryProps:any) => {

  const { artifactData } = queryProps;
  const [{ txtData, googleData }, dispatch] = useProjectState();

  let [term, setTerm] = React.useState(null);
   
  let handleTermChange = (e) => {
      let inputValue = e.target.value
      setTerm(inputValue);
  }

  let data; 
  
  if(artifactData){
    data = artifactData.fileType === "txt" ? txtData['text-data'].filter(f=> f['file-title'] === artifactData.title)[0].text
  : googleData[artifactData.fileId];
}

    return(
      <InputGroup align={'center'} width={'400px'} marginEnd={'90px'}>
        <Input variant='flushed' placeholder='Search by term' onChange={handleTermChange} />
        <InputRightElement width='4.5rem'>
          <Button h='1.75rem' size='sm' onClick={() => {
            let matchArray = data.split(term);
            alert(`${matchArray.length - 1} matches`)

            }}>
            <Search2Icon />
          </Button>
        </InputRightElement>
      </InputGroup>
    )
}

export default QueryBar;