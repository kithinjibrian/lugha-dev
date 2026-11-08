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

/** The lugha.toml every project starts with: the API's default (services/api/src/checks/manifest.la). */
export const DEFAULT_TOML = '[package]\nname = "playground"\nversion = "0.1.0"\nsource = "src"\n';

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
