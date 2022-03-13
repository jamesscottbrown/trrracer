// files

interface File {
  fileType: string;
  title: string;
  // fileId: string;
  context: string;
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
  quoteTags: string[];
  isPrivate: boolean;
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
  actions: ConceptActionType[];
}

interface ConceptActionType {
  action: string;
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
  concepts: ConceptType[];
  edges: EdgeType[];
  topics: [];
  deadlines: DeadlineType[];
}

interface ProjectViewProps {
  projectData: ProjectType;
  folderPath: string;
  setViewType: (v: any) => void;
  setSelectedArtifactIndex: (i: Number) => void;
  setSelectedArtifactEntry: (e: any) => void;
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
  EdgeType,
};
