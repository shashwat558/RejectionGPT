import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "lib", "resume.tex");
    const latex = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json({ latex });
  } catch (error) {
    console.error("Error reading template:", error);
    return NextResponse.json({ error: "Could not read template" }, { status: 500 });
  }
}
