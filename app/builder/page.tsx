"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, RefreshCw, Sparkles, FileEdit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [instruction]);

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] pt-[72px] sm:pt-20">
      
      {/* Header */}
      <header className="flex-none bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 shadow-sm relative">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
             <FileEdit className="w-5 h-5 text-orange-500" />
           </div>
           <div>
             <h1 className="text-xl font-bold text-black leading-tight">
               AI Resume Builder
             </h1>
             <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Natural Language to PDF</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          {isCompiling && (
            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Compiling PDF</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Premium Chat Interface */}
        <div className="w-full md:w-[420px] flex flex-col bg-white border-r border-gray-200 shadow-[inset_-10px_0_20px_-15px_rgba(0,0,0,0.03)] relative z-0">
          
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 custom-scrollbar scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {msg.role === "assistant" && (
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
                         <Sparkles className="w-4 h-4 text-white" />
                       </div>
                    )}

                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-black text-white rounded-tr-sm shadow-md" 
                        : "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isProcessing && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3 max-w-[85%]">
                     <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                       <Sparkles className="w-4 h-4 text-gray-400 animate-pulse" />
                     </div>
                     <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-4 text-sm flex items-center gap-3 text-gray-500 shadow-sm">
                       <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                       <span className="animate-pulse">Rewriting LaTeX code...</span>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Premium Input Area */}
          <div className="p-5 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-10 relative">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-rose-400 rounded-2xl blur opacity-0 group-focus-within:opacity-30 transition duration-500" />
              <div className="relative flex items-end bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:border-orange-400 transition-all">
                <textarea
                  ref={textareaRef}
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
                  className="w-full bg-transparent text-black py-4 pl-4 pr-12 focus:outline-none resize-none min-h-[56px] max-h-[150px] text-sm leading-relaxed"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!instruction.trim() || isProcessing}
                  className="absolute right-2 bottom-2 w-9 h-9 flex items-center justify-center bg-black text-white rounded-xl hover:bg-orange-500 disabled:opacity-30 disabled:hover:bg-black transition-colors shadow-md"
                  title="Send instruction"
                >
                  <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />
                </button>
              </div>
            </div>
            <p className="text-[9px] text-gray-400 mt-3 text-center tracking-widest font-bold uppercase">
              Powered by Advanced LLM Pipeline
            </p>
          </div>
        </div>

        {/* Right Side: PDF Preview */}
        <div className="flex-1 bg-gray-100/50 relative p-4 lg:p-8">
          <div className="w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
             {!pdfUrl ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                 <RefreshCw className="w-8 h-8 animate-spin mb-4 text-gray-300" />
                 <p className="font-medium text-sm">Preparing Preview...</p>
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
    </div>
  );
}
