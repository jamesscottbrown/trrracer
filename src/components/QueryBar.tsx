import React from 'react';
import { Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';
import { useProjectState } from './ProjectContext';

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
      const content =
        f[1] && f[1].body
          ? f[1].body.content
              .filter((p) => p.paragraph)
              .map((m) => m.paragraph.elements)
          : [];
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

  const titleMatches = activityData
    .filter((f) => {
      let temp = f.files.filter(f => f.title.includes(queryTerm));
      return f.title.includes(queryTerm) || temp.length > 0;
    })
    .map((m) => m.activity_uid);

  const descriptionMatches = activityData
  .filter((a) => {
    let temp = a.files.filter(f => f.context ? f.context.includes(queryTerm) : false);
    let inDescription = a.description ? a.description.includes(queryTerm) : false;
    return inDescription || temp.length > 0;
  })
  .map((m) => m.activity_uid);

  const matches: any[] = [];

  activityData.forEach((ent: any) => {
    const tempText = textMatches.filter((t) => t['entry-title'] === ent.title);
    if (tempText.length > 0) {
      tempText.map((tt) => {
        const txtArray = tt.text.split('. ');
        const indexArray = [];
        txtArray.forEach((t, i) => {
          if (t.includes(queryTerm)) {
            const con = [];
            if (i > 0) {
              con.push({ style: null, query_context: txtArray[i - 1] });
            }

            const test = txtArray[i].split(queryTerm);

            con.push({ style: null, query_context: test[0] });

            con.push({ style: 'bold', query_context: queryTerm });

            con.push({ style: null, query_context: test[1] });

            if (i < txtArray.length - 1) {
              con.push({ style: null, query_context: txtArray[i + 1] });
            }
            indexArray.push(con);
          }
        });
        tt.query_context = indexArray;
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
              con.push({ style: null, query_context: txtArray[i - 1] });
            }
            const test = txtArray[i].split(queryTerm);

            con.push({ style: null, query_context: test[0] });
            con.push({ style: 'bold', query_context: queryTerm });
            con.push({ style: null, query_context: test[1] });

            if (i < txtArray.length - 1) {
              con.push({ style: null, query_context: txtArray[i + 1] });
            }
            indexArray.push(con);
          }
        });
        tt.query_context = indexArray;

        return tt;
      });
    }

    if (
      tempText.length > 0 ||
      tempG.length > 0 ||
      titleMatches.indexOf(ent.activity_uid) > -1
    ) {
      let titleKeeper = []
      

      if(titleMatches.indexOf(ent.activity_uid) > -1){
        if(ent.title.includes(queryTerm)) titleKeeper.push({activityTitle: ent.title, activityID: ent.activity_uid})
        ent.files.forEach((f:any, j:number) => {
          if(f.title.includes(queryTerm)) titleKeeper.push({fileTitle: f.title, artifactID:f.artifact_uid, artifactIndex:j})
        })
      }

      let descriptionKeeper = []
      if(descriptionMatches.indexOf(ent.activity_uid) > -1){
        if(ent.description && ent.description.includes(queryTerm)) descriptionKeeper.push({activityTitle: ent.title, activityID: ent.activity_uid, blurb: ent.description})
        ent.files.forEach((f:any, j:number) => {
          if(f.title.includes(queryTerm)) descriptionKeeper.push({fileTitle: f.title, artifactID:f.artifact_uid, artifactIndex:j, blurb: f.context})
        })
      }
      console.log('desssss keeper',descriptionKeeper)
      const entM = {
        entry: ent,
        textMatch: tempText,
        googMatch: tempG,
        titleMatch: titleKeeper,//titleMatches.indexOf(ent.activity_uid) > -1,
        descriptionMatch: descriptionKeeper
      };
      matches.push(entM);
    }
  });

  return matches;
};

interface QueryProps {
  setViewType: (viewType: string) => void;
  artifactData: any;
  filteredActivities: any;
  setSearchTermArtifact:any;
}

const QueryBar = (queryProps: QueryProps) => {
  const { setSearchTermArtifact, setViewType, filteredActivities } = queryProps;
  const [{ txtData, googleData }, dispatch] = useProjectState();

  const [term, setTerm] = React.useState(null);

  const handleTermChange = (e) => {
    const inputValue = e.target.value;
    setTerm(inputValue);
  };

  let data;

  

  // if (artifactData) {
  //   console.log('text content!!', document.getElementById('detail-preview'))
  //   if (artifactData.fileType === 'txt' && txtData) {
  //     const dataCheck = txtData['text-data'].filter(
  //       (f) => f['file-title'] === artifactData.title
  //     );
  //     data = dataCheck.length > 0 ? dataCheck[0].text : [];
  //   } else {
  //     data = googleData[artifactData.fileId];
  //   }
  // }

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
            if (setSearchTermArtifact) {
            
              setSearchTermArtifact(term);
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
