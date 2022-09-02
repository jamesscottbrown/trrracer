import { ProjectType } from './components/types';

function getEmptyProject(folderName: string): ProjectType {
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
