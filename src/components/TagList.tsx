import React, { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';

import { RiFilterFill, RiFilterOffFill } from 'react-icons/ri';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { MdColorLens } from 'react-icons/md';
import { ChevronDownIcon } from '@chakra-ui/icons';

import { GithubPicker } from 'react-color';

import { useProjectState } from './ProjectContext';
import TagFilter from './SetFilterTags';

import { EntryType, TagType } from './types';
import textColor from '../colors';

interface ColorChangeModalProps {
  tagToChangeColor: number;
  setTagToChangeColor: (tagToRename: false | number) => void;
  tags: TagType[];
}

const ColorChangeModal = (props: ColorChangeModalProps) => {
  const { tagToChangeColor, setTagToChangeColor, tags } = props;
  const [newColor, setNewColor] = useState<string>(
    tags[tagToChangeColor].color
  );
  const [, dispatch] = useProjectState();

  const updateTagColor = (color: string) => {
    dispatch({
      type: 'UPDATE_TAG_COLOR',
      tagIndex: tagToChangeColor,
      color,
    });
    setTagToChangeColor(false);
  };

  const newColorIsDifferent = newColor !== tags[tagToChangeColor].color;

  return (
    <>
      <Modal isOpen onClose={() => setTagToChangeColor(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Change color for tag {tags[tagToChangeColor].title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div
              style={{
                marginTop: '10px',
                marginBottom: '10px',
                marginLeft: 'auto',
                marginRight: 'auto',
                width: 'max-content',
              }}
            >
              <GithubPicker
                triangle="hide"
                color={newColor}
                onChangeComplete={(color) => setNewColor(color.hex)}
              />
            </div>

            {newColorIsDifferent ? (
              <p>
                Change <code>{tags[tagToChangeColor].title}</code> from
                <span
                  style={{
                    color: tags[tagToChangeColor].color,
                    fontSize: '2em',
                  }}
                >
                  ■
                </span>
                to
                <span
                  style={{
                    color: newColor,
                    fontSize: '2em',
                  }}
                >
                  ■
                </span>
                ?
              </p>
            ) : (
              <p>Selected color is the same as the current color.</p>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="gray"
              mr={3}
              onClick={() => setTagToChangeColor(false)}
            >
              Cancel
            </Button>

            <Button
              colorScheme="blue"
              enabled={newColorIsDifferent}
              mr={3}
              onClick={() => updateTagColor(newColor)}
            >
              Change color
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

interface RenamingModalProps {
  tagToRename: false | number;
  setTagToRename: (tagToRename: false | number) => void;
  newName: string;
  setNewName: (newName: string) => void;
  tags: TagType[];
}

const RenamingModal = (props: RenamingModalProps) => {
  const { tagToRename, setTagToRename, newName, setNewName, tags } = props;
  const [, dispatch] = useProjectState();

  const updateTagName = (tagIndex: number, title: string) => {
    dispatch({
      type: 'UPDATE_TAG_NAME',
      tagIndex,
      title,
    });
    setTagToRename(false);
  };

  if (tagToRename === false) {
    return <></>;
  }

  return (
    <>
      <Modal isOpen onClose={() => setTagToRename(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Rename tag {tags[tagToRename].title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>New name for tag: </FormLabel>
              <Input
                value={newName}
                onChange={(ev) => setNewName(ev.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="gray"
              mr={3}
              onClick={() => setTagToRename(false)}
            >
              Cancel
            </Button>

            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => updateTagName(tagToRename, newName)}
            >
              Rename
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

interface TagListProps {
  tags: TagType[];
}

const TagList = (props: TagListProps) => {
  const { tags } = props;

  const [tagToChangeColor, setTagToChangeColor] =
    useState<false | number>(false);

  const [tagToRename, setTagToRename] = useState<false | number>(false);
  const [newName, setNewName] = useState<string>('');
  const [showTags, setShowTags] = useState(false);

  const [{ filterTags, projectData }, dispatch] = useProjectState();

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

  const toggleTagInFilter = (tag: TagType) => {
    let newFilterTags;
    if (filterTags.includes(tag.title)) {
      newFilterTags = filterTags.filter((t) => t !== tag.title);
    } else {
      newFilterTags = [...filterTags, tag.title];
    }

    dispatch({
      type: 'UPDATE_FILTER_TAGS',
      filterTags: newFilterTags,
    });
  };

  const isSelected = (tag: TagType) =>
    filterTags.length === 0 || filterTags.includes(tag.title);

  return (
    <>

    {/* <Heading as="h2">Tags</Heading> */}

          <RenamingModal
            tagToRename={tagToRename}
            setTagToRename={setTagToRename}
            newName={newName}
            setNewName={setNewName}
            tags={tags}
          />

        {tagToChangeColor !== false && (
          <ColorChangeModal
            tagToChangeColor={tagToChangeColor}
            setTagToChangeColor={setTagToChangeColor}
            tags={tags}
          />
        )}

      <div>
        <div style={{ width: 'fit-content' }}>
          {tags.map((tag: TagType, i) => (
            // <Grid key={tag.title} templateColumns="20px 20px 1fr 20px">
            <Menu key={tag.title}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                marginLeft="0.25em"
                borderColor={tag.color}
                borderWidth="5px"
                bgColor={isSelected(tag) ? tag.color : `${tag.color}59`}
                color={isSelected(tag) ? textColor(tag.color) : 'black'}
              >
                {tag.title}
              </MenuButton>

              <MenuList>
                <MenuItem onClick={() => toggleTagInFilter(tag)}>
                  {filterTags.includes(tag.title) ? (
                    <>
                      <RiFilterOffFill />
                      Remove filter for tag
                    </>
                  ) : (
                    <>
                      <RiFilterFill />
                      Filter entries using tag
                    </>
                  )}
                </MenuItem>

                <MenuDivider />

                <MenuItem onClick={() => setTagToChangeColor(i)}>
                  <MdColorLens
                    style={{ verticalAlign: 'middle', display: 'inline' }}
                    title="Change tag color"
                  />{' '}
                  Change color
                </MenuItem>

                <MenuItem onClick={() => deleteTag(tag.title)}>
                  <FaTrashAlt title="Delete tag" /> Delete tag
                </MenuItem>

                <MenuItem onClick={() => setTagToRename(i)}>
                  <FaPencilAlt title="Rename tag" /> Rename tag
                </MenuItem>
              </MenuList>
            </Menu>
          ))}
        </div>
      </div>
      <TagFilter />

    </>
  );
};

export default TagList;