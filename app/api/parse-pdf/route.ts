import { GoogleGenAI } from "@google/genai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
export async function POST(req:NextRequest) {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;
    const loader = new PDFLoader(file);
    const docs =await loader.load();
    const mainContent = docs[0].pageContent;

    const prompt = `
    Extract the following resume text into structured JSON with fields.

    this is resume text:
    ${mainContent}

    `


    const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
    });

    const result = response.text;
    const match = result?.match(/```json\s*([\s\S]*?)```/);
    const jsonString = match ? match[1].trim() : result?.trim();
    const sanitizedJsonString = jsonString?.replace(/[\x00-\x1F\x7F]/g, ''); // 
    const mainString = JSON.parse(sanitizedJsonString ?? "");
    console.log(mainString)

    return NextResponse.json({json: mainString})
}