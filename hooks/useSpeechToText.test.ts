import { describe, it, expect } from "vitest";
import { splitSpeechResults } from "@/hooks/useSpeechToText";

describe("splitSpeechResults", () => {
  it("separates finals from interim", () => {
    const { finals, interim } = splitSpeechResults([
      { isFinal: true, transcript: "I led a team" },
      { isFinal: false, transcript: "of five eng" },
    ]);
    expect(finals).toEqual(["I led a team"]);
    expect(interim).toBe("of five eng");
  });

  it("trims and drops empty segments", () => {
    const { finals, interim } = splitSpeechResults([
      { isFinal: true, transcript: "  hello  " },
      { isFinal: false, transcript: "   " },
    ]);
    expect(finals).toEqual(["hello"]);
    expect(interim).toBe("");
  });

  it("joins multiple interim parts and handles empty input", () => {
    expect(splitSpeechResults([])).toEqual({ finals: [], interim: "" });
    const { interim } = splitSpeechResults([
      { isFinal: false, transcript: "first" },
      { isFinal: false, transcript: "second" },
    ]);
    expect(interim).toBe("first second");
  });
});
