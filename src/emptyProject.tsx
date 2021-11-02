import { ProjectType } from './components/types';

function getEmptyProject(): ProjectType {
  return {
    title: 'Project title',
    description: '',
    date: '',
    tags: [],
    entries: [],
    deadlines: [
      {
        title: 'Assignment 2',
        date: '2021-11-02',
      },
      {
        title: 'Story & Context',
        date: '2021-11-17',
      },
      {
        title: 'Visual Design',
        date: '2021-11-25',
      },
      {
        title: 'Evaluation + Presentation',
        date: '2021-12-01',
      },
      {
        title: 'Assignment 3 + 4',
        date: '2021-12-03',
      },
    ],
  };
}

export default getEmptyProject;
