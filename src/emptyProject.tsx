import { ProjectType } from './components/types';

function getEmptyProject(): ProjectType {
  return {
    title: 'Project title',
    description: '',
    date: '',
    tags: [],
    entries: [],
  };
}

export default getEmptyProject;
