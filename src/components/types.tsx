// files

interface File {
  fileType: string;
  title: string;
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

interface TagType {
  title: string;
  color: string;
}

interface ReactTagType {
  id: string;
  text: string;
}

interface ProjectType {
  title: string;
  description: string;
  tags: TagType[];
  entries: EntryType[];
}

interface ProjectViewProps {
  projectData: ProjectType;
  folderPath: string;
}

export {
  EntryType,
  File,
  FileObj,
  URLAttachment,
  TagType,
  ProjectType,
  ProjectViewProps,
  ReactTagType,
};
