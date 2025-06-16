"use client"
import { initConversation } from '@/lib/actions/actions';
import {  useRouter } from 'next/navigation';
import React from 'react'

const ChatRedirectButton = ({descId, resumeId}: {descId: string, resumeId: string}) => {
    const router = useRouter();
    const handleClick = async() => {
    const chatId = await initConversation({jdId: descId, resumeId: resumeId});
    router.push(`/chat/${chatId}`)

  } 
  return (
    <button className="absolute top-10 left-[40%] rounded-lg p-3 text-center text-md font-semibold bg-[#302e2e] border-t-2 border-t-[#464444] cursor-pointer text-gray-400 active:border-0 hover:bg-[#363535]" onClick={handleClick}>
             Chat with me! 
    </button>
  )
}

export default ChatRedirectButton