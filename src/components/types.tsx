// files

interface File {
  title: string;
}

interface FileObj {
  name: string;
  path: string;
}

interface EntryType {
  description: string;
  title: string;
  files: File[];
}

interface TagType {
  title: string;
}

interface ProjectType {
  title: string;
  description: string;
  tags: TagType[];
  entries: EntryType[];
}

export { EntryType, File, FileObj, TagType, ProjectType };
