import { z } from "zod";
import type { ToolDef } from "@/lib/agents/types";
import { generateInterviewQuestions, evaluateInterviewResponses } from "@/lib/ai";
import { createClientServer } from "@/lib/utils/supabase/server";

export const genQuestionsInput = z.object({
  resumeText: z.string().min(1).max(50000),
  jobDescription: z.string().min(1).max(20000),
  interviewId: z.string().uuid(),
});

export const generateQuestionsTool: ToolDef<z.infer<typeof genQuestionsInput>, { count: number }> = {
  name: "generateInterviewQuestions",
  description: "Generate 10 interview questions and store them",
  inputSchema: genQuestionsInput,
  async execute(input) {
    const questions = await generateInterviewQuestions(input.resumeText, input.jobDescription);
    const supabase = await createClientServer();
    const rows = questions.slice(0, 10).map((q, i) => ({
      interview_id: input.interviewId,
      question_text: q.slice(0, 2000),
      order: i + 1,
    }));
    const { error } = await supabase.from("interview_questions").insert(rows);
    if (error) throw new Error(error.message);
    return { count: rows.length };
  },
};

export const evalResponsesInput = z.object({
  interviewId: z.string().uuid(),
  responses: z.array(z.object({
    question_id: z.string().uuid().optional(),
    question_text: z.string().max(2000).optional(),
    answer: z.string().max(10000),
  })).min(1).max(20),
});

export const evaluateResponsesTool: ToolDef<z.infer<typeof evalResponsesInput>, { count: number }> = {
  name: "evaluateInterviewResponses",
  description: "Score interview answers and persist results",
  inputSchema: evalResponsesInput,
  async execute(input) {
    const feedbacks = await evaluateInterviewResponses(input.responses.map((r) => ({
      question_id: r.question_id ?? "",
      question_text: r.question_text ?? "",
      answer: r.answer,
    })));
    const supabase = await createClientServer();
    const rows = feedbacks.map((f, i) => ({
      interview_id: input.interviewId,
      question_id: input.responses[i]?.question_id ?? null,
      score: f.score,
      feedback_text: f.feedback_text,
    }));
    const { error } = await supabase.from("interview_results").insert(rows);
    if (error) throw new Error(error.message);
    await supabase.from("interview").update({ status: "completed" }).eq("id", input.interviewId);
    return { count: rows.length };
  },
};
