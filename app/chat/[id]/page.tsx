import ChatInterface from '@/components/chatInterface';
// import ChatSidebar from '@/components/ChatSidebar';
import React from 'react'

const page = async ({params}: {params: Promise<{id: string}>}) => {

    const {id} = await params;
    
      

  return (
    <div className="flex h-screen bg-[#1e1e1e] overflow-y-hidden">
      <div className="flex-1 flex flex-col max-w-full justify-center items-center">
        <ChatInterface conversationId={id} />
      </div>
    </div>
  )
}

export default page