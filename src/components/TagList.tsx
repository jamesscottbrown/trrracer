import React, { useState } from 'react';

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
      <h2>Tags</h2>

      <div style={{ width: 'fit-content' }}>
        {tags.map((tag: TagType, i) => (
          <div
            key={tag.title}
            style={{
              display: 'grid',
              gridTemplateColumns: '20px 20px 1fr 20px',
            }}
          >
            <span
              style={{
                color: tag.color,
                cursor: 'default',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ■
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {' '}
              <MdColorLens
                onClick={() => setTagToChangeColor(i)}
                style={{ verticalAlign: 'middle' }}
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
            {tagToChangeColor === i && (
              <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                <GithubPicker
                  color={tags[tagToChangeColor].color}
                  onChangeComplete={(color) => updateTagColor(color)}
                />
              </div>
            )}

            <FaTrashAlt onClick={() => deleteTag(tag.title)} />
          </div>
        ))}
      </div>
    </>
  );
};

export default TagList;
