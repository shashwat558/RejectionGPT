import { NextRequest } from "next/server";
import { z } from "zod";
import { Type } from "@google/genai";
import { getGenAI, ANALYSIS_MODEL } from "@/lib/ai";
import { requireAnalysisOwner } from "@/lib/api/auth";
import { fail, handleApiError, ok, requestId } from "@/lib/api/response";
import { logger } from "@/lib/logger";

const querySchema = z.object({
  analysisId: z.string().uuid(),
  experiencelevel: z.string().max(50).optional().default("mid"),
});

export async function GET(req: NextRequest) {
    const rid = requestId();
    try {
        const parsed = querySchema.safeParse({
            analysisId: req.nextUrl.searchParams.get("analysisId"),
            experiencelevel: req.nextUrl.searchParams.get("experiencelevel") ?? undefined,
        });
        if (!parsed.success) {
            return fail("analysisId (uuid) is required", { status: 400, requestId: rid });
        }
        const { analysisId, experiencelevel } = parsed.data;

        // Auth + ownership (was open IDOR + GET with DB side-effect)
        const { supabase } = await requireAnalysisOwner(analysisId);
        const { data: alreadyExists, error: alreadyExistsError } = await supabase.from("analysis_result").select("id, roadmap").eq("id", analysisId).single();
        if (alreadyExists?.roadmap) {
            return ok({ roadmap: alreadyExists.roadmap }, { requestId: rid });
        }
        if (alreadyExistsError) {
            return handleApiError(new Error(alreadyExistsError.message), rid);
        }
        const { data, error } = await supabase.from("analysis_result").select("summary, strengths, missing_skills, weak_points, job_role").eq("id", analysisId).single();
        if (error) {
            return handleApiError(new Error(error.message), rid);
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

        const genAI = getGenAI();
        const roadmapResponse = await genAI.models.generateContent({
          model: ANALYSIS_MODEL,
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

        let mainString: unknown;
        try {
            mainString = JSON.parse(roadmapResponse.text ?? "");
        } catch {
            return fail("Model returned invalid roadmap JSON", { status: 502, requestId: rid });
        }
        if (mainString && typeof mainString === "object" && "error" in mainString) {
            return fail("Roadmap generation failed", { status: 502, requestId: rid });
        }
        // TODO: move to POST /api/roadmap — GET should not write. Kept for compat.
        const { error: updateError } = await supabase.from("analysis_result").update({ roadmap: mainString }).eq("id", analysisId);
        if (updateError) {
            return handleApiError(new Error(updateError.message), rid);
        }
        logger.info("[get-diagram] generated", { requestId: rid, analysisId });
        return ok({ roadmap: mainString }, { requestId: rid });
    } catch (error) {
        return handleApiError(error, rid);
    }
}
