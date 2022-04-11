import React from 'react';
import { Button } from '@chakra-ui/react';
import { WithContext as ReactTags } from 'react-tag-input';
import { RiFilterOffFill } from 'react-icons/ri';
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

  const clearFilterTags = () => setFilterTags([]);

  return (
    <div style={{ paddingTop: '0.25em' }}>
      <span style={{ float: 'left' }}>
        Filter to only show entries with tags:
      </span>
      <ReactTags
        style={{ float: 'right' }}
        placeholder="Start typing the name of a tag"
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
      {filterTags.length > 0 && (
        <Button onClick={clearFilterTags} size="sm">
          <RiFilterOffFill /> Clear all filters
        </Button>
      )}
      <br />
    </div>
  );
};

export default TagFilter;
