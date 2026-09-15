import { describe, it, expect } from "vitest";
import { getUIMessageText, getUIMessageSources } from "@/lib/services/chat.client";

describe("chat UIMessage helpers", () => {
  it("extracts text parts", () => {
    expect(getUIMessageText({ parts: [{ type: "text", text: "hi" }, { type: "text", text: "there" }] })).toBe("hi\nthere");
    expect(getUIMessageText({ parts: [] })).toBe("");
  });
  it("extracts source-url parts", () => {
    const sources = getUIMessageSources({
      parts: [{ type: "source-url", url: "https://example.com/a", title: "Example" }],
    });
    expect(sources).toHaveLength(1);
    expect(sources[0].uri).toBe("https://example.com/a");
  });
});
