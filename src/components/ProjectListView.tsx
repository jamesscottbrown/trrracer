import React, { useState, useEffect } from 'react';
import { EntryTypeWithIndex, ProjectViewProps } from './types';
import ActivityWrap from './ActivityWrap';

const ProjectListView = (ProjectPropValues: any) => {
  const {
    filteredActivities,
    projectData,
    setViewType,
    setSelectedArtifactIndex,
    setSelectedArtifactEntry,
    selectedEntryIndex,
    hoverActivity,
    folderPath, 
    dispatch, 
    researchThreads,
    filterRT
  } = ProjectPropValues;

  

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

  const setEditableStatus = (index: number, isEditable: boolean) => {
    setEditable((oldEditable) =>
      oldEditable.map((d, i) => (i === index ? isEditable : d))
    );
  };

  return (
    <div style={{ padding: '10px' }}>
      
      {filteredActivities.map((activityData: EntryTypeWithIndex, i: number) => (
        <ActivityWrap
          key={`fr-${activityData.title}-${activityData.index}-${i}`}
          projectData={projectData}
          activityData={activityData}
          editable={editable}
          setEditableStatus={setEditableStatus}
          setViewType={setViewType}
          setSelectedArtifactIndex={setSelectedArtifactIndex}
          setSelectedArtifactEntry={setSelectedArtifactEntry}
          index={i}
          hoverActivity={hoverActivity}
          folderPath={folderPath}
          dispatch={dispatch} 
          researchThreads={researchThreads}
          filterRT={filterRT}
        />
      ))}
    </div>
  );
};
export default ProjectListView;
