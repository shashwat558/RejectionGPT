import ChatInterface from '@/components/chatInterface';
import ChatSidebar from '@/components/ChatSidebar';
import React from 'react'

const page = async ({params}: {params: Promise<{id: string}>}) => {

    const {id} = await params;
    
      

  return (
    <div className="flex h-screen pt-[72px] sm:pt-20 overflow-hidden bg-gray-50/50">
      <ChatSidebar />
      <div className="flex-1 flex justify-center h-full relative">
        <ChatInterface conversationId={id} />
      </div>
    </div>
  )
}

export default page