import React from 'react';

import { Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react';

import { Search2Icon } from '@chakra-ui/icons';
import { useProjectState } from './ProjectContext';


const processDataQuery = (queryTerm:string, txtData:any, googleData:any, activityData:any) => {


    let textMatches = txtData['text-data'].filter(f => f.text.includes(queryTerm));

    let googMatches = Object.entries(googleData).map(f => {
      let content = f[1].body.content.filter(p => p.paragraph).map(m => m.paragraph.elements);
      let flatContent = content.flatMap(m => m);
      let flatTextRun = flatContent.map(m => m.textRun ? m.textRun.content : "")
      let txtBlock = flatTextRun.join('');
    
      return {fileId:f[0], data:f[1], textBlock:txtBlock, textArray: flatTextRun}
    }).filter(ft => {
      let tmp = ft.textArray.filter(a => a.includes(queryTerm))
      return tmp.length > 0;
    });

    const matches = [];
    activityData.forEach((ent:any) => {
        let tempText = textMatches.filter(t => t['entry-title'] === ent.title);
        if(tempText.length > 0){
            tempText.map((tt)=> {
                let txtArray = tt.text.split('. ')
                let indexArray = [];
                txtArray.forEach((t, i)=> {
                    if(t.includes(queryTerm)){
                        let con = []
                        if(i > 0){
                            con.push({style:null, context:txtArray[(i-1)]})
                        }
                        con.push({style:'bold', context:txtArray[i]})
                        if(i < txtArray.length - 1){
                            con.push({style:null, context:txtArray[(i+1)]})
                        }
                        indexArray.push(con)
                    }
                });
                tt.context = indexArray;
                return tt;
            })
        }
        
        let tempG = ent.files.filter((fg:any) => fg.fileType === 'gdoc' && googMatches.map(gm => gm.fileId).includes(fg.fileId))
        
        if(tempG.length > 0){
            tempG.map((tt)=> {
                
                let test = googMatches.filter(f=> f.fileId === tt.fileId)[0];
                let txtArray = test.textBlock.split('. ');
                let indexArray = [];

                txtArray.forEach((t, i)=> {
                    if(t.includes(queryTerm)){
                        let con = []
                        if(i > 0){
                            con.push({style:null, context:txtArray[(i-1)]})
                        }
                        con.push({style:'bold', context:txtArray[i]})
                        if(i < txtArray.length - 1){
                            con.push({style:null, context:txtArray[(i+1)]})
                        }
                        indexArray.push(con)
                    }
                });
                tt.context = indexArray;
               
                return tt;
            })
        }
       
        if(tempText.length > 0 || tempG.length > 0){
            const entM = {entry: ent, textMatch:tempText, googMatch:tempG}
            matches.push(entM);
        }        
    });

    return matches;


}

interface QueryProps{
  setViewType: (viewType: string) => void;
  artifactData: any;
  filteredActivities: any;
}

const QueryBar = (queryProps: QueryProps) => {
  const { artifactData, setViewType, filteredActivities } = queryProps;
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
              let matches = processDataQuery(term, txtData, googleData, filteredActivities);
              setViewType('query');
              dispatch({type:'QUERY_TERM', term: term, matches: matches});

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
