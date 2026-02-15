"use client"
import { initConversation } from '@/lib/actions/actions';
import { MessageSquare } from 'lucide-react';
import {  useRouter } from 'next/navigation';
import React from 'react'
import LoadingButton from '@/components/ui/loading-button';

const ChatRedirectButton = ({descId, resumeId}: {descId: string, resumeId: string}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false)
    const handleClick = async() => {
      if (isLoading) return
      setIsLoading(true)
      try {
        const chatId = await initConversation({jdId: descId, resumeId: resumeId});
        router.push(`/chat/${chatId}`)
      } catch (error) {
        console.error("Failed to start chat", error)
      } finally {
        setIsLoading(false)
      }
  } 
  return (
    <LoadingButton
      onClick={handleClick}
      isLoading={isLoading}
      loadingText="Starting"
      className="px-3 py-2 rounded-md bg-[#333] hover:bg-[#444] text-gray-200 text-sm border border-[#3a3a3a]"
    >
      <MessageSquare className="w-4 h-4 mr-1" />
      Chat with me 
    </LoadingButton>
  )
}

export default ChatRedirectButton