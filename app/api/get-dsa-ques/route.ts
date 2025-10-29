import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { createClientServer } from "@/lib/utils/supabase/server";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { feedback, analysisId } = await req.json(); 
    const supabase = await createClientServer();

    
    
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
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  topic_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  reason_suggested: { type: Type.STRING },
                },
                required: ["name", "difficulty", "topic_tags", "reason_suggested"],
              },
            },
          },
          required: ["questions"]
        }
      }
    });

    
    type GeneratedProblem = {
      
      title?: string;
      difficulty?: "Easy" | "Medium" | "Hard" | string;
      topic_tags?: string[];
      reason_suggested?: string;
      [key: string]: unknown;
    };
    const parsed = JSON.parse(response.text ?? "{}");
    const problems = parsed.questions ?? [] as GeneratedProblem[];

    if (analysisId && Array.isArray(problems) && problems.length > 0) {
      // Optional clear to avoid duplicates for this analysis
      await supabase.from("dsa_questions").delete().eq("analysis_result_id", analysisId);

      const rows = problems.map((p: GeneratedProblem) => ({
        analysis_result_id: analysisId,
        title: p.name ?? p.title ?? "Untitled",
        difficulty: p.difficulty ?? "Medium",
        topic_tags: Array.isArray(p.topic_tags) ? p.topic_tags : null,
        reason_suggested: p.reason_suggested ?? null,
      }));

      const { data: inserted } = await supabase
        .from("dsa_questions")
        .insert(rows)
        .select("id, analysis_result_id, title, difficulty, topic_tags, reason_suggested, created_at")
        .order("created_at", { ascending: true });

      if (inserted && inserted.length > 0) {
        return NextResponse.json({ problems: inserted, fromCache: false });
      }
    }

    return NextResponse.json({ problems });
  } catch (err) {
    console.error("DSA suggestion error:", err);
    return NextResponse.json(
      { problems: [], error: "Failed to generate DSA questions" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const analysisId = req.nextUrl.searchParams.get("analysisId");
    if (!analysisId) {
      return NextResponse.json({ error: "analysisId is required" }, { status: 400 });
    }

    const supabase = await createClientServer();
    const { data, error } = await supabase
      .from("dsa_questions")
      .select("id, analysis_result_id, title, difficulty, topic_tags, reason_suggested, created_at")
      .eq("analysis_result_id", analysisId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ problems: [], error: error.message }, { status: 500 });
    }

    return NextResponse.json({ problems: data ?? [] });
  } catch (err) {
    console.error("DSA questions fetch error:", err);
    return NextResponse.json(
      { problems: [], error: "Failed to fetch DSA questions" },
      { status: 500 }
    );
  }
}
