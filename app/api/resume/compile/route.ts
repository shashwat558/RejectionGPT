import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { latex } = await req.json();
    
    const ytotechPayload = {
      compiler: "pdflatex",
      resources: [
        {
          main: true,
          content: latex
        }
      ]
    };

    const response = await fetch('https://latex.ytotech.com/builds/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ytotechPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LaTeX compilation error:", errorText);
      return NextResponse.json({ error: "Compilation failed" }, { status: 500 });
    }

    // Proxy the PDF back to the client directly
    const arrayBuffer = await response.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="resume.pdf"'
      }
    });

  } catch (error) {
    console.error("Resume compile route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
