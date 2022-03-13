import React from 'react';

import { TagType } from './types';

interface TagListProps {
  tags: TagType[];
}

const TokenTagList = (props: TagListProps) => {
  const { tags } = props;

  return (
    <>
      <div style={{ width: 'fit-content' }}>
        {tags.map((tag: TagType) => (
          <div
            key={tag.title}
            style={{
              display: 'grid',
              gridTemplateColumns: '20px 20px 1fr 20px',
            }}
          />
        ))}
      </div>
    </>
  );
};

export default TokenTagList;
