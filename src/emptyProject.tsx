import { ProjectType } from './components/types';

function getEmptyProject(folderName): ProjectType {
 
  return {
    title: folderName,
    description: '',
    date: '',
    tags: [],
    entries: [],
    researchThreads: [],
  };
}

export default getEmptyProject;
