import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { feedback } = await req.json(); 
    

    const prompt = `
      You are a smart DSA mentor. Based on the following resume feedback for a user, suggest 5 LeetCode problems (only the names, no links) 
      that would help them improve their weak areas and prepare for the job role described.

      Feedback:
      ${JSON.stringify(feedback)}

      Return ONLY a JSON array of problem names like:
      ["Two Sum", "Binary Tree Level Order Traversal", ...]
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const problems = JSON.parse(response.text ?? "[]");

    return NextResponse.json({ problems });
  } catch (err) {
    console.error("DSA suggestion error:", err);
    return NextResponse.json({ problems: [], error: "Failed to generate suggestions" }, { status: 500 });
  }
}
