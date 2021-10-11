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

const TokenTagList = (props: TagListProps) => {
  const { tags } = props;

  const [{ projectData }, dispatch] = useProjectState();

  return (
    <>

      <div style={{ width: 'fit-content' }}>
        {tags.map((tag: TagType, i) => (
          <div
            key={tag.title}
            style={{
              display: 'grid',
              gridTemplateColumns: '20px 20px 1fr 20px',
            }}
          >
          </div>
        ))}
      </div>
    </>
  );
};

export default TokenTagList;
