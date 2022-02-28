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

const QueryBar = () => {

    return(
        <InputGroup align={'center'} width={'400px'} marginEnd={'90px'}>
        <Input variant='flushed' placeholder='Search by term' />
        <InputRightElement width='4.5rem'>
          <Button h='1.75rem' size='sm' onClick={console.log("TEST")}>
            <Search2Icon />
          </Button>
        </InputRightElement>
      </InputGroup>
    )
}

export default QueryBar;