// files

interface File {
  title: string;
  format: string
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
  tags: [];
}

interface TagType {
  title: string;
  color: string;
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
  viewType: string;
  setViewType: (viewType: string) => void;
}

export { EntryType, File, FileObj, TagType, ProjectType, ProjectViewProps };
