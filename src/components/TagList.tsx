import React, { useState } from 'react';
import { Grid, Heading, Button, Badge } from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaPlus } from 'react-icons/fa';

import EdiText from 'react-editext';
import { MdColorLens } from 'react-icons/md';
import { FaTrashAlt } from 'react-icons/fa';
import { ColorResult, GithubPicker } from 'react-color';

import { useProjectState } from './ProjectContext';
import { EntryType, TagType } from './types';


interface TagListProps {
  tags: TagType[];
}

const TagList = (props: TagListProps) => {
  const { tags } = props;

  const [tagToChangeColor, setTagToChangeColor] =
    useState<false | number>(false);

  const [{ projectData }, dispatch] = useProjectState();

  const [showTags, setShowTags] = useState(false);


  const updateTagColor = (color: ColorResult) => {
    dispatch({
      type: 'UPDATE_TAG_COLOR',
      tagIndex: tagToChangeColor,
      color: color.hex,
    });
    setTagToChangeColor(false);
  };

  const updateTagName = (tagIndex: number, title: string) => {
    dispatch({
      type: 'UPDATE_TAG_NAME',
      tagIndex,
      title,
    });
  };

  const deleteTag = (tagName: string) => {
    const entriesToModify = projectData.entries.filter((e: EntryType) =>
      e.tags.includes(tagName)
    ).length;

    const uses =
      entriesToModify === 0 ? 'not used' : `used in ${entriesToModify} entries`;
    const confirmation = window.confirm(`Delete tag ${tagName} (${uses})?`);

    if (confirmation) {
      dispatch({ type: 'DELETE_TAG', title: tagName });
    }
  };

  return (
    <>

{ showTags ?
  <div>
        <Heading as="h5" size="lg">Tags <FaEyeSlash onClick={()=>{
          if(showTags){ 
            setShowTags(false);
          }else{ 
            setShowTags(true);
          };
        }} style={{display:"inline"}}/></Heading>
      <div style={{ width: 'fit-content' }}>
        {tags.map((tag: TagType, i) => (
          // <Grid key={tag.title} templateColumns="20px 20px 1fr 20px">
          <Badge key={tag.title} style={{margin:'2px'}}>
            <span
              style={{
                      color: tag.color,
                      cursor: 'default',
                      display:'inline'
                      // display: 'flex',
                      // alignItems: 'center',
                      }}
                    >
                      ■
                    </span>
                    <span
                      style={{
                        display:'inline'
                        // display: 'flex',
                        // alignItems: 'center',
                      }}
                    >
                      {' '}
                      <MdColorLens
                        onClick={() => setTagToChangeColor(i)}
                        style={{ verticalAlign: 'middle', display:'inline' }}
                        title="Change tag color"
                      />
                    </span>
        
                    <EdiText
                     
                      type="text"
                      value={tag.title}
                      onSave={(val) => updateTagName(i, val)}
                      validation={(val) => val.length > 0}
                      validationMessage="Tag name must not be empty"
                      editOnViewClick
                      submitOnEnter
                      submitOnUnfocus
                    />
        
                    <span
                      style={{
                        display:'inline'
                        // display: 'flex',
                        // alignItems: 'center',
                      }}
                    >
                      <FaTrashAlt
                        onClick={() => deleteTag(tag.title)}
                        title="Delete tag"
                      />
                    </span>
        
                    {tagToChangeColor === i && (
                      <>
                        {' '}
                        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                          <GithubPicker
                            color={tags[tagToChangeColor].color}
                            onChangeComplete={(color) => updateTagColor(color)}
                          />
                        </div>
                        <div />
                        <div />
                        <div />
                      </>
                    )}
                  {/* </Grid> */}
                  </Badge>
        ))}
      </div>
      </div>
      : <div><Heading as="h5">Tags <FaEye onClick={()=>{
        if(showTags){ 
          setShowTags(false);
        }else{ 
          setShowTags(true);
        };
      }} style={{display:"inline"}}/></Heading></div>
}
    </>
  );
};

export default TagList;
