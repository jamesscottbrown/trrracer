import React, { useState, useEffect } from 'react';
import { Button, ButtonGroup } from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useProjectState } from './ProjectContext';
import { EntryTypeWithIndex, ProjectViewProps } from './types';
import ActivityWrap from './ActivityWrap';

const ProjectListView = (ProjectPropValues: ProjectViewProps) => {
  const {
    filteredActivities,
    setViewType,
    setSelectedArtifactIndex,
    setSelectedArtifactEntry,
    selectedEntryIndex,
    hoverActivity,
  } = ProjectPropValues;

  const [{ projectData }] = useProjectState();

  const [editable, setEditable] = useState<boolean[]>(
    Array.from(Array(projectData.entries.length), () => false)
  );

  useEffect(() => {
    if (editable.length === projectData.entries.length - 1) {
      // one more entry was added
      setEditable([...editable, true]);
    } else if (editable.length !== projectData.entries.length) {
      setEditable(
        Array.from(Array(projectData.entries.length), () => false)
      );
    }
  }, [projectData]);

  useEffect(() => {
    setEditable(Array.from(Array(projectData.entries.length), () => false));
    setEditableStatus(selectedEntryIndex, true);
  }, [selectedEntryIndex]);

  const makeAllEditable = () => {
    setEditable(Array.from(Array(projectData.entries.length), () => true));
  };

  const makeAllNonEditable = () => {
    setEditable(Array.from(Array(projectData.entries.length), () => false));
  };

  const setEditableStatus = (index: number, isEditable: boolean) => {
    setEditable((oldEditable) =>
      oldEditable.map((d, i) => (i === index ? isEditable : d))
    );
  };

  return (
    <div style={{ padding: '10px' }}>
      <ButtonGroup style={{ display: 'inline' }}>
        {!editable.every((t) => t) && (
          <Button onClick={makeAllEditable} type="button">
            <FaEye />
            Show edit controls for all activities
          </Button>
        )}
        {!editable.every((t) => !t) && (
          <Button onClick={makeAllNonEditable} type="button">
            <FaEyeSlash /> Hide edit controls for all activities
          </Button>
        )}
      </ButtonGroup>

      <br />

      {filteredActivities.map((activityData: EntryTypeWithIndex, i: number) => (
        <ActivityWrap
          key={`fr-${activityData.title}-${activityData.index}-${i}`}
          activityData={activityData}
          editable={editable}
          setEditableStatus={setEditableStatus}
          setViewType={setViewType}
          setSelectedArtifactIndex={setSelectedArtifactIndex}
          setSelectedArtifactEntry={setSelectedArtifactEntry}
          index={i}
          hoverActivity={hoverActivity}
        />
      ))}
    </div>
  );
};
export default ProjectListView;
