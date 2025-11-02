import { createClientServer } from "@/lib/utils/supabase/server";
import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";


const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET(req: NextRequest) {

    const searchParams = req.nextUrl.searchParams;
    const analysisId = searchParams.get("analysisId");
    const experiencelevel = searchParams.get("experiencelevel");
    if (!analysisId) {
        return NextResponse.json({ error: "analysisId is required" }, { status: 400 });
    }
    const supabase = await createClientServer();
    const { data:alreadyExists, error: alreadyExistsError } = await supabase.from("analysis_result").select("id, roadmap").eq("id", analysisId).single();
    if(alreadyExists && alreadyExists.roadmap){
        return NextResponse.json({ roadmap: alreadyExists.roadmap }, { status: 200 });
    }
    if(alreadyExistsError){
        return NextResponse.json({ error: alreadyExistsError.message }, { status: 500 });
    }
    const { data, error } = await supabase.from("analysis_result").select("summary, strengths, missing_skills, weak_points, job_role").eq("id", analysisId).single();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    

    const prompt = `
You are an expert career mentor and technical guide.
Your goal is to create a personalized learning roadmap to help the user become fully qualified for their target job.

Below is the user's analysis and background:

- Target Job Role: ${data.job_role}
- Experience Level: ${experiencelevel}
- Summary: ${data.summary}
- Strengths: ${data.strengths}
- Missing Skills: ${data.missing_skills}
- Weak Points: ${data.weak_points}

Your task:
1. Understand the user's target job role and current skill level.
2. Identify the essential technical and soft skills required for the ${data.job_role} role.
3. Compare them with the user's missing_skills and weak_points to design a custom learning roadmap.
4. Adjust roadmap complexity and duration according to the user's experience level.
5. Maintain a logical flow — from core foundations to specialized topics and finally practical projects.
6. Connect each topic with its dependencies clearly.

Return JSON only in this exact format (no text outside JSON):
{
  "title": "string",
  "description": "string",
  "nodes": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "category": "string",
      "difficulty": "string",
      "duration": "string",
      "position": { "x": number, "y": number }
    }
  ],
  "edges": [
    { "id": "string", "source": "string", "target": "string" }
  ]
}
`;

const roadmapResponse = await genAI.models.generateContent({
  model: "gemini-2.0-flash",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              duration: { type: Type.STRING },
              position: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                },
                required: ["x", "y"],
              },
            },
            required: ["id", "title", "description"],
          },
        },
        edges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              source: { type: Type.STRING },
              target: { type: Type.STRING },
            },
            required: ["id", "source", "target"],
          },
        },
      },
      required: ["title", "description", "nodes", "edges"],
    },
  },
});

    const result = roadmapResponse.text;
    const mainString = JSON.parse(result ?? "");
    console.log(mainString);
    if(mainString.error){
        return NextResponse.json({ error: mainString.error }, { status: 500 });
    }
    const { error: updateError } = await supabase.from("analysis_result").update({ roadmap: mainString }).eq("id", analysisId);
    if(updateError){
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({ roadmap: mainString});
}