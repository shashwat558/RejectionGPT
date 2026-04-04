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
      className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 text-black font-medium text-sm border border-gray-200 shadow-sm transition-colors flex items-center justify-center"
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      Chat with me 
    </LoadingButton>
  )
}

export default ChatRedirectButton