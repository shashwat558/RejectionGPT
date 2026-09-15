import React from 'react'
import InterviewClient from './InterviewClient';


import { createClientServer } from '@/lib/utils/supabase/server';
import { getInterviewQuestions } from '@/lib/actions/actions';
import { redirect } from 'next/navigation';

const page = async ({params}: {params: Promise<{id: string}>}) => {
    const {id} = await params;

    const supabase = await createClientServer();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) redirect("/login");

    const {data, error} = await supabase.from("interview").select("status, user_id").eq("id", id).single();
    if(error || !data){
      throw new Error(error?.message || "Interview not found");
    }
    if (data.user_id !== userData.user.id) {
      throw new Error("Forbidden: not your interview");
    }
    
    const interviewQUestions = await getInterviewQuestions(id)

    
    const questions = interviewQUestions.map((question) => ({
        id: question.id as string,
        index: question.order,
        question_text: question.question_text
    }))
  return (
    
        <InterviewClient interviewId={id} questions={questions} isCompleted={data.status}/>
        
    
  )
}

export default page
