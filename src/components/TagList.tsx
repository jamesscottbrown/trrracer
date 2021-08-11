import React, { useState } from 'react';

import { MdColorLens } from 'react-icons/md';
import { ColorResult, GithubPicker } from 'react-color';

import { useProjectState } from './ProjectContext';
import { TagType } from './types';

interface TagListProps {
  tags: TagType[];
}

const TagList = (props: TagListProps) => {
  const { tags } = props;

  const [tagToChangeColor, setTagToChangeColor] =
    useState<false | number>(false);

  const [, dispatch] = useProjectState();

  const updateTag = (color: ColorResult) => {
    dispatch({
      type: 'UPDATE_TAG_COLOR',
      tagIndex: tagToChangeColor,
      color: color.hex,
    });
    setTagToChangeColor(false);
  };

  return (
    <>
      <h2>Tags</h2>

      <ul style={{ listStyleType: 'none' }}>
        {tags.map((tag: TagType, i) => (
          <li key={tag.title}>
            <span style={{ color: tag.color }}>■</span> {tag.title}{' '}
            <MdColorLens onClick={() => setTagToChangeColor(i)} />
            {tagToChangeColor === i && (
              <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                <GithubPicker
                  color={tags[tagToChangeColor].color}
                  onChangeComplete={(color, event) => updateTag(color, event)}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

export default TagList;
