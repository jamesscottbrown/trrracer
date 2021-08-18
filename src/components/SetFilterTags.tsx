import React from 'react';

import { WithContext as ReactTags } from 'react-tag-input';

import { useProjectState } from './ProjectContext';
import { TagType } from './types';

const TagFilter = () => {
  const [{ projectData, filterTags }, dispatch] = useProjectState();
  const allTagTitles = projectData.tags.map((t: TagType) => t.title);

  const KeyCodes = {
    comma: 188,
    enter: 13,
  };

  const setFilterTags = (newFilterTags: string[]) =>
    dispatch({ type: 'UPDATE_FILTER_TAGS', filterTags: newFilterTags });

  return (
    <div>
      Only show entries with tags:
      <ReactTags
        minQueryLength={1}
        tags={filterTags.map((t: string) => ({ id: t, text: t }))}
        suggestions={allTagTitles.map((t: string) => ({ id: t, text: t }))}
        delimiters={[KeyCodes.comma, KeyCodes.enter]}
        editable={false}
        handleDelete={(i: number) =>
          setFilterTags(
            filterTags.filter((_tag: string, index: number) => index !== i)
          )
        }
        handleAddition={(newTag: { text: string }) =>
          allTagTitles.includes(newTag.text) &&
          setFilterTags([...filterTags, newTag.text])
        }
      />
    </div>
  );
};

export default TagFilter;
