import React, { ChangeEvent } from 'react';
import { Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';
import { useProjectState } from './ProjectContext';
import type {
  EntryType,
  GoogleData,
  GoogleDocContent,
  GoogleDocData,
  GoogleTextElement,
  TextEntry,
  TxtData,
} from './types';

type StyledQueryContext = { style: string | null; query_context: string };

type GoogleMatch = {
  fileId: string;
  data: GoogleDocData;
  textBlock: string;
  textArray: string[];
};

const processDataQuery = (
  queryTerm: string,
  txtData: TxtData | undefined,
  googleData: GoogleData | undefined,
  activityData: EntryType[]
) => {
  let textMatches: TextEntry[] = [];
  if (txtData) {
    textMatches = txtData['text-data'].filter((f) =>
      f.text.includes(queryTerm)
    );
  }

  let googMatches: GoogleMatch[] = [];
  if (googleData) {
    googMatches = Object.entries(googleData)
      .map((f) => {
        let content: GoogleTextElement[][] = [];
        if (f[1] && f[1].body) {
          const paragraphs = f[1].body.content.filter((p) => 'paragraph' in p);
          content = paragraphs.map(
            (m) => (m as GoogleDocContent).paragraph.elements
          );
        }

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
  }

  const titleMatches = activityData
    .filter((f) => {
      const temp = f.files.filter((f2) => f2.title.includes(queryTerm));
      return f.title.includes(queryTerm) || temp.length > 0;
    })
    .map((m) => m.activity_uid);

  const descriptionMatches = activityData
    .filter((a) => {
      const temp = a.files.filter((f) =>
        f.context ? f.context.includes(queryTerm) : false
      );
      const inDescription = a.description
        ? a.description.includes(queryTerm)
        : false;
      return inDescription || temp.length > 0;
    })
    .map((m) => m.activity_uid);

  const matches: any[] = [];

  activityData.forEach((ent) => {
    const tempText = textMatches.filter((t) => t['entry-title'] === ent.title);
    if (tempText.length > 0) {
      tempText.map((tt) => {
        const txtArray = tt.text.split('. ');
        const indexArray: StyledQueryContext[][] = [];
        txtArray.forEach((t, i) => {
          if (t.includes(queryTerm)) {
            const con: StyledQueryContext[] = [];
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
      (fg) =>
        fg.fileType === 'gdoc' &&
        googMatches.map((gm) => gm.fileId).includes(fg.fileId)
    );

    if (tempG.length > 0) {
      tempG.map((tt) => {
        const test = googMatches.filter((f) => f.fileId === tt.fileId)[0];
        const txtArray: string[] = test.textBlock.split('. ');
        const indexArray: StyledQueryContext[][] = [];

        txtArray.forEach((t, i) => {
          if (t.includes(queryTerm)) {
            const con: StyledQueryContext[] = [];
            if (i > 0) {
              con.push({ style: null, query_context: txtArray[i - 1] });
            }
            const test2 = txtArray[i].split(queryTerm);

            con.push({ style: null, query_context: test2[0] });
            con.push({ style: 'bold', query_context: queryTerm });
            con.push({ style: null, query_context: test2[1] });

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
      const titleKeeper = [];

      if (titleMatches.indexOf(ent.activity_uid) > -1) {
        if (ent.title.includes(queryTerm))
          titleKeeper.push({
            activityTitle: ent.title,
            activityID: ent.activity_uid,
          });
        ent.files.forEach((f, j) => {
          if (f.title.includes(queryTerm))
            titleKeeper.push({
              fileTitle: f.title,
              artifactID: f.artifact_uid,
              artifactIndex: j,
            });
        });
      }

      const descriptionKeeper = [];
      if (descriptionMatches.indexOf(ent.activity_uid) > -1) {
        if (ent.description && ent.description.includes(queryTerm))
          descriptionKeeper.push({
            activityTitle: ent.title,
            activityID: ent.activity_uid,
            blurb: ent.description,
          });
        ent.files.forEach((f, j) => {
          if (f.title.includes(queryTerm))
            descriptionKeeper.push({
              fileTitle: f.title,
              artifactID: f.artifact_uid,
              artifactIndex: j,
              blurb: f.context,
            });
        });
      }
      console.log('desssss keeper', descriptionKeeper);
      const entM = {
        entry: ent,
        textMatch: tempText,
        googMatch: tempG,
        titleMatch: titleKeeper, // titleMatches.indexOf(ent.activity_uid) > -1,
        descriptionMatch: descriptionKeeper,
      };
      matches.push(entM);
    }
  });

  return matches;
};

interface QueryProps {
  setViewType: (viewType: string) => void;
  filteredActivities: EntryType[];
  setSearchTermArtifact: any;
}

const QueryBar = (queryProps: QueryProps) => {
  const { setSearchTermArtifact, setViewType, filteredActivities } = queryProps;
  const [{ txtData, googleData }, dispatch] = useProjectState();

  const [term, setTerm] = React.useState('');

  const handleTermChange = (ev: ChangeEvent) => {
    const inputValue = (ev.target as HTMLInputElement).value;
    setTerm(inputValue);
  };

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
            console.log('IS THIS WORKING');
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
