// files

interface File {
  title: string;
  format: string;
  id: string
}

interface FileObj {
  name: string;
  path: string;
}

interface EntryType {
  description: string;
  title: string;
  files: File[];
  date: string;
  tags: string[];
}

interface TagType {
  title: string;
  color: string;
}

interface ReactTagType {
  id: string;
  text: string;
}

interface ConceptType {
  name: string;
  actions : ConceptActionType[];
}

interface ConceptActionType {
  action:string;
  when: string;
}

interface ProjectType {
  title: string;
  description: string;
  tags: TagType[];
  entries: EntryType[];
  concepts : ConceptType[];
}

interface ProjectViewProps {
  projectData: ProjectType;
  folderPath: string;
  viewType: string;
  setViewType: (viewType: string) => void;
}

export {
  EntryType,
  File,
  FileObj,
  TagType,
  ProjectType,
  ProjectViewProps,
  ReactTagType,
  ConceptType,
};
