"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Mic, ArrowLeft, Check } from "lucide-react"
import MessageBubble from "./MEssageBubble"
import TypingIndicator from "./typingIndicator"
import QuickActions from "./QuickActionButton"
import { useMessages } from "@/stores/messageStore"
import { Button } from "./ui/button"
import { redirect } from "next/navigation"
import Link from "next/link"

import { useAuth } from "@/stores/useAuth"
import { checkCalendarConnection } from "@/lib/actions/actions"

const SOURCE_DELIMITER = '###END_OF_TEXT###'


interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isTyping?: boolean
}

export default function ChatInterface({conversationId}: {conversationId: string}) {
  const {messages, setMessages} = useMessages();
  const [input, setInput] = useState("");
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastInput, setLastInput] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const {user} = useAuth();
  

   

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (user) {
          const isConnected = await checkCalendarConnection();
          setIsCalendarConnected(isConnected);
        }
      } catch (error) {
        console.error('Error checking calendar connection:', error);
      }
    };
    checkConnection();
  }, [user])


  useEffect(() => {
    useMessages?.persist.setOptions({
      name: conversationId
    });

    useMessages.persist.rehydrate();

    localStorage.removeItem("messages-storage")

  },[conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
  if (!input.trim() || isLoading) return;

  

  const userMessage: Message = {
    id: Date.now().toString(),
    content: input,
    role: "user",
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, userMessage]);

  setInput("");
  setIsLoading(true);

  const assistantMessage: Message = {
    id: "ai-" + Date.now().toString(),
    content: "",
    role: "assistant",
    timestamp: new Date(),
    isTyping: true,
  };

  setMessages((prev) => [...prev, assistantMessage]);

  const MAX_CONTENT= 5;

  const historyForApi = [...messages, userMessage].map((m) => ({
      role: m.role === "assistant" ? "model": "user" ,
      parts: [{ text: m.content }],
    }))

  const recentHistory = historyForApi.slice(-MAX_CONTENT);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${siteUrl}/api/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      conversationId: conversationId,
      prompt: input,
      conversationHistory: recentHistory
    })
  });

  if (res.ok && res.body) {
    const data = res.body.getReader();
    const decoder = new TextDecoder();
    
    let parsingSources = false;
    let jsonPart = "";
    let textPart = "";


    while (true) {
      const { done, value } = await data.read();
      if (done) break;

      const chunk = decoder.decode(value);
      

      if(parsingSources){
         jsonPart+= chunk
      } else {
        const parts = chunk.split(SOURCE_DELIMITER);
        if(parts.length>1) {
          textPart += parts[0];
          jsonPart+= parts[1];
          parsingSources = true

           setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: textPart }
            : msg
        )
      );
        } else {
          textPart += chunk
          setMessages((prevMessages) => 
            prevMessages.map((msg) => 
              msg.id === assistantMessage.id ? {...msg, content: textPart}: msg
              
            )
          )
        }
      }




     
    }

    

    try{
      const sources = JSON.parse(jsonPart);
      console.log(sources);
      setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === assistantMessage.id
          ? { ...msg, content: textPart, sources: sources, isTyping: false }
          : { ...msg, isTyping: false }
      )
    );

     } catch (error) {
    console.error("Failed to parse sources JSON:", error);
    
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === assistantMessage.id
          ? { ...msg, isTyping: false }
          : msg
      )
    );
  }

   
  } else {
    const text = await res.text();
    console.error("Error response:", text);
  }

  setIsLoading(false);
};


    


  

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  

  const handleQuickAction = (action: string) => {
    setInput(action)
    textareaRef.current?.focus()
  }

  const regenerateResponse = async (messageId: string) => {
    // Find the assistant message to regenerate
    const assistantMessageIndex = messages.findIndex(msg => msg.id === messageId);
    if (assistantMessageIndex === -1) return;


    const userMessage = messages[assistantMessageIndex - 1];
    if (!userMessage || userMessage.role !== "user") return;


    setMessages(prev => prev.slice(0, assistantMessageIndex));

    
    setInput(userMessage.content);
    setLastInput(userMessage.content);

    
    setIsLoading(true);

    const newAssistantMessage: Message = {
      id: "ai-" + Date.now().toString(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages((prev) => [...prev, newAssistantMessage]);

    const MAX_CONTENT = 5;
    const historyForApi = [...messages.slice(0, assistantMessageIndex), userMessage].map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const recentHistory = historyForApi.slice(-MAX_CONTENT);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${siteUrl}/api/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        conversationId: conversationId,
        prompt: userMessage.content,
        conversationHistory: recentHistory
      })
    });

    if (res.ok && res.body) {
      const data = res.body.getReader();
      const decoder = new TextDecoder();
      
      let parsingSources = false;
      let jsonPart = "";
      let textPart = "";

      while (true) {
        const { done, value } = await data.read();
        if (done) break;

        const chunk = decoder.decode(value);

        if (parsingSources) {
          jsonPart += chunk;
        } else {
          const parts = chunk.split(SOURCE_DELIMITER);
          if (parts.length > 1) {
            textPart += parts[0];
            jsonPart += parts[1];
            parsingSources = true;

            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === newAssistantMessage.id
                  ? { ...msg, content: textPart }
                  : msg
              )
            );
          } else {
            textPart += chunk;
            setMessages((prevMessages) => 
              prevMessages.map((msg) => 
                msg.id === newAssistantMessage.id ? {...msg, content: textPart}: msg
              )
            );
          }
        }
      }

      try {
        const sources = JSON.parse(jsonPart);
        console.log(sources);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === newAssistantMessage.id
              ? { ...msg, content: textPart, sources: sources, isTyping: false }
              : { ...msg, isTyping: false }
          )
        );
      } catch (error) {
        console.error("Failed to parse sources JSON:", error);
        
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === newAssistantMessage.id
              ? { ...msg, isTyping: false }
              : msg
          )
        );
      }
    } else {
      const text = await res.text();
      console.error("Error response:", text);
    }

    setIsLoading(false);
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
   
  }

  return (
    <div className="my-container flex flex-col h-full w-7xl" style={{scrollbarWidth: "thin", scrollbarColor:  "#f1f1f1"}}>
      
      <div className="flex items-center justify-between p-4 border-b border-[#383838]">
        <Link 
          href="/analytics" 
          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analysis
        </Link>
        
        {isCalendarConnected? <Button 
          variant="outline" 
          onClick={() => {
            redirect("/api/calender/connect")
          }} 
          className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600 transition-colors"
        >
          Connect Google Calendar
        </Button>: <button 
           
          onClick={() => {
            redirect("/api/calender/connect")
          }} 
          className="flex items-center gap-2 border-[1px] pt-[2px] pb-[2px] pl-[8px] pr-[8px] rounded-md text-md   bg-transparent border-dashed text-white border-blue-400"
        >
          Calendar Connected <Check className="w-4 h-4" />
        </button>}
      </div>

      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onRegenerate={regenerateResponse} onCopy={copyMessage} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-[#383838]">
        <QuickActions onActionClick={handleQuickAction} />
      </div>

      
      <div className="p-4 border-[#383838]">
        <div className="relative">
          <div className="flex items-end gap-3 bg-[#2a2a2a] border border-[#383838] rounded-xl p-3">
            <button className="p-2 rounded-md hover:bg-[#333] text-gray-400 hover:text-gray-300 transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about resumes, job search, or career advice..."
              className="flex-1 bg-transparent text-gray-300 placeholder-gray-500 resize-none focus:outline-none min-h-[20px] max-h-32"
              rows={1}
              style={{
                height: "auto",
                minHeight: "20px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = "auto"
                target.style.height = target.scrollHeight + "px"
              }}
            />

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-md hover:bg-[#333] text-gray-400 hover:text-gray-300 transition-colors">
                <Mic className="w-4 h-4" />
              </button>

              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-md bg-[#444] hover:bg-[#555] text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-2">
          <p className="text-gray-500 text-xs">AI can make mistakes. Consider checking important information.</p>
        </div>
      </div>
    </div>
  )
}


