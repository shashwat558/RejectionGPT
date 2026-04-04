"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, FileText, Loader2, RefreshCw } from "lucide-react";

export default function ResumeBuilderPage() {
  const [latex, setLatex] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [messages, setMessages] = useState<{ role: "assistant" | "user"; content: string }[]>([
    { role: "assistant", content: "Hi! Let me know how you'd like to update your resume. For example: 'Add my new project RejectionGPT that uses Next.js'." }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Initial fetch of template
    const fetchTemplate = async () => {
      try {
        const res = await fetch("/api/resume/template");
        const data = await res.json();
        if (data.latex) {
          setLatex(data.latex);
          compilePdf(data.latex);
        }
      } catch (err) {
        console.error("Failed to load template", err);
      }
    };
    fetchTemplate();
  }, []);

  const compilePdf = async (latexCode: string) => {
    setIsCompiling(true);
    try {
      const res = await fetch("/api/resume/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latex: latexCode })
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } else {
        console.error("Compile error", await res.text());
        // For testing/error feedback you might want to show this to user
      }
    } catch (err) {
      console.error("Error asking for compilation", err);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSend = async () => {
    if (!instruction.trim() || isProcessing) return;
    
    const userMessage = instruction;
    setInstruction("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsProcessing(true);

    try {
      const res = await fetch("/api/resume/builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latex, instruction: userMessage }),
      });

      if (!res.ok) throw new Error("Failed to update resume");

      const data = await res.json();
      if (data.latex) {
        setLatex(data.latex);
        setMessages((prev) => [...prev, { role: "assistant", content: "I've updated your resume accordingly. Rendering the new PDF..." }]);
        await compilePdf(data.latex);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I ran into an error updating your resume." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 pt-16">
      {/* Header */}
      <header className="flex-none bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
        <h1 className="text-xl font-bold text-black flex items-center gap-2">
          <FileText className="w-5 h-5" />
          AI Resume Builder
        </h1>
        <div className="flex items-center gap-2">
          {isCompiling && (
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Compiling PDF...
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Chat */}
        <div className="w-full md:w-1/3 max-w-md flex flex-col bg-white border-r border-gray-200">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  msg.role === "user" 
                    ? "bg-black text-white rounded-tr-sm" 
                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-tl-sm p-3 text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating LaTeX...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isProcessing}
                placeholder="Ask AI to modify your resume..."
                className="w-full bg-gray-50 border border-gray-200 text-black py-3 pl-4 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none min-h-[50px] max-h-[150px]"
                rows={2}
              />
              <button
                onClick={handleSend}
                disabled={!instruction.trim() || isProcessing}
                className="absolute right-2 bottom-2 w-9 h-9 flex items-center justify-center bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                title="Send update instruction"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Uses Gemini to rewrite LaTeX code.</p>
          </div>
        </div>

        {/* Right Side: PDF Preview */}
        <div className="flex-1 bg-gray-100 relative">
          {!pdfUrl ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-4 text-gray-300" />
              <p>Preparing Preview...</p>
            </div>
          ) : (
            <iframe
              src={pdfUrl || undefined}
              className="w-full h-full border-none"
              title="Resume Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}
