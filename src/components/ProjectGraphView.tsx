import { EntryType, FileObj, ProjectViewProps, TagType } from './types';

const { ipcRenderer } = require('electron');

const ProjectGraphView = (ProjectPropValues: ProjectViewProps) => {
    const { projectData, folderPath, viewType, setViewType } = ProjectPropValues;
  
    console.log(projectData, folderPath, viewType, setViewType);
  };
  export default ProjectGraphView;