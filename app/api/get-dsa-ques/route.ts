import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Type } from "@google/genai";
import { getGenAI, ANALYSIS_MODEL } from "@/lib/ai";
import { requireAnalysisOwner } from "@/lib/api/auth";
import { fail, handleApiError, ok, requestId } from "@/lib/api/response";
import { logger } from "@/lib/logger";

const postSchema = z.object({
  feedback: z.unknown(),
  analysisId: z.string().uuid(),
});

const getQuerySchema = z.object({ analysisId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    const json = await req.json().catch(() => null);
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation error: feedback + analysisId (uuid) required", { status: 400, requestId: rid });
    }
    const { feedback, analysisId } = parsed.data;
    const { supabase } = await requireAnalysisOwner(analysisId);
    const genAI = getGenAI();
    
    const prompt = `
      You are a DSA mentor. Based on the following resume feedback, suggest 5 LeetCode problems that will help the user strengthen weak areas relevant to their target job.
      
      For each problem, include:
      - name (string and should match the name of the problem on leetcode)
      - difficulty (Easy / Medium / Hard)
      - topic_tags (array of strings, e.g. ["Array", "DP", "Graph"])
      - reason_suggested (one sentence explaining why this question was suggested)

      Feedback:
      ${JSON.stringify(feedback).slice(0, 8000)}

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
      model: ANALYSIS_MODEL,
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
    let problems: GeneratedProblem[] = [];
    try {
      const parsedJson = JSON.parse(response.text ?? "{}");
      problems = parsedJson.questions ?? [];
    } catch {
      return fail("Model returned invalid JSON", { status: 502, requestId: rid });
    }

    if (Array.isArray(problems) && problems.length > 0) {
      const rows = problems.slice(0, 10).map((p: GeneratedProblem) => ({
        analysis_result_id: analysisId,
        title: String((p.name as string) ?? p.title ?? "Untitled").slice(0, 200),
        difficulty: String(p.difficulty ?? "Medium").slice(0, 20),
        topic_tags: Array.isArray(p.topic_tags) ? p.topic_tags.slice(0, 10) : null,
        reason_suggested: typeof p.reason_suggested === "string" ? p.reason_suggested.slice(0, 1000) : null,
      }));

      // Best-effort replace; log insert errors instead of silently ignoring
      const { error: delError } = await supabase.from("dsa_questions").delete().eq("analysis_result_id", analysisId);
      if (delError) logger.warn("[dsa] delete failed", { requestId: rid, error: delError.message });

      const { data: inserted, error: insError } = await supabase
        .from("dsa_questions")
        .insert(rows)
        .select("id, analysis_result_id, title, difficulty, topic_tags, reason_suggested, created_at")
        .order("created_at", { ascending: true });

      if (insError) {
        logger.error("[dsa] insert failed", { requestId: rid, error: insError.message });
      } else if (inserted && inserted.length > 0) {
        return ok({ problems: inserted, fromCache: false }, { requestId: rid });
      }
    }

    return ok({ problems }, { requestId: rid });
  } catch (err) {
    return handleApiError(err, rid);
  }
}

export async function GET(req: NextRequest) {
  const rid = requestId();
  try {
    const parsed = getQuerySchema.safeParse({ analysisId: req.nextUrl.searchParams.get("analysisId") });
    if (!parsed.success) {
      return fail("analysisId (uuid) is required", { status: 400, requestId: rid });
    }
    const { analysisId } = parsed.data;
    const { supabase } = await requireAnalysisOwner(analysisId);
    const { data, error } = await supabase
      .from("dsa_questions")
      .select("id, analysis_result_id, title, difficulty, topic_tags, reason_suggested, created_at")
      .eq("analysis_result_id", analysisId)
      .order("created_at", { ascending: true });

    if (error) {
      return handleApiError(new Error(error.message), rid);
    }

    const headers = new Headers({
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120"
    })
    return NextResponse.json({ success: true, data: { problems: data ?? [] }, requestId: rid }, { headers });
  } catch (err) {
    return handleApiError(err, rid);
  }
}
