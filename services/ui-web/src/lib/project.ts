// Describes what a workspace holds: the files, and the program's arguments and stdin.

/** Holds one file: its path in the project and its text. */
export interface File {
  path: string;
  text: string;
}

/** Holds a whole project: its files, the program's arguments and its stdin. */
export interface Project {
  files: File[];
  args: string[];
  stdin: string;
}

/**
 * Gives the lugha.toml every project starts with, the same as the API's default in
 * `services/api/src/checks/manifest.la`.
 */
export const DEFAULT_TOML = '[package]\nname = "playground"\nversion = "0.1.0"\nsource = "src"\n';

/** Makes a project of `files` (a step's, src/main.la first) and the default lugha.toml, with no arguments. */
export function projectOfFiles(files: File[]): Project {
  return { files: [...files, { path: "lugha.toml", text: DEFAULT_TOML }], args: [], stdin: "" };
}

/** Makes a project of one program in `src/main.la`, with the default lugha.toml and no arguments. */
export function projectOf(source: string, stdin = ""): Project {
  return {
    files: [
      { path: "src/main.la", text: source },
      { path: "lugha.toml", text: DEFAULT_TOML },
    ],
    args: [],
    stdin,
  };
}
