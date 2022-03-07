import React, { useState, useMemo } from 'react';

import {
  Button,
  Heading,
  ListItem,
  Tag,
  Text,
  UnorderedList,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Box,
  SimpleGrid
} from '@chakra-ui/react';


import AttachmentPreview from './AttachmentPreview';

import { EditIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt, FaLock } from 'react-icons/fa';

import { format } from 'date-fns';
import * as Showdown from 'showdown';

import { File, EntryType, TagType } from './types';
import textColor from '../colors';
import { useProjectState } from './ProjectContext';

import FileTextRender from './FileTextRender'


interface EntryPropTypes {
  entryData: EntryType;
  openFile: (a: string, fp: string) => void;
  makeEditable: () => void;
  setViewType: (viewType: string) => void;
  setSelectedArtifactIndex: (index: number) => void;
  setSelectedArtifactEntry: (ent: any) => void;
}

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });

const ReadonlyEntry = (props: EntryPropTypes) => {
  const { entryData, openFile, makeEditable, setViewType } = props;
  const [showPopover, setShowPopover] = useState(false);
  const [{ projectData, folderPath, researchThreads }, dispatch] = useProjectState();


  const closePopover = () => {
    setShowPopover(false);
  };

  const checkTagColor = (tagName:string) => {
    let tagFil = researchThreads.research_threads.filter(f => {
      return f.associated_tags.indexOf(tagName) > -1;
    });
    if(tagFil.length > 0) return tagFil[tagFil.length - 1].color;
    return '#D4D4D4';
  }

  const urls = entryData.files.filter((f) => f.fileType === 'url');
  const files = entryData.files.filter((f) => f.fileType !== 'url');

  // const key = entryData.key_txt.flatMap(kt => {
  //   return kt.keywords.keywords.map(k => k)
  // });
 
  const getColor = (tagName: string) => {
    const matchingTags = projectData.tags.filter(
      (t: TagType) => t.title === tagName
    );
    if (matchingTags.length === 0) {
      return 'gray';
    }
    return matchingTags[0].color;
  };

  // Cache the results of converting markdown to HTML, to avoid re-converting on every render
  const descriptionHTML = useMemo(() => {
    converter.makeHtml(entryData.description);
  }, [entryData.description]);


  return (
    <Box>
      <span style={{fontSize:22, fontWeight:"bold"}}>

      {entryData.isPrivate && (
          <FaLock
            title="This entry is private, and will be hidden when the Trrrace is exported."
            size="0.75em"
            style={{ display: 'inline', fill: 'lightgrey' }}
          />
        )}

        {entryData.title}{' '}
        {
          makeEditable ? 
          <Button leftIcon={<EditIcon />} onClick={makeEditable}>
            Edit
          </Button>
          : ""
        }
      </span>
    
      <Text style={{fontSize:15, fontWeight:"bold"}}>
        {format(new Date(entryData.date), 'dd MMMM yyyy')}
      </Text>
      <p>
        {entryData.tags.length === 0 ? (
          <b>No tags.</b>
        ) : (
          <>
            {entryData.tags.map((t) => 
              <Tag
                key={t}
                backgroundColor={checkTagColor(t)}
                marginRight={"0.25em"}
                marginBottom={"0.25em"}
              >
                {t}
              </Tag>
            )}
          </>
        )}
      </p>

      <br />
      {entryData.description && (
        <div
          className="readonlyEntryMarkdownPreview"
          dangerouslySetInnerHTML={{  __html: descriptionHTML }}
        />
      )}
     
      <SimpleGrid columns={1} spacing={3}>
        {files.map((f, i) => (
          <React.Fragment key={`fr-${f.title}-${i}`}>
            <Box bg={'#ececec'} key={`${f.title}-${i}`} p={3}>
              {showPopover ? (
                <Popover isOpen={showPopover} onClose={closePopover}>
                  <PopoverTrigger>
                    <span
                      style={{ fontSize: 18, fontWeight: 500, marginBottom: 5 }}
                    >
                      {f.title}{' '}
                    </span>
                  </PopoverTrigger>
                  <PopoverContent bg="white" color="gray">
                    <PopoverArrow bg="white" />
                    <PopoverBody>
                      <Button
                        onClick={() => {
                          setViewType('detail view');
                          dispatch({
                            type: 'SELECTED_ARTIFACT',
                            selectedArtifactEntry: entryData,
                            selectedArtifactIndex: i,
                          });
                        }}
                      >
                        See artifact in detail.
                      </Button>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              ) : (
                <span
                  style={{ fontSize: 18, fontWeight: 500, marginBottom: 5 }}
                  onMouseEnter={() => setShowPopover(true)}
                >
                  {' '}
                  {f.title}{' '}
                </span>
              )}

              <FaExternalLinkAlt
                onClick={() => openFile(f.title, folderPath)}
                title="Open file externally"
                size="13px"
                style={{ display: 'inline' }}
              />
               <AttachmentPreview
                  folderPath={folderPath}
                  title={f.title}
                  openFile={openFile}
                  size={60}
                /> 
              {/* {f.fileType != 'gdoc' && f.fileType != 'txt' ? 
                <AttachmentPreview
                  folderPath={folderPath}
                  title={f.title}
                  openFile={openFile}
                /> : <FileTextRender fileData={f} index={i} keywordArray={entryData.key_txt} />
            } */}
          </Box>
          
        </React.Fragment>
        ))}

      </SimpleGrid>
      {urls.length > 0 && (
        <>
          <Heading as="h3" size="lg">
            URLs
          </Heading>
          <UnorderedList>
            {urls.map((url, i) => (
              <ListItem key={`${url.url}-${i}`}>
                <a href={url.url}>{url.title} </a>
                <FaExternalLinkAlt
                  title="Open URL in default web browser"
                  size="12px"
                  style={{ display: 'inline' }}
                />
              </ListItem>
            ))}
          </UnorderedList>
        </>
      )}

    </Box>
  );
};

export default ReadonlyEntry;