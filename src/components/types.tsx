// files

interface File {
  fileType: string;
  title: string;
  context: string;
  url?: string;
  fileId?: string;
  artifactType: string;
  artifact_uid: string;
  meta: string; // ?
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
  activity_uid: string;
}

interface TagType {
  title: string;
  color: string;
  dob: string;
  matches?: string[];
}

interface ReactTagType {
  id: string;
  text: string;
}

interface DeadlineType {
  title: string;
  date: string;
}

interface Citation {
  id: string;
  cIndex: number;
}
interface ProjectType {
  title: string;
  description: string;
  tags: TagType[];
  entries: EntryType[];
  eventArray: any[];

  citations: Citation[];
}

type ResearchThreadEvidence = {
  type: string;
  activityTitle?: string;
  activity_index: number;
  ResearchThreadEvidence: string;
  artifactTitle: string;
  artifactIndex?: string; // or number?
  dob: string;
  rationale: string;
};

type ResearchThread = {
  evidence: ResearchThreadEvidence[];
  color: string;
  title: string;
  actions: { action: string; when: string }[];
  rt_id: string;
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

type ViewParams = {
  view: string;
  granularity: 'paper' | 'artifact' | 'thread' | 'activity';
  cIndex: string;
  id: string;
};

// used in some components like LeftSidebar
type ArtifactTypesType = {
  title: string;
  matches: number;
  color: string;
};

// used in project state
type ArtifactTypesType2 = {
  type: string;
  color: string;
};

type FileTypesType = {
  title: string;
  matches: number;
};

type QueryType = {
  term: string;
  matches: {
    entry: any;
    textMatch: any[];
    googMatch: any[];
    titleMatch: boolean;
  }[];
};

type HopEntryType = {
  activity: any;
  artifactUid: string;
  hopReason: string;
  tag: any;
};

type ProjectState = {
  projectData: ProjectType;
  isReadOnly: boolean;
  folderPath: string | null;
  filterTags: string[] | null;
  filterType: string | null;
  filterTypes: string[] | null;
  // NEED TO MAKE THESE MORE SPECIFIC
  filterDates: [null | Date, null | Date];
  filterQuery: string[]; // list of titles of matching activities?
  filterRT: null | {
    title: string;
    key: string[];
    rtIndex: number;
    rtId: string;
    associatedKey: string[];
  };
  threadTypeFilterArray: {
    type: 'string';
    show: boolean;
    matches: ResearchThreadEvidence[];
  }[];
  query: null | QueryType;
  artifactTypes: { artifact_types: ArtifactTypesType2[] };
  googleData?: GoogleData;
  txtData?: TxtData[];
  researchThreads?: ResearchThreadData;
  selectedActivityURL: null | string;
  highlightedTag?: string;
  highlightedType?: string;
  selectedArtifact: { activity: EntryTypeWithIndex; artifactIndex: number };
  filteredActivities: EntryType[];
  hopArray: HopEntryType[];
  viewParams: ViewParams;
};

interface ProjectViewProps {
  projectData: ProjectType;
  filteredActivites: EntryType[];
  folderPath: string;
  setViewType: (v: string) => void;
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

type TextArray = { style: string; textData: string }[];

export {
  ArtifactTypesType,
  DeadlineType,
  EntryType,
  EntryPropTypes,
  EntryTypeWithIndex,
  File,
  FileObj,
  FileTypesType,
  GoogleDocContent,
  GoogleDocParagraph,
  GoogleParagraphStyle,
  URLAttachment,
  TagType,
  TxtData,
  TextEntry,
  TextArray,
  ProjectState,
  ProjectType,
  ProjectViewProps,
  ResearchThread,
  ResearchThreadEvidence,
  ResearchThreadData,
  ReactTagType,
  ReactTag,
};
