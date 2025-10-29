"use client"
import { initConversation } from '@/lib/actions/actions';
import { MessageSquare } from 'lucide-react';
import {  useRouter } from 'next/navigation';
import React from 'react'

const ChatRedirectButton = ({descId, resumeId}: {descId: string, resumeId: string}) => {
    const router = useRouter();
    const handleClick = async() => {
    const chatId = await initConversation({jdId: descId, resumeId: resumeId});
    
    router.push(`/chat/${chatId}`)

  } 
  return (
    <button className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-[#333] hover:bg-[#444] text-gray-200 text-sm transition-colors border border-[#3a3a3a]" onClick={handleClick}>
      <MessageSquare className="w-4 h-4 mr-1" />
             Chat with me 
    </button>
  )
}

export default ChatRedirectButton