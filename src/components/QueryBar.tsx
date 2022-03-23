import React from 'react';

import { Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react';

import { Search2Icon } from '@chakra-ui/icons';
import { useProjectState } from './ProjectContext';

interface QueryProps{
  setViewType: (viewType: string) => void;
  artifactData: any;
}

const QueryBar = (queryProps: QueryProps) => {
  const { artifactData, setViewType } = queryProps;
  const [{ txtData, googleData }, dispatch] = useProjectState();

  let [term, setTerm] = React.useState(null);

  let handleTermChange = (e) => {
    let inputValue = e.target.value;
    setTerm(inputValue);
  };

  let data;

  if (artifactData) {
    data =
      artifactData.fileType === 'txt'
        ? txtData['text-data'].filter(
            (f) => f['file-title'] === artifactData.title
          )[0].text
        : googleData[artifactData.fileId];
  }

  return (
    <InputGroup align={'center'} width={'400px'} marginEnd={'90px'}>
      <Input
        variant="flushed"
        placeholder="Search by term"
        onChange={handleTermChange}
      />
      <InputRightElement width="4.5rem">
        <Button
          h="1.75rem"
          size="sm"
          onClick={() => {
            if(artifactData){
              let matchArray = data.split(term);
              alert(`${matchArray.length - 1} matches`);
            }else{
              let test = txtData['text-data'].filter(f => f.text.includes(term));

              let testGoog = Object.entries(googleData).map(f => {
                let content = f[1].body.content.filter(p => p.paragraph).map(m => m.paragraph.elements);
                let flatContent = content.flatMap(m => m);
                let flatTextRun = flatContent.map(m => m.textRun ? m.textRun.content : "")
                let txtBlock = flatTextRun.join('');
                // console.log(flatTextRun);
                return {fileId:f[0], data:f[1], textBlock:txtBlock, textArray: flatTextRun}
              }).filter(ft => {
                let tmp = ft.textArray.filter(a => a.includes(term))
                return tmp.length > 0;
              });

              console.log('testGoog', testGoog);
              
              //.filter(f => f.textBlock.includes(term));
             
              setViewType('query');
              dispatch({type:'QUERY_TERM', term: term, textMatch: test, googMatch: testGoog})
            }
            
          }}
        >
          <Search2Icon />
        </Button>
      </InputRightElement>
    </InputGroup>
  );
};

export default QueryBar;
