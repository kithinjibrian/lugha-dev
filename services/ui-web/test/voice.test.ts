// Checks what a rule can catch in a lesson step's wording, on samples and on every step in content/.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { voiceProblems } from "../src/content/voice";

const step = (body: string, front = "title: A step") => `---\n${front}\n---\n\n${body}\n`;

describe("voiceProblems", () => {
  it("passes plain sentences, code and a quiz", () => {
    const md = step(
      [
        "Line 5 starts `b` as a copy of `a`.",
        "Press Run and look at what `a` prints.",
        "",
        "```lugha",
        'println("hi!");',
        "```",
        "",
        "```quiz",
        'options = ["Yes", "No"]',
        "answer = 0",
        'feedback = ["Right.", "Not quite."]',
        "```",
      ].join("\n"),
    );
    expect(voiceProblems(md)).toEqual([]);
  });

  it("ignores what's inside inline code", () => {
    expect(voiceProblems(step("Line 4 uses `!=` and `just_one`."))).toEqual([]);
  });

  it("finds selling words", () => {
    expect(voiceProblems(step("It's simply a copy."))).toEqual(['uses "simply"']);
    expect(voiceProblems(step("This is just easy."))).toEqual(['uses "just"', 'uses "easy"']);
  });

  it("finds announcements", () => {
    expect(voiceProblems(step("Let's look at copies."))).toEqual(['uses "Let\'s"']);
    expect(voiceProblems(step("In this step you copy a value."))).toEqual(['uses "In this step"']);
  });

  it("finds exclamation marks and emoji", () => {
    expect(voiceProblems(step("It compiles!"))).toEqual(["has an exclamation mark"]);
    expect(voiceProblems(step("It compiles 🎉"))).toEqual(["has an emoji"]);
  });

  it("finds headings and bullets", () => {
    expect(voiceProblems(step("# Copies\n\nA copy."))).toEqual(["has a heading or a bullet: # Copies"]);
    expect(voiceProblems(step("- one\n- two"))).toEqual(["has a heading or a bullet: - one", "has a heading or a bullet: - two"]);
  });

  it("finds other languages' names", () => {
    expect(voiceProblems(step("This works as in Python."))).toEqual(['names another language: "Python"']);
    expect(voiceProblems(step("Go and TypeScript do this too."))).toEqual(['names another language: "Go"', 'names another language: "TypeScript"']);
  });

  it("finds a sentence of more than 30 words", () => {
    const long = Array.from({ length: 31 }, (_, i) => `w${i}`).join(" ") + ".";
    expect(voiceProblems(step(long))).toEqual(["has a sentence of 31 words: w0 w1 w2 w3 w4 w5 …"]);
  });

  it("finds a step of more than 120 words", () => {
    const sentence = "One two three four five six seven eight nine ten.";
    const body = Array.from({ length: 13 }, () => sentence).join("\n");
    expect(voiceProblems(step(body))).toEqual(["has 130 words of text (at most 120)"]);
  });

  it("checks the step's own words for its error, and the quiz's feedback", () => {
    expect(voiceProblems(step("Press Run.", "title: A step\nerror_note: Simply add `mut`."))).toEqual(['uses "Simply"']);
    const quiz = step('```quiz\noptions = ["A", "B"]\nanswer = 0\nfeedback = ["Great job!", "Not quite."]\n```');
    expect(voiceProblems(quiz)).toEqual(["has an exclamation mark"]);
  });
});

const LEARN = resolve(__dirname, "../../../content/learn");

function steps(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return steps(path);
    return name === "step.md" ? [path] : [];
  });
}

describe("every step in content/learn", () => {
  it("passes the voice check", () => {
    const found = steps(LEARN).flatMap((path) => voiceProblems(readFileSync(path, "utf8")).map((p) => `${path.slice(LEARN.length + 1)}: ${p}`));
    expect(found).toEqual([]);
  });
});

describe("voiceProblems in code blocks", () => {
  it("leaves a code line that starts like a heading or bullet alone", () => {
    expect(voiceProblems(step("```lugha\n#{1, 2}\n- 1\n```"))).toEqual([]);
  });
});

describe("voiceProblems and the page's layout", () => {
  it("finds a direction, which is wrong on a phone where the code sits below the text", () => {
    expect(voiceProblems(step("On the right, `b` is a copy."))).toEqual(['points in a direction: "On the right"']);
    expect(voiceProblems(step("The code to the left of the output."))).toEqual(['points in a direction: "to the left"']);
  });
});
