import { NextResponse } from 'next/server';
import { getGenAI } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const genAI = await getGenAI();
    const { latex, instruction } = await req.json();

    if (!latex || !instruction) {
      return NextResponse.json({ error: "Missing latex or instruction" }, { status: 400 });
    }

    const prompt = `You are an expert LaTeX resume editor. The user provides an instruction to modify their resume. Update the LaTeX code accordingly. Keep all formatting exactly the same unless instructed otherwise. Output ONLY the updated complete LaTeX code, without any markdown wrapping (e.g. do not wrap in \`\`\`latex \`\`\`). Do not add any explanatory text.

Instruction:
${instruction}

Current LaTeX:
${latex}`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    let updatedLatex = response.text || "";
    updatedLatex = updatedLatex.replace(/^```latex\n?/i, "").replace(/```\n?$/i, "").trim();

    return NextResponse.json({ latex: updatedLatex });

  } catch (error) {
    console.error("Resume builder API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
