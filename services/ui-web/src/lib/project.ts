// What a workspace holds: the files, and the program's arguments and stdin.
export interface File {
  path: string;
  text: string;
}

export interface Project {
  files: File[];
  args: string[];
  stdin: string;
}
