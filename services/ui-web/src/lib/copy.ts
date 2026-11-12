// Every sentence the interface shows, as approved in PRP-002's CONTENT
// (2026-11-08). Nothing a visitor reads is written anywhere else; lesson and
// example text comes from content/.

export const copy = {
  headline: "A language that doesn't get in your way, but still has your back.",
  nav: { learn: "Learn", examples: "Examples", playground: "Playground", github: "GitHub", home: "Lugha home" },
  home: { start: "Start learning", examples: "Examples", playground: "Playground", card: "fib.la" },
  footer: (version: string) => [version, "Lugha v17", "Free software, GPL-3.0"],

  run: "Run",
  running: "Running…",
  reset: "Reset",
  solve: "Solve",
  previous: "Previous",
  next: "Next",
  stepOf: (n: number, m: number) => `Step ${n} of ${m}`,
  outline: "Course outline",
  startOver: "Start over",
  startOverAsk: "Start the course over? Your progress will be cleared.",
  files: "Files",
  output: "Output",
  tests: "Tests",
  input: "Input",
  arguments: "Arguments",
  argumentsHelp: ["Passed after ", "--", "; read them with ", "args()", "."],
  stdin: "Standard input",
  stdinHelp: ["What ", "read_line()", " reads, one line at a time."],
  format: "Format",
  test: "Test",
  share: "Share",
  download: "Download",
  newProject: "New",
  newProjectAsk: "Start a new project? The current one will be replaced.",
  copyCode: "Copy code",
  copied: "Copied",
  openInPlayground: "Open in Playground",
  openInPlaygroundAsk: "Replace your Playground project with this code?",
  filterExamples: "Filter examples",
  pressRun: "Press Run.",
  exited: (code: number) => `Exited with code ${code}`,
  moreAbout: (code: string) => `More about ${code}`,
  openedFromLink: "Opened from a link",
  linkCopied: "Link copied.",
  tooBigToShare: "This project is too big to share as a link; use Download instead.",
  editOnGitHub: "Edit this lesson on GitHub",
  seeAlso: (title: string) => `See it in a real program: ${title}`,

  // The output panel (WEB-7): the API's sentences (PRP-001) and the site's own.
  stoppedTime: "Your program was stopped after 5 seconds.",
  stoppedMemory: "Your program was stopped because it used more than 256 MB of memory.",
  outputCut: "Its output was cut off at 64 KB.",
  busy: "The server is busy. Try again in a moment.",
  offline: "You're offline. Your code is saved here; run it when you're back.",
  service: "Couldn't run your code right now. Try again in a moment.",
} as const;

export const GITHUB = "https://github.com/kithinjibrian/lugha";
/** Where content/ lives on GitHub, for "Edit this lesson on GitHub". */
export const CONTENT_ON_GITHUB = "https://github.com/kithinjibrian/lugha-dev/tree/main/content";
