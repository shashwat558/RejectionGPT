import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { feedback } = await req.json(); 
    
    const prompt = `
      You are a DSA mentor. Based on the following resume feedback, suggest 5 LeetCode problems that will help the user strengthen weak areas relevant to their target job.
      
      For each problem, include:
      - name (string and should match the name of the problem on leetcode)
      - difficulty (Easy / Medium / Hard)
      - topic_tags (array of strings, e.g. ["Array", "DP", "Graph"])
      - reason_suggested (one sentence explaining why this question was suggested)

      Feedback:
      ${JSON.stringify(feedback)}

      Return ONLY a JSON array of objects like:
      [
        {
          "name": "Two Sum",
          "difficulty": "Easy",
          "topic_tags": ["Array", "HashMap"],
          
          "reason_suggested": "Improves array manipulation and hash map understanding, often used in coding interviews."
        },
        ...
      ]
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              topic_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              reason_suggested: { type: Type.STRING },
            },
          },
        },
      },
    });

    // Parse model output safely
    const problems = JSON.parse(response.text ?? "[]");

    return NextResponse.json({ problems });
  } catch (err) {
    console.error("DSA suggestion error:", err);
    return NextResponse.json(
      { problems: [], error: "Failed to generate DSA questions" },
      { status: 500 }
    );
  }
}
