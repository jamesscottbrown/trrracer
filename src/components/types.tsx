// files

interface File {
  fileType: string;
  title: string;
  context: string;
  url?: string;
  fileId?: string;
  artifactType: string;
  artifact_uid: string;
}

interface FileObj {
  name: string;
  path: string;
  artifactType: string;
  artifact_uid?: string;
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
  activity_uid: string;
}

interface EntryTypeWithIndex {
  description: string;
  title: string;
  files: File[];
  urls: URLAttachment[];
  date: string;
  tags: string[];
  index: number;
  quoteTags: string[];
  isPrivate: boolean;
  artifact_uid: string;
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

interface DeadlineType {
  title: string;
  date: string;
}

interface ProjectType {
  title: string;
  description: string;
  tags: TagType[];
  entries: EntryType[];
  eventArray: any[];
}

type ResearchThreadEvidence = {
  type: string;
  activityTitle?: string;
  artifactIndex?: string; // or number?
};

type ResearchThread = {
  evidence: ResearchThreadEvidence[];
};

type ResearchThreadData = {
  research_threads: ResearchThread[];
};

type GoogleTextElement = {
  startIndex: number;
  endIndex: number;
  textRun: {
    content: string;
    textStyle: string;
  };
};

type GoogleParagraphStyle = {
  namedStyleType: string;
  direction: string;
};

type GoogleDocParagraph = {
  elements: GoogleTextElement[];
  paragraphStyle: GoogleParagraphStyle;
};

type GoogleDocContent = {
  startIndex: number;
  endIndex: number;
  paragraph?: GoogleDocParagraph;
};

type GoogleDocData = {
  title: string;

  body: {
    content: GoogleDocContent;
  };

  revisionId: string;
  documentId: string;
};

type GoogleData = {
  [s: string]: GoogleDocData;
};

type TextEntry = {
  'entry-title': string;
  'entry-index': number;
  'file-index': number;
  'file-title': string;
  keywords: {
    keywords: string;
  };
  text: string;
};

type TxtData = {
  'text-data': TextEntry[];
};

type ProjectState = {
  projectData: ProjectType;
  folderPath: string | null;
  filterTags: string[] | null;
  filterType: string | null;
  filterTypes: string[] | null;

  //NEED TO MAKE THESE MORE SPECIFIC
  filterDates: any;
  filterQuery: any;
  filterRT: any;
  threadTypeFilterArray: any;
  query: any;
  artifactTypes: any;

  googleData?: GoogleData;
  txtData?: TxtData[];
  researchThreads?: ResearchThreadData;

  selectedActivityURL: null | string;

  highlightedTag?: string;
  highlightedType?: string;

  selectedArtifact: {activity:EntryTypeWithIndex, artifactIndex:number}; // ?
  filteredActivities: any;

  hopArray: any[];
};

interface ProjectViewProps {
  projectData: ProjectType;
  filteredActivites: EntryType[];
  folderPath: string;
  setViewType: (v: any) => void;
  setSelectedArtifact: (e: any) => void;
}

interface EntryPropTypes {
  entryData: EntryType;
  entryIndex: number;
  openFile: (a: string) => void;
  updateEntryField: (fieldName: string, newData: any) => void;
  allTags: TagType[];
  makeNonEditable: () => void;
}

interface ReactTag {
  id: string;
  text: string;
}

export {
  DeadlineType,
  EntryType,
  EntryPropTypes,
  EntryTypeWithIndex,
  File,
  FileObj,
  GoogleDocContent,
  GoogleDocParagraph,
  GoogleParagraphStyle,
  URLAttachment,
  TagType,
  TxtData,
  TextEntry,
  ProjectState,
  ProjectType,
  ProjectViewProps,
  ResearchThread,
  ResearchThreadEvidence,
  ReactTagType,
  ReactTag,
};
