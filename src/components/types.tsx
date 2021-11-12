// files

interface File {
  fileType: string;
  title: string;
  // fileType: string;
  // fileId: string;
  meta: string;
  url?: string;
}

interface FileObj {
  name: string;
  path: string;
}

interface URLAttachment {
  title: string;
  url: string;
}

interface EntryType {
  description: string;
  title: string;
  files: File[];
  urls: URLAttachment[];
  date: string;
  tags: string[];
}

interface EntryTypeWithIndex {
  description: string;
  title: string;
  files: File[];
  urls: URLAttachment[];
  date: string;
  tags: string[];
  index: number;
}

interface TagType {
  title: string;
  color: string;
  dob: string;
}

interface ReactTagType {
  id: string;
  text: string;
}

interface EdgeType {
  to: string;
  from: string;
  description: string;
  actions: ConceptActionType[];
  key: string;
}

interface ConceptType {
  name: string;
  actions : ConceptActionType[];
}

interface ConceptActionType {
  action:string;
  when: string;
}
interface DeadlineType {
  title: string;
  date: string;
}

interface ProjectType {
  title: string;
  description: string;
  tags: TagType[];
  entries: EntryType[];
  concepts : ConceptType[];
  edges : EdgeType[];
  topics: [];
  deadlines: DeadlineType[];
}

interface ProjectViewProps {
  projectData: ProjectType;
  folderPath: string;
}

export {
  DeadlineType,
  EntryType,
  EntryTypeWithIndex,
  File,
  FileObj,
  URLAttachment,
  TagType,
  ProjectType,
  ProjectViewProps,
  ReactTagType,
  ConceptType,
  EdgeType
};
