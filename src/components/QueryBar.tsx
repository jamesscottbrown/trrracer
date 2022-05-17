import React from 'react';
import { Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';
import { useProjectState } from './ProjectContext';
import { doc } from 'prettier';

const processDataQuery = (
  queryTerm: string,
  txtData: any,
  googleData: any,
  activityData: any
) => {
  const textMatches = txtData['text-data'].filter((f) =>
    f.text.includes(queryTerm)
  );

  const googMatches = Object.entries(googleData)
    .map((f) => {
      const content = f[1].body.content
        .filter((p) => p.paragraph)
        .map((m) => m.paragraph.elements);
      const flatContent = content.flatMap((m) => m);
      const flatTextRun = flatContent.map((m) =>
        m.textRun ? m.textRun.content : ''
      );
      const txtBlock = flatTextRun.join('');

      return {
        fileId: f[0],
        data: f[1],
        textBlock: txtBlock,
        textArray: flatTextRun,
      };
    })
    .filter((ft) => {
      const tmp = ft.textArray.filter((a) => a.includes(queryTerm));
      return tmp.length > 0;
    });

  const matches = [];
  activityData.forEach((ent: any) => {
    const tempText = textMatches.filter((t) => t['entry-title'] === ent.title);
    if (tempText.length > 0) {
      tempText.map((tt) => {
        console.log('tt', tt);
        const txtArray = tt.text.split('. ');
        const indexArray = [];
        txtArray.forEach((t, i) => {
          if (t.includes(queryTerm)) {
            const con = [];
            if (i > 0) {
              con.push({ style: null, context: txtArray[i - 1] });
            }

            const test = txtArray[i].split(queryTerm);

            con.push({ style: null, context: test[0] });

            con.push({ style: 'bold', context: queryTerm });

            con.push({ style: null, context: test[1] });

            if (i < txtArray.length - 1) {
              con.push({ style: null, context: txtArray[i + 1] });
            }
            indexArray.push(con);
          }
        });
        tt.context = indexArray;
        return tt;
      });
    }

    const tempG = ent.files.filter(
      (fg: any) =>
        fg.fileType === 'gdoc' &&
        googMatches.map((gm) => gm.fileId).includes(fg.fileId)
    );

    if (tempG.length > 0) {
      tempG.map((tt) => {
        const test = googMatches.filter((f) => f.fileId === tt.fileId)[0];
        const txtArray = test.textBlock.split('. ');
        const indexArray = [];

        txtArray.forEach((t, i) => {
          if (t.includes(queryTerm)) {
            const con = [];
            if (i > 0) {
              con.push({ style: null, context: txtArray[i - 1] });
            }
            const test = txtArray[i].split(queryTerm);

            con.push({ style: null, context: test[0] });
            con.push({ style: 'bold', context: queryTerm });
            con.push({ style: null, context: test[1] });

            if (i < txtArray.length - 1) {
              con.push({ style: null, context: txtArray[i + 1] });
            }
            indexArray.push(con);
          }
        });
        tt.context = indexArray;

        return tt;
      });
    }

    if (tempText.length > 0 || tempG.length > 0) {
      const entM = { entry: ent, textMatch: tempText, googMatch: tempG };
      matches.push(entM);
    }
  });

  return matches;
};

interface QueryProps {
  setViewType: (viewType: string) => void;
  artifactData: any;
  filteredActivities: any;
}

const QueryBar = (queryProps: QueryProps) => {
  const { artifactData, setViewType, filteredActivities } = queryProps;
  const [{ txtData, googleData }, dispatch] = useProjectState();

  const [term, setTerm] = React.useState(null);

  const handleTermChange = (e) => {
    const inputValue = e.target.value;
    setTerm(inputValue);
  };

  let data;

  if (artifactData) {
    // data = ((artifactData.fileType === 'txt') && (txtData?['text-data'] != undefined)) ? txtData['text-data'].filter(
    //         (f) => f['file-title'] === artifactData.title
    //       )[0].text
    //     : googleData[artifactData.fileId];
    if((artifactData.fileType === 'txt') && (txtData)){
      data = txtData['text-data'].filter((f) => f['file-title'] === artifactData.title)[0].text
    }else{
      data = googleData[artifactData.fileId];
    }
  }

  return (
    <InputGroup align="center" width="400px" marginEnd="90px">
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
            if (artifactData) {
              console.log('DATA ON CLICK', data);
              if(data.documentId){
                console.log('this is a google doc.');
              }else{
                const matchArray = data.split(term);
                alert(`${matchArray.length - 1} matches`);
              }
              
            } else {
              const matches = processDataQuery(
                term,
                txtData,
                googleData,
                filteredActivities
              );
              setViewType('query');
              dispatch({ type: 'QUERY_TERM', term, matches });
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
